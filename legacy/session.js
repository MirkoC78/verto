/* VERTO — esercizi e sessione */

/* ---------- Frasi ---------- */
const SENT = window.VERTO_BANK.map(([la, it, tags, tip], i) => {
  const t = tags.split(' ');
  return { id: 'b' + i, la, it: it.split('|'), tags: t, tip: tip || '', src: 'bank', focus: focusOf(t) };
});
function sentById(id) { return SENT.find((s) => s.id === id) || S.aiPool.find((s) => s.id === id) || (S.genSaved || []).find((s) => s.id === id); }
/* Frasi create dal generatore sugli argomenti scelti */
const GEN_OK = !!(window.VertoGen && window.VertoGen.generate);
function genFocus(topic) {
  if (topic) return topic;
  const ids = ORDER.filter((t) => S.topics.includes(t));
  const latest = ids.slice(-2);
  return weighted(ids, (t) => 0.4 + 2 * (1 - mastery(t)) + (latest.includes(t) ? 1.2 : 0));
}
function genSentence(topic, avoid) {
  if (!GEN_OK) return null;
  const topics = topic && !S.topics.includes(topic) ? S.topics.concat([topic]) : S.topics;
  const av = new Set(avoid || []);
  (S.reported || []).forEach((x) => av.add(x));
  for (let i = 0; i < 4; i++) {
    const s = window.VertoGen.generate(topics, genFocus(topic), { avoid: [...av] });
    if (s && !S.recent.includes(s.id)) return s;
  }
  return null;
}
function genShare(mode, poolSize) {
  if (!GEN_OK || S.settings.gen === false) return 0;
  if (mode === 'nuove') return 1;
  return poolSize < 30 ? 0.6 : 0.4;
}
function sentencePool(topic) {
  const T = sel();
  if (topic) T.add(topic);
  const bank = SENT.filter((s) => s.tags.every((t) => T.has(t)) && (!topic || s.tags.includes(topic)));
  const ai = S.aiPool.filter((s) => !S.reported.includes(s.id) && s.tags.every((t) => T.has(t)) && (!topic || s.focus === topic));
  return bank.concat(ai);
}
function sentWeight(s) {
  let w = 1 + 2 * (1 - mastery(s.focus));
  if (S.recent.includes(s.id)) w *= 0.15;
  const latest = ORDER.filter((t) => S.topics.includes(t)).slice(-2);
  if (latest.includes(s.focus)) w += 0.8;
  return Math.max(0.05, w);
}
function pickSentences(pool, n) {
  const out = []; let p = pool.slice();
  while (out.length < n && p.length) { const s = weighted(p, sentWeight); out.push(s); p = p.filter((x) => x !== s); }
  return out;
}
const PROPER_IT = new Set(E.LEX.filter((e) => e.prop).flatMap((e) => e.it.split(/[,;]\s*/)).map((s) => s.trim().toLowerCase()).concat(['romani', 'galli', 'greci', 'belgi', 'alpi', 'roma', 'cesare']));

/* ---------- Tessere ---------- */
function isProperLa(w) { return E.analyze(w).some((a) => a.e.prop); }
function latinTokens(la) {
  return la.split(/\s+/).map((t) => t.replace(/[.,;:!?«»"“”]/g, '')).filter(Boolean)
    .map((t, i) => (i === 0 && !isProperLa(t.split('_')[0]) ? t.charAt(0).toLowerCase() + t.slice(1) : t));
}
function itTokens(it) {
  const toks = it.split(/\s+/).map((t) => t.replace(/[.,;:!?«»"“”]/g, '')).filter(Boolean);
  return toks.map((t, i) => (i === 0 && !PROPER_IT.has(t.toLowerCase()) && !/^[A-Z]{2,}/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t));
}
function formFamily(e, f) { return e.forms.filter((x) => x.req.every((t) => sel().has(t)) && E.norm(x.f) !== E.norm(f) && !x.f.includes(' ')); }
function latinDistractors(s, count) {
  const toks = latinTokens(s.la);
  const have = new Set(toks.map((t) => normLa(t)));
  const out = [];
  if (s.dist && s.dist.length) s.dist.forEach((d) => { const n = normLa(d); if (!have.has(n) && n) { let t = d.replace(/[.,;:!?]/g, ''); if (!isProperLa(t.split('_')[0])) t = t.charAt(0).toLowerCase() + t.slice(1); out.push(t); have.add(n); } });
  for (const tok of shuffle(toks)) {
    if (out.length >= count) break;
    const words = tok.split('_');
    const last = words[words.length - 1];
    const an = E.analyze(last).filter((a) => ['n', 'a', 'v', 'p'].includes(a.e.k));
    if (!an.length) continue;
    const alts = formFamily(an[0].e, last).map((x) => x.f).filter((f) => !have.has(normLa(f)));
    if (!alts.length) continue;
    let alt = pick(alts);
    if (/^[A-Z]/.test(last) && isProperLa(last)) alt = alt.charAt(0).toUpperCase() + alt.slice(1);
    const tile = words.slice(0, -1).concat([alt]).join('_');
    if (have.has(normLa(tile))) continue;
    have.add(normLa(tile)); out.push(tile);
  }
  return out.slice(0, count);
}
const IT_FUNC = ['il', 'la', 'i', 'le', 'gli', 'del', 'della', 'dei', 'delle', 'alla', 'al', 'ai', 'nel', 'nella', 'con', 'da', 'di', 'un', 'una', 'dal', 'dalla', 'per'];
function italianDistractors(s, count) {
  const toks = itTokens(s.it[0]).map((t) => t.toLowerCase());
  const have = new Set(toks);
  const out = [];
  const funcs = shuffle(IT_FUNC.filter((w) => !have.has(w)));
  if (funcs.length) { out.push(funcs[0]); have.add(funcs[0]); }
  let guard = 0;
  while (out.length < count && guard++ < 40) {
    const other = pick(SENT);
    const w = pick(itTokens(other.it[0])).toLowerCase();
    if (w.length > 3 && !have.has(w) && !PROPER_IT.has(w)) { out.push(w); have.add(w); }
  }
  return out;
}

/* ---------- Costruttori ---------- */
function entryPool(kinds) {
  const T = sel();
  return E.LEX.filter((e) => kinds.includes(e.k) && T.has(e.t) && !e.prop && e.forms.filter((f) => f.req.every((t) => T.has(t))).length >= 4);
}
function formsUsable(e) {
  const T = sel();
  return e.forms.filter((f) => f.req.every((t) => T.has(t)) && f.c !== 'voc' && f.c !== 'loc' && !f.f.includes(' ') && !(f.mood === 'part' && f.c && f.c !== 'nom'));
}
function pickEntry(pool) { return weighted(pool, (e) => 1 + 2 * (1 - mastery(e.t)) + (ORDER.indexOf(e.t) / ORDER.length)); }
function topicForms(e, topic) { const f = formsUsable(e); return topic ? f.filter((x) => x.req.includes(topic)) : f; }
function buildAnalizza(topic) {
  let pool = entryPool(['n', 'a', 'v', 'p']);
  if (topic) { const tp = pool.filter((e) => topicForms(e, topic).length >= 2); if (tp.length) pool = tp; else topic = null; }
  for (let tries = 0; tries < 30 && pool.length; tries++) {
    const e = pickEntry(pool);
    const forms = topic ? topicForms(e, topic) : formsUsable(e);
    if (topic && forms.length < 2) continue;
    if (forms.length < 4) continue;
    const x = weighted(forms, (f) => 1 + 2 * (1 - mastery(focusOf(f.req))));
    const valid = uniq(e.forms.filter((f) => E.norm(f.f) === E.norm(x.f)).map((f) => f.d));
    const dis = shuffle(uniq(formsUsable(e).map((f) => f.d).filter((d) => !valid.includes(d)))).slice(0, 3);
    if (dis.length < 3) continue;
    return { type: 'analizza', e, form: x.f, correct: x.d, valid, options: shuffle([x.d, ...dis]), topic: focusOf(x.req), key: x.key };
  }
  return null;
}
function buildParadigma(topic) {
  let pool = entryPool(['n', 'a', 'v', 'p']);
  if (topic) { const tp = pool.filter((e) => topicForms(e, topic).some((f) => f.mood !== 'part')); if (tp.length) pool = tp; else topic = null; }
  for (let tries = 0; tries < 30 && pool.length; tries++) {
    const e = pickEntry(pool);
    const forms = (topic ? topicForms(e, topic) : formsUsable(e)).filter((f) => f.mood !== 'part');
    if (!forms.length) continue;
    const x = weighted(forms, (f) => 1 + 2 * (1 - mastery(focusOf(f.req))));
    const answers = uniq(e.forms.filter((f) => f.d === x.d).map((f) => f.f));
    return { type: 'paradigma', e, desc: x.d, answers, topic: focusOf(x.req), key: x.key };
  }
  return null;
}
function buildCompleta(s) {
  const words = s.la.replace(/_/g, ' ').split(/\s+/);
  const cands = [];
  words.forEach((w, i) => {
    const clean = w.replace(/[.,;:!?«»"]/g, '');
    const an = E.analyze(clean).filter((a) => ['n', 'a', 'v', 'p'].includes(a.e.k));
    if (!an.length) return;
    const valid = new Set(an.map((a) => E.norm(a.f)));
    const alts = uniq(formFamily(an[0].e, clean).map((x) => x.f).filter((f) => !valid.has(E.norm(f))));
    if (alts.length >= 3) cands.push({ i, clean, alts, e: an[0].e });
  });
  if (!cands.length) return null;
  const c = pick(cands);
  const pre = c.clean.slice(0, 3).toLowerCase();
  const near = shuffle(c.alts.filter((a) => a.toLowerCase().startsWith(pre)));
  const rest = shuffle(c.alts.filter((a) => !near.includes(a)));
  let opts = near.concat(rest).slice(0, 3);
  if (/^[A-Z]/.test(c.clean)) opts = opts.map((o) => o.charAt(0).toUpperCase() + o.slice(1));
  return { type: 'completa', s, idx: c.i, answer: c.clean, options: shuffle([c.clean, ...opts]), topic: s.focus };
}
function buildLessico() {
  const T = sel();
  const pool = E.LEX.filter((e) => T.has(e.t) && !e.prop);
  if (pool.length < 6) return null;
  const e = weighted(pool, (x) => { const v = S.vocab[x.lemma]; return v ? 1 / (1 + v.box) : 2; });
  const meaning = (x) => x.it.split(/[;,]/)[0].trim();
  const others = shuffle(pool.filter((x) => x !== e && x.k === e.k && meaning(x) !== meaning(e)));
  const opts = [];
  for (const o of others) { if (opts.length >= 3) break; if (!opts.some((p) => meaning(p) === meaning(o) || p.head === o.head)) opts.push(o); }
  if (opts.length < 3) return null;
  return { type: 'lessico', e, dir: Math.random() < 0.6 ? 'la' : 'it', options: shuffle([e, ...opts]), topic: e.t };
}

const PLAN = ['la_it', 'it_la', 'analizza', 'la_it', 'completa', 'it_la', 'paradigma', 'la_it', 'lessico', 'it_la', 'analizza', 'la_it'];
function buildItems(mode, opts = {}) {
  const items = [];
  const sp = sentencePool(opts.topic);
  if (mode === 'review') {
    for (const m of S.mistakes.slice(-12)) {
      let it = null;
      if (m.k === 's') { const s = sentById(m.id); if (s) it = { type: m.dir, s, topic: s.focus }; }
      else if (m.k === 'c') { const s = sentById(m.id); if (s) it = buildCompleta(s); }
      else if (m.k === 'f') {
        const e = E.LEX.find((x) => x.lemma === m.lemma);
        const f = e && e.forms.find((x) => x.key === m.key);
        if (e && f) {
          if (m.t === 'paradigma') it = { type: 'paradigma', e, desc: f.d, answers: uniq(e.forms.filter((x) => x.d === f.d).map((x) => x.f)), topic: focusOf(f.req), key: f.key };
          else {
            const forms = formsUsable(e);
            const valid = uniq(e.forms.filter((x) => E.norm(x.f) === E.norm(f.f)).map((x) => x.d));
            const dis = shuffle(uniq(forms.map((x) => x.d).filter((d) => !valid.includes(d)))).slice(0, 3);
            if (dis.length === 3) it = { type: 'analizza', e, form: f.f, correct: f.d, valid, options: shuffle([f.d, ...dis]), topic: focusOf(f.req), key: f.key };
          }
        }
      } else if (m.k === 'l') {
        const e = E.LEX.find((x) => x.lemma === m.lemma);
        if (e) { const b = buildLessico(); if (b) { b.e = e; b.options = shuffle([e, ...b.options.filter((o) => o !== e).slice(0, 3)]); it = b; } }
      }
      if (it) { it.review = m; items.push(it); }
    }
    return shuffle(items);
  }
  let plan;
  if (mode === 'la_it' || mode === 'it_la') plan = Array(10).fill(mode);
  else if (mode === 'forme') plan = ['analizza', 'analizza', 'paradigma', 'analizza', 'completa', 'analizza', 'paradigma', 'analizza', 'completa', 'paradigma'];
  else if (mode === 'paradigma') plan = Array(10).fill('paradigma');
  else if (mode === 'lessico') plan = Array(12).fill('lessico');
  else if (mode === 'nuove') plan = ['la_it', 'it_la', 'la_it', 'completa', 'it_la', 'la_it', 'it_la', 'completa', 'la_it', 'it_la'];
  else plan = PLAN.slice();
  const nSent = plan.filter((p) => p === 'la_it' || p === 'it_la' || p === 'completa').length;
  const nGen = Math.round(nSent * genShare(mode, sp.length));
  const gen = [];
  for (let i = 0; i < nGen; i++) { const g = genSentence(opts.topic, gen.map((x) => x.la)); if (g) gen.push(g); }
  const chosen = shuffle(pickSentences(sp, nSent - gen.length).concat(gen));
  let si = 0;
  for (const p of plan) {
    let it = null;
    if (p === 'la_it' || p === 'it_la') { const s = chosen[si++]; if (s) it = { type: p, s, topic: s.focus }; }
    else if (p === 'completa') { const s = chosen[si++]; if (s) it = buildCompleta(s); }
    else if (p === 'analizza') it = buildAnalizza(opts.topic);
    else if (p === 'paradigma') it = buildParadigma(opts.topic);
    else if (p === 'lessico') it = buildLessico();
    if (!it) it = buildAnalizza() || buildLessico();
    if (it) items.push(it);
  }
  return items;
}

/* ---------- Sessione ---------- */
let SES = null;
const XP_BASE = { la_it: 12, it_la: 14, analizza: 8, paradigma: 10, completa: 8, lessico: 6 };
const KIND = {
  la_it: ['translate', 'Traduci in italiano'], it_la: ['pen', 'Traduci in latino'], analizza: ['magnify', 'Analizza la forma'],
  paradigma: ['table', 'Scrivi la forma'], completa: ['tiles', 'Completa la frase'], lessico: ['cards', 'Lessico'],
};

function startSession(mode, opts = {}) {
  if (!S.topics.length) { toast('Scegli prima gli argomenti studiati.'); return; }
  const useAI = mode === 'nuove' && aiUsable();
  const items = useAI ? [] : buildItems(mode, opts);
  if (!useAI && !items.length) { toast(mode === 'review' ? 'Nessun errore da ripassare.' : 'Non ci sono ancora esercizi per questi argomenti.'); return; }
  SES = { mode, opts, items, i: 0, combo: 0, best: 0, xp: 0, ok: 0, ko: 0, wrongs: [], start: Date.now(), cur: null, done: false, aiNew: 0 };
  openOverlay();
  if (useAI) return startNewSentences();
  renderItem();
  if (['mix', 'la_it', 'it_la', 'topic'].includes(mode) && aiUsable()) prefetchAI(mode, opts);
}
function weakTopics(n) { return ORDER.filter((t) => S.topics.includes(t)).sort((a, b) => mastery(a) - mastery(b) || ORDER.indexOf(b) - ORDER.indexOf(a)).slice(0, n); }
async function prefetchAI(mode, opts) {
  const focus = opts.topic ? [opts.topic] : weakTopics(2);
  try {
    const got = await aiGenerate(3, focus);
    if (!SES || SES.done) { storeAI(got); return; }
    storeAI(got);
    let k = 0;
    for (let j = SES.i + 2; j < SES.items.length && k < got.length; j++) {
      const it = SES.items[j];
      if (it.type === 'la_it' || it.type === 'it_la') { SES.items[j] = { type: it.type, s: got[k++], topic: got[k - 1].focus }; }
    }
  } catch (e) { aiFail(e); }
}
function storeAI(list) {
  S.aiPool = S.aiPool.concat(list).slice(-80);
  save();
}
async function startNewSentences() {
  const pool = S.aiPool.filter((s) => !S.reported.includes(s.id) && s.tags.every((t) => S.topics.includes(t)) && !S.recent.includes(s.id));
  if (!aiUsable()) {
    if (pool.length >= 3) { fillNew(shuffle(pool).slice(0, 8)); toast('Claude non è raggiungibile: uso le frasi nuove già salvate.'); return; }
    closeOverlay(); toast('Le frasi nuove richiedono Claude. Apri la pagina in Claude per usarle.'); return;
  }
  $('#ovBody').innerHTML = `<div class="empty" style="padding-top:60px">${thinking('Il magister sta componendo nuove frasi sui tuoi argomenti…')}<p class="note">Di solito servono da 20 a 60 secondi.</p><button class="btn ghost small" data-act="newFallback">Usa le frasi verificate</button></div>`;
  $('#ovFoot').innerHTML = '';
  setProgress(0);
  try {
    const got = await aiGenerate(6, weakTopics(3));
    if (!SES || SES.mode !== 'nuove') return;
    storeAI(got);
    if (!got.length) throw { code: 'invalid_json' };
    fillNew(got);
  } catch (e) {
    const msg = aiFail(e);
    if (!SES || SES.mode !== 'nuove') return;
    toast(msg || 'Uso le frasi verificate.');
    SES.mode = 'mix'; SES.items = buildItems('mix'); renderItem();
  }
}
function fillNew(list) {
  SES.items = list.map((s, i) => ({ type: i % 2 ? 'it_la' : 'la_it', s, topic: s.focus }));
  renderItem();
}

function openOverlay() {
  closeOverlay();
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Allenamento');
  ov.innerHTML = `<div class="ov-inner"><div class="ov-head"><button class="iconbtn" data-act="quit" aria-label="Chiudi l'allenamento">${I.close}</button><div class="progress" role="progressbar" aria-label="Avanzamento"><i style="width:0%"></i></div><div class="combo" id="combo" aria-live="polite"></div></div><div class="ov-body" id="ovBody"></div></div><div class="ov-foot" id="ovFootWrap"><div class="foot-in" id="ovFoot"></div></div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
}
function closeOverlay() { const o = $('#ov'); if (o) o.remove(); document.body.style.overflow = ''; closePop(); }
function setProgress(p) { const b = $('#ov .progress > i'); if (b) b.style.width = Math.round(p * 100) + '%'; }
function setCombo() {
  const c = $('#combo'); if (!c) return;
  c.innerHTML = SES.combo >= 2 ? I.flame + '<span>' + SES.combo + '</span>' : '';
}
function thinking(msg) { return `<div class="thinking"><svg class="stylus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18z"/></svg><span>${esc(msg)}</span></div>`; }

function renderItem() {
  closePop();
  const it = SES.items[SES.i];
  if (!it) return finishSession();
  setProgress(SES.i / SES.items.length);
  setCombo();
  const typeOf = it.type;
  const inputMode = (typeOf === 'la_it' || typeOf === 'it_la') ? S.settings.input : null;
  SES.cur = { it, inputMode, chosen: [], picked: null, answered: false, hint: false, verbs: false };
  const [ico, label] = KIND[typeOf];
  const isNew = it.s && (it.s.src === 'ai' || it.s.src === 'gen');
  let html = `<div class="ex-kind">${I[ico].replace('<svg', '<svg width="18" height="18"')}<span>${label}</span>${isNew ? `<span class="tag new">${I.spark.replace('<svg', '<svg width="12" height="12"')}&nbsp;nuova</span>` : it.review ? '<span class="tag">ripasso</span>' : ''}</div>`;
  if (typeOf === 'la_it') html += renderLaIt(it);
  else if (typeOf === 'it_la') html += renderItLa(it);
  else if (typeOf === 'analizza') html += renderAnalizza(it);
  else if (typeOf === 'paradigma') html += renderParadigma(it);
  else if (typeOf === 'completa') html += renderCompleta(it);
  else if (typeOf === 'lessico') html += renderLessico(it);
  $('#ovBody').innerHTML = html;
  $('#ovBody').scrollTop = 0;
  $('#ovFootWrap').className = 'ov-foot';
  $('#ovFoot').innerHTML = `<button class="btn block" id="checkBtn" data-act="check" disabled>Controlla</button>`;
  if (inputMode) renderAnswerArea();
  if (typeOf === 'paradigma') { const inp = $('#typed'); if (inp) setTimeout(() => inp.focus({ preventScroll: true }), 60); }
  S.stats.types[typeOf] = 1;
}

function latinLine(s, clickable = true) {
  const words = s.la.replace(/_/g, ' ').split(/\s+/);
  return `<div class="latin-line" lang="la">${words.map((w, i) => clickable ? `<button class="w" data-act="word" data-i="${i}">${esc(w)}</button>` : `<span>${esc(w)}</span>`).join('')}</div>`;
}
function toolsHtml(it) {
  const tiles = SES.cur.inputMode === 'tiles';
  return `<div class="tools">
    <button class="tool" data-act="mode">${tiles ? I.keys + 'Usa la tastiera' : I.tiles + 'Usa le tessere'}</button>
    ${it.type === 'la_it' ? `<button class="tool" data-act="method" aria-pressed="false">${I.method}Metodo</button>` : ''}
    <button class="tool" data-act="hint" aria-pressed="false">${I.bulb}Suggerimento</button>
  </div><div id="aux"></div>`;
}
function renderLaIt(it) {
  return `<div class="speaker"><div class="bust" aria-hidden="true">${I.tabula}</div><div class="bubble">${latinLine(it.s)}</div></div>
  <p class="note" style="margin:-6px 0 0">Tocca una parola per vederne l’analisi.</p>
  ${toolsHtml(it)}<div id="answerArea"></div>`;
}
function renderItLa(it) {
  return `<div class="speaker"><div class="bust" aria-hidden="true">${I.tabula}</div><div class="bubble"><div class="it-line">${esc(it.s.it[0])}</div></div></div>
  ${toolsHtml(it)}<div id="answerArea"></div>`;
}
function renderAnswerArea() {
  const c = SES.cur, it = c.it;
  const area = $('#answerArea'); if (!area) return;
  if (c.inputMode === 'keys') {
    const latin = it.type === 'it_la';
    area.innerHTML = `<label class="note" for="typed">${latin ? 'Scrivi la frase in latino' : 'Scrivi la traduzione in italiano'}</label><textarea id="typed" class="typed${latin ? ' latin' : ''}" rows="3" autocomplete="off" autocapitalize="sentences" spellcheck="${latin ? 'false' : 'true'}" placeholder="${latin ? 'Scribe latine…' : 'La tua traduzione…'}"></textarea>`;
    const ta = $('#typed');
    ta.addEventListener('input', () => { $('#checkBtn').disabled = !ta.value.trim(); });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (ta.value.trim()) doCheck(); } });
    return;
  }
  if (!c.tiles) {
    if (it.type === 'la_it') {
      const toks = itTokens(it.s.it[0]);
      c.tiles = shuffle(toks.concat(italianDistractors(it.s, toks.length > 6 ? 3 : 2)));
    } else {
      const toks = latinTokens(it.s.la);
      c.tiles = shuffle(toks.concat(latinDistractors(it.s, toks.length > 4 ? 3 : 2)));
    }
  }
  const cls = it.type === 'it_la' ? 'tile la' : 'tile';
  area.innerHTML = `<div class="answer-zone" id="az" aria-label="La tua risposta">${c.chosen.map((k, j) => `<button class="${cls} pop" data-act="untile" data-j="${j}">${esc(c.tiles[k].replace(/_/g, ' '))}</button>`).join('')}</div>
  <div class="bank-zone" aria-label="Tessere disponibili">${c.tiles.map((t, k) => `<button class="${cls}${c.chosen.includes(k) ? ' used' : ''}" data-act="tile" data-k="${k}" ${c.chosen.includes(k) ? 'aria-hidden="true" tabindex="-1"' : ''}>${esc(t.replace(/_/g, ' '))}</button>`).join('')}</div>`;
  $('#checkBtn').disabled = !c.chosen.length;
}
function renderAnalizza(it) {
  return `<p class="prompt-title">Che forma è?</p><div class="bigword" lang="la">${esc(it.form)}</div><p class="lemma-note">da <span class="la">${esc(it.e.lemma)}</span> — ${esc(it.e.it)}</p>
  <div class="options" role="group" aria-label="Analisi possibili">${it.options.map((o, k) => `<button class="opt" data-act="opt" data-k="${k}" aria-pressed="false"><span class="k">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
}
function renderParadigma(it) {
  return `<p class="prompt-title">Scrivi il <b>${esc(it.desc)}</b></p><p class="lemma-note" style="text-align:left">di <span class="la" style="font-size:19px">${esc(it.e.lemma)}</span> — ${esc(it.e.it)}</p>
  <input id="typed" class="input latin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="forma latina" aria-label="Forma latina">`;
}
function renderCompleta(it) {
  const words = it.s.la.replace(/_/g, ' ').split(/\s+/);
  const line = words.map((w, i) => i === it.idx ? `<span class="blank" id="blank">${w.replace(/[A-Za-z]+/, ' ')}</span>` : `<span>${esc(w)}</span>`).join('');
  return `<div class="speaker"><div class="bust" aria-hidden="true">${I.tabula}</div><div class="bubble"><div class="latin-line" lang="la">${line}</div><p class="note" style="margin:8px 0 0">${esc(it.s.it[0])}</p></div></div>
  <div class="options" style="grid-template-columns:1fr 1fr" role="group" aria-label="Forme possibili">${it.options.map((o, k) => `<button class="opt la-opt" data-act="opt" data-k="${k}" aria-pressed="false">${esc(o)}</button>`).join('')}</div>`;
}
function renderLessico(it) {
  const meaning = (x) => x.it.split(/[;]/)[0].trim();
  if (it.dir === 'la') {
    return `<p class="prompt-title">Che cosa significa?</p><div class="bigword" lang="la">${esc(it.e.lemma)}</div><p class="lemma-note">${esc(it.e.cls)}</p>
    <div class="options" role="group">${it.options.map((o, k) => `<button class="opt" data-act="opt" data-k="${k}" aria-pressed="false"><span class="k">${'ABCD'[k]}</span><span>${esc(meaning(o))}</span></button>`).join('')}</div>`;
  }
  return `<p class="prompt-title">Come si dice in latino?</p><div class="bigword" style="font-family:var(--f-ui);font-size:30px;font-weight:600">${esc(meaning(it.e))}</div><p class="lemma-note">${esc(it.e.cls)}</p>
  <div class="options" role="group">${it.options.map((o, k) => `<button class="opt la-opt" data-act="opt" data-k="${k}" aria-pressed="false"><span class="k">${'ABCD'[k]}</span><span>${esc(o.lemma)}</span></button>`).join('')}</div>`;
}

/* ---------- Strumenti durante l'esercizio ---------- */
function wordAnalyses(s, i) {
  const word = s.la.replace(/_/g, ' ').split(/\s+/)[i] || '';
  const clean = word.replace(/[.,;:!?«»"]/g, '');
  if (s.words && s.words.length) {
    let w = null;
    for (const x of s.words) { const parts = x.f.split(/[_\s]+/).map((p) => E.norm(p.replace(/[.,;:!?«»"]/g, ''))); if (parts.includes(E.norm(clean))) { w = x; break; } }
    if (w) return { word: clean, ai: w, an: E.analyze(clean) };
  }
  return { word: clean, an: E.analyze(clean) };
}
function popHtml(r) {
  if (r.ai && (!r.an.length)) return `<div class="pw-lemma">${esc(r.ai.l || r.word)}</div><div class="pw-mean">${esc(r.ai.s)}</div><ul><li>${esc(r.ai.a)}</li></ul>`;
  if (r.ai && r.ai.a) return popHtml({ word: r.word, an: r.an }).replace(/<div class="pw-more">[^<]*<\/div>/, '') + `<div class="pw-more">Nel contesto: ${esc(r.ai.a)}</div>`;
  if (!r.an.length) return `<div class="pw-lemma">${esc(r.word)}</div><div class="pw-mean">Parola non presente nel lessico di base.</div>`;
  const groups = new Map();
  r.an.forEach((a) => { if (!groups.has(a.e)) groups.set(a.e, []); groups.get(a.e).push(a.d + (a.enc ? ' + -' + a.enc : '')); });
  let html = '';
  [...groups.entries()].slice(0, 3).forEach(([e, ds]) => {
    html += `<div class="pw-lemma">${esc(e.lemma)}</div><div class="pw-mean">${esc(e.it)} · ${esc(e.cls)}</div>` + (e.k === 'i' ? '' : `<ul>${uniq(ds).slice(0, 4).map((d) => '<li>' + esc(d) + '</li>').join('')}</ul>`);
  });
  if (r.an.length > 1 && !r.an.every((a) => a.e.k === 'i')) html += `<div class="pw-more">Più analisi possibili: scegli quella adatta al contesto.</div>`;
  return html;
}
function closePop() { const p = $('#pop'); if (p) p.remove(); $$('.w.open').forEach((w) => w.classList.remove('open')); }
function showWordPop(btn) {
  const open = btn.classList.contains('open');
  closePop();
  if (open) return;
  const it = SES.cur.it;
  const r = wordAnalyses(it.s, +btn.dataset.i);
  const p = document.createElement('div'); p.className = 'pop-word'; p.id = 'pop'; p.setAttribute('role', 'tooltip');
  p.innerHTML = popHtml(r);
  document.body.appendChild(p);
  btn.classList.add('open');
  const b = btn.getBoundingClientRect(), pw = p.offsetWidth, ph = p.offsetHeight;
  let left = Math.min(Math.max(16, b.left + b.width / 2 - pw / 2), innerWidth - pw - 16);
  let top = b.bottom + 8; if (top + ph > innerHeight - 16) top = b.top - ph - 8;
  p.style.left = left + 'px'; p.style.top = Math.max(16, top) + 'px';
}
function isFiniteVerb(s, i) {
  const r = wordAnalyses(s, i);
  if (r.ai && /indicativo|congiuntivo|imperativo|\bind\.|\bcong\.|\bimp(er)?\./i.test(r.ai.a)) return true;
  return r.an.some((a) => /^(indicativo|congiuntivo|imperativo)/.test(a.d)) && !r.an.every((a) => a.e.k === 'i');
}
function toggleMethod(btn) {
  const aux = $('#aux'); const on = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', on);
  $$('.tool[data-act="hint"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  if (!on) { aux.innerHTML = ''; $$('.w.verb').forEach((w) => w.classList.remove('verb')); return; }
  aux.innerHTML = `<div class="method-box"><b>Metodo di costruzione</b><ol>${METHOD.slice(1, 7).map((m) => '<li>' + esc(m.h) + '</li>').join('')}</ol><button class="link" data-act="verbs">Evidenzia i verbi di modo finito</button></div>`;
}
function highlightVerbs() {
  const s = SES.cur.it.s; let n = 0;
  $$('.latin-line .w').forEach((w) => { if (isFiniteVerb(s, +w.dataset.i)) { w.classList.add('verb'); n++; } });
  SES.cur.verbs = true;
  toast(n ? (n === 1 ? 'Un verbo: una sola proposizione.' : n + ' verbi: ' + n + ' proposizioni da collegare.') : 'Nessun verbo di modo finito: forse è sottinteso.');
}
function autoHint(it) {
  if (it.s.tip) return it.s.tip;
  const words = it.s.la.replace(/_/g, ' ').split(/\s+/);
  for (let i = words.length - 1; i >= 0; i--) {
    if (isFiniteVerb(it.s, i)) {
      const r = wordAnalyses(it.s, i);
      const a = r.an.find((x) => /^(indicativo|congiuntivo|imperativo)/.test(x.d));
      return `Parti dal verbo «${r.word}»${a ? ': ' + a.d + ' di ' + a.e.head : ''}. Poi cerca il soggetto concordato.`;
    }
  }
  return 'Cerca prima il verbo, poi il soggetto in nominativo e l’oggetto in accusativo.';
}
function toggleHint(btn) {
  const aux = $('#aux'); const on = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', on);
  $$('.tool[data-act="method"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  if (!on) { aux.innerHTML = ''; return; }
  const it = SES.cur.it;
  let txt;
  if (it.type === 'it_la') {
    const first = latinTokens(it.s.la);
    txt = (it.s.tip ? it.s.tip + ' ' : '') + 'La frase latina ha ' + first.length + (first.length === 1 ? ' tessera' : ' tessere') + '. Il verbo va di solito in fondo.';
  } else txt = autoHint(it);
  SES.cur.hint = true;
  aux.innerHTML = `<div class="callout tip">${I.bulb}<div>${esc(txt)}</div></div>`;
}

/* ---------- Correzione ---------- */
function tilesToStr(c) { return c.chosen.map((k) => c.tiles[k]).join(' '); }
function bestItalianMatch(s, ans) {
  const refs = s.it.concat(S.extraIt[s.id] || []);
  const a = normIt(ans);
  let best = 0, bestRef = refs[0];
  for (const r of refs) { const v = simLoose(a, normIt(r)); if (v > best) { best = v; bestRef = r; } }
  return { best, bestRef };
}
function latinMultisetEqual(a, b) {
  const A = normLa(a).split(' ').filter(Boolean).sort().join(' ');
  const B = normLa(b).split(' ').filter(Boolean).sort().join(' ');
  return A === B;
}
function doCheck() {
  const c = SES.cur; if (!c || c.answered) return;
  const it = c.it;
  let res = null;
  if (it.type === 'la_it') {
    if (c.inputMode === 'tiles') {
      const built = tilesToStr(c);
      const ok = it.s.it.some((r) => normIt(r) === normIt(built));
      res = { ok, sol: it.s.it[0], given: built, near: !ok && simLoose(normIt(built), normIt(it.s.it[0])) > 0.7 };
    } else {
      const ans = $('#typed').value.trim();
      const m = bestItalianMatch(it.s, ans);
      if (m.best >= 0.88) res = { ok: true, sol: m.bestRef, given: ans, typed: true, note: m.best < 0.995 && normIt(ans) !== normIt(m.bestRef) ? 'Versione di riferimento: ' + m.bestRef : '' };
      else return pendingTyped(it, ans, m);
    }
  } else if (it.type === 'it_la') {
    if (c.inputMode === 'tiles') {
      const built = tilesToStr(c);
      const ok = latinMultisetEqual(built, it.s.la);
      const sameOrder = normLa(built) === normLa(it.s.la);
      res = { ok, sol: it.s.la.replace(/_/g, ' '), given: built.replace(/_/g, ' '), latin: true, note: ok && !sameOrder ? 'Corretto: in latino l’ordine è libero. Ordine classico: ' + it.s.la.replace(/_/g, ' ') : '' };
    } else {
      const ans = $('#typed').value.trim();
      if (latinMultisetEqual(ans, it.s.la)) res = { ok: true, sol: it.s.la.replace(/_/g, ' '), given: ans, latin: true, typed: true };
      else return pendingTyped(it, ans, null);
    }
  } else if (it.type === 'analizza') {
    const o = it.options[c.picked];
    const ok = it.valid.includes(o);
    res = { ok, sol: it.correct, others: it.valid.length > 1 ? it.valid : null, forms: true };
    markOptions(ok, (k) => it.valid.includes(it.options[k]));
  } else if (it.type === 'paradigma') {
    const ans = E.norm($('#typed').value.trim());
    const ok = it.answers.some((a) => E.norm(a) === ans);
    res = { ok, sol: it.answers.join(' / '), latin: true, forms: true };
  } else if (it.type === 'completa') {
    const ok = E.norm(it.options[c.picked]) === E.norm(it.answer);
    res = { ok, sol: it.s.la.replace(/_/g, ' '), latin: true };
    markOptions(ok, (k) => E.norm(it.options[k]) === E.norm(it.answer));
    const b = $('#blank'); if (b) b.textContent = it.answer;
  } else if (it.type === 'lessico') {
    const ok = it.options[c.picked] === it.e;
    res = { ok, sol: it.e.lemma + ' = ' + it.e.it };
    markOptions(ok, (k) => it.options[k] === it.e);
    const v = S.vocab[it.e.lemma] || { box: 0, due: dayKey() };
    if (ok) v.box = Math.min(5, v.box + 1); else v.box = 0;
    S.vocab[it.e.lemma] = v;
  }
  finalize(res);
}
function markOptions(ok, isRight) {
  $$('#ovBody .opt').forEach((b, k) => {
    b.disabled = true;
    if (isRight(k)) b.classList.add('right');
    else if (+k === SES.cur.picked && !ok) b.classList.add('wrong');
  });
}
function pendingTyped(it, ans, match) {
  const c = SES.cur; c.answered = true;
  $('#typed').readOnly = true;
  $$('#ovBody .tool').forEach((b) => (b.disabled = true));
  const latin = it.type === 'it_la';
  const sol = latin ? it.s.la.replace(/_/g, ' ') : (match ? match.bestRef : it.s.it[0]);
  if (aiUsable()) {
    $('#ovFoot').innerHTML = thinking('Il magister sta leggendo la tua traduzione…');
    aiCorrect(it.s, ans, it.type).then((r) => {
      if (!SES || SES.cur !== c) return;
      const esito = String(r.esito).toLowerCase();
      const ok = esito.startsWith('corrett') || esito.startsWith('accettab');
      finalize({ ok, partial: esito.startsWith('accettab'), sol: r.proposta || sol, latin, given: ans, typed: true, ai: r }, true);
    }).catch((e) => {
      const msg = aiFail(e);
      if (!SES || SES.cur !== c) return;
      selfGrade(it, ans, sol, latin, msg);
    });
  } else selfGrade(it, ans, sol, latin, '');
}
function selfGrade(it, ans, sol, latin, msg) {
  $('#ovFootWrap').className = 'ov-foot';
  $('#ovFoot').innerHTML = `<div class="fb"><div class="fb-ico">${I.eye}</div><div class="fb-txt"><h3>Confronta con la soluzione</h3>
    ${msg ? `<p class="note">${esc(msg)}</p>` : ''}<p>Soluzione: <span class="sol${latin ? ' la' : ''}">${esc(sol)}</span></p>${it.s.it.length > 1 && !latin ? `<p class="note">Anche: ${it.s.it.slice(1, 3).map(esc).join(' · ')}</p>` : ''}</div></div>
    <div class="self"><button class="btn err" data-act="self" data-v="0">Ho sbagliato</button><button class="btn ok" data-act="self" data-v="1">Era corretta</button></div>`;
  SES.cur.selfData = { ans, sol, latin };
}
function onSelf(v) {
  const c = SES.cur, d = c.selfData;
  if (v && c.it.type === 'la_it') { (S.extraIt[c.it.s.id] = S.extraIt[c.it.s.id] || []).push(d.ans); }
  finalize({ ok: !!v, sol: d.sol, latin: d.latin, given: d.ans, typed: true, self: true }, true);
}

const PRAISE = ['Optime!', 'Bene!', 'Recte!', 'Euge!', 'Macte!'];
function finalize(res, already) {
  const c = SES.cur, it = c.it;
  c.answered = true; c.res = res;
  $$('#ovBody .tile, #ovBody .tool, #ovBody .opt').forEach((b) => (b.disabled = true));
  const t = $('#typed'); if (t) t.readOnly = true;
  S.stats.answered++;
  const topic = it.topic || (it.s && it.s.focus);
  recordMastery(topic, res.ok);
  let gained = 0;
  if (res.ok) {
    SES.combo++; SES.best = Math.max(SES.best, SES.combo); SES.ok++; S.stats.correct++;
    gained = XP_BASE[it.type] * (res.partial ? 0.7 : 1) + (SES.combo >= 3 ? Math.min(SES.combo, 6) * 2 : 0) + (it.s && it.s.src === 'ai' ? 3 : it.s && it.s.src === 'gen' ? 2 : 0);
    if (it.type === 'la_it' || it.type === 'it_la') S.stats.translated++;
    if (it.type === 'analizza' || it.type === 'paradigma') S.stats.forms++;
    if (res.typed && !res.self) S.stats.typedOK++;
    if (it.review) { S.mistakes = S.mistakes.filter((m) => m !== it.review); }
    sfx.ok(); buzz(15);
  } else {
    SES.combo = 0; SES.ko++;
    addMistake(it);
    SES.wrongs.push(it);
    sfx.err(); buzz([30, 40, 30]);
  }
  if (it.s && it.s.src === 'ai') S.stats.aiSeen++;
  if (it.s && it.s.src === 'gen' && res.ok) S.stats.genSeen = (S.stats.genSeen || 0) + 1;
  if (it.s) { S.recent = S.recent.filter((x) => x !== it.s.id).concat([it.s.id]).slice(-40); }
  gained = Math.round(gained);
  SES.xp += gained;
  setCombo();
  save();
  showFeedback(res, gained);
}
function addMistake(it) {
  if (it.s && it.s.src === 'gen') S.genSaved = (S.genSaved || []).filter((x) => x.id !== it.s.id).concat([it.s]).slice(-80);
  let m = null;
  if (it.type === 'la_it' || it.type === 'it_la') m = { k: 's', id: it.s.id, dir: it.type };
  else if (it.type === 'completa') m = { k: 'c', id: it.s.id };
  else if (it.type === 'analizza' || it.type === 'paradigma') m = { k: 'f', lemma: it.e.lemma, key: it.key, t: it.type };
  else if (it.type === 'lessico') m = { k: 'l', lemma: it.e.lemma };
  if (!m) return;
  const same = (a) => JSON.stringify({ ...a, at: 0 }) === JSON.stringify({ ...m, at: 0 });
  S.mistakes = S.mistakes.filter((a) => !same(a)).concat([{ ...m, at: Date.now() }]).slice(-60);
}
function showFeedback(res, gained) {
  const it = SES.cur.it;
  const topic = it.topic || (it.s && it.s.focus);
  $('#ovFootWrap').className = 'ov-foot ' + (res.ok ? 'ok' : 'err');
  let body = '';
  if (res.ok) {
    body += `<h3>${res.partial ? 'Bene, quasi perfetta' : pick(PRAISE)}</h3>`;
    body += `<p>${gained ? '+' + gained + ' XP' : ''}${SES.combo >= 3 ? ' · serie di ' + SES.combo : ''}</p>`;
    if (res.note) body += `<p class="note">${esc(res.note)}</p>`;
  } else {
    body += `<h3>${res.near ? 'Paene! Quasi' : 'Non proprio'}</h3>`;
    body += `<p>Soluzione: <span class="sol${res.latin ? ' la' : ''}">${esc(res.sol)}</span></p>`;
    if (res.others) body += `<p class="note">Questa forma può essere anche: ${res.others.filter((o) => o !== res.sol).map(esc).join('; ')}</p>`;
  }
  if (res.ok && res.others && res.others.length > 1) body += `<p class="note">Attenzione: può essere anche ${res.others.filter((o) => o !== it.options[SES.cur.picked]).map(esc).join('; ')}.</p>`;
  if (res.ai) {
    const a = res.ai;
    if (a.errori && a.errori.length) body += `<ul class="errlist">${a.errori.slice(0, 3).map((e) => `<li><b>${esc(e.frammento || '')}</b>${e.tipo ? ' <span class="tag">' + esc(e.tipo) + '</span>' : ''} ${esc(e.spiegazione || '')}</li>`).join('')}</ul>`;
    if (res.ok && a.proposta && normIt(a.proposta) !== normIt(res.given || '')) body += `<p class="note">Proposta: ${esc(a.proposta)}</p>`;
    if (a.consiglio) body += `<p class="note">${esc(a.consiglio)}</p>`;
  }
  const extra = [];
  if (topic && TOPIC[topic]) extra.push(`<button class="tool" data-act="theory" data-t="${topic}">${I.open}${esc(TOPIC[topic].short)}</button>`);
  if (it.s) extra.push(`<button class="tool" data-act="analysis">${I.magnify}Analisi</button>`);
  if (it.s && aiUsable()) extra.push(`<button class="tool" data-act="explain">${I.spark}Spiegamela</button>`);
  if (it.s && (it.s.src === 'ai' || it.s.src === 'gen')) extra.push(`<button class="tool" data-act="report">${I.flag}Segnala</button>`);
  $('#ovFoot').innerHTML = `<div class="fb ${res.ok ? 'ok' : 'err'}" role="status"><div class="fb-ico">${res.ok ? I.check : I.x}</div><div class="fb-txt">${body}</div></div>
    ${extra.length ? `<div class="fb-extra">${extra.join('')}</div>` : ''}
    <button class="btn block ${res.ok ? 'ok' : 'err'}" data-act="next" id="nextBtn">Continua</button>`;
  setTimeout(() => { const n = $('#nextBtn'); if (n) n.focus({ preventScroll: true }); }, 50);
}
function nextItem() { SES.i++; renderItem(); }

function finishSession() {
  SES.done = true;
  const total = SES.ok + SES.ko;
  const perfect = total >= 5 && SES.ko === 0;
  let bonus = perfect ? 20 : 0;
  const rankUp = addXP(SES.xp + bonus);
  const firstToday = total > 0 ? touchStreak() : false;
  S.stats.sessions++;
  if (perfect) S.stats.perfect++;
  if (SES.mode === 'review' && S.mistakes.length === 0 && total > 0) S.stats.clearedReview++;
  const h = new Date().getHours();
  const won = checkBadges({ noctua: h >= 22, aurora: h < 8 });
  save();
  setProgress(1);
  sfx.done(); confetti();
  const acc = total ? Math.round((SES.ok / total) * 100) : 0;
  const title = perfect ? 'Perfecta!' : acc >= 70 ? 'Bene factum!' : 'Labor omnia vincit';
  const sub = perfect ? 'Nessun errore: +20 XP di bonus.' : acc >= 70 ? 'Ottimo lavoro, continua così.' : 'Gli errori finiscono nel ripasso: li rivedrai presto.';
  $('#ovFootWrap').className = 'ov-foot';
  $('#ovBody').innerHTML = `<div class="result">${laurelSvg()}<h1>${title}</h1><p class="muted" style="margin:0">${sub}</p>
    <div class="res-stats"><div class="res-stat" style="--tc:var(--gold)"><span>XP</span><b>+${SES.xp + bonus}</b></div><div class="res-stat" style="--tc:var(--ok)"><span>Precisione</span><b>${acc}%</b></div><div class="res-stat" style="--tc:var(--g-ver)"><span>Serie max</span><b>${SES.best}</b></div></div>
    ${firstToday ? `<p class="note" style="margin:0">${I.flame.replace('<svg', '<svg width="14" height="14" style="color:var(--g-ver);vertical-align:-2px"')} Serie di ${S.streak} ${S.streak === 1 ? 'giorno' : 'giorni'}</p>` : ''}
    ${SES.wrongs.length ? `<div class="review"><h3>Da rivedere</h3>${SES.wrongs.slice(0, 6).map(reviewLine).join('')}</div>` : ''}</div>`;
  $('#ovFoot').innerHTML = `<button class="btn block" data-act="endSession">Continua</button>`;
  SES.after = { rankUp, won };
}
function reviewLine(it) {
  if (it.s && (it.type === 'la_it' || it.type === 'it_la')) return `<div class="r-item"><div class="la">${esc(it.s.la.replace(/_/g, ' '))}</div><div class="muted">${esc(it.s.it[0])}</div></div>`;
  if (it.type === 'completa') return `<div class="r-item"><div class="la">${esc(it.s.la.replace(/_/g, ' '))}</div><div class="muted">Forma mancante: ${esc(it.answer)}</div></div>`;
  if (it.type === 'analizza') return `<div class="r-item"><span class="la">${esc(it.form)}</span> — ${esc(it.correct)}</div>`;
  if (it.type === 'paradigma') return `<div class="r-item">${esc(it.desc)} di <span class="la">${esc(it.e.head)}</span>: <b class="la">${esc(it.answers.join(' / '))}</b></div>`;
  if (it.type === 'lessico') return `<div class="r-item"><span class="la">${esc(it.e.lemma)}</span> — ${esc(it.e.it)}</div>`;
  return '';
}
function endSession() {
  const after = SES && SES.after;
  SES = null; closeOverlay(); render();
  if (after) {
    if (after.rankUp) showModal(`<div class="eyebrow">Cursus honorum</div><h1 style="font-family:var(--f-display);font-weight:400;font-size:34px;letter-spacing:.06em">${esc(after.rankUp.name)}</h1><p class="muted" style="margin:0">Sei salito di grado: ora sei ${esc(after.rankUp.it)}.</p><button class="btn block" data-act="closeModal">Gratias!</button>`);
    after.won.forEach((b, i) => setTimeout(() => toast('Nuova insegna: ' + b.name), 600 + i * 2800));
  }
  flushToasts();
}
function laurelSvg() {
  const cx = 60, cy = 50, R = 36;
  let leaves = '', stem = '';
  for (const side of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 9; k++) {
      const th = (side < 0 ? 105 + k * 15 : 75 - k * 15) * Math.PI / 180;
      pts.push([cx + R * Math.cos(th), cy + R * Math.sin(th), th]);
    }
    stem += `<path d="M${pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L')}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`;
    pts.slice(1).forEach(([x, y, th], k) => {
      const deg = th * 180 / Math.PI;
      for (const o of [1, -1]) {
        const lx = x + o * 6 * Math.cos(th), ly = y + o * 6 * Math.sin(th);
        const rot = deg + o * side * 35;
        leaves += `<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="3.6" ry="8" transform="rotate(${rot.toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})" fill="currentColor" opacity="${(0.62 + k * 0.04).toFixed(2)}"/>`;
      }
    });
  }
  return `<svg class="laurel" viewBox="0 0 120 100" aria-hidden="true">${stem}${leaves}</svg>`;
}
