/* VERTO — viste, navigazione, avvio */
const UI = { tab: 'domus', topic: null, method: false, flash: null, onb: null, lookup: '' };
const ROMAN = (n) => { const r = [['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]]; let s = ''; for (const [k, v] of r) while (n >= v) { s += k; n -= v; } return s; };

function ringSvg(p, size = 78, stroke = 9, color = 'var(--gold)') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.min(1, p));
  return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/></svg>`;
}
function miniRing(t) {
  const m = mastery(t);
  return `<div class="mini-ring" title="Padronanza ${Math.round(m * 100)}%">${ringSvg(m, 34, 4, 'var(--ok)')}<span>${Math.round(m * 100)}</span></div>`;
}
function sententiaOfDay() { return SENTENTIAE[hashStr(dayKey()) % SENTENTIAE.length]; }
function aiStatusText() {
  if (!S.settings.ai) return 'Disattivato nelle impostazioni.';
  return {
    checking: 'Verifica di Claude in corso…',
    ready: 'Frasi inedite sui tuoi argomenti, corrette da Claude.',
    off: 'Disponibile aprendo la pagina in Claude con un account.',
    denied: 'Claude non è autorizzato per questa pagina.',
    limited: 'Limite di richieste raggiunto: riprova più tardi.',
  }[AI.state] || '';
}
function onAIState() { $$('[data-ai-status]').forEach((el) => (el.textContent = aiStatusText())); }

/* ---------- Shell ---------- */
function render() {
  const st = effectiveStreak();
  $('#chips').innerHTML = `<span class="chip streak${st ? '' : ' cold'}" title="Serie di giorni">${I.flame}<span>${st}</span></span><span class="chip xp" title="Punti esperienza">${I.gem}<span>${S.xp}</span></span>`;
  $$('.nav button').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === UI.tab ? 'page' : 'false'));
  const v = $('#view');
  if (UI.tab === 'domus') v.innerHTML = viewHome();
  else if (UI.tab === 'bibliotheca') v.innerHTML = UI.method ? viewMethod() : UI.topic ? viewTopic(UI.topic) : viewLibrary();
  else if (UI.tab === 'verba') { v.innerHTML = viewVerba(); bindVerba(); }
  else if (UI.tab === 'ego') { v.innerHTML = viewEgo(); bindEgo(); }
  onAIState();
}
function go(tab) {
  UI.tab = tab; UI.topic = null; UI.method = false;
  try { history.replaceState(null, '', '#' + tab); } catch (e) { /* ignora */ }
  render(); window.scrollTo(0, 0);
}

/* ---------- Domus ---------- */
function viewHome() {
  const rk = rankOf(S.xp);
  const tx = todayXP();
  const sp = sentencePool().length;
  const nErr = S.mistakes.length;
  const sn = sententiaOfDay();
  const ids = ORDER.filter((t) => S.topics.includes(t));
  const ai = aiUsable() || (AI.state === 'checking' && S.settings.ai);
  const goalMsg = tx >= S.goal ? 'Obiettivo di oggi raggiunto. Optime!' : `Mancano ${S.goal - tx} XP all’obiettivo di oggi.`;
  return `
  <div class="hello"><div><div class="eyebrow">Domus</div><h1>Salve${S.name ? ', ' + esc(S.name) : ''}!</h1></div><div class="rank-pill">Grado <b>${esc(rk.name)}</b></div></div>
  <section class="today" aria-label="Allenamento di oggi">
    <div class="ring">${ringSvg(tx / S.goal)}<div class="ring-txt">${tx}<small>/ ${S.goal} XP</small></div></div>
    <div class="today-body"><h2>Exercitatio cotidiana</h2><p>12 esercizi misti su ${ids.length} argomenti, con più spazio a quelli che padroneggi meno. ${goalMsg}</p>
    <button class="btn" data-act="start" data-mode="mix">Inizia l’allenamento</button></div>
  </section>
  <div class="section"><div class="section-head"><h2>Allenati su</h2><span class="note tnum">${sp} frasi verificate${GEN_OK && S.settings.gen !== false ? ' + nuove illimitate' : ''}</span></div>
  <div class="modes">
    <button class="mode" data-act="start" data-mode="la_it"><span class="mode-ico">${I.translate}</span><b>Versione</b><span>Dal latino all’italiano</span></button>
    <button class="mode" data-act="start" data-mode="it_la"><span class="mode-ico">${I.pen}</span><b>Retroversione</b><span>Dall’italiano al latino</span></button>
    <button class="mode" data-act="start" data-mode="forme"><span class="mode-ico">${I.magnify}</span><b>Forme</b><span>Analisi e paradigmi da riconoscere</span></button>
    <button class="mode" data-act="start" data-mode="lessico"><span class="mode-ico">${I.cards}</span><b>Lessico</b><span>Quiz rapido sui vocaboli</span></button>
    <button class="mode" data-act="start" data-mode="review" ${nErr ? '' : 'aria-disabled="true"'}><span class="mode-ico">${I.retry}</span><b>Ripasso errori</b><span>${nErr ? 'Riprova ciò che hai sbagliato' : 'Nessun errore in sospeso'}</span>${nErr ? `<span class="badge-n">${nErr}</span>` : ''}</button>
    <button class="mode" data-act="start" data-mode="paradigma"><span class="mode-ico">${I.table}</span><b>Paradigmi</b><span>Scrivi tu la forma richiesta</span></button>
    ${HAS_CLAUDE && aiUsable() ? `<button class="mode wide ai" data-act="start" data-mode="nuove"><span class="mode-ico">${I.spark}</span><div><b>Frasi nuove</b><span data-ai-status>${esc(aiStatusText())}</span></div></button>` : GEN_OK ? `<button class="mode wide ai" data-act="start" data-mode="nuove"><span class="mode-ico">${I.spark}</span><div><b>Frasi nuove</b><span>Sempre diverse, create sul momento sui tuoi argomenti. Funziona anche offline.</span></div></button>` : ''}
  </div></div>
  <div class="section"><div class="eyebrow">Sententia diei</div>
  <article class="sententia"><div class="quote" lang="la">${esc(sn[0])}</div><p class="tr">${esc(sn[1])}</p><p class="src">${esc(sn[2])}</p>
  <details><summary>Nota di grammatica</summary><p style="margin:6px 0 0">${esc(sn[3].charAt(0).toUpperCase() + sn[3].slice(1))}</p></details></article></div>
  <div class="section"><div class="section-head"><h2>Il tuo mosaico</h2><button class="link" data-act="editTopics">Modifica argomenti</button></div>
  <div class="mosaic" role="list">${ORDER.map((id) => { const t = TOPIC[id]; const on = S.topics.includes(id); const m = on ? 0.16 + mastery(id) * 0.84 : 0; return `<button role="listitem" class="tess ${GROUPS[t.group].color}${on ? '' : ' off'}${m > 0.55 ? ' hi' : ''}" style="--m:${m.toFixed(2)}" data-act="topic" data-t="${id}" title="${esc(t.title)}${on ? ' · padronanza ' + Math.round(mastery(id) * 100) + '%' : ' · non ancora studiato'}"><span class="fill"></span><span class="lbl">${esc(t.short)}</span></button>`; }).join('')}</div>
  <div class="legend">${Object.values(GROUPS).map((g) => `<span><i class="${g.color}" style="background:var(--tc)"></i>${esc(g.name)}</span>`).join('')}<span>Più scuro = più padroneggiato</span></div></div>`;
}

/* ---------- Bibliotheca ---------- */
function viewLibrary() {
  let html = `<div class="hello"><div><div class="eyebrow">Bibliotheca</div><h1>Teoria e metodo</h1></div></div>
  <div class="section"><button class="mode wide" data-act="method"><span class="mode-ico">${I.method}</span><div><b>Ars vertendi</b><span>Il metodo per costruire e tradurre una frase, passo per passo</span></div></button></div>`;
  for (const [gid, g] of Object.entries(GROUPS)) {
    const ts = ORDER.filter((id) => TOPIC[id].group === gid);
    html += `<div class="section"><h2>${esc(g.name)}</h2><div class="list">${ts.map((id) => {
      const t = TOPIC[id], on = S.topics.includes(id);
      return `<button class="row ${g.color}" data-act="topic" data-t="${id}"><span class="dot"></span><span class="grow"><b>${esc(t.title)}</b><span>${ROMAN(t.n)} · ${on ? 'studiato' : 'non ancora studiato'}</span></span>${on ? miniRing(id) : ''}${I.chev}</button>`;
    }).join('')}</div></div>`;
  }
  html += `<div class="section"><h2>Sententiae</h2><div class="list"><button class="row" data-act="sententiae"><span class="grow"><b>Raccolta di massime latine</b><span>${SENTENTIAE.length} frasi celebri con traduzione e nota di grammatica</span></span>${I.chev}</button></div></div>`;
  return html;
}
function tableHtml(t) {
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${t.c.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${t.r.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function theoryHtml(id) {
  const t = TOPIC[id];
  let html = '<div class="theory">';
  for (const b of t.body) {
    if (b.p) html += `<p>${b.p}</p>`;
    else if (b.t) html += tableHtml(b.t) + (b.cap ? `<div class="tbl-cap">${b.cap}</div>` : '');
    else if (b.ul) html += `<ul>${b.ul.map((x) => '<li>' + x + '</li>').join('')}</ul>`;
  }
  html += `<div class="callout tip">${I.bulb}<div><b>Come tradurre.</b> ${t.tip}</div></div>`;
  html += `<div class="callout trap">${I.alert}<div><b>Trappole frequenti</b><ul>${t.trap.map((x) => '<li>' + x + '</li>').join('')}</ul></div></div>`;
  html += `<div class="ex"><h3>Esempi</h3>${t.ex.map(([la, it]) => `<div class="ex-row"><div class="la" lang="la">${esc(la)}</div><div class="it">${esc(it)}</div></div>`).join('')}</div>`;
  return html + '</div>';
}
function viewTopic(id) {
  const t = TOPIC[id], on = S.topics.includes(id), g = GROUPS[t.group];
  const n = sentencePool(id).length;
  return `<div class="topbar-sub" style="display:flex;align-items:center;gap:6px;margin:4px 0 6px"><button class="iconbtn" data-act="backLib" aria-label="Torna alla biblioteca">${I.back}</button><span class="eyebrow">${esc(g.name)} · ${ROMAN(t.n)}</span></div>
  <h1>${esc(t.title)}</h1>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 14px"><span class="tag ${on ? 'on' : ''}">${on ? 'Studiato' : 'Non ancora studiato'}</span>${on ? `<span class="tag">Padronanza ${Math.round(mastery(id) * 100)}%</span>` : ''}<span class="tag">${n} frasi verificate</span></div>
  ${on ? `<button class="btn block" data-act="start" data-mode="topic" data-t="${id}">Allenati su questo argomento</button>` : `<button class="btn block ghost" data-act="addTopic" data-t="${id}">Aggiungi ai miei argomenti</button>`}
  <div class="section">${theoryHtml(id)}</div>
  ${HAS_CLAUDE ? `<div class="section ask"><h2>Hai un dubbio?</h2>
  ${aiUsable() ? `<label class="note" for="askQ">Chiedi al magister. Risponde Claude, in base a questo argomento.</label><textarea id="askQ" placeholder="Es. come distinguo il genitivo singolare dal nominativo plurale?"></textarea><div><button class="btn small" data-act="ask" data-t="${id}">${I.spark} Chiedi</button></div><div id="askOut"></div>` : `<p class="note" data-ai-status>${esc(aiStatusText())}</p>`}
  </div>` : ''}`;
}
function viewMethod() {
  return `<div style="display:flex;align-items:center;gap:6px;margin:4px 0 6px"><button class="iconbtn" data-act="backLib" aria-label="Torna alla biblioteca">${I.back}</button><span class="eyebrow">Ars vertendi</span></div>
  <h1>Il metodo per tradurre</h1>
  <p class="muted" style="max-width:60ch">Tradurre non è indovinare: è riconoscere le forme e ricostruire le relazioni. Segui questi passaggi su ogni frase, finché diventano automatici.</p>
  <ol class="method" style="padding:0;margin:14px 0 0">${METHOD.map((m) => `<li><div><b>${esc(m.h)}</b><span>${esc(m.p)}</span></div></li>`).join('')}</ol>
  <div class="section"><h2>Usare bene il dizionario</h2><div class="theory"><ul>
  <li>Cerca il <b>lemma</b>: nominativo singolare per i nomi, maschile per gli aggettivi, 1ª persona del presente per i verbi.</li>
  <li>Leggi <b>tutte</b> le accezioni prima di scegliere: il contesto decide (<span class="la">peto</span> + acc. = dirigersi verso, chiedere).</li>
  <li>Guarda le <b>costruzioni</b> indicate (es. <span class="la">utor</span> + abl., <span class="la">praesum</span> + dat.): spesso cambiano il significato.</li>
  <li>Nei verbi controlla il <b>paradigma</b>: ti dice se il verbo è deponente e qual è il tema del perfetto.</li></ul></div></div>
  <div class="section"><h2>Errori da evitare</h2><div class="callout trap">${I.alert}<div><ul>
  <li>Tradurre parola per parola nell’ordine latino.</li><li>Scegliere il primo significato del dizionario senza verificarlo.</li><li>Ignorare le desinenze e «inventare» la frase dal lessico.</li><li>Dimenticare parole piccole ma decisive: <span class="la">non, ne, -que, quam</span>.</li></ul></div></div></div>`;
}

/* ---------- Verba ---------- */
const BOX_DAYS = [0, 1, 3, 7, 14, 30];
function vocabQueue() {
  const T = sel(), today = dayKey();
  const ents = E.LEX.filter((e) => T.has(e.t) && !e.prop);
  const due = ents.filter((e) => S.vocab[e.lemma] && S.vocab[e.lemma].due <= today);
  const introduced = Object.values(S.vocab).filter((v) => v.intro === today).length;
  const fresh = ents.filter((e) => !S.vocab[e.lemma]).sort((a, b) => ORDER.indexOf(a.t) - ORDER.indexOf(b.t)).slice(0, Math.max(0, 10 - introduced));
  return { due, fresh, ents };
}
function viewVerba() {
  const q = vocabQueue();
  const boxes = [1, 2, 3, 4, 5].map((b) => Object.entries(S.vocab).filter(([, v]) => v.box === b).length);
  const learned = Object.values(S.vocab).filter((v) => v.box >= 3).length;
  if (!UI.flash) UI.flash = { list: shuffle(q.due).concat(q.fresh), i: 0, show: false };
  const cur = UI.flash.list[UI.flash.i];
  return `<div class="hello"><div><div class="eyebrow">Verba</div><h1>Lessico</h1></div><div class="rank-pill tnum"><b>${learned}</b> imparate</div></div>
  <div class="section"><h2>Cerca una forma</h2><div class="lookup"><input id="lookup" class="input latin" placeholder="es. regum, amabatur, eius" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Forma latina da analizzare" value="${esc(UI.lookup)}"></div>${DICT.enabled() ? '<p class="note" style="margin:0">Le parole che non sono nel lessico di base vengono cercate nel Wikizionario.</p>' : ''}<div id="lookupOut" class="analysis"></div></div>
  <div class="section"><div class="section-head"><h2>Ripasso del giorno</h2><span class="note tnum">${Math.max(0, UI.flash.list.length - UI.flash.i)} carte</span></div>
  ${cur ? `<div class="flash"><div class="flash-card"><div class="cls">${esc(cur.cls)}</div><div class="lemma" lang="la">${esc(cur.lemma)}</div>
    ${UI.flash.show ? `<div class="mean">${esc(cur.it)}</div>` : `<button class="btn ghost small" data-act="flip">Mostra il significato</button>`}</div>
    ${UI.flash.show ? `<div class="flash-actions"><button class="btn err" data-act="card" data-v="0">Da rivedere</button><button class="btn ok" data-act="card" data-v="1">La sapevo</button></div>` : ''}</div>`
    : `<div class="card empty">${I.cards}<b>Ripasso completato per oggi.</b><span>Domani troverai le parole da ripetere e nuovi vocaboli dei tuoi argomenti.</span><button class="btn small ghost" data-act="start" data-mode="lessico">Fai un quiz di lessico</button></div>`}
  <div class="boxes" aria-label="Scatole della ripetizione dilazionata">${boxes.map((n, i) => `<div class="box"><b>${n}</b><span>${ROMAN(i + 1)} · ${['1 g', '3 gg', '7 gg', '14 gg', '30 gg'][i]}</span></div>`).join('')}</div>
  <p class="note">Ogni parola che sai passa alla scatola successiva e torna dopo più giorni; se la sbagli, riparte dalla prima.</p></div>`;
}
function localAnalysisHtml(w) {
  const an = E.analyze(w);
  if (!an.length) return '';
  const groups = new Map();
  an.forEach((a) => { if (!groups.has(a.e)) groups.set(a.e, []); groups.get(a.e).push(a.d + (a.enc ? ' + -' + a.enc : '')); });
  return [...groups.entries()].map(([e, ds]) => `<div class="an-item"><div class="wk-head"><span class="an-lemma" lang="la">${esc(e.lemma)}</span><span class="tag on">lessico di base</span></div><div class="an-mean">${esc(e.it)} · ${esc(e.cls)}</div><ul>${uniq(ds).map((d) => '<li>' + esc(d) + '</li>').join('')}</ul></div>`).join('');
}
let wkTimer = null, wkSeq = 0;
async function runWiki(w, box) {
  const seq = ++wkSeq;
  box.innerHTML = thinking('Cerco «' + w + '» nel Wikizionario…');
  let r;
  try { r = await DICT.lookup(w); } catch (e) { r = { status: 'error' }; }
  if (seq !== wkSeq || !box.isConnected) return;
  box.innerHTML = DICT.render(r);
}
function bindVerba() {
  const inp = $('#lookup'); if (!inp) return;
  const run = () => {
    UI.lookup = inp.value;
    const w = inp.value.trim();
    const out = $('#lookupOut');
    clearTimeout(wkTimer); wkSeq++;
    if (!w) { out.innerHTML = ''; return; }
    const local = localAnalysisHtml(w);
    const online = DICT.enabled();
    if (local) {
      out.innerHTML = local + (online ? `<div id="wkOut"><button class="btn ghost small" data-act="wk" data-w="${esc(w)}">${I.open} Altri significati nel Wikizionario</button></div>` : '');
      return;
    }
    if (!online) { out.innerHTML = `<p class="note">Nessuna forma trovata nel lessico di base. Controlla l’ortografia o cerca il lemma sul dizionario.</p>`; return; }
    out.innerHTML = `<p class="note">Non è nel lessico di base.</p><div id="wkOut"></div>`;
    if (w.length >= 2) wkTimer = setTimeout(() => runWiki(w, $('#wkOut')), 700);
  };
  inp.addEventListener('input', run);
  if (inp.value) run();
}
function flashAnswer(v) {
  const f = UI.flash, e = f.list[f.i]; if (!e) return;
  const today = dayKey();
  const rec = S.vocab[e.lemma] || { box: 0, due: today, intro: today };
  if (v) { rec.box = Math.min(5, rec.box + 1); rec.due = addDays(today, BOX_DAYS[rec.box]); addXP(1); }
  else { rec.box = 1; rec.due = today; f.list.push(e); }
  S.vocab[e.lemma] = rec;
  f.i++; f.show = false;
  checkBadges().forEach((b) => toast('Nuova insegna: ' + b.name));
  save(); render();
}

/* ---------- Ego ---------- */
function weekSvg() {
  const days = Array.from({ length: 7 }, (_, i) => addDays(dayKey(), i - 6));
  const vals = days.map((d) => S.days[d] || 0);
  const max = Math.max(S.goal, ...vals) * 1.15;
  const W = 320, H = 130, top = 12, bottom = 104, bw = 26;
  const y = (v) => bottom - (v / max) * (bottom - top);
  const names = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="XP degli ultimi sette giorni">`;
  s += `<line x1="8" x2="${W - 8}" y1="${y(S.goal).toFixed(1)}" y2="${y(S.goal).toFixed(1)}" stroke="var(--gold)" stroke-dasharray="4 4" stroke-width="1.5"/>`;
  s += `<text x="8" y="${(y(S.goal) - 5).toFixed(1)}" text-anchor="start" font-size="10" fill="var(--gold)">obiettivo ${S.goal} XP</text>`;
  days.forEach((d, i) => {
    const cx = 24 + i * ((W - 48) / 6), v = vals[i], yy = y(v);
    const isToday = i === 6;
    s += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${yy.toFixed(1)}" width="${bw}" height="${Math.max(0, bottom - yy).toFixed(1)}" rx="6" fill="${v >= S.goal ? 'var(--ok)' : isToday ? 'var(--accent)' : 'var(--line-strong)'}"/>`;
    if (v) s += `<text x="${cx.toFixed(1)}" y="${(yy - 4).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--ink)">${v}</text>`;
    const [yr, mo, da] = d.split('-').map(Number);
    s += `<text x="${cx.toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="${isToday ? 'var(--accent)' : 'var(--muted)'}" font-weight="${isToday ? 700 : 400}">${names[new Date(yr, mo - 1, da).getDay()]}</text>`;
  });
  return s + `<line x1="8" x2="${W - 8}" y1="${bottom}" y2="${bottom}" stroke="var(--line)"/></svg>`;
}
function viewEgo() {
  const rk = rankOf(S.xp);
  const acc = S.stats.answered ? Math.round((S.stats.correct / S.stats.answered) * 100) : 0;
  return `<div class="hello"><div><div class="eyebrow">Ego</div><h1>Il tuo percorso</h1></div></div>
  <section class="rank-card" style="margin-top:14px"><div class="eyebrow">Cursus honorum</div><div><div class="rank-name">${esc(rk.name)}</div><div class="rank-it">${esc(rk.it)} · ${S.xp} XP</div></div>
  <div class="cursus" aria-hidden="true">${RANKS.map((r, i) => `<i class="${i <= rk.i ? 'done' : ''}"></i>`).join('')}</div>
  ${rk.next ? `<div class="bar" role="progressbar" aria-valuenow="${Math.round(rk.pct * 100)}" aria-valuemin="0" aria-valuemax="100" aria-label="Avanzamento di grado"><i style="width:${Math.round(rk.pct * 100)}%"></i></div><div class="rank-it">${rk.next.xp - S.xp} XP al grado di ${esc(rk.next.name)}</div>` : '<div class="rank-it">Hai raggiunto il grado più alto.</div>'}</section>
  <div class="section"><div class="stats">
    <div class="stat"><b>${effectiveStreak()}</b><span>giorni di serie${S.freezes ? ' · ' + S.freezes + (S.freezes === 1 ? ' scudo' : ' scudi') : ''}</span></div>
    <div class="stat"><b>${S.stats.translated}</b><span>frasi tradotte</span></div>
    <div class="stat"><b>${acc}%</b><span>precisione</span></div>
    <div class="stat"><b>${S.stats.sessions}</b><span>allenamenti completati</span></div></div></div>
  <div class="section"><h2>Ultimi sette giorni</h2><div class="week">${weekSvg()}</div></div>
  <div class="section"><div class="section-head"><h2>Insignia</h2><span class="note tnum">${Object.keys(S.badges).length} / ${BADGES.length}</span></div>
  <div class="coins">${BADGES.map((b) => `<button class="coin${S.badges[b.id] ? '' : ' locked'}" data-act="badge" data-b="${b.id}"><span class="disc">${esc(b.glyph)}</span><b>${esc(b.name)}</b></button>`).join('')}</div></div>
  <div class="section settings"><h2>Impostazioni</h2><div class="list">
    <div class="row"><span class="grow"><b>Nome</b><span>Compare nel saluto</span></span><input id="nameInp" class="input" style="max-width:150px;height:40px" value="${esc(S.name)}" maxlength="24" aria-label="Nome"></div>
    <button class="row" data-act="editTopics"><span class="grow"><b>Argomenti studiati</b><span>${S.topics.length} su ${ORDER.length}</span></span>${I.chev}</button>
    <div class="row" style="flex-direction:column;align-items:stretch"><span class="grow"><b>Obiettivo giornaliero</b></span><div class="seg" role="group" aria-label="Obiettivo giornaliero">${[[30, 'Leggero', '≈ 5 min'], [60, 'Regolare', '≈ 10 min'], [100, 'Intenso', '≈ 15 min']].map(([g, n, d]) => `<button data-act="goal" data-g="${g}" aria-pressed="${S.goal === g}"><b>${n}</b><span>${g} XP · ${d}</span></button>`).join('')}</div></div>
    <div class="row"><span class="grow"><b>Risposte con le tessere</b><span>Disattiva per scrivere a tastiera</span></span><label class="switch"><input type="checkbox" id="swTiles" ${S.settings.input === 'tiles' ? 'checked' : ''} aria-label="Risposte con le tessere"><i></i></label></div>
    ${GEN_OK ? `<div class="row"><span class="grow"><b>Frasi nuove automatiche</b><span>Mescola alle frasi verificate frasi create sul momento</span></span><label class="switch"><input type="checkbox" id="swGen" ${S.settings.gen !== false ? 'checked' : ''} aria-label="Frasi nuove automatiche"><i></i></label></div>` : ''}
    ${DICT.AVAILABLE ? `<div class="row"><span class="grow"><b>Dizionario online</b><span>Cerca nel Wikizionario le parole fuori dal lessico. Gratuito, senza account</span></span><label class="switch"><input type="checkbox" id="swOnline" ${S.settings.online !== false ? 'checked' : ''} aria-label="Dizionario online"><i></i></label></div>` : ''}
    <div class="row"><span class="grow"><b>Suoni</b><span>Effetti per risposte giuste e sbagliate</span></span><label class="switch"><input type="checkbox" id="swSound" ${S.settings.sound ? 'checked' : ''} aria-label="Suoni"><i></i></label></div>
    ${HAS_CLAUDE ? `<div class="row"><span class="grow"><b>Claude</b><span data-ai-status>${esc(aiStatusText())}</span></span><label class="switch"><input type="checkbox" id="swAI" ${S.settings.ai ? 'checked' : ''} aria-label="Usa Claude"><i></i></label></div>` : ''}
    <button class="row" data-act="askReset"><span class="grow"><b style="color:var(--err)">Azzera i progressi</b><span>Cancella XP, serie, errori e lessico da questo browser</span></span></button>
  </div><p class="note">I progressi sono salvati solo in questo browser.</p></div>`;
}
function bindEgo() {
  const n = $('#nameInp'); if (n) n.addEventListener('change', () => { S.name = n.value.trim().slice(0, 24); save(); });
  const t = $('#swTiles'); if (t) t.addEventListener('change', () => { S.settings.input = t.checked ? 'tiles' : 'keys'; save(); });
  const s = $('#swSound'); if (s) s.addEventListener('change', () => { S.settings.sound = s.checked; save(); if (s.checked) sfx.ok(); });
  const o = $('#swOnline'); if (o) o.addEventListener('change', () => { S.settings.online = o.checked; save(); });
  const gn = $('#swGen'); if (gn) gn.addEventListener('change', () => { S.settings.gen = gn.checked; save(); });
  const a = $('#swAI'); if (a) a.addEventListener('change', () => { S.settings.ai = a.checked; save(); onAIState(); });
}

/* ---------- Selettore argomenti ---------- */
function pickerHtml(set, withSave) {
  const n = set.size;
  const avail = SENT.filter((s) => s.tags.every((t) => set.has(t))).length;
  return `<div class="picker-sum"><div class="note tnum"><b>${n}</b> argomenti · <b>${avail}</b> frasi verificate</div>${withSave ? `<button class="btn small" data-act="pickSave" ${n ? '' : 'disabled'}>Salva</button>` : ''}</div>
  <p class="note" style="margin:0">Tocca un argomento per selezionare tutto il programma fino a lì. Usa la casella per aggiungere o togliere un singolo argomento.</p>
  <div class="list">${ORDER.map((id) => { const t = TOPIC[id]; const on = set.has(id); return `<div class="pick" role="group"><span class="num">${ROMAN(t.n)}</span><button class="t" style="background:none;border:0;padding:0;text-align:left" data-act="pickUntil" data-t="${id}"><b>${esc(t.title)}</b><span class="note">${esc(GROUPS[t.group].name)}</span></button><button style="background:none;border:0;padding:4px" data-act="pickOne" data-t="${id}" aria-pressed="${on}" aria-label="${on ? 'Togli' : 'Aggiungi'} ${esc(t.title)}"><span class="box-c" style="${on ? 'background:var(--accent);border-color:var(--accent);color:var(--accent-ink)' : ''}">${I.check}</span></button></div>`; }).join('')}</div>`;
}
function openPicker() {
  const set = new Set(S.topics);
  const sh = openSheet('I miei argomenti', '<div id="pk" class="picker"></div>');
  const draw = () => { $('#pk', sh).innerHTML = pickerHtml(set, true); };
  sh._set = set; sh._draw = draw; draw();
}

/* ---------- Onboarding ---------- */
function startOnboarding() {
  UI.onb = { step: 0, set: new Set(), goal: 60, name: '' };
  const ov = document.createElement('div'); ov.className = 'overlay'; ov.id = 'onb'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Benvenuto in Verto');
  ov.innerHTML = `<div class="ov-inner"><div class="ov-body" id="onbBody"></div></div><div class="ov-foot"><div class="foot-in" id="onbFoot"></div></div>`;
  document.body.appendChild(ov); document.body.style.overflow = 'hidden';
  drawOnb();
}
function drawOnb() {
  const o = UI.onb, body = $('#onbBody'), foot = $('#onbFoot');
  const steps = `<div class="onb-steps" aria-hidden="true">${[0, 1, 2].map((i) => `<i class="${i <= o.step ? 'on' : ''}"></i>`).join('')}</div>`;
  if (o.step === 0) {
    body.innerHTML = `${steps}<div class="onb-hero"><div class="brand"><span class="brand-mark"></span><span class="eyebrow" style="letter-spacing:.2em">Palestra di latino</span></div><div class="onb-title">VERTO</div>
    <p class="onb-sub"><span class="la">Verto, vertere</span>: «volgere», e per i Romani anche «tradurre». Qui ti alleni a tradurre frasi costruite solo su ciò che hai già studiato.</p>
    <ul class="feature-list">
      <li>${I.translate}<div><b>Frasi sui tuoi argomenti</b><span>Scegli il programma svolto: le frasi, verificate o create sul momento, usano solo quelle forme e costruzioni.</span></div></li>
      <li>${I.open}<div><b>Teoria sempre a portata</b><span>Tocca una parola per l’analisi, apri la scheda dell’argomento quando sbagli.</span></div></li>
      <li>${I.flame}<div><b>Serie, XP e cursus honorum</b><span>Da Tiro a Pontifex Maximus, un giorno di allenamento alla volta.</span></div></li></ul>
    <div class="field"><label for="onbName">Come ti chiami? (facoltativo)</label><input id="onbName" class="input" maxlength="24" autocomplete="given-name" value="${esc(o.name)}"></div></div>`;
    foot.innerHTML = `<button class="btn block" data-act="onbNext">Cominciamo</button>`;
    $('#onbName').addEventListener('input', (e) => (o.name = e.target.value));
  } else if (o.step === 1) {
    const sc = $('#onbBody').scrollTop;
    body.innerHTML = `${steps}<h1 style="margin-top:14px">Fin dove sei arrivato?</h1><div class="picker" id="pk"></div>`;
    $('#pk').innerHTML = pickerHtml(o.set, false);
    foot.innerHTML = `<button class="btn block" data-act="onbNext" ${o.set.size ? '' : 'disabled'}>Continua</button>`;
    if (o.redraw) { $('#onbBody').scrollTop = sc; o.redraw = false; return; }
  } else {
    body.innerHTML = `${steps}<h1 style="margin-top:14px">Quanto vuoi allenarti ogni giorno?</h1><p class="muted">Puoi cambiarlo quando vuoi dal profilo.</p>
    <div class="seg" role="group" aria-label="Obiettivo giornaliero" style="grid-template-columns:1fr;gap:10px">${[[30, 'Leggero', 'circa 5 minuti al giorno'], [60, 'Regolare', 'circa 10 minuti al giorno'], [100, 'Intenso', 'circa 15 minuti al giorno']].map(([g, n, d]) => `<button data-act="onbGoal" data-g="${g}" aria-pressed="${o.goal === g}" style="flex-direction:row;justify-content:space-between;padding:16px"><b>${n}</b><span>${g} XP · ${d}</span></button>`).join('')}</div>`;
    foot.innerHTML = `<button class="btn block" data-act="onbDone">Inizia</button>`;
  }
  $('#onbBody').scrollTop = 0;
}

/* ---------- Fogli e finestre ---------- */
function openSheet(title, html) {
  closeSheet();
  const b = document.createElement('div'); b.className = 'sheet-back'; b.id = 'sheet';
  b.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn" data-act="closeSheet" aria-label="Chiudi">${I.close}</button></div><div class="sheet-body">${html}</div></div>`;
  b.addEventListener('click', (e) => { if (e.target === b) closeSheet(); });
  document.body.appendChild(b);
  return b;
}
function closeSheet() { const s = $('#sheet'); if (s) { if (s._ctl) s._ctl.abort(); s.remove(); } }
function showModal(html) {
  const b = document.createElement('div'); b.className = 'sheet-back center'; b.id = 'modal';
  b.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(b);
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
function analysisSheet(s) {
  const words = s.la.replace(/_/g, ' ').split(/\s+/);
  const wkLink = (r) => {
    if (!DICT.enabled()) return '';
    const head = r.an[0] ? r.an[0].e.head : r.word;
    const title = E.norm(head.split(',')[0]).trim();
    return title ? `<a class="wk-link" href="${DICT.pageUrl('it', title)}" target="_blank" rel="noopener">Wikizionario: ${esc(title)}</a>` : '';
  };
  const html = `<div class="analysis">${words.map((w, i) => { const r = wordAnalyses(s, i); return `<div class="an-item"><div class="an-lemma" lang="la">${esc(r.word)}</div>${popHtml(r).replace(/pw-lemma/g, 'an-mean').replace(/pw-mean/g, 'an-mean').replace(/pw-more/g, 'note')}${wkLink(r)}</div>`; }).join('')}</div><p class="note">Traduzione: ${esc(s.it[0])}</p>`;
  openSheet('Analisi parola per parola', html);
}
function explainSheet(s) {
  const sh = openSheet('Spiegazione del magister', `<div class="ai-out" id="explOut">${thinking('Il magister sta preparando la spiegazione…')}</div>`);
  const ctl = new AbortController(); sh._ctl = ctl;
  aiExplain(s, ({ text }) => { const o = $('#explOut'); if (o) o.innerHTML = mdLite(text); }, ctl.signal)
    .then((r) => { const o = $('#explOut'); if (o) o.innerHTML = mdLite(r.text); })
    .catch((e) => { const msg = aiFail(e); const o = $('#explOut'); if (o && msg) o.innerHTML = `<p>${esc(msg)}</p>`; });
}
function askMagister(id) {
  const q = ($('#askQ') || {}).value || '';
  if (!q.trim()) { toast('Scrivi prima la domanda.'); return; }
  const out = $('#askOut'); out.innerHTML = `<div class="ai-out">${thinking('Il magister sta rispondendo…')}</div>`;
  aiAsk(id, q.trim(), ({ text }) => { out.innerHTML = `<div class="ai-out">${mdLite(text)}</div>`; })
    .then((r) => { out.innerHTML = `<div class="ai-out">${mdLite(r.text)}</div>`; })
    .catch((e) => { const msg = aiFail(e); out.innerHTML = msg ? `<p class="note">${esc(msg)}</p>` : ''; });
}

/* ---------- Azioni ---------- */
const ACT = {
  tab: (el) => go(el.dataset.tab),
  start: (el) => {
    if (el.getAttribute('aria-disabled') === 'true') {
      if (el.dataset.mode === 'review') toast('Nessun errore da ripassare: ottimo!');
      else toast(aiStatusText());
      return;
    }
    closeSheet();
    startSession(el.dataset.mode, el.dataset.t ? { topic: el.dataset.t } : {});
  },
  topic: (el) => { UI.tab = 'bibliotheca'; UI.topic = el.dataset.t; UI.method = false; render(); window.scrollTo(0, 0); },
  backLib: () => { UI.topic = null; UI.method = false; render(); window.scrollTo(0, 0); },
  addTopic: (el) => { S.topics = ORDER.filter((t) => S.topics.includes(t) || t === el.dataset.t); save(); render(); toast('Argomento aggiunto.'); },
  sententiae: () => openSheet('Sententiae', `<div class="ex">${SENTENTIAE.map(([la, it, src, nota]) => `<div class="ex-row"><div class="la" lang="la">${esc(la)}</div><div>${esc(it)}</div><div class="it">${esc(src)} · ${esc(nota)}</div></div>`).join('')}</div>`),
  editTopics: () => openPicker(),
  pickUntil: (el) => {
    const idx = ORDER.indexOf(el.dataset.t);
    const set = UI.onb && $('#onb') ? UI.onb.set : ($('#sheet') || {})._set;
    if (!set) return;
    set.clear(); ORDER.slice(0, idx + 1).forEach((t) => set.add(t));
    redrawPicker();
  },
  pickOne: (el) => {
    const set = UI.onb && $('#onb') ? UI.onb.set : ($('#sheet') || {})._set;
    if (!set) return;
    const t = el.dataset.t; set.has(t) ? set.delete(t) : set.add(t);
    redrawPicker();
  },
  pickSave: () => { const sh = $('#sheet'); S.topics = ORDER.filter((t) => sh._set.has(t)); UI.flash = null; save(); closeSheet(); render(); toast('Argomenti aggiornati.'); },
  onbNext: () => { UI.onb.step++; drawOnb(); },
  onbGoal: (el) => { UI.onb.goal = +el.dataset.g; drawOnb(); },
  onbDone: () => {
    const o = UI.onb;
    S.name = o.name.trim().slice(0, 24); S.topics = ORDER.filter((t) => o.set.has(t)); S.goal = o.goal; S.onboarded = true; save();
    UI.onb = null; const ov = $('#onb'); if (ov) ov.remove(); document.body.style.overflow = '';
    render();
  },
  goal: (el) => { S.goal = +el.dataset.g; save(); render(); },
  badge: (el) => { const b = BADGES.find((x) => x.id === el.dataset.b); toast(b.name + ': ' + b.desc + (S.badges[b.id] ? ' Ottenuta.' : '')); },
  askReset: () => showModal(`<h2>Azzerare i progressi?</h2><p class="muted" style="margin:0">XP, serie, insegne, errori e lessico verranno cancellati da questo browser. Gli argomenti scelti restano.</p><div class="self" style="width:100%"><button class="btn ghost" data-act="closeModal">Annulla</button><button class="btn err" data-act="doReset">Azzera</button></div>`),
  doReset: () => { const keep = { topics: S.topics, name: S.name, goal: S.goal, settings: S.settings, onboarded: true }; S = { ...DEFAULT(), ...keep }; UI.flash = null; save(); closeModal(); render(); toast('Progressi azzerati.'); },
  closeModal: () => closeModal(),
  closeSheet: () => closeSheet(),
  flip: () => { UI.flash.show = true; render(); },
  card: (el) => flashAnswer(el.dataset.v === '1'),
  ask: (el) => askMagister(el.dataset.t),
  wk: (el) => runWiki(el.dataset.w, $('#wkOut')),
  // sessione
  quit: () => {
    if (SES && !SES.done && SES.i > 0) { showModal(`<h2>Interrompere l’allenamento?</h2><p class="muted" style="margin:0">Gli XP di questo allenamento non verranno salvati.</p><div class="self" style="width:100%"><button class="btn ghost" data-act="closeModal">Continua</button><button class="btn err" data-act="quitYes">Esci</button></div>`); return; }
    SES = null; closeOverlay(); render();
  },
  quitYes: () => { closeModal(); SES = null; closeOverlay(); render(); },
  newFallback: () => { if (!SES) return; SES.mode = 'mix'; SES.items = buildItems('mix'); renderItem(); },
  word: (el) => showWordPop(el),
  mode: () => { S.settings.input = S.settings.input === 'tiles' ? 'keys' : 'tiles'; save(); renderItem(); },
  method: (el) => { if (SES && SES.cur && $('#ov')) toggleMethod(el); else { UI.method = true; render(); window.scrollTo(0, 0); } },
  verbs: () => highlightVerbs(),
  hint: (el) => toggleHint(el),
  tile: (el) => { const c = SES.cur; if (c.answered) return; c.chosen.push(+el.dataset.k); sfx.tap(); renderAnswerArea(); },
  untile: (el) => { const c = SES.cur; if (c.answered) return; c.chosen.splice(+el.dataset.j, 1); renderAnswerArea(); },
  opt: (el) => {
    const c = SES.cur; if (c.answered) return;
    c.picked = +el.dataset.k;
    $$('#ovBody .opt').forEach((b) => b.setAttribute('aria-pressed', b === el));
    $('#checkBtn').disabled = false;
  },
  check: () => doCheck(),
  self: (el) => onSelf(el.dataset.v === '1'),
  next: () => nextItem(),
  endSession: () => endSession(),
  theory: (el) => openSheet(TOPIC[el.dataset.t].title, theoryHtml(el.dataset.t)),
  analysis: () => analysisSheet(SES.cur.it.s),
  explain: () => explainSheet(SES.cur.it.s),
  report: (el) => {
    const s = SES.cur.it.s;
    S.reported.push(s.id, s.la); S.aiPool = S.aiPool.filter((x) => x.id !== s.id); S.genSaved = (S.genSaved || []).filter((x) => x.id !== s.id); save();
    el.disabled = true; el.textContent = 'Segnalata'; toast('Grazie: questa frase non verrà più proposta.');
  },
};
function redrawPicker() {
  if (UI.onb && $('#onb')) { UI.onb.redraw = true; drawOnb(); return; }
  const sh = $('#sheet'); if (sh && sh._draw) { const sc = $('.sheet-body', sh).scrollTop; sh._draw(); $('.sheet-body', sh).scrollTop = sc; }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) { if (!e.target.closest('#pop')) closePop(); return; }
  const fn = ACT[el.dataset.act];
  if (el.dataset.act !== 'word') closePop();
  if (fn) fn(el, e);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if ($('#pop')) closePop(); else if ($('#modal')) closeModal(); else if ($('#sheet')) closeSheet(); }
  if (!SES || !$('#ov')) return;
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'textarea' || tag === 'input') {
    if (e.key === 'Enter' && e.target.id === 'typed' && e.target.tagName === 'INPUT') { e.preventDefault(); const b = $('#checkBtn'); if (b && !b.disabled) doCheck(); else { const n = $('#nextBtn'); if (n) nextItem(); } }
    return;
  }
  if (e.key === 'Enter') {
    const n = $('#nextBtn'); if (n && document.activeElement !== n) { e.preventDefault(); nextItem(); return; }
    const b = $('#checkBtn'); if (b && !b.disabled && document.activeElement === document.body) { e.preventDefault(); doCheck(); }
  }
  if (/^[1-4]$/.test(e.key)) { const opts = $$('#ovBody .opt'); const o = opts[+e.key - 1]; if (o && !o.disabled) o.click(); }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'typed' && e.target.tagName === 'INPUT') { const b = $('#checkBtn'); if (b) b.disabled = !e.target.value.trim(); }
});

/* ---------- Avvio ---------- */
function boot() {
  load();
  const h = (location.hash || '').replace('#', '');
  if (['domus', 'bibliotheca', 'verba', 'ego'].includes(h)) UI.tab = h;
  render();
  if (!S.onboarded) startOnboarding();
  initAI();
}
boot();
