# Verto — corso guidato di latino per il biennio

Verto è un'app web per studenti di 14–15 anni: un percorso a 25 unità (dall'alfabeto e la pronuncia al *cum* narrativo),
108 lezioni brevi con la guida Giano, prove d'unità, palestra di traduzione, teoria, lessico con ripetizione dilazionata.
Tutto funziona sul dispositivo: nessun account, nessuna intelligenza artificiale, nessun dato inviato. L'unico servizio esterno
è il collegamento facoltativo al Wikizionario.

## Che cosa si consegna
- `dist/verto.html` — file unico autonomo (caratteri incorporati): si apre in qualunque browser, anche dal disco e senza rete.
- `dist/sito/` — cartella da pubblicare su un hosting statico HTTPS (GitHub Pages, Netlify, spazio web della scuola):
  `index.html`, `manifest.webmanifest`, `sw.js` (uso senza rete), `icons/`, `LICENZE-CARATTERI.txt`, `LEGGIMI.txt`.
  Da lì si installa su iPhone («Condividi → Aggiungi alla schermata Home») e su Android («Installa app»).

## Pubblicazione: https://mirkoc78.github.io/verto/
Il sito è pubblicato con GitHub Pages dal ramo `gh-pages`, che contiene solo la cartella `dist/sito`;
il progetto completo è sul ramo `main` del repository [MirkoC78/verto](https://github.com/MirkoC78/verto).
Per pubblicare un aggiornamento, dalla cartella del progetto in Git Bash:
```
bash tools/pubblica.sh "che cosa è cambiato"
```
Lo script ricostruisce l'app, lancia i test (se uno fallisce si ferma), salva e invia `main`, poi copia `dist/sito`
in `gh-pages` con `git subtree split` e lo invia. Dopo uno o due minuti il sito è aggiornato; chi ha già l'app
riceve la versione nuova alla visita successiva, perché il service worker cambia cache a ogni versione.

Il dominio mirkoc78.github.io ospita anche altre app (per esempio Hermeneus), quindi Verto:
- salva i progressi solo nella chiave `verto.v2` di localStorage (legge `verto.v1` di Verto 1, mai le chiavi di altre app);
- registra il service worker con ambito `./`, cioè solo la cartella `/verto/`;
- chiama le sue cache `verto@/verto/@<versione>` e all'attivazione cancella soltanto le proprie versioni vecchie;
- usa solo percorsi relativi (`./`) per manifest, `start_url`, `scope`, service worker e icone.

## Costruire e provare
```
node build.js            # ricostruisce dist/verto.html e dist/sito/
node test/run-all.js     # motore, banca, teoria, generatore (10.000 frasi), percorso, codice di salvataggio, regressioni della revisione, spiegazioni degli errori
python tools/icons.py    # rigenera le icone in assets/ (serve Pillow)
node tools/audit-tokens.js && node tools/check-classes.js && node tools/contrast.js   # sistema di design e contrasti
```
Prove nel browser (servire la cartella del progetto, per esempio con `python -m http.server 8766`):
- `_prove/giocatore.html?w=360` — il giocatore automatico rigioca tutte le lezioni nell'app vera e controlla risposte, stelle,
  larghezza, accessibilità e console; parametri `w`, `theme=dark`, `quant=1`, `da`, `a`.
- `_prove/riquadri.html` — le schermate principali affiancate a 360 px (`#tema=dark` per il tema scuro).
- `_prove/mascotte.html` — Giano nelle cinque espressioni e nel busto.
- Anteprime dell'app: `dist/verto.html#demo=14` (stato dimostrativo mai salvato), `&view=gym|lib|words|me|topic:n1`,
  `&lesson=10&step=2&seed=3`, `&theme=dark`, `&quant=1`; benvenuto con `#onb=0|1|2`.

Prima di ogni ricarica durante le prove del sito, cancellare service worker e cache (Strumenti per sviluppatori → Applicazione),
altrimenti si vede la versione precedente.

## Com'è fatto
| File | Contenuto |
|---|---|
| `src/engine.js`, `src/lexicon.js` | motore morfologico con le quantità; 599 lemmi |
| `src/reading.js` | pronuncia scolastica, sillabe e accento |
| `src/sentence.js`, `src/bank.js` | analisi delle frasi, ordine libero, 192 frasi verificate |
| `src/italian.js`, `src/semantic.js`, `src/generator.js` | generatore di frasi nuove con la traccia delle analisi |
| `src/course.js`, `src/lessons.js` | percorso (unità, lezioni, schede) e motore delle lezioni con i perimetri |
| `src/topics.js` | teoria dei 25 argomenti, metodo, massime, cursus honorum |
| `src/savecode.js` | codice di salvataggio |
| `src/check.js` | controllo delle traduzioni italiane scritte |
| `src/explain.js` | spiegazioni mirate degli errori, dalle analisi del motore |
| `src/guide.js` | Giano in SVG |
| `src/app.js`, `src/app.css` | interfaccia e sistema di design |
| `docs/` | inventario e piano, sistema di design, critica di design, accessibilità, rapporto finale |
| `legacy/` | Verto 1, il punto di partenza |

## Licenze
Caratteri Lexend, Marcellus e Gentium Book Plus: SIL Open Font License 1.1 (`fonts/LICENZE-CARATTERI.txt`).
Le definizioni del Wikizionario restano sul Wikizionario (CC BY-SA): l'app apre solo un collegamento.
