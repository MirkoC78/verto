/* VERTO — applicazione: percorso guidato a unità e lezioni, palestra, teoria, lessico, profilo.
   Tutto resta sul dispositivo: nessun account, nessuna IA, nessun dato inviato (il Wikizionario è un collegamento facoltativo). */
(function () {
'use strict';
const E = window.VertoEngine, SN = window.VertoSentence, LS = window.VertoLessons, C = window.VERTO_COURSE, RD = window.VertoRead, SV = window.VertoSave;
const { TOPICS, GROUPS, METHOD, SENTENTIAE, RANKS } = window.VERTO_TOPICS;
const TOPIC = Object.fromEntries(TOPICS.map((t, i) => [t.id, Object.assign({}, t, { n: i })]));
const UNITS = C.UNITS;
const FLAT = LS.FLAT;
const ORDER = LS.ORDER;
const SITE = !!window.VERTO_SITE;
const G = window.VERTO_GUIDE;

/* ---------- Utilità ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = (a) => [...new Set(a)];
const ent = (uid) => E.BY_UID.get(uid) || null;
function dayKey(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function addDays(k, n) { const [y, m, d] = k.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n)); }
function daysBetween(a, b) { const [y1, m1, d1] = a.split('-').map(Number); const [y2, m2, d2] = b.split('-').map(Number); return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 864e5); }
const ROMAN = (n) => { const r = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]]; let s = ''; for (const [k, v] of r) while (n >= v) { s += k; n -= v; } return s; };
function normIt(s) {
  return String(s).toLowerCase().replace(/[’`´]/g, "'").normalize('NFD').replace(/[\u0300-\u036F]/g, '')
    .replace(/'/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i), cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}
const sim = (a, b) => (!a && !b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));
const simLoose = (a, b) => Math.max(sim(a, b), sim(a.split(' ').sort().join(' '), b.split(' ').sort().join(' ')) * 0.96);

/* ---------- Icone ---------- */
const svg = (d, o = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${o}>${d}</svg>`;
const I = {
  via: svg('<path d="M8 3 5 21M16 3l3 18"/><path d="M12 4v2.4M12 10v3M12 16.6V20"/>'),
  gym: svg('<path d="M4 20h16M6 20v-9M10 20v-9M14 20v-9M18 20v-9M3 11l9-6 9 6z"/>'),
  books: svg('<path d="M5 4h4v16H5zM10 4h4v16h-4z"/><path d="m15.5 5 3.6-.9 2.4 15.5-3.6.9z"/>'),
  words: svg('<rect x="4" y="5" width="12" height="15" rx="2"/><path d="M8 3h11a1 1 0 0 1 1 1v14"/><path d="M7.5 10h5M7.5 13.5h5"/>'),
  me: svg('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1-3.7 3.7-5.6 7-5.6s6 1.9 7 5.6"/>'),
  flame: svg('<path d="M12.5 3c.4 2.8-1.1 4.4-2.5 6S7 12 7 14.8C7 18.2 9.3 21 12.3 21c3.3 0 5.7-2.6 5.7-6.1 0-2.5-1.3-4.4-2.6-5.6.1 1.6-.5 2.9-1.6 3.5.4-3.4-.4-6.6-1.3-8.8Z" fill="currentColor" stroke="none"/>'),
  bolt: svg('<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>'),
  star: svg('<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" fill="currentColor" stroke="none"/>'),
  lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  book: svg('<path d="M4 5.5C7 4.5 10 4.5 12 6.5c2-2 5-2 8-1V19c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6.5V20"/>'),
  laurel: svg('<path d="M12 21v-6M8 21h8"/><path d="M12 15c-4 0-6.5-3-6.5-7M12 15c4 0 6.5-3 6.5-7"/><path d="M5.5 8c1.5.2 2.6 1 3 2.4M18.5 8c-1.5.2-2.6 1-3 2.4M6.5 4.5c1.2.6 1.8 1.6 1.8 3M17.5 4.5c-1.2.6-1.8 1.6-1.8 3"/>'),
  trophy: svg('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4v3h-4z"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.4"'),
  back: svg('<path d="M15 6 9 12l6 6"/>'),
  chev: svg('<path d="m9 6 6 6-6 6"/>', 'class="chev"'),
  translate: svg('<path d="M4 6h8M8 4v2c0 4-1.8 6.6-4.5 8"/><path d="M5.8 9.5c1 2.2 2.7 3.6 5 4.2"/><path d="m13 20 4-9 4 9M14.5 17h5"/>'),
  pen: svg('<path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18z"/><path d="M14 6.5l3 3"/>'),
  lens: svg('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5"/>'),
  table: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/>'),
  cards: svg('<rect x="6" y="3.5" width="13" height="16" rx="2" transform="rotate(8 12 12)"/><rect x="4" y="5" width="13" height="16" rx="2"/>'),
  retry: svg('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>'),
  spark: svg('<path d="M12 3c.5 4.6 2.4 6.9 7 7.5-4.6.6-6.5 2.9-7 7.5-.5-4.6-2.4-6.9-7-7.5 4.6-.6 6.5-2.9 7-7.5Z"/>'),
  sound: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  keys: svg('<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10"/>'),
  tiles: svg('<rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/>'),
  bulb: svg('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>'),
  method: svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>'),
  link: svg('<path d="M9 7H6a3 3 0 0 0 0 6h3M15 7h3a3 3 0 0 1 0 6h-3M8 10h8"/>'),
  globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5Z"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  match: svg('<path d="M4 7h6M4 12h6M4 17h6M14 7h6M14 12h6M14 17h6"/>'),
  ear: svg('<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.6"/><path d="M10 9a2 2 0 0 1 4 0c0 1.5-1.5 2-1.5 3"/>'),
  accent: svg('<path d="M13 3 10 8"/><path d="M5 20c2-6 4-9 7-9s5 3 7 9"/>'),
  download: svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
};
const MARK = '<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M18.2 5 29 16 18.2 27 7.4 16z" fill="var(--g-ver)"/><path d="M13.8 5 24.6 16 13.8 27 3 16z" fill="var(--pri)"/></svg>';

/* ---------- La guida ---------- */
const guide = (mood = 'idle', size = 96) => G.svg(mood, size);
const say = (text, mood = 'happy', size = 72) => `<div class="say">${guide(mood, size)}<div class="bubble">${text}</div></div>`;

/* ---------- Stato ---------- */
const KEY = 'verto.v2';
const DEFAULT = () => ({
  v: 2, onboarded: false, name: '', goal: 50, xp: 0, days: {}, streak: 0, lastDay: null, shields: 0,
  topics: [], mastery: {}, mistakes: [], badges: {}, vocab: {}, recent: [], genSaved: [], backupAt: 0, savedAt: 0, nudgedAt: 0,
  course: { unlocked: 0, stars: {}, times: {} },
  prac: { unit: null, type: 'misto', wide: false, level: 'media' },
  stats: { answered: 0, correct: 0, sessions: 0, perfect: 0, forms: 0, typedOK: 0, translated: 0, genSeen: 0, types: {}, clearedReview: 0, lessons: 0 },
  settings: { sound: true, voice: true, input: 'tiles', quant: false, theme: 'auto', gen: true, online: true },
});
let S = DEFAULT();
function merge(d) {
  const def = DEFAULT();
  return Object.assign(def, d, { stats: Object.assign(def.stats, d.stats || {}), settings: Object.assign(def.settings, d.settings || {}), course: Object.assign(def.course, d.course || {}), prac: Object.assign(def.prac, d.prac || {}) });
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { S = merge(JSON.parse(raw)); syncTopics(); return; }
    // da Verto 1: punti, serie, insegne e nome restano; gli argomenti scelti diventano unità aperte del percorso
    const old = localStorage.getItem('verto.v1');
    if (old) {
      const d = JSON.parse(old);
      S = merge({ name: d.name || '', xp: d.xp || 0, days: d.days || {}, streak: d.streak || 0, lastDay: d.lastDay || null, shields: Math.min(2, d.freezes || 0), onboarded: !!d.onboarded });
      const last = ORDER.filter((t) => (d.topics || []).includes(t)).pop() || null;
      placeAt(last);
    }
  } catch (e) { /* archiviazione non disponibile */ }
}
let saveFailed = false, NOSAVE = false;
function save() { if (NOSAVE) { S.savedAt = Date.now(); return; } try { S.savedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); saveFailed = false; } catch (e) { saveFailed = true; } }
function applyTheme() {
  const r = document.documentElement;
  if (S.settings.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.settings.theme);
  const m = $('meta[name="theme-color"]');
  if (m) m.content = getComputedStyle(r).getPropertyValue('--bg').trim() || '#F1F3F5';
}

/* ---------- Percorso: sblocchi ---------- */
const unitIdx = (id) => UNITS.findIndex((u) => u.id === id);
const firstLessonIdx = (ui) => FLAT.findIndex((f) => f.ui === ui);
const lastLessonIdx = (ui) => FLAT.map((f) => f.ui).lastIndexOf(ui);
// colloca lo studente: le unità fino a quella indicata sono aperte, si riparte dalla successiva
function placeAt(unitId) {
  const ui = unitId ? unitIdx(unitId) : -1;
  S.course.unlocked = ui < 0 ? 0 : Math.min(FLAT.length - 1, lastLessonIdx(ui) + 1);
  syncTopics();
}
function syncTopics() { const lastUi = FLAT[Math.min(S.course.unlocked, FLAT.length - 1)].ui; S.topics = UNITS.slice(0, lastUi + 1).map((u) => u.id); }
const isUnlocked = (idx) => idx <= S.course.unlocked;
const currentIdx = () => Math.min(S.course.unlocked, FLAT.length - 1);
const sel = () => new Set(S.topics);

/* ---------- Frasi ---------- */
const BANK = window.VERTO_BANK.map((b, i) => {
  const tags = b[2].split(/\s+/);
  return { id: 'b' + i, la: b[0], it: b[1].split('|'), tags, focus: tags.slice().sort((a, c) => ORDER.indexOf(c) - ORDER.indexOf(a))[0], tip: b[3] || '', hints: b[4] || '', src: 'bank', _tok: null };
});
// le analisi delle frasi della banca si calcolano quando servono
BANK.forEach((s) => Object.defineProperty(s, 'tokens', { get() { if (!s._tok) s._tok = SN.resolveBank(s.la, s.tags, s.hints); return s._tok; }, enumerable: true }));
LS.init({ bank: BANK });
function sentById(id) {
  if (id && id[0] === 'b') return BANK[+id.slice(1)] || null;
  return (S.genSaved || []).find((x) => x.id === id) || null;
}
const laShow = (s) => SN.render(s.la, s.tokens, S.settings.quant);
const qOf = (f) => (S.settings.quant && f && f.q ? f.q : f ? f.f : '');
const headOf = (e) => (S.settings.quant ? e.headQ : e.head);
const lemmaOf = (e) => (S.settings.quant ? e.lemmaQ : e.lemma);
const shortM = (m) => String(m).split(/[,;(]/)[0].trim();

/* ---------- Progressi ---------- */
const todayXP = () => S.days[dayKey()] || 0;
function effectiveStreak() {
  if (!S.lastDay) return 0;
  const gap = daysBetween(S.lastDay, dayKey());
  if (gap <= 1) return S.streak;
  return gap - 1 <= S.shields ? S.streak : 0;
}
function touchStreak() {
  const today = dayKey();
  if (S.lastDay === today) return false;
  const gap = S.lastDay ? daysBetween(S.lastDay, today) : 99;
  if (gap === 1) S.streak++;
  else if (gap > 1 && gap - 1 <= S.shields) { S.shields -= gap - 1; S.streak++; toastLater(`Uno scudo ha protetto la tua serie (${gap - 1} ${gap - 1 === 1 ? 'giorno saltato' : 'giorni saltati'}).`); }
  else S.streak = 1;
  S.lastDay = today;
  if (S.streak > 0 && S.streak % 7 === 0 && S.shields < 2) { S.shields++; toastLater('Nuovo scudo: protegge la serie se salti un giorno.'); }
  return true;
}
function addXP(n) { const before = rankOf(S.xp).i; S.xp += n; const k = dayKey(); S.days[k] = (S.days[k] || 0) + n; return rankOf(S.xp).i > before; }
function rankOf(xp) { let i = 0; RANKS.forEach((r, k) => { if (xp >= r.xp) i = k; }); return { i, r: RANKS[i], next: RANKS[i + 1] || null }; }
function recordMastery(t, ok) {
  if (!t) return;
  const m = S.mastery[t] || { a: 0, c: 0 };
  m.a++; if (ok) m.c++;
  if (m.a > 40) { m.a = Math.round(m.a * 0.8); m.c = Math.round(m.c * 0.8); }
  S.mastery[t] = m;
}
const doneUnits = () => UNITS.filter((u, ui) => (S.course.stars[FLAT[lastLessonIdx(ui)].lesson.id] || 0) > 0).length;
const BADGES = [
  { id: 'primus', name: 'Primus gradus', desc: 'Completa la prima lezione.', test: () => S.stats.lessons >= 1 },
  { id: 'lector', name: 'Lector', desc: 'Supera la prova di «Alfabeto e pronuncia».', test: () => (S.course.stars.alf5 || 0) > 0 },
  { id: 'statio', name: 'Prima statio', desc: 'Supera la prova di un’unità del programma.', test: () => doneUnits() - ((S.course.stars.alf5 || 0) > 0 ? 1 : 0) >= 1 },
  { id: 'medium', name: 'Medium iter', desc: 'Supera le prove di 12 unità.', test: () => doneUnits() >= 12 },
  { id: 'finis', name: 'Finis coronat opus', desc: 'Completa tutto il percorso.', test: () => doneUnits() >= UNITS.length },
  { id: 'septem', name: 'Septem dies', desc: 'Una serie di 7 giorni.', test: () => S.streak >= 7 },
  { id: 'mensis', name: 'Mensis', desc: 'Una serie di 30 giorni.', test: () => S.streak >= 30 },
  { id: 'perfecta', name: 'Sine errore', desc: 'Una lezione senza errori.', test: () => S.stats.perfect >= 1 },
  { id: 'centuria', name: 'Centuria', desc: '100 risposte corrette.', test: () => S.stats.correct >= 100 },
  { id: 'legio', name: 'Legio', desc: '500 risposte corrette.', test: () => S.stats.correct >= 500 },
  { id: 'interpres', name: 'Interpres', desc: '100 frasi tradotte bene.', test: () => S.stats.translated >= 100 },
  { id: 'grammaticus', name: 'Grammaticus', desc: '50 forme analizzate o scritte bene.', test: () => S.stats.forms >= 50 },
  { id: 'orator', name: 'Orator', desc: '10 traduzioni scritte a tastiera e giuste.', test: () => S.stats.typedOK >= 10 },
  { id: 'lexicographus', name: 'Lexicographus', desc: '50 parole imparate nel lessico.', test: () => Object.values(S.vocab).filter((v) => v.box >= 3).length >= 50 },
  { id: 'novae', name: 'Res novae', desc: 'Traduci 10 frasi create sul momento.', test: () => S.stats.genSeen >= 10 },
  { id: 'emendator', name: 'Emendator', desc: 'Svuota il ripasso degli errori.', test: () => S.stats.clearedReview >= 1 },
  { id: 'lucubratio', name: 'Lucubratio', desc: 'Studia dopo le 22, alla luce della lucerna.', test: () => false },
  { id: 'aurora', name: 'Aurora', desc: 'Studia prima delle 8.', test: () => false },
  { id: 'consul', name: 'Consul', desc: 'Raggiungi il grado di console.', test: () => S.xp >= (RANKS.find((r) => r.name === 'Consul') || { xp: 3000 }).xp },
];
function checkBadges(extra = {}) {
  const won = [];
  for (const b of BADGES) if (!S.badges[b.id] && (b.test() || extra[b.id])) { S.badges[b.id] = dayKey(); won.push(b); }
  return won;
}

/* ---------- Suoni, vibrazione, voce, avvisi ---------- */
let actx = null;
function tone(freqs, dur = 0.12, type = 'sine', gain = 0.05) {
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    let t = actx.currentTime;
    for (const f of freqs) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = gain;
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur); t += dur * 0.8;
    }
  } catch (e) { /* audio non disponibile */ }
}
const sfx = { ok: () => tone([660, 880]), err: () => tone([220, 180], 0.16, 'triangle'), done: () => tone([523, 659, 784, 1046], 0.14), tap: () => tone([440], 0.04, 'sine', 0.02), match: () => tone([740], 0.07) };
// la vibrazione è permessa solo durante un tocco reale (e non dentro i riquadri incorporati)
function buzz(p) { try { if (navigator.vibrate && window.top === window && (!navigator.userActivation || navigator.userActivation.isActive)) navigator.vibrate(p); } catch (e) { /* ignora */ } }
let itVoice = null;
function pickVoice() { try { const vs = speechSynthesis.getVoices(); itVoice = vs.find((v) => /^it(-|_)IT/i.test(v.lang)) || vs.find((v) => /^it/i.test(v.lang)) || null; } catch (e) { itVoice = null; } }
// lettura ad alta voce: ogni parola trascritta nella pronuncia scolastica, con l'accento segnato, letta dalla voce italiana
function speak(latin) {
  if (!S.settings.voice || !('speechSynthesis' in window)) { toast('La lettura ad alta voce non è disponibile su questo dispositivo.'); return; }
  try {
    speechSynthesis.cancel();
    const text = String(latin).replace(/_/g, ' ').replace(/[A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]+/g, (w) => { const an = E.analyze(w)[0]; return RD.readIt(an && an.q ? (/^[A-Z]/.test(w) ? an.q.charAt(0).toUpperCase() + an.q.slice(1) : an.q) : w); });
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT'; u.rate = 0.85;
    if (!itVoice) pickVoice();
    if (itVoice) u.voice = itVoice;
    speechSynthesis.speak(u);
  } catch (e) { toast('La lettura ad alta voce non è disponibile.'); }
}
let toastTimer = null;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3400);
}
const pendingToasts = [];
const toastLater = (m) => pendingToasts.push(m);
function flushToasts() { if (pendingToasts.length) { toast(pendingToasts.shift()); if (pendingToasts.length) setTimeout(flushToasts, 3600); } }
// coriandoli a tessere di mosaico, nei colori delle famiglie di argomenti
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 4000);
  const dpr = window.devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--g-alf', '--g-nom', '--g-ver', '--g-pro', '--g-sin', '--star'].map((v) => cs.getPropertyValue(v).trim());
  const P = Array.from({ length: 90 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 160, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 10 - 3, s: Math.random() * 5 + 5, c: pick(cols), a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3 }));
  let f = 0;
  (function step() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) { p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); ctx.restore(); }
    if (++f < 120) requestAnimationFrame(step); else c.remove();
  })();
}

/* ---------- Esercizi: sessione (lezione o palestra) ---------- */
// punti per risposta giusta: una lezione completa vale circa 100 XP, così gli obiettivi giornalieri (30–120) corrispondono a mezza lezione, una o poco più
const XP_BASE = { la_it: 7, it_la: 8, analizza: 5, scrivi: 6, completa: 5, lessico: 4, abbina: 6, accorda: 5, lettura: 3, suono: 3, accento: 3, sillabe: 3, quantita: 3, teach: 0 };
const KIND = {
  la_it: 'Traduci in italiano', it_la: 'Traduci in latino', analizza: 'Che forma è?', scrivi: 'Scrivi la forma', completa: 'Completa la frase', lessico: 'Lessico',
  abbina: 'Abbina le coppie', accorda: 'Concorda l’aggettivo', lettura: 'Come si legge?', suono: 'Come suona?', accento: 'Dove cade l’accento?', sillabe: 'Dividi in sillabe', quantita: 'Lunga o breve?',
};
const CHOICE = ['analizza', 'completa', 'lessico', 'accorda', 'lettura', 'suono', 'accento', 'sillabe', 'quantita'];
const focusOfReq = (req) => req.slice().sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0];
let SES = null;
// difficoltà delle frasi in palestra: lunghezza, tessere intruse, risposta scritta
const LEVELS = {
  facile: { label: 'Facile', desc: 'Frasi brevi, fino a 4 parole, con una sola tessera in più.', maxWords: 4, simple: true, extra: 1 },
  media: { label: 'Media', desc: 'Frasi da 3 a 6 parole, con tre tessere in più per confonderti.', minWords: 3, maxWords: 6, extra: 3 },
  difficile: { label: 'Difficile', desc: 'Frasi da 5 parole in su, con cinque tessere in più.', minWords: 5, extra: 5 },
  esperto: { label: 'Esperto', desc: 'Frasi lunghe da scrivere da te, senza tessere.', minWords: 7, typed: true },
};
const levelOf = () => (SES && SES.kind === 'practice' && LEVELS[SES.level]) || null;
const MIXES = {
  misto: ['frase', 'analizza', 'frase', 'abbina', 'frase', 'scrivi', 'frase', 'completa', 'frase', 'accorda'],
  frasi: Array(10).fill('frase'),
  forme: ['analizza', 'scrivi', 'accorda', 'analizza', 'scrivi', 'completa', 'analizza', 'scrivi', 'accorda', 'analizza'],
  parole: ['abbina', 'lessico', 'abbina', 'lessico', 'abbina', 'lessico', 'lessico', 'abbina'],
  la_it: Array(10).fill('la_it'), it_la: Array(10).fill('it_la'),
  nuove: ['la_it', 'it_la', 'la_it', 'completa', 'it_la', 'la_it', 'it_la', 'la_it'],
  pronuncia: ['lettura', 'accento', 'suono', 'sillabe', 'lettura', 'quantita', 'accento', 'lettura'],
};
function scopeForPractice(T, focus) { return { formOK: LS.makeFormOK(T, focus, null), T }; }
function startLesson(idx, o = {}) {
  const f = FLAT[idx];
  if (!f) return;
  const teach = o.teach ?? !S.course.times[f.lesson.id];
  let items = LS.buildLesson(f.lesson.id, { teach, avoid: S.recent.slice(-20) });
  // all'inizio di un'unità nuova la guida la presenta
  if (teach && f.li === 0 && f.unit.say) items = [{ type: 'teach', card: { say: f.unit.say, intro: true }, topic: f.unit.id }].concat(items);
  const sc = LS.scopeOf(f.lesson.id);
  begin({ kind: 'lesson', idx, items, title: f.lesson.title, test: !!f.lesson.test, scope: { formOK: sc.formOK, T: sc.T } });
}
function startPractice(mode) {
  const T = sel();
  if (!T.size) return;
  let items;
  const p = S.prac;
  const latest = S.topics[S.topics.length - 1];
  const unit = mode === 'pronuncia' ? 'alf' : ['la_it', 'it_la', 'nuove'].includes(mode) ? latest : p.unit && T.has(p.unit) ? p.unit : latest;
  if (mode === 'review') items = buildReview();
  else items = LS.buildPractice({ T, focus: unit, mix: MIXES[mode] || MIXES[p.type] || MIXES.misto, wide: p.wide, genShare: mode === 'nuove' ? 1 : 0.5, gen: S.settings.gen, avoid: S.recent, level: mode === 'pronuncia' ? null : LEVELS[p.level] });
  if (!items.length) { toast(mode === 'review' ? 'Nessun errore da ripassare: ottimo!' : 'Non ci sono ancora esercizi per questa scelta.'); return; }
  begin({ kind: 'practice', mode, items, title: 'Palestra', level: mode === 'review' || mode === 'pronuncia' ? null : p.level, scope: scopeForPractice(T, unit) });
}
function buildReview() {
  const T = sel();
  const sc = scopeForPractice(T, S.topics[S.topics.length - 1]);
  const items = [];
  for (const m of S.mistakes.slice(-12)) {
    let it = null;
    if (m.k === 's') { const s = sentById(m.id); if (s) it = { type: m.dir, s, topic: s.focus }; }
    else if (m.k === 'f') {
      const e = ent(m.uid), f = e && e.forms.find((x) => x.key === m.key);
      if (e && f && sc.formOK(e, f.key)) {
        if (m.t === 'scrivi') it = { type: 'scrivi', uid: e.uid, desc: f.d, answers: uniq(e.forms.filter((x) => x.key === f.key).map((x) => x.f)), qs: uniq(e.forms.filter((x) => x.key === f.key).map((x) => x.q)), topic: focusOfReq(f.req), key: f.key };
        else {
          const inScope = e.forms.filter((x) => sc.formOK(e, x.key) && x.c !== 'voc');
          const valid = uniq(inScope.filter((x) => x.f === f.f).map((x) => x.d));
          const dis = shuffle(uniq(inScope.map((x) => x.d).filter((d) => !valid.includes(d)))).slice(0, 3);
          if (dis.length) it = { type: 'analizza', uid: e.uid, form: f.f, q: f.q, correct: f.d, valid, options: shuffle([f.d, ...dis]), topic: focusOfReq(f.req), key: f.key };
        }
      }
    } else if (m.k === 'l') {
      const e = ent(m.uid);
      const pool = e ? E.LEX.filter((x) => x.k === e.k && x !== e && shortM(x.it) !== shortM(e.it) && T.has(x.t) && !x.prop) : [];
      if (e && pool.length >= 3) it = { type: 'lessico', uid: e.uid, options: shuffle([e.uid, ...shuffle(pool).slice(0, 3).map((x) => x.uid)]), topic: e.t };
    }
    if (it) { it.review = m; items.push(it); }
  }
  return shuffle(items);
}
function begin(o) {
  SES = Object.assign({ backY: window.scrollY, i: 0, combo: 0, best: 0, xp: 0, ok: 0, ko: 0, start: Date.now(), cur: null, done: false, requeued: 0, shownTheory: {} }, o);
  openOverlay();
  renderItem();
}
function openOverlay() {
  closeOverlay();
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', SES.title || 'Lezione');
  ov.innerHTML = `<div class="ov-head"><button class="iconbtn" data-act="quit" aria-label="Chiudi la lezione">${I.close}</button><progress class="bar" id="ovProg" max="100" value="0" aria-label="Avanzamento della lezione"></progress><div class="combo" id="combo" aria-live="polite"></div></div><div class="ov-inner"><div class="ov-body" id="ovBody"></div></div><div class="ov-foot" id="ovFootWrap"><div class="foot-in" id="ovFoot"></div></div>`;
  document.body.appendChild(ov);
  document.documentElement.classList.add('ov-open');
}
function closeOverlay() { const o = $('#ov'); if (o) o.remove(); document.documentElement.classList.remove('ov-open'); closePop(); }
function setProgress() { const b = $('#ovProg'); if (b) b.value = Math.max(3, Math.round(Math.min(1, SES.i / SES.items.length) * 100)); }
function setCombo() { const c = $('#combo'); if (c) c.innerHTML = SES.combo >= 2 ? I.flame + '<span>' + SES.combo + '</span><span class="sr"> risposte giuste di fila</span>' : ''; }

function renderItem() {
  closePop();
  const it = SES.items[SES.i];
  if (!it) return finishSession();
  setProgress(); setCombo();
  SES.cur = { it, answered: false, chosen: [], picked: null, inputMode: S.settings.input === 'keys' || (levelOf() && levelOf().typed) ? 'keys' : 'tiles' };
  const tags = [it.quiz && 'Verifica veloce', it.review && 'Ripasso', it.requeued && 'Riproviamo', it.s && it.s.src === 'gen' && 'Frase nuova'].filter(Boolean);
  SES.cur.tagsHtml = tags.length ? `<div class="ex-tags">${tags.map((t) => `<span class="tag pri">${t}</span>`).join('')}</div>` : '';
  const R = { teach: renderTeach, la_it: renderLaIt, it_la: renderItLa, analizza: renderAnalizza, scrivi: renderScrivi, completa: renderCompleta, lessico: renderLessico, abbina: renderAbbina, accorda: renderAccorda, lettura: renderLettura, suono: renderSuono, accento: renderAccento, sillabe: renderSillabe, quantita: renderQuantita };
  const body = $('#ovBody');
  body.innerHTML = (R[it.type] || (() => ''))(it);
  body.classList.remove('fx-in'); void body.offsetWidth; body.classList.add('fx-in');
  // due opzioni per riga solo se ci stanno tutte: con una forma lunga si va in colonna
  const two = $('.opts.two', body);
  if (two && [...two.children].some((b) => b.offsetWidth > two.clientWidth / 2)) two.classList.remove('two');
  $('#ovFootWrap').className = 'ov-foot';
  renderFoot();
  if (it.type === 'la_it' || it.type === 'it_la') refreshAnswer();
  const t = $('#typed'); if (t && !matchMedia('(pointer: coarse)').matches) t.focus({ preventScroll: true });
  $('.ov-inner').scrollTop = 0;
}
const exHead = (title, lemma) => `<div class="ex-head">${SES.cur.tagsHtml || ''}<h2 class="prompt">${title}${lemma ? `<span class="lemma" lang="la">${esc(lemma)}</span>` : ''}</h2></div>`;
function renderFoot() {
  const it = SES.cur.it;
  if (it.type === 'teach') { $('#ovFoot').innerHTML = `<button class="btn big block" data-act="next" id="nextBtn">Continua</button>`; setTimeout(() => { const n = $('#nextBtn'); if (n) n.focus({ preventScroll: true }); }, 60); return; }
  if (it.type === 'abbina') { $('#ovFoot').innerHTML = `<p class="foot-hint">Tocca una parola latina, poi il suo significato.</p>`; return; }
  $('#ovFoot').innerHTML = `<button class="btn big block" data-act="check" id="checkBtn" ${CHOICE.includes(it.type) ? 'disabled' : ''}>Controlla</button>`;
}
/* ---------- Rese degli esercizi ---------- */
const laSpans = (h) => (S.settings.quant ? h : h.replace(/<span class="la">(.*?)<\/span>/g, (m, x) => `<span class="la">${E.plain(x)}</span>`)).replace(/<span class="la">/g, '<span class="la" lang="la">');
function renderTeach(it) {
  const c = it.card;
  const f = SES.kind === 'lesson' ? FLAT[SES.idx] : null;
  let h = '<div class="teach">';
  if (c.intro && f) h += `<div class="ex-head"><p class="note">Unità ${ROMAN(f.ui + 1)}</p><h1>${esc(f.unit.title)}</h1></div>`;
  const table = cardTable(c);
  // una scheda fatta solo di parole della guida occupa la scena: lei grande, il fumetto sotto
  const solo = c.say && !c.p && !c.ex && !table;
  if (solo) h += `<div class="teach-hero">${guide(c.intro ? 'cheer' : 'happy', c.intro ? 160 : 136)}<div class="bubble big">${esc(c.say)}</div></div>`;
  else if (c.say) h += say(esc(c.say), 'happy', 72);
  if (c.p) h += `<div class="card lesson-text">${laSpans(c.p)}</div>`;
  h += table;
  if (c.ex) {
    const toks = SN.resolveBank(c.ex[0], [...(SES.scope ? SES.scope.T : sel())], c.ex[2]);
    h += `<div class="exline"><span class="la" lang="la">${esc(SN.render(c.ex[0], toks, S.settings.quant))}</span><span class="muted">${esc(c.ex[1])}</span><div><button class="tool" data-act="speakText" data-w="${esc(c.ex[0])}">${I.sound}Ascolta</button></div></div>`;
  }
  return h + '</div>';
}
// riga latina con le parole toccabili; la parola nuova è evidenziata
function latinLine(s, o = {}) {
  const toks = s.tokens || [];
  const fresh = new Set(o.newWords || []);
  const shown = laShow(s);
  let k = 0;
  const html = esc(shown).replace(/[A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]+/g, (w) => {
    const i = k++;
    const t = toks[i];
    if (o.blank === i) return `<span class="blank" id="blank" aria-label="spazio vuoto">…</span>`;
    const e = t && ent(t.uid);
    const verb = t && /^v:(ind|cong|imp):/.test(t.key);
    const nw = t && fresh.has(t.uid);
    return `<button class="w${verb ? ' vb' : ''}${nw ? ' new' : ''}" data-act="word" data-i="${i}" lang="la"${nw ? ` aria-label="parola nuova: ${w}"` : ''}>${w}</button>`;
    void e;
  });
  return `<p class="latin-line" lang="la">${html}</p>${fresh.size ? '<p class="note"><span class="tag new">Nuova</span> Tocca la parola evidenziata per scoprire che cosa significa.</p>' : ''}`;
}
const toolBtn = (act, icon, label, extra = '') => `<button class="iconbtn outline" data-act="${act}" aria-label="${label}" title="${label}" ${extra}>${icon}</button>`;
function inputToggle() { const tiles = SES.cur.inputMode === 'tiles'; return toolBtn('toggleInput', tiles ? I.keys : I.tiles, tiles ? 'Rispondi scrivendo' : 'Rispondi con le tessere'); }
function toolsRow(extra) { return `<div class="ex-tools">${extra}${toolBtn('hint', I.bulb, 'Aiuto')}${levelOf() && levelOf().typed ? '' : inputToggle()}</div><div id="aux"></div>`; }
function renderLaIt(it) {
  return `${exHead('Traduci in italiano')}${latinLine(it.s, { newWords: it.newWords })}
    ${toolsRow(toolBtn('speak', I.sound, 'Ascolta la frase') + toolBtn('method', I.method, 'Evidenzia i verbi', 'aria-pressed="false"'))}
    <div id="ansWrap" class="stack-lg">${answerArea(it)}</div>`;
}
function renderItLa(it) {
  const nw = (it.newWords || []).length ? `<p class="note"><span class="tag new">Nuova</span> Ti servirà una parola nuova: ${it.newWords.map((u) => { const e = ent(u); return e ? `<span class="la" lang="la">${esc(headOf(e))}</span> = ${esc(shortM(e.it))}` : esc(u); }).join(', ')}.</p>` : '';
  return `${exHead('Traduci in latino')}${say(`<span class="it-line">${esc(it.s.it[0])}</span>`, 'idle', 64)}${nw}
    ${toolsRow('')}
    <div id="ansWrap" class="stack-lg">${answerArea(it)}</div>`;
}
function answerArea(it) {
  const c = SES.cur;
  const latin = it.type === 'it_la';
  if (c.inputMode === 'keys') {
    return `<label class="sr" for="typed">La tua traduzione</label><textarea id="typed" class="typed${latin ? ' la' : ''}" rows="2" lang="${latin ? 'la' : 'it'}" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="${latin ? 'Scrivi in latino…' : 'Scrivi la traduzione…'}"></textarea>${latin && S.settings.quant ? macronKeys() : ''}`;
  }
  if (!c.tiles) c.tiles = latin ? latinTiles(it.s) : italianTiles(it.s);
  return `<div class="answer" id="answer" aria-label="La tua risposta"></div><div class="bank" id="bank">${c.tiles.map((t, k) => `<button class="tile${latin ? ' la' : ''}" data-act="tile" data-k="${k}" ${latin ? 'lang="la"' : ''}>${esc(t.label)}</button>`).join('')}</div>`;
}
const macronKeys = () => `<div class="ex-tools" role="group" aria-label="Vocali lunghe">${['ā', 'ē', 'ī', 'ō', 'ū'].map((v) => `<button type="button" class="tool" data-act="macron" data-v="${v}" aria-label="${v}, vocale lunga">${v}</button>`).join('')}</div>`;
// tessere latine: le tessere della frase (preposizione e nome restano insieme) e altre forme delle stesse parole
function latinTiles(s) {
  const toks = s.tokens || [];
  const tl = SN.tiles(s.la);
  const shownWord = (t) => (S.settings.quant ? t.q : t.w);
  const tiles = tl.map((tile, ti) => {
    const ws = toks.filter((t) => t.tile === ti);
    const label = ws.length ? ws.map(shownWord).join(' ') : tile.replace(/_/g, ' ');
    return { label: ti === 0 && !/^[A-ZĀĒĪŌŪ]/.test(label.slice(1)) && !(ws[0] && ent(ws[0].uid) && ent(ws[0].uid).prop) ? label.charAt(0).toLowerCase() + label.slice(1) : label, key: tile };
  });
  const have = new Set(tiles.map((t) => E.norm(t.label)));
  const formOK = SES.scope ? SES.scope.formOK : () => true;
  const n = levelOf() ? levelOf().extra ?? 3 : 3;
  const dis = [];
  for (const t of shuffle(toks).concat(shuffle(toks))) {
    if (dis.length >= n) break;
    const e = ent(t.uid);
    if (!e || !['n', 'v', 'a', 'p'].includes(e.k)) continue;
    const alts = shuffle(e.forms.filter((f) => f.key !== t.key && E.norm(f.f) !== E.norm(t.w) && formOK(e, f.key) && f.c !== 'voc' && !f.f.includes(' ')));
    for (const a of alts) {
      const ws = toks.filter((x) => x.tile === t.tile);
      const label = ws.map((x) => (x === t ? (S.settings.quant ? a.q : a.f) : shownWord(x))).join(' ');
      const lab = label.charAt(0).toLowerCase() === label.charAt(0) || (ent(ws[0].uid) && ent(ws[0].uid).prop) ? label : label.charAt(0).toLowerCase() + label.slice(1);
      if (have.has(E.norm(lab))) continue;
      have.add(E.norm(lab)); dis.push({ label: lab, distractor: true }); break;
    }
  }
  return shuffle(tiles.concat(dis));
}
const IT_FUNC = ['il', 'la', 'i', 'le', 'gli', 'di', 'a', 'da', 'in', 'con', 'che', 'non', 'un', 'una', 'del', 'della', 'al', 'alla', 'nel', 'nella', 'e', 'ma'];
function italianTiles(s) {
  const words = s.it[0].replace(/[.,;:!?«»"]/g, ' ').split(/\s+/).filter(Boolean);
  const tiles = words.map((w, i) => ({ label: i === 0 ? (w === w.toUpperCase() || /^[A-Z][a-zà-ù]+$/.test(w) && properIt(w) ? w : w.charAt(0).toLowerCase() + w.slice(1)) : w }));
  const have = new Set(tiles.map((t) => t.label.toLowerCase()));
  const extra = [];
  const pool = shuffle(BANK.filter((b) => b !== s)).slice(0, 60).flatMap((b) => b.it[0].replace(/[.,;:!?«»"]/g, ' ').split(/\s+/)).filter((w) => w.length > 3 && !have.has(w.toLowerCase()) && !/^[A-Z]/.test(w));
  const n = levelOf() ? levelOf().extra ?? 3 : 3;
  for (const w of shuffle(IT_FUNC)) { if (extra.length >= Math.min(1, n)) break; if (!have.has(w)) { extra.push(w); have.add(w); } }
  for (const w of pool) { if (extra.length >= n) break; if (!have.has(w.toLowerCase())) { extra.push(w.toLowerCase()); have.add(w.toLowerCase()); } }
  return shuffle(tiles.concat(extra.map((w) => ({ label: w, distractor: true }))));
}
let PROPER_IT = null;
const properIt = (w) => { if (!PROPER_IT) PROPER_IT = new Set(E.LEX.filter((e) => e.prop).flatMap((e) => e.it.split(/[,;]\s*/)).map((x) => x.trim().toLowerCase())); return PROPER_IT.has(w.toLowerCase()); };
function refreshAnswer() {
  const c = SES.cur;
  const btn = $('#checkBtn');
  if (c.inputMode !== 'tiles') { if (btn) btn.disabled = !(($('#typed') || {}).value || '').trim(); return; }
  const a = $('#answer'); if (!a) return;
  const latin = c.it.type === 'it_la';
  a.innerHTML = c.chosen.map((k, j) => `<button class="tile${latin ? ' la' : ''}" data-act="untile" data-j="${j}" ${latin ? 'lang="la"' : ''}>${esc(c.tiles[k].label)}</button>`).join('');
  $$('#bank .tile').forEach((b) => b.classList.toggle('used', c.chosen.includes(+b.dataset.k)));
  if (btn) btn.disabled = !c.chosen.length;
}
const optKey = (k) => `<span class="k" aria-hidden="true">${k + 1}</span>`;
function optsHtml(list, label = (x) => esc(x), latin = false, two = false) {
  return `<div class="opts${two ? ' two' : ''}">${list.map((o, k) => `<button class="opt${latin ? ' la' : ''}" data-act="pick" data-k="${k}" ${latin ? 'lang="la"' : ''}>${optKey(k)}<span>${label(o)}</span></button>`).join('')}</div>`;
}
const showForm = (f, q) => (S.settings.quant && q ? q : f);
function renderAnalizza(it) {
  const e = ent(it.uid);
  return `${exHead('Che forma è?', lemmaOf(e))}<p class="bigform" lang="la">${esc(showForm(it.form, it.q))}</p>
    <div class="centered-tools">${toolBtn('speakForm', I.sound, 'Ascolta la forma')}</div>${optsHtml(it.options)}`;
}
function renderScrivi(it) {
  const e = ent(it.uid);
  return `${exHead('Scrivi la forma')}<div class="card stack"><span class="la bigform" lang="la">${esc(lemmaOf(e))}</span><b>${esc(it.desc)}</b><span class="note">${esc(e.it)}</span></div>
    <label class="sr" for="typed">La forma in latino</label><input id="typed" class="typed la" lang="la" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Scrivi la forma…">${S.settings.quant ? macronKeys() : ''}`;
}
function renderCompleta(it) {
  return `${exHead('Completa la frase')}<div class="stack">${latinLine(it.s, { blank: it.idx, newWords: it.newWords })}<p class="muted">${esc(it.s.it[0])}</p></div>${optsHtml(it.options.map((o) => quantOf(it.s.tokens[it.idx].uid, o)), esc, true, true)}`;
}
// la forma con le quantità, se l'impostazione è attiva
function quantOf(uid, f) {
  if (!S.settings.quant) return f;
  const e = ent(uid);
  const x = e && e.forms.find((y) => E.norm(y.f) === E.norm(f));
  return x ? (/^[A-Z]/.test(f) ? x.q.charAt(0).toUpperCase() + x.q.slice(1) : x.q) : f;
}
function renderLessico(it) {
  const e = ent(it.uid);
  if (it.reverse) return `${exHead(`Come si dice in latino «${esc(shortM(e.it))}»?`)}${optsHtml(it.options, (u) => esc(headOf(ent(u))), true)}`;
  return `${exHead('Che cosa significa?')}<p class="bigform" lang="la">${esc(lemmaOf(e))}</p>${optsHtml(it.options, (u) => esc(ent(u).it))}`;
}
function renderAccorda(it) {
  const e = ent(it.uid), n = ent(it.noun.uid);
  return `${exHead('Concorda l’aggettivo con il nome')}<div class="stack"><p class="phrase" lang="la">${esc(showForm(it.noun.f, it.noun.q))} <span class="slot">?</span></p><p class="subline">${esc(it.noun.d)} di <span class="la" lang="la">${esc(headOf(n))}</span>; aggettivo: <span class="la" lang="la">${esc(lemmaOf(e))}</span> (${esc(shortM(e.it))})</p></div>${optsHtml(it.options.map((o) => quantOf(it.uid, o)), esc, true, true)}`;
}
function renderAbbina(it) {
  const c = SES.cur;
  c.left = shuffle(it.pairs.map((p, i) => i)); c.right = shuffle(it.pairs.map((p, i) => i)); c.matched = new Set(); c.mist = 0; c.selL = null; c.selR = null;
  return `${exHead('Abbina le coppie')}<div class="match"><div class="col">${c.left.map((i) => `<button class="la" lang="la" data-act="mL" data-i="${i}">${esc(S.settings.quant ? it.pairs[i].lq : it.pairs[i].la)}</button>`).join('')}</div><div class="col">${c.right.map((i) => `<button data-act="mR" data-i="${i}">${esc(it.pairs[i].it)}</button>`).join('')}</div></div>`;
}
const wordQ = (it) => (S.settings.quant || ['quantita', 'accento', 'sillabe'].includes(it.type) ? it.q : it.word);
function renderLettura(it) { return `${exHead('Come si legge?')}<p class="bigform" lang="la">${esc(wordQ(it))}</p><p class="subline">${esc(shortM(ent(it.uid).it))}</p>${optsHtml(it.options, esc, false, true)}`; }
function renderSuono(it) {
  const w = wordQ(it);
  const p = E.plain(w);
  const hi = esc(w.slice(0, it.at)) + `<span class="hi">${esc(w.slice(it.at, it.at + it.len))}</span>` + esc(w.slice(it.at + it.len));
  void p;
  return `${exHead(`Come si legge «${esc(it.group)}» in questa parola?`)}<p class="bigform" lang="la">${hi}</p>${optsHtml(it.options)}`;
}
function renderAccento(it) { return `${exHead('Dove cade l’accento?')}<p class="bigform" lang="la">${esc(wordQ(it))}</p><p class="subline">La sillaba accentata è scritta in maiuscolo.</p>${optsHtml(it.options)}`; }
function renderSillabe(it) { return `${exHead('Come si divide in sillabe?')}<p class="bigform" lang="la">${esc(wordQ(it))}</p>${optsHtml(it.options)}`; }
function renderQuantita(it) { return `${exHead(`La penultima sillaba, «${esc(it.syl)}», è lunga o breve?`)}<p class="bigform" lang="la">${esc(wordQ(it))}</p>${optsHtml(it.options, esc, false, true)}`; }
function matchStep() {
  const c = SES.cur, it = c.it;
  if (c.selL == null || c.selR == null) return;
  const L = $(`[data-act="mL"][data-i="${c.selL}"]`), R = $(`[data-act="mR"][data-i="${c.selR}"]`);
  if (c.selL === c.selR) {
    c.matched.add(c.selL); sfx.match();
    [L, R].forEach((b) => { b.classList.remove('sel'); b.classList.add('ok'); b.disabled = true; });
  } else {
    c.mist++; sfx.err(); buzz(30);
    [L, R].forEach((b) => { b.classList.remove('sel'); b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 400); });
  }
  c.selL = c.selR = null;
  if (c.matched.size === it.pairs.length) setTimeout(() => finalize({ ok: c.mist <= 1, sol: it.pairs.map((p) => (S.settings.quant ? p.lq : p.la) + ' = ' + p.it).join('; '), note: c.mist ? `Errori: ${c.mist}.` : '' }), 250);
}

/* ---------- Controllo delle risposte ---------- */
function bestItalianMatch(s, ans) {
  const a = normIt(ans);
  let best = 0, bestRef = s.it[0];
  for (const r of s.it) { const v = simLoose(a, normIt(r)); if (v > best) { best = v; bestRef = r; } }
  return { best, bestRef };
}
// quantità scritte dallo studente: si segnalano quelle diverse dal riferimento (non contano come errore)
function quantWarnings(typedWords, refWords) {
  const out = [];
  typedWords.forEach((w, k) => { const ref = refWords[k]; if (!ref || w === E.plain(w)) return; if (w.toLowerCase() !== ref.toLowerCase()) out.push({ got: w, want: ref }); });
  return out;
}
function pickOption(k) {
  const c = SES.cur; if (!c || c.answered) return;
  c.picked = k;
  $$('#ovBody .opt').forEach((b) => b.classList.toggle('sel', +b.dataset.k === k));
  sfx.tap();
  const btn = $('#checkBtn'); if (btn) btn.disabled = false;
}
function markOptions(ok, isRight) {
  $$('#ovBody .opt').forEach((b, k) => {
    b.disabled = true; b.classList.remove('sel');
    if (isRight(k)) b.classList.add('right');
    else if (k === SES.cur.picked && !ok) b.classList.add('wrong');
  });
}
function doCheck() {
  const c = SES.cur; if (!c || c.answered) return;
  const it = c.it;
  let res = null;
  if (CHOICE.includes(it.type) && c.picked == null) return;
  if (it.type === 'la_it') {
    if (c.inputMode === 'tiles') {
      if (!c.chosen.length) return;
      const built = c.chosen.map((k) => c.tiles[k].label).join(' ');
      const ok = it.s.it.some((r) => normIt(r) === normIt(built));
      res = { ok, sol: it.s.it[0], given: built, near: !ok && simLoose(normIt(built), normIt(it.s.it[0])) > 0.7 };
    } else {
      const ans = $('#typed').value.trim();
      if (!ans) return toast('Scrivi la traduzione.');
      const m = bestItalianMatch(it.s, ans);
      if (m.best >= 0.88) res = { ok: true, sol: m.bestRef, given: ans, typed: true, note: normIt(ans) !== normIt(m.bestRef) ? 'Versione di riferimento: ' + m.bestRef : '' };
      else return selfGrade(it, ans, m.bestRef);
    }
  } else if (it.type === 'it_la') {
    const solShown = laShow(it.s);
    if (c.inputMode === 'tiles') {
      if (!c.chosen.length) return;
      const toks = c.chosen.map((k) => c.tiles[k]);
      const noDis = toks.every((t) => !t.distractor);
      const ok = noDis && SN.orderOK(it.s.la, toks.map((t) => t.key));
      const sameOrder = toks.map((t) => t.key).join(' ') === SN.tiles(it.s.la).join(' ');
      res = { ok, sol: solShown, latin: true, note: ok && !sameOrder ? 'Giusto: in latino l’ordine delle parole è libero. Ordine del testo: ' + solShown : '' };
    } else {
      const ans = $('#typed').value.trim();
      if (!ans) return toast('Scrivi la frase in latino.');
      const tl = SN.typedTiles(it.s.la, ans);
      const ok = !!tl && SN.orderOK(it.s.la, tl);
      const refQ = (it.s.tokens || []).map((t) => t.q);
      const typedW = ans.replace(/[.,;:!?]/g, ' ').split(/\s+/).filter(Boolean);
      res = { ok, sol: solShown, latin: true, typed: true, quant: ok && S.settings.quant ? quantWarnings(typedW, ok && tl.join(' ') === SN.tiles(it.s.la).join(' ') ? refQ : []) : [] };
    }
  } else if (it.type === 'analizza') {
    const ok = it.valid.includes(it.options[c.picked]);
    res = { ok, sol: it.correct, others: it.valid.length > 1 ? it.valid : null };
    markOptions(ok, (k) => it.valid.includes(it.options[k]));
  } else if (it.type === 'scrivi') {
    const raw = $('#typed').value.trim();
    if (!raw) return toast('Scrivi la forma.');
    const ok = it.answers.some((a) => E.norm(a).replace(/v/g, 'u') === E.norm(raw).replace(/v/g, 'u'));
    const q = ok && raw !== E.plain(raw) && !it.qs.some((x) => x.toLowerCase() === raw.toLowerCase()) ? [{ got: raw, want: it.qs[0] }] : [];
    res = { ok, sol: (S.settings.quant ? it.qs : it.answers).join(' / '), latin: true, quant: q };
  } else if (it.type === 'completa') {
    const ok = E.norm(it.options[c.picked]) === E.norm(it.answer);
    res = { ok, sol: laShow(it.s), latin: true };
    markOptions(ok, (k) => E.norm(it.options[k]) === E.norm(it.answer));
    const b = $('#blank'); if (b) b.textContent = quantOf(it.s.tokens[it.idx].uid, it.answer);
  } else if (it.type === 'lessico') {
    const ok = it.options[c.picked] === it.uid;
    const e = ent(it.uid);
    res = { ok, sol: lemmaOf(e) + ' = ' + e.it };
    markOptions(ok, (k) => it.options[k] === it.uid);
    srs(it.uid, ok);
  } else if (it.type === 'accorda') {
    const ok = E.norm(it.options[c.picked]) === E.norm(it.answer);
    res = { ok, sol: showForm(it.noun.f, it.noun.q) + ' ' + showForm(it.answer, it.aq), latin: true, note: ok ? '' : 'L’aggettivo prende genere, numero e caso del nome: ' + it.noun.d + '.' };
    markOptions(ok, (k) => E.norm(it.options[k]) === E.norm(it.answer));
  } else {
    const ok = it.options[c.picked] === it.right;
    res = { ok, sol: it.right, note: it.why ? it.why[0].toUpperCase() + it.why.slice(1) + '.' : it.type === 'lettura' ? `${wordQ(it)} si legge «${it.right}».` : '' };
    markOptions(ok, (k) => it.options[k] === it.right);
  }
  finalize(res);
}
function selfGrade(it, ans, sol) {
  const c = SES.cur; c.answered = true;
  $('#typed').readOnly = true;
  $('#ovFoot').innerHTML = `<div class="fb">${guide('think', 52)}<div class="fb-txt"><h3>Confronta con la soluzione</h3><p class="sol">${esc(sol)}</p>${it.s.it.length > 1 ? `<p class="note">Anche: ${it.s.it.filter((x) => x !== sol).slice(0, 2).map(esc).join('; ')}</p>` : ''}<p class="note">La tua traduzione è diversa da quelle previste: giudica tu, con onestà.</p></div></div>
    <div class="btns"><button class="btn err" data-act="self" data-v="0">Ho sbagliato</button><button class="btn ok" data-act="self" data-v="1">Era giusta</button></div>`;
  c.selfData = { ans, sol };
}
function finalize(res) {
  const c = SES.cur, it = c.it;
  c.answered = true; c.res = res;
  $$('#ovBody .tile, #ovBody .opt, #ovBody .match button, #ovBody [data-act="macron"]').forEach((b) => (b.disabled = true));
  const t = $('#typed'); if (t) t.readOnly = true;
  S.stats.answered++;
  S.stats.types[it.type] = (S.stats.types[it.type] || 0) + 1;
  const topic = it.topic || (it.s && it.s.focus);
  recordMastery(topic, res.ok);
  let gained = 0;
  if (res.ok) {
    SES.combo++; SES.best = Math.max(SES.best, SES.combo); SES.ok++; S.stats.correct++;
    gained = (XP_BASE[it.type] || 4) + (SES.combo >= 3 ? 2 : 0) + (it.s && it.s.src === 'gen' ? 1 : 0) + (res.typed ? 2 : 0);
    if (it.type === 'la_it' || it.type === 'it_la') S.stats.translated++;
    if (it.type === 'analizza' || it.type === 'scrivi') S.stats.forms++;
    if (res.typed && !res.self) S.stats.typedOK++;
    if (it.s && it.s.src === 'gen') S.stats.genSeen++;
    if (it.review) S.mistakes = S.mistakes.filter((m) => m.at !== it.review.at);
    sfx.ok(); buzz(15);
  } else {
    SES.combo = 0; SES.ko++;
    addMistake(it);
    sfx.err(); buzz([30, 40, 30]);
    // l'esercizio sbagliato torna alla fine della lezione
    if (SES.kind === 'lesson' && SES.requeued < 4 && !it.requeued && it.type !== 'abbina') { SES.items.push(Object.assign({}, it, { requeued: true, options: it.options ? shuffle(it.options) : it.options })); SES.requeued++; }
  }
  if (it.s) S.recent = S.recent.filter((x) => x !== it.s.id).concat([it.s.id]).slice(-60);
  SES.xp += Math.round(gained);
  setCombo();
  save();
  showFeedback(res, Math.round(gained));
}
function addMistake(it) {
  let m = null;
  if (it.s && it.s.src === 'gen') {
    const packed = { id: it.s.id, la: it.s.la, it: it.s.it, tags: it.s.tags, focus: it.s.focus, tip: it.s.tip, src: 'gen', tokens: it.s.tokens };
    S.genSaved = (S.genSaved || []).filter((x) => x.id !== it.s.id).concat([packed]).slice(-60);
  }
  if (it.type === 'la_it' || it.type === 'it_la') m = { k: 's', id: it.s.id, dir: it.type };
  else if (it.type === 'analizza' || it.type === 'scrivi') m = { k: 'f', uid: it.uid, key: it.key, t: it.type };
  else if (it.type === 'lessico') m = { k: 'l', uid: it.uid };
  if (!m) return;
  const sig = (a) => JSON.stringify(Object.assign({}, a, { at: 0 }));
  S.mistakes = S.mistakes.filter((a) => sig(a) !== sig(m)).concat([Object.assign(m, { at: Date.now() })]).slice(-60);
}
function showFeedback(res, gained) {
  const it = SES.cur.it;
  const topic = it.topic || (it.s && it.s.focus);
  $('#ovFootWrap').className = 'ov-foot ' + (res.ok ? 'ok' : 'err');
  let body = '';
  if (res.ok) {
    body += `<h3>${pick(['Optimē!', 'Bene!', 'Rēctē!', 'Esatto!', 'Ottimo!'])}</h3>`;
    if (gained) body += `<p class="note">+${gained} XP${SES.combo >= 3 ? ', ' + SES.combo + ' di fila' : ''}</p>`;
    if (res.note) body += `<p class="note">${esc(res.note)}</p>`;
    if (res.others && res.others.length > 1) body += `<p class="note">Può essere anche: ${res.others.filter((o) => o !== it.options[SES.cur.picked]).map(esc).join('; ')}.</p>`;
  } else {
    body += `<h3>${res.near ? 'Quasi!' : 'Soluzione'}</h3><p class="sol${res.latin ? ' la' : ''}" ${res.latin ? 'lang="la"' : ''}>${esc(res.sol)}</p>`;
    if (res.note) body += `<p class="note">${esc(res.note)}</p>`;
    if (it.s && it.s.tip) body += `<p class="note">${esc(it.s.tip)}</p>`;
    else if (!res.near) body += `<p class="note">${esc(pick(C.COMFORT))}</p>`;
  }
  if (res.quant && res.quant.length) body += `<p class="note">Quantità: ${res.quant.slice(0, 3).map((a) => `<span class="la" lang="la">${esc(a.got)}</span> → <span class="la" lang="la">${esc(a.want)}</span>`).join(', ')} (non conta come errore)</p>`;
  const extra = [];
  if (topic && TOPIC[topic] && !res.ok) extra.push(`<button class="tool" data-act="theory" data-t="${topic}">${I.book}Teoria</button>`);
  if (it.s) extra.push(`<button class="tool" data-act="analysis">${I.lens}Analisi</button>`, `<button class="tool" data-act="speakSent">${I.sound}Ascolta</button>`);
  $('#ovFoot').innerHTML = `<div class="foot-split"><div class="fb-wrap"><div class="fb" role="status" aria-live="polite">${guide(res.ok ? 'happy' : 'sad', 52)}<div class="fb-txt">${body}</div></div>${extra.length ? `<div class="fb-extra">${extra.join('')}</div>` : ''}</div>
    <button class="btn big ${res.ok ? 'ok' : 'err'}" data-act="next" id="nextBtn">Continua</button></div>`;
  setTimeout(() => { const n = $('#nextBtn'); if (n) n.focus({ preventScroll: true }); }, 60);
  if (!res.ok && topic && TOPIC[topic] && !SES.shownTheory[topic] && SES.ko >= 3 && SES.kind === 'practice') {
    SES.shownTheory[topic] = true;
    const cur = SES.cur;
    setTimeout(() => { if (SES && SES.cur === cur && !SES.done && !$('#sheet')) theorySheet(topic, true); }, 500);
  }
}
function finishSession() {
  SES.done = true;
  const answered = SES.ok + SES.ko;
  const acc = answered ? SES.ok / answered : 1;
  const perfect = answered >= 4 && SES.ko === 0;
  let bonus = perfect ? 20 : 0;
  let stars = 0, passed = true, unlockedNew = null;
  if (SES.kind === 'lesson') {
    const f = FLAT[SES.idx];
    const id = f.lesson.id;
    passed = !SES.test || acc >= 0.7;
    stars = !passed ? 0 : acc >= 0.95 ? 3 : acc >= 0.8 ? 2 : 1;
    if (stars) S.course.stars[id] = Math.max(S.course.stars[id] || 0, stars);
    S.course.times[id] = (S.course.times[id] || 0) + 1;
    S.stats.lessons++;
    bonus += 10;
    if (passed && SES.idx + 1 > S.course.unlocked && SES.idx + 1 < FLAT.length) { S.course.unlocked = SES.idx + 1; unlockedNew = FLAT[SES.idx + 1]; syncTopics(); }
  }
  const rankUp = addXP(SES.xp + bonus);
  if (answered > 0) touchStreak();
  S.stats.sessions++;
  if (perfect) S.stats.perfect++;
  if (SES.mode === 'review' && S.mistakes.length === 0 && answered > 0) S.stats.clearedReview++;
  const h = new Date().getHours();
  const won = checkBadges({ lucubratio: h >= 22, aurora: h < 8 });
  // promemoria del salvataggio: dopo la prima lezione e poi una volta alla settimana
  const nudge = SES.kind === 'lesson' && (S.stats.lessons === 1 || Date.now() - Math.max(S.backupAt || 0, S.nudgedAt || 0) > 7 * 864e5);
  if (nudge) S.nudgedAt = Date.now();
  save();
  setProgress();
  if (passed) { sfx.done(); confetti(); } else sfx.err();
  const mins = Math.max(1, Math.round((Date.now() - SES.start) / 60000));
  const goalDone = todayXP() >= S.goal;
  const starRow = SES.kind === 'lesson' && passed ? `<div class="bigstars" role="img" aria-label="${stars} ${stars === 1 ? 'stella' : 'stelle'} su 3">${[1, 2, 3].map((n) => I.star.replace('<svg', `<svg class="${n <= stars ? 'on' : ''}"`)).join('')}</div>` : '';
  const title = !passed ? 'Quasi!' : perfect ? 'Sine errore!' : acc >= 0.8 ? 'Optimē!' : SES.kind === 'lesson' ? 'Lezione completata' : 'Allenamento finito';
  const newUnit = unlockedNew && unlockedNew.ui !== FLAT[SES.idx].ui;
  const msg = !passed ? 'Per superare la prova serve il 70% di risposte giuste. Riprova: ormai ci sei.' : newUnit ? `Hai aperto l’unità «${unlockedNew.unit.title}».` : unlockedNew ? `Prossima lezione: «${unlockedNew.lesson.title}».` : acc >= 0.7 ? pick(C.CHEERS) : 'Gli errori sono finiti nel ripasso: rivederli è il modo più rapido per imparare.';
  const rk = rankOf(S.xp);
  $('#ovBody').innerHTML = `<div class="finish fx-in">${guide(passed ? 'cheer' : 'think', 150)}<h2 ${perfect || acc >= 0.8 ? 'lang="la"' : ''}>${esc(title)}</h2>${starRow}<p>${esc(msg)}</p>
    <div class="stats3"><div class="stat c-star">${I.bolt}<b>+${SES.xp + bonus}</b><small>XP</small></div><div class="stat c-good">${I.check}<b>${Math.round(acc * 100)}%</b><small>Precisione</small></div><div class="stat c-pri">${I.clock}<b>${mins} min</b><small>Tempo</small></div></div>
    <p class="note">${goalDone ? `Obiettivo di oggi raggiunto: ${todayXP()} XP.` : `Oggi ${todayXP()} di ${S.goal} XP.`}</p>
    ${rankUp ? `<div class="card stack"><p class="note">Nuovo grado nel cursus honorum</p><b><span class="la" lang="la">${esc(rk.r.name)}</span>, ${esc(rk.r.it)}</b></div>` : ''}
    ${won.map((b) => `<div class="card row">${medal(b, true)}<div class="grow"><b class="la" lang="la">${esc(b.name)}</b><p class="note">${esc(b.desc)}</p></div></div>`).join('')}
    ${nudge ? `<div class="card save-nudge"><b>Metti al sicuro i tuoi progressi</b><p class="note">Si salvano da soli su questo dispositivo. Con il codice di salvataggio li ritrovi anche su un altro telefono.</p><button class="btn small ghost" data-act="saveCode">Mostra il codice</button></div>` : ''}</div>`;
  $('#ovFootWrap').className = 'ov-foot';
  const again = !passed && SES.kind === 'lesson' ? `<button class="btn big ghost" data-act="retry">Riprova</button>` : S.mistakes.length && SES.kind === 'practice' && SES.mode !== 'review' ? '<button class="btn big ghost" data-act="startReview">Ripassa gli errori</button>' : '';
  $('#ovFoot').innerHTML = `<div class="btns">${again}<button class="btn big ${passed ? 'ok' : ''}" data-act="endSession">Continua</button></div>`;
  setTimeout(() => { const b = $('#ovFoot .btn:last-child'); if (b) b.focus(); }, 60);
}
function endSession() { const y = SES ? SES.backY : 0; SES = null; closeOverlay(); render(); window.scrollTo(0, y); flushToasts(); }

/* ---------- Ripetizione dilazionata ---------- */
const BOX_DAYS = [0, 1, 3, 7, 14, 30];
function srs(uid, ok) { const v = S.vocab[uid] || { box: 0, due: dayKey() }; v.box = ok ? Math.min(5, v.box + 1) : 1; v.due = addDays(dayKey(), BOX_DAYS[v.box]); S.vocab[uid] = v; }
function vocabQueue() {
  const known = LS.vocabForTopics(sel());
  const ents = [...known].map(ent).filter((e) => e && ['n', 'v', 'a', 'p', 'i'].includes(e.k));
  const due = ents.filter((e) => S.vocab[e.uid] && S.vocab[e.uid].due <= dayKey());
  const fresh = ents.filter((e) => !S.vocab[e.uid]).slice(0, Math.max(0, 10 - due.length));
  return { due, fresh, all: ents };
}

/* ---------- Popup della parola e fogli ---------- */
function closePop() { const p = $('#pop'); if (p) p.remove(); $$('.w.open').forEach((w) => w.classList.remove('open')); }
function wordPop(btn, tok) {
  closePop();
  const e = ent(tok.uid); if (!e) return;
  const formOK = SES && SES.scope ? SES.scope.formOK : () => true;
  const f = e.forms.find((x) => x.key === tok.key) || {};
  const others = uniq(E.analyze(tok.w).filter((a) => a.key !== tok.key && formOK(a.e, a.key)).map((a) => `${headOf(a.e)}: ${a.d}`)).filter((x) => x !== `${headOf(e)}: ${f.d}`).slice(0, 4);
  const p = document.createElement('div');
  p.className = 'pop'; p.id = 'pop'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Analisi della parola');
  const isNew = SES && SES.cur && (SES.cur.it.newWords || []).includes(e.uid);
  p.innerHTML = `${isNew ? '<span class="tag new">Parola nuova</span>' : ''}<h4 lang="la">${esc(S.settings.quant ? tok.q : tok.w)}</h4><div class="lem"><span class="la" lang="la">${esc(lemmaOf(e))}</span>: ${esc(e.it)}</div>${f.d ? `<p><b>${esc(f.d)}</b></p>` : ''}
    ${others.length ? `<p class="note">Altre letture possibili:</p><ul>${others.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
    <div class="tools"><button class="tool" data-act="speakText" data-w="${esc(tok.w)}">${I.sound}Ascolta</button>${e.k !== 'i' ? `<button class="tool" data-act="paradigm" data-u="${esc(e.uid)}">${I.table}Paradigma</button>` : ''}${S.settings.online ? wikiLink(e.head) : ''}</div>`;
  document.body.appendChild(p);
  btn.classList.add('open');
  const r = btn.getBoundingClientRect();
  const w = p.offsetWidth, h = p.offsetHeight;
  const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12);
  let top = r.bottom + 8;
  if (top + h > innerHeight - 12) top = Math.max(12, r.top - h - 8);
  p.style.left = left + 'px'; p.style.top = top + 'px';
}
const wikiLink = (w) => `<a class="tool" href="https://it.wiktionary.org/wiki/${encodeURIComponent(E.plain(w).toLowerCase())}" target="_blank" rel="noopener noreferrer">${I.globe}Wikizionario</a>`;
function openSheet(title, html) {
  closeSheet();
  const bg = document.createElement('div');
  bg.className = 'sheet-bg'; bg.id = 'sheet';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn" data-act="closeSheet" aria-label="Chiudi">${I.close}</button></div><div class="sheet-body">${html}</div></div>`;
  bg.addEventListener('click', (ev) => { if (ev.target === bg) closeSheet(); });
  document.body.appendChild(bg);
  setTimeout(() => { const b = $('#sheet .iconbtn'); if (b) b.focus(); }, 30);
}
function closeSheet() { const s = $('#sheet'); if (s) s.remove(); }
function showModal(html) {
  closeModal();
  const bg = document.createElement('div');
  bg.className = 'modal-bg'; bg.id = 'modal';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener('click', (ev) => { if (ev.target === bg) closeModal(); });
  document.body.appendChild(bg);
  setTimeout(() => { const b = $('#modal .btn:last-of-type') || $('#modal button'); if (b) b.focus(); }, 30);
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
let modalCb = null;
function askConfirm(text, okLabel, cb, danger, mood = 'think') { modalCb = cb; showModal(`${guide(mood, 88)}<h2>${esc(text)}</h2><div class="btns"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn ${danger ? 'err' : ''}" data-act="modalOk">${esc(okLabel)}</button></div>`); }
function askText(label, value, cb) { modalCb = cb; showModal(`<div class="field"><label for="mdIn">${esc(label)}</label><input id="mdIn" class="typed" maxlength="24" autocomplete="off" value="${esc(value)}"></div><div class="btns"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn" data-act="modalOk">Salva</button></div>`); setTimeout(() => { const i = $('#mdIn'); if (i) i.focus(); }, 40); }
function analysisSheet(s) {
  const toks = s.tokens || [];
  const rows = toks.map((t) => { const e = ent(t.uid); const f = e && e.forms.find((x) => x.key === t.key); return e ? `<tr><td class="la" lang="la">${esc(S.settings.quant ? t.q : t.w)}</td><td><span class="la" lang="la">${esc(headOf(e))}</span><div class="note">${esc(shortM(e.it))}</div></td><td>${esc(f ? f.d : e.cls)}</td></tr>` : ''; }).join('');
  openSheet('Analisi della frase', `<p class="latin-line" lang="la">${esc(laShow(s))}</p><p>${esc(s.it[0])}</p><div class="tbl-wrap"><table class="para"><thead><tr><th>Parola</th><th>Lemma</th><th>Analisi</th></tr></thead><tbody>${rows}</tbody></table></div><p class="note">Nelle frasi della banca, per le forme che possono avere più letture, l’analisi mostrata è quella più probabile: controlla il contesto.</p>`);
}
function methodSheet() { openSheet('Il metodo per tradurre', `${say('Otto passi per non perdersi in nessuna frase latina.', 'happy', 64)}<ol class="theory">${METHOD.map((m) => `<li><b>${esc(m.h)}</b><p>${esc(m.p)}</p></li>`).join('')}</ol>`); }

/* ---------- Tabelle dal motore ---------- */
const CASES = [['nom', 'Nom.'], ['gen', 'Gen.'], ['dat', 'Dat.'], ['acc', 'Acc.'], ['voc', 'Voc.'], ['abl', 'Abl.']];
const PERS_ROWS = ['1ª sing.', '2ª sing.', '3ª sing.', '1ª plur.', '2ª plur.', '3ª plur.'];
// forma con la desinenza evidenziata (il tema del lemma in tondo, la desinenza in grassetto)
function cellHtml(e, forms, kind) {
  if (!forms.length) return '—';
  return uniq(forms.map((f) => {
    const w = S.settings.quant ? f.q : f.f;
    let stem = null;
    if (e.stems) {
      if (kind === 'n') stem = e.stems.n; else if (kind === 'a') stem = e.stems.a;
      else if (kind === 'v') stem = /:(perf|ppf|futant):/.test(f.key) ? e.stems.perf : /^v:part:(perf|fut)/.test(f.key) ? e.stems.sup : e.stems.pres;
    }
    if (stem) { const st = S.settings.quant ? stem : E.plain(stem); if (w.startsWith(st) && w.length > st.length) return `${esc(st)}<span class="end">${esc(w.slice(st.length))}</span>`; }
    return esc(w);
  })).join(' / ');
}
function tblHtml(cols, rows, cap, laCols = []) {
  return `<div class="tbl-wrap"><table class="para">${cap ? `<caption>${laSpans(esc(cap))}</caption>` : ''}<thead><tr>${cols.map((c) => `<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td class="${laCols === 'all' || laCols.includes(i) ? 'la' : ''}" ${laCols === 'all' || laCols.includes(i) ? 'lang="la"' : ''}>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const headCell = (e) => `<span class="la" lang="la">${esc(headOf(e))}</span>`;
function declTable(uids, cap, num, cases) {
  const ents = uids.map(ent).filter(Boolean);
  const rows = [];
  for (const n of num ? [num] : ['s', 'p']) for (const [c, lab] of CASES) {
    if (cases && !cases.includes(c)) continue;
    rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...ents.map((e) => cellHtml(e, e.forms.filter((f) => f.key === `n:${c}:${n}`), 'n'))]);
  }
  return tblHtml(['', ...ents.map(headCell)], rows.filter((r) => r.slice(1).some((x) => x !== '—')), cap, ents.map((_, i) => i + 1));
}
const TENSE_LAB = { 'ind:pres': 'presente', 'ind:impf': 'imperfetto', 'ind:fut': 'futuro', 'ind:perf': 'perfetto', 'ind:ppf': 'piuccheperfetto', 'ind:futant': 'futuro anteriore', 'cong:pres': 'cong. presente', 'cong:impf': 'cong. imperfetto', 'cong:perf': 'cong. perfetto', 'cong:ppf': 'cong. piuccheperfetto', 'imp:pres': 'imperativo' };
function conjTable(specs, cap) {
  const cols = [''], data = [];
  let imp = false;
  const sameLemma = specs.every(([u]) => u === specs[0][0]);
  const sameTense = specs.every(([, k]) => k === specs[0][1]);
  for (const [u, key] of specs) {
    const e = ent(u); if (!e) continue;
    const [, m, t, v] = key.split(':');
    imp = m === 'imp';
    const lab = TENSE_LAB[m + ':' + t] + (v === 'pass' ? ' passivo' : '');
    cols.push(sameLemma && !sameTense ? lab : sameTense ? headCell(e) : `${headCell(e)}, ${lab}`);
    data.push({ e, key });
  }
  const persons = imp ? [[1, '2ª sing.'], [4, '2ª plur.']] : PERS_ROWS.map((l, i) => [i, l]);
  const rows = persons.map(([p, lab]) => [lab, ...data.map(({ e, key }) => cellHtml(e, e.forms.filter((f) => f.key === `${key}:${p}`), 'v'))]);
  const title = sameTense && !sameLemma ? TENSE_LAB[specs[0][1].split(':').slice(1, 3).join(':')] + (specs[0][1].endsWith(':pass') ? ' passivo' : '') : sameLemma ? lemmaOf(data[0].e) : '';
  return tblHtml(cols, rows, cap || title, data.map((_, i) => i + 1));
}
function adjTable(uid, cap, deg = 'pos') {
  const e = ent(uid); if (!e) return '';
  const rows = [];
  for (const n of ['s', 'p']) for (const [c, lab] of CASES) rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...['m', 'f', 'n'].map((g) => cellHtml(e, e.forms.filter((f) => f.key === `${e.k === 'p' ? 'p' : 'a:' + deg}:${c}:${n}:${g}`), 'a'))]);
  return tblHtml(['', 'Maschile', 'Femminile', 'Neutro'], rows.filter((r) => r.slice(1).some((x) => x !== '—')), cap || lemmaOf(e), [1, 2, 3]);
}
function adjNomTable(uids) {
  const rows = uids.map(ent).filter(Boolean).map((e) => [headCell(e), ...['m', 'f', 'n'].map((g) => cellHtml(e, e.forms.filter((f) => f.key === `a:pos:nom:s:${g}`), 'a')), cellHtml(e, e.forms.filter((f) => f.key === 'a:pos:gen:s:m'), 'a')]);
  return tblHtml(['', 'Nom. maschile', 'Nom. femminile', 'Nom. neutro', 'Genitivo'], rows, '', [1, 2, 3, 4]);
}
function pronTable(uid, cap, cases) {
  const e = ent(uid); if (!e) return '';
  if (e.cls === 'aggettivo pronominale') return adjTable(uid, cap);
  const gens = uniq(e.forms.map((f) => f.key.split(':')[3]));
  const gl = { m: 'Maschile', f: 'Femminile', n: 'Neutro', '-': '' };
  const rows = [];
  for (const n of ['s', 'p', '-']) for (const [c, lab] of CASES) {
    if (cases && !cases.includes(c)) continue;
    rows.push([`${lab}${n === 's' ? ' sing.' : n === 'p' ? ' plur.' : ''}`, ...gens.map((g) => cellHtml(e, e.forms.filter((f) => f.key === `p:${c}:${n}:${g}` && !/con /.test(f.d)), 'p'))]);
  }
  const heads = gens.map((g) => gl[g] || '');
  return tblHtml(['', ...(heads.every((h) => !h) ? [headCell(e)] : heads)], rows.filter((r) => r.slice(1).some((x) => x !== '—')), cap || lemmaOf(e), gens.map((_, i) => i + 1));
}
function formsTable(specs) { return tblHtml(['', 'Forma'], specs.map(([u, key, lab]) => { const e = ent(u); return [laSpans(esc(lab)), e ? cellHtml(e, e.forms.filter((f) => f.key === key), e.k === 'v' ? 'v' : e.k) : '—']; }), '', [1]); }
function degreesTable(uids, show = ['pos', 'comp', 'sup']) {
  const lab = { pos: 'Positivo', comp: 'Comparativo', sup: 'Superlativo' };
  const rows = uids.map(ent).filter(Boolean).map((e) => show.map((d) => {
    if (d === 'pos') return esc(headOf(e));
    const m = e.forms.filter((f) => f.key === `a:${d}:nom:s:m`), n = e.forms.filter((f) => f.key === `a:${d}:nom:s:n`);
    return d === 'comp' ? uniq([...m, ...n].map((f) => qOf(f))).join(', ') || '—' : uniq(m.map((f) => qOf(f))).join(', ') || '—';
  }));
  return `<div class="tbl-wrap"><table class="para"><thead><tr>${show.map((d) => `<th scope="col">${lab[d]}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td class="la" lang="la">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function lemmasTable(specs) {
  return tblHtml(['Paradigma', 'Significato', 'Nota'], specs.map(([u, note]) => { const e = ent(u); return [`<span class="la" lang="la">${esc(e ? lemmaOf(e) : u)}</span>`, esc(e ? e.it : ''), esc(note || '')]; }), '', []);
}
function partTable(uid, tense) {
  const e = ent(uid); if (!e) return '';
  const rows = [];
  for (const n of ['s', 'p']) for (const [c, lab] of CASES) if (c !== 'voc') rows.push([`${lab} ${n === 's' ? 'sing.' : 'plur.'}`, ...['m', 'f', 'n'].map((g) => cellHtml(e, e.forms.filter((f) => f.key === `v:part:${tense}:${c}:${n}:${g}`), 'v'))]);
  return tblHtml(['', 'Maschile', 'Femminile', 'Neutro'], rows, `participio ${tense === 'pres' ? 'presente' : tense === 'perf' ? 'perfetto' : 'futuro'} di ${lemmaOf(e)}`, [1, 2, 3]);
}
function conceptTable(t) { return tblHtml(t.c.map((c) => esc(c)), t.r.map((r) => r.map((c) => laSpans(c))), '', []); }
function cardTable(c) {
  if (c.tbl) return conceptTable(c.tbl);
  if (c.decl) return declTable(c.decl, c.cap, c.num, c.cases);
  if (c.conj) return conjTable(c.conj, c.cap);
  if (c.adj) return adjTable(c.adj, c.cap);
  if (c.adjNom) return adjNomTable(c.adjNom);
  if (c.pron) return pronTable(c.pron, c.cap, c.cases);
  if (c.forms) return formsTable(c.forms);
  if (c.degrees) return degreesTable(c.degrees, c.show);
  if (c.lemmas) return lemmasTable(c.lemmas);
  if (c.part) return partTable(c.part, c.tense || 'pres');
  return '';
}
function theoryHtml(t) {
  let h = '';
  for (const b of t.body) {
    if (b.p) h += `<p>${laSpans(b.p)}</p>`;
    else if (b.ul) h += `<ul>${b.ul.map((x) => `<li>${laSpans(x)}</li>`).join('')}</ul>`;
    else h += cardTable(b);
  }
  if (t.tip) h += `<div class="tip"><b>Come tradurre</b>${laSpans(esc(t.tip))}</div>`;
  if (t.trap && t.trap.length) h += `<div class="trap"><b>Trappole frequenti</b>${t.trap.map((x) => `<span>${laSpans(x)}</span>`).join('')}</div>`;
  if (t.ex && t.ex.length) h += `<p class="sec-title">Esempi</p>${t.ex.map(([l, i]) => `<div class="exline"><span class="la" lang="la">${esc(SN.render(l, SN.resolveBank(l, ORDER.slice(0, TOPIC[t.id].n + 1)), S.settings.quant))}</span><span class="muted">${esc(i)}</span></div>`).join('')}`;
  return `<div class="theory">${h}</div>`;
}
function theorySheet(id, auto) {
  const t = TOPIC[id]; if (!t) return;
  openSheet(t.title, (auto ? say('Qualche errore su questo argomento: ripassiamolo insieme, ci vuole un minuto.', 'think', 64) : '') + theoryHtml(t));
}
function paradigmSheet(e) {
  let h = `<p><span class="la" lang="la">${esc(lemmaOf(e))}</span>: ${esc(e.it)} <span class="note">(${esc(e.cls)})</span></p>`;
  if (e.k === 'n') h += declTable([e.uid], '');
  else if (e.k === 'a') { h += adjTable(e.uid, 'Grado positivo'); if (e.forms.some((f) => f.deg === 'comp')) h += degreesTable([e.uid]); }
  else if (e.k === 'p') h += pronTable(e.uid, '');
  else if (e.k === 'v') {
    const keys = uniq(e.forms.filter((f) => /^v:(ind|cong|imp):/.test(f.key)).map((f) => f.key.split(':').slice(0, 4).join(':')));
    const T = sel();
    for (const k of keys) { const req = e.forms.find((f) => f.key.startsWith(k + ':')).req; if (req.every((t) => T.has(t)) || T.size >= ORDER.length) h += conjTable([[e.uid, k]], TENSE_LAB[k.split(':').slice(1, 3).join(':')] + (k.endsWith(':pass') ? ' passivo' : '')); }
    const infs = e.forms.filter((f) => f.mood === 'inf');
    if (infs.length) h += tblHtml(['', 'Infinito'], infs.map((f) => [esc(f.d.replace(/^infinito /, '')), cellHtml(e, [f], 'v')]), '', [1]);
    h += '<p class="note">Sono mostrati i tempi degli argomenti che hai già aperto.</p>';
  }
  openSheet('Paradigma', h);
}

/* ---------- Viste ---------- */
let VIEW = 'path';
let openStone = null;
const NAV = [['path', I.via, 'Percorso'], ['gym', I.gym, 'Palestra'], ['lib', I.books, 'Teoria'], ['words', I.words, 'Lessico'], ['me', I.me, 'Profilo']];
function render() {
  if (!S.onboarded) return drawOnb();
  const app = $('#app');
  const st = effectiveStreak();
  const view = VIEW.startsWith('topic:') ? viewTopic(VIEW.slice(6)) : VIEW === 'path' ? viewPath() : VIEW === 'gym' ? viewGym() : VIEW === 'lib' ? viewLibrary() : VIEW === 'words' ? viewWords() : viewMe();
  const cur = VIEW.startsWith('topic:') ? 'lib' : VIEW;
  app.innerHTML = `<div class="shell"><nav class="rail" aria-label="Sezioni"><div class="brand">${MARK}<b>VERTO</b></div>${NAV.map(([v, ic, it]) => `<button data-act="tab" data-v="${v}" ${cur === v ? 'aria-current="page"' : ''}>${ic}<span>${it}</span></button>`).join('')}</nav>
    <main class="main" id="main" tabindex="-1"><header class="topbar"><div class="bar-in"><div class="brand">${MARK}<b>VERTO</b></div>
      <div class="chips"><span class="chip streak ${st ? '' : 'off'}" title="Giorni di fila">${I.flame}${st}<span class="sr"> giorni di fila</span></span><span class="chip xp" title="Punti esperienza">${I.bolt}${S.xp}<span class="sr"> XP</span></span></div></div></header>
      <div class="view">${view}</div></main>
    <aside class="side" aria-label="I tuoi progressi">${sidePanel()}</aside></div>
    <nav class="tabs" aria-label="Sezioni">${NAV.map(([v, ic, it]) => `<button data-act="tab" data-v="${v}" ${cur === v ? 'aria-current="page"' : ''}>${ic}<span>${it}</span></button>`).join('')}</nav>`;
  if (VIEW === 'words') bindWords();
  requestAnimationFrame(updateJump);
}
function ringSvg(p, label) {
  const r = 27, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p));
  return `<svg class="ring" viewBox="0 0 66 66" role="img" aria-label="${esc(label)}"><circle cx="33" cy="33" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="8"/><circle cx="33" cy="33" r="${r}" fill="none" stroke="${v >= 1 ? 'var(--good)' : 'var(--star)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - v)).toFixed(2)}" transform="rotate(-90 33 33)"/><text x="33" y="38" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">${Math.round(v * 100)}%</text></svg>`;
}
const sententiaOfDay = () => { const n = daysBetween('2026-01-01', dayKey()); return SENTENTIAE[((n % SENTENTIAE.length) + SENTENTIAE.length) % SENTENTIAE.length]; };
function goalCard() {
  const x = todayXP();
  return `<section class="card goal">${ringSvg(x / S.goal, `Obiettivo di oggi: ${x} su ${S.goal} XP`)}<div class="grow stack"><b>Obiettivo di oggi</b><span class="note">${x >= S.goal ? 'Raggiunto: ogni XP in più è un regalo.' : `${x} di ${S.goal} XP`}</span></div></section>`;
}
function sidePanel() {
  const st = effectiveStreak();
  const rk = rankOf(S.xp);
  const max = sententiaOfDay();
  const pct = rk.next ? Math.round(((S.xp - rk.r.xp) / (rk.next.xp - rk.r.xp)) * 100) : 100;
  return `${goalCard()}
    <section class="card streak-card">${I.flame}<div class="grow"><b>${st} ${st === 1 ? 'giorno' : 'giorni'} di fila</b><p class="note">${S.shields ? `${S.shields} ${S.shields === 1 ? 'scudo protegge' : 'scudi proteggono'} la serie` : 'Ogni 7 giorni guadagni uno scudo'}</p></div></section>
    <section class="card"><p class="note">Cursus honorum</p><b><span class="la" lang="la">${esc(rk.r.name)}</span>, ${esc(rk.r.it)}</b><progress class="bar pri" max="100" value="${pct}" aria-label="Avanzamento verso il grado successivo"></progress><p class="note">${rk.next ? `${rk.next.xp - S.xp} XP a ${esc(rk.next.it)}` : 'Grado più alto'}</p></section>
    <section class="card maxim"><p class="note">Massima del giorno</p><p class="la" lang="la">${esc(max[0])}</p><p>${esc(max[1])}</p><p class="note">${esc(max[2])}</p><div><button class="tool" data-act="speakText" data-w="${esc(max[0])}">${I.sound}Ascolta</button></div></section>`;
}
const LESSON_ICON = (l) => (l.test ? I.trophy : null);
function viewPath() {
  const cur = currentIdx();
  const cf = FLAT[cur];
  const greet = S.name ? `Salvē, ${esc(S.name)}!` : 'Salvē!';
  const ul = cf.unit.lessons.length, li = cf.li + 1;
  const doneInUnit = cf.unit.lessons.filter((l) => S.course.stars[l.id]).length;
  let h = `<section class="resume" aria-label="Lezione attuale"><div class="resume-top">${guide('happy', 76)}<div class="resume-txt"><p class="note"><span lang="la">${greet}</span> ${S.course.times[cf.lesson.id] ? 'Ripassiamo questa lezione.' : 'Si riparte da qui.'}</p><h2>${esc(cf.lesson.title)}</h2><p class="note">Unità ${ROMAN(cf.ui + 1)}, ${esc(cf.unit.title)}: ${cf.lesson.test ? 'prova finale' : `lezione ${li} di ${ul}`}</p></div></div>
    <progress class="bar pri" max="${ul}" value="${doneInUnit}" aria-label="Lezioni completate nell’unità: ${doneInUnit} su ${ul}"></progress>
    <div class="btns"><button class="btn big" data-act="startLesson" data-i="${cur}">${cf.lesson.test ? 'Inizia la prova' : S.course.times[cf.lesson.id] ? 'Ripeti' : 'Continua'}</button></div></section>`;
  h += `<div class="only-narrow sec">${goalCard()}</div>`;
  if (canTranslate(sel())) h += `<section class="sec"><h2 class="sec-title">Allenati a tradurre</h2>${translateCards(sel())}</section>`;
  UNITS.forEach((u, ui) => {
    const grp = TOPIC[u.id] && GROUPS[TOPIC[u.id].group] ? GROUPS[TOPIC[u.id].group].color : 'g-nom';
    const fi = firstLessonIdx(ui);
    const locked = !isUnlocked(fi);
    h += `<section class="unit ${grp}${locked ? ' locked' : ''}" id="unit-${u.id}" aria-label="Unità ${ui + 1}: ${esc(u.title)}"><div class="tabula"><span class="unum" aria-hidden="true">${ROMAN(ui + 1)}</span><div class="t"><small>Unità ${ui + 1}</small><b>${esc(u.title)}</b></div><button class="iconbtn" data-act="topic" data-t="${u.id}" aria-label="Teoria: ${esc(u.title)}" title="Teoria">${I.book}</button></div><ol class="via">`;
    u.lessons.forEach((l, k) => {
      const idx = fi + k;
      const st = S.course.stars[l.id] || 0;
      const unlocked = isUnlocked(idx);
      const isCur = idx === cur;
      const cls = ['stone', l.test ? 'test' : '', !unlocked ? 'locked' : st ? 'done' : '', isCur ? 'current' : ''].filter(Boolean).join(' ');
      const mark = !unlocked ? I.lock : st && !isCur ? (l.test ? I.trophy : I.check) : (LESSON_ICON(l) || `<span>${ROMAN(k + 1)}</span>`);
      const stars = !l.test && st ? `<span class="stars" aria-hidden="true">${[1, 2, 3].map((n) => I.star.replace('<svg', `<svg class="${n <= st ? 'on' : ''}"`)).join('')}</span>` : '';
      h += `<li><button class="${cls}" data-act="stone" data-i="${idx}" aria-expanded="${openStone === idx}" aria-label="${esc(l.title)}${!unlocked ? ', bloccata' : st ? `, ${st} ${st === 1 ? 'stella' : 'stelle'}` : ''}${isCur ? ', lezione attuale' : ''}"><span class="mile" aria-hidden="true">${mark}</span><span class="info"><b>${esc(l.title)}</b><span>${laSpans(esc(l.sub || ''))}</span>${stars}</span></button>${openStone === idx ? stonePop(idx) : ''}</li>`;
    });
    h += '</ol></section>';
  });
  h += `<button class="jump" id="jump" data-act="jump" hidden>${I.via}<span>Lezione attuale</span></button>`;
  h += `<div class="finale">${I.laurel}<span>In fondo alla via: la corona d’alloro dell’interpres.</span></div>`;
  return h;
}
function stonePop(idx) {
  const f = FLAT[idx];
  const l = f.lesson;
  const st = S.course.stars[l.id] || 0;
  if (!isUnlocked(idx)) {
    const unitLocked = !isUnlocked(firstLessonIdx(f.ui));
    return `<div class="stone-pop" role="group" aria-label="${esc(l.title)}"><p>${unitLocked ? 'Questa unità è ancora chiusa. Se l’hai già studiata in classe, puoi aprirla.' : 'Completa prima le lezioni precedenti.'}</p>${unitLocked ? `<button class="btn" data-act="unlockUnit" data-u="${f.ui}">Apri l’unità</button>` : ''}</div>`;
  }
  return `<div class="stone-pop" role="group" aria-label="${esc(l.title)}">${l.test ? '<p class="note">Per superare la prova serve il 70% di risposte giuste.</p>' : ''}
    <div class="btns"><button class="btn" data-act="startLesson" data-i="${idx}">${st ? 'Ripeti' : l.test ? 'Inizia la prova' : 'Inizia'}</button>${st && l.teach ? `<button class="btn ghost" data-act="startLessonTeach" data-i="${idx}">Rivedi la spiegazione</button>` : ''}</div></div>`;
}
function scrollToCurrent() { const n = $('.stone.current'); if (n) n.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
// le traduzioni si aprono con la prima declinazione
const canTranslate = (T) => T.has('n1');
function translateCards(T, withNew) {
  const on = canTranslate(T);
  const row = (m, icon, title, sub, dis) => `<li><button class="rowbtn" data-act="practice" data-m="${m}" ${dis ? 'disabled' : ''}><span class="ico">${icon}</span><span class="txt"><b>${title}</b><span>${sub}</span></span>${I.chev}</button></li>`;
  return `<div class="card flush"><ul class="list">${row('la_it', I.translate, 'Versione', 'Dal latino all’italiano', !on)}${row('it_la', I.pen, 'Retroversione', 'Dall’italiano al latino', !on)}${withNew ? row('nuove', I.spark, 'Frasi nuove', 'Create sul momento, sempre diverse', !on || !S.settings.gen) : ''}</ul></div>${on ? '' : '<p class="note">Le traduzioni si aprono con l’unità «Prima declinazione».</p>'}`;
}
function viewGym() {
  const T = sel();
  const p = S.prac;
  const units = UNITS.filter((u) => T.has(u.id) && u.id !== 'alf');
  const unit = p.unit && T.has(p.unit) ? p.unit : (units[units.length - 1] || UNITS[0]).id;
  const nErr = S.mistakes.length;
  const row = (act, m, icon, title, sub, extra = '', dis = false) => `<li><button class="rowbtn" data-act="${act}" ${m ? `data-m="${m}"` : ''} ${dis ? 'disabled' : ''}><span class="ico">${icon}</span><span class="txt"><b>${title}</b><span>${sub}</span></span>${extra}${I.chev}</button></li>`;
  return `<header class="page-head"><h1>Palestra</h1><p class="lede">Allenati come vuoi sugli argomenti che hai già aperto: traduzioni, forme e parole.</p></header>
    <section class="sec"><h2 class="sec-title">Traduzione</h2>
      <div class="card stack"><div class="field"><span class="label" id="lvLab">Difficoltà</span><div class="seg four" role="group" aria-labelledby="lvLab">${Object.entries(LEVELS).map(([k, l]) => `<button data-act="pracLevel" data-v="${k}" aria-pressed="${p.level === k}">${l.label}</button>`).join('')}</div></div><p class="note level-desc">${esc(LEVELS[p.level] ? LEVELS[p.level].desc : '')}</p></div>
      ${translateCards(T, true)}</section>
    <section class="sec"><h2 class="sec-title">Allenamento su misura</h2>
      <div class="card custom">
        ${units.length ? `<div class="field"><label for="pracUnit">Argomento</label><div class="select"><select id="pracUnit">${units.map((u) => `<option value="${u.id}" ${u.id === unit ? 'selected' : ''}>${esc(u.title)}</option>`).join('')}</select></div></div>` : '<p class="note">Gli argomenti si aprono facendo le lezioni del percorso.</p>'}
        <div class="field"><span class="label" id="tyLab">Esercizi</span><div class="seg four" role="group" aria-labelledby="tyLab">${[['misto', 'Misti'], ['frasi', 'Frasi'], ['forme', 'Forme'], ['parole', 'Parole']].map(([v, l]) => `<button data-act="pracType" data-v="${v}" aria-pressed="${p.type === v}">${l}</button>`).join('')}</div></div>
        <div class="setting"><div class="grow"><b>Solo parole già incontrate</b><span>Spegni per usare tutto il lessico degli argomenti aperti</span></div><label class="switch"><input type="checkbox" data-set="pracNarrow" ${p.wide ? '' : 'checked'} aria-label="Solo parole già incontrate"><i></i></label></div>
        <button class="btn big block" data-act="practice" data-m="${p.type}" ${units.length ? '' : 'disabled'}>Allenati</button></div></section>
    <section class="sec"><h2 class="sec-title">Altro</h2><div class="card flush"><ul class="list">
      ${row('practice', 'review', I.retry, 'Ripasso degli errori', nErr ? 'Le risposte sbagliate, da rifare' : 'Nessun errore da rivedere', nErr ? `<span class="count">${nErr}</span>` : '', !nErr)}
      ${row('practice', 'pronuncia', I.ear, 'Alfabeto e pronuncia', 'Lettura, sillabe e accento')}
      ${row('methodSheet', '', I.method, 'Il metodo', 'Otto passi per tradurre una frase')}</ul></div></section>`;
}
function viewLibrary() {
  let h = `<header class="page-head"><h1>Teoria</h1><p class="lede">Gli argomenti del biennio. Le tabelle dei paradigmi le genera il motore morfologico: niente errori di stampa.</p></header>
    <div class="card flush"><ul class="list"><li><button class="rowbtn" data-act="methodSheet"><span class="ico">${I.method}</span><span class="txt"><b>Il metodo per tradurre</b><span>Otto passi per non perdersi in una frase</span></span>${I.chev}</button></li></ul></div>`;
  for (const [gid, gdef] of Object.entries(GROUPS)) {
    const list = TOPICS.filter((t) => t.group === gid);
    if (!list.length) continue;
    h += `<section class="sec"><h2 class="sec-title">${esc(gdef.name)}</h2><div class="card flush"><ul class="list">${list.map((t) => `<li><button class="rowbtn" data-act="topic" data-t="${t.id}"><span class="num" aria-hidden="true">${ROMAN(TOPIC[t.id].n + 1)}</span><span class="txt"><b>${esc(t.title)}</b><span>${esc(t.desc)}</span></span>${I.chev}</button></li>`).join('')}</ul></div></section>`;
  }
  return h;
}
function viewTopic(id) {
  const t = TOPIC[id];
  const ui = unitIdx(id);
  return `<header class="page-head"><div class="row"><button class="iconbtn" data-act="tab" data-v="lib" aria-label="Torna alla teoria">${I.back}</button><span class="note">${esc(GROUPS[t.group].name)}, argomento ${ROMAN(t.n + 1)}</span></div>
    <h1>${esc(t.title)}</h1><p class="lede">${esc(t.desc)}</p>
    ${ui >= 0 && isUnlocked(firstLessonIdx(ui)) ? `<div><button class="btn small ghost" data-act="goUnit" data-u="${id}">${I.via}Vai all’unità nel percorso</button></div>` : ''}</header>
    <section class="card">${theoryHtml(t)}</section>`;
}
function viewWords() {
  const q = vocabQueue();
  const nDue = q.due.length + q.fresh.length;
  const learned = q.all.filter((e) => S.vocab[e.uid] && S.vocab[e.uid].box >= 3).length;
  const boxes = [1, 2, 3, 4, 5].map((b) => Object.values(S.vocab).filter((v) => v.box === b).length);
  return `<header class="page-head"><h1>Lessico</h1><p class="lede">${learned} parole imparate su ${q.all.length} incontrate nel percorso.</p></header>
    <section class="sec"><h2 class="sec-title">Ripasso di oggi</h2><div class="card stack"><p class="note">${nDue ? `${q.due.length} da ripassare, ${q.fresh.length} nuove` : 'Per oggi hai finito: torna domani.'}</p><div id="flash" class="flash"></div>
      <div class="boxes" aria-label="Scatole della ripetizione dilazionata">${boxes.map((n, i) => `<div class="box"><b>${n}</b><span>${['1 g', '3 gg', '7 gg', '14 gg', '30 gg'][i]}</span></div>`).join('')}</div>
      <p class="note">Ogni parola che sai passa alla scatola successiva e torna dopo più giorni; se la sbagli, riparte dalla prima.</p></div></section>
    <section class="sec"><h2 class="sec-title">Cerca una forma</h2><div class="card stack"><p class="note">Scrivi una parola latina, anche senza quantità: il motore la analizza.</p>
      <div class="search"><label class="sr" for="q">Forma latina</label><input id="q" class="typed la" lang="la" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="es. regum, amabatur, eius"><button class="btn" data-act="search" aria-label="Cerca">${I.lens}</button></div><div id="results"></div></div></section>`;
}
let flashCur = null;
function bindWords() {
  const q = vocabQueue();
  const list = q.due.concat(q.fresh);
  const f = $('#flash');
  const inp = $('#q');
  if (inp && !inp.dataset.bound) { inp.dataset.bound = '1'; inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); act('search'); } }); }
  if (!f) return;
  if (!list.length) { f.innerHTML = `${guide('happy', 80)}<p class="muted">Nessuna parola da ripassare adesso.</p>`; return; }
  flashCur = { e: list[0], shown: false };
  drawFlash();
}
function drawFlash() {
  const f = $('#flash'); if (!f || !flashCur) return;
  const e = flashCur.e;
  f.innerHTML = `<span class="la" lang="la">${esc(lemmaOf(e))}</span><div class="meaning">${flashCur.shown ? esc(e.it) : '<span class="muted">Ricordi il significato?</span>'}</div>
    ${flashCur.shown ? `<div class="btns"><button class="btn err" data-act="flash" data-v="0">Non lo sapevo</button><button class="btn ok" data-act="flash" data-v="1">Lo sapevo</button></div>` : `<div class="btns"><button class="btn" data-act="flashShow">Mostra</button><button class="btn ghost" data-act="speakText" data-w="${esc(e.head)}">${I.sound}Ascolta</button></div>`}`;
}
function searchForm() {
  const v = ($('#q').value || '').trim();
  const out = $('#results');
  if (!v) { out.innerHTML = ''; return; }
  const an = E.analyze(v);
  if (!an.length) { out.innerHTML = `<p class="muted">Forma non trovata nel lessico di Verto.</p>${S.settings.online ? wikiLink(v) : ''}`; return; }
  const groups = new Map();
  for (const a of an.slice(0, 40)) { if (!groups.has(a.e)) groups.set(a.e, []); groups.get(a.e).push(a); }
  out.innerHTML = `<ul class="analysis-list">${[...groups.entries()].map(([e, items]) => `<li><b class="la" lang="la">${esc(lemmaOf(e))}</b>: ${esc(e.it)}<ul>${uniq(items.map((a) => `${S.settings.quant ? a.q : a.f}: ${a.d}${a.enc ? ' + -' + a.enc : ''}`)).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="row">${e.k !== 'i' ? `<button class="tool" data-act="paradigm" data-u="${esc(e.uid)}">${I.table}Paradigma</button>` : ''}${S.settings.online ? wikiLink(e.head) : ''}</div></li>`).join('')}</ul>`;
}
function weekSvg() {
  const days = [...Array(7)].map((_, i) => addDays(dayKey(), i - 6));
  const vals = days.map((d) => S.days[d] || 0);
  const max = Math.max(S.goal, ...vals);
  const names = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  const gy = 92 - Math.round((S.goal / max) * 80);
  return `<svg class="week" viewBox="0 0 280 120" role="img" aria-label="XP degli ultimi sette giorni: ${vals.join(', ')}">${days.map((d, i) => {
    const hgt = Math.round((vals[i] / max) * 80);
    const [y, m, dd] = d.split('-').map(Number);
    return `<rect x="${i * 40 + 8}" y="${92 - hgt}" width="24" height="${Math.max(2, hgt)}" rx="6" fill="${vals[i] >= S.goal ? 'var(--good)' : 'var(--star)'}"/><text x="${i * 40 + 20}" y="110" text-anchor="middle" font-size="11" fill="var(--muted)">${names[new Date(y, m - 1, dd).getDay()]}</text>`;
  }).join('')}<line x1="0" x2="280" y1="${gy}" y2="${gy}" stroke="var(--muted)" stroke-dasharray="4 4" stroke-width="1"/></svg>`;
}
// insegna: moneta con il bordo perlinato e l'iniziale del nome latino
function medal(b, on) {
  const beads = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return `<circle cx="${(28 + Math.cos(a) * 24).toFixed(1)}" cy="${(28 + Math.sin(a) * 24).toFixed(1)}" r="1.6" fill="${on ? 'var(--star-d)' : 'var(--line-strong)'}"/>`; }).join('');
  return `<svg class="medal" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="27" fill="${on ? 'var(--star)' : 'var(--surface-2)'}"/>${beads}<circle cx="28" cy="28" r="20" fill="${on ? 'var(--star-soft)' : 'var(--surface)'}"/><text x="28" y="35" text-anchor="middle" font-family="Marcellus, Georgia, serif" font-size="20" fill="${on ? 'var(--star-d)' : 'var(--muted)'}">${esc(b.name.charAt(0))}</text></svg>`;
}
/* ---------- Salvataggio dei progressi ---------- */
const BADGE_IDS = () => BADGES.map((b) => b.id);
const LESSON_IDS = () => FLAT.map((f) => f.lesson.id);
const UNIT_IDS = () => UNITS.map((u) => u.id);
function sinceText(t) {
  if (!t) return 'mai';
  const d = daysBetween(dayKey(new Date(t)), dayKey());
  return d <= 0 ? 'oggi' : d === 1 ? 'ieri' : d + ' giorni fa';
}
function saveCard() {
  const old = !S.backupAt || Date.now() - S.backupAt > 7 * 864e5;
  return `<section class="card savecard"><div class="save-head"><span class="save-dot ${saveFailed ? 'bad' : ''}" aria-hidden="true">${saveFailed ? I.close : I.check}</span><div class="grow"><b>${saveFailed ? 'Il browser non permette di salvare' : 'Progressi salvati su questo dispositivo'}</b><span>${saveFailed ? 'Usa il codice di salvataggio prima di chiudere la pagina.' : `Si salvano da soli dopo ogni risposta (ultimo salvataggio: ${S.savedAt ? new Date(S.savedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : 'non ancora'}). Copia di sicurezza: ${sinceText(S.backupAt)}.`}</span></div></div>
    ${old && S.stats.lessons ? '<p class="note">Per non perderli se cambi telefono o cancelli i dati del browser, tieni da parte il codice di salvataggio.</p>' : ''}
    <div class="btns"><button class="btn" data-act="saveCode">Codice</button><button class="btn ghost" data-act="export">Scarica copia</button></div>
    <button class="linkbtn" data-act="restoreSheet">Ripristina da un codice o da un file</button></section>`;
}
function codeSheet(mode) {
  const code = SV.encode(S, LESSON_IDS(), BADGE_IDS(), UNIT_IDS());
  const body = mode === 'restore' ? '' : `<p>Il codice contiene percorso, stelle, punti, serie, insegne, impostazioni e nome. Copialo dove vuoi (note, messaggi, quaderno) e inseriscilo su un altro dispositivo, nel profilo o nella schermata di benvenuto.</p>
    <div class="savecode" id="savecode" tabindex="0" aria-label="Codice di salvataggio">${esc(code)}</div>
    <button class="btn block" data-act="copyCode">${I.cards}Copia il codice</button>
    <p class="note">Il ripasso degli errori e le schede del lessico restano solo nella copia su file.</p>`;
  openSheet(mode === 'restore' ? 'Ripristina i progressi' : 'Codice di salvataggio', body + `
    <div class="field"><label for="codeIn">Inserisci un codice</label><textarea id="codeIn" class="typed" rows="3" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Per esempio 1A2B-C3D4-…"></textarea><p class="note codemsg" id="codeMsg" role="status"></p></div>
    <div class="btns"><button class="btn" data-act="restoreCode">Ripristina dal codice</button><button class="btn ghost" data-act="import">Da file</button></div>`);
}
function applyRestore(part) {
  S = merge(Object.assign({}, part, { onboarded: true, v: 2 }));
  S.backupAt = Date.now();
  onb = null; syncTopics(); save(); applyTheme(); closeSheet(); VIEW = 'path'; render(); window.scrollTo(0, 0);
  toast('Progressi ripristinati.');
}
function viewMe() {
  const rk = rankOf(S.xp);
  const acc = S.stats.answered ? Math.round((S.stats.correct / S.stats.answered) * 100) : 0;
  const set = S.settings;
  const sw = (k, label, sub, on) => `<div class="setting"><div class="grow"><b>${label}</b><span>${sub}</span></div><label class="switch"><input type="checkbox" data-set="${k}" ${on ? 'checked' : ''} aria-label="${esc(label)}"><i></i></label></div>`;
  const cu = FLAT[currentIdx()];
  return `<header class="profile-head">${guide('happy', 72)}<div class="grow"><h1>${S.name ? esc(S.name) : 'Il tuo profilo'}</h1><p class="note"><span class="la" lang="la">${esc(rk.r.name)}</span>, ${esc(rk.r.it)}</p></div></header>
    <div class="stats3"><div class="stat c-flame">${I.flame}<b>${effectiveStreak()}</b><small>Serie</small></div><div class="stat c-star">${I.bolt}<b>${S.xp}</b><small>XP</small></div><div class="stat c-good">${I.check}<b>${acc}%</b><small>Precisione</small></div></div>
    <div class="sec">${saveCard()}</div>
    <section class="sec"><h2 class="sec-title">Ultimi sette giorni</h2><div class="card stack">${weekSvg()}<p class="note">Lezioni completate: ${S.stats.lessons}; unità superate: ${doneUnits()} su ${UNITS.length}; scudi: ${S.shields}.</p></div></section>
    <section class="sec"><h2 class="sec-title">Cursus honorum</h2><div class="card flush"><ul class="list">${RANKS.map((r, i) => `<li><div class="setting"><span class="la up nowrap" lang="la">${esc(r.name)}</span><div class="grow"><span>${esc(r.it)}, da ${r.xp} XP</span></div>${i <= rk.i ? I.check : ''}</div></li>`).join('')}</ul></div></section>
    <section class="sec"><h2 class="sec-title">Insegne</h2><div class="card"><div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? '' : 'off'}">${medal(b, !!S.badges[b.id])}<b lang="la">${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join('')}</div></div></section>
    <section class="sec"><h2 class="sec-title">Studio</h2><div class="card flush">
      <div class="setting"><div class="grow"><b>Posizione nel percorso</b><span>${esc(cu.unit.title)}: ${esc(cu.lesson.title)}</span></div><button class="btn small ghost" data-act="placement">Cambia</button></div>
      <div class="setting wrap"><div class="grow"><b>Obiettivo giornaliero</b><span>XP al giorno</span></div><div class="seg four" role="group" aria-label="Obiettivo giornaliero">${[30, 50, 80, 120].map((g) => `<button data-act="goal" data-v="${g}" aria-pressed="${S.goal === g}">${g}</button>`).join('')}</div></div>
      ${sw('quant', 'Mostra le quantità', 'Vocali lunghe segnate (ā, ē, ī…) in frasi, tabelle e lessico; se le scrivi sbagliate te lo segnalo, ma non conta', set.quant)}
      ${sw('input', 'Rispondi scrivendo', 'Nelle traduzioni usa la tastiera al posto delle tessere', set.input === 'keys')}
      ${sw('gen', 'Frasi generate', 'Oltre alle frasi verificate, frasi nuove create sul dispositivo', set.gen)}</div></section>
    <section class="sec"><h2 class="sec-title">Suoni e aspetto</h2><div class="card flush">
      ${sw('sound', 'Suoni', 'Segnali sonori per le risposte', set.sound)}
      ${sw('voice', 'Lettura ad alta voce', 'Pronuncia scolastica, con la voce italiana del dispositivo', set.voice)}
      <div class="setting wrap"><div class="grow"><b>Tema</b><span>Colori dell’app</span></div><div class="seg" role="group" aria-label="Tema">${[['auto', 'Automatico'], ['light', 'Chiaro'], ['dark', 'Scuro']].map(([v, l]) => `<button data-act="theme" data-v="${v}" aria-pressed="${set.theme === v}">${l}</button>`).join('')}</div></div></div></section>
    <section class="sec"><h2 class="sec-title">App e dati</h2><div class="card flush">
      ${sw('online', 'Wikizionario', 'Collegamento al dizionario online: si invia solo la parola cercata', set.online)}
      <div class="setting"><div class="grow"><b>Installa l’app</b><span>${isStandalone() ? 'Verto è già installata.' : 'Sul telefono funziona anche senza rete.'}</span></div><button class="btn small ghost" data-act="install" ${isStandalone() ? 'disabled' : ''}>Installa</button></div>
      <div class="setting"><div class="grow"><b>Nome</b><span>Facoltativo, resta sul dispositivo</span></div><button class="btn small ghost" data-act="rename">Cambia</button></div>
      <div class="setting"><div class="grow"><b>Azzera i progressi</b><span>Cancella tutto da questo dispositivo</span></div><button class="btn small err" data-act="reset">Azzera</button></div></div></section>
    <section class="sec"><h2 class="sec-title">Informazioni</h2><div class="card stack"><p class="note">Verto funziona tutto sul tuo dispositivo: nessun account, nessuna raccolta di dati, nessuna intelligenza artificiale. Caratteri: Lexend, Marcellus, Gentium Book Plus (licenza SIL OFL 1.1). Dizionario online facoltativo: Wikizionario (CC BY-SA).</p>
    <p class="note">${E.LEX.length} lemmi, ${UNITS.length} unità, ${FLAT.length} lezioni, ${BANK.length} frasi verificate, ${SENTENTIAE.length} massime.</p></div></section>`;
}
/* ---------- Benvenuto e posizione nel percorso ---------- */
let onb = null;
function placementList(selId, actName) {
  const color = (u) => (TOPIC[u.id] ? GROUPS[TOPIC[u.id].group].color : '');
  return `<div class="choices"><button class="choice zero" data-act="${actName}" data-u="" aria-pressed="${selId === ''}"><span class="num" aria-hidden="true">0</span><span class="grow"><b>Comincio da zero</b><span>Si parte dall’alfabeto e dalla pronuncia</span></span></button>
    ${UNITS.slice(0, -1).map((u, i) => `<button class="choice ${color(u)}" data-act="${actName}" data-u="${u.id}" aria-pressed="${selId === u.id}"><span class="num" aria-hidden="true">${ROMAN(i + 1)}</span><span class="grow"><b>Fino a: ${esc(u.title)}</b><span>Si riparte da «${esc(UNITS[i + 1].title)}»</span></span></button>`).join('')}</div>`;
}
function drawOnb() {
  onb = onb || { step: 0, name: S.name || '', place: '', goal: S.goal, quant: S.settings.quant };
  const steps = `<div class="steps" aria-hidden="true">${[0, 1, 2].map((i) => `<i class="${i <= onb.step ? 'on' : ''}"></i>`).join('')}</div>`;
  let h = `<div class="onb">${steps}`;
  if (onb.step === 0) {
    h += `<div class="onb-hero">${guide('cheer', 160)}<h1>VERTO</h1><p><span class="la" lang="la">Vertō, vertere</span>: «volgere», e per i Romani anche «tradurre». ${esc(G.intro)}</p></div>
      <div class="card field"><label for="nm">Come ti chiami? <span class="muted">(facoltativo)</span></label><input id="nm" class="typed" maxlength="24" autocomplete="off" value="${esc(onb.name)}" placeholder="Nome o soprannome"><p class="note">Tutto resta su questo dispositivo: nessun account, nessun dato inviato a nessuno.</p></div>
      <button class="btn big block" data-act="onbNext">Cominciamo</button>
      <button class="linkbtn" data-act="restoreSheet">Hai già usato Verto? Ripristina i progressi</button>`;
  } else if (onb.step === 1) {
    h += say('Fin dove sei arrivato in classe? Apro le unità che hai già studiato; le altre si aprono facendo le lezioni. Potrai cambiarlo dal profilo, anche tornando indietro.', 'think', 76) + placementList(onb.place, 'onbPlace') + `<button class="btn big block" data-act="onbNext">Avanti</button>`;
  } else {
    h += say('Ultime due scelte. Potrai cambiarle quando vuoi nel profilo.', 'happy', 76) + `<div class="card flush"><div class="setting wrap"><div class="grow"><b>Obiettivo giornaliero</b><span>Una lezione completa vale circa 100 XP</span></div><div class="seg four" role="group" aria-label="Obiettivo giornaliero">${[[30, 'Calmo'], [50, 'Normale'], [80, 'Serio'], [120, 'Intenso']].map(([g, l]) => `<button data-act="onbGoal" data-v="${g}" aria-pressed="${onb.goal === g}">${l}</button>`).join('')}</div></div>
      <div class="setting"><div class="grow"><b>Mostra le quantità</b><span>Facoltative: le vocali lunghe segnate con il trattino (rosā, amāre). Aiutano a leggere e a distinguere le forme.</span></div><label class="switch"><input type="checkbox" id="onbQuant" ${onb.quant ? 'checked' : ''} aria-label="Mostra le quantità"><i></i></label></div></div>
      <button class="btn big block" data-act="onbDone">Iniziamo il viaggio</button>`;
  }
  h += `${onb.step ? '<button class="btn ghost block" data-act="onbBack">Indietro</button>' : ''}</div>`;
  $('#app').innerHTML = h;
  window.scrollTo(0, 0);
}
function placementSheet() {
  const cu = FLAT[currentIdx()];
  openSheet('Posizione nel percorso', say(`Ora sei a «${esc(cu.unit.title)}». Scegli fin dove hai studiato in classe: le unità fino a lì si aprono, le stelle già guadagnate restano.`, 'think', 64) + placementList(null, 'setPlace'));
}
/* ---------- Installazione ---------- */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); deferredPrompt = ev; });
window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('Verto è installata.'); });
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function installFlow() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; render(); }); return; }
  if (isIOS()) { showModal(`${guide('happy', 80)}<h2>Installa su iPhone o iPad</h2><ol><li>Apri questa pagina con <b>Safari</b>.</li><li>Tocca <b>Condividi</b>.</li><li>Scegli <b>Aggiungi alla schermata Home</b>.</li><li>Tocca <b>Aggiungi</b>: l’icona di Verto comparirà tra le app.</li></ol><button class="btn block" data-act="closeModal">Ho capito</button>`); return; }
  showModal(`${guide('happy', 80)}<h2>Installa l’app</h2><p>Su Android apri il menu del browser (⋮) e scegli <b>Installa app</b> o <b>Aggiungi a schermata Home</b>. Sul computer usa l’icona di installazione nella barra dell’indirizzo.</p>${SITE ? '' : '<p class="note">L’installazione richiede la versione pubblicata sul sito; questo file si apre comunque in qualunque browser, anche senza rete.</p>'}<button class="btn block" data-act="closeModal">Ho capito</button>`);
}
/* ---------- Azioni ---------- */
function hint() {
  const s = SES.cur.it.s;
  const toks = s.tokens || [];
  const verb = toks.find((t) => /^v:(ind|cong|imp):/.test(t.key));
  const subj = toks.find((t) => /^(n|p|a:\w+):nom:/.test(t.key) && t !== verb);
  let txt = '';
  if (verb) { const e = ent(verb.uid); const f = e.forms.find((x) => x.key === verb.key); txt += `Il verbo è <span class="la" lang="la">${esc(verb.w)}</span>: ${esc(f ? f.d : '')} di <span class="la" lang="la">${esc(headOf(e))}</span> («${esc(shortM(e.it))}»). `; }
  if (subj && SES.cur.it.type === 'la_it') txt += `Cerca il soggetto al nominativo: forse <span class="la" lang="la">${esc(subj.w)}</span>. `;
  if (SES.cur.it.type === 'it_la') txt += 'Metti il verbo di solito in fondo, e controlla le desinenze dei casi. ';
  if (!txt) txt = esc(s.tip || 'Parti dal verbo, poi cerca il soggetto al nominativo e l’oggetto all’accusativo.');
  $('#aux').innerHTML = say(txt, 'think', 56);
}
function rerenderKeep(focusSel) { const y = window.scrollY; render(); window.scrollTo(0, y); const b = focusSel && $(focusSel); if (b) b.focus({ preventScroll: true }); }
function act(name, el) { if (ACT[name]) ACT[name](el); }
const ACT = {
  tab: (el) => { VIEW = el.dataset.v; openStone = null; render(); window.scrollTo(0, 0); const m = $('#main'); if (m) m.focus({ preventScroll: true }); },
  jump: () => scrollToCurrent(),
  stone: (el) => { const i = +el.dataset.i; openStone = openStone === i ? null : i; rerenderKeep(`.stone[data-i="${i}"]`); },
  startLesson: (el) => { openStone = null; startLesson(+el.dataset.i); },
  startLessonTeach: (el) => { openStone = null; startLesson(+el.dataset.i, { teach: true }); },
  unlockUnit: (el) => { const ui = +el.dataset.u; askConfirm(`Aprire «${UNITS[ui].title}»? Fallo se l’hai già studiata in classe.`, 'Apri', () => { S.course.unlocked = Math.max(S.course.unlocked, firstLessonIdx(ui)); syncTopics(); save(); openStone = null; render(); setTimeout(scrollToCurrent, 60); }); },
  goUnit: (el) => { VIEW = 'path'; render(); const u = $('#unit-' + el.dataset.u); if (u) u.scrollIntoView({ block: 'start' }); },
  practice: (el) => startPractice(el.dataset.m),
  pracLevel: (el) => { S.prac.level = el.dataset.v; save(); rerenderKeep(`[data-act="pracLevel"][data-v="${el.dataset.v}"]`); },
  pracType: (el) => { S.prac.type = el.dataset.v; save(); rerenderKeep(`[data-act="pracType"][data-v="${el.dataset.v}"]`); },
  topic: (el) => { VIEW = 'topic:' + el.dataset.t; openStone = null; render(); window.scrollTo(0, 0); },
  quit: () => { const go = () => { const y = SES ? SES.backY : 0; SES = null; closeOverlay(); render(); window.scrollTo(0, y); }; if (SES && SES.i > 0 && !SES.done) askConfirm('Vuoi davvero uscire? I progressi di questa lezione andranno persi.', 'Esci', go, true, 'sad'); else go(); },
  modalOk: () => { const i = $('#mdIn'); const v = i ? i.value : true; const cb = modalCb; modalCb = null; closeModal(); if (cb) cb(v); },
  check: () => doCheck(),
  next: () => { SES.i++; renderItem(); },
  retry: () => { const i = SES.idx; SES = null; closeOverlay(); startLesson(i, { teach: false }); },
  startReview: () => { SES = null; closeOverlay(); startPractice('review'); },
  endSession: () => endSession(),
  tile: (el) => { const c = SES.cur; if (c.answered) return; const k = +el.dataset.k; if (c.chosen.includes(k)) return; c.chosen.push(k); sfx.tap(); refreshAnswer(); },
  untile: (el) => { const c = SES.cur; if (c.answered) return; c.chosen.splice(+el.dataset.j, 1); refreshAnswer(); },
  pick: (el) => pickOption(+el.dataset.k),
  mL: (el) => { const c = SES.cur; if (c.answered || el.disabled) return; $$('[data-act="mL"]').forEach((b) => b.classList.remove('sel')); el.classList.add('sel'); c.selL = +el.dataset.i; sfx.tap(); matchStep(); },
  mR: (el) => { const c = SES.cur; if (c.answered || el.disabled) return; $$('[data-act="mR"]').forEach((b) => b.classList.remove('sel')); el.classList.add('sel'); c.selR = +el.dataset.i; sfx.tap(); matchStep(); },
  self: (el) => { const c = SES.cur; const d = c.selfData; c.answered = false; if (el.dataset.v === '1' && c.it.s) c.it.s.it.push(d.ans); finalize({ ok: el.dataset.v === '1', sol: d.sol, given: d.ans, typed: true, self: true }); },
  toggleInput: (el) => { const c = SES.cur; if (c.answered) return; c.inputMode = c.inputMode === 'tiles' ? 'keys' : 'tiles'; c.chosen = []; $('#ansWrap').innerHTML = answerArea(c.it); el.outerHTML = inputToggle(); refreshAnswer(); const t = $('#typed'); if (t) t.focus({ preventScroll: true }); },
  macron: (el) => { const t = $('#typed'); if (!t || t.readOnly) return; const a = t.selectionStart ?? t.value.length; const before = t.value.slice(0, a); const last = before.slice(-1); const base = { 'ā': 'a', 'ē': 'e', 'ī': 'i', 'ō': 'o', 'ū': 'u' }[el.dataset.v]; const repl = last.toLowerCase() === base ? (last === base ? el.dataset.v : el.dataset.v.toUpperCase()) : null; t.value = repl ? before.slice(0, -1) + repl + t.value.slice(a) : before + el.dataset.v + t.value.slice(a); const p = repl ? a : a + 1; t.setSelectionRange(p, p); t.focus(); const b = $('#checkBtn'); if (b) b.disabled = !t.value.trim(); },
  word: (el) => { const it = SES && SES.cur && SES.cur.it; const s = it && it.s; if (!s) return; const tok = (s.tokens || [])[+el.dataset.i]; if (tok) wordPop(el, tok); },
  speak: () => speak(SES.cur.it.s.la),
  speakSent: () => speak(SES.cur.it.s.la),
  speakForm: () => speak(SES.cur.it.form || SES.cur.it.word),
  speakText: (el) => speak(el.dataset.w),
  method: (el) => { const on = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', on); $$('#ovBody .w.vb').forEach((w) => w.classList.toggle('verb', on)); $('#aux').innerHTML = on ? say(`I verbi sono evidenziati: tanti verbi, tante proposizioni. Poi cerca il soggetto al nominativo e l’oggetto all’accusativo. <button class="tool" data-act="methodSheet">${I.method}Tutti i passi</button>`, 'think', 56) : ''; },
  methodSheet: () => methodSheet(),
  hint: () => hint(),
  theory: (el) => theorySheet(el.dataset.t),
  analysis: () => analysisSheet(SES.cur.it.s),
  paradigm: (el) => { closePop(); const e = ent(el.dataset.u); if (e) paradigmSheet(e); },
  closeSheet: () => closeSheet(),
  closeModal: () => closeModal(),
  placement: () => placementSheet(),
  setPlace: (el) => {
    const before = S.course.unlocked, u = el.dataset.u || null;
    const apply = () => { placeAt(u); save(); closeSheet(); render(); window.scrollTo(0, 0); toast('Percorso aggiornato.'); };
    const ui = u ? unitIdx(u) : -1;
    const target = ui < 0 ? 0 : Math.min(FLAT.length - 1, lastLessonIdx(ui) + 1);
    if (target < before) { closeSheet(); askConfirm(ui < 0 ? 'Ricominciare dall’alfabeto? Le unità successive si richiudono; stelle e punti restano salvati.' : `Tornare a «${UNITS[Math.min(UNITS.length - 1, ui + 1)].title}»? Le unità successive si richiudono; stelle e punti restano salvati.`, 'Conferma', apply); }
    else apply();
  },
  goal: (el) => { S.goal = +el.dataset.v; save(); rerenderKeep(`[data-act="goal"][data-v="${el.dataset.v}"]`); },
  theme: (el) => { S.settings.theme = el.dataset.v; save(); applyTheme(); rerenderKeep(`[data-act="theme"][data-v="${el.dataset.v}"]`); },
  install: () => installFlow(),
  rename: () => askText('Il tuo nome (facoltativo)', S.name, (n) => { S.name = String(n).trim().slice(0, 24); save(); render(); }),
  saveCode: () => { S.backupAt = Date.now(); save(); codeSheet('save'); },
  restoreSheet: () => codeSheet('restore'),
  copyCode: () => {
    const el = $('#savecode'); if (!el) return;
    const done = () => toast('Codice copiato.');
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(el); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); toast('Codice selezionato: copialo con Copia.'); };
    try { navigator.clipboard.writeText(el.textContent.trim()).then(done, fallback); } catch (e) { fallback(); }
  },
  restoreCode: () => {
    const v = ($('#codeIn') || {}).value || '';
    const msg = $('#codeMsg');
    let part;
    try { part = SV.decode(v, LESSON_IDS(), BADGE_IDS(), UNIT_IDS()); } catch (e) { if (msg) { msg.textContent = e.message; msg.classList.add('bad'); } return; }
    const go = () => applyRestore(part);
    if (S.onboarded && (S.xp || S.stats.lessons)) { closeSheet(); askConfirm('Sostituire i progressi di questo dispositivo con quelli del codice?', 'Ripristina', go); } else go();
  },
  export: () => { const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'verto-progressi-' + dayKey() + '.json'; S.backupAt = Date.now(); save(); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); toast('Copia scaricata: conservala in un posto sicuro.'); },
  import: () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json,.json'; i.onchange = () => { const f = i.files[0]; if (!f) return; f.text().then((t) => { try { const d = JSON.parse(t); if (d && d.v === 2 && d.course) applyRestore(d); else toast('Il file non è una copia di Verto.'); } catch (e) { toast('Il file non è una copia di Verto.'); } }); }; i.click(); },
  reset: () => askConfirm('Cancellare tutti i progressi da questo dispositivo?', 'Cancella', () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ } S = DEFAULT(); onb = null; applyTheme(); render(); }, true, 'sad'),
  search: () => searchForm(),
  flashShow: () => { flashCur.shown = true; drawFlash(); },
  flash: (el) => { srs(flashCur.e.uid, el.dataset.v === '1'); if (el.dataset.v === '1') addXP(1); save(); bindWords(); },
  onbNext: () => { if (onb.step === 0) onb.name = ($('#nm').value || '').trim().slice(0, 24); onb.step++; drawOnb(); },
  onbBack: () => { onb.step--; drawOnb(); },
  onbPlace: (el) => { onb.place = el.dataset.u; drawOnb(); const b = $(`[data-act="onbPlace"][data-u="${onb.place}"]`); if (b) b.focus(); },
  onbGoal: (el) => { onb.goal = +el.dataset.v; const q = $('#onbQuant'); if (q) onb.quant = q.checked; drawOnb(); },
  onbDone: () => {
    const q = $('#onbQuant');
    S.name = onb.name; S.goal = onb.goal; S.settings.quant = q ? q.checked : onb.quant;
    placeAt(onb.place || null);
    S.onboarded = true; save(); onb = null; VIEW = 'path'; render(); window.scrollTo(0, 0);
  },
};

/* ---------- Eventi ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  const pop = $('#pop');
  if (pop && !ev.target.closest('#pop') && !(el && el.dataset.act === 'word')) closePop();
  if (!el || el.disabled) return;
  if (ACT[el.dataset.act]) { ev.preventDefault(); ACT[el.dataset.act](el); }
});
document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (t.id === 'pracUnit') { S.prac.unit = t.value; save(); return; }
  if (!t.dataset.set) return;
  const k = t.dataset.set;
  if (k === 'input') S.settings.input = t.checked ? 'keys' : 'tiles';
  else if (k === 'pracNarrow') S.prac.wide = !t.checked;
  else S.settings[k] = t.checked;
  save();
  if (k === 'quant') rerenderKeep(`[data-set="quant"]`);
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') { if ($('#pop')) closePop(); else if ($('#modal')) closeModal(); else if ($('#sheet')) closeSheet(); else if (openStone != null) { openStone = null; rerenderKeep(); } return; }
  if (ev.target && ev.target.id === 'typed') {
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); if (SES && SES.cur && SES.cur.answered) { if ($('#nextBtn')) act('next'); } else act('check'); }
    return;
  }
  if (!SES || !$('#ov') || $('#modal') || $('#sheet')) return;
  if (ev.target.closest && ev.target.closest('input,textarea')) return;
  if (/^[1-5]$/.test(ev.key) && SES.cur && !SES.cur.answered && $$('#ovBody .opt').length >= +ev.key) { ev.preventDefault(); pickOption(+ev.key - 1); return; }
  if (ev.key === 'Enter' && !ev.target.closest('button')) {
    ev.preventDefault();
    if (SES.done) act('endSession');
    else if ((SES.cur.answered && $('#nextBtn')) || SES.cur.it.type === 'teach') act('next');
    else if (!SES.cur.answered) act('check');
  }
});
document.addEventListener('input', (ev) => { if (ev.target.id === 'typed') { const b = $('#checkBtn'); if (b) b.disabled = !ev.target.value.trim(); } });
window.addEventListener('resize', closePop);
window.addEventListener('scroll', () => { closePop(); updateJump(); }, { passive: true });
function updateJump() {
  const j = $('#jump'), n = $('.stone.current');
  if (!j || !n) return;
  const r = n.getBoundingClientRect();
  const off = r.bottom < 70 || r.top > innerHeight - 90;
  // in cima c'è già la scheda «Continua»: il pulsante serve solo dopo aver scorso il percorso
  const res = $('.resume');
  j.hidden = !off || (res && res.getBoundingClientRect().bottom > 0);
}

/* ---------- Avvio ---------- */
// anteprima per le prove e le schermate: #demo=12&view=gym&theme=dark (stato dimostrativo, mai salvato)
const HASH = Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map((kv) => kv.split('=')));
function demoState(n) {
  const today = dayKey();
  const stars = {};
  FLAT.slice(0, n).forEach((f, i) => { stars[f.lesson.id] = 1 + ((i * 7 + 3) % 3 === 0 ? 1 : 2); });
  const days = {};
  [6, 5, 4, 3, 2, 1, 0].forEach((k, i) => { days[addDays(today, -k)] = [40, 0, 85, 60, 55, 90, 35][i]; });
  S = merge({ onboarded: true, name: 'Livia', xp: 1240, streak: 5, lastDay: today, shields: 1, days, goal: 50, course: { unlocked: n, stars, times: Object.fromEntries(Object.keys(stars).map((k) => [k, 1])) }, stats: { lessons: n, answered: 300, correct: 262, translated: 80, forms: 60, sessions: n + 4 } });
  S.badges = { primus: today, lector: today, perfecta: today, centuria: today };
  syncTopics();
}
function boot() {
  E.loadLexicon(window.VERTO_LEX);
  if (HASH.seed) { let a = +HASH.seed; LS.init({ rand: () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; } }); }
  if (HASH.demo != null) { NOSAVE = true; demoState(Math.min(FLAT.length - 1, +HASH.demo || 0)); if (HASH.quant) S.settings.quant = HASH.quant === '1'; if (HASH.view) VIEW = decodeURIComponent(HASH.view); }
  else if (HASH.onb != null) { NOSAVE = true; onb = { step: Math.min(2, +HASH.onb || 0), name: '', place: '', goal: 50, quant: false }; }
  else load();
  if (NOSAVE && HASH.theme) S.settings.theme = HASH.theme;
  try { if (!NOSAVE && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* ignora */ }
  applyTheme();
  const mq = matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', applyTheme);
  render();
  if (NOSAVE && HASH.lesson != null) { startLesson(+HASH.lesson, { teach: true }); if (HASH.step) { SES.i = Math.min(SES.items.length - 1, +HASH.step); renderItem(); } }
  try { if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } } catch (e) { /* ignora */ }
  if (SITE && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
}
// per la verifica automatica nel browser
window.VertoApp = { S: () => S, ses: () => SES, cur: () => SES && SES.cur, startLesson, startPractice, FLAT, render, set: (o) => { Object.assign(S, o); save(); render(); }, setVIEW: (v) => { VIEW = v; render(); } };
// prima si mostra la schermata di avvio, poi si prepara il lessico (qualche centinaio di millisecondi su un telefono)
// in una scheda in secondo piano il primo disegno non arriva: si parte comunque dopo un attimo
let booted = false;
const go = () => { if (!booted) { booted = true; boot(); } };
requestAnimationFrame(() => setTimeout(go, 0));
setTimeout(go, 150);
})();
