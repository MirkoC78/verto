/* VERTO — generatore di frasi latino/italiano.
   Le forme latine vengono dal motore morfologico; l'italiano da VertoIt.
   Ogni frase usa solo gli argomenti scelti: i tag raccolti durante la costruzione vengono verificati alla fine.
   Ogni forma scelta viene registrata (traccia): la frase esce con l'analisi esatta di ogni parola, così si possono
   controllare il vocabolario (parole incontrate, al massimo una nuova) e le forme ammesse dalla lezione. */
(function (root) {
  'use strict';
  const E = root.VertoEngine, IT = root.VertoIt, D = root.VERTO_GEN_DATA;
  let rand = Math.random;
  const rnd = (n) => Math.floor(rand() * n);
  const pick = (a) => a[rnd(a.length)];
  const chance = (p) => rand() < p;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = (a) => [...new Set(a)];

  /* ---------- Lessico ---------- */
  const lex = (k, head, filt) => E.LEX.find((x) => x.k === k && x.head === head && (!filt || x.lemma.includes(filt)));
  // i repertori del generatore si costruiscono solo a lessico caricato (nel browser il lessico si carica dopo la
  // schermata d'avvio); init è idempotente e generate la chiama da sé
  const NOUNS = [], ADJS = [], VERBS = [], MODALS = [], SUMCOMP = [], SAYERS = [];
  const byHead = {};
  let SUM = null, MULTUS = null, PRON = {}, DOMUS = null, ready = false;
  function init() {
    if (ready) return true;
    if (!E.LEX.length) return false;
    ready = true;
    let nid = 0;
    for (let line of D.NOUNS.split('\n')) {
      line = line.trim(); if (!line) continue;
      const [head, tags, it, opt] = line.split('|');
      const e = lex('n', head);
      if (!e) { console.warn('Generatore: nome mancante', head); continue; }
      const opts = {};
      (opt || '').split(',').filter(Boolean).forEach((kv) => { const i = kv.indexOf('='); if (i < 0) opts[kv] = true; else opts[kv.slice(0, i)] = kv.slice(i + 1); });
      const variants = it.split(',').map((v) => {
        const [forms, g, num] = v.split(':');
        const [sg, pl] = forms.split('/');
        return num === 'p' ? { sg: null, pl: sg, g, num: 'p' } : num === 's' ? { sg, pl: null, g, num: 's' } : { sg, pl: pl || sg, g };
      });
      const N = { id: nid++, head, e, t: e.t, tags: new Set(tags.split(' ')), it: variants, opts, g: e.g || (tags.includes(' f') ? 'f' : 'm') };
      N.proper = N.tags.has('N') || N.tags.has('G');
      if (N.proper) N.g = N.tags.has('f') ? 'f' : 'm';
      N.latSg = !e.pl; N.latPl = !e.sg && !opts.sg && !N.proper;
      NOUNS.push(N); byHead[head] = N;
    }
    for (let line of D.ADJS.split('\n')) {
      line = line.trim(); if (!line) continue;
      const [head, it, spec] = line.split('|');
      const e = lex('a', head);
      if (!e) { console.warn('Generatore: aggettivo mancante', head); continue; }
      const alts = it.split(',').map((a) => { const pre = /\+$/.test(a); const f = a.replace(/\+$/, ''); return { forms: IT.adjForms(f.replace(/\//g, '|')), pre, base: f.split('/')[0] }; });
      ADJS.push({ head, e, t: e.t, it: alts, spec, comp: !e.nocomp && !['Romanus', 'Graecus', 'Latinus', 'Troianus'].includes(head) });
    }
    for (const v of D.VERBS) {
      const e = lex('v', v.la, v.f);
      if (!e) { console.warn('Generatore: verbo mancante', v.la); continue; }
      VERBS.push({ ...v, e, its: v.it.map(parseIt) });
    }
    MODALS.push(...D.MODALS.map((m) => ({ ...m, e: lex('v', m.la, m.f) })).filter((m) => m.e));
    SUMCOMP.push(...D.SUMCOMP.map((m) => ({ ...m, e: lex('v', m.la), its: m.it.map(parseIt) })).filter((m) => m.e));
    SAYERS.push(...D.SAYERS.map((m) => ({ ...m, e: lex('v', m.la) })).filter((m) => m.e));
    SUM = lex('v', 'sum');
    MULTUS = lex('a', 'multus');
    PRON = Object.fromEntries(['ego', 'tu', 'meus', 'tuus', 'suus', 'noster', 'vester', 'hic', 'ille', 'qui'].map((h) => [h, lex('p', h)]));
    DOMUS = lex('n', 'domus');
    return true;
  }
  const ADV = D.ADVS.map(([la, it, tenses, t, pos, verbs]) => ({ la, it, tenses: tenses.split(' '), t, pos, verbs: verbs ? verbs.split(' ') : null }));

  function parseIt(s) {
    let o = { raw: s };
    let [main, prep] = s.split(':');
    o.oprep = prep || '';
    let agree = false;
    if (/~$/.test(main)) { agree = true; main = main.slice(0, -1); }
    const words = main.split(' ');
    o.inf = words[0];
    o.part = words.slice(1).join(' ');
    o.agree = agree;
    return o;
  }

  /* ---------- Vocabolario, traccia, forme ammesse ---------- */
  // CTX: { T, lex (Set di uid o null), maxNew, newOK(e), formOK(e, key), tenses, nums(N) } della richiesta in corso
  let CTX = { T: new Set() };
  let TR = [];            // forme scelte nel tentativo in corso: { e, key, f }
  const NEWS = new Set(); // parole nuove già usate nel tentativo
  const known = (e) => !CTX.lex || !e || CTX.lex.has(e.uid);
  const knownU = (uid) => !CTX.lex || CTX.lex.has(uid);
  // fra i candidati restano le parole già incontrate; ogni tanto, se la lezione lo consente, una parola nuova
  function lexFilter(list, getE, pNew = 0.25) {
    if (!CTX.lex) return list;
    const k = list.filter((x) => known(getE(x)) || NEWS.has(getE(x).uid));
    if (NEWS.size < (CTX.maxNew || 0) && (!k.length || chance(pNew))) {
      const u = list.filter((x) => !known(getE(x)) && (!CTX.newOK || CTX.newOK(getE(x))));
      if (u.length) return u;
    }
    return k;
  }
  const mark = (e) => { if (e && !known(e)) NEWS.add(e.uid); };
  const trace = (e, key, f) => { if (f && e) TR.push({ e, key, f }); return f; };
  // parola scritta direttamente (preposizioni, congiunzioni, avverbi)
  const lit = (w, uid, key = 'i') => trace(E.BY_UID.get(uid), key, w);
  const caseOK = (N, c, n) => !CTX.formOK || CTX.formOK(N.e, 'n:' + c + ':' + (n || 's')) || (!n && CTX.formOK(N.e, 'n:' + c + ':p'));

  /* ---------- Scelte e controlli ---------- */
  function matches(N, spec) {
    if (!spec) return false;
    const toks = spec.split(' ');
    let pos = false;
    for (const t of toks) {
      if (t[0] === '!') { const x = t.slice(1); if (N.tags.has(x) || N.head === x.replace(/^=/, '')) return false; continue; }
      if (t[0] === '=') { if (N.head === t.slice(1)) pos = true; } else if (N.tags.has(t)) pos = true;
    }
    return pos;
  }
  function nounOK(ctx, N) { return ctx.T.has(N.t); }
  function adjFits(A, N) { if ((N.tags.has('col') || N.tags.has('gent')) && !A.spec.includes('=' + N.head)) return false; return matches(N, A.spec); }
  function nounsFor(ctx, spec, o = {}) {
    const c = NOUNS.filter((N) => nounOK(ctx, N) && matches(N, spec) && !(o.ex || []).includes(N.head) && (!o.subj || !N.opts.nosubj) && (!o.filter || o.filter(N)) && (!o.noProper || !N.proper) && (!o.noCity || !(N.tags.has('C') || N.tags.has('R'))));
    return lexFilter(c, (N) => N.e, o.pNew);
  }
  function chooseNum(N, pref) {
    if (!N.latPl) return 's';
    if (!N.latSg) return 'p';
    const only = CTX.nums ? CTX.nums(N) : null;
    if (only) return only;
    if (pref) return pref;
    return chance(N.opts.plp ? 0.75 : N.opts.sgp ? 0.12 : 0.45) ? 'p' : 's';
  }
  let npSeq = 0;
  function mkNP(N, o = {}) { mark(N.e); return { id: npSeq++, N, num: o.num || chooseNum(N, o.numPref), adj: null, deg: 'pos', gen: null, poss: null, dem: null, multus: false }; }
  function pickNP(ctx, spec, o = {}) {
    let c = nounsFor(ctx, spec, o);
    if (o.topic) { const f = c.filter((N) => N.t === o.topic); if (f.length) c = f; }
    if (!c.length) return null;
    return mkNP(pick(c), o);
  }
  // forme latine (ogni forma usata entra nella traccia)
  function nounForm(N, c, n) {
    const f = N.e.forms.find((x) => x.c === c && x.n === n);
    return f ? trace(N.e, f.key, f.f) : null;
  }
  function adjForm(A, c, n, g, deg = 'pos') {
    const f = A.e.forms.find((x) => x.c === c && x.n === n && x.g === g && (x.deg || 'pos') === deg);
    if (f) mark(A.e);
    return f ? trace(A.e, f.key, f.f) : null;
  }
  function pronForm(P, c, n, g) {
    const f = P.forms.find((x) => x.c === c && (n == null || x.n === n) && (g == null || x.g === g));
    return f ? trace(P, f.key, f.f) : null;
  }
  function vform(e, o) {
    const voices = o.voice === 'pass' ? ['pass'] : ['act', 'dep'];
    const f = e.forms.find((x) => x.mood === o.mood && x.tense === o.tense && voices.includes(x.voice) && (o.p == null || x.p === o.p) && (o.c == null || (x.c === o.c && x.n === o.n && x.g === o.g)));
    return f ? trace(e, f.key, f.f) : null;
  }
  const isDep = (e) => e.t === 'v_dep';
  const HUMAN = ['H', 'wrk', 'srv', 'mil', 'kid', 'rul', 'tch', 'art', 'sea', 'fr', 'kin', 'par', 'old', 'msg', 'own', 'civ', 'foe', 'f'];
  const personOK = (spec) => spec && spec.split(' ').some((t) => HUMAN.includes(t));

  /* ---------- Sintagmi: latino ---------- */
  const PRE_LA = new Set(['magnus', 'parvus', 'multus', 'omnis']);
  function laNP(np, c) {
    const N = np.N, n = np.num, g = N.g;
    const noun = nounForm(N, c, n);
    if (!noun) return null;
    const core = [];
    if (np.dem) { const d = pronForm(PRON[np.dem], c, n, g); if (!d) return null; core.push(d); }
    if (np.multus) { const m = adjForm({ e: MULTUS }, c, n, g); if (!m) return null; core.push(m); }
    let adj = null;
    if (np.adj) { adj = adjForm(np.adj, c, n, g, np.deg); if (!adj) return null; }
    if (adj && PRE_LA.has(np.adj.head)) core.push(adj);
    core.push(noun);
    if (adj && !PRE_LA.has(np.adj.head)) core.push(adj);
    if (np.poss) { const p = pronForm(PRON[np.poss], c, n, g); if (!p) return null; core.push(p); }
    let gen = [];
    if (np.gen) { const gn = laNP(np.gen, 'gen'); if (!gn) return null; gen = gn.core.concat(gn.gen); }
    return { core, gen };
  }
  const aab = (w) => (/^[aeiouh]/i.test(w) ? 'ab' : 'a');
  const eex = (w) => (/^[aeiouh]/i.test(w) ? 'ex' : 'e');
  const PERS_ABL = [['mecum', 'ego', 'p:abl:s:-'], ['tecum', 'tu', 'p:abl:s:-'], null, ['nobiscum', 'ego', 'p:abl:p:-'], ['vobiscum', 'tu', 'p:abl:p:-'], null];
  const PERS_DAT = [['mihi', 'ego', 'p:dat:s:-'], ['tibi', 'tu', 'p:dat:s:-'], null, ['nobis', 'ego', 'p:dat:p:-'], ['vobis', 'tu', 'p:dat:p:-'], null];
  // preposizione di ogni complemento (null = ablativo o accusativo semplice)
  const PREP_OF = { loc: ['in'], to: ['in', 'ad'], toH: ['ad'], from: ['e', 'ex', 'a', 'ab'], fromH: ['a', 'ab'], agent: ['a', 'ab'], per: ['per'], with: ['cum'], de: ['de'], pro: ['pro'], cause: ['propter'], manner: ['cum'] };
  const prepKnown = (kind) => !PREP_OF[kind] || PREP_OF[kind].some(knownU);
  function laPP(pp, verb) {
    const k = pp.kind;
    if (k === 'with' && pp.pron != null) { const [w, u, key] = PERS_ABL[pp.pron]; return [lit(w, u, key)]; }
    if (k === 'to' && pp.home) return [trace(DOMUS, 'n:acc:s', 'domum')];
    const N = pp.np.N;
    const city = N.opts.city;
    const join = (prep, c) => { const x = laNP(pp.np, c); if (!x) return null; const toks = (prep ? [lit(prep, prep)] : []).concat(x.core); return [toks.join('_')].concat(x.gen); };
    switch (k) {
      case 'loc': return city ? [nounForm(N, 'loc', pp.np.num)] : join('in', 'abl');
      case 'to': {
        if (city) return [nounForm(N, 'acc', pp.np.num)];
        const prep = (verb && verb.toLa) || (N.opts.ad ? 'ad' : 'in');
        return join(prep, 'acc');
      }
      case 'toH': return join('ad', 'acc');
      case 'from': {
        if (city) return [nounForm(N, 'abl', pp.np.num)];
        const w = laNP(pp.np, 'abl'); if (!w) return null;
        return join(N.opts.ad ? aab(w.core[0]) : eex(w.core[0]), 'abl');
      }
      case 'fromH': case 'agent': { const w = laNP(pp.np, 'abl'); if (!w) return null; return join(aab(w.core[0]), 'abl'); }
      case 'per': return join('per', 'acc');
      case 'with': return join('cum', 'abl');
      case 'instr': case 'sep': case 'time': return join(null, 'abl');
      case 'de': return join('de', 'abl');
      case 'pro': return join('pro', 'abl');
      case 'cause': return join('propter', 'acc');
      case 'dur': return join(null, 'acc');
      case 'manner': {
        const noun = nounForm(N, 'abl', 's');
        if (pp.np.adj) return [[adjForm(pp.np.adj, 'abl', 's', N.g), lit('cum', 'cum'), noun].join('_')];
        return [lit('cum', 'cum') + '_' + noun];
      }
      default: return null;
    }
  }

  /* ---------- Sintagmi: italiano ---------- */
  const POSS_IT = { meus: 'mio|miei|mie', tuus: 'tuo|tuoi|tue', suus: 'suo|suoi|sue', noster: 'nostro', vester: 'vostro' };
  function itNP(np, ch, reg, o = {}) {
    const N = np.N;
    let vi = 0;
    if (N.it.length > 1) { reg('n' + np.id, N.it.length); vi = ch('n' + np.id); }
    const v = N.it[vi] || N.it[0];
    const n = v.num || np.num;
    const g = v.g;
    let word = n === 's' ? (v.sg || v.pl) : (v.pl || v.sg);
    let body = word;
    if (np.adj && !o.noAdj) {
      let ai = 0;
      if (np.adj.it.length > 1) { reg('a' + np.id, np.adj.it.length); ai = ch('a' + np.id); }
      const alt = np.adj.it[ai] || np.adj.it[0];
      if (alt.pre && !np.dem && !np.poss) {
        const f = IT.preForm(alt.base, g, n, word) || IT.adjAgree(alt.forms, g, n);
        body = IT.glue(f, word);
      } else if (alt.pre) {
        body = IT.glue(IT.preForm(alt.base, g, n, word) || IT.adjAgree(alt.forms, g, n), word);
      } else body = word + ' ' + IT.adjAgree(alt.forms, g, n);
    }
    if (np.multus) body = IT.adjAgree(IT.adjForms('molto'), g, n) + ' ' + body;
    let art = null;
    const first = body.split(/[ ']/)[0];
    if (np.dem) {
      const base = np.dem === 'hic' ? 'questo' : 'quello';
      body = IT.glue(IT.preForm(base, g, n, first), body);
    } else if (np.poss) {
      const pw = np.poss === 'suus' && np.possPl ? 'loro' : IT.adjAgree(IT.adjForms(POSS_IT[np.poss]), g, n);
      const kinNoArt = N.opts.kin && n === 's' && pw !== 'loro' && !np.adj;
      body = pw + ' ' + body;
      if (!kinNoArt) art = IT.defArt(g, n, pw);
    } else if (np.multus || N.opts.noart || o.noArt) {
      art = null;
    } else if (o.indef) {
      if (n === 's' && N.opts.sg) art = { il: 'del', lo: 'dello', "l'": "dell'", la: 'della' }[IT.defArt(g, 's', first)];
      else art = n === 's' ? IT.indefArt(g, first) : null;
    } else {
      art = n === 'p' && N.opts.artpl ? N.opts.artpl : IT.defArt(g, n, first);
    }
    if (np.gen) body += ' ' + IT.withPrep('di', itNP(np.gen, ch, reg));
    return { art, body, g, n, word, N };
  }
  const itStr = (np) => IT.glue(np.art, np.body);
  function locPrepIt(N) { return N.opts.su ? 'su' : 'in'; }
  function itPP(pp, verb, ch, reg) {
    const k = pp.kind;
    if (k === 'with' && pp.pron != null) return 'con ' + ['me', 'te', '', 'noi', 'voi', ''][pp.pron];
    if (k === 'to' && pp.home) return 'a casa';
    const N = pp.np.N;
    const np = itNP(pp.np, ch, reg);
    const city = N.opts.city, region = N.opts.reg;
    const alt = (key, list) => { if (list.length > 1) { reg(key, list.length); return list[ch(key)] || list[0]; } return list[0]; };
    switch (k) {
      case 'loc':
        if (city) return 'a ' + np.body;
        if (region) return 'in ' + np.body;
        if (N.opts.locnoart && !pp.np.adj && !pp.np.gen && !pp.np.dem && !pp.np.poss) return alt('p' + pp.np.id, ['in ' + np.body, IT.withPrep('in', np)]);
        if (N.head === 'insula') return alt('p' + pp.np.id, [IT.withPrep('su', np), IT.withPrep('in', np)]);
        return IT.withPrep(locPrepIt(N), np);
      case 'to': {
        if (city) return (verb && verb.toIt === 'per' ? 'per ' : verb && verb.toIt === 'verso' ? 'verso ' : 'a ') + np.body;
        if (region) return verb && (verb.toIt === 'per' || verb.toIt === 'verso' || verb.toIt === 'a') ? IT.withPrep(verb.toIt, np) : 'in ' + np.body;
        const mode = (verb && verb.toIt) || 'loc';
        const natural = N.opts.ad ? IT.withPrep('a', np) : IT.withPrep(locPrepIt(N), np);
        if (mode === 'verso') return alt('p' + pp.np.id, [IT.withPrep('verso', np), natural]);
        if (mode === 'per') return alt('p' + pp.np.id, [IT.withPrep('verso', np), natural]);
        if (mode === 'a') return IT.withPrep('a', np);
        return natural;
      }
      case 'toH': case 'fromH': return IT.withPrep('a', np);
      case 'from': return region || city ? (city ? 'da ' + np.body : IT.withPrep('da', np)) : IT.withPrep('da', np);
      case 'agent': case 'sep': return IT.withPrep('da', np);
      case 'per': return alt('p' + pp.np.id, [IT.withPrep('attraverso', np), IT.withPrep('per', np)]);
      case 'with': {
        if (verb && verb.withIt) return alt('p' + pp.np.id, [IT.withPrep(verb.withIt, np), IT.withPrep('con', np)]);
        return IT.withPrep('con', np);
      }
      case 'instr': return IT.withPrep('con', np);
      case 'de': return IT.withPrep('di', np);
      case 'pro': return IT.withPrep('per', np);
      case 'cause': return IT.withPrep('a causa di', np);
      case 'time': return alt('p' + pp.np.id, N.opts.time.split(';'));
      case 'dur': return 'per ' + np.body;
      case 'manner': {
        const w = np.word;
        if (pp.np.adj) { const a = pp.np.adj.it[0]; return 'con ' + (a.pre ? IT.adjAgree(a.forms, np.g, 's') + ' ' + w : w + ' ' + IT.adjAgree(a.forms, np.g, 's')); }
        return 'con ' + w;
      }
      default: return '';
    }
  }

  /* ---------- Verbo ---------- */
  const IT_TENSE = { pres: 'pres', impf: 'impf', fut: 'fut', perf: 'pr', ppf: 'tp' };
  const SUMT = { pres: 'pres', impf: 'impf', fut: 'fut', perf: 'perf' };
  function laFinite(e, tense, voice, p, sg, sn, mood = 'ind') {
    if ((tense === 'perf' || tense === 'ppf') && (voice === 'pass' || isDep(e))) {
      const part = vform(e, { mood: 'part', tense: 'perf', c: 'nom', n: sn, g: sg });
      const aux = vform(SUM, { mood, tense: tense === 'perf' ? 'pres' : 'impf', voice: 'act', p });
      return part && aux ? [part, aux] : null;
    }
    const f = vform(e, { mood, tense, voice: isDep(e) ? 'act' : voice, p });
    return f ? [f] : null;
  }
  function laInfinitive(e, rel, voice, sg, sn) {
    if (rel === 'post') { const pt = vform(e, { mood: 'part', tense: 'fut', c: 'acc', n: sn, g: sg }); return pt ? [pt, lit('esse', 'sum', 'v:inf:pres:act')] : null; }
    if (rel === 'ant') {
      if (voice === 'pass' || isDep(e)) { const pt = vform(e, { mood: 'part', tense: 'perf', c: 'acc', n: sn, g: sg }); return pt ? [pt, lit('esse', 'sum', 'v:inf:pres:act')] : null; }
      const f = vform(e, { mood: 'inf', tense: 'perf', voice: 'act' }); return f ? [f] : null;
    }
    const f = vform(e, { mood: 'inf', tense: 'pres', voice: isDep(e) ? 'act' : voice });
    return f ? [f] : null;
  }
  function itFinite(itv, tense, o, ch, reg, slot) {
    // itv: alternativa italiana; tense: chiave italiana
    let t = tense;
    if (t === 'pr' && slot) { reg('T' + slot, 2); const alt = ch('T' + slot) === 1; t = o.prefPP ? (alt ? 'pr' : 'pp') : (alt ? 'pp' : 'pr'); }
    let passAux = 'essere';
    if (o.voice === 'pass' && ['pres', 'impf', 'fut'].includes(t) && slot) { reg('P' + slot, 2); if (ch('P' + slot) === 1) passAux = 'venire'; }
    let s = IT.verb(itv.inf, t, { ...o, passAux });
    if (itv.part) s += ' ' + (itv.agree ? IT.adjAgree(IT.adjForms(itv.part), o.g, o.n) : itv.part);
    return s;
  }
  function itInfinitive(itv, o = {}) {
    let s = IT.infinitive(itv.inf, o);
    if (itv.part) s += ' ' + (itv.agree ? IT.adjAgree(IT.adjForms(itv.part), o.g || 'm', o.n || 's') : itv.part);
    return s;
  }
  function pickItv(verb, ch, reg, key) {
    if (verb.its.length > 1) { reg('v' + key, verb.its.length); return verb.its[ch('v' + key)] || verb.its[0]; }
    return verb.its[0];
  }
  const objPrep = (itv, np) => (itv.oprep ? IT.withPrep(itv.oprep, np) : itStr(np));

  /* ---------- Tag ---------- */
  function npTags(np, tags) {
    if (!np) return;
    tags.add(np.N.t);
    if (np.adj) { tags.add(np.adj.t); if (np.deg !== 'pos') tags.add('comp'); }
    if (np.multus) tags.add(MULTUS.t);
    if (np.poss) tags.add('pron_pers');
    if (np.dem) tags.add('pron_dim');
    if (np.gen) npTags(np.gen, tags);
  }
  function tenseTags(tense, voice, e, tags) {
    tags.add('v_pres');
    if (tense === 'impf' || tense === 'fut') tags.add('v_if');
    if (tense === 'perf' || tense === 'ppf') tags.add('v_perf');
    if (voice === 'pass') tags.add('v_pass');
    if (e) tags.add(e.t);
  }

  /* ---------- Proposizione semplice ---------- */
  function pickTense(ctx, o = {}) {
    const T = ctx.T, opts = [['pres', 3]];
    if (T.has('v_if')) opts.push(['impf', ctx.focus === 'v_if' ? 4 : 1.6], ['fut', ctx.focus === 'v_if' ? 3 : 1]);
    if (T.has('v_perf') && !o.noPerf) opts.push(['perf', ctx.focus === 'v_perf' ? 6 : 2.2]);
    const ok = ctx.tenses ? opts.filter(([t]) => ctx.tenses.includes(t)) : opts;
    const list = ok.length ? ok : opts;
    const tot = list.reduce((a, b) => a + b[1], 0);
    let r = rand() * tot;
    for (const [t, w] of list) { r -= w; if (r <= 0) return t; }
    return 'pres';
  }
  function ppKindOK(ctx, kind) {
    if (!ctx.T.has('compl')) return false;
    return prepKnown(kind);
  }
  function buildPP(ctx, verb, kind, ex, subj) {
    const spec = verb.pp[kind];
    const animal = subj && subj.N.tags.has('A');
    if (kind === 'to' && /\bhome\b/.test(spec) && ctx.T.has(DOMUS.t) && known(DOMUS) && chance(0.35)) return { kind, home: true };
    if (kind === 'with' && ctx.T.has('pron_pers') && chance(0.3)) { const ps = [0, 1, 3, 4].filter((p) => knownU(PERS_ABL[p][1])); if (ps.length) return { kind, pron: pick(ps) }; }
    const np = pickNP(ctx, spec, { ex, noCity: !['loc', 'to', 'from'].includes(kind) || animal, filter: (N) => (!animal || !['loc', 'to', 'from', 'per'].includes(kind) || N.tags.has('nat') || N.tags.has('farm') || N.tags.has('green')) && (!CTX.formOK || ['loc', 'to', 'from'].includes(kind) && N.opts.city || caseOK(N, ['to', 'toH', 'per', 'cause', 'dur'].includes(kind) ? 'acc' : 'abl')) });
    if (!np) return null;
    if (kind === 'loc' && (np.N.tags.has('R'))) np.num = 's';
    return { kind, np };
  }
  function decorate(ctx, nps, o = {}) {
    const T = ctx.T;
    const lite = o.lite ? 0.4 : 1;
    const free = nps.filter((np) => np && !np.fixed && !np.N.proper && !np.N.opts.city && !np.N.opts.reg && np.N.t);
    // aggettivo
    const adjTopics = ['agg1', 'agg2'].filter((t) => T.has(t));
    const forceAdj = o.forceAdj || (ctx.focus === 'agg1' || ctx.focus === 'agg2' ? ctx.focus : null);
    if (adjTopics.length && (forceAdj || chance(0.35 * lite))) {
      for (const np of shuffle(free)) {
        const cand = lexFilter(ADJS.filter((A) => T.has(A.t) && adjFits(A, np.N) && (!forceAdj || A.t === forceAdj)), (A) => A.e, 0.15);
        if (cand.length) { np.adj = pick(cand); mark(np.adj.e); break; }
      }
    }
    // dimostrativo
    if (T.has('pron_dim') && (o.forceDem || ctx.focus === 'pron_dim' || chance(0.15 * lite))) {
      const c = free.filter((np) => !np.poss);
      const dems = ['hic', 'ille'].filter(knownU);
      if (c.length && dems.length) pick(c).dem = pick(dems);
    }
    // molti
    if (T.has(MULTUS.t) && known(MULTUS) && chance(0.12 * lite)) {
      const c = free.filter((np) => np.num === 'p' && !np.dem && !np.poss && !np.adj && np.N.latPl && np.N.it.every((v) => !v.num));
      if (c.length) pick(c).multus = true;
    }
  }
  const GEN_OWN = [
    [(N) => N.tags.has('port') || N.tags.has('bld') || N.tags.has('green') || N.tags.has('virt') || N.tags.has('adv') || N.tags.has('kin') || N.tags.has('srv') || N.tags.has('fr'), 'H !col !gent'],
    [(N) => N.head === 'incola' || N.head === 'civis', 'city =insula C'],
    [(N) => N.head === 'murus' || N.head === 'porta', '=urbs =oppidum C'],
    [(N) => N.head === 'templum', 'god'],
  ];
  function addGenitive(ctx, np, ex) {
    if (!np || np.N.proper || np.N.opts.city || np.N.opts.reg) return;
    const rule = GEN_OWN.find(([f]) => f(np.N));
    if (!rule) return;
    const g = pickNP(ctx, rule[1], { ex: ex.concat([np.N.head]), noCity: false, filter: (N) => caseOK(N, 'gen') });
    if (g) np.gen = g;
  }
  function addPoss(ctx, np, subjP, subjNum, passive) {
    if (!np || np.N.proper || np.N.opts.city || np.N.opts.reg || np.dem || np.gen || np.multus) return false;
    if (!(np.N.tags.has('kin') || np.N.tags.has('fr') || np.N.tags.has('srv') || np.N.tags.has('port') || np.N.tags.has('bld') || np.N.tags.has('pat') || np.N.tags.has('green') || np.N.tags.has('farm'))) return false;
    const map = { 0: 'meus', 1: 'tuus', 3: 'noster', 4: 'vester' };
    if (subjP != null && map[subjP]) np.poss = map[subjP];
    else if (!passive && chance(0.7)) { np.poss = 'suus'; np.possPl = subjNum === 'p'; }
    else np.poss = pick(['meus', 'tuus', 'noster', 'vester']);
    if (!knownU(np.poss)) { np.poss = null; return false; }
    return true;
  }

  function clausePlan(ctx, o = {}) {
    const T = ctx.T;
    let verbs = VERBS.filter((v) => T.has(v.e.t));
    if (o.verbFilter) verbs = verbs.filter(o.verbFilter);
    if (o.forceDep) verbs = verbs.filter((v) => v.e.t === 'v_dep');
    else if (o.forceIrr) verbs = verbs.filter((v) => v.e.t === 'v_irr');
    if (o.voice === 'pass') verbs = verbs.filter((v) => v.pass && v.o && !isDep(v.e));
    if (o.needObj) verbs = verbs.filter((v) => v.o);
    if (o.intransitive) verbs = verbs.filter((v) => !v.o);
    if (o.forcePP) verbs = verbs.filter((v) => v.pp);
    if (!T.has('compl')) verbs = verbs.filter((v) => !v.req);
    verbs = lexFilter(verbs, (v) => v.e, 0.25);
    for (const verb of shuffle(verbs).slice(0, 25)) {
      const before = new Set(NEWS);
      const plan = tryVerb(ctx, verb, o);
      if (plan) { mark(verb.e); return plan; }
      NEWS.clear(); before.forEach((u) => NEWS.add(u));
    }
    return null;
  }
  function tryVerb(ctx, verb, o) {
    const T = ctx.T;
    const voice = o.voice || 'act';
    let tense = o.tense || pickTense(ctx, o);
    if (voice === 'pass' && (tense === 'perf' || tense === 'ppf') && !T.has('v_perf')) tense = 'pres';
    const plan = { verb, tense, voice, mood: o.mood || 'ind', subj: null, obj: null, dat: null, datPron: null, pps: [], neg: false, adv: null, p: 2 };
    const ex = (o.ex || []).slice();
    // soggetto
    const sSpec = voice === 'pass' ? verb.o : verb.s;
    const canPerson = !o.noPerson && voice === 'act' && personOK(verb.s);
    if (o.subjNP) {
      if (!matches(o.subjNP.N, sSpec)) return null;
      plan.subj = o.subjNP;
      if (o.fixedSubj) plan.subj.fixed = true;
    } else if (canPerson && (o.person != null || chance(0.12))) {
      plan.p = o.person != null ? o.person : pick([0, 1, 3, 4]);
    } else {
      const np = o.person != null ? null : pickNP(ctx, sSpec, { ex, subj: true, topic: o.topic, filter: (N) => (!o.subjFilter || o.subjFilter(N)) && caseOK(N, 'nom'), noCity: true });
      if (np) plan.subj = np;
      else if (canPerson) plan.p = o.person != null ? o.person : pick([0, 1, 2, 3, 4, 5]);
      else return null;
    }
    if (plan.subj) { plan.p = plan.subj.num === 's' ? 2 : 5; ex.push(plan.subj.N.head); }
    // oggetto
    if (voice === 'act' && verb.o) {
      const oc = verb.oc || 'acc';
      if (o.objNP) { if (!matches(o.objNP.N, verb.o)) return null; plan.obj = o.objNP; }
      else if (!o.omitObj) {
        const filter = (N) => caseOK(N, oc) && (!o.objSpec || matches(N, verb.o));
        const np = o.objSpec ? pickNP(ctx, o.objSpec, { ex, filter }) : pickNP(ctx, verb.o, { ex, filter, topic: plan.subj && plan.subj.N.t === o.topic ? null : o.topic, noCity: !/\bC\b/.test(verb.o) });
        if (!np && !verb.oopt) return null;
        if (np && verb.oopt && !o.needObj && chance(0.12)) plan.obj = null; else plan.obj = np;
      }
      if (plan.obj) ex.push(plan.obj.N.head);
    }
    // dativo
    if (verb.d && voice === 'act' && (verb.dreq || chance(0.5))) {
      const datPs = [0, 1, 3, 4].filter((p) => p !== plan.p && knownU(PERS_DAT[p][1]));
      if (T.has('pron_pers') && !o.noDatPron && datPs.length && chance(ctx.focus === 'pron_pers' ? 0.5 : 0.25)) {
        plan.datPron = pick(datPs);
      } else {
        const np = pickNP(ctx, verb.d, { ex, noCity: true, noProper: false, filter: (N) => caseOK(N, 'dat') });
        if (!np && verb.dreq) return null;
        if (np) { plan.dat = np; ex.push(np.N.head); }
      }
    }
    // complementi
    if (verb.pp && T.has('compl') && !o.noPP) {
      const kinds = Object.keys(verb.pp).filter((k) => ppKindOK(ctx, k));
      const req = verb.req ? verb.req.split(' ') : null;
      const want = req || o.forcePP || ctx.focus === 'compl' || chance(0.55);
      if (want && kinds.length) {
        let ks = req ? shuffle(kinds.filter((k) => req.includes(k))) : shuffle(kinds);
        for (const k of ks) { const pp = buildPP(ctx, verb, k, ex, plan.subj); if (pp) { plan.pps.push(pp); if (pp.np) ex.push(pp.np.N.head); break; } }
        if (req && !plan.pps.length) return null;
      } else if (req) return null;
    } else if (verb.req) return null;
    // complemento facoltativo di tempo, modo, causa
    if (T.has('compl') && !o.noPP && plan.pps.length < 2 && chance(o.lite ? 0.08 : ctx.focus === 'compl' ? 0.5 : 0.22)) {
      const kinds = Object.keys(D.EXTRA).filter((k) => D.EXTRA[k].split(' ').includes(verb.la) && prepKnown(k));
      const k = kinds.length ? pick(kinds) : null;
      let np = null;
      if (k === 'time') { np = pickNP(ctx, 'season =nox', { ex, filter: (N) => caseOK(N, 'abl', 's') }); if (np) np.num = 's'; }
      if (k === 'manner') {
        np = pickNP(ctx, 'man', { ex, filter: (N) => caseOK(N, 'abl', 's') }); if (np) { np.num = 's'; const mg = ADJS.find((A) => A.head === 'magnus'); if (mg && T.has(mg.t) && known(mg.e) && chance(0.4)) np.adj = mg; }
      }
      if (k === 'cause') np = pickNP(ctx, 'fight weather bad', { ex, filter: (N) => caseOK(N, 'acc') });
      if (k === 'dur' && T.has(MULTUS.t) && known(MULTUS) && (tense === 'impf' || tense === 'perf')) { np = pickNP(ctx, '=annus =dies', { ex }); if (np) { np.num = 'p'; np.multus = true; } }
      if (np) { plan.pps.push({ kind: k, np, extra: true }); ex.push(np.N.head); }
    }
    // agente / causa efficiente nel passivo
    if (voice === 'pass' && T.has('compl') && !o.noAgent && chance(0.6)) {
      const np = prepKnown('agent') ? pickNP(ctx, verb.s, { ex, noCity: true, filter: (N) => caseOK(N, 'abl') }) : null;
      if (np && np.N.tags.has('H')) { plan.pps.unshift({ kind: 'agent', np }); ex.push(np.N.head); }
      else if (verb.pp && verb.pp.instr) { const n2 = pickNP(ctx, verb.pp.instr, { ex, filter: (N) => caseOK(N, 'abl') }); if (n2) plan.pps.unshift({ kind: 'instr', np: n2 }); }
    }
    // decorazioni
    decorate(ctx, [plan.subj, plan.obj, plan.dat, ...plan.pps.filter((x) => !x.extra).map((x) => x.np)].filter(Boolean), o);
    if (chance(o.lite ? 0.04 : 0.15) || o.forceGen) addGenitive(ctx, pick([plan.obj, plan.subj].filter((x) => x && !x.fixed)) || null, ex);
    if (T.has('pron_pers') && (o.forcePoss || ctx.focus === 'pron_pers' || chance(o.lite ? 0.05 : 0.15))) {
      const c = shuffle([plan.obj, plan.dat, ...plan.pps.map((x) => x.np)].filter(Boolean));
      let done = false;
      for (const np of c) if (addPoss(ctx, np, plan.subj ? null : plan.p, plan.subj ? plan.subj.num : null, plan.voice === 'pass')) { done = true; break; }
      if (o.forcePoss && !done && plan.datPron == null && !plan.pps.some((x) => x.pron != null)) return null;
    }
    // avverbio e negazione
    if (!o.noAdv && !plan.pps.some((x) => x.extra) && chance(o.lite ? 0.08 : 0.25)) {
      const advs = lexFilter(ADV.filter((a) => T.has(a.t) && a.tenses.includes(tense) && (!a.verbs || a.verbs.includes(verb.la))), (a) => E.BY_UID.get(a.la), 0.1);
      if (advs.length) { plan.adv = pick(advs); mark(E.BY_UID.get(plan.adv.la)); }
    }
    if (!o.noNeg && knownU('non') && chance(o.lite ? 0.04 : 0.1)) plan.neg = true;
    return plan;
  }
  function planTags(plan, tags) {
    tenseTags(plan.tense, plan.voice, plan.verb.e, tags);
    [plan.subj, plan.obj, plan.dat].forEach((np) => npTags(np, tags));
    plan.pps.forEach((pp) => { tags.add('compl'); if (pp.np) npTags(pp.np, tags); if (pp.home) tags.add(DOMUS.t); if (pp.pron != null) tags.add('pron_pers'); });
    if (plan.datPron != null) tags.add('pron_pers');
    if (plan.adv) tags.add(plan.adv.t);
  }
  // latino: {pre, subj, rest}
  function laClause(plan, o = {}) {
    const subjG = plan.subj ? plan.subj.N.g : 'm', subjN = plan.subj ? plan.subj.num : (plan.p >= 3 ? 'p' : 's');
    const pre = [], subj = [], rest = [];
    if (plan.adv && plan.adv.pos === 'start') pre.push(lit(plan.adv.la, plan.adv.la));
    if (plan.subj && !o.noSubj) { const x = laNP(plan.subj, 'nom'); if (!x) return null; subj.push(...x.core, ...x.gen); }
    if (plan.datPron != null) { const [w, u, key] = PERS_DAT[plan.datPron]; rest.push(lit(w, u, key)); }
    if (plan.dat) { const x = laNP(plan.dat, 'dat'); if (!x) return null; rest.push(...x.core, ...x.gen); }
    if (plan.obj && !o.noObj) { const x = laNP(plan.obj, plan.verb.oc || 'acc'); if (!x) return null; rest.push(...x.core, ...x.gen); }
    for (const pp of plan.pps) { const t = laPP(pp, plan.verb); if (!t || t.some((x) => !x)) return null; rest.push(...t); }
    if (plan.adv && plan.adv.pos === 'mid') rest.push(lit(plan.adv.la, plan.adv.la));
    let vt;
    if (o.verbTokens) vt = o.verbTokens;
    else vt = laFinite(plan.verb.e, plan.tense, plan.voice, plan.p, subjG, subjN, plan.mood);
    if (!vt) return null;
    if (plan.neg && !o.noNeg) rest.push(lit('non', 'non'));
    rest.push(...vt);
    return { pre, subj, rest };
  }
  // italiano: restituisce {pre, subj, rest, g, n}
  function itClause(plan, ch, reg, o = {}) {
    const key = o.key || '0';
    const itv = pickItv(plan.verb, ch, reg, key);
    const pre = [], restParts = [];
    if (plan.adv && plan.adv.pos === 'start') pre.push(plan.adv.it);
    let g = 'm', n = plan.p >= 3 ? 'p' : 's', subjStr = '';
    if (plan.subj) { const s = itNP(plan.subj, ch, reg); g = s.g; n = s.n; subjStr = itStr(s); }
    const vo = { p: plan.p, g, n, voice: plan.voice, neg: plan.neg && !o.noNeg, prefPP: o.prefPP, clitic: plan.datPron != null ? ['mi', 'ti', null, 'ci', 'vi'][plan.datPron] : null };
    let vstr;
    if (o.itVerb) vstr = o.itVerb(itv, vo);
    else vstr = itFinite(itv, o.itTense || IT_TENSE[plan.tense], vo, ch, reg, key);
    restParts.push(vstr);
    if (plan.adv && plan.adv.pos === 'mid') restParts.push(plan.adv.it);
    if (plan.obj && !o.noObj) restParts.push(objPrep(itv, itNP(plan.obj, ch, reg)));
    if (plan.dat) restParts.push(IT.withPrep('a', itNP(plan.dat, ch, reg)));
    for (const pp of plan.pps) restParts.push(itPP(pp, plan.verb, ch, reg));
    return { pre: pre.join(' '), subj: subjStr, rest: restParts.join(' '), g, n, itv };
  }
  const joinIt = (c, noSubj) => [c.pre, noSubj ? '' : c.subj, c.rest].filter(Boolean).join(' ');
  const joinLa = (c) => [...c.pre, ...c.subj, ...c.rest];

  /* ---------- Suggerimenti ---------- */
  const PP_TIP = {
    loc: 'In + ablativo indica lo stato in luogo.', to: 'In / ad + accusativo indicano il moto a luogo.', from: 'E / ex, a / ab + ablativo indicano il moto da luogo.',
    per: 'Per + accusativo indica il moto per luogo.', with: 'Cum + ablativo di persona: complemento di compagnia.', instr: 'L’ablativo semplice di cosa indica il mezzo.',
    agent: 'A / ab + ablativo di persona: complemento d’agente.', cause: 'Propter + accusativo indica la causa.', manner: 'Cum + ablativo di un nome astratto: complemento di modo.',
    time: 'L’ablativo semplice di un nome di tempo indica il tempo determinato.', pro: 'Pro + ablativo: «per, in difesa di».', de: 'De + ablativo: «di, riguardo a».',
    sep: 'L’ablativo indica da che cosa ci si libera (separazione).', toH: 'Ad + accusativo di persona: «a, presso».', fromH: 'A / ab + ablativo di persona: «da» (chiedere a qualcuno).',
  };
  function tipFor(plan, focus) {
    const tips = [];
    if (plan.verb && isDep(plan.verb.e)) tips.push(['v_dep', 'Il verbo è deponente: forma passiva, significato attivo.']);
    if (plan.voice === 'pass') tips.push(['v_pass', (plan.tense === 'perf' || plan.tense === 'ppf') ? 'Participio perfetto + sum: tempo passivo del sistema del perfetto.' : 'La desinenza passiva -tur / -ntur indica che il soggetto subisce l’azione.']);
    if (plan.tense === 'impf') tips.push(['v_if', 'Il suffisso -ba- indica l’imperfetto.']);
    if (plan.tense === 'fut') tips.push(['v_if', 'Futuro: -bo / -bi / -bu nella 1ª e 2ª coniugazione, -am / -e- nelle altre.']);
    if (plan.tense === 'perf') tips.push(['v_perf', 'Il perfetto si traduce con il passato remoto o prossimo.']);
    for (const pp of plan.pps || []) if (PP_TIP[pp.kind]) tips.push(['compl', PP_TIP[pp.kind]]);
    if (plan.dat) tips.push([plan.dat.N.t, 'Il dativo indica il complemento di termine.']);
    if (plan.datPron != null) tips.push(['pron_pers', 'Mihi, tibi, nobis, vobis sono dativi: «mi, ti, ci, vi».']);
    const nps = [plan.subj, plan.obj, plan.dat].filter(Boolean);
    for (const np of nps) {
      if (np.gen) tips.push([np.gen.N.t, 'Il genitivo dipende dal nome che lo precede: complemento di specificazione.']);
      if (np.poss === 'suus') tips.push(['pron_pers', 'Suus è riflessivo: si riferisce al soggetto della frase.']);
      if (np.dem) tips.push(['pron_dim', np.dem === 'hic' ? 'Hic indica qualcosa di vicino: «questo».' : 'Ille indica qualcosa di lontano: «quello».']);
      if (np.adj) tips.push([np.adj.t, 'L’aggettivo concorda con il nome in genere, numero e caso.']);
    }
    if (plan.subj == null && plan.p != null) tips.push(['v_pres', 'Il soggetto è sottinteso: lo indica la desinenza del verbo.']);
    const f = tips.find((t) => t[0] === focus);
    return (f || tips[0] || [null, ''])[1];
  }

  /* ---------- Costrutti ---------- */
  const normW = (w) => E.norm(w.replace(/[^A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]/g, ''));
  // parole della frase con la loro analisi, nell'ordine (dalla traccia)
  function tokensOf(tokens, T) {
    const used = new Set();
    const out = [];
    tokens.forEach((tile, ti) => {
      tile.split('_').forEach((raw) => {
        const w = raw.replace(/[^A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]/g, '');
        if (!w) return;
        const n = normW(w);
        let k = TR.findIndex((x, i) => !used.has(i) && E.norm(x.f) === n);
        if (k < 0) k = TR.findIndex((x) => E.norm(x.f) === n);
        if (k >= 0) {
          used.add(k);
          const x = TR[k];
          const f = x.e.forms.find((y) => y.key === x.key && E.norm(y.f) === n) || x.e.forms.find((y) => E.norm(y.f) === n);
          out.push({ w, e: x.e, key: f ? f.key : x.key, q: f ? f.q : w, tile: ti });
        } else {
          const an = E.analyze(w).filter((a) => a.req.every((t) => T.has(t)));
          if (!an.length) { out.push(null); return; }
          const a = an.find((y) => y.e.k === 'i') || an[0];
          out.push({ w, e: a.e, key: a.key, q: a.q || w, tile: ti });
        }
      });
    });
    return out;
  }
  function finish(ctx, la, itFn, tags, tip, punct = '.') {
    const T = ctx.T;
    for (const t of tags) if (!T.has(t)) return null;
    const tokens = la.filter(Boolean);
    if (!tokens.length || tokens.some((t) => /null|undefined/.test(t))) return null;
    // ogni parola deve essere riconosciuta e rientrare negli argomenti
    for (const tok of tokens) for (const w of tok.replace(/[,]/g, '').split('_')) { const r = E.reqOK(w, T); if (!r.known || !r.ok) return null; }
    const words = tokensOf(tokens, T);
    if (words.some((x) => !x)) return null;
    // l'analisi esatta di ogni parola (non solo una lettura qualsiasi) deve stare negli argomenti scelti
    for (const x of words) { const f = x.e.forms.find((y) => y.key === x.key && E.norm(y.f) === E.norm(x.w)); if (!f || !f.req.every((t) => T.has(t))) return null; }
    // forme ammesse dalla lezione e vocabolario: al massimo una parola nuova
    if (ctx.formOK && words.some((x) => !ctx.formOK(x.e, x.key))) return null;
    let newWords = [];
    if (ctx.lex) {
      newWords = uniq(words.filter((x) => !ctx.lex.has(x.e.uid)).map((x) => x.e.uid));
      if (newWords.length > (ctx.maxNew || 0)) return null;
      if (ctx.newOK && newWords.some((u) => !ctx.newOK(E.BY_UID.get(u)))) return null;
    }
    let laStr = tokens.join(' ').replace(/\s+,/g, ',');
    laStr = laStr.charAt(0).toUpperCase() + laStr.slice(1) + punct;
    const slots = [];
    const reg = (k, n) => { if (!slots.find((s) => s.k === k)) slots.push({ k, n }); };
    const fmt = (s) => { s = s.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim(); return s.charAt(0).toUpperCase() + s.slice(1) + punct; };
    const base = itFn(() => 0, reg);
    if (!base || /undefined|null/.test(base)) return null;
    const outs = [fmt(base)];
    for (const sl of slots) for (let i = 1; i < sl.n && outs.length < 6; i++) {
      const alt = itFn((k) => (k === sl.k ? i : 0), () => {});
      const f = alt && fmt(alt);
      if (f && !outs.includes(f)) outs.push(f);
    }
    const tg = [...tags];
    // le parole della frase con la loro analisi (la maiuscola iniziale la mette chi la mostra)
    const toks = words.map((x) => ({ w: x.w, uid: x.e.uid, key: x.key, q: x.q, tile: x.tile }));
    return { la: laStr, it: outs, tags: tg, tip: tip || '', tokens: toks, newWords };
  }

  function bBasic(ctx, o = {}) {
    const plan = clausePlan(ctx, o);
    if (!plan) return null;
    const la = laClause(plan); if (!la) return null;
    const tags = new Set(); planTags(plan, tags);
    // domanda con cur («perché?»)
    if (!o.noQ && knownU('cur') && plan.voice === 'act' && plan.mood === 'ind' && ['pres', 'impf', 'fut'].includes(plan.tense) && chance(o.q ? 1 : 0.1)) {
      return finish(ctx, [lit('cur', 'cur'), ...joinLa(la)], (ch, reg) => 'Perché ' + joinIt(itClause(plan, ch, reg)), tags, 'Cur introduce una domanda: «perché?».', '?');
    }
    return finish(ctx, joinLa(la), (ch, reg) => joinIt(itClause(plan, ch, reg)), tags, tipFor(plan, ctx.focus));
  }

  // due azioni dello stesso soggetto: «Laboro et canto», «Non dormio, sed vigilo» (con sed, solo azioni contrapposte)
  const CONTRAST = [['dormio', 'vigilo'], ['rideo', 'lacrimo'], ['lacrimo', 'rideo'], ['canto', 'taceo'], ['clamo', 'taceo'], ['laboro', 'ludo'], ['ludo', 'laboro'], ['sedeo', 'ambulo'], ['ambulo', 'sedeo'], ['sedeo', 'curro'], ['laboro', 'dormio'], ['dormio', 'laboro'], ['pugno', 'fugio'], ['fugio', 'pugno'], ['curro', 'ambulo'], ['taceo', 'canto']];
  function bCoord(ctx) {
    const conj = ['et', 'sed'].filter(knownU);
    if (!conj.length) return null;
    const c = pick(conj);
    const neg = c === 'sed';
    if (neg && !knownU('non')) return null;
    const c1 = clausePlan(ctx, { lite: true, noAdv: true, noNeg: true, noQ: true, noPP: true, verbFilter: neg ? (v) => CONTRAST.some(([a]) => a === v.la) : null });
    if (!c1) return null;
    if (neg) c1.neg = true;
    const pair = neg ? CONTRAST.filter(([a]) => a === c1.verb.la).map(([, b]) => b) : null;
    const c2 = clausePlan(ctx, { lite: true, noAdv: true, noNeg: true, noPP: true, tense: c1.tense, subjNP: c1.subj || undefined, person: c1.subj ? undefined : c1.p, verbFilter: (v) => v.e !== c1.verb.e && (c1.subj ? true : personOK(v.s)) && (!pair || pair.includes(v.la)), ex: [c1.obj && c1.obj.N.head].filter(Boolean) });
    if (!c2) return null;
    if (!c1.subj && c2.p !== c1.p) return null;
    const l1 = laClause(c1), l2 = laClause(c2, { noSubj: true }); if (!l1 || !l2) return null;
    const tags = new Set(); planTags(c1, tags); planTags(c2, tags);
    const la1 = joinLa(l1);
    if (neg) la1[la1.length - 1] += ',';
    return finish(ctx, [...la1, lit(c, c), ...joinLa(l2)], (ch, reg) => joinIt(itClause(c1, ch, reg, { key: '1' })) + (neg ? ', ma ' : ' e ') + joinIt(itClause(c2, ch, reg, { key: '2' }), true), tags,
      neg ? 'Non nega il primo verbo; sed («ma») introduce l’azione contrapposta.' : 'Et unisce due verbi con lo stesso soggetto.');
  }

  function bCopula(ctx, o = {}) {
    const T = ctx.T;
    const tense = pickTense(ctx);
    const kinds = [];
    if (T.has('agg1') || T.has('agg2')) kinds.push('adj', 'adj');
    if (T.has('compl') && knownU('in')) kinds.push('loc', 'exist');
    if (!kinds.length) return null;
    const kind = o.kind || pick(kinds);
    if ((kind === 'loc' || kind === 'exist') && !knownU('in')) return null;
    const tags = new Set(['v_pres']);
    tenseTags(tense, 'act', SUM, tags);
    if (!known(SUM)) return null;
    const sumF = (p) => vform(SUM, { mood: 'ind', tense: SUMT[tense], voice: 'act', p });
    const itT = IT_TENSE[tense];
    if (kind === 'adj') {
      const adjT = o.forceAdj || (['agg1', 'agg2'].includes(ctx.focus) ? ctx.focus : null);
      const cands = lexFilter(NOUNS.filter((N) => nounOK(ctx, N) && !N.opts.nosubj && !N.opts.city && !N.opts.reg && (!o.topic || N.t === o.topic) && caseOK(N, 'nom')), (N) => N.e);
      for (const N of shuffle(cands).slice(0, 30)) {
        const adjs = lexFilter(ADJS.filter((A) => T.has(A.t) && adjFits(A, N) && (!adjT || A.t === adjT) && A.head !== 'multus'), (A) => A.e, 0.2);
        if (!adjs.length) continue;
        const A = pick(adjs);
        const np = mkNP(N);
        mark(A.e);
        if (T.has('pron_dim') && (ctx.focus === 'pron_dim' || chance(0.2)) && !N.proper) { const dems = ['hic', 'ille'].filter(knownU); if (dems.length) np.dem = pick(dems); }
        const p = np.num === 's' ? 2 : 5;
        const sx = laNP(np, 'nom'); if (!sx) continue;
        const af = adjForm(A, 'nom', np.num, N.g); if (!af) continue;
        const sf = sumF(p); if (!sf) continue;
        const t2 = new Set(tags); npTags(np, t2); t2.add(A.t);
        const la = [...sx.core, ...sx.gen, af, sf];
        return finish(ctx, la, (ch, reg) => {
          const s = itNP(np, ch, reg);
          let ai = 0; if (A.it.length > 1) { reg('pa', A.it.length); ai = ch('pa'); }
          const ad = IT.adjAgree((A.it[ai] || A.it[0]).forms, s.g, s.n);
          return itStr(s) + ' ' + itFinite({ inf: 'essere', part: '' }, itT, { p, g: s.g, n: s.n }, ch, reg, 'c') + ' ' + ad;
        }, t2, 'Il verbo sum unisce il soggetto all’aggettivo: parte nominale in nominativo.');
      }
      return null;
    }
    if (kind === 'loc' || kind === 'exist') {
      const pairs = shuffle(D.WHERE);
      let N = null, place = null;
      for (const [who, where] of pairs) {
        const cand = nounsFor(ctx, who, { subj: true, noProper: true, noCity: true, filter: (x) => !x.tags.has('col') && !x.tags.has('gent') && caseOK(x, 'nom') });
        if (!cand.length) continue;
        const n0 = pick(cand);
        const pl = pickNP(ctx, where, { ex: [n0.head], noCity: true, filter: (x) => caseOK(x, 'abl') });
        if (pl) { N = n0; place = pl; break; }
      }
      if (!N || !place) return null;
      if (place.N.opts.reg) place.num = 's';
      const np = mkNP(N, kind === 'exist' ? { numPref: chance(0.6) ? 'p' : 's' } : {});
      if (kind === 'exist' && np.num === 'p' && T.has(MULTUS.t) && known(MULTUS) && chance(0.5) && N.latPl && N.it.every((v) => !v.num)) np.multus = true;
      if (kind === 'loc' && place.N.latSg && chance(0.8)) place.num = 's';
      const p = np.num === 's' ? 2 : 5;
      const sx = laNP(np, 'nom'); const pp = laPP({ kind: 'loc', np: place }); const sf = sumF(p);
      if (!sx || !pp || !sf) return null;
      const t2 = new Set(tags); npTags(np, t2); npTags(place, t2); t2.add('compl');
      const la = kind === 'exist' ? [...pp, ...sx.core, ...sx.gen, sf] : [...sx.core, ...sx.gen, ...pp, sf];
      return finish(ctx, la, (ch, reg) => {
        const where = itPP({ kind: 'loc', np: place }, null, ch, reg);
        if (kind === 'loc') {
          const s = itNP(np, ch, reg);
          return itStr(s) + ' ' + IT.verb('essere', itT, { p, g: s.g, n: s.n }) + ' ' + where;
        }
        const s = itNP(np, ch, reg, { indef: true });
        let ess = IT.verb('essere', itT === 'pr' ? 'pr' : itT, { p, g: s.g, n: s.n });
        const ci = /^[eè]/.test(ess) ? "c'" + ess : 'ci ' + ess;
        return IT.cap(where) + ' ' + ci + ' ' + itStr(s);
      }, t2, kind === 'exist' ? 'Sum con un complemento di luogo si traduce «c’è, ci sono».' : PP_TIP.loc);
    }
    return null;
  }

  const COMP_IT = { bonus: ['migliore|migliori', 'più buono'], malus: ['peggiore|peggiori', 'più cattivo'], magnus: ['più grande', 'maggiore|maggiori'], parvus: ['più piccolo', 'minore|minori'] };
  const SUP_IT = { bonus: ['ottimo', 'molto buono'], malus: ['pessimo', 'molto cattivo'], magnus: ['grandissimo', 'molto grande'], parvus: ['piccolissimo', 'molto piccolo'] };
  function bComp(ctx) {
    const T = ctx.T;
    if (!T.has('comp') || !known(SUM)) return null;
    const tense = chance(0.75) || (ctx.tenses && !ctx.tenses.includes('impf')) ? 'pres' : (T.has('v_if') ? 'impf' : 'pres');
    const adjs = lexFilter(ADJS.filter((A) => T.has(A.t) && A.comp), (A) => A.e, 0.15);
    for (const A of shuffle(adjs).slice(0, 12)) {
      const nouns = lexFilter(NOUNS.filter((N) => nounOK(ctx, N) && adjFits(A, N) && !N.opts.nosubj && !N.opts.reg && caseOK(N, 'nom')), (N) => N.e, 0);
      if (nouns.length < 2) continue;
      const sup = chance(0.35);
      if (!sup && !knownU('quam')) continue;
      const N1 = pick(nouns);
      const np1 = mkNP(N1);
      mark(A.e);
      const p = np1.num === 's' ? 2 : 5;
      const sf = vform(SUM, { mood: 'ind', tense, voice: 'act', p });
      const s1 = laNP(np1, 'nom');
      const af = adjForm(A, 'nom', np1.num, N1.g, sup ? 'sup' : 'comp');
      if (!sf || !s1 || !af) continue;
      const tags = new Set(['comp', A.t]); tenseTags(tense, 'act', SUM, tags); npTags(np1, tags);
      const itT = IT_TENSE[tense];
      const itAdj = (g, n, ch, reg, key) => {
        const irr = (sup ? SUP_IT : COMP_IT)[A.head];
        const alts = irr ? irr.map((x) => (x.startsWith('più ') || x.startsWith('molto ') ? x.split(' ')[0] + ' ' + IT.adjAgree(IT.adjForms(x.split(' ')[1]), g, n) : IT.adjAgree(IT.adjForms(x), g, n)))
          : sup ? ['molto ' + IT.adjAgree(A.it[0].forms, g, n), IT.adjAgree(IT.superlative(A.it[0].forms), g, n)] : ['più ' + IT.adjAgree(A.it[0].forms, g, n)];
        if (alts.length > 1) { reg(key, alts.length); return alts[ch(key)] || alts[0]; }
        return alts[0];
      };
      if (sup) {
        const la = [...s1.core, ...s1.gen, af, sf];
        return finish(ctx, la, (ch, reg) => { const s = itNP(np1, ch, reg); return itStr(s) + ' ' + IT.verb('essere', itT, { p, g: s.g, n: s.n }) + ' ' + itAdj(s.g, s.n, ch, reg, 'sa'); }, tags, 'Il superlativo assoluto si traduce con «molto» o con «-issimo».');
      }
      const N2 = pick(nouns.filter((x) => x !== N1 && x.tags.has([...N1.tags].find((t) => /^[HAPTXE]$/.test(t)) || 'H')) || []);
      if (!N2) continue;
      const np2 = mkNP(N2, { num: chance(0.7) ? np1.num : undefined });
      const s2 = laNP(np2, 'nom'); if (!s2) continue;
      npTags(np2, tags);
      const la = [...s1.core, ...s1.gen, af, sf, lit('quam', 'quam'), ...s2.core, ...s2.gen];
      return finish(ctx, la, (ch, reg) => { const a = itNP(np1, ch, reg), b = itNP(np2, ch, reg); return itStr(a) + ' ' + IT.verb('essere', itT, { p, g: a.g, n: a.n }) + ' ' + itAdj(a.g, a.n, ch, reg, 'ca') + ' ' + IT.withPrep('di', b); }, tags, 'Quam introduce il secondo termine di paragone, nello stesso caso del primo.');
    }
    return null;
  }

  function bImper(ctx) {
    const T = ctx.T;
    if (!T.has('v_imper')) return null;
    const addr = pickNP(ctx, 'kid srv mil fr kin civ', { noProper: true, filter: (N) => !N.tags.has('col') && !N.tags.has('gent') && caseOK(N, 'voc') });
    if (!addr) return null;
    const pl = addr.num === 'p';
    const p = pl ? 4 : 1;
    const nolo = lex('v', 'nolo');
    const negImp = T.has('v_irr') && known(nolo) && chance(0.25);
    const plan = clausePlan(ctx, { subjNP: addr, fixedSubj: true, tense: 'pres', noAdv: true, noNeg: true, noDatPron: true, verbFilter: (v) => !isDep(v.e) || negImp });
    if (!plan) return null;
    plan.p = p; plan.mood = 'imp';
    let vt;
    if (negImp) {
      const noli = vform(nolo, { mood: 'imp', tense: 'pres', voice: 'act', p });
      const inf = laInfinitive(plan.verb.e, 'cont', 'act');
      if (!noli || !inf) return null;
      vt = [noli, ...inf];
    } else {
      const f = vform(plan.verb.e, { mood: 'imp', tense: 'pres', voice: 'act', p }); if (!f) return null;
      vt = [f];
    }
    const voc = nounForm(addr.N, 'voc', addr.num); if (!voc) return null;
    let vocTok = [voc];
    if (addr.adj) { const a = adjForm(addr.adj, 'voc', addr.num, addr.N.g); if (!a) return null; vocTok = PRE_LA.has(addr.adj.head) ? [a, voc] : [voc, a]; }
    const la = laClause(plan, { noSubj: true, verbTokens: vt });
    if (!la) return null;
    vocTok[vocTok.length - 1] += ',';
    const tags = new Set(['v_imper']); planTags(plan, tags); npTags(addr, tags);
    if (negImp) tags.add('v_irr');
    return finish(ctx, [...vocTok, ...la.rest], (ch, reg) => {
      const a = itNP(addr, ch, reg, { noArt: true });
      const c = itClause(plan, ch, reg, { itVerb: (itv) => { let s = IT.verb(itv.inf, 'imp', { p, neg: negImp }); if (itv.part) s += ' ' + itv.part; return s; } });
      return IT.cap(a.body) + ', ' + c.rest;
    }, tags, negImp ? 'Noli / nolite + infinito esprimono il divieto: «non…».' : 'Il vocativo indica la persona a cui si rivolge l’ordine.', '!');
  }

  function bModal(ctx, o = {}) {
    const T = ctx.T;
    let mods = lexFilter(MODALS.filter((m) => T.has(m.e.t) && (!o.modal || m.t === o.modal)), (m) => m.e, 0.2);
    if (!mods.length) return null;
    const m = pick(mods);
    mark(m.e);
    let tense = pickTense(ctx);
    if (isDep(m.e) && tense === 'perf' && !T.has('v_perf')) tense = 'pres';
    const plan = clausePlan(ctx, { tense: 'pres', noAdv: true, noNeg: true, noDatPron: true, noQ: true, verbFilter: (v) => v.e.t !== 'v_dep' || T.has('v_dep') });
    if (!plan) return null;
    const sg = plan.subj ? plan.subj.N.g : 'm', sn = plan.subj ? plan.subj.num : (plan.p >= 3 ? 'p' : 's');
    const inf = laInfinitive(plan.verb.e, 'cont', 'act'); if (!inf) return null;
    const mf = laFinite(m.e, tense, 'act', plan.p, sg, sn); if (!mf) return null;
    const neg = !m.neg && knownU('non') && chance(0.3);
    const la = laClause(plan, { verbTokens: [...inf, ...(neg ? [lit('non', 'non')] : []), ...mf], noNeg: true });
    if (!la) return null;
    const tags = new Set([m.e.t]); planTags(plan, tags); tenseTags(tense, 'act', m.e, tags);
    return finish(ctx, joinLa(la), (ch, reg) => joinIt(itClause(plan, ch, reg, {
      itVerb: (itv, vo) => {
        const mv = itFinite({ inf: m.it, part: '' }, IT_TENSE[tense], { p: vo.p, g: vo.g, n: vo.n, neg: neg || m.neg }, ch, reg, 'm');
        return mv + ' ' + (m.prep ? m.prep + ' ' : '') + itInfinitive(itv);
      },
    })), tags, m.la === 'possum' ? 'Possum regge l’infinito, come «potere» in italiano.' : m.la === 'conor' ? 'Conor è deponente: «tentare di» + infinito.' : 'Il verbo servile regge l’infinito.');
  }

  function bSumComp(ctx) {
    const T = ctx.T;
    if (!T.has('v_poss')) return null;
    for (const S of shuffle(lexFilter(SUMCOMP, (m) => m.e, 0.2))) {
      if (!T.has(S.e.t)) continue;
      if (S.from && !(T.has('compl') && prepKnown('from'))) continue;
      let tense = pickTense(ctx);
      if (S.la === 'absum' || S.la === 'adsum') tense = chance(0.7) ? 'pres' : (T.has('v_if') ? 'impf' : 'pres');
      const subj = pickNP(ctx, S.s, { subj: true, noCity: true, filter: (N) => caseOK(N, 'nom') });
      if (!subj) continue;
      const dat = S.d ? pickNP(ctx, S.d, { ex: [subj.N.head], noCity: true, filter: (N) => caseOK(N, 'dat') }) : null;
      if (S.d && !dat) continue;
      const from = S.from ? pickNP(ctx, S.from, { ex: [subj.N.head], numPref: chance(0.8) ? 's' : 'p' }) : null;
      if (S.from && !from) continue;
      mark(S.e);
      const p = subj.num === 's' ? 2 : 5;
      const vf = laFinite(S.e, tense, 'act', p, subj.N.g, subj.num); if (!vf) continue;
      const sx = laNP(subj, 'nom'); const dx = dat ? laNP(dat, 'dat') : null; const fx = from ? laPP({ kind: 'from', np: from }) : null;
      if (!sx || (dat && !dx) || (from && !fx)) continue;
      if (fx && from.N.opts.city === undefined && !from.N.opts.ad) {
        // absum vuole a / ab
        const m = fx[0].match(/^(e|ex)_/);
        if (m) { const ab = m[1] === 'e' ? 'a' : 'ab'; if (!knownU(ab)) continue; fx[0] = ab + fx[0].slice(m[1].length); lit(ab, ab); }
      }
      const la = S.order === 'dat-first' ? [...dx.core, ...dx.gen, ...sx.core, ...sx.gen, ...vf] : [...sx.core, ...sx.gen, ...(dx ? [...dx.core, ...dx.gen] : []), ...(fx || []), ...vf];
      const tags = new Set([S.e.t]); tenseTags(tense, 'act', S.e, tags); npTags(subj, tags); npTags(dat, tags); if (from) { npTags(from, tags); tags.add('compl'); }
      return finish(ctx, la, (ch, reg) => {
        const s = itNP(subj, ch, reg);
        let vi = 0; if (S.its.length > 1) { reg('vs', S.its.length); vi = ch('vs'); }
        const itv = S.its[vi] || S.its[0];
        const v = itFinite(itv, IT_TENSE[tense], { p, g: s.g, n: s.n }, ch, reg, 's');
        let tail = '';
        if (dat) { const d = itNP(dat, ch, reg); tail = itv.oprep ? IT.withPrep(itv.oprep, d) : (S.datIt ? IT.withPrep(S.datIt, d) : itStr(d)); }
        if (from) tail = IT.withPrep('da', itNP(from, ch, reg));
        if (S.order === 'dat-first' && dat) {
          reg('ord', 2);
          if (ch('ord') === 0) return IT.cap(tail) + ' ' + v + ' ' + itStr(s);
        }
        return [itStr(s), v, tail].filter(Boolean).join(' ');
      }, tags, S.d ? 'I composti di sum come ' + S.la + ' reggono il dativo.' : 'Absum: «essere lontano», con a / ab + ablativo.');
    }
    return null;
  }

  function bSub(ctx) {
    const T = ctx.T;
    if (!T.has('s_sub')) return null;
    const kinds = ['dum', 'quod'].filter((k) => k === 'quod' ? (knownU('quod') || knownU('quia')) : knownU(k));
    if (T.has('v_perf')) ['postquam', 'ubi'].filter(knownU).forEach((k) => kinds.push(k));
    if (!kinds.length) return null;
    const kind = pick(kinds);
    if (kind === 'dum') {
      const pastMain = T.has('v_if') && (!ctx.tenses || ctx.tenses.includes('impf')) && chance(0.4);
      const c1 = clausePlan(ctx, { lite: true, tense: 'pres', noAdv: true, noNeg: true, noQ: true }); if (!c1) return null;
      const ex = [c1.subj && c1.subj.N.head].filter(Boolean);
      const c2 = clausePlan(ctx, { lite: true, tense: pastMain ? 'impf' : 'pres', noAdv: true, noQ: true, ex }); if (!c2) return null;
      const l1 = laClause(c1), l2 = laClause(c2); if (!l1 || !l2) return null;
      const tags = new Set(['s_sub']); planTags(c1, tags); planTags(c2, tags);
      const la1 = joinLa(l1); la1[la1.length - 1] += ',';
      return finish(ctx, [lit('dum', 'dum'), ...la1, ...joinLa(l2)], (ch, reg) => 'Mentre ' + joinIt(itClause(c1, ch, reg, { key: '1', itTense: pastMain ? 'impf' : 'pres' })) + ', ' + joinIt(itClause(c2, ch, reg, { key: '2' })), tags, pastMain ? 'Dum + presente indica un’azione contemporanea: con la reggente al passato si traduce con l’imperfetto.' : 'Dum + indicativo: «mentre».');
    }
    if (kind === 'postquam' || kind === 'ubi') {
      const c1 = clausePlan(ctx, { lite: true, tense: 'perf', noAdv: true, noNeg: true, noQ: true }); if (!c1) return null;
      const c2 = clausePlan(ctx, { lite: true, tense: 'perf', noAdv: true, noQ: true, ex: [c1.subj && c1.subj.N.head].filter(Boolean) }); if (!c2) return null;
      const l1 = laClause(c1), l2 = laClause(c2); if (!l1 || !l2) return null;
      const tags = new Set(['s_sub', 'v_perf']); planTags(c1, tags); planTags(c2, tags);
      const la1 = joinLa(l1); la1[la1.length - 1] += ',';
      const intro = kind === 'postquam' ? ['Dopo che'] : ['Quando', 'Appena'];
      return finish(ctx, [lit(kind, kind), ...la1, ...joinLa(l2)], (ch, reg) => {
        let w = intro[0]; if (intro.length > 1) { reg('in', 2); w = intro[ch('in')] || intro[0]; }
        return w + ' ' + joinIt(itClause(c1, ch, reg, { key: '1' })) + ', ' + joinIt(itClause(c2, ch, reg, { key: '2' }));
      }, tags, kind === 'postquam' ? 'Dopo postquam il latino usa il perfetto anche dove l’italiano preferisce il trapassato.' : 'Ubi + perfetto: «quando, appena».');
    }
    // causale: reazione + causa
    const tense = T.has('v_perf') && (!ctx.tenses || ctx.tenses.includes('perf')) && chance(0.3) ? 'perf' : 'pres';
    let c1 = null, la1 = null, it1 = null;
    const t1 = new Set(['s_sub']);
    const emo = lexFilter(ADJS.filter((A) => T.has(A.t) && ['laetus', 'tristis', 'miser', 'felix'].includes(A.head)), (A) => A.e, 0);
    if (emo.length && known(SUM) && chance(0.6)) {
      const A = pick(emo);
      const np = pickNP(ctx, 'H !col !gent', { subj: true, noCity: true, filter: (N) => caseOK(N, 'nom') }); if (!np) return null;
      const p = np.num === 's' ? 2 : 5;
      const sx = laNP(np, 'nom'); const af = adjForm(A, 'nom', np.num, np.N.g); const sf = vform(SUM, { mood: 'ind', tense: 'pres', voice: 'act', p });
      if (!sx || !af || !sf) return null;
      la1 = [...sx.core, ...sx.gen, af, sf]; npTags(np, t1); t1.add(A.t);
      it1 = (ch, reg) => { const s = itNP(np, ch, reg); return itStr(s) + ' ' + IT.verb('essere', 'pres', { p, g: s.g, n: s.n }) + ' ' + IT.adjAgree(A.it[A.it.length > 1 ? 1 : 0].forms, s.g, s.n); };
      c1 = { subj: np };
    } else {
      const plan = clausePlan(ctx, { lite: true, tense: 'pres', noAdv: true, noNeg: true, noQ: true, verbFilter: (v) => ['rideo', 'lacrimo', 'fugio', 'timeo', 'clamo', 'propero'].includes(v.la) });
      if (!plan) return null;
      const l = laClause(plan); if (!l) return null;
      la1 = joinLa(l); planTags(plan, t1); c1 = plan;
      it1 = (ch, reg) => joinIt(itClause(plan, ch, reg, { key: '1' }));
    }
    const c2 = clausePlan(ctx, { lite: true, tense, noAdv: true, noQ: true, ex: [c1.subj && c1.subj.N.head].filter(Boolean) }); if (!c2) return null;
    const l2 = laClause(c2); if (!l2) return null;
    planTags(c2, t1);
    la1[la1.length - 1] += ',';
    const conjs = ['quod', 'quia'].filter(knownU);
    if (!conjs.length) return null;
    const conj = pick(conjs);
    return finish(ctx, [...la1, lit(conj, conj), ...joinLa(l2)], (ch, reg) => {
      reg('cz', 2);
      return it1(ch, reg) + (ch('cz') ? ', poiché ' : ' perché ') + joinIt(itClause(c2, ch, reg, { key: '2', prefPP: true }));
    }, t1, 'Quod e quia + indicativo introducono una causale: «perché».');
  }

  function bRel(ctx) {
    const T = ctx.T;
    if (!T.has('pron_rel') || !knownU('qui')) return null;
    const main = clausePlan(ctx, { lite: true, noPerson: true, noAdv: true, noQ: true });
    if (!main || !main.subj || main.subj.N.proper) return null;
    const ant = main.subj;
    ant.gen = null; ant.dem = null;
    const role = chance(0.55) ? 'nom' : 'acc';
    const rel = role === 'nom'
      ? clausePlan(ctx, { lite: true, subjNP: ant, noAdv: true, noPerson: true, noQ: true, ex: [ant.N.head] })
      : clausePlan(ctx, { lite: true, objNP: ant, needObj: true, noAdv: true, noPerson: true, noQ: true, voice: 'act', ex: [ant.N.head], subjFilter: (N) => N.head !== ant.N.head });
    if (!rel) return null;
    const relF = pronForm(PRON.qui, role, ant.num, ant.N.g); if (!relF) return null;
    const lm = laClause(main); const lr = laClause(rel, { noSubj: role === 'nom', noObj: role === 'acc' });
    if (!lm || !lr) return null;
    const relToks = [relF, ...(role === 'acc' ? [...lr.subj] : []), ...lr.rest];
    relToks[relToks.length - 1] += ',';
    const subjToks = lm.subj.slice(); subjToks[subjToks.length - 1] += ',';
    const tags = new Set(['pron_rel']); planTags(main, tags); planTags(rel, tags);
    return finish(ctx, [...lm.pre, ...subjToks, ...relToks, ...lm.rest], (ch, reg) => {
      const m = itClause(main, ch, reg, { key: 'm' });
      const r = itClause(rel, ch, reg, { key: 'r', noObj: role === 'acc' });
      const relIt = role === 'nom' ? 'che ' + r.rest : 'che ' + [r.subj, r.rest].filter(Boolean).join(' ');
      return [m.pre, m.subj, relIt, m.rest].filter(Boolean).join(' ');
    }, tags, role === 'nom' ? 'Il relativo prende genere e numero dall’antecedente; qui è nominativo perché fa da soggetto.' : 'Il relativo è in accusativo perché nella relativa fa da complemento oggetto.');
  }

  function bCum(ctx) {
    const T = ctx.T;
    if (!T.has('s_cum') || !T.has('v_cong') || !T.has('v_perf') || !knownU('cum@s_cum')) return null;
    const ant = ctx.tenses && !ctx.tenses.includes('ppf') ? false : chance(0.5);
    const voice = T.has('v_pass') && chance(0.25) ? 'pass' : 'act';
    const c1 = clausePlan(ctx, { lite: true, tense: ant ? 'ppf' : 'impf', voice, noAdv: true, noNeg: true, noDatPron: true, noQ: true }); if (!c1) return null;
    c1.mood = 'cong';
    const c2 = clausePlan(ctx, { lite: true, tense: 'perf', noAdv: true, noQ: true, ex: [c1.subj && c1.subj.N.head].filter(Boolean) }); if (!c2) return null;
    const l1 = laClause(c1), l2 = laClause(c2); if (!l1 || !l2) return null;
    const tags = new Set(['s_cum', 'v_cong', 'v_perf']); planTags(c1, tags); planTags(c2, tags);
    const la1 = joinLa(l1); la1[la1.length - 1] += ',';
    return finish(ctx, [lit('cum', 'cum@s_cum'), ...la1, ...joinLa(l2)], (ch, reg) => {
      const intro = ant ? ['Dopo che', 'Poiché'] : ['Mentre', 'Poiché'];
      reg('ci', 2);
      return intro[ch('ci')] + ' ' + joinIt(itClause(c1, ch, reg, { key: '1', itTense: ant ? 'tp' : 'impf' })) + ', ' + joinIt(itClause(c2, ch, reg, { key: '2' }));
    }, tags, ant ? 'Cum + congiuntivo piuccheperfetto: azione anteriore alla reggente.' : 'Cum + congiuntivo imperfetto: azione contemporanea alla reggente.');
  }

  function bUt(ctx) {
    const T = ctx.T;
    if (!T.has('v_cong')) return null;
    const r = rand();
    // finale con lo stesso soggetto: «per» + infinito
    if (r < 0.6 && knownU('ut')) {
      const c1 = clausePlan(ctx, { lite: true, noAdv: true, noNeg: true, noPerson: true, noQ: true, verbFilter: (v) => v.pp && v.pp.to, forcePP: true });
      if (!c1 || !c1.subj) return null;
      const to = c1.pps.find((pp) => pp.kind === 'to' && pp.np);
      let vf = null, objSpec = null;
      if (to && D.PURPOSE[to.np.N.head]) {
        const opts = D.PURPOSE[to.np.N.head].map(([la, ospec]) => ({ v: VERBS.find((v) => v.la === la && (!ospec || v.o) && T.has(v.e.t) && matches(c1.subj.N, v.s)), ospec })).filter((x) => x.v);
        if (opts.length) { const x = pick(opts); vf = (v) => v === x.v; objSpec = x.ospec || null; }
      }
      const past = c1.tense === 'impf' || c1.tense === 'perf';
      const c2 = clausePlan(ctx, { lite: true, subjNP: c1.subj, fixedSubj: true, objSpec, tense: past ? 'impf' : 'pres', mood: 'cong', noAdv: true, noNeg: true, noPP: true, noDatPron: true, noQ: true, verbFilter: vf || ((v) => v !== c1.verb), ex: [c1.subj.N.head].filter(Boolean) });
      if (!c2) return null;
      c2.mood = 'cong';
      const l1 = laClause(c1), l2 = laClause(c2, { noSubj: true }); if (!l1 || !l2) return null;
      const tags = new Set(['v_cong']); planTags(c1, tags); planTags(c2, tags);
      return finish(ctx, [...joinLa(l1), lit('ut', 'ut'), ...l2.rest], (ch, reg) => joinIt(itClause(c1, ch, reg, { key: '1' })) + ' per ' + itClause(c2, ch, reg, { key: '2', itVerb: (itv) => itInfinitive(itv) }).rest, tags, 'Ut + congiuntivo: proposizione finale, «per» + infinito quando il soggetto è lo stesso.');
    }
    // finale negativa con soggetto diverso: «perché… non» + congiuntivo
    if (!knownU('ne')) return null;
    const guard = VERBS.filter((v) => ['custodio', 'defendo'].includes(v.la) && T.has(v.e.t) && known(v.e));
    if (!guard.length) return null;
    const c1 = clausePlan(ctx, { lite: true, noAdv: true, noNeg: true, noPerson: true, noQ: true, verbFilter: (v) => guard.includes(v), voice: 'act' });
    if (!c1 || !c1.obj || !c1.obj.N.tags.has('P') && !c1.obj.N.tags.has('bld')) return null;
    const threat = VERBS.filter((v) => ['capio', 'occupo', 'deleo', 'oppugno', 'expugno'].includes(v.la) && T.has(v.e.t) && v.o && matches(c1.obj.N, v.o));
    if (!threat.length) return null;
    const past = c1.tense === 'impf' || c1.tense === 'perf';
    const objCopy = { ...c1.obj, id: npSeq++, adj: null, dem: null, poss: null, gen: null };
    const c2 = clausePlan(ctx, { lite: true, objNP: objCopy, tense: past ? 'impf' : 'pres', noAdv: true, noNeg: true, noPP: true, noPerson: true, noQ: true, verbFilter: (v) => threat.includes(v), subjFilter: (N) => N.tags.has('foe') || N.head === 'hostis', ex: [c1.subj && c1.subj.N.head].filter(Boolean) });
    if (!c2) return null;
    c2.mood = 'cong';
    const l1 = laClause(c1), l2 = laClause(c2); if (!l1 || !l2) return null;
    const tags = new Set(['v_cong']); planTags(c1, tags); planTags(c2, tags);
    return finish(ctx, [...joinLa(l1), lit('ne', 'ne'), ...joinLa(l2)], (ch, reg) => {
      reg('ne', 2);
      const c = itClause(c2, ch, reg, { key: '2', noNeg: true, itTense: past ? 'cimpf' : 'cpres' });
      return joinIt(itClause(c1, ch, reg, { key: '1' })) + (ch('ne') ? ' affinché ' : ' perché ') + c.subj + ' non ' + c.rest;
    }, tags, 'Ne + congiuntivo: finale negativa, «perché… non».');
  }

  function bInf(ctx) {
    const T = ctx.T;
    if (!T.has('v_inf')) return null;
    const sayers = lexFilter(SAYERS.filter((s) => T.has(s.e.t) && (!s.fut || T.has('v_part'))), (s) => s.e, 0.15);
    if (!sayers.length) return null;
    const S = pick(sayers);
    mark(S.e);
    const mainTense = T.has('v_perf') && (!ctx.tenses || ctx.tenses.includes('perf')) && chance(0.45) ? 'perf' : 'pres';
    const rels = ['cont'];
    if (T.has('v_perf')) rels.push('ant');
    if (T.has('v_part')) rels.push('post');
    const allowedRel = ctx.infRel ? rels.filter((r) => ctx.infRel.includes(r)) : rels;
    let rel = S.fut ? 'post' : pick(allowedRel.length ? allowedRel : rels);
    const subj = pickNP(ctx, S.s, { subj: true, noCity: true, filter: (N) => caseOK(N, 'nom') }); if (!subj) return null;
    const voice = rel !== 'post' && T.has('v_pass') && chance(0.25) ? 'pass' : 'act';
    const inner = clausePlan(ctx, { lite: true, noAdv: true, noNeg: true, noPerson: true, voice, noDatPron: true, noQ: true, ex: [subj.N.head], tense: 'pres' });
    if (!inner || !inner.subj) return null;
    const ig = inner.subj.N.g, inum = inner.subj.num;
    const inf = laInfinitive(inner.verb.e, rel, voice, ig, inum); if (!inf) return null;
    const p = subj.num === 's' ? 2 : 5;
    const mf = laFinite(S.e, mainTense, 'act', p, subj.N.g, subj.num); if (!mf) return null;
    const sx = laNP(subj, 'nom'); if (!sx) return null;
    // soggetto dell'infinitiva in accusativo
    const ix = laNP(inner.subj, 'acc'); if (!ix) return null;
    const li = laClause(inner, { noSubj: true, verbTokens: inf }); if (!li) return null;
    const tags = new Set(['v_inf', S.e.t]); tenseTags(mainTense, 'act', S.e, tags); npTags(subj, tags); planTags(inner, tags);
    if (rel === 'ant') tags.add('v_perf'); if (rel === 'post') tags.add('v_part');
    const past = mainTense === 'perf';
    const map = S.subj
      ? { cont: past ? 'cimpf' : 'cpres', ant: past ? 'ctp' : 'cpp', post: past ? 'cp' : 'fut' }
      : { cont: past ? 'impf' : 'pres', ant: past ? 'tp' : 'pp', post: past ? 'cp' : 'fut' };
    return finish(ctx, [...sx.core, ...sx.gen, ...mf, ...ix.core, ...ix.gen, ...li.rest], (ch, reg) => {
      const s = itNP(subj, ch, reg);
      const mv = itFinite({ inf: S.it, part: '' }, IT_TENSE[mainTense], { p, g: s.g, n: s.n }, ch, reg, 'm');
      const c = itClause(inner, ch, reg, { key: 'i', itTense: map[rel] });
      return itStr(s) + ' ' + mv + ' che ' + c.subj + ' ' + c.rest;
    }, tags, rel === 'cont' ? 'Infinitiva: soggetto in accusativo e verbo all’infinito presente (contemporaneità).' : rel === 'ant' ? 'L’infinito perfetto indica un’azione anteriore alla reggente.' : 'L’infinito futuro (participio futuro + esse) indica un’azione posteriore.');
  }

  function bAbl(ctx) {
    const T = ctx.T;
    if (!T.has('v_part')) return null;
    const r = rand();
    const mainTense = T.has('v_perf') ? 'perf' : 'pres';
    if (r < 0.65) {
      // participio perfetto: «presa la città, …»
      const vs = lexFilter(VERBS.filter((v) => v.ab && v.pass && T.has(v.e.t)), (v) => v.e, 0.15);
      if (!vs.length) return null;
      const V = pick(vs);
      mark(V.e);
      const obj = pickNP(ctx, V.o, { noCity: !/\bC\b/.test(V.o), filter: (N) => caseOK(N, 'abl') }); if (!obj) return null;
      const main = clausePlan(ctx, { lite: true, tense: mainTense, noAdv: true, noPerson: true, noQ: true, verbFilter: (v) => v.la !== V.la, subjFilter: (N) => matches(N, V.ab), ex: [obj.N.head] });
      if (!main) return null;
      const part = vform(V.e, { mood: 'part', tense: 'perf', c: 'abl', n: obj.num, g: obj.N.g }); if (!part) return null;
      const ox = laNP(obj, 'abl'); if (!ox) return null;
      const lm = laClause(main); if (!lm) return null;
      const tags = new Set(['v_part']); npTags(obj, tags); planTags(main, tags); tags.add(V.e.t);
      const ab = [...ox.core, ...ox.gen, part + ','];
      return finish(ctx, [...ab, ...joinLa(lm)], (ch, reg) => {
        const o = itNP(obj, ch, reg);
        const itv = V.its[0];
        reg('ab', 2);
        const head = ch('ab') === 0
          ? IT.pastParticiple(itv.inf, o.g, o.n) + ' ' + itStr(o)
          : 'Dopo che ' + itStr(o) + ' ' + IT.verb(itv.inf, mainTense === 'perf' ? 'pr' : 'pp', { p: o.n === 's' ? 2 : 5, g: o.g, n: o.n, voice: 'pass' });
        return head + ', ' + joinIt(itClause(main, ch, reg, { key: 'm' }));
      }, tags, 'Ablativo assoluto: nome e participio in ablativo, staccati dal resto della frase.');
    }
    if (r < 0.85) {
      // nominale: «Caesare duce»
      const lead = pickNP(ctx, 'mil rul', { filter: (N) => N.tags.has('N') && N.tags.has('H') }); if (!lead) return null;
      const title = byHead.dux; if (!title || !nounOK(ctx, title) || !known(title.e)) return null;
      const main = clausePlan(ctx, { lite: true, tense: mainTense, noAdv: true, noPerson: true, needObj: true, noQ: true, verbFilter: (v) => ['vinco', 'supero', 'expugno', 'capio', 'occupo', 'oppugno', 'defendo'].includes(v.la), subjFilter: (N) => N.tags.has('gent') || N.head === 'miles' || N.head === 'exercitus', ex: [lead.N.head] });
      if (!main) return null;
      const lx = nounForm(lead.N, 'abl', 's'), tx = nounForm(title, 'abl', 's');
      const lm = laClause(main); if (!lm || !lx || !tx) return null;
      const tags = new Set(['v_part', title.t]); npTags(lead, tags); planTags(main, tags);
      return finish(ctx, [lx, tx + ',', ...joinLa(lm)], (ch, reg) => {
        reg('dn', 2);
        const name = lead.N.it[0].sg;
        return (ch('dn') ? 'Con ' + name + ' come comandante' : 'Sotto il comando di ' + name) + ', ' + joinIt(itClause(main, ch, reg, { key: 'm' }));
      }, tags, 'Ablativo assoluto nominale: due nomi in ablativo, senza participio.');
    }
    // participio presente: «hostibus appropinquantibus»
    const vs = VERBS.filter((v) => ['appropinquo', 'venio'].includes(v.la) && T.has(v.e.t) && known(v.e));
    if (!vs.length) return null;
    const V = pick(vs);
    const s = pickNP(ctx, 'foe wild', { subj: true, noCity: true, filter: (N) => matches(N, V.s) && caseOK(N, 'abl') }); if (!s) return null;
    const main = clausePlan(ctx, { lite: true, tense: mainTense, noAdv: true, noPerson: true, noQ: true, verbFilter: (v) => ['fugio', 'timeo', 'propero', 'defendo', 'clamo', 'custodio'].includes(v.la), subjFilter: (N) => !N.tags.has('foe') && !N.tags.has('wild'), ex: [s.N.head] });
    if (!main) return null;
    const part = vform(V.e, { mood: 'part', tense: 'pres', c: 'abl', n: s.num, g: s.N.g }); if (!part) return null;
    const sx = laNP(s, 'abl'); const lm = laClause(main); if (!sx || !lm) return null;
    const tags = new Set(['v_part']); npTags(s, tags); planTags(main, tags); tags.add(V.e.t);
    return finish(ctx, [...sx.core, ...sx.gen, part + ',', ...joinLa(lm)], (ch, reg) => {
      const o = itNP(s, ch, reg);
      reg('pp', 2);
      const itv = V.its[0];
      const head = ch('pp') === 0 ? IT.cap(IT.gerundio(itv.inf)) + ' ' + itStr(o) : 'Mentre ' + itStr(o) + ' ' + IT.verb(itv.inf, mainTense === 'perf' ? 'impf' : 'pres', { p: o.n === 's' ? 2 : 5, g: o.g, n: o.n });
      return head + ', ' + joinIt(itClause(main, ch, reg, { key: 'm' }));
    }, tags, 'Ablativo assoluto con il participio presente: azione contemporanea, si rende con il gerundio.');
  }

  /* ---------- Scelta del costrutto ---------- */
  const BY_FOCUS = {
    v_pres: [[bBasic, { tense: 'pres' }], [bCoord, {}], [bBasic, { tense: 'pres', q: true }]],
    n1: [[bBasic, { topic: 'n1' }], [bCopula, { topic: 'n1', kind: 'adj' }], [bCoord, {}]],
    n2: [[bBasic, { topic: 'n2' }], [bCopula, { topic: 'n2', kind: 'adj' }]],
    n3: [[bBasic, { topic: 'n3' }], [bCopula, { topic: 'n3', kind: 'adj' }]],
    n45: [[bBasic, { topic: 'n45' }]],
    compl: [[bBasic, { forcePP: true }], [bCopula, { kind: 'exist' }], [bCopula, { kind: 'loc' }]],
    agg1: [[bBasic, { forceAdj: 'agg1' }], [bCopula, { kind: 'adj', forceAdj: 'agg1' }]],
    agg2: [[bBasic, { forceAdj: 'agg2' }], [bCopula, { kind: 'adj', forceAdj: 'agg2' }]],
    v_if: [[bBasic, {}], [bCoord, {}]],
    v_poss: [[bModal, { modal: 'v_poss' }], [bSumComp, {}]],
    v_imper: [[bImper, {}]],
    pron_pers: [[bBasic, { forcePoss: true }], [bBasic, { person: true }]],
    v_pass: [[bBasic, { voice: 'pass' }]],
    v_perf: [[bBasic, { tense: 'perf' }], [bBasic, { tense: 'perf', voice: 'pass' }]],
    pron_dim: [[bBasic, { forceDem: true }]],
    s_sub: [[bSub, {}]],
    pron_rel: [[bRel, {}]],
    comp: [[bComp, {}]],
    v_irr: [[bBasic, { forceIrr: true }], [bModal, { modal: 'v_irr' }]],
    v_dep: [[bBasic, { forceDep: true }], [bModal, { modal: 'v_dep' }]],
    v_part: [[bAbl, {}]],
    v_inf: [[bInf, {}]],
    v_cong: [[bUt, {}]],
    s_cum: [[bCum, {}]],
  };
  // o: { avoid, lex (Set di uid), maxNew, newOK(e), formOK(e, key), tenses, nums(N), infRel, lite, tries }
  function generate(selected, focus, o = {}) {
    if (!init()) return null;
    const T = new Set(selected);
    if (!T.has('v_pres')) return null;
    const topics = [...T];
    const avoid = new Set(o.avoid || []);
    const tries = o.tries || 60;
    for (let attempt = 0; attempt < tries; attempt++) {
      const f = focus && T.has(focus) && attempt < tries * 0.7 ? focus : pick(topics);
      const ctx = { T, focus: f, lex: o.lex || null, maxNew: o.maxNew || 0, newOK: o.newOK || null, formOK: o.formOK || null, tenses: o.tenses || null, nums: o.nums || null, infRel: o.infRel || null };
      CTX = ctx; TR = []; NEWS.clear();
      const list = BY_FOCUS[f] || [[bBasic, {}]];
      const [fn, opt] = pick(list);
      const op = { ...opt };
      if (o.lite) op.lite = true;
      if (op.person === true) op.person = pick([0, 1, 3, 4]);
      if (op.tense && op.tense === 'perf' && !T.has('v_perf')) delete op.tense;
      if (op.voice === 'pass' && !T.has('v_pass')) delete op.voice;
      let s = null;
      try { s = fn(ctx, op); } catch (e) { if (o.debug) throw e; s = null; }
      if (!s || avoid.has(s.la)) continue;
      s.focus = f;
      s.id = 'g' + hash(s.la);
      s.src = 'gen';
      CTX = { T: new Set() };
      return s;
    }
    CTX = { T: new Set() };
    return null;
  }
  function hash(str) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h).toString(36); }

  // generatore pseudo-casuale sostituibile (per i test riproducibili)
  function seed(fn) { rand = fn || Math.random; }
  root.VertoGen = { seed, init, generate, NOUNS, ADJS, VERBS, MODALS, SUMCOMP, SAYERS, ADV, _internal: { bBasic, bCoord, bCopula, bComp, bImper, bModal, bSumComp, bSub, bRel, bCum, bUt, bInf, bAbl } };
  if (typeof module !== 'undefined') module.exports = root.VertoGen;
})(typeof window !== 'undefined' ? window : globalThis);
