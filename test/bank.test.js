/* Test della banca di frasi e delle massime: ogni parola è riconosciuta dal motore,
   gli argomenti dichiarati bastano a riconoscerla, le traduzioni ci sono e sono pulite. */
const E = require('../src/engine.js');
E.loadLexicon(require('../src/lexicon.js'));
const BANK = require('../src/bank.js');
const { TOPICS, SENTENTIAE } = require('../src/topics.js');
const TOPIC_IDS = new Set(TOPICS.map((t) => t.id));
const errors = [];
const perTopic = {};
let ok = 0;
const words = (la) => la.replace(/_/g, ' ').split(/\s+/).map((w) => w.replace(/[^A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]/g, '')).filter(Boolean);
BANK.forEach((b, i) => {
  const [la, it, tags] = b;
  const label = `frase ${i + 1} «${la}»`;
  const T = new Set(tags.split(/\s+/));
  let good = true;
  for (const t of T) if (!TOPIC_IDS.has(t)) { errors.push(`${label}: argomento inesistente ${t}`); good = false; }
  for (const w of words(la)) {
    const an = E.analyze(w);
    if (!an.length) { errors.push(`${label}: parola sconosciuta «${w}»`); good = false; continue; }
    if (!an.some((a) => a.req.every((t) => T.has(t)))) { errors.push(`${label}: «${w}» richiede argomenti non dichiarati (${[...new Set(an.map((a) => a.req.join('+')))].join(' | ')})`); good = false; }
  }
  const its = String(it || '').split('|');
  if (!its.length || its.some((x) => !x.trim() || /\s{2}|\s[,.]|undefined/.test(x))) { errors.push(`${label}: traduzione mancante o sporca`); good = false; }
  if (good) ok++;
  for (const t of T) perTopic[t] = (perTopic[t] || 0) + 1;
});
// massime: si contano le parole non presenti nel lessico (le massime si leggono con la traduzione accanto)
let sUnknown = 0;
const unknownWords = new Set();
SENTENTIAE.forEach((s) => { for (const w of words(s[0])) if (!E.analyze(w).length) { sUnknown++; unknownWords.add(w.toLowerCase()); } });
console.log('\nTest della banca di frasi');
console.log(`  Frasi verificate: ${ok}/${BANK.length}`);
console.log('  Frasi per argomento: ' + TOPICS.map((t) => `${t.id} ${perTopic[t.id] || 0}`).join(', '));
console.log(`  Massime: ${SENTENTIAE.length}; parole fuori lessico nelle massime: ${unknownWords.size}`);
if (errors.length) { console.log('\nErrori:'); errors.forEach((e) => console.log('  ✗ ' + e)); process.exitCode = 1; }
else console.log('  Nessun errore.');

/* ---------- Ordine libero nella retroversione ---------- */
const SN = require('../src/sentence.js');
const ord = [];
BANK.forEach((b) => { if (!SN.orderOK(b[0], SN.tiles(b[0]))) ord.push(`ordine originale rifiutato: «${b[0]}»`); });
const CASES = [
  ['Puella rosam amat.', ['rosam', 'puella', 'amat'], true],
  ['Puella rosam amat.', ['amat', 'rosam', 'puella'], true],
  ['Puellae in_silva ambulant.', ['in_silva', 'ambulant', 'puellae'], true],
  ['Ego te amo, tu me non amas.', ['te', 'ego', 'amo', 'tu', 'me', 'non', 'amas'], true],
  ['Ego te amo, tu me non amas.', ['te', 'ego', 'amo', 'tu', 'non', 'me', 'amas'], false],
  ['Ego te amo, tu me non amas.', ['tu', 'me', 'amo', 'ego', 'te', 'non', 'amas'], false],
  ['Laboro et canto.', ['canto', 'et', 'laboro'], false],
  ['Dum pueri ludunt, ancillae cenam parant.', ['dum', 'ludunt', 'pueri', 'cenam', 'ancillae', 'parant'], true],
  ['Dum pueri ludunt, ancillae cenam parant.', ['pueri', 'dum', 'ludunt', 'ancillae', 'cenam', 'parant'], false],
  ['Puer quem vides meus filius est.', ['puer', 'quem', 'vides', 'filius', 'meus', 'est'], true],
  ['Roma maior est quam Tusculum.', ['maior', 'est', 'roma', 'quam', 'tusculum'], true],
  ['Roma maior est quam Tusculum.', ['roma', 'quam', 'maior', 'est', 'tusculum'], false],
];
for (const [la, ans, want] of CASES) if (SN.orderOK(la, ans) !== want) ord.push(`ordine «${ans.join(' ')}» per «${la}»: atteso ${want ? 'accettato' : 'rifiutato'}`);
const TYPED = [['Puellae in_silva ambulant.', 'in silva puellae ambulant', true], ['Puellae in_silva ambulant.', 'puellae silva in ambulant', false], ['Servi dominum suum timent.', 'Dominum suum servi timent', true]];
for (const [la, typed, want] of TYPED) { const t = SN.typedTiles(la, typed); const ok = !!t && SN.orderOK(la, t); if (ok !== want) ord.push(`risposta scritta «${typed}» per «${la}»: attesa ${want ? 'accettata' : 'rifiutata'}`); }
console.log(`  Ordine libero: ${BANK.length} frasi nell'ordine originale, ${CASES.length + TYPED.length} casi di prova`);
if (ord.length) { ord.forEach((e) => console.log('  ✗ ' + e)); process.exitCode = 1; }
