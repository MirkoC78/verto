/* Giocatore automatico: rigioca tutte le lezioni nell'app vera, dando sempre la risposta giusta con gli stessi
   comandi dello studente (tessere, scelte, tastiera, coppie), e controlla che ogni risposta giusta sia accettata,
   che ogni lezione finisca con tre stelle, che nulla esca dalla larghezza dello schermo e che la console resti pulita.
   Uso, nella pagina dist/verto.html#demo=0 (stato dimostrativo, mai salvato):
     const s = document.createElement('script'); s.src = '../_prove/giocatore.js'; document.head.append(s);
     poi: giocaTutto({ da: 0, a: 107 }) e leggi window.__giocatore */
(function () {
  'use strict';
  const A = window.VertoApp, E = window.VertoEngine, SN = window.VertoSentence;
  const R = window.__giocatore = { lezioni: 0, esercizi: 0, tipi: {}, errori: [], console: [], fuori: [], fatto: false, corrente: null };
  const origErr = console.error;
  console.error = function (...a) { R.console.push(a.map(String).join(' ').slice(0, 300)); origErr.apply(console, a); };
  window.addEventListener('error', (e) => R.console.push('errore: ' + e.message));
  window.addEventListener('unhandledrejection', (e) => R.console.push('promessa: ' + String(e.reason).slice(0, 200)));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const click = (el) => { if (!el) throw new Error('elemento mancante'); el.click(); };
  const normIt = (s) => String(s).toLowerCase().replace(/[’`´]/g, "'").normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/'/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  // nessun elemento visibile deve uscire dalla larghezza della finestra
  function checkWidth(where) {
    const W = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > W + 1) R.fuori.push(`${where}: la pagina è larga ${document.documentElement.scrollWidth}px`);
    // si segnala l'elemento più interno che esce: è quello che allarga tutti gli altri
    let worst = null;
    for (const el of $$('#ov *, #app *')) {
      if (el.closest('.tbl-wrap') && !el.classList.contains('tbl-wrap')) continue; // le tabelle larghe scorrono dentro il loro riquadro
      const r = el.getBoundingClientRect();
      if (!r.width || r.right <= W + 1 || getComputedStyle(el).position === 'fixed') continue;
      worst = el;
    }
    if (worst) {
      const r = worst.getBoundingClientRect();
      R.fuori.push(`${where}: <${worst.tagName.toLowerCase()} class="${worst.className && worst.className.baseVal == null ? worst.className : ''}"> largo ${Math.round(r.width)}px, esce di ${Math.round(r.right - W)}px: «${String(worst.textContent).trim().slice(0, 60)}» in «${String((worst.parentElement || worst).textContent).trim().slice(0, 80)}»`);
    }
  }
  function answer(it, c) {
    const opts = $$('#ovBody .opt');
    const pickIdx = (test) => { const k = it.options.findIndex(test); if (k < 0) throw new Error('nessuna opzione giusta tra ' + JSON.stringify(it.options)); click(opts[k]); };
    switch (it.type) {
      case 'analizza': pickIdx((o) => it.valid.includes(o)); break;
      case 'completa': case 'accorda': pickIdx((o) => E.norm(o) === E.norm(it.answer)); break;
      case 'lessico': pickIdx((o) => o === it.uid); break;
      case 'lettura': case 'suono': case 'accento': case 'sillabe': case 'quantita': pickIdx((o) => o === it.right); break;
      case 'scrivi': { const t = $('#typed'); t.value = it.answers[0]; t.dispatchEvent(new Event('input', { bubbles: true })); break; }
      case 'la_it': {
        const used = new Set();
        const words = it.s.it[0].replace(/[.,;:!?«»"]/g, ' ').split(/\s+/).filter(Boolean);
        for (const w of words) {
          const k = c.tiles.findIndex((t, i) => !used.has(i) && normIt(t.label) === normIt(w));
          if (k < 0) throw new Error(`tessera mancante «${w}» per «${it.s.it[0]}»`);
          used.add(k); click($(`#bank .tile[data-k="${k}"]`));
        }
        break;
      }
      case 'it_la': {
        const used = new Set();
        for (const key of SN.tiles(it.s.la)) {
          const k = c.tiles.findIndex((t, i) => !used.has(i) && !t.distractor && t.key === key);
          if (k < 0) throw new Error(`tessera latina mancante «${key}» per «${it.s.la}»`);
          used.add(k); click($(`#bank .tile[data-k="${k}"]`));
        }
        break;
      }
      default: throw new Error('tipo sconosciuto ' + it.type);
    }
  }
  async function playItem(where) {
    const c = A.cur(), it = c.it;
    R.esercizi++; R.tipi[it.type] = (R.tipi[it.type] || 0) + 1;
    checkWidth(where + ' ' + it.type);
    if (it.type === 'teach') { click($('#nextBtn')); return; }
    if (it.type === 'abbina') {
      for (let i = 0; i < it.pairs.length; i++) { click($(`[data-act="mL"][data-i="${i}"]`)); click($(`[data-act="mR"][data-i="${i}"]`)); }
      await wait(320);
    } else {
      answer(it, c);
      const b = $('#checkBtn');
      if (!b || b.disabled) throw new Error('«Controlla» non attivo dopo la risposta');
      click(b);
    }
    const res = A.cur().res;
    if (!res) throw new Error('nessun esito dopo «Controlla» (forse il giudizio a mano)');
    if (!res.ok) R.errori.push(`${where}: risposta giusta respinta (${it.type}) ${it.s ? it.s.la + ' → ' + it.s.it[0] : it.uid || ''} soluzione «${res.sol}»`);
    checkWidth(where + ' esito ' + it.type);
    click($('#nextBtn'));
  }
  async function playLesson(idx) {
    const f = A.FLAT[idx];
    R.corrente = f.lesson.id;
    A.startLesson(idx, { teach: true });
    let guard = 0;
    while (A.ses() && !A.ses().done) {
      if (++guard > 60) throw new Error('lezione infinita');
      await playItem(f.lesson.id + ' #' + A.ses().i);
      await wait(0);
    }
    checkWidth(f.lesson.id + ' fine');
    const stars = A.S().course.stars[f.lesson.id];
    if (stars !== 3) R.errori.push(`${f.lesson.id}: ${stars || 0} stelle invece di 3`);
    click($('[data-act="endSession"]'));
    R.lezioni++;
  }
  // tutte le altre schermate: viste principali, i 25 argomenti di teoria, i fogli che si aprono sopra
  window.controllaViste = async function () {
    const S = A.S();
    const views = ['path', 'gym', 'lib', 'words', 'me'].concat(window.VERTO_TOPICS.TOPICS.map((t) => 'topic:' + t.id));
    for (const v of views) { A.setVIEW(v); await wait(0); checkWidth('vista ' + v); }
    A.setVIEW('path');
    const sheets = [['methodSheet', null], ['placement', null], ['saveCode', null], ['restoreSheet', null]];
    for (const [act] of sheets) { const b = document.createElement('button'); b.dataset.act = act; document.body.append(b); b.click(); b.remove(); await wait(0); checkWidth('foglio ' + act); const c = $('[data-act="closeSheet"]'); if (c) c.click(); }
    // paradigmi di alcuni lemmi di ogni tipo
    for (const uid of ['rosa', 'rex', 'res', 'bonus', 'acer', 'amo', 'capio', 'sum', 'possum', 'hortor', 'is', 'qui', 'ego']) {
      if (!window.VertoEngine.BY_UID.get(uid)) continue;
      const b = document.createElement('button'); b.dataset.act = 'paradigm'; b.dataset.u = uid; document.body.append(b); b.click(); b.remove(); await wait(0);
      checkWidth('paradigma ' + uid); const c = $('[data-act="closeSheet"]'); if (c) c.click();
    }
    // ricerca di una forma
    A.setVIEW('words'); const q = $('#q'); if (q) { q.value = 'amabantur'; click($('[data-act="search"]')); checkWidth('ricerca'); }
    void S;
    R.viste = true;
    return R;
  };
  window.giocaTutto = async function (o = {}) {
    const da = o.da || 0, a = o.a == null ? A.FLAT.length - 1 : o.a;
    for (let i = da; i <= a; i++) {
      try { await playLesson(i); } catch (e) { R.errori.push(`${A.FLAT[i].lesson.id}: ${e.message}`); const q = $('[data-act="quit"]'); if (A.ses()) { A.ses().i = 0; if (q) q.click(); const ok = $('[data-act="modalOk"]'); if (ok) ok.click(); } }
      await wait(0);
    }
    R.fatto = true;
    return R;
  };
})();
