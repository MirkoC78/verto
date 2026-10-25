# Verto — critica di design

Revisione fatta con la procedura *design-critique* sull'app vera (`dist/verto.html`), schermata per schermata, a 360 × 740 px e a 1280 × 800 px,
in tema chiaro e scuro, con lo stato dimostrativo `#demo=14` (studente alla prova della prima declinazione) e il benvenuto `#onb=0…2`.
Contesto: corso di latino per studenti di 14–15 anni, principianti; fase di rifinitura prima della consegna.
Le schermate esaminate: benvenuto (3 passi), percorso, inizio unità, tabella con la guida, domanda di controllo, abbina, retroversione,
versione con esito, fine lezione, palestra, teoria, argomento, lessico, profilo, foglio del paradigma, percorso scuro, percorso e lezione su computer.

## Impressione generale
Il percorso si legge come una via romana: tabula ansata per ogni unità, pietre miliari per le lezioni, una sola chiamata all'azione forte
(«Continua» / «Inizia la prova») nella scheda in cima. Il latino è sempre riconoscibile a colpo d'occhio (Gentium corsivo) e distinto dall'italiano
(Lexend). La guida, Giano bifronte, rende esplicita l'idea dell'app (un volto per lingua) senza rubare spazio agli esercizi.
La prima revisione ha trovato soprattutto problemi di impaginazione ai bordi (opzioni latine lunghe, scelte a quattro voci, pannello su computer):
tutti corretti e riverificati, alcuni con un controllo automatico che ora gira a ogni prova.

## Usabilità

| Osservazione | Gravità | Intervento |
|---|---|---|
| Nell'esercizio «Completa la frase» le opzioni latine lunghe (es. *vulnerābiminī*, *properāverātis*) uscivano dallo schermo a 360 px fino a 33 px | 🔴 Critica | due opzioni per riga solo se ci stanno tutte; altrimenti una colonna (CSS a capo per contenuto + controllo dopo il disegno) — verificato su tutte le 108 lezioni |
| Le prove d'unità e alcune lezioni non partivano se la pagina era aperta in una scheda in secondo piano (l'app aspettava il primo disegno) | 🔴 Critica | avvio garantito anche senza disegno, dopo 150 ms |
| La tabella compariva su una schermata e la spiegazione della guida su un'altra; la prima tabella (solo *rosa, rosam*) non aveva la domanda di controllo | 🟡 Moderata | la frase della guida sta sulla schermata della tabella; domanda di controllo dopo ogni tabella, anche con due sole forme (verificato dal test del percorso) |
| Benvenuto, passo 3, e Palestra: le scelte a quattro voci andavano a capo 3 + 1 | 🟡 Moderata | quattro voci in 2 × 2 sul telefono, in fila da 480 px |
| Su computer l'obiettivo del giorno compariva due volte (colonna e pannello) e le schede del pannello mettevano l'icona sopra il testo | 🟡 Moderata | regole con la specificità giusta: l'obiettivo sta solo nel pannello, le schede «obiettivo» e «serie» restano in riga |
| Il benvenuto prometteva «circa 80 XP» per lezione, ma il giocatore automatico ne misurava ~220: gli obiettivi (30–120 XP) si raggiungevano con un terzo di lezione | 🟡 Moderata | punti ribilanciati (~100 XP per lezione completa); testo aggiornato |
| Teoria: le descrizioni degli argomenti arrivavano a cinque righe e rendevano l'elenco difficile da scorrere | 🟢 Minore | al massimo due righe per descrizione (il testo intero è nella pagina dell'argomento) |
| Versione e retroversione a 740 px di altezza: con 7–8 tessere l'ultima riga del banco finisce sotto il piede e bisogna scorrere | 🟢 Minore | lasciato così: l'area scorre e il piede resta fisso; la riga delle risposte è alta due righe di tessere per non far saltare il banco mentre si compone |
| Profilo: il segno di spunta del cursus honorum non aveva misura e si allargava a 279 px | 🟢 Minore | misura propria e, per sicurezza, misura predefinita per ogni icona |

## Gerarchia visiva
- **Cosa si vede per primo**: nel percorso la scheda «Continua» con il titolo della lezione e il pulsante pieno; è corretto, è l'azione del giorno.
  Nella lezione: la consegna («Traduci in italiano») e subito sotto la frase latina in 28 px, che è l'oggetto dell'esercizio.
- **Ordine di lettura**: consegna → frase → strumenti (ascolta, verbi, aiuto, tastiera) → risposta → banco → «Controlla» nel piede fisso.
  Nell'esito il piede cambia colore e porta la soluzione, gli strumenti (Teoria, Analisi, Ascolta) e «Continua»: l'occhio non deve risalire.
- **Enfasi**: un solo blocco pieno per schermata oltre all'intestazione dell'unità. Nella prima versione la pietra della lezione attuale era piena
  come il pulsante «Continua»; ora è contornata e il pieno resta al pulsante. Nella scelta della posizione i numeri delle unità erano blocchi
  colorati uno sotto l'altro; ora sono neutri con un filo del colore della famiglia.

## Coerenza

| Elemento | Osservazione | Intervento |
|---|---|---|
| Misure | 28 valori fuori dalla griglia di 4 px e 6 altezze di controllo fuori dai tre gettoni | tutti portati sui gettoni; `tools/audit-tokens.js` lo verifica |
| Nomi delle classi | `.done` serviva sia alla pietra completata sia alla fine lezione: la pietra veniva centrata in colonna | la fine lezione ora è `.finish` |
| Colori di stato | testo dei pulsanti verde/rosso bianco anche in scuro (contrasto 2,2) | gettone `--on-state` |
| Opzioni | stesse opzioni ora a due colonne ora a una secondo la lunghezza | regola unica: due colonne solo se ci stanno tutte |
| Pulsanti-icona | 44 px, unico controllo fuori dalle tre altezze | 48 px (`--h-md`) |

## Accessibilità (sintesi; dettaglio in `docs/accessibilita.md`)
- **Contrasto**: 70 coppie di colori verificate in chiaro e in scuro, tutte almeno AA (4,5:1 per il testo, 3:1 per bordi e grafica).
- **Bersagli di tocco**: tutti i controlli alti almeno 40 px (`--h-sm`), quelli frequenti 48–56 px; l'interruttore ha un'area di 52 × 48 px.
- **Leggibilità**: testo di base 16 px con interlinea 1,5; latino da 18 a 40 px; nessuna parola spezzata a metà (verificato: nessun elemento esce a 360 px).

## Cosa funziona
- La metafora della via romana (tabula ansata, pietre miliari, corona d'alloro in fondo) è specifica del latino e non ricorda altre app.
- Il latino ha un aspetto proprio e costante: corsivo Gentium con le quantità facoltative, parole toccabili con analisi e collegamento al Wikizionario.
- Le tabelle generate dal motore evidenziano la desinenza: lo studente vede subito che cosa cambia da un caso all'altro.
- Giano ha cinque espressioni leggibili anche nel busto da 52 px; esulta solo nel benvenuto, quando si apre un'unità e alla fine della lezione.
- Il piede della lezione tiene sempre nello stesso punto l'azione successiva, con tastiera (1–5, Invio) e lettori di schermo.

## Priorità per il futuro
1. **Prova su un iPhone vero** — la sicurezza delle aree (notch, barra Home) e la voce italiana di Safari sono verificate solo in emulazione.
2. **Banco delle tessere sugli schermi bassi** — valutare un banco che si rimpicciolisce sotto i 680 px di altezza, invece di scorrere.
3. **Tema scuro delle tabulae** — i toni delle famiglie sono più cupi per il testo bianco; una prova con studenti direbbe se restano riconoscibili.
