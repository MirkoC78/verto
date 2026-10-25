/* Test delle spiegazioni degli errori (VERTO-009): casi fissi per ogni tipo di esercizio, poi risposte sbagliate
   simulate su tutte le lezioni. Ogni spiegazione deve esistere, citare solo forme latine vere e non contenere buchi. */
const E = require('../src/engine.js');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
require('../src/italian.js'); require('../src/semantic.js'); require('../src/generator.js'); require('../src/reading.js');
require('../src/check.js');
const X = require('../src/explain.js');
const C = require('../src/course.js');
const BANKSRC = require('../src/bank.js');
const L = require('../src/lessons.js');
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const errors = [];
const err = (m) => errors.push(m);
const text = (a) => a.join(' ').replace(/<[^>]+>/g, '');
const ORDER = C.UNITS.map((u) => u.id);
const BANK = BANKSRC.map((b, i) => { const tags = b[2].split(/\s+/); return { id: 'b' + i, la: b[0], it: b[1].split('|'), tags, focus: tags.slice().sort((a, c) => ORDER.indexOf(c) - ORDER.indexOf(a))[0], tip: b[3] || '', tokens: SN.resolveBank(b[0], tags, b[4]), src: 'bank' }; });
const bank = (la) => BANK.find((s) => s.la === la);
function expect(name, out, ...needles) {
  const t = text(out);
  if (!out.length) return err(`${name}: nessuna spiegazione`);
  for (const n of needles) if (!t.includes(n)) err(`${name}: manca «${n}» in «${t}»`);
}

/* ---------- Casi fissi ---------- */
const lupus = bank('Lupus agnum in_silva videt.');
const s30 = { s: lupus };
expect('ruoli invertiti', X.laIt(s30, 'L’agnello vede il lupo nel bosco.'), 'scambiato i ruoli', 'Lupus', 'nominativo', 'agnum', 'accusativo');
expect('numero del verbo', X.laIt(s30, 'Il lupo vedono l’agnello nel bosco.'), '«vede», non «vedono»', 'videt', '3ª pers. sing.');
expect('parola mancante', X.laIt(s30, 'Il lupo vede l’agnello.'), 'Manca la traduzione di', 'in silva', '«bosco»');
expect('parola in più', X.laIt(s30, 'Il lupo vede l’agnello nel bosco oggi.'), '«oggi» non corrisponde');
const amici = BANK.find((s) => /\bnon\b/.test(s.la) && s.it[0].split(' ').length <= 6);
expect('negazione tolta', X.laIt({ s: amici }, amici.it[0].replace(/\bnon /, '')), 'deve dire «non»');
// confronto guidato: solo gli errori certi; una traduzione diversa ma possibile non riceve rilievi
expect('confronto guidato, ruoli', X.laItSure(s30, 'L’agnello vede il lupo nel bosco.'), 'scambiato i ruoli');
if (X.laItSure(s30, 'Il lupo osserva l’agnello nella foresta.').length) err('confronto guidato: rilievi su una traduzione diversa ma possibile');
expect('chiave di lettura', [X.reading(lupus)], 'soggetto Lupus', 'oggetto agnum', 'verbo videt', 'in silva: in + ablativo');
// retroversione: tessera con una forma sbagliata della parola giusta (agnus al nominativo invece di agnum)
const tl = SN.tiles(lupus.la);
expect('tessera sbagliata', X.itLa(s30, [{ key: tl[0] }, { distractor: true, uid: 'agnus', key: 'n:nom:s', at: 1 }, { key: tl[2] }, { key: tl[3] }]), 'Hai scelto agnus', 'nominativo', 'qui serve agnum', 'accusativo', 'oggetto');
expect('tessera mancante', X.itLa(s30, [{ key: tl[0] }, { key: tl[1] }, { key: tl[3] }]), 'Manca in silva');
expect('retroversione scritta', X.itLaTyped(s30, 'Lupus agnus in silva videt'), 'agnus è nominativo singolare', 'qui serve agnum');
// analisi, completa, concordanza, scrivi, lessico
const rosaeItem = { uid: 'rosa', form: 'rosae', q: 'rosae', valid: ['genitivo singolare', 'dativo singolare', 'nominativo plurale'], validQ: ['genitivo singolare', 'dativo singolare', 'nominativo plurale'] };
expect('analisi', X.analizza(rosaeItem, 'accusativo singolare'), 'non è l’accusativo singolare', 'rosam', 'può essere genitivo singolare');
expect('completa', X.completa({ s: lupus, idx: 1, options: ['agnus', 'agnum', 'agno'], optionsQ: ['agnus', 'agnum', 'agnō'] }, 0), 'agnus è nominativo singolare', 'qui serve agnum', 'oggetto');
expect('concordanza', X.accorda({ uid: 'bonus', key: 'a:pos:acc:s:f', noun: { uid: 'rosa', f: 'rosam', q: 'rosam', d: 'accusativo singolare' }, answer: 'bonam', aq: 'bonam', options: ['bonum', 'bonam', 'bonae'] }, 0), 'bonum è', 'femminile', 'serve bonam');
expect('scrivi, altra forma', X.scrivi({ uid: 'rosa', desc: 'accusativo singolare', answers: ['rosam'], qs: ['rosam'] }, 'rosae'), 'rosae è genitivo singolare', 'l’accusativo singolare è rosam');
expect('scrivi, forma inesistente', X.scrivi({ uid: 'rosa', desc: 'accusativo singolare', answers: ['rosam'], qs: ['rosam'] }, 'rosan'), 'non è una forma di rosa', 'rosam');
expect('lessico', X.lessico({ uid: 'lupus' }, 'agnus'), 'lupus significa «lupo»', 'agnus significa «agnello»');
expect('quantità', X.analizza({ uid: 'terra', form: 'terra', q: 'terrā', valid: ['nominativo singolare', 'vocativo singolare', 'ablativo singolare'], validQ: ['ablativo singolare'] }, 'nominativo singolare', { quant: true }), 'terrā non è il nominativo singolare', 'terrā è ablativo singolare');

/* ---------- Risposte sbagliate simulate su tutte le lezioni ---------- */
L.init({ bank: BANK, rand: mulberry32(9) });
const latinOK = (out, where) => {
  for (const m of out.join(' ').matchAll(/<span class="la" lang="la">([^<]*)<\/span>/g)) {
    for (const w of SN.words(m[1].replace(/^-/, ''))) if (!E.analyze(w).length && !/^-/.test(m[1])) { err(`${where}: parola latina sconosciuta «${w}» nella spiegazione`); return; }
  }
  if (/\b(undefined|null|NaN)\b|\[object/.test(text(out))) err(`${where}: spiegazione con un buco: ${text(out)}`);
};
const counts = {};
for (const f of L.FLAT) {
  for (let rep = 0; rep < 2; rep++) {
    for (const item of L.buildLesson(f.lesson.id, { teach: false })) {
      const where = `${f.lesson.id} ${item.type}`;
      let out = null;
      try {
        if (item.type === 'analizza') { const k = item.options.findIndex((x) => !item.valid.includes(x)); if (k >= 0) out = X.analizza(item, item.options[k], { quant: rep === 1 }); }
        else if (item.type === 'completa') { const k = item.options.findIndex((x) => E.norm(x) !== E.norm(item.answer)); out = X.completa(item, k, { quant: rep === 1 }); }
        else if (item.type === 'accorda') { const k = item.options.findIndex((x) => E.norm(x) !== E.norm(item.answer)); out = X.accorda(item, k, { quant: rep === 1 }); }
        else if (item.type === 'scrivi') { const e = E.BY_UID.get(item.uid); const other = e.forms.find((x) => !item.answers.includes(x.f) && !x.f.includes(' ')); if (other) out = X.scrivi(item, other.f, { quant: rep === 1 }); }
        else if (item.type === 'lessico') out = X.lessico(item, item.options.find((u) => u !== item.uid));
        else if (item.type === 'la_it') { const w = item.s.it[0].replace(/[.!?]$/, '').split(' '); out = X.laIt(item, w.slice().reverse().join(' '), { quant: rep === 1 }); }
        else if (item.type === 'it_la') {
          // una forma sbagliata al posto di una parola della frase
          const toks = item.s.tokens; const at = toks.findIndex((t) => t && ['n', 'v', 'a', 'p'].includes((E.BY_UID.get(t.uid) || {}).k));
          if (at >= 0) { const e = E.BY_UID.get(toks[at].uid); const alt = e.forms.find((x) => x.key !== toks[at].key && E.norm(x.f) !== E.norm(toks[at].w)); if (alt) { const tl2 = SN.tiles(item.s.la); out = X.itLa(item, tl2.map((k, i) => (i === toks[at].tile ? { distractor: true, uid: e.uid, key: alt.key, at } : { key: k })), { quant: rep === 1 }); } }
        }
      } catch (e) { err(`${where}: eccezione ${e.stack.split('\n').slice(0, 2).join(' ')}`); continue; }
      if (!out) continue;
      counts[item.type] = (counts[item.type] || 0) + 1;
      if (!out.length || !text(out).trim()) err(`${where}: nessuna spiegazione`);
      latinOK(out, where);
    }
  }
}
console.log('\nTest delle spiegazioni degli errori');
console.log(`  Casi fissi: 21; risposte sbagliate simulate: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
[...new Set(errors)].slice(0, 25).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
