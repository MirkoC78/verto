# Verto — sistema di design

Revisione fatta con la procedura *design-system* (audit + documentazione) su `src/app.css`, `src/app.js` e `src/guide.js`.
Il foglio di stile è l'unica fonte dei valori: ogni misura e ogni colore passa da un gettone definito in `:root`.
La verifica è automatica: `node tools/audit-tokens.js` fallisce se trova un valore fuori dal sistema.

## Riepilogo dell'audit

**Componenti esaminati:** 38 · **Problemi trovati:** 57 (tutti corretti) · **Punteggio finale:** 94/100

| Controllo automatico | Prima | Dopo |
|---|---|---|
| Colori scritti a mano fuori da `:root` | 4 | 0 |
| Dimensioni del testo fuori dalla scala | 0 | 0 |
| Raggi fuori dalla scala | 1 (pietra miliare a 24 px) | 0 |
| Ombre diverse dal rilievo unico o dall'ombra dei livelli | 0 | 0 |
| Altezze dei controlli fuori dai tre gettoni | 6 (pulsante-icona 44, righe 64, scelte 64, pietra 72, interruttore 32) | 0 |
| Misure in px non multiple di 4 | 28 (icone 18/22/26, barra 10/14, orecchie della tabula 18/22…) | 0 |
| Stili scritti nel markup | 0 | 0 |
| Gettoni definiti e mai usati | 1 (`--sh-1`) | 0 |
| Classi usate senza regola (`tools/check-classes.js`) | 1 (`view`) | 0 |
| Coppie di colori sotto AA (`tools/contrast.js`) | 24 su 210 nelle tre proposte | 0 su 70 |

I 6 punti mancanti: le «forme piene» (`--r-pill`) sono un quarto valore di arrotondamento oltre ai tre raggi (vedi sotto);
le misure grafiche della pietra miliare e dell'orecchia della tabula sono calcolate dai gettoni ma restano disegni, non regole riusabili;
il pomello dell'interruttore resta bianco in entrambi i temi (gettone `--thumb`), scelta voluta ma da rivedere se cambia la palette.

### Incoerenze di nomi corrette

| Problema | Dove | Soluzione adottata |
|---|---|---|
| `.done` usato sia per la pietra completata sia per la schermata di fine lezione: la pietra prendeva lo stile centrato della schermata | percorso, fine lezione | la schermata di fine si chiama `.finish`; `.done` resta uno stato della pietra |
| `.ok` / `.err` usati come antenati generici | piede della lezione | regole limitate a `.ov-foot.ok` e `.ov-foot.err` |
| Testo verde/rosso sui fondi tenui affidato ai colori d'ombra (`--good-d`, `--bad-d`), illeggibile in scuro | risposte giuste e sbagliate | gettoni di testo dedicati `--good-text`, `--bad-text`; `-d` resta solo per il rilievo |
| Testo bianco fisso sui pulsanti verde e rosso, illeggibile in scuro (contrasto 2,2) | pulsanti di esito, contatore errori | gettone `--on-state`, bianco in chiaro e quasi nero in scuro |
| `--sh-1`, `--sh-2` senza un significato | — | un solo `--sh-float` per ciò che galleggia (fogli, avvisi, popup, pulsante «Lezione attuale») |

## Gettoni

### Spazi (base 4 px)
| Gettone | Valore | Uso tipico |
|---|---|---|
| `--sp-1` | 4 | spazio tra icona e testo nei controlli piccoli |
| `--sp-2` | 8 | tra tessere, dentro i campi, spessore delle barre |
| `--sp-3` | 12 | tra elementi di un gruppo, imbottitura verticale delle righe |
| `--sp-4` | 16 | margine laterale a 360 px, imbottitura delle schede |
| `--sp-5` | 20 | tra blocchi della lezione |
| `--sp-6` | 24 | tra sezioni piccole |
| `--sp-7` | 32 | tra sezioni della pagina |
| `--sp-8` | 40 | tra le unità del percorso |
| `--sp-9` | 48 | fondo della colonna su computer |

### Testo (7 dimensioni)
| Gettone | px | Uso |
|---|---|---|
| `--fs-xs` | 12 | etichette delle schede in basso, etichette «Nuova» |
| `--fs-sm` | 14 | testo secondario, note |
| `--fs-md` | 16 | testo di base, pulsanti |
| `--fs-lg` | 18 | latino nelle opzioni, pulsanti grandi, titoli di terzo livello |
| `--fs-xl` | 22 | titoli di sezione, intestazioni delle unità |
| `--fs-2xl` | 28 | titoli di pagina, riga latina da tradurre |
| `--fs-3xl` | 40 | forma da analizzare, titolo della fine lezione |

Interlinea `--lh` 1,5 per il testo, `--lh-tight` 1,2 per i titoli. Tre caratteri, ciascuno con un compito:
**Lexend** per l'interfaccia (pensato per la leggibilità), **Gentium Book Plus** corsivo per tutto il latino (con le vocali lunghe ā ē ī ō ū),
**Marcellus** (capitale lapidaria) per il marchio, i numeri romani delle unità e i titoli delle tabulae.

### Raggi (3 + forma piena)
| Gettone | px | Uso |
|---|---|---|
| `--r-sm` | 8 | tabula, tabelle, numeri delle unità, piccoli riquadri |
| `--r-md` | 14 | pulsanti, campi, opzioni, tessere, schede |
| `--r-lg` | 22 | scheda «Continua», fogli che salgono dal basso, cupola della pietra miliare |
| `--r-pill` | — | forma piena per ciò che è tondo per natura: chip, etichette, barre, pulsanti-icona, interruttore |

### Altezze dei controlli (3) e rilievo (1)
| Gettone | px | Controlli |
|---|---|---|
| `--h-sm` | 40 | chip, pulsanti piccoli, scelte segmentate, strumenti |
| `--h-md` | 48 | pulsanti, campi, tessere, pulsanti-icona, interruttore (area di tocco) |
| `--h-lg` | 56 | pulsanti grandi, opzioni, righe degli elenchi, pietre miliari, barra in alto |

`--depth` 4 px è l'unico rilievo: il bordo inferiore pieno sotto pulsanti, tessere, opzioni e pietre miliari, che si abbassa alla pressione.

### Icone
`--ic-xs` 16 · `--ic-sm` 20 · `--ic-md` 24 · `--ic-lg` 32 · `--ic-xl` 40. Un'icona senza misura propria prende `--ic-sm`
(regola a specificità zero, così ogni componente può cambiarla).

### Larghezze
Colonna centrale `--w-main` 600, lezione `--w-lesson` 640, pannello dei progressi `--w-side` 320, menu laterale `--w-rail` 232.
Sotto i 1024 px: una colonna con le schede in basso; da 1024 px: menu laterale, colonna centrale, pannello progressi.

### Colori: «Pigmenti romani»
Scelta fra tre proposte applicate all'app vera (pigmenti romani, marmo e bronzo, affresco pompeiano); le due scartate restano nella storia
del repository (tappa 4). Ogni coppia testo/fondo è verificata in chiaro e in scuro da `tools/contrast.js` (vedi `docs/accessibilita.md`).

| Ruolo | Gettone | Chiaro | Scuro |
|---|---|---|---|
| Fondo | `--bg` | #F1F3F5 | #11151B |
| Schede | `--surface` / `--surface-2` | #FFFFFF / #E9EDF1 | #181E26 / #1F2630 |
| Linee | `--line` / `--line-strong` | #D5DBE2 / #7F8790 | #2B3440 / #626C77 |
| Testo | `--ink` / `--muted` | #18202B / #545F6D | #E6EAEF / #A1ABB7 |
| Principale (blu egizio) | `--pri` / `--pri-d` / `--pri-soft` | #2448B0 / #17327F / #E3E9F8 | #7D9BFF / #5776DD / #1E2A47 |
| Giusto | `--good` / `--good-text` / `--good-soft` | #1D7350 / #12553A / #DDF1E7 | #43C493 / #6ED3A9 / #132E24 |
| Sbagliato | `--bad` / `--bad-text` / `--bad-soft` | #B23A22 / #852814 / #FBE4DE | #FF8A70 / #FF9F89 / #3A1E18 |
| Stelle e punti (ocra) | `--star` / `--star-d` / `--star-soft` | #B07D12 / #7F5A0B / #FAEFD4 | #F0B848 / #F5C86A / #3A2E13 |
| Serie (fiamma) | `--flame` | #C2491F | #FF8A5B |
| Famiglie di argomenti | `--g-alf` lettura (verderame), `--g-nom` nomi (blu egizio), `--g-ver` verbi (minio), `--g-pro` pronomi (porpora), `--g-sin` sintassi (ocra scura) | #1F6E64 · #2448B0 · #A8401F · #763A88 · #82600D | toni più profondi per il testo bianco |

Regola di composizione: **un solo blocco a tinta piena per schermata** oltre all'intestazione dell'unità (il pulsante principale);
le famiglie di argomenti colorano solo le tabulae del percorso e i numeri nella scelta della posizione. Gli elenchi sono righe in una scheda,
mai riquadri colorati affiancati.

## Componenti

| Componente | Classe | Varianti | Stati | Accessibilità |
|---|---|---|---|---|
| Pulsante | `.btn` | `.big` `.small` `.block` `.ghost` `.ok` `.err` | normale, premuto (scende di `--depth`), disattivato | testo sempre visibile; mai solo icona |
| Pulsante-icona | `.iconbtn` | `.outline` | normale, sopra, premuto (`aria-pressed`) | `aria-label` e `title` obbligatori |
| Collegamento-pulsante | `.linkbtn` | — | normale | sottolineato, alto `--h-sm` |
| Chip | `.chip` | `.streak` `.xp` | `.off` | numero + testo nascosto per i lettori di schermo |
| Riga d'elenco | `.list > li > .rowbtn` | con `.ico`, `.num`, `.count` | sopra, disattivata | un solo pulsante per riga, freccia decorativa |
| Impostazione | `.setting` | `.wrap` (con scelte sotto) | — | interruttori con `aria-label` uguale al titolo |
| Interruttore | `.switch` | — | acceso, spento, focus | è un vero `input type=checkbox` |
| Scelte segmentate | `.seg` | — | `aria-pressed` | gruppo con `aria-labelledby` |
| Campo | `.typed` | `.la` (latino) | focus | etichetta visibile o `.sr` |
| Menu a tendina | `.select` | — | focus | `select` nativo |
| Barra di avanzamento | `progress.bar` | `.pri` `.good` | — | `progress` nativo con `aria-label` |
| Scheda | `.card` | `.flush` | — | — |
| La guida | `.say`, `.bubble`, `svg.guide` | 5 espressioni, busto sotto 64 px | `bob`, `cheer` (solo senza riduzione del movimento) | disegno decorativo (`aria-hidden`), il testo è nel fumetto |
| Scheda «Continua» | `.resume` | — | — | regione con nome «Lezione attuale» |
| Tabula ansata | `.unit .tabula` | colore per famiglia | `.locked` | regione con il nome dell'unità |
| Pietra miliare | `.stone` | `.test` (prova) | `.done` `.current` `.locked` | nome con stelle e stato («bloccata», «lezione attuale»), `aria-expanded` |
| Esercizio | `.ov-*`, `.prompt`, `.latin-line`, `.opts`/`.opt`, `.bank`/`.tile`, `.answer`, `.match` | due opzioni per riga solo se ci stanno | `.sel` `.right` `.wrong` `.used` | finestra modale con nome; esito annunciato (`role=status`); tasti 1–5 e Invio |
| Parola toccabile | `.latin-line .w` | `.new`, `.verb` | `.open` | pulsante con `lang="la"`; la parola nuova ha un nome esteso |
| Tabella dal motore | `.tbl-wrap .para` | desinenza `.end` | — | `caption`, intestazioni di riga e colonna (`scope`) |
| Fogli e finestre | `.sheet`, `.modal`, `.pop`, `.toast` | — | — | `role=dialog`, `aria-modal`; Esc chiude; il focus va al pulsante di chiusura |
| Insegna | `.badge` + `svg.medal` | conquistata, `.off` | — | nome latino e descrizione in chiaro |

### Da fare e da non fare
| Da fare | Da non fare |
|---|---|
| Prendere ogni misura dai gettoni | Scrivere px o colori nelle regole dei componenti |
| Dare a ogni icona interattiva un nome | Usare un'icona come unico segnale di stato |
| Lasciare il colore pieno al solo pulsante principale | Riempire di colore le righe degli elenchi |
| Scrivere il latino in Gentium corsivo con `lang="la"` | Spezzare una parola a metà per farla stare |

## Verifiche automatiche
- `node tools/audit-tokens.js` — valori fuori dal sistema, gettoni inutili, stili nel markup.
- `node tools/check-classes.js` — classi usate senza regola e regole senza uso.
- `node tools/contrast.js` — 70 coppie di colori AA in chiaro e scuro (`--md` per la tabella).
- `_prove/giocatore.html?w=360` — rigioca tutte le lezioni nell'app vera e segnala ogni elemento che esce dai 360 px.
