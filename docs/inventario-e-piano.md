# Verto 2 — inventario e piano

## Che cosa c'è in Verto 1 (file unico, 6.254 righe)

| Parte | Contenuto | Destino |
|---|---|---|
| Motore morfologico | 5 declinazioni, aggettivi di I e II classe con comparativi e superlativi, 4 coniugazioni e mista, deponenti e semideponenti, sum, possum e composti, eo, fero, volo, nolo, malo, fio, pronomi; indice forma → analisi con gli argomenti necessari (`req`) | **si riusa** (`src/engine.js`); si aggiungono le quantità |
| Lessico | 560 lemmi circa (230 nomi, 70 aggettivi, 200 verbi, pronomi, 100 invariabili) | **si riusa** (`src/lexicon.js`) |
| Programma e teoria | 24 argomenti con spiegazione, consigli, trappole, esempi; metodo in 8 passi; 32 massime; 8 gradi del cursus honorum | **si riusa** il testo; le tabelle dei paradigmi, oggi scritte a mano, passano al motore |
| Banca di frasi | 200 frasi verificate con traduzioni alternative e argomenti | **si riusa** (`src/bank.js`) |
| Morfologia italiana, lessico semantico, generatore | 12 costrutti (frase semplice, copula, comparativo, imperativo, servili, composti di sum, temporali e causali, relativa, cum, finali, infinitiva, ablativo assoluto) | **si riusa**; si aggiungono vocabolario limitato, forme ammesse e traccia delle analisi |
| Esercizi | versione e retroversione a tessere o scritte, analizza, scrivi la forma (paradigma), completa, lessico; ripasso errori; schede del lessico a scatole | **si riusa** la logica; si aggiungono abbina, concordanza, pronuncia |
| Motivazione | XP, serie con scudi, obiettivo, gradi, 16 insegne, suoni, coriandoli, massima del giorno | **si riusa** |
| Wikizionario | ricerca facoltativa | **si riusa** come collegamento facoltativo |
| Claude | frasi, correzioni e spiegazioni con l'IA | **si toglie** (vincolo: niente IA) |

## Che cosa manca

- Percorso guidato: unità, lezioni brevi, prove, stelle, sblocchi, «Continua», benvenuto con posizione.
- Perimetri: vocabolario incontrato, una parola nuova al massimo, forme ammesse per lezione, e il test che li controlla.
- Unità «Alfabeto e pronuncia» (non esiste in Verto 1) e quantità vocaliche nel motore.
- Tabelle dei paradigmi generate dal motore.
- Ordine libero «controllato» nella retroversione (connettivi e negazione al loro posto).
- Codice di salvataggio, copia su file, memoria persistente, promemoria.
- Mascotte, palestra con quattro livelli, impaginazione da computer, sistema di design, accessibilità AA.
- Sito installabile (manifest, service worker, icone, licenze) e test automatici: Verto 1 non ne ha.

## Piano a tappe (un commit per tappa)

1. **Moduli e test di base** — estrazione dei moduli, build, test del motore, della banca e del generatore (10.000 frasi).
2. **Quantità** — vocali lunghe nel lessico e nelle desinenze, accento di lettura; test delle forme con le quantità.
3. **Percorso e perimetri** — `course.js` (25 unità), `lessons.js`, traccia delle analisi nel generatore, ordine libero controllato; test dei perimetri.
4. **Interfaccia** — percorso, lezioni con schede, palestra, teoria, lessico, profilo, benvenuto; tre proposte di colore sull'app vera e tre idee di mascotte da scegliere.
5. **Salvataggio** — codice a bit impacchettati con controllo a 16 bit, copia su file, promemoria; test su migliaia di stati.
6. **Mascotte e motivazione** — disegno definitivo con cinque espressioni, insegne latine, gradi.
7. **Grafica** — sistema di design, critica di tutte le schermate, verifica AA; revisioni in `docs/`.
8. **Sito e verifica nel browser** — PWA, giocatore automatico su tutte le lezioni, 360 px e computer, chiaro e scuro, console pulita.
9. **Rapporto finale**.
