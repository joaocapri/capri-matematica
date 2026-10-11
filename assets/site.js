
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
function title(str){document.title=str+' · MAT MAT MAT'}
function empty(label,detail){return '<div class="placeholder"><div class="emoji">✦</div><h3>'+esc(label)+'</h3><p>'+esc(detail)+'</p></div>'}
function brandLogo(){return '<span class="mat-logo" aria-hidden="true"><span>MAT</span><span>MAT</span><span>MAT</span></span>'}
function header(){return '<header class="topbar"><div class="shell"><a href="/" class="brand brand-mat" aria-label="MAT MAT MAT — página inicial">'+brandLogo()+'<span class="mat-brand-descriptor">MATEMÁTICA<br>SEM ENROLAÇÃO<span class="mat-brand-dot">✳</span></span></a><nav class="navlinks" aria-label="Navegação principal"><a href="/?q=PDF#resultados">Listas e PDFs</a><a href="/explorar/">Assuntos</a><a class="nav-cta" href="/teste-seu-nivel/"><span class="nav-cta-long">Teste seu nível ↗</span><span class="nav-cta-short">Teste seu nível ↗</span></a></nav></div></header>'}
function footer(){return '<footer class="footer"><div class="shell"><div class="mat-footer-mark"><a href="/" class="brand-mat brand-mat-footer" aria-label="MAT MAT MAT — início">'+brandLogo()+'</a><div><strong>MAT MAT MAT</strong><p>Matemática de graça, do seu jeito. Conteúdo do Prof. João Capri.</p></div></div><p>Álgebra · Geometria · Aritmética · Estatística · Trigonometria</p></div></footer>'}
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
 '<p>Aulas, listas e PDFs grátis. Simples assim.</p>'+
 '<div class="home-search-section"><label class="home-searchbox" for="hero-search"><span class="home-search-mark" aria-hidden="true">⌕</span><input type="search" id="hero-search" autocomplete="off" aria-label="Pesquisar aulas, assuntos e PDFs" aria-controls="quick-hits" aria-expanded="false" placeholder="Busque um assunto, aula ou PDF…"><button type="button" id="clear-search" aria-label="Limpar busca" hidden>×</button><button type="button" id="btn-search" aria-label="Pesquisar">Buscar ↗</button></label>'+
 '<div class="home-quick-hits" id="quick-hits" hidden aria-live="polite"></div>'+
 '</div>'+
 
 '</div><div class="home-hero-art" aria-hidden="true"><span class="home-hero-spark">✳</span><div class="home-math-card"><div class="home-math-card-top"><span>FUNÇÃO QUADRÁTICA</span><span>↗</span></div><strong>y = x² − 4</strong><svg viewBox="0 0 320 188" xmlns="http://www.w3.org/2000/svg"><g stroke="#e5dff5" stroke-width="1"><path d="M20 27H300M20 65H300M20 103H300M20 141H300M40 12V173M100 12V173M160 12V173M220 12V173M280 12V173"/></g><path d="M20 103H300M160 12V173" stroke="#ac9cc8" stroke-width="2" stroke-linecap="round"/><path d="M64 20Q160 318 256 20" stroke="#5e30c8" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="160" cy="169" r="6" fill="#FF7956" stroke="#211946" stroke-width="2"/><circle cx="90" cy="103" r="4" fill="#211946"/><circle cx="230" cy="103" r="4" fill="#211946"/></svg><span class="home-math-caption">Menos decorar. Mais entender.</span></div></div></section>'+
 '<section class="home-search-results" id="resultados" hidden aria-live="polite"><div class="home-results-head"><div><span class="home-section-label">SUA PESQUISA</span><h2 id="search-title">Resultados</h2></div><button id="return-home" class="home-back-button" type="button">← Voltar à exploração</button></div><div id="search-scope" class="home-search-scopes" role="group" aria-label="Filtrar resultados"></div><div id="search-output"></div></section>'+
 '<div id="home-discover">'+
 '<section id="explorar" class="home-explore" aria-labelledby="explore-title"><div class="home-section-intro"><div><span class="home-section-label"><span class="home-section-indicator"></span> TODA A MATEMÁTICA, ORGANIZADA</span><h2 id="explore-title">Encontre seu <em>material.</em></h2><p>Prefere navegar? Escolha uma área, encontre o assunto e abra a aula ou lista de que precisa.</p></div><span class="home-explore-decoration" aria-hidden="true">↗</span></div><div id="explore-content"></div></section>'+
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
   html='<div class="browser-toolbar browser-toolbar-compact"><div><span class="browse-kicker">ESCOLHA UMA ÁREA PARA COMEÇAR ↘</span></div><div class="browser-shortcuts"><a href="/explorar/?favoritos=1">♡ Favoritas'+(saved.size?' ('+saved.size+')':'')+'</a><a href="/explorar/?todas=1">Todas as 144 ↗</a></div></div><div class="area-grid">'+SUBJECT_AREAS.map(tile).join('')+'</div>';
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
 document.getElementById('app').innerHTML=header()+'<main class="shell explorer-page"><div class="explorer-back"><a href="/">← Início</a><span>MAT MAT MAT / CATÁLOGO</span></div><div class="explorer-title"><div><span class="home-section-label">✳ BIBLIOTECA DE MATEMÁTICA</span><h1 id="explorer-heading">Explorar matemática</h1><p id="explorer-description">Escolha uma área para começar.</p></div><a class="explorer-search-link" href="/">⌕ Pesquisar ↗</a></div><div id="explorer-content"></div></main>'+footer();
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
 root.innerHTML=header()+'<main class="shell diagnostic-page"><div class="explorer-back"><a href="/">← Página inicial</a><span>MAT MAT MAT / DIAGNÓSTICO</span></div><div id="diagnostic-content" aria-live="polite"></div></main>'+footer();
 var body=document.getElementById('diagnostic-content'),bank;
 try{var response=await fetch('/data/diagnostico.json');if(!response.ok)throw Error('Diagnóstico indisponível');bank=await response.json()}catch(e){body.innerHTML=empty('Não foi possível carregar o teste','Tente novamente em alguns instantes.');return}
 var current=-1,answers={};
 function start(){body.innerHTML='<section class="diagnosis-start"><div><span class="home-section-label">✳ TESTE SEU NÍVEL</span><h1>Descubra por onde <em>começar.</em></h1><p>15 questões rápidas, cinco habilidades e uma sugestão de estudo para você. Grátis e sem cadastro.</p><div class="diagnosis-highlights"><span>◷ 6–10 min</span><span>✦ 15 questões</span><span>✓ Resultado na hora</span></div><button class="diagnosis-button" id="diagnosis-start">Começar teste ↗</button><p class="diagnosis-disclaimer">É uma sondagem inicial, não uma avaliação oficial. Suas respostas ficam nesta página e não são enviadas para o Exatoo.</p></div><div class="diagnosis-decor" aria-hidden="true"><strong>?</strong><span>x² · π · ½</span></div></section>';
  document.getElementById('diagnosis-start').addEventListener('click',function(){current=0;draw()})}
 function draw(){
  if(current>=bank.questions.length){results();return}
  var q=bank.questions[current],chosen=answers[q.id],progress=(current+1)/bank.questions.length*100;
  body.innerHTML='<section class="diagnosis-quiz"><div class="diagnosis-progress-top"><span>QUESTÃO '+(current+1)+' DE '+bank.questions.length+'</span><span>'+Math.round(progress)+'% do teste</span></div><div class="diagnosis-progress"><span style="width:'+progress+'%"></span></div><div class="diagnosis-question"><span class="home-section-label">✳ ESCOLHA UMA RESPOSTA</span><h1>'+esc(q.enunciado)+'</h1><div class="diagnosis-answers">'+q.opcoes.map(function(opt,j){return '<button type="button" data-diagnosis-answer="'+j+'" class="diagnosis-option '+(chosen===j?'selected':'')+'" aria-pressed="'+(chosen===j)+'"><b>'+String.fromCharCode(65+j)+'</b><span>'+esc(opt)+'</span><span class="diagnosis-radio">'+(chosen===j?'✓':'')+'</span></button>'}).join('')+'</div></div><div class="diagnosis-controls"><button id="diagnosis-prev" type="button" class="diagnosis-prev">'+(current?'← Voltar':'← Início')+'</button><button type="button" class="diagnosis-button" id="diagnosis-next" '+(chosen==null?'disabled':'')+'>'+(current===bank.questions.length-1?'Ver meu resultado ↗':'Próxima questão ↗')+'</button></div></section>';
  body.querySelectorAll('[data-diagnosis-answer]').forEach(function(b){b.addEventListener('click',function(){answers[q.id]=Number(b.dataset.diagnosisAnswer);draw()})});
  document.getElementById('diagnosis-prev').addEventListener('click',function(){if(current===0){current=-1;start()}else{current--;draw()}});
  document.getElementById('diagnosis-next').addEventListener('click',function(){if(answers[q.id]==null)return;current++;draw()});
 }
 function results(){
  var total=bank.questions.filter(function(q){return answers[q.id]===q.correta}).length;
  var headline=total<=5?'Vamos fortalecer a base.':total<=10?'Você já tem uma base. Vamos evoluir.':'Boa base! Hora de avançar.';
  var ranking=bank.domains.map(function(d){var subset=bank.questions.filter(function(q){return q.area===d.id});var correct=subset.filter(function(q){return answers[q.id]===q.correta}).length;return {domain:d,correct:correct,max:subset.length}}).sort(function(a,b){return a.correct-b.correct});
  var advice=ranking.filter(function(r){return r.correct<3}).slice(0,3);
  body.innerHTML='<section class="diagnosis-result"><div class="diagnosis-result-heading"><span class="home-section-label">✳ SEU DIAGNÓSTICO</span><h1>'+esc(headline)+'</h1><p>Este resultado mostra como você foi nessas 15 perguntas. Não define seu nível absoluto de matemática.</p></div><div class="diagnosis-score"><strong>'+total+'<small>/ 15</small></strong><span>respostas corretas</span></div><h2>Suas habilidades</h2><div class="diagnosis-domain-list">'+ranking.map(function(r){return '<div class="diagnosis-domain"><div><strong>'+esc(r.domain.label)+'</strong><span>'+r.correct+' de '+r.max+'</span></div><div class="diagnosis-domain-track"><span style="width:'+(100*r.correct/r.max)+'%"></span></div></div>'}).join('')+'</div><h2>Por onde começar?</h2><div class="diagnosis-recs">'+(advice.length?advice.map(function(r){var l=data.lessons.find(function(l){return l.id===r.domain.lesson});return '<a href="'+href(l)+'"><span>REVISAR PRIMEIRO</span><strong>'+esc(r.domain.label)+'</strong><small>'+esc(l.title)+'</small><b>Estudar agora ↗</b></a>'}).join(''):'<div class="diagnosis-perfect">Você acertou todas as questões! Explore assuntos mais avançados e continue praticando.</div>')+'</div><div class="diagnosis-end-actions"><button class="diagnosis-prev" id="diagnosis-restart">↻ Refazer teste</button><a href="/explorar/" class="diagnosis-button">Explorar as aulas ↗</a></div><div class="diagnosis-review"><details><summary>Ver respostas e explicações das 15 questões</summary>'+bank.questions.map(function(q){var right=answers[q.id]===q.correta;return '<div class="diagnosis-review-row"><strong>'+(right?'✓':'✕')+' '+esc(q.enunciado)+'</strong><p>Resposta: '+esc(q.opcoes[q.correta])+'. '+esc(q.explicacao)+'</p></div>'}).join('')+'</details></div><div class="diagnosis-exatoo">'+exatooCard('revisar')+'</div></section>';
  document.getElementById('diagnosis-restart').addEventListener('click',function(){current=-1;answers={};start()});
 }
 start();
}

function saveAction(l,btn){if(saved.has(l.id))saved.delete(l.id);else saved.add(l.id);store('capri-favoritos',saved);btn.textContent=(saved.has(l.id)?'♥ Salvo':'♡ Favoritar');btn.classList.toggle('liked',saved.has(l.id))}
function finishAction(l,btn){if(done.has(l.id))done.delete(l.id);else done.add(l.id);store('capri-estudadas',done);btn.textContent=(done.has(l.id)?'✓ Aula estudada':'✓ Marcar como estudada');btn.classList.toggle('liked',done.has(l.id))}
async function lessonPage(){
 var id=document.body.dataset.lesson;var l=data.lessons.find(function(x){return x.id===id});if(!l){document.getElementById('app').innerHTML=header()+'<main class="shell">'+empty('Aula não encontrada','Volte ao catálogo e tente novamente.')+'</main>'+footer();return}
 var b=blockBy(l.block),f=frontBy(l.front),subjectArea=areaForLesson(l),topicId=subjectTopic(l,subjectArea),topic=topicInfo(topicId);
 var near=data.lessons.filter(function(x){return subjectTopic(x,areaForLesson(x))===topicId});
 var nearIndex=near.findIndex(function(x){return x.id===id});
 title(l.title);
 var content=null;try{var r=await fetch('/conteudos/'+id+'.json');if(r.ok)content=await r.json()}catch(e){}
 var app=document.getElementById('app');
 app.innerHTML=header()+'<main class="shell"><div class="crumbs"><a href="/">Início</a> / <a href="/explorar/?area='+subjectArea.id+'">'+esc(subjectArea.name)+'</a> / <a href="/explorar/?area='+subjectArea.id+'&assunto='+topicId+'">'+esc(topic.title)+'</a> / '+id+'</div><section class="lesson-hero front-'+esc(l.front)+'"><div class="code">✦ '+esc(subjectArea.name)+' · '+esc(topic.title)+' · AULA '+id+'</div><h1>'+esc(l.title)+'</h1><p>'+esc(l.summary||'Seu roteiro de estudos começa aqui. Em breve, novas explicações e materiais.')+'</p><div class="spark">∑</div></section><div class="lesson-main"><aside class="sidepanel"><h3>✦ Neste assunto</h3><p>'+esc(topic.title)+'</p><div class="sidelist">'+near.map(function(x){return '<a class="sidelesson '+(x.id===id?'active':'')+'" href="'+href(x)+'"><small>'+x.id+'</small>'+esc(x.title)+'</a>'}).join('')+'</div></aside><section><div class="actions"><button class="action primary" id="btn-done">'+(done.has(id)?'✓ Aula estudada':'✓ Marcar como estudada')+'</button><button class="action" id="btn-fav">'+(saved.has(id)?'♥ Salvo':'♡ Favoritar')+'</button><button class="action" id="btn-copy">↗ Copiar link</button></div><div class="material-spotlight"><div class="material-spotlight-symbol">📄</div><div><strong>Veio atrás de listas?</strong><p>'+(lessonPdfFiles().length||(content&&content.lista&&content.lista.length)?'Materiais gratuitos disponíveis para baixar.':'Confira listas e materiais deste assunto.')+'</p></div><button type="button" class="material-spotlight-button" id="open-materials">Listas e PDFs ↗</button></div><article class="contentpanel"><div class="tabs"><button class="tab tab-featured" data-tab="arquivos">📄 Listas e PDFs</button><button class="tab" data-tab="teoria">Teoria</button><button class="tab" data-tab="quiz">Quiz ⚡</button><button class="tab" data-tab="videos">Vídeos ▶</button></div><div id="tab-body"></div></article><div class="prevnext">'+(nearIndex>0?'<a href="'+href(near[nearIndex-1])+'">← Anterior: '+esc(short(near[nearIndex-1].title,38))+'</a>':'<span></span>')+(nearIndex<near.length-1?'<a href="'+href(near[nearIndex+1])+'">Próxima: '+esc(short(near[nearIndex+1].title,38))+' →</a>':'')+'</div></section></div></main>'+footer();
 var area=document.getElementById('tab-body');

 function lessonPdfFiles(){
  var linked=materialsAt('aula',id).concat(materialsAt('assunto',topicId),materialsAt('area',subjectArea.id));
  var files=linked.flatMap(function(x){return x.item.arquivos||[]}).concat(content&&content.arquivos||[]);
  var seen=new Set();return files.filter(function(f){if(!f.url||seen.has(f.url))return false;seen.add(f.url);return true});
 }

 function filesHtml(files,type){var list=(files||[]).filter(function(x){return !type||x.tipo===type});return list.length?list.map(function(x){return '<a class="filelink" target="_blank" rel="noopener" href="'+esc(x.url)+'"><span>📄 '+esc(x.titulo||'Material')+'</span><span>Baixar ↗</span></a>'}).join(''):empty('Materiais a caminho','As listas de exercícios e os gabaritos desta aula serão publicados aqui.')}
 function renderTab(tab){
  var html='';
  if(tab==='teoria'){var sections=content&&Array.isArray(content.teoria)?content.teoria:[];html='<h2>Teoria & exemplos</h2>'+(sections.length?sections.map(function(s,j){var h='<section class="theory-section"><span class="step-label">PASSO '+(j+1)+'</span><h3>'+esc(s.titulo||'Conceito')+'</h3>';for(var p of(s.paragrafos||[])){h+='<p>'+esc(p)+'</p>'}for(var formula of(s.formulas||[])){h+='<div class="formula">\\('+esc(formula)+'\\)</div>'}if(s.exemplo){h+='<div class="theory-example"><b>✦ Bora ver na prática?</b><p>'+esc(s.exemplo.enunciado)+'</p>'+(s.exemplo.passos||[]).map(function(p){return '<p class="example-step">'+esc(p)+'</p>'}).join('')+'</div>'}if(s.dica)h+='<div class="hint">💡 <b>Macete:</b> '+esc(s.dica)+'</div>';if(s.erroComum)h+='<div class="warning">⚠️ <b>Armadilha de prova:</b> '+esc(s.erroComum)+'</div>';return h+'</section>'}).join(''):empty('A explicação vem aí','A teoria desta aula ainda não está disponível. Confira os outros recursos desta aula.'))}
  if(tab==='quiz'){html='<h2>Quiz relâmpago ⚡</h2>'+(content&&content.quiz&&content.quiz.length?'<p>Responda, descubra o porquê e continue. Sem pegadinhas desnecessárias!</p><div id="quiz-root"></div>':empty('Quiz a caminho','As perguntas interativas serão publicadas nesta aba.'))}
  if(tab==='videos'){var videos=content&&content.videos||[];html='<h2>Viu, entendeu? ▶</h2><p>Videoaulas e materiais complementares para estudar o assunto.</p>'+(videos.length?'<div class="video-grid">'+videos.map(function(v){var u=safeUrl(v.url);return u?'<a class="video-card" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer"><span class="video-play">▶</span><div><small>'+esc(v.canal||'Vídeo recomendado')+'</small><h3>'+esc(v.titulo)+'</h3><p>'+esc(v.descricao||'')+'</p></div><span class="video-arrow">↗</span></a>':''}).join('')+'</div>':empty('Videoaulas','Encontre uma aula em vídeo sobre este tema.'))+'<a class="video-search-more" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/results?search_query='+encodeURIComponent(l.title+' matemática videoaula')+'">⌕ Pesquisar videoaulas: '+esc(l.title)+' ↗</a>'}
  if(tab==='arquivos'){
   var links=(content&&content.lista&&content.lista.length&&!lessonPdfFiles().length)?'<div class="print-actions"><a class="filelink" target="_blank" rel="noopener" href="/imprimir/?aula='+encodeURIComponent(id)+'&tipo=lista"><span>📝 Lista formatada para A4</span><span>Salvar PDF ↗</span></a><a class="filelink" target="_blank" rel="noopener" href="/imprimir/?aula='+encodeURIComponent(id)+'&tipo=gabarito"><span>✅ Gabarito comentado em A4</span><span>Salvar PDF ↗</span></a><p class="small-explainer">Abra o material e escolha <b>Imprimir / Salvar PDF</b> para criar uma cópia em seu dispositivo.</p></div>':'';
   var files=lessonPdfFiles();
   var practice=content&&Array.isArray(content.exercicios)?content.exercicios:[];
   html='<div class="materials-tab-title"><div><div class="eyebrow"><span class="dot"></span> SEUS MATERIAIS DE ESTUDO</div><h2>Listas & PDFs</h2><p>Baixe, imprima e pratique no seu ritmo.</p></div><span class="materials-tab-emoji">↗</span></div>'+links+(files.length?filesHtml(files):(!links?empty('Listas e PDFs','Ainda não há PDFs associados a esta aula. Explore a teoria e o quiz nas outras abas.'):''))+(files.length||links?'':exatooCard('treino',l))+(practice.length?'<details class="practice-inline"><summary>Mais atividades para treinar · '+practice.length+'</summary>'+practice.map(function(x,j){return '<div class="topic"><b>Atividade '+(j+1)+'</b><p>'+esc(x.enunciado||'')+'</p>'+(x.resposta?'<details><summary>Conferir resposta</summary><p>'+esc(x.resposta)+'</p></details>':'')+'</div>'}).join('')+'</details>':'');
  }
  area.innerHTML=html;if(tab==='quiz'&&content&&content.quiz&&content.quiz.length)initQuiz(content.quiz,l);if(window.MathJax&&window.MathJax.typesetPromise)window.MathJax.typesetPromise([area]);
 }
 document.querySelectorAll('[data-tab]').forEach(function(el){el.addEventListener('click',function(){document.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('active',x===el)});renderTab(el.dataset.tab)})});
 document.getElementById('btn-fav').addEventListener('click',function(){saveAction(l,this)});
 document.getElementById('btn-done').addEventListener('click',function(){finishAction(l,this)});
 document.getElementById('btn-copy').addEventListener('click',async function(){try{await navigator.clipboard.writeText(location.href);this.textContent='✓ Link copiado'}catch(e){this.textContent='Copie o endereço acima'}});
 document.getElementById('open-materials').addEventListener('click',function(){switchTab('arquivos')});
 function switchTab(tab){document.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('active',x.dataset.tab===tab)});renderTab(tab)}
 var requested=new URLSearchParams(location.search).get('tab');
 // Compartilhamentos antigos com ?tab=resumo continuam funcionando sem exibir uma aba removida.
 if(requested==='resumo')requested='teoria';
 if(['teoria','quiz','videos','arquivos'].includes(requested))switchTab(requested);
 else switchTab((lessonPdfFiles().length||(content&&content.lista&&content.lista.length))?'arquivos':'teoria');
}

function safeUrl(url){try{var x=new URL(url);return (x.protocol==='https:'||x.protocol==='http:')?x.toString():null}catch(e){return null}}
function initQuiz(questions,lesson){
 var root=document.getElementById('quiz-root');if(!root)return;
 var idx=0,score=0,answered=false,finish=false;
 function draw(){
  if(finish){root.innerHTML='<div class="quiz-score"><div class="emoji">✦</div><h3>Fim de jogo!</h3><div class="big-score">'+score+' / '+questions.length+'</div><p>'+(score===questions.length?'Você gabaritou! 👑':'Boa! Confira as explicações e tente de novo para fixar.')+'</p><button class="action primary" id="quiz-again">↻ Tentar novamente</button>'+(score<questions.length?exatooCard('treino',lesson):'')+'</div>';document.getElementById('quiz-again').addEventListener('click',function(){idx=0;score=0;answered=false;finish=false;draw()});return}
  var q=questions[idx];root.innerHTML='<div class="quiz-meta"><span>QUESTÃO '+(idx+1)+' DE '+questions.length+'</span><span>ACERTOS: '+score+'</span></div><div class="quiz-track"><span style="width:'+((idx+1)*100/questions.length)+'%"></span></div><div class="quiz-question"><span class="step-label">'+esc(q.nivel||'Treino')+'</span><h3>'+esc(q.enunciado)+'</h3><div class="quiz-options">'+q.opcoes.map(function(opt,j){return '<button class="quiz-option" data-opt="'+j+'" type="button"><span class="letter">'+String.fromCharCode(65+j)+'</span><span>'+esc(opt)+'</span></button>'}).join('')+'</div><div id="quiz-feedback" aria-live="polite"></div></div>';
  root.querySelectorAll('[data-opt]').forEach(function(button){button.addEventListener('click',function(){if(answered)return;answered=true;var n=Number(button.dataset.opt),ok=n===q.correta;if(ok)score++;root.querySelectorAll('[data-opt]').forEach(function(b){var current=Number(b.dataset.opt);b.disabled=true;if(current===q.correta)b.classList.add('correct');else if(current===n)b.classList.add('incorrect')});document.getElementById('quiz-feedback').innerHTML='<div class="quiz-feedback"><b>'+(ok?'✓ Boa! Resposta certa.':'↗ Quase! Agora faz sentido.')+'</b><p>'+esc(q.explicacao)+'</p><button class="action primary" id="quiz-next">'+(idx===questions.length-1?'Ver resultado':'Próxima questão →')+'</button>'+(ok?'':exatooCard('erro',lesson))+'</div>';document.getElementById('quiz-next').addEventListener('click',function(){idx++;answered=false;if(idx>=questions.length)finish=true;draw()});if(window.MathJax&&window.MathJax.typesetPromise)window.MathJax.typesetPromise([root])})});
  if(window.MathJax&&window.MathJax.typesetPromise)window.MathJax.typesetPromise([root]);
 }
 draw();
}

async function init(){try{var r=await fetch('/data/aulas.json');if(!r.ok)throw Error('Catálogo não encontrado');data=await r.json();try{var m=await fetch('/data/materiais.json');if(m.ok)materialIndex=await m.json()}catch(e){materialIndex=[]}if(document.body.dataset.lesson)await lessonPage();else if(document.body.dataset.view==='explorar')explorePage();else if(document.body.dataset.view==='diagnostico')await diagnosisPage();else home()}catch(e){document.getElementById('app').innerHTML=header()+'<main class="shell">'+empty('Não foi possível carregar o catálogo','Recarregue a página para tentar novamente.')+'</main>'+footer();console.error(e)}}
init();
})();
