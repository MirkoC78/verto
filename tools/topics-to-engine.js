/* Converte le tabelle dei paradigmi della teoria (scritte a mano in Verto 1) in tabelle generate dal motore
   e aggiunge l'argomento «Alfabeto e pronuncia». Si usa una volta: node tools/topics-to-engine.js */
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'src', 'topics.js');
const T = require(F);
const la = (s) => `<span class="la">${s}</span>`;
const conj = (list, cap) => (cap ? { conj: list, cap } : { conj: list });
const R = {
  v_pres: { 1: conj([['amo', 'v:ind:pres:act'], ['moneo', 'v:ind:pres:act'], ['lego', 'v:ind:pres:act'], ['capio', 'v:ind:pres:act'], ['audio', 'v:ind:pres:act'], ['sum', 'v:ind:pres:act']], 'Desinenze personali attive: -ō/-m, -s, -t, -mus, -tis, -nt') },
  n1: { 1: { decl: ['rosa'], cap: 'rosa, rosae, f., la rosa' } },
  n2: { 0: { decl: ['dominus', 'puer', 'templum'] }, 1: null },
  v_if: { 0: conj([['amo', 'v:ind:impf:act'], ['moneo', 'v:ind:impf:act'], ['lego', 'v:ind:impf:act'], ['audio', 'v:ind:impf:act'], ['sum', 'v:ind:impf:act']], 'Imperfetto: suffisso -ba-'), 1: conj([['amo', 'v:ind:fut:act'], ['moneo', 'v:ind:fut:act'], ['lego', 'v:ind:fut:act'], ['audio', 'v:ind:fut:act'], ['sum', 'v:ind:fut:act']], 'Futuro: -bō, -bis, -bit nella 1ª e 2ª; -am, -ēs, -et nelle altre') },
  v_poss: { 1: conj([['possum', 'v:ind:pres:act'], ['possum', 'v:ind:impf:act'], ['possum', 'v:ind:fut:act']], 'possum, potuī, posse'), 2: { lemmas: [['absum', 'a / ab + ablativo'], ['adsum', 'dativo'], ['desum', 'dativo'], ['praesum', 'dativo'], ['intersum', 'dativo'], ['prosum', 'dativo; prōd- davanti a vocale']] } },
  v_imper: { 0: conj([['amo', 'v:imp:pres:act'], ['moneo', 'v:imp:pres:act'], ['lego', 'v:imp:pres:act'], ['capio', 'v:imp:pres:act'], ['audio', 'v:imp:pres:act'], ['sum', 'v:imp:pres:act']]) },
  pron_pers: { 0: [{ pron: 'ego' }, { pron: 'tu' }, { pron: 'se' }] },
  v_pass: { 1: conj([['amo', 'v:ind:pres:pass'], ['amo', 'v:ind:impf:pass'], ['amo', 'v:ind:fut:pass']], 'amo, 1ª coniugazione'), 2: conj([['lego', 'v:ind:pres:pass'], ['lego', 'v:ind:fut:pass'], ['audio', 'v:ind:pres:pass']]) },
  n3: { 1: { decl: ['rex', 'corpus', 'civis', 'mare'] } },
  agg2: { 0: [{ adjNom: ['acer', 'fortis', 'felix'] }, { adj: 'fortis' }] },
  v_perf: { 1: conj([['amo', 'v:ind:perf:act'], ['amo', 'v:ind:ppf:act'], ['amo', 'v:ind:futant:act']]) },
  n45: { 0: { decl: ['exercitus', 'cornu', 'res', 'dies'] } },
  pron_dim: { 0: [{ pron: 'is' }, { pron: 'hic' }, { pron: 'ille' }] },
  pron_rel: { 0: { pron: 'qui' } },
  comp: { 0: { degrees: ['altus', 'fortis', 'pulcher', 'facilis', 'bonus', 'malus', 'magnus', 'parvus', 'multus'] } },
  v_irr: { 0: conj([['volo@v_irr', 'v:ind:pres:act'], ['nolo', 'v:ind:pres:act'], ['malo', 'v:ind:pres:act'], ['eo', 'v:ind:pres:act'], ['fero', 'v:ind:pres:act']]) },
  v_dep: { 1: { lemmas: [['hortor', '1ª coniugazione'], ['vereor', '2ª coniugazione'], ['sequor', '3ª coniugazione'], ['patior', 'mista'], ['largior', '4ª coniugazione']] } },
  v_part: { 0: { forms: [['amo', 'v:part:pres:nom:s:m', 'presente: contemporaneo, «che ama, amando»'], ['amo', 'v:part:perf:nom:s:m', 'perfetto: anteriore e passivo, «amato»'], ['amo', 'v:part:fut:nom:s:m', 'futuro: posteriore, «che sta per amare»']] } },
  v_inf: { 0: [{ forms: [['amo', 'v:inf:pres:act', 'presente attivo (contemporaneità)'], ['amo', 'v:inf:pres:pass', 'presente passivo'], ['amo', 'v:inf:perf:act', 'perfetto attivo (anteriorità)']] }, { p: `Il perfetto passivo e il futuro si formano con un participio e ${la('esse')}: ${la('amātum, -am, -um esse')} (essere stato amato), ${la('amātūrum, -am, -um esse')} (stare per amare). Il participio concorda con il soggetto in accusativo.` }] },
  v_cong: { 0: conj([['amo', 'v:cong:pres:act'], ['amo', 'v:cong:impf:act'], ['amo', 'v:cong:perf:act'], ['amo', 'v:cong:ppf:act']]) },
  agg1: { after0: { adj: 'bonus' } },
};
const ALF = {
  id: 'alf', short: 'Lettura', title: 'Alfabeto e pronuncia', group: 'alf',
  desc: 'lettere e suoni, dittonghi e gruppi di consonanti, vocali lunghe e brevi, sillabe e accento (legge della penultima)',
  body: [
    { p: 'In Italia il latino si legge con la <b>pronuncia scolastica</b> (detta anche ecclesiastica): le lettere si leggono quasi tutte come in italiano. Esiste anche la pronuncia <b>restituita</b>, più vicina a quella dei Romani antichi, in cui c e g sono sempre dure e ae si legge «ai».' },
    { tbl: { c: ['Lettera o gruppo', 'Pronuncia scolastica', 'Esempio'], r: [['c, g', 'dolci davanti a e, i, ae, oe; dure altrove', `${la('Cicerō')} «Cìcero», ${la('causa')} «càusa»`], ['ae, oe', 'e', `${la('Caesar')} «Cèsar», ${la('proelium')} «prèlium»`], ['au', 'au', `${la('aurum')} «àurum»`], ['ch, ph, th', 'c dura, f, t', `${la('schola')} «scòla», ${la('Athēnae')} «Atène»`], ['gn', 'come in «gnomo»', `${la('rēgnum')} «règnum»`], ['ti + vocale', 'zi (ma non dopo s, t, x)', `${la('grātia')} «gràzia»`], ['h', 'muta', `${la('hōra')} «òra»`], ['qu, gu + vocale', 'come in «acqua», «lingua»', `${la('aqua')}, ${la('lingua')}`], ['x', 'cs', `${la('dux')} «ducs»`], ['y', 'i', ''], ['j', 'i (davanti a vocale)', `${la('iam')}`]] } },
    { p: 'Ogni vocale può essere <b>lunga</b> o <b>breve</b>: i dizionari segnano le lunghe con un trattino (ā ē ī ō ū). Una <b>sillaba</b> è lunga se ha una vocale lunga o un dittongo, oppure se la sua vocale è seguita da due consonanti (anche x e z).' },
    { tbl: { c: ['Parola', 'Accento', 'Esempio'], r: [['di due sillabe', 'sulla prima', `${la('rosa')} «ròsa»`], ['di tre o più sillabe, penultima lunga', 'sulla penultima', `${la('fortūna')} «fortùna», ${la('magister')} «magìster»`], ['di tre o più sillabe, penultima breve', 'sulla terzultima', `${la('dominus')} «dòminus», ${la('agricola')} «agrìcola»`]] } },
    { p: 'È la <b>legge della penultima</b>. Il latino non ha parole tronche. Con le enclitiche (-que, -ne, -ve) l’accento cade sulla sillaba che le precede: «puellàque».' },
  ],
  tip: 'Quando leggi ad alta voce una parola nuova, contane le sillabe e guarda la penultima: è lei che decide l’accento.',
  trap: ['Muta + liquida (pr, tr, cl…) non allunga la sillaba: «tènebrae».', 'Una vocale davanti a un’altra vocale è di solito breve: «pàtria».'],
  ex: [],
};
const out = [];
for (const t of [ALF].concat(T.TOPICS)) {
  const r = R[t.id] || {};
  let body = [];
  t.body.forEach((b, i) => {
    if (i in r) { const v = r[i]; if (v === null) return; (Array.isArray(v) ? v : [v]).forEach((x) => body.push(x)); }
    else if (b.t) body.push(Object.assign({ tbl: b.t }, b.cap ? { cap: b.cap } : {}));
    else body.push(b);
    if (i === 0 && r.after0) body.push(r.after0);
  });
  out.push(Object.assign({}, t, { body }));
}
const q = (v) => JSON.stringify(v).replace(/<\/span>/g, '</span>');
const lines = [];
lines.push(`/* VERTO — programma del biennio e schede di teoria.
   Blocchi: {p: html} paragrafo · {ul: [..]} elenco · {tbl: {c, r}, cap} tabella di concetti (costruzioni, usi);
   le tabelle delle forme le genera il motore: {decl: [lemmi]}, {conj: [[lemma, chiave]]}, {adj}, {adjNom: [lemmi]},
   {pron}, {forms: [[lemma, chiave, etichetta]]}, {degrees: [lemmi]}, {lemmas: [[lemma, nota]]}. */
(function (root) {
const GROUPS = {
  alf: { name: 'Lettura', color: 'g-alf' },
  nom: { name: 'Morfologia del nome', color: 'g-nom' },
  ver: { name: 'Morfologia del verbo', color: 'g-ver' },
  pro: { name: 'Pronomi', color: 'g-pro' },
  sin: { name: 'Sintassi', color: 'g-sin' },
};

const TOPICS = [`);
for (const t of out) {
  lines.push('{');
  lines.push(`  id: ${q(t.id)}, short: ${q(t.short)}, title: ${q(t.title)}, group: ${q(t.group)},`);
  lines.push(`  desc: ${q(t.desc)},`);
  lines.push('  body: [');
  for (const b of t.body) lines.push('    ' + q(b).replace(/^\{"(\w+)":/, '{ $1: ').replace(/,"(\w+)":/g, ', $1: ').replace(/\}$/, ' }') + ',');
  lines.push('  ],');
  lines.push(`  tip: ${q(t.tip)},`);
  lines.push(`  trap: ${q(t.trap)},`);
  lines.push(`  ex: ${q(t.ex)},`);
  lines.push('},');
}
lines.push('];');
lines.push('');
const keep = fs.readFileSync(F, 'utf8');
const tail = keep.slice(keep.indexOf('const METHOD = ['));
lines.push(tail.replace('root.VERTO_TOPICS = { TOPICS, GROUPS, METHOD, SENTENTIAE, RANKS };', 'root.VERTO_TOPICS = { TOPICS, GROUPS, METHOD, SENTENTIAE, RANKS };'));
fs.writeFileSync(F, lines.join('\n'));
console.log('argomenti', out.length);
