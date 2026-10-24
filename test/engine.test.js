/* Test del motore morfologico: paradigmi di riferimento (forme senza segni), analisi delle forme,
   argomenti necessari per riconoscerle, e confronto con le forme generate da Verto 1 (nessuna perdita). */
const E = require('../src/engine.js');
E.loadLexicon(require('../src/lexicon.js'));
const fs = require('fs');
const path = require('path');

const errors = [];
let checks = 0;
const P = (s) => E.plain ? E.plain(s) : s;
const ent = (head, k) => E.LEX.find((e) => e.head === head && (!k || e.k === k) && !(k === 'v' && e.irr && head === 'volo'));
// forme con una data chiave (senza segni di quantità)
function formsOf(e, key) { return e.forms.filter((x) => x.key === key).map((x) => x.f); }
function expect(head, k, key, want) {
  checks++;
  const e = typeof head === 'string' ? ent(head, k) : head;
  if (!e) { errors.push(`lemma mancante: ${head}`); return; }
  const got = formsOf(e, key);
  const W = want.split('/');
  if (!W.every((w) => got.includes(w))) errors.push(`${e.head} ${key}: atteso ${want}, trovato ${got.join('/') || '—'}`);
}
// paradigma: elenco di chiavi e forme, separate da spazi (le alternative con /)
function para(head, k, prefix, keys, forms) {
  const fs_ = forms.split(/\s+/);
  keys.forEach((kk, i) => { if (fs_[i] && fs_[i] !== '-') expect(head, k, prefix + kk, fs_[i]); });
}
const CASES = ['nom', 'gen', 'dat', 'acc', 'voc', 'abl'];
const NS = CASES.map((c) => c + ':s'), NP = CASES.map((c) => c + ':p');
const P6 = [0, 1, 2, 3, 4, 5];

/* ---------- Nomi ---------- */
para('rosa', 'n', 'n:', NS, 'rosa rosae rosae rosam rosa rosa');
para('rosa', 'n', 'n:', NP, 'rosae rosarum rosis rosas rosae rosis');
expect('dea', 'n', 'n:dat:p', 'deabus');
para('dominus', 'n', 'n:', NS, 'dominus domini domino dominum domine domino');
para('dominus', 'n', 'n:', NP, 'domini dominorum dominis dominos domini dominis');
expect('filius', 'n', 'n:voc:s', 'fili');
para('puer', 'n', 'n:', NS, 'puer pueri puero puerum puer puero');
para('ager', 'n', 'n:', NS, 'ager agri agro agrum ager agro');
para('templum', 'n', 'n:', NP, 'templa templorum templis templa templa templis');
expect('deus', 'n', 'n:nom:p', 'di/dii/dei');
expect('deus', 'n', 'n:dat:p', 'dis');
para('rex', 'n', 'n:', NS, 'rex regis regi regem rex rege');
para('rex', 'n', 'n:', NP, 'reges regum regibus reges reges regibus');
expect('civis', 'n', 'n:gen:p', 'civium');
expect('urbs', 'n', 'n:gen:p', 'urbium');
expect('mons', 'n', 'n:gen:p', 'montium');
expect('pater', 'n', 'n:gen:p', 'patrum');
expect('canis', 'n', 'n:gen:p', 'canum');
para('mare', 'n', 'n:', NS, 'mare maris mari mare mare mari');
para('mare', 'n', 'n:', NP, 'maria marium maribus maria maria maribus');
para('corpus', 'n', 'n:', NP, 'corpora corporum corporibus corpora corpora corporibus');
expect('animal', 'n', 'n:abl:s', 'animali');
expect('navis', 'n', 'n:abl:s', 'navi/nave');
expect('iter', 'n', 'n:gen:s', 'itineris');
para('exercitus', 'n', 'n:', NS, 'exercitus exercitus exercitui exercitum exercitus exercitu');
para('exercitus', 'n', 'n:', NP, 'exercitus exercituum exercitibus exercitus exercitus exercitibus');
para('cornu', 'n', 'n:', NP, 'cornua cornuum cornibus cornua cornua cornibus');
para('res', 'n', 'n:', NS, 'res rei rei rem res re');
para('res', 'n', 'n:', NP, 'res rerum rebus res res rebus');
para('dies', 'n', 'n:', NS, 'dies diei diei diem dies die');
expect('domus', 'n', 'n:loc:s', 'domi');
expect('domus', 'n', 'n:abl:s', 'domo');
expect('domus', 'n', 'n:acc:p', 'domos');
expect('Roma', 'n', 'n:loc:s', 'Romae');
expect('Athenae', 'n', 'n:loc:p', 'Athenis');
expect('vis', 'n', 'n:acc:s', 'vim');
expect('Iuppiter', 'n', 'n:gen:s', 'Iovis');

/* ---------- Aggettivi ---------- */
const AS = (g) => CASES.map((c) => `a:pos:${c}:s:${g}`);
para('bonus', 'a', '', AS('f'), 'bona bonae bonae bonam bona bona');
para('bonus', 'a', '', AS('m'), 'bonus boni bono bonum bone bono');
expect('pulcher', 'a', 'a:pos:nom:s:f', 'pulchra');
expect('liber', 'a', 'a:pos:nom:s:f', 'libera');
para('acer', 'a', '', AS('f'), 'acris acris acri acrem acris acri');
para('fortis', 'a', '', AS('n'), 'forte fortis forti forte forte forti');
expect('fortis', 'a', 'a:pos:gen:p:m', 'fortium');
expect('fortis', 'a', 'a:pos:nom:p:n', 'fortia');
expect('felix', 'a', 'a:pos:gen:s:m', 'felicis');
expect('vetus', 'a', 'a:pos:abl:s:m', 'vetere');
expect('vetus', 'a', 'a:pos:gen:p:m', 'veterum');
expect('totus', 'a', 'a:pos:gen:s:f', 'totius');
expect('totus', 'a', 'a:pos:dat:s:m', 'toti');
expect('alius', 'a', 'a:pos:nom:s:n', 'aliud');
expect('altus', 'a', 'a:comp:nom:s:m', 'altior');
expect('altus', 'a', 'a:comp:nom:s:n', 'altius');
expect('altus', 'a', 'a:comp:gen:s:m', 'altioris');
expect('altus', 'a', 'a:sup:nom:s:m', 'altissimus');
expect('bonus', 'a', 'a:comp:nom:s:m', 'melior');
expect('bonus', 'a', 'a:sup:nom:s:m', 'optimus');
expect('malus', 'a', 'a:comp:nom:s:m', 'peior');
expect('magnus', 'a', 'a:comp:nom:s:n', 'maius');
expect('magnus', 'a', 'a:sup:nom:s:m', 'maximus');
expect('parvus', 'a', 'a:comp:nom:s:m', 'minor');
expect('parvus', 'a', 'a:comp:nom:s:n', 'minus');
expect('parvus', 'a', 'a:comp:gen:s:m', 'minoris');
expect('multus', 'a', 'a:comp:nom:s:n', 'plus');
expect('multus', 'a', 'a:comp:nom:p:m', 'plures');
expect('pulcher', 'a', 'a:sup:nom:s:m', 'pulcherrimus');
expect('acer', 'a', 'a:sup:nom:s:m', 'acerrimus');
expect('facilis', 'a', 'a:sup:nom:s:m', 'facillimus');
expect('fortis', 'a', 'a:comp:nom:s:m', 'fortior');

/* ---------- Verbi ---------- */
const VK = (m, t, v) => P6.map((p) => `v:${m}:${t}:${v}:${p}`);
para('amo', 'v', '', VK('ind', 'pres', 'act'), 'amo amas amat amamus amatis amant');
para('amo', 'v', '', VK('ind', 'impf', 'act'), 'amabam amabas amabat amabamus amabatis amabant');
para('amo', 'v', '', VK('ind', 'fut', 'act'), 'amabo amabis amabit amabimus amabitis amabunt');
para('amo', 'v', '', VK('ind', 'pres', 'pass'), 'amor amaris amatur amamur amamini amantur');
para('amo', 'v', '', VK('ind', 'impf', 'pass'), 'amabar amabaris amabatur amabamur amabamini amabantur');
para('amo', 'v', '', VK('ind', 'fut', 'pass'), 'amabor amaberis amabitur amabimur amabimini amabuntur');
para('amo', 'v', '', VK('cong', 'pres', 'act'), 'amem ames amet amemus ametis ament');
para('amo', 'v', '', VK('cong', 'impf', 'act'), 'amarem amares amaret amaremus amaretis amarent');
para('amo', 'v', '', VK('ind', 'perf', 'act'), 'amavi amavisti amavit amavimus amavistis amaverunt/amavere');
para('amo', 'v', '', VK('ind', 'ppf', 'act'), 'amaveram amaveras amaverat amaveramus amaveratis amaverant');
para('amo', 'v', '', VK('ind', 'futant', 'act'), 'amavero amaveris amaverit amaverimus amaveritis amaverint');
para('amo', 'v', '', VK('cong', 'perf', 'act'), 'amaverim amaveris amaverit amaverimus amaveritis amaverint');
para('amo', 'v', '', VK('cong', 'ppf', 'act'), 'amavissem amavisses amavisset amavissemus amavissetis amavissent');
expect('amo', 'v', 'v:inf:pres:act', 'amare');
expect('amo', 'v', 'v:inf:pres:pass', 'amari');
expect('amo', 'v', 'v:inf:perf:act', 'amavisse');
expect('amo', 'v', 'v:imp:pres:act:1', 'ama');
expect('amo', 'v', 'v:imp:pres:act:4', 'amate');
expect('amo', 'v', 'v:part:pres:nom:s:m', 'amans');
expect('amo', 'v', 'v:part:pres:gen:s:m', 'amantis');
expect('amo', 'v', 'v:part:perf:nom:s:m', 'amatus');
expect('amo', 'v', 'v:part:fut:nom:s:m', 'amaturus');
para('moneo', 'v', '', VK('ind', 'pres', 'act'), 'moneo mones monet monemus monetis monent');
para('moneo', 'v', '', VK('cong', 'pres', 'act'), 'moneam moneas moneat moneamus moneatis moneant');
para('lego', 'v', '', VK('ind', 'pres', 'act'), 'lego legis legit legimus legitis legunt');
para('lego', 'v', '', VK('ind', 'fut', 'act'), 'legam leges leget legemus legetis legent');
para('lego', 'v', '', VK('ind', 'pres', 'pass'), 'legor legeris legitur legimur legimini leguntur');
para('lego', 'v', '', VK('ind', 'fut', 'pass'), 'legar legeris legetur legemur legemini legentur');
expect('lego', 'v', 'v:inf:pres:pass', 'legi');
expect('lego', 'v', 'v:imp:pres:act:1', 'lege');
para('capio', 'v', '', VK('ind', 'pres', 'act'), 'capio capis capit capimus capitis capiunt');
para('capio', 'v', '', VK('ind', 'impf', 'act'), 'capiebam capiebas capiebat capiebamus capiebatis capiebant');
para('capio', 'v', '', VK('ind', 'pres', 'pass'), 'capior caperis capitur capimur capimini capiuntur');
expect('capio', 'v', 'v:inf:pres:pass', 'capi');
expect('capio', 'v', 'v:imp:pres:act:1', 'cape');
expect('capio', 'v', 'v:cong:impf:act:0', 'caperem');
para('audio', 'v', '', VK('ind', 'pres', 'act'), 'audio audis audit audimus auditis audiunt');
para('audio', 'v', '', VK('ind', 'fut', 'act'), 'audiam audies audiet audiemus audietis audient');
para('audio', 'v', '', VK('ind', 'pres', 'pass'), 'audior audiris auditur audimur audimini audiuntur');
expect('audio', 'v', 'v:inf:pres:pass', 'audiri');
expect('audio', 'v', 'v:imp:pres:act:1', 'audi');
expect('duco', 'v', 'v:imp:pres:act:1', 'duc');
expect('facio', 'v', 'v:imp:pres:act:1', 'fac');
expect('do', 'v', 'v:ind:pres:act:3', 'damus');
expect('do', 'v', 'v:ind:perf:act:0', 'dedi');
const sum = E.LEX.find((e) => e.head === 'sum');
para(sum, null, '', VK('ind', 'pres', 'act'), 'sum es est sumus estis sunt');
para(sum, null, '', VK('ind', 'impf', 'act'), 'eram eras erat eramus eratis erant');
para(sum, null, '', VK('ind', 'fut', 'act'), 'ero eris erit erimus eritis erunt');
para(sum, null, '', VK('cong', 'pres', 'act'), 'sim sis sit simus sitis sint');
para(sum, null, '', VK('cong', 'impf', 'act'), 'essem esses esset essemus essetis essent');
para(sum, null, '', VK('ind', 'perf', 'act'), 'fui fuisti fuit fuimus fuistis fuerunt');
const ex = (h) => E.LEX.find((e) => e.head === h && e.k === 'v' && (e.irr || e.dep || e.semi));
para(ex('possum'), null, '', VK('ind', 'pres', 'act'), 'possum potes potest possumus potestis possunt');
para(ex('possum'), null, '', VK('cong', 'impf', 'act'), 'possem posses posset possemus possetis possent');
expect(ex('possum'), null, 'v:inf:pres:act', 'posse');
para(ex('prosum'), null, '', VK('ind', 'pres', 'act'), 'prosum prodes prodest prosumus prodestis prosunt');
expect(ex('desum'), null, 'v:inf:pres:act', 'deesse');
expect(ex('absum'), null, 'v:ind:perf:act:0', 'afui');
para(ex('eo'), null, '', VK('ind', 'pres', 'act'), 'eo is it imus itis eunt');
para(ex('eo'), null, '', VK('ind', 'impf', 'act'), 'ibam ibas ibat ibamus ibatis ibant');
para(ex('eo'), null, '', VK('ind', 'perf', 'act'), 'ii/ivi isti/ivisti iit/ivit iimus/ivimus istis/ivistis ierunt/iverunt');
expect(ex('eo'), null, 'v:inf:pres:act', 'ire');
expect(ex('redeo'), null, 'v:ind:perf:act:5', 'redierunt');
para(ex('fero'), null, '', VK('ind', 'pres', 'act'), 'fero fers fert ferimus fertis ferunt');
para(ex('fero'), null, '', VK('ind', 'pres', 'pass'), 'feror ferris fertur ferimur ferimini feruntur');
expect(ex('fero'), null, 'v:inf:pres:act', 'ferre');
expect(ex('fero'), null, 'v:inf:pres:pass', 'ferri');
expect(ex('fero'), null, 'v:imp:pres:act:1', 'fer');
expect(ex('fero'), null, 'v:ind:perf:act:0', 'tuli');
expect(ex('affero'), null, 'v:ind:perf:act:0', 'attuli');
para(E.LEX.find((e) => e.head === 'volo' && e.irr), null, '', VK('ind', 'pres', 'act'), 'volo vis vult volumus vultis volunt');
para(E.LEX.find((e) => e.head === 'volo' && e.irr), null, '', VK('cong', 'pres', 'act'), 'velim velis velit velimus velitis velint');
expect(ex('nolo'), null, 'v:imp:pres:act:1', 'noli');
expect(ex('nolo'), null, 'v:ind:pres:act:3', 'nolumus');
expect(ex('malo'), null, 'v:ind:pres:act:1', 'mavis');
expect(ex('fio'), null, 'v:inf:pres:act', 'fieri');
expect(ex('fio'), null, 'v:ind:pres:act:5', 'fiunt');
para(ex('hortor'), null, '', VK('ind', 'pres', 'dep'), 'hortor hortaris hortatur hortamur hortamini hortantur');
expect(ex('hortor'), null, 'v:inf:pres:dep', 'hortari');
expect(ex('hortor'), null, 'v:imp:pres:dep:1', 'hortare');
expect(ex('hortor'), null, 'v:part:perf:nom:s:m', 'hortatus');
para(ex('sequor'), null, '', VK('ind', 'pres', 'dep'), 'sequor sequeris sequitur sequimur sequimini sequuntur');
expect(ex('sequor'), null, 'v:inf:pres:dep', 'sequi');
para(ex('patior'), null, '', VK('ind', 'pres', 'dep'), 'patior pateris patitur patimur patimini patiuntur');
para(ex('vereor'), null, '', VK('ind', 'pres', 'dep'), 'vereor vereris veretur veremur veremini verentur');
para(ex('largior'), null, '', VK('ind', 'pres', 'dep'), 'largior largiris largitur largimur largimini largiuntur');
expect(ex('audeo'), null, 'v:ind:pres:act:2', 'audet');
expect(ex('audeo'), null, 'v:part:perf:nom:s:m', 'ausus');

/* ---------- Pronomi ---------- */
const pr = (h) => E.LEX.find((e) => e.head === h && e.k === 'p');
const PK = (g, n) => CASES.filter((c) => c !== 'voc').map((c) => `p:${c}:${n}:${g}`);
para(pr('is'), null, '', PK('m', 's'), 'is eius ei eum eo');
para(pr('is'), null, '', PK('f', 'p'), 'eae earum eis/iis eas eis/iis');
para(pr('hic'), null, '', PK('m', 's'), 'hic huius huic hunc hoc');
para(pr('hic'), null, '', PK('n', 'p'), 'haec horum his haec his');
para(pr('ille'), null, '', PK('n', 's'), 'illud illius illi illud illo');
para(pr('ipse'), null, '', PK('m', 's'), 'ipse ipsius ipsi ipsum ipso');
para(pr('idem'), null, '', PK('m', 's'), 'idem eiusdem eidem eundem eodem');
para(pr('qui'), null, '', PK('f', 's'), 'quae cuius cui quam qua');
para(pr('qui'), null, '', PK('m', 'p'), 'qui quorum quibus quos quibus');
expect(pr('ego'), null, 'p:dat:s:-', 'mihi');
expect(pr('tu'), null, 'p:acc:s:-', 'te');
expect(pr('se'), null, 'p:dat:-:-', 'sibi');
expect(pr('meus'), null, 'p:voc:s:m', 'mi');
expect(pr('noster'), null, 'p:nom:s:f', 'nostra');

/* ---------- Analisi e argomenti ---------- */
function analyses(w) { return E.analyze(w).map((a) => a.e.head + ' ' + a.d); }
function expectAn(w, want) { checks++; const got = analyses(w); if (!got.some((g) => g.includes(want))) errors.push(`analisi di «${w}»: manca «${want}» (trovate: ${got.join('; ') || 'nessuna'})`); }
expectAn('regis', 'rex genitivo singolare');
expectAn('regis', 'rego indicativo presente attivo, 2ª pers. sing.');
expectAn('amabatur', 'amo indicativo imperfetto passivo, 3ª pers. sing.');
expectAn('puellaeque', 'puella');
expectAn('mecum', 'ego ablativo singolare (con me)');
expectAn('legam', 'lego indicativo futuro semplice attivo, 1ª pers. sing.');
expectAn('legam', 'lego congiuntivo presente attivo, 1ª pers. sing.');
expectAn('Amat', 'amo');
expectAn('iacta', 'iacio participio perfetto');
function expectReq(w, head, need) {
  checks++;
  const a = E.analyze(w).filter((x) => x.e.head === head);
  if (!a.some((x) => need.every((t) => x.req.includes(t)))) errors.push(`argomenti di «${w}»: attesi ${need} (trovati ${a.map((x) => '[' + x.req + ']').join(' ')})`);
}
expectReq('amabatur', 'amo', ['v_pres', 'v_if', 'v_pass']);
expectReq('cepit', 'capio', ['v_perf']);
expectReq('meliorem', 'bonus', ['agg1', 'comp']);
expectReq('Romae', 'Roma', ['n1', 'compl']);
expectReq('ament', 'amo', ['v_cong']);
expectReq('ama', 'amo', ['v_imper']);
expectReq('fugisse', 'fugio', ['v_perf', 'v_inf']);
checks++; if (E.analyze('qwerty').length) errors.push('«qwerty» non dovrebbe avere analisi');
expectAn('rosā', 'rosa ablativo singolare');
expectAn('Amāvērunt', 'amo indicativo perfetto attivo');

/* ---------- Quantità ---------- */
// forme con le quantità: lemma, chiave, forma attesa
const QUANT = [
  ['rosa', 'n:abl:s', 'rosā'], ['rosa', 'n:gen:p', 'rosārum'], ['rosa', 'n:acc:p', 'rosās'], ['rosa', 'n:dat:p', 'rosīs'],
  ['dominus', 'n:gen:s', 'dominī'], ['dominus', 'n:dat:s', 'dominō'], ['dominus', 'n:acc:p', 'dominōs'], ['filius', 'n:voc:s', 'fīlī'],
  ['rex', 'n:nom:s', 'rēx'], ['rex', 'n:dat:s', 'rēgī'], ['rex', 'n:nom:p', 'rēgēs'], ['mare', 'n:abl:s', 'marī'], ['miles', 'n:gen:s', 'mīlitis'],
  ['consul', 'n:nom:s', 'cōnsul'], ['insula', 'n:nom:s', 'īnsula'], ['regnum', 'n:nom:s', 'rēgnum'], ['virtus', 'n:gen:s', 'virtūtis'],
  ['oratio', 'n:acc:s', 'ōrātiōnem'], ['animal', 'n:nom:p', 'animālia'], ['exercitus', 'n:gen:s', 'exercitūs'], ['exercitus', 'n:abl:s', 'exercitū'],
  ['cornu', 'n:nom:s', 'cornū'], ['dies', 'n:gen:s', 'diēī'], ['res', 'n:gen:s', 'reī'], ['res', 'n:abl:s', 'rē'], ['res', 'n:dat:p', 'rēbus'],
  ['domus', 'n:loc:s', 'domī'], ['Roma', 'n:abl:s', 'Rōmā'], ['dea', 'n:dat:p', 'deābus'],
  ['bonus', 'a:pos:abl:s:f', 'bonā'], ['bonus', 'a:comp:gen:s:m', 'meliōris'], ['magnus', 'a:comp:nom:s:m', 'māior'], ['malus', 'a:comp:nom:s:m', 'pēior'],
  ['altus', 'a:comp:abl:s:m', 'altiōre'], ['fortis', 'a:pos:abl:s:m', 'fortī'], ['acer', 'a:pos:nom:s:f', 'ācris'], ['felix', 'a:pos:gen:s:m', 'fēlīcis'],
  ['totus', 'a:pos:gen:s:m', 'tōtīus'], ['multus', 'a:comp:nom:p:m', 'plūrēs'], ['clarus', 'a:sup:nom:s:m', 'clārissimus'],
  ['amo', 'v:ind:pres:act:0', 'amō'], ['amo', 'v:ind:pres:act:2', 'amat'], ['amo', 'v:ind:pres:act:3', 'amāmus'], ['amo', 'v:ind:pres:act:5', 'amant'],
  ['amo', 'v:ind:impf:act:0', 'amābam'], ['amo', 'v:ind:impf:act:1', 'amābās'], ['amo', 'v:ind:fut:act:0', 'amābō'], ['amo', 'v:ind:pres:pass:0', 'amor'],
  ['amo', 'v:ind:pres:pass:1', 'amāris'], ['amo', 'v:ind:pres:pass:4', 'amāminī'], ['amo', 'v:cong:pres:act:1', 'amēs'], ['amo', 'v:cong:pres:act:2', 'amet'],
  ['amo', 'v:cong:impf:act:1', 'amārēs'], ['amo', 'v:ind:perf:act:0', 'amāvī'], ['amo', 'v:ind:perf:act:1', 'amāvistī'], ['amo', 'v:ind:perf:act:5', 'amāvērunt'],
  ['amo', 'v:ind:ppf:act:1', 'amāverās'], ['amo', 'v:ind:futant:act:0', 'amāverō'], ['amo', 'v:cong:perf:act:3', 'amāverīmus'], ['amo', 'v:cong:ppf:act:1', 'amāvissēs'],
  ['amo', 'v:inf:pres:act', 'amāre'], ['amo', 'v:inf:pres:pass', 'amārī'], ['amo', 'v:imp:pres:act:1', 'amā'], ['amo', 'v:part:pres:nom:s:m', 'amāns'],
  ['amo', 'v:part:pres:gen:s:m', 'amantis'], ['amo', 'v:part:perf:nom:s:m', 'amātus'], ['amo', 'v:part:fut:nom:s:m', 'amātūrus'],
  ['moneo', 'v:ind:pres:act:1', 'monēs'], ['moneo', 'v:cong:pres:act:3', 'moneāmus'], ['moneo', 'v:inf:pres:act', 'monēre'],
  ['lego', 'v:ind:pres:act:1', 'legis'], ['lego', 'v:ind:fut:act:1', 'legēs'], ['lego', 'v:ind:pres:pass:1', 'legeris'], ['lego', 'v:ind:fut:pass:1', 'legēris'],
  ['lego', 'v:ind:perf:act:0', 'lēgī'], ['lego', 'v:inf:pres:pass', 'legī'], ['venio', 'v:ind:perf:act:2', 'vēnit'], ['venio', 'v:ind:pres:act:2', 'venit'],
  ['audio', 'v:ind:pres:act:1', 'audīs'], ['audio', 'v:ind:impf:act:0', 'audiēbam'], ['audio', 'v:ind:fut:act:1', 'audiēs'], ['audio', 'v:inf:pres:act', 'audīre'],
  ['capio', 'v:ind:pres:act:1', 'capis'], ['capio', 'v:ind:pres:pass:1', 'caperis'], ['capio', 'v:ind:perf:act:0', 'cēpī'],
  ['do', 'v:ind:pres:act:1', 'dās'], ['do', 'v:ind:pres:act:3', 'damus'], ['do', 'v:inf:pres:act', 'dare'], ['do', 'v:imp:pres:act:1', 'dā'],
  ['sum', 'v:cong:pres:act:1', 'sīs'], ['sum', 'v:ind:impf:act:1', 'erās'], ['possum', 'v:cong:impf:act:0', 'possem'], ['prosum', 'v:ind:pres:act:2', 'prōdest'],
  ['eo', 'v:ind:pres:act:1', 'īs'], ['eo', 'v:inf:pres:act', 'īre'], ['fero', 'v:ind:impf:act:0', 'ferēbam'], ['fero', 'v:inf:pres:pass', 'ferrī'],
  ['volo@v_irr', 'v:ind:pres:act:1', 'vīs'], ['nolo', 'v:imp:pres:act:1', 'nōlī'], ['malo', 'v:ind:pres:act:1', 'māvīs'], ['fio', 'v:inf:pres:act', 'fierī'],
  ['hortor', 'v:ind:pres:dep:1', 'hortāris'], ['hortor', 'v:inf:pres:dep', 'hortārī'], ['sequor', 'v:part:perf:nom:s:m', 'secūtus'], ['utor', 'v:inf:pres:dep', 'ūtī'],
  ['is', 'p:abl:s:f', 'eā'], ['is', 'p:gen:p:m', 'eōrum'], ['hic', 'p:abl:s:m', 'hōc'], ['ille', 'p:gen:s:m', 'illīus'], ['qui', 'p:nom:s:m', 'quī'],
  ['ego', 'p:acc:s:-', 'mē'], ['ego', 'p:dat:p:-', 'nōbīs'], ['se', 'p:acc:-:-', 'sē'], ['non', 'i', 'nōn'], ['e', 'i', 'ē'], ['cras', 'i', 'crās'],
];
for (const [uid, key, want] of QUANT) {
  checks++;
  const e = E.BY_UID.get(uid);
  if (!e) { errors.push('quantità: lemma mancante ' + uid); continue; }
  const got = e.forms.filter((x) => x.key === key).map((x) => x.q);
  if (!got.includes(want)) errors.push(`quantità di ${uid} ${key}: attesa «${want}», trovata «${got.join('/') || '—'}»`);
}
// ogni forma con le quantità, senza i segni, coincide con la forma scolastica
let qbad = 0;
for (const e of E.LEX) for (const x of e.forms) if (E.plain(x.q) !== x.f) qbad++;
checks++; if (qbad) errors.push(`${qbad} forme con le quantità non coincidono con la forma senza segni`);
// accento: la sillaba accentata è scritta in maiuscolo
const ACC = ['pu-EL-la', 'DO-mi-nus', 'a-MĪ-cus', 'rē-GĪ-na', 'IU-ve-nis', 'A-qua', 'a-GRI-co-la', 'TE-ne-brae', 'ma-GIS-trī', 'AR-bi-tror', 'gla-di-Ā-tor',
  'sa-pi-EN-ti-a', 'lae-TI-ti-a', 'PA-tri-a', 'vic-TŌ-ri-a', 'a-mā-VĒ-runt', 'le-gē-BĀ-mus', 'cōn-SI-li-um', 'NŪN-ti-us', 'pro-fi-CĪS-cor', 'HUIC', 'MA-ior', 'E-ius', 'LIN-gua'];
for (const a of ACC) {
  checks++;
  const sy = a.split('-');
  const word = sy.join('').toLowerCase();
  const want = sy.findIndex((x) => x !== x.toLowerCase());
  const r = E.accentSyllable(word);
  const got = r.S.map((x, i) => (i === r.i ? x.s.toUpperCase() : x.s)).join('-');
  if (got !== a) errors.push(`accento di «${word}»: atteso ${a}, calcolato ${got}`);
  void want;
}

/* ---------- Nessuna forma persa rispetto a Verto 1 ---------- */
// Verto 1 scriveva «null» e «undefined» nelle chiavi: si riportano al formato attuale
function oldKey(s) {
  const [key, rest] = [s.slice(0, s.indexOf('=')), s.slice(s.indexOf('='))];
  const p = key.split(':');
  let k = key;
  if (p[0] === 'v') {
    const vo = (x) => (!x || x === 'null' || x === 'undefined' ? 'act' : x);
    if (p[1] === 'part') k = ['v', 'part', p[2], p[5], p[6], p[7]].join(':');
    else if (p[1] === 'inf') k = ['v', 'inf', p[2], vo(p[3])].join(':');
    else k = ['v', p[1], p[2], vo(p[3]), p[4]].join(':');
  } else if (p[0] === 'p') k = p.map((x) => (x === 'null' || x === 'undefined' ? '-' : x)).join(':');
  return k + rest;
}
const v1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'forms-v1.json'), 'utf8'));
let lost = 0, compared = 0;
const allowedChanges = new Set((fs.existsSync(path.join(__dirname, 'fixtures', 'forms-changes.txt')) ? fs.readFileSync(path.join(__dirname, 'fixtures', 'forms-changes.txt'), 'utf8') : '').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#')));
for (const old of v1) {
  const e = E.LEX.find((x) => x.k === old.k && P(x.head) === old.head && x.t === old.t) || E.LEX.find((x) => x.k === old.k && P(x.head) === old.head);
  if (!e) { errors.push(`lemma scomparso: ${old.head}`); continue; }
  const now = new Set(e.forms.map((x) => x.key + '=' + x.f + '|' + x.req.join(',')));
  for (const f0 of old.forms) {
    const f = oldKey(f0);
    compared++;
    if (!now.has(f) && !allowedChanges.has(old.head + ' ' + f)) { lost++; if (lost <= 15) errors.push(`forma di Verto 1 non più generata: ${old.head} ${f}`); }
  }
}
console.log('\nTest del motore');
console.log(`  Lemmi: ${E.LEX.length}; forme indicizzate: ${E.INDEX.size}; controlli puntuali: ${checks}`);
console.log(`  Forme di Verto 1 confrontate: ${compared}; perse: ${lost}`);
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
errors.slice(0, 40).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
