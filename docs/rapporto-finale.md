# Verto 2 — rapporto finale

## Che cosa è stato fatto
Verto 1 (un'app di traduzione con argomenti a scelta) è diventato un **corso guidato**: 25 unità dall'alfabeto e la pronuncia al *cum* narrativo,
108 lezioni brevi (3–5 per unità più la prova finale), con la guida **Giano bifronte** e la palette **«Pigmenti romani»**, scelte fra tre proposte.
Motore morfologico, lessico, frasi, teoria e generatore di Verto 1 sono stati conservati e ampliati, non riscritti da zero.

- **Lezioni**: schede con la guida, tabelle generate dal motore con la desinenza evidenziata, una domanda di controllo dopo ogni tabella,
  poi 8–12 esercizi (versione e retroversione a tessere o scritte, analisi, scrivi la forma, completa, abbina, concordanza, lessico, pronuncia).
  Gli esercizi sbagliati tornano alla fine; 1–3 stelle; la prova con il 70% apre l'unità successiva.
- **Perimetri**: solo argomenti fino all'unità e vocabolario già incontrato; al massimo una parola nuova per frase, evidenziata e spiegata al tocco,
  nessuna nelle prove; ogni lezione dichiara le forme ammesse.
- **Palestra**: Versione, Retroversione e Frasi nuove con quattro livelli (Facile, Media, Difficile, Esperto); allenamento su misura per argomento
  e tipo di esercizio, con «solo parole già incontrate»; ripasso degli errori; alfabeto e pronuncia.
- **Teoria e lessico**: 25 argomenti con tabelle dal motore, metodo in otto passi. La sezione Lessico raccoglie solo le parole già incontrate
  (mai quelle delle lezioni ancora da fare), divise per unità, con ricerca in latino o in italiano, filtri (da ripassare, imparate, tipo di parola)
  e una scheda per ogni parola: paradigma, significato, lezione in cui compare, scatola del ripasso, una frase d'esempio già alla portata,
  ascolto, paradigma completo e collegamento facoltativo al Wikizionario. Il ripasso del giorno si fa a schede o con esercizi
  (riconoscere nei due sensi e abbinare), con ripetizione dilazionata in cinque scatole; resta la ricerca di una forma con analisi.
- **Salvataggio**: automatico dopo ogni risposta; codice di salvataggio (40–104 caratteri, controllo a 16 bit, errori di battitura riconosciuti
  con un messaggio chiaro) che conserva anche le stelle delle unità richiuse; copia su file; ripristino anche dal benvenuto; promemoria dopo la prima
  lezione e poi ogni settimana.
- **Motivazione**: XP (circa 100 per lezione completa), serie con scudi, obiettivo giornaliero, cursus honorum, 19 insegne con nomi latini,
  coriandoli a tessere di mosaico, suoni discreti, massima del giorno.
- **Consegna**: `dist/verto.html` (file unico, caratteri incorporati, senza rete) e `dist/sito/` (installabile, uso senza rete con il service worker).

## Risultati delle verifiche
| Verifica | Esito |
|---|---|
| Motore: 22.629 forme, 706 controlli puntuali (quantità, accenti, analisi) | nessun errore; 0 forme di Verto 1 perse su 40.432 |
| Banca: 192 frasi analizzate, ordine libero | 192/192 |
| Teoria: 25 argomenti, 316 parole latine, 93 tabelle dal motore, 38 esempi | nessun errore |
| Generatore: 10.000 frasi su 5.125 combinazioni di argomenti | 0 eccezioni, 0 parole sconosciute, 0 fuori argomento, 0 errori d'italiano |
| Percorso: ogni lezione costruita 5 volte (5.810 esercizi) | perimetri rispettati, una domanda di controllo dopo ogni tabella, 8–12 esercizi |
| Codice di salvataggio: 5.000 stati casuali | 5.000/5.000 ricostruiti; errori di battitura 5.000/5.000 e scambi 3.919/3.919 riconosciuti |
| Giocatore automatico nell'app vera, a 360 e 320 px, chiaro e scuro, con e senza quantità | 108/108 lezioni, 1.355 esercizi, ogni risposta giusta accettata, 3 stelle ovunque, console senza errori |
| Larghezza: lezioni, viste, 25 argomenti, fogli | nessun elemento esce a 360 né a 320 px |
| Sistema di design (`tools/audit-tokens.js`) | nessun valore fuori dai gettoni |
| Contrasti (`tools/contrast.js`) | 70/70 coppie AA in chiaro e scuro |
| Accessibilità automatica su ogni schermata del giocatore | nessun problema (nomi, `lang="la"`, titoli, bersagli, strati inerti) |
| Tastiera | ordine corretto, focus visibile, Tab chiuso nella lezione e nei fogli, Esc, focus restituito |
| Sito: service worker, manifest, icone, uso senza rete | tutti i file in cache; con il server spento l'app si ricarica e funziona |

Durante le verifiche il giocatore automatico ha trovato e fatto correggere difetti veri: l'avvio mancato in una scheda in secondo piano,
le opzioni latine lunghe fuori schermo, i pulsanti verde e rosso illeggibili in scuro, il Tab che usciva dalla lezione, i punti troppo generosi
rispetto agli obiettivi. Dettagli in `docs/critica-design.md` e `docs/accessibilita.md`.

## Revisione esterna
Una revisione indipendente (Codex, 25 ottobre) ha trovato quattro difetti che le prove non avevano visto: il generatore di frasi nuove non partiva nel browser, una traduzione con i ruoli invertiti veniva premiata, con le quantità attive un'analisi poteva premiare la lettura sbagliata, e il vocativo in -ī era esteso a tutti i nomi in -ius. Sono stati corretti, con regressioni in `test/review.test.js` e il giocatore automatico ora controlla anche gli avvisi della console, le frasi generate e le risposte scritte. Su richiesta è stato poi aggiunto il feedback diagnostico (VERTO-009): ogni risposta sbagliata riceve una spiegazione mirata ricavata dalle analisi del motore. Dettagli e proposte ancora da decidere in [revisione-codex.md](revisione-codex.md).

## Che cosa non è stato verificato
- **iPhone e Android veri**: le prove sono in un browser Chromium con la larghezza del telefono. Restano da provare su un dispositivo: aree sicure
  (notch, barra Home), installazione dalla schermata Home, tastiera virtuale sopra il campo di risposta, vibrazione.
- **Lettori di schermo** (VoiceOver, TalkBack, NVDA): nomi, ruoli e annunci sono verificati sul codice, non ascoltati.
- **Voce per la lettura del latino**: usa la voce italiana del dispositivo con la pronuncia scolastica; qualità e disponibilità dipendono dal telefono.
- **Apertura di `verto.html` dal disco** con doppio clic: lo stesso file è stato provato servito via http, non aperto da file.
- **Prova con studenti**: tempi delle lezioni, difficoltà dei livelli, leggibilità dei colori delle famiglie in scuro.

## Limiti noti
- Il generatore non trova una frase in circa il 2% delle combinazioni di argomenti molto ristrette: in quei casi si usa la banca.
- Nelle frasi della banca, per le forme ambigue l'analisi mostra la lettura più probabile (il foglio dell'analisi lo dice).
- Le traduzioni in italiano scritte a tastiera sono accettate da sole solo se coincidono con una prevista (salvo maiuscole, punteggiatura,
  accenti e piccoli errori di battitura); le altre passano al confronto guidato, dove lo studente le giudica con una traccia. Il suo giudizio
  non è una verifica del significato: una traduzione giusta ma non prevista richiede un momento di riflessione in più.
- Il codice di salvataggio contiene percorso, stelle, punti, serie, insegne, impostazioni e nome; il ripasso degli errori e le scatole del lessico
  passano solo con la copia su file.
- Le massime del giorno contengono 23 parole fuori dal lessico: sono sempre accompagnate dalla traduzione e da una nota.
- I caratteri sono in px: lo zoom della pagina funziona, il «testo più grande» di iOS no.
- Sugli schermi bassi (sotto 700 px) con molte tessere l'ultima riga del banco richiede di scorrere.

## Come pubblicare
Caricare il contenuto di `dist/sito/` su un hosting statico con HTTPS (vedi `dist/sito/LEGGIMI.txt`). Per aggiornare: `node build.js` e ricaricare
i file; il service worker cambia cache a ogni versione.
