/* VERTO — lessico di base del biennio, con le quantità delle vocali lunghe (ā ē ī ō ū; anche quelle «nascoste»
   davanti a ns, nf, gn: cōnsul, īnsula, rēgnum). Le vocali senza segno sono brevi.
   n|nominativo|genitivo|genere|significato|flag
   a|maschile|femminile o genitivo|neutro|significato|flag
     (nocomp = senza gradi; nocompar = senza comparativo, con il superlativo; gpum = genitivo plurale in -um;
      nnp = senza nominativo e accusativo neutro plurale)
   v|presente|infinito|perfetto|supino|significato|flag   (intr = senza passivo personale; fio = il passivo del presente è fīō)
   d|presente|infinito|participio perfetto|significato     (deponenti; mix=5 = presente indicativo come la mista)
   s|presente|infinito|participio perfetto|significato     (semideponenti)
   x|lemma|significato|flag                                 (irregolari)
   p|chiave|significato|argomento|flag                      (pronomi)
   i|parola|significato|argomento|categoria                 (invariabili) */
(function (root) {
const LEX = `
# ---- Prima declinazione
n|rosa|rosae|f|rosa
n|puella|puellae|f|fanciulla, ragazza
n|agricola|agricolae|m|agricoltore, contadino
n|nauta|nautae|m|marinaio
n|poēta|poētae|m|poeta
n|incola|incolae|m|abitante
n|rēgīna|rēgīnae|f|regina
n|dea|deae|f|dea|abus
n|fīlia|fīliae|f|figlia|abus
n|terra|terrae|f|terra
n|aqua|aquae|f|acqua
n|silva|silvae|f|selva, bosco
n|īnsula|īnsulae|f|isola
n|vīlla|vīllae|f|villa, fattoria
n|via|viae|f|via, strada
n|fābula|fābulae|f|favola, racconto
n|pugna|pugnae|f|battaglia, combattimento
n|victōria|victōriae|f|vittoria
n|patria|patriae|f|patria
n|glōria|glōriae|f|gloria
n|sapientia|sapientiae|f|sapienza, saggezza
n|fortūna|fortūnae|f|fortuna, sorte
n|audācia|audāciae|f|audacia
n|ancilla|ancillae|f|ancella, serva
n|domina|dominae|f|padrona, signora
n|cēna|cēnae|f|cena
n|laetitia|laetitiae|f|gioia, letizia
n|sagitta|sagittae|f|freccia
n|fera|ferae|f|belva, fiera
n|umbra|umbrae|f|ombra
n|vīta|vītae|f|vita
n|lingua|linguae|f|lingua
n|amīcitia|amīcitiae|f|amicizia
n|cōpiae|cōpiārum|f|truppe, milizie|pl
n|pecūnia|pecūniae|f|denaro
n|lūna|lūnae|f|luna
n|stēlla|stēllae|f|stella
n|īra|īrae|f|ira
n|cūra|cūrae|f|cura, preoccupazione
n|causa|causae|f|causa, motivo
n|hōra|hōrae|f|ora
n|porta|portae|f|porta
n|schola|scholae|f|scuola
n|epistula|epistulae|f|lettera
n|fāma|fāmae|f|fama, notizia
n|iniūria|iniūriae|f|offesa, ingiustizia
n|nātūra|nātūrae|f|natura
n|columna|columnae|f|colonna
n|amīca|amīcae|f|amica
n|turba|turbae|f|folla
n|praeda|praedae|f|bottino, preda
n|fuga|fugae|f|fuga
n|grātia|grātiae|f|grazia, gratitudine
n|tempestās|tempestātis|f|tempesta
n|Rōma|Rōmae|f|Roma|sg,loc=Rōmae
n|Graecia|Graeciae|f|Grecia|sg
n|Italia|Italiae|f|Italia|sg
n|Gallia|Galliae|f|Gallia|sg
n|Sicilia|Siciliae|f|Sicilia|sg
n|Minerva|Minervae|f|Minerva|sg
n|Diāna|Diānae|f|Diana|sg
n|Cornēlia|Cornēliae|f|Cornelia|sg
n|Numa|Numae|m|Numa|sg
n|Aenēās|Aenēae|m|Enea|sg,x=Aenēān:acc:s
n|Athēnae|Athēnārum|f|Atene|pl,loc=Athēnīs
n|Belgae|Belgārum|m|Belgi|pl
n|Trōia|Trōiae|f|Troia|sg
# ---- Seconda declinazione
n|dominus|dominī|m|padrone, signore
n|servus|servī|m|servo, schiavo
n|puer|puerī|m|fanciullo, ragazzo
n|ager|agrī|m|campo
n|magister|magistrī|m|maestro
n|discipulus|discipulī|m|allievo, scolaro
n|amīcus|amīcī|m|amico
n|equus|equī|m|cavallo
n|asinus|asinī|m|asino
n|lupus|lupī|m|lupo
n|agnus|agnī|m|agnello
n|populus|populī|m|popolo
n|deus|deī|m|dio|x=dī:nom:p;diī:nom:p;dīs:dat:p;dīs:abl:p;deus:voc:s,drop=dee
n|vir|virī|m|uomo
n|līberī|līberōrum|m|figli|pl
n|fīlius|fīliī|m|figlio|vocI
n|lēgātus|lēgātī|m|ambasciatore, luogotenente
n|animus|animī|m|animo, coraggio
n|hortus|hortī|m|orto, giardino
n|lūdus|lūdī|m|gioco, scuola
n|locus|locī|m|luogo|x=loca:nom:p;loca:acc:p;loca:voc:p
n|oculus|oculī|m|occhio
n|mūrus|mūrī|m|muro
n|gladius|gladiī|m|spada
n|nūntius|nūntiī|m|messaggero, notizia
n|socius|sociī|m|alleato, compagno
n|inimīcus|inimīcī|m|nemico (personale)
n|annus|annī|m|anno
n|campus|campī|m|campo, pianura
n|Rōmānī|Rōmānōrum|m|Romani|pl
n|Gallī|Gallōrum|m|Galli|pl
n|Graecī|Graecōrum|m|Greci|pl
n|Rōmulus|Rōmulī|m|Romolo|sg
n|Ascanius|Ascaniī|m|Ascanio|sg
n|Tusculum|Tusculī|n|Tuscolo|sg
n|bellum|bellī|n|guerra
n|dōnum|dōnī|n|dono
n|templum|templī|n|tempio
n|oppidum|oppidī|n|città fortificata, fortezza
n|forum|forī|n|foro, piazza
n|caelum|caelī|n|cielo
n|verbum|verbī|n|parola
n|cōnsilium|cōnsiliī|n|consiglio, decisione
n|auxilium|auxiliī|n|aiuto
n|perīculum|perīculī|n|pericolo
n|proelium|proeliī|n|battaglia
n|frūmentum|frūmentī|n|frumento, grano
n|praemium|praemiī|n|premio
n|rēgnum|rēgnī|n|regno
n|castra|castrōrum|n|accampamento|pl
n|arma|armōrum|n|armi|pl
n|signum|signī|n|segno, insegna
n|studium|studiī|n|studio, passione
n|officium|officiī|n|dovere
n|exemplum|exemplī|n|esempio
n|vīnum|vīnī|n|vino
n|aurum|aurī|n|oro
n|imperium|imperiī|n|comando, potere
n|liber|librī|m|libro
# ---- Terza declinazione
n|rēx|rēgis|m|re
n|lēx|lēgis|f|legge
n|mīles|mīlitis|m|soldato
n|urbs|urbis|f|città
n|dux|ducis|m|comandante
n|homō|hominis|m|uomo, essere umano
n|pāx|pācis|f|pace|sg
n|cōnsul|cōnsulis|m|console
n|hostis|hostis|m|nemico
n|cīvis|cīvis|m|cittadino
n|māter|mātris|f|madre
n|pater|patris|m|padre
n|frāter|frātris|m|fratello
n|soror|sorōris|f|sorella
n|nōmen|nōminis|n|nome
n|corpus|corporis|n|corpo
n|tempus|temporis|n|tempo
n|flūmen|flūminis|n|fiume
n|mare|maris|n|mare
n|animal|animālis|n|animale
n|iter|itineris|n|cammino, viaggio, marcia
n|caput|capitis|n|testa, capo
n|carmen|carminis|n|carme, poesia
n|opus|operis|n|opera, lavoro
n|vulnus|vulneris|n|ferita
n|lītus|lītoris|n|spiaggia, lido
n|mōns|montis|m|monte
n|nox|noctis|f|notte
n|gēns|gentis|f|popolo, stirpe
n|mors|mortis|f|morte
n|ars|artis|f|arte, abilità
n|pars|partis|f|parte
n|nāvis|nāvis|f|nave|ablI
n|canis|canis|m|cane
n|ovis|ovis|f|pecora
n|grex|gregis|m|gregge
n|sōl|sōlis|m|sole
n|lūx|lūcis|f|luce
n|voluntās|voluntātis|f|volontà
n|lībertās|lībertātis|f|libertà
n|cīvitās|cīvitātis|f|cittadinanza, Stato
n|virtūs|virtūtis|f|virtù, valore
n|vēritās|vēritātis|f|verità
n|aetās|aetātis|f|età
n|servitūs|servitūtis|f|schiavitù
n|hiems|hiemis|f|inverno
n|aestās|aestātis|f|estate
n|clāmor|clāmōris|m|grido, clamore
n|timor|timōris|m|timore, paura
n|amor|amōris|m|amore
n|labor|labōris|m|fatica, lavoro
n|mōs|mōris|m|costume, usanza
n|fīnis|fīnis|m|confine, fine; (pl.) territorio
n|ignis|ignis|m|fuoco
n|mulier|mulieris|f|donna
n|uxor|uxōris|f|moglie
n|iuvenis|iuvenis|m|giovane
n|senex|senis|m|vecchio
n|ōrātor|ōrātōris|m|oratore
n|imperātor|imperātōris|m|comandante, imperatore
n|victor|victōris|m|vincitore
n|leō|leōnis|m|leone
n|vōx|vōcis|f|voce
n|legiō|legiōnis|f|legione
n|gladiātor|gladiātōris|m|gladiatore
n|ōrātiō|ōrātiōnis|f|discorso, orazione
n|prīnceps|prīncipis|m|capo, principe
n|parēns|parentis|m|genitore
n|vīs|vīs|f|forza|only,x=vīs:nom:s;vim:acc:s;vī:abl:s;vīrēs:nom:p;vīrium:gen:p;vīribus:dat:p;vīrēs:acc:p;vīribus:abl:p
n|moenia|moenium|n|mura (della città)|pl,gp=ium
n|Alpēs|Alpium|f|Alpi|pl
n|Caesar|Caesaris|m|Cesare|sg
n|Cicerō|Cicerōnis|m|Cicerone|sg
n|Hannibal|Hannibalis|m|Annibale|sg
n|Hamilcar|Hamilcaris|m|Amilcare|sg
n|Carthāgō|Carthāginis|f|Cartagine|sg,loc=Carthāgine
n|Iuppiter|Iovis|m|Giove|only,x=Iuppiter:nom:s;Iovis:gen:s;Iovī:dat:s;Iovem:acc:s;Iuppiter:voc:s;Iove:abl:s
# ---- Quarta e quinta declinazione
n|exercitus|exercitūs|m|esercito
n|impetus|impetūs|m|assalto, impeto
n|adventus|adventūs|m|arrivo
n|senātus|senātūs|m|senato|sg
n|equitātus|equitātūs|m|cavalleria
n|manus|manūs|f|mano, schiera
n|domus|domūs|f|casa|loc=domī,x=domō:abl:s;domōs:acc:p;domōrum:gen:p,drop=domū
n|metus|metūs|m|paura
n|portus|portūs|m|porto
n|frūctus|frūctūs|m|frutto
n|cursus|cursūs|m|corsa, percorso
n|magistrātus|magistrātūs|m|magistrato, magistratura
n|ūsus|ūsūs|m|uso, esperienza
n|cornū|cornūs|n|corno; ala (dell'esercito)
n|rēs|reī|f|cosa, fatto, situazione
n|diēs|diēī|m|giorno
n|fidēs|fideī|f|fede, lealtà|sg
n|spēs|speī|f|speranza|sg
n|aciēs|aciēī|f|schiera, esercito schierato
n|merīdiēs|merīdiēī|m|mezzogiorno|sg
# ---- Aggettivi I classe
a|bonus|bona|bonum|buono, bravo
a|malus|mala|malum|cattivo
a|magnus|magna|magnum|grande
a|parvus|parva|parvum|piccolo
a|multus|multa|multum|molto; (pl.) molti
a|altus|alta|altum|alto, profondo
a|longus|longa|longum|lungo
a|pulcher|pulchra|pulchrum|bello
a|miser|misera|miserum|misero, infelice
a|līber|lībera|līberum|libero
a|laetus|laeta|laetum|lieto, contento
a|grātus|grāta|grātum|gradito, grato
a|novus|nova|novum|nuovo|nocompar
a|antīquus|antīqua|antīquum|antico
a|clārus|clāra|clārum|famoso, illustre, chiaro
a|superbus|superba|superbum|superbo
a|iūstus|iūsta|iūstum|giusto
a|Rōmānus|Rōmāna|Rōmānum|romano|nocomp
a|Graecus|Graeca|Graecum|greco|nocomp
a|Latīnus|Latīna|Latīnum|latino|nocomp
a|Trōiānus|Trōiāna|Trōiānum|troiano|nocomp
a|tūtus|tūta|tūtum|sicuro, protetto
a|certus|certa|certum|certo, sicuro
a|incertus|incerta|incertum|incerto
a|vērus|vēra|vērum|vero
a|tantus|tanta|tantum|tanto, così grande|nocomp
a|plēnus|plēna|plēnum|pieno
a|aeger|aegra|aegrum|malato
a|doctus|docta|doctum|dotto, istruito
a|validus|valida|validum|forte, robusto
a|lātus|lāta|lātum|largo, ampio
a|pūblicus|pūblica|pūblicum|pubblico|nocomp
a|perterritus|perterrita|perterritum|atterrito|nocomp
a|prīmus|prīma|prīmum|primo|nocomp
a|secundus|secunda|secundum|secondo|nocomp
a|tertius|tertia|tertium|terzo|nocomp
a|tōtus|tōta|tōtum|tutto, intero|pron
a|sōlus|sōla|sōlum|solo|pron
a|nūllus|nūlla|nūllum|nessuno|pron
a|ūnus|ūna|ūnum|uno|pron
a|alius|alia|alium|altro|pron,nd=aliud
a|alter|altera|alterum|l'altro (di due)|pron
# ---- Aggettivi II classe
a|fortis|forte|-|forte, coraggioso
a|omnis|omne|-|ogni; (pl.) tutti|nocomp
a|brevis|breve|-|breve
a|ācer|ācris|ācre|aspro, fiero, acuto
a|celer|celeris|celere|veloce|gpum
a|facilis|facile|-|facile
a|difficilis|difficile|-|difficile
a|fēlīx|fēlīcis|-|felice, fortunato
a|prūdēns|prūdentis|-|prudente, saggio
a|ingēns|ingentis|-|immenso, enorme
a|sapiēns|sapientis|-|saggio, sapiente
a|trīstis|trīste|-|triste
a|crūdēlis|crūdēle|-|crudele
a|gravis|grave|-|grave, pesante
a|nōbilis|nōbile|-|nobile, famoso
a|ūtilis|ūtile|-|utile
a|dulcis|dulce|-|dolce
a|terribilis|terribile|-|terribile, spaventoso
a|similis|simile|-|simile
a|potēns|potentis|-|potente
a|audāx|audācis|-|audace
a|atrōx|atrōcis|-|atroce
a|commūnis|commūne|-|comune
a|levis|leve|-|leggero
a|fidēlis|fidēle|-|fedele
a|vetus|veteris|-|vecchio, antico|c,nocomp
a|dīves|dīvitis|-|ricco|c,nocomp,nnp
a|pauper|pauperis|-|povero|c,nocomp,nnp
# ---- Verbi 1ª coniugazione
v|amō|amāre|amāvī|amātum|amare
v|laudō|laudāre|laudāvī|laudātum|lodare
v|vocō|vocāre|vocāvī|vocātum|chiamare
v|portō|portāre|portāvī|portātum|portare
v|narrō|narrāre|narrāvī|narrātum|raccontare, narrare
v|dō|dare|dedī|datum|dare|shortA
v|habitō|habitāre|habitāvī|habitātum|abitare
v|ambulō|ambulāre|ambulāvī|ambulātum|passeggiare, camminare|intr
v|labōrō|labōrāre|labōrāvī|labōrātum|lavorare, faticare|intr
v|cantō|cantāre|cantāvī|cantātum|cantare
v|saltō|saltāre|saltāvī|saltātum|ballare, saltare|intr
v|arō|arāre|arāvī|arātum|arare
v|parō|parāre|parāvī|parātum|preparare
v|properō|properāre|properāvī|properātum|affrettarsi|intr
v|nāvigō|nāvigāre|nāvigāvī|nāvigātum|navigare|intr
v|pugnō|pugnāre|pugnāvī|pugnātum|combattere|intr
v|superō|superāre|superāvī|superātum|superare, vincere
v|oppugnō|oppugnāre|oppugnāvī|oppugnātum|assalire, assediare
v|expugnō|expugnāre|expugnāvī|expugnātum|espugnare
v|vulnerō|vulnerāre|vulnerāvī|vulnerātum|ferire
v|ōrnō|ōrnāre|ōrnāvī|ōrnātum|ornare, adornare
v|servō|servāre|servāvī|servātum|conservare, salvare, mantenere
v|vīsitō|vīsitāre|vīsitāvī|vīsitātum|visitare
v|iuvō|iuvāre|iūvī|iūtum|aiutare, giovare
v|adiuvō|adiuvāre|adiūvī|adiūtum|aiutare
v|vexō|vexāre|vexāvī|vexātum|tormentare, maltrattare
v|fugō|fugāre|fugāvī|fugātum|mettere in fuga
v|spectō|spectāre|spectāvī|spectātum|guardare
v|exspectō|exspectāre|exspectāvī|exspectātum|aspettare
v|necō|necāre|necāvī|necātum|uccidere
v|līberō|līberāre|līberāvī|līberātum|liberare
v|convocō|convocāre|convocāvī|convocātum|convocare, radunare
v|appropinquō|appropinquāre|appropinquāvī|appropinquātum|avvicinarsi|intr
v|vigilō|vigilāre|vigilāvī|vigilātum|vegliare, stare di guardia|intr
v|aedificō|aedificāre|aedificāvī|aedificātum|costruire
v|lacrimō|lacrimāre|lacrimāvī|lacrimātum|piangere|intr
v|nūntiō|nūntiāre|nūntiāvī|nūntiātum|annunciare
v|errō|errāre|errāvī|errātum|sbagliare, vagare|intr
v|stō|stāre|stetī|statum|stare|intr
v|occupō|occupāre|occupāvī|occupātum|occupare
v|imperō|imperāre|imperāvī|imperātum|comandare
v|putō|putāre|putāvī|putātum|pensare, ritenere
v|spērō|spērāre|spērāvī|spērātum|sperare
v|clāmō|clāmāre|clāmāvī|clāmātum|gridare
v|salūtō|salūtāre|salūtāvī|salūtātum|salutare
v|mūtō|mūtāre|mūtāvī|mūtātum|cambiare
v|rēgnō|rēgnāre|rēgnāvī|rēgnātum|regnare|intr
v|iūdicō|iūdicāre|iūdicāvī|iūdicātum|giudicare
v|festīnō|festīnāre|festīnāvī|festīnātum|affrettarsi|intr
v|spīrō|spīrāre|spīrāvī|spīrātum|respirare|intr
v|volō|volāre|volāvī|volātum|volare|intr
v|cōgitō|cōgitāre|cōgitāvī|cōgitātum|pensare
v|creō|creāre|creāvī|creātum|creare, eleggere
v|dōnō|dōnāre|dōnāvī|dōnātum|donare
v|probō|probāre|probāvī|probātum|approvare, mettere alla prova
v|cavō|cavāre|cavāvī|cavātum|scavare
v|cōnstō|cōnstāre|cōnstitī|-|costare; (constat) è noto|intr
# ---- Verbi 2ª coniugazione
v|moneō|monēre|monuī|monitum|ammonire, avvertire
v|habeō|habēre|habuī|habitum|avere, ritenere
v|videō|vidēre|vīdī|vīsum|vedere
v|timeō|timēre|timuī|-|temere
v|teneō|tenēre|tenuī|tentum|tenere
v|doceō|docēre|docuī|doctum|insegnare
v|praebeō|praebēre|praebuī|praebitum|offrire, fornire
v|dēbeō|dēbēre|dēbuī|dēbitum|dovere
v|terreō|terrēre|terruī|territum|atterrire, spaventare
v|dēleō|dēlēre|dēlēvī|dēlētum|distruggere
v|maneō|manēre|mānsī|mānsum|rimanere|intr
v|respondeō|respondēre|respondī|respōnsum|rispondere
v|rīdeō|rīdēre|rīsī|rīsum|ridere|intr
v|iubeō|iubēre|iussī|iussum|ordinare, comandare
v|sedeō|sedēre|sēdī|sessum|sedere|intr
v|valeō|valēre|valuī|-|star bene, valere|intr
v|taceō|tacēre|tacuī|tacitum|tacere|intr
v|moveō|movēre|mōvī|mōtum|muovere
v|placeō|placēre|placuī|placitum|piacere|intr
v|fleō|flēre|flēvī|flētum|piangere
v|possideō|possidēre|possēdī|possessum|possedere
v|impleō|implēre|implēvī|implētum|riempire
v|flōreō|flōrēre|flōruī|-|fiorire|intr
# ---- Verbi 3ª coniugazione
v|regō|regere|rēxī|rēctum|reggere, governare
v|dūcō|dūcere|dūxī|ductum|condurre, guidare|imp=dūc
v|dīcō|dīcere|dīxī|dictum|dire|imp=dīc
v|mittō|mittere|mīsī|missum|mandare, inviare
v|legō|legere|lēgī|lēctum|leggere, scegliere
v|scrībō|scrībere|scrīpsī|scrīptum|scrivere
v|lūdō|lūdere|lūsī|lūsum|giocare|intr
v|vincō|vincere|vīcī|victum|vincere
v|colō|colere|coluī|cultum|coltivare, venerare
v|agō|agere|ēgī|āctum|fare, condurre, trascorrere
v|gerō|gerere|gessī|gestum|portare, compiere; (bellum) fare la guerra
v|pōnō|pōnere|posuī|positum|porre, collocare
v|dēfendō|dēfendere|dēfendī|dēfēnsum|difendere
v|petō|petere|petīvī|petītum|chiedere, dirigersi verso
v|cadō|cadere|cecidī|cāsum|cadere|intr
v|currō|currere|cucurrī|cursum|correre|intr
v|carpō|carpere|carpsī|carptum|cogliere
v|vīvō|vīvere|vīxī|vīctum|vivere|intr
v|discō|discere|didicī|-|imparare
v|crēdō|crēdere|crēdidī|crēditum|credere
v|ostendō|ostendere|ostendī|ostentum|mostrare
v|relinquō|relinquere|relīquī|relictum|lasciare, abbandonare
v|trādō|trādere|trādidī|trāditum|consegnare, tramandare
v|condō|condere|condidī|conditum|fondare
v|reddō|reddere|reddidī|redditum|rendere, restituire
v|cognōscō|cognōscere|cognōvī|cognitum|conoscere, venire a sapere
v|contendō|contendere|contendī|contentum|dirigersi, combattere|intr
v|frangō|frangere|frēgī|frāctum|rompere, spezzare
v|dīligō|dīligere|dīlēxī|dīlēctum|amare, stimare
v|incendō|incendere|incendī|incēnsum|incendiare
v|quaerō|quaerere|quaesīvī|quaesītum|cercare, chiedere
v|emō|emere|ēmī|ēmptum|comprare
v|cōgō|cōgere|coēgī|coāctum|costringere, radunare
v|occīdō|occīdere|occīdī|occīsum|uccidere
v|īnstruō|īnstruere|īnstrūxī|īnstrūctum|schierare, istruire
v|cernō|cernere|crēvī|crētum|distinguere, vedere
v|cēdō|cēdere|cessī|cessum|ritirarsi, cedere|intr
v|surgō|surgere|surrēxī|surrēctum|sorgere, alzarsi|intr
v|dīvidō|dīvidere|dīvīsī|dīvīsum|dividere
v|cōnsulō|cōnsulere|cōnsuluī|cōnsultum|consultare, provvedere
# ---- Verbi 3ª mista
v|capiō|capere|cēpī|captum|prendere, conquistare
v|faciō|facere|fēcī|factum|fare|imp=fac,fio
v|fugiō|fugere|fūgī|fugitum|fuggire|intr
v|cupiō|cupere|cupīvī|cupītum|desiderare
v|accipiō|accipere|accēpī|acceptum|ricevere, accogliere
v|cōnspiciō|cōnspicere|cōnspexī|cōnspectum|scorgere
v|interficiō|interficere|interfēcī|interfectum|uccidere
v|iaciō|iacere|iēcī|iactum|gettare, lanciare
v|rapiō|rapere|rapuī|raptum|rapire, strappare
# ---- Verbi 4ª coniugazione
v|audiō|audīre|audīvī|audītum|ascoltare, udire
v|veniō|venīre|vēnī|ventum|venire, giungere|intr
v|dormiō|dormīre|dormīvī|dormītum|dormire|intr
v|sciō|scīre|scīvī|scītum|sapere
v|pūniō|pūnīre|pūnīvī|pūnītum|punire
v|custōdiō|custōdīre|custōdīvī|custōdītum|custodire, sorvegliare
v|mūniō|mūnīre|mūnīvī|mūnītum|fortificare
v|inveniō|invenīre|invēnī|inventum|trovare
v|perveniō|pervenīre|pervēnī|perventum|giungere|intr
v|adveniō|advenīre|advēnī|adventum|arrivare|intr
v|aperiō|aperīre|aperuī|apertum|aprire
v|sentiō|sentīre|sēnsī|sēnsum|sentire, accorgersi
v|serviō|servīre|servīvī|servītum|servire, essere schiavo|intr
# ---- Irregolari
x|sum|essere, esserci|type=sum
x|possum|potere|type=possum
x|absum|essere lontano, essere assente|type=csum,pre=ab,pp=ā
x|adsum|essere presente, assistere|type=csum,pre=ad,pp=ad
x|dēsum|mancare|type=csum,pre=dē,pp=dē
x|praesum|essere a capo, comandare|type=csum,pre=prae,pp=prae
x|intersum|partecipare, essere in mezzo|type=csum,pre=inter,pp=inter
x|prōsum|giovare, essere utile|type=csum,pre=prō,pp=prō,prod
x|volō|volere|type=volo
x|nōlō|non volere|type=nolo
x|mālō|preferire|type=malo
x|eō|andare|type=eo
x|abeō|andare via, allontanarsi|type=eo,pre=ab
x|redeō|ritornare|type=eo,pre=red
x|exeō|uscire|type=eo,pre=ex
x|trānseō|attraversare|type=eo,pre=trāns
x|adeō|avvicinarsi|type=eo,pre=ad
x|pereō|perire, morire|type=eo,pre=per
x|ferō|portare, sopportare|type=fero
x|afferō|portare a, recare|type=fero,pre=af,perf=attulī,sup=allātum
x|referō|riportare, riferire|type=fero,pre=re,perf=rettulī,sup=relātum
x|cōnferō|portare insieme, confrontare|type=fero,pre=cōn,perf=contulī,sup=collātum
x|auferō|portare via|type=fero,pre=au,perf=abstulī,sup=ablātum
x|fīō|diventare, essere fatto, accadere|type=fio
# ---- Deponenti e semideponenti
d|hortor|hortārī|hortātus|esortare
d|cōnor|cōnārī|cōnātus|tentare
d|mīror|mīrārī|mīrātus|ammirare, meravigliarsi
d|arbitror|arbitrārī|arbitrātus|ritenere
d|precor|precārī|precātus|pregare
d|moror|morārī|morātus|indugiare, trattenersi
d|vereor|verērī|veritus|temere
d|polliceor|pollicērī|pollicitus|promettere
d|sequor|sequī|secūtus|seguire, inseguire
d|loquor|loquī|locūtus|parlare
d|ūtor|ūtī|ūsus|usare, servirsi di (+ abl.)
d|proficīscor|proficīscī|profectus|partire
d|nāscor|nāscī|nātus|nascere|fp=nāscitūrus
d|morior|morī|mortuus|morire|fp=moritūrus
d|patior|patī|passus|soffrire, sopportare
d|ēgredior|ēgredī|ēgressus|uscire
d|aggredior|aggredī|aggressus|assalire
d|prōgredior|prōgredī|prōgressus|avanzare
d|orior|orīrī|ortus|sorgere, nascere|fp=oritūrus,mix=5
d|largior|largīrī|largītus|elargire
d|experior|experīrī|expertus|sperimentare
s|audeō|audēre|ausus|osare
s|soleō|solēre|solitus|essere solito
# ---- Pronomi
p|ego|io, noi|pron_pers|lemma=ego;nōs
p|tū|tu, voi|pron_pers|lemma=tū;vōs
p|sē|sé (riflessivo)|pron_pers|lemma=suī;sibi;sē
p|meus|mio|pron_pers|adj=meus;mea;meum,mi
p|tuus|tuo|pron_pers|adj=tuus;tua;tuum
p|suus|suo, loro (riflessivo)|pron_pers|adj=suus;sua;suum
p|noster|nostro|pron_pers|adj=noster;nostra;nostrum
p|vester|vostro|pron_pers|adj=vester;vestra;vestrum
p|is|egli, quello, questo|pron_dim|lemma=is;ea;id
p|hic|questo|pron_dim|lemma=hic;haec;hoc
p|iste|codesto|pron_dim|lemma=iste;ista;istud
p|ille|quello, egli|pron_dim|lemma=ille;illa;illud
p|ipse|stesso, in persona|pron_dim|lemma=ipse;ipsa;ipsum
p|īdem|medesimo, stesso|pron_dim|lemma=īdem;eadem;idem
p|quī|che, il quale|pron_rel|lemma=quī;quae;quod
p|quis|chi? che cosa?|pron_rel|lemma=quis;quid
p|nēmō|nessuno|n3|lemma=nēmō;nūllīus
p|duo|due|agg1|lemma=duo;duae;duo
p|trēs|tre|agg2|lemma=trēs;tria
# ---- Invariabili
i|et|e, anche|v_pres|cong
i|sed|ma|v_pres|cong
i|nōn|non|v_pres|avv
i|atque|e, e anche|v_pres|cong
i|ac|e, e anche|v_pres|cong
i|aut|o, oppure|v_pres|cong
i|vel|o, oppure|v_pres|cong
i|nec|e non, né|v_pres|cong
i|neque|e non, né|v_pres|cong
i|nam|infatti|v_pres|cong
i|enim|infatti|v_pres|cong
i|autem|invece, poi|v_pres|cong
i|itaque|perciò, quindi|v_pres|cong
i|igitur|dunque|v_pres|cong
i|tamen|tuttavia|v_pres|cong
i|ergō|dunque|v_pres|cong
i|etiam|anche, perfino|v_pres|avv
i|quoque|anche|v_pres|avv
i|cūr|perché?|v_pres|avv
i|ubi|dove; quando, appena (+ ind.)|v_pres|avv
i|quandō|quando?|v_pres|avv
i|saepe|spesso|v_pres|avv
i|semper|sempre|v_pres|avv
i|numquam|mai|v_pres|avv
i|iam|già|v_pres|avv
i|nunc|ora|v_pres|avv
i|tum|allora|v_pres|avv
i|deinde|poi, in seguito|v_pres|avv
i|mox|presto, poi|v_pres|avv
i|hodiē|oggi|v_pres|avv
i|crās|domani|v_pres|avv
i|herī|ieri|v_pres|avv
i|ōlim|un tempo, una volta|v_pres|avv
i|diū|a lungo|v_pres|avv
i|statim|subito|v_pres|avv
i|valdē|molto|v_pres|avv
i|libenter|volentieri|v_pres|avv
i|sīc|così|v_pres|avv
i|ita|così|v_pres|avv
i|tam|tanto, così|v_pres|avv
i|vix|a stento|v_pres|avv
i|procul|lontano|v_pres|avv
i|ibi|lì, là|v_pres|avv
i|nihil|niente, nulla|v_pres|indecl
i|ecce|ecco|v_pres|inter
i|ō|o!|v_pres|inter
i|bene|bene|agg1|avv
i|male|male|agg1|avv
i|magnopere|grandemente, molto|agg1|avv
i|fortiter|valorosamente, con forza|agg2|avv
i|ācriter|aspramente, con accanimento|agg2|avv
i|celeriter|velocemente|agg2|avv
i|facile|facilmente|agg2|avv
i|prūdenter|prudentemente|agg2|avv
i|in|in, su (+ abl.); verso, contro (+ acc.)|compl|prep+abl
i|ad|verso, a, presso (+ acc.)|compl|prep+acc
i|ab|da (+ abl.)|compl|prep+abl
i|ā|da (+ abl.)|compl|prep+abl
i|ex|da, fuori da (+ abl.)|compl|prep+abl
i|ē|da, fuori da (+ abl.)|compl|prep+abl
i|dē|da, intorno a, riguardo a (+ abl.)|compl|prep+abl
i|cum|con (+ abl.)|compl|prep+abl
i|cum|quando, poiché, mentre (+ cong.)|s_cum|cong
i|sine|senza (+ abl.)|compl|prep+abl
i|prō|per, a favore di, davanti a (+ abl.)|compl|prep+abl
i|prae|davanti a, a causa di (+ abl.)|compl|prep+abl
i|sub|sotto (+ abl./acc.)|compl|prep+abl
i|per|attraverso, per (+ acc.)|compl|prep+acc
i|post|dopo, dietro (+ acc.)|compl|prep+acc
i|ante|prima di, davanti a (+ acc.)|compl|prep+acc
i|apud|presso (+ acc.)|compl|prep+acc
i|propter|a causa di (+ acc.)|compl|prep+acc
i|ob|a causa di (+ acc.)|compl|prep+acc
i|contrā|contro (+ acc.)|compl|prep+acc
i|inter|tra, fra (+ acc.)|compl|prep+acc
i|trāns|al di là di (+ acc.)|compl|prep+acc
i|circum|intorno a (+ acc.)|compl|prep+acc
i|prope|vicino a (+ acc.)|compl|prep+acc
i|praeter|oltre a, eccetto (+ acc.)|compl|prep+acc
i|quod|perché, poiché (+ ind.)|s_sub|cong
i|quia|perché, poiché|s_sub|cong
i|quoniam|poiché|s_sub|cong
i|postquam|dopo che|s_sub|cong
i|dum|mentre, finché|s_sub|cong
i|sī|se|s_sub|cong
i|nisi|se non|s_sub|cong
i|quamquam|sebbene|s_sub|cong
i|antequam|prima che|s_sub|cong
i|quam|di, che (nei paragoni); quanto|comp|cong
i|ut|affinché, che, cosicché (+ cong.); come (+ ind.)|v_cong|cong
i|nē|affinché non, che non (+ cong.)|v_cong|cong
i|quattuor|quattro|agg1|indecl
i|quīnque|cinque|agg1|indecl
i|decem|dieci|agg1|indecl
i|centum|cento|agg1|indecl
i|mīlle|mille|agg1|indecl
i|avē|salve!|v_pres|inter
i|valē|addio, stammi bene|v_imper|inter
`;
root.VERTO_LEX = LEX;
if (typeof module !== 'undefined') module.exports = LEX;
})(typeof window !== 'undefined' ? window : globalThis);
