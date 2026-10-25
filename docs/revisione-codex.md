# Verto — risposta alla revisione esterna (Codex, 25 ottobre 2026)

La revisione ha esaminato `dist/verto.html` versione `0180af5255`, la stessa costruita dal commit `c69d1ab`.
I quattro difetti prioritari sono stati riprodotti sul codice di quella versione e corretti nei sorgenti.
Le regressioni sono in `test/review.test.js`: sul codice di prima trovano 2184 errori, su quello corretto nessuno.

## Difetti corretti

| Voce | Esito | Che cosa è cambiato | Verifica |
|---|---|---|---|
| **VERTO-003** Generatore costruito prima del lessico | ✅ corretto | Nel browser il lessico si carica dopo la schermata d'avvio, ma i repertori del generatore si costruivano al caricamento del modulo, quindi vuoti: nessuna frase generata, 285 avvisi, ripiego silenzioso sulla banca. Ora `VertoGen.init()` li costruisce a lessico caricato, è idempotente e `generate` la chiama da sé (`src/generator.js`) | test con l'ordine di caricamento del browser: repertori 140 nomi, 44 aggettivi, 101 verbi; 40/40 frasi generate; seconda inizializzazione senza duplicati. Nel browser: frasi generate presenti, console senza avvisi |
| **VERTO-001** Traduzione con significato invertito premiata | ✅ corretto | La somiglianza tra stringhe (anche con le parole in ordine alfabetico) premiava inversioni di ruoli e negazioni. Il nuovo `src/check.js` accetta da solo solo una risposta uguale a una traduzione prevista, a meno di maiuscole, punteggiatura, accenti, apostrofi e una lettera sbagliata dentro una parola di almeno 5 lettere, mai sulla desinenza. Tutto il resto va al confronto guidato, ora con una traccia: chi agisce, che cosa succede, su chi, c'è una negazione? Il giudizio dello studente è dichiarato come tale e non dà il bonus della risposta scritta. Le tessere restano a corrispondenza esatta, la retroversione latina non è stata toccata | 9 risposte sbagliate (ruoli, negazione, numero, persona) respinte; 5 varianti ortografiche accettate; tutte le 537 traduzioni della banca accettate e, per ciascuna, «non» aggiunto, parola tolta e parole capovolte respinte |
| **VERTO-002** Quantità mostrate e analisi accettate | ✅ corretto | La risposta «giusta» era la lettura preferita fra tutte quelle con la stessa grafia (`ferā` → nominativo). Ora è una lettura della forma mostrata; ogni esercizio porta le letture valide senza quantità (`valid`) e con le quantità (`validQ`), e l'app usa quelle giuste secondo l'impostazione; i distrattori sono sbagliati in entrambi i casi. Stessa politica in lezione, domanda di controllo e ripasso. Corretto anche un difetto analogo trovato nel frattempo: in «Completa» e «Concorda» l'opzione giusta poteva comparire con la quantità di un'altra forma (`rosa` per `rosā`) | `ferā` ha la sola lettura «ablativo singolare»; 651 analisi, 406 completamenti e 126 concordanze controllati su tutte le lezioni |
| **VERTO-004** Vocativo in ‑ī troppo esteso | ✅ corretto | Il vocativo in ‑ī ora vale solo dove il lessico lo dichiara (flag `vocI`: per ora `fīlius`); gli altri nomi in ‑ius escono in ‑ie: `socie`, `nūntie`, `gladie`. *Ascanius*, nome di origine greca, ha `Ascanie`. Genitivi invariati, UID invariati. Lezione `n2d` e teoria della seconda declinazione riscritte | tabella del report verificata; le forme di Verto 1 cambiate di proposito sono elencate in `test/fixtures/forms-changes.txt` |
| **VERTO-005** Testi didattici | ✅ corretto | Accento: esempio `fortūna` al posto di `victōria`, formulazione «quasi mai sull'ultima sillaba». Metodo: «di solito ciascun verbo di modo finito regge una proposizione», con infiniti e participi annunciati; durante l'esercizio l'avviso compare quando quegli argomenti sono aperti. Seconda classe: «concorda in genere, numero e caso; la desinenza può essere diversa». Teoria: tolto «niente errori di stampa» | test dei contenuti e del percorso |

## Proposte adottate perché correggono un difetto
| Voce | Esito | Motivo |
|---|---|---|
| **VERTO-006** Ripasso: un avanzamento al giorno | ✅ adottata | Il ripasso a esercizi aggiunto con la nuova sezione Lessico faceva avanzare una parola di due scatole nella stessa sessione (scelta e coppie). Ora una parola avanza al massimo una volta al giorno; un errore la riporta alla prima scatola e il recupero nello stesso giorno non la fa avanzare. I vecchi salvataggi restano validi |
| **VERTO-011** Benvenuto | ✅ adottata | «Avanti» resta fisso in basso mentre si scorre l'elenco delle unità; «Comincio da zero» è già selezionato, quindi chi parte da zero tocca subito «Avanti» |
| **VERTO-012** Tabelle sul telefono | ✅ adottata | Quando una tabella è più larga dello schermo la prima colonna resta ferma, compare l'avviso «Scorri la tabella verso destra…» e la tabella diventa una regione raggiungibile da tastiera |
| Riquadro della parola (controllo aggiuntivo) | ✅ adottata | All'apertura il focus entra nel riquadro; con Esc o chiudendolo torna alla parola |
| Importazione dei salvataggi (controllo aggiuntivo) | ✅ adottata | Il file viene controllato prima di toccare lo stato (versione, sblocco nei limiti, stelle 1–3, tipi dei campi): un file incompleto o incoerente mostra un messaggio chiaro e non sovrascrive nulla |

## Proposte che richiedono una scelta
| Voce | Che cosa servirebbe decidere |
|---|---|
| **VERTO-007** Ripresa delle lezioni interrotte | Salvare l'esercizio in corso (con frasi generate e tessere) oppure dire più chiaramente che una lezione interrotta riparte da capo |
| **VERTO-008** Altri tipi di errore nel ripasso | Quali competenze ripassare a distanza (lettura, accento, sillabe, quantità, concordanza) e con quale peso |
| **VERTO-009** Feedback diagnostico | Spiegazioni mirate dell'errore («*agnum* è accusativo: è l'agnello a subire l'azione»). La traccia nel confronto guidato è già stata aggiunta con VERTO-001 |
| **VERTO-010** Microletture e verifica del trasferimento | Brani di 3–4 frasi collegate con domanda di comprensione; richiede contenuti nuovi scritti e revisionati |
| **VERTO-013** Etichette degli strumenti, percorso più corto | Etichette di testo sotto le icone degli strumenti; unità future chiuse e espandibili. Da provare con studenti |

## Restano da verificare
Telefoni veri (Safari su iPhone, Android), tastiera virtuale, lettori di schermo, ingrandimento del testo di sistema e una prova con studenti.
