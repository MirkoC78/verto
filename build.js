/* VERTO — costruzione.
   Produce: dist/verto.html (file unico autonomo, caratteri incorporati, funziona anche aperto dal disco e senza rete)
            dist/sito/ (index.html, manifest.webmanifest, sw.js, icone, licenze) da pubblicare su un hosting statico HTTPS.
   Uso: node build.js */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = __dirname;
const r = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// 1. Caratteri incorporati (WOFF2 in base64): il latino di base e, a parte, le vocali con il segno di lunga
const R_LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const R_MACRON = 'U+0100-0103,U+0112-0115,U+012A-012D,U+014C-014F,U+016A-016D';
const FONTS = [
  ['Lexend', 'normal', 400, 'lexend-400', R_LATIN], ['Lexend', 'normal', 500, 'lexend-500', R_LATIN],
  ['Lexend', 'normal', 600, 'lexend-600', R_LATIN], ['Lexend', 'normal', 700, 'lexend-700', R_LATIN],
  ['Marcellus', 'normal', 400, 'marcellus-400', R_LATIN],
  ['Gentium Book Plus', 'normal', 400, 'gentium-book-regular-latin', R_LATIN], ['Gentium Book Plus', 'normal', 400, 'gentium-book-regular-macron', R_MACRON],
  ['Gentium Book Plus', 'italic', 400, 'gentium-book-italic-latin', R_LATIN], ['Gentium Book Plus', 'italic', 400, 'gentium-book-italic-macron', R_MACRON],
];
const fontCSS = FONTS.map(([fam, style, w, file, range]) => {
  const b64 = fs.readFileSync(path.join(ROOT, 'fonts', file + '.woff2')).toString('base64');
  return `@font-face{font-family:'${fam}';font-style:${style};font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${range}}`;
}).join('\n');

// 2. Script nell'ordine di dipendenza
const MODULES = ['src/engine.js', 'src/lexicon.js', 'src/sentence.js', 'src/reading.js', 'src/italian.js', 'src/semantic.js', 'src/generator.js',
  'src/course.js', 'src/lessons.js', 'src/topics.js', 'src/bank.js', 'src/savecode.js', 'src/check.js', 'src/explain.js', 'src/guide.js', 'src/app.js'];
const code = MODULES.map((m) => `/* ---- ${m} ---- */\n` + r(m)).join('\n;\n');
const css = r('src/app.css');
const ASSETS_DIR = path.join(ROOT, 'assets');
const hasIcons = fs.existsSync(path.join(ASSETS_DIR, 'icon-192.png'));
const png = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(ASSETS_DIR, f)).toString('base64');
const hash = crypto.createHash('sha256').update(code + css + fontCSS);
if (hasIcons) for (const f of fs.readdirSync(ASSETS_DIR).sort()) hash.update(fs.readFileSync(path.join(ASSETS_DIR, f)));
const version = hash.digest('hex').slice(0, 10);
const THEME = '#F1F3F5';
const MARK = '<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M18.2 5 29 16 18.2 27 7.4 16z" fill="var(--g-ver)"/><path d="M13.8 5 24.6 16 13.8 27 3 16z" fill="var(--pri)"/></svg>';

function page(site) {
  const icons = !hasIcons ? '' : site
    ? `<link rel="manifest" href="./manifest.webmanifest">\n<link rel="icon" href="./icons/favicon-32.png" sizes="32x32">\n<link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">`
    : `<link rel="icon" href="${png('favicon-32.png')}" sizes="32x32">\n<link rel="apple-touch-icon" href="${png('apple-touch-icon.png')}">`;
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Verto</title>
<meta name="description" content="Corso guidato di latino per il biennio del liceo: lezioni brevi, traduzioni dal latino e verso il latino, teoria e lessico. Tutto sul dispositivo, senza account.">
<meta name="theme-color" content="${THEME}">
<meta name="color-scheme" content="light dark">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Verto">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="format-detection" content="telephone=no">
<meta name="generator" content="Verto ${version}">
${icons}
<style>
${fontCSS}
${css}
</style>
</head>
<body>
<a class="skip" href="#main">Vai al contenuto</a>
<div id="app" class="app"><div class="splash" role="status">${MARK}<b>VERTO</b><span>Preparo le lezioni…</span></div><noscript><p class="noscript">Verto ha bisogno di JavaScript attivo nel browser.</p></noscript></div>
<script>window.VERTO_SITE = ${site ? 'true' : 'false'}; window.VERTO_VERSION = '${version}';</script>
<script>
${code}
</script>
</body>
</html>
`;
}

const DIST = path.join(ROOT, 'dist');
const SITE = path.join(DIST, 'sito');
fs.mkdirSync(path.join(SITE, 'icons'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'verto.html'), page(false));
fs.writeFileSync(path.join(SITE, 'index.html'), page(true));
if (hasIcons) for (const f of fs.readdirSync(ASSETS_DIR)) fs.copyFileSync(path.join(ASSETS_DIR, f), path.join(SITE, 'icons', f));
if (fs.existsSync(path.join(ROOT, 'fonts', 'LICENZE-CARATTERI.txt'))) fs.copyFileSync(path.join(ROOT, 'fonts', 'LICENZE-CARATTERI.txt'), path.join(SITE, 'LICENZE-CARATTERI.txt'));
fs.writeFileSync(path.join(SITE, 'manifest.webmanifest'), JSON.stringify({
  name: 'Verto: latino per il biennio', short_name: 'Verto', description: 'Corso guidato di latino per il biennio del liceo: lezioni, traduzioni, teoria e lessico.',
  id: './', lang: 'it', dir: 'ltr', start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
  background_color: THEME, theme_color: THEME, categories: ['education'],
  icons: [
    { src: './icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: './icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];
fs.writeFileSync(path.join(SITE, 'sw.js'), `/* Verto — service worker: tutto in cache per l'uso senza rete. Versione ${version}.
   Il sito può ospitare altre app (per esempio mirkoc78.github.io/hermeneus/): questo service worker vale solo per la sua
   cartella, usa cache con il nome dell'app e della cartella («verto@/verto/@versione») e all'attivazione cancella
   soltanto le proprie versioni vecchie, mai le cache delle altre app. */
const APP = 'verto';
const VERSION = '${version}';
const SCOPE = new URL('./', self.location).pathname;
const PREFIX = APP + '@' + SCOPE + '@';
const CACHE = PREFIX + VERSION;
const ASSETS = ${JSON.stringify(ASSETS)};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then((c) => c.match('./index.html')).then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }).then((r) => r || fetch(req).then((res) => {
    if (res.ok) c.put(req, res.clone());
    return res;
  }))));
});
`);
// GitHub Pages: niente elaborazione Jekyll della cartella
fs.writeFileSync(path.join(SITE, '.nojekyll'), '');
fs.writeFileSync(path.join(SITE, 'LEGGIMI.txt'), `VERTO — pacchetto per la pubblicazione (versione ${version})

Contenuto
  index.html             l'applicazione completa (caratteri incorporati)
  manifest.webmanifest   dati per l'installazione su telefono
  sw.js                  service worker: rende l'app utilizzabile senza rete (solo nella sua cartella)
  .nojekyll              per GitHub Pages: pubblica i file così come sono
  icons/                 icone dell'app
  LICENZE-CARATTERI.txt  licenze SIL OFL 1.1 di Lexend, Marcellus e Gentium Book Plus

Pubblicazione
  Carica l'intera cartella su un hosting statico con HTTPS (per esempio GitHub Pages,
  Netlify, Cloudflare Pages o lo spazio web della scuola). Non serve un server: niente
  database, niente account, nessun dato degli studenti lascia il dispositivo.
  L'installazione («Installa» / «Aggiungi alla schermata Home») richiede HTTPS.

Aggiornamenti
  Ricostruisci con «node build.js» e ricarica i file: il service worker cambia nome di cache
  a ogni versione e sostituisce la vecchia copia offline al primo accesso.
`);
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + ' KB';
console.log(`Verto ${version}`);
console.log('  dist/verto.html       ' + kb(path.join(DIST, 'verto.html')));
console.log('  dist/sito/index.html  ' + kb(path.join(SITE, 'index.html')));
if (!hasIcons) console.log('  (icone non ancora generate: python tools/icons.py)');
