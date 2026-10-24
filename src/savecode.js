/* VERTO — codice di salvataggio: i progressi essenziali in una stringa da copiare su un altro dispositivo,
   come le password dei vecchi videogiochi. Nessun server: il codice resta allo studente.
   Contiene percorso e stelle (anche delle unità richiuse tornando indietro), punti, serie e scudi, insegne,
   impostazioni, scelte della palestra, nome e statistiche principali; il ripasso degli errori e il lessico
   restano solo nella copia completa su file.
   Formato: bit impacchettati, controllo di Fletcher a 16 bit, base32 di Crockford in gruppi di 4
   (si ignorano trattini, spazi e maiuscole; I e L valgono 1, O vale 0). */
(function (root) {
  'use strict';
  const ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const NAME_CH = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789àèéìòùÀÈÉÌÒÙ'-.";
  const GOALS = [30, 50, 80, 120];
  const LEVELS = ['facile', 'media', 'difficile', 'esperto'];
  const TYPES = ['misto', 'frasi', 'forme', 'parole'];
  const THEMES = ['auto', 'light', 'dark'];
  const EPOCH = Date.UTC(2025, 0, 1);
  const VERSION = 1;

  function Writer() { const bits = []; return { put(v, n) { v = Math.max(0, Math.min(Math.floor(v) || 0, 2 ** n - 1)); for (let i = n - 1; i >= 0; i--) bits.push(Math.floor(v / 2 ** i) % 2); }, bits }; }
  function Reader(bits) { let p = 0; return { get(n) { let v = 0; for (let i = 0; i < n; i++) { if (p >= bits.length) throw new Error('Il codice è troppo corto: controlla di averlo copiato tutto.'); v = v * 2 + bits[p++]; } return v; } }; }
  // controllo: somma di Fletcher a 16 bit sui gruppi di 8 bit
  function check(bits) { let a = 1, b = 0; for (let i = 0; i < bits.length; i += 8) { let byte = 0; for (let j = 0; j < 8; j++) byte = byte * 2 + (bits[i + j] || 0); a = (a + byte) % 255; b = (b + a) % 255; } return a * 256 + b; }
  const dayNum = (k) => { if (!k) return 0; const [y, m, d] = k.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, d) - EPOCH) / 864e5) + 1; };
  const dayKey = (n) => { if (!n) return null; const d = new Date(EPOCH + (n - 1) * 864e5); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); };

  // S: stato dell'app; lessonIds: id delle lezioni in ordine; badgeIds: id delle insegne; unitIds: id delle unità
  function encode(S, lessonIds, badgeIds, unitIds) {
    const w = Writer();
    const c = S.course || {}, st = S.stats || {}, set = S.settings || {}, pr = S.prac || {};
    const unlocked = Math.min(c.unlocked || 0, lessonIds.length - 1);
    w.put(VERSION, 4);
    // stelle fino all'ultima lezione che ne ha, anche oltre lo sblocco (lo studente può essere tornato indietro)
    let last = unlocked;
    lessonIds.forEach((id, i) => { if ((c.stars || {})[id]) last = Math.max(last, i); });
    w.put(unlocked, 7); w.put(last, 7);
    for (let i = 0; i <= last; i++) w.put((c.stars || {})[lessonIds[i]] || 0, 2);
    w.put(S.xp, 22);
    w.put(S.streak, 12); w.put(dayNum(S.lastDay), 15); w.put(S.shields, 2);
    w.put(Math.max(0, GOALS.indexOf(S.goal)), 2);
    w.put(set.quant ? 1 : 0, 1); w.put(set.input === 'keys' ? 1 : 0, 1); w.put(set.gen !== false ? 1 : 0, 1);
    w.put(set.sound !== false ? 1 : 0, 1); w.put(set.voice !== false ? 1 : 0, 1); w.put(set.online !== false ? 1 : 0, 1);
    w.put(Math.max(0, THEMES.indexOf(set.theme || 'auto')), 2);
    w.put(Math.max(0, LEVELS.indexOf(pr.level || 'media')), 2); w.put(pr.wide ? 1 : 0, 1);
    w.put(Math.max(0, TYPES.indexOf(pr.type || 'misto')), 2);
    const ui = unitIds ? unitIds.indexOf(pr.unit) : -1;
    w.put(ui + 1, 5);
    badgeIds.forEach((b) => w.put((S.badges || {})[b] ? 1 : 0, 1));
    w.put(st.lessons, 12); w.put(st.answered, 16); w.put(st.correct, 16); w.put(st.translated, 14);
    const name = [...String(S.name || '')].filter((ch) => NAME_CH.includes(ch)).slice(0, 16);
    w.put(name.length, 5); name.forEach((ch) => w.put(NAME_CH.indexOf(ch), 7));
    const bits = w.bits;
    while (bits.length % 5 !== 4) bits.push(0); // con i 16 bit di controllo il totale diventa multiplo di 5
    const ck = check(bits);
    for (let i = 15; i >= 0; i--) bits.push(Math.floor(ck / 2 ** i) % 2);
    let out = '';
    for (let i = 0; i < bits.length; i += 5) out += ALPHA[bits.slice(i, i + 5).reduce((a, x) => a * 2 + x, 0)];
    return out.match(/.{1,4}/g).join('-');
  }
  function clean(code) {
    return String(code).toUpperCase().replace(/[\s-]/g, '').replace(/[IL]/g, '1').replace(/O/g, '0');
  }
  // restituisce un oggetto parziale da fondere nello stato, oppure lancia un errore leggibile
  function decode(code, lessonIds, badgeIds, unitIds) {
    const s = clean(code);
    if (!s) throw new Error('Scrivi o incolla il codice di salvataggio.');
    if (s.length < 20) throw new Error('Il codice è troppo corto: controlla di averlo copiato tutto.');
    const bits = [];
    for (const ch of s) {
      const v = ALPHA.indexOf(ch);
      if (v < 0) throw new Error(`Il carattere «${ch}» non fa parte dei codici di Verto: controlla di averlo copiato bene.`);
      for (let i = 4; i >= 0; i--) bits.push(Math.floor(v / 2 ** i) % 2);
    }
    const body = bits.slice(0, -16), ck = bits.slice(-16).reduce((a, x) => a * 2 + x, 0);
    if (check(body) !== ck) throw new Error('Il codice non torna: forse manca un carattere o ce n’è uno sbagliato. Ricontrollalo gruppo per gruppo.');
    const r = Reader(body);
    const ver = r.get(4);
    if (ver !== VERSION) throw new Error('Questo codice viene da una versione diversa di Verto.');
    const unlocked = Math.min(r.get(7), lessonIds.length - 1);
    const last = r.get(7);
    const stars = {};
    for (let i = 0; i <= last; i++) { const v = r.get(2); if (v && lessonIds[i]) stars[lessonIds[i]] = v; }
    const xp = r.get(22), streak = r.get(12), lastDay = dayKey(r.get(15)), shields = r.get(2);
    const goal = GOALS[r.get(2)];
    const settings = { quant: !!r.get(1), input: r.get(1) ? 'keys' : 'tiles', gen: !!r.get(1), sound: !!r.get(1), voice: !!r.get(1), online: !!r.get(1), theme: THEMES[r.get(2)] || 'auto' };
    const prac = { level: LEVELS[r.get(2)], wide: !!r.get(1), type: TYPES[r.get(2)] };
    const ui = r.get(5) - 1;
    prac.unit = unitIds && ui >= 0 ? unitIds[ui] || null : null;
    const badges = {};
    badgeIds.forEach((b) => { if (r.get(1)) badges[b] = lastDay || '2025-01-01'; });
    const stats = { lessons: r.get(12), answered: r.get(16), correct: r.get(16), translated: r.get(14) };
    const nl = r.get(5);
    let name = '';
    for (let i = 0; i < nl; i++) name += NAME_CH[r.get(7)] || '';
    const times = {};
    Object.keys(stars).forEach((id) => { times[id] = 1; });
    return { course: { unlocked, stars, times }, xp, streak, lastDay, shields, goal, settings, prac, badges, stats, name };
  }
  root.VertoSave = { encode, decode, clean };
  if (typeof module !== 'undefined') module.exports = root.VertoSave;
})(typeof window !== 'undefined' ? window : globalThis);
