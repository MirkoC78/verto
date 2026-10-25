/* Test dei contenuti di teoria: ogni parola latina nei testi è riconosciuta dal motore, gli esempi rientrano negli
   argomenti dichiarati, e ogni tabella delle forme rimanda a lemmi e forme che il motore genera davvero. */
const E = require('../src/engine.js');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
const { TOPICS, METHOD } = require('../src/topics.js');
const errors = [];
let words = 0, tables = 0, examples = 0;
// parole citate come esempio di grafia, fuori dal lessico di base
const EXTRA = new Set(['kalendae', 'lyra', 'zona', 'hora', 'iam', 'fruor', 'fungor', 'potior', 'vescor', 'ullus', 'simul', 'res', 'gestae', 'oriente', 'improbus', 'itum', 'vergilius', 'vergili']);
const laOf = (html) => [...String(html).matchAll(/<span class="la">(.*?)<\/span>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
const ORDER = TOPICS.map((t) => t.id);
for (const t of TOPICS) {
  const html = JSON.stringify(t.body) + JSON.stringify(t.trap || []) + (t.tip || '');
  for (const ph of laOf(html.replace(/\\"/g, '"'))) {
    for (const piece of ph.split(/[,;/]\s*|\s+[→=]\s+|\s+—\s+/)) {
      if (/^\s*[-–]|-\s*$/.test(piece)) continue;
      for (const w of SN.words(piece)) { words++; if (!E.analyze(w).length && !EXTRA.has(E.norm(w))) errors.push(`${t.id}: parola sconosciuta «${w}»`); }
    }
  }
  const find = (u) => E.BY_UID.get(u);
  for (const b of t.body) {
    if (b.decl) for (const u of b.decl) { tables++; if (!find(u)) errors.push(`${t.id}: tabella con lemma inesistente ${u}`); }
    if (b.conj) for (const [u, k] of b.conj) { tables++; const e = find(u); if (!e || !e.forms.some((f) => f.key.startsWith(k + ':'))) errors.push(`${t.id}: tabella ${u} ${k} vuota`); }
    if (b.forms) for (const [u, k] of b.forms) { tables++; const e = find(u); if (!e || !e.forms.some((f) => f.key === k)) errors.push(`${t.id}: forma ${u} ${k} inesistente`); }
    for (const u of [b.adj, b.pron].filter(Boolean)) { tables++; if (!find(u)) errors.push(`${t.id}: tabella con lemma inesistente ${u}`); }
    for (const u of [].concat(b.degrees || [], b.adjNom || [], (b.lemmas || []).map((x) => x[0]))) { tables++; if (!find(u)) errors.push(`${t.id}: tabella con lemma inesistente ${u}`); }
  }
  // esempi: parole riconosciute negli argomenti fino a questo
  const T = new Set(ORDER.slice(0, ORDER.indexOf(t.id) + 1));
  for (const [laTxt] of t.ex || []) {
    examples++;
    const toks = SN.resolveBank(laTxt, T);
    toks.forEach((x, k) => { if (!x) errors.push(`${t.id}: esempio «${laTxt}»: «${SN.words(laTxt)[k]}» non riconosciuta negli argomenti fino a qui`); });
  }
}
console.log('\nTest dei contenuti di teoria');
console.log(`  Argomenti: ${TOPICS.length}; parole latine controllate: ${words}; tabelle dal motore: ${tables}; esempi: ${examples}; passi del metodo: ${METHOD.length}`);
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
errors.forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
