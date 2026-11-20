const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {JSDOM}=require('jsdom');
const curriculum=JSON.parse(readFileSync('data/aulas.json','utf8'));
const materials=JSON.parse(readFileSync('data/materiais.json','utf8'));
const diagnostic=JSON.parse(readFileSync('data/diagnostico.json','utf8'));
const app=readFileSync('assets/site.js','utf8');
const classJS=readFileSync('assets/turmas.js','utf8');
const expectedClasses=['maxi-1p1','maxi-1p2','maxi-2p1','maxi-2p2','maxi-3p1','maxi-3p2','maxi-fera','maxi-med','integral-3a','integral-3b','integral-3c','integral-semi'];
assert.equal(expectedClasses.length,12);
const turmasIndex=readFileSync('turmas/index.html','utf8');
assert.match(turmasIndex,/<meta name="robots" content="noindex,nofollow/);
assert.match(turmasIndex,/href="\/turmas\/maxi\/2p2\/"/);
assert.match(turmasIndex,/href="\/turmas\/integral\/semi\/"/);
assert.equal((turmasIndex.match(/class="turmas-directory-card"/g)||[]).length,12);
for(const id of expectedClasses){
 const data=JSON.parse(readFileSync('data/turmas/'+id+'.json','utf8'));
 assert.equal(data.id,id);
 assert.ok(Array.isArray(data.notices)&&Array.isArray(data.materials)&&Array.isArray(data.studyPlan));
 const [school,slug]=id.split('-');
 const html=readFileSync('turmas/'+school+'/'+slug+'/index.html','utf8');
 assert.ok(html.includes('data-turma="'+id+'"'));
 assert.match(html,/noindex,nofollow/);
}
assert.ok(!app.includes('/turmas/maxi/1p1/'),'Turmas não aparecem no app público');
assert.ok(!classJS.includes('document.cookie'),'Páginas sem login e cookies');

const wait=()=>new Promise(r=>setTimeout(r,12));
async function boot(url='https://matmatmat.test/'){
 const {pathname}=new URL(url);
 const dom=new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',{url,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 const aula=pathname.match(/^\/(\d)\/(\d+|x\d)\/(\d+)\/?$/),livro=pathname.match(/^\/(\d)\/(?:(\d+|x\d)\/)?$/);
 const id=aula?aula.slice(1,4).join('.'):null;
 if(id)d.body.dataset.lesson=id;
 else if(livro){d.body.dataset.view='explorar';d.body.dataset.volume=livro[1];if(livro[2])d.body.dataset.modulo=livro[1]+'.'+livro[2]}
 else if(pathname.startsWith('/explorar'))d.body.dataset.view='explorar';
 else if(pathname.startsWith('/teste-seu-nivel'))d.body.dataset.view='diagnostico';
 else if(/^\/[a-z][a-z-]+\/$/.test(pathname)){d.body.dataset.view='assunto';d.body.dataset.assunto=pathname.slice(1,-1)}
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
  if(id?d.querySelector('.aula-step'):(livro||d.body.dataset.assunto||pathname.startsWith('/explorar'))?d.querySelector('main.trilha .aula-hero'):pathname.startsWith('/teste-seu-nivel')?d.querySelector('.diag-track-card'):d.querySelector('.home-hero .area-tile, .home-hero'))break;
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
 assert.equal(curriculum.lessons.length,215);
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
  const html=readFileSync(l.id.split('.').join('/')+'/index.html','utf8');
  assert.ok(html.includes('data-lesson="'+l.id+'"'));
  assert.ok(html.includes('MAT MAT MAT!'));
 }
 for(const b of curriculum.blocks){
  const html=readFileSync(b.id.replace('.','/')+'/index.html','utf8');
  assert.ok(html.includes('data-modulo="'+b.id+'"'),'Página do módulo (QR code do livro): '+b.id);
 }
 // Ofertas da coleção: em todas as páginas públicas, nunca nas turmas.
 for(const p of ['index.html','explorar/index.html','teste-seu-nivel/index.html','livros/index.html','2/index.html','2/3/index.html','2/3/2/index.html'])
  assert.ok(readFileSync(p,'utf8').includes('/assets/ofertas.js'),'ofertas.js em '+p);
 assert.ok(!turmasIndex.includes('ofertas.js'),'Turmas sem ofertas');
 const livros=JSON.parse(readFileSync('data/livros.json','utf8'));
 assert.equal(livros.volumes.reduce((n,v)=>n+v.modulos,0),curriculum.blocks.filter(b=>!b.extra).length,'Módulos do livro batem com o site');
 assert.equal(livros.volumes.reduce((n,v)=>n+v.paginas,0),983);
 for(const v of livros.volumes)for(const a of v.amostras)readFileSync(a.src.slice(1));
 assert.ok(livros.oferta&&typeof livros.oferta.ativo==='boolean');
 const ofertas=readFileSync('assets/ofertas.js','utf8').replace(/\/\*[\s\S]*?\*\//g,'');
 assert.ok(!/comprou|acabou de|restam|expira em/i.test(ofertas),'Sem prova social falsa nem contagem regressiva');
 assert.match(readFileSync('explorar/index.html','utf8'),/data-view="explorar"/);
 assert.match(readFileSync('teste-seu-nivel/index.html','utf8'),/data-view="diagnostico"/);
 let {w,d,dom}=await boot();
 assert.match(d.querySelector('#hero-title').textContent,/O que você quer estudar hoje/);
 assert.equal(d.querySelectorAll('input[type=search]').length,1);
 assert.equal(d.querySelectorAll('.as-tile').length,25,'Assuntos na entrada');
 assert.equal(d.querySelectorAll('.as-fam').length,4,'Assuntos agrupados em 4 famílias');
 assert.ok(d.querySelector('a.as-tile[href="/combinatoria/"]'),'Combinatória direto na página inicial');
 assert.ok(d.querySelector('form[data-livro-atalho]'),'Atalho para quem tem o livro');
 assert.equal(d.querySelectorAll('.home-explore-decoration').length,0,'Sem seta decorativa gigante');
 assert.equal(d.querySelectorAll('.home-explore .home-section-intro p').length,0,'Sem texto Prefere navegar');
 assert.equal(d.querySelectorAll('.home-explore .browser-toolbar').length,0,'Sem Escolha uma área para começar');
 assert.equal(d.querySelectorAll('.home-explore .browser-shortcuts').length,0,'Sem Favoritas nem Todas as 215 na home');
 assert.equal(d.querySelector('#explore-content').firstElementChild.className,'as-fams','Assuntos seguem diretamente o título');
 assert.equal(d.querySelectorAll('#explore-content .area-tile').length,0,'Volumes fora da entrada');
 assert.equal(d.querySelector('.hv-continue'),null,'Sem atalho de continuar para quem ainda não abriu aulas');
 assert.equal(d.querySelectorAll('.discovery-preview').length,0,'Sem vitrine de exemplos');
 assert.equal(d.querySelectorAll('.home-hero-art').length,0,'Sem ilustração debaixo da busca');
 assert.equal(d.querySelectorAll('[data-preview]').length,0,'Sem controles de animação');
 assert.equal(d.querySelector('.home-hero-copy>p').textContent,'Listas de Exercícios e Teoria grátis. Simples assim');
 assert.equal(d.querySelectorAll('img.mat-logo-img').length,2,'Logo em ambas as marcas visíveis');
 assert.equal(d.querySelector('.brand-mat').getAttribute('aria-label'),'MAT MAT MAT! — página inicial');
 assert.ok(d.querySelector('a.as-tile[href="/funcoes/"]'));
 assert.ok(d.querySelector('a.nav-cta[href="/teste-seu-nivel/"]'));
 assert.ok(!d.querySelector('#explore-content .browse-topic'));
 assert.equal(d.querySelectorAll('img.mat-logo-img[src="/assets/logo-mat-256.png"]').length,2,'Logo em imagem no topo e no rodapé');
 type(w,d.querySelector('#hero-search'),'Bhaskara');
 assert.equal(d.querySelectorAll('.home-hero-art').length,0,'Busca continua sem ilustração');
 assert.ok(d.querySelector('#search-output a[href="/2/3/2/"]'));
 assert.ok(d.querySelector('#search-output .hs-best .hs-file[href="/pdfs/fixacao-2.3.2.pdf"]'),'Melhor resultado já oferece as listas');
 // Busca: o aluno digita o nome do assunto e cai na aula certa, mesmo com erro de digitação.
 const melhor=q=>{type(w,d.querySelector('#hero-search'),q);const a=d.querySelector('#search-output .hs-best h3 a');return a&&a.getAttribute('href')};
 assert.equal(melhor('FUNÇÃO AFIM'),'/funcao-afim/');
 assert.equal(melhor('funcao modular'),'/funcao-modular/','Nome exato do assunto abre o assunto');
 assert.equal(melhor('equação do 2º grau'),'/1/7/1/');
 assert.equal(melhor('bascara'),'/2/3/2/');
 assert.equal(melhor('pa'),'/1/14/2/');
 assert.equal(melhor('2.3.2'),'/2/3/2/','Código do livro leva à aula');
 assert.equal(melhor('matriz inversa'),'/3/5/1/');
 assert.equal(melhor('potencias de i'),'/3/12/1/');
 assert.equal(melhor('dizima periodica'),'/1/13/2/');
 assert.equal(melhor('lei dos cossenos'),'/2/13/2/');
 assert.equal(melhor('conjuntos'),'/conjuntos/');
 assert.equal(melhor('lista de juros compostos'),'/1/x1/2/');
 assert.equal(melhor('produtos notáveis'),'/1/4/2/');
 assert.equal(melhor('fatoração'),'/1/4/3/');
 assert.equal(melhor('função inversa'),'/2/5/4/');
 assert.equal(melhor('função par'),'/2/5/1/');
 assert.equal(melhor('bijetora'),'/2/5/2/');
 assert.equal(melhor('sistema 2x2'),'/1/5/3/');
 assert.equal(melhor('binomio de newton'),'/1/20/1/');
 assert.equal(melhor('logaritimo'),'/2/8/1/');
 assert.ok(d.querySelector('#search-output .hs-fixed'),'Avisa a correção de digitação');
 assert.equal(melhor('exercícios de bhaskara'),'/2/3/2/#pratique','Intenção leva direto à etapa da aula');
 assert.equal(melhor('combinatoria'),'/combinatoria/','Nome do assunto leva ao assunto');
 assert.equal(melhor('trigonometria'),'/trigonometria/');
 type(w,d.querySelector('#hero-search'),'geometria');
 assert.deepEqual([...d.querySelectorAll('#search-output .hs-areas a')].map(a=>a.getAttribute('href')).sort(),['/geometria-analitica/','/geometria-espacial/','/geometria-plana/'],'Geometria mostra as três geometrias');
 type(w,d.querySelector('#hero-search'),'PDF');
 assert.equal(d.querySelectorAll('#search-output .hs-pdfrow').length,new Set(materials.filter(m=>m.aula).map(m=>m.aula)).size,'Listas e PDFs mostra todas as aulas com listas');
 type(w,d.querySelector('#hero-search'),'xyzw');
 assert.ok(d.querySelector('#search-output .hs-none'));
 type(w,d.querySelector('#hero-search'),'Bhaskara');
 assert.equal(d.querySelector('#home-discover').hidden,true,'exploração oculta ao pesquisar');
 dom.window.close();

 // Trilha do livro: volumes → volume (/2/) → módulo (/2/3/, endereço do QR code) → aula (/2/3/2/).
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/'));
 assert.equal(d.querySelectorAll('.as-tile').length,25,'Assuntos primeiro');
 assert.equal(d.querySelectorAll('.area-tile').length,4,'Depois, os volumes do livro');
 assert.equal(d.querySelectorAll('input[type=search]').length,0,'sem caixa de busca repetida');
 assert.ok(d.querySelector('.aula-crumbs a[href="/"]'));
 assert.ok(d.querySelector('a.area-tile[href="/2/"]'));
 assert.equal(d.querySelector('.explorer-search-link'),null,'Sem botão extra Pesquisar na biblioteca');
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/2/'));
 assert.equal(d.querySelectorAll('.tr-route > .tr-stop').length,20,'Os 20 módulos do Volume 2 na trilha');
 assert.ok(d.querySelector('.tr-topic h3 a[href="/2/3/"]'));
 assert.ok(d.querySelector('a.tr-chip[href="/2/3/2/"]'),'Aula acessível direto da página da área');
 assert.equal(d.querySelectorAll('.tr-chip').length,53);
 assert.ok(d.querySelector('.tr-areas a.is-current[href="/2/"]'));
 assert.equal(d.querySelectorAll('.tr-areas a').length,4);
 assert.ok(d.querySelector('.aula-crumbs a[href="/explorar/"]'));
 assert.equal(d.querySelector('.aula-hero-cta .aula-btn-lime').getAttribute('href'),'/2/1/1/');
 assert.equal(d.querySelector('.explorer-search-link'),null,'Sem botão Pesquisar ao abrir Fundamentos ou Funções');
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/2/3/'));
 assert.equal(d.querySelectorAll('.tr-lesson').length,6);
 assert.ok(d.querySelector('.tr-lesson h3 a[href="/2/3/2/"]'));
 assert.ok(d.querySelector('.tr-steps a[href="/2/3/2/#prova"]'),'Atalho direto para o modo prova');
 assert.ok(d.querySelector('.aula-crumbs a[href="/funcao-quadratica/"]'),'Módulo do QR code aponta para o assunto');
 assert.ok(d.querySelector('.aula-trail .is-current a[aria-current="page"]'));
 assert.equal(d.querySelector('.aula-seq-next').getAttribute('href'),'/2/4/');
 assert.equal(d.querySelector('.aula-hero-cta .aula-btn-lime').getAttribute('href'),'/2/3/1/');
 await new Promise(r=>setTimeout(r,60));
 assert.match(d.querySelector('#aula-formula-math').innerHTML,/\\frac\{-b/,'Fórmula-chave do assunto: Bhaskara');
 assert.equal(d.querySelectorAll('.tr-lesson [data-formula]').length,6);
 dom.window.close();
 // Assunto: todas as aulas numa lista só, sem passar por volume ou módulo.
 ({w,d,dom}=await boot('https://matmatmat.test/combinatoria/'));
 assert.equal(d.querySelector('#tr-titulo').textContent,'Análise combinatória');
 assert.equal(d.querySelectorAll('.as-row').length,11);
 assert.equal(d.querySelector('.as-row').getAttribute('href'),'/1/16/1/');
 assert.equal(d.querySelector('.aula-hero-cta'),null,'Assunto com topo enxuto, sem botão de começar');
 assert.equal(d.querySelector('.as-body .tr-head h2').textContent,'Aulas');
 assert.equal(d.querySelector('.as-row .as-n').textContent,'Aula 1','Cada aula numerada como Aula 1, Aula 2…');
 assert.equal(d.querySelector('.header-promise'),null,'Páginas internas com o cabeçalho fino');
 assert.ok(d.querySelector('.aula-crumbs a[href="/"]'));
 assert.equal(d.querySelector('.aula-seq-next').getAttribute('href'),'/probabilidade/');
 assert.ok(d.querySelector('.bk-promo a[href="/livros/?volume=1"]'),'Oferta do Volume 1 no assunto');
 for(const a of curriculum.assuntos)assert.ok(readFileSync(a.id+'/index.html','utf8').includes('data-assunto="'+a.id+'"'),'Página do assunto '+a.id);
 for(const l of curriculum.lessons)assert.equal(curriculum.assuntos.filter(a=>a.aulas?a.aulas.includes(l.id):a.modulos.includes(l.block)).length,1,'Aula '+l.id+' em exatamente um assunto');
 ({w,d,dom}=await boot('https://matmatmat.test/composta-e-inversa/'));
 assert.deepEqual([...d.querySelectorAll('.as-row')].map(a=>a.getAttribute('href')),['/2/5/3/','/2/5/4/'],'Assunto com parte de um módulo');
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?todas=1'));
 assert.equal(d.querySelectorAll('.tr-row').length,215);
 assert.equal(d.querySelectorAll('.tr-group').length,4);
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/explorar/?favoritos=1'));
 assert.ok(d.querySelector('.tr-empty a[href="/explorar/"]'),'Favoritas vazias orientam o próximo passo');
 dom.window.close();

 ({w,d,dom}=await boot('https://matmatmat.test/2/3/2/'));
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
 assert.match(whatsapp.searchParams.get('text'),/Raízes, discriminante, soma e produto/);
 assert.match(whatsapp.searchParams.get('text'),/https:\/\/matmatmat\.test\/2\/3\/2\//);
 click(w,d.querySelector('#share-close'));
 assert.ok(d.querySelector('#lesson-share-options').hidden);
 var nativeSharePayload;
 w.navigator.share=function(payload){nativeSharePayload=payload;return Promise.resolve()};
 click(w,d.querySelector('#btn-share'));
 assert.equal(nativeSharePayload.title,'Raízes, discriminante, soma e produto | MAT MAT MAT!');
 assert.match(nativeSharePayload.text,/Olha essa aula de matemática/);
 assert.equal(nativeSharePayload.url,'https://matmatmat.test/2/3/2/');
 assert.equal(d.querySelector('#lesson-share-options').hidden,true);
 // Página da aula: sem o fundo roxo; título, as três listas (PDF, caderno, GoodNotes, Fazer agora) e o resumo recolhido no fim.
 assert.equal(d.querySelector('.aula-hero'),null,'A aula é a própria página, sem o cabeçalho roxo');
 assert.deepEqual([...d.querySelectorAll('.aula-step')].map(x=>x.id),['entenda']);
 assert.equal(d.querySelector('#levar'),null);
 assert.equal(d.querySelector('.aula-rail'),null);
 assert.deepEqual([...d.querySelectorAll('.av-listas .lst-titulo')].map(b=>b.textContent),['Lista de fixação','Lista de vestibular','Lista de aprofundamento']);
 assert.equal(d.querySelectorAll('.av-listas .lst-btn-pdf').length,3,'Cada lista com o PDF');
 assert.ok(d.querySelector('.av-listas a.lst-btn-pdf[href="/pdfs/fixacao-2.3.2.pdf"]'));
 assert.equal(d.querySelectorAll('.av-listas a[href^="/caderno/?aula=2.3.2&lista="]').length,3,'Cada lista abre no caderno digital');
 assert.deepEqual([...d.querySelectorAll('.av-listas [data-goodnotes]')].map(b=>b.dataset.goodnotes),['/pdfs/caderno-fixacao-2.3.2.pdf','/pdfs/caderno-vestibular-2.3.2.pdf','/pdfs/caderno-aprofundamento-2.3.2.pdf'],'Cada lista vai para o GoodNotes');
 assert.deepEqual([...d.querySelectorAll('.av-listas [data-fazer]')].map(b=>b.dataset.fazer),['fixacao','vestibular','aprofundamento'],'Fazer agora em cada lista');
 assert.ok(d.querySelector('.av-resumo[href="#entenda"]'),'Atalho para o resumo, que fica no fim');
 assert.equal(d.querySelector('.lst-meta'),null,'Só o nome da lista, sem a contagem');
 assert.deepEqual([...d.querySelectorAll('.av-icones .lesson-tool')].map(b=>b.title),['Já estudei','Favoritar','Compartilhar'],'Ações só com ícones, com o nome na dica');
 assert.equal(d.querySelector('#resumo-det').open,false,'Resumo recolhido');
 assert.equal(d.querySelector('.aula-formula'),null);
 assert.equal(d.querySelector('.aula-trail'),null,'Sem a trilha de aulas');
 assert.ok(d.querySelector('.aula-crumbs a[href="/funcao-quadratica/"]'),'Aula volta para o assunto');
 assert.match(d.querySelector('.aula-kicker').textContent,/Aula 2 de 6 em Função quadrática/);
 assert.ok(d.querySelector('#entenda .aula-resumo'),'Resumo curto da aula');
 assert.equal(d.querySelectorAll('[data-check]').length,0,'Sem checagem rápida');
 assert.ok(d.querySelector('.bk-promo[data-promo="modulo"] a[href="/livros/?volume=2"]'),'Oferta do Volume 2 na aula');
 // Fazer agora: a lista em tela cheia, uma questão de cada vez, com voltar.
 const lista=JSON.parse(readFileSync('data/listas/2.3.2.json','utf8'));
 const rvEl=d.getElementById('rv');
 assert.equal(rvEl.hidden,true);
 click(w,d.querySelector('[data-fazer="fixacao"]'));
 assert.equal(rvEl.hidden,false,'Abre a tela da lista');
 assert.equal(w.location.search,'?fazer=fixacao','Endereço próprio, para o botão voltar do navegador');
 assert.equal(d.querySelectorAll('#rv-main .aula-ex').length,1,'Uma questão de cada vez');
 assert.match(d.querySelector('#rv-main .aula-ex .selo').textContent,/Nível 1/);
 let ex=d.querySelector('#rv-main .aula-ex');
 assert.equal(ex.querySelector('.aula-ex-sol').hidden,true);
 click(w,ex.querySelector('.aula-ex-ver'));
 assert.equal(ex.querySelector('.aula-ex-sol').hidden,false);
 click(w,ex.querySelector('[data-mark="ok"]'));
 assert.ok(ex.classList.contains('is-ok'));
 assert.equal(JSON.parse(w.localStorage.getItem('matmat-aula-2.3.2')).fix['1'],'ok');
 assert.equal(d.querySelector('.rv-prog').textContent,'1/'+lista.fixacao.secoes.reduce((n,s)=>n+s.questoes.length,0));
 click(w,d.querySelector('[data-rv-passo="1"]'));
 assert.equal(d.querySelector('.rv-qbtn b').textContent,'2');
 click(w,d.querySelector('#rv-qbtn'));
 assert.equal(d.querySelector('#rv-mapa').hidden,false,'Escolher a questão pelo número');
 assert.ok(d.querySelector('#rv-mapa .rv-cel.is-ok[data-ir="0"]'));
 click(w,d.querySelector('.rv-bar [data-rv-sair]'));
 await new Promise(r=>setTimeout(r,40));
 assert.equal(rvEl.hidden,true,'Voltar fecha a lista');
 assert.equal(w.location.search,'');
 // Vestibular: alternativa corrigida na hora e nota no fim.
 click(w,d.querySelector('[data-fazer="vestibular"]'));
 const vest=lista.vestibular.questoes;
 vest.forEach((qq,k)=>{
  if(qq.tipo==='somatoria'){
   qq.codigos.filter(c=>qq.correta&c).forEach(c=>click(w,d.querySelector('#rv-main [data-sprop="'+c+'"]')));
   assert.match(d.querySelector('[data-sconf]').textContent,new RegExp('soma '+qq.correta+'$'));
   click(w,d.querySelector('#rv-main [data-sconf]'));
  }else click(w,d.querySelector('#rv-main [data-popt="'+(k===0?(qq.correta+1)%5:qq.correta)+'"]'));
  assert.ok(d.querySelector('#rv-fb .aula-fb-box'));
  click(w,d.querySelector('[data-rv-seguir]'));
 });
 assert.equal(d.querySelector('.rv-placar-n').textContent,String(vest.length-1));
 assert.equal(d.querySelectorAll('.rv-fim .rv-cel.is-erro').length,1);
 click(w,d.querySelector('.rv-fim [data-rv-sair]'));
 await new Promise(r=>setTimeout(r,40));
 assert.equal(JSON.parse(w.localStorage.getItem('matmat-aula-2.3.2')).prova.best,vest.length-1,'Melhor nota guardada');
 assert.equal(d.querySelectorAll('.aula-seq a').length,2);
 dom.window.close();
 ({w,d,dom}=await boot('https://matmatmat.test/2/3/2/#prova'));
 assert.equal(d.getElementById('rv').hidden,false,'Link antigo #prova abre a lista de vestibular');
 assert.equal(w.location.search,'?fazer=vestibular');
 dom.window.close();
 // Aula sem listas publicadas: teoria e materiais, sem etapas vazias; ?tab= antigo ainda leva à etapa.
 ({w,d,dom}=await boot('https://matmatmat.test/4/11/2/?tab=resumo'));
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
 assert.ok(d.querySelector('.diagnosis-recs a[href^="/"]'),'Recomendações de revisão por conteúdo');
 assert.equal(d.querySelectorAll('.diag-review-item').length,12,'Correção comentada');
 assert.ok(d.querySelector('.diag-result-exatoo a[href^="https://app.exatoo.com/"]'));
 click(w,d.querySelector('#diag-change'));
 assert.equal(d.querySelectorAll('[data-track]').length,5,'Pode escolher outro percurso');
 assert.match(d.querySelector('[data-track="vestib"]').textContent,/Última tentativa: 9\/12/);
 dom.window.close();
 console.log('✓ Home, 215 aulas, header contextual e diagnóstico com 5 provas e 60 questões: OK');
})().catch(e=>{console.error(e);process.exitCode=1});
