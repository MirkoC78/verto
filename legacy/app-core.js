/* VERTO — nucleo: utilità, icone, stato, progressi, gamification, Claude */
'use strict';
const E = window.VertoEngine;
E.loadLexicon(window.VERTO_LEX);
const { TOPICS, GROUPS, METHOD, SENTENTIAE, RANKS } = window.VERTO_TOPICS;
const TOPIC = Object.fromEntries(TOPICS.map((t, i) => [t.id, { ...t, n: i + 1 }]));
const ORDER = TOPICS.map((t) => t.id);
/* Claude è disponibile solo quando la pagina è aperta dentro Claude */
const HAS_CLAUDE = !!(window.claude && typeof window.claude.use === 'function');

/* ---------- Utilità ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = (a) => [...new Set(a)];
function weighted(items, w) {
  const ws = items.map(w); const tot = ws.reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}
function dayKey(d = new Date()) { const z = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
function addDays(k, n) { const [y, m, d] = k.split('-').map(Number); const t = new Date(y, m - 1, d + n); return dayKey(t); }
function daysBetween(a, b) { const [y1, m1, d1] = a.split('-').map(Number); const [y2, m2, d2] = b.split('-').map(Number); return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 864e5); }
function hashStr(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }

/* Normalizzazione e confronto */
function normIt(s) {
  return String(s).toLowerCase().replace(/[’`´]/g, "'").normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/'/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function normLa(s) { return E.norm(String(s).replace(/_/g, ' ')).replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
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
function sim(a, b) { if (!a && !b) return 1; return 1 - lev(a, b) / Math.max(a.length, b.length); }
function simLoose(a, b) {
  const sa = a.split(' ').sort().join(' '), sb = b.split(' ').sort().join(' ');
  return Math.max(sim(a, b), sim(sa, sb) * 0.96);
}

/* ---------- Icone ---------- */
const I = {
  domus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 4l9 5.5"/><path d="M4 9.5h16"/><path d="M6 12v6M10 12v6M14 12v6M18 12v6"/><path d="M3.5 20.5h17"/></svg>',
  scroll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10a2 2 0 0 1 2 2v12"/><path d="M5 6a2 2 0 1 1 4 0v12a2 2 0 1 0 4 0"/><path d="M13 18a2 2 0 0 0 2 2h4a2 2 0 0 0 0-4h-6"/><path d="M11 8h5M11 11h5"/></svg>',
  tabula: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9.5h10M7 12.5h7M7 15.5h9"/></svg>',
  ego: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.6 2.3c.3 2.9-1 4.6-2.4 6.2C8.7 10.2 7 12 7 14.9 7 18.3 9.3 21 12.2 21c3.3 0 5.8-2.6 5.8-6.2 0-2.6-1.3-4.5-2.6-5.7.1 1.7-.5 3-1.6 3.6.4-3.6-.4-7.1-1.2-9.4Z"/></svg>',
  gem: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 6.5 17.5 12 12 17.5 6.5 12z" fill="#fff" opacity=".35"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6 9 12l6 6"/></svg>',
  keys: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10"/></svg>',
  tiles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c.5 4.6 2.4 6.9 7 7.5-4.6.6-6.5 2.9-7 7.5-.5-4.6-2.4-6.9-7-7.5 4.6-.6 6.5-2.9 7-7.5Z"/><path d="M19 15c.2 1.8.9 2.7 2.6 3-1.7.3-2.4 1.2-2.6 3-.2-1.8-.9-2.7-2.6-3 1.7-.3 2.4-1.2 2.6-3Z"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5M12 17.5h.01"/></svg>',
  open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V19c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V20"/></svg>',
  translate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h9M8.5 4v2c0 4-2 7-5 8.5"/><path d="M6 10c1 2.5 3 4 5.5 4.5"/><path d="m13 20 4-9 4 9M14.5 17h5"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18z"/><path d="M14 6.5l3 3"/></svg>',
  magnify: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5"/></svg>',
  table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/></svg>',
  cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="6" y="3.5" width="13" height="16" rx="2" transform="rotate(8 12 12)"/><rect x="4" y="5" width="13" height="16" rx="2"/></svg>',
  retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/></svg>',
  method: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
};

/* ---------- Stato ---------- */
const KEY = 'verto.v1';
const DEFAULT = () => ({
  v: 1, onboarded: false, name: '', topics: [], goal: 60, xp: 0, days: {}, streak: 0, lastDay: null, freezes: 0,
  mastery: {}, mistakes: [], badges: {}, vocab: {}, recent: [], aiPool: [], genSaved: [], reported: [], extraIt: {},
  stats: { answered: 0, correct: 0, sessions: 0, perfect: 0, forms: 0, typedOK: 0, translated: 0, aiSeen: 0, genSeen: 0, types: {}, clearedReview: 0 },
  settings: { sound: true, ai: true, input: 'tiles', online: true, gen: true },
});
let S = DEFAULT();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    const def = DEFAULT();
    S = { ...def, ...d, stats: { ...def.stats, ...(d.stats || {}) }, settings: { ...def.settings, ...(d.settings || {}) } };
  } catch (e) { /* archiviazione non disponibile */ }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignora */ } }
const sel = () => new Set(S.topics);

/* ---------- Progressi ---------- */
function todayXP() { return S.days[dayKey()] || 0; }
function effectiveStreak() {
  if (!S.lastDay) return 0;
  const gap = daysBetween(S.lastDay, dayKey());
  if (gap <= 1) return S.streak;
  if (gap === 2 && S.freezes > 0) return S.streak;
  return 0;
}
function touchStreak() {
  const t = dayKey();
  if (S.lastDay === t) return false;
  const gap = S.lastDay ? daysBetween(S.lastDay, t) : 99;
  if (gap === 1) S.streak += 1;
  else if (gap === 2 && S.freezes > 0) { S.freezes -= 1; S.streak += 1; toastLater('Uno scudo ha protetto la tua serie.'); }
  else S.streak = 1;
  S.lastDay = t;
  if (S.streak % 7 === 0 && S.freezes < 2) S.freezes += 1;
  return true;
}
function addXP(n) {
  n = Math.max(0, Math.round(n));
  const before = rankOf(S.xp);
  S.xp += n;
  const k = dayKey();
  S.days[k] = (S.days[k] || 0) + n;
  const after = rankOf(S.xp);
  return after.i > before.i ? after : null;
}
function rankOf(xp) {
  let i = 0;
  for (let j = 0; j < RANKS.length; j++) if (xp >= RANKS[j].xp) i = j;
  const next = RANKS[i + 1];
  return { ...RANKS[i], i, next, pct: next ? (xp - RANKS[i].xp) / (next.xp - RANKS[i].xp) : 1 };
}
function mastery(t) {
  const a = S.mastery[t];
  if (!a || !a.length) return 0;
  const w = a.slice(-20);
  const conf = Math.min(1, w.length / 8);
  return (w.reduce((x, y) => x + y, 0) / w.length) * conf;
}
function recordMastery(t, ok) {
  if (!t) return;
  (S.mastery[t] = S.mastery[t] || []).push(ok ? 1 : 0);
  if (S.mastery[t].length > 30) S.mastery[t] = S.mastery[t].slice(-30);
}
function focusOf(tags) { const T = new Set(tags); return ORDER.filter((t) => T.has(t)).pop() || tags[0]; }

/* ---------- Insignia ---------- */
const BADGES = [
  { id: 'primus', glyph: 'I', name: 'Primus gradus', desc: 'Completa il primo allenamento.', test: () => S.stats.sessions >= 1 },
  { id: 'septem', glyph: 'VII', name: 'Septem dies', desc: 'Una serie di 7 giorni.', test: () => S.streak >= 7 },
  { id: 'mensis', glyph: 'XXX', name: 'Mensis', desc: 'Una serie di 30 giorni.', test: () => S.streak >= 30 },
  { id: 'perfecta', glyph: 'P', name: 'Sine errore', desc: 'Un allenamento senza errori.', test: () => S.stats.perfect >= 1 },
  { id: 'centuria', glyph: 'C', name: 'Centuria', desc: '100 risposte corrette.', test: () => S.stats.correct >= 100 },
  { id: 'legio', glyph: 'D', name: 'Legio', desc: '500 risposte corrette.', test: () => S.stats.correct >= 500 },
  { id: 'interpres', glyph: 'IN', name: 'Interpres', desc: '100 frasi tradotte correttamente.', test: () => S.stats.translated >= 100 },
  { id: 'grammaticus', glyph: 'G', name: 'Grammaticus', desc: '50 forme analizzate o scritte bene.', test: () => S.stats.forms >= 50 },
  { id: 'orator', glyph: 'O', name: 'Orator', desc: '10 traduzioni scritte a tastiera e corrette.', test: () => S.stats.typedOK >= 10 },
  { id: 'lexicographus', glyph: 'L', name: 'Lexicographus', desc: '50 parole imparate nel lessico.', test: () => Object.values(S.vocab).filter((v) => v.box >= 3).length >= 50 },
  { id: 'omnia', glyph: 'VI', name: 'Omnia probavi', desc: 'Prova tutti e sei i tipi di esercizio.', test: () => Object.keys(S.stats.types).length >= 6 },
  { id: 'novae', glyph: 'N', name: 'Res novae', desc: 'Traduci 10 frasi nuove, create sul momento.', test: () => (S.stats.aiSeen || 0) + (S.stats.genSeen || 0) >= 10 },
  { id: 'emendator', glyph: 'E', name: 'Emendator', desc: 'Svuota il ripasso degli errori.', test: () => S.stats.clearedReview >= 1 },
  { id: 'noctua', glyph: 'NX', name: 'Noctua', desc: 'Allenati dopo le 22.', test: () => false },
  { id: 'aurora', glyph: 'AV', name: 'Aurora', desc: 'Allenati prima delle 8.', test: () => false },
  { id: 'consul', glyph: 'COS', name: 'Consul', desc: 'Raggiungi il grado di console.', test: () => S.xp >= 3000 },
];
function checkBadges(extra = {}) {
  const won = [];
  for (const b of BADGES) {
    if (S.badges[b.id]) continue;
    if (b.test() || extra[b.id]) { S.badges[b.id] = dayKey(); won.push(b); }
  }
  return won;
}

/* ---------- Suoni ---------- */
let AC = null;
function tone(freqs, dur = 0.12, type = 'sine', gap = 0.09, vol = 0.12) {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime;
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * gap);
      g.gain.exponentialRampToValueAtTime(vol, t0 + i * gap + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * gap + dur);
      o.connect(g).connect(AC.destination); o.start(t0 + i * gap); o.stop(t0 + i * gap + dur + 0.05);
    });
  } catch (e) { /* audio non disponibile */ }
}
const sfx = {
  ok: () => tone([784, 1175], 0.16, 'triangle', 0.08),
  err: () => tone([196, 156], 0.18, 'sawtooth', 0.1, 0.05),
  tap: () => tone([660], 0.05, 'sine', 0, 0.04),
  done: () => tone([523, 659, 784, 1047], 0.22, 'triangle', 0.11),
};
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* ignora */ } }

/* ---------- Coriandoli di tessere ---------- */
function confetti() {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const x = c.getContext('2d'); x.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--g-nom', '--g-ver', '--g-pro', '--g-sin', '--gold', '--ok'].map((v) => cs.getPropertyValue(v).trim());
  const P = Array.from({ length: 90 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 9, vy: -Math.random() * 11 - 4, s: 6 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: pick(cols) }));
  let t = 0;
  (function f() {
    x.clearRect(0, 0, innerWidth, innerHeight);
    P.forEach((p) => { p.vy += .32; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); x.restore(); });
    if (++t < 140) requestAnimationFrame(f); else c.remove();
  })();
}

/* ---------- Avvisi ---------- */
let toastQueue = [];
function toast(msg, ms = 2600) {
  if (!msg) return;
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  box.appendChild(el); setTimeout(() => el.remove(), ms);
}
function toastLater(msg) { toastQueue.push(msg); }
function flushToasts() { const q = toastQueue; toastQueue = []; q.forEach((m, i) => setTimeout(() => toast(m), i * 2800)); }

/* ---------- Claude (capacità sample) ---------- */
const AI = { fn: null, state: 'checking', ready: false };
const AI_ERR = {
  not_granted: 'Claude non è autorizzato per questa pagina. Le frasi verificate restano disponibili.',
  sampling_disabled: 'Claude non è disponibile per questo account.',
  rate_limited: 'Troppe richieste a Claude: riprova tra qualche minuto.',
  session_expired: 'Accedi di nuovo a Claude per usare le correzioni.',
  invalid_json: 'La risposta di Claude non era leggibile. Riprova.',
  refused: 'Claude non ha risposto a questa richiesta.',
  upstream_error: 'Collegamento con Claude interrotto. Riprova.',
};
function aiUsable() { return AI.fn && S.settings.ai && AI.state === 'ready'; }
function aiFail(e) {
  const code = e && e.code;
  if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code)) { AI.state = 'denied'; }
  else if (code === 'rate_limited') { AI.state = 'limited'; setTimeout(() => { if (AI.state === 'limited') { AI.state = 'ready'; refreshAIBits(); } }, 120000); }
  refreshAIBits();
  return AI_ERR[code] || (code === 'cancelled' ? '' : AI_ERR.upstream_error);
}
async function initAI() {
  try {
    if (!window.claude || !window.claude.use) { AI.state = 'off'; return refreshAIBits(); }
    const fn = await window.claude.use('sample');
    AI.fn = fn; AI.state = fn ? 'ready' : 'off';
  } catch (e) { AI.state = 'off'; }
  refreshAIBits();
}
function refreshAIBits() { if (typeof onAIState === 'function') onAIState(); }

function topicLines(ids) { return ids.map((id) => '- ' + TOPIC[id].title + ': ' + TOPIC[id].desc).join('\n'); }
function lexiconFor(ids, max = 140) {
  const T = new Set(ids);
  const ents = E.LEX.filter((e) => T.has(e.t) && e.k !== 'i' && !(e.prop));
  const byRecent = shuffle(ents).sort((a, b) => ORDER.indexOf(b.t) - ORDER.indexOf(a.t));
  return byRecent.slice(0, max).map((e) => e.head + ' = ' + e.it.split(';')[0]).join('; ');
}
async function aiGenerate(n, focusIds) {
  const ids = ORDER.filter((t) => S.topics.includes(t));
  const not = ORDER.filter((t) => !S.topics.includes(t));
  const len = ids.length < 6 ? '3-6' : ids.length < 14 ? '4-9' : '5-12';
  const prompt = `Sei un docente di latino del biennio del liceo. Componi ${n} frasi latine originali per un esercizio di traduzione.

ARGOMENTI CHE LO STUDENTE CONOSCE (usa solo forme e costrutti compresi qui):
${topicLines(ids)}
${not.length ? '\nNON usare forme o costrutti di questi argomenti, non ancora studiati: ' + not.map((t) => TOPIC[t].title).join('; ') + '.' : ''}
Metti in evidenza soprattutto: ${focusIds.map((t) => TOPIC[t].title).join('; ')}.

LESSICO: usa preferibilmente queste parole (lemma = significato); al massimo una parola nuova per frase.
${lexiconFor(ids)}

REQUISITI
- latino classico corretto (prosa di Cesare e Cicerone), senza segni di quantità;
- frasi di ${len} parole, di senso compiuto, su storia romana, mitologia, vita quotidiana, natura, favole; contenuti adatti a ragazzi;
- unisci con il trattino basso la preposizione alla parola che regge (es. in_silva, ad_urbem); se c'è un aggettivo nel complemento uniscilo anche (in_magna_silva);
- "it": da 2 a 4 traduzioni italiane corrette e naturali (con e senza articoli, sinonimi comuni);
- "parole": analisi di ogni parola latina, nell'ordine della frase;
- "distrattori": 3 forme latine sbagliate ma plausibili (le stesse parole con desinenze diverse);
- "focus": l'id dell'argomento più rilevante, scelto tra: ${ids.join(', ')};
- "nota": un consiglio di traduzione di massimo 20 parole.

Rispondi solo con un array JSON come questo:
[{"la":"Puellae in_silva ambulant.","it":["Le fanciulle passeggiano nel bosco.","Le ragazze passeggiano nella selva."],"focus":"compl","parole":[{"f":"Puellae","l":"puella, -ae, f.","a":"nominativo plurale","s":"fanciulla"}],"distrattori":["Puellam","silvam","ambulat"],"nota":"In con l'ablativo indica lo stato in luogo."}]
(seme ${Date.now() % 100000})`;
  const out = await AI.fn.json(prompt, { modelTier: 'default', cache: false });
  if (!Array.isArray(out)) throw { code: 'invalid_json' };
  const set = new Set(ids);
  out.forEach((x) => { if (x && typeof x.it === 'string') x.it = [x.it]; });
  return out.filter((x) => x && typeof x.la === 'string' && x.la.trim().length > 2 && Array.isArray(x.it) && x.it.length).slice(0, n).map((x, i) => ({
    id: 'ai' + Date.now().toString(36) + i,
    la: x.la.trim(),
    it: x.it.map(String).filter(Boolean).slice(0, 5),
    tags: ids.slice(),
    focus: set.has(x.focus) ? x.focus : focusIds[0],
    tip: typeof x.nota === 'string' ? x.nota : '',
    words: Array.isArray(x.parole) ? x.parole.filter((w) => w && w.f).map((w) => ({ f: String(w.f), l: String(w.l || ''), a: String(w.a || ''), s: String(w.s || '') })) : [],
    dist: Array.isArray(x.distrattori) ? x.distrattori.map(String).filter(Boolean).slice(0, 4) : [],
    src: 'ai',
  }));
}
async function aiCorrect(s, answer, dir) {
  const refs = dir === 'la_it' ? s.it : [s.la.replace(/_/g, ' ')];
  const prompt = dir === 'la_it'
    ? `Sei un docente di latino che corregge la traduzione di uno studente del biennio del liceo.
Frase latina: «${s.la.replace(/_/g, ' ')}»
Traduzioni di riferimento: ${refs.map((r) => '«' + r + '»').join(' / ')}
Traduzione dello studente: «${answer}»

Valuta se la traduzione rende correttamente il latino. Accetta sinonimi, ordine diverso delle parole, articoli diversi, tempi equivalenti (passato remoto o prossimo) e rese libere ma fedeli. Ignora maiuscole, punteggiatura e piccoli errori di battitura.
- "corretta": senso e grammatica resi bene;
- "accettabile": senso giusto ma con imprecisioni lievi (sfumatura lessicale, resa poco naturale);
- "errata": errore di analisi (caso, funzione logica, numero, persona, tempo, diatesi, scambio soggetto/oggetto), errore di senso o parti omesse.`
    : `Sei un docente di latino che corregge la traduzione dall'italiano al latino di uno studente del biennio del liceo.
Frase italiana: «${s.it[0]}»
Traduzione latina di riferimento: «${refs[0]}»
Traduzione latina dello studente: «${answer}»

Valuta se il latino dello studente è corretto e rende il senso. L'ordine delle parole in latino è libero; accetta sinonimi e costrutti equivalenti, ignora maiuscole, punteggiatura e l'uso di j/v o dei segni di quantità.
- "corretta": latino corretto e fedele;
- "accettabile": senso giusto con una piccola imprecisione;
- "errata": desinenze sbagliate (caso, numero, persona, tempo), concordanze sbagliate o senso diverso.`;
  const full = prompt + `
Rispondi solo con JSON:
{"esito":"corretta|accettabile|errata","punteggio":0,"errori":[{"frammento":"parte dello studente","tipo":"morfologia|sintassi|lessico|omissione|italiano","spiegazione":"massimo 25 parole, dando del tu, citando la regola"}],"proposta":"la traduzione corretta più vicina alla sua","consiglio":"un consiglio breve per la prossima volta"}`;
  const r = await AI.fn.json(full, { modelTier: 'default', effort: 'low', cache: false });
  if (!r || typeof r !== 'object' || !r.esito) throw { code: 'invalid_json' };
  return r;
}
function aiExplain(s, onText, signal) {
  const prompt = `Spiega a uno studente del biennio del liceo come si traduce questa frase latina. Scrivi in italiano, in modo chiaro, al massimo 170 parole.
Frase: «${s.la.replace(/_/g, ' ')}»
Traduzione: «${s.it[0]}»
Struttura la risposta in tre parti brevi, con questi titoli in grassetto:
**Costruzione** — verbo, soggetto, oggetto e complementi, nell'ordine in cui conviene cercarli;
**Forme da notare** — 2 o 3 forme con analisi (caso, numero, tempo…) e il perché;
**Traduzione** — prima letterale, poi in buon italiano.
Usa elenchi con il trattino. Scrivi le parole latine tra *asterischi*.`;
  return AI.fn(prompt, { modelTier: 'default', effort: 'low', onText, signal });
}
function aiAsk(topicId, q, onText, signal) {
  const t = TOPIC[topicId];
  const prompt = `Sei un docente di latino paziente. Uno studente del biennio del liceo fa una domanda sull'argomento «${t.title}» (${t.desc}).
Domanda: «${q}»
Rispondi in italiano, al massimo 150 parole, con almeno un esempio latino tradotto. Usa elenchi con il trattino se servono e scrivi le parole latine tra *asterischi*. Se la domanda non riguarda il latino, riportala gentilmente sull'argomento.`;
  return AI.fn([{ role: 'user', content: prompt }], { modelTier: 'default', effort: 'low', onText, signal, cache: false });
}
function mdLite(txt) {
  const lines = esc(txt).split(/\n/);
  let html = '', inList = false;
  for (let l of lines) {
    l = l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i class="la">$1</i>');
    if (/^\s*[-•]\s+/.test(l)) { if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + l.replace(/^\s*[-•]\s+/, '') + '</li>'; continue; }
    if (inList) { html += '</ul>'; inList = false; }
    if (l.trim()) html += '<p>' + l.replace(/^#+\s*/, '') + '</p>';
  }
  if (inList) html += '</ul>';
  return html;
}
