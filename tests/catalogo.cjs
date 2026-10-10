const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {JSDOM} = require('jsdom');

const curriculum = JSON.parse(readFileSync('data/aulas.json','utf8'));
const materials = JSON.parse(readFileSync('data/materiais.json','utf8'));
const script = readFileSync('assets/site.js','utf8');
const sleep = () => new Promise(resolve => setTimeout(resolve,12));
async function boot(url='https://capri.mat/'){
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',{
    url,runScripts:'outside-only',pretendToBeVisual:true
  });
  const w=dom.window;
  w.HTMLElement.prototype.scrollIntoView = function(){};
  w.fetch=async path=>{
    if(path==='/data/aulas.json')return {ok:true,json:async()=>curriculum};
    if(path==='/data/materiais.json')return {ok:true,json:async()=>materials};
    return {ok:false};
  };
  w.MathJax={typesetPromise:async()=>{}};
  w.eval(script);
  for(let i=0;i<50;i++){
    if(w.document.querySelector('.home-hero')&&w.document.querySelector('.area-tile'))break;
    await sleep();
  }
  return {dom,w,d:w.document};
}
function click(w,e){assert.ok(e,'elemento clicável ausente');e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}
function type(w,e,value){assert.ok(e,'campo ausente');e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}));}
function visible(e){return !!e&&!e.hidden}
(async()=>{
  assert.equal(curriculum.lessons.length,144,'Currículo de 144 aulas');
  const pair = await boot(); let {dom,w,d}=pair;
  assert.equal(d.querySelectorAll('input[type="search"]').length,1,'Uma única busca na home');
  assert.equal(d.querySelectorAll('.area-tile').length,9,'Nove áreas');
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,0,'Não exibir 144 aulas na entrada');
  assert.ok(d.querySelector('#materiais .home-file-card'),'PDF disponível em destaque');
  assert.ok(d.querySelectorAll('#materiais .home-download').length>=2,'Lista e gabarito acessíveis');
  assert.ok(d.querySelector('#explorar'),'Explorar currículo');
  assert.ok(d.querySelectorAll('.home-popular button').length>=3,'Busca sugerida');
  assert.ok(!visible(d.getElementById('resultados')),'Sem resultados antes de digitar');

  click(w,d.querySelector('[data-catalog="area"][data-id="funcoes"]'));
  assert.equal(d.querySelectorAll('.browse-topic').length,6,'Seis assuntos de funções');
  click(w,d.querySelector('[data-catalog="topic"][data-id="fu-quadratica"]'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,6,'Seis aulas quadráticas');
  assert.ok(d.querySelector('a[href="/aulas/A17/"]'),'Aula A17 presente');
  assert.ok(w.location.search.includes('assunto=fu-quadratica'),'Link de assunto compartilhável');
  click(w,d.querySelector('[data-catalog="areas"]'));
  assert.equal(d.querySelectorAll('.area-tile').length,9,'Breadcrumb funciona');
  click(w,d.querySelector('[data-catalog="area"][data-id="estatistica"]'));
  assert.equal(d.querySelectorAll('.browse-topic').length,2,'Estatística dividida');
  click(w,d.querySelector('[data-catalog="areas"]'));
  click(w,d.querySelector('[data-catalog="area"][data-id="geometria-espacial"]'));
  click(w,d.querySelector('[data-catalog="topic"][data-id="ge-posicao"]'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,2,'Posições no espaço');
  click(w,d.querySelector('[data-catalog="areas"]'));

  type(w,d.getElementById('hero-search'),'Bhaskara');
  assert.ok(visible(d.getElementById('resultados')),'Busca abre resultados');
  assert.ok(!visible(d.getElementById('home-discover')),'Exploração sai da frente da busca');
  assert.ok(d.querySelector('#search-output a[href="/aulas/A17/"]'),'Busca encontra A17');
  assert.ok(!d.getElementById('quick-hits').hidden,'Sugestões aparecem sob o campo');
  assert.ok(d.querySelector('#quick-hits a[href="/aulas/A17/"]'),'Sugestão abre a aula diretamente');
  assert.equal(d.getElementById('hero-search').getAttribute('aria-expanded'),'true','Busca acessível');
  assert.equal(d.querySelectorAll('#search-scope button').length,4,'Filtros integrados sem outra busca');
  assert.ok(d.querySelector('#search-output .search-material-card'),'Lista e gabarito da A17 aparecem na busca');
  click(w,d.querySelector('[data-scope="materiais"]'));
  assert.ok(d.querySelectorAll('#search-output .search-material-card').length>=1,'Filtra materiais');
  assert.equal(d.querySelectorAll('#search-output .browse-lesson-row').length,0,'Filtro não mistura aulas');
  type(w,d.getElementById('hero-search'),'PDF');
  assert.ok(d.querySelectorAll('#search-output .search-material-card').length>=1,'Termo PDF lista materiais');
  assert.ok(d.querySelector('#quick-hits a[href="/pdfs/lista-A17.pdf"]'),'Sugestão de PDF aparece sem segunda busca');
  type(w,d.getElementById('hero-search'),'lista de bhaskara');
  assert.ok(d.querySelector('#search-output .search-material-card'),'Busca composta encontra material');
  type(w,d.getElementById('hero-search'),'probabilidade');
  assert.ok(d.querySelectorAll('#search-output .browse-lesson-row').length>0,'Busca por assunto encontra aulas');
  type(w,d.getElementById('hero-search'),'termoinexistentexyz');
  assert.ok(d.querySelector('#search-output .search-no-match'),'Estado vazio legível');
  click(w,d.getElementById('return-home'));
  assert.ok(visible(d.getElementById('home-discover')),'Volta à exploração');
  assert.equal(d.getElementById('hero-search').value,'','Limpa a busca');
  assert.ok(d.getElementById('quick-hits').hidden,'Sugestões somem depois de limpar');
  click(w,d.querySelector('[data-catalog="all"]'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,18,'Lista inicial paginada');
  click(w,d.querySelector('[data-catalog="more"]'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,36,'Ver mais funciona');
  dom.window.close();

  ({dom,w,d}=await boot('https://capri.mat/?area=funcoes&assunto=fu-quadratica'));
  assert.equal(d.querySelectorAll('.browse-lesson-row').length,6,'Deep link de área e assunto funciona');
  dom.window.close();

  ({dom,w,d}=await boot('https://capri.mat/?q=A17'));
  assert.ok(visible(d.getElementById('resultados')),'Link de pesquisa funciona');
  assert.ok(d.querySelector('#search-output a[href="/aulas/A17/"]'));
  dom.window.close();

  ({dom,w,d}=await boot());
  click(w,d.querySelector('[data-example="Geometria espacial"]'));
  assert.ok(visible(d.getElementById('resultados')),'Sugestão abre pesquisa');
  assert.ok(d.querySelectorAll('#search-output .browse-lesson-row').length>0);
  dom.window.close();

  console.log('✓ Home v4: busca única, PDFs, filtros, hierarquia, histórico e catálogo: OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
