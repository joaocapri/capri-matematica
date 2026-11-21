/* Modo aula do MAT com JOÃO!
   Para dar aula on-line transmitindo a tela do iPad: páginas pontilhadas em paisagem, uma de cada vez,
   viradas para o lado (como no GoodNotes, não uma folha infinita). Em qualquer página entra qualquer questão
   das listas do site, recortada do PDF do caderno (com figura e tudo): dá para arrastar, aumentar, diminuir e
   resolver por cima com a caneta.
   Caneta (Apple Pencil) escreve; o dedo vira a página, toca numa questão para selecionar e arrasta;
   dois dedos dão zoom (e um toque com dois dedos desfaz).
   As aulas ficam salvas neste aparelho (IndexedDB). Endereço não listado: /modo-aula/  (?aula=3.14.4 já abre
   essa aula no painel de questões). */
import * as pdfjs from '/assets/vendor/pdf.min.mjs';
import { getStroke } from '/assets/vendor/perfect-freehand.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.mjs';

/* ---------- constantes ---------- */
const PW = 1200, PH = 849;           // página em unidades (proporção de uma A4 deitada)
const PASSO = 25;                    // pontilhado
const TOPO_Q = 50;                   // onde começa a questão na página do PDF do caderno
const GAP_PECA = 8;                  // entre pedaços de uma questão que ocupa duas páginas do PDF
const GAP_PG = 28;                   // entre páginas, ao virar
const ZMAX = 5;
const MESA = '#e9e7f0', PAPEL = '#fffefa';
const COR_PAPEL = { linha: '#dcd7ef', pauta: '#cbc5e4', ponto: '#aaa3d2' };
const NOMES = { fixacao: 'Fixação', vestibular: 'Vestibular', aprofundamento: 'Aprofundamento' };
const CORES = {
  caneta: [['Preto', '#1d1b26'], ['Azul', '#2459d6'], ['Vermelho', '#d8352b'], ['Verde', '#1c8f4e'], ['Roxo', '#6a3fd8'], ['Laranja', '#ea7b16']],
  marca: [['Amarelo', '#ffe14d'], ['Verde-limão', '#c8f55f'], ['Rosa', '#ff9ccf'], ['Azul-claro', '#8fd3ff'], ['Laranja', '#ffc078']],
};
const ESPS = { caneta: [1.2, 2, 3.4], marca: [12, 20, 32] };   // espessuras rápidas (fina, média, grossa)
const FAIXA = { caneta: [0.5, 8], marca: [6, 44] };              // limites do controle deslizante
const ESTILOS = [['tinteiro', 'Tinteiro'], ['esfero', 'Esferográfica'], ['nanquim', 'Nanquim'], ['pincel', 'Pincel']];
const deControle = (f, v) => { const [a, b] = FAIXA[f]; return +(a * Math.pow(b / a, v / 100)).toFixed(2); };
const paraControle = (f, s) => { const [a, b] = FAIXA[f]; return Math.round(100 * Math.log(s / a) / Math.log(b / a)); };
const BORRACHA_PX = 14;
const $ = (s) => document.querySelector(s);
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const qs = new URLSearchParams(location.search);
const ALUNO = document.body.dataset.papel === 'aluno'; // /ao-vivo/: o aluno acompanha e resolve exercícios
const on = (sel, ev, fn) => { const el = $(sel); if (el) el.addEventListener(ev, fn); return el; };

/* ---------- preferências (ferramenta, cores) ---------- */
let pref = { ferramenta: 'caneta', estilo: 'pincel', cor: { caneta: CORES.caneta[0][1], marca: CORES.marca[0][1] }, esp: { caneta: ESPS.caneta[1], marca: ESPS.marca[1] }, aulaSite: null, lista: 'fixacao' };
try { pref = { ...pref, ...JSON.parse(localStorage.getItem(ALUNO ? 'av:pref' : 'ma:pref') || '{}') }; } catch {}
for (const f of ['caneta', 'marca']) if (Number.isInteger(pref.esp[f]) && pref.esp[f] <= 2) pref.esp[f] = ESPS[f][pref.esp[f]]; // versão antiga guardava o índice
if (!['caneta', 'marca', 'borracha', 'laco', 'laser'].includes(pref.ferramenta) || (ALUNO && pref.ferramenta === 'laser')) pref.ferramenta = 'caneta';
const guardarPref = () => { try { localStorage.setItem(ALUNO ? 'av:pref' : 'ma:pref', JSON.stringify(pref)); } catch {} };

/* ---------- banco (IndexedDB, com localStorage de reserva) ---------- */
const banco = (() => {
  let db = null;
  const abrir = () => new Promise((ok, erro) => {
    if (db) return ok(db);
    const r = indexedDB.open('matjoao-modo-aula', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('aulas');
    r.onsuccess = () => { db = r.result; ok(db); };
    r.onerror = () => erro(r.error);
  });
  const tx = async (modo, f) => { const d = await abrir(); return new Promise((ok, erro) => { const t = d.transaction('aulas', modo); const r = f(t.objectStore('aulas')); t.oncomplete = () => ok(r?.result); t.onerror = () => erro(t.error); }); };
  return {
    async todas() { try { return (await tx('readonly', (s) => s.getAll())) || []; } catch { try { return JSON.parse(localStorage.getItem('ma:aulas') || '[]'); } catch { return []; } } },
    async ler(id) { try { return await tx('readonly', (s) => s.get(id)); } catch { return (await this.todas()).find((a) => a.id === id); } },
    async gravar(a) {
      try { await tx('readwrite', (s) => s.put(a, a.id)); return true; }
      catch { try { const l = (await this.todas()).filter((x) => x.id !== a.id); l.push(a); localStorage.setItem('ma:aulas', JSON.stringify(l)); return true; } catch { return false; } }
    },
    async apagar(id) { try { await tx('readwrite', (s) => s.delete(id)); } catch { try { localStorage.setItem('ma:aulas', JSON.stringify((await this.todas()).filter((x) => x.id !== id))); } catch {} } },
  };
})();

/* ---------- estado da aula aberta ---------- */
let aula = null;           // { id, titulo, criada, editada, papel, atual, paginas: [{ id, tracos: [], objs: [] }] }
let desfazer = [], refazer = [];
const novaPagina = () => ({ id: novoId(), tracos: [], objs: [] });
const pagina = () => aula.paginas[aula.atual];

let timerSalvar = 0;
function salvar(ja) {
  if (!aula) return;
  if (ALUNO) { guardarTrabalho(); return; }
  clearTimeout(timerSalvar);
  const f = async () => { aula.editada = Date.now(); if (!(await banco.gravar(aula))) aviso('Não consegui salvar neste aparelho. Exporte o PDF para não perder.', 5000); };
  if (ja) return f();
  timerSalvar = setTimeout(f, 500);
}
let timerAviso = 0;
function aviso(txt, ms = 1800) {
  const el = $('#ma-status'); el.textContent = txt; el.classList.toggle('on', !!txt);
  clearTimeout(timerAviso); timerAviso = setTimeout(() => el.classList.remove('on'), ms);
}

/* ---------- traço (o mesmo motor do caderno) ---------- */
function opcoes(t, k) { // os mesmos estilos do caderno
  const s = t.s * k, pen = !!t.pen;
  if (t.f === 'marca') return { size: s, thinning: 0, smoothing: 0.5, streamline: t.forma ? 0 : 0.45, simulatePressure: false, start: { cap: false }, end: { cap: false }, last: true };
  if (t.forma && t.e !== 'pincel') return { size: s * (t.e === 'esfero' ? 0.9 : 1), thinning: 0, smoothing: 0.2, streamline: 0, simulatePressure: false, last: true };
  switch (t.e || 'tinteiro') {
    case 'esfero': return { size: s, thinning: pen ? 0.18 : 0.1, smoothing: 0.62, streamline: 0.5, simulatePressure: false, last: true };
    case 'nanquim': return { size: s, thinning: 0, smoothing: 0.55, streamline: 0.5, simulatePressure: false, last: true };
    // pincel e tinteiro: traço liso de caneta (pressão suavizada na captura, curva de resposta macia e contorno bem alisado)
    case 'pincel': return { size: s * 2.3, thinning: t.forma ? 0.3 : 0.68, smoothing: 0.78, streamline: t.forma ? 0 : 0.55, easing: suave, simulatePressure: !pen && !t.forma,
      start: { taper: pen || t.forma ? 0 : s * 5, cap: true }, end: { taper: t.forma ? 0 : s * 8, cap: true }, last: true };
    default: return { size: s, thinning: pen ? 0.42 : 0.38, smoothing: 0.75, streamline: 0.55, easing: suave, simulatePressure: !pen, last: true };
  }
}
const suave = (t) => Math.sin((t * Math.PI) / 2);
function tracoExemplo(f, e, s, c, w, h) {
  const p = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; p.push([w * 0.08 + u * w * 0.84, h / 2 + Math.sin(u * Math.PI * 2) * h * 0.24, 0.25 + 0.6 * Math.sin(u * Math.PI)]); }
  return { f, e: f === 'marca' ? 'marca' : e, s, c, pen: true, p };
}
const contorno = (t, k) => getStroke(t.p.map(([x, y, p]) => [x * k, y * k, p]), opcoes(t, k));
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
const cacheForma = new WeakMap();
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
function pintura(ctx, t) { ctx.fillStyle = t.c; if (t.f === 'marca') { ctx.globalAlpha = 0.38; ctx.globalCompositeOperation = 'multiply'; } }
function desenhaTraco(ctx, t) { const f = formaDe(t); if (!f.path) return; ctx.save(); pintura(ctx, t); ctx.fill(f.path); ctx.restore(); }
function desenhaTracoVivo(ctx, t) { const out = contorno(t, 1); if (out.length < 3) return; ctx.save(); pintura(ctx, t); ctx.fill(new Path2D(caminho(out))); ctx.restore(); }

/* ---------- formas perfeitas: desenhe e segure parado no fim ---------- */
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
  if (fechado) out.push([seq[1][0] * 0.02 + u[0] * 0.98, seq[1][1] * 0.02 + u[1] * 0.98, 0.5]);
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
  let desvio = 0; for (const p of pts) desvio = Math.max(desvio, distSeg(p[0], p[1], a[0], a[1], b[0], b[1]));
  if (soReta || (d > 0.7 * L && desvio < Math.max(4, 0.09 * d))) {
    let [p, q] = [a, b];
    const ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI, r = ((ang % 90) + 90) % 90;
    if (r < 6 || r > 84) { if (Math.abs(q[0] - p[0]) > Math.abs(q[1] - p[1])) q = [q[0], p[1]]; else q = [p[0], q[1]]; }
    return { nome: 'Reta', pts: amostrar([p, q], false) };
  }
  const fechado = d < Math.max(0.2 * Math.max(w, h), 0.12 * L);
  if (fechado) {
    let vs = rdp(pts.concat([pts[0]]), 0.075 * diag); vs.pop();
    vs = vs.filter((v, i) => i === 0 || dist(v, vs[i - 1]) > 0.12 * diag);
    if (vs.length > 2 && dist(vs[0], vs[vs.length - 1]) < 0.12 * diag) vs.pop();
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.max(w / 2, 1), ry = Math.max(h / 2, 1);
    let errE = 0; for (const [x, y] of pts) errE += Math.abs(Math.hypot((x - cx) / rx, (y - cy) / ry) - 1); errE /= pts.length;
    const errP = vs.length >= 3 ? erroPoligono(pts, vs, true) / diag : 1;
    if ((vs.length === 3 || vs.length === 4) && errP < 0.045 && errP < errE * 0.6 + 0.02) {
      if (vs.length === 3) return { nome: 'Triângulo', pts: amostrar(vs, true) };
      const retos = vs.every((v, i) => { const u = vs[(i + 1) % 4], an = Math.abs(Math.atan2(u[1] - v[1], u[0] - v[0]) * 180 / Math.PI) % 90; return an < 12 || an > 78; });
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
      const ini = Math.atan2(a[1] - cy, a[0] - cx);
      for (let i = 0; i <= n + 1; i++) { const t = ini + i / n * Math.PI * 2; out.push([cx + ex * Math.cos(t), cy + ey * Math.sin(t), 0.5]); }
      return { nome, pts: out };
    }
    return null;
  }
  const vs = rdp(pts, 0.06 * diag);
  if (vs.length >= 3 && vs.length <= 4 && erroPoligono(pts, vs, false) / diag < 0.03) return { nome: 'Linha', pts: amostrar(vs, false) };
  return null;
}

/* ---------- questões: o PDF do caderno de cada lista ---------- */
const fontes = new Map();   // "aula|lista" → Promise<{ mapa, pdf, url }>
function fonte(aulaId, lista) {
  const k = aulaId + '|' + lista;
  if (!fontes.has(k)) {
    const p = (async () => {
      const r = await fetch(`/pdfs/caderno-${lista}-${aulaId}.json`);
      if (!r.ok) throw new Error('sem caderno');
      const mapa = await r.json();
      const pdf = await pdfjs.getDocument({ url: mapa.pdf }).promise;
      return { mapa, pdf, url: mapa.pdf };
    })();
    p.catch(() => fontes.delete(k));
    fontes.set(k, p);
  }
  return fontes.get(k);
}
const pecasCache = new Map();
async function pecas(aulaId, lista, n) { // regiões das páginas do PDF que formam a questão n
  const k = `${aulaId}|${lista}|${n}`;
  if (pecasCache.has(k)) return pecasCache.get(k);
  const f = await fonte(aulaId, lista), q = f.mapa.questoes[n - 1], out = [];
  for (const pg of q.paginas) {
    const page = await f.pdf.getPage(pg), W = page.getViewport({ scale: 1 }).width, ultima = pg === q.paginas[q.paginas.length - 1];
    const y1 = ultima && f.mapa.rascunho?.[pg] != null ? f.mapa.rascunho[pg] - 2 : f.mapa.rascunhoFim;
    out.push({ pg, c: [34, TOPO_Q, W - 34, Math.max(TOPO_Q + 40, y1)] });
  }
  const larg = out[0].c[2] - out[0].c[0], alt = out.reduce((s, p) => s + p.c[3] - p.c[1], 0) + GAP_PECA * (out.length - 1);
  const r = { lista: out, prop: alt / larg };
  pecasCache.set(k, r);
  return r;
}
const imagens = new Map(); // "aula|lista|n|P" → Promise<canvas>   (P = largura em pixels)
function imagemQuestao(aulaId, lista, n, P) {
  const k = `${aulaId}|${lista}|${n}|${P}`;
  if (imagens.has(k)) { const v = imagens.get(k); imagens.delete(k); imagens.set(k, v); return v; }
  const p = (async () => {
    const f = await fonte(aulaId, lista), { lista: ps, prop } = await pecas(aulaId, lista, n);
    const larg = ps[0].c[2] - ps[0].c[0], s = P / larg;
    const cv = document.createElement('canvas'); cv.width = P; cv.height = Math.round(P * prop);
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    let y = 0;
    for (const { pg, c } of ps) {
      const page = await f.pdf.getPage(pg), h = Math.round((c[3] - c[1]) * s);
      const tmp = document.createElement('canvas'); tmp.width = P; tmp.height = h;
      await page.render({ canvasContext: tmp.getContext('2d'), viewport: page.getViewport({ scale: s, offsetX: -c[0] * s, offsetY: -c[1] * s }) }).promise;
      ctx.drawImage(tmp, 0, y); y += h + GAP_PECA * s;
    }
    return cv;
  })();
  p.catch(() => imagens.delete(k));
  imagens.set(k, p);
  while (imagens.size > 40) imagens.delete(imagens.keys().next().value); // as mais antigas saem
  return p;
}
/* na página, cada questão usa a imagem pronta de maior resolução; se o zoom pedir mais, renderiza de novo */
const prontas = new Map(); // "aula|lista|n" → { P, cv }
const pedidas = new Set();
function imagemPronta(o, precisa) {
  const k = `${o.aula}|${o.lista}|${o.n}`, ent = prontas.get(k);
  const P = limitar(Math.ceil(precisa * 1.25 / 400) * 400, 800, 2800);
  if ((!ent || ent.P < P * 0.8) && !pedidas.has(k + '|' + P)) {
    pedidas.add(k + '|' + P);
    imagemQuestao(o.aula, o.lista, o.n, P).then((cv) => { const e = prontas.get(k); if (!e || e.P < P) prontas.set(k, { P, cv }); imagensMudaram(); })
      .catch(() => { prontas.set(k, { P: 0, erro: true }); pedirQuadro(); })
      .finally(() => pedidas.delete(k + '|' + P));
  }
  return ent;
}

/* ---------- tela ---------- */
let tela, vivo, folha, vw = 0, vh = 0, R = 1;
let V = { tx: 0, ty: 0, z: 1 };
let desl = 0;           // deslocamento horizontal enquanto vira a página (px)
function vistaAjustada() { const m = 14, z = Math.min((vw - 2 * m) / PW, (vh - 2 * m) / PH); return { z, tx: (vw - PW * z) / 2, ty: (vh - PH * z) / 2 }; }
const zFit = () => vistaAjustada().z;
const comZoom = () => V.z > zFit() * 1.02;
function prender(v) { // com zoom, a página não foge da tela
  const f = vistaAjustada(); if (v.z <= f.z * 1.001) return f;
  const w = PW * v.z, h = PH * v.z, m = 40;
  return { z: v.z, tx: limitar(v.tx, vw - w - m, m), ty: limitar(v.ty, vh - h - m, m) };
}
function aplicarVista(v) { V = prender(v); $('#ma-zoomtag').hidden = !comZoom(); pedirQuadro(); posicionarSelMenu(); }
function medir() {
  R = Math.min(window.devicePixelRatio || 1, 3);
  const r = folha.getBoundingClientRect(); vw = r.width; vh = r.height;
  for (const c of [tela, vivo]) { c.width = Math.round(vw * R); c.height = Math.round(vh * R); }
  if (!comZoom()) V = vistaAjustada(); else V = prender(V);
  pedirQuadro();
}
const local = (e) => { const r = tela.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
const mundo = (p) => [Math.round((p.x - V.tx) / V.z * 100) / 100, Math.round((p.y - V.ty) / V.z * 100) / 100];
const pressao = (e) => Math.round((e.pointerType === 'pen' ? Math.max(0.05, e.pressure || 0.5) : 0.5) * 1000) / 1000;

let quadro = 0;
function pedirQuadro() { if (!quadro) quadro = requestAnimationFrame(desenhar); }
function desenhar() {
  quadro = 0;
  if (!aula) return;
  const ctx = tela.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = MESA; ctx.fillRect(0, 0, tela.width, tela.height);
  renumerar();
  const passo = PW * V.z + GAP_PG;
  for (const i of [aula.atual - 1, aula.atual, aula.atual + 1]) {
    const pg = aula.paginas[i]; if (!pg) continue;
    const ox = V.tx + (i - aula.atual) * passo + desl;
    if (ox > vw || ox + PW * V.z < 0) continue;
    desenharPagina(ctx, pg, ox, V.ty, V.z, R, i === aula.atual);
  }
  // na última página (com algo escrito), arrastar para o lado mostra a página nova que vai nascer
  if (desl < 0 && aula.atual === aula.paginas.length - 1 && podeCriarAoDeslizar()) {
    const ox = V.tx + passo + desl;
    ctx.save(); ctx.globalAlpha = Math.min(1, -desl / (passo * 0.25));
    ctx.fillStyle = PAPEL; ctx.fillRect(ox * R, V.ty * R, PW * V.z * R, PH * V.z * R);
    ctx.fillStyle = '#8a84a6'; ctx.font = `700 ${18 * R}px 'DM Sans', system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(-desl > passo * 0.18 ? 'Solte para criar a página' : 'Nova página', (ox + PW * V.z / 2) * R, (V.ty + PH * V.z / 2) * R);
    ctx.restore();
  }
  // o que chega ao vivo (traços sendo escritos pelo professor, para o aluno)
  if (remotos.size) {
    ctx.save(); ctx.setTransform(R * V.z, 0, 0, R * V.z, R * (V.tx + desl), R * V.ty);
    ctx.beginPath(); ctx.rect(0, 0, PW, PH); ctx.clip();
    for (const t of remotos.values()) desenhaTracoVivo(ctx, t);
    ctx.restore();
  }
}
const remotos = new Map(); // id → traço em andamento recebido pela sala
function papel(ctx, tipo, z) {
  if (tipo === 'liso') return;
  ctx.save();
  if (tipo === 'pontilhado') {
    ctx.fillStyle = COR_PAPEL.ponto; ctx.beginPath();
    const r = Math.max(1, 0.9 / z);
    for (let y = PASSO; y < PH; y += PASSO) for (let x = PASSO; x < PW; x += PASSO) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832); }
    ctx.fill();
  } else {
    ctx.strokeStyle = tipo === 'pautado' ? COR_PAPEL.pauta : COR_PAPEL.linha; ctx.lineWidth = Math.max(0.8, 0.9 / z); ctx.beginPath();
    const p = tipo === 'pautado' ? 32 : PASSO;
    if (tipo === 'quadriculado') for (let x = p; x < PW; x += p) { ctx.moveTo(x, 0); ctx.lineTo(x, PH); }
    for (let y = tipo === 'pautado' ? 64 : p; y < PH; y += p) { ctx.moveTo(0, y); ctx.lineTo(PW, y); }
    ctx.stroke();
  }
  ctx.restore();
}
function desenharPagina(ctx, pg, tx, ty, z, r, atual, mini) {
  ctx.save();
  if (!mini) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.shadowColor = 'rgba(33,25,70,.2)'; ctx.shadowBlur = 14 * r; ctx.shadowOffsetY = 2 * r; ctx.fillStyle = PAPEL; ctx.fillRect(tx * r, ty * r, PW * z * r, PH * z * r); ctx.shadowColor = 'transparent'; }
  ctx.setTransform(r * z, 0, 0, r * z, r * tx, r * ty);
  if (mini) { ctx.fillStyle = PAPEL; ctx.fillRect(0, 0, PW, PH); }
  ctx.beginPath(); ctx.rect(0, 0, PW, PH); ctx.clip();
  papel(ctx, aula?.papel || 'pontilhado', z * (mini ? 3 : 1));
  const movendo = atual && sel && moverAtivo();
  const transformar = (ctx) => { // a seleção sendo arrastada ou redimensionada (com o canto de cima à esquerda fixo)
    const d = sel.d;
    if (d.redim) { ctx.translate(d.a, d.b); ctx.scale(d.k, d.k); ctx.translate(-d.a, -d.b); } else ctx.translate(d.dx, d.dy);
  };
  for (const o of pg.objs) {
    if (movendo && sel.objs.includes(o)) { ctx.save(); transformar(ctx); desenharQuestao(ctx, o, z * r * (sel.d.k || 1), mini); ctx.restore(); }
    else desenharQuestao(ctx, o, z * r, mini);
  }
  if (pg.fixos) for (const t of pg.fixos) desenhaTraco(ctx, t); // o que o professor já tinha escrito na página do exercício
  for (const t of pg.tracos) {
    if (movendo && sel.tracos.has(t)) { ctx.save(); transformar(ctx); desenhaTraco(ctx, t); ctx.restore(); }
    else desenhaTraco(ctx, t);
  }
  if (pg.extras) for (const t of pg.extras) desenhaTracoVivo(ctx, t); // traços em andamento (resoluções ao vivo)
  if (atual && sel && !mini) desenharSel(ctx, z);
  ctx.restore();
}
function desenharQuestao(ctx, o, escala, mini) {
  const { x, y, w, h } = o;
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
  const ent = mini ? prontas.get(`${o.aula}|${o.lista}|${o.n}`) : imagemPronta(o, w * escala);
  if (ent?.cv) { ctx.imageSmoothingQuality = 'high'; ctx.drawImage(ent.cv, x, y, w, h); }
  else {
    ctx.fillStyle = '#f3f1f8'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#8a84a6'; ctx.font = `600 ${Math.min(22, w / 14)}px 'DM Sans', system-ui, sans-serif`; ctx.textBaseline = 'middle';
    ctx.fillText(ent?.erro ? `Questão ${o.n} (${o.aula}) não abriu` : `Questão ${o.n} · ${NOMES[o.lista]} ${o.aula}`, x + 16, y + Math.min(h / 2, 30));
  }
  if (ent?.cv && o.num != null) rotuloQuestao(ctx, o);
  ctx.strokeStyle = '#d9d4e8'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  ctx.restore();
}
/* a questão entra com o número da aula (1, 2, 3…), não com o da lista: o selo original é coberto por um novo.
   Medidas em pontos do PDF do caderno: o recorte tem 527,28 de largura e o selo ocupa a faixa de 0 a 36 do topo. */
const CW_Q = 527.28, SELO = { faixa: 36, x: 9, y: 8.5, h: 23, fonte: 14 };
function rotuloQuestao(ctx, o) {
  const k = o.w / CW_Q, txt = `Questão ${o.num}`;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(k, k);
  ctx.fillStyle = '#fff'; ctx.fillRect(1, 1, CW_Q - 2, SELO.faixa);
  ctx.font = `700 ${SELO.fonte}px 'Space Grotesk', 'DM Sans', system-ui, sans-serif`; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 14;
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(SELO.x, SELO.y, w, SELO.h, 5); else ctx.rect(SELO.x, SELO.y, w, SELO.h);
  ctx.lineWidth = 1.3; ctx.strokeStyle = '#4a27b7'; ctx.stroke();
  ctx.fillStyle = '#4a27b7'; ctx.fillText(txt, SELO.x + 7, SELO.y + SELO.h / 2 + 0.5);
  ctx.restore();
}

/* ---------- seleção (laço, ou um toque do dedo numa questão) ---------- */
let sel = null; // { tracos: Set, objs: [], caixa, d: { dx, dy } | { redim, w, h } }
const moverAtivo = () => !!(sel?.d && (sel.d.redim || sel.d.dx || sel.d.dy));
function caixaSel(s) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const t of s.tracos) { const [x0, y0, x1, y1] = formaDe(t).caixa; a = Math.min(a, x0); b = Math.min(b, y0); c = Math.max(c, x1); d = Math.max(d, y1); }
  for (const o of s.objs) { a = Math.min(a, o.x); b = Math.min(b, o.y); c = Math.max(c, o.x + o.w); d = Math.max(d, o.y + o.h); }
  return [a, b, c, d];
}
function selecionar(tracos, objs) {
  if (!tracos.length && !objs.length) { limparSel(); return; }
  sel = { tracos: new Set(tracos), objs, d: null }; sel.caixa = caixaSel(sel);
  posicionarSelMenu(); pedirQuadro();
}
function limparSel() { if (!sel) return; sel = null; $('#ma-sel-menu').hidden = true; pedirQuadro(); }
const umaQuestao = () => sel && sel.objs.length === 1 && !sel.tracos.size;
function caixaVisivel() {
  let [a, b, c, d] = sel.caixa;
  if (sel.d?.redim) { c = a + (c - a) * sel.d.k; d = b + (d - b) * sel.d.k; }
  else if (sel.d) { a += sel.d.dx; c += sel.d.dx; b += sel.d.dy; d += sel.d.dy; }
  return [a, b, c, d];
}
function desenharSel(ctx, z) {
  const [a, b, c, d] = caixaVisivel(), m = 6 / z;
  ctx.save();
  ctx.strokeStyle = '#4a27b7'; ctx.lineWidth = 1.6 / z; ctx.setLineDash([6 / z, 5 / z]);
  ctx.strokeRect(a - m, b - m, c - a + 2 * m, d - b + 2 * m);
  { // alça de tamanho no canto (vale para qualquer seleção)
    ctx.setLineDash([]); ctx.fillStyle = '#4a27b7'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5 / z;
    ctx.beginPath(); ctx.arc(c + m, d + m, 11 / z, 0, 6.2832); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8 / z; ctx.beginPath();
    ctx.moveTo(c + m - 4 / z, d + m + 4 / z); ctx.lineTo(c + m + 4 / z, d + m - 4 / z); ctx.stroke();
  }
  ctx.restore();
}
function posicionarSelMenu() {
  const el = $('#ma-sel-menu');
  if (!sel || moverAtivo()) { el.hidden = true; return; }
  const [a, b, c] = caixaVisivel();
  el.hidden = false;
  const w = el.offsetWidth, h = el.offsetHeight;
  let x = V.tx + (a + c) / 2 * V.z - w / 2, y = V.ty + b * V.z - h - 14;
  if (y < 6) y = V.ty + caixaVisivel()[3] * V.z + 18;
  el.style.left = limitar(x, 6, vw - w - 6) + 'px'; el.style.top = limitar(y, 6, vh - h - 6) + 'px';
}
function acertoSel(w, z) { // a caneta/dedo caiu na alça ou dentro da seleção?
  if (!sel) return null;
  const [a, b, c, d] = sel.caixa, m = 6 / z;
  if (dist(w, [c + m, d + m]) < 26 / z) return 'redim';
  if (w[0] >= a - m && w[0] <= c + m && w[1] >= b - m && w[1] <= d + m) return 'mover';
  return null;
}
function questaoEm(w) { if (ALUNO) return null; const objs = pagina().objs; for (let i = objs.length - 1; i >= 0; i--) { const o = objs[i]; if (w[0] >= o.x && w[0] <= o.x + o.w && w[1] >= o.y && w[1] <= o.y + o.h) return o; } return null; }
function dentroPoligono(x, y, pol) {
  let dentro = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) { const [xi, yi] = pol[i], [xj, yj] = pol[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro; }
  return dentro;
}
function selecionarLaco(pol) {
  if (pol.length < 3) { limparSel(); return; }
  const pg = pagina();
  const tracos = pg.tracos.filter((t) => { let n = 0; for (const [x, y] of t.p) if (dentroPoligono(x, y, pol)) n++; return n >= t.p.length * 0.6; });
  const objs = ALUNO ? [] : pg.objs.filter((o) => dentroPoligono(o.x + o.w / 2, o.y + o.h / 2, pol));
  selecionar(tracos, objs);
}
function concluirMover() {
  const pg = pagina(), d = sel.d; sel.d = null;
  if (!d || (!d.redim && Math.hypot(d.dx, d.dy) < 0.5)) { posicionarSelMenu(); pedirQuadro(); return; }
  const antes = foto(pg);
  if (d.redim && Math.abs(d.k - 1) < 0.005) { posicionarSelMenu(); pedirQuadro(); return; }
  // posição nova de um ponto: arrasto (dx, dy) ou escala k a partir do canto (a, b)
  const X = d.redim ? (x) => d.a + (x - d.a) * d.k : (x) => x + d.dx, Y = d.redim ? (y) => d.b + (y - d.b) * d.k : (y) => y + d.dy, k = d.redim ? d.k : 1;
  for (const o of sel.objs) { o.x = Math.round(X(o.x) * 10) / 10; o.y = Math.round(Y(o.y) * 10) / 10; o.w = Math.round(o.w * k * 10) / 10; o.h = Math.round(o.h * k * 10) / 10; }
  const novos = new Set();
  pg.tracos = pg.tracos.map((t) => { if (!sel.tracos.has(t)) return t; const n = { ...t, s: Math.round(t.s * k * 100) / 100, p: t.p.map(([x, y, p]) => [Math.round(X(x) * 100) / 100, Math.round(Y(y) * 100) / 100, p]) }; novos.add(n); return n; });
  sel.tracos = novos;
  sel.caixa = caixaSel(sel);
  registrar(pg, antes); posicionarSelMenu(); pedirQuadro();
}
function apagarSel() {
  if (!sel) return; const pg = pagina(), antes = foto(pg);
  pg.tracos = pg.tracos.filter((t) => !sel.tracos.has(t)); pg.objs = pg.objs.filter((o) => !sel.objs.includes(o));
  limparSel(); registrar(pg, antes); pedirQuadro();
}
function duplicarSel() {
  if (!sel) return; const pg = pagina(), antes = foto(pg), dx = 30, dy = 30;
  const tracos = [...sel.tracos].map((t) => ({ ...t, p: t.p.map(([x, y, p]) => [x + dx, y + dy, p]) }));
  const objs = sel.objs.map((o) => ({ ...o, id: novoId(), x: o.x + dx, y: o.y + dy }));
  pg.tracos.push(...tracos); pg.objs.push(...objs);
  registrar(pg, antes); selecionar(tracos, objs);
}

/* ---------- desfazer: fotos da página antes de cada mudança ---------- */
const foto = (pg) => ({ tracos: pg.tracos.slice(), objs: pg.objs.map((o) => ({ ...o })) });
function registrar(pg, antes, op) { desfazer.push({ pid: pg.id, antes }); if (desfazer.length > 200) desfazer.shift(); refazer = []; botoes(); salvar(); if (pg === pagina()) mudouPagina(op); }
function registrarPaginas(antes) { desfazer.push({ paginas: antes }); refazer = []; botoes(); salvar(); mudouPagina(); }
function trocar(de, para) {
  const e = de.pop(); if (!e) return;
  limparSel(); cancelarTraco();
  if (e.paginas) {
    para.push({ paginas: { lista: aula.paginas.slice(), atual: aula.atual } });
    aula.paginas = e.paginas.lista; irPara(Math.min(e.paginas.atual, aula.paginas.length - 1), true);
  } else {
    const i = aula.paginas.findIndex((p) => p.id === e.pid); if (i < 0) return trocar(de, para);
    const pg = aula.paginas[i];
    para.push({ pid: pg.id, antes: foto(pg) });
    pg.tracos = e.antes.tracos.slice(); pg.objs = e.antes.objs.map((o) => ({ ...o }));
    if (i !== aula.atual) irPara(i, true);
  }
  botoes(); salvar(); pedirQuadro(); atualizarNav(); mudouPagina();
}
const voltar = () => trocar(desfazer, refazer);
const avancar = () => trocar(refazer, desfazer);
function botoes() { const a = $('#ma-desfazer'), b = $('#ma-refazer'); if (a) a.disabled = !desfazer.length; if (b) b.disabled = !refazer.length; }

/* ---------- entrada: caneta escreve, dedo vira a página e seleciona, dois dedos dão zoom ---------- */
let atual = null;   // traço, borracha, laço, laser ou movimento em andamento (caneta ou mouse)
let gesto = null;   // gesto do dedo
const toques = new Map();
let lasers = [];    // rastros do laser que estão sumindo

function ligarEntrada() {
  tela.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  tela.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  tela.addEventListener('contextmenu', (e) => e.preventDefault());
  tela.addEventListener('pointerdown', (e) => {
    fecharPops();
    const p = local(e);
    if (e.pointerType === 'touch') {
      if (e.isPrimary) toques.clear();
      toques.set(e.pointerId, { ...p, x0: p.x, y0: p.y, t0: performance.now() });
      try { tela.setPointerCapture(e.pointerId); } catch {}
      if (atual?.pen) return; // a palma da mão não atrapalha quem escreve com a caneta
      if (toques.size === 1) {
        if (ALUNO && av.dedo) { iniciarCaneta(e, p); return; } // aluno sem caneta: o dedo escreve
        iniciarToque(e.pointerId, p); return;
      }
      if (atual) cancelarTraco();
      if (gesto?.tipo === 'mover' && sel) { sel.d = null; pedirQuadro(); }
      iniciarPinca(); return;
    }
    if (e.pointerType === 'mouse' && e.button !== 0) { e.preventDefault(); tela.setPointerCapture(e.pointerId); gesto = { tipo: 'arrasto', id: e.pointerId, ult: p }; return; }
    if (atual) return;
    if (gesto && gesto.tipo !== 'pinca') { soltarGesto(false); }
    e.preventDefault(); tela.setPointerCapture(e.pointerId);
    iniciarCaneta(e, p);
  });
  tela.addEventListener('pointermove', (e) => {
    const p = local(e);
    if (e.pointerType === 'touch' && toques.has(e.pointerId)) Object.assign(toques.get(e.pointerId), p);
    if (gesto?.tipo === 'pinca') { if (gesto.ids.includes(e.pointerId)) moverPinca(); return; }
    if (gesto && gesto.id === e.pointerId) { moverGesto(p); return; }
    if (!atual || e.pointerId !== atual.pid) return;
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    moverCaneta(evs.length ? evs : [e], p);
  });
  const fim = (e) => {
    if (e.pointerType === 'touch') {
      toques.delete(e.pointerId);
      if (atual && !atual.pen && e.pointerId === atual.pid) { concluirCaneta(e.type === 'pointercancel'); return; }
      if (gesto?.tipo === 'pinca' && gesto.ids.includes(e.pointerId)) terminarPinca();
      else if (gesto && gesto.id === e.pointerId) soltarGesto(e.type === 'pointerup');
      return;
    }
    if (gesto && gesto.id === e.pointerId) { soltarGesto(false); return; }
    if (atual && e.pointerId === atual.pid) concluirCaneta(e.type === 'pointercancel');
  };
  tela.addEventListener('pointerup', fim);
  tela.addEventListener('pointercancel', fim);
  tela.addEventListener('lostpointercapture', (e) => { if (e.pointerType === 'touch') toques.delete(e.pointerId); });
  tela.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = local(e);
    if (e.ctrlKey || e.metaKey) { zoomEm(V.z * Math.exp(-limitar(e.deltaY, -120, 120) / 300), p.x, p.y); return; }
    if (comZoom()) { aplicarVista({ ...V, tx: V.tx - e.deltaX, ty: V.ty - e.deltaY }); return; }
    if (Math.abs(e.deltaX) > 30 && Math.abs(e.deltaX) > Math.abs(e.deltaY) && !rodaTravada) { rodaTravada = true; setTimeout(() => (rodaTravada = false), 450); irPara(aula.atual + (e.deltaX > 0 ? 1 : -1)); }
  }, { passive: false });
  let gz = null;
  document.addEventListener('gesturestart', (e) => { e.preventDefault(); if (!toques.size) gz = { z: V.z }; });
  document.addEventListener('gesturechange', (e) => { e.preventDefault(); if (!gz || toques.size) return; const p = local(e); zoomEm(gz.z * e.scale, p.x, p.y); });
  document.addEventListener('gestureend', (e) => { e.preventDefault(); gz = null; });
}
let rodaTravada = false;

/* caneta (ou mouse) */
function iniciarCaneta(e, p) {
  const w = mundo(p), pen = e.pointerType === 'pen', f = pref.ferramenta;
  if (pen && ALUNO) av.usouCaneta = true;
  const h = f !== 'laser' && acertoSel(w, V.z);
  if (h) { atual = { pid: e.pointerId, pen, mover: true }; comecarMover(h, w); return; }
  if (f === 'laser') { atual = { pid: e.pointerId, pen, laser: { id: novoId(), pts: [[w[0], w[1], performance.now()]] }, enviados: 0 }; lasers.push(atual.laser); animarLaser(); aoVivo(atual); return; }
  limparSel();
  if (f !== 'laco' && (w[0] < -8 || w[0] > PW + 8 || w[1] < -8 || w[1] > PH + 8)) { atual = { pid: e.pointerId, pen, nada: true }; return; } // fora da página
  if (f === 'borracha') { atual = { pid: e.pointerId, pen, apagou: false, antes: foto(pagina()), cursor: p }; apagar(w); pedirVivo(); return; }
  if (f === 'laco') { atual = { pid: e.pointerId, pen, laco: [w] }; pedirVivo(); return; }
  atual = { pid: e.pointerId, pen, ancora: w, timer: 0,
    traco: { id: novoId(), f, e: f === 'marca' ? 'marca' : pref.estilo, c: pref.cor[f], s: pref.esp[f], pen, p: [[w[0], w[1], pressao(e)]] }, enviados: 0, pp: pressao(e) };
  armarForma(); pedirVivo();
}
function moverCaneta(evs, p) {
  const a = atual;
  if (a.mover) { arrastarSel(mundo(p)); return; }
  if (a.laser) { const t = performance.now(); for (const c of evs) { const w = mundo(local(c)); a.laser.pts.push([w[0], w[1], t]); } aoVivo(a); return; }
  if (a.laco) { for (const c of evs) a.laco.push(mundo(local(c))); pedirVivo(); return; }
  if (a.traco) {
    if (a.travado) return;
    for (const c of evs) { // pressão suavizada: a mão treme, a tinta não
      const w = mundo(local(c)), u = a.traco.p[a.traco.p.length - 1];
      if (Math.hypot(w[0] - u[0], w[1] - u[1]) < 0.35 / V.z) continue; // pontos colados só criam serrilhado
      a.pp = a.pp == null ? pressao(c) : a.pp * 0.72 + pressao(c) * 0.28;
      a.traco.p.push([w[0], w[1], Math.round(a.pp * 1000) / 1000]);
    }
    const u = a.traco.p[a.traco.p.length - 1];
    if (dist(u, a.ancora) > 3 / V.z) { a.ancora = u; armarForma(); }
    pedirVivo(); aoVivo(a); return;
  }
  if (a.antes) { for (const c of evs) apagar(mundo(local(c))); a.cursor = p; pedirVivo(); }
}
function concluirCaneta(cancelado) {
  const a = atual; atual = null; clearTimeout(a.timer); limparVivo();
  if (a.mover) { if (cancelado && sel) sel.d = null; if (sel) concluirMover(); return; }
  if (a.laser) { a.laser.fim = performance.now(); animarLaser(); aoVivo(a, true); return; }
  if (a.laco) { if (!cancelado) selecionarLaco(a.laco); return; }
  if (a.nada) return;
  const pg = pagina();
  if (a.traco) {
    if (cancelado && a.traco.p.length < 3) return;
    if (a.traco.p.length === 1) { const [x, y, pr] = a.traco.p[0]; a.traco.p.push([x + 0.01, y + 0.01, pr]); }
    const antes = foto(pg); pg.tracos.push(a.traco); registrar(pg, antes, { t: 'add', traco: a.traco }); pedirQuadro(); return;
  }
  if (a.apagou) registrar(pg, a.antes);
  pedirQuadro();
}
function cancelarTraco() {
  if (!atual) return;
  if (atual.antes && atual.apagou) { const pg = pagina(); pg.tracos = atual.antes.tracos.slice(); }
  if (atual.mover && sel) sel.d = null;
  if (atual.traco) transmitir({ t: 'vivo', id: atual.traco.id, fim: true });
  clearTimeout(atual.timer); atual = null; limparVivo(); pedirQuadro();
}
function armarForma() { // desenhou e segurou parado no fim: vira forma perfeita
  if (!atual?.traco) return;
  clearTimeout(atual.timer);
  atual.timer = setTimeout(() => {
    const a = atual; if (!a?.traco || a.travado || a.traco.p.length < 6) return;
    const fm = reconhecer(a.traco.p, a.traco.f === 'marca'); if (!fm) return;
    a.traco.p = fm.pts; a.traco.forma = fm.nome; a.travado = true; pedirVivo(); aviso(fm.nome, 900);
    transmitir({ t: 'vivo', id: a.traco.id, ini: cabecaTraco(a.traco), p: a.traco.p, refaz: true }); a.enviados = a.traco.p.length;
  }, 520);
}
function apagar([x, y]) {
  const pg = pagina(), raio = BORRACHA_PX / V.z;
  let mudou = false;
  pg.tracos = pg.tracos.filter((t) => {
    const lim = raio + t.s / 2, [a, b, c, d] = formaDe(t).caixa;
    if (x < a - lim || x > c + lim || y < b - lim || y > d + lim) return true;
    for (let j = 0; j < t.p.length; j++) { const u = t.p[j], v = t.p[j + 1] || u; if (distSeg(x, y, u[0], u[1], v[0], v[1]) <= lim) { mudou = true; return false; } }
    return true;
  });
  if (mudou) { atual.apagou = true; pedirQuadro(); }
}
function comecarMover(tipo, w) {
  sel.ini = w;
  if (tipo === 'redim') { const [a, b, c, d] = sel.caixa; sel.d = { redim: true, k: 1, a, b, c, d, off: [c - w[0], d - w[1]] }; }
  else sel.d = { dx: 0, dy: 0 };
  $('#ma-sel-menu').hidden = true;
}
function arrastarSel(w) {
  if (!sel?.d) return;
  if (sel.d.redim) { // o canto acompanha a caneta/dedo; a proporção se mantém
    const { a, b, c, d, off } = sel.d, lw = Math.max(c - a, 1), lh = Math.max(d - b, 1);
    let k = Math.max((w[0] + off[0] - a) / lw, (w[1] + off[1] - b) / lh);
    const min = Math.max(24 / Math.max(lw, lh), sel.objs.length ? 120 / Math.min(...sel.objs.map((o) => o.w)) : 0);
    sel.d.k = limitar(k, min, (PW * 1.3) / lw);
  } else { sel.d.dx = w[0] - sel.ini[0]; sel.d.dy = w[1] - sel.ini[1]; }
  pedirQuadro();
}

/* laser: um rastro vermelho que some sozinho (não fica salvo) */
let animLaser = 0;
function animarLaser() { if (!animLaser) animLaser = requestAnimationFrame(pintarLaser); }
function pintarLaser() {
  animLaser = 0;
  const agora = performance.now(), VIDA = 700;
  lasers = lasers.filter((l) => !l.fim || agora - l.fim < VIDA);
  pintarVivo();
  if (lasers.length) animarLaser();
}
function desenharLasers(ctx) {
  const agora = performance.now();
  for (const l of lasers) {
    const sumir = l.fim ? 1 - (agora - l.fim) / 700 : 1;
    const pts = l.pts.filter((p) => agora - p[2] < 1400);
    if (!pts.length) continue;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i < pts.length; i++) {
      const vida = 1 - (agora - pts[i][2]) / 1400;
      ctx.globalAlpha = Math.max(0, Math.min(1, vida * 1.4)) * sumir;
      ctx.strokeStyle = 'rgba(255,60,60,.35)'; ctx.lineWidth = 14 / V.z;
      ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
      ctx.strokeStyle = '#ff2d2d'; ctx.lineWidth = 5 / V.z; ctx.stroke();
    }
    const u = pts[pts.length - 1];
    ctx.globalAlpha = sumir; ctx.fillStyle = '#ff2d2d'; ctx.shadowColor = '#ff2d2d'; ctx.shadowBlur = 12 * R;
    ctx.beginPath(); ctx.arc(u[0], u[1], 6 / V.z, 0, 6.2832); ctx.fill();
    ctx.restore();
  }
}

/* camada do que está sendo feito agora (traço, laço, borracha, laser) */
let quadroVivo = 0;
function pedirVivo() { if (!quadroVivo) quadroVivo = requestAnimationFrame(pintarVivo); }
function limparVivo() { const c = vivo.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, vivo.width, vivo.height); }
function pintarVivo() {
  quadroVivo = 0; limparVivo();
  const ctx = vivo.getContext('2d');
  ctx.setTransform(R * V.z, 0, 0, R * V.z, R * V.tx, R * V.ty);
  if (lasers.length) desenharLasers(ctx);
  if (!atual) return;
  if (atual.traco) { desenhaTracoVivo(ctx, atual.traco); return; }
  if (atual.laco) {
    ctx.beginPath(); atual.laco.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.fillStyle = 'rgba(74,39,183,.06)'; ctx.fill();
    ctx.lineWidth = 1.5 / V.z; ctx.setLineDash([5 / V.z, 4 / V.z]); ctx.strokeStyle = '#4a27b7'; ctx.stroke(); return;
  }
  if (atual.cursor) { ctx.setTransform(R, 0, 0, R, 0, 0); ctx.strokeStyle = 'rgba(33,25,70,.5)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(atual.cursor.x, atual.cursor.y, BORRACHA_PX, 0, 6.2832); ctx.stroke(); }
}

/* dedo: toque numa questão seleciona; arrastar vira a página (ou move a folha com zoom); alça e seleção movem */
function iniciarToque(id, p) {
  const w = mundo(p), h = acertoSel(w, V.z);
  if (h) { gesto = { tipo: 'mover', id }; comecarMover(h, w); return; }
  gesto = { tipo: 'toque', id, ini: p, ult: p, t0: performance.now(), hist: [{ ...p, t: performance.now() }] };
}
function moverGesto(p) {
  const g = gesto;
  if (g.tipo === 'mover') { arrastarSel(mundo(p)); return; }
  if (g.tipo === 'arrasto') { aplicarVista({ ...V, tx: V.tx + p.x - g.ult.x, ty: V.ty + p.y - g.ult.y }); g.ult = p; return; }
  const t = performance.now(); g.hist.push({ ...p, t }); while (g.hist.length > 2 && t - g.hist[0].t > 100) g.hist.shift();
  if (g.tipo === 'toque') {
    const dx = p.x - g.ini.x, dy = p.y - g.ini.y;
    if (Math.hypot(dx, dy) < 9) return;
    if (comZoom()) { g.tipo = 'arrasto'; g.ult = g.ini; }
    else if (Math.abs(dx) > Math.abs(dy) * 0.8) g.tipo = 'virar';
    else { g.tipo = 'nada'; return; }
  }
  if (g.tipo === 'arrasto') { aplicarVista({ ...V, tx: V.tx + p.x - g.ult.x, ty: V.ty + p.y - g.ult.y }); g.ult = p; return; }
  if (g.tipo === 'virar') {
    let dx = p.x - g.ini.x;
    if ((dx > 0 && aula.atual === 0) || (dx < 0 && aula.atual === aula.paginas.length - 1 && !podeCriarAoDeslizar())) dx *= 0.25; // borda: resiste
    desl = dx; pedirQuadro();
  }
}
function soltarGesto(comToque) {
  const g = gesto; gesto = null; if (!g) return;
  if (g.tipo === 'mover') { if (sel) concluirMover(); return; }
  if (ALUNO && av.exercicio && !av.dedo && !av.usouCaneta && (g.tipo === 'nada' || g.tipo === 'virar' || g.tipo === 'toque')) aviso('Sem Apple Pencil? Toque em “Dedo” na barra para escrever com o dedo.', 3200);
  if (g.tipo === 'toque' && comToque && performance.now() - g.t0 < 450) { // toque rápido
    const o = questaoEm(mundo(g.ini));
    if (o && !(umaQuestao() && sel.objs[0] === o)) selecionar([], [o]); else limparSel();
    return;
  }
  if (g.tipo === 'virar') {
    const a = g.hist[0], b = g.hist[g.hist.length - 1], v = (b.t - a.t) > 0 ? (b.x - a.x) / (b.t - a.t) : 0;
    const largura = PW * V.z + GAP_PG;
    let alvo = 0;
    const ultima = aula.atual === aula.paginas.length - 1;
    if ((desl < -largura * 0.18 || v < -0.45) && !ultima) alvo = -1;
    else if (desl < -largura * 0.18 && ultima && podeCriarAoDeslizar()) { inserirPagina(aula.atual); alvo = -1; } // arrastou além da última: nasce uma página nova
    else if ((desl > largura * 0.18 || v > 0.45) && aula.atual > 0) alvo = 1;
    else if (ultima && desl < -60 && !podeCriarAoDeslizar()) aviso('Esta página ainda está em branco.', 1400);
    deslizar(alvo);
  }
}
// arrastar além da última página cria outra, desde que a última já tenha algo (não acumula páginas em branco)
const podeCriarAoDeslizar = () => !ALUNO && !!aula && (pagina().tracos.length > 0 || pagina().objs.length > 0);
let animDesl = 0;
function deslizar(alvo) { // alvo: -1 próxima, 1 anterior, 0 volta ao lugar
  cancelAnimationFrame(animDesl);
  const largura = PW * V.z + GAP_PG, de = desl, para = alvo * largura, t0 = performance.now();
  const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  const passo = (t) => {
    const u = ms ? Math.min(1, (t - t0) / ms) : 1, e = 1 - Math.pow(1 - u, 3);
    desl = de + (para - de) * e; pedirQuadro();
    if (u < 1) animDesl = requestAnimationFrame(passo);
    else { desl = 0; if (alvo) irPara(aula.atual - alvo, true); else pedirQuadro(); }
  };
  animDesl = requestAnimationFrame(passo);
}
function iniciarPinca() {
  const ids = [...toques.keys()].slice(-2), [a, b] = ids.map((i) => toques.get(i));
  if (desl) { desl = 0; }
  gesto = { tipo: 'pinca', ids, d0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), m0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v0: { ...V }, t0: performance.now(), mexeu: false };
}
function moverPinca() {
  const g = gesto, a = toques.get(g.ids[0]), b = toques.get(g.ids[1]); if (!a || !b) return;
  const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (Math.abs(d - g.d0) > 10 || Math.hypot(m.x - g.m0.x, m.y - g.m0.y) > 10) g.mexeu = true;
  const z = limitar(g.v0.z * d / g.d0, zFit(), zFit() * ZMAX), wx = (g.m0.x - g.v0.tx) / g.v0.z, wy = (g.m0.y - g.v0.ty) / g.v0.z;
  aplicarVista({ z, tx: m.x - wx * z, ty: m.y - wy * z });
}
function terminarPinca() {
  const g = gesto; gesto = null;
  if (!g.mexeu && performance.now() - g.t0 < 300) { voltar(); aviso('Desfeito', 800); }
  if (V.z < zFit() * 1.06) aplicarVista(vistaAjustada()); // quase sem zoom: encaixa a página
  if (toques.size === 1 && comZoom()) { const [id, p] = [...toques][0]; gesto = { tipo: 'arrasto', id, ult: { x: p.x, y: p.y } }; }
}
function zoomEm(z, sx, sy) {
  z = limitar(z, zFit(), zFit() * ZMAX);
  const wx = (sx - V.tx) / V.z, wy = (sy - V.ty) / V.z;
  aplicarVista({ z, tx: sx - wx * z, ty: sy - wy * z });
}

/* ---------- páginas ---------- */
function irPara(i, semAnim) {
  if (!aula) return;
  i = limitar(i, 0, aula.paginas.length - 1);
  if (i === aula.atual && !semAnim) return;
  if (!semAnim && Math.abs(i - aula.atual) === 1 && !comZoom()) { deslizar(i > aula.atual ? -1 : 1); return; }
  cancelarTraco(); limparSel(); gesto = null; desl = 0;
  aula.atual = i; V = vistaAjustada(); $('#ma-zoomtag').hidden = true;
  atualizarNav(); pedirQuadro(); salvar(); mudouPagina();
}
function atualizarNav() {
  if (!aula || ALUNO) return;
  $('#ma-pag').textContent = aula.atual + 1; $('#ma-total').textContent = '/' + aula.paginas.length;
  $('#ma-ant').disabled = aula.atual === 0; $('#ma-prox').disabled = aula.atual === aula.paginas.length - 1;
}
function inserirPagina(depois = aula.atual, modelo = null) {
  const antes = { lista: aula.paginas.slice(), atual: aula.atual };
  const pg = modelo ? { id: novoId(), tracos: modelo.tracos.slice(), objs: modelo.objs.map((o) => ({ ...o, id: novoId() })) } : novaPagina();
  aula.paginas.splice(depois + 1, 0, pg);
  registrarPaginas(antes);
  return depois + 1;
}
function apagarPagina(i) {
  const antes = { lista: aula.paginas.slice(), atual: aula.atual };
  if (aula.paginas.length === 1) aula.paginas = [novaPagina()]; else aula.paginas.splice(i, 1);
  registrarPaginas(antes);
  irPara(Math.min(aula.atual >= i && aula.atual > 0 ? aula.atual - 1 : aula.atual, aula.paginas.length - 1), true);
  aviso('Página apagada. Desfazer traz de volta.', 2200);
}

/* miniatura de uma página (mapa de páginas e capas das aulas) */
function miniatura(pg, larg, a = aula) {
  const cv = document.createElement('canvas'), r = Math.min(window.devicePixelRatio || 1, 2), z = larg / PW;
  cv.width = Math.round(larg * r); cv.height = Math.round(PH * z * r);
  const salva = aula; aula = a;
  desenharPagina(cv.getContext('2d'), pg, 0, 0, z, r, false, true);
  aula = salva;
  return cv;
}
function abrirMapa() {
  fecharPops(); limparSel(); renumerar();
  const g = $('#ma-mapa-grade'); g.innerHTML = '';
  aula.paginas.forEach((pg, i) => {
    const d = document.createElement('div'); d.className = 'ma-mini'; if (i === aula.atual) d.setAttribute('aria-current', 'true');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ma-mini-pg'; b.setAttribute('aria-label', 'Ir para a página ' + (i + 1));
    b.append(miniatura(pg, 240)); b.onclick = () => { fecharMapa(); irPara(i, true); };
    const rod = document.createElement('div'); rod.className = 'ma-mini-rod';
    rod.innerHTML = `<span>${i + 1}</span><button type="button" data-a="dup">Duplicar</button><button type="button" data-a="nova">Nova depois</button><button type="button" data-a="del">Apagar</button>`;
    rod.onclick = (e) => {
      const a = e.target.dataset.a; if (!a) return;
      if (a === 'dup') { aula.atual = inserirPagina(i, pg); }
      if (a === 'nova') { aula.atual = inserirPagina(i); }
      if (a === 'del') { apagarPagina(i); }
      atualizarNav(); abrirMapa();
    };
    d.append(b, rod); g.append(d);
  });
  $('#ma-mapa').hidden = false;
  // as questões das miniaturas aparecem quando as imagens chegarem
  Promise.all(aula.paginas.flatMap((pg) => pg.objs.map((o) => imagemQuestao(o.aula, o.lista, o.n, 800).then((cv) => { const k = `${o.aula}|${o.lista}|${o.n}`; if (!prontas.get(k)?.cv) prontas.set(k, { P: 800, cv }); }).catch(() => {}))))
    .then(() => { if (!$('#ma-mapa').hidden && g.childElementCount === aula.paginas.length) aula.paginas.forEach((pg, i) => { const b = g.children[i].querySelector('.ma-mini-pg'); b.replaceChildren(miniatura(pg, 240)); }); });
  g.children[aula.atual]?.scrollIntoView({ block: 'center' });
}
function fecharMapa() { $('#ma-mapa').hidden = true; pedirQuadro(); }

/* ---------- inserir questão ---------- */
let catalogo = null; // [{ id, titulo, bloco, frente }]
async function carregarCatalogo() {
  if (catalogo) return catalogo;
  const [aulas, mats] = await Promise.all([fetch('/data/aulas.json').then((r) => r.json()), fetch('/data/materiais.json').then((r) => r.json())]);
  const com = new Set(mats.map((m) => m.aula));
  const blocos = new Map(aulas.blocks.map((b) => [b.id, b])), frentes = new Map(aulas.fronts.map((f) => [f.id, f]));
  catalogo = aulas.lessons.filter((l) => com.has(l.id)).map((l) => ({ id: l.id, titulo: l.title, bloco: blocos.get(l.block)?.title || '', frente: frentes.get(l.front)?.name || '', vol: frentes.get(l.front)?.volume }));
  return catalogo;
}
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
async function abrirInserir() {
  fecharPops();
  $('#ma-inserir').hidden = false; $('#ma-inserir-btn').setAttribute('aria-expanded', 'true');
  await carregarCatalogo().catch(() => null);
  if (!catalogo) { $('#ma-aulas').innerHTML = '<p class="ma-grade-msg">Não consegui carregar as aulas. Verifique a internet.</p>'; return; }
  if (pref.aulaSite && catalogo.some((a) => a.id === pref.aulaSite)) mostrarQuestoes(); else mostrarBusca();
}
function fecharInserir() { $('#ma-inserir').hidden = true; $('#ma-inserir-btn').setAttribute('aria-expanded', 'false'); }
function mostrarBusca() {
  $('#ma-ins-busca').hidden = false; $('#ma-ins-questoes').hidden = true; $('#ma-ins-aula').setAttribute('aria-expanded', 'true');
  listarAulas($('#ma-busca').value);
  if (!matchMedia('(pointer:coarse)').matches) $('#ma-busca').focus();
  const atualEl = $('#ma-aulas [aria-current="true"]'); atualEl?.scrollIntoView({ block: 'center' });
}
function listarAulas(busca) {
  const b = semAcento(busca.trim()), el = $('#ma-aulas'); el.innerHTML = '';
  let grupo = null, n = 0;
  for (const a of catalogo) {
    if (b && !semAcento(`${a.id} ${a.titulo} ${a.bloco} ${a.frente}`).includes(b)) continue;
    const g = `Volume ${a.vol} · ${a.bloco}`;
    if (g !== grupo) { grupo = g; const h = document.createElement('h3'); h.textContent = g; el.append(h); }
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'ma-aula';
    if (a.id === pref.aulaSite) bt.setAttribute('aria-current', 'true');
    bt.innerHTML = `<code>${esc(a.id)}</code><span>${esc(a.titulo)}</span>`;
    bt.onclick = () => { pref.aulaSite = a.id; guardarPref(); mostrarQuestoes(); };
    el.append(bt); n++;
  }
  if (!n) el.innerHTML = '<p class="ma-grade-msg">Nenhuma aula com listas encontrada.</p>';
}
let obs = null, geracao = 0;
async function mostrarQuestoes() {
  const a = catalogo.find((x) => x.id === pref.aulaSite);
  $('#ma-ins-aula-t').textContent = `${a.id} · ${a.titulo}`;
  $('#ma-ins-busca').hidden = true; $('#ma-ins-questoes').hidden = false; $('#ma-ins-aula').setAttribute('aria-expanded', 'false');
  for (const b of document.querySelectorAll('.ma-abas button')) b.setAttribute('aria-selected', String(b.dataset.lista === pref.lista));
  const g = $('#ma-grade'), minha = ++geracao; g.innerHTML = '<p class="ma-grade-msg">Abrindo a lista…</p>';
  obs?.disconnect();
  let f;
  try { f = await fonte(a.id, pref.lista); } catch { if (minha === geracao) g.innerHTML = '<p class="ma-grade-msg">Esta lista ainda não tem versão para o caderno.</p>'; return; }
  if (minha !== geracao) return;
  g.innerHTML = '';
  obs = new IntersectionObserver((ents) => {
    for (const ent of ents) {
      if (!ent.isIntersecting) continue;
      const card = ent.target; obs.unobserve(card);
      imagemQuestao(a.id, pref.lista, +card.dataset.n, 880).then((cv) => {
        const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0);
        card.classList.remove('carregando'); card.append(c); if (c.height / c.width > 0.62) card.classList.add('longa');
      }).catch(() => { card.classList.remove('carregando'); });
    }
  }, { root: g, rootMargin: '300px' });
  f.mapa.questoes.forEach((q, i) => {
    const card = document.createElement('button'); card.type = 'button'; card.className = 'ma-qcard carregando'; card.dataset.n = i + 1;
    card.innerHTML = `<span class="n">${i + 1}</span><span class="nv">${esc(q.nivel || '')}</span>`;
    card.setAttribute('aria-label', `Inserir a questão ${i + 1}`);
    card.onclick = () => inserirQuestao(a.id, pref.lista, i + 1);
    g.append(card); obs.observe(card);
  });
}
async function inserirQuestao(aulaId, lista, n) {
  let info;
  try { info = await pecas(aulaId, lista, n); } catch { aviso('Não consegui abrir essa questão.'); return; }
  const pg = pagina(), antes = foto(pg);
  let w = 620, h = w * info.prop;
  if (h > PH - 50) { h = PH - 50; w = h / info.prop; }
  let x = 30, y = 25;
  if (pg.objs.length) { // embaixo da última, se couber; senão ao lado; senão um pouco deslocada
    const u = pg.objs[pg.objs.length - 1];
    if (u.y + u.h + 24 + h <= PH - 15) { x = u.x; y = u.y + u.h + 24; }
    else if (u.x + u.w + 30 + w <= PW - 20) { x = u.x + u.w + 30; y = 25; }
    else { x = Math.min(u.x + 36, PW - w - 20); y = Math.min(u.y + 36, PH - h - 20); }
  }
  const o = { id: novoId(), tipo: 'q', aula: aulaId, lista, n, x, y, w: Math.round(w), h: Math.round(h) };
  pg.objs.push(o); registrar(pg, antes);
  fecharInserir(); selecionar([], [o]);
  renumerar();
  aviso(`Questão ${o.num} inserida. Arraste para mover; a bolinha no canto muda o tamanho.`, 2600);
}

/* ---------- exportar a aula em PDF (vetorial: as questões entram como PDF, a escrita como desenho) ---------- */
async function exportar() {
  fecharPops(); renumerar();
  let folhas = aula.paginas.map((pg) => ({ objs: pg.objs, tracos: pg.tracos }));
  const dosAlunos = sala ? aula.paginas.flatMap(folhasDosAlunos).length + folhasDeExercicios().length : 0;
  if (dosAlunos && confirm(`Incluir no PDF as anotações e resoluções dos alunos (${dosAlunos} página${dosAlunos > 1 ? 's' : ''} a mais)?`)) {
    folhas = aula.paginas.flatMap((pg) => [{ objs: pg.objs, tracos: pg.tracos }, ...folhasDosAlunos(pg)]).concat(folhasDeExercicios());
  }
  aviso('Montando o PDF…', 60000);
  try {
    const { PDFDocument, rgb, BlendMode, StandardFonts } = await import('/assets/vendor/pdf-lib.esm.min.js');
    const out = await PDFDocument.create(), s = 841.89 / PW, H = PH * s;
    const negrito = await out.embedFont(StandardFonts.HelveticaBold);
    const cor = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
    const fontesPdf = new Map();
    const docDe = async (o) => { const k = o.aula + '|' + o.lista; if (!fontesPdf.has(k)) { const f = await fonte(o.aula, o.lista); fontesPdf.set(k, PDFDocument.load(await (await fetch(f.url)).arrayBuffer())); } return fontesPdf.get(k); };
    for (const folha of folhas) {
      const papelF = folha.papel || aula.papel;
      const page = out.addPage([841.89, H]);
      page.drawRectangle({ x: 0, y: 0, width: 841.89, height: H, color: cor(PAPEL) });
      const Y = (y) => H - y * s;
      if (papelF === 'pontilhado') { for (let y = PASSO; y < PH; y += PASSO) for (let x = PASSO; x < PW; x += PASSO) page.drawCircle({ x: x * s, y: Y(y), size: 0.75, color: cor(COR_PAPEL.ponto) }); }
      else if (papelF === 'quadriculado' || papelF === 'pautado') {
        const p = papelF === 'pautado' ? 32 : PASSO, cl = cor(papelF === 'pautado' ? COR_PAPEL.pauta : COR_PAPEL.linha);
        if (papelF === 'quadriculado') for (let x = p; x < PW; x += p) page.drawLine({ start: { x: x * s, y: 0 }, end: { x: x * s, y: H }, thickness: 0.5, color: cl });
        for (let y = papelF === 'pautado' ? 64 : p; y < PH; y += p) page.drawLine({ start: { x: 0, y: Y(y) }, end: { x: 841.89, y: Y(y) }, thickness: 0.5, color: cl });
      }
      for (const o of folha.objs) {
        page.drawRectangle({ x: o.x * s, y: Y(o.y + o.h), width: o.w * s, height: o.h * s, color: rgb(1, 1, 1), borderColor: cor('#d9d4e8'), borderWidth: 0.6 });
        try {
          const doc = await docDe(o), { lista: ps } = await pecas(o.aula, o.lista, o.n), larg = ps[0].c[2] - ps[0].c[0], k = o.w / larg;
          let y = o.y;
          for (const { pg: n, c } of ps) {
            const src = doc.getPage(n - 1), hp = src.getHeight();
            const emb = await out.embedPage(src, { left: c[0], right: c[2], bottom: hp - c[3], top: hp - c[1] });
            const h = (c[3] - c[1]) * k;
            page.drawPage(emb, { x: o.x * s, y: Y(y + h), width: o.w * s, height: h * s });
            y += h + GAP_PECA * k;
          }
          if (o.num != null) { // o selo com o número da aula
            const kq = (o.w / CW_Q) * s, txt = `Questão ${o.num}`, tam = SELO.fonte * 0.92 * kq, tw = negrito.widthOfTextAtSize(txt, tam);
            const X0 = o.x * s, Y0 = Y(o.y);
            page.drawRectangle({ x: X0 + 1 * kq, y: Y0 - SELO.faixa * kq, width: (CW_Q - 2) * kq, height: (SELO.faixa - 1) * kq, color: rgb(1, 1, 1) });
            page.drawRectangle({ x: X0 + SELO.x * kq, y: Y0 - (SELO.y + SELO.h) * kq, width: tw + 14 * kq, height: SELO.h * kq, borderColor: cor('#4a27b7'), borderWidth: 1.1 * kq });
            page.drawText(txt, { x: X0 + (SELO.x + 7) * kq, y: Y0 - (SELO.y + SELO.h / 2 + 4.6) * kq, size: tam, font: negrito, color: cor('#4a27b7') });
          }
        } catch (e) { console.warn(e); }
      }
      for (const t of folha.tracos) {
        const path = caminho(contorno(t, s)); if (!path) continue;
        page.drawSvgPath(path, { x: 0, y: H, color: cor(t.c), borderWidth: 0, ...(t.f === 'marca' ? { opacity: 0.38, blendMode: BlendMode.Multiply } : {}) });
      }
      if (folha.rotulo) { // de quem são as anotações
        const txt = folha.rotulo.normalize('NFC').replace(/[^\x20-\xff]/g, '?'), tam = 10, tw = negrito.widthOfTextAtSize(txt, tam);
        page.drawRectangle({ x: 841.89 - tw - 26, y: H - 26, width: tw + 16, height: 18, color: cor('#211946') });
        page.drawText(txt, { x: 841.89 - tw - 18, y: H - 20.5, size: tam, font: negrito, color: cor('#d3fc61') });
      }
    }
    const bytes = await out.save();
    aviso('', 1);
    await entregar(new File([bytes], `${slug(aula.titulo)}.pdf`, { type: 'application/pdf' }));
  } catch (e) { console.error(e); aviso('Não consegui montar o PDF. Tente de novo.', 4000); }
}
async function entregar(arq) {
  if (navigator.canShare?.({ files: [arq] }) && matchMedia('(pointer:coarse)').matches) {
    try { await navigator.share({ files: [arq], title: arq.name }); return; } catch (e) { if (e?.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(arq), a = document.createElement('a'); a.href = url; a.download = arq.name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  aviso('PDF baixado: ' + arq.name, 3000);
}
const slug = (s) => semAcento(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'aula';

/* ---------- minhas aulas ---------- */
const dataCurta = (t) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
async function mostrarInicio() {
  if (aula) await salvar(true);
  aula = null; desfazer = []; refazer = []; sel = null; fecharInserir(); fecharMapa();
  document.body.dataset.tela = 'inicio';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  const todas = (await banco.todas()).sort((a, b) => (b.editada || 0) - (a.editada || 0));
  const ul = $('#ma-lista'); ul.innerHTML = '';
  $('#ma-vazio').hidden = todas.length > 0;
  for (const a of todas) {
    const li = document.createElement('li'); li.className = 'ma-card';
    const abrirBt = document.createElement('button'); abrirBt.type = 'button'; abrirBt.className = 'ma-card-abrir';
    const capa = document.createElement('div'); capa.className = 'ma-card-capa'; capa.append(miniatura(a.paginas[0], 260, a));
    const txt = document.createElement('div'); txt.className = 'ma-card-txt';
    txt.innerHTML = `<b>${esc(a.titulo)}</b><small>${a.paginas.length} página${a.paginas.length > 1 ? 's' : ''} · editada em ${dataCurta(a.editada || a.criada)}</small>`;
    abrirBt.append(capa, txt); abrirBt.onclick = () => abrirAula(a.id);
    const acoes = document.createElement('div'); acoes.className = 'ma-card-acoes';
    acoes.innerHTML = '<button type="button" data-a="ren">Renomear</button><button type="button" data-a="dup">Duplicar</button><button type="button" data-a="del">Apagar</button>';
    acoes.onclick = async (e) => {
      const x = e.target.dataset.a; if (!x) return;
      if (x === 'ren') { const t = prompt('Nome da aula', a.titulo); if (t?.trim()) { a.titulo = t.trim(); await banco.gravar(a); } }
      if (x === 'dup') { const c = structuredClone(a); c.id = novoId(); c.titulo = a.titulo + ' (cópia)'; c.criada = c.editada = Date.now(); await banco.gravar(c); }
      if (x === 'del' && confirm(`Apagar a aula "${a.titulo}"? Isso não tem volta.`)) await banco.apagar(a.id);
      mostrarInicio();
    };
    li.append(abrirBt, acoes); ul.append(li);
  }
}
async function novaAula() {
  const agora = Date.now();
  const a = { id: novoId(), titulo: 'Aula de ' + new Date(agora).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), criada: agora, editada: agora, papel: 'pontilhado', atual: 0, paginas: [novaPagina()] };
  await banco.gravar(a); abrirAula(a.id);
}
async function abrirAula(id) {
  const a = await banco.ler(id); if (!a) { mostrarInicio(); return; }
  aula = a; aula.atual = limitar(aula.atual || 0, 0, aula.paginas.length - 1); aula.papel ||= 'pontilhado';
  desfazer = []; refazer = []; sel = null; botoes();
  document.body.dataset.tela = 'aula';
  history.replaceState(null, '', location.pathname + location.search + '#a=' + id);
  $('#ma-titulo').textContent = aula.titulo; document.title = aula.titulo + ' · Modo aula';
  $('#ma-papel').value = aula.papel;
  requestAnimationFrame(() => { medir(); V = vistaAjustada(); atualizarNav(); pedirQuadro(); mudouPagina(); });
}


/* ---------- barra: ferramentas, cores, estilo e espessura ---------- */
function amostraTraco(cv, f, e, s, c, k = 1) {
  const r = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || cv.width, h = cv.clientHeight || cv.height;
  cv.width = Math.round(w * r); cv.height = Math.round(h * r);
  const ctx = cv.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0); ctx.clearRect(0, 0, w, h);
  desenhaTracoVivo(ctx, { ...tracoExemplo(f, e, Math.min(s * k, h * 0.38 / (e === 'pincel' ? 2.3 : 1)), c, w, h) });
}
function pintarBarra() {
  const f = pref.ferramenta === 'marca' ? 'marca' : 'caneta', cores = $('#ma-cores');
  document.body.dataset.ferramenta = pref.ferramenta;
  for (const b of document.querySelectorAll('.ma-bar-meio [data-ferramenta]')) b.setAttribute('aria-pressed', String(b.dataset.ferramenta === pref.ferramenta));
  cores.innerHTML = '';
  for (const [nome, c] of CORES[f]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ma-cor'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', nome); b.title = nome;
    b.setAttribute('aria-checked', String(pref.cor[f] === c)); b.style.setProperty('--c', c); b.innerHTML = '<span></span>';
    b.onclick = () => { pref.cor[f] = c; if (!['caneta', 'marca'].includes(pref.ferramenta)) pref.ferramenta = f; guardarPref(); pintarBarra(); };
    cores.append(b);
  }
  amostraTraco($('#ma-traco-amostra'), f, pref.estilo, pref.esp[f], pref.cor[f], 1.4);
  if (!$('#ma-painel').hidden) pintarPainel();
}
function pintarPainel() {
  const f = pref.ferramenta === 'marca' ? 'marca' : 'caneta';
  $('#ma-estilos-sec').hidden = f === 'marca';
  const est = $('#ma-estilos'); est.innerHTML = '';
  for (const [id, nome] of ESTILOS) {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(pref.estilo === id));
    const cv = document.createElement('canvas'); b.append(cv, nome);
    b.onclick = () => { pref.estilo = id; pref.ferramenta = 'caneta'; guardarPref(); pintarBarra(); };
    est.append(b); requestAnimationFrame(() => amostraTraco(cv, 'caneta', id, pref.esp.caneta, pref.cor.caneta, 1.2));
  }
  const tams = $('#ma-tams'); tams.innerHTML = '';
  ['Fina', 'Média', 'Grossa'].forEach((nome, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = nome;
    b.setAttribute('aria-checked', String(Math.abs(pref.esp[f] - ESPS[f][i]) < 0.01));
    b.onclick = () => { pref.esp[f] = ESPS[f][i]; guardarPref(); pintarBarra(); };
    tams.append(b);
  });
  $('#ma-esp').value = paraControle(f, pref.esp[f]);
  const mult = f === 'caneta' && pref.estilo === 'pincel' ? 2.3 : 1;
  $('#ma-esp-valor').textContent = (pref.esp[f] * mult).toFixed(1).replace('.', ',');
  const pv = $('#ma-previa'); requestAnimationFrame(() => amostraTraco(pv, f, pref.estilo, pref.esp[f], pref.cor[f], V.z || 1));
}
function abrirPainel() {
  const pn = $('#ma-painel'), abrir = pn.hidden; fecharPops();
  if (!abrir) return;
  if (!['caneta', 'marca'].includes(pref.ferramenta)) { pref.ferramenta = 'caneta'; guardarPref(); pintarBarra(); }
  pn.hidden = false; $('#ma-traco').setAttribute('aria-expanded', 'true'); pintarPainel();
}
function montarBarra() {
  for (const b of document.querySelectorAll('.ma-bar-meio [data-ferramenta]')) b.onclick = () => {
    const f = b.dataset.ferramenta;
    if (f === pref.ferramenta && (f === 'caneta' || f === 'marca')) { abrirPainel(); return; } // tocar de novo abre estilo e espessura
    pref.ferramenta = f; if (f !== 'laco') limparSel(); guardarPref(); pintarBarra();
  };
  on('#ma-traco', 'click', (e) => { e.stopPropagation(); abrirPainel(); });
  on('#ma-esp', 'input', (e) => { const f = pref.ferramenta === 'marca' ? 'marca' : 'caneta'; pref.esp[f] = deControle(f, +e.target.value); guardarPref(); pintarBarra(); });
  pintarBarra();
}
function fecharPops() {
  for (const [p, b] of [['#ma-menu', '#ma-mais-btn'], ['#ma-painel', '#ma-traco'], ['#ma-sala', '#ma-sala-btn']]) { const el = $(p); if (el) el.hidden = true; $(b)?.setAttribute('aria-expanded', 'false'); }
}

/* ---------- aula ao vivo ----------
   O professor abre uma sala (código de 4 letras); os alunos entram em /ao-vivo/ pelo iPad.
   Modo "aula": os alunos veem a página atual do professor, com a escrita aparecendo enquanto ele escreve.
   Modo "exercício": cada aluno resolve na própria cópia da página proposta, e o professor vê todas ao vivo.
   O servidor (worker/index.js) só repassa as mensagens; cada aparelho é dono do que escreve. */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const aleatorio = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)));
const gerarCodigo = () => aleatorio(4).map((b) => ALFABETO[b % ALFABETO.length]).join('');
const gerarToken = () => aleatorio(18).map((b) => b.toString(16).padStart(2, '0')).join('');
const enderecoSala = (c) => `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/sala/${c}/ws`;
class Conexao {
  constructor(codigo, ola, aoReceber, aoMudar) { Object.assign(this, { codigo, ola, aoReceber, aoMudar, tentativas: 0, fechada: false }); this.abrir(); }
  abrir() {
    if (this.fechada) return;
    let ws; try { ws = new WebSocket(enderecoSala(this.codigo)); } catch { this.depois(); return; }
    this.ws = ws;
    ws.onopen = () => { this.tentativas = 0; ws.send(JSON.stringify(this.ola())); this.aoMudar(true); this.ping = setInterval(() => { try { ws.send('{"t":"ping"}'); } catch {} }, 25000); };
    ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch { return; } this.aoReceber(m); };
    ws.onclose = (e) => {
      clearInterval(this.ping); if (this.ws !== ws) return;
      this.aoMudar(false);
      if (e.code === 4000) { this.fechada = true; aviso('A sala foi aberta em outro aparelho.', 4000); return; }
      if (e.code === 1008 || e.reason === 'encerrada') return;
      this.depois();
    };
  }
  depois() { if (this.fechada) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.abrir(), Math.min(8000, 500 * 2 ** this.tentativas++)); }
  enviar(m) { if (this.ws?.readyState !== 1) return false; const txt = JSON.stringify(m); if (txt.length > 900 * 1024) { aviso('Página grande demais para mandar ao vivo.'); return false; } this.ws.send(txt); return true; }
  fechar() { this.fechada = true; clearTimeout(this.timer); clearInterval(this.ping); try { this.ws?.close(1000); } catch {} }
  get aberta() { return this.ws?.readyState === 1; }
}
let sala = null; // professor: { codigo, token, chave, con, online, alunos: Map, exercicio, exercicios: [] }
const av = { con: null, codigo: '', chave: '', nome: '', id: '', modo: 'aula', exercicio: null, profOnline: false, dedo: false, notas: {}, prof: null }; // aluno
const conexao = () => (ALUNO ? av.con : sala?.con);
function transmitir(m) { conexao()?.enviar(m); }
const cabecaTraco = (t) => ({ f: t.f, e: t.e, c: t.c, s: t.s, pen: t.pen });
function renumerar() { // as questões da aula são numeradas na ordem em que aparecem: 1, 2, 3…
  if (ALUNO || !aula?.paginas) return;
  let n = 0; for (const pg of aula.paginas) for (const o of pg.objs) o.num = ++n;
}
const paginaEnvio = (pg) => { renumerar(); return { id: pg.id, papel: aula.papel, objs: pg.objs.map((o) => ({ ...o })), tracos: pg.tracos }; };
const pidAluno = () => (av.exercicio ? 'ex-' + av.exercicio.eid : av.prof?.id || 'espera');
let timerPag = 0;
function mudouPagina(op) {
  if (!ALUNO && !$('#ma-resol')?.hidden) redesenharResol();
  if (!aula || !conexao()) return;
  if (ALUNO) {
    guardarTrabalho();
    const pid = pidAluno();
    if (op) { transmitir({ ...op, pid }); return; }
    clearTimeout(timerPag); timerPag = setTimeout(() => transmitir({ t: 'pagina', pid, pagina: { tracos: pagina().tracos } }), 80);
    return;
  }
  if (op) { transmitir(op); return; }
  clearTimeout(timerPag);
  timerPag = setTimeout(() => { if (aula?.paginas) transmitir({ t: 'pagina', pagina: paginaEnvio(pagina()) }); }, 80);
}
function aoVivo(a, fim) { // manda o traço (ou o laser) enquanto ele é escrito, aos pedaços
  if (!conexao()) return;
  if (fim) { clearTimeout(a.timerVivo); enviarVivo(a, true); return; }
  if (a.timerVivo) return;
  a.timerVivo = setTimeout(() => { a.timerVivo = 0; if (atual === a) enviarVivo(a); }, 45);
}
function enviarVivo(a, fim) {
  if (a.laser) { if (ALUNO) return; const pts = a.laser.pts.slice(a.enviados).map(([x, y]) => [x, y]); a.enviados = a.laser.pts.length; transmitir({ t: 'laser', id: a.laser.id, p: pts, fim: !!fim }); return; }
  const t = a.traco; if (!t) return;
  transmitir({ t: 'vivo', id: t.id, pid: ALUNO ? pidAluno() : undefined, ini: a.enviados ? undefined : cabecaTraco(t), p: t.p.slice(a.enviados) }); a.enviados = t.p.length;
}
function aplicarVivo(mapa, m) {
  if (m.fim) { mapa.delete(m.id); return; }
  let t = mapa.get(m.id);
  if (m.refaz || !t) { if (!m.ini && !t) return; t = { ...(m.ini || t), id: m.id, p: [] }; mapa.set(m.id, t); }
  for (const p of m.p || []) t.p.push(p);
}
function receberLaser(m) {
  let l = lasers.find((x) => x.id === m.id);
  if (!l) { l = { id: m.id, pts: [] }; lasers.push(l); }
  const t = performance.now(); for (const [x, y] of m.p || []) l.pts.push([x, y, t]);
  if (m.fim) l.fim = t;
  animarLaser();
}
let quadroImg = 0;
function imagensMudaram() { pedirQuadro(); if (!quadroImg) quadroImg = requestAnimationFrame(() => { quadroImg = 0; if (!ALUNO && !$('#ma-resol').hidden) redesenharResol(); }); }

/* --- professor --- */
const linkEntrada = () => `${location.origin}/ao-vivo/#s=${sala.codigo}.${sala.chave}`;
function abrirSala(salvo) {
  const novo = !salvo;
  sala = { codigo: salvo?.codigo || gerarCodigo(), token: salvo?.token || gerarToken(), chave: salvo?.chave || gerarToken().slice(0, 12), con: null, online: false,
    alunos: new Map(), exercicio: salvo?.exercicio || null, exercicios: salvo?.exercicios || [] };
  guardarSala();
  sala.con = new Conexao(sala.codigo, () => ({ t: 'ola', papel: 'prof', token: sala.token, chave: sala.chave }), recebeProf, (ok) => { if (!sala) return; sala.online = ok; pintarSala(); });
  pintarSala();
  if (novo) mostrarQR(false);
}
function guardarSala() {
  try {
    if (sala) localStorage.setItem('ma:sala', JSON.stringify({ codigo: sala.codigo, token: sala.token, chave: sala.chave, exercicio: sala.exercicio, exercicios: sala.exercicios.slice(-20) }));
    else localStorage.removeItem('ma:sala');
  } catch {}
}
function fecharSala() {
  if (!sala) return;
  if (!confirm('Fechar a sala? Os alunos saem da aula ao vivo e o QR Code deixa de valer.')) return;
  sala.con.enviar({ t: 'encerrar' }); const c = sala.con; setTimeout(() => c.fechar(), 300);
  sala = null; guardarSala(); pintarSala(); fecharResol(); fecharQR();
}
/* QR Code de entrada: cada vez que é mostrado, nasce uma chave nova (quem já entrou continua; links antigos param de valer) */
let qrLib = null;
async function mostrarQR(trocar = true) {
  if (!sala) return; fecharPops();
  if (trocar) { sala.chave = gerarToken().slice(0, 12); guardarSala(); sala.con.enviar({ t: 'chave', chave: sala.chave }); }
  qrLib ||= (await import('/assets/vendor/qrcode.mjs')).default;
  const q = qrLib(0, 'M'); q.addData(linkEntrada()); q.make();
  const n = q.getModuleCount(), cv = $('#ma-qr-cv'), px = Math.min(520, Math.round(Math.min(innerWidth, innerHeight) * 0.6)), r = Math.min(devicePixelRatio || 1, 2);
  const m = 3, cel = (px * r) / (n + 2 * m);
  cv.width = cv.height = Math.round(px * r); cv.style.width = cv.style.height = px + 'px';
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.fillStyle = '#211946';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) ctx.fillRect(Math.floor((x + m) * cel), Math.floor((y + m) * cel), Math.ceil(cel), Math.ceil(cel));
  $('#ma-qr').hidden = false;
}
function fecharQR() { const el = $('#ma-qr'); if (el) el.hidden = true; }
async function copiarLink() {
  if (!sala) return;
  const url = linkEntrada();
  try { if (navigator.share && matchMedia('(pointer:coarse)').matches) { await navigator.share({ url, title: 'Aula ao vivo' }); return; } } catch (e) { if (e?.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); aviso('Link de entrada copiado. Mande para o aluno.', 2400); } catch { prompt('Copie o link de entrada:', url); }
}
function recebeProf(m) {
  if (!sala) return;
  if (m.t === 'bemvindo') {
    if (aula?.paginas) sala.con.enviar({ t: 'pagina', pagina: paginaEnvio(pagina()) });
    if (sala.exercicio) sala.con.enviar({ t: 'exercicio', pagina: sala.exercicio });
    return;
  }
  if (m.t === 'erro') { aviso(m.msg, 5000); if (m.fatal) { sala.con.fechar(); sala = null; guardarSala(); pintarSala(); } return; }
  if (m.t === 'alunos') {
    const vistos = new Set();
    for (const x of m.lista) { vistos.add(x.id); const a = alunoProf(x.id); a.nome = x.nome; a.online = x.online; }
    for (const [id, a] of sala.alunos) if (!vistos.has(id)) a.online = false;
    pintarSala(); if (!$('#ma-resol').hidden) montarResol();
    return;
  }
  if (m.t === 'aluno') {
    const a = alunoProf(m.id), op = m.op || {}, pid = op.pid;
    if (!pid) return;
    if (op.t === 'pagina') { a.camadas.set(pid, op.pagina?.tracos || []); for (const [k, t] of a.vivos) if (t.pid === pid) a.vivos.delete(k); }
    else if (op.t === 'add' && op.traco) { if (!a.camadas.has(pid)) a.camadas.set(pid, []); a.camadas.get(pid).push(op.traco); a.vivos.delete(op.traco.id); }
    else if (op.t === 'vivo') { aplicarVivo(a.vivos, op); const t = a.vivos.get(op.id); if (t) t.pid = pid; }
    atualizarResol(m.id);
  }
}
function alunoProf(id) { let a = sala.alunos.get(id); if (!a) { a = { nome: 'Aluno', online: true, camadas: new Map(), vivos: new Map() }; sala.alunos.set(id, a); } return a; }
function pintarSala() {
  const btn = $('#ma-sala-btn'); if (!btn) return;
  const n = sala ? [...sala.alunos.values()].filter((a) => a.online).length : 0;
  btn.dataset.on = sala ? '1' : '0';
  const badge = $('#ma-turma-n'); badge.hidden = !sala || !n; badge.textContent = n;
  $('#ma-sala-fechada').hidden = !!sala; $('#ma-sala-aberta').hidden = !sala;
  if (!sala) return;
  $('#ma-sala-con').textContent = !sala.online ? 'Conectando ao servidor…' : sala.exercicio ? 'Exercício em andamento: cada aluno resolve na própria cópia.' : 'Ao vivo: os alunos veem a sua página e podem anotar por cima (só eles e você veem).';
  $('#ma-ex-propor').hidden = !!sala.exercicio; $('#ma-ex-fim').hidden = !sala.exercicio;
  const lista = [...sala.alunos.values()].sort((a, b) => b.online - a.online || a.nome.localeCompare(b.nome));
  $('#ma-sala-n').textContent = n ? `${n} aluno${n > 1 ? 's' : ''} na sala` : 'Ninguém entrou ainda';
  $('#ma-sala-alunos').innerHTML = lista.map((a) => `<li class="${a.online ? '' : 'off'}">${esc(a.nome)}</li>`).join('');
}
function proporExercicio() {
  if (!sala || !aula) return;
  const pg = paginaEnvio(pagina());
  sala.exercicio = { eid: novoId(), papel: aula.papel, objs: pg.objs, tracos: pg.tracos.slice(), pagina: aula.atual + 1 };
  sala.exercicios.push(sala.exercicio);
  sala.con.enviar({ t: 'exercicio', pagina: sala.exercicio }); guardarSala(); pintarSala();
  fecharPops(); abrirResol();
  aviso('Exercício enviado. Cada aluno resolve na própria cópia; você acompanha aqui.', 3000);
}
function encerrarExercicio() {
  if (!sala?.exercicio) return;
  sala.exercicio = null;
  sala.con.enviar({ t: 'exercicio', pagina: null }); guardarSala(); pintarSala();
  if (!$('#ma-resol').hidden) montarResol();
  aviso('Exercício encerrado. Os alunos voltam a acompanhar a sua página.', 2600);
}
/* o que cada aluno está vendo e escrevendo, ao vivo */
let resolAberta = null; // id do aluno na tela grande
const cartoes = new Map();
function vistaDoAluno(a) { // { base, pid }: a página que o aluno tem na frente agora
  if (sala.exercicio) return { base: sala.exercicio, pid: 'ex-' + sala.exercicio.eid, ex: true };
  if (!aula?.paginas) return null;
  return { base: paginaEnvio(pagina()), pid: pagina().id, ex: false };
}
function paginaDoAluno(a) {
  const v = vistaDoAluno(a); if (!v) return null;
  return { id: 'r', objs: v.base.objs, fixos: v.base.tracos, tracos: a.camadas.get(v.pid) || [], extras: [...a.vivos.values()].filter((t) => t.pid === v.pid) };
}
function garantirImagens(objs) { return Promise.all(objs.map((o) => imagemQuestao(o.aula, o.lista, o.n, 800).then((cv) => { const k = `${o.aula}|${o.lista}|${o.n}`; if (!prontas.get(k)?.cv) prontas.set(k, { P: 800, cv }); }).catch(() => {}))); }
function abrirResol() {
  if (!sala) return; fecharPops();
  $('#ma-resol').hidden = false; $('#ma-resol-grande').hidden = true; resolAberta = null;
  montarResol();
  garantirImagens(sala.exercicio?.objs || pagina()?.objs || []).then(redesenharResol);
}
function fecharResol() { const r = $('#ma-resol'); if (r) r.hidden = true; resolAberta = null; cartoes.clear(); pedirQuadro(); }
function montarResol() {
  const g = $('#ma-resol-grade'); g.innerHTML = ''; cartoes.clear();
  const lista = [...sala.alunos].sort(([, a], [, b]) => a.nome.localeCompare(b.nome));
  $('#ma-resol-info').textContent = sala.exercicio ? 'Exercício: a cópia de cada aluno, ao vivo. Toque para ver grande.' : `Página ${aula ? aula.atual + 1 : ''} com as anotações de cada aluno, ao vivo. Toque para ver grande.`;
  if (!lista.length) { g.innerHTML = '<p class="ma-grade-msg">Ninguém entrou na sala ainda. Mostre o QR Code ou mande o link de entrada.</p>'; return; }
  for (const [id, a] of lista) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ma-resol-card';
    const cv = document.createElement('canvas'), nome = document.createElement('b'); nome.textContent = a.nome;
    b.append(cv, nome); b.onclick = () => abrirResolGrande(id);
    g.append(b); cartoes.set(id, { b, cv });
  }
  requestAnimationFrame(redesenharResol);
}
function desenharNoCanvas(cv, pg, papelTipo, mini) {
  const r = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
  cv.width = Math.round(w * r); cv.height = Math.round(h * r);
  const ctx = cv.getContext('2d'); ctx.fillStyle = MESA; ctx.fillRect(0, 0, cv.width, cv.height);
  if (!pg) return;
  const m = mini ? 0 : 6, z = Math.min((w - 2 * m) / PW, (h - 2 * m) / PH), tx = (w - PW * z) / 2, ty = (h - PH * z) / 2;
  const salva = aula; aula = { papel: papelTipo || 'pontilhado' };
  try { desenharPagina(ctx, pg, tx, ty, z, r, false, mini); } finally { aula = salva; }
}
const papelVisto = () => sala?.exercicio?.papel || aula?.papel;
function desenharCartao(id) {
  const c = cartoes.get(id), a = sala?.alunos.get(id); if (!c || !a) return;
  const pg = paginaDoAluno(a);
  c.b.classList.toggle('off', !a.online); c.b.classList.toggle('escrevendo', !!pg?.extras.length);
  desenharNoCanvas(c.cv, pg, papelVisto(), true);
}
function redesenharResol() { if (!sala || $('#ma-resol').hidden) return; for (const id of cartoes.keys()) desenharCartao(id); if (resolAberta) desenharGrande(); }
const pendentes = new Set(); let quadroResol = 0;
function atualizarResol(id) {
  if ($('#ma-resol')?.hidden) return;
  pendentes.add(id);
  if (!quadroResol) quadroResol = requestAnimationFrame(() => { quadroResol = 0; for (const x of pendentes) { if (!cartoes.has(x)) { montarResol(); break; } desenharCartao(x); } pendentes.clear(); if (resolAberta && sala.alunos.has(resolAberta)) desenharGrande(); });
}
function abrirResolGrande(id) {
  resolAberta = id; $('#ma-resol-nome').textContent = sala.alunos.get(id)?.nome || '';
  $('#ma-resol-copiar').textContent = sala.exercicio ? 'Copiar como página nova' : 'Trazer para a minha página';
  $('#ma-resol-grande').hidden = false; requestAnimationFrame(desenharGrande);
}
function desenharGrande() { const a = sala?.alunos.get(resolAberta); if (!a) return; desenharNoCanvas($('#ma-resol-cv'), paginaDoAluno(a), papelVisto(), false); }
const copiarTracos = (ts) => ts.map((t) => ({ ...t, id: novoId() }));
function trazerDoAluno() {
  const a = sala?.alunos.get(resolAberta), v = a && vistaDoAluno(a); if (!v || !aula?.paginas) return;
  const seus = a.camadas.get(v.pid) || [];
  if (v.ex) { // exercício: vira uma página nova da aula
    const i = inserirPagina(aula.atual, { tracos: [...v.base.tracos, ...copiarTracos(seus)], objs: v.base.objs });
    fecharResol(); irPara(i, true);
    aviso(`Resolução de ${a.nome} copiada para a página ${i + 1}.`, 2600); return;
  }
  if (!seus.length) { aviso(`${a.nome} ainda não anotou nada nesta página.`); return; }
  const pg = pagina(), antes = foto(pg); pg.tracos.push(...copiarTracos(seus)); registrar(pg, antes);
  fecharResol(); pedirQuadro();
  aviso(`As anotações de ${a.nome} vieram para a sua página.`, 2600);
}
/* no PDF: depois de cada página, as anotações de cada aluno; no fim, as resoluções dos exercícios */
function folhasDosAlunos(pg) {
  if (!sala) return [];
  const out = [];
  for (const a of sala.alunos.values()) { const ts = a.camadas.get(pg.id); if (ts?.length) out.push({ objs: pg.objs, tracos: [...pg.tracos, ...ts], rotulo: `Anotações de ${a.nome}` }); }
  return out;
}
function folhasDeExercicios() {
  if (!sala) return [];
  const out = [];
  for (const ex of sala.exercicios) for (const a of sala.alunos.values()) {
    const ts = a.camadas.get('ex-' + ex.eid); if (ts?.length) out.push({ objs: ex.objs, tracos: [...ex.tracos, ...ts], papel: ex.papel, rotulo: `Exercício (página ${ex.pagina || '?'}) · resolução de ${a.nome}` });
  }
  return out;
}

/* --- aluno --- */
const chaveNotas = () => 'av:notas:' + av.codigo;
function lerNotas() { try { return JSON.parse(localStorage.getItem(chaveNotas()) || '{}'); } catch { return {}; } }
function guardarTrabalho() {
  if (!ALUNO || !aula) return;
  av.notas[pidAluno()] = pagina().tracos;
  try { localStorage.setItem(chaveNotas(), JSON.stringify(av.notas)); } catch {}
}
function telaEntrar(erro, limpar = true) {
  av.con?.fechar(); av.con = null; aula = null; remotos.clear();
  if (limpar) try { sessionStorage.removeItem('av:sala'); } catch {}
  document.body.dataset.tela = 'entrar';
  const tem = !!(av.codigo && av.chave);
  $('#av-form').hidden = !tem || !!erro; $('#av-sem').hidden = tem && !erro;
  const e = $('#av-erro'); e.hidden = !erro; e.textContent = erro || '';
}
function entrarNaSala(nome) {
  nome = nome.trim().slice(0, 40); if (!nome) { $('#av-nome').focus(); return; }
  try { localStorage.setItem('av:nome', nome); sessionStorage.setItem('av:sala', av.codigo + '.' + av.chave); } catch {}
  Object.assign(av, { nome, modo: 'aula', exercicio: null, profOnline: false, prof: null });
  av.notas = lerNotas();
  aula = { papel: 'pontilhado', atual: 0, paginas: [{ id: 'espera', objs: [], fixos: [], tracos: [] }] };
  desfazer = []; refazer = []; botoes(); sel = null;
  document.body.dataset.tela = 'aula'; pintarAluno();
  requestAnimationFrame(() => { medir(); V = vistaAjustada(); pedirQuadro(); });
  av.con = new Conexao(av.codigo, () => ({ t: 'ola', papel: 'aluno', id: av.id, nome, chave: av.chave }), recebeAluno, (ok) => { av.online = ok; pintarAluno(); });
}
function pintarAluno() {
  $('#av-con').dataset.on = av.online ? '1' : '0';
  $('#av-estado').textContent = av.exercicio ? 'Exercício: resolva nesta página' : 'Acompanhando a aula';
  $('#av-sub').textContent = !av.online ? 'Conectando…' : !av.profOnline ? 'O professor ainda não está na sala' : av.exercicio ? 'O professor vê o que você escreve' : 'Suas anotações: só você e o professor veem';
  document.body.dataset.modo = av.exercicio ? 'exercicio' : 'aula';
}
function montarPaginaAluno(base, pid, ex) { // a página do professor (ou do exercício) por baixo, e as anotações do aluno por cima
  const trocou = pagina().id !== pid;
  if (trocou) { cancelarTraco(); limparSel(); desfazer = []; refazer = []; botoes(); }
  aula.papel = base?.papel || 'pontilhado';
  aula.paginas = [{ id: pid, objs: base?.objs || [], fixos: base?.tracos || [], tracos: trocou ? (av.notas[pid] || []) : pagina().tracos }];
  remotos.clear();
  if (trocou) { V = vistaAjustada(); $('#ma-zoomtag').hidden = true; if (aula.paginas[0].tracos.length) av.con.enviar({ t: 'pagina', pid, pagina: { tracos: aula.paginas[0].tracos } }); }
  pedirQuadro();
}
function recebeAluno(m) {
  switch (m.t) {
    case 'erro': if (m.fatal) telaEntrar(m.msg); else aviso(m.msg, 4000); return;
    case 'encerrada': telaEntrar('O professor encerrou a aula ao vivo.'); return;
    case 'prof': av.profOnline = m.online; pintarAluno(); return;
    case 'estado': {
      av.profOnline = m.profOnline; av.prof = m.pagina || av.prof;
      const tinha = av.exercicio;
      if (m.modo === 'exercicio' && m.exercicio) {
        av.exercicio = m.exercicio; av.modo = 'exercicio';
        montarPaginaAluno(m.exercicio, 'ex-' + m.exercicio.eid, true);
        if (tinha?.eid !== m.exercicio.eid) aviso('O professor propôs um exercício. Resolva nesta página: ele acompanha o que você escreve.', 4000);
      } else {
        av.exercicio = null; av.modo = 'aula';
        montarPaginaAluno(av.prof, av.prof?.id || 'espera', false);
        if (tinha) aviso('Exercício encerrado. Você voltou a acompanhar a aula.', 2600);
      }
      // reconectou: manda as anotações desta página
      if (pagina().tracos.length) av.con.enviar({ t: 'pagina', pid: pidAluno(), pagina: { tracos: pagina().tracos } });
      pintarAluno(); pedirQuadro(); return;
    }
    case 'pagina': av.prof = m.pagina; if (!av.exercicio) montarPaginaAluno(m.pagina, m.pagina?.id || 'espera', false); return;
    case 'add': if (m.traco) { av.prof?.tracos.push(m.traco); if (!av.exercicio) { pagina().fixos.push(m.traco); remotos.delete(m.traco.id); pedirQuadro(); } } return;
    case 'vivo': if (!av.exercicio) { aplicarVivo(remotos, m); pedirQuadro(); } return;
    case 'laser': if (!av.exercicio) receberLaser(m); return;
  }
}
function iniciarAluno() {
  try { av.id = localStorage.getItem('av:id') || ''; if (!av.id) { av.id = novoId() + novoId(); localStorage.setItem('av:id', av.id); } } catch { av.id = novoId() + novoId(); }
  const lerEntrada = () => {
    let ent = (location.hash.match(/s=([A-Z0-9]{4,6})\.([a-f0-9]{8,40})/i) || []).slice(1);
    if (!ent.length) try { ent = (sessionStorage.getItem('av:sala') || '').split('.'); } catch {}
    [av.codigo, av.chave] = [String(ent[0] || '').toUpperCase(), String(ent[1] || '')];
    if (location.hash) history.replaceState(null, '', location.pathname); // o link de entrada não fica na barra
  };
  lerEntrada();
  window.addEventListener('hashchange', () => { if (!/s=/.test(location.hash)) return; lerEntrada(); telaEntrar(null, false); });
  let nome = ''; try { nome = localStorage.getItem('av:nome') || ''; } catch {}
  $('#av-nome').value = nome;
  on('#av-form', 'submit', (e) => { e.preventDefault(); entrarNaSala($('#av-nome').value); });
  try { av.dedo = localStorage.getItem('av:dedo') === '1'; } catch {}
  const bd = $('#av-dedo'); bd.setAttribute('aria-pressed', String(!!av.dedo));
  bd.onclick = () => { av.dedo = !av.dedo; bd.setAttribute('aria-pressed', String(av.dedo)); try { localStorage.setItem('av:dedo', av.dedo ? '1' : '0'); } catch {} aviso(av.dedo ? 'O dedo escreve. Dois dedos movem e dão zoom.' : 'O dedo volta a só mover a página.', 2000); };
  on('#av-sair', 'click', () => { if (!confirm('Sair da aula ao vivo?')) return; av.chave = ''; telaEntrar(); });
  telaEntrar(null, false);
  if (av.codigo && av.chave && nome) { let volta = false; try { volta = sessionStorage.getItem('av:sala') === av.codigo + '.' + av.chave; } catch {} if (volta) entrarNaSala(nome); }
}

/* ---------- botões ---------- */
function ligarBotoes() {
  // comuns (professor e aluno)
  on('#ma-desfazer', 'click', voltar); on('#ma-refazer', 'click', avancar);
  on('#ma-ajustar', 'click', () => aplicarVista(vistaAjustada()));
  on('#ma-sel-del', 'click', apagarSel); on('#ma-sel-dup', 'click', duplicarSel);
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.ma-pop,#ma-mais-btn,#ma-traco,#ma-sala-btn,.ma-bar-meio [data-ferramenta]')) fecharPops(); });
  window.addEventListener('resize', () => { if (aula) medir(); if (!ALUNO && !$('#ma-resol').hidden) redesenharResol(); });
  document.addEventListener('keydown', (e) => {
    if (!aula || e.target.closest('input,select,textarea')) return;
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); e.shiftKey ? avancar() : voltar(); return; }
    if ((e.metaKey || e.ctrlKey) && k === 'y') { e.preventDefault(); avancar(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!ALUNO && (k === 'arrowright' || k === 'pagedown')) { e.preventDefault(); irPara(aula.atual + 1); }
    else if (!ALUNO && (k === 'arrowleft' || k === 'pageup')) { e.preventDefault(); irPara(aula.atual - 1); }
    else if ((k === 'delete' || k === 'backspace') && sel) { e.preventDefault(); apagarSel(); }
    else if (k === 'escape') { limparSel(); fecharPops(); if (!ALUNO) { fecharInserir(); fecharMapa(); fecharResol(); fecharQR(); } }
    else { const f = { p: 'caneta', m: 'marca', e: 'borracha', v: 'laco', l: ALUNO ? null : 'laser' }[k]; if (f) { pref.ferramenta = f; guardarPref(); pintarBarra(); } }
  });
  if (ALUNO) return;

  // só o professor
  $('#ma-nova').onclick = novaAula;
  $('#ma-voltar').onclick = mostrarInicio;
  $('#ma-titulo').onclick = () => { const t = prompt('Nome da aula', aula.titulo); if (t?.trim()) { aula.titulo = t.trim(); $('#ma-titulo').textContent = aula.titulo; salvar(); } };
  $('#ma-ant').onclick = () => irPara(aula.atual - 1);
  $('#ma-prox').onclick = () => irPara(aula.atual + 1);
  $('#ma-nova-pag').onclick = () => { const i = inserirPagina(); irPara(i, true); aviso('Nova página ' + (i + 1), 1000); };
  $('#ma-nav-n').onclick = abrirMapa; $('#ma-paginas-btn').onclick = abrirMapa; $('#ma-mapa-x').onclick = fecharMapa;
  $('#ma-inserir-btn').onclick = () => ($('#ma-inserir').hidden ? abrirInserir() : fecharInserir());
  $('#ma-ins-x').onclick = fecharInserir;
  $('#ma-ins-aula').onclick = () => ($('#ma-ins-busca').hidden ? mostrarBusca() : catalogo && pref.aulaSite && mostrarQuestoes());
  $('#ma-busca').oninput = (e) => listarAulas(e.target.value);
  for (const b of document.querySelectorAll('.ma-abas button')) b.onclick = () => { pref.lista = b.dataset.lista; guardarPref(); mostrarQuestoes(); };
  $('#ma-mais-btn').onclick = (e) => { e.stopPropagation(); const m = $('#ma-menu'), abrir = m.hidden; fecharPops(); if (abrir) { m.hidden = false; $('#ma-mais-btn').setAttribute('aria-expanded', 'true'); } };
  $('#ma-papel').onchange = (e) => { aula.papel = e.target.value; salvar(); pedirQuadro(); mudouPagina(); };
  $('#ma-exportar').onclick = exportar;
  // turma ao vivo
  $('#ma-sala-btn').onclick = (e) => { e.stopPropagation(); const m = $('#ma-sala'), abrir = m.hidden; fecharPops(); if (abrir) { m.hidden = false; $('#ma-sala-btn').setAttribute('aria-expanded', 'true'); pintarSala(); } };
  $('#ma-sala-abrir').onclick = () => { abrirSala(); };
  $('#ma-sala-fechar').onclick = fecharSala;
  $('#ma-ex-propor').onclick = proporExercicio;
  $('#ma-ex-fim').onclick = encerrarExercicio;
  $('#ma-ver-alunos').onclick = abrirResol;
  $('#ma-qr-btn').onclick = () => mostrarQR(true);
  $('#ma-link-btn').onclick = copiarLink;
  $('#ma-qr-x').onclick = fecharQR; $('#ma-qr-novo').onclick = () => mostrarQR(true); $('#ma-qr-link').onclick = copiarLink;
  $('#ma-resol-x').onclick = fecharResol;
  $('#ma-resol-voltar').onclick = () => { resolAberta = null; $('#ma-resol-grande').hidden = true; redesenharResol(); };
  $('#ma-resol-copiar').onclick = trazerDoAluno;
  // tela cheia: no iPad, o melhor é abrir pela Tela de Início (fica sem a barra do Safari)
  const raiz = document.documentElement, pode = raiz.requestFullscreen || raiz.webkitRequestFullscreen, emApp = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
  if (pode && !emApp) {
    $('#ma-tela-cheia').hidden = false;
    $('#ma-tela-cheia').onclick = () => { fecharPops(); const el = document.fullscreenElement || document.webkitFullscreenElement; if (el) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else pode.call(raiz).catch?.(() => aviso('O navegador não deixou abrir em tela cheia.')); };
  }
  if (emApp) $('#ma-dica-pwa').hidden = true;
  document.addEventListener('visibilitychange', () => { if (document.hidden) salvar(true); });
  window.addEventListener('pagehide', () => salvar(true));
}

/* ---------- início ---------- */
async function iniciar() {
  tela = $('#ma-tela'); vivo = $('#ma-vivo'); folha = $('#ma-folha');
  montarBarra(); ligarBotoes(); ligarEntrada();
  if (ALUNO) { iniciarAluno(); return; }
  if (qs.get('aula')) { pref.aulaSite = qs.get('aula').replace(/[^0-9.]/g, ''); guardarPref(); }
  try { const s = JSON.parse(localStorage.getItem('ma:sala') || 'null'); if (s?.codigo && s?.token) abrirSala(s); } catch {}
  const id = (location.hash.match(/a=([\w]+)/) || [])[1];
  if (id && (await banco.ler(id))) abrirAula(id); else mostrarInicio();
}
iniciar();

window.__modoAula = { get aula() { return aula; }, get vista() { return V; }, get sel() { return sel; }, get sala() { return sala; }, get av() { return av; }, irPara, inserirQuestao, voltar, avancar, exportar, desfazer: () => desfazer };
