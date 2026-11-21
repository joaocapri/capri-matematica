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
const ESPS = { caneta: [1.6, 2.8, 5], marca: [12, 20, 32] };
const BORRACHA_PX = 14;
const $ = (s) => document.querySelector(s);
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const qs = new URLSearchParams(location.search);

/* ---------- preferências (ferramenta, cores) ---------- */
let pref = { ferramenta: 'caneta', cor: { caneta: CORES.caneta[0][1], marca: CORES.marca[0][1] }, esp: { caneta: 1, marca: 1 }, aulaSite: null, lista: 'fixacao' };
try { pref = { ...pref, ...JSON.parse(localStorage.getItem('ma:pref') || '{}') }; } catch {}
const guardarPref = () => { try { localStorage.setItem('ma:pref', JSON.stringify(pref)); } catch {} };

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
function opcoes(t, k) {
  const s = t.s * k, pen = !!t.pen;
  if (t.f === 'marca') return { size: s, thinning: 0, smoothing: 0.5, streamline: t.forma ? 0 : 0.45, simulatePressure: false, start: { cap: false }, end: { cap: false }, last: true };
  if (t.forma) return { size: s, thinning: 0, smoothing: 0.2, streamline: 0, simulatePressure: false, last: true };
  return { size: s, thinning: pen ? 0.5 : 0.4, smoothing: 0.5, streamline: 0.42, simulatePressure: !pen, last: true };
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
    imagemQuestao(o.aula, o.lista, o.n, P).then((cv) => { const e = prontas.get(k); if (!e || e.P < P) prontas.set(k, { P, cv }); pedirQuadro(); })
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
  const passo = PW * V.z + GAP_PG;
  for (const i of [aula.atual - 1, aula.atual, aula.atual + 1]) {
    const pg = aula.paginas[i]; if (!pg) continue;
    const ox = V.tx + (i - aula.atual) * passo + desl;
    if (ox > vw || ox + PW * V.z < 0) continue;
    desenharPagina(ctx, pg, ox, V.ty, V.z, R, i === aula.atual);
  }
}
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
  for (const o of pg.objs) {
    const d = movendo && sel.objs.includes(o) ? sel.d : null;
    desenharQuestao(ctx, o, z * r, d, mini);
  }
  for (const t of pg.tracos) {
    if (movendo && sel.tracos.has(t)) { ctx.save(); ctx.translate(sel.d.dx, sel.d.dy); desenhaTraco(ctx, t); ctx.restore(); }
    else desenhaTraco(ctx, t);
  }
  if (atual && sel && !mini) desenharSel(ctx, z);
  ctx.restore();
}
function desenharQuestao(ctx, o, escala, d, mini) {
  let { x, y, w, h } = o;
  if (d) { if (d.redim) { w = d.w; h = d.h; } else { x += d.dx; y += d.dy; } }
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
  const ent = mini ? prontas.get(`${o.aula}|${o.lista}|${o.n}`) : imagemPronta(o, w * escala);
  if (ent?.cv) { ctx.imageSmoothingQuality = 'high'; ctx.drawImage(ent.cv, x, y, w, h); }
  else {
    ctx.fillStyle = '#f3f1f8'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#8a84a6'; ctx.font = `600 ${Math.min(22, w / 14)}px 'DM Sans', system-ui, sans-serif`; ctx.textBaseline = 'middle';
    ctx.fillText(ent?.erro ? `Questão ${o.n} (${o.aula}) não abriu` : `Questão ${o.n} · ${NOMES[o.lista]} ${o.aula}`, x + 16, y + Math.min(h / 2, 30));
  }
  ctx.strokeStyle = '#d9d4e8'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
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
  if (sel.d?.redim) { const o = sel.objs[0]; c = o.x + sel.d.w; d = o.y + sel.d.h; }
  else if (sel.d) { a += sel.d.dx; c += sel.d.dx; b += sel.d.dy; d += sel.d.dy; }
  return [a, b, c, d];
}
function desenharSel(ctx, z) {
  const [a, b, c, d] = caixaVisivel(), m = 6 / z;
  ctx.save();
  ctx.strokeStyle = '#4a27b7'; ctx.lineWidth = 1.6 / z; ctx.setLineDash([6 / z, 5 / z]);
  ctx.strokeRect(a - m, b - m, c - a + 2 * m, d - b + 2 * m);
  if (umaQuestao()) { // alça de tamanho no canto
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
  if (umaQuestao() && dist(w, [c + m, d + m]) < 26 / z) return 'redim';
  if (w[0] >= a - m && w[0] <= c + m && w[1] >= b - m && w[1] <= d + m) return 'mover';
  return null;
}
function questaoEm(w) { const objs = pagina().objs; for (let i = objs.length - 1; i >= 0; i--) { const o = objs[i]; if (w[0] >= o.x && w[0] <= o.x + o.w && w[1] >= o.y && w[1] <= o.y + o.h) return o; } return null; }
function dentroPoligono(x, y, pol) {
  let dentro = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) { const [xi, yi] = pol[i], [xj, yj] = pol[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro; }
  return dentro;
}
function selecionarLaco(pol) {
  if (pol.length < 3) { limparSel(); return; }
  const pg = pagina();
  const tracos = pg.tracos.filter((t) => { let n = 0; for (const [x, y] of t.p) if (dentroPoligono(x, y, pol)) n++; return n >= t.p.length * 0.6; });
  const objs = pg.objs.filter((o) => dentroPoligono(o.x + o.w / 2, o.y + o.h / 2, pol));
  selecionar(tracos, objs);
}
function concluirMover() {
  const pg = pagina(), d = sel.d; sel.d = null;
  if (!d || (!d.redim && Math.hypot(d.dx, d.dy) < 0.5)) { posicionarSelMenu(); pedirQuadro(); return; }
  const antes = foto(pg);
  if (d.redim) { const o = sel.objs[0]; o.w = d.w; o.h = d.h; }
  else {
    for (const o of sel.objs) { o.x = Math.round((o.x + d.dx) * 10) / 10; o.y = Math.round((o.y + d.dy) * 10) / 10; }
    const novos = new Set();
    pg.tracos = pg.tracos.map((t) => { if (!sel.tracos.has(t)) return t; const n = { ...t, p: t.p.map(([x, y, p]) => [Math.round((x + d.dx) * 100) / 100, Math.round((y + d.dy) * 100) / 100, p]) }; novos.add(n); return n; });
    sel.tracos = novos;
  }
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
function registrar(pg, antes) { desfazer.push({ pid: pg.id, antes }); if (desfazer.length > 200) desfazer.shift(); refazer = []; botoes(); salvar(); }
function registrarPaginas(antes) { desfazer.push({ paginas: antes }); refazer = []; botoes(); salvar(); }
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
  botoes(); salvar(); pedirQuadro(); atualizarNav();
}
const voltar = () => trocar(desfazer, refazer);
const avancar = () => trocar(refazer, desfazer);
function botoes() { $('#ma-desfazer').disabled = !desfazer.length; $('#ma-refazer').disabled = !refazer.length; }

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
      if (toques.size === 1) { iniciarToque(e.pointerId, p); return; }
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
  const h = f !== 'laser' && acertoSel(w, V.z);
  if (h) { atual = { pid: e.pointerId, pen, mover: true }; comecarMover(h, w); return; }
  if (f === 'laser') { atual = { pid: e.pointerId, pen, laser: { pts: [[w[0], w[1], performance.now()]] } }; lasers.push(atual.laser); animarLaser(); return; }
  limparSel();
  if (f === 'borracha') { atual = { pid: e.pointerId, pen, apagou: false, antes: foto(pagina()), cursor: p }; apagar(w); pedirVivo(); return; }
  if (f === 'laco') { atual = { pid: e.pointerId, pen, laco: [w] }; pedirVivo(); return; }
  atual = { pid: e.pointerId, pen, ancora: w, timer: 0,
    traco: { f, c: pref.cor[f], s: ESPS[f][pref.esp[f]], pen, p: [[w[0], w[1], pressao(e)]] } };
  armarForma(); pedirVivo();
}
function moverCaneta(evs, p) {
  const a = atual;
  if (a.mover) { arrastarSel(mundo(p)); return; }
  if (a.laser) { const t = performance.now(); for (const c of evs) { const w = mundo(local(c)); a.laser.pts.push([w[0], w[1], t]); } return; }
  if (a.laco) { for (const c of evs) a.laco.push(mundo(local(c))); pedirVivo(); return; }
  if (a.traco) {
    if (a.travado) return;
    for (const c of evs) { const w = mundo(local(c)); a.traco.p.push([w[0], w[1], pressao(c)]); }
    const u = a.traco.p[a.traco.p.length - 1];
    if (dist(u, a.ancora) > 3 / V.z) { a.ancora = u; armarForma(); }
    pedirVivo(); return;
  }
  if (a.antes) { for (const c of evs) apagar(mundo(local(c))); a.cursor = p; pedirVivo(); }
}
function concluirCaneta(cancelado) {
  const a = atual; atual = null; clearTimeout(a.timer); limparVivo();
  if (a.mover) { if (cancelado && sel) sel.d = null; if (sel) concluirMover(); return; }
  if (a.laser) { a.laser.fim = performance.now(); animarLaser(); return; }
  if (a.laco) { if (!cancelado) selecionarLaco(a.laco); return; }
  const pg = pagina();
  if (a.traco) {
    if (cancelado && a.traco.p.length < 3) return;
    if (a.traco.p.length === 1) { const [x, y, pr] = a.traco.p[0]; a.traco.p.push([x + 0.01, y + 0.01, pr]); }
    const antes = foto(pg); pg.tracos.push(a.traco); registrar(pg, antes); pedirQuadro(); return;
  }
  if (a.apagou) registrar(pg, a.antes);
  pedirQuadro();
}
function cancelarTraco() {
  if (!atual) return;
  if (atual.antes && atual.apagou) { const pg = pagina(); pg.tracos = atual.antes.tracos.slice(); }
  if (atual.mover && sel) sel.d = null;
  clearTimeout(atual.timer); atual = null; limparVivo(); pedirQuadro();
}
function armarForma() { // desenhou e segurou parado no fim: vira forma perfeita
  if (!atual?.traco) return;
  clearTimeout(atual.timer);
  atual.timer = setTimeout(() => {
    const a = atual; if (!a?.traco || a.travado || a.traco.p.length < 6) return;
    const fm = reconhecer(a.traco.p, a.traco.f === 'marca'); if (!fm) return;
    a.traco.p = fm.pts; a.traco.forma = fm.nome; a.travado = true; pedirVivo(); aviso(fm.nome, 900);
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
  const o = sel.objs[0];
  sel.ini = w; sel.d = tipo === 'redim' ? { redim: true, w: o.w, h: o.h, off: [o.x + o.w - w[0], o.y + o.h - w[1]] } : { dx: 0, dy: 0 };
  $('#ma-sel-menu').hidden = true;
}
function arrastarSel(w) {
  if (!sel?.d) return;
  const dx = w[0] - sel.ini[0], dy = w[1] - sel.ini[1];
  if (sel.d.redim) { // o canto acompanha o dedo, mantendo a proporção da questão
    const o = sel.objs[0], prop = o.h / o.w, [ox, oy] = sel.d.off;
    const nw = limitar(Math.max(w[0] + ox - o.x, (w[1] + oy - o.y) / prop), 160, PW * 1.2);
    sel.d.w = Math.round(nw); sel.d.h = Math.round(nw * prop);
  }
  else { sel.d.dx = dx; sel.d.dy = dy; }
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
    if ((dx > 0 && aula.atual === 0) || (dx < 0 && aula.atual === aula.paginas.length - 1)) dx *= 0.25; // borda: resiste
    desl = dx; pedirQuadro();
  }
}
function soltarGesto(comToque) {
  const g = gesto; gesto = null; if (!g) return;
  if (g.tipo === 'mover') { if (sel) concluirMover(); return; }
  if (g.tipo === 'toque' && comToque && performance.now() - g.t0 < 450) { // toque rápido
    const o = questaoEm(mundo(g.ini));
    if (o && !(umaQuestao() && sel.objs[0] === o)) selecionar([], [o]); else limparSel();
    return;
  }
  if (g.tipo === 'virar') {
    const a = g.hist[0], b = g.hist[g.hist.length - 1], v = (b.t - a.t) > 0 ? (b.x - a.x) / (b.t - a.t) : 0;
    const largura = PW * V.z + GAP_PG;
    let alvo = 0;
    if ((desl < -largura * 0.18 || v < -0.45) && aula.atual < aula.paginas.length - 1) alvo = -1;
    else if ((desl > largura * 0.18 || v > 0.45) && aula.atual > 0) alvo = 1;
    else if (aula.atual === aula.paginas.length - 1 && desl < -60) aviso('Última página. Toque em + para criar outra.', 1800);
    deslizar(alvo);
  }
}
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
  atualizarNav(); pedirQuadro(); salvar();
}
function atualizarNav() {
  if (!aula) return;
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
  fecharPops(); limparSel();
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
  if (pg.objs.length) { // ao lado da última, se couber; senão, um pouco abaixo e à direita
    const u = pg.objs[pg.objs.length - 1];
    if (u.x + u.w + 30 + w <= PW - 20) { x = u.x + u.w + 30; y = u.y; } else { x = Math.min(u.x + 36, PW - w - 20); y = Math.min(u.y + 36, PH - h - 20); }
  }
  const o = { id: novoId(), tipo: 'q', aula: aulaId, lista, n, x, y, w: Math.round(w), h: Math.round(h) };
  pg.objs.push(o); registrar(pg, antes);
  fecharInserir(); selecionar([], [o]);
  aviso(`Questão ${n} inserida. Arraste para mover; a bolinha no canto muda o tamanho.`, 2600);
}

/* ---------- exportar a aula em PDF (vetorial: as questões entram como PDF, a escrita como desenho) ---------- */
async function exportar() {
  fecharPops(); aviso('Montando o PDF…', 60000);
  try {
    const { PDFDocument, rgb, BlendMode } = await import('/assets/vendor/pdf-lib.esm.min.js');
    const out = await PDFDocument.create(), s = 841.89 / PW, H = PH * s;
    const cor = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
    const fontesPdf = new Map();
    const docDe = async (o) => { const k = o.aula + '|' + o.lista; if (!fontesPdf.has(k)) { const f = await fonte(o.aula, o.lista); fontesPdf.set(k, PDFDocument.load(await (await fetch(f.url)).arrayBuffer())); } return fontesPdf.get(k); };
    for (const pg of aula.paginas) {
      const page = out.addPage([841.89, H]);
      page.drawRectangle({ x: 0, y: 0, width: 841.89, height: H, color: cor(PAPEL) });
      const Y = (y) => H - y * s;
      if (aula.papel === 'pontilhado') { for (let y = PASSO; y < PH; y += PASSO) for (let x = PASSO; x < PW; x += PASSO) page.drawCircle({ x: x * s, y: Y(y), size: 0.75, color: cor(COR_PAPEL.ponto) }); }
      else if (aula.papel === 'quadriculado' || aula.papel === 'pautado') {
        const p = aula.papel === 'pautado' ? 32 : PASSO, cl = cor(aula.papel === 'pautado' ? COR_PAPEL.pauta : COR_PAPEL.linha);
        if (aula.papel === 'quadriculado') for (let x = p; x < PW; x += p) page.drawLine({ start: { x: x * s, y: 0 }, end: { x: x * s, y: H }, thickness: 0.5, color: cl });
        for (let y = aula.papel === 'pautado' ? 64 : p; y < PH; y += p) page.drawLine({ start: { x: 0, y: Y(y) }, end: { x: 841.89, y: Y(y) }, thickness: 0.5, color: cl });
      }
      for (const o of pg.objs) {
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
        } catch (e) { console.warn(e); }
      }
      for (const t of pg.tracos) {
        const path = caminho(contorno(t, s)); if (!path) continue;
        page.drawSvgPath(path, { x: 0, y: H, color: cor(t.c), borderWidth: 0, ...(t.f === 'marca' ? { opacity: 0.38, blendMode: BlendMode.Multiply } : {}) });
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
  requestAnimationFrame(() => { medir(); V = vistaAjustada(); atualizarNav(); pedirQuadro(); });
}

/* ---------- barra ---------- */
function montarBarra() {
  const cores = $('#ma-cores'), esps = $('#ma-esps');
  const pintarBarra = () => {
    const f = pref.ferramenta === 'marca' ? 'marca' : 'caneta';
    document.body.dataset.ferramenta = pref.ferramenta;
    for (const b of document.querySelectorAll('[data-ferramenta]')) if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.ferramenta === pref.ferramenta));
    cores.innerHTML = '';
    for (const [nome, c] of CORES[f]) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ma-cor'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', nome); b.title = nome;
      b.setAttribute('aria-checked', String(pref.cor[f] === c)); b.style.setProperty('--c', c); b.innerHTML = '<span></span>';
      b.onclick = () => { pref.cor[f] = c; if (!['caneta', 'marca'].includes(pref.ferramenta)) pref.ferramenta = f; guardarPref(); pintarBarra(); };
      cores.append(b);
    }
    esps.innerHTML = '';
    ['Fino', 'Médio', 'Grosso'].forEach((nome, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ma-esp'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', nome); b.title = nome;
      b.setAttribute('aria-checked', String(pref.esp[f] === i)); b.style.setProperty('--d', [5, 8, 12][i] + 'px'); b.innerHTML = '<span></span>';
      b.onclick = () => { pref.esp[f] = i; guardarPref(); pintarBarra(); };
      esps.append(b);
    });
  };
  for (const b of document.querySelectorAll('.ma-bar-meio [data-ferramenta]')) b.onclick = () => { pref.ferramenta = b.dataset.ferramenta; if (pref.ferramenta !== 'laco') limparSel(); guardarPref(); pintarBarra(); };
  pintarBarra();
  window.__pintarBarra = pintarBarra;
}
function fecharPops() { $('#ma-menu').hidden = true; $('#ma-mais-btn').setAttribute('aria-expanded', 'false'); }
function ligarBotoes() {
  $('#ma-nova').onclick = novaAula;
  $('#ma-voltar').onclick = mostrarInicio;
  $('#ma-titulo').onclick = () => { const t = prompt('Nome da aula', aula.titulo); if (t?.trim()) { aula.titulo = t.trim(); $('#ma-titulo').textContent = aula.titulo; salvar(); } };
  $('#ma-desfazer').onclick = voltar; $('#ma-refazer').onclick = avancar;
  $('#ma-ant').onclick = () => irPara(aula.atual - 1);
  $('#ma-prox').onclick = () => irPara(aula.atual + 1);
  $('#ma-nova-pag').onclick = () => { const i = inserirPagina(); irPara(i, true); aviso('Nova página ' + (i + 1), 1000); };
  $('#ma-nav-n').onclick = abrirMapa; $('#ma-paginas-btn').onclick = abrirMapa; $('#ma-mapa-x').onclick = fecharMapa;
  $('#ma-ajustar').onclick = () => aplicarVista(vistaAjustada());
  $('#ma-inserir-btn').onclick = () => ($('#ma-inserir').hidden ? abrirInserir() : fecharInserir());
  $('#ma-ins-x').onclick = fecharInserir;
  $('#ma-ins-aula').onclick = () => ($('#ma-ins-busca').hidden ? mostrarBusca() : catalogo && pref.aulaSite && mostrarQuestoes());
  $('#ma-busca').oninput = (e) => listarAulas(e.target.value);
  for (const b of document.querySelectorAll('.ma-abas button')) b.onclick = () => { pref.lista = b.dataset.lista; guardarPref(); mostrarQuestoes(); };
  $('#ma-sel-del').onclick = apagarSel; $('#ma-sel-dup').onclick = duplicarSel;
  $('#ma-mais-btn').onclick = (e) => { e.stopPropagation(); const m = $('#ma-menu'), abrir = m.hidden; fecharPops(); if (abrir) { m.hidden = false; $('#ma-mais-btn').setAttribute('aria-expanded', 'true'); } };
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('#ma-menu,#ma-mais-btn')) fecharPops(); });
  $('#ma-papel').onchange = (e) => { aula.papel = e.target.value; salvar(); pedirQuadro(); };
  $('#ma-exportar').onclick = exportar;
  // tela cheia: no iPad, o melhor é abrir pela Tela de Início (fica sem a barra do Safari)
  const raiz = document.documentElement, pode = raiz.requestFullscreen || raiz.webkitRequestFullscreen, emApp = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
  if (pode && !emApp) {
    $('#ma-tela-cheia').hidden = false;
    $('#ma-tela-cheia').onclick = () => { fecharPops(); const el = document.fullscreenElement || document.webkitFullscreenElement; if (el) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else pode.call(raiz).catch?.(() => aviso('O navegador não deixou abrir em tela cheia.')); };
  }
  if (emApp) $('#ma-dica-pwa').hidden = true;
  document.addEventListener('keydown', (e) => {
    if (!aula || e.target.closest('input,select,textarea')) return;
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); e.shiftKey ? avancar() : voltar(); return; }
    if ((e.metaKey || e.ctrlKey) && k === 'y') { e.preventDefault(); avancar(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (k === 'arrowright' || k === 'pagedown') { e.preventDefault(); irPara(aula.atual + 1); }
    else if (k === 'arrowleft' || k === 'pageup') { e.preventDefault(); irPara(aula.atual - 1); }
    else if ((k === 'delete' || k === 'backspace') && sel) { e.preventDefault(); apagarSel(); }
    else if (k === 'escape') { limparSel(); fecharInserir(); fecharMapa(); fecharPops(); }
    else { const f = { p: 'caneta', m: 'marca', e: 'borracha', v: 'laco', l: 'laser' }[k]; if (f) { pref.ferramenta = f; guardarPref(); window.__pintarBarra(); } }
  });
  window.addEventListener('resize', () => { if (aula) medir(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) salvar(true); });
  window.addEventListener('pagehide', () => salvar(true));
}

/* ---------- início ---------- */
async function iniciar() {
  tela = $('#ma-tela'); vivo = $('#ma-vivo'); folha = $('#ma-folha');
  if (qs.get('aula')) { pref.aulaSite = qs.get('aula').replace(/[^0-9.]/g, ''); guardarPref(); }
  montarBarra(); ligarBotoes(); ligarEntrada();
  const id = (location.hash.match(/a=([\w]+)/) || [])[1];
  if (id && (await banco.ler(id))) abrirAula(id); else mostrarInicio();
}
iniciar();

window.__modoAula = { get aula() { return aula; }, get vista() { return V; }, get sel() { return sel; }, irPara, inserirQuestao, voltar, avancar, exportar, desfazer: () => desfazer };
