/* VERTO — il percorso: 25 unità (l'alfabeto e una per argomento del programma), ognuna con 3–4 lezioni brevi
   e una prova finale (70% per passare).
   Perimetro di ogni lezione:
     lemmas  parole nuove (identificativo del lemma nel lessico); il vocabolario della lezione è l'insieme delle
             parole introdotte fin qui nel percorso;
     keys    forme ammesse per l'argomento dell'unità (espressione regolare sulle chiavi del motore): vale per le
             forme che richiedono l'argomento dell'unità; le forme degli argomenti precedenti sono tutte ammesse;
     tenses  tempi dei verbi di modo finito nelle frasi generate; num: solo singolare ('s') per i nomi dell'unità.
   Schede di spiegazione (teach): say (parla la guida), p (testo, latino in <span class="la">), tabelle dal motore
   (decl, conj, adj, pron, forms, degrees, lemmas), tbl (tabelle di concetti, non di forme), ex [latino, italiano, letture].
   Dopo ogni tabella di forme la lezione propone una domanda di controllo. */
(function (root) {
const la = (s) => `<span class="la">${s}</span>`;
// esercizi delle lezioni
const NOM = ['abbina', 'analizza', 'frase', 'analizza', 'scrivi', 'frase', 'frase', 'completa', 'frase', 'analizza'];
const NOMA = ['abbina', 'analizza', 'accorda', 'frase', 'scrivi', 'frase', 'accorda', 'frase', 'completa', 'frase'];
const VERB = ['abbina', 'analizza', 'scrivi', 'frase', 'analizza', 'frase', 'scrivi', 'frase', 'frase', 'completa'];
const SYN = ['frase', 'analizza', 'frase', 'frase', 'abbina', 'frase', 'completa', 'frase', 'frase', 'scrivi'];
const TEST = ['analizza', 'frase', 'scrivi', 'frase', 'frase', 'analizza', 'frase', 'completa', 'frase', 'scrivi', 'frase', 'frase'];
const TESTA = ['analizza', 'frase', 'accorda', 'frase', 'scrivi', 'frase', 'analizza', 'frase', 'completa', 'frase', 'accorda', 'frase'];
const ALF = ['lettura', 'suono', 'lettura', 'abbina', 'lettura', 'suono', 'lettura', 'lettura'];

const UNITS = [
{ id: 'alf', title: 'Alfabeto e pronuncia', say: 'Salve! Ti accompagno nel latino, un passo alla volta. Prima di tradurre impariamo a leggere: il latino si scrive quasi come l’italiano.',
  lessons: [
  { id: 'alf1', title: 'Lettere e suoni', sub: 'c, g, h, j, k, v, x, y, z', mix: ALF, lemmas: ['rosa', 'aqua', 'via', 'vita', 'cena', 'luna', 'terra', 'Cicero'],
    teach: [
      { say: 'L’alfabeto latino è quello che usi già. Nella pronuncia scolastica, la più usata in Italia, quasi tutte le lettere si leggono come in italiano.' },
      { tbl: { c: ['Lettera', 'Si legge', 'Esempio'], r: [['c, g', 'dolci davanti a e, i; dure davanti ad a, o, u', `${la('Cicero')} «Cìcero», ${la('cena')} «cena»`], ['h', 'non si pronuncia', `${la('hora')} «ora»`], ['k', 'come c dura (in poche parole)', `${la('Kalendae')}`], ['i, j', 'la j è una i davanti a vocale', `${la('iam')} «iam»`], ['u, v', 'u è vocale, v è consonante', `${la('vita')} «vita»`], ['x', 'cs', `${la('lux')} «lucs»`], ['y', 'i (parole greche)', `${la('lyra')}`], ['z', 'z sonora, come in «zero»', `${la('zona')}`]] } },
      { p: `Le parole di questa lezione: ${la('rosa')} (rosa), ${la('aqua')} (acqua), ${la('via')} (strada), ${la('vita')} (vita), ${la('cena')} (cena), ${la('luna')} (luna), ${la('terra')} (terra), ${la('Cicero')} (Cicerone).` },
      { say: 'Attenzione a qu: in aqua la u si sente appena, proprio come in «acqua».' }] },
  { id: 'alf2', title: 'Dittonghi e gruppi', sub: 'ae, oe, au · ch, ph, th · gn · ti', mix: ALF, lemmas: ['Caesar', 'Graecia', 'proelium', 'aurum', 'causa', 'schola', 'Athenae', 'gratia', 'regnum'],
    teach: [
      { say: 'Alcune coppie di lettere si leggono in modo speciale. Sono poche e si imparano subito.' },
      { tbl: { c: ['Gruppo', 'Si legge', 'Esempio'], r: [['ae, oe', 'e', `${la('Caesar')} «Cèsar», ${la('proelium')} «prèlium»`], ['au', 'au', `${la('aurum')} «àurum»`], ['ch, ph, th', 'c dura, f, t', `${la('schola')} «scòla», ${la('Athenae')} «Atène»`], ['gn', 'come in «gnomo»', `${la('regnum')} «règnum»`], ['ti + vocale', 'zi (ma non dopo s, t, x)', `${la('gratia')} «gràzia»`]] } },
      { p: `Nuove parole: ${la('Caesar')} (Cesare), ${la('Graecia')} (Grecia), ${la('proelium')} (battaglia), ${la('aurum')} (oro), ${la('causa')} (causa), ${la('schola')} (scuola), ${la('Athenae')} (Atene), ${la('gratia')} (grazia), ${la('regnum')} (regno).` },
      { say: 'Esiste anche la pronuncia «restituita», più vicina a quella dei Romani antichi: Caesar si leggeva «Kàisar». A scuola però si usa quasi sempre quella che stai imparando.' }] },
  { id: 'alf3', title: 'Vocali lunghe e brevi', sub: 'le quantità: ā ē ī ō ū', mix: ['quantita', 'lettura', 'sillabe', 'quantita', 'abbina', 'sillabe', 'quantita', 'lettura'], lemmas: ['puella', 'regina', 'insula', 'fortuna', 'amicus', 'dominus', 'fabula', 'patria'],
    teach: [
      { say: 'In latino ogni vocale può essere lunga o breve. I dizionari segnano le lunghe con un trattino: ā ē ī ō ū.' },
      { p: `${la('rēgīna')} ha due vocali lunghe, ${la('dominus')} nessuna. Le quantità servono a capire dove cade l’accento, e a volte distinguono le forme: ${la('rosa')} e ${la('rosā')} sono due casi diversi.` },
      { tbl: { c: ['Regola', 'Esempio'], r: [['i dittonghi sono sempre lunghi', `${la('Graecia')}, ${la('aurum')}`], ['una vocale seguita da due consonanti fa la sillaba lunga', `${la('puella')}: pu-el-la`], ['una vocale davanti a un’altra vocale è di solito breve', `${la('patria')}: pa-tri-a`]] } },
      { say: 'Nel profilo puoi far comparire le quantità in tutte le frasi. Sono facoltative: se le scrivi sbagliate te lo segnalo, ma non conta come errore.' }] },
  { id: 'alf4', title: 'Dove cade l’accento', sub: 'la legge della penultima', mix: ['accento', 'accento', 'sillabe', 'accento', 'quantita', 'accento', 'abbina', 'accento'], lemmas: ['agricola', 'victoria', 'sapientia', 'laetitia', 'magister', 'discipulus', 'periculum', 'imperator'],
    teach: [
      { say: 'In latino l’accento quasi mai cade sull’ultima sillaba: per le parole che incontrerai basta una regola.' },
      { tbl: { c: ['Parola', 'Accento', 'Esempio'], r: [['di due sillabe', 'sulla prima', `${la('rosa')} «ròsa»`], ['di tre o più sillabe, penultima lunga', 'sulla penultima', `${la('fortūna')} «fortùna»`], ['di tre o più sillabe, penultima breve', 'sulla terzultima', `${la('agricola')} «agrìcola»`]] } },
      { p: `È la <b>legge della penultima</b>: guarda la penultima sillaba. ${la('magister')} ha la penultima chiusa da due consonanti (ma-gis-ter): è lunga, e l’accento va lì: «magìster».` },
      { say: 'Con -que, «e», l’accento si sposta sulla sillaba prima: puellaque si legge «puellàque».' }] },
  { id: 'alf5', title: 'Prova d’unità', sub: 'lettere, quantità e accento', mix: ['lettura', 'accento', 'suono', 'quantita', 'lettura', 'accento', 'sillabe', 'lettura', 'accento', 'abbina'], test: true },
  ] },
{ id: 'v_pres', title: 'Il presente', say: 'Cominciamo dal verbo: con il presente puoi già dire chi fa che cosa, anche senza soggetto.',
  lessons: [
  { id: 'vpr1', title: 'La prima coniugazione', sub: 'amo, amas, amat…', lemmas: ['amo', 'laudo', 'voco', 'porto', 'canto', 'ambulo', 'laboro', 'salto', 'et', 'non'], keys: '^(v:ind:pres:act:|i$)', tenses: ['pres'], mix: VERB,
    teach: [
      { say: 'Il verbo latino si cita alla prima persona: amō, «io amo». La desinenza dice chi agisce, quindi il soggetto spesso non c’è.' },
      { conj: [['amo', 'v:ind:pres:act']] },
      { p: `Desinenze: ${la('-ō, -s, -t, -mus, -tis, -nt')}. ${la('Cantāmus')} vuol dire già «(noi) cantiamo».` },
      { ex: ['Laboro et canto.', 'Lavoro e canto.'] }] },
  { id: 'vpr2', title: 'La seconda coniugazione', sub: 'moneo, mones…', lemmas: ['moneo', 'habeo', 'video', 'timeo', 'taceo', 'rideo', 'sedeo', 'sed', 'cur'], keys: '^(v:ind:pres:act:|i$)', tenses: ['pres'], mix: VERB,
    teach: [
      { say: 'La seconda coniugazione ha l’infinito in -ēre e la prima persona in -eō.' },
      { conj: [['moneo', 'v:ind:pres:act'], ['video', 'v:ind:pres:act']] },
      { p: `${la('Cūr')} apre una domanda: «perché?». ${la('Sed')} vuol dire «ma».` },
      { ex: ['Cur rides?', 'Perché ridi?'] }] },
  { id: 'vpr3', title: 'Terza, quarta e mista', sub: 'lego, audio, capio', lemmas: ['lego', 'scribo', 'ludo', 'curro', 'audio', 'dormio', 'venio', 'capio', 'facio', 'fugio'], keys: '^(v:ind:pres:act:|i$)', tenses: ['pres'], mix: VERB,
    teach: [
      { say: 'Le ultime coniugazioni si somigliano: guarda bene la terza plurale.' },
      { conj: [['lego', 'v:ind:pres:act'], ['capio', 'v:ind:pres:act'], ['audio', 'v:ind:pres:act']] },
      { p: `Terza plurale: ${la('-unt')} nella 3ª (${la('legunt')}), ${la('-iunt')} nella 4ª e nella mista (${la('audiunt')}, ${la('capiunt')}).` },
      { ex: ['Legunt et scribunt.', 'Leggono e scrivono.'] }] },
  { id: 'vpr4', title: 'Il verbo sum e l’infinito', sub: 'sum, es, est · amare', lemmas: ['sum', 'debeo', 'saepe', 'semper', 'numquam', 'hodie', 'ergo', 'cogito'], keys: '^(v:(ind:pres:act:|inf:pres:act)|i$)', tenses: ['pres'], mix: VERB,
    teach: [
      { say: 'Sum, «sono», è irregolare: va imparato a memoria, ma lo incontrerai in ogni pagina.' },
      { conj: [['sum', 'v:ind:pres:act']] },
      { p: `L’infinito presente esce in ${la('-āre')} (1ª), ${la('-ēre')} (2ª), ${la('-ere')} (3ª e mista), ${la('-īre')} (4ª): ${la('amāre, monēre, legere, capere, audīre')}. ${la('Dēbeō')} + infinito: «devo».` },
      { ex: ['Cogito, ergo sum.', 'Penso, dunque sono.'] }] },
  { id: 'vpr5', title: 'Prova d’unità', sub: 'il presente', mix: TEST, test: true, tenses: ['pres'] },
  ] },
{ id: 'n1', title: 'Prima declinazione', say: 'Ora i nomi. In latino non ci sono articoli: è la desinenza, il caso, a dire che funzione ha la parola.',
  lessons: [
  { id: 'n1a', title: 'Soggetto e oggetto', sub: 'nominativo e accusativo singolare', lemmas: ['nauta', 'poeta', 'filia', 'ancilla', 'aro', 'narro', 'specto', 'exspecto'], keys: '^n:(nom|acc):s$', num: 's', mix: NOM,
    teach: [
      { say: 'Il soggetto è al nominativo, l’oggetto all’accusativo. Nella prima declinazione: -a e -am.' },
      { decl: ['rosa'], num: 's', cases: ['nom', 'acc'] },
      { p: `L’ordine delle parole è libero: ${la('Puella rosam amat')} e ${la('Rosam puella amat')} dicono la stessa cosa. Decide la desinenza, non il posto.` },
      { ex: ['Puella rosam amat.', 'La fanciulla ama la rosa.'] }] },
  { id: 'n1b', title: 'Il plurale', sub: 'nominativo e accusativo plurale', lemmas: ['incola', 'domina', 'dea', 'silva', 'villa', 'sagitta', 'fera', 'paro', 'neco', 'fugo'], keys: '^n:(nom|acc):[sp]$', mix: NOM,
    teach: [
      { say: 'Al plurale il soggetto esce in -ae e l’oggetto in -ās. E il verbo va al plurale!' },
      { decl: ['rosa'], cases: ['nom', 'acc'] },
      { p: `${la('Agricolae')} con il verbo al plurale è un soggetto: ${la('agricolae arant')}, «gli agricoltori arano».` },
      { ex: ['Agricolae terram arant.', 'Gli agricoltori arano la terra.'] }] },
  { id: 'n1c', title: 'Genitivo e dativo', sub: 'di chi? a chi?', lemmas: ['pecunia', 'epistula', 'pugna', 'gloria', 'umbra', 'do', 'praebeo', 'dono'], keys: '^n:(nom|acc|gen|dat):[sp]$', mix: NOM,
    teach: [
      { say: 'Il genitivo risponde a «di chi?», il dativo a «a chi?».' },
      { decl: ['rosa'], cases: ['nom', 'gen', 'dat', 'acc'] },
      { p: `${la('-ae')} può essere genitivo singolare, dativo singolare o nominativo plurale: decide il resto della frase. Dare e offrire vogliono il dativo: ${la('poēta rēgīnae rosās dat')}.` },
      { ex: ['Poeta reginae rosas dat.', 'Il poeta dà rose alla regina.'] }] },
  { id: 'n1d', title: 'Ablativo e vocativo', sub: 'tutti i casi', lemmas: ['Cornelia', 'Minerva', 'Diana', 'Italia', 'audacia', 'turba', 'praeda', 'iuvo', 'lacrimo'], mix: NOM,
    teach: [
      { say: 'Ultimi due casi: l’ablativo, che regge molti complementi, e il vocativo, per chiamare qualcuno.' },
      { decl: ['rosa'] },
      { p: `L’ablativo singolare ha la ${la('ā')} lunga: ${la('rosā')}, «con la rosa». Il vocativo è uguale al nominativo: ${la('Cornēlia!')}` },
      { ex: ['Cornelia, cur lacrimas?', 'Cornelia, perché piangi?'] }] },
  { id: 'n1t', title: 'Prova d’unità', sub: 'prima declinazione', mix: TEST, test: true },
  ] },
{ id: 'compl', title: 'Complementi', say: 'Dove? Verso dove? Con chi? Con le preposizioni e i casi costruisci i complementi.',
  lessons: [
  { id: 'co1', title: 'Stato e moto a luogo', sub: 'in + abl. · in, ad + acc.', lemmas: ['in', 'ad', 'habito', 'propero', 'maneo', 'Sicilia', 'Gallia'], mix: SYN,
    teach: [
      { say: 'In con l’ablativo indica dove sei; in o ad con l’accusativo dove vai.' },
      { tbl: { c: ['Complemento', 'Costruzione', 'Esempio'], r: [['stato in luogo', 'in + ablativo', `${la('in silvā')}, nel bosco`], ['moto a luogo', 'in / ad + accusativo', `${la('in silvam')}, nel bosco (andando)`]] } },
      { ex: ['Puellae in silva ambulant.', 'Le fanciulle passeggiano nel bosco.'] },
      { ex: ['Regina ad villam properat.', 'La regina si affretta verso la villa.'] }] },
  { id: 'co2', title: 'Moto da luogo e per luogo', sub: 'e/ex, a/ab + abl. · per + acc.', lemmas: ['e', 'ex', 'a', 'ab', 'per', 'navigo', 'porta'], mix: SYN,
    teach: [
      { say: 'Da dove vieni? Con e, ex, a, ab e l’ablativo. Attraverso dove passi? Con per e l’accusativo.' },
      { tbl: { c: ['Complemento', 'Costruzione', 'Esempio'], r: [['moto da luogo', 'e / ex, a / ab + ablativo', `${la('ē Graeciā')}, dalla Grecia`], ['moto per luogo', 'per + accusativo', `${la('per īnsulās')}, attraverso le isole`]] } },
      { p: `Davanti a vocale si usano ${la('ex')} e ${la('ab')}: ${la('ex īnsulā')}, ${la('ab Italiā')}.` },
      { ex: ['Poetae e Graecia in Italiam navigant.', 'I poeti navigano dalla Grecia in Italia.'] }] },
  { id: 'co3', title: 'Mezzo, modo, compagnia', sub: 'abl. semplice · cum + abl.', lemmas: ['cum', 'sine', 'amica', 'cura', 'ira', 'pugno'], mix: SYN,
    teach: [
      { say: 'Con che cosa? L’ablativo da solo indica il mezzo. Cum con l’ablativo indica la compagnia o il modo.' },
      { tbl: { c: ['Complemento', 'Costruzione', 'Esempio'], r: [['mezzo', 'ablativo semplice', `${la('sagittīs')}, con le frecce`], ['compagnia', 'cum + ablativo di persona', `${la('cum amīcīs')}, con gli amici`], ['modo', 'cum + ablativo di un nome astratto', `${la('cum laetitiā')}, con gioia`]] } },
      { ex: ['Agricolae sagittis feras fugant.', 'Gli agricoltori mettono in fuga le belve con le frecce.'] }] },
  { id: 'co4', title: 'Causa, argomento e città', sub: 'propter + acc. · de + abl. · Romae', lemmas: ['propter', 'de', 'Roma', 'hora', 'fama', 'Troia'], mix: SYN,
    teach: [
      { say: 'Con i nomi di città non serve la preposizione. E a Roma si dice con un caso speciale, il locativo.' },
      { tbl: { c: ['Complemento', 'Costruzione', 'Esempio'], r: [['causa', 'propter + accusativo', `${la('propter pugnam')}, a causa della battaglia`], ['argomento', 'dē + ablativo', `${la('dē fābulā')}, sulla favola`], ['città: stato', 'locativo', `${la('Rōmae')}, a Roma`], ['città: moto a e da luogo', 'accusativo, ablativo', `${la('Rōmam')}, ${la('Rōmā')}`]] } },
      { ex: ['Puellae Romae habitant.', 'Le fanciulle abitano a Roma.'] }] },
  { id: 'cot', title: 'Prova d’unità', sub: 'complementi', mix: TEST, test: true },
  ] },
{ id: 'n2', title: 'Seconda declinazione', say: 'La seconda declinazione ha maschili in -us e -er e neutri in -um. Molte parole che usi ogni giorno vengono da qui.',
  lessons: [
  { id: 'n2a', title: 'I maschili in -us', sub: 'dominus, dominī', lemmas: ['servus', 'equus', 'lupus', 'agnus', 'populus', 'hortus', 'ludus', 'murus'], keys: '^n:(nom|gen|dat|acc|abl):[sp]$', mix: NOM,
    teach: [
      { say: 'Le desinenze sono -us, -ī, -ō, -um: il genitivo singolare in -ī ti dice che il nome è della seconda.' },
      { decl: ['dominus'], cases: ['nom', 'gen', 'dat', 'acc', 'abl'] },
      { p: `${la('-ī')} può essere genitivo singolare o nominativo plurale; ${la('-ō')} dativo o ablativo singolare.` },
      { ex: ['Domini servos vocant.', 'I padroni chiamano i servi.'] }] },
  { id: 'n2b', title: 'I nomi in -er e vir', sub: 'puer, ager, magister', lemmas: ['puer', 'ager', 'vir', 'liber', 'liberi', 'doceo', 'colo'], keys: '^n:(nom|gen|dat|acc|abl):[sp]$', mix: NOM,
    teach: [
      { say: 'Alcuni maschili escono in -er. Il genitivo ti dice se la e resta (puer, puerī) o cade (ager, agrī).' },
      { decl: ['puer', 'ager'], cases: ['nom', 'gen', 'dat', 'acc', 'abl'] },
      { p: `${la('Līberī, līberōrum')} è un plurale e vuol dire «figli»; ${la('liber, librī')} è il libro.` },
      { ex: ['Magister pueros docet.', 'Il maestro istruisce i fanciulli.'] }] },
  { id: 'n2c', title: 'I neutri in -um', sub: 'templum, templī', lemmas: ['bellum', 'donum', 'templum', 'oppidum', 'forum', 'verbum', 'consilium', 'auxilium'], keys: '^n:(nom|gen|dat|acc|abl):[sp]$', mix: NOM,
    teach: [
      { say: 'Regola d’oro dei neutri, per tutte le declinazioni: nominativo, accusativo e vocativo sono uguali, e al plurale escono in -a.' },
      { decl: ['templum'], cases: ['nom', 'gen', 'dat', 'acc', 'abl'] },
      { p: `${la('Templa')} non è un femminile della prima: è il plurale neutro di ${la('templum')}.` },
      { ex: ['Puer donum habet.', 'Il fanciullo ha un dono.'] }] },
  { id: 'n2d', title: 'Vocativo e nomi speciali', sub: 'domine, fīlī · deus', lemmas: ['filius', 'deus', 'socius', 'gladius', 'nuntius', 'legatus', 'Romani', 'Galli', 'arma', 'castra', 'praemium', 'frumentum'], mix: NOM,
    teach: [
      { say: 'Il vocativo dei nomi in -us esce in -e, anche in -ius: socie, nūntie. Fanno eccezione fīlius (fīlī) e i nomi propri latini in -ius (Vergilī). Deus ha forme tutte sue.' },
      { decl: ['dominus', 'filius'], num: 's' },
      { p: `${la('Arma, armōrum')} («armi») e ${la('castra, castrōrum')} («accampamento») si usano solo al plurale.` },
      { ex: ['Domine, servi aquam non habent.', 'Padrone, i servi non hanno acqua.'] }] },
  { id: 'n2t', title: 'Prova d’unità', sub: 'seconda declinazione', mix: TEST, test: true },
  ] },
{ id: 'agg1', title: 'Aggettivi della prima classe', say: 'Gli aggettivi concordano con il nome in genere, numero e caso, anche quando la desinenza è diversa.',
  lessons: [
  { id: 'a1a', title: 'In -us, -a, -um', sub: 'bonus, bona, bonum', lemmas: ['bonus', 'malus', 'magnus', 'parvus', 'laetus', 'novus', 'clarus', 'multus'], keys: '^a:pos:', mix: NOMA,
    teach: [
      { say: 'Maschile e neutro come la seconda declinazione, femminile come la prima.' },
      { adj: 'bonus' },
      { p: `Concordanza: ${la('agricola bonus')}, ${la('nautae bonī')}. ${la('Agricola')} è della prima, ${la('bonus')} della seconda: stesso caso, desinenze diverse.` },
      { ex: ['Puella laeta cantat.', 'La fanciulla lieta canta.'] }] },
  { id: 'a1b', title: 'In -er', sub: 'pulcher, miser, līber', lemmas: ['pulcher', 'miser', 'liber@agg1', 'aeger', 'altus', 'longus', 'iustus', 'superbus'], keys: '^a:pos:', mix: NOMA,
    teach: [
      { say: 'Come puer e ager: alcuni tengono la e, altri la perdono.' },
      { adj: 'pulcher' },
      { p: `${la('miser, misera, miserum')} tiene la e; ${la('pulcher, pulchra, pulchrum')} la perde.` },
      { ex: ['Pulchra puella in horto ambulat.', 'La bella fanciulla passeggia nel giardino.'] }] },
  { id: 'a1c', title: 'Attributo e predicato', sub: 'puella pulchra · puella pulchra est', lemmas: ['antiquus', 'Romanus', 'Graecus', 'certus', 'verus', 'tutus', 'doctus', 'validus', 'gratus'], keys: '^a:pos:', mix: NOMA,
    teach: [
      { say: 'Con sum l’aggettivo diventa predicato: puella pulchra est, «la fanciulla è bella».' },
      { tbl: { c: ['Uso', 'Esempio'], r: [['attributo', `${la('puella pulchra cantat')}, la bella fanciulla canta`], ['predicato (con sum)', `${la('puella pulchra est')}, la fanciulla è bella`], ['sostantivato', `${la('bonī')}, i buoni; ${la('multa')}, molte cose`]] } },
      { ex: ['Magna silva umbram gratam praebet.', 'La grande selva offre un’ombra gradita.'] }] },
  { id: 'a1d', title: 'Gli aggettivi pronominali', sub: 'tōtus, sōlus, nūllus, ūnus', lemmas: ['totus', 'solus', 'nullus', 'unus', 'alius', 'alter', 'primus', 'secundus'], mix: NOMA,
    teach: [
      { say: 'Sette aggettivi hanno il genitivo in -īus e il dativo in -ī, al singolare, per tutti i generi.' },
      { forms: [['totus', 'a:pos:gen:s:m', 'genitivo'], ['totus', 'a:pos:dat:s:m', 'dativo'], ['unus', 'a:pos:gen:s:f', 'genitivo'], ['alius', 'a:pos:nom:s:n', 'neutro']] },
      { ex: ['Nullus agricola laborat.', 'Nessun agricoltore lavora.'] }] },
  { id: 'a1t', title: 'Prova d’unità', sub: 'aggettivi della prima classe', mix: TESTA, test: true },
  ] },
{ id: 'v_if', title: 'Imperfetto e futuro', say: 'Andiamo nel passato e nel futuro. L’imperfetto ha il suffisso -ba-; il futuro, -bi- oppure la vocale e.',
  lessons: [
  { id: 'vif1', title: 'L’imperfetto', sub: 'amābam, monēbam, legēbam', lemmas: ['olim', 'tum', 'diu', 'nunc', 'vigilo'], keys: '^v:ind:impf:', tenses: ['pres', 'impf'], mix: VERB,
    teach: [
      { say: 'Tutte le coniugazioni hanno -ba- seguito dalle desinenze -m, -s, -t, -mus, -tis, -nt.' },
      { conj: [['amo', 'v:ind:impf:act'], ['moneo', 'v:ind:impf:act'], ['lego', 'v:ind:impf:act'], ['audio', 'v:ind:impf:act']] },
      { conj: [['sum', 'v:ind:impf:act']] },
      { ex: ['Olim nautae in insula habitabant.', 'Un tempo i marinai abitavano sull’isola.'] }] },
  { id: 'vif2', title: 'Il futuro', sub: 'amābō · legam, audiam', lemmas: ['cras', 'mox', 'iam', 'deinde'], keys: '^v:ind:(impf|fut):', tenses: ['pres', 'impf', 'fut'], mix: VERB,
    teach: [
      { say: 'Due modi di fare il futuro: -bō, -bis, -bit nella prima e nella seconda; -am, -ēs, -et nelle altre.' },
      { conj: [['amo', 'v:ind:fut:act'], ['moneo', 'v:ind:fut:act'], ['lego', 'v:ind:fut:act'], ['audio', 'v:ind:fut:act']] },
      { conj: [['sum', 'v:ind:fut:act']] },
      { p: `Nella terza la e segnala il futuro: ${la('leget')}, «leggerà»; ${la('legit')}, «legge».` },
      { ex: ['Cras magister novam fabulam narrabit.', 'Domani il maestro racconterà una nuova favola.'] }] },
  { id: 'vif3', title: 'Imperfetto o futuro?', sub: 'riconoscere i tempi', lemmas: ['oppugno', 'expugno', 'supero', 'saluto'], mix: ['analizza', 'frase', 'analizza', 'frase', 'scrivi', 'frase', 'analizza', 'frase', 'frase', 'completa'],
    teach: [
      { say: 'Monēbat o monēbit? Guarda la vocale dopo la b: a per l’imperfetto, i per il futuro.' },
      { forms: [['moneo', 'v:ind:impf:act:2', 'imperfetto'], ['moneo', 'v:ind:fut:act:2', 'futuro'], ['lego', 'v:ind:pres:act:2', 'presente'], ['lego', 'v:ind:fut:act:2', 'futuro']] },
      { ex: ['Tum Galli Romanos timebant.', 'Allora i Galli temevano i Romani.'] }] },
  { id: 'vift', title: 'Prova d’unità', sub: 'imperfetto e futuro', mix: TEST, test: true },
  ] },
{ id: 'v_poss', title: 'Possum e i composti di sum', say: 'Possum vuol dire «posso»: è sum con davanti pot-. Con l’infinito costruisci moltissime frasi.',
  lessons: [
  { id: 'vpo1', title: 'Possum al presente', sub: 'possum, potes, potest', lemmas: ['possum', 'vivo', 'valeo'], keys: '^v:(ind:pres|inf:pres):', tenses: ['pres'], mix: VERB,
    teach: [
      { say: 'Davanti a s, pot- diventa pos-: possum, possumus, possunt. Davanti a vocale resta pot-: potes, potest.' },
      { conj: [['possum', 'v:ind:pres:act']] },
      { ex: ['Hodie laborare non possum.', 'Oggi non posso lavorare.'] }] },
  { id: 'vpo2', title: 'Possum negli altri tempi', sub: 'poteram, poterō', lemmas: ['credo', 'quaero', 'invenio'], mix: VERB,
    teach: [
      { say: 'Negli altri tempi basta mettere pot- davanti alle forme di sum che conosci già.' },
      { conj: [['possum', 'v:ind:impf:act'], ['possum', 'v:ind:fut:act']] },
      { ex: ['Tum agricolae arare non poterant.', 'Allora gli agricoltori non potevano arare.'] }] },
  { id: 'vpo3', title: 'I composti di sum', sub: 'absum, adsum, dēsum, prōsum + dativo', lemmas: ['absum', 'adsum', 'desum', 'praesum', 'intersum', 'prosum', 'copiae', 'gero'], mix: SYN,
    teach: [
      { say: 'Sum con una preposizione davanti cambia significato. Quasi tutti questi verbi reggono il dativo.' },
      { lemmas: [['absum', 'a / ab + ablativo'], ['adsum', 'dativo'], ['desum', 'dativo'], ['praesum', 'dativo'], ['intersum', 'dativo'], ['prosum', 'dativo; prōd- davanti a vocale']] },
      { ex: ['Nautis pecunia deerit.', 'Ai marinai mancherà il denaro.'] }] },
  { id: 'vpot', title: 'Prova d’unità', sub: 'possum e i composti di sum', mix: TEST, test: true },
  ] },
{ id: 'v_imper', title: 'L’imperativo', say: 'Ascolta! Vieni! Con l’imperativo dai ordini, e di solito chiami la persona con il vocativo.',
  lessons: [
  { id: 'vim1', title: 'L’imperativo presente', sub: 'amā, amāte · monē, monēte', lemmas: ['vale', 'ecce'], mix: VERB,
    teach: [
      { say: 'Il singolare è il tema del verbo; il plurale aggiunge -te.' },
      { conj: [['amo', 'v:imp:pres:act'], ['moneo', 'v:imp:pres:act'], ['lego', 'v:imp:pres:act'], ['audio', 'v:imp:pres:act']] },
      { ex: ['Pueri, magistrum audite!', 'Fanciulli, ascoltate il maestro!'] }] },
  { id: 'vim2', title: 'Gli imperativi tronchi', sub: 'dīc, dūc, fac', lemmas: ['dico', 'duco', 'carpo', 'pono'], mix: VERB,
    teach: [
      { say: 'Tre verbi perdono la e finale al singolare: dīc, dūc, fac.' },
      { forms: [['dico', 'v:imp:pres:act:1', 'dīcō'], ['duco', 'v:imp:pres:act:1', 'dūcō'], ['facio', 'v:imp:pres:act:1', 'faciō'], ['capio', 'v:imp:pres:act:1', 'capiō']] },
      { ex: ['Duc equos in agrum, serve!', 'Conduci i cavalli nel campo, servo!'] }] },
  { id: 'vim3', title: 'Es, este e il vocativo', sub: 'estē bonī!', lemmas: ['o', 'aedifico', 'orno'], mix: VERB,
    teach: [
      { say: 'Anche sum ha l’imperativo: es, «sii», ed este, «siate».' },
      { forms: [['sum', 'v:imp:pres:act:1', 'singolare'], ['sum', 'v:imp:pres:act:4', 'plurale']] },
      { p: `Ricorda il vocativo: ${la('serve')}, ${la('domine')}, ${la('fīlī')}.` },
      { ex: ['Este boni, pueri!', 'Siate buoni, fanciulli!'] }] },
  { id: 'vimt', title: 'Prova d’unità', sub: 'imperativo', mix: TEST, test: true },
  ] },
{ id: 'pron_pers', title: 'Pronomi personali e possessivi', say: 'Io, tu, sé, mio, tuo: i pronomi ti fanno parlare in prima persona.',
  lessons: [
  { id: 'pp1', title: 'Ego, tū, nōs, vōs', sub: 'i pronomi personali', lemmas: ['ego', 'tu'], mix: VERB,
    teach: [
      { say: 'Il pronome soggetto si usa solo per dare enfasi: di solito basta la desinenza.' },
      { pron: 'ego' }, { pron: 'tu' },
      { ex: ['Ego te amo, tu me non amas.', 'Io ti amo, tu non mi ami.'] }] },
  { id: 'pp2', title: 'Il riflessivo', sub: 'suī, sibi, sē · suus', lemmas: ['se', 'suus'], mix: SYN,
    teach: [
      { say: 'Sē e suus si riferiscono sempre al soggetto della frase.' },
      { pron: 'se' },
      { p: `${la('Puella amīcam suam vocat')}: la fanciulla chiama la <i>sua</i> amica. ${la('Suus')} si traduce «suo» o «loro».` },
      { ex: ['Puella amicam suam vocat.', 'La fanciulla chiama la sua amica.'] }] },
  { id: 'pp3', title: 'I possessivi', sub: 'meus, tuus, noster, vester · mēcum', lemmas: ['meus', 'tuus', 'noster', 'vester', 'visito'], mix: SYN,
    teach: [
      { say: 'I possessivi si declinano come bonus. Con cum la preposizione va dopo il pronome: mēcum, tēcum.' },
      { pron: 'meus' },
      { ex: ['Venite mecum in hortum!', 'Venite con me nell’orto!'] }] },
  { id: 'ppt', title: 'Prova d’unità', sub: 'pronomi personali e possessivi', mix: TEST, test: true },
  ] },
{ id: 'v_pass', title: 'Il passivo', say: 'Il passivo dice che cosa subisce il soggetto. Le desinenze nuove sono -or, -ris, -tur, -mur, -minī, -ntur.',
  lessons: [
  { id: 'vps1', title: 'Il presente passivo', sub: 'amor, amāris, amātur', lemmas: ['vexo', 'vulnero', 'libero'], keys: '^v:(ind:pres:pass|inf:pres:pass)', tenses: ['pres'], mix: VERB,
    teach: [
      { say: 'Stesso tema del presente, desinenze passive.' },
      { conj: [['amo', 'v:ind:pres:pass'], ['lego', 'v:ind:pres:pass'], ['audio', 'v:ind:pres:pass']] },
      { p: `Chi compie l’azione, se è una persona, va con ${la('ā / ab')} + ablativo: è il complemento d’agente.` },
      { ex: ['Puellae a magistro laudantur.', 'Le fanciulle sono lodate dal maestro.'] }] },
  { id: 'vps2', title: 'Imperfetto e futuro passivi', sub: 'amābar, amābor', lemmas: ['mitto', 'relinquo', 'deleo'], keys: '^v:(ind:(pres|impf|fut):pass|inf:pres:pass)', mix: VERB,
    teach: [
      { say: 'Anche qui: suffisso dell’imperfetto o del futuro, e desinenze passive.' },
      { conj: [['amo', 'v:ind:impf:pass'], ['amo', 'v:ind:fut:pass'], ['lego', 'v:ind:fut:pass']] },
      { p: `${la('legeris')} (presente, «sei letto») e ${la('legēris')} (futuro, «sarai letto»): li distingue solo la quantità.` },
      { ex: ['Oppidum a Romanis oppugnabatur.', 'La fortezza era assediata dai Romani.'] }] },
  { id: 'vps3', title: 'Agente e causa efficiente', sub: 'ā / ab + abl. · abl. semplice', lemmas: ['terreo', 'vinco', 'punio', 'custodio'], mix: SYN,
    teach: [
      { say: 'Da chi o da che cosa? Persona: ā o ab con l’ablativo. Cosa: l’ablativo da solo.' },
      { tbl: { c: ['Complemento', 'Costruzione', 'Esempio'], r: [['agente (persona)', 'ā / ab + ablativo', `${la('ā magistrō')}, dal maestro`], ['causa efficiente (cosa)', 'ablativo semplice', `${la('sagittīs')}, dalle frecce`]] } },
      { ex: ['Sagittis multi viri vulnerabuntur.', 'Molti uomini saranno feriti dalle frecce.'] }] },
  { id: 'vpst', title: 'Prova d’unità', sub: 'il passivo', mix: TEST, test: true },
  ] },
{ id: 'n3', title: 'Terza declinazione', say: 'La terza declinazione è la più varia. Il segreto è uno solo: il tema si trova nel genitivo.',
  lessons: [
  { id: 'n3a', title: 'Gli imparisillabi', sub: 'rēx, rēgis · mīles, mīlitis', lemmas: ['rex', 'lex', 'miles', 'dux', 'homo', 'consul', 'pax', 'vox'], mix: NOMA,
    teach: [
      { say: 'Il nominativo non basta: impara sempre nominativo e genitivo. Togli -is al genitivo e trovi il tema.' },
      { decl: ['rex', 'miles'] },
      { p: `Genitivo plurale in ${la('-um')}: ${la('rēgum')}, ${la('mīlitum')}.` },
      { ex: ['Rex populo leges dat.', 'Il re dà le leggi al popolo.'] }] },
  { id: 'n3b', title: 'Parisillabi e secondo gruppo', sub: 'cīvis, cīvium · urbs, urbium', lemmas: ['civis', 'hostis', 'navis', 'urbs', 'mons', 'nox', 'mater', 'pater', 'frater', 'defendo'], mix: NOMA,
    teach: [
      { say: 'I parisillabi in -is e i nomi con due consonanti prima di -is fanno il genitivo plurale in -ium.' },
      { decl: ['civis', 'urbs'] },
      { p: `Eccezioni da ricordare: ${la('pater, māter, frāter')} fanno ${la('patrum, mātrum, frātrum')}.` },
      { ex: ['Milites urbem defendunt.', 'I soldati difendono la città.'] }] },
  { id: 'n3c', title: 'I neutri', sub: 'corpus, nōmen, mare', lemmas: ['nomen', 'corpus', 'tempus', 'flumen', 'iter', 'caput', 'carmen', 'opus', 'mare', 'animal', 'litus', 'vulnus', 'appropinquo'], mix: NOMA,
    teach: [
      { say: 'La regola dei neutri vale anche qui: nominativo e accusativo uguali, plurale in -a.' },
      { decl: ['corpus', 'mare'] },
      { p: `I neutri in ${la('-e, -al, -ar')} hanno l’ablativo in ${la('-ī')} e il plurale in ${la('-ia')}: ${la('marī, maria')}.` },
      { ex: ['Navis ad litus appropinquat.', 'La nave si avvicina alla spiaggia.'] }] },
  { id: 'n3d', title: 'Nomi astratti e di persona', sub: 'lībertās, virtūs, amor, legiō', lemmas: ['libertas', 'virtus', 'civitas', 'amor', 'timor', 'clamor', 'legio', 'oratio', 'soror', 'mulier', 'cupio'], mix: NOMA,
    teach: [
      { say: 'Molti nomi astratti sono della terza: -tās, -tūs, -or, -iō. Hanno quasi tutti il genitivo plurale in -um.' },
      { decl: ['virtus', 'legio'] },
      { ex: ['Homines pacem cupiunt.', 'Gli uomini desiderano la pace.'] }] },
  { id: 'n3t', title: 'Prova d’unità', sub: 'terza declinazione', mix: TESTA, test: true },
  ] },
{ id: 'agg2', title: 'Aggettivi della seconda classe', say: 'Gli aggettivi della seconda classe si declinano come i parisillabi della terza: ablativo in -ī, genitivo plurale in -ium.',
  lessons: [
  { id: 'a2a', title: 'Tre e due uscite', sub: 'ācer, ācris, ācre · fortis, forte', lemmas: ['acer', 'celer', 'fortis', 'omnis', 'brevis', 'tristis', 'gravis', 'facilis', 'difficilis'], keys: '^a:pos:', mix: NOMA,
    teach: [
      { say: 'Tre uscite: una per genere. Due uscite: una per maschile e femminile, una per il neutro.' },
      { adj: 'fortis' },
      { p: `${la('Omnis')} al singolare vuol dire «ogni», al plurale «tutti»: ${la('omnēs hominēs')}.` },
      { ex: ['Milites fortes urbem defendunt.', 'I soldati coraggiosi difendono la città.'] }] },
  { id: 'a2b', title: 'Una uscita', sub: 'fēlīx, fēlīcis · prūdēns', lemmas: ['felix', 'prudens', 'ingens', 'sapiens', 'potens', 'audax', 'atrox', 'dives', 'pauper'], keys: '^a:pos:', mix: NOMA,
    teach: [
      { say: 'Un’uscita sola al nominativo per tutti i generi: per riconoscerli guarda il genitivo.' },
      { adj: 'felix' },
      { ex: ['Omnes homines felices esse cupiunt.', 'Tutti gli uomini desiderano essere felici.'] }] },
  { id: 'a2c', title: 'Gli avverbi', sub: 'fortiter, ācriter, celeriter', lemmas: ['fortiter', 'acriter', 'celeriter', 'prudenter', 'facile', 'bene', 'male', 'libenter'], mix: SYN,
    teach: [
      { say: 'Dagli aggettivi della seconda classe nascono avverbi in -iter e -ter; da quelli della prima, avverbi in -ē.' },
      { tbl: { c: ['Aggettivo', 'Avverbio'], r: [[la('fortis'), la('fortiter')], [la('ācer'), la('ācriter')], [la('celer'), la('celeriter')], [la('prūdēns'), la('prūdenter')], [la('bonus'), la('bene')], [la('malus'), la('male')]] } },
      { ex: ['Milites fortiter pugnant.', 'I soldati combattono valorosamente.'] }] },
  { id: 'a2t', title: 'Prova d’unità', sub: 'aggettivi della seconda classe', mix: TESTA, test: true },
  ] },
{ id: 'v_perf', title: 'Il perfetto', say: 'Il perfetto è il tempo del racconto: «venni, vidi, vinsi». Il suo tema lo trovi nel paradigma.',
  lessons: [
  { id: 'vpf1', title: 'Il perfetto attivo', sub: 'amāvī, monuī, rēxī, lēgī', lemmas: ['heri', 'condo', 'Romulus', 'Aeneas'], keys: '^v:ind:perf:act:', tenses: ['pres', 'perf'], mix: VERB,
    teach: [
      { say: 'Le desinenze del perfetto sono uguali per tutti: -ī, -istī, -it, -imus, -istis, -ērunt.' },
      { conj: [['amo', 'v:ind:perf:act'], ['lego', 'v:ind:perf:act']] },
      { forms: [['moneo', 'v:ind:perf:act:0', 'moneō'], ['rego', 'v:ind:perf:act:0', 'regō'], ['capio', 'v:ind:perf:act:0', 'capiō'], ['do', 'v:ind:perf:act:0', 'dō']] },
      { ex: ['Romulus Romam condidit.', 'Romolo fondò Roma.'] }] },
  { id: 'vpf2', title: 'Piuccheperfetto e futuro anteriore', sub: 'amāveram, amāverō', lemmas: ['occupo', 'Hannibal', 'Carthago'], keys: '^v:ind:(perf|ppf|futant):act:', mix: VERB,
    teach: [
      { say: 'Dal tema del perfetto nascono altri due tempi: il piuccheperfetto, «avevo amato», e il futuro anteriore, «avrò amato».' },
      { conj: [['amo', 'v:ind:ppf:act'], ['amo', 'v:ind:futant:act']] },
      { ex: ['Hannibal Romanos superaverat.', 'Annibale aveva sconfitto i Romani.'] }] },
  { id: 'vpf3', title: 'Il perfetto passivo', sub: 'amātus sum · capta est', lemmas: ['interficio', 'occido'], mix: SYN,
    teach: [
      { say: 'Il perfetto passivo si forma con il participio perfetto e sum, come in italiano «è stato amato».' },
      { forms: [['amo', 'v:part:perf:nom:s:m', 'participio perfetto'], ['capio', 'v:part:perf:nom:s:f', 'femminile'], ['mitto', 'v:part:perf:nom:p:m', 'plurale']] },
      { p: `Il participio concorda con il soggetto: ${la('urbs capta est')}, «la città fu presa»; ${la('lēgātī missī sunt')}.` },
      { ex: ['Urbs a militibus capta est.', 'La città fu presa dai soldati.'] }] },
  { id: 'vpft', title: 'Prova d’unità', sub: 'il perfetto', mix: TEST, test: true },
  ] },
{ id: 'n45', title: 'Quarta e quinta declinazione', say: 'Le ultime due declinazioni hanno pochi nomi, ma importanti: exercitus, manus, domus, rēs, diēs.',
  lessons: [
  { id: 'n45a', title: 'La quarta declinazione', sub: 'exercitus, exercitūs · cornū', lemmas: ['exercitus', 'impetus', 'adventus', 'senatus', 'manus', 'portus', 'fructus', 'metus', 'cornu', 'equitatus'], mix: NOMA,
    teach: [
      { say: 'Nella quarta, -us vale per quattro casi: nominativo e genitivo singolare, nominativo e accusativo plurale. Le quantità aiutano: exercitus, exercitūs.' },
      { decl: ['exercitus'] },
      { ex: ['Exercitus Romanus in hostes impetum fecit.', 'L’esercito romano fece un attacco contro i nemici.'] }] },
  { id: 'n45b', title: 'Domus', sub: 'domī, domum, domō', lemmas: ['domus', 'cursus', 'usus', 'magistratus'], mix: NOMA,
    teach: [
      { say: 'Domus mescola forme della seconda e della quarta, e come i nomi di città non vuole preposizioni.' },
      { decl: ['domus'] },
      { p: `${la('domī')}, a casa (stato); ${la('domum')}, verso casa; ${la('domō')}, da casa.` },
      { ex: ['Pueri domum properant.', 'I fanciulli si affrettano verso casa.'] }] },
  { id: 'n45c', title: 'La quinta declinazione', sub: 'rēs, reī · diēs, diēī', lemmas: ['res', 'dies', 'spes', 'fides', 'acies', 'publicus'], mix: NOMA,
    teach: [
      { say: 'La quinta ha la e dappertutto. Rēs ha tantissimi significati: cosa, fatto, situazione, impresa.' },
      { decl: ['res', 'dies'] },
      { p: `${la('Rēs pūblica')}, «la cosa pubblica», è lo Stato.` },
      { ex: ['Res publica in magno periculo erat.', 'Lo Stato era in grande pericolo.'] }] },
  { id: 'n45t', title: 'Prova d’unità', sub: 'quarta e quinta declinazione', mix: TESTA, test: true },
  ] },
{ id: 'pron_dim', title: 'Pronomi dimostrativi', say: 'Questo, quello, lui stesso: i dimostrativi indicano e richiamano.',
  lessons: [
  { id: 'pd1', title: 'Is, ea, id', sub: 'egli, quello', lemmas: ['is'], mix: SYN,
    teach: [
      { say: 'Is richiama qualcuno già nominato. Nei casi obliqui si traduce spesso con lo, gli, li, loro.' },
      { pron: 'is' },
      { p: `${la('eius, eōrum')}, «di lui, di loro», non è riflessivo: si riferisce a qualcuno diverso dal soggetto.` },
      { ex: ['Caesar eum laudavit.', 'Cesare lo lodò.'] }] },
  { id: 'pd2', title: 'Hic, iste, ille', sub: 'questo, codesto, quello', lemmas: ['hic', 'iste', 'ille'], mix: SYN,
    teach: [
      { say: 'Hic è vicino a chi parla, iste a chi ascolta, ille lontano da entrambi.' },
      { pron: 'hic' }, { pron: 'ille' },
      { ex: ['Haec est patria nostra.', 'Questa è la nostra patria.'] }] },
  { id: 'pd3', title: 'Ipse e īdem', sub: 'stesso, medesimo', lemmas: ['ipse', 'idem'], mix: SYN,
    teach: [
      { say: 'Ipse vuol dire «in persona, proprio lui»; īdem «lo stesso, il medesimo».' },
      { pron: 'ipse' }, { pron: 'idem' },
      { ex: ['Ipse rex in proelio pugnavit.', 'Il re in persona combatté nella battaglia.'] }] },
  { id: 'pdt', title: 'Prova d’unità', sub: 'pronomi dimostrativi', mix: TEST, test: true },
  ] },
{ id: 's_sub', title: 'Temporali e causali', say: 'Quando, mentre, perché, se: con le congiunzioni le frasi diventano periodi.',
  lessons: [
  { id: 'ss1', title: 'Le temporali', sub: 'postquam, ubi, dum', lemmas: ['postquam', 'ubi', 'dum', 'antequam'], mix: SYN,
    teach: [
      { say: 'Metti la subordinata tra parentesi: dalla congiunzione fino al suo verbo. Quello che resta è la principale.' },
      { tbl: { c: ['Congiunzione', 'Traduzione'], r: [[la('postquam'), 'dopo che'], [la('ubi'), 'quando, appena'], [la('dum'), 'mentre, finché']] } },
      { p: `Dopo ${la('postquam')} e ${la('ubi')} il latino usa il perfetto anche dove l’italiano preferisce il trapassato.` },
      { ex: ['Dum pueri ludunt, ancillae cenam parant.', 'Mentre i fanciulli giocano, le ancelle preparano la cena.'] }] },
  { id: 'ss2', title: 'Le causali', sub: 'quod, quia, quoniam', lemmas: ['quod', 'quia', 'quoniam'], mix: SYN,
    teach: [
      { say: 'Quod, quia, quoniam con l’indicativo: «perché, poiché».' },
      { ex: ['Discipuli laeti sunt, quod magister eos laudavit.', 'Gli allievi sono contenti, perché il maestro li ha lodati.'] }] },
  { id: 'ss3', title: 'Condizionali e concessive', sub: 'sī, nisi, quamquam', lemmas: ['si', 'nisi', 'quamquam'], mix: SYN,
    teach: [
      { say: 'Sī vuol dire «se», nisi «se non», quamquam «sebbene».' },
      { ex: ['Si amicos habes, felix es.', 'Se hai amici, sei felice.'] }] },
  { id: 'sst', title: 'Prova d’unità', sub: 'temporali e causali', mix: TEST, test: true },
  ] },
{ id: 'pron_rel', title: 'Il relativo', say: 'Il quale, la quale, che: il relativo lega una frase a un nome.',
  lessons: [
  { id: 'pr1', title: 'Il relativo soggetto e oggetto', sub: 'quī, quae, quod · quem, quam', lemmas: ['qui'], keys: '^p:(nom|acc):', mix: SYN,
    teach: [
      { say: 'Il relativo prende genere e numero dal nome a cui si riferisce, ma il caso dalla sua funzione nella relativa.' },
      { pron: 'qui', cases: ['nom', 'acc'] },
      { ex: ['Puer quem vides meus filius est.', 'Il fanciullo che vedi è mio figlio.'] }] },
  { id: 'pr2', title: 'Tutti i casi del relativo', sub: 'cuius, cui, quō', lemmas: ['gens', 'pars', 'ars', 'mors'], mix: SYN,
    teach: [
      { say: 'Cuius è «del quale, il cui»; cui «al quale»; quō, quā «dal quale, con il quale».' },
      { pron: 'qui' },
      { ex: ['Urbs in qua habitamus magna est.', 'La città in cui abitiamo è grande.'] }] },
  { id: 'pr3', title: 'Chi? Che cosa?', sub: 'quis, quid · ea quae', lemmas: ['quis', 'nihil', 'nemo'], mix: SYN,
    teach: [
      { say: 'Quis? e quid? sono domande: «chi?», «che cosa?». Ea quae vuol dire «le cose che, ciò che».' },
      { ex: ['Quis te vocavit?', 'Chi ti ha chiamato?'] },
      { ex: ['Ea quae dicis vera sunt.', 'Le cose che dici sono vere.'] }] },
  { id: 'prt', title: 'Prova d’unità', sub: 'il relativo', mix: TEST, test: true },
  ] },
{ id: 'comp', title: 'Comparativo e superlativo', say: 'Più grande, grandissimo: anche in latino gli aggettivi hanno i gradi.',
  lessons: [
  { id: 'cp1', title: 'Il comparativo', sub: 'altior, altius · quam', lemmas: ['quam', 'Tusculum', 'similis'], keys: '^(a:comp:|i$)', mix: NOMA,
    teach: [
      { say: 'Il comparativo esce in -ior (maschile e femminile) e -ius (neutro), e si declina come la terza.' },
      { degrees: ['altus', 'fortis'], show: ['pos', 'comp'] },
      { p: `Il secondo termine va con ${la('quam')} nello stesso caso del primo, oppure in ablativo: ${la('nihil est amīcitiā pulchrius')}.` },
      { ex: ['Roma maior est quam Tusculum.', 'Roma è più grande di Tuscolo.'] }] },
  { id: 'cp2', title: 'Il superlativo', sub: 'altissimus, pulcherrimus, facillimus', lemmas: ['Belgae', 'Alpes', 'utilis', 'nobilis'], mix: NOMA,
    teach: [
      { say: 'Superlativo in -issimus; in -errimus per gli aggettivi in -er; in -illimus per facilis e simili.' },
      { degrees: ['altus', 'pulcher', 'facilis'] },
      { ex: ['Alpes altissimi montes sunt.', 'Le Alpi sono monti altissimi.'] }] },
  { id: 'cp3', title: 'Comparativi irregolari', sub: 'melior, optimus · māior, maximus', lemmas: ['incertus', 'dulcis', 'levis'], mix: NOMA,
    teach: [
      { say: 'Cinque aggettivi frequentissimi sono irregolari: conviene impararli subito.' },
      { degrees: ['bonus', 'malus', 'magnus', 'parvus', 'multus'] },
      { ex: ['Certa pax melior est quam incerta victoria.', 'Una pace sicura è migliore di una vittoria incerta.'] }] },
  { id: 'cpt', title: 'Prova d’unità', sub: 'comparativo e superlativo', mix: TESTA, test: true },
  ] },
{ id: 'v_irr', title: 'Verbi irregolari', say: 'Volo, eō, ferō: verbi brevi e un po’ capricciosi, ma ovunque nei testi.',
  lessons: [
  { id: 'vr1', title: 'Volō, nōlō, mālō', sub: 'volere, non volere, preferire', lemmas: ['volo@v_irr', 'nolo', 'malo'], mix: VERB,
    teach: [
      { say: 'Nōlō è nōn volō; mālō è magis volō, «voglio di più», cioè preferisco.' },
      { conj: [['volo@v_irr', 'v:ind:pres:act'], ['nolo', 'v:ind:pres:act'], ['malo', 'v:ind:pres:act']] },
      { p: `${la('Nōlī, nōlīte')} + infinito è il divieto: ${la('nōlī timēre')}, «non temere».` },
      { ex: ['Volo, sed non possum.', 'Voglio, ma non posso.', 'volo=volo@v_irr'] }] },
  { id: 'vr2', title: 'Eō e i suoi composti', sub: 'eō, īs, it · redeō, exeō', lemmas: ['eo', 'redeo', 'exeo', 'abeo', 'transeo', 'adeo', 'pereo'], mix: VERB,
    teach: [
      { say: 'Eō, «vado», ha il tema i- davanti a consonante ed e- davanti a vocale.' },
      { conj: [['eo', 'v:ind:pres:act'], ['eo', 'v:ind:impf:act']] },
      { ex: ['Pueri domum eunt.', 'I fanciulli vanno a casa.'] }] },
  { id: 'vr3', title: 'Ferō e fīō', sub: 'ferō, tulī, lātum · fīō', lemmas: ['fero', 'affero', 'refero', 'aufero', 'confero', 'fio'], mix: VERB,
    teach: [
      { say: 'Ferō ha tre temi diversi: fer-, tul-, lāt-. Fīō fa da passivo di faciō: «divento, accado».' },
      { conj: [['fero', 'v:ind:pres:act'], ['fero', 'v:ind:pres:pass'], ['fio', 'v:ind:pres:act']] },
      { ex: ['Milites arma ferunt.', 'I soldati portano le armi.'] }] },
  { id: 'vrt', title: 'Prova d’unità', sub: 'verbi irregolari', mix: TEST, test: true },
  ] },
{ id: 'v_dep', title: 'Verbi deponenti', say: 'I deponenti hanno forma passiva e significato attivo: hortātur vuol dire «esorta».',
  lessons: [
  { id: 'vd1', title: 'Deponenti della 1ª e della 2ª', sub: 'hortor, vereor', lemmas: ['hortor', 'conor', 'miror', 'arbitror', 'precor', 'vereor', 'polliceor'], keys: '^v:(ind:(pres|impf|fut):dep|inf:pres:dep)', tenses: ['pres', 'impf', 'fut'], mix: VERB,
    teach: [
      { say: 'Le desinenze sono quelle del passivo, ma il verbo si traduce all’attivo.' },
      { conj: [['hortor', 'v:ind:pres:dep'], ['vereor', 'v:ind:pres:dep']] },
      { ex: ['Caesar milites hortatur.', 'Cesare esorta i soldati.'] }] },
  { id: 'vd2', title: 'Deponenti della 3ª, mista e 4ª', sub: 'sequor, patior, largior', lemmas: ['sequor', 'loquor', 'utor', 'proficiscor', 'nascor', 'patior', 'morior', 'aggredior', 'egredior', 'largior'], keys: '^v:(ind:(pres|impf|fut):dep|inf:pres:dep)', tenses: ['pres', 'impf', 'fut'], mix: VERB,
    teach: [
      { say: 'Utor vuole l’ablativo: milites gladiīs ūtuntur, «i soldati usano le spade».' },
      { conj: [['sequor', 'v:ind:pres:dep'], ['patior', 'v:ind:pres:dep']] },
      { ex: ['Milites gladiis utuntur.', 'I soldati usano le spade.'] }] },
  { id: 'vd3', title: 'Il perfetto dei deponenti', sub: 'hortātus sum · audeō, ausus sum', lemmas: ['audeo', 'soleo', 'progredior', 'orior', 'experior', 'amicitia'], mix: SYN,
    teach: [
      { say: 'Il perfetto dei deponenti è participio + sum, ma attivo: locūtus est, «parlò».' },
      { forms: [['loquor', 'v:part:perf:nom:s:m', 'loquor'], ['proficiscor', 'v:part:perf:nom:s:m', 'proficīscor'], ['audeo', 'v:part:perf:nom:s:m', 'audeō (semideponente)']] },
      { ex: ['Cicero de amicitia locutus est.', 'Cicerone parlò dell’amicizia.'] }] },
  { id: 'vdt', title: 'Prova d’unità', sub: 'verbi deponenti', mix: TEST, test: true },
  ] },
{ id: 'v_part', title: 'Il participio', say: 'Il participio è un aggettivo che nasce da un verbo: «che ama», «amato», «che sta per amare».',
  lessons: [
  { id: 'vpa1', title: 'Il participio presente', sub: 'amāns, amantis', lemmas: ['sol', 'leo'], keys: '^v:part:pres:', mix: VERB,
    teach: [
      { say: 'Il participio presente indica un’azione che avviene insieme a quella della frase.' },
      { part: 'amo', tense: 'pres' },
      { ex: ['Milites, hostes videntes, fugerunt.', 'I soldati, vedendo i nemici, fuggirono.'] }] },
  { id: 'vpa2', title: 'Participio perfetto e futuro', sub: 'amātus · amātūrus', lemmas: ['gladiator', 'princeps'], mix: SYN,
    teach: [
      { say: 'Il perfetto indica un’azione già avvenuta (passiva); il futuro un’azione che sta per avvenire.' },
      { forms: [['amo', 'v:part:perf:nom:s:m', 'perfetto'], ['amo', 'v:part:fut:nom:s:m', 'futuro'], ['morior', 'v:part:fut:nom:p:m', 'futuro di morior']] },
      { ex: ['Gladiatores morituri imperatorem salutabant.', 'I gladiatori che stavano per morire salutavano l’imperatore.'] }] },
  { id: 'vpa3', title: 'L’ablativo assoluto', sub: 'urbe captā · Caesare duce', lemmas: ['hiems', 'aestas', 'vis'], mix: SYN,
    teach: [
      { say: 'Nome e participio in ablativo, staccati dal resto della frase: è l’ablativo assoluto.' },
      { p: `${la('Urbe captā')}: «presa la città», oppure «dopo che la città fu presa». Esiste anche senza participio: ${la('Caesare duce')}, «sotto il comando di Cesare».` },
      { ex: ['Urbe capta, hostes fugerunt.', 'Presa la città, i nemici fuggirono.'] }] },
  { id: 'vpat', title: 'Prova d’unità', sub: 'il participio', mix: TEST, test: true },
  ] },
{ id: 'v_inf', title: 'L’infinitiva', say: '«So che tu dici il vero»: in latino si dice con l’accusativo e l’infinito.',
  lessons: [
  { id: 'vn1', title: 'Gli infiniti', sub: 'amāre, amārī, amāvisse', lemmas: ['scio', 'puto', 'spero', 'nuntio', 'erro'], mix: VERB,
    teach: [
      { say: 'Tre tempi: presente (contemporaneità), perfetto (anteriorità), futuro (posteriorità).' },
      { forms: [['amo', 'v:inf:pres:act', 'presente attivo'], ['amo', 'v:inf:pres:pass', 'presente passivo'], ['amo', 'v:inf:perf:act', 'perfetto attivo'], ['amo', 'v:part:fut:acc:s:m', 'futuro: participio + esse']] },
      { ex: ['Puto te errare.', 'Penso che tu sbagli.'] }] },
  { id: 'vn2', title: 'La proposizione infinitiva', sub: 'sciō tē vērum dīcere', lemmas: ['consto', 'ostendo'], mix: SYN,
    teach: [
      { say: 'Dopo «dire, pensare, sapere» il soggetto va in accusativo e il verbo all’infinito. Traduci con «che».' },
      { ex: ['Scio te verum dicere.', 'So che tu dici il vero.'] }] },
  { id: 'vn3', title: 'Anteriorità e posteriorità', sub: 'dīxit hostēs fūgisse', lemmas: ['cerno'], mix: SYN,
    teach: [
      { say: 'L’infinito perfetto indica un’azione anteriore, il futuro un’azione posteriore alla reggente.' },
      { ex: ['Caesar dixit hostes fugisse.', 'Cesare disse che i nemici erano fuggiti.'] }] },
  { id: 'vnt', title: 'Prova d’unità', sub: 'l’infinitiva', mix: TEST, test: true },
  ] },
{ id: 'v_cong', title: 'Il congiuntivo', say: 'Il congiuntivo è il modo dello scopo e della conseguenza: «affinché», «cosicché».',
  lessons: [
  { id: 'vc1', title: 'Il congiuntivo presente', sub: 'amem, moneam, legam', lemmas: ['ut', 'ne'], keys: '^v:cong:pres:', mix: VERB,
    teach: [
      { say: 'La vocale cambia: e nella prima (amem), a nelle altre (moneam, legam, audiam).' },
      { conj: [['amo', 'v:cong:pres:act'], ['moneo', 'v:cong:pres:act'], ['lego', 'v:cong:pres:act']] },
      { ex: ['Milites pugnant ut patriam defendant.', 'I soldati combattono per difendere la patria.'] }] },
  { id: 'vc2', title: 'Il congiuntivo imperfetto', sub: 'amārem, legerem, essem', lemmas: ['tantus', 'tam', 'ita', 'sic', 'tempestas'], keys: '^v:cong:(pres|impf):', mix: VERB,
    teach: [
      { say: 'Facilissimo: l’infinito presente più le desinenze -m, -s, -t…' },
      { conj: [['amo', 'v:cong:impf:act'], ['lego', 'v:cong:impf:act'], ['sum', 'v:cong:impf:act']] },
      { ex: ['Tanta erat tempestas ut nautae navigare non possent.', 'La tempesta era così grande che i marinai non potevano navigare.'] }] },
  { id: 'vc3', title: 'Perfetto e piuccheperfetto', sub: 'amāverim, amāvissem', lemmas: ['moenia'], mix: VERB,
    teach: [
      { say: 'Dal tema del perfetto: -erim per il perfetto, -issem per il piuccheperfetto.' },
      { conj: [['amo', 'v:cong:perf:act'], ['amo', 'v:cong:ppf:act']] },
      { ex: ['Caesar legatos misit ne Galli bellum facerent.', 'Cesare mandò ambasciatori perché i Galli non facessero la guerra.'] }] },
  { id: 'vc4', title: 'Finali e consecutive', sub: 'ut, nē · tam… ut', mix: SYN,
    teach: [
      { say: 'Ut + congiuntivo è finale («affinché») o consecutiva («cosicché»): se nella principale c’è tam, ita, tantus o sīc, è consecutiva.' },
      { tbl: { c: ['Proposizione', 'Introduttori', 'Traduzione'], r: [['finale', `${la('ut')} / ${la('nē')} + congiuntivo`, 'per, affinché / affinché non'], ['consecutiva', `${la('tam, ita, sīc, tantus… ut')}`, 'così… che']] } },
      { ex: ['Magister tam bene docet ut omnes discipuli eum ament.', 'Il maestro insegna così bene che tutti gli allievi lo amano.'] }] },
  { id: 'vct', title: 'Prova d’unità', sub: 'il congiuntivo', mix: TEST, test: true },
  ] },
{ id: 's_cum', title: 'Il cum narrativo', say: 'Ultima tappa: cum con il congiuntivo, la costruzione preferita dagli storici romani.',
  lessons: [
  { id: 'sc1', title: 'Cum + congiuntivo imperfetto', sub: 'cum hostēs appropinquārent', lemmas: ['cum@s_cum'], mix: SYN,
    teach: [
      { say: 'Cum con il congiuntivo imperfetto indica un’azione contemporanea: «mentre, poiché».' },
      { ex: ['Cum esset nox, milites dormiebant.', 'Essendo notte, i soldati dormivano.'] }] },
  { id: 'sc2', title: 'Cum + congiuntivo piuccheperfetto', sub: 'cum Caesar vēnisset', lemmas: ['Hamilcar'], mix: SYN,
    teach: [
      { say: 'Con il piuccheperfetto l’azione è anteriore: «dopo che, essendo giunto».' },
      { ex: ['Cum Romani urbem cepissent, incolae fugerunt.', 'Dopo che i Romani ebbero preso la città, gli abitanti fuggirono.'] }] },
  { id: 'sc3', title: 'Cum preposizione o congiunzione?', sub: 'cum amīcīs · cum vēnisset', lemmas: ['Iuppiter'], mix: SYN,
    teach: [
      { say: 'Trovato un cum? Se dopo c’è un ablativo è la preposizione «con»; se la frase arriva a un congiuntivo è la congiunzione.' },
      { ex: ['Cum Cicero orationem haberet, omnes tacebant.', 'Mentre Cicerone teneva il discorso, tutti tacevano.'] }] },
  { id: 'sct', title: 'Prova finale', sub: 'tutto il percorso', mix: TEST, test: true },
  ] },
];

/* frasi d'incoraggiamento della guida */
const CHEERS = ['Optimē! Continua così.', 'Bene! Stai diventando un vero interpres.', 'Ottimo lavoro: anche Cicerone approverebbe.', 'Perfetto! Gli dèi ti sono favorevoli.', 'Splendido!'];
const COMFORT = ['Nessun problema: gli errori sono maestri.', 'Quasi! Guarda bene le desinenze.', 'Coraggio: errando discitur, si impara sbagliando.', 'Ripassiamolo insieme: tocca «Teoria».'];

root.VERTO_COURSE = { UNITS, CHEERS, COMFORT };
if (typeof module !== 'undefined') module.exports = root.VERTO_COURSE;
})(typeof window !== 'undefined' ? window : globalThis);
