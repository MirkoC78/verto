# Verto — revisione di accessibilità
**Norma:** WCAG 2.1 AA · **Data:** 25 ottobre 2026 · **Oggetto:** `dist/verto.html` (lo stesso codice di `dist/sito/index.html`)

Revisione fatta con la procedura *accessibility-review*: controllo automatico nell'app vera, prova con la sola tastiera, verifica dei contrasti
ricostruendo la cascata dei colori, ridisposizione a 320 px. Non è stata fatta una prova con un lettore di schermo vero (VoiceOver, TalkBack, NVDA):
i nomi e i ruoli sono verificati sul codice e sull'albero di accessibilità, non ascoltati.

## Riepilogo
**Problemi trovati:** 13 · **Critici:** 2 · **Importanti:** 6 · **Minori:** 5 · **Ancora aperti:** 0 (più le verifiche non fatte elencate in fondo)

Come si ripete la verifica:
- `node tools/contrast.js` — 70 coppie di colori, chiaro e scuro;
- `_prove/giocatore.html?w=320&theme=dark&quant=1` — rigioca le 108 lezioni (1355 esercizi) e passa tutte le viste, i 25 argomenti e i fogli;
  per ogni schermata controlla nomi dei controlli, `lang="la"` sul latino, titoli, bersagli sotto 24 px, identificatori ripetuti, strati inerti
  e che nulla esca dalla larghezza. Ultimo esito a 320 px e a 360 px, chiaro e scuro, con e senza quantità: **nessun problema**.

## Risultati

### Percepibile
| # | Problema | Criterio | Gravità | Intervento |
|---|---|---|---|---|
| 1 | Testo bianco sui pulsanti verde e rosso anche in tema scuro, dove i due colori sono chiari: contrasto 2,2:1 | 1.4.3 Contrasto | 🔴 Critico | gettone `--on-state`: bianco in chiaro, quasi nero in scuro (≥ 7:1) |
| 2 | Titoli dell'esito e opzioni giuste/sbagliate scritti con i colori d'ombra (`--good-d`) sui fondi tenui: 3,95:1 in scuro | 1.4.3 Contrasto | 🟡 Importante | gettoni di testo `--good-text` e `--bad-text` |
| 3 | Bordi di campi, tessere e pulsanti chiari a 1,9–2,3:1 sullo sfondo | 1.4.11 Contrasto non testuale | 🟡 Importante | `--line-strong` scurito (chiaro) e schiarito (scuro) fino a ≥ 3:1 |
| 4 | Stelle guadagnate e non guadagnate distinte solo dal colore; quelle vuote a 1,4:1 | 1.4.1 Uso del colore, 1.4.11 | 🟢 Minore | stelle vuote disegnate a contorno, a ≥ 3:1; il numero di stelle è anche nel nome della pietra |
| 5 | A 320 px due pulsanti affiancati (salvataggio) e i collegamenti dei risultati di ricerca uscivano dallo schermo | 1.4.10 Ridisposizione | 🟡 Importante | file di pulsanti e righe vanno a capo quando serve |
| 6 | Opzioni latine lunghe fuori dallo schermo a 360 px | 1.4.10 Ridisposizione | 🟡 Importante | due opzioni per riga solo se ci stanno |
| 7 | Il percorso non aveva un titolo di primo livello | 1.3.1 Informazioni e relazioni | 🟢 Minore | `h1` «Percorso» letto dai lettori di schermo |

### Utilizzabile
| # | Problema | Criterio | Gravità | Intervento |
|---|---|---|---|---|
| 8 | Con una lezione, un foglio o una finestra aperti, il Tab raggiungeva la pagina sotto (e il collegamento «Vai al contenuto») | 2.4.3 Ordine del focus | 🔴 Critico | solo lo strato più in alto è attivo: gli altri diventano `inert` |
| 9 | Aprendo un esercizio il focus restava sul pulsante del percorso; chiudendo un foglio o la lezione finiva sul corpo della pagina | 2.4.3 Ordine del focus | 🟡 Importante | il focus va alla consegna dell'esercizio (annunciata), poi a «Continua»; chiudendo torna al pulsante che aveva aperto |
| 10 | Pulsanti-icona a 44 px, unico controllo fuori dalle tre altezze; righe d'elenco a 64 px | 2.5.5 Dimensione del bersaglio (AAA) | 🟢 Minore | pulsanti-icona a 48 px; tutti i controlli frequenti 48–56 px |
| 11 | Animazioni (ondeggiare della guida, saltelli, transizioni) anche con «riduci movimento» attivo | 2.3.3 Animazione da interazioni (AAA) | 🟢 Minore | animazioni solo senza la preferenza; con la preferenza, nessuna transizione e niente coriandoli |

### Comprensibile
| # | Problema | Criterio | Gravità | Intervento |
|---|---|---|---|---|
| 12 | Il campo della risposta scritta aveva un'etichetta («La tua traduzione») ma non il testo da tradurre | 3.3.2 Etichette o istruzioni | 🟢 Minore | il campo è descritto dalla frase dell'esercizio (`aria-describedby`) |

### Robusto
| # | Problema | Criterio | Gravità | Intervento |
|---|---|---|---|---|
| 13 | Opzione scelta, coppia selezionata e tessera già usata indicate solo da una classe | 4.1.2 Nome, ruolo, valore | 🟡 Importante | `aria-pressed` sulle opzioni e sulle coppie, `aria-disabled` sulle tessere usate; banco e risposta sono gruppi con un nome |

## Contrasti (tutti verificati)
La tabella è generata da `node tools/contrast.js --md`. Testo: minimo 4,5:1; bordi e grafica: minimo 3:1.

| Tema | Colore | Sfondo | Contrasto | Minimo | Dove |
|---|---|---|---|---|---|
| chiaro | `--ink` | `--bg` | 14.75 | 4.5 | testo sullo sfondo |
| chiaro | `--ink` | `--surface` | 16.40 | 4.5 | testo sulle schede |
| chiaro | `--ink` | `--surface-2` | 13.94 | 4.5 | testo sui riquadri grigi |
| chiaro | `--muted` | `--bg` | 5.84 | 4.5 | testo secondario sullo sfondo |
| chiaro | `--muted` | `--surface` | 6.49 | 4.5 | testo secondario sulle schede |
| chiaro | `--muted` | `--surface-2` | 5.52 | 4.5 | testo secondario sui riquadri grigi |
| chiaro | `--pri-text` | `--bg` | 7.18 | 4.5 | collegamenti e testo attivo |
| chiaro | `--pri-text` | `--surface` | 7.99 | 4.5 | collegamenti sulle schede |
| chiaro | `--pri-text` | `--pri-soft` | 6.57 | 4.5 | etichette e scelte attive |
| chiaro | `--pri-ink` | `--pri` | 7.99 | 4.5 | testo dei pulsanti principali |
| chiaro | `--on-state` | `--good` | 5.80 | 4.5 | pulsante «giusto» |
| chiaro | `--on-state` | `--bad` | 5.96 | 4.5 | pulsante «sbagliato» |
| chiaro | `--ink` | `--good-soft` | 13.91 | 4.5 | riquadro della risposta giusta |
| chiaro | `--ink` | `--bad-soft` | 13.48 | 4.5 | riquadro della risposta sbagliata |
| chiaro | `--good-text` | `--good-soft` | 7.46 | 4.5 | risposta giusta, titolo e scelta |
| chiaro | `--bad-text` | `--bad-soft` | 7.47 | 4.5 | risposta sbagliata, titolo e scelta |
| chiaro | `--star-d` | `--star-soft` | 5.45 | 4.5 | etichetta «Nuova» |
| chiaro | `--star-d` | `--surface` | 6.23 | 4.5 | punti XP |
| chiaro | `--flame` | `--surface` | 4.92 | 4.5 | serie di giorni |
| chiaro | `--on-state` | `--bad` | 5.96 | 4.5 | contatore errori |
| chiaro | `--on-color` | `--g-alf` | 6.05 | 4.5 | intestazione unità (lettura) |
| chiaro | `--on-color` | `--g-nom` | 7.99 | 4.5 | intestazione unità (nomi) |
| chiaro | `--on-color` | `--g-ver` | 6.14 | 4.5 | intestazione unità (verbi) |
| chiaro | `--on-color` | `--g-pro` | 7.69 | 4.5 | intestazione unità (pronomi) |
| chiaro | `--on-color` | `--g-sin` | 5.79 | 4.5 | intestazione unità (sintassi) |
| chiaro | `--pri` | `--bg` | 7.18 | 3 | pietra della lezione attuale |
| chiaro | `--road-done` | `--bg` | 7.18 | 3 | pietre completate |
| chiaro | `--focus` | `--bg` | 7.18 | 3 | anello di focus |
| chiaro | `--focus` | `--surface` | 7.99 | 3 | focus sulle schede |
| chiaro | `--line-strong` | `--surface` | 3.64 | 3 | bordi dei campi e dei pulsanti chiari |
| chiaro | `--line-strong` | `--bg` | 3.27 | 3 | bordi sullo sfondo |
| chiaro | `--star` | `--surface` | 3.63 | 3 | stelle e anello obiettivo |
| chiaro | `--good` | `--surface` | 5.80 | 3 | segno di spunta |
| chiaro | `--bad` | `--bad-soft` | 4.90 | 3 | bordo della risposta sbagliata |
| chiaro | `--pri` | `--surface` | 7.99 | 3 | interruttori accesi |
| scuro | `--ink` | `--bg` | 15.15 | 4.5 | testo sullo sfondo |
| scuro | `--ink` | `--surface` | 13.88 | 4.5 | testo sulle schede |
| scuro | `--ink` | `--surface-2` | 12.61 | 4.5 | testo sui riquadri grigi |
| scuro | `--muted` | `--bg` | 7.87 | 4.5 | testo secondario sullo sfondo |
| scuro | `--muted` | `--surface` | 7.20 | 4.5 | testo secondario sulle schede |
| scuro | `--muted` | `--surface-2` | 6.55 | 4.5 | testo secondario sui riquadri grigi |
| scuro | `--pri-text` | `--bg` | 9.00 | 4.5 | collegamenti e testo attivo |
| scuro | `--pri-text` | `--surface` | 8.24 | 4.5 | collegamenti sulle schede |
| scuro | `--pri-text` | `--pri-soft` | 6.99 | 4.5 | etichette e scelte attive |
| scuro | `--pri-ink` | `--pri` | 7.11 | 4.5 | testo dei pulsanti principali |
| scuro | `--on-state` | `--good` | 8.75 | 4.5 | pulsante «giusto» |
| scuro | `--on-state` | `--bad` | 8.35 | 4.5 | pulsante «sbagliato» |
| scuro | `--ink` | `--good-soft` | 12.04 | 4.5 | riquadro della risposta giusta |
| scuro | `--ink` | `--bad-soft` | 12.61 | 4.5 | riquadro della risposta sbagliata |
| scuro | `--good-text` | `--good-soft` | 8.00 | 4.5 | risposta giusta, titolo e scelta |
| scuro | `--bad-text` | `--bad-soft` | 7.67 | 4.5 | risposta sbagliata, titolo e scelta |
| scuro | `--star-d` | `--star-soft` | 8.45 | 4.5 | etichetta «Nuova» |
| scuro | `--star-d` | `--surface` | 10.66 | 4.5 | punti XP |
| scuro | `--flame` | `--surface` | 7.22 | 4.5 | serie di giorni |
| scuro | `--on-state` | `--bad` | 8.35 | 4.5 | contatore errori |
| scuro | `--on-color` | `--g-alf` | 7.25 | 4.5 | intestazione unità (lettura) |
| scuro | `--on-color` | `--g-nom` | 7.97 | 4.5 | intestazione unità (nomi) |
| scuro | `--on-color` | `--g-ver` | 6.91 | 4.5 | intestazione unità (verbi) |
| scuro | `--on-color` | `--g-pro` | 8.14 | 4.5 | intestazione unità (pronomi) |
| scuro | `--on-color` | `--g-sin` | 6.62 | 4.5 | intestazione unità (sintassi) |
| scuro | `--pri` | `--bg` | 6.98 | 3 | pietra della lezione attuale |
| scuro | `--road-done` | `--bg` | 6.98 | 3 | pietre completate |
| scuro | `--focus` | `--bg` | 9.00 | 3 | anello di focus |
| scuro | `--focus` | `--surface` | 8.24 | 3 | focus sulle schede |
| scuro | `--line-strong` | `--surface` | 3.14 | 3 | bordi dei campi e dei pulsanti chiari |
| scuro | `--line-strong` | `--bg` | 3.43 | 3 | bordi sullo sfondo |
| scuro | `--star` | `--surface` | 9.30 | 3 | stelle e anello obiettivo |
| scuro | `--good` | `--surface` | 7.63 | 3 | segno di spunta |
| scuro | `--bad` | `--bad-soft` | 6.62 | 3 | bordo della risposta sbagliata |
| scuro | `--pri` | `--surface` | 6.39 | 3 | interruttori accesi |

## Tastiera
| Elemento | Ordine del Tab | Invio / Spazio | Esc | Altri tasti |
|---|---|---|---|---|
| Collegamento «Vai al contenuto» | primo | porta alla colonna centrale | — | — |
| Scheda «Continua» | subito dopo | apre la lezione; il focus va alla consegna | — | — |
| Pietre miliari | in ordine di percorso | aprono il riquadro della lezione (`aria-expanded`) | chiude il riquadro | — |
| Esercizi a scelta | dentro la lezione | sceglie; Invio fuori dai pulsanti = «Controlla» | — | 1–5 scelgono l'opzione |
| Tessere | dentro la lezione | aggiunge o toglie la tessera | — | Invio = «Controlla» |
| Risposta scritta | il campo riceve il focus su computer | Invio = «Controlla», poi «Continua» | — | tasti delle vocali lunghe sotto il campo |
| «Chiudi la lezione» | primo della lezione | chiede conferma se la lezione è iniziata; poi torna al pulsante d'origine | — | — |
| Fogli (teoria, paradigma, codice) | il focus va su «Chiudi» | — | chiude e restituisce il focus | — |
| Finestre di conferma | il focus va sull'azione | — | chiude | — |
| Parole latine nella frase | in ordine di lettura | aprono l'analisi | chiude l'analisi | — |

## Lettori di schermo (dal codice e dall'albero di accessibilità)
| Elemento | Annunciato come | Note |
|---|---|---|
| Pietra miliare | «Il plurale, 3 stelle, pulsante, compresso» / «…, bloccata» / «…, lezione attuale» | stato completo nel nome |
| Tabula ansata | regione «Unità 3: Prima declinazione» | |
| Lezione | finestra con il titolo della lezione («Il plurale»), poi la consegna «Traduci in italiano» | la consegna riceve il focus a ogni esercizio |
| Frase latina | pulsanti con `lang="la"`; la parola nuova: «parola nuova: lacrimatis» | la pronuncia del lettore segue la lingua dichiarata |
| Esito | regione di stato: «Optimē! +7 XP» o «Soluzione: …» | annunciato senza spostare il focus, poi focus su «Continua» |
| Avanzamento | barra «Avanzamento della lezione» | `progress` nativo |
| Guida (Giano) | non annunciata (`aria-hidden`) | le sue parole sono nel fumetto, testo normale |
| Anello dell'obiettivo, grafico della settimana | immagini con testo («Obiettivo di oggi: 35 su 50 XP») | |
| Interruttori | casella di controllo con il nome dell'impostazione | `input` nativo |

## Bersagli di tocco
Tutti i controlli sono alti almeno 40 px (`--h-sm`): pulsanti piccoli, scelte segmentate, strumenti, collegamenti-pulsante.
Quelli usati di continuo sono di 48 px (pulsanti, tessere, pulsanti-icona, interruttore) o 56 px (pulsanti grandi, opzioni, righe, pietre, schede in basso).
Fanno eccezione solo le parole toccabili dentro la frase latina, che seguono la riga di testo (eccezione «in linea» del criterio).

## Da verificare a mano
1. **Lettore di schermo vero** su iPhone (VoiceOver) e Android (TalkBack): ordine di lettura dentro la lezione e annuncio dell'esito.
2. **Ingrandimento del testo di sistema** su iPhone: i caratteri sono in px, quindi lo zoom della pagina funziona ma il «testo più grande» di iOS
   non ingrandisce l'app; valutare il passaggio a `rem` se gli studenti lo usano.
3. **Voce italiana** per la lettura del latino: dipende dalle voci installate sul dispositivo.
