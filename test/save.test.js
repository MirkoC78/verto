/* Test del codice di salvataggio: andata e ritorno su migliaia di stati casuali (anche con stelle oltre lo
   sblocco, come quando lo studente torna indietro nel percorso), errori di battitura riconosciuti. */
const H = require('../src/savecode.js');
const C = require('../src/course.js');
const LESSONS = C.UNITS.flatMap((u) => u.lessons.map((l) => l.id));
const UNITS = C.UNITS.map((u) => u.id);
const BADGES = Array.from({ length: 20 }, (_, i) => 'b' + i);
const N = +process.argv[2] || 5000;
let seed = 11;
const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
const pick = (a) => a[rnd(a.length)];
const errors = [];
const lens = [];
let typoCaught = 0, typoTried = 0, swapCaught = 0, swapTried = 0;
for (let k = 0; k < N; k++) {
  const unlocked = rnd(LESSONS.length);
  const stars = {};
  for (let i = 0; i <= unlocked; i++) if (rnd(4)) stars[LESSONS[i]] = 1 + rnd(3);
  // unità richiuse tornando indietro: stelle oltre la lezione sbloccata
  if (rnd(3) === 0) for (let i = unlocked + 1; i < LESSONS.length; i++) if (rnd(3) === 0) stars[LESSONS[i]] = 1 + rnd(3);
  const badges = {};
  BADGES.forEach((b) => { if (rnd(3) === 0) badges[b] = '2026-10-01'; });
  const d = new Date(Date.UTC(2025, 0, 1) + rnd(4000) * 864e5);
  const S = {
    name: pick(['', 'Livia', 'Niccolò', "D'Angelo", 'Maria Ludovica R.', 'x', 'ÈLLA']), goal: pick([30, 50, 80, 120]), xp: rnd(4000000), streak: rnd(4000),
    lastDay: rnd(5) ? d.toISOString().slice(0, 10) : null, shields: rnd(3), badges,
    course: { unlocked, stars, times: {} },
    stats: { lessons: rnd(4000), answered: rnd(65000), correct: rnd(65000), translated: rnd(16000) },
    settings: { quant: !rnd(2), input: pick(['tiles', 'keys']), gen: !rnd(2), sound: !rnd(2), voice: !rnd(2), online: !rnd(2), theme: pick(['auto', 'light', 'dark']) },
    prac: { level: pick(['facile', 'media', 'difficile', 'esperto']), wide: !rnd(2), type: pick(['misto', 'frasi', 'forme', 'parole']), unit: rnd(4) ? pick(UNITS) : null },
  };
  const code = H.encode(S, LESSONS, BADGES, UNITS);
  lens.push(code.replace(/-/g, '').length);
  if (!/^[0-9A-HJKMNP-TV-Z-]+$/.test(code)) errors.push('carattere non ammesso nel codice: ' + code);
  let back;
  // il codice si riconosce anche scritto in minuscolo, con spazi al posto dei trattini e con O/I/L al posto di 0/1
  const typed = code.toLowerCase().replace(/-/g, ' ').replace(/0/g, 'o').replace(/1/g, 'l');
  try { back = H.decode(typed, LESSONS, BADGES, UNITS); } catch (e) { errors.push('decodifica: ' + e.message); continue; }
  const same = (a, b, what) => { if (JSON.stringify(a) !== JSON.stringify(b)) errors.push(`${what}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };
  same(back.course.unlocked, unlocked, 'sblocco');
  same(Object.entries(back.course.stars).sort(), Object.entries(stars).sort(), 'stelle');
  same([back.xp, back.streak, back.shields, back.goal], [Math.min(S.xp, 2 ** 22 - 1), Math.min(S.streak, 4095), S.shields, S.goal], 'punti e serie');
  same(back.lastDay, S.lastDay, 'ultimo giorno');
  same(Object.keys(back.badges).sort(), Object.keys(badges).sort(), 'insegne');
  same(back.stats, { lessons: Math.min(S.stats.lessons, 4095), answered: S.stats.answered, correct: S.stats.correct, translated: Math.min(S.stats.translated, 16383) }, 'statistiche');
  same(back.settings, S.settings, 'impostazioni');
  same(back.prac, S.prac, 'palestra');
  same(back.name, [...S.name].slice(0, 16).join(''), 'nome');
  // un carattere sbagliato deve essere riconosciuto
  const raw = H.clean(code);
  const p = rnd(raw.length);
  const alt = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'.replace(raw[p], '');
  const bad = raw.slice(0, p) + alt[rnd(alt.length)] + raw.slice(p + 1);
  typoTried++;
  try { H.decode(bad, LESSONS, BADGES, UNITS); } catch (e) { typoCaught++; }
  // due caratteri vicini scambiati
  const q = rnd(raw.length - 1);
  if (raw[q] !== raw[q + 1]) { swapTried++; const sw = raw.slice(0, q) + raw[q + 1] + raw[q] + raw.slice(q + 2); try { H.decode(sw, LESSONS, BADGES, UNITS); } catch (e) { swapCaught++; } }
}
// messaggi chiari
const msg = (c) => { try { H.decode(c, LESSONS, BADGES, UNITS); return ''; } catch (e) { return e.message; } };
if (!/troppo corto/.test(msg('ABCD-EF'))) errors.push('codice corto senza messaggio chiaro');
if (!/carattere «U»/.test(msg('UUUU-UUUU-UUUU-UUUU-UUUU-UUUU'))) errors.push('carattere estraneo senza messaggio chiaro');
console.log('\nTest del codice di salvataggio');
console.log(`  Stati codificati e ricostruiti: ${N}; lunghezza del codice ${Math.min(...lens)}–${Math.max(...lens)} caratteri`);
console.log(`  Errori di battitura riconosciuti: ${typoCaught}/${typoTried}; scambi di due caratteri: ${swapCaught}/${swapTried}`);
if (typoCaught < typoTried * 0.995) errors.push('troppi errori di battitura non riconosciuti');
if (swapCaught < swapTried * 0.99) errors.push('troppi scambi non riconosciuti');
console.log(errors.length ? `  Errori: ${errors.length}` : '  Nessun errore.');
[...new Set(errors)].slice(0, 20).forEach((e) => console.log('  ✗ ' + e));
if (errors.length) process.exitCode = 1;
