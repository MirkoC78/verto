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
