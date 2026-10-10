
(function(){
'use strict';
var ROOT='/';var data=null;var materialIndex=[];var saved=new Set(safeRead('capri-favoritos'));var done=new Set(safeRead('capri-estudadas'));
function safeRead(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return []}}
function store(key,set){try{localStorage.setItem(key,JSON.stringify(Array.from(set)))}catch(e){}}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function href(l){return '/aulas/'+encodeURIComponent(l.id)+'/'}
function frontBy(id){return data.fronts.find(function(x){return x.id===id})}
function blockBy(id){return data.blocks.find(function(x){return x.id===id})}
function short(v,n){var s=String(v||'');return s.length>n?s.slice(0,n).trim()+'…':s}
function title(str){document.title=str+' · Capri Matemática'}
function empty(label,detail){return '<div class="placeholder"><div class="emoji">✦</div><h3>'+esc(label)+'</h3><p>'+esc(detail)+'</p></div>'}
function header(){return '<header class="topbar"><div class="shell"><a href="/" class="brand"><span class="brand-badge">∑</span><span>capri<span style="color:#6b48d1">.</span>mat<small>matemática com personalidade</small></span></a><nav class="navlinks"><a href="/#materiais">Listas e PDFs</a><a href="/#explorar">Explorar assuntos</a><a class="nav-cta" href="/#materiais">Baixar materiais ↗</a></nav></div></header>'}
function footer(){return '<footer class="footer"><div class="shell"><div><strong>capri.mat ✳</strong><p>Feito para aprender, revisar e mandar bem. Prof. João Capri.</p></div><p>Álgebra • Geometria • Aritmética, Estatística e Trigonometria</p></div></footer>'}
function card(l){return '<a class="lesson-card" href="'+href(l)+'"><span class="mini">Aula '+esc(l.id)+' · '+esc(frontBy(l.front).name)+'</span><h4>'+esc(l.title)+'</h4><p>'+esc(l.summary||'Abra a aula e explore seu roteiro de estudos.')+'</p><div class="card-bottom"><span class="badge '+(done.has(l.id)?'checkdone':'')+'">'+(done.has(l.id)?'✓ Estudada':'Ver aula')+'</span><span class="arrow">↗</span></div></a>'}

var SUBJECT_AREAS = [{"id":"fundamentos","name":"Fundamentos","icon":"123","tone":"mint","description":"Números, frações, porcentagens e aquela base que faz tudo funcionar.","ranges":[["A",1,6],["C",1,12]]},{"id":"funcoes","name":"Funções & gráficos","icon":"f(x)","tone":"violet","description":"Do primeiro grau aos logaritmos, com gráficos e aplicações.","ranges":[["A",7,32]]},{"id":"algebra","name":"Álgebra & sequências","icon":"x²","tone":"pink","description":"PA, PG, polinômios, complexos, matrizes e sistemas.","ranges":[["A",33,48],["C",45,48]]},{"id":"geometria-plana","name":"Geometria plana","icon":"△","tone":"peach","description":"Ângulos, triângulos, áreas e circunferências.","ranges":[["B",1,15]]},{"id":"geometria-espacial","name":"Geometria espacial","icon":"⬡","tone":"sky","description":"Posições no espaço, prismas, cones, pirâmides e esferas.","ranges":[["B",16,32]]},{"id":"geometria-analitica","name":"Geometria analítica","icon":"⌖","tone":"lilac","description":"Coordenadas, retas, circunferências, cônicas e vetores.","ranges":[["B",33,48]]},{"id":"combinatoria","name":"Combinatória & probabilidade","icon":"?!","tone":"yellow","description":"Contagem, possibilidades, probabilidades e binômio.","ranges":[["C",13,26]]},{"id":"estatistica","name":"Estatística","icon":"▥","tone":"cream","description":"Gráficos, médias, mediana, desvio e análise de dados.","ranges":[["C",27,32]]},{"id":"trigonometria","name":"Trigonometria","icon":"θ","tone":"lime","description":"Triângulos, ciclo trigonométrico e equações.","ranges":[["C",33,44]]}];
var SUBJECT_TOPIC_ICONS={A1:'⊂',A2:'f(x)',A3:'↗',A4:'x²',A5:'|x|',A6:'log',A7:'∞',A8:'i',B1:'△',B2:'◉',B3:'⬡',B4:'⌖',C1:'%',C2:'n!',C3:'▥',C4:'θ',C5:'[ ]','B-space':'⊥'};
function subjectContains(area,lesson){var n=Number(lesson.id.slice(1));return area.ranges.some(function(r){return lesson.front===r[0]&&n>=r[1]&&n<=r[2]})}
function areaForLesson(lesson){return SUBJECT_AREAS.find(function(a){return subjectContains(a,lesson)})}
function subjectTopic(lesson,area){return area.id==='geometria-espacial'&&Number(lesson.id.slice(1))<18?'B-space':lesson.block}
function topicInfo(topic){if(topic==='B-space')return {id:topic,title:'Posições e projeções',description:'Retas, planos e projeções no espaço.'};return blockBy(topic)}

function home(){
 title('Encontre sua aula');
 var app=document.getElementById('app');
 app.innerHTML=header()+'<main class="shell"><section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="dot"></span> TEM MATEMÁTICA PRA TODO MUNDO</div><h1>Bora fazer <em>essa conta</em> fechar?</h1><p>Encontre suas listas de exercícios, baixe PDFs e revise a teoria quando precisar. Tudo sem complicação.</p><label class="searchwrap"><span>⌕</span><input id="hero-search" type="search" autocomplete="off" placeholder="Busque: logaritmo, geometria, A17…"><button type="button" id="btn-search">BUSCAR ↗</button></label><div class="hero-suggestions" id="hero-suggestions" hidden aria-live="polite"></div><div class="hero-actions"><a class="hero-files-link" href="/#materiais">📄 Explorar listas e PDFs ↗</a><a class="hero-small-link" href="/#explorar">Ver todas as aulas ↓</a></div><div class="searchhint">Tente: <b>função quadrática</b>, <b>probabilidade</b> ou <b>trigonometria</b></div></div><div class="hero-art" aria-hidden="true"><span class="art-star">✳</span><div class="art-circle"><span>π²</span></div><span class="art-label">100% sem pânico!</span><span class="art-label two">x = você consegue ✦</span></div></section><div class="layout-stats"><div class="stat"><div class="stat-ico">✦</div><div><b>'+data.lessons.length+'</b><small>aulas no mapa</small></div></div><div class="stat"><div class="stat-ico">▧</div><div><b>'+data.blocks.length+'</b><small>blocos de estudo</small></div></div><div class="stat"><div class="stat-ico">◉</div><div><b>'+data.fronts.length+'</b><small>frentes de matemática</small></div></div></div><section class="library-hub" id="materiais"><div class="library-hub-top"><div><div class="eyebrow"><span class="dot"></span> DIRETO AO QUE INTERESSA</div><h2>Listas & PDFs <span>✳</span></h2><p>O material para treinar está aqui. Procure por assunto, código ou nome da aula — e baixe sem enrolação.</p></div><span class="library-icon" aria-hidden="true">📄</span></div><label class="library-search-label"><span>⌕</span><input type="search" id="library-search" placeholder="Busque: Bhaskara, A17, função…" autocomplete="off" aria-label="Buscar listas e PDFs"></label><p class="library-count" id="library-count" aria-live="polite"></p><div class="library-results" id="library-results"></div></section><section id="explorar" class="subject-browser"><div class="section-top browser-heading"><div><div class="eyebrow"><span class="dot"></span> UM PASSO DE CADA VEZ</div><h2>Encontre seu assunto ✳</h2><p class="browser-description">Escolha uma área, refine o assunto e chegue à aula certa. Sem precisar rolar 144 cartões.</p></div><span class="browser-illustration" aria-hidden="true">↗</span></div><div class="browser-searchbar"><span aria-hidden="true">⌕</span><input id="lesson-search" type="search" autocomplete="off" placeholder="Ou busque uma aula: Bhaskara, A17, matrizes…" aria-label="Buscar qualquer aula de matemática"><span class="browser-search-hint">144 aulas</span></div><div id="explore-content" aria-live="polite"></div></section></main>'+footer();
 var heroSearch=document.getElementById('hero-search');
 var lessonSearch=document.getElementById('lesson-search');
 var browser=document.getElementById('explore-content');
 var suggestions=document.getElementById('hero-suggestions');
 var state={view:'areas',area:'',topic:'',q:''},shown=24;
 var lessons=data.lessons;
 function areaLessons(area){return lessons.filter(function(l){return subjectContains(area,l)})}
 function term(l){return norm([l.id,l.title,l.summary,frontBy(l.front).name,blockBy(l.block).title].join(' '))}
 function matches(q){var search=norm(q.trim());return !search?[]:lessons.filter(function(l){return term(l).includes(search)})}
 function drawRow(l,showArea){var area=areaForLesson(l);return '<a class="browse-lesson-row" href="'+href(l)+'"><span class="browse-lesson-number">'+esc(l.id)+'</span><span class="browse-lesson-copy"><strong>'+esc(l.title)+'</strong><small>'+esc(l.summary||'Abra para estudar.')+'</small>'+(showArea?'<span class="browse-lesson-meta">'+esc(area.name)+' · '+esc(topicInfo(subjectTopic(l,area)).title)+'</span>':'')+'</span><span class="browse-lesson-right">'+(done.has(l.id)?'<span class="browse-studied">✓ Estudada</span>':'<span class="browse-enter">↗</span>')+'</span></a>'}
 function crumbs(parts){return '<nav class="browser-crumbs" aria-label="Caminho da matéria"><button type="button" data-catalog="areas">Todas as áreas</button>'+parts.map(function(p){return '<span class="crumb-chevron">›</span>'+(p.action?'<button type="button" data-catalog="'+p.action+'" data-id="'+esc(p.id||'')+'">'+esc(p.label)+'</button>':'<strong>'+esc(p.label)+'</strong>')}).join('')+'</nav>'}
 function subjectTile(area){var n=areaLessons(area).length;return '<button class="area-tile" type="button" data-catalog="area" data-id="'+area.id+'"><span class="area-tile-icon tone-'+area.tone+'">'+esc(area.icon)+'</span><span class="area-tile-name">'+esc(area.name)+'</span><span class="area-tile-subtitle">'+esc(area.description)+'</span><span class="area-tile-foot"><span>'+n+' aulas</span><span class="area-tile-go">↗</span></span></button>'}
 function listWithLimit(items,label,showArea){var limit=items.slice(0,shown);return '<div class="browse-list-intro"><div><h3>'+esc(label)+'</h3><p>'+items.length+' '+(items.length===1?'aula':'aulas')+' · Escolha uma para começar.</p></div></div><div class="browse-lesson-list">'+(limit.length?limit.map(function(l){return drawRow(l,showArea)}).join(''):'<div class="browse-empty">Nenhuma aula encontrada. Tente outra palavra ou explore as áreas acima.</div>')+'</div>'+(shown<items.length?'<button type="button" class="browse-more" data-catalog="more">Mostrar mais '+Math.min(24,items.length-shown)+' aulas ↓</button>':'')}
 function render(){
  var html='',area=SUBJECT_AREAS.find(function(a){return a.id===state.area});
  if(state.view==='search'){
   var found=matches(state.q);html=crumbs([{label:'Resultados da busca'}])+listWithLimit(found,'Resultados para “'+state.q+'”',true);
  }else if(state.view==='favorites'){
   html=crumbs([{label:'Favoritas'}])+listWithLimit(lessons.filter(function(l){return saved.has(l.id)}),'Suas aulas favoritas',true);
  }else if(state.view==='all'){
   html=crumbs([{label:'Todas as aulas'}])+listWithLimit(lessons,'Catálogo completo',true);
  }else if(state.view==='topics'&&area){
   var chosen=areaLessons(area),groups=[],seen=new Set();
   chosen.forEach(function(l){var code=subjectTopic(l,area);if(!seen.has(code)){seen.add(code);groups.push(code)}});
   html=crumbs([{label:area.name}])+'<div class="browse-section-head"><div class="browse-kicker">ETAPA 2 DE 3</div><h3>Qual assunto de '+esc(area.name.toLowerCase())+'?</h3><p>'+chosen.length+' aulas organizadas por tema. Escolha o que você quer estudar.</p></div><div class="browse-topic-grid">'+groups.map(function(code){var info=topicInfo(code),lst=chosen.filter(function(l){return subjectTopic(l,area)===code});return '<button class="browse-topic" type="button" data-catalog="topic" data-id="'+esc(code)+'"><span class="browse-topic-icon">'+esc(SUBJECT_TOPIC_ICONS[code]||'✦')+'</span><span class="browse-topic-copy"><strong>'+esc(info.title)+'</strong><small>'+esc(info.description||'')+'</small><span class="browse-topic-count">'+lst.length+' '+(lst.length===1?'aula':'aulas')+'</span></span><span class="browse-topic-next">↗</span></button>'}).join('')+'</div>';
  }else if(state.view==='lessons'&&area){
   var topic=state.topic,group=areaLessons(area).filter(function(l){return subjectTopic(l,area)===topic});
   if(!group.length){state.view='topics';return render()}
   html=crumbs([{label:area.name,action:'area',id:area.id},{label:topicInfo(topic).title}])+'<div class="browse-section-head"><div class="browse-kicker">ETAPA 3 DE 3</div><h3>'+esc(topicInfo(topic).title)+'</h3><p>Agora escolha a aula que quer abrir.</p></div>'+listWithLimit(group,'Aulas deste assunto',false);
  }else{
   state.view='areas';
   html='<div class="browser-toolbar"><div><span class="browse-kicker">ETAPA 1 DE 3</span><h3>Por onde começamos?</h3><p>Nove áreas. Um universo de possibilidades.</p></div><div class="browser-shortcuts"><button type="button" data-catalog="favorites">♡ Favoritas'+(saved.size?' ('+saved.size+')':'')+'</button><button type="button" data-catalog="all">Ver todas as 144 ↗</button></div></div><div class="area-grid">'+SUBJECT_AREAS.map(subjectTile).join('')+'</div>';
  }
  browser.innerHTML=html;
  lessonSearch.value=state.view==='search'?state.q:'';
 }
 function syncUrl(replace){
  var url=new URL(location.href);
  ['area','assunto','q','favoritos','todas','frente'].forEach(function(k){url.searchParams.delete(k)});
  if(state.view==='search'&&state.q.trim())url.searchParams.set('q',state.q.trim());
  if(state.view==='topics'||state.view==='lessons')url.searchParams.set('area',state.area);
  if(state.view==='lessons')url.searchParams.set('assunto',state.topic);
  if(state.view==='favorites')url.searchParams.set('favoritos','1');
  if(state.view==='all')url.searchParams.set('todas','1');
  var path=url.pathname+url.search+url.hash;if(replace)history.replaceState(null,'',path);else history.pushState(null,'',path);
 }
 function navigate(view,area,topic,q,opts){state={view:view,area:area||'',topic:topic||'',q:q||''};shown=24;syncUrl(opts&&opts.replace);render();if(opts&&opts.scroll)document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'})}
 function loadFromUrl(){
  var p=new URLSearchParams(location.search),a=SUBJECT_AREAS.find(function(x){return x.id===p.get('area')});
  if(p.get('q'))state={view:'search',area:'',topic:'',q:p.get('q')};
  else if(p.has('favoritos'))state={view:'favorites',area:'',topic:'',q:''};
  else if(p.has('todas'))state={view:'all',area:'',topic:'',q:''};
  else if(a&&p.get('assunto')&&areaLessons(a).some(function(l){return subjectTopic(l,a)===p.get('assunto')}))state={view:'lessons',area:a.id,topic:p.get('assunto'),q:''};
  else if(a)state={view:'topics',area:a.id,topic:'',q:''};
  else state={view:'areas',area:'',topic:'',q:''};
  shown=24;render();heroSearch.value=state.view==='search'?state.q:'';suggestions.hidden=true;
 }
 browser.addEventListener('click',function(e){
  var btn=e.target.closest('button[data-catalog]');if(!btn)return;
  var act=btn.dataset.catalog,id=btn.dataset.id||'';
  if(act==='area')navigate('topics',id);
  else if(act==='topic')navigate('lessons',state.area,id);
  else if(act==='areas')navigate('areas');
  else if(act==='all')navigate('all');
  else if(act==='favorites')navigate('favorites');
  else if(act==='more'){shown+=24;render()}
 });
 function drawSuggestions(q){
  var found=matches(q).slice(0,5);
  if(!q.trim()||!found.length){suggestions.hidden=true;suggestions.innerHTML='';return}
  suggestions.hidden=false;suggestions.innerHTML=found.map(function(l){return '<a href="'+href(l)+'"><b>'+esc(l.id)+'</b><span>'+esc(l.title)+'</span><span>↗</span></a>'}).join('')+'<button type="button" id="see-search-results">Ver todos os resultados ↓</button>';
  document.getElementById('see-search-results').addEventListener('click',function(){suggestions.hidden=true;document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'})});
 }
 heroSearch.addEventListener('input',function(){var q=heroSearch.value; if(q.trim())navigate('search','','',q,{replace:true});else navigate('areas','','','',{replace:true});drawSuggestions(q)});
 heroSearch.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();suggestions.hidden=true;document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'})}if(e.key==='Escape')suggestions.hidden=true});
 document.getElementById('btn-search').addEventListener('click',function(){suggestions.hidden=true;document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'})});
 lessonSearch.addEventListener('input',function(){var q=lessonSearch.value;if(q.trim())navigate('search','','',q,{replace:true});else navigate('areas','','','',{replace:true});heroSearch.value=q});
 lessonSearch.addEventListener('keydown',function(e){if(e.key==='Escape'){lessonSearch.value='';heroSearch.value='';navigate('areas','','','',{replace:true})}});
 window.addEventListener('popstate',loadFromUrl);
  const librarySearch=document.getElementById('library-search'),libraryResults=document.getElementById('library-results'),libraryCount=document.getElementById('library-count');
 function renderLibrary(){
  var q=norm(librarySearch.value.trim());
  var matches=materialIndex.filter(function(item){var l=data.lessons.find(function(lesson){return lesson.id===item.aula});return l&&(!q||norm([l.id,l.title,l.summary,blockBy(l.block).title,frontBy(l.front).name].join(' ')).includes(q))});
  libraryCount.textContent=matches.length+' '+(matches.length===1?'aula com materiais disponíveis':'aulas com materiais disponíveis');
  libraryResults.innerHTML=matches.length?matches.map(function(item){
   var l=data.lessons.find(function(x){return x.id===item.aula});
   return '<article class="library-card"><a class="library-card-head" href="'+href(l)+'?tab=arquivos"><span class="library-code">'+esc(l.id)+'</span><span><strong>'+esc(l.title)+'</strong><small>'+esc(blockBy(l.block).title)+' · Frente '+esc(l.front)+'</small></span><span class="library-open">↗</span></a><div class="library-files">'+item.arquivos.map(function(f){return '<a class="library-file" href="'+esc(f.url)+'" download><span>↓ '+esc(f.titulo||'Arquivo PDF')+'</span><b>PDF ↗</b></a>'}).join('')+'</div></article>'
  }).join(''):(q?'<div class="library-empty">Ainda não há PDFs publicados para essa busca. Você pode encontrar a aula na lista completa logo abaixo.</div>':'<div class="library-empty">Explore o catálogo e confira os materiais publicados.</div>')
 }
 librarySearch.addEventListener('input',renderLibrary);renderLibrary();


 loadFromUrl();
}

function saveAction(l,btn){if(saved.has(l.id))saved.delete(l.id);else saved.add(l.id);store('capri-favoritos',saved);btn.textContent=(saved.has(l.id)?'♥ Salvo':'♡ Favoritar');btn.classList.toggle('liked',saved.has(l.id))}
function finishAction(l,btn){if(done.has(l.id))done.delete(l.id);else done.add(l.id);store('capri-estudadas',done);btn.textContent=(done.has(l.id)?'✓ Aula estudada':'✓ Marcar como estudada');btn.classList.toggle('liked',done.has(l.id))}
async function lessonPage(){
 var id=document.body.dataset.lesson;var l=data.lessons.find(function(x){return x.id===id});if(!l){document.getElementById('app').innerHTML=header()+'<main class="shell">'+empty('Aula não encontrada','Volte ao catálogo e tente novamente.')+'</main>'+footer();return}
 var b=blockBy(l.block),f=frontBy(l.front),near=data.lessons.filter(function(x){return x.block===l.block});var i=data.lessons.findIndex(function(x){return x.id===id});
 title(l.title);
 var content=null;try{var r=await fetch('/conteudos/'+id+'.json');if(r.ok)content=await r.json()}catch(e){}
 var app=document.getElementById('app');
 app.innerHTML=header()+'<main class="shell"><div class="crumbs"><a href="/">Início</a> / <a href="/?area='+(areaForLesson(l)||{id:''}).id+'#explorar">'+esc((areaForLesson(l)||{name:frontBy(l.front).name}).name)+'</a> / '+esc(b.title)+' / '+id+'</div><section class="lesson-hero front-'+esc(l.front)+'"><div class="code">✦ FRENTE '+l.front+' · BLOCO '+esc(b.id)+' · AULA '+id+'</div><h1>'+esc(l.title)+'</h1><p>'+esc(l.summary||'Seu roteiro de estudos começa aqui. Em breve, novas explicações e materiais.')+'</p><div class="spark">∑</div></section><div class="lesson-main"><aside class="sidepanel"><h3>✦ Neste bloco</h3><p>'+esc(b.title)+'</p><div class="sidelist">'+near.map(function(x){return '<a class="sidelesson '+(x.id===id?'active':'')+'" href="'+href(x)+'"><small>'+x.id+'</small>'+esc(x.title)+'</a>'}).join('')+'</div></aside><section><div class="actions"><button class="action primary" id="btn-done">'+(done.has(id)?'✓ Aula estudada':'✓ Marcar como estudada')+'</button><button class="action" id="btn-fav">'+(saved.has(id)?'♥ Salvo':'♡ Favoritar')+'</button><button class="action" id="btn-copy">↗ Copiar link</button></div><div class="material-spotlight"><div class="material-spotlight-symbol">📄</div><div><strong>Veio atrás de listas?</strong><p>'+(content&&((content.arquivos&&content.arquivos.length)||(content.lista&&content.lista.length))?'Já tem material disponível para baixar.':'Consulte nesta área os arquivos de estudo disponíveis.')+'</p></div><button type="button" class="material-spotlight-button" id="open-materials">Listas e PDFs ↗</button></div><article class="contentpanel"><div class="tabs"><button class="tab tab-featured" data-tab="arquivos">📄 Listas e PDFs</button><button class="tab" data-tab="resumo">Visão geral</button><button class="tab" data-tab="teoria">Teoria</button><button class="tab" data-tab="quiz">Quiz ⚡</button><button class="tab" data-tab="videos">Vídeos ▶</button></div><div id="tab-body"></div></article><div class="prevnext">'+(i>0?'<a href="'+href(data.lessons[i-1])+'">← Anterior: '+esc(short(data.lessons[i-1].title,38))+'</a>':'<span></span>')+(i<data.lessons.length-1?'<a href="'+href(data.lessons[i+1])+'">Próxima: '+esc(short(data.lessons[i+1].title,38))+' →</a>':'')+'</div></section></div></main>'+footer();
 var area=document.getElementById('tab-body');
 function filesHtml(files,type){var list=(files||[]).filter(function(x){return !type||x.tipo===type});return list.length?list.map(function(x){return '<a class="filelink" target="_blank" rel="noopener" href="'+esc(x.url)+'"><span>📄 '+esc(x.titulo||'Material')+'</span><span>Baixar ↗</span></a>'}).join(''):empty('Materiais a caminho','As listas de exercícios e os gabaritos desta aula serão publicados aqui.')}
 function renderTab(tab){
  var html='';
  if(tab==='resumo'){html='<div class="eyebrow"><span class="dot"></span> SEU PONTO DE PARTIDA</div><h2>O que você vai aprender</h2><div class="topic">'+esc(l.summary||'Conceitos e aplicações desta aula.')+'</div>'+(l.notes.length?'<h3>Para ficar de olho 👀</h3>'+l.notes.map(function(x){return '<div class="note">'+esc(x)+'</div>'}).join(''):'')+'<p class="muted">Veja a teoria explicada passo a passo e use o quiz para consolidar o entendimento.</p>'}
  if(tab==='teoria'){var sections=content&&Array.isArray(content.teoria)?content.teoria:[];html='<h2>Teoria & exemplos</h2>'+(sections.length?sections.map(function(s,j){var h='<section class="theory-section"><span class="step-label">PASSO '+(j+1)+'</span><h3>'+esc(s.titulo||'Conceito')+'</h3>';for(var p of(s.paragrafos||[])){h+='<p>'+esc(p)+'</p>'}for(var formula of(s.formulas||[])){h+='<div class="formula">\\('+esc(formula)+'\\)</div>'}if(s.exemplo){h+='<div class="theory-example"><b>✦ Bora ver na prática?</b><p>'+esc(s.exemplo.enunciado)+'</p>'+(s.exemplo.passos||[]).map(function(p){return '<p class="example-step">'+esc(p)+'</p>'}).join('')+'</div>'}if(s.dica)h+='<div class="hint">💡 <b>Macete:</b> '+esc(s.dica)+'</div>';if(s.erroComum)h+='<div class="warning">⚠️ <b>Armadilha de prova:</b> '+esc(s.erroComum)+'</div>';return h+'</section>'}).join(''):empty('A explicação vem aí','A teoria desta aula ainda não foi publicada. Por enquanto, consulte o roteiro na Visão geral.'))}
  if(tab==='quiz'){html='<h2>Quiz relâmpago ⚡</h2>'+(content&&content.quiz&&content.quiz.length?'<p>Responda, descubra o porquê e continue. Sem pegadinhas desnecessárias!</p><div id="quiz-root"></div>':empty('Quiz a caminho','As perguntas interativas serão publicadas nesta aba.'))}
  if(tab==='videos'){var videos=content&&content.videos||[];html='<h2>Viu, entendeu? ▶</h2><p>Videoaulas e materiais complementares para estudar o assunto.</p>'+(videos.length?'<div class="video-grid">'+videos.map(function(v){var u=safeUrl(v.url);return u?'<a class="video-card" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer"><span class="video-play">▶</span><div><small>'+esc(v.canal||'Vídeo recomendado')+'</small><h3>'+esc(v.titulo)+'</h3><p>'+esc(v.descricao||'')+'</p></div><span class="video-arrow">↗</span></a>':''}).join('')+'</div>':empty('Videoaulas','Encontre uma aula em vídeo sobre este tema.'))+'<a class="video-search-more" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/results?search_query='+encodeURIComponent(l.title+' matemática videoaula')+'">⌕ Pesquisar videoaulas: '+esc(l.title)+' ↗</a>'}
  if(tab==='arquivos'){
   var links=(content&&content.lista&&content.lista.length)?'<div class="print-actions"><a class="filelink" target="_blank" rel="noopener" href="/imprimir/?aula='+encodeURIComponent(id)+'&tipo=lista"><span>📝 Lista formatada para A4</span><span>Salvar PDF ↗</span></a><a class="filelink" target="_blank" rel="noopener" href="/imprimir/?aula='+encodeURIComponent(id)+'&tipo=gabarito"><span>✅ Gabarito comentado em A4</span><span>Salvar PDF ↗</span></a><p class="small-explainer">Abra o material e escolha <b>Imprimir / Salvar PDF</b> para criar uma cópia em seu dispositivo.</p></div>':'';
   var files=content&&content.arquivos||[];
   var practice=content&&Array.isArray(content.exercicios)?content.exercicios:[];
   html='<div class="materials-tab-title"><div><div class="eyebrow"><span class="dot"></span> SEUS MATERIAIS DE ESTUDO</div><h2>Listas & PDFs</h2><p>Baixe, imprima e pratique no seu ritmo.</p></div><span class="materials-tab-emoji">↗</span></div>'+links+(files.length?filesHtml(files):(!links?empty('Listas e PDFs','Ainda não há PDFs associados a esta aula. Explore a teoria e o quiz nas outras abas.'):''))+(practice.length?'<section class="practice-inline"><h3>Mais atividades para treinar</h3>'+practice.map(function(x,j){return '<div class="topic"><b>Atividade '+(j+1)+'</b><p>'+esc(x.enunciado||'')+'</p>'+(x.resposta?'<details><summary>Conferir resposta</summary><p>'+esc(x.resposta)+'</p></details>':'')+'</div>'}).join('')+'</section>':'');
  }
  area.innerHTML=html;if(tab==='quiz'&&content&&content.quiz&&content.quiz.length)initQuiz(content.quiz);if(window.MathJax&&window.MathJax.typesetPromise)window.MathJax.typesetPromise([area]);
 }
 document.querySelectorAll('[data-tab]').forEach(function(el){el.addEventListener('click',function(){document.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('active',x===el)});renderTab(el.dataset.tab)})});
 document.getElementById('btn-fav').addEventListener('click',function(){saveAction(l,this)});
 document.getElementById('btn-done').addEventListener('click',function(){finishAction(l,this)});
 document.getElementById('btn-copy').addEventListener('click',async function(){try{await navigator.clipboard.writeText(location.href);this.textContent='✓ Link copiado'}catch(e){this.textContent='Copie o endereço acima'}});
 document.getElementById('open-materials').addEventListener('click',function(){switchTab('arquivos')});
 function switchTab(tab){document.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('active',x.dataset.tab===tab)});renderTab(tab)}
 var requested=new URLSearchParams(location.search).get('tab');
 if(['resumo','teoria','quiz','videos','arquivos'].includes(requested))switchTab(requested);
 else switchTab((content&&((content.arquivos&&content.arquivos.length)||(content.lista&&content.lista.length)))?'arquivos':'resumo');
}

function safeUrl(url){try{var x=new URL(url);return (x.protocol==='https:'||x.protocol==='http:')?x.toString():null}catch(e){return null}}
function initQuiz(questions){
 var root=document.getElementById('quiz-root');if(!root)return;
 var idx=0,score=0,answered=false,finish=false;
 function draw(){
  if(finish){root.innerHTML='<div class="quiz-score"><div class="emoji">✦</div><h3>Fim de jogo!</h3><div class="big-score">'+score+' / '+questions.length+'</div><p>'+(score===questions.length?'Você gabaritou! 👑':'Boa! Confira as explicações e tente de novo para fixar.')+'</p><button class="action primary" id="quiz-again">↻ Tentar novamente</button></div>';document.getElementById('quiz-again').addEventListener('click',function(){idx=0;score=0;answered=false;finish=false;draw()});return}
  var q=questions[idx];root.innerHTML='<div class="quiz-meta"><span>QUESTÃO '+(idx+1)+' DE '+questions.length+'</span><span>ACERTOS: '+score+'</span></div><div class="quiz-track"><span style="width:'+((idx+1)*100/questions.length)+'%"></span></div><div class="quiz-question"><span class="step-label">'+esc(q.nivel||'Treino')+'</span><h3>'+esc(q.enunciado)+'</h3><div class="quiz-options">'+q.opcoes.map(function(opt,j){return '<button class="quiz-option" data-opt="'+j+'" type="button"><span class="letter">'+String.fromCharCode(65+j)+'</span><span>'+esc(opt)+'</span></button>'}).join('')+'</div><div id="quiz-feedback" aria-live="polite"></div></div>';
  root.querySelectorAll('[data-opt]').forEach(function(button){button.addEventListener('click',function(){if(answered)return;answered=true;var n=Number(button.dataset.opt),ok=n===q.correta;if(ok)score++;root.querySelectorAll('[data-opt]').forEach(function(b){var current=Number(b.dataset.opt);b.disabled=true;if(current===q.correta)b.classList.add('correct');else if(current===n)b.classList.add('incorrect')});document.getElementById('quiz-feedback').innerHTML='<div class="quiz-feedback"><b>'+(ok?'✓ Boa! Resposta certa.':'↗ Quase! Agora faz sentido.')+'</b><p>'+esc(q.explicacao)+'</p><button class="action primary" id="quiz-next">'+(idx===questions.length-1?'Ver resultado':'Próxima questão →')+'</button></div>';document.getElementById('quiz-next').addEventListener('click',function(){idx++;answered=false;if(idx>=questions.length)finish=true;draw()});if(window.MathJax&&window.MathJax.typesetPromise)window.MathJax.typesetPromise([root])})});
  if(window.MathJax&&window.MathJax.typesetPromise)window.MathJax.typesetPromise([root]);
 }
 draw();
}

async function init(){try{var r=await fetch('/data/aulas.json');if(!r.ok)throw Error('Catálogo não encontrado');data=await r.json();try{var m=await fetch('/data/materiais.json');if(m.ok)materialIndex=await m.json()}catch(e){materialIndex=[]}if(document.body.dataset.lesson)await lessonPage();else home()}catch(e){document.getElementById('app').innerHTML=header()+'<main class="shell">'+empty('Não foi possível carregar o catálogo','Recarregue a página para tentar novamente.')+'</main>'+footer();console.error(e)}}
init();
})();
