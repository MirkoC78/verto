/* VERTO — motore delle lezioni: costruisce le schede e gli esercizi di ogni lezione dentro il suo perimetro
   (argomenti aperti, vocabolario già incontrato, forme ammesse), e gli allenamenti della palestra.
   Nessun accesso al DOM: si usa anche nei test. */
(function (root) {
  'use strict';
  const E = root.VertoEngine || require('./engine.js');
  const SN = root.VertoSentence || require('./sentence.js');
  const GN = root.VertoGen || require('./generator.js');
  const RD = root.VertoRead || require('./reading.js');
  const C = root.VERTO_COURSE || require('./course.js');

  let rand = Math.random;
  const rnd = (n) => Math.floor(rand() * n);
  const pick = (a) => a[rnd(a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = (a) => [...new Set(a)];

  /* ---------- Struttura del percorso ---------- */
  const ORDER = C.UNITS.map((u) => u.id);
  const FLAT = [];
  C.UNITS.forEach((u, ui) => u.lessons.forEach((l, li) => FLAT.push({ unit: u, lesson: l, ui, li, idx: FLAT.length })));
  const BY_ID = Object.fromEntries(FLAT.map((x) => [x.lesson.id, x]));
  const UNIT_BY_ID = Object.fromEntries(C.UNITS.map((u, i) => [u.id, Object.assign({ i }, u)]));
  const entryOf = (uid) => E.BY_UID.get(uid) || null;

  // argomenti fino all'unità della lezione (compresa)
  function topicsUpTo(lessonId) { const x = BY_ID[lessonId]; return new Set(ORDER.slice(0, x.ui + 1)); }
  // vocabolario incontrato fino alla lezione (compresa)
  function vocabUpTo(lessonId) {
    const x = BY_ID[lessonId];
    const v = new Set();
    for (const f of FLAT.slice(0, x.idx + 1)) for (const l of f.lesson.lemmas || []) v.add(l);
    return v;
  }
  // vocabolario delle sole unità scelte (palestra)
  function vocabForTopics(T) {
    const v = new Set();
    for (const f of FLAT) if (T.has(f.unit.id)) for (const l of f.lesson.lemmas || []) v.add(l);
    return v;
  }
  // forme ammesse: argomenti aperti; per l'argomento dell'unità, solo le chiavi dichiarate dalla lezione
  function makeFormOK(T, focus, keysRe) {
    return (e, key) => {
      const f = e.forms.find((x) => x.key === key);
      if (!f || !f.req.every((t) => T.has(t))) return false;
      if (keysRe && key !== 'i' && f.req.includes(focus) && !keysRe.test(key)) return false;
      return true;
    };
  }
  // la parola nuova di una frase viene da un argomento già studiato prima di questa unità
  const makeNewOK = (T, focus) => (e) => !!e && T.has(e.t) && e.t !== focus && e.k !== 'i' && !e.prop;

  /* ---------- Frasi ---------- */
  let BANK = [];
  function init(o) { BANK = o.bank || BANK; if (o.rand) { rand = o.rand; GN.seed(o.rand); } }
  // la frase rientra nel perimetro? restituisce le parole nuove (o null)
  function sentenceFits(s, sc) {
    if (!s.tags.every((t) => sc.T.has(t))) return null;
    const toks = s.tokens;
    if (!toks || toks.some((t) => !t)) return null;
    for (const t of toks) {
      const e = entryOf(t.uid);
      // tutte le letture possibili della parola devono essere ammesse (le frasi della banca non sono annotate)
      for (const k of t.alts || [t.key]) if (!sc.formOK(e, k)) return null;
    }
    if (!sc.vocab) return { unknown: [] };
    const unknown = uniq(toks.filter((t) => !sc.vocab.has(t.uid)).map((t) => t.uid));
    if (unknown.length > sc.maxNew) return null;
    if (unknown.some((u) => !sc.newOK(entryOf(u)))) return null;
    return { unknown };
  }
  const lengthOK = (s, sc) => { const n = SN.wordCount(s.la); return n >= (sc.minWords || 0) && n <= (sc.maxWords || 99); };
  // frase generata sul momento: si preferisce quella che esercita l'argomento dell'unità
  function generated(sc, avoid, needFocus) {
    let spare = null;
    for (let k = 0; k < (sc.minWords || sc.maxWords ? 10 : 6); k++) {
      const g = GN.generate([...sc.T], sc.focus, { lex: sc.vocab, maxNew: sc.maxNew, newOK: sc.newOK, formOK: sc.formOK, tenses: sc.tenses, nums: sc.nums, lite: sc.simple, avoid: [...avoid] });
      if (!g || avoid.has(g.id) || !lengthOK(g, sc)) continue;
      const r = { s: g, unknown: g.newWords || [] };
      if (!needFocus || g.tags.includes(sc.focus)) return r;
      spare = spare || r;
    }
    return needFocus ? null : spare;
  }
  function pickSentence(sc, avoid) {
    if (!sc.T.has('v_pres')) return null;
    const cands = [];
    for (const s of BANK) {
      if (avoid.has(s.id) || !lengthOK(s, sc)) continue;
      const fit = sentenceFits(s, sc);
      if (fit) cands.push({ s, w: (s.tags.includes(sc.focus) ? 4 : 1) + (fit.unknown.length ? 0 : 1), unknown: fit.unknown, focus: s.tags.includes(sc.focus) });
    }
    // prima le frasi che esercitano l'argomento dell'unità; le altre solo se non ce n'è
    const onFocus = cands.filter((c) => c.focus);
    const useGen = sc.gen !== false && (!onFocus.length || rand() < (sc.genShare ?? 0.5));
    if (useGen) { const g = generated(sc, avoid, true); if (g) return g; }
    if (onFocus.length) cands.splice(0, cands.length, ...onFocus);
    else if (sc.gen !== false) { const g = generated(sc, avoid, false); if (g) return g; }
    // se il livello chiede frasi più lunghe di quelle possibili con gli argomenti aperti, il limite si allenta un passo alla volta
    if (!cands.length) {
      if (sc.minWords) return pickSentence(Object.assign({}, sc, { minWords: sc.minWords - 1 }), avoid);
      if (sc.maxWords && sc.maxWords < 12) return pickSentence(Object.assign({}, sc, { maxWords: sc.maxWords + 1 }), avoid);
      return null;
    }
    const tot = cands.reduce((a, c) => a + c.w, 0);
    let r = rand() * tot;
    for (const c of cands) { r -= c.w; if (r <= 0) return c; }
    return cands[cands.length - 1];
  }

  /* ---------- Esercizi sulle forme ---------- */
  const KINDS_FORMS = ['n', 'a', 'v', 'p'];
  // parole su cui esercitare le forme: le parole nuove della lezione, oppure quelle note dell'argomento dell'unità
  function scopeEntries(sc, kinds) {
    let ents = (sc.lemmas || []).map(entryOf).filter((e) => e && kinds.includes(e.k) && !e.prop);
    const withForms = (e) => formsIn(e, sc).length >= 2;
    ents = ents.filter(withForms);
    // prima le parole che hanno forme dell'argomento dell'unità (in una lezione sui nomi, i nomi)
    const onFocus = ents.filter((e) => e.forms.some((f) => f.req.includes(sc.focus) && sc.formOK(e, f.key)));
    if (onFocus.length) ents = onFocus;
    if (!ents.length) ents = [...(sc.vocab || [])].map(entryOf).filter((e) => e && kinds.includes(e.k) && !e.prop && withForms(e) && e.forms.some((f) => f.req.includes(sc.focus) && sc.formOK(e, f.key)));
    if (!ents.length && sc.vocab) ents = [...sc.vocab].map(entryOf).filter((e) => e && kinds.includes(e.k) && !e.prop && withForms(e));
    return ents;
  }
  function formsIn(e, sc, noVoc) {
    return e.forms.filter((f) => f.key !== 'i' && sc.formOK(e, f.key) && !(noVoc && f.c === 'voc') && f.c !== 'loc' && !(f.mood === 'part' && f.c !== 'nom' && !sc.T.has('v_part')));
  }
  // si preferiscono le forme che richiedono l'argomento dell'unità
  function focusForms(e, sc, noVoc) { const all = formsIn(e, sc, noVoc); const f = all.filter((x) => x.req.includes(sc.focus)); return f.length >= 1 ? f : all; }
  const PREF = ['nominativo', 'accusativo', 'genitivo', 'dativo', 'ablativo', 'vocativo'];
  const prefRank = (d) => { const i = PREF.findIndex((p) => d.includes(p)); return i < 0 ? 0 : i; };
  function buildAnalizza(sc) {
    const ents = scopeEntries(sc, KINDS_FORMS);
    for (let k = 0; k < 30; k++) {
      const e = pick(ents);
      if (!e) return null;
      const forms = focusForms(e, sc, true);
      if (!forms.length) continue;
      const f = pick(forms);
      const inScope = formsIn(e, sc);
      const valid = uniq(inScope.filter((x) => x.f === f.f).map((x) => x.d));
      const best = valid.slice().sort((a, b) => prefRank(a) - prefRank(b))[0] || f.d;
      const pool = uniq(inScope.map((x) => x.d).filter((d) => !valid.includes(d)));
      const dis = shuffle(pool).slice(0, 3);
      if (dis.length < 1) continue;
      return { type: 'analizza', uid: e.uid, form: f.f, q: f.q, correct: best, valid, options: shuffle([best, ...dis]), topic: focusOfReq(f.req), key: f.key };
    }
    return null;
  }
  function buildScrivi(sc) {
    const ents = scopeEntries(sc, KINDS_FORMS);
    for (let k = 0; k < 30; k++) {
      const e = pick(ents);
      if (!e) return null;
      const forms = focusForms(e, sc, true).filter((f) => f.f !== e.head);
      if (!forms.length) continue;
      const f = pick(forms);
      return { type: 'scrivi', uid: e.uid, desc: f.d, answers: uniq(e.forms.filter((x) => x.key === f.key).map((x) => x.f)), qs: uniq(e.forms.filter((x) => x.key === f.key).map((x) => x.q)), topic: focusOfReq(f.req), key: f.key };
    }
    return null;
  }
  // concordanza: nome + aggettivo (si sceglie la forma dell'aggettivo che concorda)
  function buildAccorda(sc) {
    const known = [...(sc.vocab || [])].map(entryOf).filter(Boolean);
    const adjsOwn = (sc.lemmas || []).map(entryOf).filter((e) => e && e.k === 'a');
    const adjs = (adjsOwn.length ? adjsOwn : known.filter((e) => e.k === 'a')).filter((e) => !e.nocomp || e.t);
    const nouns = known.filter((e) => e.k === 'n' && !e.prop);
    for (let k = 0; k < 40; k++) {
      const n = pick(nouns), a = pick(adjs);
      if (!n || !a) return null;
      const nf = pick(formsIn(n, sc, true));
      if (!nf) continue;
      const deg = /^a:comp/.test((sc.keysSrc || '')) ? 'comp' : 'pos';
      const right = a.forms.find((f) => f.key === `a:${deg}:${nf.c}:${nf.n}:${n.g}` && sc.formOK(a, f.key));
      if (!right) continue;
      const dis = shuffle(uniq(a.forms.filter((f) => f.key.startsWith(`a:${deg}:`) && f.c !== 'voc' && f.f !== right.f && sc.formOK(a, f.key)).map((f) => f.f))).slice(0, 3);
      if (dis.length < 2) continue;
      return { type: 'accorda', noun: { uid: n.uid, f: nf.f, q: nf.q, d: nf.d }, uid: a.uid, answer: right.f, aq: right.q, options: shuffle([right.f, ...dis]), topic: a.t, key: right.key };
    }
    return null;
  }
  const shortM = (m) => m.split(/[,;(]/)[0].trim();
  function buildAbbina(sc) {
    let pool = (sc.lemmas || []).map(entryOf).filter((e) => e && ['n', 'a', 'v', 'p', 'i'].includes(e.k));
    const extra = sc.vocab ? shuffle([...sc.vocab].map(entryOf).filter((e) => e && ['n', 'a', 'v'].includes(e.k))) : [];
    pool = uniq(pool.concat(extra));
    const chosen = [];
    const seenM = new Set(), seenH = new Set();
    for (const e of pool) { const m = shortM(e.it); if (seenM.has(m) || seenH.has(e.head)) continue; seenM.add(m); seenH.add(e.head); chosen.push(e); if (chosen.length >= 5) break; }
    if (chosen.length < 3) return null;
    return { type: 'abbina', pairs: chosen.map((e) => ({ uid: e.uid, la: e.head, lq: e.headQ, it: shortM(e.it) })), topic: sc.focus };
  }
  function buildLessico(sc, reverse) {
    const pool = uniq(((sc.lemmas || []).map(entryOf).filter(Boolean)).concat(sc.vocab ? [...sc.vocab].map(entryOf).filter(Boolean) : [])).filter((e) => ['n', 'v', 'a'].includes(e.k));
    if (pool.length < 4) return null;
    const e = pick(pool.slice(0, Math.max(4, (sc.lemmas || []).length)));
    const others = shuffle(pool.filter((x) => x !== e && shortM(x.it) !== shortM(e.it) && x.k === e.k)).slice(0, 3);
    if (others.length < 2) return null;
    return { type: 'lessico', uid: e.uid, reverse: !!reverse, options: shuffle([e, ...others].map((x) => x.uid)), topic: e.t };
  }
  function buildCompleta(s, sc) {
    const toks = s.tokens || [];
    const cand = toks.map((t, i) => ({ t, i })).filter(({ t }) => t && ['n', 'v', 'a', 'p'].includes((entryOf(t.uid) || {}).k));
    for (const { t, i } of shuffle(cand)) {
      const e = entryOf(t.uid);
      const others = shuffle(uniq(formsIn(e, sc).map((x) => x.f).filter((f) => E.norm(f) !== E.norm(t.w) && !f.includes(' ')))).slice(0, 3);
      if (others.length < 2) continue;
      return { type: 'completa', s, idx: i, answer: t.w, options: shuffle([t.w.toLowerCase() === t.w ? t.w : t.w, ...others]), topic: s.focus };
    }
    return null;
  }

  /* ---------- Pronuncia ---------- */
  let USED = new Set();
  const alfWords = (sc) => { const all = [...(sc.vocab || [])].map(entryOf).filter((e) => e && e.k !== 'i'); const fresh = all.filter((e) => !USED.has(e.uid)); return fresh.length >= 3 ? fresh : all; };
  const use = (it) => { if (it && it.uid) USED.add(it.uid); return it; };
  function buildLettura(sc) {
    const ws = shuffle(alfWords(sc)).filter((e) => RD.accentOK(e.headQ));
    for (const e of ws) {
      const right = RD.readIt(e.headQ);
      const wrong = RD.wrongReadings(e.headQ);
      if (!wrong.length) continue;
      return { type: 'lettura', uid: e.uid, word: e.head, q: e.headQ, right, options: shuffle([right, ...shuffle(wrong).slice(0, 3)]), topic: 'alf' };
    }
    return null;
  }
  // suoni: gruppi di lettere e come si leggono
  const SOUNDS = [
    { re: /c(?=[eiy]|ae|oe)/i, g: 'c', right: 'c dolce (come in «cena»)', wrong: ['c dura (come in «casa»)', 'z'], lesson: 1 },
    { re: /c(?=[aou])/i, g: 'c', right: 'c dura (come in «casa»)', wrong: ['c dolce (come in «cena»)', 's'], lesson: 1 },
    { re: /qu/i, g: 'qu', right: 'qu, come in «acqua»', wrong: ['c dura', 'cu, in due sillabe'], lesson: 1 },
    { re: /v/i, g: 'v', right: 'v, come in «vita»', wrong: ['u', 'b'], lesson: 1 },
    { re: /ae/i, g: 'ae', right: 'e', wrong: ['a-e', 'ai'], lesson: 2 },
    { re: /oe/i, g: 'oe', right: 'e', wrong: ['o-e', 'oi'], lesson: 2 },
    { re: /au/i, g: 'au', right: 'au, in una sillaba', wrong: ['o', 'a-u, in due sillabe'], lesson: 2 },
    { re: /ch/i, g: 'ch', right: 'c dura', wrong: ['c dolce', 'sc'], lesson: 2 },
    { re: /th/i, g: 'th', right: 't', wrong: ['z', 'f'], lesson: 2 },
    { re: /ph/i, g: 'ph', right: 'f', wrong: ['p', 'pi'], lesson: 2 },
    { re: /gn/i, g: 'gn', right: 'gn, come in «gnomo»', wrong: ['g dura + n', 'n'], lesson: 2 },
    { re: /ti(?=[aeiou])/i, g: 'ti', right: 'zi (come in «grazia»)', wrong: ['ti', 'ci'], lesson: 2 },
  ];
  function buildSuono(sc) {
    const lv = sc.lessonNo || 4;
    const words = shuffle(alfWords(sc));
    for (const w of words) {
      const p = E.plain(w.headQ);
      const rules = SOUNDS.filter((r) => r.lesson <= lv && r.re.test(p) && !(r.g === 'ti' && /[stx]ti/i.test(p)));
      if (!rules.length) continue;
      const r = pick(rules);
      const m = p.match(r.re);
      return { type: 'suono', uid: w.uid, word: w.head, q: w.headQ, at: m.index, len: r.g.length, group: r.g, right: r.right, options: shuffle([r.right, ...r.wrong]), topic: 'alf' };
    }
    return null;
  }
  function buildAccento(sc) {
    const ws = shuffle(alfWords(sc)).filter((e) => RD.accentOK(e.headQ) && E.syllables(e.headQ).length >= 3);
    const e = ws[0] || shuffle(alfWords(sc)).find((x) => E.syllables(x.headQ).length >= 2);
    if (!e) return null;
    const { S, i } = E.accentSyllable(e.headQ);
    const opts = uniq([i, S.length - 2, S.length - 3, 0].filter((k) => k >= 0 && k < S.length));
    if (opts.length < 2) return null;
    const right = RD.syllabified(e.headQ, i);
    return { type: 'accento', uid: e.uid, word: e.head, q: e.headQ, right, options: shuffle(opts.slice(0, 3).map((k) => RD.syllabified(e.headQ, k))), why: S[S.length - 2] && S.length >= 3 ? (S[S.length - 2].heavy ? 'penultima lunga: l’accento cade sulla penultima' : 'penultima breve: l’accento cade sulla terzultima') : 'parola di due sillabe: l’accento cade sulla prima', topic: 'alf' };
  }
  function buildSillabe(sc) {
    const ws = shuffle(alfWords(sc)).filter((e) => E.syllables(e.headQ).length >= 3);
    for (const e of ws) {
      const S = E.syllables(e.headQ).map((x) => E.plain(x.s).toLowerCase());
      const right = S.join('-');
      const w = S.join('');
      const wrong = new Set();
      // spostamenti del confine fra sillabe
      for (let k = 1; k < S.length && wrong.size < 4; k++) {
        const pos = S.slice(0, k).join('').length;
        for (const d of [1, -1]) { const p2 = pos + d; if (p2 <= 0 || p2 >= w.length) continue; const parts = []; let last = 0; S.slice(0, -1).forEach((_, j) => { const b = j + 1 === k ? p2 : S.slice(0, j + 1).join('').length; parts.push(w.slice(last, b)); last = b; }); parts.push(w.slice(last)); const cand = parts.join('-'); if (cand !== right && parts.every((x) => /[aeiouy]/.test(x))) wrong.add(cand); }
      }
      if (wrong.size < 2) continue;
      return { type: 'sillabe', uid: e.uid, word: e.head, q: e.headQ, right, options: shuffle([right, ...shuffle([...wrong]).slice(0, 2)]), topic: 'alf' };
    }
    return null;
  }
  function buildQuantita(sc) {
    const ws = shuffle(alfWords(sc)).filter((e) => RD.accentOK(e.headQ) && E.syllables(e.headQ).length >= 3);
    const e = ws[0];
    if (!e) return null;
    const S = E.syllables(e.headQ);
    const pen = S[S.length - 2];
    const long = pen.heavy;
    const why = pen.long ? `la vocale ${pen.vowel} è lunga` : long ? 'la sillaba è chiusa da una consonante' : 'la vocale è breve e la sillaba è aperta';
    return { type: 'quantita', uid: e.uid, word: e.head, q: e.headQ, syl: E.plain(pen.s).toLowerCase(), right: long ? 'lunga' : 'breve', options: ['lunga', 'breve'], why, topic: 'alf' };
  }
  function focusOfReq(req) { return req.slice().sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0]; }

  /* ---------- Schede di spiegazione con domanda di controllo ---------- */
  function quizFor(card, sc) {
    let e = null, keys = null;
    if (card.decl) { e = entryOf(pick(card.decl)); keys = new RegExp('^n:(' + (card.cases || ['nom', 'gen', 'dat', 'acc', 'voc', 'abl']).join('|') + '):' + (card.num || '[sp]') + '$'); }
    else if (card.conj) { const [l, k] = pick(card.conj); e = entryOf(l); keys = new RegExp('^' + k.replace(/\./g, '\\.') + ':'); }
    else if (card.adj) { e = entryOf(card.adj); keys = /^a:pos:/; }
    else if (card.pron) { e = entryOf(card.pron); keys = card.cases ? new RegExp('^p:(' + card.cases.join('|') + '):') : /^p:/; }
    else if (card.part) { e = entryOf(card.part); keys = new RegExp('^v:part:' + (card.tense || 'pres') + ':'); }
    if (!e) return null;
    const forms = e.forms.filter((f) => keys.test(f.key) && f.c !== 'voc' && f.req.every((t) => sc.T.has(t)));
    if (forms.length < 2) return null;
    const f = pick(forms);
    const valid = uniq(forms.filter((x) => x.f === f.f).map((x) => x.d));
    const dis = shuffle(uniq(forms.map((x) => x.d).filter((d) => !valid.includes(d)))).slice(0, 2);
    if (dis.length < 1) return null;
    return { type: 'analizza', quiz: true, uid: e.uid, form: f.f, q: f.q, correct: f.d, valid, options: shuffle([f.d, ...dis]), topic: sc.focus, key: f.key };
  }
  const TABLE_CARD = (c) => !!(c.decl || c.conj || c.adj || c.pron || c.part);

  /* ---------- Costruzione della lezione ---------- */
  function scopeOf(lessonId) {
    const x = BY_ID[lessonId];
    const l = x.lesson;
    const T = topicsUpTo(lessonId);
    const vocab = vocabUpTo(lessonId);
    const keysRe = l.keys ? new RegExp(l.keys) : null;
    const focus = x.unit.id;
    return {
      T, vocab, focus, lemmas: l.lemmas || null, keysRe, keysSrc: l.keys || '', tenses: l.tenses || null,
      nums: l.num ? (N) => (N.t === focus ? l.num : null) : null,
      formOK: makeFormOK(T, focus, keysRe), newOK: makeNewOK(T, focus),
      simple: x.li < 2 && !l.test, genShare: l.test ? 0.5 : 0.55, maxNew: l.test ? 0 : 1, lessonNo: x.li + 1,
    };
  }
  function makeItem(type, sc, used) {
    switch (type) {
      case 'analizza': return buildAnalizza(sc);
      case 'scrivi': return buildScrivi(sc);
      case 'accorda': return buildAccorda(sc);
      case 'abbina': return buildAbbina(sc);
      case 'lessico': return buildLessico(sc, rand() < 0.4);
      case 'lettura': return use(buildLettura(sc));
      case 'suono': return use(buildSuono(sc));
      case 'accento': return use(buildAccento(sc));
      case 'sillabe': return use(buildSillabe(sc));
      case 'quantita': return use(buildQuantita(sc));
      case 'frase': case 'la_it': case 'it_la': case 'completa': {
        const p = pickSentence(sc, used);
        if (!p) return null;
        used.add(p.s.id);
        const t = type === 'frase' ? (rand() < 0.55 ? 'la_it' : rand() < 0.75 ? 'it_la' : 'completa') : type;
        if (t === 'completa') { const c = buildCompleta(p.s, sc); if (c) { c.newWords = p.unknown; return c; } return { type: 'la_it', s: p.s, topic: p.s.focus, newWords: p.unknown }; }
        return { type: t, s: p.s, topic: p.s.focus, newWords: p.unknown };
      }
      default: return null;
    }
  }
  function fallbackItem(sc, used) {
    const order = sc.focus === 'alf' ? ['lettura', 'accento', 'abbina', 'suono'] : ['analizza', 'frase', 'abbina', 'lessico', 'scrivi'];
    for (const t of order) { const it = makeItem(t, sc, used); if (it) return it; }
    return null;
  }
  // esercizi della lezione; o.teach = includi le schede di spiegazione
  function buildLesson(lessonId, o = {}) {
    const x = BY_ID[lessonId];
    const l = x.lesson;
    const sc = Object.assign(scopeOf(lessonId), o.scope || {});
    const items = [];
    const used = new Set(o.avoid || []);
    USED = new Set();
    const withTeach = o.teach !== false && l.teach;
    if (withTeach) {
      // la frase della guida che introduce una tabella sta sulla stessa schermata della tabella
      const cards = [];
      for (const card of l.teach) {
        const prev = cards[cards.length - 1];
        if (prev && TABLE_CARD(card) && !card.say && Object.keys(prev).length === 1 && prev.say) cards[cards.length - 1] = Object.assign({ say: prev.say }, card);
        else cards.push(card);
      }
      for (const card of cards) {
        items.push({ type: 'teach', card, topic: x.unit.id });
        if (TABLE_CARD(card)) { const q = quizFor(card, sc); if (q) items.push(q); }
      }
    }
    const mix = (l.mix || ['analizza', 'frase']).slice(0, withTeach ? 9 : 12);
    for (const t of mix) {
      const it = makeItem(t, sc, used) || fallbackItem(sc, used);
      if (it) { it.lesson = lessonId; items.push(it); }
    }
    return items;
  }
  // palestra: argomenti, vocabolario e tipo di esercizi scelti dallo studente
  function buildPractice(o) {
    const T = o.T;
    const vocab = o.wide ? null : vocabForTopics(T);
    const focus = o.focus || [...T].sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0];
    const unit = UNIT_BY_ID[focus];
    // o.level: { minWords, maxWords, simple } per versione e retroversione
    const lv = o.level || {};
    const formOK = makeFormOK(T, focus, null);
    const sc = { T, vocab, focus, lemmas: null, keysRe: null, keysSrc: '', formOK, newOK: makeNewOK(T, focus), genShare: o.genShare ?? 0.5, maxNew: o.wide ? 0 : 1, gen: o.gen !== false, minWords: lv.minWords || 0, maxWords: lv.maxWords || 0, simple: !!lv.simple, lessonNo: 4 };
    if (o.wide) { sc.vocab = null; }
    const mix = o.mix || ['frase', 'analizza', 'frase', 'abbina', 'frase', 'scrivi', 'frase', 'completa', 'frase', 'analizza'];
    const used = new Set(o.avoid || []);
    const items = [];
    for (const t of mix) {
      // per le forme si sceglie una lezione dell'unità di focus, così il perimetro resta preciso
      let s2 = sc;
      if (unit && ['analizza', 'scrivi', 'accorda', 'abbina', 'lessico'].includes(t)) {
        const ls = unit.lessons.filter((l) => !l.test && l.lemmas && l.lemmas.length);
        const L = ls.length ? pick(ls) : null;
        if (L) s2 = Object.assign({}, sc, { lemmas: L.lemmas, vocab: sc.vocab || vocabForTopics(T) });
      }
      if (focus === 'alf' || ['lettura', 'accento', 'suono', 'sillabe', 'quantita'].includes(t)) s2 = Object.assign({}, sc, { vocab: vocabForTopics(T), lessonNo: 4 });
      const it = makeItem(t, s2, used) || fallbackItem(s2, used);
      if (it) items.push(it);
    }
    return items;
  }

  root.VertoLessons = { ORDER, FLAT, BY_ID, UNIT_BY_ID, init, topicsUpTo, vocabUpTo, vocabForTopics, sentenceFits, buildLesson, buildPractice, scopeOf, entryOf, makeFormOK, quizFor, TABLE_CARD };
  if (typeof module !== 'undefined') module.exports = root.VertoLessons;
})(typeof window !== 'undefined' ? window : globalThis);
