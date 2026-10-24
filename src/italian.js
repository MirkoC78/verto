/* VERTO — morfologia italiana per le traduzioni del generatore:
   articoli, preposizioni articolate, aggettivi, coniugazione (tempi, passivo, riflessivi, irregolari). */
(function (root) {
  'use strict';
  const VOW = /^[aeiouàèéìòùh]/i;
  const LO = /^(s[^aeiouàèéìòù]|z|gn|ps|pn|x|y|i[aeiou])/i;

  /* ---------- Articoli e preposizioni ---------- */
  function defArt(g, n, next) {
    if (g === 'm') {
      if (n === 's') return LO.test(next) ? 'lo' : VOW.test(next) ? "l'" : 'il';
      return LO.test(next) || VOW.test(next) ? 'gli' : 'i';
    }
    if (n === 's') return VOW.test(next) ? "l'" : 'la';
    return 'le';
  }
  function indefArt(g, next) {
    if (g === 'm') return LO.test(next) ? 'uno' : 'un';
    return VOW.test(next) ? "un'" : 'una';
  }
  const CONTR = {
    di: { il: 'del', lo: 'dello', "l'": "dell'", la: 'della', i: 'dei', gli: 'degli', le: 'delle' },
    a: { il: 'al', lo: 'allo', "l'": "all'", la: 'alla', i: 'ai', gli: 'agli', le: 'alle' },
    da: { il: 'dal', lo: 'dallo', "l'": "dall'", la: 'dalla', i: 'dai', gli: 'dagli', le: 'dalle' },
    in: { il: 'nel', lo: 'nello', "l'": "nell'", la: 'nella', i: 'nei', gli: 'negli', le: 'nelle' },
    su: { il: 'sul', lo: 'sullo', "l'": "sull'", la: 'sulla', i: 'sui', gli: 'sugli', le: 'sulle' },
  };
  const glue = (a, b) => (!a ? b : !b ? a : /'$/.test(a) ? a + b : a + ' ' + b);
  // np: {art: 'il'|null, body: 'grande re'}; prep: 'di' | 'a causa di' | 'con' | null
  function withPrep(prep, np) {
    if (!prep) return glue(np.art, np.body);
    const words = prep.split(' ');
    const last = words.pop();
    const pre = words.join(' ');
    if (np.art && CONTR[last] && CONTR[last][np.art]) return glue(pre, glue(CONTR[last][np.art], np.body));
    const p2 = last === 'a' && !np.art && /^a/i.test(np.body) ? 'ad' : last;
    return glue(pre, glue(p2, glue(np.art, np.body)));
  }

  /* ---------- Aggettivi ---------- */
  // spec: 'buono' | 'forte' | 'antico|antichi|antiche' | 'migliore|migliori'
  function adjForms(spec) {
    const p = spec.split('|');
    const ms = p[0];
    let fs, mp, fp;
    if (/o$/.test(ms)) { fs = ms.slice(0, -1) + 'a'; mp = ms.slice(0, -1) + 'i'; fp = ms.slice(0, -1) + 'e'; }
    else if (/e$/.test(ms)) { fs = ms; mp = ms.slice(0, -1) + 'i'; fp = mp; }
    else { fs = ms; mp = ms; fp = ms; }
    if (p.length === 3) { mp = p[1]; fp = p[2]; }
    if (p.length === 2) { mp = p[1]; fp = p[1]; }
    if (/io$/.test(ms) && p.length === 1) { mp = ms.slice(0, -1); if (/[cg]io$/.test(ms)) fp = ms.slice(0, -2) + 'e'; }
    return { ms, fs, mp, fp };
  }
  function adjAgree(forms, g, n) { return g === 'm' ? (n === 's' ? forms.ms : forms.mp) : (n === 's' ? forms.fs : forms.fp); }
  // aggettivi prenominali con forme tronche (bello, buono, quello)
  function preForm(word, g, n, next) {
    const base = word;
    if (base === 'bello' || base === 'quello') {
      const root = base.slice(0, -3);
      if (g === 'm' && n === 's') return LO.test(next) ? base : VOW.test(next) ? root + "ll'" : root + 'l';
      if (g === 'm' && n === 'p') return LO.test(next) || VOW.test(next) ? root + 'gli' : root + 'i';
      if (g === 'f' && n === 's') return VOW.test(next) ? root + "ll'" : root + 'lla';
      return root + 'lle';
    }
    if (base === 'buono') {
      if (g === 'm' && n === 's') return LO.test(next) ? 'buono' : 'buon';
      if (g === 'f' && n === 's') return VOW.test(next) ? "buon'" : 'buona';
      return n === 's' ? 'buono' : g === 'm' ? 'buoni' : 'buone';
    }
    if (base === 'questo') {
      if (n === 's' && VOW.test(next)) return "quest'";
      return g === 'm' ? (n === 's' ? 'questo' : 'questi') : (n === 's' ? 'questa' : 'queste');
    }
    return null;
  }
  function superlative(forms) {
    const ms = forms.ms;
    if (/co$|go$/.test(ms)) return adjForms(ms.slice(0, -1) + 'hissimo');
    if (/io$/.test(ms)) return adjForms(ms.slice(0, -2) + 'issimo');
    return adjForms(ms.replace(/[oe]$/, '') + 'issimo');
  }

  /* ---------- Verbi ---------- */
  const E3 = { pres: ['o', 'i', 'a', 'iamo', 'ate', 'ano'], impf: ['avo', 'avi', 'ava', 'avamo', 'avate', 'avano'], pr: ['ai', 'asti', 'ò', 'ammo', 'aste', 'arono'], cpres: ['i', 'i', 'i', 'iamo', 'iate', 'ino'], cimpf: ['assi', 'assi', 'asse', 'assimo', 'aste', 'assero'], fut: 'er', part: 'ato', ger: 'ando', imp: 'a' };
  const E2 = { pres: ['o', 'i', 'e', 'iamo', 'ete', 'ono'], impf: ['evo', 'evi', 'eva', 'evamo', 'evate', 'evano'], pr: ['ei', 'esti', 'é', 'emmo', 'este', 'erono'], cpres: ['a', 'a', 'a', 'iamo', 'iate', 'ano'], cimpf: ['essi', 'essi', 'esse', 'essimo', 'este', 'essero'], fut: 'er', part: 'uto', ger: 'endo', imp: 'i' };
  const E4 = { pres: ['o', 'i', 'e', 'iamo', 'ite', 'ono'], impf: ['ivo', 'ivi', 'iva', 'ivamo', 'ivate', 'ivano'], pr: ['ii', 'isti', 'ì', 'immo', 'iste', 'irono'], cpres: ['a', 'a', 'a', 'iamo', 'iate', 'ano'], cimpf: ['issi', 'issi', 'isse', 'issimo', 'iste', 'issero'], fut: 'ir', part: 'ito', ger: 'endo', imp: 'i' };
  const FUT = ['ò', 'ai', 'à', 'emo', 'ete', 'anno'];
  const COND = ['ei', 'esti', 'ebbe', 'emmo', 'este', 'ebbero'];
  const ISC = new Set(['ferire', 'punire', 'custodire', 'costruire', 'ammonire', 'istruire', 'atterrire', 'fornire', 'impaurire', 'colpire', 'finire', 'fiorire', 'obbedire', 'pulire', 'unire', 'stupire']);
  const IRR = {
    essere: { pres: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'], impf: ['ero', 'eri', 'era', 'eravamo', 'eravate', 'erano'], futStem: 'sar', pr: ['fui', 'fosti', 'fu', 'fummo', 'foste', 'furono'], part: 'stato', aux: 'essere', cpres: ['sia', 'sia', 'sia', 'siamo', 'siate', 'siano'], cimpf: ['fossi', 'fossi', 'fosse', 'fossimo', 'foste', 'fossero'], imp: ['sii', 'siate'], ger: 'essendo' },
    avere: { pres: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'], futStem: 'avr', pr: ['ebbi', 'avesti', 'ebbe', 'avemmo', 'aveste', 'ebbero'], cpres: ['abbia', 'abbia', 'abbia', 'abbiamo', 'abbiate', 'abbiano'], imp: ['abbi', 'abbiate'] },
    fare: { pres: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'], stem2: 'fac', futStem: 'far', pr: ['feci', 'facesti', 'fece', 'facemmo', 'faceste', 'fecero'], part: 'fatto', cpres: ['faccia', 'faccia', 'faccia', 'facciamo', 'facciate', 'facciano'], imp: ["fa'", 'fate'], ger: 'facendo' },
    dare: { pres: ['do', 'dai', 'dà', 'diamo', 'date', 'danno'], futStem: 'dar', pr: ['diedi', 'desti', 'diede', 'demmo', 'deste', 'diedero'], cpres: ['dia', 'dia', 'dia', 'diamo', 'diate', 'diano'], cimpf: ['dessi', 'dessi', 'desse', 'dessimo', 'deste', 'dessero'], imp: ["da'", 'date'] },
    andare: { pres: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'], futStem: 'andr', cpres: ['vada', 'vada', 'vada', 'andiamo', 'andiate', 'vadano'], imp: ["va'", 'andate'], aux: 'essere' },
    venire: { pres: ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono'], futStem: 'verr', prStrong: 'venn', part: 'venuto', aux: 'essere', cpres: ['venga', 'venga', 'venga', 'veniamo', 'veniate', 'vengano'] },
    tenere: { pres: ['tengo', 'tieni', 'tiene', 'teniamo', 'tenete', 'tengono'], futStem: 'terr', prStrong: 'tenn', part: 'tenuto', cpres: ['tenga', 'tenga', 'tenga', 'teniamo', 'teniate', 'tengano'] },
    potere: { pres: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'], futStem: 'potr', cpres: ['possa', 'possa', 'possa', 'possiamo', 'possiate', 'possano'] },
    volere: { pres: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'], futStem: 'vorr', prStrong: 'voll', cpres: ['voglia', 'voglia', 'voglia', 'vogliamo', 'vogliate', 'vogliano'] },
    dovere: { pres: ['devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono'], futStem: 'dovr', cpres: ['debba', 'debba', 'debba', 'dobbiamo', 'dobbiate', 'debbano'] },
    dire: { pres: ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono'], stem2: 'dic', futStem: 'dir', pr: ['dissi', 'dicesti', 'disse', 'dicemmo', 'diceste', 'dissero'], part: 'detto', cpres: ['dica', 'dica', 'dica', 'diciamo', 'diciate', 'dicano'], imp: ["di'", 'dite'], ger: 'dicendo' },
    sapere: { pres: ['so', 'sai', 'sa', 'sappiamo', 'sapete', 'sanno'], futStem: 'sapr', prStrong: 'sepp', cpres: ['sappia', 'sappia', 'sappia', 'sappiamo', 'sappiate', 'sappiano'], imp: ['sappi', 'sappiate'] },
    vedere: { futStem: 'vedr', prStrong: 'vid', part: 'visto' },
    vincere: { prStrong: 'vins', part: 'vinto' },
    sconfiggere: { prStrong: 'sconfiss', part: 'sconfitto' },
    uccidere: { prStrong: 'uccis', part: 'ucciso' },
    distruggere: { prStrong: 'distruss', part: 'distrutto' },
    leggere: { prStrong: 'less', part: 'letto' },
    scrivere: { prStrong: 'scriss', part: 'scritto' },
    prendere: { prStrong: 'pres', part: 'preso' },
    difendere: { prStrong: 'difes', part: 'difeso' },
    correre: { prStrong: 'cors', part: 'corso' },
    rimanere: { pres: ['rimango', 'rimani', 'rimane', 'rimaniamo', 'rimanete', 'rimangono'], futStem: 'rimarr', prStrong: 'rimas', part: 'rimasto', aux: 'essere', cpres: ['rimanga', 'rimanga', 'rimanga', 'rimaniamo', 'rimaniate', 'rimangano'] },
    ridere: { prStrong: 'ris', part: 'riso' },
    tacere: { pres: ['taccio', 'taci', 'tace', 'tacciamo', 'tacete', 'tacciono'], prStrong: 'tacqu', part: 'taciuto', cpres: ['taccia', 'taccia', 'taccia', 'tacciamo', 'tacciate', 'tacciano'] },
    piangere: { prStrong: 'pians', part: 'pianto' },
    giungere: { prStrong: 'giuns', part: 'giunto', aux: 'essere' },
    promettere: { prStrong: 'promis', part: 'promesso' },
    chiedere: { prStrong: 'chies', part: 'chiesto' },
    cogliere: { pres: ['colgo', 'cogli', 'coglie', 'cogliamo', 'cogliete', 'colgono'], prStrong: 'cols', part: 'colto', cpres: ['colga', 'colga', 'colga', 'cogliamo', 'cogliate', 'colgano'] },
    condurre: { pres: ['conduco', 'conduci', 'conduce', 'conduciamo', 'conducete', 'conducono'], stem2: 'conduc', futStem: 'condurr', pr: ['condussi', 'conducesti', 'condusse', 'conducemmo', 'conduceste', 'condussero'], part: 'condotto', cpres: ['conduca', 'conduca', 'conduca', 'conduciamo', 'conduciate', 'conducano'], ger: 'conducendo' },
    offrire: { part: 'offerto' },
    morire: { pres: ['muoio', 'muori', 'muore', 'moriamo', 'morite', 'muoiono'], part: 'morto', aux: 'essere', cpres: ['muoia', 'muoia', 'muoia', 'moriamo', 'moriate', 'muoiano'] },
    assalire: { pres: ['assalgo', 'assali', 'assale', 'assaliamo', 'assalite', 'assalgono'], cpres: ['assalga', 'assalga', 'assalga', 'assaliamo', 'assaliate', 'assalgano'] },
    uscire: { pres: ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono'], aux: 'essere', cpres: ['esca', 'esca', 'esca', 'usciamo', 'usciate', 'escano'] },
    temere: { pr: ['temetti', 'temesti', 'temette', 'tememmo', 'temeste', 'temettero'] },
    credere: { pr: ['credetti', 'credesti', 'credette', 'credemmo', 'credeste', 'credettero'] },
    ricevere: { pr: ['ricevetti', 'ricevesti', 'ricevette', 'ricevemmo', 'riceveste', 'ricevettero'] },
    cadere: { futStem: 'cadr', prStrong: 'cadd', aux: 'essere' },
    nascere: { prStrong: 'nacqu', part: 'nato', aux: 'essere' },
    mantenere: { pres: ['mantengo', 'mantieni', 'mantiene', 'manteniamo', 'mantenete', 'mantengono'], futStem: 'manterr', prStrong: 'mantenn', part: 'mantenuto', cpres: ['mantenga', 'mantenga', 'mantenga', 'manteniamo', 'manteniate', 'mantengano'] },
    attendere: { prStrong: 'attes', part: 'atteso' },
    reggere: { prStrong: 'ress', part: 'retto' },
    udire: { pres: ['odo', 'odi', 'ode', 'udiamo', 'udite', 'odono'], cpres: ['oda', 'oda', 'oda', 'udiamo', 'udiate', 'odano'] },
    stare: { pres: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'], futStem: 'star', pr: ['stetti', 'stesti', 'stette', 'stemmo', 'steste', 'stettero'], cpres: ['stia', 'stia', 'stia', 'stiamo', 'stiate', 'stiano'], cimpf: ['stessi', 'stessi', 'stesse', 'stessimo', 'steste', 'stessero'], imp: ["sta'", 'state'], aux: 'essere' },
    porre: { pres: ['pongo', 'poni', 'pone', 'poniamo', 'ponete', 'pongono'], stem2: 'pon', futStem: 'porr', pr: ['posi', 'ponesti', 'pose', 'ponemmo', 'poneste', 'posero'], part: 'posto', cpres: ['ponga', 'ponga', 'ponga', 'poniamo', 'poniate', 'pongano'], imp: ['poni', 'ponete'], ger: 'ponendo' },
  };
  const ESSERE_AUX = new Set(['andare', 'venire', 'tornare', 'ritornare', 'partire', 'arrivare', 'giungere', 'uscire', 'entrare', 'fuggire', 'rimanere', 'morire', 'cadere', 'nascere', 'mancare', 'essere', 'restare', 'stare']);

  function info(inf) {
    let refl = false, base = inf;
    if (/rsi$/.test(inf)) { refl = true; base = inf.slice(0, -2) + 'e'; }
    const conj = /are$/.test(base) ? 'are' : /(ere|rre)$/.test(base) ? 'ere' : 'ire';
    const stem = base.slice(0, -3);
    const irr = IRR[base] || {};
    return { inf, base, refl, conj, stem, irr, isc: ISC.has(base), aux: refl ? 'essere' : (irr.aux || (ESSERE_AUX.has(base) ? 'essere' : 'avere')) };
  }
  function join(v, stem, end) {
    if (v.conj === 'are') {
      if (/[cg]i$/.test(stem) && /^[ei]/.test(end)) return stem.slice(0, -1) + end;
      if (/i$/.test(stem) && /^i/.test(end)) return stem.slice(0, -1) + end;
      if (/[cg]$/.test(stem) && /^[ei]/.test(end)) return stem + 'h' + end;
    }
    return stem + end;
  }
  const E = (v) => (v.conj === 'are' ? E3 : v.conj === 'ere' ? E2 : E4);
  function simple(v, tense, p) {
    const I = v.irr, en = E(v);
    switch (tense) {
      case 'pres':
        if (I.pres) return I.pres[p];
        if (v.isc && [0, 1, 2, 5].includes(p)) return v.stem + ['isco', 'isci', 'isce', '', '', 'iscono'][p];
        return join(v, v.stem, en.pres[p]);
      case 'impf':
        if (I.impf) return I.impf[p];
        if (I.stem2) return I.stem2 + E2.impf[p];
        return join(v, v.stem, en.impf[p]);
      case 'fut':
        if (I.futStem) return I.futStem + FUT[p];
        return join(v, v.stem, en.fut + FUT[p]);
      case 'cond':
        if (I.futStem) return I.futStem + COND[p];
        return join(v, v.stem, en.fut + COND[p]);
      case 'pr':
        if (I.pr) return I.pr[p];
        if (I.prStrong && [0, 2, 5].includes(p)) return I.prStrong + ['i', '', 'e', '', '', 'ero'][p];
        return join(v, v.stem, en.pr[p]);
      case 'cpres':
        if (I.cpres) return I.cpres[p];
        if (v.isc && [0, 1, 2, 5].includes(p)) return v.stem + ['isca', 'isca', 'isca', '', '', 'iscano'][p];
        return join(v, v.stem, en.cpres[p]);
      case 'cimpf':
        if (I.cimpf) return I.cimpf[p];
        if (I.stem2) return I.stem2 + E2.cimpf[p];
        return join(v, v.stem, en.cimpf[p]);
      case 'imp':
        if (I.imp) return p === 1 ? I.imp[0] : I.imp[1];
        if (p === 4) return simple(v, 'pres', 4);
        if (v.isc) return v.stem + 'isci';
        if (I.pres) return I.pres[1];
        return join(v, v.stem, en.imp);
      default: return '';
    }
  }
  function participle(v) { return v.irr.part || (v.stem + E(v).part); }
  function gerund(v) { return v.irr.ger || join(v, v.stem, E(v).ger); }
  const REFL = ['mi', 'ti', 'si', 'ci', 'vi', 'si'];
  const COMPOUND = { pp: 'pres', tp: 'impf', fa: 'fut', cp: 'cond', ppr: 'pr', cpp: 'cpres', ctp: 'cimpf' };
  // Forma finita. o: {p, g, n, voice:'act'|'pass', passAux:'essere'|'venire', neg, clitic}
  function verb(inf, tense, o) {
    const v = info(inf);
    const p = o.p, g = o.g || 'm', n = o.n || (p >= 3 ? 'p' : 's');
    const neg = o.neg ? 'non ' : '';
    const cl = o.clitic ? o.clitic + ' ' : '';
    if (o.voice === 'pass') {
      const part = adjAgree(adjForms(participle(v)), g, n);
      if (COMPOUND[tense] && tense !== 'ppr') {
        const ess = info('essere');
        const aux = simple(ess, COMPOUND[tense], p);
        return neg + cl + aux + ' ' + adjAgree(adjForms('stato'), g, n) + ' ' + part;
      }
      const auxV = info(o.passAux === 'venire' ? 'venire' : 'essere');
      return neg + cl + simple(auxV, tense, p) + ' ' + part;
    }
    const refl = v.refl ? REFL[p] + ' ' : '';
    if (COMPOUND[tense] && tense !== 'ppr') {
      const auxV = info(v.aux);
      const partRaw = participle(v);
      const part = v.aux === 'essere' ? adjAgree(adjForms(partRaw), g, n) : partRaw;
      return neg + cl + refl + simple(auxV, COMPOUND[tense], p) + ' ' + part;
    }
    if (tense === 'imp') {
      if (o.neg) {
        if (p === 1) return 'non ' + (v.refl ? v.base.slice(0, -1) + 'ti' : v.inf);
        return 'non ' + simple(v, 'imp', 4) + (v.refl ? 'vi' : '');
      }
      const f = simple(v, 'imp', p);
      if (v.refl) return f.replace(/'$/, '') + (p === 1 ? 'ti' : 'vi');
      return f;
    }
    return neg + cl + refl + simple(v, tense, p);
  }
  function infinitive(inf, o = {}) {
    const v = info(inf);
    if (o.voice === 'pass') return 'essere ' + adjAgree(adjForms(participle(v)), o.g || 'm', o.n || 's');
    if (o.perfect) {
      const part = v.aux === 'essere' ? adjAgree(adjForms(participle(v)), o.g || 'm', o.n || 's') : participle(v);
      return (v.aux === 'essere' ? 'essere ' : 'avere ') + part;
    }
    return v.inf;
  }
  function gerundio(inf, o = {}) {
    const v = info(inf);
    if (o.perfect) {
      if (o.voice === 'pass') return 'essendo ' + adjAgree(adjForms('stato'), o.g, o.n) + ' ' + adjAgree(adjForms(participle(v)), o.g, o.n);
      const part = v.aux === 'essere' ? adjAgree(adjForms(participle(v)), o.g || 'm', o.n || 's') : participle(v);
      if (v.refl) return 'essendosi ' + part;
      return (v.aux === 'essere' ? 'essendo ' : 'avendo ') + part;
    }
    const ger = gerund(v);
    return v.refl ? ger + 'si' : ger;
  }
  function pastParticiple(inf, g, n) { return adjAgree(adjForms(participle(info(inf))), g, n); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  root.VertoIt = { defArt, indefArt, withPrep, glue, adjForms, adjAgree, preForm, superlative, verb, infinitive, gerundio, pastParticiple, info, cap, VOW, LO };
  if (typeof module !== 'undefined') module.exports = root.VertoIt;
})(typeof window !== 'undefined' ? window : globalThis);
