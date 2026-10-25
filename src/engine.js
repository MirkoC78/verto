/* VERTO — motore morfologico latino (biennio).
   Genera tutte le forme dal paradigma e costruisce un indice forma → analisi.
   Ogni analisi porta gli argomenti di programma necessari per riconoscerla (req).
   Il lessico e le desinenze sono scritti con le quantità (ā ē ī ō ū): ogni forma ha la grafia
   con le quantità (q) e quella scolastica senza segni (f), che è quella usata per riconoscere le parole.
   Chiavi delle forme: n:caso:numero · a:grado:caso:numero:genere · v:modo:tempo:diatesi:persona
   (infinito v:inf:tempo:diatesi, participio v:part:tempo:caso:numero:genere) · p:caso:numero:genere · i */
(function (root) {
  'use strict';

  const CASES = ['nom', 'gen', 'dat', 'acc', 'voc', 'abl'];
  const CASE_IT = { nom: 'nominativo', gen: 'genitivo', dat: 'dativo', acc: 'accusativo', voc: 'vocativo', abl: 'ablativo', loc: 'locativo' };
  const NUM_IT = { s: 'singolare', p: 'plurale' };
  const GEN_IT = { m: 'maschile', f: 'femminile', n: 'neutro' };
  const PERS = ['1ª pers. sing.', '2ª pers. sing.', '3ª pers. sing.', '1ª pers. plur.', '2ª pers. plur.', '3ª pers. plur.'];
  const TENSE_IT = { pres: 'presente', impf: 'imperfetto', fut: 'futuro semplice', perf: 'perfetto', ppf: 'piuccheperfetto', futant: 'futuro anteriore' };

  /* ---------- Grafia ---------- */
  const LONG = { 'ā': 'a', 'ē': 'e', 'ī': 'i', 'ō': 'o', 'ū': 'u', 'ȳ': 'y', 'Ā': 'A', 'Ē': 'E', 'Ī': 'I', 'Ō': 'O', 'Ū': 'U', 'Ȳ': 'Y', 'ă': 'a', 'ĕ': 'e', 'ĭ': 'i', 'ŏ': 'o', 'ŭ': 'u', 'Ă': 'A', 'Ĕ': 'E', 'Ĭ': 'I', 'Ŏ': 'O', 'Ŭ': 'U' };
  // toglie i segni di quantità lasciando invariata la lunghezza della stringa
  const plain = (s) => String(s).replace(/[āēīōūȳĀĒĪŌŪȲăĕĭŏŭĂĔĬŎŬ]/g, (c) => LONG[c]);
  function norm(w) {
    return String(w).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/j/g, 'i');
  }
  function syl(w) { return (norm(w).match(/ae|au|oe|[aeiouy]/g) || []).length; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  const isCons = (ch) => ch && !'aeiouy'.includes(ch);
  // le prove sulle desinenze si fanno sulla grafia senza segni; i temi si tagliano dalla grafia con le quantità
  const ends = (s, e) => plain(s).endsWith(e);

  /* ---------- Nomi ---------- */
  const D1 = { s: ['a', 'ae', 'ae', 'am', 'a', 'ā'], p: ['ae', 'ārum', 'īs', 'ās', 'ae', 'īs'] };
  const D2M = { s: ['us', 'ī', 'ō', 'um', 'e', 'ō'], p: ['ī', 'ōrum', 'īs', 'ōs', 'ī', 'īs'] };
  const D2N = { s: ['um', 'ī', 'ō', 'um', 'um', 'ō'], p: ['a', 'ōrum', 'īs', 'a', 'a', 'īs'] };
  const D4M = { s: ['us', 'ūs', 'uī', 'um', 'us', 'ū'], p: ['ūs', 'uum', 'ibus', 'ūs', 'ūs', 'ibus'] };
  const D4N = { s: ['ū', 'ūs', 'ū', 'ū', 'ū', 'ū'], p: ['ua', 'uum', 'ibus', 'ua', 'ua', 'ibus'] };
  const D5 = { s: ['ēs', 'eī', 'eī', 'em', 'ēs', 'ē'], p: ['ēs', 'ērum', 'ēbus', 'ēs', 'ēs', 'ēbus'] };
  const GP_UM = ['pater', 'mater', 'frater', 'iuvenis', 'canis', 'senex', 'accipiter', 'vates'];

  function nounInfo(e) {
    const { nom, gen } = e;
    if (e.pl) {
      if (ends(gen, 'arum')) return { d: 1, stem: gen.slice(0, -4) };
      if (ends(gen, 'orum')) return { d: 2, stem: gen.slice(0, -4) };
      if (ends(gen, 'uum')) return { d: 4, stem: gen.slice(0, -3) };
      if (ends(gen, 'ium')) return { d: 3, stem: gen.slice(0, -3), gp: 'ium' };
      return { d: 3, stem: gen.slice(0, -2), gp: 'um' };
    }
    if (ends(gen, 'ae')) return { d: 1, stem: gen.slice(0, -2) };
    if (ends(gen, 'ei') && ends(nom, 'es')) return { d: 5, stem: gen.slice(0, -2) };
    if (ends(gen, 'i')) return { d: 2, stem: gen.slice(0, -1) };
    if (ends(gen, 'us')) return { d: 4, stem: gen.slice(0, -2) };
    if (ends(gen, 'is')) return { d: 3, stem: gen.slice(0, -2) };
    throw new Error('Nome non riconosciuto: ' + nom);
  }

  function nounForms(e) {
    const inf = nounInfo(e);
    const { d, stem } = inf;
    const g = e.g;
    const out = []; // {f, c, n}
    const push = (f, c, n) => out.push({ f, c, n });
    let tab;
    if (d === 1) tab = D1;
    else if (d === 2) tab = g === 'n' ? D2N : D2M;
    else if (d === 4) tab = g === 'n' ? D4N : D4M;
    else if (d === 5) {
      // dopo vocale il genitivo e il dativo singolare sono in -ēī (diēī), dopo consonante in -eī (reī)
      tab = /[aeiou]$/.test(plain(stem)) ? { s: ['ēs', 'ēī', 'ēī', 'em', 'ēs', 'ē'], p: D5.p } : D5;
    }
    if (e.only) return { info: inf, forms: (e.extra || []).map((x) => ({ f: x.f, c: x.c, n: x.n })) };
    if (d === 3) {
      let gp = e.gp || inf.gp;
      const nomN = norm(e.nom);
      const neutI = g === 'n' && (/(e|al|ar)$/.test(nomN) || (e.pl && gp === 'ium'));
      if (!gp) {
        if (neutI) gp = 'ium';
        else if (GP_UM.includes(nomN)) gp = 'um';
        else if (g !== 'n' && syl(e.nom) === syl(e.gen) && /(is|es)$/.test(nomN)) gp = 'ium';
        else if (syl(e.nom) === 1 && /[sx]$/.test(nomN) && isCons(plain(stem).slice(-1)) && isCons(plain(stem).slice(-2, -1))) gp = 'ium';
        else gp = 'um';
      }
      const ablS = neutI ? 'ī' : 'e';
      const plN = neutI ? 'ia' : 'a';
      if (!e.pl) {
        if (g === 'n') {
          [e.nom, stem + 'is', stem + 'ī', e.nom, e.nom, stem + ablS].forEach((f, i) => push(f, CASES[i], 's'));
        } else {
          [e.nom, stem + 'is', stem + 'ī', stem + 'em', e.nom, stem + ablS].forEach((f, i) => push(f, CASES[i], 's'));
        }
        if (e.ablI) push(stem + 'ī', 'abl', 's');
      }
      if (!e.sg) {
        if (g === 'n') [stem + plN, stem + gp, stem + 'ibus', stem + plN, stem + plN, stem + 'ibus'].forEach((f, i) => push(f, CASES[i], 'p'));
        else [stem + 'ēs', stem + gp, stem + 'ibus', stem + 'ēs', stem + 'ēs', stem + 'ibus'].forEach((f, i) => push(f, CASES[i], 'p'));
      }
    } else {
      if (!e.pl) {
        tab.s.forEach((end, i) => {
          let f = stem + end;
          if (i === 0) f = e.nom;
          if (d === 2 && g !== 'n') {
            if (i === 4) {
              if (!ends(e.nom, 'us')) f = e.nom;
              // vocativo in -ī solo dove il lessico lo dichiara (fīlius e i nomi propri latini in -ius); gli altri in -ie: socie, nūntie
              else if (ends(e.nom, 'ius') && e.vocI) f = e.nom.slice(0, -3) + 'ī';
            }
          }
          if (d === 1 && i === 4 && !ends(e.nom, 'a')) f = stem + 'a';
          push(f, CASES[i], 's');
        });
      }
      if (!e.sg) tab.p.forEach((end, i) => push(stem + end, CASES[i], 'p'));
      if (e.abus && !e.sg) { push(stem + 'ābus', 'dat', 'p'); push(stem + 'ābus', 'abl', 'p'); }
    }
    if (e.extra) e.extra.forEach((x) => push(x.f, x.c, x.n));
    if (e.loc) push(e.loc, 'loc', e.pl ? 'p' : 's');
    const drop = (e.drop || []).map(plain);
    return { info: inf, forms: out.filter((x) => !drop.includes(plain(x.f))) };
  }

  /* ---------- Aggettivi ---------- */
  function adjInfo(a) {
    // a.parts = [m, f, n] oppure [m, gen] ecc.
    const [p1, p2, p3] = a.parts;
    if (p2 && ends(p2, 'a') && p3 && ends(p3, 'um')) return { cls: 1, stem: p2.slice(0, -1), m: p1 };
    if (p2 && ends(p2, 'is') && p3 && ends(p3, 'e')) return { cls: 2, kind: 3, stem: p3.slice(0, -1), m: p1, f: p2, n: p3 };
    if (p2 && ends(p2, 'e') && ends(p1, 'is')) return { cls: 2, kind: 2, stem: p1.slice(0, -2), m: p1, f: p1, n: p2 };
    if (p2 && ends(p2, 'is')) return { cls: 2, kind: 1, stem: p2.slice(0, -2), m: p1, f: p1, n: p1 };
    throw new Error('Aggettivo non riconosciuto: ' + a.parts.join(','));
  }

  // restituisce [{f,c,n,g}]
  function decl1Adj(mNom, stem, opts = {}) {
    const out = [];
    const pron = opts.pron;
    const mEnd = ends(mNom, 'us');
    D2M.s.forEach((end, i) => {
      let f = stem + end;
      if (i === 0) f = mNom;
      if (i === 4) f = mEnd ? (opts.vocMi ? 'mī' : stem + 'e') : mNom;
      if (pron && i === 1) f = stem + 'īus';
      if (pron && i === 2) f = stem + 'ī';
      out.push({ f, c: CASES[i], n: 's', g: 'm' });
    });
    D1.s.forEach((end, i) => {
      let f = stem + end;
      if (pron && i === 1) f = stem + 'īus';
      if (pron && i === 2) f = stem + 'ī';
      out.push({ f, c: CASES[i], n: 's', g: 'f' });
    });
    D2N.s.forEach((end, i) => {
      let f = stem + end;
      if (pron && i === 1) f = stem + 'īus';
      if (pron && i === 2) f = stem + 'ī';
      if (opts.neutD && (i === 0 || i === 3 || i === 4)) f = opts.neutD;
      out.push({ f, c: CASES[i], n: 's', g: 'n' });
    });
    D2M.p.forEach((end, i) => out.push({ f: stem + end, c: CASES[i], n: 'p', g: 'm' }));
    D1.p.forEach((end, i) => out.push({ f: stem + end, c: CASES[i], n: 'p', g: 'f' }));
    D2N.p.forEach((end, i) => out.push({ f: stem + end, c: CASES[i], n: 'p', g: 'n' }));
    if (pron) return out.filter((x) => x.c !== 'voc');
    return out;
  }

  function decl3Adj(nomM, nomF, nomN, stem, iStem = true, ablE = false) {
    const out = [];
    const abl = iStem && !ablE ? 'ī' : 'e';
    const gp = iStem ? 'ium' : 'um';
    const npl = iStem ? 'ia' : 'a';
    for (const [g, nom] of [['m', nomM], ['f', nomF]]) {
      [nom, stem + 'is', stem + 'ī', stem + 'em', nom, stem + abl].forEach((f, i) => out.push({ f, c: CASES[i], n: 's', g }));
      if (ablE && iStem) out.push({ f: stem + 'ī', c: 'abl', n: 's', g });
      [stem + 'ēs', stem + gp, stem + 'ibus', stem + 'ēs', stem + 'ēs', stem + 'ibus'].forEach((f, i) => out.push({ f, c: CASES[i], n: 'p', g }));
    }
    [nomN, stem + 'is', stem + 'ī', nomN, nomN, stem + abl].forEach((f, i) => out.push({ f, c: CASES[i], n: 's', g: 'n' }));
    if (ablE && iStem) out.push({ f: stem + 'ī', c: 'abl', n: 's', g: 'n' });
    [stem + npl, stem + gp, stem + 'ibus', stem + npl, stem + npl, stem + 'ibus'].forEach((f, i) => out.push({ f, c: CASES[i], n: 'p', g: 'n' }));
    return out;
  }

  // comparativo: maschile e femminile in -ior, neutro in -ius, tema obliquo in -iōr- (altior, altius, altiōris)
  function comparativeForms(m, n, st) {
    const out = [];
    for (const g of ['m', 'f']) {
      [m, st + 'is', st + 'ī', st + 'em', m, st + 'e'].forEach((f, i) => out.push({ f, c: CASES[i], n: 's', g }));
      [st + 'ēs', st + 'um', st + 'ibus', st + 'ēs', st + 'ēs', st + 'ibus'].forEach((f, i) => out.push({ f, c: CASES[i], n: 'p', g }));
    }
    [n, st + 'is', st + 'ī', n, n, st + 'e'].forEach((f, i) => out.push({ f, c: CASES[i], n: 's', g: 'n' }));
    [st + 'a', st + 'um', st + 'ibus', st + 'a', st + 'a', st + 'ibus'].forEach((f, i) => out.push({ f, c: CASES[i], n: 'p', g: 'n' }));
    return out;
  }

  // irregolari: [maschile, neutro, tema obliquo, superlativo]
  const COMP_IRR = {
    bonus: ['melior', 'melius', 'meliōr', 'optimus'], malus: ['pēior', 'pēius', 'pēiōr', 'pessimus'], magnus: ['māior', 'māius', 'māiōr', 'maximus'],
    parvus: ['minor', 'minus', 'minōr', 'minimus'], multus: [null, null, null, 'plūrimus'],
  };
  const ILLIMUS = ['facilis', 'difficilis', 'similis', 'dissimilis', 'humilis', 'gracilis'];

  function adjForms(a) {
    const info = adjInfo(a);
    let pos;
    if (info.cls === 1) pos = decl1Adj(info.m, info.stem, { pron: a.pron, vocMi: a.vocMi, neutD: a.neutD });
    else pos = decl3Adj(info.m, info.f, info.n, info.stem, !a.cons, false);
    if (a.extra) a.extra.forEach((x) => pos.push(x));
    const res = pos.map((x) => ({ ...x, deg: 'pos' }));
    if (!a.nocomp && !a.pron) {
      const irr = COMP_IRR[norm(info.m)];
      let sup;
      if (irr) {
        sup = irr[3];
        if (irr[0]) comparativeForms(irr[0], irr[1], irr[2]).forEach((x) => res.push({ ...x, deg: 'comp' }));
      } else {
        const st = info.stem;
        if (norm(info.m).endsWith('er')) sup = info.m + 'rimus';
        else if (ILLIMUS.includes(norm(info.m))) sup = st + 'limus';
        else sup = st + 'issimus';
        comparativeForms(st + 'ior', st + 'ius', st + 'iōr').forEach((x) => res.push({ ...x, deg: 'comp' }));
      }
      if (norm(info.m) === 'multus') {
        [['plūs', 'nom', 's', 'n'], ['plūris', 'gen', 's', 'n'], ['plūs', 'acc', 's', 'n'], ['plūre', 'abl', 's', 'n']].forEach(([f, c, n, g]) => res.push({ f, c, n, g, deg: 'comp' }));
        for (const g of ['m', 'f']) [['plūrēs', 'nom'], ['plūrium', 'gen'], ['plūribus', 'dat'], ['plūrēs', 'acc'], ['plūribus', 'abl']].forEach(([f, c]) => res.push({ f, c, n: 'p', g, deg: 'comp' }));
        [['plūra', 'nom'], ['plūrium', 'gen'], ['plūribus', 'dat'], ['plūra', 'acc'], ['plūribus', 'abl']].forEach(([f, c]) => res.push({ f, c, n: 'p', g: 'n', deg: 'comp' }));
      }
      decl1Adj(sup, sup.slice(0, -2)).forEach((x) => res.push({ ...x, deg: 'sup' }));
    }
    return { info, forms: res };
  }

  /* ---------- Verbi ---------- */
  const PRES_ACT = { 1: ['ō', 'ās', 'at', 'āmus', 'ātis', 'ant'], 2: ['eō', 'ēs', 'et', 'ēmus', 'ētis', 'ent'], 3: ['ō', 'is', 'it', 'imus', 'itis', 'unt'], 4: ['iō', 'īs', 'it', 'īmus', 'ītis', 'iunt'], 5: ['iō', 'is', 'it', 'imus', 'itis', 'iunt'] };
  const PRES_PASS = { 1: ['or', 'āris', 'ātur', 'āmur', 'āminī', 'antur'], 2: ['eor', 'ēris', 'ētur', 'ēmur', 'ēminī', 'entur'], 3: ['or', 'eris', 'itur', 'imur', 'iminī', 'untur'], 4: ['ior', 'īris', 'ītur', 'īmur', 'īminī', 'iuntur'], 5: ['ior', 'eris', 'itur', 'imur', 'iminī', 'iuntur'] };
  const IMPF_V = { 1: 'ā', 2: 'ē', 3: 'ē', 4: 'iē', 5: 'iē' };
  const BA_ACT = ['bam', 'bās', 'bat', 'bāmus', 'bātis', 'bant'];
  const BA_PASS = ['bar', 'bāris', 'bātur', 'bāmur', 'bāminī', 'bantur'];
  const FUT_ACT = { 1: ['ābō', 'ābis', 'ābit', 'ābimus', 'ābitis', 'ābunt'], 2: ['ēbō', 'ēbis', 'ēbit', 'ēbimus', 'ēbitis', 'ēbunt'], 3: ['am', 'ēs', 'et', 'ēmus', 'ētis', 'ent'], 4: ['iam', 'iēs', 'iet', 'iēmus', 'iētis', 'ient'], 5: ['iam', 'iēs', 'iet', 'iēmus', 'iētis', 'ient'] };
  const FUT_PASS = { 1: ['ābor', 'āberis', 'ābitur', 'ābimur', 'ābiminī', 'ābuntur'], 2: ['ēbor', 'ēberis', 'ēbitur', 'ēbimur', 'ēbiminī', 'ēbuntur'], 3: ['ar', 'ēris', 'ētur', 'ēmur', 'ēminī', 'entur'], 4: ['iar', 'iēris', 'iētur', 'iēmur', 'iēminī', 'ientur'], 5: ['iar', 'iēris', 'iētur', 'iēmur', 'iēminī', 'ientur'] };
  // congiuntivo presente: vocale breve davanti a -m, -t, -nt, -r; lunga altrove (amem, amēs, amet)
  const SUBJ_S = { 1: 'e', 2: 'ea', 3: 'a', 4: 'ia', 5: 'ia' };
  const SUBJ_L = { 1: 'ē', 2: 'eā', 3: 'ā', 4: 'iā', 5: 'iā' };
  const subjAct = (k) => [SUBJ_S[k] + 'm', SUBJ_L[k] + 's', SUBJ_S[k] + 't', SUBJ_L[k] + 'mus', SUBJ_L[k] + 'tis', SUBJ_S[k] + 'nt'];
  const subjPass = (k) => [SUBJ_S[k] + 'r', SUBJ_L[k] + 'ris', SUBJ_L[k] + 'tur', SUBJ_L[k] + 'mur', SUBJ_L[k] + 'minī', SUBJ_S[k] + 'ntur'];
  // congiuntivo imperfetto: infinito senza la -e finale + desinenze (amār-em, amār-ēs)
  const SIMPF_ACT = ['em', 'ēs', 'et', 'ēmus', 'ētis', 'ent'];
  const SIMPF_PASS = ['er', 'ēris', 'ētur', 'ēmur', 'ēminī', 'entur'];
  const IMPER = { 1: ['ā', 'āte'], 2: ['ē', 'ēte'], 3: ['e', 'ite'], 4: ['ī', 'īte'], 5: ['e', 'ite'] };
  const IMPER_P = { 1: ['āre', 'āminī'], 2: ['ēre', 'ēminī'], 3: ['ere', 'iminī'], 4: ['īre', 'īminī'], 5: ['ere', 'iminī'] };
  const INF_PASS = { 1: 'ārī', 2: 'ērī', 3: 'ī', 4: 'īrī', 5: 'ī' };
  const INF_ACT = { 1: 'āre', 2: 'ēre', 3: 'ere', 4: 'īre', 5: 'ere' };
  const PART_PRES = { 1: ['āns', 'ant'], 2: ['ēns', 'ent'], 3: ['ēns', 'ent'], 4: ['iēns', 'ient'], 5: ['iēns', 'ient'] };
  const PERF_E = ['ī', 'istī', 'it', 'imus', 'istis', 'ērunt'];
  const PPF_E = ['eram', 'erās', 'erat', 'erāmus', 'erātis', 'erant'];
  const FUTANT_E = ['erō', 'eris', 'erit', 'erimus', 'eritis', 'erint'];
  const SPERF_E = ['erim', 'erīs', 'erit', 'erīmus', 'erītis', 'erint'];
  const SPPF_E = ['issem', 'issēs', 'isset', 'issēmus', 'issētis', 'issent'];

  function conjOf(pres, inf) {
    if (ends(inf, 'are')) return 1;
    if (ends(inf, 'ire')) return 4;
    if (ends(pres, 'eo')) return 2;
    if (ends(pres, 'io')) return 5;
    return 3;
  }
  function depConjOf(pres, inf) {
    if (ends(inf, 'ari')) return [1, inf.slice(0, -3)];
    if (ends(inf, 'eri') && ends(pres, 'eor')) return [2, inf.slice(0, -3)];
    if (ends(inf, 'iri')) return [4, inf.slice(0, -3)];
    if (ends(pres, 'ior')) return [5, inf.slice(0, -1)];
    return [3, inf.slice(0, -1)];
  }

  // costruttore di forme verbali: aggiunge gli argomenti necessari a riconoscerle
  function VF(list, base) {
    return function add(f, mood, tense, voice, p, extraReq, extra) {
      if (!f) return;
      const req = new Set([base]);
      if (mood === 'ind' && (tense === 'impf' || tense === 'fut')) req.add('v_if');
      if (['perf', 'ppf', 'futant'].includes(tense)) req.add('v_perf');
      if (mood === 'cong') req.add('v_cong');
      if (mood === 'imp') req.add('v_imper');
      if (voice === 'pass' && base !== 'v_dep') req.add('v_pass');
      (extraReq || []).forEach((r) => req.add(r));
      list.push({ f, mood, tense, voice: voice || 'act', p, req: [...req], ...(extra || {}) });
    };
  }

  function participleDecl(add, nom, stem, kind) {
    // kind: 'pres' (amāns, amantis), 'perf', 'fut'
    if (kind === 'pres') {
      decl3Adj(nom, nom, nom, stem, true, true).forEach((x) => add(x.f, 'part', 'pres', null, null, ['v_part'], { c: x.c, n: x.n, g: x.g }));
    } else {
      const st = nom.slice(0, -2);
      decl1Adj(nom, st).forEach((x) => {
        if (x.c === 'voc') return;
        const req = kind === 'perf' && (x.c === 'nom') ? ['v_perf'] : ['v_part'];
        add(x.f, 'part', kind, null, null, req, { c: x.c, n: x.n, g: x.g });
      });
    }
  }

  function regularVerbForms(v) {
    const list = [];
    const base = v.t || 'v_pres';
    const add = VF(list, base);
    const k = conjOf(v.pres, v.inf);
    const R = v.inf.slice(0, -3);
    const SI = v.inf.slice(0, -1);
    PRES_ACT[k].forEach((e, i) => add(i === 0 ? v.pres : R + e, 'ind', 'pres', 'act', i));
    BA_ACT.forEach((e, i) => add(R + IMPF_V[k] + e, 'ind', 'impf', 'act', i));
    FUT_ACT[k].forEach((e, i) => add(R + e, 'ind', 'fut', 'act', i));
    add(v.imp || R + IMPER[k][0], 'imp', 'pres', 'act', 1);
    add(R + IMPER[k][1], 'imp', 'pres', 'act', 4);
    add(v.inf, 'inf', 'pres', 'act', null);
    subjAct(k).forEach((e, i) => add(R + e, 'cong', 'pres', 'act', i));
    SIMPF_ACT.forEach((e, i) => add(SI + e, 'cong', 'impf', 'act', i));
    if (!v.intr) {
      PRES_PASS[k].forEach((e, i) => add(R + e, 'ind', 'pres', 'pass', i));
      BA_PASS.forEach((e, i) => add(R + IMPF_V[k] + e, 'ind', 'impf', 'pass', i));
      FUT_PASS[k].forEach((e, i) => add(R + e, 'ind', 'fut', 'pass', i));
      add(R + INF_PASS[k], 'inf', 'pres', 'pass', null);
      subjPass(k).forEach((e, i) => add(R + e, 'cong', 'pres', 'pass', i));
      SIMPF_PASS.forEach((e, i) => add(SI + e, 'cong', 'impf', 'pass', i));
    }
    const [ps, pt] = PART_PRES[k];
    participleDecl(add, R + ps, R + pt, 'pres');
    perfectSystem(add, v);
    // dō ha la a breve fuori da dās e dā (damus, dabam, dare)
    if (v.shortA) list.forEach((x) => { if (!['dās', 'dā'].includes(x.f)) x.f = x.f.replace(/^dā/, 'da'); });
    return { conj: k, forms: list };
  }

  function perfectSystem(add, v) {
    if (v.perf && v.perf !== '-') {
      const P = v.perf.slice(0, -1);
      PERF_E.forEach((e, i) => add(P + e, 'ind', 'perf', 'act', i));
      add(P + 'ēre', 'ind', 'perf', 'act', 5);
      PPF_E.forEach((e, i) => add(P + e, 'ind', 'ppf', 'act', i));
      FUTANT_E.forEach((e, i) => add(P + e, 'ind', 'futant', 'act', i));
      SPERF_E.forEach((e, i) => add(P + e, 'cong', 'perf', 'act', i));
      SPPF_E.forEach((e, i) => add(P + e, 'cong', 'ppf', 'act', i));
      add(P + 'isse', 'inf', 'perf', 'act', null, ['v_inf']);
    }
    if (v.sup && v.sup !== '-') {
      const S = v.sup.slice(0, -2);
      if (!v.intr) participleDecl(add, S + 'us', null, 'perf');
      participleDecl(add, v.fp || S + 'ūrus', null, 'fut');
    }
  }

  function deponentForms(v) {
    const list = [];
    const base = 'v_dep';
    const add = VF(list, base);
    let [k, R] = depConjOf(v.pres, v.inf);
    if (v.mix) k = +v.mix; // orior: presente come la mista, infinito in -īrī
    const virt = R + INF_ACT[k].slice(0, -1);
    PRES_PASS[k].forEach((e, i) => add(i === 0 ? v.pres : R + e, 'ind', 'pres', 'dep', i));
    BA_PASS.forEach((e, i) => add(R + IMPF_V[k] + e, 'ind', 'impf', 'dep', i));
    FUT_PASS[k].forEach((e, i) => add(R + e, 'ind', 'fut', 'dep', i));
    add(v.inf, 'inf', 'pres', 'dep', null);
    add(R + IMPER_P[k][0], 'imp', 'pres', 'dep', 1);
    add(R + IMPER_P[k][1], 'imp', 'pres', 'dep', 4);
    subjPass(k).forEach((e, i) => add(R + e, 'cong', 'pres', 'dep', i));
    SIMPF_PASS.forEach((e, i) => add(virt + e, 'cong', 'impf', 'dep', i));
    const [ps, pt] = PART_PRES[k];
    participleDecl(add, R + ps, R + pt, 'pres');
    participleDecl(add, v.part, null, 'perf');
    participleDecl(add, v.fp || v.part.slice(0, -2) + 'ūrus', null, 'fut');
    return { conj: k, forms: list };
  }

  function semiDepForms(v) {
    // audeō, ausus sum: presente attivo, perfetto con il participio
    const list = [];
    const add = VF(list, 'v_dep');
    const k = conjOf(v.pres, v.inf);
    const R = v.inf.slice(0, -3);
    const SI = v.inf.slice(0, -1);
    PRES_ACT[k].forEach((e, i) => add(R + e, 'ind', 'pres', 'act', i));
    BA_ACT.forEach((e, i) => add(R + IMPF_V[k] + e, 'ind', 'impf', 'act', i));
    FUT_ACT[k].forEach((e, i) => add(R + e, 'ind', 'fut', 'act', i));
    add(v.inf, 'inf', 'pres', 'act', null);
    subjAct(k).forEach((e, i) => add(R + e, 'cong', 'pres', 'act', i));
    SIMPF_ACT.forEach((e, i) => add(SI + e, 'cong', 'impf', 'act', i));
    const [ps, pt] = PART_PRES[k];
    participleDecl(add, R + ps, R + pt, 'pres');
    participleDecl(add, v.part, null, 'perf');
    return { conj: k, forms: list };
  }

  /* Verbi irregolari */
  const SUM = {
    'ind.pres': ['sum', 'es', 'est', 'sumus', 'estis', 'sunt'],
    'ind.impf': ['eram', 'erās', 'erat', 'erāmus', 'erātis', 'erant'],
    'ind.fut': ['erō', 'eris', 'erit', 'erimus', 'eritis', 'erunt'],
    'cong.pres': ['sim', 'sīs', 'sit', 'sīmus', 'sītis', 'sint'],
    'cong.impf': ['essem', 'essēs', 'esset', 'essēmus', 'essētis', 'essent'],
  };
  function irregularTable(add, T) {
    for (const key in T) {
      const [mood, tense] = key.split('.');
      const voice = key.split('.')[2] || 'act';
      T[key].forEach((f, i) => { if (f) add(f, mood, tense, voice, i); });
    }
  }
  function perfFrom(add, perf, voice = 'act') {
    const P = perf.slice(0, -1);
    PERF_E.forEach((e, i) => add(P + e, 'ind', 'perf', voice, i));
    PPF_E.forEach((e, i) => add(P + e, 'ind', 'ppf', voice, i));
    FUTANT_E.forEach((e, i) => add(P + e, 'ind', 'futant', voice, i));
    SPERF_E.forEach((e, i) => add(P + e, 'cong', 'perf', voice, i));
    SPPF_E.forEach((e, i) => add(P + e, 'cong', 'ppf', voice, i));
    add(P + 'isse', 'inf', 'perf', voice, null, ['v_inf']);
  }

  function sumForms(prefix = '', perfPre = '', base = 'v_pres', prod = false) {
    const list = [];
    const add = VF(list, base);
    const pf = (f) => {
      if (!prefix) return f;
      if (prod && /^e/.test(f)) return prefix + 'd' + f; // prōd-est
      return prefix + f;
    };
    for (const key in SUM) {
      const [mood, tense] = key.split('.');
      SUM[key].forEach((f, i) => add(pf(f), mood, tense, null, i));
    }
    add(pf('esse'), 'inf', 'pres', null, null);
    add(pf('es'), 'imp', 'pres', null, 1);
    add(pf('este'), 'imp', 'pres', null, 4);
    perfFrom(add, (prefix ? perfPre : '') + 'fuī', null);
    if (!prefix) {
      participleDecl(add, 'futūrus', null, 'fut');
      add('fore', 'inf', 'fut', null, null, ['v_inf']);
    } else if (prefix === 'ab') {
      participleDecl(add, 'absēns', 'absent', 'pres');
    } else if (prefix === 'prae') {
      participleDecl(add, 'praesēns', 'praesent', 'pres');
    }
    return list;
  }

  function possumForms() {
    const list = [];
    const add = VF(list, 'v_poss');
    for (const key in SUM) {
      const [mood, tense] = key.split('.');
      SUM[key].forEach((f, i) => add((/^s/.test(f) ? 'pos' : 'pot') + f, mood, tense, null, i));
    }
    add('posse', 'inf', 'pres', null, null);
    perfFrom(add, 'potuī', null);
    // pot + essem → possem
    return list.map((x) => ({ ...x, f: x.f.replace(/^potess/, 'poss') }));
  }

  function eoForms(prefix = '', base = 'v_irr') {
    const list = [];
    const add = VF(list, base);
    const p = (f) => prefix + f;
    const T = {
      'ind.pres': ['eō', 'īs', 'it', 'īmus', 'ītis', 'eunt'],
      'ind.impf': ['ībam', 'ībās', 'ībat', 'ībāmus', 'ībātis', 'ībant'],
      'ind.fut': ['ībō', 'ībis', 'ībit', 'ībimus', 'ībitis', 'ībunt'],
      'ind.perf': ['iī', 'īstī', 'iit', 'iimus', 'īstis', 'iērunt'],
      'ind.ppf': ['ieram', 'ierās', 'ierat', 'ierāmus', 'ierātis', 'ierant'],
      'ind.futant': ['ierō', 'ieris', 'ierit', 'ierimus', 'ieritis', 'ierint'],
      'cong.pres': ['eam', 'eās', 'eat', 'eāmus', 'eātis', 'eant'],
      'cong.impf': ['īrem', 'īrēs', 'īret', 'īrēmus', 'īrētis', 'īrent'],
      'cong.perf': ['ierim', 'ierīs', 'ierit', 'ierīmus', 'ierītis', 'ierint'],
      'cong.ppf': ['īssem', 'īssēs', 'īsset', 'īssēmus', 'īssētis', 'īssent'],
    };
    for (const key in T) {
      const [mood, tense] = key.split('.');
      T[key].forEach((f, i) => add(p(f), mood, tense, null, i));
    }
    if (!prefix) ['īvī', 'īvistī', 'īvit', 'īvimus', 'īvistis', 'īvērunt'].forEach((f, i) => add(f, 'ind', 'perf', null, i));
    add(p('īre'), 'inf', 'pres', null, null);
    add(p('īsse'), 'inf', 'perf', null, null, ['v_inf']);
    add(p('ī'), 'imp', 'pres', null, 1);
    add(p('īte'), 'imp', 'pres', null, 4);
    // participio presente iēns, euntis
    decl3Adj(p('iēns'), p('iēns'), p('iēns'), p('eunt'), true, true).forEach((x) => add(x.f, 'part', 'pres', null, null, ['v_part'], { c: x.c, n: x.n, g: x.g }));
    participleDecl(add, p('itūrus'), null, 'fut');
    return list;
  }

  function feroForms(prefix = '', perf = 'tulī', sup = 'lātum', base = 'v_irr') {
    const list = [];
    const add = VF(list, base);
    const p = (f) => prefix + f;
    const T = {
      'ind.pres': ['ferō', 'fers', 'fert', 'ferimus', 'fertis', 'ferunt'],
      'ind.impf': ['ferēbam', 'ferēbās', 'ferēbat', 'ferēbāmus', 'ferēbātis', 'ferēbant'],
      'ind.fut': ['feram', 'ferēs', 'feret', 'ferēmus', 'ferētis', 'ferent'],
      'cong.pres': ['feram', 'ferās', 'ferat', 'ferāmus', 'ferātis', 'ferant'],
      'cong.impf': ['ferrem', 'ferrēs', 'ferret', 'ferrēmus', 'ferrētis', 'ferrent'],
      'ind.pres.pass': ['feror', 'ferris', 'fertur', 'ferimur', 'feriminī', 'feruntur'],
      'ind.impf.pass': ['ferēbar', 'ferēbāris', 'ferēbātur', 'ferēbāmur', 'ferēbāminī', 'ferēbantur'],
      'ind.fut.pass': ['ferar', 'ferēris', 'ferētur', 'ferēmur', 'ferēminī', 'ferentur'],
      'cong.pres.pass': ['ferar', 'ferāris', 'ferātur', 'ferāmur', 'ferāminī', 'ferantur'],
      'cong.impf.pass': ['ferrer', 'ferrēris', 'ferrētur', 'ferrēmur', 'ferrēminī', 'ferrentur'],
    };
    for (const key in T) {
      const [mood, tense, voice] = key.split('.');
      T[key].forEach((f, i) => add(p(f), mood, tense, voice || 'act', i));
    }
    add(p('ferre'), 'inf', 'pres', 'act', null);
    add(p('ferrī'), 'inf', 'pres', 'pass', null);
    add(p('fer'), 'imp', 'pres', 'act', 1);
    add(p('ferte'), 'imp', 'pres', 'act', 4);
    participleDecl(add, p('ferēns'), p('ferent'), 'pres');
    perfectSystem(add, { perf, sup });
    return list;
  }

  function voloForms(which) {
    const list = [];
    const add = VF(list, 'v_irr');
    const T = {
      volo: {
        'ind.pres': ['volō', 'vīs', 'vult', 'volumus', 'vultis', 'volunt'],
        'ind.impf': ['volēbam', 'volēbās', 'volēbat', 'volēbāmus', 'volēbātis', 'volēbant'],
        'ind.fut': ['volam', 'volēs', 'volet', 'volēmus', 'volētis', 'volent'],
        'cong.pres': ['velim', 'velīs', 'velit', 'velīmus', 'velītis', 'velint'],
        'cong.impf': ['vellem', 'vellēs', 'vellet', 'vellēmus', 'vellētis', 'vellent'],
      },
      nolo: {
        'ind.pres': ['nōlō', null, null, 'nōlumus', null, 'nōlunt'],
        'ind.impf': ['nōlēbam', 'nōlēbās', 'nōlēbat', 'nōlēbāmus', 'nōlēbātis', 'nōlēbant'],
        'ind.fut': ['nōlam', 'nōlēs', 'nōlet', 'nōlēmus', 'nōlētis', 'nōlent'],
        'cong.pres': ['nōlim', 'nōlīs', 'nōlit', 'nōlīmus', 'nōlītis', 'nōlint'],
        'cong.impf': ['nōllem', 'nōllēs', 'nōllet', 'nōllēmus', 'nōllētis', 'nōllent'],
      },
      malo: {
        'ind.pres': ['mālō', 'māvīs', 'māvult', 'mālumus', 'māvultis', 'mālunt'],
        'ind.impf': ['mālēbam', 'mālēbās', 'mālēbat', 'mālēbāmus', 'mālēbātis', 'mālēbant'],
        'ind.fut': ['mālam', 'mālēs', 'mālet', 'mālēmus', 'mālētis', 'mālent'],
        'cong.pres': ['mālim', 'mālīs', 'mālit', 'mālīmus', 'mālītis', 'mālint'],
        'cong.impf': ['māllem', 'māllēs', 'māllet', 'māllēmus', 'māllētis', 'māllent'],
      },
    }[which];
    for (const key in T) { const [mood, tense] = key.split('.'); T[key].forEach((f, i) => { if (f) add(f, mood, tense, null, i); }); }
    add({ volo: 'velle', nolo: 'nōlle', malo: 'mālle' }[which], 'inf', 'pres', null, null);
    perfFrom(add, { volo: 'voluī', nolo: 'nōluī', malo: 'māluī' }[which], null);
    if (which === 'nolo') { add('nōlī', 'imp', 'pres', null, 1); add('nōlīte', 'imp', 'pres', null, 4); }
    if (which !== 'malo') participleDecl(add, which === 'volo' ? 'volēns' : 'nōlēns', which === 'volo' ? 'volent' : 'nōlent', 'pres');
    return list;
  }

  function fioForms() {
    const list = [];
    const add = VF(list, 'v_irr');
    irregularTable(add, {
      'ind.pres': ['fīō', 'fīs', 'fit', 'fīmus', 'fītis', 'fīunt'],
      'ind.impf': ['fīēbam', 'fīēbās', 'fīēbat', 'fīēbāmus', 'fīēbātis', 'fīēbant'],
      'ind.fut': ['fīam', 'fīēs', 'fīet', 'fīēmus', 'fīētis', 'fīent'],
      'cong.pres': ['fīam', 'fīās', 'fīat', 'fīāmus', 'fīātis', 'fīant'],
      'cong.impf': ['fierem', 'fierēs', 'fieret', 'fierēmus', 'fierētis', 'fierent'],
    });
    add('fierī', 'inf', 'pres', 'act', null);
    return list;
  }

  /* ---------- Pronomi ---------- */
  // tabelle: [g][n] = 6 forme (nom, gen, dat, acc, voc, abl); null = manca; | separa le varianti
  const PRON = {
    is: {
      m: { s: ['is', 'eius', 'eī', 'eum', null, 'eō'], p: ['eī|iī', 'eōrum', 'eīs|iīs', 'eōs', null, 'eīs|iīs'] },
      f: { s: ['ea', 'eius', 'eī', 'eam', null, 'eā'], p: ['eae', 'eārum', 'eīs|iīs', 'eās', null, 'eīs|iīs'] },
      n: { s: ['id', 'eius', 'eī', 'id', null, 'eō'], p: ['ea', 'eōrum', 'eīs|iīs', 'ea', null, 'eīs|iīs'] },
    },
    hic: {
      m: { s: ['hic', 'huius', 'huic', 'hunc', null, 'hōc'], p: ['hī', 'hōrum', 'hīs', 'hōs', null, 'hīs'] },
      f: { s: ['haec', 'huius', 'huic', 'hanc', null, 'hāc'], p: ['hae', 'hārum', 'hīs', 'hās', null, 'hīs'] },
      n: { s: ['hoc', 'huius', 'huic', 'hoc', null, 'hōc'], p: ['haec', 'hōrum', 'hīs', 'haec', null, 'hīs'] },
    },
    idem: {
      m: { s: ['īdem', 'eiusdem', 'eīdem', 'eundem', null, 'eōdem'], p: ['eīdem|iīdem|īdem', 'eōrundem', 'eīsdem|īsdem', 'eōsdem', null, 'eīsdem|īsdem'] },
      f: { s: ['eadem', 'eiusdem', 'eīdem', 'eandem', null, 'eādem'], p: ['eaedem', 'eārundem', 'eīsdem|īsdem', 'eāsdem', null, 'eīsdem|īsdem'] },
      n: { s: ['idem', 'eiusdem', 'eīdem', 'idem', null, 'eōdem'], p: ['eadem', 'eōrundem', 'eīsdem|īsdem', 'eadem', null, 'eīsdem|īsdem'] },
    },
    qui: {
      m: { s: ['quī', 'cuius', 'cui', 'quem', null, 'quō'], p: ['quī', 'quōrum', 'quibus', 'quōs', null, 'quibus'] },
      f: { s: ['quae', 'cuius', 'cui', 'quam', null, 'quā'], p: ['quae', 'quārum', 'quibus', 'quās', null, 'quibus'] },
      n: { s: ['quod', 'cuius', 'cui', 'quod', null, 'quō'], p: ['quae', 'quōrum', 'quibus', 'quae', null, 'quibus'] },
    },
    quis: {
      m: { s: ['quis', 'cuius', 'cui', 'quem', null, 'quō'], p: ['quī', 'quōrum', 'quibus', 'quōs', null, 'quibus'] },
      n: { s: ['quid', 'cuius', 'cui', 'quid', null, 'quō'], p: ['quae', 'quōrum', 'quibus', 'quae', null, 'quibus'] },
    },
    duo: {
      m: { p: ['duo', 'duōrum', 'duōbus', 'duōs|duo', null, 'duōbus'] },
      f: { p: ['duae', 'duārum', 'duābus', 'duās', null, 'duābus'] },
      n: { p: ['duo', 'duōrum', 'duōbus', 'duo', null, 'duōbus'] },
    },
    tres: {
      m: { p: ['trēs', 'trium', 'tribus', 'trēs', null, 'tribus'] },
      f: { p: ['trēs', 'trium', 'tribus', 'trēs', null, 'tribus'] },
      n: { p: ['tria', 'trium', 'tribus', 'tria', null, 'tribus'] },
    },
    nemo: { m: { s: ['nēmō', 'nūllīus', 'nēminī', 'nēminem', null, 'nūllō'] } },
  };
  function illeTable(st, nEnd, mNom) {
    return {
      m: { s: [mNom, st + 'īus', st + 'ī', st + 'um', null, st + 'ō'], p: [st + 'ī', st + 'ōrum', st + 'īs', st + 'ōs', null, st + 'īs'] },
      f: { s: [st + 'a', st + 'īus', st + 'ī', st + 'am', null, st + 'ā'], p: [st + 'ae', st + 'ārum', st + 'īs', st + 'ās', null, st + 'īs'] },
      n: { s: [st + nEnd, st + 'īus', st + 'ī', st + nEnd, null, st + 'ō'], p: [st + 'a', st + 'ōrum', st + 'īs', st + 'a', null, st + 'īs'] },
    };
  }
  PRON.ille = illeTable('ill', 'ud', 'ille');
  PRON.iste = illeTable('ist', 'ud', 'iste');
  PRON.ipse = illeTable('ips', 'um', 'ipse');

  const PERSONAL = {
    ego: [['ego', 'nom', 's'], ['meī', 'gen', 's'], ['mihi', 'dat', 's'], ['mē', 'acc', 's'], ['mē', 'abl', 's'], ['nōs', 'nom', 'p'], ['nostrī', 'gen', 'p'], ['nostrum', 'gen', 'p'], ['nōbīs', 'dat', 'p'], ['nōs', 'acc', 'p'], ['nōbīs', 'abl', 'p'], ['mēcum', 'abl', 's', 'con me'], ['nōbīscum', 'abl', 'p', 'con noi']],
    tu: [['tū', 'nom', 's'], ['tuī', 'gen', 's'], ['tibi', 'dat', 's'], ['tē', 'acc', 's'], ['tū', 'voc', 's'], ['tē', 'abl', 's'], ['vōs', 'nom', 'p'], ['vestrī', 'gen', 'p'], ['vestrum', 'gen', 'p'], ['vōbīs', 'dat', 'p'], ['vōs', 'acc', 'p'], ['vōs', 'voc', 'p'], ['vōbīs', 'abl', 'p'], ['tēcum', 'abl', 's', 'con te'], ['vōbīscum', 'abl', 'p', 'con voi']],
    se: [['suī', 'gen', null], ['sibi', 'dat', null], ['sē', 'acc', null], ['sēsē', 'acc', null], ['sē', 'abl', null], ['sēcum', 'abl', null, 'con sé']],
  };

  function pronounForms(e) {
    const out = [];
    const key = e.lemmaKey;
    if (PERSONAL[key]) {
      PERSONAL[key].forEach(([f, c, n, note]) => out.push({ f, c, n, note }));
      return out;
    }
    const T = PRON[key];
    if (!T) return out;
    for (const g in T) for (const n in T[g]) T[g][n].forEach((cell, i) => {
      if (!cell) return;
      cell.split('|').forEach((f) => out.push({ f, c: CASES[i], n, g }));
    });
    if (key === 'qui') ['quōcum', 'quācum', 'quibuscum'].forEach((f) => out.push({ f, c: 'abl', n: f === 'quibuscum' ? 'p' : 's', g: f === 'quācum' ? 'f' : 'm', note: 'con cui' }));
    return out;
  }

  /* ---------- Lessico ---------- */
  function parseFlags(s) {
    const o = {};
    if (!s) return o;
    s.split(',').forEach((kv) => {
      kv = kv.trim();
      if (!kv) return;
      const i = kv.indexOf('=');
      if (i < 0) o[kv] = true;
      else o[kv.slice(0, i)] = kv.slice(i + 1);
    });
    return o;
  }

  const DECL_TOPIC = { 1: 'n1', 2: 'n2', 3: 'n3', 4: 'n45', 5: 'n45' };
  const DECL_NAME = { 1: '1ª declinazione', 2: '2ª declinazione', 3: '3ª declinazione', 4: '4ª declinazione', 5: '5ª declinazione' };
  const CONJ_NAME = { 1: '1ª coniugazione', 2: '2ª coniugazione', 3: '3ª coniugazione', 4: '4ª coniugazione', 5: '3ª coniugazione mista' };

  const LEX = [];
  const INDEX = new Map();
  const BY_UID = new Map();
  let idSeq = 0;

  function addIndex(form, a) {
    const k = norm(form);
    if (!INDEX.has(k)) INDEX.set(k, []);
    const arr = INDEX.get(k);
    if (!arr.some((x) => x.e === a.e && x.d === a.d)) arr.push(a);
  }

  function nounDesc(c, n, g) {
    let s = CASE_IT[c];
    if (n) s += ' ' + NUM_IT[n];
    if (g) s += ' ' + GEN_IT[g];
    return s;
  }
  function verbDesc(x, kind) {
    const dep = x.voice === 'dep';
    const v = kind === 'irr' && x.voice === 'act' ? '' : x.voice === 'act' ? ' attivo' : x.voice === 'pass' ? ' passivo' : '';
    if (x.mood === 'part') {
      const t = { pres: 'presente', perf: 'perfetto', fut: 'futuro' }[x.tense];
      return 'participio ' + t + (kind === 'dep' && x.tense === 'perf' ? ' (deponente, valore attivo)' : '') + ', ' + nounDesc(x.c, x.n, x.g);
    }
    if (x.mood === 'inf') return 'infinito ' + TENSE_IT[x.tense].replace(' semplice', '') + v + (dep ? ' (deponente)' : '');
    const moodName = { ind: 'indicativo', cong: 'congiuntivo', imp: 'imperativo' }[x.mood];
    return moodName + ' ' + TENSE_IT[x.tense] + v + (dep ? ' (deponente)' : '') + ', ' + PERS[x.p];
  }
  const verbKey = (x) => (x.mood === 'part' ? `v:part:${x.tense}:${x.c}:${x.n}:${x.g}` : x.mood === 'inf' ? `v:inf:${x.tense}:${x.voice}` : `v:${x.mood}:${x.tense}:${x.voice}:${x.p}`);
  // forma: grafia con le quantità (q) e senza (f)
  const mk = (q, rest) => Object.assign({ f: plain(q), q }, rest);

  function loadLexicon(src) {
    if (LEX.length) return;
    for (let line of src.split('\n')) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;
      const f = line.split('|').map((s) => s.trim());
      const k = f[0];
      let e;
      try {
        if (k === 'n') {
          const fl = parseFlags(f[5]);
          e = { k: 'n', nom: f[1], gen: f[2], g: f[3], it: f[4], sg: !!fl.sg, vocI: !!fl.vocI, pl: !!fl.pl, gp: fl.gp, ablI: !!fl.ablI, abus: !!fl.abus, loc: fl.loc, only: !!fl.only, drop: fl.drop ? fl.drop.split(';') : [], prop: /^[A-Z]/.test(plain(f[1])) };
          if (fl.x) e.extra = fl.x.split(';').map((s) => { const [ff, c, n] = s.split(':'); return { f: ff, c, n }; });
          const r = nounForms(e);
          e.decl = r.info.d;
          e.stems = { n: r.info.stem };
          e.t = fl.t || DECL_TOPIC[r.info.d];
          const gs = { m: 'm.', f: 'f.', n: 'n.' }[e.g];
          const shortGen = { 1: '-ae', 2: '-ī', 4: '-ūs', 5: '-eī' }[r.info.d];
          const genShow = e.pl ? e.gen : (r.info.d === 3 ? e.gen : (r.info.d === 5 && plain(e.gen).length <= 4 ? e.gen : shortGen));
          e.lemmaQ = e.nom + ', ' + genShow + ', ' + gs + (e.pl ? ' pl.' : '');
          e.cls = DECL_NAME[r.info.d];
          e.headQ = e.nom;
          e.forms = r.forms.map((x) => mk(x.f, { d: nounDesc(x.c, x.n), key: 'n:' + x.c + ':' + x.n, req: x.c === 'loc' ? [e.t, 'compl'] : [e.t], c: x.c, n: x.n }));
        } else if (k === 'a') {
          const fl = parseFlags(f[5]);
          const parts = [f[1], f[2], f[3]].filter((s) => s && s !== '-');
          e = { k: 'a', parts, it: f[4], pron: !!fl.pron, cons: !!fl.c, nocomp: !!fl.nocomp || !!fl.pron, vocMi: !!fl.mi, neutD: fl.nd };
          if (fl.x) e.extra = fl.x.split(';').map((s) => { const [ff, c, n, g] = s.split(':'); return { f: ff, c, n, g }; });
          const r = adjForms(e);
          e.adjCls = r.info.cls;
          e.stems = { a: r.info.stem };
          e.t = fl.t || (r.info.cls === 1 ? 'agg1' : 'agg2');
          if (r.info.cls === 1) e.lemmaQ = parts[0] + ', -' + parts[1].slice(r.info.stem.length) + ', -' + parts[2].slice(r.info.stem.length);
          else if (r.info.kind === 3) e.lemmaQ = parts.join(', ');
          else if (r.info.kind === 2) e.lemmaQ = parts[0] + ', -e';
          else e.lemmaQ = parts[0] + ', ' + parts[1];
          e.cls = r.info.cls === 1 ? 'aggettivo 1ª classe' : 'aggettivo 2ª classe (' + r.info.kind + (r.info.kind === 1 ? ' uscita)' : ' uscite)');
          e.headQ = parts[0];
          e.forms = r.forms.map((x) => {
            const deg = x.deg === 'comp' ? 'comparativo, ' : x.deg === 'sup' ? 'superlativo, ' : '';
            return mk(x.f, { d: deg + nounDesc(x.c, x.n, x.g), key: 'a:' + x.deg + ':' + x.c + ':' + x.n + ':' + x.g, req: x.deg === 'pos' ? [e.t] : [e.t, 'comp'], c: x.c, n: x.n, g: x.g, deg: x.deg });
          });
        } else if (k === 'v' || k === 'd' || k === 's') {
          let r;
          if (k === 'v') {
            const fl = parseFlags(f[6]);
            e = { k: 'v', pres: f[1], inf: f[2], perf: f[3], sup: f[4], it: f[5], intr: !!fl.intr, imp: fl.imp, fp: fl.fp, t: fl.t, shortA: !!fl.shortA };
            r = regularVerbForms(e);
            e.lemmaQ = [e.pres, e.perf !== '-' ? e.perf : null, e.sup !== '-' ? e.sup : null, e.inf].filter(Boolean).join(', ');
            e.t = e.t || 'v_pres';
          } else if (k === 'd') {
            const fl = parseFlags(f[5]);
            e = { k: 'v', dep: true, pres: f[1], inf: f[2], part: f[3], it: f[4], fp: fl.fp, mix: fl.mix };
            r = deponentForms(e);
            e.lemmaQ = e.pres + ', ' + e.part + ' sum, ' + e.inf;
            e.t = 'v_dep';
          } else {
            e = { k: 'v', semi: true, pres: f[1], inf: f[2], part: f[3], it: f[4] };
            r = semiDepForms(e);
            e.lemmaQ = e.pres + ', ' + e.part + ' sum, ' + e.inf;
            e.t = 'v_dep';
          }
          e.conj = r.conj;
          // temi per evidenziare le desinenze nelle tabelle: presente, perfetto, supino
          e.stems = { pres: k === 'v' ? e.inf.slice(0, -3) : depConjOf(e.pres, e.inf)[1], perf: e.perf && e.perf !== '-' ? e.perf.slice(0, -1) : null, sup: e.sup && e.sup !== '-' ? e.sup.slice(0, -2) : (e.part ? e.part.slice(0, -2) : null) };
          e.cls = CONJ_NAME[r.conj] + (e.dep ? ' (deponente)' : e.semi ? ' (semideponente)' : '');
          e.headQ = e.pres;
          e.forms = r.forms.map((x) => mk(x.f, { d: verbDesc(x, e.dep ? 'dep' : ''), key: verbKey(x), req: x.req, mood: x.mood, tense: x.tense, voice: x.voice, p: x.p, c: x.c, n: x.n, g: x.g }));
        } else if (k === 'x') {
          // irregolari: x|lemma|significato|flag
          const fl = parseFlags(f[3]);
          e = { k: 'v', irr: true, pres: f[1], it: f[2] };
          let list;
          const typ = fl.type || plain(f[1]);
          const pre = fl.pre || '';
          if (typ === 'sum') { list = sumForms(); e.lemmaQ = 'sum, fuī, futūrus, esse'; e.t = 'v_pres'; }
          else if (typ === 'possum') { list = possumForms(); e.lemmaQ = 'possum, potuī, posse'; e.t = 'v_poss'; }
          else if (typ === 'csum') { list = sumForms(pre, fl.pp, 'v_poss', !!fl.prod); e.lemmaQ = f[1] + ', ' + fl.pp + 'fuī, ' + (fl.prod ? pre + 'desse' : pre + 'esse'); e.t = 'v_poss'; }
          else if (typ === 'eo') { list = eoForms(pre); e.lemmaQ = f[1] + ', ' + pre + 'iī, ' + pre + 'itum, ' + pre + 'īre'; e.t = 'v_irr'; }
          else if (typ === 'fero') { list = feroForms(pre, fl.perf || 'tulī', fl.sup || 'lātum'); e.lemmaQ = f[1] + ', ' + (fl.perf || 'tulī') + ', ' + (fl.sup || 'lātum') + ', ' + pre + 'ferre'; e.t = 'v_irr'; }
          else if (['volo', 'nolo', 'malo'].includes(typ)) { list = voloForms(typ); e.lemmaQ = { volo: 'volō, voluī, velle', nolo: 'nōlō, nōluī, nōlle', malo: 'mālō, māluī, mālle' }[typ]; e.t = 'v_irr'; }
          else if (typ === 'fio') { list = fioForms(); e.lemmaQ = 'fīō, factus sum, fierī'; e.t = 'v_irr'; }
          e.cls = typ === 'csum' ? 'composto di sum' : 'verbo irregolare';
          e.headQ = e.pres;
          e.forms = list.map((x) => mk(x.f, { d: verbDesc(x, 'irr'), key: verbKey(x), req: x.req, mood: x.mood, tense: x.tense, voice: x.voice, p: x.p, c: x.c, n: x.n, g: x.g }));
        } else if (k === 'p') {
          e = { k: 'p', lemmaKey: plain(f[1]), it: f[2], t: f[3] };
          const fl = parseFlags(f[4]);
          e.lemmaQ = fl.lemma ? fl.lemma.replace(/;/g, ', ') : f[1];
          e.headQ = f[1];
          e.cls = 'pronome';
          if (fl.adj) {
            // possessivi e simili: declinati come aggettivi della I classe
            const parts = fl.adj.split(';');
            const info = adjInfo({ parts });
            e.lemmaQ = parts[0] + ', -' + parts[1].slice(info.stem.length) + ', -' + parts[2].slice(info.stem.length);
            e.cls = 'aggettivo pronominale';
            e.forms = decl1Adj(info.m, info.stem, { vocMi: !!fl.mi }).map((x) => mk(x.f, { d: nounDesc(x.c, x.n, x.g), key: 'p:' + x.c + ':' + x.n + ':' + x.g, req: [e.t], c: x.c, n: x.n, g: x.g }));
          } else {
            e.forms = pronounForms(e).map((x) => mk(x.f, { d: nounDesc(x.c, x.n, x.g) + (x.note ? ' (' + x.note + ')' : ''), key: 'p:' + x.c + ':' + (x.n || '-') + ':' + (x.g || '-'), req: [e.t], c: x.c, n: x.n, g: x.g }));
          }
        } else if (k === 'i') {
          e = { k: 'i', headQ: f[1], lemmaQ: f[1], it: f[2], t: f[3] || 'v_pres', pos: f[4] || 'avv' };
          e.cls = { 'prep+acc': 'preposizione + accusativo', 'prep+abl': 'preposizione + ablativo', cong: 'congiunzione', avv: 'avverbio', inter: 'interiezione', indecl: 'indeclinabile' }[e.pos] || e.pos;
          e.forms = [mk(f[1], { d: e.cls, key: 'i', req: [e.t] })];
        } else continue;
      } catch (err) {
        if (typeof console !== 'undefined') console.warn('Lessico:', line, err.message);
        continue;
      }
      e.head = plain(e.headQ);
      e.lemma = plain(e.lemmaQ);
      e.id = idSeq++;
      // identificativo stabile: il lemma, con l'argomento quando due voci hanno la stessa grafia (volo, liber, cum)
      e.uid = BY_UID.has(e.head) ? e.head + '@' + e.t : e.head;
      BY_UID.set(e.uid, e);
      LEX.push(e);
      for (const x of e.forms) addIndex(x.f, { e, d: x.d, req: x.req, key: x.key, f: x.f, q: x.q });
    }
  }

  /* ---------- Analisi ---------- */
  function tokenize(sentence) {
    // restituisce parole (con _ trattato come spazio)
    return sentence.replace(/_/g, ' ').split(/\s+/).map((w) => w.replace(/[^A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]/g, '')).filter(Boolean);
  }

  function analyze(word) {
    const n = norm(String(word).replace(/[^A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]/g, ''));
    if (!n) return [];
    let r = INDEX.get(n);
    if (r && r.length) return r;
    for (const enc of ['que', 've', 'ne']) {
      if (n.endsWith(enc) && n.length > enc.length + 1) {
        const b = INDEX.get(n.slice(0, -enc.length));
        if (b && b.length) return b.map((a) => ({ ...a, enc }));
      }
    }
    return [];
  }

  function reqOK(word, tags) {
    const an = analyze(word);
    if (!an.length) return { known: false, ok: false };
    return { known: true, ok: an.some((a) => a.req.every((t) => tags.has(t))) };
  }

  function entryForms(e, tags) {
    return e.forms.filter((x) => !tags || x.req.every((t) => tags.has(t)));
  }

  /* ---------- Sillabe, quantità della sillaba e accento ---------- */
  // Nuclei: le vocali (anche lunghe) e i dittonghi ae, au, oe (ui solo in cui, huic).
  // i è consonante all'inizio di parola davanti a vocale (iam, iuvenis) e fra due vocali (maior, eius:
  // in questo caso allunga la sillaba precedente); u è semiconsonante dopo q e nel gruppo ngu (lingua).
  // Le forme di eō che cominciano per i (iī, ieram, iēns) hanno la i vocale: lo si indica con o.vocalicI.
  const VOW = 'aeiouyāēīōūȳ';
  const isV = (c) => !!c && VOW.includes(c);
  const MUTA = 'pbtdcgf', LIQ = 'lr';
  function syllables(word, o = {}) {
    const w = String(word);
    const L = w.toLowerCase();
    const seg = [];
    for (let i = 0; i < L.length;) {
      const c = L[i], prev = L[i - 1], next = L[i + 1];
      if (!isV(c)) {
        // th, ph, ch, rh valgono una consonante sola
        if (c === 'h' && prev && 'tpcr'.includes(prev) && seg.length && seg[seg.length - 1].t === 'c') { seg[seg.length - 1].s += w[i]; i++; continue; }
        seg.push({ t: 'c', s: w[i], dbl: c === 'x' || c === 'z' }); i++; continue;
      }
      if (c === 'u' && isV(next) && (prev === 'q' || (prev === 'g' && L[i - 2] === 'n'))) { seg[seg.length - 1].s += w[i]; i++; continue; }
      if (c === 'i' && isV(next) && plain(next) !== 'i') {
        if (i === 0 && !o.vocalicI) { seg.push({ t: 'c', s: w[i] }); i++; continue; }
        if (i > 0 && isV(prev)) { seg.push({ t: 'c', s: w[i], jj: true }); i++; continue; }
      }
      const two = L.slice(i, i + 2);
      const word2 = plain(L);
      if (['ae', 'au', 'oe'].includes(two) || (two === 'ui' && /^(h?uic|cui)$/.test(word2))) { seg.push({ t: 'v', s: w.slice(i, i + 2), long: true }); i += 2; continue; }
      seg.push({ t: 'v', s: w[i], long: plain(c) !== c }); i++;
    }
    const out = [];
    let onset = '', nucleus = null, pend = [];
    const close = (coda, heavyByPos) => { out.push({ s: onset + nucleus.s + coda, vowel: nucleus.s, long: nucleus.long, heavy: nucleus.long || heavyByPos }); };
    for (const s of seg) {
      if (s.t === 'c') { pend.push(s); continue; }
      if (!nucleus) { onset = pend.map((x) => x.s).join(''); nucleus = s; pend = []; continue; }
      // consonanti fra due nuclei: l'ultima va alla sillaba seguente; muta + liquida restano insieme
      let k = pend.length - 1;
      if (pend.length >= 2) {
        const a = plain(pend[k - 1].s.toLowerCase())[0], b = plain(pend[k].s.toLowerCase())[0];
        if (MUTA.includes(a) && LIQ.includes(b) && pend[k - 1].s.length === 1) k -= 1;
      }
      if (k < 0) k = 0;
      const coda = pend.slice(0, k).map((x) => x.s).join('');
      const next = pend.slice(k).map((x) => x.s).join('');
      const heavy = coda.length > 0 || pend.some((x) => x.dbl || x.jj);
      close(coda, heavy);
      onset = next; nucleus = s; pend = [];
    }
    if (nucleus) close(pend.map((x) => x.s).join(''), pend.length > 0);
    else if (out.length) out[out.length - 1].s += pend.map((x) => x.s).join('');
    return out;
  }
  // sillaba accentata (legge della penultima): bisillabi sulla prima; dalle tre sillabe in su sulla penultima
  // se è lunga, altrimenti sulla terzultima; con -que, -ne, -ve l'accento cade sulla sillaba prima dell'enclitica.
  function accentSyllable(word, o = {}) {
    const S = syllables(word, o);
    const n = S.length;
    if (o.enclitic) return { S, i: Math.max(0, n - 2) };
    if (n <= 2) return { S, i: 0 };
    return { S, i: S[n - 2].heavy ? n - 2 : n - 3 };
  }

  root.VertoEngine = { norm, plain, analyze, tokenize, loadLexicon, LEX, INDEX, BY_UID, reqOK, entryForms, syllables, accentSyllable, CASE_IT, NUM_IT, GEN_IT, PERS, TENSE_IT };
  if (typeof module !== 'undefined') module.exports = root.VertoEngine;
})(typeof window !== 'undefined' ? window : globalThis);
