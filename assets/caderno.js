/* Caderno digital do MAT MAT MAT!
   Abre a lista da aula (o próprio PDF) e deixa o aluno escrever por cima com a caneta (Apple Pencil, S Pen…),
   com folhas de rascunho, cores, espessuras, papel, borracha, desfazer/refazer, salvamento no aparelho
   e exportação da lista resolvida em PDF.
   Endereço: /caderno/?aula=4.14.1&lista=fixacao   (lista: fixacao | vestibular | aprofundamento) */
import * as pdfjs from '/assets/vendor/pdf.min.mjs';
import { getStroke } from '/assets/vendor/perfect-freehand.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.mjs';

const A4 = [595.28, 841.89];
const NOMES = { fixacao: 'Lista de fixação', vestibular: 'Lista de vestibular', aprofundamento: 'Lista de aprofundamento' };
const CORES = {
  caneta: [['Preto', '#1d1b26'], ['Azul', '#2459d6'], ['Vermelho', '#d8352b'], ['Verde', '#1c8f4e'], ['Roxo', '#6a3fd8'], ['Laranja', '#ea7b16']],
  marca: [['Amarelo', '#ffe14d'], ['Verde-limão', '#c8f55f'], ['Rosa', '#ff9ccf'], ['Azul-claro', '#8fd3ff']],
};
const ESPESSURAS = { caneta: [['Fina', 1.1], ['Média', 1.9], ['Grossa', 3.1]], marca: [['Fino', 9], ['Médio', 14], ['Largo', 20]] };
const RAIO_BORRACHA = 7;
const $ = (s) => document.querySelector(s);

/* ---------- parâmetros ---------- */
const qs = new URLSearchParams(location.search);
const aulaId = (qs.get('aula') || '').replace(/[^0-9a-z.]/gi, '');
const lista = NOMES[qs.get('lista')] ? qs.get('lista') : 'fixacao';
const CHAVE = `${aulaId}|${lista}`;

/* ---------- estado ---------- */
let st = {
  v: 1, paginas: [], tracos: {}, gabarito: false, zoom: 1, dedo: false,
  ferramenta: 'caneta', cor: { caneta: CORES.caneta[0][1], marca: CORES.marca[0][1] },
  esp: { caneta: 1, marca: 1 }, papel: 'quadriculado',
};
let pdf = null, pdfBytes = null, tamanhos = {}, gabaritoDesde = Infinity, numPaginas = 0;
const desfazer = [], refazer = [];
let penVisto = false;

/* ---------- utilidades de traço ---------- */
function opcoes(t, escala) {
  const base = { size: t.s * escala, smoothing: 0.5, streamline: 0.42, last: true };
  if (t.f === 'marca') return { ...base, thinning: 0, simulatePressure: false, start: { cap: false }, end: { cap: false } };
  return { ...base, thinning: t.pen ? 0.55 : 0.45, simulatePressure: !t.pen };
}
function contorno(t, escala) {
  const pts = t.p.map(([x, y, p]) => [x * escala, y * escala, p]);
  return getStroke(pts, opcoes(t, escala));
}
function caminho(pts) {
  if (!pts.length) return '';
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
    d += `Q${x0.toFixed(2)} ${y0.toFixed(2)} ${((x0 + x1) / 2).toFixed(2)} ${((y0 + y1) / 2).toFixed(2)}`;
  }
  return d + 'Z';
}
function desenhaTraco(ctx, t, escala) {
  const out = contorno(t, escala);
  if (out.length < 3) return;
  ctx.save();
  ctx.fillStyle = t.c;
  if (t.f === 'marca') { ctx.globalAlpha = 0.38; ctx.globalCompositeOperation = 'multiply'; }
  ctx.fill(new Path2D(caminho(out)));
  ctx.restore();
}

/* ---------- papel das folhas de rascunho (mesmo desenho na tela e no PDF exportado) ---------- */
function linhasPapel(papel, W, H) {
  const L = { linhas: [], pontos: [], margem: null };
  if (papel === 'pautado') {
    for (let y = 92; y < H - 30; y += 22.7) L.linhas.push([28, y, W - 28, y]);
    L.margem = [70, 40, 70, H - 30];
  } else if (papel === 'quadriculado') {
    const p = 14.17;
    for (let x = 28; x <= W - 27; x += p) L.linhas.push([x, 28, x, H - 28]);
    for (let y = 28; y <= H - 27; y += p) L.linhas.push([28, y, W - 28, y]);
  } else if (papel === 'pontilhado') {
    const p = 14.17;
    for (let y = 30; y < H - 26; y += p) for (let x = 30; x < W - 26; x += p) L.pontos.push([x, y]);
  }
  return L;
}
function desenhaPapel(ctx, papel, W, H, escala) {
  ctx.fillStyle = '#fffefa'; ctx.fillRect(0, 0, W * escala, H * escala);
  const L = linhasPapel(papel, W, H);
  ctx.strokeStyle = papel === 'quadriculado' ? '#dcd8ee' : '#c9c3e3';
  ctx.lineWidth = Math.max(0.6, 0.6 * escala);
  ctx.beginPath();
  for (const [a, b, c, d] of L.linhas) { ctx.moveTo(a * escala, b * escala); ctx.lineTo(c * escala, d * escala); }
  ctx.stroke();
  if (L.margem) { ctx.strokeStyle = '#f0a9a2'; ctx.beginPath(); const [a, b, c, d] = L.margem; ctx.moveTo(a * escala, b * escala); ctx.lineTo(c * escala, d * escala); ctx.stroke(); }
  if (L.pontos.length) { ctx.fillStyle = '#b4add6'; const r = Math.max(0.9, 0.75 * escala); for (const [x, y] of L.pontos) { ctx.beginPath(); ctx.arc(x * escala, y * escala, r, 0, 6.2832); ctx.fill(); } }
}

/* ---------- salvamento no aparelho (IndexedDB, com plano B em localStorage) ---------- */
const banco = (() => {
  let db = null;
  const abrir = () => new Promise((ok, erro) => {
    if (db) return ok(db);
    const r = indexedDB.open('matmat-caderno', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('cadernos');
    r.onsuccess = () => { db = r.result; ok(db); };
    r.onerror = () => erro(r.error);
  });
  return {
    async ler(k) {
      try { const d = await abrir(); return await new Promise((ok, erro) => { const q = d.transaction('cadernos').objectStore('cadernos').get(k); q.onsuccess = () => ok(q.result); q.onerror = () => erro(q.error); }); }
      catch { try { return JSON.parse(localStorage.getItem('caderno:' + k)); } catch { return null; } }
    },
    async gravar(k, v) {
      try { const d = await abrir(); await new Promise((ok, erro) => { const t = d.transaction('cadernos', 'readwrite'); t.objectStore('cadernos').put(v, k); t.oncomplete = ok; t.onerror = () => erro(t.error); }); return true; }
      catch { try { localStorage.setItem('caderno:' + k, JSON.stringify(v)); return true; } catch { return false; } }
    },
  };
})();
let timerSalvar = null, pronto = false;
function salvar() {
  if (!pronto) return; // nada é gravado antes de o caderno salvo ser carregado
  clearTimeout(timerSalvar);
  timerSalvar = setTimeout(async () => {
    const ok = await banco.gravar(CHAVE, { ...st, salvoEm: Date.now() });
    aviso(ok ? 'Salvo neste aparelho' : 'Não consegui salvar neste aparelho. Exporte o PDF para não perder.', ok ? 1400 : 5000);
  }, 600);
}

/* ---------- avisos ---------- */
let timerAviso = null;
function aviso(txt, ms = 1800) {
  const el = $('#cd-status'); el.textContent = txt; el.classList.add('on');
  clearTimeout(timerAviso); timerAviso = setTimeout(() => el.classList.remove('on'), ms);
}

/* ---------- páginas na tela ---------- */
const vistas = new Map(); // id -> { el, fundo, tinta, escala, renderTask, visivel }
let larguraBase = 800;
const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
function tamanho(pg) { return pg.tipo === 'pdf' ? tamanhos[pg.n] : A4; }
function paginasVisiveis() { return st.paginas.filter((pg) => st.gabarito || pg.tipo !== 'pdf' || pg.n < gabaritoDesde).filter((pg) => st.gabarito || !pg.depoisGabarito); }

function calcLargura() {
  const util = document.documentElement.clientWidth - (innerWidth <= 560 ? 12 : 24);
  larguraBase = Math.max(280, Math.min(util, 860));
}
function cssLargura() { return Math.round(larguraBase * st.zoom); }

function montar() {
  const cont = $('#cd-paginas');
  for (const v of vistas.values()) v.renderTask?.cancel?.();
  vistas.clear(); obs.disconnect();
  cont.innerHTML = '';
  const lista_ = paginasVisiveis();
  const w = cssLargura();
  lista_.forEach((pg, i) => {
    if (i === 0) cont.append(entre(-1));
    const [W, H] = tamanho(pg);
    const bloco = document.createElement('div'); bloco.className = 'cd-bloco'; bloco.style.width = w + 'px';
    if (pg.tipo === 'folha') bloco.append(topoFolha(pg));
    const el = document.createElement('div');
    el.className = 'cd-pag'; el.dataset.id = pg.id;
    el.style.width = w + 'px'; el.style.height = Math.round(w * H / W) + 'px';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', pg.tipo === 'pdf' ? `Página ${pg.n} da lista` : 'Folha de rascunho');
    const fundo = document.createElement('canvas'), tinta = document.createElement('canvas');
    tinta.className = 'cd-tinta';
    const num = document.createElement('span'); num.className = 'cd-num'; num.textContent = pg.tipo === 'pdf' ? `p. ${pg.n}` : 'rascunho';
    el.append(fundo, tinta, num);
    ligarEntrada(el, pg);
    bloco.append(el);
    cont.append(bloco, entre(st.paginas.indexOf(pg)));
    vistas.set(pg.id, { el, fundo, tinta, escala: 0, pg });
    obs.observe(el);
  });
  if (gabaritoDesde !== Infinity) cont.append(cartaoGabarito());
  $('#cd-zoom').textContent = Math.round(st.zoom * 100) + '%';
}
function entre(idx) {
  const d = document.createElement('div'); d.className = 'cd-entre';
  const b = document.createElement('button'); b.type = 'button'; b.className = 'cd-inserir';
  b.innerHTML = '<span aria-hidden="true">+</span> Folha de rascunho';
  b.addEventListener('click', () => inserirFolha(idx + 1));
  d.append(b); return d;
}
function topoFolha(pg) {
  const t = document.createElement('div'); t.className = 'cd-folha-topo';
  const sel = document.createElement('select'); sel.setAttribute('aria-label', 'Papel desta folha');
  [['quadriculado', 'Quadriculado'], ['pautado', 'Pautado'], ['pontilhado', 'Pontilhado'], ['liso', 'Liso']].forEach(([v, n]) => { const o = new Option(n, v, false, v === pg.papel); sel.append(o); });
  sel.addEventListener('change', () => { pg.papel = sel.value; const v = vistas.get(pg.id); if (v) { v.escala = 0; renderizar(v); } salvar(); });
  const rem = document.createElement('button'); rem.type = 'button'; rem.textContent = 'Remover';
  rem.addEventListener('click', () => removerFolha(pg));
  const acoes = document.createElement('div'); acoes.className = 'acoes'; acoes.append(sel, rem);
  const nome = document.createElement('span'); nome.textContent = 'Folha de rascunho';
  t.append(nome, acoes); return t;
}
function cartaoGabarito() {
  const c = document.createElement('section'); c.className = 'cd-gabarito';
  c.innerHTML = st.gabarito
    ? '<b>Gabarito à mostra</b><p>As páginas do gabarito resolvido estão acima. Esconda de novo se quiser continuar sem espiar.</p><button type="button">Esconder o gabarito</button>'
    : '<b>O gabarito resolvido está escondido</b><p>Termine a lista primeiro. Quando quiser conferir, mostre o gabarito aqui embaixo, com as resoluções.</p><button type="button">Mostrar o gabarito</button>';
  c.querySelector('button').addEventListener('click', () => { st.gabarito = !st.gabarito; montar(); salvar(); });
  return c;
}

/* renderiza só as páginas perto da tela (o iPad tem limite de memória para canvas) */
const obs = new IntersectionObserver((ents) => {
  for (const e of ents) {
    const v = vistas.get(e.target.dataset.id); if (!v) continue;
    v.visivel = e.isIntersecting;
    if (e.isIntersecting) renderizar(v); else liberar(v);
  }
}, { rootMargin: '1400px 0px' });

function liberar(v) {
  v.renderTask?.cancel?.(); v.renderTask = null;
  v.fundo.width = v.fundo.height = 0; v.tinta.width = v.tinta.height = 0; v.escala = 0;
}
async function renderizar(v) {
  const [W, H] = tamanho(v.pg);
  const w = v.el.clientWidth, h = v.el.clientHeight;
  let r = dpr();
  const max = 16e6; if (w * h * r * r > max) r = Math.sqrt(max / (w * h));
  const escalaPx = (w / W) * r;
  if (Math.abs(escalaPx - v.escala) < 1e-3) return;
  v.escala = escalaPx;
  for (const c of [v.fundo, v.tinta]) { c.width = Math.round(w * r); c.height = Math.round(h * r); }
  redesenharTinta(v);
  const ctx = v.fundo.getContext('2d');
  if (v.pg.tipo === 'folha') { desenhaPapel(ctx, v.pg.papel, W, H, escalaPx); return; }
  try {
    v.renderTask?.cancel?.();
    const page = await pdf.getPage(v.pg.n);
    if (v.escala !== escalaPx) return;
    const task = page.render({ canvasContext: ctx, viewport: page.getViewport({ scale: escalaPx }) });
    v.renderTask = task; await task.promise;
  } catch (e) { if (e?.name !== 'RenderingCancelledException') console.warn(e); }
}
function redesenharTinta(v) {
  if (!v.escala) return;
  const ctx = v.tinta.getContext('2d'); ctx.clearRect(0, 0, v.tinta.width, v.tinta.height);
  for (const t of st.tracos[v.pg.id] || []) desenhaTraco(ctx, t, v.escala);
}

/* ---------- escrita: caneta, marca-texto e borracha ---------- */
let atual = null; // { v, traco, vivo, apagados }
const toques = new Map(); let rolando = null; // rolagem com dois dedos no modo Dedo
function media() { let s = 0; for (const y of toques.values()) s += y; return s / toques.size; }
function ponto(e, v) {
  const r = v.el.getBoundingClientRect(), [W] = tamanho(v.pg);
  const k = W / r.width;
  const p = e.pointerType === 'pen' ? Math.max(0.05, e.pressure || 0.5) : 0.5;
  return [Math.round((e.clientX - r.left) * k * 100) / 100, Math.round((e.clientY - r.top) * k * 100) / 100, Math.round(p * 1000) / 1000];
}
function ligarEntrada(el, pg) {
  // No iPad, impede que a caneta role a página; o dedo continua rolando (a não ser no modo Dedo).
  const bloquear = (e) => { if (st.dedo || [...e.changedTouches].some((t) => t.touchType === 'stylus')) e.preventDefault(); };
  el.addEventListener('touchstart', bloquear, { passive: false });
  el.addEventListener('touchmove', bloquear, { passive: false });
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'pen') penVisto = true;
    if (e.pointerType === 'touch') {
      if (!st.dedo) return;
      toques.set(e.pointerId, e.clientY);
      if (toques.size >= 2) { // dois dedos: cancela o traço e passa a rolar
        if (atual?.vivo) atual.vivo.remove();
        if (atual) try { el.releasePointerCapture(atual.id); } catch {}
        atual = null; rolando = media(); return;
      }
    }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (atual) return;
    const v = vistas.get(pg.id); if (!v || !v.escala) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    if (st.ferramenta === 'borracha') { atual = { v, id: e.pointerId, apagados: [] }; apagar(v, ponto(e, v)); return; }
    const vivo = document.createElement('canvas'); vivo.className = 'cd-vivo';
    vivo.width = v.tinta.width; vivo.height = v.tinta.height; el.append(vivo);
    const f = st.ferramenta;
    atual = { v, id: e.pointerId, vivo, traco: { f, c: st.cor[f], s: ESPESSURAS[f][st.esp[f]][1], pen: e.pointerType === 'pen', p: [ponto(e, v)] } };
    pintarVivo();
  });
  el.addEventListener('pointermove', (e) => {
    if (rolando !== null && toques.has(e.pointerId)) { toques.set(e.pointerId, e.clientY); const m = media(); scrollBy(0, rolando - m); rolando = m; return; }
    if (!atual || e.pointerId !== atual.id) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    if (atual.traco) { for (const c of evs.length ? evs : [e]) atual.traco.p.push(ponto(c, atual.v)); pedirPintura(); }
    else for (const c of evs.length ? evs : [e]) apagar(atual.v, ponto(c, atual.v));
  });
  const fim = (e) => {
    if (toques.delete(e.pointerId) && toques.size < 2) rolando = null;
    if (!atual || e.pointerId !== atual.id) return;
    const a = atual; atual = null;
    if (a.traco) {
      a.vivo.remove();
      if (a.traco.p.length === 1) { const [x, y, p] = a.traco.p[0]; a.traco.p.push([x + 0.01, y + 0.01, p]); } // um toque vira um ponto
      (st.tracos[pg.id] ||= []).push(a.traco);
      desenhaTraco(a.v.tinta.getContext('2d'), a.traco, a.v.escala);
      registrar({ t: 'add', id: pg.id, traco: a.traco });
    } else if (a.apagados.length) registrar({ t: 'del', id: pg.id, itens: a.apagados });
  };
  el.addEventListener('pointerup', fim);
  el.addEventListener('pointercancel', fim);
}
let raf = 0;
function pedirPintura() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; pintarVivo(); }); }
function pintarVivo() {
  if (!atual?.traco) return;
  const ctx = atual.vivo.getContext('2d'); ctx.clearRect(0, 0, atual.vivo.width, atual.vivo.height);
  desenhaTraco(ctx, atual.traco, atual.v.escala);
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t));
  const x = ax + t * dx - px, y = ay + t * dy - py; return Math.sqrt(x * x + y * y);
}
function apagar(v, [x, y]) {
  const arr = st.tracos[v.pg.id]; if (!arr?.length) return;
  let mudou = false;
  for (let i = arr.length - 1; i >= 0; i--) {
    const t = arr[i], lim = RAIO_BORRACHA + t.s / 2;
    let acertou = false;
    for (let j = 0; j < t.p.length && !acertou; j++) {
      const a = t.p[j], b = t.p[j + 1] || a;
      if (distSeg(x, y, a[0], a[1], b[0], b[1]) <= lim) acertou = true;
    }
    if (acertou) { atual.apagados.push({ traco: t, idx: i }); arr.splice(i, 1); mudou = true; }
  }
  if (mudou) redesenharTinta(v);
}

/* ---------- desfazer e refazer ---------- */
function registrar(op) { desfazer.push(op); refazer.length = 0; botoesHist(); salvar(); }
function botoesHist() { $('#cd-desfazer').disabled = !desfazer.length; $('#cd-refazer').disabled = !refazer.length; }
function aplicar(op, inverso) {
  const arr = (id) => (st.tracos[id] ||= []);
  if (op.t === 'add') { if (inverso) { const a = arr(op.id); const i = a.lastIndexOf(op.traco); if (i >= 0) a.splice(i, 1); } else arr(op.id).push(op.traco); }
  else if (op.t === 'del') {
    if (inverso) [...op.itens].reverse().forEach(({ traco, idx }) => arr(op.id).splice(idx, 0, traco));
    else op.itens.forEach(({ traco }) => { const a = arr(op.id); const i = a.indexOf(traco); if (i >= 0) a.splice(i, 1); });
  } else if (op.t === 'folha+' || op.t === 'folha-') {
    const remover = op.t === 'folha+' ? inverso : !inverso; // desfazer uma inserção remove; desfazer uma remoção devolve
    if (remover) { const i = st.paginas.indexOf(op.pg); if (i >= 0) st.paginas.splice(i, 1); delete st.tracos[op.pg.id]; }
    else { st.paginas.splice(op.idx, 0, op.pg); st.tracos[op.pg.id] = op.tracos || []; }
    montar(); return;
  }
  const v = vistas.get(op.id); if (v) redesenharTinta(v);
}
function voltar() { const op = desfazer.pop(); if (!op) return; aplicar(op, true); refazer.push(op); botoesHist(); salvar(); }
function avancar() { const op = refazer.pop(); if (!op) return; aplicar(op, false); desfazer.push(op); botoesHist(); salvar(); }

/* ---------- folhas de rascunho ---------- */
function inserirFolha(idx) {
  const pg = { id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), tipo: 'folha', papel: st.papel };
  const ant = st.paginas[idx - 1];
  if (ant && (ant.depoisGabarito || (ant.tipo === 'pdf' && ant.n >= gabaritoDesde))) pg.depoisGabarito = true;
  st.paginas.splice(idx, 0, pg); st.tracos[pg.id] = [];
  registrar({ t: 'folha+', pg, idx, tracos: [] });
  montar();
  requestAnimationFrame(() => vistas.get(pg.id)?.el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
}
function removerFolha(pg) {
  const tem = (st.tracos[pg.id] || []).length;
  if (tem && !confirmar('Remover esta folha de rascunho e o que está escrito nela? (Dá para desfazer.)')) return;
  const idx = st.paginas.indexOf(pg);
  registrar({ t: 'folha-', pg, idx, tracos: st.tracos[pg.id] || [] });
  st.paginas.splice(idx, 1); delete st.tracos[pg.id]; montar();
}
function confirmar(msg) { try { return window.confirm(msg); } catch { return true; } }

/* ---------- barra de ferramentas ---------- */
function montarBarra() {
  document.querySelectorAll('[data-ferramenta]').forEach((b) => b.addEventListener('click', () => escolher(b.dataset.ferramenta)));
  $('#cd-desfazer').addEventListener('click', voltar);
  $('#cd-refazer').addEventListener('click', avancar);
  $('#cd-mais').addEventListener('click', () => zoom(st.zoom * 1.2));
  $('#cd-menos').addEventListener('click', () => zoom(st.zoom / 1.2));
  $('#cd-ajustar').addEventListener('click', () => zoom(1));
  $('#cd-papel').value = st.papel;
  $('#cd-papel').addEventListener('change', (e) => { st.papel = e.target.value; salvar(); aviso('As próximas folhas de rascunho virão com esse papel'); });
  $('#cd-dedo').addEventListener('click', () => { st.dedo = !st.dedo; penVisto = false; aplicarDedo(); salvar(); aviso(st.dedo ? 'Agora o dedo escreve. Role a página pela barra lateral ou com dois dedos.' : 'Agora o dedo rola a página e a caneta escreve', 2600); });
  $('#cd-exportar').addEventListener('click', exportar);
  addEventListener('keydown', (e) => {
    if (e.target.closest('select,input,textarea')) return;
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? avancar() : voltar(); }
    else if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); avancar(); }
    else if (!e.ctrlKey && !e.metaKey && !e.altKey) { if (k === 'p') escolher('caneta'); if (k === 'm') escolher('marca'); if (k === 'e') escolher('borracha'); }
  });
  let t = 0;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { const w = larguraBase; calcLargura(); if (w !== larguraBase) relayout(); }, 200); });
  escolher(st.ferramenta); aplicarDedo();
}
function aplicarDedo() { document.body.classList.toggle('dedo', st.dedo); $('#cd-dedo').setAttribute('aria-pressed', st.dedo); }
function escolher(f) {
  st.ferramenta = f; document.body.dataset.ferramenta = f;
  document.querySelectorAll('[data-ferramenta]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ferramenta === f));
  const cores = $('#cd-cores'), esps = $('#cd-espessuras');
  cores.innerHTML = ''; esps.innerHTML = '';
  const alvo = f === 'borracha' ? null : f;
  cores.hidden = esps.hidden = !alvo;
  if (!alvo) return salvar();
  for (const [nome, c] of CORES[alvo]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cd-cor'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', nome); b.title = nome; b.style.setProperty('--c', c); b.innerHTML = '<span></span>';
    b.setAttribute('aria-checked', st.cor[alvo] === c);
    b.addEventListener('click', () => { st.cor[alvo] = c; escolher(alvo); });
    cores.append(b);
  }
  ESPESSURAS[alvo].forEach(([nome, s], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cd-esp'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', 'Espessura ' + nome.toLowerCase()); b.title = nome;
    const h = alvo === 'caneta' ? [2, 4, 7][i] : [5, 8, 12][i];
    b.innerHTML = `<span style="height:${h}px;${alvo === 'marca' ? 'background:' + st.cor.marca + ';box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)' : ''}"></span>`;
    b.setAttribute('aria-checked', st.esp[alvo] === i);
    b.addEventListener('click', () => { st.esp[alvo] = i; escolher(alvo); });
    esps.append(b);
  });
  salvar();
}
function zoom(z) {
  const novo = Math.max(0.6, Math.min(2.5, Math.round(z * 100) / 100)); if (novo === st.zoom) return;
  // mantém no lugar o ponto que está no centro da tela
  const meio = scrollY + innerHeight / 2, alt = document.documentElement.scrollHeight;
  st.zoom = novo; relayout();
  scrollTo({ top: meio * (document.documentElement.scrollHeight / alt) - innerHeight / 2 });
  salvar();
}
let timerRel = 0;
function relayout() {
  const w = cssLargura();
  for (const v of vistas.values()) {
    const [W, H] = tamanho(v.pg);
    v.el.style.width = w + 'px'; v.el.style.height = Math.round(w * H / W) + 'px'; v.el.parentElement.style.width = w + 'px';
  }
  $('#cd-zoom').textContent = Math.round(st.zoom * 100) + '%';
  clearTimeout(timerRel);
  timerRel = setTimeout(() => { for (const v of vistas.values()) if (v.visivel) renderizar(v); }, 160);
}

/* ---------- exportar a lista resolvida ---------- */
async function exportar() {
  const btn = $('#cd-exportar'); btn.disabled = true; aviso('Montando o PDF…', 60000);
  try {
    const { PDFDocument, rgb, BlendMode } = await import('/assets/vendor/pdf-lib.esm.min.js');
    const src = await PDFDocument.load(pdfBytes);
    const out = await PDFDocument.create();
    out.setTitle(`${$('#cd-titulo').textContent} · ${NOMES[lista]} resolvida`);
    out.setAuthor('MAT com JOÃO · matcomjoao.com'); out.setCreator('Caderno digital MAT MAT MAT!');
    const cor = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
    for (const pg of paginasVisiveis()) {
      let page;
      if (pg.tipo === 'pdf') { [page] = await out.copyPages(src, [pg.n - 1]); out.addPage(page); }
      else {
        page = out.addPage(A4);
        const [W, H] = A4, L = linhasPapel(pg.papel, W, H);
        const corLinha = pg.papel === 'quadriculado' ? cor('#dcd8ee') : cor('#c9c3e3');
        for (const [a, b, c, d] of L.linhas) page.drawLine({ start: { x: a, y: H - b }, end: { x: c, y: H - d }, thickness: 0.6, color: corLinha });
        if (L.margem) { const [a, b, c, d] = L.margem; page.drawLine({ start: { x: a, y: H - b }, end: { x: c, y: H - d }, thickness: 0.6, color: cor('#f0a9a2') }); }
        for (const [x, y] of L.pontos) page.drawCircle({ x, y: H - y, size: 0.75, color: cor('#b4add6') });
      }
      const H = page.getHeight(), W = page.getWidth();
      const [w0] = tamanho(pg), k = W / w0; // por segurança, se a página tiver outro tamanho
      for (const t of st.tracos[pg.id] || []) {
        const d = caminho(contorno(t, k)); if (!d) continue;
        page.drawSvgPath(d, { x: 0, y: H, color: cor(t.c), borderWidth: 0, ...(t.f === 'marca' ? { opacity: 0.38, blendMode: BlendMode.Multiply } : {}) });
      }
    }
    const bytes = await out.save();
    const nome = `${slug($('#cd-titulo').textContent)}-${lista}-resolvida.pdf`;
    const arq = new File([bytes], nome, { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [arq] }) && matchMedia('(pointer:coarse)').matches) {
      try { await navigator.share({ files: [arq], title: nome }); aviso('PDF pronto'); return; }
      catch (e) { if (e?.name === 'AbortError') { aviso('Exportação cancelada'); return; } }
    }
    const url = URL.createObjectURL(arq); const a = document.createElement('a'); a.href = url; a.download = nome;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    aviso('PDF baixado: ' + nome, 3000);
  } catch (e) { console.error(e); aviso('Não consegui montar o PDF. Tente de novo.', 4000); }
  finally { btn.disabled = false; }
}
function slug(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'lista'; }

/* ---------- início ---------- */
function acharAula(o, id) {
  if (!o || typeof o !== 'object') return null;
  if (o.id === id && (o.title || o.titulo)) return o;
  for (const v of Array.isArray(o) ? o : Object.values(o)) { const r = acharAula(v, id); if (r) return r; }
  return null;
}
async function iniciar() {
  if (!aulaId) { erro('Abra o caderno pela página de uma aula.'); return; }
  const [V, M, a] = aulaId.split('.');
  $('#cd-voltar').href = `/${V}/${M}/${a}/`;
  $('#cd-sub').textContent = NOMES[lista];
  document.title = `${NOMES[lista]} · Caderno | MAT MAT MAT!`;
  calcLargura(); montarBarra();
  fetch('/data/aulas.json').then((r) => r.json()).then((d) => { const l = acharAula(d, aulaId); if (l) { $('#cd-titulo').textContent = l.title || l.titulo; document.title = `${l.title || l.titulo} · ${NOMES[lista]} | Caderno`; } }).catch(() => {});
  let info;
  try { info = await (await fetch(`/data/listas/${aulaId}.json`)).json(); } catch { info = null; }
  const url = info?.pdfs?.[lista]?.url;
  if (!url) { erro('Esta aula ainda não tem essa lista publicada.'); return; }
  try {
    pdfBytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
    pdf = await pdfjs.getDocument({ data: pdfBytes.slice() }).promise;
  } catch (e) { console.error(e); erro('Não consegui abrir a lista. Verifique a internet e recarregue a página.'); return; }
  numPaginas = pdf.numPages;
  for (let n = 1; n <= numPaginas; n++) {
    const p = await pdf.getPage(n); const vp = p.getViewport({ scale: 1 }); tamanhos[n] = [vp.width, vp.height];
    if (gabaritoDesde === Infinity) {
      const tx = await p.getTextContent(); const s = tx.items.map((i) => i.str).join(' ');
      if (/Gabarito\s+resolvido/i.test(s)) gabaritoDesde = n;
    }
  }
  const salvo = await banco.ler(CHAVE);
  if (salvo?.v === 1 && Array.isArray(salvo.paginas)) {
    st = { ...st, ...salvo };
    st.paginas = salvo.paginas.filter((pg) => pg.tipo === 'folha' || (pg.n >= 1 && pg.n <= numPaginas));
    for (let n = 1; n <= numPaginas; n++) if (!st.paginas.some((pg) => pg.tipo === 'pdf' && pg.n === n)) st.paginas.push({ id: 'pdf-' + n, tipo: 'pdf', n });
  } else {
    st.paginas = Array.from({ length: numPaginas }, (_, i) => ({ id: 'pdf-' + (i + 1), tipo: 'pdf', n: i + 1 }));
    st.tracos = {};
  }
  $('#cd-papel').value = st.papel; escolher(st.ferramenta); aplicarDedo();
  montar();
  $('#cd-exportar').disabled = false;
  pronto = true;
  try { if (!localStorage.getItem('caderno-dica')) { $('#cd-dica').hidden = false; $('#cd-dica-ok').addEventListener('click', () => { $('#cd-dica').hidden = true; try { localStorage.setItem('caderno-dica', '1'); } catch {} }); } } catch {}
  if (salvo?.salvoEm) aviso('Seu caderno foi recuperado deste aparelho', 2200);
}
function erro(msg) { $('#cd-paginas').innerHTML = `<p class="cd-erro">${msg}</p>`; $('#cd-sub').textContent = 'Caderno'; }

window.__caderno = { get estado() { return st; }, get vistas() { return vistas; }, exportar };
iniciar();
