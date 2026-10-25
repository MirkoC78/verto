/* Verto — service worker: tutto in cache per l'uso senza rete. Versione 68c8585e08.
   Il sito può ospitare altre app (per esempio mirkoc78.github.io/hermeneus/): questo service worker vale solo per la sua
   cartella, usa cache con il nome dell'app e della cartella («verto@/verto/@versione») e all'attivazione cancella
   soltanto le proprie versioni vecchie, mai le cache delle altre app. */
const APP = 'verto';
const VERSION = '68c8585e08';
const SCOPE = new URL('./', self.location).pathname;
const PREFIX = APP + '@' + SCOPE + '@';
const CACHE = PREFIX + VERSION;
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/apple-touch-icon.png","./icons/favicon-32.png"];
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
