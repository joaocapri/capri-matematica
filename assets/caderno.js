/* Caderno digital do MAT MAT MAT!
   A tela toda é uma folha de rascunho sem fim. A questão fica impressa no canto da folha, e o aluno escreve
   em qualquer lugar, inclusive por cima do enunciado. O zoom e o arrasto valem só para a folha: a barra e a
   navegação ficam sempre do mesmo tamanho.
   Caneta (Apple Pencil, S Pen…) com estilos, formas perfeitas (desenhe e segure), marca-texto, borracha,
   conferência da resposta na própria questão e exportação da lista resolvida em PDF.
   Endereço: /caderno/?aula=4.14.1&lista=fixacao   (lista: fixacao | vestibular | aprofundamento)
   O PDF e o mapa das questões vêm de pdfs/caderno-<lista>-<aula>.pdf/.json (scripts/gerar_listas.py). */
import * as pdfjs from '/assets/vendor/pdf.min.mjs';
import { getStroke } from '/assets/vendor/perfect-freehand.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.mjs';

const A4 = [595.28, 841.89];
const PASSO = 14.17;          // 5 mm: quadriculado, pontilhado
const TOPO_Q = 50;            // onde começa a questão na página do PDF (abaixo do cabeçalho)
const CX = 40, CY = 40, CW = 540; // o cartão da questão na folha (unidades ≈ pontos de uma folha A4)
const ZMIN = 0.25, ZMAX = 6;
const PAPEL = '#fffefa';
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
const BORRACHA_PX = 11;
const VERDE = '#1c8f4e', VERMELHO = '#d8352b';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- parâmetros ---------- */
const qs = new URLSearchParams(location.search);
const aulaId = (qs.get('aula') || '').replace(/[^0-9a-z.]/gi, '');
const lista = NOMES[qs.get('lista')] ? qs.get('lista') : 'fixacao';
const CHAVE = `v4|${aulaId}|${lista}`;

/* ---------- estado ---------- */
let st = {
  v: 4, tracos: {}, vista: {}, gabarito: false, dedo: false, atual: 1, formas: false, enun: true,
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
const cacheForma = new WeakMap(); // traço → { caminho (Path2D em unidades da folha), caixa }
function formaDe(t) {
  let c = cacheForma.get(t);
  if (!c) {
    const out = contorno(t, 1);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of out) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    c = { path: out.length >= 3 ? new Path2D(caminho(out)) : null, caixa: [x0, y0, x1, y1] };
    cacheForma.set(t, c);
  }
  return c;
}
function caixaTraco(t) {
  const c = cacheForma.get(t); if (c) return c.caixa;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of t.p) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const m = t.s * 1.5; return [x0 - m, y0 - m, x1 + m, y1 + m];
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
    vs = vs.filter((v, i) => i === 0 || dist(v, vs[i - 1]) > 0.12 * diag); // junta vértices quase colados
    if (vs.length > 2 && dist(vs[0], vs[vs.length - 1]) < 0.12 * diag) vs.pop();
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.max(w / 2, 1), ry = Math.max(h / 2, 1);
    let errE = 0; for (const [x, y] of pts) errE += Math.abs(Math.hypot((x - cx) / rx, (y - cy) / ry) - 1); errE /= pts.length;
    const errP = vs.length >= 3 ? erroPoligono(pts, vs, true) / diag : 1;
    if ((vs.length === 3 || vs.length === 4) && errP < 0.045 && errP < errE * 0.6 + 0.02) {
      if (vs.length === 3) return { nome: 'Triângulo', pts: amostrar(vs, true) };
      const retos = vs.every((v, i) => { const u = vs[(i + 1) % 4], ang = Math.abs(Math.atan2(u[1] - v[1], u[0] - v[0]) * 180 / Math.PI) % 90; return ang < 12 || ang > 78; });
      if (retos) {
        const qx0 = Math.min(...vs.map((v) => v[0])), qx1 = Math.max(...vs.map((v) => v[0])), qy0 = Math.min(...vs.map((v) => v[1])), qy1 = Math.max(...vs.map((v) => v[1]));
        let ww = qx1 - qx0, hh = qy1 - qy0, nome = 'Retângulo';
        const ccx = (qx0 + qx1) / 2, ccy = (qy0 + qy1) / 2;
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
  const vs = rdp(pts, 0.06 * diag); // linha quebrada aberta (eixos, ângulos, setas simples)
  if (vs.length >= 3 && vs.length <= 4 && erroPoligono(pts, vs, false) / diag < 0.03) return { nome: 'Linha', pts: amostrar(vs, false) };
  return null;
}

/* ---------- papel ---------- */
const COR_PAPEL = { linha: '#dcd7ef', pauta: '#cbc5e4', ponto: '#b3acd8' };
const PAUTA = 22.7;

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
  }, 600);
}
let timerAviso = null;
function aviso(txt, ms = 1800) {
  const el = $('#cd-status'); el.textContent = txt; el.classList.add('on');
  clearTimeout(timerAviso); timerAviso = setTimeout(() => el.classList.remove('on'), ms);
}

/* ---------- o cartão da questão ---------- */
function recorte(n, q) { // região da página n que mostra a questão q (sem o cabeçalho e sem o espaço em branco)
  const [W] = tamanhos[n]; const pags = mapa.questoes[q - 1].paginas, ultima = n === pags[pags.length - 1];
  const y1 = ultima && mapa.rascunho[n] != null ? mapa.rascunho[n] - 2 : mapa.rascunhoFim;
  return [34, TOPO_Q, W - 34, Math.max(TOPO_Q + 40, y1)];
}
const layouts = {};
function layout(q) {
  if (layouts[q]) return layouts[q];
  let y = CY; const pecas = [];
  for (const n of mapa.questoes[q - 1].paginas) {
    const c = recorte(n, q), sc = CW / (c[2] - c[0]), h = (c[3] - c[1]) * sc;
    pecas.push({ n, c, sc, x: CX, y, w: CW, h }); y += h + 12;
  }
  return (layouts[q] = { pecas, x: CX, y: CY, w: CW, h: y - 12 - CY });
}
const tracosDe = (q) => st.tracos['q-' + q] || [];
const questaoFeita = (n) => tracosDe(n).length > 0;

/* ---------- conferir a resposta ---------- */
function dadosResposta(q) {
  const r = respostas[q - 1] || {}, info = mapa.questoes[q - 1];
  let letra = null, soma = null, partes = [];
  if (Array.isArray(r.opcoes) && Number.isInteger(r.correta)) letra = 'ABCDE'[r.correta];
  else if (/^[A-E]$/.test(String(r.resposta || '').trim()) && info.alternativas) letra = String(r.resposta).trim();
  if (r.tipo === 'somatoria') { soma = r.correta; partes = (r.codigos || []).filter((c) => soma & c); }
  return { r, info, letra, soma, partes };
}
function marcasMundo(q) { // a alternativa correta (ou as proposições), em unidades da folha
  const out = []; if (!st.revelado[q]) return out;
  const { info, letra, soma } = dadosResposta(q), L = layout(q);
  const add = (pg, x, y, ok, destaque) => {
    const p = L.pecas.find((u) => u.n === pg); if (!p) return;
    const X = (v) => p.x + (v - p.c[0]) * p.sc, Y = (v) => p.y + (v - p.c[1]) * p.sc;
    out.push({ ok, destaque, k: p.sc, faixa: [X(x - 5), Y(y - 12), (p.c[2] - 6 - (x - 5)) * p.sc, 17 * p.sc], anel: [X(x + 6.5), Y(y - 2.3), 8.6 * p.sc], sinal: [X(p.c[2] - 12), Y(y + 2)] });
  };
  if (letra && info.alternativas?.[letra]) { const [pg, x, y] = info.alternativas[letra]; add(pg, x, y, true, true); }
  if (soma != null && info.proposicoes) for (const [cod, [pg, x, y]] of Object.entries(info.proposicoes)) { const ok = (soma & +cod) !== 0; add(pg, x, y, ok, ok); }
  return out;
}
function abrirResp() {
  const q = st.atual; if (q === 'gab') return;
  st.revelado[q] = true; salvar(); preencherResp(q);
  $('#cd-resp').hidden = false; $('#cd-conferir').setAttribute('aria-expanded', 'true');
  pedirQuadro(); mostrarMarcas(q);
}
function fecharResp() { $('#cd-resp').hidden = true; $('#cd-conferir').setAttribute('aria-expanded', 'false'); }
function preencherResp(q) {
  const box = $('#cd-resp'), { r, letra, soma, partes } = dadosResposta(q);
  let topo;
  if (soma != null) topo = `<p class="cd-resp-certa">Soma <b>${soma}</b> <span>${partes.map((c) => String(c).padStart(2, '0')).join(' + ')}, marcadas em verde na questão</span></p>`;
  else if (letra) topo = `<p class="cd-resp-certa">Alternativa <b>${letra}</b> <span>marcada em verde na questão</span></p>`;
  else topo = `<p class="cd-resp-certa"><span>Resposta</span> ${r.resposta ? esc(r.resposta) : '—'}</p>`;
  const resol = (r.resolucao || []).map((l) => `<p>${esc(l)}</p>`).join('');
  box.innerHTML = `<div class="cd-resp-topo"><h2>Questão ${q}</h2><button type="button" id="cd-resp-x" aria-label="Fechar">×</button></div>` + topo +
    (resol ? `<div class="cd-resol"><h3>Resolução</h3>${resol}</div>` : '') +
    `<div class="cd-autoav" role="group" aria-label="Como foi?"><span>Como foi?</span>
      <button type="button" data-res="certo" aria-pressed="${st.resultado[q] === 'certo'}">✓ Acertei</button>
      <button type="button" data-res="errado" aria-pressed="${st.resultado[q] === 'errado'}">✗ Errei</button></div>
    <button type="button" class="cd-esconder" id="cd-esconder">Esconder a resposta da questão</button>`;
  $('#cd-resp-x').addEventListener('click', fecharResp);
  $('#cd-esconder').addEventListener('click', () => { delete st.revelado[q]; salvar(); fecharResp(); pedirQuadro(); });
  box.querySelectorAll('[data-res]').forEach((b) => b.addEventListener('click', () => {
    st.resultado[q] = st.resultado[q] === b.dataset.res ? undefined : b.dataset.res; if (!st.resultado[q]) delete st.resultado[q];
    salvar(); box.querySelectorAll('[data-res]').forEach((x) => x.setAttribute('aria-pressed', st.resultado[q] === x.dataset.res));
    if (st.resultado[q] === 'certo') aviso('Boa! Marcado como acerto', 1400);
  }));
  formulas(box);
}
function formulas(el) { // o MathJax pode ainda estar carregando quando a gaveta abre
  const vai = () => window.MathJax?.typesetPromise?.([el]).catch(() => {});
  if (window.MathJax?.typesetPromise) requestAnimationFrame(vai);
  else if (window.MathJax?.startup?.promise) window.MathJax.startup.promise.then(vai);
  else setTimeout(() => window.MathJax?.typesetPromise && vai(), 1500);
}
function mostrarMarcas(q) { // se a marca verde estiver fora da tela, leva a folha até ela
  const m = marcasMundo(q).find((x) => x.destaque); if (!m || !st.enun) return;
  const [x, y] = m.anel, sx = V.tx + x * V.z, sy = V.ty + y * V.z;
  const larg = innerWidth >= 900 && innerWidth > innerHeight ? vw - 410 : vw;
  const alt = innerWidth >= 900 && innerWidth > innerHeight ? vh : vh * 0.45;
  if (sx > 20 && sx < larg - 20 && sy > 20 && sy < alt - 20) return;
  animarPara({ z: V.z, tx: V.tx + limitar(sx, 60, larg - 60) - sx, ty: V.ty + limitar(sy, 60, alt - 60) - sy });
}

/* ---------- vista: zoom e posição da folha ---------- */
let tela, vivo, folha, vw = 0, vh = 0, R = 1;
let V = { tx: 0, ty: 0, z: 1 };
const deitado = () => vw > vh * 1.05 && vw >= 700;
function vistaAjustada(q) {
  const L = st.enun ? layout(q) : { x: CX, y: CY, w: CW };
  const z = deitado() ? limitar(0.42 * vw / (L.w + 28), 0.5, 1.6) : limitar((vw - 28) / (L.w + 28), 0.4, 1.6);
  const m = deitado() ? 18 : 14;
  return { z, tx: m - (L.x - 14) * z, ty: m - (L.y - 14) * z };
}
function prenderVista(v) {
  v.z = limitar(v.z, ZMIN, ZMAX);
  v.tx = limitar(v.tx, -8000 * v.z, 140 * v.z);
  v.ty = limitar(v.ty, -30000 * v.z, 140 * v.z);
  return v;
}
function aplicarVista(nova, guardar = true) {
  V = prenderVista({ ...nova }); pedirQuadro(); atualizarZoom();
  if (guardar && st.atual !== 'gab') { st.vista[st.atual] = { x: -V.tx / V.z, y: -V.ty / V.z, z: V.z }; salvar(); }
}
function vistaDaQuestao(q) {
  const s = st.vista[q];
  if (!s) return vistaAjustada(q);
  return prenderVista({ z: s.z, tx: -s.x * s.z, ty: -s.y * s.z });
}
function zoomEm(z, sx, sy, guardar = true) {
  z = limitar(z, ZMIN, ZMAX);
  const wx = (sx - V.tx) / V.z, wy = (sy - V.ty) / V.z;
  aplicarVista({ z, tx: sx - wx * z, ty: sy - wy * z }, guardar);
}
function atualizarZoom() {
  if (st.atual === 'gab' || !mapa) return;
  $('#cd-zoom').textContent = Math.round(V.z / vistaAjustada(st.atual).z * 100) + '%';
}
let anim = 0;
function animarPara(alvo, ms = 260) {
  cancelAnimationFrame(anim);
  const de = { ...V }, t0 = performance.now(), reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduz) { aplicarVista(alvo); return; }
  const passo = (t) => {
    const u = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - u, 3);
    // interpola o zoom em escala logarítmica e o ponto do mundo no canto, para não "dançar"
    const z = Math.exp(Math.log(de.z) + (Math.log(alvo.z) - Math.log(de.z)) * e);
    const wx = (-de.tx / de.z) + ((-alvo.tx / alvo.z) - (-de.tx / de.z)) * e, wy = (-de.ty / de.z) + ((-alvo.ty / alvo.z) - (-de.ty / de.z)) * e;
    aplicarVista({ z, tx: -wx * z, ty: -wy * z }, u === 1);
    if (u < 1) anim = requestAnimationFrame(passo);
  };
  anim = requestAnimationFrame(passo);
}
function ajustar() { if (st.atual === 'gab') return; delete st.vista[st.atual]; animarPara(vistaAjustada(st.atual)); setTimeout(() => { delete st.vista[st.atual]; salvar(); }, 300); }

/* ---------- desenho da folha ---------- */
let quadro = 0;
function pedirQuadro() { if (!quadro) quadro = requestAnimationFrame(desenhar); }
function medir() {
  const r = folha.getBoundingClientRect();
  R = Math.min(window.devicePixelRatio || 1, 2.5);
  vw = r.width; vh = r.height;
  for (const c of [tela, vivo]) { c.width = Math.round(vw * R); c.height = Math.round(vh * R); }
}
function desenhar() {
  quadro = 0;
  const ctx = tela.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = PAPEL; ctx.fillRect(0, 0, tela.width, tela.height);
  if (!mapa || st.atual === 'gab') return;
  const q = st.atual, { tx, ty, z } = V, k = R * z;
  const w0 = -tx / z, h0 = -ty / z, w1 = (vw - tx) / z, h1 = (vh - ty) / z;
  grade(ctx, w0, h0, w1, h1);
  ctx.setTransform(k, 0, 0, k, R * tx, R * ty);
  if (st.enun) cartao(ctx, q, [w0, h0, w1, h1]);
  for (const t of tracosDe(q)) {
    const f = formaDe(t), [a, b, c, d] = f.caixa;
    if (!f.path || c < w0 || a > w1 || d < h0 || b > h1) continue;
    ctx.fillStyle = t.c;
    if (t.f === 'marca') { ctx.globalAlpha = 0.38; ctx.globalCompositeOperation = 'multiply'; ctx.fill(f.path); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    else ctx.fill(f.path);
  }
}
function grade(ctx, w0, h0, w1, h1) { // linhas desenhadas em pixels inteiros, para ficarem nítidas em qualquer zoom
  const { tx, ty, z } = V, X = (x) => Math.round(R * (tx + x * z)) + 0.5, Y = (y) => Math.round(R * (ty + y * z)) + 0.5;
  const W = tela.width, H = tela.height;
  if (st.papel === 'liso') return;
  ctx.save();
  if (st.papel === 'pontilhado') {
    const m = PASSO * z < 7 ? 2 : 1, p = PASSO * m, r = Math.max(1, 0.8 * R * Math.min(z, 1.4));
    ctx.fillStyle = COR_PAPEL.ponto;
    for (let j = Math.ceil(h0 / p); j * p <= h1; j++) for (let i = Math.ceil(w0 / p); i * p <= w1; i++) ctx.fillRect(X(i * p + PASSO / 2) - r, Y(j * p + PASSO / 2) - r, 2 * r, 2 * r);
  } else {
    ctx.lineWidth = Math.max(1, Math.round(0.55 * R * Math.min(z, 1.6)));
    ctx.beginPath();
    if (st.papel === 'quadriculado') {
      const m = PASSO * z < 6 ? 2 : 1, p = PASSO * m;
      ctx.strokeStyle = COR_PAPEL.linha;
      for (let i = Math.ceil(w0 / p); i * p <= w1; i++) { const x = X(i * p); ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let j = Math.ceil(h0 / p); j * p <= h1; j++) { const y = Y(j * p); ctx.moveTo(0, y); ctx.lineTo(W, y); }
    } else {
      ctx.strokeStyle = COR_PAPEL.pauta;
      for (let j = Math.ceil(h0 / PAUTA); j * PAUTA <= h1; j++) { const y = Y(j * PAUTA); ctx.moveTo(0, y); ctx.lineTo(W, y); }
    }
    ctx.stroke();
  }
  ctx.restore();
}
function retArred(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function cartao(ctx, q, vis) {
  const L = layout(q);
  // o papel em volta da questão fica sem linhas, como se ela estivesse impressa na folha
  ctx.fillStyle = PAPEL; retArred(ctx, L.x - 14, L.y - 14, L.w + 28, L.h + 28, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(74,39,183,.10)'; ctx.lineWidth = 1 / V.z; ctx.stroke();
  for (const p of L.pecas) {
    const ent = bitmaps.get(q + '|' + p.n);
    if (ent?.canvas) {
      const [a, b, c, d] = ent.reg;
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.beginPath(); ctx.rect(p.x, p.y, p.w, p.h); ctx.clip();
      ctx.drawImage(ent.canvas, p.x + (a - p.c[0]) * p.sc, p.y + (b - p.c[1]) * p.sc, ent.canvas.width / ent.s * p.sc, ent.canvas.height / ent.s * p.sc);
      ctx.restore();
    }
    pedirBitmap(q, p, vis, !ent?.canvas);
  }
  for (const m of marcasMundo(q)) {
    if (m.destaque) {
      ctx.fillStyle = 'rgba(28,143,78,.13)'; retArred(ctx, ...m.faixa, 5 * m.k); ctx.fill();
      ctx.strokeStyle = VERDE; ctx.lineWidth = 1.8 * m.k; ctx.beginPath(); ctx.arc(m.anel[0], m.anel[1], m.anel[2], 0, 6.2832); ctx.stroke();
    }
    ctx.fillStyle = m.ok ? VERDE : VERMELHO; ctx.font = `700 ${13 * m.k}px system-ui,sans-serif`; ctx.textAlign = 'right';
    ctx.fillText(m.ok ? '✓' : '✗', m.sinal[0], m.sinal[1]);
  }
}

/* o enunciado é renderizado pelo pdf.js na resolução do zoom atual, só a parte visível quando o zoom é grande */
const bitmaps = new Map(), timersBitmap = new Map();
function regiaoAlvo(p, vis) {
  const s = V.z * R * p.sc, [c0, c1, c2, c3] = p.c;
  if ((c2 - c0) * (c3 - c1) * s * s <= 9e6) return { s, reg: p.c };
  const ptX = (x) => c0 + (x - p.x) / p.sc, ptY = (y) => c1 + (y - p.y) / p.sc;
  let a = ptX(vis[0]), b = ptY(vis[1]), c = ptX(vis[2]), d = ptY(vis[3]);
  const mx = (c - a) * 0.3, my = (d - b) * 0.3;
  a = Math.max(c0, a - mx); b = Math.max(c1, b - my); c = Math.min(c2, c + mx); d = Math.min(c3, d + my);
  if (c <= a || d <= b) return null;
  return { s, reg: [a, b, c, d] };
}
function pedirBitmap(q, p, vis, ja) {
  const chave = q + '|' + p.n, ent = bitmaps.get(chave), alvo = regiaoAlvo(p, vis);
  if (!alvo) return;
  if (ent?.canvas && !ent.task) {
    const r = ent.s / alvo.s, [a, b, c, d] = ent.reg, [e, f, g, h] = alvo.reg;
    const cobre = a <= e + 0.5 && b <= f + 0.5 && c >= g - 0.5 && d >= h - 0.5;
    if (cobre && r > 0.8 && r < 1.6) return;
  }
  if (ent?.pedido && Math.abs(ent.pedido / alvo.s - 1) < 0.05) return;
  clearTimeout(timersBitmap.get(chave));
  timersBitmap.set(chave, setTimeout(() => renderBitmap(q, p, chave), ja ? 0 : 160));
}
async function renderBitmap(q, p, chave) {
  if (st.atual !== q) return;
  const vis = [-V.tx / V.z, -V.ty / V.z, (vw - V.tx) / V.z, (vh - V.ty) / V.z];
  const alvo = regiaoAlvo(p, vis); if (!alvo) return;
  const ent = bitmaps.get(chave) || {}; bitmaps.set(chave, ent);
  ent.task?.cancel?.(); ent.pedido = alvo.s;
  const { s, reg } = alvo, [a, b, c, d] = reg;
  const cv = document.createElement('canvas'); cv.width = Math.ceil((c - a) * s); cv.height = Math.ceil((d - b) * s);
  const page = await pdf.getPage(p.n);
  if (ent.pedido !== s) return; // outro pedido chegou enquanto a página carregava
  const task = page.render({ canvasContext: cv.getContext('2d'), viewport: page.getViewport({ scale: s, offsetX: -a * s, offsetY: -b * s }) });
  ent.task = task;
  try {
    await task.promise;
    if (ent.task !== task) return;
    Object.assign(ent, { canvas: cv, s, reg, task: null, pedido: 0 });
    for (const [k, v] of bitmaps) if (!k.startsWith(st.atual + '|') && k !== chave) { v.task?.cancel?.(); bitmaps.delete(k); } // libera as outras questões
    pedirQuadro();
  } catch (e) { if (e?.name !== 'RenderingCancelledException') console.warn(e); if (ent.task === task) { ent.task = null; ent.pedido = 0; } }
}

/* ---------- escrita e gestos ---------- */
let atual = null;      // traço ou borracha em andamento
let gesto = null;      // arrasto ou pinça
let espaco = false;    // barra de espaço segurada: o mouse arrasta a folha
const toques = new Map();
function local(e) { const r = tela.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
const mundo = (p) => [Math.round((p.x - V.tx) / V.z * 100) / 100, Math.round((p.y - V.ty) / V.z * 100) / 100];
const pressao = (e) => Math.round((e.pointerType === 'pen' ? Math.max(0.05, e.pressure || 0.5) : 0.5) * 1000) / 1000;

function ligarEntrada() {
  tela.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  tela.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  tela.addEventListener('contextmenu', (e) => e.preventDefault());
  tela.addEventListener('pointerdown', (e) => {
    if (st.atual === 'gab') return;
    fecharPops(); pararInercia(); cancelAnimationFrame(anim);
    const p = local(e);
    if (e.pointerType === 'touch') {
      if (e.isPrimary) toques.clear(); // descarta dedos que o sistema esqueceu de soltar
      toques.set(e.pointerId, { ...p, x0: p.x, y0: p.y, t0: performance.now() });
      try { tela.setPointerCapture(e.pointerId); } catch {}
      if (atual?.pen) return; // a palma da mão não atrapalha quem escreve com a caneta
      if (toques.size === 1) { if (st.dedo) iniciarTraco(e, p); else iniciarArrasto(e.pointerId, p); return; }
      if (atual) descartarTraco();
      iniciarPinca(); return;
    }
    if (e.pointerType === 'mouse' && (e.button === 1 || e.button === 2 || (e.button === 0 && espaco))) {
      e.preventDefault(); tela.setPointerCapture(e.pointerId); iniciarArrasto(e.pointerId, p); return;
    }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (atual) return;
    if (gesto) { gesto = null; document.body.classList.remove('arrastando'); } // a caneta tem prioridade sobre o arrasto
    e.preventDefault(); tela.setPointerCapture(e.pointerId);
    iniciarTraco(e, p);
  });
  tela.addEventListener('pointermove', (e) => {
    const p = local(e);
    if (e.pointerType === 'touch' && toques.has(e.pointerId)) Object.assign(toques.get(e.pointerId), p);
    if (gesto?.tipo === 'arrasto' && gesto.id === e.pointerId) { moverArrasto(p); return; }
    if (gesto?.tipo === 'pinca' && gesto.ids.includes(e.pointerId)) { moverPinca(); return; }
    if (!atual || e.pointerId !== atual.pid) return;
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    const lista_ = evs.length ? evs : [e];
    if (atual.traco) {
      if (atual.travado) return; // forma já reconhecida: fica como está até soltar
      for (const c of lista_) { const w = mundo(local(c)); atual.traco.p.push([w[0], w[1], pressao(c)]); }
      const u = atual.traco.p[atual.traco.p.length - 1];
      if (dist(u, atual.ancora) > 3 / V.z) { atual.ancora = u; armarForma(); }
    } else { for (const c of lista_) apagar(mundo(local(c))); atual.cursor = p; }
    pedirVivo();
  });
  const fim = (e) => {
    if (e.pointerType === 'touch') {
      const tq = toques.get(e.pointerId); toques.delete(e.pointerId);
      if (gesto?.tipo === 'pinca' && gesto.ids.includes(e.pointerId)) { terminarPinca(); }
      else if (gesto?.tipo === 'arrasto' && gesto.id === e.pointerId) terminarArrasto(e.type === 'pointerup');
      if (!tq) return;
    } else if (gesto?.tipo === 'arrasto' && gesto.id === e.pointerId) { terminarArrasto(false); return; }
    if (atual && e.pointerId === atual.pid) concluirTraco(e.type === 'pointercancel');
  };
  tela.addEventListener('pointerup', fim);
  tela.addEventListener('pointercancel', fim);
  tela.addEventListener('lostpointercapture', (e) => { if (e.pointerType === 'touch') toques.delete(e.pointerId); });

  tela.addEventListener('wheel', (e) => {
    e.preventDefault(); pararInercia();
    const p = local(e), f = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
    if (e.ctrlKey || e.metaKey) { zoomEm(V.z * Math.exp(-limitar(e.deltaY * f, -120, 120) / 450), p.x, p.y); return; }
    let dx = e.deltaX * f, dy = e.deltaY * f; if (e.shiftKey && !dx) { dx = dy; dy = 0; }
    aplicarVista({ ...V, tx: V.tx - dx, ty: V.ty - dy });
  }, { passive: false });
  // Safari no Mac: pinça do trackpad
  let gz = null;
  document.addEventListener('gesturestart', (e) => { e.preventDefault(); if (!toques.size && st.atual !== 'gab') gz = { z: V.z }; });
  document.addEventListener('gesturechange', (e) => { e.preventDefault(); if (!gz || toques.size) return; const p = local(e); zoomEm(gz.z * e.scale, p.x, p.y); });
  document.addEventListener('gestureend', (e) => { e.preventDefault(); gz = null; });
}

function iniciarTraco(e, p) {
  const w = mundo(p), pen = e.pointerType === 'pen';
  if (st.ferramenta === 'borracha') { atual = { pid: e.pointerId, pen, apagados: [], q: st.atual, cursor: p }; apagar(w); pedirVivo(); return; }
  const f = st.ferramenta;
  atual = { pid: e.pointerId, pen, q: st.atual, ancora: [w[0], w[1]], timer: 0,
    traco: { f, e: f === 'marca' ? 'marca' : st.estilo, c: st.cor[f], s: st.esp[f], pen, p: [[w[0], w[1], pressao(e)]] } };
  armarForma(); pedirVivo();
}
function descartarTraco() {
  if (!atual) return;
  clearTimeout(atual.timer);
  if (atual.apagados?.length) { const arr = (st.tracos['q-' + atual.q] ||= []); [...atual.apagados].reverse().forEach(({ traco, idx }) => arr.splice(idx, 0, traco)); pedirQuadro(); }
  atual = null; limparVivo();
}
function concluirTraco(cancelado) {
  const a = atual; atual = null; clearTimeout(a.timer); limparVivo();
  const id = 'q-' + a.q;
  if (a.traco) {
    if (cancelado && a.traco.p.length < 3) return;
    if (!a.travado && st.formas && a.traco.p.length > 5) { const fm = reconhecer(a.traco.p, a.traco.f === 'marca'); if (fm) { a.traco.p = fm.pts; a.traco.forma = fm.nome; } }
    if (a.traco.p.length === 1) { const [x, y, p] = a.traco.p[0]; a.traco.p.push([x + 0.01, y + 0.01, p]); }
    (st.tracos[id] ||= []).push(a.traco);
    registrar({ t: 'add', q: a.q, traco: a.traco });
  } else if (a.apagados.length) registrar({ t: 'del', q: a.q, itens: a.apagados });
  pedirQuadro();
}
function armarForma() { // desenhou e segurou parado no fim: vira forma perfeita
  clearTimeout(atual.timer);
  atual.timer = setTimeout(() => {
    const a = atual; if (!a?.traco || a.travado || a.traco.p.length < 6) return;
    const fm = reconhecer(a.traco.p, a.traco.f === 'marca');
    if (!fm) return;
    a.traco.p = fm.pts; a.traco.forma = fm.nome; a.travado = true; pedirVivo();
    aviso(fm.nome, 900);
    navigator.vibrate?.(10);
  }, 520);
}
function apagar([x, y]) {
  const arr = st.tracos['q-' + atual.q]; if (!arr?.length) return;
  const raio = BORRACHA_PX / V.z;
  let mudou = false;
  for (let i = arr.length - 1; i >= 0; i--) {
    const t = arr[i], lim = raio + t.s / 2 * (t.e === 'pincel' ? 2.3 : 1), [a, b, c, d] = caixaTraco(t);
    if (x < a - lim || x > c + lim || y < b - lim || y > d + lim) continue;
    let acertou = false;
    for (let j = 0; j < t.p.length && !acertou; j++) { const u = t.p[j], v = t.p[j + 1] || u; if (distSeg(x, y, u[0], u[1], v[0], v[1]) <= lim) acertou = true; }
    if (acertou) { atual.apagados.push({ traco: t, idx: i }); arr.splice(i, 1); mudou = true; }
  }
  if (mudou) pedirQuadro();
}
let quadroVivo = 0;
function pedirVivo() { if (!quadroVivo) quadroVivo = requestAnimationFrame(pintarVivo); }
function limparVivo() { const c = vivo.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, vivo.width, vivo.height); }
function pintarVivo() {
  quadroVivo = 0; limparVivo();
  if (!atual) return;
  const ctx = vivo.getContext('2d');
  if (atual.traco) { ctx.setTransform(R * V.z, 0, 0, R * V.z, R * V.tx, R * V.ty); desenhaTraco(ctx, atual.traco, 1); return; }
  if (atual.cursor) { // círculo da borracha
    ctx.setTransform(R, 0, 0, R, 0, 0); ctx.strokeStyle = 'rgba(33,25,70,.45)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(atual.cursor.x, atual.cursor.y, BORRACHA_PX, 0, 6.2832); ctx.stroke();
  }
}

/* arrasto com um dedo (com inércia), pinça com dois; tocar com dois dedos desfaz */
let inercia = 0;
function pararInercia() { cancelAnimationFrame(inercia); inercia = 0; }
function iniciarArrasto(id, p) { gesto = { tipo: 'arrasto', id, ult: p, hist: [{ ...p, t: performance.now() }] }; document.body.classList.add('arrastando'); }
function moverArrasto(p) {
  const g = gesto, dx = p.x - g.ult.x, dy = p.y - g.ult.y; g.ult = p;
  const t = performance.now(); g.hist.push({ ...p, t }); while (g.hist.length > 2 && t - g.hist[0].t > 90) g.hist.shift();
  aplicarVista({ ...V, tx: V.tx + dx, ty: V.ty + dy }, false);
}
function terminarArrasto(comInercia) {
  const g = gesto; gesto = null; document.body.classList.remove('arrastando');
  aplicarVista(V);
  if (!comInercia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = g.hist[0], b = g.hist[g.hist.length - 1], dt = b.t - a.t;
  if (dt <= 0 || performance.now() - b.t > 60) return;
  let vx = (b.x - a.x) / dt * 16, vy = (b.y - a.y) / dt * 16;
  if (Math.hypot(vx, vy) < 2) return;
  const passo = () => {
    vx *= 0.93; vy *= 0.93;
    aplicarVista({ ...V, tx: V.tx + vx, ty: V.ty + vy }, false);
    if (Math.hypot(vx, vy) > 0.4) inercia = requestAnimationFrame(passo); else { inercia = 0; aplicarVista(V); }
  };
  inercia = requestAnimationFrame(passo);
}
function iniciarPinca() {
  if (gesto?.tipo === 'arrasto') document.body.classList.remove('arrastando');
  const ids = [...toques.keys()].slice(-2), [a, b] = ids.map((i) => toques.get(i));
  gesto = { tipo: 'pinca', ids, d0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), m0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v0: { ...V }, t0: performance.now(), mexeu: false };
}
function moverPinca() {
  const g = gesto, a = toques.get(g.ids[0]), b = toques.get(g.ids[1]); if (!a || !b) return;
  const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (Math.abs(d - g.d0) > 10 || Math.hypot(m.x - g.m0.x, m.y - g.m0.y) > 10) g.mexeu = true;
  const z = limitar(g.v0.z * d / g.d0, ZMIN, ZMAX), wx = (g.m0.x - g.v0.tx) / g.v0.z, wy = (g.m0.y - g.v0.ty) / g.v0.z;
  aplicarVista({ z, tx: m.x - wx * z, ty: m.y - wy * z }, false);
}
function terminarPinca() {
  const g = gesto; gesto = null;
  if (!g.mexeu && performance.now() - g.t0 < 300) { voltar(); aviso('Desfeito', 800); }
  aplicarVista(V);
  // sobrou um dedo: ele continua arrastando (no modo dedo, espera soltar tudo)
  if (!st.dedo && toques.size === 1) { const [id, p] = [...toques][0]; iniciarArrasto(id, { x: p.x, y: p.y }); }
}

/* ---------- navegação ---------- */
function irPara(alvo) {
  if (alvo !== 'gab') alvo = Math.max(1, Math.min(totalQ, alvo));
  if (alvo === st.atual) return;
  descartarTraco(); gesto = null; pararInercia(); cancelAnimationFrame(anim);
  st.atual = alvo; fecharPops(); fecharResp(); mostrar(); salvar();
}
function mostrar() {
  const gab = st.atual === 'gab';
  $('#cd-gab').hidden = !gab; document.body.classList.toggle('no-gab', gab);
  if (gab) montarGabarito();
  else { V = vistaDaQuestao(st.atual); atualizarZoom(); }
  pedirQuadro(); atualizarNav();
}
function atualizarNav() {
  const a = st.atual, gab = a === 'gab';
  $('#cd-qnum').textContent = gab ? 'Fim' : a;
  const q = gab ? null : mapa.questoes[a - 1];
  $('#cd-qinfo').textContent = gab ? 'e gabarito' : `de ${totalQ}${q?.nivel ? ' · ' + q.nivel : ''}`;
  $('#cd-qbtn').setAttribute('aria-label', gab ? 'Fim da lista. Escolher questão' : `Questão ${a} de ${totalQ}. Escolher questão`);
  $('#cd-ant').disabled = a === 1;
  $('#cd-prox').disabled = gab;
  $('#cd-prox').setAttribute('aria-label', a === totalQ ? 'Concluir a lista' : 'Próxima questão');
  $('#cd-conferir').hidden = gab;
}
function anterior() { irPara(st.atual === 'gab' ? totalQ : st.atual - 1); }
function proxima() { if (st.atual !== 'gab') irPara(st.atual === totalQ ? 'gab' : st.atual + 1); }
function abrirMapa() {
  const g = $('#cd-mapa-grade'); g.innerHTML = '';
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
  $('#cd-mapa').hidden = false; $('#cd-qbtn').setAttribute('aria-expanded', 'true');
}
function fecharMapa() { $('#cd-mapa').hidden = true; $('#cd-qbtn').setAttribute('aria-expanded', 'false'); }
let tarefasGab = [];
async function montarGabarito() {
  tarefasGab.forEach((t) => t.cancel?.()); tarefasGab = [];
  const box = $('#cd-gab'); box.innerHTML = '';
  const certo = Object.values(st.resultado).filter((r) => r === 'certo').length, errado = Object.values(st.resultado).filter((r) => r === 'errado').length;
  const feitas = Array.from({ length: totalQ }, (_, i) => i + 1).filter(questaoFeita).length;
  const topo = document.createElement('section'); topo.className = 'cd-gab-topo';
  const placar = certo + errado ? `<p class="cd-placar"><b>${certo}</b> ${certo === 1 ? 'acerto' : 'acertos'} e <b>${errado}</b> ${errado === 1 ? 'erro' : 'erros'} nas questões que você conferiu.</p>` : '';
  topo.innerHTML = `<b>Fim da lista</b>${placar}<p>Você escreveu em ${feitas} de ${totalQ} questões. Em cada questão, o botão <b>Conferir</b> mostra a resposta e a resolução.</p>
    <button type="button">${st.gabarito ? 'Esconder o gabarito completo' : 'Ver o gabarito completo'}</button>`;
  topo.querySelector('button').addEventListener('click', () => { st.gabarito = !st.gabarito; salvar(); montarGabarito(); });
  box.append(topo); box.scrollTop = 0;
  if (!st.gabarito) return;
  const larg = Math.min(box.clientWidth - 24, 860);
  for (let n = mapa.gabarito; n <= pdf.numPages; n++) {
    const [W, H] = tamanhos[n], s = larg / W * Math.min(window.devicePixelRatio || 1, 2);
    const cv = document.createElement('canvas'); cv.width = Math.round(W * s); cv.height = Math.round(H * s);
    cv.style.width = larg + 'px'; cv.setAttribute('aria-label', 'Gabarito, página ' + (n - mapa.gabarito + 1)); box.append(cv);
    try { const page = await pdf.getPage(n); const t = page.render({ canvasContext: cv.getContext('2d'), viewport: page.getViewport({ scale: s }) }); tarefasGab.push(t); await t.promise; }
    catch (e) { if (e?.name !== 'RenderingCancelledException') console.warn(e); return; }
  }
}

/* ---------- desfazer e refazer ---------- */
function registrar(op) { desfazer.push(op); refazer.length = 0; botoesHist(); salvar(); }
function botoesHist() { $('#cd-desfazer').disabled = !desfazer.length; $('#cd-refazer').disabled = !refazer.length; }
function aplicar(op, inverso) {
  const arr = (st.tracos['q-' + op.q] ||= []);
  if (op.t === 'add') { if (inverso) { const i = arr.lastIndexOf(op.traco); if (i >= 0) arr.splice(i, 1); } else arr.push(op.traco); }
  else if (inverso) [...op.itens].reverse().forEach(({ traco, idx }) => arr.splice(idx, 0, traco));
  else op.itens.forEach(({ traco }) => { const i = arr.indexOf(traco); if (i >= 0) arr.splice(i, 1); });
  if (op.q !== st.atual) irPara(op.q); else pedirQuadro(); // desfazer mostra onde a mudança aconteceu
}
function voltar() { if (atual) return; const op = desfazer.pop(); if (!op) return; aplicar(op, true); refazer.push(op); botoesHist(); salvar(); }
function avancar() { if (atual) return; const op = refazer.pop(); if (!op) return; aplicar(op, false); desfazer.push(op); botoesHist(); salvar(); }

/* ---------- barra de ferramentas e janelinhas ---------- */
function montarBarra() {
  document.querySelectorAll('button[data-ferramenta]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.ferramenta === st.ferramenta && b.dataset.ferramenta !== 'borracha') return alternarPainel();
    escolher(b.dataset.ferramenta);
  }));
  $('#cd-traco').addEventListener('click', alternarPainel);
  $('#cd-esp').addEventListener('input', (e) => { const f = alvoTraco(); st.esp[f] = deControle(f, +e.target.value); atualizarTraco(); salvar(); });
  $('#cd-desfazer').addEventListener('click', voltar);
  $('#cd-refazer').addEventListener('click', avancar);
  $('#cd-mais').addEventListener('click', () => animarPara(zoomCentro(V.z * 1.25), 180));
  $('#cd-menos').addEventListener('click', () => animarPara(zoomCentro(V.z / 1.25), 180));
  $('#cd-ajustar').addEventListener('click', ajustar);
  $('#cd-papel').addEventListener('change', (e) => { st.papel = e.target.value; pedirQuadro(); salvar(); });
  $('#cd-dedo').addEventListener('change', (e) => { st.dedo = e.target.checked; salvar(); aviso(st.dedo ? 'O dedo escreve. Dois dedos movem a folha e dão zoom.' : 'O dedo move a folha e a caneta escreve', 2600); });
  $('#cd-enun').addEventListener('change', (e) => { st.enun = e.target.checked; salvar(); pedirQuadro(); });
  $('#cd-formas').addEventListener('click', () => { st.formas = !st.formas; $('#cd-formas').setAttribute('aria-pressed', st.formas); salvar(); aviso(st.formas ? 'Formas ligadas: cada traço vira reta, retângulo, triângulo ou círculo' : 'Formas desligadas. Para uma forma, desenhe e segure no fim.', 2600); });
  $('#cd-mais-btn').addEventListener('click', () => { const m = $('#cd-menu'), abrir = m.hidden; fecharPops(); m.hidden = !abrir; $('#cd-mais-btn').setAttribute('aria-expanded', abrir); });
  $('#cd-exportar').addEventListener('click', exportar);
  $('#cd-ant').addEventListener('click', anterior);
  $('#cd-prox').addEventListener('click', proxima);
  $('#cd-conferir').addEventListener('click', () => ($('#cd-resp').hidden ? abrirResp() : fecharResp()));
  $('#cd-qbtn').addEventListener('click', () => { const abrir = $('#cd-mapa').hidden; fecharPops(); if (abrir) abrirMapa(); });
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('#cd-painel,#cd-traco,[data-ferramenta]')) fecharPainel();
    if (!e.target.closest('#cd-mapa,#cd-qbtn')) fecharMapa();
    if (!e.target.closest('#cd-menu,#cd-mais-btn')) fecharMenu();
  });
  addEventListener('keydown', (e) => {
    if (e.key === ' ' && !e.target.closest('button,select,input,textarea')) { espaco = true; e.preventDefault(); }
    if (e.target.closest('select,input,textarea')) return;
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? avancar() : voltar(); }
    else if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); avancar(); }
    else if ((e.ctrlKey || e.metaKey) && (k === '=' || k === '+')) { e.preventDefault(); animarPara(zoomCentro(V.z * 1.25), 180); }
    else if ((e.ctrlKey || e.metaKey) && k === '-') { e.preventDefault(); animarPara(zoomCentro(V.z / 1.25), 180); }
    else if ((e.ctrlKey || e.metaKey) && k === '0') { e.preventDefault(); ajustar(); }
    else if (e.ctrlKey || e.metaKey || e.altKey) return;
    else if (k === 'arrowright' || k === 'pagedown') { e.preventDefault(); proxima(); }
    else if (k === 'arrowleft' || k === 'pageup') { e.preventDefault(); anterior(); }
    else if (k === 'escape') { fecharPops(); fecharResp(); }
    else if (k === 'p') escolher('caneta'); else if (k === 'm') escolher('marca'); else if (k === 'e') escolher('borracha'); else if (k === 'f') $('#cd-formas').click();
    else if (k === '+' || k === '=') animarPara(zoomCentro(V.z * 1.25), 180);
    else if (k === '-') animarPara(zoomCentro(V.z / 1.25), 180);
    else if (k === '0') ajustar();
  });
  addEventListener('keyup', (e) => { if (e.key === ' ') espaco = false; });
  addEventListener('blur', () => { espaco = false; });
}
function zoomCentro(z) {
  z = limitar(z, ZMIN, ZMAX); const sx = vw / 2, sy = vh / 2, wx = (sx - V.tx) / V.z, wy = (sy - V.ty) / V.z;
  return { z, tx: sx - wx * z, ty: sy - wy * z };
}
function fecharMenu() { $('#cd-menu').hidden = true; $('#cd-mais-btn').setAttribute('aria-expanded', 'false'); }
function fecharPops() { fecharPainel(); fecharMapa(); fecharMenu(); }
function alvoTraco() { return st.ferramenta === 'marca' ? 'marca' : 'caneta'; }
function escolher(f) {
  st.ferramenta = f; document.body.dataset.ferramenta = f;
  document.querySelectorAll('button[data-ferramenta]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ferramenta === f));
  if (f === 'borracha') fecharPainel();
  atualizarTraco(); salvar();
}
function montarCores(cont) {
  const f = alvoTraco(); cont.innerHTML = '';
  for (const [nome, c] of CORES[f]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cd-cor'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', nome); b.title = nome; b.style.setProperty('--c', c); b.innerHTML = '<span></span>';
    b.setAttribute('aria-checked', st.cor[f] === c);
    b.addEventListener('click', () => { st.cor[f] = c; atualizarTraco(); salvar(); });
    cont.append(b);
  }
  const propria = !CORES[f].some(([, c]) => c === st.cor[f]);
  const l = document.createElement('label'); l.className = 'cd-outra'; l.title = 'Escolher outra cor';
  const inp = document.createElement('input'); inp.type = 'color'; inp.value = st.cor[f]; inp.setAttribute('aria-label', 'Outra cor');
  inp.addEventListener('input', () => { st.cor[f] = inp.value; atualizarTraco(); salvar(); });
  l.append(inp, document.createTextNode(propria ? 'Sua cor' : 'Outra cor'));
  if (propria) l.style.borderStyle = 'solid';
  cont.append(l);
}
function atualizarTraco() {
  const f = alvoTraco(), s = st.esp[f], c = st.cor[f], e = f === 'marca' ? 'marca' : st.estilo;
  const nomeEstilo = f === 'marca' ? 'Marca-texto' : ESTILOS.find(([k]) => k === st.estilo)[1];
  $('#cd-traco').title = `${nomeEstilo} · ${mm(s)}. Toque para mudar a cor, o estilo e a espessura`;
  $('#cd-traco-cor').style.setProperty('--c', c);
  amostra($('#cd-traco-amostra'), tracoExemplo(f, e, Math.min(s, f === 'marca' ? 12 : 3), c, 44, 18), 1);
  if (!$('#cd-painel').hidden) montarPainel();
}
function amostra(canvas, t, k) {
  const r = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
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
  montarCores($('#cd-painel-cores'));
  const pv = $('#cd-previa');
  requestAnimationFrame(() => amostra(pv, tracoExemplo(f, f === 'marca' ? 'marca' : st.estilo, st.esp[f], st.cor[f], pv.clientWidth, pv.clientHeight), 1.4));
}
function alternarPainel() { if ($('#cd-painel').hidden) abrirPainel(); else fecharPainel(); }
function abrirPainel() { if (st.ferramenta === 'borracha') return; fecharMapa(); fecharMenu(); $('#cd-painel').hidden = false; $('#cd-traco').setAttribute('aria-expanded', 'true'); montarPainel(); }
function fecharPainel() { $('#cd-painel').hidden = true; $('#cd-traco').setAttribute('aria-expanded', 'false'); }

/* ---------- exportar a lista resolvida ----------
   Cada questão vira uma ou mais páginas: o enunciado (vetorial, recortado do PDF original), o papel e tudo o que
   o aluno escreveu em volta. Se o rascunho se espalhou para os lados, a página fica deitada. */
async function exportar() {
  const btn = $('#cd-exportar'); btn.disabled = true; aviso('Montando o PDF…', 60000);
  try {
    const lib = await import('/assets/vendor/pdf-lib.esm.min.js');
    const { PDFDocument, rgb, BlendMode, StandardFonts, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } = lib;
    const src = await PDFDocument.load(pdfBytes);
    const out = await PDFDocument.create();
    const negrito = await out.embedFont(StandardFonts.HelveticaBold), normal = await out.embedFont(StandardFonts.Helvetica);
    const titulo = $('#cd-titulo').textContent;
    out.setTitle(`${titulo} · ${NOMES[lista]} resolvida`);
    out.setAuthor('MAT com JOÃO · matcomjoao.com'); out.setCreator('Caderno digital MAT MAT MAT!');
    const cor = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
    const semAcento = (s) => s.normalize('NFC').replace(/[^\x20-\xff]/g, '');
    const M = 28, TOPO = 46, BASE = 24;
    for (let q = 1; q <= totalQ; q++) {
      const L = layout(q), ts = tracosDe(q);
      let bx0 = L.x - 16, by0 = L.y - 16, bx1 = L.x + L.w + 16, by1 = L.y + L.h + 16;
      for (const t of ts) { const [a, b, c, d] = formaDe(t).caixa; bx0 = Math.min(bx0, a - 8); by0 = Math.min(by0, b - 8); bx1 = Math.max(bx1, c + 8); by1 = Math.max(by1, d + 8); }
      const Wu = bx1 - bx0, deitada = Wu > 1.3 * (L.w + 32);
      const [PW, PH] = deitada ? [A4[1], A4[0]] : A4;
      const s = Math.min(1, (PW - 2 * M) / Wu), fatia = (PH - TOPO - BASE) / s;
      const pecas = [];
      for (const p of L.pecas) {
        const sp = src.getPage(p.n - 1), H = sp.getHeight();
        pecas.push({ p, emb: await out.embedPage(sp, { left: p.c[0], right: p.c[2], bottom: H - p.c[3], top: H - p.c[1] }) });
      }
      const marcas = marcasMundo(q);
      let y = by0, parte = 0;
      do {
        const page = out.addPage([PW, PH]); parte++;
        const h = Math.min(fatia, by1 - y), X = (wx) => M + (wx - bx0) * s, Y = (wy) => PH - (TOPO + (wy - y) * s); // Y: coordenada do PDF (de baixo para cima)
        page.drawText(`Questão ${q}${parte > 1 ? ' · continuação' : ''}`, { x: M, y: PH - 30, size: 10.5, font: negrito, color: cor('#4a27b7') });
        const dir = semAcento(`${titulo} · ${NOMES[lista]}`), lw = normal.widthOfTextAtSize(dir, 8.5);
        page.drawText(dir, { x: PW - M - lw, y: PH - 30, size: 8.5, font: normal, color: cor('#7a7590') });
        page.pushOperators(pushGraphicsState(), rectangle(M, PH - TOPO - h * s, Wu * s, h * s), clip(), endPath());
        // papel
        if (st.papel === 'quadriculado' || st.papel === 'pautado') {
          const cl = cor(st.papel === 'quadriculado' ? COR_PAPEL.linha : COR_PAPEL.pauta), p = st.papel === 'pautado' ? PAUTA : PASSO;
          if (st.papel === 'quadriculado') for (let i = Math.ceil(bx0 / p); i * p <= bx1; i++) page.drawLine({ start: { x: X(i * p), y: Y(y) }, end: { x: X(i * p), y: Y(y + h) }, thickness: 0.5, color: cl });
          for (let j = Math.ceil(y / p); j * p <= y + h; j++) page.drawLine({ start: { x: M, y: Y(j * p) }, end: { x: M + Wu * s, y: Y(j * p) }, thickness: 0.5, color: cl });
        } else if (st.papel === 'pontilhado') {
          for (let j = Math.ceil((y - PASSO / 2) / PASSO); j * PASSO + PASSO / 2 <= y + h; j++) for (let i = Math.ceil((bx0 - PASSO / 2) / PASSO); i * PASSO + PASSO / 2 <= bx1; i++)
            page.drawCircle({ x: X(i * PASSO + PASSO / 2), y: Y(j * PASSO + PASSO / 2), size: 0.7, color: cor(COR_PAPEL.ponto) });
        }
        // enunciado
        page.drawRectangle({ x: X(L.x - 12), y: Y(L.y + L.h + 12), width: (L.w + 24) * s, height: (L.h + 24) * s, color: rgb(1, 1, 1), borderWidth: 0 });
        for (const { p, emb } of pecas) page.drawPage(emb, { x: X(p.x), y: Y(p.y + p.h), width: p.w * s, height: p.h * s });
        for (const m of marcas) if (m.destaque) {
          const [fx, fy, fw, fh] = m.faixa;
          page.drawRectangle({ x: X(fx), y: Y(fy + fh), width: fw * s, height: fh * s, color: cor(VERDE), opacity: 0.12, borderWidth: 0 });
          page.drawEllipse({ x: X(m.anel[0]), y: Y(m.anel[1]), xScale: m.anel[2] * s, yScale: m.anel[2] * s, borderColor: cor(VERDE), borderWidth: 1.6 * s });
        }
        // o que o aluno escreveu
        for (const t of ts) {
          const [a, b, c, d] = formaDe(t).caixa; if (d < y || b > y + h) continue;
          const path = caminho(contorno(t, s), M - bx0 * s, TOPO - y * s); if (!path) continue;
          page.drawSvgPath(path, { x: 0, y: PH, color: cor(t.c), borderWidth: 0, ...(t.f === 'marca' ? { opacity: 0.38, blendMode: BlendMode.Multiply } : {}) });
        }
        page.pushOperators(popGraphicsState());
        y += fatia;
      } while (y < by1 - 1);
    }
    if (st.gabarito) for (let n = mapa.gabarito; n <= pdf.numPages; n++) { const [page] = await out.copyPages(src, [n - 1]); out.addPage(page); }
    const bytes = await out.save();
    const nome = `${slug(titulo)}-${lista}-resolvida.pdf`;
    const arq = new File([bytes], nome, { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [arq] }) && matchMedia('(pointer:coarse)').matches) {
      try { await navigator.share({ files: [arq], title: nome }); aviso('PDF pronto'); return; }
      catch (e) { if (e?.name === 'AbortError') { aviso('Exportação cancelada'); return; } }
    }
    const url = URL.createObjectURL(arq); const a = document.createElement('a'); a.href = url; a.download = nome;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    aviso('PDF baixado: ' + nome, 3000);
    window.__caderno.ultimoPdf = bytes;
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
  tela = $('#cd-tela'); vivo = $('#cd-vivo'); folha = $('#cd-folha');
  medir();
  if (!aulaId) { erro('Abra o caderno pela página de uma aula.'); return; }
  const [Vo, Mo, Au] = aulaId.split('.');
  $('#cd-voltar').href = `/${Vo}/${Mo}/${Au}/`;
  $('#cd-sub').textContent = NOMES[lista];
  document.title = `${NOMES[lista]} · Caderno | MAT MAT MAT!`;
  montarBarra(); escolher(st.ferramenta); ligarEntrada();
  fetch('/data/aulas.json').then((r) => r.json()).then((d) => { const l = acharAula(d, aulaId); if (l) { $('#cd-titulo').textContent = l.title || l.titulo; document.title = `${l.title || l.titulo} · ${NOMES[lista]} | Caderno`; } }).catch(() => {});
  try { mapa = await (await fetch(`/pdfs/caderno-${lista}-${aulaId}.json`)).json(); } catch { mapa = null; }
  if (!mapa?.pdf) { mapa = null; erro('O caderno desta lista ainda não foi publicado.'); return; }
  try {
    const dados = await (await fetch(`/data/listas/${aulaId}.json`)).json();
    const d = dados[lista] || {};
    respostas = lista === 'fixacao' ? (d.secoes || []).flatMap((s) => s.questoes) : d.questoes || [];
  } catch { respostas = []; }
  try {
    pdfBytes = new Uint8Array(await (await fetch(mapa.pdf)).arrayBuffer());
    pdf = await pdfjs.getDocument({ data: pdfBytes.slice() }).promise;
  } catch (e) { console.error(e); mapa = null; erro('Não consegui abrir a lista. Verifique a internet e recarregue a página.'); return; }
  for (let n = 1; n <= pdf.numPages; n++) { const vp = (await pdf.getPage(n)).getViewport({ scale: 1 }); tamanhos[n] = [vp.width, vp.height]; }
  totalQ = mapa.questoes.length;
  const salvo = await banco.ler(CHAVE);
  if (salvo?.v === 4 && salvo.pdf === mapa.pdf && salvo.numPaginas === pdf.numPages) st = { ...st, ...salvo };
  else if (salvo?.v === 4) aviso('A lista foi atualizada; começamos um caderno novo.', 3500);
  st.pdf = mapa.pdf; st.numPaginas = pdf.numPages;
  if (st.atual !== 'gab' && !(st.atual >= 1 && st.atual <= totalQ)) st.atual = 1;
  $('#cd-papel').value = st.papel; $('#cd-formas').setAttribute('aria-pressed', st.formas);
  $('#cd-dedo').checked = st.dedo; $('#cd-enun').checked = st.enun;
  escolher(st.ferramenta);
  $('#cd-carregando').hidden = true;
  $('#cd-nav').hidden = false;
  mostrar();
  $('#cd-exportar').disabled = false;
  pronto = true;
  new ResizeObserver(() => {
    const antes = { vw, vh }; medir();
    if (st.atual !== 'gab' && !st.vista[st.atual]) V = vistaAjustada(st.atual); // ainda não mexeu: reajusta ao girar o tablet
    else if (antes.vw) V = prenderVista(V);
    atualizarZoom(); desenhar(); pintarVivo();
  }).observe(folha);
  try { if (!localStorage.getItem('caderno-dica-4')) { $('#cd-dica').hidden = false; $('#cd-dica-ok').addEventListener('click', () => { $('#cd-dica').hidden = true; try { localStorage.setItem('caderno-dica-4', '1'); } catch {} }); } } catch {}
  if (salvo?.salvoEm && salvo.pdf === mapa.pdf && salvo.v === 4) aviso('Seu caderno foi recuperado deste aparelho', 2200);
}
function erro(msg) { const c = $('#cd-carregando'); c.hidden = false; c.textContent = msg; $('#cd-zoomtag').hidden = true; }

window.__caderno = { get estado() { return st; }, get vista() { return V; }, get mapa() { return mapa; }, layout: (q) => layout(q), exportar, irPara, reconhecer, aplicarVista, ultimoPdf: null };
iniciar();
