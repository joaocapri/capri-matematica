
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
function title(str){document.title=str+' · MAT MAT MAT!'}
function empty(label,detail){return '<div class="placeholder"><div class="emoji">✦</div><h3>'+esc(label)+'</h3><p>'+esc(detail)+'</p></div>'}
function brandLogo(){return '<img class="mat-logo-img" src="/assets/logo-mat-256.png" width="256" height="231" alt="" decoding="async">'}
function header(){return '<header class="topbar"><div class="shell"><a href="/" class="brand brand-mat" aria-label="MAT MAT MAT! — página inicial">'+brandLogo()+'<span class="mat-brand-descriptor">MATEMÁTICA<br>SEM ENROLAÇÃO<span class="mat-brand-dot">✳</span></span></a><div class="header-audience">Matemática para <strong>Ensino Médio e Vestibulares</strong></div><nav class="navlinks" aria-label="Navegação principal"><a href="/?q=PDF#resultados">Listas e PDFs</a><a href="/explorar/">Assuntos</a><a class="nav-cta" href="/teste-seu-nivel/"><span class="nav-cta-long">Teste seu nível ↗</span><span class="nav-cta-short">Teste seu nível ↗</span></a></nav></div><div class="header-mobile-caption">Matemática para <strong>Ensino Médio e Vestibulares</strong></div></header>'}
function footer(){return '<footer class="footer"><div class="shell"><div class="mat-footer-mark"><a href="/" class="brand-mat brand-mat-footer" aria-label="MAT MAT MAT! — início">'+brandLogo()+'</a><div><strong>MAT MAT MAT!</strong><p>Matemática de graça, do seu jeito. Conteúdo do Prof. João Capri.</p></div></div><p>Álgebra · Geometria · Aritmética · Estatística · Trigonometria</p></div></footer>'}
function card(l){return '<a class="lesson-card" href="'+href(l)+'"><span class="mini">Aula '+esc(l.id)+' · '+esc(frontBy(l.front).name)+'</span><h4>'+esc(l.title)+'</h4><p>'+esc(l.summary||'Abra a aula e explore seu roteiro de estudos.')+'</p><div class="card-bottom"><span class="badge '+(done.has(l.id)?'checkdone':'')+'">'+(done.has(l.id)?'✓ Estudada':'Ver aula')+'</span><span class="arrow">↗</span></div></a>'}

var SUBJECT_AREAS = [{"id":"fundamentos","name":"Fundamentos","icon":"123","tone":"mint","description":"Números, frações, porcentagens e aquela base que faz tudo funcionar.","ranges":[["A",1,6],["C",1,12]]},{"id":"funcoes","name":"Funções & gráficos","icon":"f(x)","tone":"violet","description":"Do primeiro grau aos logaritmos, com gráficos e aplicações.","ranges":[["A",7,32]]},{"id":"algebra","name":"Álgebra & sequências","icon":"x²","tone":"pink","description":"PA, PG, polinômios, complexos, matrizes e sistemas.","ranges":[["A",33,48],["C",45,48]]},{"id":"geometria-plana","name":"Geometria plana","icon":"△","tone":"peach","description":"Ângulos, triângulos, áreas e circunferências.","ranges":[["B",1,15]]},{"id":"geometria-espacial","name":"Geometria espacial","icon":"⬡","tone":"sky","description":"Posições no espaço, prismas, cones, pirâmides e esferas.","ranges":[["B",16,32]]},{"id":"geometria-analitica","name":"Geometria analítica","icon":"⌖","tone":"lilac","description":"Coordenadas, retas, circunferências, cônicas e vetores.","ranges":[["B",33,48]]},{"id":"combinatoria","name":"Combinatória & probabilidade","icon":"?!","tone":"yellow","description":"Contagem, possibilidades, probabilidades e binômio.","ranges":[["C",13,26]]},{"id":"estatistica","name":"Estatística","icon":"▥","tone":"cream","description":"Gráficos, médias, mediana, desvio e análise de dados.","ranges":[["C",27,32]]},{"id":"trigonometria","name":"Trigonometria","icon":"θ","tone":"lime","description":"Triângulos, ciclo trigonométrico e equações.","ranges":[["C",33,44]]}];
var SUBJECT_TOPIC_ICONS={A1:'⊂',A2:'f(x)',A3:'↗',A4:'x²',A5:'|x|',A6:'log',A7:'∞',A8:'i',B1:'△',B2:'◉',B3:'⬡',B4:'⌖',C1:'%',C2:'n!',C3:'▥',C4:'θ',C5:'[ ]','B-space':'⊥'};
function subjectContains(area,lesson){var n=Number(lesson.id.slice(1));return area.ranges.some(function(r){return lesson.front===r[0]&&n>=r[1]&&n<=r[2]})}
function areaForLesson(lesson){return SUBJECT_AREAS.find(function(a){return subjectContains(a,lesson)})}
var SUBJECT_TOPICS=[{"id":"f-conjuntos","area":"fundamentos","title":"Conjuntos e números","description":"Conjuntos, intervalos e números reais.","icon":"⊂","ranges":[["A",1,4]]},{"id":"f-potencias","area":"fundamentos","title":"Potências e raízes","description":"Potenciação, radiciação e notação científica.","icon":"√","ranges":[["A",5,6]]},{"id":"f-aritmetica","area":"fundamentos","title":"Aritmética e frações","description":"Primos, divisibilidade, MMC, MDC e frações.","icon":"÷","ranges":[["C",1,3]]},{"id":"f-proporcoes","area":"fundamentos","title":"Proporções e medidas","description":"Escalas, grandezas, regra de três e unidades.","icon":"↔","ranges":[["C",4,6],["C",12,12]]},{"id":"f-financeira","area":"fundamentos","title":"Porcentagem e finanças","description":"Variações percentuais, juros e amortização.","icon":"%","ranges":[["C",7,11]]},{"id":"fu-inicio","area":"funcoes","title":"O que é uma função?","description":"Relações, domínio, imagem e classificação.","icon":"f(x)","ranges":[["A",7,10]]},{"id":"fu-afim","area":"funcoes","title":"Função do 1º grau","description":"Retas, gráficos, modelos e sistemas.","icon":"↗","ranges":[["A",11,15]]},{"id":"fu-quadratica","area":"funcoes","title":"Função quadrática","description":"Bhaskara, vértice, gráficos e otimização.","icon":"x²","ranges":[["A",16,21]]},{"id":"fu-modulo","area":"funcoes","title":"Função modular","description":"Módulo, equações e inequações.","icon":"|x|","ranges":[["A",22,24]]},{"id":"fu-exponencial","area":"funcoes","title":"Função exponencial","description":"Crescimento, equações e inequações.","icon":"2ˣ","ranges":[["A",25,26]]},{"id":"fu-logs","area":"funcoes","title":"Logaritmos","description":"Propriedades, função e equações logarítmicas.","icon":"log","ranges":[["A",27,32]]},{"id":"al-sequencias","area":"algebra","title":"Sequências, PA e PG","description":"Padrões, progressões e somas.","icon":"∞","ranges":[["A",33,38]]},{"id":"al-complexos","area":"algebra","title":"Números complexos","description":"Unidade imaginária, plano e forma trigonométrica.","icon":"i","ranges":[["A",39,42]]},{"id":"al-polinomios","area":"algebra","title":"Polinômios","description":"Divisão, fatoração, raízes e Girard.","icon":"P(x)","ranges":[["A",43,48]]},{"id":"al-matrizes","area":"algebra","title":"Matrizes e sistemas","description":"Operações, determinantes e escalonamento.","icon":"[ ]","ranges":[["C",45,48]]},{"id":"gp-triangulos","area":"geometria-plana","title":"Ângulos e triângulos","description":"Congruência, semelhança e relações métricas.","icon":"△","ranges":[["B",1,5]]},{"id":"gp-poligonos","area":"geometria-plana","title":"Polígonos","description":"Quadriláteros, regulares e apótemas.","icon":"⬡","ranges":[["B",6,8]]},{"id":"gp-circulo","area":"geometria-plana","title":"Circunferências","description":"Ângulos, relações métricas e comprimento.","icon":"◉","ranges":[["B",9,11]]},{"id":"gp-areas","area":"geometria-plana","title":"Áreas","description":"Triângulos, círculos, quadriláteros e razões.","icon":"▱","ranges":[["B",12,15]]},{"id":"ge-posicao","area":"geometria-espacial","title":"Posições no espaço","description":"Retas, planos e projeções ortogonais.","icon":"⊥","ranges":[["B",16,17]]},{"id":"ge-poliedros","area":"geometria-espacial","title":"Poliedros e prismas","description":"Relação de Euler, superfícies e volumes.","icon":"⬡","ranges":[["B",18,20]]},{"id":"ge-piramides","area":"geometria-espacial","title":"Pirâmides","description":"Áreas, volumes e troncos.","icon":"△","ranges":[["B",21,22]]},{"id":"ge-cilindro-cone","area":"geometria-espacial","title":"Cilindros e cones","description":"Corpos redondos, superfícies e troncos.","icon":"◭","ranges":[["B",23,25]]},{"id":"ge-esfera","area":"geometria-espacial","title":"Esferas","description":"Área, volume, calotas e cunhas.","icon":"◉","ranges":[["B",26,27]]},{"id":"ge-relacoes","area":"geometria-espacial","title":"Sólidos combinados","description":"Inscrição, revolução e semelhança.","icon":"⬢","ranges":[["B",28,32]]},{"id":"ga-pontos-retas","area":"geometria-analitica","title":"Pontos e retas","description":"Distância, inclinação, área e alinhamento.","icon":"⌖","ranges":[["B",33,36]]},{"id":"ga-circunferencia","area":"geometria-analitica","title":"Circunferências no plano","description":"Equações e posições relativas.","icon":"○","ranges":[["B",37,38]]},{"id":"ga-conicas","area":"geometria-analitica","title":"Cônicas","description":"Elipses, hipérboles e parábolas.","icon":"∩","ranges":[["B",39,42]]},{"id":"ga-vetores","area":"geometria-analitica","title":"Vetores e espaço","description":"Operações, produto escalar e coordenadas 3D.","icon":"→","ranges":[["B",43,46]]},{"id":"ga-avancada","area":"geometria-analitica","title":"Lugares geométricos","description":"Problemas avançados e coordenadas polares.","icon":"◎","ranges":[["B",47,48]]},{"id":"cp-arranjos","area":"combinatoria","title":"Contagem e permutação","description":"PFC, fatorial, arranjos e anagramas.","icon":"n!","ranges":[["C",13,16]]},{"id":"cp-combinacoes","area":"combinatoria","title":"Combinações e binômio","description":"Grupos, repetição, contagem e Newton.","icon":"C(n,p)","ranges":[["C",17,19],["C",26,26]]},{"id":"cp-probabilidade","area":"combinatoria","title":"Probabilidade","description":"Eventos, condicionais, binomial e Bayes.","icon":"?!","ranges":[["C",20,25]]},{"id":"es-graficos","area":"estatistica","title":"Leitura de dados","description":"Gráficos, média, mediana e moda.","icon":"▥","ranges":[["C",27,29]]},{"id":"es-dispersao","area":"estatistica","title":"Dispersão e inferência","description":"Variância, desvio padrão e amostragem.","icon":"σ","ranges":[["C",30,32]]},{"id":"tr-fundamentos","area":"trigonometria","title":"Razões e ciclo trigonométrico","description":"Seno, cosseno, tangente e radianos.","icon":"θ","ranges":[["C",33,37]]},{"id":"tr-identidades","area":"trigonometria","title":"Identidades e fórmulas","description":"Adição, arco duplo e transformações.","icon":"sin","ranges":[["C",38,40]]},{"id":"tr-equacoes","area":"trigonometria","title":"Funções e equações","description":"Gráficos, inequações e leis trigonométricas.","icon":"∿","ranges":[["C",41,44]]}];
function subjectTopic(lesson,area){var n=Number(lesson.id.slice(1));var t=SUBJECT_TOPICS.find(function(x){return x.area===area.id&&x.ranges.some(function(r){return lesson.front===r[0]&&n>=r[1]&&n<=r[2]})});return t?t.id:lesson.block}
function topicInfo(topic){return SUBJECT_TOPICS.find(function(x){return x.id===topic})||blockBy(topic)}



/* Catálogo de PDFs: aula, assunto (tema) ou grande área. */
function materialOwner(item){
 if(item.aula){var l=data.lessons.find(function(x){return x.id===item.aula});if(!l)return null;var a=areaForLesson(l);return {kind:'aula',id:l.id,title:l.title,description:topicInfo(subjectTopic(l,a)).title,href:href(l)+'?tab=arquivos',lesson:l}}
 if(item.assunto){var t=SUBJECT_TOPICS.find(function(x){return x.id===item.assunto});if(!t)return null;var a=SUBJECT_AREAS.find(function(x){return x.id===t.area});return {kind:'assunto',id:t.id,title:t.title,description:a.name,href:'/explorar/?area='+encodeURIComponent(a.id)+'&assunto='+encodeURIComponent(t.id),topic:t}}
 if(item.area){var a=SUBJECT_AREAS.find(function(x){return x.id===item.area});if(!a)return null;return {kind:'area',id:a.id,title:a.name,description:'Material geral da área',href:'/explorar/?area='+encodeURIComponent(a.id),area:a}}
 return null;
}
function publishedMaterials(){return materialIndex.map(function(item){var owner=materialOwner(item);return owner&&item.arquivos&&item.arquivos.length?{owner:owner,item:item}:null}).filter(Boolean)}
function materialsAt(kind,id){return publishedMaterials().filter(function(x){return x.owner.kind===kind&&x.owner.id===id})}
function pdfLinks(files){return(files||[]).map(function(f){var u=String(f.url||'');return /^\/(?!\/)/.test(u)||/^https:\/\//.test(u)?'<a class="material-download" target="_blank" rel="noopener noreferrer" href="'+esc(u)+'"><span class="material-download-icon">↓</span><span>'+esc(f.titulo||'Material PDF')+'</span><b>PDF ↗</b></a>':''}).join('')}
function topicPdfPanel(kind,id,label){var items=materialsAt(kind,id);return items.length?'<section class="topic-pdf-panel"><div><span class="topic-pdf-eyebrow">📄 LISTAS PUBLICADAS</span><h4>'+esc(label)+'</h4></div><div class="topic-pdf-files">'+items.map(function(x){return pdfLinks(x.item.arquivos)}).join('')+'</div></section>':''}
/* Parâmetros de contexto são de atribuição; o Exatoo só poderá abrir a
   ferramenta com a matéria selecionada quando incorporar seu próprio roteador. */
function exatooUrl(intent,lesson,topic){
 var args=new URLSearchParams({utm_source:'capri-matematica',utm_medium:'referral',utm_campaign:intent});
 if(lesson){args.set('capri_aula',lesson.id);args.set('capri_assunto',subjectTopic(lesson,areaForLesson(lesson)))}else if(topic)args.set('capri_assunto',topic.id);
 return (intent==='busca'?'https://exatoo.com/':'https://app.exatoo.com/')+'?'+args.toString()
}
function exatooCard(intent,lesson,topic){
 var m={erro:['Errou e não sabe onde?','O Exatoo tem um Detector de Erros para analisar sua resolução.','Conhecer o Detector de Erros ↗'],treino:['Quer treinar no seu nível?','O Gerador de Listas do Exatoo cria questões para praticar do seu jeito.','Criar treino personalizado ↗'],busca:['Sua dúvida é mais específica?','O Exatoo oferece ferramentas para trabalhar dificuldades individuais.','Conhecer o Exatoo ↗'],revisar:['Quer organizar sua revisão?','Monte uma sessão de estudos personalizada no Exatoo.','Montar sessão no Exatoo ↗']}[intent]||['Precisa de ajuda personalizada?','Encontre outras ferramentas no Exatoo.','Conhecer o Exatoo ↗'];
 return '<aside class="exatoo-context"><span class="exatoo-symbol">✳</span><div class="exatoo-copy"><span class="exatoo-eyebrow">ESTUDO PERSONALIZADO · EXATOO</span><strong>'+m[0]+'</strong><p>'+m[1]+'</p><small>O Capri continua gratuito. Você será direcionado ao Exatoo.</small></div><a class="exatoo-link" href="'+esc(exatooUrl(intent,lesson,topic))+'" target="_blank" rel="noopener noreferrer">'+m[2]+'</a></aside>'
}

function home(){
 title('Aulas, listas e PDFs gratuitos');
 // Links antigos continuam funcionando, agora no catálogo dedicado.
 var old=new URLSearchParams(location.search);
 if(old.has('area')||old.has('assunto')||old.has('favoritos')||old.has('todas')){
   location.replace('/explorar/'+location.search);return;
 }
 var app=document.getElementById('app');
 var featured=publishedMaterials();
 app.innerHTML=header()+
 '<main class="shell home-shell">'+
 '<section class="home-hero" aria-labelledby="hero-title"><div class="home-hero-copy">'+
 
 '<h1 id="hero-title">O que você quer <em>estudar hoje?</em></h1>'+
 '<p>Listas de Exercícios e Teoria grátis. Simples assim</p>'+
 '<div class="home-search-section"><label class="home-searchbox" for="hero-search"><span class="home-search-mark" aria-hidden="true">⌕</span><input type="search" id="hero-search" autocomplete="off" aria-label="Pesquisar aulas, assuntos e PDFs" aria-controls="quick-hits" aria-expanded="false" placeholder="Busque um assunto, aula ou PDF…"><button type="button" id="clear-search" aria-label="Limpar busca" hidden>×</button><button type="button" id="btn-search" aria-label="Pesquisar">Buscar ↗</button></label>'+
 '<div class="home-quick-hits" id="quick-hits" hidden aria-live="polite"></div>'+
 '</div>'+
 
 '</div></section>'+
 '<section class="home-search-results" id="resultados" hidden aria-live="polite"><div class="home-results-head"><div><span class="home-section-label">SUA PESQUISA</span><h2 id="search-title">Resultados</h2></div><button id="return-home" class="home-back-button" type="button">← Voltar à exploração</button></div><div id="search-scope" class="home-search-scopes" role="group" aria-label="Filtrar resultados"></div><div id="search-output"></div></section>'+
 '<div id="home-discover">'+
 '<section id="explorar" class="home-explore" aria-labelledby="explore-title"><div class="home-section-intro"><div><span class="home-section-label"><span class="home-section-indicator"></span> TODA A MATEMÁTICA, ORGANIZADA</span><h2 id="explore-title">Encontre seu <em>material.</em></h2></div></div><div id="explore-content"></div></section>'+
 '</div></main>'+footer();

 var input=document.getElementById('hero-search');
 var clearBtn=document.getElementById('clear-search');
 var quick=document.getElementById('quick-hits');
 var main=document.getElementById('home-discover');
 var resultArea=document.getElementById('resultados');
 var scopeWrap=document.getElementById('search-scope');
 var resultOutput=document.getElementById('search-output');
 var browser=document.getElementById('explore-content');
 var state={view:'areas',area:'',topic:''},shown=18;
 var search={query:'',scope:'tudo',shown:12};
 var lessons=data.lessons;
 var materialByCode=new Map(featured.filter(function(x){return x.owner.kind==='aula'}).map(function(x){return [x.owner.id,x]}));
 function areaLessons(area){return lessons.filter(function(l){return subjectContains(area,l)})}
 function subTopic(l,area){return topicInfo(subjectTopic(l,area))}
 function drawRow(l,areaLabel){
  var area=areaForLesson(l);
  var hasMaterial=materialByCode.has(l.id);
  return '<a class="browse-lesson-row" href="'+href(l)+'"><span class="browse-lesson-number">'+esc(l.id)+'</span><span class="browse-lesson-copy"><strong>'+esc(l.title)+'</strong><small>'+esc(l.summary||'Abra a aula para começar.')+'</small>'+(areaLabel?'<span class="browse-lesson-meta">'+esc(area.name)+' · '+esc(subTopic(l,area).title)+'</span>':'')+'</span><span class="browse-lesson-right">'+(done.has(l.id)?'<span class="browse-studied">✓ Estudada</span>':hasMaterial?'<span class="browse-material-tag">PDF</span>':'<span class="browse-enter">↗</span>')+'</span></a>'
 }
 function crumbs(parts){return '<nav class="browser-crumbs" aria-label="Caminho"><button data-catalog="areas" type="button">Todas as áreas</button>'+parts.map(function(p){return '<span class="crumb-chevron">›</span>'+(p.action?'<button type="button" data-catalog="'+p.action+'" data-id="'+esc(p.id||'')+'">'+esc(p.label)+'</button>':'<strong>'+esc(p.label)+'</strong>')}).join('')+'</nav>'}
 function tile(area){return '<a class="area-tile" href="/explorar/?area='+encodeURIComponent(area.id)+'"><span class="area-tile-icon tone-'+area.tone+'">'+esc(area.icon)+'</span><span class="area-tile-name">'+esc(area.name)+'</span><span class="area-tile-subtitle">'+esc(area.description)+'</span><span class="area-tile-foot"><span>'+areaLessons(area).length+' aulas</span><span class="area-tile-go">↗</span></span></a>'}
 function list(items,label,showArea){
  return '<div class="browse-list-intro"><div><h3>'+esc(label)+'</h3><p>'+items.length+' '+(items.length===1?'aula disponível':'aulas disponíveis')+'</p></div></div><div class="browse-lesson-list">'+(items.length?items.slice(0,shown).map(function(l){return drawRow(l,showArea)}).join(''):'<div class="browse-empty">Nenhuma aula aqui por enquanto.</div>')+'</div>'+(shown<items.length?'<button type="button" data-catalog="more" class="browse-more">Carregar mais aulas ↓</button>':'')
 }
 function renderBrowse(){
  var area=SUBJECT_AREAS.find(function(a){return a.id===state.area}),html='';
  if(state.view==='favorites'){html=crumbs([{label:'Favoritas'}])+list(lessons.filter(function(l){return saved.has(l.id)}),'Suas aulas favoritas',true)}
  else if(state.view==='all'){html=crumbs([{label:'Catálogo completo'}])+list(lessons,'Todas as aulas',true)}
  else if(state.view==='topics'&&area){
   var listAreas=areaLessons(area);
   var ids=SUBJECT_TOPICS.filter(function(t){return t.area===area.id});
   html=crumbs([{label:area.name}])+'<div class="browse-section-head"><span class="browse-kicker">ESCOLHA UM ASSUNTO</span><h3>'+esc(area.name)+'</h3><p>'+listAreas.length+' aulas distribuídas em '+ids.length+' temas.</p></div><div class="browse-topic-grid">'+ids.map(function(t){var amount=listAreas.filter(function(l){return subjectTopic(l,area)===t.id}).length;return '<button class="browse-topic" type="button" data-catalog="topic" data-id="'+esc(t.id)+'"><span class="browse-topic-icon">'+esc(t.icon)+'</span><span class="browse-topic-copy"><strong>'+esc(t.title)+'</strong><small>'+esc(t.description)+'</small><span class="browse-topic-count">'+amount+' '+(amount===1?'aula':'aulas')+'</span></span><span class="browse-topic-next">↗</span></button>'}).join('')+'</div>'
   html+=topicPdfPanel('area',area.id,'Materiais gerais de '+area.name);
  }else if(state.view==='lessons'&&area){
   var topic=SUBJECT_TOPICS.find(function(t){return t.id===state.topic&&t.area===area.id});
   if(!topic){state.view='topics';return renderBrowse()}
   var group=areaLessons(area).filter(function(l){return subjectTopic(l,area)===topic.id});
   html=crumbs([{label:area.name,action:'area',id:area.id},{label:topic.title}])+'<div class="browse-section-head"><span class="browse-kicker">AGORA ESCOLHA A AULA</span><h3>'+esc(topic.title)+'</h3><p>'+esc(topic.description)+'</p></div>'+topicPdfPanel('assunto',topic.id,'Lista geral de '+topic.title)+list(group,'Aulas deste assunto',false)
  }else{
   state.view='areas';
   html='<div class="area-grid">'+SUBJECT_AREAS.map(tile).join('')+'</div>';
  }
  browser.innerHTML=html;
 }
 function saveBrowseUrl(replace){
  var u=new URL(location.href);
  ['area','assunto','favoritos','todas','q'].forEach(function(k){u.searchParams.delete(k)});
  if(state.view==='topics'||state.view==='lessons')u.searchParams.set('area',state.area);
  if(state.view==='lessons')u.searchParams.set('assunto',state.topic);
  if(state.view==='favorites')u.searchParams.set('favoritos','1');
  if(state.view==='all')u.searchParams.set('todas','1');
  history[replace?'replaceState':'pushState'](null,'',u.pathname+u.search+u.hash);
 }
 function goBrowse(view,area,topic,scroll){
 var u=new URL('/explorar/',location.origin);
 if(view==='topics'||view==='lessons')u.searchParams.set('area',area);
 if(view==='lessons')u.searchParams.set('assunto',topic);
 if(view==='favorites')u.searchParams.set('favoritos','1');
 if(view==='all')u.searchParams.set('todas','1');
 location.assign(u.pathname+u.search);
 }
 browser.addEventListener('click',function(e){
  var b=e.target.closest('button[data-catalog]');if(!b)return;
  var id=b.dataset.id,act=b.dataset.catalog;
  if(act==='area')goBrowse('topics',id,'',true);
  else if(act==='topic')goBrowse('lessons',state.area,id,true);
  else if(act==='areas')goBrowse('areas','','',true);
  else if(act==='favorites')goBrowse('favorites','','',true);
  else if(act==='all')goBrowse('all','','',true);
  else if(act==='more'){shown+=18;renderBrowse()}
 });

 function relevance(value,q){
  var s=norm(value),tokens=norm(q).trim().split(/\s+/).filter(Boolean);
  if(!tokens.length)return 0;
  return tokens.every(function(t){return s.includes(t)})?(s.includes(norm(q).trim())?100:25):0
 }
 function cleanSearch(q){return norm(q).replace(/\b(listas?|pdfs?|gabaritos?|materiais?|questoes?|exercicios?|de|do|da|das|dos|sobre|para)\b/g,' ').replace(/\s+/g,' ').trim()}
 function lessonScore(l,q){
  var actual=cleanSearch(q);
  if(!actual)return 0;
  var area=areaForLesson(l),topic=subTopic(l,area),
    titleScore=relevance(l.id+' '+l.title,actual),
    topicScore=relevance(topic.title+' '+area.name,actual),
    summaryScore=relevance(l.summary,actual);
  var score=titleScore?titleScore+40:topicScore?topicScore+15:summaryScore;
  if(actual===norm(l.id))score+=500;
  if(actual==='bhaskara'&&l.id==='A17')score+=450;
  if((actual==='pa'||actual==='p.a')&&l.id>='A33'&&l.id<='A35')score+=180;
  if((actual==='pg'||actual==='p.g')&&l.id>='A36'&&l.id<='A38')score+=180;
  return score;
 }
 function matchData(){
  var q=search.query.trim(),clean=cleanSearch(q);
  var l=lessons.map(function(l){return {lesson:l,score:lessonScore(l,q)}})
   .filter(function(x){return x.score>0})
   .sort(function(a,b){return b.score-a.score||a.lesson.id.localeCompare(b.lesson.id)});
  var m=featured.map(function(entry){
   var owner=entry.owner,labels=entry.item.arquivos.map(function(f){return f.titulo}).join(' ');
   var context=[owner.id,owner.title,owner.description,labels].join(' ');
   var score=owner.lesson?lessonScore(owner.lesson,q):0;
   score=Math.max(score,clean?relevance(context,clean):100);
   if(/\b(pdf|lista|gabarito|material)/.test(norm(q))&&score>0)score+=40;
   return {owner:owner,item:entry.item,score:score}
  }).filter(function(x){return x.score>0}).sort(function(a,b){return b.score-a.score});
  var a=clean?SUBJECT_AREAS.map(function(area){return {area:area,score:relevance(area.name+' '+area.description,clean)}}).filter(function(x){return x.score>0}):[];
  var t=clean?SUBJECT_TOPICS.map(function(topic){return {topic:topic,score:relevance(topic.title+' '+topic.description,clean)}}).filter(function(x){return x.score>0}):[];
  return {lessons:l,materials:m,areas:a,topics:t}
 }
 function matCard(x){
  return '<article class="search-material-card"><div class="search-material-head"><span class="browse-material-tag">'+(x.owner.kind==='aula'?'LISTA DA AULA':x.owner.kind==='assunto'?'LISTA DO ASSUNTO':'LISTA GERAL')+'</span><a href="'+x.owner.href+'">'+esc(x.owner.title)+' ↗</a></div>'+pdfLinks(x.item.arquivos)+'</article>'
 }
 function renderSearch(){
  var q=search.query.trim(),matched=matchData(),types=[['tudo','Tudo'],['aulas','Aulas'],['materiais','Listas e PDFs'],['assuntos','Assuntos']];
  document.getElementById('search-title').textContent='Resultados para “'+q+'”';
  scopeWrap.innerHTML=types.map(function(t){return '<button type="button" class="home-scope '+(search.scope===t[0]?'active':'')+'" data-scope="'+t[0]+'" aria-pressed="'+(search.scope===t[0])+'">'+t[1]+'</button>'}).join('');
  var html='';
  if(search.scope==='tudo'||search.scope==='materiais'){
   if(matched.materials.length)html+='<section class="search-group"><div class="search-group-head"><h3>📄 Materiais para baixar</h3><small>'+matched.materials.length+' '+(matched.materials.length===1?'aula':'aulas')+'</small></div><div class="search-material-grid">'+matched.materials.slice(0,search.shown).map(matCard).join('')+'</div></section>';
   else if(search.scope==='materiais')html+='<div class="browse-empty">Nenhum PDF publicado para essa busca. Veja as aulas relacionadas na opção “Tudo”.</div>';
  }
  if(search.scope==='tudo'||search.scope==='aulas'){
   if(matched.lessons.length){html+='<section class="search-group"><div class="search-group-head"><h3>✦ Aulas que combinam com sua busca</h3><small>'+matched.lessons.length+' resultado(s)</small></div><div class="browse-lesson-list">'+matched.lessons.slice(0,search.shown).map(function(x){return drawRow(x.lesson,true)}).join('')+'</div>'+(search.shown<matched.lessons.length?'<button type="button" class="browse-more" data-more-search>Ver mais aulas ↓</button>':'')+'</section>'}
   else if(search.scope==='aulas')html+='<div class="browse-empty">Nenhuma aula com esse nome. Tente outra palavra ou um código, como A17.</div>';
  }
  if(search.scope==='tudo'||search.scope==='assuntos'){
   var groups=matched.areas.map(function(x){return {name:x.area.name,desc:x.area.description,area:x.area.id,topic:'',score:x.score+15}}).concat(matched.topics.map(function(x){return {name:x.topic.title,desc:x.topic.description,area:x.topic.area,topic:x.topic.id,score:x.score}})).sort(function(a,b){return b.score-a.score});
   if(groups.length)html+='<section class="search-group"><div class="search-group-head"><h3>◉ Assuntos para explorar</h3></div><div class="search-topic-grid">'+groups.slice(0,search.shown).map(function(x){return '<button type="button" class="search-topic-link" data-search-area="'+esc(x.area)+'" data-search-topic="'+esc(x.topic)+'"><strong>'+esc(x.name)+'</strong><small>'+esc(x.desc)+'</small><span>↗</span></button>'}).join('')+'</div></section>';
   else if(search.scope==='assuntos')html+='<div class="browse-empty">Não encontrei essa área. Tente um nome mais amplo, como “Geometria”.</div>';
  }
  if(!html)html='<div class="search-no-match"><strong>Não encontramos essa expressão.</strong><p>Tente outro termo ou explore nossas áreas.</p><button type="button" id="search-reset">Explorar assuntos ↗</button></div>'+exatooCard('busca');
  resultOutput.innerHTML=html;
 }

 function renderQuick(){
  var q=search.query.trim();
  if(!q){quick.hidden=true;quick.innerHTML='';input.setAttribute('aria-expanded','false');return}
  var found=matchData(),rows=[];
  if(found.materials.length){
   var mat=found.materials[0],file=mat.item.arquivos[0];
   if(file)rows.push('<a class="home-quick-row" href="'+esc(file.url)+'" download><span class="home-quick-code home-quick-pdf">PDF</span><span><strong>'+esc(file.titulo)+'</strong><small>Material para baixar</small></span><b>↓</b></a>');
  }
  found.lessons.slice(0,4).forEach(function(entry){
   var l=entry.lesson;
   rows.push('<a class="home-quick-row" href="'+href(l)+'"><span class="home-quick-code">'+esc(l.id)+'</span><span><strong>'+esc(l.title)+'</strong><small>'+esc(subTopic(l,areaForLesson(l)).title)+'</small></span><b>↗</b></a>')
  });
  if(!rows.length){
   found.topics.slice(0,2).forEach(function(entry){
    rows.push('<button class="home-quick-row" type="button" data-quick-area="'+esc(entry.topic.area)+'" data-quick-topic="'+esc(entry.topic.id)+'"><span class="home-quick-code">✦</span><span><strong>'+esc(entry.topic.title)+'</strong><small>Explorar assunto</small></span><b>↗</b></button>')
   });
  }
  if(!rows.length){quick.hidden=true;input.setAttribute('aria-expanded','false');return}
  quick.innerHTML='<div class="home-quick-heading">ENCONTRAMOS ISSO PRA VOCÊ</div>'+rows.join('')+'<button type="button" class="home-quick-all" id="quick-all">Ver todos os resultados ↓</button>';
  quick.hidden=false;input.setAttribute('aria-expanded','true');
  document.getElementById('quick-all').addEventListener('click',function(){quick.hidden=true;input.setAttribute('aria-expanded','false');resultArea.scrollIntoView({behavior:'smooth',block:'start'})});
 }
 quick.addEventListener('click',function(e){
  var hit=e.target.closest('button[data-quick-area]');if(hit){goBrowse('lessons',hit.dataset.quickArea,hit.dataset.quickTopic,true)}
 });
 document.addEventListener('click',function(e){
  if(!e.target.closest('.home-search-section')&&!quick.hidden){quick.hidden=true;input.setAttribute('aria-expanded','false')}
 });
 function setQuery(q,fromHistory){
  search.query=q;search.scope='tudo';search.shown=12;input.value=q;
  clearBtn.hidden=!q.trim();
  var searching=!!q.trim();main.hidden=searching;resultArea.hidden=!searching;
  if(searching){renderSearch();renderQuick()}else renderQuick();
  if(!fromHistory){
   var u=new URL(location.href);
   ['area','assunto','favoritos','todas','q'].forEach(function(k){u.searchParams.delete(k)});
   if(searching)u.searchParams.set('q',q.trim());
   history.replaceState(null,'',u.pathname+u.search);
  }
 }
 scopeWrap.addEventListener('click',function(e){var el=e.target.closest('button[data-scope]');if(!el)return;search.scope=el.dataset.scope;search.shown=12;renderSearch()});
 resultOutput.addEventListener('click',function(e){
  if(e.target.closest('button[data-more-search]')){search.shown+=12;renderSearch();return}
  var btn=e.target.closest('button[data-search-area]');
  if(btn){goBrowse(btn.dataset.searchTopic?'lessons':'topics',btn.dataset.searchArea,btn.dataset.searchTopic,true);return}
  if(e.target.closest('#search-reset'))goBrowse('areas','','',true);
 });
 input.addEventListener('input',function(){setQuery(input.value,false)});
 document.getElementById('btn-search').addEventListener('click',function(){if(search.query.trim())resultArea.scrollIntoView({behavior:'smooth',block:'start'});else input.focus();quick.hidden=true;input.setAttribute('aria-expanded','false')});
 input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();if(search.query.trim()){resultArea.scrollIntoView({behavior:'smooth',block:'start'});quick.hidden=true;input.setAttribute('aria-expanded','false')}}if(e.key==='Escape'&&input.value)setQuery('',false)});
 clearBtn.addEventListener('click',function(){setQuery('',false);input.focus()});
 document.querySelectorAll('[data-example]').forEach(function(b){b.addEventListener('click',function(){setQuery(b.dataset.example,false);resultArea.scrollIntoView({behavior:'smooth',block:'start'})})});
 document.getElementById('return-home').addEventListener('click',function(){setQuery('',false);document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'})});
 document.querySelectorAll('.navlinks a[href^="/#"]').forEach(function(a){a.addEventListener('click',function(){if(search.query.trim())setQuery('',false)})});
 document.addEventListener('keydown',function(e){if((e.key==='/'||(e.key.toLowerCase()==='k'&&(e.ctrlKey||e.metaKey)))&&!e.altKey&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();input.focus()}});
 function loadUrl(){
  var p=new URLSearchParams(location.search),area=SUBJECT_AREAS.find(function(x){return x.id===p.get('area')});
  if(p.get('q')){setQuery(p.get('q'),true);if(location.hash==='#resultados')resultArea.scrollIntoView({block:'start'});return}
  setQuery('',true);
  if(p.has('favoritos'))state={view:'favorites',area:'',topic:''};
  else if(p.has('todas'))state={view:'all',area:'',topic:''};
  else if(area&&p.get('assunto')&&SUBJECT_TOPICS.some(function(t){return t.id===p.get('assunto')&&t.area===area.id}))state={view:'lessons',area:area.id,topic:p.get('assunto')};
  else if(area)state={view:'topics',area:area.id,topic:''};
  else state={view:'areas',area:'',topic:''};
  shown=18;renderBrowse();
  if(location.hash==='#explorar'&&document.getElementById('explorar'))document.getElementById('explorar').scrollIntoView({block:'start'});
 }
 window.addEventListener('popstate',loadUrl);
 renderBrowse();loadUrl();
}


function explorePage(){
 title('Explorar assuntos');
 var query=new URLSearchParams(location.search),area=SUBJECT_AREAS.find(function(a){return a.id===query.get('area')});
 var topic=area&&SUBJECT_TOPICS.find(function(t){return t.id===query.get('assunto')&&t.area===area.id});
 var favorites=query.has('favoritos'),all=query.has('todas'),limit=24;
 document.getElementById('app').innerHTML=header()+'<main class="shell explorer-page"><div class="explorer-back"><a href="/">← Início</a><span>MAT MAT MAT! / CATÁLOGO</span></div><div class="explorer-title"><div><span class="home-section-label">✳ BIBLIOTECA DE MATEMÁTICA</span><h1 id="explorer-heading">Explorar matemática</h1><p id="explorer-description">Escolha uma área para começar.</p></div></div><div id="explorer-content"></div></main>'+footer();
 function trail(items){return '<nav class="explorer-trail" aria-label="Caminho do assunto"><a href="/explorar/">Todas as áreas</a>'+items.map(function(it){return '<span>›</span>'+(it.url?'<a href="'+it.url+'">'+esc(it.name)+'</a>':'<strong aria-current="page">'+esc(it.name)+'</strong>')}).join('')+'</nav>'}
 function card(a){var n=data.lessons.filter(function(l){return subjectContains(a,l)}).length;return '<a class="area-tile" href="/explorar/?area='+a.id+'"><span class="area-tile-icon tone-'+a.tone+'">'+esc(a.icon)+'</span><span class="area-tile-name">'+esc(a.name)+'</span><span class="area-tile-subtitle">'+esc(a.description)+'</span><span class="area-tile-foot"><span>'+n+' aulas</span><span class="area-tile-go">↗</span></span></a>'}
 function lessonRow(l,full){var a=areaForLesson(l);return '<a class="browse-lesson-row" href="'+href(l)+'"><span class="browse-lesson-number">'+l.id+'</span><span class="browse-lesson-copy"><strong>'+esc(l.title)+'</strong><small>'+esc(l.summary||'Abra a aula.')+'</small>'+(full?'<span class="browse-lesson-meta">'+esc(a.name)+' · '+esc(topicInfo(subjectTopic(l,a)).title)+'</span>':'')+'</span><span class="browse-lesson-right">'+(done.has(l.id)?'<span class="browse-studied">✓ Estudada</span>':'<span class="browse-enter">↗</span>')+'</span></a>'}
 function list(items,label,full){return '<div class="browse-list-intro"><h3>'+esc(label)+'</h3><p>'+items.length+' aulas</p></div><div class="browse-lesson-list">'+(items.length?items.slice(0,limit).map(function(l){return lessonRow(l,full)}).join(''):'<div class="browse-empty">Você ainda não favoritou nenhuma aula.</div>')+'</div>'+(limit<items.length?'<button class="browse-more" id="show-more-explorer">Mostrar mais aulas ↓</button>':'')}
 function render(){
  var name='Escolha uma área',description='São 9 áreas e 38 assuntos. Vá direto ao que procura.',html='';
  if(favorites||all){
   name=favorites?'Suas favoritas':'Todas as aulas';description=favorites?'Seus conteúdos salvos.':'Todas as 144 aulas em um só lugar.';
   html=trail([{name:name}])+list(favorites?data.lessons.filter(function(l){return saved.has(l.id)}):data.lessons,name,true);
  }else if(topic){
   name=topic.title;description=topic.description;
   var ls=data.lessons.filter(function(l){return subjectTopic(l,areaForLesson(l))===topic.id});
   html=trail([{name:area.name,url:'/explorar/?area='+area.id},{name:topic.title}])+'<div class="explorer-step">ETAPA 3 DE 3 · ESCOLHA UMA AULA</div>'+topicPdfPanel('assunto',topic.id,'Listas gerais deste assunto')+list(ls,'Aulas de '+topic.title,false);
  }else if(area){
   name=area.name;description=area.description;
   var ts=SUBJECT_TOPICS.filter(function(t){return t.area===area.id});
   html=trail([{name:area.name}])+'<div class="explorer-step">ETAPA 2 DE 3 · ESCOLHA UM ASSUNTO</div>'+topicPdfPanel('area',area.id,'Listas gerais da área')+'<div class="browse-topic-grid">'+ts.map(function(t){
    var n=data.lessons.filter(function(l){return subjectTopic(l,areaForLesson(l))===t.id}).length;
    return '<a class="browse-topic" href="/explorar/?area='+area.id+'&assunto='+t.id+'"><span class="browse-topic-icon">'+esc(t.icon)+'</span><span class="browse-topic-copy"><strong>'+esc(t.title)+'</strong><small>'+esc(t.description)+'</small><span class="browse-topic-count">'+n+' aulas</span></span><span class="browse-topic-next">↗</span></a>'
   }).join('')+'</div>';
  }else{
   html='<div class="explorer-toolbar"><span>ETAPA 1 DE 3 · ESCOLHA UMA ÁREA</span><div><a href="/explorar/?favoritos=1">♡ Favoritas</a><a href="/explorar/?todas=1">Todas as 144 ↗</a></div></div><div class="area-grid">'+SUBJECT_AREAS.map(card).join('')+'</div>';
  }
  document.getElementById('explorer-heading').textContent=name;
  document.getElementById('explorer-description').textContent=description;
  document.getElementById('explorer-content').innerHTML=html;
  var more=document.getElementById('show-more-explorer');if(more)more.addEventListener('click',function(){limit+=24;render()});
 }
 render();
}


async function diagnosisPage(){
 title('Teste seu nível');
 var root=document.getElementById('app');
 root.innerHTML=header()+'<main class="shell diagnostic-page"><div class="explorer-back"><a href="/">← Página inicial</a><span>MAT MAT MAT! / AVALIAÇÃO DIAGNÓSTICA</span></div><div id="diagnostic-content" aria-live="polite"></div></main>'+footer();
 var body=document.getElementById('diagnostic-content'),bank;
 try{var response=await fetch('/data/diagnostico.json');if(!response.ok)throw Error('Diagnóstico indisponível');bank=await response.json();if(!Array.isArray(bank.tracks)||!bank.tracks.length)throw Error('Banco incompleto')}catch(e){body.innerHTML=empty('Não foi possível carregar o diagnóstico','Tente novamente em alguns instantes.');return}
 var track=null,questions=[],current=0,answers={},startedAt=0;
 var labels={1:'Base',2:'Aplicação',3:'Desafio'};
 function countPrevious(id){try{return JSON.parse(localStorage.getItem('matmatmat-diag-'+id)||'null')}catch(e){return null}}
 function formatDate(iso){try{return new Date(iso).toLocaleDateString('pt-BR')}catch(e){return ''}}
 function choose(){
  var groups=[{id:'Ensino Médio',title:'Ensino Médio',desc:'Escolha a série que está estudando.'},{id:'Pré-vestibular',title:'Pré-vestibular',desc:'Escolha o perfil de prova que deseja praticar.'}];
  track=null;
  body.innerHTML='<section class="diag-intro"><div class="diag-kicker">✳ AVALIAÇÃO DE ENTRADA · MAT MAT MAT!</div><h1>Onde você está na <em>matemática?</em></h1><p>Um diagnóstico direcionado ao que você estuda. Escolha seu percurso, resolva problemas em três níveis de complexidade e descubra o que vale revisar.</p><div class="diag-stats"><span>12 questões por percurso</span><span>4 assuntos avaliados</span><span>Correção explicada</span></div></section><div class="diag-catalog">'+groups.map(function(g){return '<section class="diag-track-group"><div class="diag-group-head"><h2>'+g.title+'</h2><p>'+g.desc+'</p></div><div class="diag-track-grid">'+bank.tracks.filter(function(t){return t.group===g.id}).map(function(t){var previous=countPrevious(t.id);return '<button type="button" class="diag-track-card" data-track="'+esc(t.id)+'"><span class="diag-track-symbol tone-'+esc(t.color)+'">'+esc(t.icon)+'</span><span class="diag-track-info"><strong>'+esc(t.title)+'</strong><span>'+esc(t.subtitle)+'</span>'+(previous?'<small>Última tentativa: '+previous.correct+'/12 · '+formatDate(previous.date)+'</small>':'<small>12 questões · '+esc(t.minutes)+'</small>')+'</span><span class="diag-track-arrow" aria-hidden="true">↗</span></button>'}).join('')+'</div></section>'}).join('')+'</div><p class="diag-privacy">Questões autorais. Resultado indicativo, não equivale a prova oficial nem a uma medição padronizada de proficiência. Sem cadastro; só o resumo da última tentativa fica armazenado neste navegador.</p>';
  body.querySelectorAll('[data-track]').forEach(function(btn){btn.addEventListener('click',function(){track=bank.tracks.find(function(t){return t.id===btn.dataset.track});intro()})});
 }
 function intro(){
  if(!track)return choose();
  body.innerHTML='<section class="diag-selected"><div class="diag-selected-head"><span class="diag-kicker">'+esc(track.group)+' / '+esc(track.title)+'</span><h1>Seu ponto de partida.</h1><p>'+esc(track.detail)+'</p></div><div class="diag-assessment-layout"><div><h2>O que será avaliado?</h2><div class="diag-skill-list">'+track.areas.map(function(a,j){return '<div><span>'+String(j+1).padStart(2,'0')+'</span><strong>'+esc(a.label)+'</strong><small>3 questões</small></div>'}).join('')+'</div></div><aside class="diag-assessment-meta"><strong>Como funciona</strong><p>12 questões de múltipla escolha. Em cada assunto, uma de base, uma de aplicação e uma de maior complexidade.</p><p>Você pode voltar e mudar suas respostas. A correção completa aparece no final, sem cronômetro.</p><div class="diag-meta-row"><span>Tempo sugerido</span><b>'+esc(track.minutes)+'</b></div></aside></div><div class="diag-actions"><button type="button" class="diagnosis-prev" id="diag-back-tracks">← Escolher outro percurso</button><button type="button" class="diagnosis-button" id="diag-begin">Iniciar avaliação ↗</button></div></section>';
  document.getElementById('diag-back-tracks').addEventListener('click',choose);
  document.getElementById('diag-begin').addEventListener('click',begin);
 }
 function begin(){
  answers={};current=0;startedAt=Date.now();
  // Intercalar assuntos de cada nível cria progressão Base → Aplicação → Desafio.
  // A ordem dentro de cada nível muda a cada nova tentativa.
  questions=[1,2,3].flatMap(function(level){var tier=track.questions.filter(function(q){return q.dificuldade===level});for(var i=tier.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var temp=tier[i];tier[i]=tier[j];tier[j]=temp}return tier});
  draw();
 }
 function draw(){
  if(current>=questions.length){results();return}
  var q=questions[current],chosen=answers[q.id],step=Math.floor(current/4)+1,topic=track.areas.find(function(a){return a.id===q.area});
  body.innerHTML='<section class="diag-test"><div class="diag-test-top"><button type="button" id="diag-quit">← Percursos</button><span>'+esc(track.title)+' · '+esc(labels[q.dificuldade])+'</span></div><div class="diagnosis-progress-top"><span>QUESTÃO '+(current+1)+' / '+questions.length+'</span><span>'+Math.round(current/questions.length*100)+'% concluído</span></div><div class="diagnosis-progress"><span style="width:'+(current/questions.length*100)+'%"></span></div><div class="diag-tier"><span class="diag-tier-step">ETAPA '+step+' DE 3</span><span>'+esc(topic.label)+' · '+esc(labels[q.dificuldade])+'</span></div><div class="diagnosis-question"><h1>'+esc(q.enunciado)+'</h1><fieldset class="diag-choice-fieldset"><legend>Escolha uma alternativa</legend><div class="diagnosis-answers">'+q.opcoes.map(function(opt,j){return '<button type="button" data-diagnosis-answer="'+j+'" class="diagnosis-option '+(chosen===j?'selected':'')+'" aria-pressed="'+(chosen===j)+'"><b>'+String.fromCharCode(65+j)+'</b><span>'+esc(opt)+'</span><span class="diagnosis-radio">'+(chosen===j?'✓':'')+'</span></button>'}).join('')+'</div></fieldset></div><div class="diagnosis-controls"><button type="button" class="diagnosis-prev" id="diagnosis-prev">'+(current?'← Anterior':'← Voltar')+'</button><button type="button" class="diagnosis-button" id="diagnosis-next" '+(chosen===undefined?'disabled':'')+'>'+(current===questions.length-1?'Concluir avaliação ↗':'Próxima →')+'</button></div><p class="diag-test-note">A correção aparece após concluir o percurso. Sem pontuação negativa e sem limite de tempo.</p></section>';
  body.querySelectorAll('[data-diagnosis-answer]').forEach(function(b){b.addEventListener('click',function(){answers[q.id]=Number(b.dataset.diagnosisAnswer);draw()})});
  document.getElementById('diagnosis-prev').addEventListener('click',function(){if(!current)intro();else{current--;draw()}});
  document.getElementById('diagnosis-next').addEventListener('click',function(){if(answers[q.id]===undefined)return;current++;draw()});
  document.getElementById('diag-quit').addEventListener('click',choose);
 }
 function results(){
  var correct=questions.filter(function(q){return answers[q.id]===q.correta}).length;
  var report=track.areas.map(function(area){var items=questions.filter(function(q){return q.area===area.id}),score=items.filter(function(q){return answers[q.id]===q.correta}).length;return {area:area,score:score,items:items}}).sort(function(a,b){return a.score-b.score});
  var attention=report.filter(function(r){return r.score<3});
  var elapsed=startedAt?Math.max(1,Math.round((Date.now()-startedAt)/60000)):null;
  var bands=[{name:'Base',level:1},{name:'Aplicação',level:2},{name:'Desafio',level:3}].map(function(b){var qs=questions.filter(function(q){return q.dificuldade===b.level});return {name:b.name,correct:qs.filter(function(q){return answers[q.id]===q.correta}).length,total:qs.length}});
  try{localStorage.setItem('matmatmat-diag-'+track.id,JSON.stringify({correct:correct,date:new Date().toISOString()}))}catch(e){}
  var highest=correct>=10?'Um repertório consistente neste percurso.':correct>=7?'Boa parte da base está presente.':correct>=4?'Há fundamentos para consolidar.':'Vale começar pelos pré-requisitos.';
  var priorities=attention.slice(0,3);
  body.innerHTML='<section class="diag-results"><div class="diag-result-head"><span class="diag-kicker">✳ RELATÓRIO DE ESTUDO · '+esc(track.title)+'</span><h1>'+highest+'</h1><p>Este retrato considera apenas as 12 questões que você respondeu. Use-o como ponto de partida para estudar, não como nota escolar ou previsão de aprovação.</p></div><div class="diag-score-strip"><div class="diag-score-main"><strong>'+correct+'<small>/12</small></strong><span>acertos</span></div><div><span>Seu percurso</span><strong>'+esc(track.title)+'</strong></div><div><span>Tempo de resolução</span><strong>'+(elapsed!==null?elapsed+' min':'Livre')+'</strong></div></div><div class="diag-report-heading"><h2>Desempenho por assunto</h2><p>São três perguntas por assunto — o resultado indica pontos de atenção, não domínio definitivo.</p></div><div class="diagnosis-domain-list">'+report.map(function(r){return '<div class="diagnosis-domain"><div><strong>'+esc(r.area.label)+'</strong><span>'+r.score+' de 3</span></div><div class="diagnosis-domain-track"><span style="width:'+(r.score/3*100)+'%"></span></div></div>'}).join('')+'</div><h2 class="diag-secondary-title">Por complexidade</h2><div class="diag-complexity">'+bands.map(function(b){return '<div><span>'+esc(b.name)+'</span><strong>'+b.correct+' / '+b.total+'</strong></div>'}).join('')+'</div><h2 class="diag-secondary-title">O que revisar agora?</h2><div class="diagnosis-recs">'+(priorities.length?priorities.map(function(r){var wrong=r.items.filter(function(q){return answers[q.id]!==q.correta}).sort(function(a,b){return a.dificuldade-b.dificuldade});var lesson=wrong.length?data.lessons.find(function(l){return l.id===wrong[0].aula}):null;return lesson?'<a href="'+href(lesson)+'"><span>PRIORIDADE DE REVISÃO</span><strong>'+esc(r.area.label)+'</strong><small>'+esc(lesson.title)+'</small><b>Revisar este conteúdo ↗</b></a>':''}).join(''):'<div class="diagnosis-perfect">Você acertou as perguntas desta avaliação. Explore novos assuntos ou experimente outro percurso para ampliar o desafio.</div>')+'</div><div class="diag-review"><details><summary>Correção comentada das 12 questões <span>↗</span></summary>'+questions.map(function(q,i){var yes=answers[q.id]===q.correta;return '<article class="diag-review-item"><span class="'+(yes?'review-right':'review-wrong')+'">'+(yes?'✓ ACERTO':'✕ REVISAR')+' · '+esc(labels[q.dificuldade])+'</span><strong>'+(i+1)+'. '+esc(q.enunciado)+'</strong><p>Sua resposta: '+esc(q.opcoes[answers[q.id]])+'</p><p><b>Resposta correta:</b> '+esc(q.opcoes[q.correta])+'</p><p>'+esc(q.explicacao)+'</p><a href="/aulas/'+esc(q.aula)+'/">Revisar aula '+esc(q.aula)+' ↗</a></article>'}).join('')+'</details></div><div class="diag-actions"><button type="button" class="diagnosis-prev" id="diag-retry">↻ Refazer este percurso</button><button type="button" class="diagnosis-button" id="diag-change">Escolher outro teste ↗</button></div><div class="diag-result-exatoo">'+exatooCard('revisar')+'</div></section>';
  document.getElementById('diag-retry').addEventListener('click',intro);
  document.getElementById('diag-change').addEventListener('click',choose);
 }
 choose();
}

function saveAction(l,btn){
 if(saved.has(l.id))saved.delete(l.id);else saved.add(l.id);
 var active=saved.has(l.id);store('capri-favoritos',saved);
 var label=btn.querySelector('.lesson-tool-label');
 if(label)label.textContent=active?'Favorita':'Favoritar';else btn.textContent=active?'♥ Salvo':'♡ Favoritar';
 btn.classList.toggle('is-active',active);btn.classList.toggle('liked',active);
 btn.setAttribute('aria-pressed',String(active));
 btn.setAttribute('aria-label',active?'Remover aula dos favoritos':'Favoritar esta aula');
}
function finishAction(l,btn){
 if(done.has(l.id))done.delete(l.id);else done.add(l.id);
 var active=done.has(l.id);store('capri-estudadas',done);
 var label=btn.querySelector('.lesson-tool-label');
 if(label)label.textContent=active?'Estudada':'Já estudei';else btn.textContent=active?'✓ Aula estudada':'✓ Marcar como estudada';
 btn.classList.toggle('is-active',active);btn.classList.toggle('liked',active);
 btn.setAttribute('aria-pressed',String(active));
 btn.setAttribute('aria-label',active?'Desmarcar aula como estudada':'Marcar aula como estudada');
}
/* ================= Página da aula (v2): entenda → pratique → modo prova → leve pra casa ================= */
var AULA_SVG={
 done:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="m8 12 2.5 2.5L16 9"></path></svg>',
 fav:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z"></path></svg>',
 share:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2"></circle><circle cx="6" cy="12" r="2"></circle><circle cx="18" cy="19" r="2"></circle><path d="m8 11 8-5m-8 7 8 5"></path></svg>',
 down:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"></path></svg>',
 play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"></path></svg>'
};
function tex(el,tries){
 var M=window.MathJax;if(!el)return Promise.resolve();
 if(M&&typeof M.typesetPromise==='function'){return M.typesetPromise([el]).catch(function(){})}
 tries=(tries||0)+1;if(tries>40)return Promise.resolve();
 return new Promise(function(res){setTimeout(function(){tex(el,tries).then(res)},250)});
}
async function fetchJson(path){try{var r=await fetch(path);return r&&r.ok?await r.json():null}catch(e){return null}}
function aulaStore(id){
 var key='matmat-aula-'+id,st={};
 try{st=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){st={}}
 st.fix=st.fix||{};st.prova=st.prova||{};
 return{st:st,save:function(){try{localStorage.setItem(key,JSON.stringify(st))}catch(e){}}};
}
function heroFormula(content){
 if(content&&content.formulaChave)return content.formulaChave;
 var fs=[];(content&&content.teoria||[]).forEach(function(s){(s.formulas||[]).forEach(function(f){fs.push(f)})});
 if(!fs.length)return null;
 function score(f){var s=0;if(/=/.test(f))s+=2;if(/\\d?frac/.test(f))s+=2;if(/\\text/.test(f))s-=4;if(/\\Rightarrow/.test(f))s-=2;if(f.length>60)s-=2;if(f.length<6)s-=3;return s}
 var best=fs[0];fs.forEach(function(f){if(score(f)>score(best))best=f});return best;
}
function fitFormula(box){
 // Reduz a fórmula do destaque até caber no adesivo, sem rolagem lateral.
 if(!box)return;var inner=box.querySelector('mjx-container')||box.firstElementChild;if(!inner)return;
 var size=parseFloat(getComputedStyle(box).fontSize)||32,guard=0;
 while(inner.scrollWidth>box.clientWidth+1&&size>13&&guard<40){size-=1.5;box.style.fontSize=size+'px';guard++}
}
function plural(n,um,varios){return n+' '+(n===1?um:varios)}

async function lessonPage(){
 var id=document.body.dataset.lesson;var l=data.lessons.find(function(x){return x.id===id});
 if(!l){document.getElementById('app').innerHTML=header()+'<main class="shell">'+empty('Aula não encontrada','Volte ao catálogo e tente novamente.')+'</main>'+footer();return}
 var subjectArea=areaForLesson(l),topicId=subjectTopic(l,subjectArea),topic=topicInfo(topicId);
 var near=data.lessons.filter(function(x){return subjectTopic(x,areaForLesson(x))===topicId});
 var nearIndex=near.findIndex(function(x){return x.id===id});
 var gi=data.lessons.findIndex(function(x){return x.id===id}),prev=data.lessons[gi-1],next=data.lessons[gi+1];
 title(l.title);
 var temLista=materialsAt('aula',id).some(function(x){return (x.item.arquivos||[]).some(function(f){return /\/(fixacao|vestibular)-[ABC]\d\d\.pdf$/.test(f.url||'')})});
 var loaded=await Promise.all([fetchJson('/conteudos/'+id+'.json'),temLista?fetchJson('/data/listas/'+id+'.json'):Promise.resolve(null)]);
 var content=loaded[0],lista=loaded[1];
 var store=aulaStore(id),st=store.st;
 var teoria=content&&Array.isArray(content.teoria)?content.teoria:[];
 var quiz=content&&Array.isArray(content.quiz)?content.quiz:[];
 var extras=content&&Array.isArray(content.exercicios)?content.exercicios:[];
 var videos=content&&Array.isArray(content.videos)?content.videos:[];
 var fixSecoes=lista&&lista.fixacao&&lista.fixacao.secoes||[];
 var fixQs=[];fixSecoes.forEach(function(s){s.questoes.forEach(function(q){fixQs.push(Object.assign({nivel:s.nome},q))})});
 if(!fixQs.length&&extras.length){fixSecoes=[{nome:'Exercícios',questoes:extras.map(function(x,k){return{n:k+1,enunciado:String(x.enunciado||''),itens:[],resolucao:[],resposta:String(x.resposta||'')}})}];fixSecoes[0].questoes.forEach(function(q){fixQs.push(Object.assign({nivel:'Exercícios'},q))})}
 var vestQs=lista&&lista.vestibular&&lista.vestibular.questoes||[];
 var listaPdfs=lista&&lista.pdfs||{};
 var listaUrls=Object.keys(listaPdfs).map(function(k){return listaPdfs[k].url});
 var allFiles=lessonPdfFiles();
 var otherFiles=allFiles.filter(function(f){return listaUrls.indexOf(f.url)<0});
 var steps=[{id:'entenda',nome:'Entenda'}];
 if(fixQs.length)steps.push({id:'pratique',nome:'Pratique'});
 if(vestQs.length)steps.push({id:'prova',nome:'Modo prova'});
 steps.push({id:'levar',nome:'Leve pra casa'});
 function stepNum(sid){return steps.findIndex(function(s){return s.id===sid})+1}

 function lessonPdfFiles(){
  var linked=materialsAt('aula',id).concat(materialsAt('assunto',topicId),materialsAt('area',subjectArea.id));
  var files=linked.flatMap(function(x){return x.item.arquivos||[]}).concat(content&&content.arquivos||[]);
  var seen=new Set();return files.filter(function(f){if(!f.url||seen.has(f.url))return false;seen.add(f.url);return true});
 }

 /* ---------- HTML ---------- */
 var formula=heroFormula(content);
 var heroArt=formula
  ?'<figure class="aula-formula"><div class="aula-formula-card"><div class="aula-formula-math" id="aula-formula-math">\\['+esc(formula)+'\\]</div></div><figcaption>A fórmula da aula</figcaption></figure>'
  :'<figure class="aula-formula aula-formula-symbol"><div class="aula-formula-card"><div class="aula-formula-math">'+esc(SUBJECT_TOPIC_ICONS[l.block]||'∑')+'</div></div><figcaption>'+esc(topic.title)+'</figcaption></figure>';
 var tools='<div class="actions lesson-tools" role="group" aria-label="Ações desta aula">'
  +'<button type="button" class="lesson-tool lesson-tool-done '+(done.has(id)?'is-active':'')+'" id="btn-done" aria-pressed="'+done.has(id)+'" aria-label="'+(done.has(id)?'Desmarcar aula como estudada':'Marcar aula como estudada')+'">'+AULA_SVG.done+'<span class="lesson-tool-label">'+(done.has(id)?'Estudada':'Já estudei')+'</span></button>'
  +'<button type="button" class="lesson-tool lesson-tool-fav '+(saved.has(id)?'is-active':'')+'" id="btn-fav" aria-pressed="'+saved.has(id)+'" aria-label="'+(saved.has(id)?'Remover aula dos favoritos':'Favoritar esta aula')+'">'+AULA_SVG.fav+'<span class="lesson-tool-label">'+(saved.has(id)?'Favorita':'Favoritar')+'</span></button>'
  +'<button type="button" class="lesson-tool lesson-tool-share" id="btn-share" aria-label="Compartilhe essa aula" aria-controls="lesson-share-options" aria-expanded="false">'+AULA_SVG.share+'<span class="lesson-tool-label">Compartilhar</span></button></div>'
  +'<div class="lesson-share-options" id="lesson-share-options" hidden><div class="lesson-share-options-head"><strong>Compartilhe com alguém</strong><button type="button" id="share-close" aria-label="Fechar opções de compartilhamento">×</button></div><p>Envie esta aula para sua turma ou para um amigo.</p><div class="lesson-share-links"><a id="share-whatsapp" href="#" target="_blank" rel="noopener noreferrer">Enviar pelo WhatsApp</a><button id="share-copy" type="button">Copiar mensagem e link</button></div><p class="lesson-share-status" id="share-status" aria-live="polite"></p><textarea id="share-manual" class="share-manual" readonly hidden aria-label="Mensagem para copiar manualmente"></textarea></div>';
 var trail=near.length>1?'<ol class="aula-trail" aria-label="Aulas de '+esc(topic.title)+'">'+near.map(function(x){var cur=x.id===id;return '<li class="'+(cur?'is-current ':'')+(done.has(x.id)?'is-done':'')+'"><a href="'+href(x)+'"'+(cur?' aria-current="page"':'')+'><span class="aula-trail-dot" aria-hidden="true"></span><span class="aula-trail-id">'+x.id+'</span><span class="aula-trail-name">'+esc(x.title)+'</span></a></li>'}).join('')+'</ol>':'';
 var hasPdfs=listaUrls.length||allFiles.length;
 var hero='<section class="aula-hero" aria-labelledby="aula-titulo"><div class="shell aula-hero-in">'
  +'<nav class="aula-crumbs" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/explorar/?area='+subjectArea.id+'">'+esc(subjectArea.name)+'</a><span aria-hidden="true">/</span><a href="/explorar/?area='+subjectArea.id+'&assunto='+topicId+'">'+esc(topic.title)+'</a></nav>'
  +'<div class="aula-hero-grid"><div class="aula-hero-copy">'
  +'<p class="aula-kicker"><span class="aula-id">'+id+'</span>'+(near.length>1?'Aula '+(nearIndex+1)+' de '+near.length+' em '+esc(topic.title):esc(topic.title))+'</p>'
  +'<h1 id="aula-titulo">'+esc(l.title)+'</h1>'
  +'<p class="aula-summary">'+esc(l.summary||'Teoria, exemplos e treino desta aula.')+'</p>'
  +'<div class="aula-hero-cta"><a class="aula-btn aula-btn-lime" href="#entenda" data-goto="entenda">Começar a aula</a>'+(hasPdfs?'<a class="aula-btn aula-btn-ghost" href="#levar" data-goto="levar">'+AULA_SVG.down+'Baixar as listas</a>':'')+'</div>'
  +tools+'</div>'+heroArt+'</div>'+trail+'</div></section>';

 var rail='<nav class="aula-rail" aria-label="Roteiro da aula"><p class="aula-rail-title">Seu roteiro</p><ol>'+steps.map(function(s,k){return '<li><a href="#'+s.id+'" data-goto="'+s.id+'" data-rail="'+s.id+'"><span class="aula-rail-n">'+(k+1)+'</span><span class="aula-rail-txt"><b>'+s.nome+'</b><small id="rail-'+s.id+'"></small></span></a></li>'}).join('')+'</ol><div class="aula-rail-meter" aria-hidden="true"><span id="rail-meter"></span></div><p class="aula-rail-sum" id="rail-sum"></p></nav>';

 function head(sid,titulo,desc){return '<header class="aula-step-head"><span class="aula-step-n" aria-hidden="true">'+stepNum(sid)+'</span><div><h2 id="h-'+sid+'">'+titulo+'</h2><p>'+desc+'</p></div></header>'}

 function teoriaHtml(){
  if(!teoria.length)return empty('A explicação vem aí','A teoria desta aula ainda não foi publicada. Enquanto isso, use as listas e o quiz.');
  return teoria.map(function(s,j){
   var h='<article class="aula-teoria"><h3>'+esc(s.titulo||'Conceito')+'</h3>';
   (s.paragrafos||[]).forEach(function(p){h+='<p>'+esc(p)+'</p>'});
   (s.formulas||[]).forEach(function(f){h+='<div class="aula-formula-bloco">\\['+esc(f)+'\\]</div>'});
   if(s.exemplo){var ps=s.exemplo.passos||[];h+='<div class="aula-exemplo"><p class="aula-exemplo-tag">Exemplo resolvido</p><p class="aula-exemplo-q">'+esc(s.exemplo.enunciado)+'</p>'+(ps.length?'<ol class="aula-passos">'+ps.map(function(p){return '<li hidden><span>'+esc(p)+'</span></li>'}).join('')+'</ol><button type="button" class="aula-btn aula-btn-soft aula-passo-btn" data-total="'+ps.length+'">Mostrar o 1º passo de '+ps.length+'</button>':'')+'</div>'}
   if(s.dica)h+='<p class="aula-callout aula-macete"><b>Macete</b>'+esc(s.dica)+'</p>';
   if(s.erroComum)h+='<p class="aula-callout aula-armadilha"><b>Armadilha de prova</b>'+esc(s.erroComum)+'</p>';
   return h+'</article>';
  }).join('');
 }
 function optsClass(opts){return opts.every(function(o){return String(o).length<=34&&String(o).indexOf('\\[')<0})?' aula-opts-2':''}
 function checkHtml(){
  if(!quiz.length)return '';
  return '<div class="aula-check" id="check-root"><div class="aula-check-top"><div><h3>Checagem rápida</h3><p class="aula-check-sub">'+plural(quiz.length,'pergunta','perguntas')+' para ver se a ideia ficou.</p></div><span class="aula-check-count" id="check-count" aria-live="polite">1 de '+quiz.length+'</span></div>'
   +'<div class="aula-dots aula-check-dots" aria-hidden="true">'+quiz.map(function(q,k){return '<span class="aula-dot'+(k?'':' is-now')+'"></span>'}).join('')+'</div>'
   +quiz.map(function(q,k){return '<div class="aula-mcq" data-check="'+k+'"'+(k?' hidden':'')+'><p class="aula-mcq-q"><span class="aula-mcq-n">'+(k+1)+'</span><span>'+esc(q.enunciado)+'</span></p><div class="aula-opts'+optsClass(q.opcoes)+'">'+q.opcoes.map(function(o,j){return '<button type="button" class="aula-opt" data-opt="'+j+'"><span class="aula-opt-l">'+String.fromCharCode(65+j)+'</span><span class="aula-opt-t">'+esc(o)+'</span></button>'}).join('')+'</div><div class="aula-fb" aria-live="polite"></div></div>'}).join('')
   +'<div class="aula-check-end" id="check-end" hidden></div></div>';
 }
 var okLabel=fixQs.length?'Entendi, bora praticar':vestQs.length?'Entendi, bora para a prova':'Entendi a teoria';
 var secEntenda='<section class="aula-step" id="entenda" data-step="entenda" aria-labelledby="h-entenda">'+head('entenda','Entenda','A ideia central, as fórmulas e exemplos resolvidos passo a passo.')+teoriaHtml()+checkHtml()
  +'<div class="aula-step-end"><button type="button" class="aula-btn aula-btn-ink" id="entenda-ok" aria-pressed="'+(!!st.entenda)+'">'+(st.entenda?'Teoria concluída':okLabel)+'</button></div></section>';

 var secPratique=fixQs.length?'<section class="aula-step" id="pratique" data-step="pratique" aria-labelledby="h-pratique">'+head('pratique','Pratique',(lista&&lista.fixacao?plural(fixQs.length,'exercício','exercícios')+' em '+plural(fixSecoes.length,'nível','níveis')+'. Resolva no caderno e depois confira a resolução.':'Exercícios curtos para fixar a ideia.'))
  +'<div class="aula-prat-top"><div class="aula-levels" role="tablist" aria-label="Níveis">'+fixSecoes.map(function(s,k){return '<button type="button" role="tab" class="aula-level" data-level="'+k+'" aria-selected="false"><b>'+esc(s.nome)+'</b><small data-level-count="'+k+'"></small></button>'}).join('')+'</div>'
  +'<div class="aula-prat-meter"><span class="aula-meter" aria-hidden="true"><span id="prat-meter"></span></span><span id="prat-sum"></span></div></div><div class="aula-ex-list" id="ex-list" role="tabpanel"></div></section>':'';

 var secProva=vestQs.length?'<section class="aula-step" id="prova" data-step="prova" aria-labelledby="h-prova">'+head('prova','Modo prova',plural(vestQs.length,'questão','questões')+' no estilo vestibular, corrigidas na hora.')+'<div class="aula-prova" id="prova-root" tabindex="-1"></div></section>':'';

 function pdfCard(tipo){
  var p=listaPdfs[tipo];if(!p)return '';
  var nome=tipo==='fixacao'?'Lista de fixação':'Lista de vestibular';
  var desc=tipo==='fixacao'?'Do aquecimento ao desafio':'Questões de múltipla escolha';
  var nq=tipo==='fixacao'?fixQs.length:vestQs.length;
  return '<a class="aula-pdf" href="'+esc(p.url)+'" target="_blank" rel="noopener" data-pdf="'+tipo+'"><span class="aula-pdf-capa"><img src="'+esc(p.capa)+'" alt="" loading="lazy" width="520" height="736"></span><span class="aula-pdf-info"><b>'+nome+'</b><span>'+desc+'. '+plural(nq,'questão','questões')+' com gabarito resolvido'+(p.paginas?', '+plural(p.paginas,'página','páginas'):'')+'.</span><span class="aula-btn aula-btn-ink aula-pdf-btn">'+AULA_SVG.down+'Baixar PDF</span></span></a>';
 }
 var pdfGrid=listaUrls.length?'<div class="aula-pdfs">'+pdfCard('fixacao')+pdfCard('vestibular')+'</div>':'';
 var otherHtml=otherFiles.length?'<div class="aula-files"><h3>'+(listaUrls.length?'Outros materiais':'Materiais para baixar')+'</h3>'+otherFiles.map(function(f){return '<a class="aula-file" href="'+esc(f.url)+'" target="_blank" rel="noopener" data-pdf="outro">'+AULA_SVG.down+'<span>'+esc(f.titulo||'Material')+'</span></a>'}).join('')+'</div>':'';
 var videosHtml='<div class="aula-videos"><h3>Para ver em vídeo</h3>'+videos.map(function(v){var u=safeUrl(v.url);return u?'<a class="aula-video" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer"><span class="aula-video-play">'+AULA_SVG.play+'</span><span><b>'+esc(v.titulo)+'</b><small>'+esc(v.canal||'')+'</small></span></a>':''}).join('')+'<a class="aula-video aula-video-search" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/results?search_query='+encodeURIComponent(l.title+' matemática videoaula')+'"><span class="aula-video-play">'+AULA_SVG.play+'</span><span><b>Procurar videoaulas sobre '+esc(l.title)+'</b><small>Busca no YouTube</small></span></a></div>';
 var secLevar='<section class="aula-step" id="levar" data-step="levar" aria-labelledby="h-levar">'+head('levar','Leve pra casa',listaUrls.length?'As listas em PDF para imprimir, com gabarito resolvido no final.':'Materiais para estudar fora da tela.')
  +(pdfGrid||otherHtml?pdfGrid+otherHtml:empty('Listas a caminho','As listas em PDF desta aula ainda vão ser publicadas.')+exatooCard('treino',l))+videosHtml+'</section>';

 var seq='<nav class="aula-seq" aria-label="Outras aulas">'+(prev?'<a class="aula-seq-prev" href="'+href(prev)+'"><small>Aula anterior</small><b>'+esc(prev.title)+'</b></a>':'<span></span>')+(next?'<a class="aula-seq-next" href="'+href(next)+'"><small>Próxima aula, '+next.id+'</small><b>'+esc(next.title)+'</b></a>':'')+'</nav>';

 var app=document.getElementById('app');
 app.innerHTML=header()+'<main class="aula" id="conteudo">'+hero+'<div class="shell aula-body">'+rail+'<div class="aula-main">'+secEntenda+secPratique+secProva+secLevar+seq+'</div></div></main>'+footer();

 /* ---------- Progresso ---------- */
 function fixDone(){return fixQs.filter(function(q){return st.fix[q.n]==='ok'||st.fix[q.n]==='erro'}).length}
 function fixOk(){return fixQs.filter(function(q){return st.fix[q.n]==='ok'}).length}
 function stepIsDone(sid){
  if(sid==='entenda')return !!st.entenda;
  if(sid==='pratique')return fixQs.length>0&&fixDone()===fixQs.length;
  if(sid==='prova')return st.prova.best!=null;
  if(sid==='levar')return !!st.pdf;
 }
 function updateProgress(){
  var txt={entenda:st.entenda?'Concluída':'Teoria e exemplos',pratique:fixDone()+' de '+fixQs.length+' conferidos',prova:st.prova.best!=null?'Melhor nota: '+st.prova.best+' de '+vestQs.length:plural(vestQs.length,'questão','questões'),levar:listaUrls.length?plural(listaUrls.length,'PDF','PDFs')+' e vídeos':'Materiais e vídeos'};
  var n=0;steps.forEach(function(s){var el=document.getElementById('rail-'+s.id);if(el)el.textContent=txt[s.id];var a=document.querySelector('[data-rail="'+s.id+'"]');var ok=stepIsDone(s.id);if(a)a.classList.toggle('is-done',ok);if(ok)n++});
  var m=document.getElementById('rail-meter');if(m)m.style.width=(n*100/steps.length)+'%';
  var sum=document.getElementById('rail-sum');if(sum)sum.textContent=n===steps.length?'Aula completa!':n+' de '+steps.length+' etapas';
  var pm=document.getElementById('prat-meter');if(pm)pm.style.width=(fixDone()*100/fixQs.length)+'%';
  var ps=document.getElementById('prat-sum');if(ps)ps.textContent=fixDone()+' de '+fixQs.length+' conferidos'+(fixDone()?', '+plural(fixOk(),'certo','certos'):'');
  fixSecoes.forEach(function(s,k){var c=document.querySelector('[data-level-count="'+k+'"]');if(c){var d=s.questoes.filter(function(q){return st.fix[q.n]==='ok'||st.fix[q.n]==='erro'}).length;c.textContent=d?d+'/'+s.questoes.length:plural(s.questoes.length,'questão','questões')}});
 }

 /* ---------- Entenda ---------- */
 document.querySelectorAll('.aula-passo-btn').forEach(function(btn){btn.addEventListener('click',function(){
  var items=btn.parentNode.querySelectorAll('.aula-passos li'),shown=0;items.forEach(function(li){if(!li.hidden)shown++});
  if(shown<items.length){items[shown].hidden=false;items[shown].classList.add('is-new');shown++}
  if(shown>=items.length){btn.remove()}else btn.textContent='Mostrar o '+(shown+1)+'º passo de '+items.length;
 })});
 var checkRes={};
 function checkDots(cur){document.querySelectorAll('.aula-check-dots .aula-dot').forEach(function(d,k){d.className='aula-dot'+(k===cur?' is-now':'')+(checkRes[k]===true?' is-right':checkRes[k]===false?' is-wrong':'')})}
 function checkShow(k){
  var root=document.getElementById('check-root');if(!root)return;
  root.querySelectorAll('[data-check]').forEach(function(b){b.hidden=Number(b.dataset.check)!==k});
  var end=document.getElementById('check-end'),cnt=document.getElementById('check-count');
  if(k>=quiz.length){
   var ok=Object.keys(checkRes).filter(function(x){return checkRes[x]}).length;
   end.hidden=false;cnt.textContent=ok+' de '+quiz.length+' certas';
   end.innerHTML='<div class="aula-check-score"><span class="aula-check-big">'+ok+'<small>/'+quiz.length+'</small></span><div><b>'+(ok===quiz.length?'Ideia dominada.':ok>=quiz.length/2?'Quase lá.':'Vale reler a teoria.')+'</b><p>'+(ok===quiz.length?'Pode partir para os exercícios.':'Releia o trecho do que errou e tente de novo, ou siga para os exercícios.')+'</p></div></div><div class="aula-prova-actions"><button type="button" class="aula-btn aula-btn-soft" id="check-again">Refazer a checagem</button></div>';
   end.querySelector('#check-again').addEventListener('click',function(){checkRes={};root.querySelectorAll('[data-check]').forEach(function(box){box.classList.remove('is-answered');box.querySelector('.aula-fb').innerHTML='';box.querySelectorAll('[data-opt]').forEach(function(x){x.disabled=false;x.classList.remove('is-right','is-wrong')})});checkShow(0)});
   checkDots(-1);return;
  }
  end.hidden=true;end.innerHTML='';cnt.textContent=(k+1)+' de '+quiz.length;checkDots(k);
 }
 document.querySelectorAll('[data-check]').forEach(function(box){
  var k=Number(box.dataset.check),q=quiz[k];
  box.querySelectorAll('[data-opt]').forEach(function(b){b.addEventListener('click',function(){
   if(box.classList.contains('is-answered'))return;box.classList.add('is-answered');
   var n=Number(b.dataset.opt),ok=n===q.correta;checkRes[k]=ok;checkDots(k);
   box.querySelectorAll('[data-opt]').forEach(function(x){var c=Number(x.dataset.opt);x.disabled=true;if(c===q.correta)x.classList.add('is-right');else if(c===n)x.classList.add('is-wrong')});
   var last=k>=quiz.length-1;
   var fb=box.querySelector('.aula-fb');fb.innerHTML='<div class="aula-fb-box '+(ok?'is-right':'is-wrong')+'"><b>'+(ok?'Isso!':'Não é essa. A certa é a '+String.fromCharCode(65+q.correta)+'.')+'</b>'+(q.explicacao?'<p>'+esc(q.explicacao)+'</p>':'')+'<button type="button" class="aula-btn aula-btn-ink" data-check-next>'+(last?'Ver como fui':'Próxima pergunta')+'</button>'+(ok?'':exatooCard('erro',l))+'</div>';
   fb.querySelector('[data-check-next]').addEventListener('click',function(){checkShow(k+1);var nb=document.querySelector('[data-check="'+(k+1)+'"] [data-opt]')||document.getElementById('check-again');if(nb)nb.focus({preventScroll:true});var cr=document.getElementById('check-root');if(cr.getBoundingClientRect().top<0)cr.scrollIntoView({block:'start'})});
   tex(fb);
  })});
 });
 var okBtn=document.getElementById('entenda-ok');
 okBtn.addEventListener('click',function(){st.entenda=!st.entenda;store.save();okBtn.setAttribute('aria-pressed',String(!!st.entenda));okBtn.textContent=st.entenda?'Teoria concluída':okLabel;updateProgress();if(st.entenda)goTo(steps[1]?steps[1].id:'levar')});

 /* ---------- Pratique ---------- */
 var level=0;
 if(fixQs.length){
  var firstOpen=fixSecoes.findIndex(function(s){return s.questoes.some(function(q){return !st.fix[q.n]||st.fix[q.n]==='visto'})});level=firstOpen<0?0:firstOpen;
  document.querySelectorAll('[data-level]').forEach(function(b){b.addEventListener('click',function(){level=Number(b.dataset.level);drawLevel()})});
  drawLevel();
 }
 function exCard(q){
  var s=st.fix[q.n]||'';
  return '<article class="aula-ex'+(s?' is-'+s:'')+'" data-ex="'+q.n+'"><div class="aula-ex-q"><span class="aula-ex-n">'+q.n+'</span><div class="aula-ex-body"><p>'+esc(q.enunciado)+'</p>'+(q.itens&&q.itens.length?'<ol class="aula-itens">'+q.itens.map(function(i){return '<li>'+esc(i)+'</li>'}).join('')+'</ol>':'')+'</div><span class="aula-ex-badge" aria-hidden="true"></span></div>'
   +'<button type="button" class="aula-ex-ver" aria-expanded="false">'+(q.resolucao.length?'Ver resolução':'Ver resposta')+'</button>'
   +'<div class="aula-ex-sol" hidden>'+q.resolucao.map(function(r){return '<p>'+esc(r)+'</p>'}).join('')+(q.resposta?'<p class="aula-ex-resp"><b>Resposta</b><span>'+esc(q.resposta)+'</span></p>':'')
   +'<div class="aula-ex-check"><span>Como foi?</span><button type="button" class="aula-mark" data-mark="ok" aria-pressed="'+(s==='ok')+'">Acertei</button><button type="button" class="aula-mark" data-mark="erro" aria-pressed="'+(s==='erro')+'">Errei</button></div></div></article>';
 }
 function drawLevel(){
  document.querySelectorAll('[data-level]').forEach(function(b){var on=Number(b.dataset.level)===level;b.setAttribute('aria-selected',String(on));b.classList.toggle('is-on',on)});
  var list=document.getElementById('ex-list');
  list.innerHTML=fixSecoes[level].questoes.map(function(q){return exCard(Object.assign({nivel:fixSecoes[level].nome},q))}).join('')
   +(level<fixSecoes.length-1?'<button type="button" class="aula-btn aula-btn-soft aula-next-level" data-next-level>Ir para o nível '+esc(fixSecoes[level+1].nome)+'</button>':(vestQs.length?'<a class="aula-btn aula-btn-soft aula-next-level" href="#prova" data-goto="prova">Encarar o modo prova</a>':''));
  list.querySelectorAll('.aula-ex').forEach(function(card){
   var n=Number(card.dataset.ex),btn=card.querySelector('.aula-ex-ver'),sol=card.querySelector('.aula-ex-sol');
   btn.addEventListener('click',function(){var open=sol.hidden;sol.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.textContent=open?'Esconder resolução':(btn.textContent.indexOf('resposta')>0?'Ver resposta':'Ver resolução');if(open){if(!st.fix[n]){st.fix[n]='visto';store.save()}tex(sol)}});
   card.querySelectorAll('[data-mark]').forEach(function(m){m.addEventListener('click',function(){
    st.fix[n]=st.fix[n]===m.dataset.mark?'visto':m.dataset.mark;store.save();
    card.classList.remove('is-ok','is-erro','is-visto');card.classList.add('is-'+st.fix[n]);
    card.querySelectorAll('[data-mark]').forEach(function(x){x.setAttribute('aria-pressed',String(st.fix[n]===x.dataset.mark))});
    updateProgress();
   })});
  });
  var nl=list.querySelector('[data-next-level]');if(nl)nl.addEventListener('click',function(){level++;drawLevel();goTo('pratique')});
  bindGoto(list);
  tex(list);updateProgress();
 }

 /* ---------- Modo prova ---------- */
 var prova={state:'intro',order:[],i:0,answers:{},review:null};
 var provaRoot=document.getElementById('prova-root');
 function letter(k){return String.fromCharCode(65+k)}
 function drawProva(){
  if(!provaRoot)return;
  var total=vestQs.length;
  if(prova.state==='intro'){
   var best=st.prova.best;
   provaRoot.innerHTML='<div class="aula-prova-intro"><div><h3>'+plural(total,'questão','questões')+', uma de cada vez</h3><p>Você escolhe a alternativa e vê na hora se acertou, com a resolução completa. No final, dá para refazer só as que errou.</p>'+(best!=null?'<p class="aula-prova-best">Sua melhor nota até agora: <b>'+best+' de '+total+'</b></p>':'')+'</div><button type="button" class="aula-btn aula-btn-lime aula-btn-big" id="prova-start">'+(best!=null?'Fazer de novo':'Começar a prova')+'</button></div>';
   provaRoot.querySelector('#prova-start').addEventListener('click',function(){startProva(vestQs.map(function(q,k){return k}))});
   return;
  }
  if(prova.state==='run'){
   var qi=prova.order[prova.i],q=vestQs[qi],ans=prova.answers[qi];
   var dots=prova.order.map(function(k,pos){var a=prova.answers[k];return '<span class="aula-dot'+(pos===prova.i?' is-now':'')+(a!=null?(a===vestQs[k].correta?' is-right':' is-wrong'):'')+'"></span>'}).join('');
   var acertos=prova.order.filter(function(k){return prova.answers[k]===vestQs[k].correta}).length;
   provaRoot.innerHTML='<div class="aula-prova-bar"><span>Questão <b>'+(prova.i+1)+'</b> de '+prova.order.length+'</span><span class="aula-dots" aria-hidden="true">'+dots+'</span><span>'+plural(acertos,'acerto','acertos')+'</span></div>'
    +'<div class="aula-prova-q"><p class="aula-prova-enun"><span class="aula-mcq-n">'+q.n+'</span><span>'+esc(q.enunciado)+'</span></p><div class="aula-opts aula-opts-big'+optsClass(q.opcoes)+'">'+q.opcoes.map(function(o,j){var cls='';if(ans!=null){if(j===q.correta)cls=' is-right';else if(j===ans)cls=' is-wrong'}return '<button type="button" class="aula-opt'+cls+'" data-popt="'+j+'"'+(ans!=null?' disabled':'')+'><span class="aula-opt-l">'+letter(j)+'</span><span class="aula-opt-t">'+esc(o)+'</span></button>'}).join('')+'</div>'
    +'<div id="quiz-feedback" class="aula-fb" aria-live="polite">'+(ans!=null?provaFeedback(q,ans):'<p class="aula-kbd-hint">Dica: dá para responder com as teclas A a E.</p>')+'</div></div>';
   provaRoot.querySelectorAll('[data-popt]').forEach(function(b){b.addEventListener('click',function(){answer(Number(b.dataset.popt))})});
   var nx=provaRoot.querySelector('#prova-next');if(nx){nx.addEventListener('click',nextQ);nx.focus({preventScroll:true})}
   tex(provaRoot);return;
  }
  if(prova.state==='end'){
   var right=prova.order.filter(function(k){return prova.answers[k]===vestQs[k].correta}),wrong=prova.order.filter(function(k){return prova.answers[k]!==vestQs[k].correta});
   var full=prova.order.length===total,score=right.length;
   var pct=score/prova.order.length;
   var msg=pct===1?'Gabaritou. Pode ir para a próxima aula com tranquilidade.':pct>=.7?'Mandou bem. Revise as que errou e essa aula está dominada.':pct>=.4?'Está no caminho. Refaça as erradas olhando a resolução de cada uma.':'Vale voltar à teoria e aos exercícios de fixação antes de tentar de novo.';
   provaRoot.innerHTML='<div class="aula-prova-end"><div class="aula-score"><span class="aula-score-n">'+score+'</span><span class="aula-score-d">de '+prova.order.length+'</span></div><div><h3>'+(full?'Resultado da prova':'Resultado da revisão')+'</h3><p>'+msg+'</p>'+(full&&st.prova.best!=null?'<p class="aula-prova-best">Melhor nota: <b>'+st.prova.best+' de '+total+'</b></p>':'')+'</div></div>'
    +'<p class="aula-grid-label">Toque numa questão para rever a resolução.</p><div class="aula-grid">'+prova.order.map(function(k){var ok=prova.answers[k]===vestQs[k].correta;return '<button type="button" class="aula-cell '+(ok?'is-right':'is-wrong')+(prova.review===k?' is-open':'')+'" data-review="'+k+'" aria-label="Questão '+vestQs[k].n+(ok?', acertou':', errou')+'">'+vestQs[k].n+'</button>'}).join('')+'</div>'
    +'<div id="prova-review"></div>'
    +'<div class="aula-prova-actions">'+(wrong.length?'<button type="button" class="aula-btn aula-btn-lime" id="prova-wrong">Refazer '+(wrong.length===1?'a errada':'as '+wrong.length+' erradas')+'</button>':'')+'<button type="button" class="aula-btn aula-btn-soft" id="prova-again">Recomeçar a prova</button>'+(!done.has(id)&&pct>=.7?'<button type="button" class="aula-btn aula-btn-soft" id="prova-done">Marcar aula como estudada</button>':'')+'</div>'
    +(wrong.length?exatooCard('erro',l):'');
   provaRoot.querySelectorAll('[data-review]').forEach(function(b){b.addEventListener('click',function(){var k=Number(b.dataset.review);prova.review=prova.review===k?null:k;provaRoot.querySelectorAll('[data-review]').forEach(function(x){x.classList.toggle('is-open',Number(x.dataset.review)===prova.review)});drawReview()})});
   var w=provaRoot.querySelector('#prova-wrong');if(w)w.addEventListener('click',function(){startProva(wrong)});
   provaRoot.querySelector('#prova-again').addEventListener('click',function(){startProva(vestQs.map(function(q,k){return k}))});
   var pd=provaRoot.querySelector('#prova-done');if(pd)pd.addEventListener('click',function(){var b=document.getElementById('btn-done');if(b&&!done.has(id))b.click();pd.remove()});
   drawReview();
  }
 }
 function provaFeedback(q,ans){
  var ok=ans===q.correta,last=prova.i>=prova.order.length-1;
  return '<div class="aula-fb-box '+(ok?'is-right':'is-wrong')+'"><b>'+(ok?'Certa!':'Não foi dessa vez. A correta é a '+letter(q.correta)+'.')+'</b>'+q.resolucao.map(function(r){return '<p>'+esc(r)+'</p>'}).join('')+'<button type="button" class="aula-btn aula-btn-ink" id="prova-next">'+(last?'Ver meu resultado':'Próxima questão')+'</button></div>';
 }
 function drawReview(){
  var box=provaRoot.querySelector('#prova-review');if(!box)return;
  if(prova.review==null){box.innerHTML='';return}
  var q=vestQs[prova.review],a=prova.answers[prova.review];
  box.innerHTML='<div class="aula-prova-q aula-review"><p class="aula-prova-enun"><span class="aula-mcq-n">'+q.n+'</span><span>'+esc(q.enunciado)+'</span></p><div class="aula-opts">'+q.opcoes.map(function(o,j){return '<div class="aula-opt'+(j===q.correta?' is-right':j===a?' is-wrong':'')+'"><span class="aula-opt-l">'+letter(j)+'</span><span class="aula-opt-t">'+esc(o)+'</span></div>'}).join('')+'</div><div class="aula-fb-box '+(a===q.correta?'is-right':'is-wrong')+'"><b>Resolução</b>'+q.resolucao.map(function(r){return '<p>'+esc(r)+'</p>'}).join('')+'</div></div>';
  tex(box);
 }
 function startProva(order){prova={state:'run',order:order,i:0,answers:{},review:null};drawProva();provaRoot.focus({preventScroll:true});goTo('prova')}
 function answer(j){
  if(prova.state!=='run')return;var qi=prova.order[prova.i];if(prova.answers[qi]!=null)return;
  prova.answers[qi]=j;drawProva();
  var fb=document.getElementById('quiz-feedback');if(fb){var r=fb.getBoundingClientRect(),over=r.bottom-window.innerHeight+20;if(over>0){var dy=Math.min(over,Math.max(0,r.top-topOffset()));try{window.scrollBy({top:dy,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}catch(e){window.scrollBy(0,dy)}}}
 }
 function nextQ(){
  if(prova.i<prova.order.length-1){prova.i++;drawProva();var top=provaRoot.getBoundingClientRect().top;if(top<0)goTo('prova');return}
  if(prova.order.length===vestQs.length){var sc=prova.order.filter(function(k){return prova.answers[k]===vestQs[k].correta}).length;if(st.prova.best==null||sc>st.prova.best)st.prova.best=sc;st.prova.last=sc;store.save();updateProgress()}
  prova.state='end';drawProva();
 }
 document.addEventListener('keydown',function(e){
  if(!provaRoot||prova.state!=='run'||e.altKey||e.ctrlKey||e.metaKey)return;
  var t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  var r=provaRoot.getBoundingClientRect();if(r.bottom<80||r.top>window.innerHeight-80)return;
  var k=e.key.toLowerCase(),idx='abcde'.indexOf(k);if(idx<0&&/^[1-5]$/.test(k))idx=Number(k)-1;
  var qi=prova.order[prova.i];
  if(idx>=0&&idx<vestQs[qi].opcoes.length&&prova.answers[qi]==null){e.preventDefault();answer(idx)}
  else if((e.key==='Enter'||e.key==='ArrowRight')&&prova.answers[qi]!=null&&!(t&&t.tagName==='BUTTON'&&e.key==='Enter')){e.preventDefault();nextQ()}
 });
 drawProva();

 /* ---------- Leve pra casa ---------- */
 document.querySelectorAll('[data-pdf]').forEach(function(a){a.addEventListener('click',function(){st.pdf=true;store.save();updateProgress()})});

 /* ---------- Navegação ---------- */
 function topOffset(){var tb=document.querySelector('.topbar'),h=tb?tb.offsetHeight:0;var main=document.querySelector('main.aula');if(main)main.style.setProperty('--a-top',h+'px');var rail=document.querySelector('.aula-rail');var extra=window.innerWidth<=1000&&rail?rail.offsetHeight:0;return h+extra+16}
 function goTo(sid){var el=document.getElementById(sid);if(!el)return;var y=el.getBoundingClientRect().top+window.pageYOffset-topOffset();try{window.scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}catch(e){window.scrollTo(0,y)}}
 function bindGoto(root){root.querySelectorAll('[data-goto]').forEach(function(a){if(a.dataset.bound)return;a.dataset.bound='1';a.addEventListener('click',function(e){e.preventDefault();goTo(a.dataset.goto);try{history.replaceState(null,'','#'+a.dataset.goto)}catch(err){}})})}
 bindGoto(document);
 if('IntersectionObserver' in window){
  var vis={};var io=new IntersectionObserver(function(entries){entries.forEach(function(en){vis[en.target.id]=en.isIntersecting?en.intersectionRect.height:0});var bestId=null,bestH=0;steps.forEach(function(s){if((vis[s.id]||0)>bestH){bestH=vis[s.id];bestId=s.id}});document.querySelectorAll('[data-rail]').forEach(function(a){var on=a.dataset.rail===bestId;a.classList.toggle('is-active',on);if(on){a.setAttribute('aria-current','step');var ol=a.closest('ol');if(ol&&ol.scrollWidth>ol.clientWidth+2){try{ol.scrollTo({left:Math.max(0,a.parentNode.offsetLeft-12),behavior:'smooth'})}catch(e){ol.scrollLeft=a.parentNode.offsetLeft}}}else a.removeAttribute('aria-current')})},{threshold:[0,.1,.25,.5,.75,1],rootMargin:'-90px 0px -35% 0px'});
  steps.forEach(function(s){var el=document.getElementById(s.id);if(el)io.observe(el)});
 }
 updateProgress();

 /* ---------- Ações da aula ---------- */
 document.getElementById('btn-fav').addEventListener('click',function(){saveAction(l,this)});
 document.getElementById('btn-done').addEventListener('click',function(){finishAction(l,this);var cur=document.querySelector('.aula-trail .is-current');if(cur)cur.classList.toggle('is-done',done.has(id))});
 var shareBtn=document.getElementById('btn-share'),shareOptions=document.getElementById('lesson-share-options'),shareStatus=document.getElementById('share-status'),shareManual=document.getElementById('share-manual');
 var shareUrl=new URL(href(l),location.origin).href,shareText='Olha essa aula de matemática no MAT MAT MAT!: '+l.title,shareMessage=shareText+'\n'+shareUrl;
 document.getElementById('share-whatsapp').href='https://wa.me/?text='+encodeURIComponent(shareMessage);
 function setShareOptions(visible){shareOptions.hidden=!visible;shareBtn.setAttribute('aria-expanded',String(visible));if(!visible){shareStatus.textContent='';shareManual.hidden=true}}
 shareBtn.addEventListener('click',function(){
  if(typeof navigator.share==='function'){
   try{var result=navigator.share({title:l.title+' | MAT MAT MAT!',text:shareText,url:shareUrl});Promise.resolve(result).then(function(){setShareOptions(false)}).catch(function(err){if(!err||err.name!=='AbortError')setShareOptions(true)})}catch(err){if(!err||err.name!=='AbortError')setShareOptions(true)}
  }else setShareOptions(shareOptions.hidden);
 });
 document.getElementById('share-close').addEventListener('click',function(){setShareOptions(false);shareBtn.focus()});
 document.getElementById('share-copy').addEventListener('click',function(){
  function copied(){shareStatus.textContent='Mensagem e link copiados.';shareManual.hidden=true}
  function manual(){shareStatus.textContent='Selecione e copie a mensagem abaixo:';shareManual.value=shareMessage;shareManual.hidden=false;shareManual.focus();shareManual.select()}
  if(navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){navigator.clipboard.writeText(shareMessage).then(copied).catch(manual)}
  else{shareManual.value=shareMessage;shareManual.hidden=false;shareManual.select();try{if(document.execCommand&&document.execCommand('copy'))copied();else manual()}catch(e){manual()}}
 });

 /* ---------- Matemática e chegada direta a uma etapa ---------- */
 tex(document.querySelector('.aula-hero')).then(function(){fitFormula(document.getElementById('aula-formula-math'))});
 tex(document.getElementById('entenda'));
 topOffset();
 if(window.addEventListener)window.addEventListener('resize',function(){topOffset();var f=document.getElementById('aula-formula-math');if(f){f.style.fontSize='';fitFormula(f)}});
 var requested=new URLSearchParams(location.search).get('tab')||location.hash.replace('#','');
 var map={resumo:'entenda',teoria:'entenda',quiz:vestQs.length?'prova':'entenda',videos:'levar',arquivos:'levar'};
 var target=map[requested]||requested;
 if(steps.some(function(s){return s.id===target}))setTimeout(function(){goTo(target)},60);
}

function safeUrl(url){try{var x=new URL(url);return (x.protocol==='https:'||x.protocol==='http:')?x.toString():null}catch(e){return null}}
async function init(){try{var r=await fetch('/data/aulas.json');if(!r.ok)throw Error('Catálogo não encontrado');data=await r.json();try{var m=await fetch('/data/materiais.json');if(m.ok)materialIndex=await m.json()}catch(e){materialIndex=[]}if(document.body.dataset.lesson)await lessonPage();else if(document.body.dataset.view==='explorar')explorePage();else if(document.body.dataset.view==='diagnostico')await diagnosisPage();else home()}catch(e){document.getElementById('app').innerHTML=header()+'<main class="shell">'+empty('Não foi possível carregar o catálogo','Recarregue a página para tentar novamente.')+'</main>'+footer();console.error(e)}}
init();
})();
