// Mostra a testo gli esercizi di una lezione: node tools/peek-lesson.js n1a [volte]
const E = require('../src/engine.js');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
require('../src/italian.js'); require('../src/semantic.js'); require('../src/generator.js'); require('../src/reading.js');
const BANKSRC = require('../src/bank.js');
const L = require('../src/lessons.js');
const ORDER = L.ORDER;
const BANK = BANKSRC.map((b, i) => { const tags = b[2].split(/\s+/); return { id: 'b' + i, la: b[0], it: b[1].split('|'), tags, focus: tags.slice().sort((a, c) => ORDER.indexOf(c) - ORDER.indexOf(a))[0], tokens: SN.resolveBank(b[0], tags, b[4]), src: 'bank' }; });
L.init({ bank: BANK });
const id = process.argv[2] || 'n1a';
const times = +process.argv[3] || 1;
for (let r = 0; r < times; r++) {
  const its = L.buildLesson(id, { teach: r === 0 });
  console.log(`\n=== ${id} (${its.length} schede ed esercizi)`);
  for (const it of its) {
    const e = it.uid ? L.entryOf(it.uid) : null;
    if (it.type === 'teach') console.log('  [scheda]', Object.keys(it.card).join(','), it.card.say || it.card.p || (it.card.ex ? it.card.ex.join(' = ') : ''));
    else if (it.s) console.log(`  [${it.type}] ${SN.render(it.s.la, it.s.tokens, true)}  →  ${it.s.it[0]}${it.newWords && it.newWords.length ? '  (nuova: ' + it.newWords + ')' : ''}${it.type === 'completa' ? '  [manca: ' + it.answer + ' tra ' + it.options + ']' : ''}`);
    else if (it.type === 'analizza') console.log(`  [analizza${it.quiz ? ' controllo' : ''}] ${it.q} (${e.lemma}) → ${it.correct} | opzioni: ${it.options.join(' / ')}`);
    else if (it.type === 'scrivi') console.log(`  [scrivi] ${e.lemma}: ${it.desc} → ${it.qs.join('/')}`);
    else if (it.type === 'accorda') console.log(`  [accorda] ${it.noun.q} + ${e.lemma} → ${it.aq} | ${it.options.join(' / ')}`);
    else if (it.type === 'abbina') console.log(`  [abbina] ${it.pairs.map((p) => p.lq + '=' + p.it).join(', ')}`);
    else if (it.type === 'lessico') console.log(`  [lessico${it.reverse ? ' inverso' : ''}] ${e.lemma} | ${it.options.join(', ')}`);
    else console.log(`  [${it.type}] ${it.q || it.word}: ${it.right} | ${it.options.join(' / ')}${it.why ? ' (' + it.why + ')' : ''}`);
  }
}
