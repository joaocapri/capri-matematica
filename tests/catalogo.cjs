const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');

const catalog = JSON.parse(readFileSync('data/aulas.json', 'utf8'));
const files = JSON.parse(readFileSync('data/materiais.json', 'utf8'));
const app = readFileSync('assets/site.js', 'utf8');
const pause = () => new Promise(resolve => setTimeout(resolve, 15));
async function boot(url = 'https://capri.mat/') {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.fetch = async path => {
    if(path === '/data/aulas.json')return { ok: true, json: async () => catalog };
    if(path === '/data/materiais.json')return { ok: true, json: async () => files };
    return { ok: false };
  };
  w.MathJax = { typesetPromise: async () => {} };
  w.eval(app);
  for (let i = 0; i < 50; i++) {
    if (w.document.querySelector('#explore-content .area-tile, #explore-content .browse-lesson-row, #explore-content .browse-topic')) break;
    await pause();
  }
  return { w, dom, d: w.document };
}
function click(w, el) {assert.ok(el, 'elemento clicável ausente'); el.dispatchEvent(new w.MouseEvent('click', { bubbles:true }));}
function type(w, el, value){assert.ok(el, 'campo de busca ausente'); el.value=value; el.dispatchEvent(new w.Event('input',{bubbles:true}));}
(async () => {
  let {w,dom,d} = await boot();
  assert.equal(d.querySelectorAll('.area-tile').length,9,'Home deve mostrar nove áreas');
  assert.ok(d.querySelector('#materiais .library-card'),'Biblioteca de PDFs preservada');
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,0,'Evitar as 144 aulas visíveis na entrada');
  click(w, d.querySelector('[data-catalog="area"][data-id="funcoes"]'));
  assert.equal(d.querySelectorAll('.browse-topic').length,6,'Funções precisa ter seis tópicos bem definidos');
  click(w, d.querySelector('[data-catalog="topic"][data-id="fu-quadratica"]'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,6,'Bloco quadrática deve ter 6 aulas');
  assert.ok(d.querySelector('a[href="/aulas/A17/"]'),'A17 visível e clicável');
  assert.ok(w.location.search.includes('assunto=fu-quadratica'),'URL mantém assunto compartilhável');
  click(w, d.querySelector('[data-catalog="areas"]'));
  assert.equal(d.querySelectorAll('.area-tile').length,9,'Breadcrumb volta para áreas');
  click(w, d.querySelector('[data-catalog="area"][data-id="geometria-espacial"]'));
  assert.ok(d.querySelector('[data-catalog="topic"][data-id="ge-posicao"]'),'Projeção espacial tem tópico próprio');
  click(w, d.querySelector('[data-catalog="topic"][data-id="B-space"]'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,2,'B16 e B17 agrupados');

  click(w, d.querySelector('[data-catalog="areas"]'));
  click(w, d.querySelector('[data-catalog="area"][data-id="estatistica"]'));
  assert.equal(d.querySelectorAll('.browse-topic').length,2,'Estatística deve ter dois assuntos específicos');
  click(w, d.querySelector('[data-catalog="areas"]'));
  click(w, d.querySelector('[data-catalog="area"][data-id="combinatoria"]'));
  assert.equal(d.querySelectorAll('.browse-topic').length,3,'Combinatória e probabilidade devem ter três assuntos');
  click(w, d.querySelector('[data-catalog="areas"]'));
  type(w,d.getElementById('hero-search'),'A17');
  assert.ok(d.querySelector('a[href="/aulas/A17/"]'),'Busca A17 encontra aula');
  assert.ok(!d.getElementById('hero-suggestions').hidden,'Autocompletar abre');
  type(w,d.getElementById('hero-search'),'');
  assert.equal(d.querySelectorAll('.area-tile').length,9,'Limpar busca restaura o catálogo');
  dom.window.close();

  ({w,dom,d}=await boot('https://capri.mat/?area=funcoes&assunto=fu-quadratica'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,6,'Link direto abre aulas da área');
  assert.ok(d.querySelector('a[href="/aulas/A17/"]'));
  dom.window.close();

  ({w,dom,d}=await boot('https://capri.mat/?q=probabilidade'));
  assert.ok(d.querySelectorAll('.browse-lesson-row').length > 0,'Busca de URL abre resultados');
  dom.window.close();

  ({w,dom,d}=await boot());
  click(w,d.querySelector('[data-catalog="all"]'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,24,'Lista completa é progressiva');
  click(w,d.querySelector('[data-catalog="more"]'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,48,'Mostrar mais aumenta resultados');
  dom.window.close();
  console.log('✓ Navegação, busca, biblioteca, breadcrumbs, URL e 144 aulas: OK');
})().catch(e => { console.error(e); process.exitCode=1; });