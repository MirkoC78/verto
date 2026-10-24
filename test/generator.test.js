/* Test del generatore: 10.000 frasi su combinazioni di argomenti diverse.
   Per ogni frase: nessuna eccezione, ogni parola riconosciuta dal motore e dentro gli argomenti scelti,
   argomenti dichiarati dentro la selezione, traduzioni italiane presenti e pulite.
   Uso: node test/generator.test.js [numero] [file-campione] */
const E = require('../src/engine.js');
E.loadLexicon(require('../src/lexicon.js'));
require('../src/italian.js'); require('../src/semantic.js');
const GN = require('../src/generator.js');
const { TOPICS } = require('../src/topics.js');
const fs = require('fs');

// generatore pseudo-casuale riproducibile (mulberry32)
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SEED = 20261024;
const rnd = mulberry32(SEED);
GN.seed(rnd);

const ORDER = TOPICS.map((t) => t.id);
const N = +process.argv[2] || 10000;
const sampleFile = process.argv[3] || null;
// combinazioni: metà «fino all'argomento k» (come nel percorso), metà sottoinsiemi casuali (sempre con il presente)
function combo(i) {
  if (i % 2 === 0) { const k = 1 + (i / 2) % ORDER.length; return ORDER.slice(0, k); }
  const set = ['v_pres'];
  for (const t of ORDER) if (!set.includes(t) && rnd() < 0.45) set.push(t);
  return set;
}
const words = (la) => la.replace(/_/g, ' ').split(/\s+/).map((w) => w.replace(/[^A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]/g, '')).filter(Boolean);
const stats = { ok: 0, null: 0, err: 0, unknown: 0, outside: 0, itBad: 0 };
const byFocus = {};
const fails = [];
const samples = [];
const seenCombos = new Set();
const t0 = Date.now();
let i = -1;
while (stats.ok < N && i < 3 * N) {
  i++;
  const sel = combo(i);
  seenCombos.add(sel.slice().sort().join(' '));
  const focus = sel[Math.floor(rnd() * sel.length)];
  let s;
  try { s = GN.generate(sel, focus); } catch (e) { stats.err++; fails.push(`eccezione [${sel.join(' ')}] ${focus}: ${e.message}`); continue; }
  if (!s) { stats.null++; continue; }
  const T = new Set(sel);
  let bad = null, unk = null;
  for (const w of words(s.la)) {
    const an = E.analyze(w);
    if (!an.length) { unk = w; break; }
    if (!an.some((a) => a.req.every((q) => T.has(q)))) { bad = w; break; }
  }
  if (unk) { stats.unknown++; fails.push(`parola sconosciuta «${unk}»: ${s.la}`); continue; }
  if (bad || s.tags.some((q) => !T.has(q))) { stats.outside++; fails.push(`fuori argomento «${bad || s.tags}» [${sel.join(' ')}]: ${s.la}`); continue; }
  if (!s.it.length || s.it.some((x) => /undefined|null|\s{2}|\s[,.!?]|^\s|\s$/.test(x))) { stats.itBad++; fails.push(`italiano: ${s.la} → ${s.it.join(' | ')}`); continue; }
  stats.ok++;
  byFocus[s.focus] = (byFocus[s.focus] || 0) + 1;
  if (samples.length < 50 && stats.ok % Math.max(1, Math.floor(N / 50)) === 1) samples.push({ s, sel, focus });
}
const dt = ((Date.now() - t0) / 1000).toFixed(1);
console.log('\nTest del generatore');
console.log(`  Richieste: ${i + 1} su ${seenCombos.size} combinazioni di argomenti — tempo ${dt} s`);
console.log(`  Frasi generate e verificate: ${stats.ok}; richieste senza frase possibile: ${stats.null}`);
console.log(`  Errori: eccezioni ${stats.err}, parole sconosciute ${stats.unknown}, fuori argomento ${stats.outside}, italiano ${stats.itBad}`);
console.log('  Frasi per argomento di focus: ' + ORDER.map((t) => `${t} ${byFocus[t] || 0}`).join(', '));
if (stats.ok < N) fails.push(`solo ${stats.ok} frasi su ${N}`);
if (fails.length) { console.log('\nPrimi errori:'); fails.slice(0, 25).forEach((f) => console.log('  ✗ ' + f)); process.exitCode = 1; }
if (sampleFile) {
  const md = ['# Verto — 50 frasi generate a campione', '', `Seme ${SEED}; per ogni frase: latino, traduzioni accettate, argomento esercitato e argomenti necessari.`, ''];
  samples.forEach(({ s }, k) => {
    md.push(`${k + 1}. **${s.la.replace(/_/g, ' ')}**  `);
    md.push(`   ${s.it.join(' · ')}  `);
    md.push(`   _argomento: ${s.focus}; argomenti necessari: ${s.tags.slice().sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).join(', ')}_`);
  });
  fs.writeFileSync(sampleFile, md.join('\n') + '\n');
  console.log(`  Campione di ${samples.length} frasi scritto in ${sampleFile}`);
}
