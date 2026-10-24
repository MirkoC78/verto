/* Estrae i moduli e i caratteri dal file originale di Verto (legacy/verto-1.html).
   Si usa una volta sola, all'inizio: da lì in poi si lavora sui file in src/. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const lines = fs.readFileSync(path.join(ROOT, 'legacy', 'verto-1.html'), 'utf8').split(/\r?\n/);
const take = (a, b) => lines.slice(a - 1, b).join('\n') + '\n';
const MODULES = [
  ['src/engine.js', 498, 1319],
  ['src/lexicon.js', 1322, 1950],
  ['src/topics.js', 1953, 2399],
  ['src/bank.js', 2402, 2626],
  ['src/italian.js', 3003, 3260],
  ['src/semantic.js', 3263, 3642],
  ['src/generator.js', 3645, 4784],
  ['legacy/app-core.js', 2629, 3000],
  ['legacy/dict.js', 4787, 5028],
  ['legacy/session.js', 5031, 5766],
  ['legacy/views.js', 5769, 6249],
  ['legacy/style.css', 29, 484],
];
for (const [f, a, b] of MODULES) { fs.writeFileSync(path.join(ROOT, f), take(a, b)); console.log(f, b - a + 1, 'righe'); }
// caratteri incorporati (WOFF2 in base64)
const names = { "Lexend|normal|400": 'lexend-400', "Lexend|normal|500": 'lexend-500', "Lexend|normal|600": 'lexend-600', "Lexend|normal|700": 'lexend-700', "Marcellus|normal|400": 'marcellus-400' };
let gi = 0;
for (const l of lines.slice(15, 28)) {
  for (const m of l.matchAll(/font-family:'([^']+)';font-style:(\w+);font-weight:(\d+);[^}]*?base64,([A-Za-z0-9+/=]+)\)[^}]*?unicode-range:([^}]*)\}/g)) {
    const [, fam, style, w, b64, range] = m;
    let name = names[`${fam}|${style}|${w}`];
    if (!name) name = 'gentium-book-' + (style === 'italic' ? 'italic' : 'regular') + (range.startsWith('U+0100') ? '-macron' : '-latin');
    fs.writeFileSync(path.join(ROOT, 'fonts', name + '.woff2'), Buffer.from(b64, 'base64'));
    console.log('carattere', name, fam, style, w, range.slice(0, 30), Math.round(b64.length * 0.75 / 1024) + ' KB');
    gi++;
  }
}
console.log(gi, 'caratteri');
