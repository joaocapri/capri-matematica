/* Caderno digital do MAT MAT MAT!
   Uma questão por vez, com rascunho que ocupa a tela: em pé, o enunciado fica em cima e o rascunho embaixo;
   deitado, o enunciado fica à esquerda e o rascunho à direita. O rascunho cresce quando o aluno chega ao fim.
   Caneta (Apple Pencil, S Pen…) com estilos, formas perfeitas (desenhe e segure), marca-texto, borracha,
   conferência da resposta na própria questão e exportação da lista resolvida em PDF.
   Endereço: /caderno/?aula=4.14.1&lista=fixacao   (lista: fixacao | vestibular | aprofundamento)
   O PDF e o mapa das questões vêm de pdfs/caderno-<lista>-<aula>.pdf/.json (scripts/gerar_listas.py). */
import * as pdfjs from '/assets/vendor/pdf.min.mjs';
import { getStroke } from '/assets/vendor/perfect-freehand.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.mjs';

const A4 = [595.28, 841.89];
const MARGEM = 42.5;          // 15 mm, as margens laterais da lista
const RW = 540;               // largura do rascunho, em unidades (≈ pontos de uma folha A4)
const PASSO = 14.17;          // 5 mm: quadriculado, pontilhado
const TOPO_Q = 50;            // onde começa a questão na página do PDF (abaixo do cabeçalho)
const NOMES = { fixacao: 'Lista de fixação', vestibular: 'Lista de vestibular', aprofundamento: 'Lista de aprofundamento' };
const CORES = {
  caneta: [['Preto', '#1d1b26'], ['Azul', '#2459d6'], ['Vermelho', '#d8352b'], ['Verde', '#1c8f4e'], ['Roxo', '#6a3fd8'], ['Laranja', '#ea7b16']],
  marca: [['Amarelo', '#ffe14d'], ['Verde-limão', '#c8f55f'], ['Rosa', '#ff9ccf'], ['Azul-claro', '#8fd3ff'], ['Laranja', '#ffc078']],
};
const ESTILOS = [['tinteiro', 'Tinteiro'], ['esfero', 'Esferográfica'], ['nanquim', 'Nanquim'], ['pincel', 'Pincel']];
const FAIXA = { caneta: [0.25, 7], marca: [5, 26] };
const deControle = (f, v) => { const [a, b] = FAIXA[f]; return +(a * Math.pow(b / a, v / 100)).toFixed(2); };
const paraControle = (f, s) => { const [a, b] = FAIXA[f]; return Math.round(100 * Math.log(s / a) / Math.log(b / a)); };
const mm = (pt) => (pt * 0.3528).toFixed(pt < 2.84 ? 2 : 1).replace(/0$/, '').replace('.', ',') + ' mm';
const RAIO_BORRACHA = 7;
const VERDE = '#1c8f4e', VERMELHO = '#d8352b';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- parâmetros ---------- */
const qs = new URLSearchParams(location.search);
const aulaId = (qs.get('aula') || '').replace(/[^0-9a-z.]/gi, '');
const lista = NOMES[qs.get('lista')] ? qs.get('lista') : 'fixacao';
const CHAVE = `v3|${aulaId}|${lista}`;

/* ---------- estado ---------- */
let st = {
  v: 3, tracos: {}, rasc: {}, gabarito: false, zoom: 1, dedo: false, atual: 1, formas: false,
  ferramenta: 'caneta', estilo: 'tinteiro',
  cor: { caneta: CORES.caneta[0][1], marca: CORES.marca[0][1] },
  esp: { caneta: 1.4, marca: 14 }, papel: 'quadriculado', revelado: {}, resultado: {},
};
let pdf = null, pdfBytes = null, mapa = null, respostas = [], tamanhos = {}, totalQ = 0;
const desfazer = [], refazer = [];

/* ---------- traço ---------- */
function opcoes(t, k) {
  const s = t.s * k, pen = !!t.pen;
  if (t.f === 'marca') return { size: s, thinning: 0, smoothing: 0.5, streamline: t.forma ? 0 : 0.45, simulatePressure: false, start: { cap: false }, end: { cap: false }, last: true };
  if (t.forma && t.e !== 'pincel') return { size: s * (t.e === 'esfero' ? 0.9 : 1), thinning: 0, smoothing: 0.2, streamline: 0, simulatePressure: false, last: true };
  switch (t.e || 'tinteiro') {
    case 'esfero': return { size: s, thinning: pen ? 0.18 : 0.1, smoothing: 0.62, streamline: 0.5, simulatePressure: false, last: true };
    case 'nanquim': return { size: s, thinning: 0, smoothing: 0.55, streamline: 0.5, simulatePressure: false, last: true };
    case 'pincel': return { size: s * 2.3, thinning: t.forma ? 0.3 : 0.86, smoothing: 0.62, streamline: t.forma ? 0 : 0.42, simulatePressure: !pen && !t.forma,
      start: { taper: pen || t.forma ? 0 : s * 6, cap: true }, end: { taper: t.forma ? 0 : s * 9, cap: true }, last: true };
    default: return { size: s, thinning: pen ? 0.58 : 0.45, smoothing: 0.5, streamline: 0.42, simulatePressure: !pen, last: true };
  }
}
function contorno(t, k) { return getStroke(t.p.map(([x, y, p]) => [x * k, y * k, p]), opcoes(t, k)); }
function caminho(pts, dx = 0, dy = 0) {
  if (!pts.length) return '';
  const n = pts.length, f = (v) => v.toFixed(2);
  let d = `M${f(pts[0][0] + dx)} ${f(pts[0][1] + dy)}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
    d += `Q${f(x0 + dx)} ${f(y0 + dy)} ${f((x0 + x1) / 2 + dx)} ${f((y0 + y1) / 2 + dy)}`;
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
function tracoExemplo(f, e, s, c, w, h) {
  const p = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; p.push([w * 0.08 + u * w * 0.84, h / 2 + Math.sin(u * Math.PI * 2) * h * 0.24, 0.25 + 0.6 * Math.sin(u * Math.PI)]); }
  return { f, e: f === 'marca' ? 'marca' : e, s, c, pen: true, p };
}

/* ---------- formas perfeitas ---------- */
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(ax + t * dx - px, ay + t * dy - py);
}
function rdp(pts, eps) {
  if (pts.length < 3) return pts.slice();
  let max = 0, idx = 0; const a = pts[0], b = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) { const d = distSeg(pts[i][0], pts[i][1], a[0], a[1], b[0], b[1]); if (d > max) { max = d; idx = i; } }
  if (max <= eps) return [a, b];
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
}
function erroPoligono(pts, vs, fechado) {
  let soma = 0;
  for (const p of pts) {
    let m = Infinity;
    for (let i = 0; i < vs.length - (fechado ? 0 : 1); i++) { const a = vs[i], b = vs[(i + 1) % vs.length]; m = Math.min(m, distSeg(p[0], p[1], a[0], a[1], b[0], b[1])); }
    soma += m;
  }
  return soma / pts.length;
}
function amostrar(vs, fechado) {
  const out = [], seq = fechado ? [...vs, vs[0]] : vs;
  for (let i = 0; i < seq.length - 1; i++) {
    const a = seq[i], b = seq[i + 1], n = Math.max(2, Math.ceil(dist(a, b) / 2));
    for (let j = 0; j < n; j++) out.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n, 0.5]);
  }
  const u = seq[seq.length - 1]; out.push([u[0], u[1], 0.5]);
  if (fechado) out.push([seq[1][0] * 0.02 + u[0] * 0.98, seq[1][1] * 0.02 + u[1] * 0.98, 0.5]); // fecha sem falha no canto
  return out;
}
function reconhecer(pontos, soReta) {
  const pts = pontos.map(([x, y]) => [x, y]);
  if (pts.length < 4) return null;
  let L = 0; for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const w = x1 - x0, h = y1 - y0, diag = Math.hypot(w, h);
  if (L < 8 || diag < 6) return null;
  const a = pts[0], b = pts[pts.length - 1], d = dist(a, b);
  // reta: pontas longe uma da outra e pouco desvio da corda
  let desvio = 0; for (const p of pts) desvio = Math.max(desvio, distSeg(p[0], p[1], a[0], a[1], b[0], b[1]));
  if (soReta || (d > 0.7 * L && desvio < Math.max(4, 0.09 * d))) {
    let [p, q] = [a, b];
    const ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI, r = ((ang % 90) + 90) % 90;
    if (r < 6 || r > 84) { // quase horizontal ou vertical: endireita
      if (Math.abs(q[0] - p[0]) > Math.abs(q[1] - p[1])) q = [q[0], p[1]]; else q = [p[0], q[1]];
    }
    return { nome: 'Reta', pts: amostrar([p, q], false) };
  }
  const fechado = d < Math.max(0.2 * Math.max(w, h), 0.12 * L);
  if (fechado) {
    const contornoF = pts.concat([pts[0]]);
    let vs = rdp(contornoF, 0.075 * diag); vs.pop();
    // junta vértices quase colados
    vs = vs.filter((v, i) => i === 0 || dist(v, vs[i - 1]) > 0.12 * diag);
    if (vs.length > 2 && dist(vs[0], vs[vs.length - 1]) < 0.12 * diag) vs.pop();
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.max(w / 2, 1), ry = Math.max(h / 2, 1);
    let errE = 0; for (const [x, y] of pts) errE += Math.abs(Math.hypot((x - cx) / rx, (y - cy) / ry) - 1); errE /= pts.length;
    const errP = vs.length >= 3 ? erroPoligono(pts, vs, true) / diag : 1;
    if ((vs.length === 3 || vs.length === 4) && errP < 0.045 && errP < errE * 0.6 + 0.02) {
      if (vs.length === 3) return { nome: 'Triângulo', pts: amostrar(vs, true) };
      const retos = vs.every((v, i) => { const u = vs[(i + 1) % 4], ang = Math.abs(Math.atan2(u[1] - v[1], u[0] - v[0]) * 180 / Math.PI) % 90; return ang < 12 || ang > 78; });
      if (retos) {
        const qx0 = Math.min(...vs.map((v) => v[0])), qx1 = Math.max(...vs.map((v) => v[0])), qy0 = Math.min(...vs.map((v) => v[1])), qy1 = Math.max(...vs.map((v) => v[1]));
        let ww = qx1 - qx0, hh = qy1 - qy0, ccx = (qx0 + qx1) / 2, ccy = (qy0 + qy1) / 2, nome = 'Retângulo';
        if (Math.abs(ww - hh) < 0.12 * Math.max(ww, hh)) { ww = hh = (ww + hh) / 2; nome = 'Quadrado'; }
        return { nome, pts: amostrar([[ccx - ww / 2, ccy - hh / 2], [ccx + ww / 2, ccy - hh / 2], [ccx + ww / 2, ccy + hh / 2], [ccx - ww / 2, ccy + hh / 2]], true) };
      }
      return { nome: 'Quadrilátero', pts: amostrar(vs, true) };
    }
    if (errE < 0.14) {
      let ex = rx, ey = ry, nome = 'Elipse';
      if (Math.abs(rx - ry) < 0.14 * Math.max(rx, ry)) { ex = ey = (rx + ry) / 2; nome = 'Círculo'; }
      const n = Math.max(48, Math.round(Math.PI * (ex + ey) / 2)), out = [];
      const ini = Math.atan2(a[1] - cy, a[0] - cx); // começa onde a mão começou
      for (let i = 0; i <= n + 1; i++) { const t = ini + i / n * Math.PI * 2; out.push([cx + ex * Math.cos(t), cy + ey * Math.sin(t), 0.5]); }
      return { nome, pts: out };
    }
    return null;
  }
  // linha quebrada aberta (eixos, ângulos, setas simples)
  const vs = rdp(pts, 0.06 * diag);
  if (vs.length >= 3 && vs.length <= 4 && erroPoligono(pts, vs, false) / diag < 0.03) return { nome: 'Linha', pts: amostrar(vs, false) };
  return null;
}

/* ---------- papel ---------- */
function linhasPapel(papel, x0, y0, x1, y1) {
  const L = { linhas: [], pontos: [] };
  if (papel === 'pautado') for (let y = y0 + 22.7; y < y1 - 2; y += 22.7) L.linhas.push([x0, y, x1, y]);
  else if (papel === 'quadriculado') {
    for (let x = x0; x <= x1 + 0.1; x += PASSO) L.linhas.push([x, y0, x, y1]);
    for (let y = y0; y <= y1 + 0.1; y += PASSO) L.linhas.push([x0, y, x1, y]);
  } else if (papel === 'pontilhado') {
    for (let y = y0 + PASSO / 2; y <= y1; y += PASSO) for (let x = x0 + PASSO / 2; x <= x1; x += PASSO) L.pontos.push([x, y]);
  }
  return L;
}
const COR_PAPEL = { linha: '#d9d4ee', pauta: '#c6c0e2', ponto: '#aea7d4' };
function desenhaPapel(ctx, papel, area, k, ox = 0, oy = 0) {
  const L = linhasPapel(papel, ...area);
  ctx.save();
  ctx.strokeStyle = papel === 'quadriculado' ? COR_PAPEL.linha : COR_PAPEL.pauta;
  ctx.lineWidth = Math.max(0.6, 0.55 * k);
  ctx.beginPath();
  for (const [a, b, c, d] of L.linhas) { ctx.moveTo((a - ox) * k, (b - oy) * k); ctx.lineTo((c - ox) * k, (d - oy) * k); }
  ctx.stroke();
  if (L.pontos.length) { ctx.fillStyle = COR_PAPEL.ponto; const r = Math.max(0.9, 0.8 * k); for (const [x, y] of L.pontos) { ctx.beginPath(); ctx.arc((x - ox) * k, (y - oy) * k, r, 0, 6.2832); ctx.fill(); } }
  ctx.restore();
}
function gradeA4(n) { // área do rascunho na página do PDF (exportação): quadradinhos inteiros, centralizados
  const [W] = tamanhos[n] || A4, y = mapa?.rascunho?.[n];
  if (y == null) return null;
  const larg = Math.floor((W - 2 * MARGEM) / PASSO) * PASSO, sobra = (W - 2 * MARGEM - larg) / 2;
  return [MARGEM + sobra, y + 4, W - MARGEM - sobra, Math.max(y + 30, mapa.rascunhoFim)];
}

/* ---------- salvamento ---------- */
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
  if (!pronto) return;
  clearTimeout(timerSalvar);
  timerSalvar = setTimeout(async () => {
    if (!(await banco.gravar(CHAVE, { ...st, salvoEm: Date.now() }))) aviso('Não consegui salvar neste aparelho. Exporte o PDF para não perder.', 5000);
  }, 500);
}
let timerAviso = null;
function aviso(txt, ms = 1800) {
  const el = $('#cd-status'); el.textContent = txt; el.classList.add('on');
  clearTimeout(timerAviso); timerAviso = setTimeout(() => el.classList.remove('on'), ms);
}

/* ---------- vistas: recorte da questão, rascunho e páginas do gabarito ---------- */
const vistas = new Map();
const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
const paisagem = () => innerWidth >= 900 && innerWidth > innerHeight * 1.05;
function alturaBarra() { return $('#cd-bar').offsetHeight; }
function larguras() {
  const util = document.documentElement.clientWidth - (innerWidth <= 560 ? 12 : 28);
  if (paisagem()) {
    const total = Math.min(util, 1560) * st.zoom, enun = Math.round(total * 0.45);
    return { total, enun, rasc: Math.round(total - enun - 18) };
  }
  const col = Math.round(Math.min(util, 900) * st.zoom);
  return { total: col, enun: col, rasc: col };
}
function recorte(n, q) { // região da página n que mostra a questão q (sem o cabeçalho e sem o espaço em branco)
  const [W] = tamanhos[n]; const pags = mapa.questoes[q - 1].paginas, ultima = n === pags[pags.length - 1];
  const y1 = ultima && mapa.rascunho[n] != null ? mapa.rascunho[n] - 2 : mapa.rascunhoFim;
  return [34, TOPO_Q, W - 34, Math.max(TOPO_Q + 40, y1)];
}
function maxY(id) { let m = 0; for (const t of st.tracos[id] || []) for (const p of t.p) if (p[1] > m) m = p[1]; return m; }
function alturaRascunho(q, cssEscala) {
  const tela = (innerHeight - alturaBarra() - 110) / cssEscala;
  return Math.max(st.rasc[q] || 0, tela, maxY('r-' + q) + 160, 360);
}
function questaoFeita(n) { return (st.tracos['r-' + n] || []).length || mapa.questoes[n - 1].paginas.some((p) => (st.tracos['pdf-' + p] || []).length); }

function criaVista(id, tipo, area, larguraCss, extra = {}) {
  const [x0, y0, x1, y1] = area, k = larguraCss / (x1 - x0);
  const el = document.createElement('div');
  el.className = 'cd-pag ' + (tipo === 'rasc' ? 'cd-rasc' : tipo === 'recorte' ? 'cd-recorte' : 'cd-pagina');
  el.dataset.id = id + '|' + tipo;
  el.style.width = larguraCss + 'px'; el.style.height = Math.round((y1 - y0) * k) + 'px';
  const fundo = document.createElement('canvas'), tinta = document.createElement('canvas'); tinta.className = 'cd-tinta';
  el.append(fundo, tinta);
  const v = { id, tipo, el, fundo, tinta, area, escala: 0, ...extra };
  vistas.set(el.dataset.id, v); ligarEntrada(v); obs.observe(el);
  return v;
}

function montar(rolarTopo) {
  const cont = $('#cd-paginas');
  for (const v of vistas.values()) v.renderTask?.cancel?.();
  vistas.clear(); obs.disconnect(); cont.innerHTML = '';
  document.body.classList.toggle('paisagem', paisagem());
  document.documentElement.style.setProperty('--barra', alturaBarra() + 'px');
  const L = larguras();
  if (st.atual === 'gab') montarGabarito(cont, L);
  else {
    const q = st.atual, info = mapa.questoes[q - 1];
    const grade = document.createElement('div'); grade.className = 'cd-q'; grade.style.width = L.total + 'px';
    const enun = document.createElement('section'); enun.className = 'cd-enun'; enun.setAttribute('aria-label', `Questão ${q}`);
    enun.style.width = L.enun + 'px';
    if (paisagem()) enun.style.maxHeight = `calc(100vh - ${alturaBarra() + 104}px)`;
    for (const n of info.paginas) enun.append(criaVista('pdf-' + n, 'recorte', recorte(n, q), L.enun, { n, q }).el);
    enun.append(blocoResposta(q));
    const rasc = document.createElement('section'); rasc.className = 'cd-rasc-col'; rasc.setAttribute('aria-label', `Rascunho da questão ${q}`);
    rasc.style.width = L.rasc + 'px';
    const k = L.rasc / RW, alt = alturaRascunho(q, k);
    const topo = document.createElement('div'); topo.className = 'cd-rasc-topo'; topo.innerHTML = '<span>Rascunho</span>';
    rasc.append(topo, criaVista('r-' + q, 'rasc', [0, 0, RW, alt], L.rasc, { q }).el);
    const mais = document.createElement('button'); mais.type = 'button'; mais.className = 'cd-espaco';
    mais.innerHTML = '<span aria-hidden="true">+</span> Mais espaço';
    mais.title = 'O rascunho também cresce sozinho quando você escreve perto do fim';
    mais.addEventListener('click', () => {
      st.rasc[q] = alt + 420; salvar(); montar();
      const v = [...vistas.values()].find((x) => x.tipo === 'rasc');
      requestAnimationFrame(() => scrollBy({ top: v ? v.el.getBoundingClientRect().bottom - innerHeight + 120 : 300, behavior: 'smooth' }));
    });
    topo.append(mais);
    grade.append(enun, rasc); cont.append(grade);
  }
  $('#cd-zoom').textContent = Math.round(st.zoom * 100) + '%';
  atualizarNav();
  if (rolarTopo) scrollTo({ top: 0 });
}
function montarGabarito(cont, L) {
  const w = Math.round(Math.min(document.documentElement.clientWidth - 28, 900) * st.zoom);
  const certo = Object.values(st.resultado).filter((r) => r === 'certo').length, errado = Object.values(st.resultado).filter((r) => r === 'errado').length;
  const c = document.createElement('section'); c.className = 'cd-gabarito';
  const placar = certo + errado ? `<p class="cd-placar"><b>${certo}</b> ${certo === 1 ? 'acerto' : 'acertos'} e <b>${errado}</b> ${errado === 1 ? 'erro' : 'erros'} nas questões que você conferiu.</p>` : '';
  const feitas = Array.from({ length: totalQ }, (_, i) => i + 1).filter(questaoFeita).length;
  c.innerHTML = `<b>Fim da lista</b>${placar}<p>Você escreveu em ${feitas} de ${totalQ} questões. Em cada questão, o botão <b>Conferir resposta</b> mostra a correta e a resolução.</p>
    <button type="button">${st.gabarito ? 'Esconder o gabarito completo' : 'Ver o gabarito completo'}</button>`;
  c.querySelector('button').addEventListener('click', () => { st.gabarito = !st.gabarito; montar(); salvar(); });
  cont.append(c);
  if (!st.gabarito) return;
  for (let n = mapa.gabarito; n <= pdf.numPages; n++) {
    const [W, H] = tamanhos[n]; const b = document.createElement('div'); b.className = 'cd-bloco'; b.style.width = w + 'px';
    b.append(criaVista('pdf-' + n, 'pagina', [0, 0, W, H], w, { n }).el); cont.append(b);
  }
}

/* ---------- conferir a resposta ---------- */
function dadosResposta(q) {
  const r = respostas[q - 1] || {}, info = mapa.questoes[q - 1];
  let letra = null, soma = null, partes = [];
  if (Array.isArray(r.opcoes) && Number.isInteger(r.correta)) letra = 'ABCDE'[r.correta];
  else if (/^[A-E]$/.test(String(r.resposta || '').trim()) && info.alternativas) letra = String(r.resposta).trim();
  if (r.tipo === 'somatoria') { soma = r.correta; partes = (r.codigos || []).filter((c) => soma & c); }
  return { r, info, letra, soma, partes };
}
function blocoResposta(q) {
  const box = document.createElement('div'); box.className = 'cd-resp';
  const { r, letra, soma, partes } = dadosResposta(q);
  const aberto = !!st.revelado[q];
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cd-conferir' + (aberto ? ' aberto' : '');
  btn.setAttribute('aria-expanded', aberto);
  btn.innerHTML = aberto ? 'Esconder a resposta' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>Conferir resposta';
  btn.addEventListener('click', () => {
    st.revelado[q] = !st.revelado[q]; salvar();
    const v = [...vistas.values()].filter((x) => x.tipo === 'recorte'); v.forEach((x) => { x.escala = 0; renderizar(x); });
    const novo = blocoResposta(q); box.replaceWith(novo); if (st.revelado[q]) requestAnimationFrame(() => novo.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  });
  box.append(btn);
  if (!aberto) return box;
  const card = document.createElement('div'); card.className = 'cd-resp-card';
  let topo;
  if (soma != null) topo = `<p class="cd-resp-certa">Soma <b>${soma}</b> <span>(${partes.map((c) => String(c).padStart(2, '0')).join(' + ')})</span></p>`;
  else if (letra) topo = `<p class="cd-resp-certa">Alternativa <b>${letra}</b> <span>marcada em verde na questão</span></p>`;
  else topo = `<p class="cd-resp-certa"><span>Resposta</span> ${r.resposta ? esc(r.resposta) : '—'}</p>`;
  const resol = (r.resolucao || []).map((l) => `<p>${esc(l)}</p>`).join('');
  card.innerHTML = topo + (resol ? `<div class="cd-resol"><h3>Resolução</h3>${resol}</div>` : '') +
    `<div class="cd-autoav" role="group" aria-label="Como foi?"><span>Como foi?</span>
      <button type="button" data-res="certo" aria-pressed="${st.resultado[q] === 'certo'}">✓ Acertei</button>
      <button type="button" data-res="errado" aria-pressed="${st.resultado[q] === 'errado'}">✗ Errei</button></div>`;
  card.querySelectorAll('[data-res]').forEach((b) => b.addEventListener('click', () => {
    st.resultado[q] = st.resultado[q] === b.dataset.res ? undefined : b.dataset.res; if (!st.resultado[q]) delete st.resultado[q];
    salvar(); card.querySelectorAll('[data-res]').forEach((x) => x.setAttribute('aria-pressed', st.resultado[q] === x.dataset.res));
    if (st.resultado[q] === 'certo') aviso('Boa! Marcado como acerto', 1400);
  }));
  box.append(card);
  requestAnimationFrame(() => window.MathJax?.typesetPromise?.([card]).catch(() => {}));
  return box;
}
function marcasResposta(ctx, v, k) { // destaca a alternativa correta (ou as proposições) na própria questão
  const q = v.q; if (!q || !st.revelado[q]) return;
  const { info, letra, soma } = dadosResposta(q);
  const [ox, oy, ox1] = v.area, X = (x) => (x - ox) * k, Y = (y) => (y - oy) * k;
  const faixa = (x, y, cor) => { ctx.fillStyle = cor; const r = 5 * k; ctx.beginPath(); ctx.roundRect?.(X(x - 5), Y(y - 12), (ox1 - 6 - (x - 5) - ox) * k, 17 * k, r); ctx.fill(); };
  const anel = (x, y, cor) => { ctx.strokeStyle = cor; ctx.lineWidth = 1.8 * k; ctx.beginPath(); ctx.arc(X(x + 6.5), Y(y - 2.3), 8.6 * k, 0, 6.2832); ctx.stroke(); };
  const sinal = (y, ok) => { ctx.fillStyle = ok ? VERDE : VERMELHO; ctx.font = `700 ${13 * k}px system-ui,sans-serif`; ctx.textAlign = 'right'; ctx.fillText(ok ? '✓' : '✗', X(ox1 - 12), Y(y + 2)); };
  ctx.save();
  if (letra && info.alternativas?.[letra]) { const [pg, x, y] = info.alternativas[letra]; if (pg === v.n) { faixa(x, y, 'rgba(28,143,78,.13)'); anel(x, y, VERDE); sinal(y, true); } }
  if (soma != null && info.proposicoes) {
    for (const [cod, [pg, x, y]] of Object.entries(info.proposicoes)) {
      if (pg !== v.n) continue; const ok = (soma & +cod) !== 0;
      if (ok) { faixa(x, y, 'rgba(28,143,78,.13)'); anel(x, y, VERDE); }
      sinal(y, ok);
    }
  }
  ctx.restore();
}

/* ---------- navegação ---------- */
function irPara(alvo) {
  if (alvo !== 'gab') alvo = Math.max(1, Math.min(totalQ, alvo));
  if (alvo === st.atual) return;
  cancelarTraco(); st.atual = alvo; fecharMapa(); montar(true); salvar();
}
function atualizarNav() {
  const a = st.atual;
  $('#cd-qnum').textContent = a === 'gab' ? 'Fim da lista' : `Questão ${a}`;
  const q = a === 'gab' ? null : mapa.questoes[a - 1];
  $('#cd-qinfo').textContent = a === 'gab' ? `${totalQ} questões` : `de ${totalQ}${q?.nivel ? ' · ' + q.nivel : ''}`;
  $('#cd-ant').disabled = a === 1;
  const prox = $('#cd-prox'); prox.disabled = a === 'gab';
  prox.querySelector('span').textContent = a === totalQ ? 'Concluir' : 'Próxima';
  prox.setAttribute('aria-label', a === totalQ ? 'Concluir a lista' : 'Próxima questão');
}
function anterior() { irPara(st.atual === 'gab' ? totalQ : st.atual - 1); }
function proxima() { if (st.atual !== 'gab') irPara(st.atual === totalQ ? 'gab' : st.atual + 1); }
function abrirMapa() {
  const m = $('#cd-mapa'), g = $('#cd-mapa-grade'); g.innerHTML = '';
  for (let n = 1; n <= totalQ; n++) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = n;
    const res = st.resultado[n];
    if (res) b.classList.add(res); else if (questaoFeita(n)) b.classList.add('feito');
    b.title = res === 'certo' ? 'Acertou' : res === 'errado' ? 'Errou' : questaoFeita(n) ? 'Você já escreveu nesta questão' : '';
    if (n === st.atual) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', () => irPara(n)); g.append(b);
  }
  const gb = document.createElement('button'); gb.type = 'button'; gb.className = 'cd-mapa-gab'; gb.textContent = 'Fim da lista e gabarito';
  if (st.atual === 'gab') gb.setAttribute('aria-current', 'true');
  gb.addEventListener('click', () => irPara('gab')); g.append(gb);
  m.hidden = false; $('#cd-qbtn').setAttribute('aria-expanded', 'true');
}
function fecharMapa() { $('#cd-mapa').hidden = true; $('#cd-qbtn').setAttribute('aria-expanded', 'false'); }

/* ---------- renderização ---------- */
const obs = new IntersectionObserver((ents) => {
  for (const e of ents) {
    const v = vistas.get(e.target.dataset.id); if (!v) continue;
    v.visivel = e.isIntersecting;
    if (e.isIntersecting) renderizar(v); else if (v.tipo === 'pagina') liberar(v);
  }
}, { rootMargin: '1200px 0px' });
function liberar(v) { v.renderTask?.cancel?.(); v.renderTask = null; v.fundo.width = v.fundo.height = 0; v.tinta.width = v.tinta.height = 0; v.escala = 0; }
async function renderizar(v) {
  const [x0, y0, x1, y1] = v.area;
  const w = v.el.clientWidth, h = v.el.clientHeight; if (!w || !h) return;
  let r = dpr(); const max = 16e6; if (w * h * r * r > max) r = Math.sqrt(max / (w * h));
  const k = (w / (x1 - x0)) * r;
  if (Math.abs(k - v.escala) < 1e-3) return;
  v.escala = k;
  for (const c of [v.fundo, v.tinta]) { c.width = Math.round(w * r); c.height = Math.round(h * r); }
  redesenharTinta(v);
  const ctx = v.fundo.getContext('2d');
  if (v.tipo === 'rasc') { ctx.fillStyle = '#fffefa'; ctx.fillRect(0, 0, v.fundo.width, v.fundo.height); desenhaPapel(ctx, st.papel, [10, 8, RW - 10, y1 - 8], k); return; }
  try {
    v.renderTask?.cancel?.();
    const page = await pdf.getPage(v.n);
    if (v.escala !== k) return;
    const vp = page.getViewport({ scale: k, offsetX: -x0 * k, offsetY: -y0 * k });
    const task = page.render({ canvasContext: ctx, viewport: vp });
    v.renderTask = task; await task.promise;
    if (v.escala === k && v.tipo === 'recorte') marcasResposta(ctx, v, k);
  } catch (e) { if (e?.name !== 'RenderingCancelledException') console.warn(e); }
}
function redesenharTinta(v) {
  if (!v.escala) return;
  const ctx = v.tinta.getContext('2d'); ctx.clearRect(0, 0, v.tinta.width, v.tinta.height);
  ctx.save(); ctx.translate(-v.area[0] * v.escala, -v.area[1] * v.escala);
  for (const t of st.tracos[v.id] || []) desenhaTraco(ctx, t, v.escala);
  ctx.restore();
}
function vistasDe(id) { return [...vistas.values()].filter((v) => v.id === id); }
function repintar(id) { vistasDe(id).forEach(redesenharTinta); }

/* ---------- escrita ---------- */
let atual = null, penVisto = false;
const toques = new Set();
function ponto(e, v) {
  const r = v.el.getBoundingClientRect(), k = (v.area[2] - v.area[0]) / r.width;
  const p = e.pointerType === 'pen' ? Math.max(0.05, e.pressure || 0.5) : 0.5;
  return [Math.round((v.area[0] + (e.clientX - r.left) * k) * 100) / 100, Math.round((v.area[1] + (e.clientY - r.top) * k) * 100) / 100, Math.round(p * 1000) / 1000];
}
function cancelarTraco() {
  if (!atual) return;
  clearTimeout(atual.timer); atual.vivo?.remove();
  try { atual.v.el.releasePointerCapture(atual.pid); } catch {}
  if (atual.apagados?.length) { const arr = (st.tracos[atual.v.id] ||= []); [...atual.apagados].reverse().forEach(({ traco, idx }) => arr.splice(idx, 0, traco)); repintar(atual.v.id); }
  atual = null;
}
function ligarEntrada(v) {
  const el = v.el;
  const bloquear = (e) => { if (e.touches.length === 1 && (st.dedo || [...e.changedTouches].some((t) => t.touchType === 'stylus'))) e.preventDefault(); };
  el.addEventListener('touchstart', bloquear, { passive: false });
  el.addEventListener('touchmove', bloquear, { passive: false });
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'pen') penVisto = true;
    if (e.pointerType === 'touch') { if (e.isPrimary) toques.clear(); toques.add(e.pointerId); if (!st.dedo || toques.size > 1 || pinca) { cancelarTraco(); return; } }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (atual || !v.escala) return;
    fecharPainel(); fecharMapa();
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    if (st.ferramenta === 'borracha') { atual = { v, pid: e.pointerId, apagados: [] }; apagar(v, ponto(e, v)); return; }
    const vivo = document.createElement('canvas'); vivo.className = 'cd-vivo';
    vivo.width = v.tinta.width; vivo.height = v.tinta.height; el.append(vivo);
    const f = st.ferramenta, p0 = ponto(e, v);
    atual = { v, pid: e.pointerId, vivo, ancora: p0, timer: 0, traco: { f, e: f === 'marca' ? 'marca' : st.estilo, c: st.cor[f], s: st.esp[f], pen: e.pointerType === 'pen', p: [p0] } };
    armarForma(); pintarVivo();
  });
  el.addEventListener('pointermove', (e) => {
    if (!atual || e.pointerId !== atual.pid || atual.v !== v) return;
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    const lista_ = evs.length ? evs : [e];
    if (atual.traco) {
      if (atual.travado) return; // forma já reconhecida: fica como está até soltar
      for (const c of lista_) atual.traco.p.push(ponto(c, v));
      const u = atual.traco.p[atual.traco.p.length - 1];
      if (dist(u, atual.ancora) > 2.5) { atual.ancora = u; armarForma(); }
      pedirPintura();
    } else for (const c of lista_) apagar(v, ponto(c, v));
  });
  const fim = (e) => {
    toques.delete(e.pointerId);
    if (!atual || e.pointerId !== atual.pid || atual.v !== v) return;
    const a = atual; atual = null; clearTimeout(a.timer);
    if (a.traco) {
      a.vivo.remove();
      if (e.type === 'pointercancel' && a.traco.p.length < 3) return;
      if (!a.travado && st.formas && a.traco.p.length > 5) { const fm = reconhecer(a.traco.p, a.traco.f === 'marca'); if (fm) { a.traco.p = fm.pts; a.traco.forma = fm.nome; } }
      if (a.traco.p.length === 1) { const [x, y, p] = a.traco.p[0]; a.traco.p.push([x + 0.01, y + 0.01, p]); }
      (st.tracos[v.id] ||= []).push(a.traco);
      repintar(v.id);
      registrar({ t: 'add', id: v.id, traco: a.traco });
      if (v.tipo === 'rasc') crescerSePreciso(v, a.traco);
    } else if (a.apagados.length) registrar({ t: 'del', id: v.id, itens: a.apagados });
  };
  el.addEventListener('pointerup', fim);
  el.addEventListener('pointercancel', fim);
}
function armarForma() { // desenhou e segurou parado no fim: vira forma perfeita
  clearTimeout(atual.timer);
  atual.timer = setTimeout(() => {
    const a = atual; if (!a?.traco || a.travado || a.traco.p.length < 6) return;
    const fm = reconhecer(a.traco.p, a.traco.f === 'marca');
    if (!fm) return;
    a.traco.p = fm.pts; a.traco.forma = fm.nome; a.travado = true; pintarVivo();
    aviso(fm.nome, 900);
    navigator.vibrate?.(10);
  }, 520);
}
function crescerSePreciso(v, t) {
  const alt = v.area[3], baixo = Math.max(...t.p.map((p) => p[1]));
  if (baixo > alt - 130) { st.rasc[v.q] = alt + 360; salvar(); montar(); }
}
let raf = 0;
function pedirPintura() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; pintarVivo(); }); }
function pintarVivo() {
  if (!atual?.traco) return;
  const v = atual.v, ctx = atual.vivo.getContext('2d'); ctx.clearRect(0, 0, atual.vivo.width, atual.vivo.height);
  ctx.save(); ctx.translate(-v.area[0] * v.escala, -v.area[1] * v.escala); desenhaTraco(ctx, atual.traco, v.escala); ctx.restore();
}
function apagar(v, [x, y]) {
  const arr = st.tracos[v.id]; if (!arr?.length) return;
  let mudou = false;
  for (let i = arr.length - 1; i >= 0; i--) {
    const t = arr[i], lim = RAIO_BORRACHA + t.s / 2 * (t.e === 'pincel' ? 2.3 : 1);
    let acertou = false;
    for (let j = 0; j < t.p.length && !acertou; j++) { const a = t.p[j], b = t.p[j + 1] || a; if (distSeg(x, y, a[0], a[1], b[0], b[1]) <= lim) acertou = true; }
    if (acertou) { atual.apagados.push({ traco: t, idx: i }); arr.splice(i, 1); mudou = true; }
  }
  if (mudou) repintar(v.id);
}

/* ---------- zoom de pinça e Ctrl + roda ---------- */
let pinca = null;
const distT = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
function ligarPinca() {
  const mesa = $('#cd-mesa'), cont = $('#cd-paginas');
  mesa.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 2) return;
    e.preventDefault(); cancelarTraco();
    const [a, b] = e.touches, r = cont.getBoundingClientRect();
    const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
    pinca = { d0: distT(a, b), mx0: mx, my0: my, px: mx - r.left, py: my - r.top, s: 1, tx: 0, ty: 0 };
    cont.classList.add('pinca'); cont.style.transformOrigin = `${pinca.px}px ${pinca.py}px`;
  }, { passive: false });
  mesa.addEventListener('touchmove', (e) => {
    if (!pinca || e.touches.length !== 2) return;
    e.preventDefault();
    const [a, b] = e.touches, z = Math.max(0.5, Math.min(3, st.zoom * distT(a, b) / pinca.d0));
    pinca.s = z / st.zoom; pinca.tx = (a.clientX + b.clientX) / 2 - pinca.mx0; pinca.ty = (a.clientY + b.clientY) / 2 - pinca.my0;
    cont.style.transform = `translate(${pinca.tx}px, ${pinca.ty}px) scale(${pinca.s})`;
  }, { passive: false });
  const fimPinca = (e) => {
    if (!e.touches.length) toques.clear();
    if (!pinca || e.touches.length >= 2) return;
    const p = pinca; pinca = null; cont.style.transform = ''; cont.classList.remove('pinca');
    aplicarZoom(st.zoom * p.s, p.mx0 + p.tx, p.my0 + p.ty, p.px, p.py);
  };
  mesa.addEventListener('touchend', fimPinca); mesa.addEventListener('touchcancel', fimPinca);
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  mesa.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault(); const r = cont.getBoundingClientRect();
    aplicarZoom(st.zoom * Math.exp(-e.deltaY / 300), e.clientX, e.clientY, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
}
function aplicarZoom(z, sx, sy, px, py) {
  const novo = Math.max(0.5, Math.min(3, Math.round(z * 100) / 100)), razao = novo / st.zoom;
  if (Math.abs(razao - 1) < 0.005) return;
  st.zoom = novo; montar();
  const r = $('#cd-paginas').getBoundingClientRect();
  scrollBy(r.left + px * razao - sx, r.top + py * razao - sy);
  salvar();
}
function zoomBotao(z) { const r = $('#cd-paginas').getBoundingClientRect(); aplicarZoom(z, innerWidth / 2, innerHeight / 2, innerWidth / 2 - r.left, innerHeight / 2 - r.top); }

/* ---------- desfazer e refazer ---------- */
function registrar(op) { desfazer.push(op); refazer.length = 0; botoesHist(); salvar(); }
function botoesHist() { $('#cd-desfazer').disabled = !desfazer.length; $('#cd-refazer').disabled = !refazer.length; }
function questaoDoId(id) {
  if (id.startsWith('r-')) return +id.slice(2);
  const n = +id.slice(4); if (n >= mapa.gabarito) return 'gab';
  return mapa.questoes.find((q) => q.paginas.includes(n))?.n || 1;
}
function aplicar(op, inverso) {
  const arr = (st.tracos[op.id] ||= []);
  if (op.t === 'add') { if (inverso) { const i = arr.lastIndexOf(op.traco); if (i >= 0) arr.splice(i, 1); } else arr.push(op.traco); }
  else if (inverso) [...op.itens].reverse().forEach(({ traco, idx }) => arr.splice(idx, 0, traco));
  else op.itens.forEach(({ traco }) => { const i = arr.indexOf(traco); if (i >= 0) arr.splice(i, 1); });
  const q = questaoDoId(op.id);
  if (q !== st.atual) { st.atual = q; montar(true); } else repintar(op.id); // desfazer mostra onde a mudança aconteceu
}
function voltar() { const op = desfazer.pop(); if (!op) return; aplicar(op, true); refazer.push(op); botoesHist(); salvar(); }
function avancar() { const op = refazer.pop(); if (!op) return; aplicar(op, false); desfazer.push(op); botoesHist(); salvar(); }

/* ---------- barra de ferramentas e painel do traço ---------- */
function montarBarra() {
  document.querySelectorAll('[data-ferramenta]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.ferramenta === st.ferramenta && b.dataset.ferramenta !== 'borracha') return alternarPainel();
    escolher(b.dataset.ferramenta);
  }));
  $('#cd-traco').addEventListener('click', alternarPainel);
  $('#cd-painel-ok').addEventListener('click', fecharPainel);
  $('#cd-esp').addEventListener('input', (e) => { const f = alvoTraco(); st.esp[f] = deControle(f, +e.target.value); atualizarTraco(); salvar(); });
  $('#cd-desfazer').addEventListener('click', voltar);
  $('#cd-refazer').addEventListener('click', avancar);
  $('#cd-mais').addEventListener('click', () => zoomBotao(st.zoom * 1.2));
  $('#cd-menos').addEventListener('click', () => zoomBotao(st.zoom / 1.2));
  $('#cd-ajustar').addEventListener('click', () => zoomBotao(1));
  $('#cd-papel').addEventListener('change', (e) => { st.papel = e.target.value; vistas.forEach((v) => { if (v.tipo === 'rasc') { v.escala = 0; renderizar(v); } }); salvar(); });
  $('#cd-formas').addEventListener('click', () => { st.formas = !st.formas; $('#cd-formas').setAttribute('aria-pressed', st.formas); salvar(); aviso(st.formas ? 'Formas ligadas: cada traço vira reta, retângulo, triângulo ou círculo' : 'Formas desligadas. Para uma forma, desenhe e segure no fim.', 2600); });
  $('#cd-dedo').addEventListener('click', () => { st.dedo = !st.dedo; aplicarDedo(); salvar(); aviso(st.dedo ? 'O dedo escreve. Dois dedos rolam e dão zoom.' : 'O dedo rola a página e a caneta escreve', 2600); });
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
    else if (k === 'p') escolher('caneta'); else if (k === 'm') escolher('marca'); else if (k === 'e') escolher('borracha'); else if (k === 'f') $('#cd-formas').click();
  });
  let t = 0, modo = paisagem(), larg = innerWidth;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (atual) return; if (paisagem() !== modo || Math.abs(innerWidth - larg) > 40) { modo = paisagem(); larg = innerWidth; montar(); } }, 220); });
  ligarPinca();
}
function aplicarDedo() { document.body.classList.toggle('dedo', st.dedo); $('#cd-dedo').setAttribute('aria-pressed', st.dedo); }
function alvoTraco() { return st.ferramenta === 'marca' ? 'marca' : 'caneta'; }
function escolher(f) {
  st.ferramenta = f; document.body.dataset.ferramenta = f;
  document.querySelectorAll('[data-ferramenta]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ferramenta === f));
  $('#cd-cores').hidden = $('#cd-traco-grupo').hidden = f === 'borracha';
  if (f === 'borracha') fecharPainel();
  montarCores($('#cd-cores'), false); atualizarTraco(); salvar();
}
function montarCores(cont, painel) {
  const f = alvoTraco(); cont.innerHTML = '';
  for (const [nome, c] of CORES[f]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cd-cor'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', nome); b.title = nome; b.style.setProperty('--c', c); b.innerHTML = '<span></span>';
    b.setAttribute('aria-checked', st.cor[f] === c);
    b.addEventListener('click', () => { st.cor[f] = c; atualizarTraco(); salvar(); });
    cont.append(b);
  }
  const propria = !CORES[f].some(([, c]) => c === st.cor[f]);
  if (painel || propria) {
    const l = document.createElement('label'); l.className = 'cd-outra'; l.title = 'Escolher outra cor';
    const inp = document.createElement('input'); inp.type = 'color'; inp.value = st.cor[f]; inp.setAttribute('aria-label', 'Outra cor');
    inp.addEventListener('input', () => { st.cor[f] = inp.value; atualizarTraco(); salvar(); });
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
  desenhaTraco(ctx, { ...t, s: t.s * k }, r);
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
    b.addEventListener('click', () => { st.estilo = k; atualizarTraco(); salvar(); });
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
    const lib = await import('/assets/vendor/pdf-lib.esm.min.js');
    const { PDFDocument, rgb, BlendMode, StandardFonts, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } = lib;
    const src = await PDFDocument.load(pdfBytes);
    const out = await PDFDocument.create();
    const fonte = await out.embedFont(StandardFonts.HelveticaBold);
    out.setTitle(`${$('#cd-titulo').textContent} · ${NOMES[lista]} resolvida`);
    out.setAuthor('MAT com JOÃO · matcomjoao.com'); out.setCreator('Caderno digital MAT MAT MAT!');
    const cor = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
    const papel = (page, area) => {
      const H = page.getHeight(), L = linhasPapel(st.papel, ...area), cl = cor(st.papel === 'quadriculado' ? COR_PAPEL.linha : COR_PAPEL.pauta);
      for (const [a, b, c, d] of L.linhas) page.drawLine({ start: { x: a, y: H - b }, end: { x: c, y: H - d }, thickness: 0.55, color: cl });
      for (const [x, y] of L.pontos) page.drawCircle({ x, y: H - y, size: 0.8, color: cor(COR_PAPEL.ponto) });
    };
    const tracos = (page, lista_, k, dx, dy, corte) => {
      const H = page.getHeight();
      if (corte) { const [cx0, cy0, cx1, cy1] = corte; page.pushOperators(pushGraphicsState(), rectangle(cx0, H - cy1, cx1 - cx0, cy1 - cy0), clip(), endPath()); }
      for (const t of lista_) {
        const d = caminho(contorno(t, k), dx, dy); if (!d) continue;
        page.drawSvgPath(d, { x: 0, y: H, color: cor(t.c), borderWidth: 0, ...(t.f === 'marca' ? { opacity: 0.38, blendMode: BlendMode.Multiply } : {}) });
      }
      if (corte) page.pushOperators(popGraphicsState());
    };
    for (let q = 1; q <= totalQ; q++) {
      const info = mapa.questoes[q - 1]; let ultima = null;
      for (const n of info.paginas) {
        const [page] = await out.copyPages(src, [n - 1]); out.addPage(page); ultima = { page, n };
        if (st.revelado[q]) marcasPdf(page, q, n, cor);
        tracos(page, st.tracos['pdf-' + n] || [], 1, 0, 0);
      }
      // rascunho: primeiro no espaço da própria página, depois em folhas de continuação
      const area = gradeA4(ultima.n); if (!area) continue;
      papel(ultima.page, area);
      const rasc = st.tracos['r-' + q] || []; if (!rasc.length) continue;
      const k = (area[2] - area[0]) / (RW - 20), alto = maxY('r-' + q) + 12; // a grade do rascunho vai de 10 a RW − 10
      let ini = 0, fatia = (area[3] - area[1]) / k, page = ultima.page, a = area, cont = 0;
      while (true) {
        tracos(page, rasc, k, a[0] - 10 * k, a[1] - ini * k, a);
        ini += fatia; if (ini >= alto) break;
        page = out.addPage(A4); cont++;
        page.drawText(`Questão ${q} · rascunho (continuação${cont > 1 ? ' ' + cont : ''})`, { x: MARGEM, y: A4[1] - 40, size: 10, font: fonte, color: cor('#4a27b7') });
        a = [MARGEM, 56, A4[0] - MARGEM, A4[1] - 48]; papel(page, a); fatia = (a[3] - a[1]) / k;
      }
    }
    if (st.gabarito) for (let n = mapa.gabarito; n <= pdf.numPages; n++) { const [page] = await out.copyPages(src, [n - 1]); out.addPage(page); tracos(page, st.tracos['pdf-' + n] || [], 1, 0, 0); }
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
function marcasPdf(page, q, n, cor) {
  const { info, letra, soma } = dadosResposta(q), H = page.getHeight(), W = page.getWidth();
  const marca = (x, y, ok) => {
    if (ok) {
      page.drawRectangle({ x: x - 5, y: H - y - 5, width: W - 40 - x, height: 17, color: cor(VERDE), opacity: 0.12, borderWidth: 0 });
      page.drawEllipse({ x: x + 6.5, y: H - y + 2.3, xScale: 8.6, yScale: 8.6, borderColor: cor(VERDE), borderWidth: 1.6 });
    }
  };
  if (letra && info.alternativas?.[letra]?.[0] === n) { const [, x, y] = info.alternativas[letra]; marca(x, y, true); }
  if (soma != null && info.proposicoes) for (const [cod, [pg, x, y]] of Object.entries(info.proposicoes)) if (pg === n && (soma & +cod)) marca(x, y, true);
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
  montarBarra(); escolher(st.ferramenta);
  fetch('/data/aulas.json').then((r) => r.json()).then((d) => { const l = acharAula(d, aulaId); if (l) { $('#cd-titulo').textContent = l.title || l.titulo; document.title = `${l.title || l.titulo} · ${NOMES[lista]} | Caderno`; } }).catch(() => {});
  try { mapa = await (await fetch(`/pdfs/caderno-${lista}-${aulaId}.json`)).json(); } catch { mapa = null; }
  if (!mapa?.pdf) { erro('O caderno desta lista ainda não foi publicado.'); return; }
  try {
    const dados = await (await fetch(`/data/listas/${aulaId}.json`)).json();
    const d = dados[lista] || {};
    respostas = lista === 'fixacao' ? (d.secoes || []).flatMap((s) => s.questoes) : d.questoes || [];
  } catch { respostas = []; }
  try {
    pdfBytes = new Uint8Array(await (await fetch(mapa.pdf)).arrayBuffer());
    pdf = await pdfjs.getDocument({ data: pdfBytes.slice() }).promise;
  } catch (e) { console.error(e); erro('Não consegui abrir a lista. Verifique a internet e recarregue a página.'); return; }
  for (let n = 1; n <= pdf.numPages; n++) { const vp = (await pdf.getPage(n)).getViewport({ scale: 1 }); tamanhos[n] = [vp.width, vp.height]; }
  totalQ = mapa.questoes.length;
  const salvo = await banco.ler(CHAVE);
  if (salvo?.v === 3 && salvo.pdf === mapa.pdf && salvo.numPaginas === pdf.numPages) st = { ...st, ...salvo };
  else if (salvo?.v === 3) aviso('A lista foi atualizada; começamos um caderno novo.', 3500);
  st.pdf = mapa.pdf; st.numPaginas = pdf.numPages;
  if (st.atual !== 'gab' && !(st.atual >= 1 && st.atual <= totalQ)) st.atual = 1;
  $('#cd-papel').value = st.papel; $('#cd-formas').setAttribute('aria-pressed', st.formas);
  escolher(st.ferramenta); aplicarDedo();
  $('#cd-nav').hidden = false;
  montar(true);
  $('#cd-exportar').disabled = false;
  pronto = true;
  try { if (!localStorage.getItem('caderno-dica-3')) { $('#cd-dica').hidden = false; $('#cd-dica-ok').addEventListener('click', () => { $('#cd-dica').hidden = true; try { localStorage.setItem('caderno-dica-3', '1'); } catch {} montar(); }); } } catch {}
  if (salvo?.salvoEm && salvo.pdf === mapa.pdf) aviso('Seu caderno foi recuperado deste aparelho', 2200);
}
function erro(msg) { $('#cd-paginas').innerHTML = `<p class="cd-erro">${msg}</p>`; $('#cd-sub').textContent = 'Caderno'; }

window.__caderno = { get estado() { return st; }, get vistas() { return vistas; }, get mapa() { return mapa; }, exportar, irPara, reconhecer };
iniciar();
