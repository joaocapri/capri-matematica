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
  if(path.startsWith('/conteudos/')||path.startsWith('/data/listas/')){try{return{ok:true,json:async()=>JSON.parse(readFileSync(path.slice(1),'utf8'))}}catch(e){return{ok:false}}}
  return{ok:false};
 };
 w.MathJax={typesetPromise:async()=>{}};
 w.scrollTo=function(...a){w.__scrolled=a};
 w.eval(app);
 for(let i=0;i<65;i++){
  if(id?d.querySelector('.aula-step'):pathname.startsWith('/explorar')?d.querySelector('main.trilha .aula-hero'):pathname.startsWith('/teste-seu-nivel')?d.querySelector('.diag-track-card'):d.querySelector('.home-hero .area-tile, .home-hero'))break;
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
 assert.equal(curriculum.lessons.length,152);
 assert.equal(diagnostic.version,2);
 assert.equal(diagnostic.tracks.length,5);
 assert.equal(diagnostic.tracks.reduce((n,t)=>n+t.questions.length,0),60);
 assert.equal(new Set(diagnostic.tracks.map(t=>t.id)).size,5);
 for(const track of diagnostic.tracks){
  assert.equal(track.questions.length,12);
  assert.equal(track.areas.length,4);
  assert.equal(new Set(track.questions.map(q=>q.id)).size,12);
  for(const skill of track.areas){
   const sample=track.questions.filter(q=>q.area===skill.id);
   assert.deepEqual(sample.map(q=>q.dificuldade),[1,2,3]);
  }
  for(const q of track.questions){
   assert.ok(track.areas.some(skill=>skill.id===q.area));
   assert.equal(q.opcoes.length,4);
   assert.ok(q.correta>=0&&q.correta<4&&q.explicacao);
   assert.ok(curriculum.lessons.some(l=>l.id===q.aula),'Link para aula válido: '+q.aula);
  }
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
 assert.equal(d.querySelectorAll('.home-explore .browser-shortcuts').length,0,'Sem Favoritas nem Todas as 152 na home');
 assert.equal(d.querySelector('#explore-content .area-grid').children.length,9,'Cartões seguem diretamente o título');
 assert.equal(d.querySelectorAll('#explore-content .hv-topics a').length,41,'Os 41 assuntos acessíveis direto da página inicial');
 assert.ok(d.querySelector('.hv-topics a[href="/explorar/?area=funcoes&assunto=fu-quadratica"]'));
 assert.equal(d.querySelector('.hv-continue'),null,'Sem atalho de continuar para quem ainda não abriu aulas');
 assert.equal(d.querySelectorAll('.discovery-preview').length,0,'Sem vitrine de exemplos');
 assert.equal(d.querySelectorAll('.home-hero-art').length,0,'Sem ilustração debaixo da busca');
 assert.equal(d.querySelectorAll('[data-preview]').length,0,'Sem controles de animação');
 assert.equal(d.querySelector('.home-hero-copy>p').textContent,'Listas de Exercícios e Teoria grátis. Simples assim');
 assert.equal(d.querySelectorAll('img.mat-logo-img').length,2,'Logo em ambas as marcas visíveis');
 assert.equal(d.querySelector('.brand-mat').getAttribute('aria-label'),'MAT MAT MAT! — página inicial');
 assert.ok(d.querySelector('a.area-tile[href="/explorar/?area=funcoes"]'));
 assert.ok(d.querySelector('a.nav-cta[href="/teste-seu-nivel/"]'));
 assert.ok(!d.querySelector('#explore-content .browse-topic'));
 assert.equal(d.querySelectorAll('img.mat-logo-img[src="/assets/logo-mat-256.png"]').length,2,'Logo em imagem no topo e no rodapé');
 type(w,d.querySelector('#hero-search'),'Bhaskara');
 assert.equal(d.querySelectorAll('.home-hero-art').length,0,'Busca continua sem ilustração');
 assert.ok(d.querySelector('#search-output a[href="/aulas/A20/"]'));
 assert.ok(d.querySelector('#search-output .hs-best .hs-file[href="/pdfs/fixacao-A20.pdf"]'),'Melhor resultado já oferece as listas');
 // Busca: o aluno digita o nome do assunto e cai na aula certa, mesmo com erro de digitação.
 const melhor=q=>{type(w,d.querySelector('#hero-search'),q);const a=d.querySelector('#search-output .hs-best h3 a');return a&&a.getAttribute('href')};
 assert.equal(melhor('FUNÇÃO AFIM'),'/aulas/A15/');
 assert.equal(melhor('funcao modular'),'/aulas/A29/');
 assert.equal(melhor('equação do 2º grau'),'/aulas/A10/');
 assert.equal(melhor('bascara'),'/aulas/A20/');
 assert.equal(melhor('pa'),'/aulas/A41/');
 assert.equal(melhor('a40'),'/aulas/A40/');
 assert.equal(melhor('lista de juros compostos'),'/aulas/C11/');
 assert.equal(melhor('produtos notáveis'),'/aulas/A07/');
 assert.equal(melhor('fatoração'),'/aulas/A08/');
 assert.equal(melhor('função inversa'),'/aulas/A28/');
 assert.equal(melhor('função par'),'/aulas/A25/');
 assert.equal(melhor('bijetora'),'/aulas/A26/');
 assert.equal(melhor('sistema 2x2'),'/aulas/C48/');
 assert.equal(melhor('binomio de newton'),'/aulas/C20/');
 assert.equal(melhor('logaritimo'),'/aulas/A34/');
 assert.ok(d.querySelector('#search-output .hs-fixed'),'Avisa a correção de digitação');
 assert.equal(melhor('exercícios de pa'),'/aulas/A41/#pratique','Intenção leva direto à etapa da aula');
 assert.equal(melhor('trigonometria'),'/explorar/?area=trigonometria','Nome de área leva à área');
 type(w,d.querySelector('#hero-search'),'geometria');
 assert.equal(d.querySelectorAll('#search-output .hs-area').length,3);
 type(w,d.querySelector('#hero-search'),'PDF');
 assert.equal(d.querySelectorAll('#search-output .hs-pdfrow').length,new Set(materials.filter(m=>m.aula).map(m=>m.aula)).size,'Listas e PDFs mostra todas as aulas com listas');
 type(w,d.querySelector('#hero-search'),'xyzw');
 assert.ok(d.querySelector('#search-output .hs-none'));
 type(w,d.querySelector('#hero-search'),'Bhaskara');
 assert.equal(d.querySelector('#home-discover').hidden,true,'exploração oculta ao pesquisar');
 dom.window.close();

 // Trilha: todas as áreas → área → assunto → aula.
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/'));
 assert.equal(d.querySelectorAll('.area-tile').length,9);
 assert.equal(d.querySelectorAll('input[type=search]').length,0,'sem caixa de busca repetida');
 assert.ok(d.querySelector('.aula-crumbs a[href="/"]'));
 assert.ok(d.querySelector('a.area-tile[href="/explorar/?area=funcoes"]'));
 assert.equal(d.querySelector('.explorer-search-link'),null,'Sem botão extra Pesquisar na biblioteca');
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?area=funcoes'));
 assert.equal(d.querySelectorAll('.tr-route > .tr-stop').length,7,'Sete assuntos na trilha da área');
 assert.ok(d.querySelector('.tr-topic h3 a[href="/explorar/?area=funcoes&assunto=fu-quadratica"]'));
 assert.ok(d.querySelector('a.tr-chip[href="/aulas/A20/"]'),'Aula acessível direto da página da área');
 assert.equal(d.querySelectorAll('.tr-chip').length,28);
 assert.ok(d.querySelector('.tr-areas a.is-current[href="/explorar/?area=funcoes"]'));
 assert.equal(d.querySelectorAll('.tr-areas a').length,9);
 assert.ok(d.querySelector('.aula-crumbs a[href="/explorar/"]'));
 assert.equal(d.querySelector('.aula-hero-cta .aula-btn-lime').getAttribute('href'),'/aulas/A12/');
 assert.equal(d.querySelector('.explorer-search-link'),null,'Sem botão Pesquisar ao abrir Fundamentos ou Funções');
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?area=funcoes&assunto=fu-quadratica'));
 assert.equal(d.querySelectorAll('.tr-lesson').length,6);
 assert.ok(d.querySelector('.tr-lesson h3 a[href="/aulas/A20/"]'));
 assert.ok(d.querySelector('.tr-steps a[href="/aulas/A20/#prova"]'),'Atalho direto para o modo prova');
 assert.ok(d.querySelector('.aula-crumbs a[href="/explorar/?area=funcoes"]'));
 assert.ok(d.querySelector('.aula-trail .is-current a[aria-current="page"]'));
 assert.equal(d.querySelector('.aula-seq-next').getAttribute('href'),'/explorar/?area=funcoes&assunto=fu-propriedades');
 assert.equal(d.querySelector('.aula-hero-cta .aula-btn-lime').getAttribute('href'),'/aulas/A19/');
 await new Promise(r=>setTimeout(r,60));
 assert.match(d.querySelector('#aula-formula-math').innerHTML,/\\frac\{-b/,'Fórmula-chave do assunto: Bhaskara');
 assert.equal(d.querySelectorAll('.tr-lesson [data-formula]').length,6);
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?todas=1'));
 assert.equal(d.querySelectorAll('.tr-row').length,152);
 assert.equal(d.querySelectorAll('.tr-group').length,9);
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?favoritos=1'));
 assert.ok(d.querySelector('.tr-empty a[href="/explorar/"]'),'Favoritas vazias orientam o próximo passo');
 dom.window.close();

 ({w,d,dom}=await boot('https://matmatmat.test/aulas/A20/'));
 assert.equal(d.querySelector('#btn-share').textContent,'Compartilhar');
 assert.equal(d.querySelector('#btn-share').getAttribute('aria-label'),'Compartilhe essa aula');
 assert.equal(d.querySelectorAll('.lesson-tools .lesson-tool').length,3,'Uma barra compacta de três ações');
 assert.equal(d.querySelectorAll('.lesson-tools svg').length,3,'Ícones vetoriais sem emojis');
 assert.equal(d.querySelector('#btn-done').getAttribute('aria-pressed'),'false');
 assert.equal(d.querySelector('#btn-fav').getAttribute('aria-pressed'),'false');
 click(w,d.querySelector('#btn-done'));
 assert.equal(d.querySelector('#btn-done .lesson-tool-label').textContent,'Estudada');
 assert.equal(d.querySelector('#btn-done').getAttribute('aria-pressed'),'true');
 assert.ok(d.querySelector('#btn-done').classList.contains('is-active'));
 click(w,d.querySelector('#btn-done'));
 assert.equal(d.querySelector('#btn-done .lesson-tool-label').textContent,'Já estudei');
 assert.equal(d.querySelector('#btn-done').getAttribute('aria-pressed'),'false');
 click(w,d.querySelector('#btn-fav'));
 assert.equal(d.querySelector('#btn-fav .lesson-tool-label').textContent,'Favorita');
 assert.equal(d.querySelector('#btn-fav').getAttribute('aria-pressed'),'true');
 click(w,d.querySelector('#btn-fav'));
 assert.equal(d.querySelector('#btn-fav .lesson-tool-label').textContent,'Favoritar');
 assert.equal(d.querySelector('#btn-fav').getAttribute('aria-pressed'),'false');
 assert.equal(d.querySelector('#btn-share').getAttribute('aria-expanded'),'false');
 assert.equal(d.querySelector('#lesson-share-options').hidden,true,'Sem abrir o fallback antecipadamente');
 assert.equal(d.querySelector('#btn-copy'),null,'Botão antigo removido');
 click(w,d.querySelector('#btn-share'));
 assert.equal(d.querySelector('#lesson-share-options').hidden,false,'Fallback visível sem Web Share');
 var whatsapp=new URL(d.querySelector('#share-whatsapp').href);
 assert.equal(whatsapp.hostname,'wa.me');
 assert.match(whatsapp.searchParams.get('text'),/Raízes e Fórmula Resolutiva/);
 assert.match(whatsapp.searchParams.get('text'),/https:\/\/matmatmat\.test\/aulas\/A20\//);
 click(w,d.querySelector('#share-close'));
 assert.ok(d.querySelector('#lesson-share-options').hidden);
 var nativeSharePayload;
 w.navigator.share=function(payload){nativeSharePayload=payload;return Promise.resolve()};
 click(w,d.querySelector('#btn-share'));
 assert.equal(nativeSharePayload.title,'Raízes e Fórmula Resolutiva | MAT MAT MAT!');
 assert.match(nativeSharePayload.text,/Olha essa aula de matemática/);
 assert.equal(nativeSharePayload.url,'https://matmatmat.test/aulas/A20/');
 assert.equal(d.querySelector('#lesson-share-options').hidden,true);
 // Página da aula: roteiro em quatro etapas com teoria, exercícios, modo prova e PDFs.
 assert.deepEqual([...d.querySelectorAll('.aula-step')].map(x=>x.id),['entenda','pratique','prova','levar']);
 assert.equal(d.querySelectorAll('.aula-rail [data-rail]').length,4);
 assert.ok(d.querySelector('a[href="/explorar/?area=funcoes&assunto=fu-quadratica"]'));
 assert.match(d.querySelector('#aula-formula-math').textContent,/\\frac\{-b/,'Fórmula da aula no destaque');
 assert.ok(d.querySelector('.aula-trail .is-current a[aria-current="page"]'));
 assert.equal(d.querySelectorAll('.aula-pdf').length,2,'Vitrine com as duas listas');
 assert.ok(d.querySelector('.aula-pdf[href="/pdfs/fixacao-A20.pdf"] img[src="/pdfs/capas/fixacao-A20.webp"]'));
 // Checagem rápida: uma pergunta por vez, com o Exatoo quando erra.
 const q=JSON.parse(readFileSync('conteudos/A20.json','utf8')).quiz[0];
 assert.equal(d.querySelector('[data-check="1"]').hidden,true);
 click(w,d.querySelector('[data-check="0"] [data-opt="'+((q.correta+1)%q.opcoes.length)+'"]'));
 assert.ok(d.querySelector('[data-check="0"] .aula-fb a[href*="app.exatoo.com"]'));
 assert.ok(d.querySelector('[data-check="0"] [data-opt="'+q.correta+'"]').classList.contains('is-right'));
 click(w,d.querySelector('[data-check="0"] [data-check-next]'));
 assert.equal(d.querySelector('[data-check="0"]').hidden,true);
 assert.equal(d.querySelector('[data-check="1"]').hidden,false);
 // Pratique: resolução sob demanda e autoavaliação que alimenta o progresso.
 const lista=JSON.parse(readFileSync('data/listas/A20.json','utf8'));
 assert.equal(d.querySelectorAll('#ex-list .aula-ex').length,lista.fixacao.secoes[0].questoes.length);
 const ex=d.querySelector('#ex-list .aula-ex');
 assert.equal(ex.querySelector('.aula-ex-sol').hidden,true);
 click(w,ex.querySelector('.aula-ex-ver'));
 assert.equal(ex.querySelector('.aula-ex-sol').hidden,false);
 click(w,ex.querySelector('[data-mark="ok"]'));
 assert.ok(ex.classList.contains('is-ok'));
 assert.match(d.querySelector('#prat-sum').textContent,/^1 de 20 conferidos, 1 certo$/);
 assert.equal(JSON.parse(w.localStorage.getItem('matmat-aula-A20')).fix['1'],'ok');
 click(w,d.querySelector('[data-level="2"]'));
 assert.equal(d.querySelectorAll('#ex-list .aula-ex').length,lista.fixacao.secoes[2].questoes.length);
 // Modo prova: 20 questões corrigidas na hora, nota e revisão das erradas.
 click(w,d.querySelector('#prova-start'));
 const vest=lista.vestibular.questoes;
 vest.forEach((qq,k)=>{
  click(w,d.querySelector('#prova-root [data-popt="'+(k===0?(qq.correta+1)%5:qq.correta)+'"]'));
  assert.ok(d.querySelector('#quiz-feedback .aula-fb-box'));
  click(w,d.querySelector('#prova-next'));
 });
 assert.equal(d.querySelector('.aula-score-n').textContent,'19');
 assert.equal(d.querySelectorAll('.aula-grid .aula-cell.is-wrong').length,1);
 assert.match(d.querySelector('#rail-prova').textContent,/Melhor nota: 19 de 20/);
 assert.ok(d.querySelector('#prova-root a[href*="app.exatoo.com"]'));
 click(w,d.querySelector('#prova-wrong'));
 assert.match(d.querySelector('.aula-prova-bar').textContent,/Questão 1 de 1/);
 assert.equal(d.querySelectorAll('.aula-seq a').length,2);
 dom.window.close();
 // Aula sem listas publicadas: teoria e materiais, sem etapas vazias; ?tab= antigo ainda leva à etapa.
 ({w,d,dom}=await boot('https://matmatmat.test/aulas/B25/?tab=resumo'));
 assert.ok(d.querySelector('#entenda'));
 assert.equal(d.querySelector('#prova'),null);
 assert.ok(d.querySelector('#levar'));
 await new Promise(r=>setTimeout(r,120));
 assert.ok(w.__scrolled,'Rolou até a etapa pedida');
 dom.window.close();

 // Cinco provas independentes e recomendações contextualizadas.
 ({w,d,dom}=await boot('https://matmatmat.test/teste-seu-nivel/'));
 assert.equal(d.querySelectorAll('[data-track]').length,5,'Cinco percursos para escolher');
 assert.match(d.querySelector('.diag-intro h1').textContent,/Onde você está na matemática/);
 assert.equal(d.querySelectorAll('.header-promise-bar').length,1);
 click(w,d.querySelector('[data-track="em1"]'));
 assert.match(d.querySelector('.diag-selected h1').textContent,/Seu ponto de partida/);
 assert.equal(d.querySelectorAll('.diag-skill-list>div').length,4);
 click(w,d.querySelector('#diag-begin'));
 assert.equal(d.querySelectorAll('.diagnosis-option').length,4);
 assert.equal(d.querySelector('#diagnosis-next').disabled,true,'Avançar exige resposta');
 const currentTitle=d.querySelector('.diagnosis-question h1').textContent;
 const firstQuestion=diagnostic.tracks[0].questions.find(q=>q.enunciado===currentTitle);
 click(w,d.querySelector('[data-diagnosis-answer="'+firstQuestion.correta+'"]'));
 assert.equal(d.querySelector('#diagnosis-next').disabled,false);
 // Volta à apresentação sem perder a possibilidade de escolher outro perfil.
 click(w,d.querySelector('#diagnosis-prev'));
 assert.ok(d.querySelector('#diag-back-tracks'));
 click(w,d.querySelector('#diag-back-tracks'));
 assert.equal(d.querySelectorAll('[data-track]').length,5);
 click(w,d.querySelector('[data-track="vestib"]'));
 assert.equal(d.querySelectorAll('.diag-skill-list>div').length,4);
 click(w,d.querySelector('#diag-begin'));
 const vestibQuestions=diagnostic.tracks.find(t=>t.id==='vestib').questions;
 for(let i=0;i<12;i++){
  const title=d.querySelector('.diagnosis-question h1').textContent;
  const q=vestibQuestions.find(q=>q.enunciado===title);
  assert.ok(q,'Questão real encontrada em vestibular: '+title);
  const choice=i<3?(q.correta+1)%4:q.correta;
  click(w,d.querySelector('[data-diagnosis-answer="'+choice+'"]'));
  assert.equal(d.querySelector('#diagnosis-next').disabled,false);
  click(w,d.querySelector('#diagnosis-next'));
 }
 assert.match(d.querySelector('.diag-score-main').textContent,/9\s*\/12/,'Resultado com 9 acertos');
 assert.equal(d.querySelectorAll('.diagnosis-domain').length,4);
 assert.equal(d.querySelectorAll('.diag-complexity>div').length,3);
 assert.ok(d.querySelector('.diagnosis-recs a[href^="/aulas/"]'),'Recomendações de revisão por conteúdo');
 assert.equal(d.querySelectorAll('.diag-review-item').length,12,'Correção comentada');
 assert.ok(d.querySelector('.diag-result-exatoo a[href^="https://app.exatoo.com/"]'));
 click(w,d.querySelector('#diag-change'));
 assert.equal(d.querySelectorAll('[data-track]').length,5,'Pode escolher outro percurso');
 assert.match(d.querySelector('[data-track="vestib"]').textContent,/Última tentativa: 9\/12/);
 dom.window.close();
 console.log('✓ Home, 152 aulas, header contextual e diagnóstico com 5 provas e 60 questões: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
