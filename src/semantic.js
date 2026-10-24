/* VERTO — lessico semantico del generatore di frasi.
   Ogni parola rimanda a un lemma del lessico latino (le forme latine vengono dal motore morfologico).

   NOMI  latino|etichette|italiano|opzioni
     etichette: H persona, A animale, P luogo, T cosa, X astratto, E evento, Z tempo, N nome proprio,
                C città, R regione + sottoclassi (kid, mil, rul, wrk, srv, port…)
     italiano:  singolare/plurale:genere[:numero fisso]; più varianti separate da virgola
     opzioni:   su (stato in luogo con «su»), ad (moto con ad / a,ab), sg (solo singolare), noart, kin, nosubj,
                artpl=gli, time=…, locnoart, city, reg
   AGGETTIVI latino|italiano (+ = prima del nome)|nomi ammessi
   VERBI vedi VERBS più sotto. */
(function (root) {
const NOUNS = `
puella|H kid f|fanciulla/fanciulle:f,ragazza/ragazze:f|
puer|H kid m|fanciullo/fanciulli:m,ragazzo/ragazzi:m,bambino/bambini:m|
agricola|H wrk m|agricoltore/agricoltori:m,contadino/contadini:m|
nauta|H sea m|marinaio/marinai:m|
poeta|H art m|poeta/poeti:m|
incola|H wrk civ|abitante/abitanti:m|
regina|H rul f|regina/regine:f|
ancilla|H srv f|ancella/ancelle:f,serva/serve:f|
domina|H rul own f|padrona/padrone:f|
dominus|H rul own m|padrone/padroni:m|
servus|H srv m|servo/servi:m,schiavo/schiavi:m|
magister|H tch m|maestro/maestri:m|
discipulus|H kid m|allievo/allievi:m,scolaro/scolari:m|
amicus|H fr m|amico/amici:m|
amica|H fr f|amica/amiche:f|
legatus|H mil msg m|ambasciatore/ambasciatori:m,legato/legati:m|
filius|H kid kin m|figlio/figli:m|kin
filia|H kid kin f|figlia/figlie:f|kin
vir|H m|uomo/uomini:m|
socius|H mil m|alleato/alleati:m|
nuntius|H msg m|messaggero/messaggeri:m|
rex|H rul m|re/re:m|
miles|H mil m|soldato/soldati:m|
dux|H mil rul m|comandante/comandanti:m|
consul|H mil rul m|console/consoli:m|
hostis|H mil foe m|nemico/nemici:m|plp
civis|H civ m|cittadino/cittadini:m|
mater|H kin par f|madre/madri:f|kin
pater|H kin par m|padre/padri:m|kin
frater|H kin m|fratello/fratelli:m|kin
soror|H kin f|sorella/sorelle:f|kin
homo|H m|uomo/uomini:m|
mulier|H f|donna/donne:f|
senex|H old m|vecchio/vecchi:m,anziano/anziani:m|
iuvenis|H m|giovane/giovani:m|
orator|H art m|oratore/oratori:m|
imperator|H mil rul m|comandante/comandanti:m,generale/generali:m|
populus|H col civ|popolo:m:s|sg
exercitus|H mil col|esercito/eserciti:m|
senatus|H col|senato:m:s|sg
Romani|H mil gent|Romani:m:p|
Galli|H mil foe gent|Galli:m:p|
Graeci|H gent|Greci:m:p|
Caesar|H N mil rul m|Cesare:m:s|noart
Hannibal|H N mil rul foe m|Annibale:m:s|noart
Cicero|H N art m|Cicerone:m:s|noart
Romulus|H N rul mil m|Romolo:m:s|noart
Aeneas|H N m|Enea:m:s|noart
Cornelia|H N f|Cornelia:f:s|noart
deus|god m|dio/dèi:m|artpl=gli,plp
dea|god f|dea/dee:f|
Minerva|god G f|Minerva:f:s|noart
Diana|god G f|Diana:f:s|noart
lupus|A wild|lupo/lupi:m|
agnus|A herd|agnello/agnelli:m|
equus|A ride|cavallo/cavalli:m|
asinus|A ride|asino/asini:m|
canis|A dom|cane/cani:m|
ovis|A herd|pecora/pecore:f|
leo|A wild|leone/leoni:m|
fera|A wild|belva/belve:f,fiera/fiere:f|
silva|P nat|bosco/boschi:m,selva/selve:f|
insula|P nat|isola/isole:f|su
villa|P bld|villa/ville:f,fattoria/fattorie:f|
via|P road|strada/strade:f,via/vie:f|su
hortus|P green|orto/orti:m,giardino/giardini:m|
ager|P farm|campo/campi:m|
forum|P city|foro/fori:m,piazza/piazze:f|
templum|P bld sac|tempio/templi:m|
oppidum|P city camp|fortezza/fortezze:f,città fortificata/città fortificate:f|
castra|P camp|accampamento:m:s|nosubj
urbs|P city|città/città:f|
mons|P nat|monte/monti:m|su,ad
mare|P nat water|mare/mari:m|
litus|P nat shore|spiaggia/spiagge:f,lido/lidi:m|su,ad
flumen|P nat water|fiume/fiumi:m|ad
portus|P water shore|porto/porti:m|
Roma|P C|Roma:f:s|noart,city
Athenae|P C|Atene:f:s|noart,city
Carthago|P C|Cartagine:f:s|noart,city
Italia|P R|Italia:f:s|reg
Graecia|P R|Grecia:f:s|reg
Gallia|P R|Gallia:f:s|reg
Sicilia|P R|Sicilia:f:s|reg
rosa|T port flw|rosa/rose:f|
aqua|T port liq|acqua:f:s|sg
sagitta|T port wpn|freccia/frecce:f|plp
pecunia|T port val|denaro:m:s|sg
epistula|T port txt|lettera/lettere:f|
donum|T port gift|dono/doni:m,regalo/regali:m|
frumentum|T port food|frumento:m:s,grano:m:s|sg
gladius|T port wpn|spada/spade:f|sgp
arma|T port wpn|armi:f:p|
liber|T port txt|libro/libri:m|
aurum|T port val|oro:m:s|sg
vinum|T port liq food|vino:m:s|sg
praemium|T port gift|premio/premi:m|
signum|T port ens|insegna/insegne:f|
cena|T food meal|cena:f:s|sg
praeda|T port val|bottino:m:s,preda:f:s|sg
fructus|T port food|frutto/frutti:m|
umbra|T nat2|ombra:f:s|sg
navis|T veh|nave/navi:f|
murus|T struct|muro/muri:m|
porta|T struct|porta/porte:f|
columna|T struct|colonna/colonne:f|
carmen|T song|carme/carmi:m,poesia/poesie:f|
fabula|T story|favola/favole:f,storia/storie:f|
verbum|T word|parola/parole:f|plp
terra|T soil|terra:f:s|sg
sapientia|X virt|saggezza:f:s,sapienza:f:s|sg
gloria|X|gloria:f:s|sg
victoria|X good|vittoria/vittorie:f|
pax|X good|pace:f:s|sg
libertas|X good val|libertà:f:s|sg
virtus|X virt|valore:m:s,virtù:f:s|sg
amicitia|X good|amicizia/amicizie:f|
fortuna|X|fortuna:f:s|sg
patria|X pat|patria:f:s|sg
consilium|X adv|consiglio/consigli:m|sgp
auxilium|X good|aiuto:m:s|sg
periculum|X bad|pericolo/pericoli:m|
iniuria|X bad|offesa/offese:f|
laetitia|X man|gioia:f:s|sg
cura|X man|cura:f:s,attenzione:f:s|sg
audacia|X man virt|audacia:f:s|sg
ira|X man bad|ira:f:s,rabbia:f:s|sg
spes|X|speranza:f:s|sg
fides|X virt|lealtà:f:s,fedeltà:f:s|sg
servitus|X bad|schiavitù:f:s|sg
pugna|E fight|battaglia/battaglie:f,combattimento/combattimenti:m|locnoart
proelium|E fight|battaglia/battaglie:f,scontro/scontri:m|locnoart
bellum|E fight|guerra/guerre:f|locnoart,sgp
tempestas|E weather|tempesta/tempeste:f|
impetus|E fight|assalto/assalti:m,attacco/attacchi:m|
hiems|Z season|inverno:m:s|sg,time=d'inverno;in inverno
aestas|Z season|estate:f:s|sg,time=d'estate;in estate
nox|Z|notte/notti:f|time=di notte;durante la notte
annus|Z dur|anno/anni:m|
dies|Z dur|giorno/giorni:m|
`;

const ADJS = `
bonus|buono+|H !col !gent adv =liber =vinum
malus|cattivo|H
magnus|grande+|P A T E rul virt =gloria =victoria =periculum =cura !soil !liq !val !col !gent
parvus|piccolo+|kid A bld green =oppidum =navis =donum =liber =insula
altus|alto+|=mons =murus =columna =templum =porta
longus|lungo/lunghi/lunghe|=via =murus =bellum =flumen
pulcher|bello+|f green nat flw song =villa =templum =donum
miser|misero,povero+|H
laetus|lieto,contento|H
novus|nuovo+|bld city struct =navis =liber =carmen
antiquus|antico/antichi/antiche+|bld city =carmen =fabula
clarus|famoso,illustre|H city
superbus|superbo|rul
iustus|giusto|rul tch
tutus|sicuro|P
certus|sicuro,certo|=victoria =pax =auxilium =spes
verus|vero|=amicitia =gloria
aeger|malato|H
doctus|dotto,istruito|art tch old
validus|forte,robusto|wrk mil ride
latus|largo/larghi/larghe|=via =flumen =ager
Romanus|romano|=miles =civis =populus =exercitus
Graecus|greco/greci/greche|art
fortis|forte,coraggioso|mil wild
brevis|breve|fight =via
acer|aspro+,duro+|fight
celer|veloce,rapido|ride dom msg =navis
felix|felice,fortunato|H
prudens|prudente,saggio|rul mil old
ingens|immenso,enorme|nat wild weather =navis
sapiens|saggio|rul old art tch
tristis|triste|H
crudelis|crudele|rul foe wild fight
gravis|grave|bad fight
nobilis|nobile,famoso|H city
utilis|utile|adv =auxilium =liber
dulcis|dolce|liq =fructus song
terribilis|terribile,spaventoso|wild fight weather
potens|potente|rul city
audax|audace|H
atrox|atroce|fight
fidelis|fedele|srv fr mil dom
dives|ricco/ricchi/ricche|H city
pauper|povero|H
`;

/* VERBI
   la: lemma latino (f: filtro sul paradigma), it: traduzioni italiane in ordine di preferenza
     «avere paura:di» = verbo + particella, «:di» preposizione dell'oggetto; «affrettarsi» riflessivo
   s soggetto, o oggetto, oc caso dell'oggetto (acc, abl, dat), d dativo (termine), dreq dativo obbligatorio
   pp complementi ammessi: loc, to, from, per, with, instr, sep, de, pro, toH (ad + persona), fromH (a/ab + persona)
   req: almeno un complemento obbligatorio; toIt: resa di «to» (loc | verso | per | a); withIt: resa di «with»
   pass: ammette il passivo; ab: soggetti adatti all'ablativo assoluto; oopt: l'oggetto si può sottintendere (canto, lego) */
const VERBS = [
 { la:'amo', it: ['amare'], s:'H', o:'H A port X P C', pass: 1 },
 { la:'laudo', it: ['lodare'], s:'H', o:'H virt =consilium =victoria', pass: 1 },
 { la:'voco', it: ['chiamare'], s:'H', o:'H dom ride', pass: 1 },
 { la:'porto', it: ['portare'], s:'wrk srv mil kid ride sea', o:'port', pp: { to:'P C', from:'P C'}, toIt:'loc', pass: 1 },
 { la:'narro', it: ['raccontare','narrare'], s:'H', o:'=fabula', d:'H', pass: 1 },
 { la:'do', it: ['dare'], s:'H', o:'port =auxilium =consilium', d:'H', dreq: 1, pass: 1 },
 { la:'dono', it: ['donare','regalare'], s:'H', o:'flw gift val =liber', d:'H', dreq: 1, pass: 1 },
 { la:'habito', it: ['abitare'], s:'H !col', pp: { loc:'nat bld city farm C R !water !shore !road', with:'H'}, req:'loc'},
 { la:'ambulo', it: ['passeggiare','camminare'], s:'H !col', pp: { loc:'nat green city road farm !water', per:'=silva =ager road =forum', with:'H'} },
 { la:'laboro', it: ['lavorare'], s:'wrk srv', pp: { loc:'farm bld city', with:'H'} },
 { la:'canto', it: ['cantare'], s:'H !col', o:'song', pp: { loc:'nat green city sac'}, pass: 1, oopt: 1 },
 { la:'paro', it: ['preparare'], s:'H', o:'=cena =arma =bellum', pass: 1 },
 { la:'propero', it: ['affrettarsi'], s:'H A', pp: { to:'P C', with:'H'}, req:'to', toIt:'verso'},
 { la:'navigo', it: ['navigare'], s:'sea gent', pp: { to:'C R =insula =portus =litus', from:'C R =insula =portus'}, req:'to from', toIt:'verso'},
 { la:'pugno', it: ['combattere'], s:'mil gent', pp: { with:'foe', pro:'=patria =libertas', loc:'nat farm'}, withIt:'contro'},
 { la:'supero', it: ['superare','sconfiggere'], s:'mil gent', o:'foe', pass: 1 },
 { la:'oppugno', it: ['assediare','attaccare'], s:'mil gent', o:'=urbs =oppidum =castra C', pass: 1 },
 { la:'expugno', it: ['espugnare','conquistare'], s:'mil gent', o:'=urbs =oppidum =castra C', pass: 1, ab:'mil gent'},
 { la:'vulnero', it: ['ferire'], s:'mil foe', o:'H A !col !gent !N', pp: { instr:'wpn'}, pass: 1 },
 { la:'orno', it: ['ornare','adornare'], s:'H !col', o:'=templum =villa =forum =columna =porta', pp: { instr:'flw =signum =aurum'}, pass: 1 },
 { la:'servo', it: ['salvare'], s:'H', o:'=patria =urbs C =civis =socius kid', pp: { sep:'=periculum'}, pass: 1 },
 { la:'servo', it: ['conservare','mantenere'], s:'H', o:'=pax =libertas =amicitia', pass: 1 },
 { la:'specto', it: ['guardare','osservare'], s:'H', o:'H A nat sac =navis', pass: 1, oopt: 1 },
 { la:'exspecto', it: ['aspettare','attendere'], s:'H dom', o:'H !col !gent', pp: { loc:'P C'}, pass: 1, oopt: 1 },
 { la:'neco', it: ['uccidere'], s:'wild', o:'herd'},
 { la:'neco', it: ['uccidere'], s:'mil', o:'foe wild', pp: { instr:'wpn'}, pass: 1 },
 { la:'libero', it: ['liberare'], s:'mil rul gent', o:'=patria =urbs C =civis =socius srv', pp: { sep:'=periculum =servitus'}, pass: 1 },
 { la:'aedifico', it: ['costruire'], s:'H', o:'=templum =villa =oppidum =murus =navis =porta', pass: 1, ab:'H'},
 { la:'nuntio', it: ['annunciare'], s:'msg mil', o:'=victoria =pax', d:'H', pass: 1 },
 { la:'occupo', it: ['occupare'], s:'mil gent', o:'=urbs =oppidum =mons =insula =castra =forum C', pass: 1, ab:'mil gent'},
 { la:'spero', it: ['sperare'], s:'H', o:'=pax =victoria =auxilium =praemium =libertas'},
 { la:'moneo', it: ['ammonire','avvertire'], s:'tch par old rul', o:'kid srv mil fr', pass: 1 },
 { la:'habeo', it: ['avere'], s:'H', o:'port dom ride herd =villa =hortus =ager'},
 { la:'video', it: ['vedere'], s:'H A', o:'H A P T E !col', oopt: 1 },
 { la:'timeo', it: ['temere','avere paura:di'], s:'H herd', o:'foe wild fight =tempestas =periculum =ira', oopt: 1 },
 { la:'teneo', it: ['tenere'], s:'H !col', o:'wpn txt =signum =rosa'},
 { la:'doceo', it: ['istruire'], s:'tch old =poeta', o:'kid', pass: 1 },
 { la:'praebeo', it: ['offrire','fornire'], s:'H nat farm bld', o:'=aqua =frumentum =cena =auxilium =fructus =umbra', d:'H A', pass: 1 },
 { la:'deleo', it: ['distruggere'], s:'mil gent =tempestas', o:'city bld =castra =navis C', pass: 1, ab:'mil gent'},
 { la:'terreo', it: ['spaventare','atterrire'], s:'foe wild =tempestas', o:'H herd ride !col', pass: 1 },
 { la:'rego', it: ['governare','reggere'], s:'rul', o:'=populus =urbs =insula C', pass: 1, oopt: 1 },
 { la:'duco', it: ['condurre','guidare'], s:'H', o:'mil srv kid ride herd =exercitus', pp: { to:'P C !road', per:'=silva =ager road'}, toIt:'loc', pass: 1 },
 { la:'mitto', it: ['mandare'], s:'rul mil gent', o:'=legatus =nuntius =miles =epistula =auxilium =frumentum =donum', pp: { to:'C R city =castra', toH:'rul gent'}, toIt:'a', pass: 1 },
 { la:'lego', it: ['leggere'], s:'H !col', o:'=liber =epistula =fabula =carmen', pass: 1, ab:'H !col', oopt: 1 },
 { la:'scribo', it: ['scrivere'], s:'art tch fr kin rul', o:'=epistula =liber =carmen =fabula', d:'H', pass: 1, ab:'art tch fr kin rul', oopt: 1 },
 { la:'vinco', it: ['vincere','sconfiggere'], s:'mil gent', o:'foe', pass: 1, ab:'mil gent', oopt: 1 },
 { la:'colo', it: ['coltivare'], s:'wrk', o:'=ager =hortus', pass: 1 },
 { la:'colo', it: ['venerare','onorare'], s:'H gent', o:'god', pass: 1 },
 { la:'defendo', it: ['difendere'], s:'mil civ gent', o:'city =castra =patria C =socius =libertas', pass: 1 },
 { la:'relinquo', it: ['abbandonare','lasciare'], s:'H', o:'city bld =castra =patria C', pass: 1, ab:'H'},
 { la:'capio', it: ['prendere','conquistare'], s:'mil gent', o:'=urbs =oppidum =castra C', pass: 1, ab:'mil gent'},
 { la:'capio', it: ['prendere','impugnare'], s:'mil civ !col', o:'=arma'},
 { la:'facio', it: ['fare'], s:'H gent', o:'=bellum =pax'},
 { la:'audio', it: ['ascoltare','udire'], s:'H', o:'word song story tch art', pass: 1, ab:'H', oopt: 1 },
 { la:'venio', it: ['venire','giungere'], s:'H A', pp: { to:'P C R !road', from:'P C R !road', with:'H'}, req:'to from', toIt:'loc'},
 { la:'custodio', it: ['custodire','sorvegliare'], s:'srv mil wrk dom', o:'bld =castra =porta herd ride =aurum =frumentum', pass: 1 },
 { la:'punio', it: ['punire'], s:'rul tch own', o:'srv kid foe', pass: 1 },
 { la:'invenio', it: ['trovare'], s:'H dom', o:'port A', pp: { loc:'P'}, pass: 1 },
 { la:'dormio', it: ['dormire'], s:'H A !col', pp: { loc:'nat bld =castra farm'} },
 { la:'fugio', it: ['fuggire'], s:'H A', pp: { from:'city bld =castra C', to:'=silva =mons =castra C'}, toIt:'loc'},
 { la:'curro', it: ['correre'], s:'H A !col', pp: { per:'=silva =ager road =forum', to:'P !C !R !road'}, toIt:'verso'},
 { la:'ludo', it: ['giocare'], s:'kid', pp: { loc:'green road city nat', with:'H dom'} },
 { la:'maneo', it: ['rimanere','restare'], s:'H', pp: { loc:'P C !road !water', with:'H'}, req:'loc'},
 { la:'rideo', it: ['ridere'], s:'H !col'},
 { la:'lacrimo', it: ['piangere'], s:'H !col'},
 { la:'aro', it: ['arare'], s:'=agricola srv', o:'=ager =terra', pass: 1, ab:'=agricola', oopt: 1 },
 { la:'salto', it: ['ballare','danzare'], s:'kid f', pp: { loc:'=forum green nat'} },
 { la:'vigilo', it: ['vegliare','stare di guardia'], s:'mil srv', pp: { loc:'=castra city'} },
 { la:'erro', it: ['vagare'], s:'H A !col', pp: { per:'=silva =ager =mons', loc:'=silva =insula'} },
 { la:'appropinquo', it: ['avvicinarsi'], s:'H A =tempestas', pp: { to:'P C'}, req:'to', toIt:'a', toLa:'ad'},
 { la:'saluto', it: ['salutare'], s:'H', o:'H !col', pass: 1 },
 { la:'iuvo', it: ['aiutare'], s:'H gent', o:'H', pass: 1 },
 { la:'peto', it: ['chiedere'], s:'H gent', o:'=pax =auxilium =praemium', pp: { fromH:'gent rul'} },
 { la:'quaero', it: ['cercare'], s:'H dom', o:'H A port', pp: { loc:'P'}, pass: 1 },
 { la:'carpo', it: ['cogliere'], s:'H !col', o:'=rosa =fructus', pp: { loc:'green nat farm'}, pass: 1 },
 { la:'pono', it: ['porre','piantare'], s:'mil gent', o:'=castra', pp: { loc:'nat farm'} },
 { la:'gero', it: ['fare','combattere'], s:'gent rul', o:'=bellum'},
 { la:'clamo', it: ['gridare'], s:'H !col'},
 { la:'sedeo', it: ['sedere','stare seduto'], s:'H !col', pp: { loc:'green bld =forum farm'} },
 { la:'taceo', it: ['tacere'], s:'H !col'},
 { la:'cogito', it: ['pensare','riflettere'], s:'H !col'},
 { la:'spiro', it: ['respirare'], s:'H A !col'},
 { la:'valeo', it: ['stare bene'], s:'H !col'},
 // deponenti
 { la:'hortor', it: ['esortare','incoraggiare'], s:'rul', o:'mil =civis'},
 { la:'sequor', it: ['seguire','inseguire'], s:'H A', o:'H A'},
 { la:'miror', it: ['ammirare'], s:'H', o:'P T virt art rul'},
 { la:'loquor', it: ['parlare'], s:'H !col', pp: { with:'H', de:'X E'} },
 { la:'vereor', it: ['temere'], s:'H', o:'foe wild fight =periculum =ira'},
 { la:'utor', it: ['usare','servirsi:di'], s:'H !col', o:'wpn =consilium', oc:'abl'},
 { la:'proficiscor', it: ['partire'], s:'H gent', pp: { from:'C R city =castra', to:'C R'}, req:'to from', toIt:'per'},
 { la:'morior', it: ['morire'], s:'H A', pp: { loc:'fight'} },
 { la:'aggredior', it: ['attaccare','assalire'], s:'mil foe wild gent', o:'H herd =castra city'},
 { la:'polliceor', it: ['promettere'], s:'rul mil', o:'=praemium =auxilium =pecunia =frumentum =pax', d:'H'},
 { la:'precor', it: ['pregare'], s:'H', o:'god'},
 // irregolari
 { la:'eo', it: ['andare'], s:'H A', pp: { to:'P C R !road', with:'H'}, req:'to', toIt:'loc'},
 { la:'redeo', it: ['tornare','ritornare'], s:'H gent', pp: { to:'P C R home !road', from:'P C !road'}, req:'to from', toIt:'loc'},
 { la:'exeo', it: ['uscire'], s:'H', pp: { from:'city bld =castra C'}, req:'from'},
 { la:'transeo', it: ['attraversare'], s:'H mil gent', o:'=flumen =mons =mare'},
 { la:'fero', it: ['portare'], s:'H ride', o:'port', pp: { to:'P C'}, toIt:'loc', pass: 1 },
 { la:'affero', it: ['portare','recare'], s:'H', o:'port', d:'H', dreq: 1 },
 { la:'aufero', it: ['portare via'], s:'H foe', o:'port', pp: { from:'P'} },
];

/* Verbi servili e reggenti */
const MODALS = [
  { la: 'possum', it: 'potere', t: 'v_poss' },
  { la: 'volo', f: 'velle', it: 'volere', t: 'v_irr' },
  { la: 'nolo', it: 'volere', neg: 1, t: 'v_irr' },
  { la: 'debeo', it: 'dovere', t: 'v_pres' },
  { la: 'conor', it: 'tentare', prep: 'di', t: 'v_dep' },
];
/* Composti di sum: soggetto, dativo, resa italiana */
const SUMCOMP = [
  { la: 'desum', s: 'port =auxilium', d: 'H !N', it: ['mancare'], datIt: 'a', order: 'dat-first' },
  { la: 'intersum', s: 'H !N', d: 'fight =cena', it: ['partecipare'], datIt: 'a' },
  { la: 'praesum', s: 'rul N', d: 'col =urbs =castra', it: ['comandare', 'essere a capo:di'], datIt: '' },
  { la: 'prosum', s: 'adv virt =amicitia =auxilium =liber', d: 'H', it: ['giovare', 'essere utile~'], datIt: 'a' },
  { la: 'absum', s: 'H bld city !col', from: 'city bld C', it: ['essere lontano~'] },
  { la: 'adsum', s: 'H', it: ['essere presente~'] },
];
/* Reggenti della proposizione infinitiva */
const SAYERS = [
  { la: 'dico', it: 'dire', s: 'H !col' },
  { la: 'narro', it: 'raccontare', s: 'H !col' },
  { la: 'nuntio', it: 'annunciare', s: 'msg mil' },
  { la: 'scio', it: 'sapere', s: 'H !col' },
  { la: 'puto', it: 'pensare', s: 'H !col', subj: 1 },
  { la: 'spero', it: 'sperare', s: 'H !col', fut: 1 },
];
/* Avverbi: latino, italiano, tempi adatti, argomento, posizione */
const ADVS = [
  ['saepe', 'spesso', 'pres impf', 'v_pres', 'mid'], ['semper', 'sempre', 'pres impf', 'v_pres', 'mid'], ['nunc', 'ora', 'pres', 'v_pres', 'start'],
  ['hodie', 'oggi', 'pres fut', 'v_pres', 'start'], ['olim', 'un tempo', 'impf', 'v_pres', 'start'], ['tum', 'allora', 'impf perf', 'v_pres', 'start'],
  ['cras', 'domani', 'fut', 'v_pres', 'start'], ['mox', 'presto', 'fut', 'v_pres', 'start'], ['heri', 'ieri', 'perf', 'v_pres', 'start'],
  ['statim', 'subito', 'perf', 'v_pres', 'mid', 'venio redeo fugio propero capio occupo mitto voco relinquo exeo'], ['diu', 'a lungo', 'impf perf', 'v_pres', 'mid', 'pugno laboro ambulo canto erro dormio maneo exspecto oppugno'],
  ['libenter', 'volentieri', 'pres impf fut', 'v_pres', 'mid', 'canto ludo audio lego laboro iuvo ambulo'],
  ['bene', 'bene', 'pres impf fut perf', 'agg1', 'mid', 'laboro canto lego scribo doceo pugno defendo custodio'],
  ['fortiter', 'valorosamente', 'pres impf fut perf', 'agg2', 'mid', 'pugno defendo oppugno aggredior'],
  ['acriter', 'con accanimento', 'pres impf perf', 'agg2', 'mid', 'pugno defendo oppugno aggredior'],
  ['celeriter', 'velocemente', 'pres impf fut perf', 'agg2', 'mid', 'propero curro venio fugio navigo eo redeo'],
];
/* Mete con attività coerenti, per le finali */
const PURPOSE = {
  ager: [['laboro'], ['aro', '=ager'], ['carpo', '=fructus']],
  hortus: [['carpo', '=rosa'], ['ludo'], ['laboro']],
  silva: [['quaero', 'wild'], ['ambulo']],
  forum: [['audio', '=orator'], ['specto', '=templum']],
  templum: [['colo', 'god'], ['precor', 'god']],
  urbs: [['defendo', '=urbs'], ['oppugno', '=urbs']],
  oppidum: [['oppugno', '=oppidum'], ['defendo', '=oppidum']],
  castra: [['custodio', '=castra'], ['defendo', '=castra']],
  villa: [['paro', '=cena'], ['laboro']],
  portus: [['exspecto', '=nauta'], ['specto', '=navis']],
  litus: [['exspecto', '=nauta'], ['specto', 'water =navis']],
  insula: [['habito']],
};

/* Chi o che cosa si trova dove: per «c'è / ci sono» e per lo stato in luogo con sum */
const WHERE = [
  ['wild', '=silva =mons'], ['herd ride', '=ager =villa'], ['flw', 'green'], ['=fructus', 'green farm'], ['=frumentum', '=villa =castra'],
  ['wpn', '=castra =templum'], ['val', 'sac'], ['wrk', 'farm bld'], ['=puer =puella', 'green road =forum'], ['mil', '=castra city'],
  ['veh', 'water shore'], ['sea', 'shore water'], ['tch', '=forum'], ['art', '=forum sac'], ['srv', 'bld'], ['rul', 'city bld'],
];
/* Complementi facoltativi aggiunti ai verbi adatti: tempo, modo, causa, tempo continuato */
const EXTRA = {
  time: 'laboro ambulo canto dormio pugno navigo vigilo aro ludo habito erro',
  manner: 'laboro canto paro defendo pugno narro laudo audio scribo lego custodio exspecto colo',
  cause: 'fugio maneo lacrimo propero redeo clamo',
  dur: 'habito laboro pugno maneo rego exspecto oppugno vigilo erro',
};
root.VERTO_GEN_DATA = { NOUNS, ADJS, VERBS, MODALS, SUMCOMP, SAYERS, ADVS, PURPOSE, WHERE, EXTRA };
if (typeof module !== 'undefined') module.exports = root.VERTO_GEN_DATA;
})(typeof window !== 'undefined' ? window : globalThis);
