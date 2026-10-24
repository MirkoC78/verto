/* VERTO — dizionario online gratuito (Wikizionario / Wiktionary, API pubblica di Wikimedia).
   Nessun account, nessuna chiave: si invia solo la parola cercata. Attivo solo fuori da Claude. */
const DICT = (() => {
  const AVAILABLE = typeof HAS_CLAUDE === 'undefined' ? true : !HAS_CLAUDE;
  const enabled = () => AVAILABLE && (typeof S === 'undefined' || !S.settings || S.settings.online !== false);
  const CKEY = 'verto.wk1';
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(CKEY) || '{}') || {}; } catch (e) { cache = {}; }
  function remember(k, v) {
    cache[k] = v;
    const keys = Object.keys(cache);
    if (keys.length > 250) keys.slice(0, keys.length - 250).forEach((x) => delete cache[x]);
    try { localStorage.setItem(CKEY, JSON.stringify(cache)); } catch (e) { /* ignora */ }
  }
  const strip = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* ---------- Pulizia del wikitesto ---------- */
  function clean(line) {
    let s = line;
    for (let i = 0; i < 4; i++) s = s.replace(/\{\{([^{}]*)\}\}/g, (m, inner) => templateText(inner));
    s = s.replace(/<ref[^>]*\/>/g, '').replace(/<ref[\s\S]*?<\/ref>/g, '').replace(/<[^>]+>/g, '');
    s = s.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').replace(/'''?/g, '').replace(/&nbsp;/g, ' ');
    return s.replace(/\s+/g, ' ').replace(/\s+([,;.:])/g, '$1').trim();
  }
  // Etichette tra parentesi per i template di registro; gli altri template spariscono
  function templateText(inner) {
    const p = inner.split('|').map((x) => x.trim());
    const n = p[0].toLowerCase();
    if (['term', 'tag', 'lb', 'label', 'context', 'q', 'qualifier', 'i'].includes(n)) {
      const lab = p.slice(1).filter((x) => x && x !== 'la' && x !== 'it' && !x.includes('=')).join(', ');
      return lab ? '(' + lab + ')' : '';
    }
    if (['gloss', 'gl'].includes(n) && p[1]) return '(' + p[1] + ')';
    if (['l', 'm', 'link', 'mention'].includes(n)) return p[2] || '';
    return '';
  }

  /* ---------- it.wiktionary ---------- */
  const IT_POS = {
    sost: 'sostantivo', agg: 'aggettivo', verb: 'verbo', avv: 'avverbio', prep: 'preposizione', cong: 'congiunzione', pron: 'pronome', inter: 'interiezione',
    'sost form': 'forma di sostantivo', 'agg form': 'forma di aggettivo', 'verb form': 'forma verbale', 'pron form': 'forma di pronome', 'part': 'participio',
    'nome': 'nome proprio', 'name': 'nome proprio', 'num': 'numerale', 'art': 'articolo', 'suff': 'suffisso', 'pref': 'prefisso', 'loc nom': 'locuzione',
  };
  function parseIt(text) {
    const lines = text.split('\n');
    const start = lines.findIndex((l) => /^\s*=*\s*\{\{-la-\}\}\s*=*\s*$/.test(l));
    if (start < 0) return null;
    const out = [];
    let cur = null;
    for (let i = start + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^\s*=*\s*\{\{-[a-z]{2,3}(-[a-z]+)?-\}\}\s*=*\s*$/.test(l)) break; // lingua successiva
      const pos = l.match(/\{\{-([a-z ]+?)-\|la\}\}/);
      if (pos) { cur = { pos: IT_POS[pos[1]] || pos[1], head: '', defs: [] }; out.push(cur); continue; }
      if (/\{\{-[a-z ]+-\}\}/.test(l) && !/^#/.test(l)) { if (cur) cur.closed = true; continue; } // sezioni come pronuncia, etimologia
      if (!cur || cur.closed) continue;
      if (!cur.head && /^'''/.test(l)) { cur.head = clean(l); continue; }
      if (/^#(?![:*])/.test(l)) {
        const d = clean(l.replace(/^#+\s*/, ''));
        if (d) cur.defs.push(d);
      }
    }
    return out.filter((e) => e.defs.length);
  }
  /* ---------- en.wiktionary ---------- */
  const TAGS = {
    1: ['p', '1ª'], 2: ['p', '2ª'], 3: ['p', '3ª'],
    s: ['n', 'singolare'], sg: ['n', 'singolare'], p: ['n', 'plurale'], pl: ['n', 'plurale'],
    pres: ['t', 'presente'], impf: ['t', 'imperfetto'], fut: ['t', 'futuro'], perf: ['t', 'perfetto'], plup: ['t', 'piuccheperfetto'], futp: ['t', 'futuro anteriore'], 'fut perf': ['t', 'futuro anteriore'],
    actv: ['v', 'attivo'], act: ['v', 'attivo'], pasv: ['v', 'passivo'], pass: ['v', 'passivo'],
    indc: ['md', 'indicativo'], ind: ['md', 'indicativo'], subj: ['md', 'congiuntivo'], sub: ['md', 'congiuntivo'], impr: ['md', 'imperativo'], imp: ['md', 'imperativo'],
    inf: ['md', 'infinito'], ptcp: ['md', 'participio'], part: ['md', 'participio'], ger: ['md', 'gerundio'], gerund: ['md', 'gerundio'], sup: ['md', 'supino'], supine: ['md', 'supino'],
    nom: ['c', 'nominativo'], gen: ['c', 'genitivo'], dat: ['c', 'dativo'], acc: ['c', 'accusativo'], abl: ['c', 'ablativo'], voc: ['c', 'vocativo'], loc: ['c', 'locativo'],
    m: ['g', 'maschile'], f: ['g', 'femminile'], n: ['g', 'neutro'],
    comd: ['d', 'comparativo'], comparative: ['d', 'comparativo'], supd: ['d', 'superlativo'], superlative: ['d', 'superlativo'],
  };
  function tagsToItalian(tags) {
    const o = { p: [], n: [], t: [], v: [], md: [], c: [], g: [], d: [] };
    let unknown = 0;
    for (const raw of tags) {
      for (const t of raw.split('//')) {
        const k = TAGS[t.trim()] || TAGS[t.trim().toLowerCase()];
        if (k) { if (!o[k[0]].includes(k[1])) o[k[0]].push(k[1]); } else if (t.trim()) unknown++;
      }
    }
    if (!Object.values(o).some((a) => a.length)) return '';
    const parts = [];
    if (o.md.length || o.t.length) {
      let s = [o.md.join('/'), o.t.join('/'), o.v.join('/')].filter(Boolean).join(' ');
      if (o.p.length) s += ', ' + o.p.join('/') + ' pers. ' + (o.n.join('/') || '');
      else if (o.c.length) s += ', ' + [o.c.join('/'), o.n.join('/'), o.g.join('/')].filter(Boolean).join(' ');
      else if (o.n.length) s += ' ' + o.n.join('/');
      parts.push(s.trim());
    } else {
      parts.push([o.d.join('/'), o.c.join('/'), o.n.join('/'), o.g.join('/')].filter(Boolean).join(' '));
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }
  // Legge {{inflection of|la|amō||3|s|impf|actv|indc}} e simili
  function parseFormTemplate(line) {
    const m = line.match(/\{\{\s*(inflection of|infl of|participle of|form of|alternative form of|alt form|abbreviation of)\s*\|([^{}]*)\}\}/i);
    if (!m) return null;
    const p = m[2].split('|').map((x) => x.trim()).filter((x) => !/^[a-z]+=/.test(x));
    const name = m[1].toLowerCase();
    if (p[0] !== 'la') return null;
    const lemma = p[1] || '';
    if (/alt|abbreviation/.test(name)) return { lemma, analyses: [], alt: true };
    let rest = p.slice(2);
    if (name === 'form of') rest = rest.slice(0); else if (rest.length && rest[0] === '') rest = rest.slice(1);
    rest = rest.filter((x) => x !== '');
    const groups = [];
    let g = [];
    for (const t of rest) { if (t === ';') { if (g.length) groups.push(g); g = []; } else g.push(t); }
    if (g.length) groups.push(g);
    const analyses = groups.map((gr) => tagsToItalian(name === 'participle of' ? gr.concat(['ptcp']) : gr)).filter(Boolean);
    return { lemma, analyses };
  }
  function parseEn(text) {
    const lines = text.split('\n');
    const start = lines.findIndex((l) => /^==\s*Latin\s*==\s*$/.test(l));
    if (start < 0) return null;
    const out = [];
    let cur = null;
    for (let i = start + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^==[^=]/.test(l)) break;
      const h = l.match(/^===+\s*([A-Za-z ]+?)\s*===+\s*$/);
      if (h) { cur = { pos: h[1], forms: [], defs: [] }; out.push(cur); continue; }
      if (!cur || !/^#(?![:*])/.test(l)) continue;
      const f = parseFormTemplate(l);
      if (f) cur.forms.push(f);
      else { const d = clean(l.replace(/^#+\s*/, '')); if (d) cur.defs.push(d); }
    }
    return out.filter((e) => e.forms.length || e.defs.length);
  }
  const EN_POS = { Noun: 'sostantivo', Verb: 'verbo', Adjective: 'aggettivo', Adverb: 'avverbio', Pronoun: 'pronome', Determiner: 'determinante', Preposition: 'preposizione', Conjunction: 'congiunzione', Participle: 'participio', Numeral: 'numerale', 'Proper noun': 'nome proprio', Interjection: 'interiezione', Suffix: 'suffisso', Prefix: 'prefisso' };

  /* ---------- Rete ---------- */
  async function fetchPages(lang, titles) {
    const url = `https://${lang}.wiktionary.org/w/api.php?action=query&format=json&formatversion=2&origin=*&redirects=1&prop=revisions&rvprop=content&rvslots=main&titles=${encodeURIComponent(titles.join('|'))}`;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 9000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) throw new Error('http ' + r.status);
      const j = await r.json();
      const pages = (j.query && j.query.pages) || [];
      const res = {};
      for (const pg of pages) {
        const rev = pg.revisions && pg.revisions[0];
        const content = rev && ((rev.slots && rev.slots.main && rev.slots.main.content) || rev.content);
        if (content) res[pg.title] = content;
      }
      return res;
    } finally { clearTimeout(t); }
  }
  const pageUrl = (lang, title) => `https://${lang}.wiktionary.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

  async function itLemmaMeaning(lemma) {
    const t = strip(lemma).toLowerCase();
    const pages = await fetchPages('it', [t, t.charAt(0).toUpperCase() + t.slice(1)]);
    for (const [title, text] of Object.entries(pages)) {
      const e = parseIt(text);
      if (e && e.length) return { title, entries: e };
    }
    return null;
  }

  async function lookup(word) {
    const w = strip(word).replace(/[^A-Za-z\s-]/g, '').trim();
    if (!w) return { status: 'empty' };
    const key = w.toLowerCase();
    if (cache[key]) return cache[key];
    if (!enabled()) return { status: 'off' };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return { status: 'offline' };
    const variants = [key, key.charAt(0).toUpperCase() + key.slice(1)];
    const res = { status: 'ok', word: w, it: [], en: [], lemmas: [], links: [] };
    // 1. Wikizionario italiano
    const itPages = await fetchPages('it', variants);
    for (const [title, text] of Object.entries(itPages)) {
      const e = parseIt(text);
      if (e && e.length) { res.it.push(...e); res.links.push({ lang: 'it', title, url: pageUrl('it', title) }); }
    }
    // forma flessa in italiano → significato del lemma
    const itLem = [];
    res.it.forEach((e) => e.defs.forEach((d) => { if (/(singolare|plurale|persona|participio|infinito|imperativo)/.test(d)) { const m = d.match(/\bdi\s+(\S+)\s*$/); if (m) itLem.push(m[1].replace(/[.,;]/g, '')); } }));
    // 2. Wiktionary inglese (forme flesse più complete)
    if (!res.it.length) {
      const enPages = await fetchPages('en', variants);
      for (const [title, text] of Object.entries(enPages)) {
        const e = parseEn(text);
        if (e && e.length) { res.en.push(...e); res.links.push({ lang: 'en', title, url: pageUrl('en', title) }); }
      }
    }
    const lemmas = new Set(itLem.map((x) => strip(x).toLowerCase()));
    res.en.forEach((e) => e.forms.forEach((f) => { if (f.lemma) lemmas.add(strip(f.lemma).toLowerCase()); }));
    lemmas.delete(key);
    for (const lem of [...lemmas].slice(0, 2)) {
      try {
        const m = await itLemmaMeaning(lem);
        if (m) { res.lemmas.push({ lemma: lem, entries: m.entries, url: pageUrl('it', m.title) }); continue; }
        const enL = await fetchPages('en', [lem]);
        const txt = Object.values(enL)[0];
        const e = txt && parseEn(txt);
        if (e && e.length) res.lemmas.push({ lemma: lem, entries: e.map((x) => ({ pos: EN_POS[x.pos] || x.pos, defs: x.defs })).filter((x) => x.defs.length), english: true, url: pageUrl('en', lem) });
      } catch (err) { /* il lemma non è essenziale */ }
    }
    if (!res.it.length && !res.en.length) res.status = 'none';
    remember(key, res);
    return res;
  }

  /* ---------- Resa ---------- */
  function render(r) {
    if (r.status === 'off') return '';
    if (r.status === 'offline') return `<p class="note">Sei offline: la ricerca nel Wikizionario non è disponibile. Le forme del lessico di base funzionano lo stesso.</p>`;
    if (r.status === 'none') return `<p class="note">Nessuna voce latina trovata per «${esc(r.word)}» nel Wikizionario. Controlla l’ortografia o cerca il lemma sul dizionario.</p>`;
    if (r.status === 'error') return `<p class="note">Il Wikizionario non risponde in questo momento. Riprova tra poco.</p>`;
    let h = '';
    const block = (title, body, url, label) => `<div class="an-item wk"><div class="wk-head"><span class="an-lemma" lang="la">${esc(title)}</span><span class="tag">${esc(label)}</span></div>${body}${url ? `<a class="wk-link" href="${url}" target="_blank" rel="noopener">Apri la voce</a>` : ''}</div>`;
    r.it.forEach((e) => {
      h += block(e.head || r.word, `<div class="an-mean">${esc(e.pos)}</div><ul>${e.defs.slice(0, 6).map((d) => '<li>' + esc(d) + '</li>').join('')}</ul>`, (r.links.find((l) => l.lang === 'it') || {}).url, 'Wikizionario');
    });
    r.en.forEach((e) => {
      const forms = e.forms.filter((f) => !f.alt);
      let body = `<div class="an-mean">${esc(EN_POS[e.pos] || e.pos)}</div>`;
      if (forms.length) body += `<ul>${forms.map((f) => (f.analyses.length ? f.analyses : ['forma']).map((a) => `<li>${esc(a)} di <i class="la">${esc(f.lemma)}</i></li>`).join('')).join('')}</ul>`;
      const alts = e.forms.filter((f) => f.alt);
      if (alts.length) body += `<p class="note" style="margin:4px 0 0">Variante di <i class="la">${alts.map((a) => esc(a.lemma)).join(', ')}</i></p>`;
      if (e.defs.length) body += `<p class="note" style="margin:6px 0 2px">Significato (in inglese):</p><ul>${e.defs.slice(0, 4).map((d) => '<li>' + esc(d) + '</li>').join('')}</ul>`;
      h += block(r.word, body, (r.links.find((l) => l.lang === 'en') || {}).url, 'Wiktionary');
    });
    r.lemmas.forEach((l) => {
      const body = l.entries.map((e) => `<div class="an-mean">${esc(e.pos)}${l.english ? ' · in inglese' : ''}</div><ul>${e.defs.slice(0, 5).map((d) => '<li>' + esc(d) + '</li>').join('')}</ul>`).join('');
      h += block(l.entries[0] && l.entries[0].head ? l.entries[0].head : l.lemma, body, l.url, 'lemma');
    });
    return h + `<p class="note">Fonte: Wikizionario e Wiktionary, contenuti con licenza CC BY-SA 4.0.</p>`;
  }

  return { AVAILABLE, enabled, lookup, render, parseIt, parseEn, parseFormTemplate, tagsToItalian, clean, pageUrl };
})();
if (typeof module !== 'undefined') module.exports = DICT;
