/* Regressioni per i difetti della revisione esterna (docs/revisione-codex.md):
   VERTO-001 traduzioni con significato cambiato premiate, VERTO-002 quantità mostrate e analisi accettate,
   VERTO-003 generatore costruito prima del lessico, VERTO-004 vocativo in -ī troppo esteso. */
// VERTO-003: si caricano i moduli nell'ordine del browser, con il lessico caricato DOPO il generatore
const E = require('../src/engine.js');
require('../src/italian.js'); require('../src/semantic.js');
const GN = require('../src/generator.js');
const errors = [];
const err = (m) => errors.push(m);
if (GN.init() !== false || GN.NOUNS.length) err('VERTO-003: il generatore si inizializza senza lessico');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
require('../src/reading.js');
const C = require('../src/course.js');
const BANKSRC = require('../src/bank.js');
const L = require('../src/lessons.js');
const CK = require('../src/check.js');
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
GN.seed(mulberry32(5));
let gen = 0;
for (let k = 0; k < 40; k++) { const g = GN.generate(['v_pres', 'n1'], 'n1', {}); if (g && g.src === 'gen') gen++; }
if (!GN.NOUNS.length || !GN.ADJS.length || !GN.VERBS.length || !GN.MODALS.length || !GN.SUMCOMP.length || !GN.SAYERS.length) err('VERTO-003: repertori del generatore vuoti dopo il lessico');
if (!gen) err('VERTO-003: nessuna frase generata in un ambito sicuramente generabile');
const nouns = GN.NOUNS.length;
GN.init();
if (GN.NOUNS.length !== nouns) err('VERTO-003: una seconda inizializzazione duplica i repertori');

// VERTO-001: le traduzioni scritte con il significato cambiato non sono accettate da sole
const WRONG = [
  [['Il lupo vede l’agnello nel bosco.', 'Il lupo nel bosco vede l’agnello.'], 'L’agnello vede il lupo nel bosco.', 'ruoli invertiti'],
  [['La fanciulla ama le rose.'], 'Le rose amano la fanciulla.', 'ruoli invertiti'],
  [['Gli amici non sono sempre presenti.', 'Gli amici non sempre sono presenti.'], 'Gli amici sono sempre presenti.', 'negazione tolta'],
  [['Il maestro istruisce i fanciulli.', 'Il maestro insegna ai fanciulli.'], 'Il maestro non istruisce i fanciulli.', 'negazione aggiunta'],
  [['I marinai non possono vivere senza acqua.'], 'I marinai possono vivere senza acqua.', 'negazione tolta'],
  [['Il lupo vede l’agnello nel bosco.'], 'I lupi vedono l’agnello nel bosco.', 'numero cambiato'],
  [['La fanciulla ama la rosa.'], 'La fanciulla ama le rose.', 'numero cambiato'],
  [['Lavoro e canto.'], 'Lavora e canta.', 'persona cambiata'],
  [['Amavamo la patria.'], 'Amavate la patria.', 'persona cambiata'],
];
let wrongTried = 0;
for (const [refs, ans, why] of WRONG) { wrongTried++; if (CK.italian(refs, ans).ok) err(`VERTO-001: accettata «${ans}» (${why}) per «${refs[0]}»`); }
const RIGHT = [
  [['Il lupo vede l’agnello nel bosco.'], "il lupo vede l'agnello nel bosco", 'minuscole, apostrofo dritto, senza punto'],
  [['Il lupo vede l’agnello nel bosco.'], 'Il lupo vede l agnello nel bosco!', 'punteggiatura'],
  [['Il lupo vede l’agnello nel bosco.'], 'Il lupo vede l’agnelo nel bosco.', 'una lettera in meno dentro la parola'],
  [['La città è grande.'], 'La citta e grande', 'accenti mancanti'],
  [['Il maestro istruisce i fanciulli.'], 'Il maestro istruisce i fanciuli.', 'una lettera in meno dentro la parola'],
];
for (const [refs, ans, why] of RIGHT) if (!CK.italian(refs, ans).ok) err(`VERTO-001: respinta «${ans}» (${why})`);
// su tutta la banca: ogni traduzione prevista è accettata; con «non» aggiunto, una parola tolta o le parole capovolte no
let bankChecked = 0;
for (const b of BANKSRC) {
  const refs = b[1].split('|');
  for (const r of refs) {
    bankChecked++;
    if (!CK.italian(refs, r).ok) err(`VERTO-001: respinta la traduzione prevista «${r}»`);
    const w = r.replace(/[.!?]$/, '').split(' ');
    const variants = [];
    if (w.length > 2 && !/\bnon\b/i.test(r)) variants.push([w[0], 'non', ...w.slice(1)].join(' '));
    if (w.length > 2) variants.push(w.slice(0, -1).join(' '));
    if (w.length > 2) variants.push(w.slice().reverse().join(' '));
    for (const v of variants) if (!refs.some((x) => CK.normIt(x) === CK.normIt(v)) && CK.italian(refs, v).ok) err(`VERTO-001: accettata la variante «${v}» per «${r}»`);
  }
}

// VERTO-002: forma mostrata, letture accettate e opzioni sono coerenti, con e senza quantità
const fera = E.BY_UID.get('fera');
const feraQ = E.analyze('fera').filter((a) => a.e === fera && a.q.normalize('NFC') === 'ferā').map((a) => a.d);
if (feraQ.join() !== 'ablativo singolare') err(`VERTO-002: «ferā» ha letture ${feraQ.join(', ')}`);
const ORDER = C.UNITS.map((u) => u.id);
const BANK = BANKSRC.map((b, i) => { const tags = b[2].split(/\s+/); return { id: 'b' + i, la: b[0], it: b[1].split('|'), tags, focus: tags.slice().sort((a, c) => ORDER.indexOf(c) - ORDER.indexOf(a))[0], tip: b[3] || '', tokens: SN.resolveBank(b[0], tags, b[4]), src: 'bank' }; });
L.init({ bank: BANK, rand: mulberry32(11) });
let analizza = 0, completa = 0, accorda = 0;
for (const f of L.FLAT) {
  for (let rep = 0; rep < 3; rep++) {
    for (const it of L.buildLesson(f.lesson.id, { teach: true })) {
      const where = `${f.lesson.id} ${it.type} ${it.uid || ''} ${it.q || ''}`;
      if (it.type === 'analizza') {
        analizza++;
        if (!it.validQ) { err(`VERTO-002: ${where} senza letture con le quantità`); continue; }
        if (!it.options.includes(it.correct)) err(`VERTO-002: ${where}: la risposta giusta non è tra le opzioni`);
        if (!it.validQ.includes(it.correct) || !it.valid.includes(it.correct)) err(`VERTO-002: ${where}: «${it.correct}» non è una lettura della forma mostrata`);
        if (it.validQ.some((d) => !it.valid.includes(d))) err(`VERTO-002: ${where}: letture con quantità non comprese in quelle senza`);
        const wrongBoth = it.options.filter((o) => o !== it.correct);
        if (wrongBoth.some((o) => it.valid.includes(o))) err(`VERTO-002: ${where}: un distrattore è giusto senza quantità`);
        const e = E.BY_UID.get(it.uid);
        const qReadings = e.forms.filter((x) => x.q.normalize('NFC') === it.q.normalize('NFC')).map((x) => x.d);
        if (it.validQ.some((d) => !qReadings.includes(d))) err(`VERTO-002: ${where}: lettura accettata che non corrisponde a «${it.q}»`);
      }
      if (it.type === 'completa' || it.type === 'accorda') {
        if (it.type === 'completa') completa++; else accorda++;
        if (!it.optionsQ || it.optionsQ.length !== it.options.length) { err(`VERTO-002: ${where}: opzioni senza quantità`); continue; }
        it.options.forEach((o, k) => { if (E.plain(it.optionsQ[k]).toLowerCase() !== o.toLowerCase()) err(`VERTO-002: ${where}: opzione «${o}» con quantità «${it.optionsQ[k]}»`); });
        const k = it.options.findIndex((o) => E.norm(o) === E.norm(it.answer));
        const want = it.type === 'completa' ? it.s.tokens[it.idx].q : it.aq;
        if (k < 0 || it.optionsQ[k].toLowerCase() !== String(want).toLowerCase()) err(`VERTO-002: ${where}: la risposta giusta si mostra come «${k < 0 ? '?' : it.optionsQ[k]}» invece di «${want}»`);
      }
    }
  }
}

// VERTO-004: vocativo in -ī solo per fīlius e i nomi propri latini in -ius
const VOC = [['socius', 'socie'], ['nuntius', 'nūntie'], ['gladius', 'gladie'], ['filius', 'fīlī'], ['dominus', 'domine']];
for (const [u, want] of VOC) {
  const e = E.BY_UID.get(u);
  const got = e.forms.filter((f) => f.key === 'n:voc:s').map((f) => f.q);
  if (got.join('/') !== want) err(`VERTO-004: vocativo di ${u}: ${got.join('/')} invece di ${want}`);
  const gen = e.forms.filter((f) => f.key === 'n:gen:s').map((f) => f.q).join('/');
  if (u !== 'dominus' && !/iī$/.test(gen)) err(`VERTO-004: genitivo di ${u} cambiato: ${gen}`);
}
if (E.analyze('soci').some((a) => a.e.uid === 'socius' && a.key === 'n:voc:s')) err('VERTO-004: «soci» è ancora analizzato come vocativo');

console.log('\nTest della revisione esterna');
console.log(`  VERTO-001: ${wrongTried} risposte sbagliate e ${RIGHT.length} giuste di prova; ${bankChecked} traduzioni della banca con varianti alterate`);
console.log(`  VERTO-002: ${analizza} analisi, ${completa} completamenti, ${accorda} concordanze controllati`);
console.log(`  VERTO-003: repertori ${GN.NOUNS.length} nomi, ${GN.ADJS.length} aggettivi, ${GN.VERBS.length} verbi; frasi generate ${gen}/40`);
console.log(`  VERTO-004: ${VOC.length} vocativi`);
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
[...new Set(errors)].slice(0, 30).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
