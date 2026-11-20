/* Caderno digital do MAT MAT MAT!
   Cada questão da lista ocupa uma página: a questão no topo e o resto da folha como rascunho
   (quadriculado, pautado, pontilhado ou liso). O aluno resolve com a caneta (Apple Pencil, S Pen…),
   passa de questão em questão, pede mais espaço quando precisa e exporta a lista resolvida em PDF.
   Endereço: /caderno/?aula=4.14.1&lista=fixacao   (lista: fixacao | vestibular | aprofundamento)
   O PDF e o mapa das questões vêm de pdfs/caderno-<lista>-<aula>.pdf/.json (scripts/gerar_listas.py). */
import * as pdfjs from '/assets/vendor/pdf.min.mjs';
import { getStroke } from '/assets/vendor/perfect-freehand.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.mjs';

const A4 = [595.28, 841.89];
const MARGEM = 42.5; // 15 mm, as mesmas margens laterais da lista
const NOMES = { fixacao: 'Lista de fixação', vestibular: 'Lista de vestibular', aprofundamento: 'Lista de aprofundamento' };
const CORES = {
  caneta: [['Preto', '#1d1b26'], ['Azul', '#2459d6'], ['Vermelho', '#d8352b'], ['Verde', '#1c8f4e'], ['Roxo', '#6a3fd8'], ['Laranja', '#ea7b16']],
  marca: [['Amarelo', '#ffe14d'], ['Verde-limão', '#c8f55f'], ['Rosa', '#ff9ccf'], ['Azul-claro', '#8fd3ff'], ['Laranja', '#ffc078']],
};
const ESTILOS = [
  ['tinteiro', 'Tinteiro'], ['esfero', 'Esferográfica'], ['nanquim', 'Nanquim'], ['pincel', 'Pincel'],
];
// espessura: controle de 0 a 100 mapeado em escala exponencial (bem fino no começo, como nos apps de anotação)
const FAIXA = { caneta: [0.25, 7], marca: [5, 26] };
const deControle = (f, v) => { const [a, b] = FAIXA[f]; return +(a * Math.pow(b / a, v / 100)).toFixed(2); };
const paraControle = (f, s) => { const [a, b] = FAIXA[f]; return Math.round(100 * Math.log(s / a) / Math.log(b / a)); };
const mm = (pt) => (pt * 0.3528).toFixed(pt < 2.84 ? 2 : 1).replace(/0$/, '').replace('.', ',') + ' mm';
const RAIO_BORRACHA = 7;
const $ = (s) => document.querySelector(s);

/* ---------- parâmetros ---------- */
const qs = new URLSearchParams(location.search);
const aulaId = (qs.get('aula') || '').replace(/[^0-9a-z.]/gi, '');
const lista = NOMES[qs.get('lista')] ? qs.get('lista') : 'fixacao';
const CHAVE = `v2|${aulaId}|${lista}`;

/* ---------- estado ---------- */
let st = {
  v: 2, paginas: [], tracos: {}, gabarito: false, zoom: 1, dedo: false, atual: 1,
  ferramenta: 'caneta', estilo: 'tinteiro',
  cor: { caneta: CORES.caneta[0][1], marca: CORES.marca[0][1] },
  esp: { caneta: 1.4, marca: 14 }, papel: 'quadriculado',
};
let pdf = null, pdfBytes = null, mapa = null, tamanhos = {}, totalQ = 0;
const desfazer = [], refazer = [];
let penVisto = false;

/* ---------- traço ---------- */
function opcoes(t, k) {
  const s = t.s * k, pen = !!t.pen;
  switch (t.e || 'tinteiro') {
    case 'marca': return { size: s, thinning: 0, smoothing: 0.5, streamline: 0.45, simulatePressure: false, start: { cap: false }, end: { cap: false }, last: true };
    case 'esfero': return { size: s, thinning: pen ? 0.18 : 0.1, smoothing: 0.62, streamline: 0.5, simulatePressure: false, last: true };
    case 'nanquim': return { size: s, thinning: 0, smoothing: 0.55, streamline: 0.5, simulatePressure: false, last: true };
    case 'pincel': return { size: s * 2.3, thinning: 0.86, smoothing: 0.62, streamline: 0.42, simulatePressure: !pen,
      start: { taper: pen ? 0 : s * 6, cap: true }, end: { taper: s * 9, cap: true }, last: true };
    default: return { size: s, thinning: pen ? 0.58 : 0.45, smoothing: 0.5, streamline: 0.42, simulatePressure: !pen, last: true };
  }
}
function contorno(t, k) { return getStroke(t.p.map(([x, y, p]) => [x * k, y * k, p]), opcoes(t, k)); }
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
function desenhaTraco(ctx, t, k) {
  const out = contorno(t, k);
  if (out.length < 3) return;
  ctx.save(); ctx.fillStyle = t.c;
  if (t.f === 'marca') { ctx.globalAlpha = 0.38; ctx.globalCompositeOperation = 'multiply'; }
  ctx.fill(new Path2D(caminho(out))); ctx.restore();
}
function tracoExemplo(f, e, s, c, w, h) { // um "S" com pressão variando, para as prévias
  const p = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; p.push([w * 0.08 + u * w * 0.84, h / 2 + Math.sin(u * Math.PI * 2) * h * 0.24, 0.25 + 0.6 * Math.sin(u * Math.PI)]); }
  return { f, e: f === 'marca' ? 'marca' : e, s, c, pen: true, p };
}

/* ---------- papel ---------- */
function linhasPapel(papel, x0, y0, x1, y1) {
  const L = { linhas: [], pontos: [], margem: null }, p = 14.17; // 5 mm
  if (papel === 'pautado') {
    for (let y = y0 + 20; y < y1 - 4; y += 22.7) L.linhas.push([x0, y, x1, y]);
  } else if (papel === 'quadriculado') {
    for (let x = x0; x <= x1 + 0.1; x += p) L.linhas.push([x, y0, x, y1]);
    for (let y = y0; y <= y1 + 0.1; y += p) L.linhas.push([x0, y, x1, y]);
  } else if (papel === 'pontilhado') {
    for (let y = y0 + 4; y <= y1; y += p) for (let x = x0 + 4; x <= x1; x += p) L.pontos.push([x, y]);
  }
  return L;
}
function areaRascunho(pg) {
  const [W, H] = tamanho(pg);
  if (pg.tipo === 'folha') return [MARGEM, 48, W - MARGEM, H - 48];
  const y = mapa?.rascunho?.[pg.n];
  if (y == null) return null;
  const x0 = MARGEM, x1 = W - MARGEM, passo = 14.17;
  const largura = Math.floor((x1 - x0) / passo) * passo, sobra = (x1 - x0 - largura) / 2; // quadradinhos inteiros, centralizados
  return [x0 + sobra, y + 4, x1 - sobra, Math.max(y + 30, mapa.rascunhoFim)];
}
function papelDe(pg) { return pg.tipo === 'folha' ? pg.papel : st.papel; }
const COR_PAPEL = { linha: '#d9d4ee', pauta: '#c6c0e2', ponto: '#aea7d4' };
function desenhaPapel(ctx, pg, k) {
  const area = areaRascunho(pg); if (!area) return;
  const papel = papelDe(pg), L = linhasPapel(papel, ...area);
  ctx.save();
  ctx.strokeStyle = papel === 'quadriculado' ? COR_PAPEL.linha : COR_PAPEL.pauta;
  ctx.lineWidth = Math.max(0.6, 0.55 * k);
  ctx.beginPath();
  for (const [a, b, c, d] of L.linhas) { ctx.moveTo(a * k, b * k); ctx.lineTo(c * k, d * k); }
  ctx.stroke();
  if (L.pontos.length) { ctx.fillStyle = COR_PAPEL.ponto; const r = Math.max(0.9, 0.8 * k); for (const [x, y] of L.pontos) { ctx.beginPath(); ctx.arc(x * k, y * k, r, 0, 6.2832); ctx.fill(); } }
  ctx.restore();
}

/* ---------- salvamento no aparelho ---------- */
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
function salvar(silencioso) {
  if (!pronto) return;
  clearTimeout(timerSalvar);
  timerSalvar = setTimeout(async () => {
    const ok = await banco.gravar(CHAVE, { ...st, salvoEm: Date.now() });
    if (!ok) aviso('Não consegui salvar neste aparelho. Exporte o PDF para não perder.', 5000);
    else if (!silencioso) aviso('Salvo neste aparelho', 1200);
  }, 600);
}

let timerAviso = null;
function aviso(txt, ms = 1800) {
  const el = $('#cd-status'); el.textContent = txt; el.classList.add('on');
  clearTimeout(timerAviso); timerAviso = setTimeout(() => el.classList.remove('on'), ms);
}

/* ---------- páginas e questões ---------- */
const vistas = new Map();
let larguraBase = 800;
const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
function tamanho(pg) { return pg.tipo === 'pdf' ? tamanhos[pg.n] : A4; }
function questaoDaPagina(n) { if (n >= mapa.gabarito) return 'gab'; const q = mapa.questoes.find((x) => x.paginas.includes(n)); return q ? q.n : 1; }
function paginasDaVista(alvo) {
  if (alvo === 'gab') return st.gabarito ? st.paginas.filter((pg) => pg.q === 'gab') : [];
  return st.paginas.filter((pg) => pg.q === alvo);
}
function calcLargura() {
  const util = document.documentElement.clientWidth - (innerWidth <= 560 ? 12 : 28);
  larguraBase = Math.max(280, Math.min(util, 900));
}
function cssLargura() { return Math.round(larguraBase * st.zoom); }
function questaoFeita(n) { return st.paginas.some((pg) => pg.q === n && (st.tracos[pg.id] || []).length); }

function montar(rolarTopo) {
  const cont = $('#cd-paginas');
  for (const v of vistas.values()) v.renderTask?.cancel?.();
  vistas.clear(); obs.disconnect();
  cont.innerHTML = '';
  const alvo = st.atual, w = cssLargura();
  const pags = paginasDaVista(alvo);
  if (alvo === 'gab') cont.append(cartaoGabarito());
  for (const pg of pags) {
    const [W, H] = tamanho(pg);
    const bloco = document.createElement('div'); bloco.className = 'cd-bloco'; bloco.style.width = w + 'px';
    if (pg.tipo === 'folha') bloco.append(topoFolha(pg));
    const el = document.createElement('div');
    el.className = 'cd-pag'; el.dataset.id = pg.id;
    el.style.width = w + 'px'; el.style.height = Math.round(w * H / W) + 'px';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', pg.tipo === 'folha' ? 'Mais espaço para a questão ' + alvo : alvo === 'gab' ? `Gabarito, página ${pg.n}` : `Questão ${alvo} com rascunho`);
    const fundo = document.createElement('canvas'), tinta = document.createElement('canvas'); tinta.className = 'cd-tinta';
    el.append(fundo, tinta);
    ligarEntrada(el, pg);
    bloco.append(el); cont.append(bloco);
    vistas.set(pg.id, { el, fundo, tinta, escala: 0, pg });
    obs.observe(el);
  }
  if (alvo !== 'gab') {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cd-espaco';
    b.innerHTML = '<span aria-hidden="true">+</span> Mais espaço para esta questão';
    b.addEventListener('click', () => maisEspaco(alvo));
    cont.append(b);
  }
  $('#cd-zoom').textContent = Math.round(st.zoom * 100) + '%';
  atualizarNav();
  if (rolarTopo) scrollTo({ top: 0 });
}
function topoFolha(pg) {
  const t = document.createElement('div'); t.className = 'cd-folha-topo';
  const sel = document.createElement('select'); sel.setAttribute('aria-label', 'Papel desta folha');
  [['quadriculado', 'Quadriculado'], ['pautado', 'Pautado'], ['pontilhado', 'Pontilhado'], ['liso', 'Liso']].forEach(([v, n]) => sel.append(new Option(n, v, false, v === pg.papel)));
  sel.addEventListener('change', () => { pg.papel = sel.value; const v = vistas.get(pg.id); if (v) { v.escala = 0; renderizar(v); } salvar(); });
  const rem = document.createElement('button'); rem.type = 'button'; rem.textContent = 'Remover';
  rem.addEventListener('click', () => removerFolha(pg));
  const acoes = document.createElement('div'); acoes.className = 'acoes'; acoes.append(sel, rem);
  const nome = document.createElement('span'); nome.textContent = 'Mais espaço';
  t.append(nome, acoes); return t;
}
function cartaoGabarito() {
  const c = document.createElement('section'); c.className = 'cd-gabarito';
  const feitas = Array.from({ length: totalQ }, (_, i) => i + 1).filter(questaoFeita).length;
  c.innerHTML = st.gabarito
    ? '<b>Gabarito resolvido</b><p>Confira suas resoluções com as do gabarito, abaixo. Dá para escrever por cima dele também.</p><button type="button">Esconder o gabarito</button>'
    : `<b>O gabarito resolvido está escondido</b><p>Você mexeu em ${feitas} de ${totalQ} questões. Quando terminar, mostre o gabarito para conferir.</p><button type="button">Mostrar o gabarito</button>`;
  c.querySelector('button').addEventListener('click', () => { st.gabarito = !st.gabarito; montar(); salvar(true); });
  return c;
}
function irPara(alvo) {
  if (alvo !== 'gab') alvo = Math.max(1, Math.min(totalQ, alvo));
  if (alvo === st.atual) return;
  st.atual = alvo; fecharMapa(); montar(true); salvar(true);
}
function atualizarNav() {
  const a = st.atual;
  $('#cd-qnum').textContent = a === 'gab' ? 'Gabarito' : `Questão ${a}`;
  const q = a === 'gab' ? null : mapa.questoes[a - 1];
  $('#cd-qinfo').textContent = a === 'gab' ? `${totalQ} questões` : `de ${totalQ}${q?.nivel ? ' · ' + q.nivel : ''}`;
  $('#cd-ant').disabled = a === 1;
  const prox = $('#cd-prox');
  prox.disabled = a === 'gab';
  prox.querySelector('span').textContent = a === totalQ ? 'Gabarito' : 'Próxima';
  prox.setAttribute('aria-label', a === totalQ ? 'Ir para o gabarito' : 'Próxima questão');
}
function anterior() { irPara(st.atual === 'gab' ? totalQ : st.atual - 1); }
function proxima() { if (st.atual === 'gab') return; irPara(st.atual === totalQ ? 'gab' : st.atual + 1); }
function abrirMapa() {
  const m = $('#cd-mapa'), g = $('#cd-mapa-grade'); g.innerHTML = '';
  for (let n = 1; n <= totalQ; n++) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = n;
    if (questaoFeita(n)) { b.classList.add('feito'); b.title = 'Você já escreveu nesta questão'; }
    if (n === st.atual) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', () => irPara(n)); g.append(b);
  }
  const gb = document.createElement('button'); gb.type = 'button'; gb.className = 'cd-mapa-gab'; gb.textContent = 'Gabarito resolvido';
  if (st.atual === 'gab') gb.setAttribute('aria-current', 'true');
  gb.addEventListener('click', () => irPara('gab')); g.append(gb);
  m.hidden = false; $('#cd-qbtn').setAttribute('aria-expanded', 'true');
}
function fecharMapa() { $('#cd-mapa').hidden = true; $('#cd-qbtn').setAttribute('aria-expanded', 'false'); }

const obs = new IntersectionObserver((ents) => {
  for (const e of ents) {
    const v = vistas.get(e.target.dataset.id); if (!v) continue;
    v.visivel = e.isIntersecting;
    if (e.isIntersecting) renderizar(v); else liberar(v);
  }
}, { rootMargin: '1400px 0px' });
function liberar(v) { v.renderTask?.cancel?.(); v.renderTask = null; v.fundo.width = v.fundo.height = 0; v.tinta.width = v.tinta.height = 0; v.escala = 0; }
async function renderizar(v) {
  const [W, H] = tamanho(v.pg);
  const w = v.el.clientWidth, h = v.el.clientHeight;
  let r = dpr(); const max = 16e6; if (w * h * r * r > max) r = Math.sqrt(max / (w * h));
  const k = (w / W) * r;
  if (Math.abs(k - v.escala) < 1e-3) return;
  v.escala = k;
  for (const c of [v.fundo, v.tinta]) { c.width = Math.round(w * r); c.height = Math.round(h * r); }
  redesenharTinta(v);
  const ctx = v.fundo.getContext('2d');
  if (v.pg.tipo === 'folha') { ctx.fillStyle = '#fffefa'; ctx.fillRect(0, 0, v.fundo.width, v.fundo.height); desenhaPapel(ctx, v.pg, k); return; }
  try {
    v.renderTask?.cancel?.();
    const page = await pdf.getPage(v.pg.n);
    if (v.escala !== k) return;
    const task = page.render({ canvasContext: ctx, viewport: page.getViewport({ scale: k }) });
    v.renderTask = task; await task.promise;
    if (v.escala === k) desenhaPapel(ctx, v.pg, k);
  } catch (e) { if (e?.name !== 'RenderingCancelledException') console.warn(e); }
}
function redesenharTinta(v) {
  if (!v.escala) return;
  const ctx = v.tinta.getContext('2d'); ctx.clearRect(0, 0, v.tinta.width, v.tinta.height);
  for (const t of st.tracos[v.pg.id] || []) desenhaTraco(ctx, t, v.escala);
}
function repintarPapel() { for (const v of vistas.values()) if (v.visivel) { v.escala = 0; renderizar(v); } }

/* ---------- escrita ---------- */
let atual = null;
const toques = new Set();
function ponto(e, v) {
  const r = v.el.getBoundingClientRect(), [W] = tamanho(v.pg), k = W / r.width;
  const p = e.pointerType === 'pen' ? Math.max(0.05, e.pressure || 0.5) : 0.5;
  return [Math.round((e.clientX - r.left) * k * 100) / 100, Math.round((e.clientY - r.top) * k * 100) / 100, Math.round(p * 1000) / 1000];
}
function cancelarTraco() {
  if (!atual) return;
  atual.vivo?.remove();
  try { atual.v.el.releasePointerCapture(atual.id); } catch {}
  if (atual.apagados?.length) { const arr = (st.tracos[atual.v.pg.id] ||= []); [...atual.apagados].reverse().forEach(({ traco, idx }) => arr.splice(idx, 0, traco)); redesenharTinta(atual.v); }
  atual = null;
}
function ligarEntrada(el, pg) {
  const bloquear = (e) => { if (e.touches.length === 1 && (st.dedo || [...e.changedTouches].some((t) => t.touchType === 'stylus'))) e.preventDefault(); };
  el.addEventListener('touchstart', bloquear, { passive: false });
  el.addEventListener('touchmove', bloquear, { passive: false });
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'pen') penVisto = true;
    if (e.pointerType === 'touch') { if (e.isPrimary) toques.clear(); toques.add(e.pointerId); if (!st.dedo || toques.size > 1 || pinca) { cancelarTraco(); return; } }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (atual) return;
    const v = vistas.get(pg.id); if (!v || !v.escala) return;
    fecharPainel(); fecharMapa();
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    if (st.ferramenta === 'borracha') { atual = { v, id: e.pointerId, apagados: [] }; apagar(v, ponto(e, v)); return; }
    const vivo = document.createElement('canvas'); vivo.className = 'cd-vivo';
    vivo.width = v.tinta.width; vivo.height = v.tinta.height; el.append(vivo);
    const f = st.ferramenta;
    atual = { v, id: e.pointerId, vivo, traco: { f, e: f === 'marca' ? 'marca' : st.estilo, c: st.cor[f], s: st.esp[f], pen: e.pointerType === 'pen', p: [ponto(e, v)] } };
    pintarVivo();
  });
  el.addEventListener('pointermove', (e) => {
    if (!atual || e.pointerId !== atual.id) return;
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    const lista_ = evs.length ? evs : [e];
    if (atual.traco) { for (const c of lista_) atual.traco.p.push(ponto(c, atual.v)); pedirPintura(); }
    else for (const c of lista_) apagar(atual.v, ponto(c, atual.v));
  });
  const fim = (e) => {
    toques.delete(e.pointerId);
    if (!atual || e.pointerId !== atual.id) return;
    const a = atual; atual = null;
    if (a.traco) {
      a.vivo.remove();
      if (e.type === 'pointercancel' && a.traco.p.length < 3) return;
      if (a.traco.p.length === 1) { const [x, y, p] = a.traco.p[0]; a.traco.p.push([x + 0.01, y + 0.01, p]); }
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
    const t = arr[i], lim = RAIO_BORRACHA + t.s / 2 * (t.e === 'pincel' ? 2.3 : 1);
    let acertou = false;
    for (let j = 0; j < t.p.length && !acertou; j++) { const a = t.p[j], b = t.p[j + 1] || a; if (distSeg(x, y, a[0], a[1], b[0], b[1]) <= lim) acertou = true; }
    if (acertou) { atual.apagados.push({ traco: t, idx: i }); arr.splice(i, 1); mudou = true; }
  }
  if (mudou) redesenharTinta(v);
}

/* ---------- zoom de pinça (dois dedos) e Ctrl + roda do mouse ---------- */
let pinca = null;
function distancia(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
function ligarPinca() {
  const mesa = $('#cd-mesa'), cont = $('#cd-paginas');
  mesa.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 2) return;
    e.preventDefault(); cancelarTraco();
    const [a, b] = e.touches, r = cont.getBoundingClientRect();
    const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
    pinca = { d0: distancia(a, b), mx0: mx, my0: my, px: mx - r.left, py: my - r.top, s: 1, tx: 0, ty: 0 };
    cont.classList.add('pinca'); cont.style.transformOrigin = `${pinca.px}px ${pinca.py}px`;
  }, { passive: false });
  mesa.addEventListener('touchmove', (e) => {
    if (!pinca || e.touches.length !== 2) return;
    e.preventDefault();
    const [a, b] = e.touches;
    const z = Math.max(0.5, Math.min(3, st.zoom * distancia(a, b) / pinca.d0));
    pinca.s = z / st.zoom;
    pinca.tx = (a.clientX + b.clientX) / 2 - pinca.mx0; pinca.ty = (a.clientY + b.clientY) / 2 - pinca.my0;
    cont.style.transform = `translate(${pinca.tx}px, ${pinca.ty}px) scale(${pinca.s})`;
  }, { passive: false });
  const fimPinca = (e) => {
    if (!e.touches.length) toques.clear();
    if (!pinca || e.touches.length >= 2) return;
    const p = pinca; pinca = null;
    cont.style.transform = ''; cont.classList.remove('pinca');
    aplicarZoom(st.zoom * p.s, p.mx0 + p.tx, p.my0 + p.ty, p.px, p.py);
  };
  mesa.addEventListener('touchend', fimPinca); mesa.addEventListener('touchcancel', fimPinca);
  document.addEventListener('gesturestart', (e) => e.preventDefault()); // o Safari não amplia a tela toda
  mesa.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const r = cont.getBoundingClientRect();
    aplicarZoom(st.zoom * Math.exp(-e.deltaY / 300), e.clientX, e.clientY, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
}
// muda o zoom mantendo o ponto (px, py) do conteúdo embaixo do ponto (sx, sy) da tela
function aplicarZoom(z, sx, sy, px, py) {
  const novo = Math.max(0.5, Math.min(3, Math.round(z * 100) / 100));
  const razao = novo / st.zoom; if (Math.abs(razao - 1) < 0.005) return;
  st.zoom = novo; relayout();
  const r = $('#cd-paginas').getBoundingClientRect(), mesa = $('#cd-mesa');
  mesa.scrollLeft += r.left + px * razao - sx;
  scrollBy(0, r.top + py * razao - sy);
  salvar(true);
}
function zoomBotao(z) { aplicarZoom(z, innerWidth / 2, innerHeight / 2, innerWidth / 2 - $('#cd-paginas').getBoundingClientRect().left, innerHeight / 2 - $('#cd-paginas').getBoundingClientRect().top); }
let timerRel = 0;
function relayout() {
  const w = cssLargura();
  for (const v of vistas.values()) { const [W, H] = tamanho(v.pg); v.el.style.width = w + 'px'; v.el.style.height = Math.round(w * H / W) + 'px'; v.el.parentElement.style.width = w + 'px'; }
  $('#cd-zoom').textContent = Math.round(st.zoom * 100) + '%';
  clearTimeout(timerRel); timerRel = setTimeout(() => { for (const v of vistas.values()) if (v.visivel) renderizar(v); }, 160);
}

/* ---------- desfazer e refazer ---------- */
function registrar(op) { desfazer.push(op); refazer.length = 0; botoesHist(); salvar(true); }
function botoesHist() { $('#cd-desfazer').disabled = !desfazer.length; $('#cd-refazer').disabled = !refazer.length; }
function aplicar(op, inverso) {
  const arr = (id) => (st.tracos[id] ||= []);
  if (op.t === 'add') { if (inverso) { const a = arr(op.id); const i = a.lastIndexOf(op.traco); if (i >= 0) a.splice(i, 1); } else arr(op.id).push(op.traco); }
  else if (op.t === 'del') {
    if (inverso) [...op.itens].reverse().forEach(({ traco, idx }) => arr(op.id).splice(idx, 0, traco));
    else op.itens.forEach(({ traco }) => { const a = arr(op.id); const i = a.indexOf(traco); if (i >= 0) a.splice(i, 1); });
  } else if (op.t === 'folha+' || op.t === 'folha-') {
    const remover = op.t === 'folha+' ? inverso : !inverso;
    if (remover) { const i = st.paginas.indexOf(op.pg); if (i >= 0) st.paginas.splice(i, 1); delete st.tracos[op.pg.id]; }
    else { st.paginas.splice(op.idx, 0, op.pg); st.tracos[op.pg.id] = op.tracos || []; }
    if (st.atual !== op.pg.q) st.atual = op.pg.q;
    montar(); return;
  }
  const pg = st.paginas.find((x) => x.id === op.id);
  if (pg && pg.q !== st.atual) { st.atual = pg.q; montar(true); return; } // desfazer mostra onde a mudança aconteceu
  const v = vistas.get(op.id); if (v) redesenharTinta(v);
}
function voltar() { const op = desfazer.pop(); if (!op) return; aplicar(op, true); refazer.push(op); botoesHist(); salvar(true); }
function avancar() { const op = refazer.pop(); if (!op) return; aplicar(op, false); desfazer.push(op); botoesHist(); salvar(true); }

/* ---------- mais espaço ---------- */
function maisEspaco(q) {
  const pg = { id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), tipo: 'folha', papel: st.papel, q };
  let idx = -1; st.paginas.forEach((x, i) => { if (x.q === q) idx = i; });
  idx += 1; st.paginas.splice(idx, 0, pg); st.tracos[pg.id] = [];
  registrar({ t: 'folha+', pg, idx, tracos: [] });
  montar();
  requestAnimationFrame(() => vistas.get(pg.id)?.el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}
function removerFolha(pg) {
  const tem = (st.tracos[pg.id] || []).length;
  if (tem && !confirmar('Remover este espaço extra e o que está escrito nele? (Dá para desfazer.)')) return;
  const idx = st.paginas.indexOf(pg);
  registrar({ t: 'folha-', pg, idx, tracos: st.tracos[pg.id] || [] });
  st.paginas.splice(idx, 1); delete st.tracos[pg.id]; montar();
}
function confirmar(msg) { try { return window.confirm(msg); } catch { return true; } }

/* ---------- barra de ferramentas e painel do traço ---------- */
function montarBarra() {
  document.querySelectorAll('[data-ferramenta]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.ferramenta === st.ferramenta && b.dataset.ferramenta !== 'borracha') return alternarPainel();
    escolher(b.dataset.ferramenta);
  }));
  $('#cd-traco').addEventListener('click', alternarPainel);
  $('#cd-painel-ok').addEventListener('click', fecharPainel);
  $('#cd-esp').addEventListener('input', (e) => { const f = alvoTraco(); st.esp[f] = deControle(f, +e.target.value); atualizarTraco(); salvar(true); });
  $('#cd-desfazer').addEventListener('click', voltar);
  $('#cd-refazer').addEventListener('click', avancar);
  $('#cd-mais').addEventListener('click', () => zoomBotao(st.zoom * 1.2));
  $('#cd-menos').addEventListener('click', () => zoomBotao(st.zoom / 1.2));
  $('#cd-ajustar').addEventListener('click', () => zoomBotao(1));
  $('#cd-papel').addEventListener('change', (e) => { st.papel = e.target.value; repintarPapel(); salvar(true); });
  $('#cd-dedo').addEventListener('click', () => { st.dedo = !st.dedo; aplicarDedo(); salvar(true); aviso(st.dedo ? 'O dedo escreve. Dois dedos rolam e dão zoom.' : 'O dedo rola a página e a caneta escreve', 2600); });
  $('#cd-exportar').addEventListener('click', exportar);
  $('#cd-ant').addEventListener('click', anterior);
  $('#cd-prox').addEventListener('click', proxima);
  $('#cd-qbtn').addEventListener('click', () => ($('#cd-mapa').hidden ? abrirMapa() : fecharMapa()));
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('#cd-painel,#cd-traco,[data-ferramenta]')) fecharPainel();
    if (!e.target.closest('#cd-mapa,#cd-qbtn')) fecharMapa();
  });
  addEventListener('keydown', (e) => {
    if (e.target.closest('select,input,textarea')) return;
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? avancar() : voltar(); }
    else if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); avancar(); }
    else if (e.ctrlKey || e.metaKey || e.altKey) return;
    else if (k === 'arrowright' || k === 'pagedown') { e.preventDefault(); proxima(); }
    else if (k === 'arrowleft' || k === 'pageup') { e.preventDefault(); anterior(); }
    else if (k === 'escape') { fecharPainel(); fecharMapa(); }
    else if (k === 'p') escolher('caneta'); else if (k === 'm') escolher('marca'); else if (k === 'e') escolher('borracha');
  });
  let t = 0;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { const w = larguraBase; calcLargura(); if (w !== larguraBase) relayout(); }, 200); });
  ligarPinca();
}
function aplicarDedo() { document.body.classList.toggle('dedo', st.dedo); $('#cd-dedo').setAttribute('aria-pressed', st.dedo); }
function alvoTraco() { return st.ferramenta === 'marca' ? 'marca' : 'caneta'; }
function escolher(f) {
  st.ferramenta = f; document.body.dataset.ferramenta = f;
  document.querySelectorAll('[data-ferramenta]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ferramenta === f));
  $('#cd-cores').hidden = $('#cd-traco-grupo').hidden = f === 'borracha';
  if (f === 'borracha') fecharPainel();
  montarCores($('#cd-cores'), false);
  atualizarTraco(); salvar(true);
}
function montarCores(cont, painel) {
  const f = alvoTraco(); cont.innerHTML = '';
  for (const [nome, c] of CORES[f]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cd-cor'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', nome); b.title = nome; b.style.setProperty('--c', c); b.innerHTML = '<span></span>';
    b.setAttribute('aria-checked', st.cor[f] === c);
    b.addEventListener('click', () => { st.cor[f] = c; atualizarTraco(); salvar(true); });
    cont.append(b);
  }
  const propria = !CORES[f].some(([, c]) => c === st.cor[f]);
  if (painel || propria) {
    const l = document.createElement('label'); l.className = 'cd-outra'; l.title = 'Escolher outra cor';
    const inp = document.createElement('input'); inp.type = 'color'; inp.value = st.cor[f]; inp.setAttribute('aria-label', 'Outra cor');
    inp.addEventListener('input', () => { st.cor[f] = inp.value; atualizarTraco(); salvar(true); });
    l.append(inp, document.createTextNode(propria ? 'Sua cor' : 'Outra cor'));
    if (propria) l.style.borderStyle = 'solid';
    cont.append(l);
  }
}
function atualizarTraco() {
  const f = alvoTraco(), s = st.esp[f], c = st.cor[f], e = f === 'marca' ? 'marca' : st.estilo;
  const nomeEstilo = f === 'marca' ? 'Marca-texto' : ESTILOS.find(([k]) => k === st.estilo)[1];
  $('#cd-traco-rotulo').textContent = `${nomeEstilo} · ${mm(s)}`;
  amostra($('#cd-traco-amostra'), tracoExemplo(f, e, Math.min(s, f === 'marca' ? 14 : 3.2), c, 56, 20), 1);
  document.querySelectorAll('#cd-cores .cd-cor').forEach((b) => b.setAttribute('aria-checked', b.style.getPropertyValue('--c') === c));
  if (!$('#cd-painel').hidden) montarPainel();
}
function amostra(canvas, t, k) {
  const r = dpr(), w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
  canvas.width = w * r; canvas.height = h * r;
  const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenhaTraco(ctx, { ...t, s: t.s * k }, r); // k só engrossa o traço da prévia; as posições já estão no tamanho do canvas
}
function montarPainel() {
  const f = alvoTraco();
  $('#cd-estilos-sec').hidden = f === 'marca';
  const est = $('#cd-estilos'); est.innerHTML = '';
  for (const [k, nome] of ESTILOS) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cd-estilo'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', st.estilo === k);
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    b.append(cv, document.createTextNode(nome));
    b.addEventListener('click', () => { st.estilo = k; atualizarTraco(); salvar(true); });
    est.append(b);
    requestAnimationFrame(() => amostra(cv, tracoExemplo('caneta', k, 1.8, st.cor.caneta, cv.clientWidth, cv.clientHeight), 1));
  }
  $('#cd-esp').value = paraControle(f, st.esp[f]);
  $('#cd-esp-valor').textContent = mm(st.esp[f]);
  montarCores($('#cd-painel-cores'), true);
  const pv = $('#cd-previa');
  requestAnimationFrame(() => amostra(pv, tracoExemplo(f, f === 'marca' ? 'marca' : st.estilo, st.esp[f], st.cor[f], pv.clientWidth, pv.clientHeight), 1.4));
}
function alternarPainel() { if ($('#cd-painel').hidden) abrirPainel(); else fecharPainel(); }
function abrirPainel() { if (st.ferramenta === 'borracha') return; $('#cd-painel').hidden = false; $('#cd-traco').setAttribute('aria-expanded', 'true'); montarPainel(); }
function fecharPainel() { $('#cd-painel').hidden = true; $('#cd-traco').setAttribute('aria-expanded', 'false'); }

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
    const ordem = st.paginas.filter((pg) => pg.q !== 'gab' || st.gabarito);
    for (const pg of ordem) {
      let page;
      if (pg.tipo === 'pdf') { [page] = await out.copyPages(src, [pg.n - 1]); out.addPage(page); }
      else page = out.addPage(A4);
      const H = page.getHeight(), W = page.getWidth();
      const area = pg.q === 'gab' ? null : areaRascunho(pg);
      if (area) {
        const papel = papelDe(pg), L = linhasPapel(papel, ...area);
        const cl = cor(papel === 'quadriculado' ? COR_PAPEL.linha : COR_PAPEL.pauta);
        for (const [a, b, c, d] of L.linhas) page.drawLine({ start: { x: a, y: H - b }, end: { x: c, y: H - d }, thickness: 0.55, color: cl });
        for (const [x, y] of L.pontos) page.drawCircle({ x, y: H - y, size: 0.8, color: cor(COR_PAPEL.ponto) });
      }
      const k = W / tamanho(pg)[0];
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
  calcLargura(); montarBarra(); escolher(st.ferramenta);
  fetch('/data/aulas.json').then((r) => r.json()).then((d) => { const l = acharAula(d, aulaId); if (l) { $('#cd-titulo').textContent = l.title || l.titulo; document.title = `${l.title || l.titulo} · ${NOMES[lista]} | Caderno`; } }).catch(() => {});
  try { mapa = await (await fetch(`/pdfs/caderno-${lista}-${aulaId}.json`)).json(); } catch { mapa = null; }
  if (!mapa?.pdf) { erro('O caderno desta lista ainda não foi publicado.'); return; }
  try {
    pdfBytes = new Uint8Array(await (await fetch(mapa.pdf)).arrayBuffer());
    pdf = await pdfjs.getDocument({ data: pdfBytes.slice() }).promise;
  } catch (e) { console.error(e); erro('Não consegui abrir a lista. Verifique a internet e recarregue a página.'); return; }
  for (let n = 1; n <= pdf.numPages; n++) { const vp = (await pdf.getPage(n)).getViewport({ scale: 1 }); tamanhos[n] = [vp.width, vp.height]; }
  totalQ = mapa.questoes.length;
  const base = Array.from({ length: pdf.numPages }, (_, i) => ({ id: 'pdf-' + (i + 1), tipo: 'pdf', n: i + 1, q: questaoDaPagina(i + 1) }));
  const salvo = await banco.ler(CHAVE);
  if (salvo?.v === 2 && Array.isArray(salvo.paginas) && salvo.pdf === mapa.pdf && salvo.numPaginas === pdf.numPages) {
    st = { ...st, ...salvo };
  } else {
    if (salvo?.v === 2) aviso('A lista foi atualizada; começamos um caderno novo.', 3500);
    st.paginas = base; st.tracos = {}; st.atual = 1;
  }
  st.pdf = mapa.pdf; st.numPaginas = pdf.numPages;
  if (st.atual !== 'gab' && !(st.atual >= 1 && st.atual <= totalQ)) st.atual = 1;
  $('#cd-papel').value = st.papel; escolher(st.ferramenta); aplicarDedo();
  $('#cd-nav').hidden = false;
  montar(true);
  $('#cd-exportar').disabled = false;
  pronto = true;
  try { if (!localStorage.getItem('caderno-dica-2')) { $('#cd-dica').hidden = false; $('#cd-dica-ok').addEventListener('click', () => { $('#cd-dica').hidden = true; try { localStorage.setItem('caderno-dica-2', '1'); } catch {} }); } } catch {}
  if (salvo?.salvoEm && salvo.pdf === mapa.pdf) aviso('Seu caderno foi recuperado deste aparelho', 2200);
}
function erro(msg) { $('#cd-paginas').innerHTML = `<p class="cd-erro">${msg}</p>`; $('#cd-sub').textContent = 'Caderno'; }

window.__caderno = { get estado() { return st; }, get vistas() { return vistas; }, get mapa() { return mapa; }, exportar, irPara };
iniciar();
