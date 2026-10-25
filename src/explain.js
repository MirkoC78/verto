/* VERTO — spiegazioni mirate degli errori, ricavate dalle analisi del motore (caso, numero, genere, persona, tempo)
   e dalla struttura della frase (soggetto al nominativo, oggetto all'accusativo, preposizione e caso).
   Non indovinano il significato: dicono che cosa la forma latina permette e che cosa no.
   Ogni funzione restituisce al massimo due frasi in HTML (il latino in <span class="la" lang="la">). */
(function (root) {
  'use strict';
  const E = root.VertoEngine || require('./engine.js');
  const SN = root.VertoSentence || require('./sentence.js');
  const CK = root.VertoCheck || require('./check.js');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uniq = (a) => [...new Set(a)];
  const ent = (u) => E.BY_UID.get(u) || null;
  const la = (w) => `<span class="la" lang="la">${esc(w)}</span>`;
  const it = (w) => `«${esc(w)}»`;
  const short = (m) => String(m).split(/[,;(]/)[0].trim();
  // articolo davanti al nome del caso o del modo: «l’accusativo», «il nominativo»
  const art = (d) => (/^[aeiou]/i.test(d) ? 'l’' : 'il ') + d;
  const list = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' o ' + a[a.length - 1]);
  // letture degli aggettivi raggruppate: «dativo singolare di tutti i generi», «accusativo singolare maschile e neutro»
  function readings(ds) {
    const groups = new Map();
    for (const d of ds) { const m = d.match(/^(.*) (maschile|femminile|neutro)$/); const k = m ? m[1] : d; if (!groups.has(k)) groups.set(k, []); if (m) groups.get(k).push(m[2]); }
    return list([...groups.entries()].map(([k, g]) => (g.length === 3 ? k + ' di tutti i generi' : g.length ? k + ' ' + g.join(' e ') : k)));
  }
  const CASE = E.CASE_IT;
  const caseOf = (key) => (String(key).match(/^(?:n|p|a:\w+|v:part:\w+):(nom|gen|dat|acc|voc|abl|loc):/) || [])[1] || null;
  const isFinite = (key) => /^v:(ind|cong|imp):/.test(key);
  const formOf = (e, key) => e && e.forms.find((f) => f.key === key);
  const show = (o) => (x) => (o.quant ? x.q : (x.w || x.f));
  const prepBefore = (toks, i) => { const p = toks[i - 1]; return p && p.tile === toks[i].tile && p.key === 'i' && SN.PREP_CASE[E.norm(p.w)] ? p : null; };
  const tileWords = (toks, t, o) => toks.filter((x) => x.tile === t.tile).map(show(o)).join(' ');

  /* ---------- La funzione di una parola nella frase ---------- */
  function role(toks, i, o) {
    const t = toks[i];
    if (isFinite(t.key)) return verbRole(toks, i, o);
    if (/^v:inf/.test(t.key)) return 'è un infinito';
    if (/^a:/.test(t.key)) return 'l’aggettivo prende caso, numero e genere del nome a cui si riferisce';
    const c = caseOf(t.key);
    const p = prepBefore(toks, i);
    if (p) return `dopo ${la(show(o)(p))} ci vuole ${art(CASE[c])}`;
    if (c === 'nom') return toks.some((x) => x && x.uid === 'sum' && isFinite(x.key)) ? 'è il soggetto o il nome del predicato con «essere»' : 'è il soggetto, chi compie l’azione';
    if (c === 'acc') return 'è l’oggetto, chi o che cosa riceve l’azione';
    if (c === 'gen') return 'risponde alla domanda «di chi? di che cosa?»';
    if (c === 'dat') return 'risponde alla domanda «a chi? per chi?»';
    if (c === 'abl') return 'è un complemento senza preposizione (mezzo, modo, causa o tempo)';
    if (c === 'voc') return 'serve a chiamare qualcuno';
    return '';
  }
  // il verbo concorda con il soggetto in persona e numero
  function verbRole(toks, i, o) {
    const t = toks[i];
    const f = formOf(ent(t.uid), t.key);
    const subj = toks.find((x, k) => k !== i && caseOf(x.key) === 'nom' && !/^a:/.test(x.key) && !prepBefore(toks, k));
    if (subj && f && f.p != null) {
      const num = (subj.key.split(':')[2] === 'p') ? 'plurale' : 'singolare';
      return `concorda con il soggetto ${la(show(o)(subj))}, ${num}: ${E.PERS[f.p]}`;
    }
    const w = itWordFor(toks.s, t);
    return w ? `come ${it(w)} nella traduzione` : '';
  }
  // la parola della traduzione italiana che corrisponde a una parola latina
  function itWordFor(s, t) {
    const e = t && ent(t.uid);
    if (!s || !e) return '';
    const roots = itRoots(e);
    return String(s.it[0]).replace(/[.,;:!?«»]/g, ' ').split(/\s+/).find((w) => roots.some((r) => CK.normIt(w).startsWith(r))) || '';
  }
  // che cosa distingue la forma scelta da quella che serve: il caso, il numero, il genere; nel verbo tempo, diatesi, persona
  function contrast(got, toks, i, o) {
    const t = toks[i];
    if (isFinite(t.key) && /^v:/.test(got.key)) {
      const [, gm, gt, gv] = got.key.split(':'), [, wm, wt, wv] = t.key.split(':');
      const like = itWordFor(toks.s, t) ? `, come ${it(itWordFor(toks.s, t))} nella traduzione` : '';
      if (gm !== wm) return `qui serve ${{ ind: 'l’indicativo', cong: 'il congiuntivo', imp: 'l’imperativo' }[wm] || 'un altro modo'}${like}`;
      if (gt !== wt) return `il tempo giusto è ${esc(E.TENSE_IT[wt] || wt)}${like}`;
      if (gv !== wv) return wv === 'pass' ? 'qui serve il passivo: il soggetto subisce l’azione' : 'qui serve l’attivo: il soggetto compie l’azione';
      return verbRole(toks, i, o);
    }
    const gc = caseOf(got.key), wc = caseOf(t.key);
    if (gc && wc && gc !== wc) return role(toks, i, o);
    const gn = (got.key.split(':')[/^a:/.test(got.key) ? 3 : 2]), wn = (t.key.split(':')[/^a:/.test(t.key) ? 3 : 2]);
    if (gn !== wn) return `il caso è giusto, cambia il numero: ${wn === 'p' ? 'plurale' : 'singolare'}`;
    return role(toks, i, o);
  }
  const end = (s) => s.replace(/\.\.$/, '.');
  // descrizione grammaticale della parola come compare nella frase
  const descr = (t) => { const f = formOf(ent(t.uid), t.key); return f ? f.d : ''; };

  /* ---------- Chiave di lettura di una frase ---------- */
  function reading(s, o = {}) {
    const toks = s.tokens || [];
    const parts = [];
    toks.forEach((t, i) => {
      if (!t) return;
      if (isFinite(t.key)) parts.push(`verbo ${la(show(o)(t))} (${esc(descr(t))})`);
    });
    toks.forEach((t, i) => {
      if (!t || /^a:/.test(t.key) || isFinite(t.key)) return;
      const c = caseOf(t.key), p = prepBefore(toks, i);
      if (p) parts.push(`${la(tileWords(toks, t, o))}: ${esc(p.w.toLowerCase())} + ${esc(CASE[c])}`);
      else if (c === 'nom') parts.push(`soggetto ${la(show(o)(t))} (nominativo)`);
      else if (c === 'acc') parts.push(`oggetto ${la(show(o)(t))} (accusativo)`);
      else if (c === 'dat') parts.push(`${la(show(o)(t))}: dativo, «a chi?»`);
      else if (c === 'gen') parts.push(`${la(show(o)(t))}: genitivo, «di chi?»`);
      else if (c === 'abl') parts.push(`${la(show(o)(t))}: ablativo`);
      else if (c === 'voc') parts.push(`${la(show(o)(t))}: vocativo`);
    });
    const neg = toks.find((t) => t && E.norm(t.w) === 'non');
    if (neg) parts.push(`negazione ${la(show(o)(neg))}`);
    return parts.length ? `Com’è costruita la frase: ${parts.join('; ')}.` : '';
  }

  /* ---------- Versione: dal latino all'italiano ---------- */
  const FUNC = new Set(['il', 'lo', 'la', 'i', 'gli', 'le', 'l', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'del', 'della', 'dello', 'dei', 'degli', 'delle', 'al', 'alla', 'allo', 'ai', 'agli', 'alle', 'dal', 'dalla', 'dai', 'dagli', 'dalle', 'nel', 'nella', 'nello', 'nei', 'negli', 'nelle', 'sul', 'sulla', 'e', 'ed', 'ma', 'che', 'o']);
  // radici italiane del significato di un lemma: «vedere» → ved, «lupo» → lup, «selva, bosco» → selv, bosc
  function itRoots(e) {
    return uniq(String(e.it).split(/[,;]/).map((m) => CK.normIt(m).split(' ')[0]).filter(Boolean).map((w) => (e.k === 'v' ? w.replace(/(are|ere|ire|rre)$/, '') : w.replace(/[aeiou]$/, ''))).filter((r) => r.length >= 3));
  }
  // la parola latina che corrisponde a una parola italiana (la radice più lunga che combacia)
  function tokenFor(toks, word) {
    let best = null, len = 0;
    for (const t of toks) {
      const e = t && ent(t.uid);
      if (!e || e.k === 'i') continue;
      for (const r of itRoots(e)) if (word.startsWith(r) && r.length > len) { best = t; len = r.length; }
    }
    return best;
  }
  const count = (a, w) => a.filter((x) => x === w).length;
  const minus = (a, b) => { const r = a.slice(); for (const w of b) { const k = r.indexOf(w); if (k >= 0) r.splice(k, 1); } return r; };
  const prefix = (a, b) => { let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k; };
  function laIt(item, answer, o = {}) {
    const s = item.s, toks = (s.tokens || []).filter(Boolean);
    const A = CK.normIt(answer).split(' ').filter(Boolean);
    // il riferimento più vicino alla risposta (più parole in comune)
    const refs = s.it.map((r) => CK.normIt(r).split(' ').filter(Boolean));
    const R = refs.slice().sort((x, y) => minus(x, A).length - minus(y, A).length)[0];
    const out = [];
    const neg = toks.find((t) => E.norm(t.w) === 'non');
    const nA = count(A, 'non'), nR = count(R, 'non');
    if (nA > nR) out.push(neg ? 'Nella frase latina la negazione è una sola: c’è un «non» di troppo.' : 'Nella frase latina non c’è nessuna negazione: togli «non».');
    else if (nA < nR) out.push(neg ? `Nella frase latina c’è ${la(show(o)(neg))}: la traduzione deve dire «non».` : 'Manca la negazione «non».');
    const same = A.slice().sort().join(' ') === R.slice().sort().join(' ');
    if (same && A.join(' ') !== R.join(' ')) {
      const nom = toks.find((t, i) => caseOf(t.key) === 'nom' && !/^a:/.test(t.key) && !prepBefore(toks, i));
      const acc = toks.find((t, i) => caseOf(t.key) === 'acc' && !/^a:/.test(t.key) && !prepBefore(toks, i));
      if (nom && acc) out.push(`Le parole sono giuste, ma hai scambiato i ruoli: ${la(show(o)(nom))} è al nominativo, quindi è il soggetto (chi compie l’azione); ${la(show(o)(acc))} è all’accusativo, quindi è l’oggetto (chi la riceve).`);
      else out.push('Le parole sono giuste, ma l’ordine cambia il senso: segui i casi latini per capire chi fa che cosa.');
    }
    if (o.sureOnly) return out;
    if (!same) {
      const miss = minus(R, A).filter((w) => w !== 'non' && !FUNC.has(w));
      const extra = minus(A, R).filter((w) => w !== 'non' && !FUNC.has(w));
      // stessa radice, forma diversa: numero, persona, tempo o genere cambiati
      for (const m of miss.slice()) {
        const x = extra.find((w) => prefix(w, m) >= 3);
        if (!x) continue;
        miss.splice(miss.indexOf(m), 1); extra.splice(extra.indexOf(x), 1);
        const t = tokenFor(toks, m);
        out.push(t ? `${it(m)}, non ${it(x)}: ${la(show(o)(t))} è ${esc(descr(t))}.` : `Al posto di ${it(m)} hai scritto ${it(x)}: controlla numero, persona e tempo.`);
      }
      for (const m of miss) {
        const t = tokenFor(toks, m);
        out.push(t ? `Manca la traduzione di ${la(tileWords(toks, t, o))} (${it(m)}).` : `Manca ${it(m)}.`);
      }
      for (const x of extra) out.push(`${it(x)} non corrisponde a nessuna parola della frase latina.`);
    }
    if (!out.length) { const r = reading(s, o); if (r) out.push(r); }
    return out.slice(0, 2);
  }

  /* ---------- Retroversione: dall'italiano al latino ---------- */
  // tiles: le tessere scelte, ciascuna { key } se è della frase, { distractor, uid, key, at } se è una forma sbagliata
  function itLa(item, tiles, o = {}) {
    const toks = (item.s.tokens || []).filter(Boolean);
    const out = [];
    for (const d of tiles.filter((x) => x.distractor && x.uid != null)) {
      const t = toks[d.at], e = ent(d.uid), got = formOf(e, d.key);
      if (!t || !got) continue;
      const why = contrast(got, Object.assign(toks.slice(), { s: item.s }), d.at, o);
      const gotDs = uniq(e.forms.filter((x) => x.f === got.f).map((x) => x.d));
      out.push(end(`Hai scelto ${la(show(o)(got))} (${esc(readings(gotDs))}): qui serve ${la(show(o)(t))}, ${esc(descr(t))}${why ? ` — ${why}` : ''}.`));
    }
    const ref = SN.tiles(item.s.la);
    const chosen = tiles.filter((x) => !x.distractor).map((x) => x.key);
    const missing = minus(ref, chosen);
    for (const m of missing) {
      if (out.length >= 2) break;
      const t = toks.find((x) => SN.tiles(item.s.la)[x.tile] === m);
      if (!t || tiles.some((x) => x.distractor && x.at != null && toks[x.at] && toks[x.at].tile === t.tile)) continue;
      out.push(`Manca ${la(tileWords(toks, t, o))}${ent(t.uid) && ent(t.uid).k !== 'i' ? ` (${esc(short(ent(t.uid).it))})` : ''}.`);
    }
    if (!out.length && tiles.some((x) => x.distractor && x.uid == null)) out.push('Hai usato una tessera che non serve: ogni parola della frase italiana corrisponde a una sola tessera.');
    if (!out.length) out.push(orderNote(item, chosen, o));
    return out.slice(0, 2);
  }
  // le parole sono giuste ma l'ordine no: negazione e congiunzioni hanno un posto fisso
  function orderNote(item, chosen, o) {
    const ref = SN.tiles(item.s.la), toks = (item.s.tokens || []).filter(Boolean);
    const nk = (t) => E.norm(t).replace(/\s+/g, '_');
    const iR = ref.findIndex((x) => nk(x) === 'non'), iA = chosen.findIndex((x) => nk(x) === 'non');
    if (iR >= 0 && iA >= 0 && nk(ref[iR + 1] || '') !== nk(chosen[iA + 1] || '')) {
      const neg = toks.find((t) => E.norm(t.w) === 'non');
      return `${la(neg ? show(o)(neg) : 'non')} va subito prima della parola che nega: ${la(ref[iR + 1] ? `${neg ? show(o)(neg) : 'non'} ${ref[iR + 1].replace(/_/g, ' ')}` : '')}.`;
    }
    const conj = ref.find((x, k) => /^(et|sed|atque|ac|aut|vel|nec|neque)$/.test(nk(x)) && nk(chosen[k] || '') !== nk(x));
    if (conj) return `${la(conj)} sta tra le due parti che collega, nello stesso punto della frase italiana.`;
    return 'Le parole sono giuste, ma questo ordine non va: le parti separate dalla virgola restano nel loro ordine.';
  }
  // retroversione scritta: ogni parola si confronta con quella della frase dello stesso lemma
  function itLaTyped(item, text, o = {}) {
    const toks = (item.s.tokens || []).filter(Boolean);
    const words = String(text).replace(/[.,;:!?«»"“”]/g, ' ').split(/\s+/).filter(Boolean);
    const out = [];
    const used = new Set();
    for (const w of words) {
      const n = E.norm(w).replace(/v/g, 'u');
      const same = toks.find((t, k) => !used.has(k) && E.norm(t.w).replace(/v/g, 'u') === n);
      if (same) { used.add(toks.indexOf(same)); continue; }
      const an = E.analyze(w);
      const k = toks.findIndex((t, i) => !used.has(i) && an.some((a) => a.e.uid === t.uid));
      if (k >= 0) {
        used.add(k);
        const t = toks[k], mine = an.filter((a) => a.e.uid === t.uid), ds = uniq(mine.map((a) => a.d));
        const why = contrast(mine[0], Object.assign(toks.slice(), { s: item.s }), k, o);
        out.push(end(`${la(w)} è ${esc(readings(ds))}: qui serve ${la(show(o)(t))}, ${esc(descr(t))}${why ? ` — ${why}` : ''}.`));
      } else if (!an.length) out.push(`${la(w)} non è una parola che Verto conosce: controlla l’ortografia.`);
      else out.push(`${la(w)} è una forma di ${la(an[0].e.head)} (${esc(short(an[0].e.it))}), che in questa frase non c’è.`);
      if (out.length >= 2) break;
    }
    if (out.length < 2) for (let k = 0; k < toks.length && out.length < 2; k++) if (!used.has(k) && toks[k].key !== 'i') out.push(`Manca ${la(tileWords(toks, toks[k], o))}.`);
    if (!out.length) out.push(orderNote(item, SN.typedTiles(item.s.la, text) || [], o));
    return out.slice(0, 2);
  }

  /* ---------- Forme ---------- */
  // analisi: la lettura scelta non è possibile per questa forma
  function analizza(item, choice, o = {}) {
    const e = ent(item.uid), f = o.quant ? item.q : item.form;
    const valid = o.quant && item.validQ ? item.validQ : item.valid;
    const forms = uniq(e.forms.filter((x) => x.d === choice).map((x) => (o.quant ? x.q : x.f)));
    const out = [];
    if (forms.length) out.push(`${la(f)} non è ${esc(art(choice))}: ${esc(art(choice))} di ${la(o.quant ? e.headQ : e.head)} è ${forms.map(la).join(' o ')}.`);
    else out.push(`${la(o.quant ? e.headQ : e.head)} non ha ${esc(art(choice))}.`);
    out.push(`${la(f)} ${valid.length > 1 ? 'può essere' : 'è'} ${esc(readings(valid))}.`);
    return out;
  }
  // completa: l'opzione scelta è un'altra forma della stessa parola
  function completa(item, k, o = {}) {
    const toks = item.s.tokens, t = toks[item.idx], e = ent(t.uid);
    const chosen = item.options[k], cq = item.optionsQ ? item.optionsQ[k] : chosen;
    const ds = uniq(e.forms.filter((x) => E.norm(x.f) === E.norm(chosen) && (!o.quant || !item.optionsQ || x.q === cq.toLowerCase() || x.q === cq)).map((x) => x.d));
    const shownChosen = o.quant ? cq : chosen;
    const got = e.forms.find((x) => E.norm(x.f) === E.norm(chosen) && (!o.quant || !item.optionsQ || x.q === cq || x.q === cq.toLowerCase())) || e.forms.find((x) => E.norm(x.f) === E.norm(chosen));
    const why = got ? contrast(got, Object.assign(toks.slice(), { s: item.s }), item.idx, o) : role(toks, item.idx, o);
    return [end(`${la(shownChosen)} è ${esc(readings(ds))}: qui serve ${la(show(o)(t))}, ${esc(descr(t))}${why ? ` — ${why}` : ''}.`)];
  }
  // concordanza: l'aggettivo scelto non ha caso, numero e genere del nome
  function accorda(item, k, o = {}) {
    const a = ent(item.uid), n = ent(item.noun.uid);
    const chosen = item.options[k];
    const deg = /^a:comp/.test(item.key) ? 'comp' : 'pos';
    const ds = uniq(a.forms.filter((x) => x.f === chosen && x.key.startsWith(`a:${deg}:`)).map((x) => x.d));
    const shownChosen = o.quant && item.optionsQ ? item.optionsQ[k] : chosen;
    const noun = o.quant ? item.noun.q : item.noun.f;
    const answer = o.quant ? item.aq : item.answer;
    return [`${la(shownChosen)} è ${esc(readings(ds))}; ${la(noun)} è ${esc(item.noun.d)} ${esc(E.GEN_IT[n.g] || '')}: serve ${la(answer)}.`];
  }
  // scrivi la forma: che cosa è la forma scritta, e dove cambia
  function scrivi(item, typed, o = {}) {
    const e = ent(item.uid);
    const want = o.quant ? item.qs[0] : item.answers[0];
    const an = E.analyze(typed);
    const own = uniq(an.filter((x) => x.e.uid === item.uid).map((x) => x.d));
    if (own.length) return [`${la(typed)} è ${esc(readings(own))}; ${esc(art(item.desc))} è ${la(want)}.`];
    if (an.length) return [`${la(typed)} è una forma di ${la(an[0].e.head)} (${esc(short(an[0].e.it))}), non di ${la(e.head)}; ${esc(art(item.desc))} è ${la(want)}.`];
    const p = prefix(E.norm(typed), E.norm(item.answers[0]));
    const end = item.answers[0].slice(Math.max(0, Math.min(p, item.answers[0].length - 1)));
    return [`${la(typed)} non è una forma di ${la(e.head)}: ${esc(art(item.desc))} è ${la(want)}${p > 1 ? `, con la parte finale ${la('-' + end)}` : ''}.`];
  }
  function lessico(item, chosenUid) {
    const e = ent(item.uid), c = ent(chosenUid);
    if (!e || !c) return [];
    return [`${la(e.head)} significa ${it(short(e.it))}; ${la(c.head)} significa ${it(short(c.it))}.`];
  }

  // per le traduzioni scritte non riconosciute: solo ciò che è sicuramente sbagliato (negazione, ruoli scambiati)
  const laItSure = (item, answer, o = {}) => laIt(item, answer, Object.assign({}, o, { sureOnly: true }));
  root.VertoExplain = { laIt, laItSure, itLa, itLaTyped, analizza, completa, accorda, scrivi, lessico, reading, role };
  if (typeof module !== 'undefined') module.exports = root.VertoExplain;
})(typeof window !== 'undefined' ? window : globalThis);
