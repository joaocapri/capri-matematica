const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {JSDOM}=require('jsdom');
const curriculum=JSON.parse(readFileSync('data/aulas.json','utf8'));
const materials=JSON.parse(readFileSync('data/materiais.json','utf8'));
const diagnostic=JSON.parse(readFileSync('data/diagnostico.json','utf8'));
const app=readFileSync('assets/site.js','utf8');
const wait=()=>new Promise(r=>setTimeout(r,12));
async function boot(url='https://matmatmat.test/'){
 const {pathname}=new URL(url);
 const dom=new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',{url,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 const id=pathname.match(/^\/aulas\/([ABC]\d{2})\/?$/)?.[1];
 if(id)d.body.dataset.lesson=id;
 else if(pathname.startsWith('/explorar'))d.body.dataset.view='explorar';
 else if(pathname.startsWith('/teste-seu-nivel'))d.body.dataset.view='diagnostico';
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=async path=>{
  if(path==='/data/aulas.json')return{ok:true,json:async()=>curriculum};
  if(path==='/data/materiais.json')return{ok:true,json:async()=>materials};
  if(path==='/data/diagnostico.json')return{ok:true,json:async()=>diagnostic};
  if(path.startsWith('/conteudos/')){try{return{ok:true,json:async()=>JSON.parse(readFileSync(path.slice(1),'utf8'))}}catch(e){return{ok:false}}}
  return{ok:false};
 };
 w.MathJax={typesetPromise:async()=>{}};
 w.eval(app);
 for(let i=0;i<65;i++){
  if(id?d.querySelector('.contentpanel .tab'):pathname.startsWith('/explorar')?d.querySelector('#explorer-content .area-tile, #explorer-content .browse-topic, #explorer-content .browse-lesson-row'):pathname.startsWith('/teste-seu-nivel')?d.querySelector('#diagnosis-start'):d.querySelector('.home-hero .area-tile, .home-hero'))break;
  await wait();
 }
 return{w,d,dom};
}
function click(w,element){assert.ok(element,'controle não encontrado');element.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))}
function type(w,element,value){assert.ok(element);element.value=value;element.dispatchEvent(new w.Event('input',{bubbles:true}))}
(async()=>{
 assert.match(readFileSync('assets/favicon.svg','utf8'),/MAT MAT MAT!/);
 assert.match(readFileSync('assets/print.js','utf8'),/mat-print-bang/);
 assert.match(readFileSync('imprimir/index.html','utf8'),/MAT MAT MAT!/);
 assert.match(readFileSync('index.html','utf8'),/<title>MAT MAT MAT!/);
 assert.match(readFileSync('explorar/index.html','utf8'),/MAT MAT MAT!/);
 assert.match(readFileSync('teste-seu-nivel/index.html','utf8'),/MAT MAT MAT!/);
 assert.equal(curriculum.lessons.length,144);
 assert.equal(diagnostic.questions.length,15);
 assert.equal(new Set(diagnostic.questions.map(q=>q.id)).size,15);
 assert.equal(diagnostic.domains.length,5);
 for(const q of diagnostic.questions){
  assert.ok(diagnostic.domains.some(d=>d.id===q.area),'domínio válido '+q.id);
  assert.ok(q.opcoes.length===4&&q.correta>=0&&q.correta<4);
  assert.ok(curriculum.lessons.some(l=>l.id===q.aula));
 }
 for(const l of curriculum.lessons){
  const html=readFileSync('aulas/'+l.id+'/index.html','utf8');
  assert.ok(html.includes('data-lesson="'+l.id+'"'));
  assert.ok(html.includes('MAT MAT MAT!'));
 }
 assert.match(readFileSync('explorar/index.html','utf8'),/data-view="explorar"/);
 assert.match(readFileSync('teste-seu-nivel/index.html','utf8'),/data-view="diagnostico"/);
 let {w,d,dom}=await boot();
 assert.match(d.querySelector('#hero-title').textContent,/O que você quer estudar hoje/);
 assert.equal(d.querySelectorAll('input[type=search]').length,1);
 assert.equal(d.querySelectorAll('.area-tile').length,9);
 assert.equal(d.querySelectorAll('.home-explore-decoration').length,0,'Sem seta decorativa gigante');
 assert.equal(d.querySelectorAll('.home-explore .home-section-intro p').length,0,'Sem texto Prefere navegar');
 assert.equal(d.querySelectorAll('.home-explore .browser-toolbar').length,0,'Sem Escolha uma área para começar');
 assert.equal(d.querySelectorAll('.home-explore .browser-shortcuts').length,0,'Sem Favoritas nem Todas as 144 na home');
 assert.equal(d.querySelector('#explore-content .area-grid').children.length,9,'Cartões seguem diretamente o título');
 assert.equal(d.querySelectorAll('.discovery-preview').length,0,'Sem vitrine de exemplos');
 assert.equal(d.querySelectorAll('.home-hero-art').length,0,'Sem ilustração debaixo da busca');
 assert.equal(d.querySelectorAll('[data-preview]').length,0,'Sem controles de animação');
 assert.equal(d.querySelector('.home-hero-copy>p').textContent,'Listas de Exercícios e Teoria grátis. Simples assim');
 assert.equal(d.querySelectorAll('.mat-bang').length,2,'Exclamação em ambas as marcas visíveis');
 assert.equal(d.querySelector('.brand-mat').getAttribute('aria-label'),'MAT MAT MAT! — página inicial');
 assert.ok(d.querySelector('a.area-tile[href="/explorar/?area=funcoes"]'));
 assert.ok(d.querySelector('a.nav-cta[href="/teste-seu-nivel/"]'));
 assert.ok(!d.querySelector('#explore-content .browse-topic'));
 assert.equal(d.querySelectorAll('.mat-logo span').length,6);
 assert.equal(d.querySelectorAll('.mat-bang').length,2);
 type(w,d.querySelector('#hero-search'),'Bhaskara');
 assert.equal(d.querySelectorAll('.home-hero-art').length,0,'Busca continua sem ilustração');
 assert.ok(d.querySelector('#search-output a[href="/aulas/A17/"]'));
 assert.ok(d.querySelector('#search-output .search-material-card'));
 assert.equal(d.querySelector('#home-discover').hidden,true,'exploração oculta ao pesquisar');
 dom.window.close();

 ({w,d,dom}=await boot('https://matmatmat.test/explorar/'));
 assert.equal(d.querySelectorAll('.area-tile').length,9);
 assert.equal(d.querySelectorAll('input[type=search]').length,0,'sem caixa de busca repetida');
 assert.ok(d.querySelector('.explorer-back a[href="/"]'));
 assert.equal(d.querySelector('.explorer-search-link'),null,'Sem botão extra Pesquisar na biblioteca');
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?area=funcoes'));
 assert.equal(d.querySelectorAll('.browse-topic').length,6);
 assert.equal(d.querySelector('.explorer-search-link'),null,'Sem botão Pesquisar ao abrir Fundamentos ou Funções');
 assert.ok(d.querySelector('a.browse-topic[href="/explorar/?area=funcoes&assunto=fu-quadratica"]'));
 assert.ok(d.querySelector('a.explorer-trail[href="/explorar/"]')||d.querySelector('.explorer-trail a[href="/explorar/"]'));
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?area=funcoes&assunto=fu-quadratica'));
 assert.equal(d.querySelectorAll('.browse-lesson-row').length,6);
 assert.ok(d.querySelector('a[href="/aulas/A17/"]'));
 assert.ok(d.querySelector('.explorer-trail a[href="/explorar/?area=funcoes"]'));
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?todas=1'));
 assert.equal(d.querySelectorAll('.browse-lesson-row').length,24);
 click(w,d.querySelector('#show-more-explorer'));
 assert.equal(d.querySelectorAll('.browse-lesson-row').length,48);
 dom.window.close();

 ({w,d,dom}=await boot('https://matmatmat.test/aulas/A17/'));
 assert.equal(d.querySelector('#btn-share').textContent,'↗ Compartilhe essa aula');
 assert.equal(d.querySelector('#btn-share').getAttribute('aria-expanded'),'false');
 assert.equal(d.querySelector('#lesson-share-options').hidden,true,'Sem abrir o fallback antecipadamente');
 assert.equal(d.querySelector('#btn-copy'),null,'Botão antigo removido');
 click(w,d.querySelector('#btn-share'));
 assert.equal(d.querySelector('#lesson-share-options').hidden,false,'Fallback visível sem Web Share');
 var whatsapp=new URL(d.querySelector('#share-whatsapp').href);
 assert.equal(whatsapp.hostname,'wa.me');
 assert.match(whatsapp.searchParams.get('text'),/Raízes e Fórmula Resolutiva/);
 assert.match(whatsapp.searchParams.get('text'),/https:\/\/matmatmat\.test\/aulas\/A17\//);
 click(w,d.querySelector('#share-close'));
 assert.ok(d.querySelector('#lesson-share-options').hidden);
 var nativeSharePayload;
 w.navigator.share=function(payload){nativeSharePayload=payload;return Promise.resolve()};
 click(w,d.querySelector('#btn-share'));
 assert.equal(nativeSharePayload.title,'Raízes e Fórmula Resolutiva | MAT MAT MAT!');
 assert.match(nativeSharePayload.text,/Olha essa aula de matemática/);
 assert.equal(nativeSharePayload.url,'https://matmatmat.test/aulas/A17/');
 assert.equal(d.querySelector('#lesson-share-options').hidden,true);
 assert.equal(d.querySelectorAll('.tab').length,4);
 assert.ok(d.querySelector('a[href="/explorar/?area=funcoes&assunto=fu-quadratica"]'));
 assert.equal(d.querySelector('.tab.active').dataset.tab,'arquivos');
 click(w,d.querySelector('[data-tab="quiz"]'));
 const q=JSON.parse(readFileSync('conteudos/A17.json','utf8')).quiz[0];
 click(w,d.querySelector('[data-opt="'+((q.correta+1)%q.opcoes.length)+'"]'));
 assert.ok(d.querySelector('#quiz-feedback a[href*="app.exatoo.com"]'));
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/aulas/B25/?tab=resumo'));
 assert.equal(d.querySelector('.tab.active').dataset.tab,'teoria');
 dom.window.close();

 ({w,d,dom}=await boot('https://matmatmat.test/teste-seu-nivel/'));
 assert.match(d.querySelector('.diagnosis-start h1').textContent,/Descubra por onde começar/);
 assert.ok(d.querySelector('.diagnosis-disclaimer'));
 click(w,d.querySelector('#diagnosis-start'));
 assert.ok(d.querySelector('.diagnosis-question'));
 for(let i=0;i<15;i++){
  const q=diagnostic.questions[i];
  const selected=i<3?(q.correta+1)%4:q.correta;
  click(w,d.querySelector('[data-diagnosis-answer="'+selected+'"]'));
  assert.ok(!d.querySelector('#diagnosis-next').disabled);
  click(w,d.querySelector('#diagnosis-next'));
 }
 assert.equal(d.querySelectorAll('.diagnosis-domain').length,5);
 assert.match(d.querySelector('.diagnosis-score').textContent,/12\s*\/ 15/);
 assert.ok(d.querySelector('.diagnosis-recs a[href^="/aulas/"]'));
 assert.ok(d.querySelector('.diagnosis-review details'));
 assert.ok(d.querySelector('.diagnosis-exatoo a[href^="https://app.exatoo.com/"]'));
 click(w,d.querySelector('#diagnosis-restart'));
 assert.ok(d.querySelector('#diagnosis-start'),'reiniciar');
 dom.window.close();
 console.log('✓ Home, 9 áreas, 38 assuntos, 144 aulas, links e diagnóstico de 15 questões: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
