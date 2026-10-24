/* Test del percorso: per ogni lezione
   - le parole nuove esistono nel lessico e non sono già state introdotte; le forme ammesse (keys) esistono;
   - le schede di spiegazione hanno latino riconosciuto dal motore; gli esempi usano solo parole già incontrate
     e argomenti già aperti; le tabelle rimandano a lemmi e forme esistenti;
   - la lezione produce da 8 a 12 esercizi ben formati, ripetendo la costruzione più volte;
   - ogni frase rientra negli argomenti aperti, usa solo forme ammesse, e ha al massimo una parola nuova
     (di un argomento già studiato prima dell'unità); nessuna nelle prove;
   - gli esercizi sulle forme e sul lessico restano nel perimetro. */
const E = require('../src/engine.js');
E.loadLexicon(require('../src/lexicon.js'));
const SN = require('../src/sentence.js');
require('../src/italian.js'); require('../src/semantic.js');
require('../src/generator.js');
require('../src/reading.js');
const C = require('../src/course.js');
const BANKSRC = require('../src/bank.js');
const L = require('../src/lessons.js');

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ORDER = L.ORDER;
const BANK = BANKSRC.map((b, i) => {
  const tags = b[2].split(/\s+/);
  return { id: 'b' + i, la: b[0], it: b[1].split('|'), tags, focus: tags.slice().sort((a, c) => ORDER.indexOf(c) - ORDER.indexOf(a))[0], tip: b[3] || '', tokens: SN.resolveBank(b[0], tags, b[4]), src: 'bank' };
});
const REPS = +process.argv[2] || 5;
L.init({ bank: BANK, rand: mulberry32(7) });

const errors = [];
const err = (m) => { if (errors.length < 400) errors.push(m); };
let lessons = 0, items = 0, sentences = 0, cards = 0, newWordItems = 0, bankUsed = new Set(), genUsed = 0, minItems = 99, maxItems = 0;
const types = {};
const seenLemma = new Map();
const laWords = (html) => [...String(html).matchAll(/<span class="la">(.*?)<\/span>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
for (const f of L.FLAT) {
  const l = f.lesson;
  lessons++;
  const sc = L.scopeOf(l.id);
  for (const lem of l.lemmas || []) {
    if (!L.entryOf(lem)) err(`${l.id}: lemma inesistente ${lem}`);
    if (seenLemma.has(lem)) err(`${l.id}: ${lem} già introdotto in ${seenLemma.get(lem)}`);
    seenLemma.set(lem, l.id);
  }
  if (l.keys) {
    const re = new RegExp(l.keys);
    const any = E.LEX.some((e) => e.forms.some((x) => re.test(x.key) && x.req.every((q) => sc.T.has(q))));
    if (!any) err(`${l.id}: nessuna forma per ${l.keys}`);
  }
  // schede di spiegazione
  for (const card of l.teach || []) {
    cards++;
    const texts = [card.p || '', card.say || ''].concat(card.tbl ? card.tbl.r.flat() : []);
    for (const t of texts) for (const ph of laWords(t)) for (const w of SN.words(ph.split(/,\s*/).filter((x) => !x.trim().startsWith('-')).join(' '))) if (!E.analyze(w).length && !/^(Kalendae|lyra|zona|hora|iam|lux|lyra)$/i.test(E.plain(w))) err(`${l.id}: parola sconosciuta nella scheda «${w}»`);
    if (card.ex) {
      const tags = [...sc.T];
      const toks = SN.resolveBank(card.ex[0], tags, card.ex[2]);
      toks.forEach((t, k) => {
        const w = SN.words(card.ex[0])[k];
        if (!t) { err(`${l.id}: esempio «${card.ex[0]}»: «${w}» sconosciuta o fuori dagli argomenti aperti`); return; }
        if (!sc.vocab.has(t.uid)) err(`${l.id}: esempio «${card.ex[0]}»: «${w}» (${t.uid}) non ancora incontrata`);
      });
    }
    for (const u of card.decl || []) if (!L.entryOf(u)) err(`${l.id}: tabella con lemma inesistente ${u}`);
    for (const [u, key] of card.conj || []) { const e = L.entryOf(u); if (!e || !e.forms.some((x) => x.key.startsWith(key + ':'))) err(`${l.id}: tabella ${u} ${key} vuota`); }
    for (const [u, key] of card.forms || []) { const e = L.entryOf(u); if (!e || !e.forms.some((x) => x.key === key)) err(`${l.id}: forma ${u} ${key} inesistente`); }
    for (const u of [card.adj, card.pron, card.part].filter(Boolean)) if (!L.entryOf(u)) err(`${l.id}: tabella con lemma inesistente ${u}`);
    for (const u of card.degrees || []) if (!L.entryOf(u)) err(`${l.id}: tabella dei gradi con lemma inesistente ${u}`);
    for (const [u] of card.lemmas || []) if (!L.entryOf(u)) err(`${l.id}: tabella dei lemmi con lemma inesistente ${u}`);
  }
  for (let rep = 0; rep < REPS; rep++) {
    let its;
    try { its = L.buildLesson(l.id, { teach: rep === 0 }); } catch (e) { err(`${l.id}: eccezione ${e.stack.split('\n').slice(0, 3).join(' ')}`); continue; }
    const practice = its.filter((x) => x.type !== 'teach' && !x.quiz);
    // dopo ogni tabella generata dal motore, una domanda di controllo
    its.forEach((x, k) => { if (x.type === 'teach' && L.TABLE_CARD(x.card) && !(its[k + 1] && its[k + 1].quiz)) err(`${l.id}: tabella senza domanda di controllo (${JSON.stringify(x.card).slice(0, 60)})`); });
    minItems = Math.min(minItems, practice.length); maxItems = Math.max(maxItems, practice.length);
    if (practice.length < 8 || practice.length > 12) err(`${l.id}: ${practice.length} esercizi (servono da 8 a 12)`);
    for (const it of its) {
      items++;
      types[it.type] = (types[it.type] || 0) + 1;
      if (it.options && new Set(it.options.map(String)).size !== it.options.length) err(`${l.id}: opzioni ripetute in ${it.type}`);
      if (it.options && it.options.length < 2) err(`${l.id}: meno di due opzioni in ${it.type}`);
      if (it.type === 'analizza' && !it.valid.includes(it.correct)) err(`${l.id}: analisi incoerente`);
      // forme fuori perimetro negli esercizi sulle forme
      if (['analizza', 'scrivi'].includes(it.type) && !it.quiz) {
        const e = L.entryOf(it.uid);
        if (!sc.formOK(e, it.key)) err(`${l.id}: ${it.type} con forma non ammessa ${it.uid} ${it.key}`);
        if (!sc.vocab.has(it.uid)) err(`${l.id}: ${it.type} su una parola non incontrata ${it.uid}`);
      }
      if (it.type === 'accorda') {
        if (!sc.formOK(L.entryOf(it.uid), it.key)) err(`${l.id}: accorda con forma non ammessa ${it.key}`);
        if (!sc.vocab.has(it.uid) || !sc.vocab.has(it.noun.uid)) err(`${l.id}: accorda con parole non incontrate`);
      }
      if (it.type === 'abbina') for (const p of it.pairs) if (!sc.vocab.has(p.uid)) err(`${l.id}: abbina con parola non incontrata ${p.uid}`);
      if (it.type === 'lessico') for (const u of it.options) if (!sc.vocab.has(u)) err(`${l.id}: lessico con parola non incontrata ${u}`);
      if (['lettura', 'suono', 'accento', 'sillabe', 'quantita'].includes(it.type) && !sc.vocab.has(it.uid)) err(`${l.id}: pronuncia su parola non incontrata ${it.uid}`);
      if (it.type === 'completa') {
        const tok = it.s.tokens[it.idx];
        const e = L.entryOf(tok.uid);
        for (const o of it.options) if (!e.forms.some((x) => E.norm(x.f) === E.norm(o) && sc.formOK(e, x.key))) err(`${l.id}: completa con opzione fuori perimetro «${o}»`);
      }
      if (it.s) {
        sentences++;
        if (it.s.src === 'bank') bankUsed.add(it.s.id); else genUsed++;
        const s = it.s;
        if (!s.tags.every((t) => sc.T.has(t))) err(`${l.id}: frase fuori argomento «${s.la}» [${s.tags}]`);
        const toks = s.tokens;
        if (!toks || toks.length !== SN.words(s.la).length || toks.some((t) => !t)) { err(`${l.id}: frase senza analisi completa «${s.la}»`); continue; }
        for (const t of toks) {
          const e = L.entryOf(t.uid);
          for (const k of t.alts || [t.key]) if (!sc.formOK(e, k)) err(`${l.id}: forma non ammessa «${t.w}» (${k}) in «${s.la}»`);
          if (E.norm(t.q) !== E.norm(t.w)) err(`${l.id}: quantità di «${t.w}» non corrispondenti (${t.q})`);
        }
        const unknown = [...new Set(toks.filter((t) => !sc.vocab.has(t.uid)).map((t) => t.uid))];
        if (unknown.length > sc.maxNew) err(`${l.id}: troppe parole nuove (${unknown}) in «${s.la}»`);
        if (unknown.some((u) => !sc.newOK(L.entryOf(u)))) err(`${l.id}: parola nuova non adatta (${unknown}) in «${s.la}»`);
        if (unknown.length) newWordItems++;
        if (JSON.stringify(unknown.sort()) !== JSON.stringify((it.newWords || []).slice().sort())) err(`${l.id}: parole nuove segnalate male in «${s.la}»: ${unknown} / ${it.newWords}`);
      }
    }
  }
}
console.log('\nTest del percorso');
console.log(`  Unità: ${C.UNITS.length}; lezioni: ${lessons}; schede di spiegazione: ${cards}; parole introdotte: ${seenLemma.size}`);
console.log(`  Costruzioni: ${REPS} per lezione; esercizi per lezione: da ${minItems} a ${maxItems}`);
console.log(`  Esercizi costruiti: ${items} (frasi: ${sentences}, della banca ${bankUsed.size} diverse, generate ${genUsed}; con una parola nuova: ${newWordItems})`);
console.log('  Tipi: ' + Object.entries(types).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
[...new Set(errors)].slice(0, 60).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
