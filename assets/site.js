
(function(){
'use strict';
/* Out/2026: as aulas foram renumeradas. Leva o progresso salvo no navegador para os códigos novos (uma vez só). */
(function(){try{
 if(localStorage.getItem('matmat-curriculo'))return;
 var M={"A07":"A12","A08":"A13","A09":"A14","A11":"A15","A12":"A16","A13":"A17","A14":"A18","A16":"A19","A17":"A20","A18":"A21","A19":"A22","A20":"A23","A21":"A24","A22":"A29","A23":"A30","A24":"A31","A25":"A32","A26":"A33","A27":"A34","A28":"A35","A29":"A36","A30":"A37","A31":"A38","A32":"A39","A33":"A40","A34":"A41","A35":"A42","A36":"A43","A37":"A44","A38":"A45","A39":"A46","A40":"A47","A41":"A48","A42":"A49","A43":"A50","A44":"A51","A45":"A52","A46":"A53","A47":"A54","A48":"A55","C12":"C07","C07":"C08","C08":"C09","C09":"C10","C10":"C11","C11":"C12","C26":"C20","C20":"C21","C21":"C22","C22":"C23","C23":"C24","C24":"C25","C25":"C26","A15":"C48","C48":"C49","A10":null};
 function to(id){return Object.prototype.hasOwnProperty.call(M,id)?M[id]:id}
 ['capri-estudadas','capri-favoritos'].forEach(function(k){var v=localStorage.getItem(k);if(!v)return;var a=JSON.parse(v)||[];localStorage.setItem(k,JSON.stringify(a.map(to).filter(Boolean)))});
 var st={},keys=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^matmat-aula-[ABC]\d\d$/.test(k))keys.push(k)}
 keys.forEach(function(k){st[k.slice(12)]=localStorage.getItem(k);localStorage.removeItem(k)});
 Object.keys(st).forEach(function(id){var n=to(id);if(n)localStorage.setItem('matmat-aula-'+n,st[id])});
 var u=localStorage.getItem('matmat-ultima-aula');if(u){var n=to(u);if(n)localStorage.setItem('matmat-ultima-aula',n);else localStorage.removeItem('matmat-ultima-aula')}
 localStorage.setItem('matmat-curriculo','2');
}catch(e){}})();
/* Out/2026 (currículo v3): assuntos divididos com mais calma. Mesma migração, uma vez só. */
(function(){try{
 if(localStorage.getItem('matmat-curriculo')==='3')return;
 var M={"A03":"A04","A04":"A05","A05":"C09","A06":"C11","A07":"C14","A08":"C15","A09":"C17","A10":"C19","A11":"C18","A12":"A06","A13":"A07","A14":"A08","A15":"A10","A16":"A11","A17":"A12","A18":"A15","A19":"A16","A20":"A17","A21":"A18","A22":"A20","A23":"A21","A24":"A23","A25":"A24","A26":"A25","A27":"A26","A28":"A27","A29":"A28","A32":"A33","A33":"A34","A34":"A36","A35":"A37","A36":"A38","A37":"A39","A38":"A40","A39":"A41","A40":"A43","A41":"A44","A42":"A46","A43":"A47","A44":"A49","A45":"A50","A46":"A65","A47":"A68","A48":"A69","A49":"A70","A50":"A71","A51":"A73","A52":"A75","A53":"A76","A54":"A78","A55":"A79","B02":"B03","B03":"B04","B04":"B05","B05":"B08","B06":"B10","B07":"B11","B08":"B12","B09":"B14","B10":"B15","B11":"B16","B12":"B17","B13":"B18","B14":"B19","B15":"B20","B16":"B22","B17":"B23","B18":"B24","B19":"B26","B20":"B27","B21":"B28","B22":"B29","B23":"B31","B24":"B32","B25":"B34","B26":"B35","B27":"B36","B28":"B37","B29":"B38","B30":"B39","B31":"B40","B32":null,"B33":"B41","B34":"B44","B35":"B46","B36":"B43","B37":"B51","B38":"B52","B39":"B54","B40":"B55","B41":"B56","B42":"B57","B43":null,"B44":null,"B45":null,"B46":"B58","B47":"B59","B48":null,"C01":"C03","C02":"C04","C03":"C05","C04":"C22","C05":"C24","C06":"C25","C07":"C27","C08":"C29","C09":"C30","C10":"C32","C11":"C33","C12":"C35","C13":"C36","C14":"C37","C15":"C37","C16":"C38","C17":"C41","C18":"C43","C19":"C42","C20":"C45","C21":"C47","C22":"C48","C23":"C49","C24":"C50","C25":"C51","C26":"C52","C27":"C53","C28":"C55","C29":"C56","C30":"C58","C31":"C59","C32":"C60","C33":"C61","C34":"C65","C35":"C66","C36":"C67","C37":"C69","C38":"C71","C39":"C72","C40":"C73","C41":"C74","C42":"C76","C43":"C77","C44":"C63","C45":"A52","C46":"A55","C47":"A57","C48":"A60","C49":"A62"};
 function to(id){return Object.prototype.hasOwnProperty.call(M,id)?M[id]:id}
 ['capri-estudadas','capri-favoritos'].forEach(function(k){var v=localStorage.getItem(k);if(!v)return;var a=JSON.parse(v)||[];localStorage.setItem(k,JSON.stringify(a.map(to).filter(Boolean)))});
 var st={},keys=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^matmat-aula-[ABC]\d\d$/.test(k))keys.push(k)}
 keys.forEach(function(k){st[k.slice(12)]=localStorage.getItem(k);localStorage.removeItem(k)});
 Object.keys(st).forEach(function(id){var n=to(id);if(n)localStorage.setItem('matmat-aula-'+n,st[id])});
 var u=localStorage.getItem('matmat-ultima-aula');if(u){var n=to(u);if(n)localStorage.setItem('matmat-ultima-aula',n);else localStorage.removeItem('matmat-ultima-aula')}
 localStorage.setItem('matmat-curriculo','3');
}catch(e){}})();
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
function brandLogo(){return '<img class="mat-logo-img" src="/assets/logo-mat-256.png" width="360" height="216" alt="" decoding="async">'}
function header(){return '<header class="topbar"><div class="shell"><a href="/" class="brand brand-mat" aria-label="MAT MAT MAT! — página inicial">'+brandLogo()+'</a><p class="header-promise"><span class="header-promise-title">Matemática para o ensino médio e vestibulares</span><span class="header-promise-line"><span class="header-free">100% gratuito</span>sem cadastro e sem enrolação</span></p><nav class="navlinks" aria-label="Navegação principal"><a href="/?q=PDF#resultados">Listas e PDFs</a><a href="/explorar/">Assuntos</a><a class="nav-cta" href="/teste-seu-nivel/"><span class="nav-cta-long">Teste seu nível ↗</span><span class="nav-cta-short">Teste seu nível ↗</span></a></nav></div><p class="header-promise-bar"><span class="header-free">100% gratuito</span><span class="header-promise-long">Matemática para o ensino médio e vestibulares</span><span class="header-promise-short">Ensino médio e vestibulares</span></p></header>'}
function footer(){return '<footer class="footer"><div class="shell"><div class="mat-footer-mark"><a href="/" class="brand-mat brand-mat-footer" aria-label="MAT MAT MAT! — início">'+brandLogo()+'</a><div><strong>MAT MAT MAT!</strong><p>Matemática gratuita para o ensino médio e vestibulares. Conteúdo do Prof. João Capri.</p></div></div><p>Álgebra · Geometria · Aritmética · Estatística · Trigonometria</p></div></footer>'}
function card(l){return '<a class="lesson-card" href="'+href(l)+'"><span class="mini">Aula '+esc(l.id)+' · '+esc(frontBy(l.front).name)+'</span><h4>'+esc(l.title)+'</h4><p>'+esc(l.summary||'Abra a aula e explore seu roteiro de estudos.')+'</p><div class="card-bottom"><span class="badge '+(done.has(l.id)?'checkdone':'')+'">'+(done.has(l.id)?'✓ Estudada':'Ver aula')+'</span><span class="arrow">↗</span></div></a>'}

var SUBJECT_AREAS = [{"id":"fundamentos","name":"Fundamentos","icon":"123","tone":"mint","description":"Números, frações, potências, álgebra básica, equações, proporções e porcentagem.","ranges":[["C",1,35]]},{"id":"funcoes","name":"Funções & gráficos","icon":"f(x)","tone":"violet","description":"De conjuntos a logaritmos, com gráficos e aplicações.","ranges":[["A",1,42]]},{"id":"algebra","name":"Álgebra & sequências","icon":"x²","tone":"pink","description":"PA e PG, matrizes, determinantes, sistemas, complexos e polinômios.","ranges":[["A",43,79]]},{"id":"geometria-plana","name":"Geometria plana","icon":"△","tone":"peach","description":"Ângulos, triângulos, áreas e circunferências.","ranges":[["B",1,21]]},{"id":"geometria-espacial","name":"Geometria espacial","icon":"⬡","tone":"sky","description":"Posições no espaço, prismas, cones, pirâmides e esferas.","ranges":[["B",22,40]]},{"id":"geometria-analitica","name":"Geometria analítica","icon":"⌖","tone":"lilac","description":"Coordenadas, retas, circunferências e cônicas.","ranges":[["B",41,59]]},{"id":"combinatoria","name":"Combinatória & probabilidade","icon":"?!","tone":"yellow","description":"Contagem, possibilidades, probabilidades e binômio.","ranges":[["C",36,52]]},{"id":"estatistica","name":"Estatística","icon":"▥","tone":"cream","description":"Gráficos, médias, mediana, desvio e análise de dados.","ranges":[["C",53,60]]},{"id":"trigonometria","name":"Trigonometria","icon":"θ","tone":"lime","description":"Triângulos, ciclo trigonométrico e equações.","ranges":[["C",61,77]]}];
var SUBJECT_TOPIC_ICONS={"A1":"⊂","A2":"f(x)","A3":"↗","A4":"x²","A5":"f⁻¹","A6":"|x|","A7":"2ˣ","A8":"log","A9":"∞","A10":"[ ]","A11":"|A|","A12":"{ }","A13":"i","A14":"P(x)","B1":"∠","B2":"△","B3":"⬡","B4":"◉","B5":"▱","B6":"⊥","B7":"◇","B8":"▭","B9":"△","B10":"◭","B11":"◉","B12":"⬢","B13":"⌖","B14":"╱","B15":"○","B16":"∩","B17":"◎","C1":"123","C2":"½","C3":"√","C4":"(a+b)²","C5":"x=?","C6":"↔","C7":"m³","C8":"%","C9":"R$","C10":"n!","C11":"C(n,p)","C12":"(a+b)ⁿ","C13":"?!","C14":"▥","C15":"x̄","C16":"σ","C17":"◺","C18":"θ","C19":"sin","C20":"∿"};
function subjectContains(area,lesson){var n=Number(lesson.id.slice(1));return area.ranges.some(function(r){return lesson.front===r[0]&&n>=r[1]&&n<=r[2]})}
function areaForLesson(lesson){return SUBJECT_AREAS.find(function(a){return subjectContains(a,lesson)})}
var SUBJECT_TOPICS=[{"id":"f-numeros","area":"fundamentos","title":"Números e operações","description":"Inteiros, sinais, expressões, primos, MMC e MDC.","icon":"123","ranges":[["C",1,4]]},{"id":"f-fracoes","area":"fundamentos","title":"Frações e decimais","description":"Frações, decimais e dízimas periódicas.","icon":"½","ranges":[["C",5,8]]},{"id":"f-potencias","area":"fundamentos","title":"Potências e raízes","description":"Potenciação, notação científica e radiciação.","icon":"√","ranges":[["C",9,12]]},{"id":"f-algebra","area":"fundamentos","title":"Expressões algébricas","description":"Expressões, produtos notáveis, fatoração e frações algébricas.","icon":"(a+b)²","ranges":[["C",13,16]]},{"id":"f-equacoes","area":"fundamentos","title":"Equações e problemas","description":"Equações do 1º e do 2º grau e problemas.","icon":"x=?","ranges":[["C",17,21]]},{"id":"f-proporcoes","area":"fundamentos","title":"Razões e proporções","description":"Razão, proporção, escalas e regra de três.","icon":"↔","ranges":[["C",22,26]]},{"id":"f-medidas","area":"fundamentos","title":"Unidades de medida","description":"Conversões de comprimento, área, volume, tempo e massa.","icon":"m³","ranges":[["C",27,28]]},{"id":"f-porcentagem","area":"fundamentos","title":"Porcentagem","description":"Porcentagem, aumentos, descontos e variações.","icon":"%","ranges":[["C",29,31]]},{"id":"f-financeira","area":"fundamentos","title":"Matemática financeira","description":"Juros simples e compostos, valor presente e amortização.","icon":"R$","ranges":[["C",32,35]]},{"id":"fu-conjuntos","area":"funcoes","title":"Conjuntos","description":"Conjuntos, operações, Venn, números e intervalos.","icon":"⊂","ranges":[["A",1,5]]},{"id":"fu-inicio","area":"funcoes","title":"O que é uma função?","description":"Plano cartesiano, conceito, domínio, imagem e gráficos.","icon":"f(x)","ranges":[["A",6,9]]},{"id":"fu-afim","area":"funcoes","title":"Função do 1º grau","description":"Retas, sinal, inequações e modelos.","icon":"↗","ranges":[["A",10,15]]},{"id":"fu-quadratica","area":"funcoes","title":"Função quadrática","description":"Raízes, vértice, gráficos, otimização e inequações.","icon":"x²","ranges":[["A",16,23]]},{"id":"fu-propriedades","area":"funcoes","title":"Tipos de função","description":"Par e ímpar, injetora, composta e inversa.","icon":"f⁻¹","ranges":[["A",24,27]]},{"id":"fu-modulo","area":"funcoes","title":"Função modular","description":"Módulo, gráficos, equações e inequações.","icon":"|x|","ranges":[["A",28,32]]},{"id":"fu-exponencial","area":"funcoes","title":"Função exponencial","description":"Crescimento, equações e inequações.","icon":"2ˣ","ranges":[["A",33,35]]},{"id":"fu-logs","area":"funcoes","title":"Logaritmos","description":"Propriedades, função, equações e aplicações.","icon":"log","ranges":[["A",36,42]]},{"id":"al-sequencias","area":"algebra","title":"Sequências, PA e PG","description":"Padrões, PA, PG e somas.","icon":"∞","ranges":[["A",43,51]]},{"id":"al-matrizes","area":"algebra","title":"Matrizes","description":"Tipos, operações, produto e inversa.","icon":"[ ]","ranges":[["A",52,55]]},{"id":"al-determinantes","area":"algebra","title":"Determinantes","description":"Sarrus, propriedades, Laplace e Binet.","icon":"|A|","ranges":[["A",56,59]]},{"id":"al-sistemas","area":"algebra","title":"Sistemas lineares","description":"Do 2×2 ao escalonamento e à discussão.","icon":"{ }","ranges":[["A",60,64]]},{"id":"al-complexos","area":"algebra","title":"Números complexos","description":"Forma algébrica, potências de i e forma trigonométrica.","icon":"i","ranges":[["A",65,70]]},{"id":"al-polinomios","area":"algebra","title":"Polinômios","description":"Operações, divisão, raízes e Girard.","icon":"P(x)","ranges":[["A",71,79]]},{"id":"gp-angulos","area":"geometria-plana","title":"Ângulos","description":"Ângulos e retas paralelas.","icon":"∠","ranges":[["B",1,2]]},{"id":"gp-triangulos","area":"geometria-plana","title":"Triângulos","description":"Congruência, Tales, semelhança e Pitágoras.","icon":"△","ranges":[["B",3,9]]},{"id":"gp-poligonos","area":"geometria-plana","title":"Polígonos","description":"Ângulos, diagonais, quadriláteros e apótemas.","icon":"⬡","ranges":[["B",10,12]]},{"id":"gp-circulo","area":"geometria-plana","title":"Circunferência","description":"Tangentes, ângulos, potência de ponto e comprimento.","icon":"◉","ranges":[["B",13,16]]},{"id":"gp-areas","area":"geometria-plana","title":"Áreas","description":"Quadriláteros, triângulos, círculos e figuras compostas.","icon":"▱","ranges":[["B",17,21]]},{"id":"ge-posicao","area":"geometria-espacial","title":"Posições no espaço","description":"Retas, planos e projeções ortogonais.","icon":"⊥","ranges":[["B",22,23]]},{"id":"ge-poliedros","area":"geometria-espacial","title":"Poliedros","description":"Relação de Euler, planificações e vistas.","icon":"◇","ranges":[["B",24,25]]},{"id":"ge-prismas","area":"geometria-espacial","title":"Prismas","description":"Áreas, volumes, cubo e paralelepípedo.","icon":"▭","ranges":[["B",26,27]]},{"id":"ge-piramides","area":"geometria-espacial","title":"Pirâmides","description":"Áreas, volume e tronco.","icon":"△","ranges":[["B",28,30]]},{"id":"ge-cilindro-cone","area":"geometria-espacial","title":"Cilindros e cones","description":"Cilindro, cone e tronco de cone.","icon":"◭","ranges":[["B",31,34]]},{"id":"ge-esfera","area":"geometria-espacial","title":"Esferas","description":"Área, volume, fuso, cunha e calota.","icon":"◉","ranges":[["B",35,36]]},{"id":"ge-relacoes","area":"geometria-espacial","title":"Sólidos combinados","description":"Inscrição, revolução e semelhança.","icon":"⬢","ranges":[["B",37,40]]},{"id":"ga-ponto","area":"geometria-analitica","title":"O ponto","description":"Distância, ponto médio, baricentro e área.","icon":"⌖","ranges":[["B",41,43]]},{"id":"ga-retas","area":"geometria-analitica","title":"A reta","description":"Equações, posições, ângulos, distâncias e regiões.","icon":"╱","ranges":[["B",44,50]]},{"id":"ga-circunferencia","area":"geometria-analitica","title":"Circunferência no plano","description":"Equações e posições relativas.","icon":"○","ranges":[["B",51,53]]},{"id":"ga-conicas","area":"geometria-analitica","title":"Cônicas","description":"Elipse, hipérbole e parábola.","icon":"∩","ranges":[["B",54,57]]},{"id":"ga-espaco","area":"geometria-analitica","title":"Espaço e lugares geométricos","description":"Coordenadas no espaço e lugares geométricos.","icon":"◎","ranges":[["B",58,59]]},{"id":"cp-contagem","area":"combinatoria","title":"Contagem e permutações","description":"PFC, fatorial, permutações e arranjos.","icon":"n!","ranges":[["C",36,40]]},{"id":"cp-combinacoes","area":"combinatoria","title":"Combinações","description":"Combinações, restrições e gavetas.","icon":"C(n,p)","ranges":[["C",41,44]]},{"id":"cp-binomio","area":"combinatoria","title":"Binômio de Newton","description":"Números binomiais, Pascal e binômio de Newton.","icon":"(a+b)ⁿ","ranges":[["C",45,46]]},{"id":"cp-probabilidade","area":"combinatoria","title":"Probabilidade","description":"Eventos, condicional, binomial e Bayes.","icon":"?!","ranges":[["C",47,52]]},{"id":"es-dados","area":"estatistica","title":"Leitura de dados","description":"Tabelas, gráficos e frequências.","icon":"▥","ranges":[["C",53,54]]},{"id":"es-centrais","area":"estatistica","title":"Medidas de tendência central","description":"Média, mediana e moda.","icon":"x̄","ranges":[["C",55,57]]},{"id":"es-dispersao","area":"estatistica","title":"Dispersão e análise","description":"Desvio padrão, variação e correlação.","icon":"σ","ranges":[["C",58,60]]},{"id":"tr-triangulos","area":"trigonometria","title":"Trigonometria nos triângulos","description":"Triângulo retângulo, leis dos senos e cossenos.","icon":"◺","ranges":[["C",61,64]]},{"id":"tr-ciclo","area":"trigonometria","title":"Ciclo trigonométrico","description":"Radianos, ciclo, quadrantes e identidades.","icon":"θ","ranges":[["C",65,70]]},{"id":"tr-identidades","area":"trigonometria","title":"Fórmulas trigonométricas","description":"Adição, arco duplo e transformações.","icon":"sin","ranges":[["C",71,73]]},{"id":"tr-funcoes","area":"trigonometria","title":"Funções e equações","description":"Gráficos, período, equações e inequações.","icon":"∿","ranges":[["C",74,77]]}];
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

/* ================= Busca v2: entende sinônimos, erros de digitação e leva direto à aula ================= */
/* Outros nomes que os alunos usam. Aliases do assunto valem para todas as aulas dele; os da aula decidem qual aula abrir. */
var BUSCA_ASSUNTO={
 'fu-conjuntos':'conjuntos;teoria dos conjuntos;uniao;intersecao;interseccao;diagrama de venn;venn;conjuntos numericos;intervalos;numeros reais;numeros irracionais',
 'fu-inicio':'funcao;funcoes;dominio;imagem;contradominio;produto cartesiano;relacao;analise de graficos',
 'fu-afim':'funcao afim;funcao linear;funcao do primeiro grau;reta;coeficiente angular;coeficiente linear;inequacao do primeiro grau;estudo do sinal',
 'fu-quadratica':'funcao quadratica;funcao do segundo grau;parabola;bhaskara;baskara;delta;discriminante;raizes;vertice;maximo;minimo;soma e produto;inequacao do segundo grau',
 'fu-propriedades':'funcao par;funcao impar;injetora;sobrejetora;bijetora;funcao composta;funcao inversa;inversa',
 'fu-modulo':'modulo;valor absoluto;funcao modular;equacao modular;inequacao modular',
 'fu-exponencial':'exponencial;funcao exponencial;equacao exponencial;inequacao exponencial;crescimento exponencial',
 'fu-logs':'logaritmo;logaritmos;log;ln;funcao logaritmica;equacao logaritmica;inequacao logaritmica;mudanca de base;propriedades dos logaritmos',
 'al-sequencias':'sequencia;sequencias;progressao;progressoes;pa;progressao aritmetica;pg;progressao geometrica;termo geral;recorrencia;fibonacci',
 'al-matrizes':'matriz;matrizes;matriz inversa;matriz transposta;multiplicacao de matrizes;matriz identidade',
 'al-determinantes':'determinante;determinantes;sarrus;laplace;chio;binet;cofator',
 'al-sistemas':'sistema 2x2;sistema de equacoes;sistema linear;sistemas lineares;escalonamento;cramer;discussao de sistemas;spd;spi',
 'al-complexos':'numeros complexos;complexo;complexos;imaginario;unidade imaginaria;argand gauss;forma trigonometrica;moivre',
 'al-polinomios':'polinomio;polinomios;divisao de polinomios;briot ruffini;teorema do resto;dalembert;equacao polinomial;equacao algebrica;girard',
 'gp-angulos':'angulo;angulos;complementares;suplementares;opostos pelo vertice;retas paralelas;transversal;alternos;colaterais',
 'gp-triangulos':'triangulo;triangulos;congruencia;semelhanca;semelhanca de triangulos;pitagoras;teorema de pitagoras;tales;teorema de tales;relacoes metricas;baricentro;incentro;ortocentro;circuncentro',
 'gp-poligonos':'poligono;poligonos;diagonais;quadrilateros;trapezio;losango;paralelogramo;hexagono;apotema',
 'gp-circulo':'circunferencia;circulo;tangente;angulo inscrito;angulo central;potencia de ponto;comprimento da circunferencia;pi',
 'gp-areas':'area;areas;area do triangulo;area do circulo;area do trapezio;area do quadrado;area do retangulo;setor circular;coroa circular;heron',
 'ge-posicao':'geometria de posicao;retas reversas;planos;projecao ortogonal',
 'ge-poliedros':'poliedro;poliedros;euler;relacao de euler;planificacao;vistas;vista frontal;vista superior',
 'ge-prismas':'prisma;prismas;cubo;paralelepipedo;volume do prisma;cavalieri',
 'ge-piramides':'piramide;piramides;tronco de piramide;volume da piramide',
 'ge-cilindro-cone':'cilindro;cone;tronco de cone;volume do cilindro;volume do cone;geratriz',
 'ge-esfera':'esfera;volume da esfera;area da esfera;calota;fuso;cunha',
 'ge-relacoes':'inscricao;circunscricao;solidos de revolucao;semelhanca de solidos',
 'ga-ponto':'geometria analitica;plano cartesiano;distancia entre pontos;ponto medio;baricentro;alinhamento;area do triangulo',
 'ga-retas':'equacao da reta;coeficiente angular;retas paralelas;retas perpendiculares;angulo entre retas;distancia de ponto a reta;mediatriz;inequacoes no plano',
 'ga-circunferencia':'equacao da circunferencia;centro e raio;posicao relativa;reta tangente',
 'ga-conicas':'conicas;conica;elipse;hiperbole;parabola;focos;excentricidade',
 'ga-espaco':'lugar geometrico;geometria analitica no espaco;coordenadas no espaco',
 'f-numeros':'numeros inteiros;numeros naturais;regra de sinais;jogo de sinais;expressoes numericas;ordem das operacoes;numeros primos;divisibilidade;mmc;mdc;minimo multiplo comum;maximo divisor comum',
 'f-fracoes':'fracao;fracoes;numeros decimais;decimal;dizima periodica;dizimas;fracao geratriz',
 'f-potencias':'potencia;potencias;potenciacao;expoente;radiciacao;raiz;raiz quadrada;radicais;racionalizacao;notacao cientifica;ordem de grandeza',
 'f-algebra':'expressoes algebricas;valor numerico;monomio;produtos notaveis;fatoracao;fatorar;diferenca de quadrados;trinomio quadrado perfeito;fracoes algebricas;algebra',
 'f-equacoes':'equacao;equacoes;equacao do primeiro grau;equacao do segundo grau;problemas com equacoes;biquadrada;equacao irracional',
 'f-proporcoes':'razao;proporcao;escala;regra de tres;regra de 3;grandezas proporcionais;diretamente proporcional;inversamente proporcional;velocidade media;densidade',
 'f-medidas':'unidades de medida;conversao de unidades;litro;metro cubico;capacidade;horas e minutos;km/h;m/s',
 'f-porcentagem':'porcentagem;percentual;aumento;desconto;aumentos sucessivos;descontos sucessivos;variacao percentual;inflacao;lucro',
 'f-financeira':'juros;juros simples;juros compostos;matematica financeira;financeira;valor presente;amortizacao;sac;price',
 'cp-contagem':'contagem;principio fundamental da contagem;pfc;fatorial;arranjo;arranjos;permutacao;permutacoes;anagrama;anagramas;analise combinatoria;combinatoria',
 'cp-combinacoes':'combinacao;combinacoes;combinacao completa;principio das gavetas;analise combinatoria;combinatoria',
 'cp-binomio':'binomio de newton;triangulo de pascal;numeros binomiais;termo geral do binomio',
 'cp-probabilidade':'probabilidade;probabilidades;chance;evento;espaco amostral;probabilidade condicional;bayes;binomial',
 'es-dados':'estatistica;graficos;tabelas;frequencia;histograma;grafico de setores',
 'es-centrais':'media;mediana;moda;media ponderada;boxplot;quartis',
 'es-dispersao':'desvio padrao;variancia;dispersao;coeficiente de variacao;amostra;populacao;correlacao',
 'tr-triangulos':'trigonometria;seno;cosseno;tangente;triangulo retangulo;angulos notaveis;lei dos senos;lei dos cossenos',
 'tr-ciclo':'trigonometria;ciclo trigonometrico;circulo trigonometrico;radiano;radianos;arcos;quadrantes;relacao fundamental',
 'tr-identidades':'trigonometria;arco duplo;adicao de arcos;soma de arcos;identidades trigonometricas;prostaferese',
 'tr-funcoes':'trigonometria;funcao seno;funcao cosseno;graficos trigonometricos;periodo;equacao trigonometrica;inequacao trigonometrica'
};
var BUSCA_AULA={
 A01:'teoria dos conjuntos;conjuntos;pertinencia;inclusao;subconjunto',A02:'uniao;intersecao;diferenca de conjuntos;complementar;operacoes com conjuntos',A03:'diagrama de venn;venn;problemas com conjuntos;pesquisa',A04:'conjuntos numericos;numeros reais;numeros irracionais',A05:'intervalos;intervalos reais',A06:'produto cartesiano;plano cartesiano;relacao',A07:'funcao;definicao de funcao;conceito de funcao',A08:'dominio;imagem;contradominio;dominio de funcao',A09:'grafico de funcao;analise de graficos;leitura de graficos;crescente;decrescente',A10:'funcao afim;funcao linear;funcao do primeiro grau',A11:'grafico da funcao afim;coeficiente angular;coeficiente linear;grafico da reta',A12:'zero da funcao;estudo do sinal;raiz da funcao afim',A13:'inequacao do primeiro grau;inequacao simultanea',A14:'inequacao produto;inequacao quociente;quadro de sinais',A15:'modelagem;funcao custo;funcao lucro',A16:'funcao quadratica;funcao do segundo grau;parabola;concavidade',A17:'bhaskara;baskara;bascara;formula de bhaskara;formula resolutiva;delta;discriminante;soma e produto;raizes da equacao',A18:'vertice;vertice da parabola;xv;yv',A19:'grafico da parabola;sinal dos coeficientes;coeficientes da parabola',A20:'maximo e minimo;otimizacao;valor maximo;valor minimo',A21:'estudo do sinal da quadratica;sinal da parabola',A22:'inequacao do segundo grau;inequacao quadratica',A23:'forma canonica;forma fatorada',A24:'funcao par;funcao impar;par e impar;paridade;simetria',A25:'injetora;sobrejetora;bijetora;funcao injetora;funcao sobrejetora;funcao bijetora',A26:'funcao composta;composicao de funcoes;fog;gof',A27:'funcao inversa;inversa;f inversa',A28:'modulo;valor absoluto;modulo de um numero',A29:'funcao modular;grafico do modulo',A30:'equacao modular',A31:'inequacao modular',A32:'grafico com modulo;modulo de funcao',A33:'funcao exponencial;exponencial',A34:'equacao exponencial',A35:'inequacao exponencial',A36:'logaritmo;log;definicao de logaritmo',A37:'propriedades dos logaritmos;propriedades do log',A38:'mudanca de base',A39:'funcao logaritmica;grafico do log',A40:'equacao logaritmica',A41:'inequacao logaritmica',A42:'ph;richter;decibel;aplicacoes do logaritmo',A43:'sequencia;lei de recorrencia;fibonacci',A44:'pa;progressao aritmetica;termo geral da pa',A45:'interpolacao aritmetica;propriedades da pa;media aritmetica',A46:'soma da pa;soma dos termos da pa;gauss',A47:'pg;progressao geometrica;termo geral da pg',A48:'interpolacao geometrica;propriedades da pg;media geometrica',A49:'soma da pg;produto da pg',A50:'pg infinita;soma infinita;serie',A51:'problemas com pa e pg',A52:'matriz;matrizes;tipos de matrizes;matriz identidade',A53:'soma de matrizes;matriz transposta;transposta',A54:'multiplicacao de matrizes;produto de matrizes',A55:'matriz inversa',A56:'determinante;sarrus;regra de sarrus',A57:'propriedades dos determinantes',A58:'laplace;teorema de laplace;cofator;chio',A59:'binet;teorema de binet;determinante da inversa',A60:'sistema 2x2;sistema de equacoes;metodo da substituicao;metodo da adicao',A61:'sistema linear;sistemas lineares;spd;spi;classificacao de sistemas',A62:'cramer;regra de cramer',A63:'escalonamento;metodo de gauss',A64:'discussao de sistemas;sistema com parametro',A65:'numeros complexos;unidade imaginaria;forma algebrica',A66:'operacoes com complexos;conjugado;divisao de complexos',A67:'potencias de i',A68:'argand gauss;modulo do complexo',A69:'forma trigonometrica;forma polar',A70:'moivre',A71:'polinomio;polinomios;grau do polinomio;valor numerico',A72:'operacoes com polinomios;multiplicacao de polinomios',A73:'divisao de polinomios;metodo da chave',A74:'briot ruffini;briot',A75:'teorema do resto;dalembert',A76:'equacao polinomial;teorema fundamental da algebra',A77:'multiplicidade;raiz dupla;raiz tripla',A78:'relacoes de girard;girard',A79:'raizes complexas;raizes racionais',B01:'angulos;angulo agudo;angulo obtuso;complementares;suplementares',B02:'retas paralelas;transversal;alternos internos;colaterais',B03:'triangulos;soma dos angulos do triangulo',B04:'baricentro;incentro;circuncentro;ortocentro;pontos notaveis',B05:'congruencia;congruencia de triangulos',B06:'tales;teorema de tales;bissetriz interna',B07:'semelhanca;semelhanca de triangulos',B08:'pitagoras;teorema de pitagoras',B09:'relacoes metricas;triangulo retangulo;projecoes',B10:'poligonos;diagonais;soma dos angulos internos',B11:'quadrilateros;trapezio;losango;paralelogramo',B12:'poligonos regulares;apotema;hexagono',B13:'circunferencia;tangente a circunferencia;corda;diametro',B14:'angulo inscrito;angulo central;arco capaz',B15:'potencia de ponto;secante;tangente a circunferencia',B16:'comprimento da circunferencia;pi',B17:'area;area do quadrado;area do retangulo;area do trapezio;area do losango;area do paralelogramo',B18:'area do triangulo;heron;formula de heron',B19:'area do circulo;setor circular;coroa circular',B20:'razao entre areas',B21:'area de figuras compostas;regiao sombreada',B22:'geometria espacial;retas reversas;posicoes relativas',B23:'projecao ortogonal',B24:'poliedros;euler;relacao de euler',B25:'planificacao;vistas;vista frontal;vista superior',B26:'prisma;prismas;area do prisma',B27:'volume do prisma;paralelepipedo;cubo;cavalieri',B28:'piramide;area da piramide',B29:'volume da piramide',B30:'tronco de piramide',B31:'cilindro;volume do cilindro',B32:'cone;area do cone;geratriz',B33:'volume do cone',B34:'tronco de cone;planificacao',B35:'area da esfera;superficie esferica',B36:'volume da esfera;calota;cunha',B37:'esfera inscrita;esfera circunscrita',B38:'cilindro inscrito;cone inscrito',B39:'solidos de revolucao',B40:'semelhanca de solidos',B41:'distancia entre dois pontos;plano cartesiano',B42:'ponto medio;baricentro',B43:'alinhamento de tres pontos;area do triangulo analitica',B44:'coeficiente angular;equacao da reta',B45:'equacao geral da reta;equacao reduzida da reta;equacao segmentaria',B46:'retas paralelas;posicao relativa entre retas;intersecao de retas',B47:'retas perpendiculares;mediatriz',B48:'angulo entre retas',B49:'distancia de ponto a reta',B50:'inequacoes no plano;semiplano;programacao linear',B51:'equacao da circunferencia;circunferencia',B52:'posicao relativa;reta e circunferencia',B53:'reta tangente;circunferencias tangentes',B54:'elipse',B55:'hiperbole',B56:'parabola foco e diretriz',B57:'reconhecimento de conicas',B58:'geometria analitica no espaco',B59:'lugar geometrico',C01:'numeros inteiros;regra de sinais;jogo de sinais',C02:'expressoes numericas;ordem das operacoes',C03:'numeros primos;divisibilidade;criterios de divisibilidade',C04:'mmc;mdc;minimo multiplo comum;maximo divisor comum',C05:'fracao;fracoes;fracoes equivalentes;simplificar fracao',C06:'operacoes com fracoes;soma de fracoes;divisao de fracoes',C07:'numeros decimais;decimal',C08:'dizima periodica;fracao geratriz',C09:'potencia;potenciacao;propriedades das potencias',C10:'notacao cientifica;ordem de grandeza',C11:'raiz;radiciacao;raiz quadrada;simplificar radicais',C12:'racionalizacao;racionalizar',C13:'expressoes algebricas;valor numerico;monomio',C14:'produtos notaveis;quadrado da soma;quadrado da diferenca;produto da soma pela diferenca;cubo da soma',C15:'fatoracao;fatorar;fator comum;agrupamento;diferenca de quadrados;trinomio quadrado perfeito',C16:'fracoes algebricas;simplificar fracao algebrica',C17:'equacao do primeiro grau;equacao de primeiro grau;equacoes do primeiro grau;resolver equacao',C18:'problemas do primeiro grau;problemas de idade;problemas com equacoes',C19:'equacao do segundo grau;equacao de segundo grau;equacoes do segundo grau;completar quadrados;equacao incompleta',C20:'soma e produto das raizes;biquadrada;equacao biquadrada;equacao irracional',C21:'problemas do segundo grau',C22:'razao;proporcao',C23:'escala;velocidade media;densidade demografica',C24:'grandezas proporcionais;diretamente proporcional;inversamente proporcional',C25:'regra de tres;regra de 3;regra de tres simples',C26:'regra de tres composta',C27:'unidades de medida;conversao de unidades;litro;metro cubico',C28:'horas e minutos;km/h para m/s;vazao',C29:'porcentagem;percentual',C30:'aumento;desconto;fator multiplicativo',C31:'aumentos e descontos sucessivos;inflacao acumulada;lucro sobre o custo;lucro sobre a venda',C32:'juros simples',C33:'juros compostos',C34:'valor presente;equivalencia de capitais;a vista ou a prazo',C35:'amortizacao;sac;price;financiamento',C36:'pfc;principio fundamental da contagem;principio multiplicativo',C37:'fatorial;permutacao;permutacao simples;anagrama',C38:'permutacao com repeticao;anagramas com repeticao',C39:'permutacao circular;mesa redonda',C40:'arranjo;arranjos;arranjo simples',C41:'combinacao;combinacao simples',C42:'combinacao com restricao;pelo menos;metodo destrutivo',C43:'combinacao completa;combinacao com repeticao',C44:'principio das gavetas;casa dos pombos',C45:'numeros binomiais;triangulo de pascal',C46:'binomio de newton;termo geral do binomio',C47:'probabilidade',C48:'probabilidade da uniao',C49:'probabilidade condicional',C50:'eventos independentes',C51:'distribuicao binomial',C52:'bayes;probabilidade total',C53:'graficos;tabelas;grafico de setores',C54:'frequencia;distribuicao de frequencias;histograma',C55:'media;media aritmetica;media ponderada',C56:'mediana;moda',C57:'media mediana e moda;boxplot;quartis',C58:'desvio padrao;variancia',C59:'coeficiente de variacao',C60:'amostra;correlacao',C61:'seno;cosseno;tangente;triangulo retangulo;razoes trigonometricas',C62:'angulos notaveis;angulo de elevacao',C63:'lei dos senos',C64:'lei dos cossenos',C65:'radiano;radianos;arcos',C66:'ciclo trigonometrico;circulo trigonometrico;arcos congruos',C67:'seno e cosseno;quadrantes;sinais',C68:'reducao ao primeiro quadrante',C69:'tangente;secante;cossecante;cotangente',C70:'relacao fundamental;identidades trigonometricas',C71:'soma de arcos;adicao de arcos',C72:'arco duplo',C73:'prostaferese',C74:'funcao seno;funcao cosseno;grafico do seno',C75:'periodo;amplitude;fenomenos periodicos',C76:'equacao trigonometrica',C77:'inequacao trigonometrica'
};
var BUSCA_STOP=new Set('de da do das dos e a o as os um uma uns umas para pra pro com em no na nos nas por pelo pela sobre como que qual quais aula aulas materia conteudo conteudos assunto assuntos estudar quero aprender'.split(' '));
var BUSCA_INTENT={lista:'levar',pdf:'levar',gabarito:'levar',apostila:'levar',material:'levar',baixar:'levar',download:'levar',imprimir:'levar',video:'levar',videoaula:'levar',
 exercicio:'pratique',questao:'pratique',treino:'pratique',treinar:'pratique',praticar:'pratique',fixacao:'pratique',
 prova:'prova',simulado:'prova',vestibular:'prova',enem:'prova',
 teoria:'entenda',resumo:'entenda',explicacao:'entenda',conceito:'entenda'};
var BUSCA_POPULARES=['Função afim','Bhaskara','Função modular','Logaritmo','Porcentagem','P.A. e P.G.','Trigonometria','Probabilidade'];
var bIndex=null;
function bNorm(s){
 s=String(s||'').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'');
 s=s.replace(/\bp\s*\.\s*([ag])\b\.?/g,'p$1');
 s=s.replace(/\b(1|primeiro)\s*o?\s*grau\b/g,'primeirograu').replace(/\b(2|segundo)\s*o?\s*grau\b/g,'segundograu');
 return s.replace(/[^a-z0-9]+/g,' ').trim();
}
function bStem(t){
 if(t.length<=3)return t;
 if(/oes$/.test(t))return t.slice(0,-3)+'ao';
 if(/aes$/.test(t))return t.slice(0,-3)+'ao';
 if(/ais$/.test(t))return t.slice(0,-3)+'al';
 if(/eis$/.test(t))return t.slice(0,-3)+'el';
 if(/zes$/.test(t))return t.slice(0,-2);
 if(t.length>4&&/ns$/.test(t))return t.slice(0,-2)+'m';
 if(t.length>5&&/res$/.test(t))return t.slice(0,-2);
 if(/[^s]s$/.test(t))return t.slice(0,-1);
 return t;
}
function bToks(s){return bNorm(s).split(' ').filter(function(t){return t&&!BUSCA_STOP.has(t)}).map(bStem)}
function bPhrase(s){return bToks(s).join(' ')}
function bLev(a,b,max){
 // distância de edição com transposição (troca de duas letras vizinhas conta como um erro)
 if(Math.abs(a.length-b.length)>max)return max+1;
 var pp=null,prev=[],cur,i,j;for(j=0;j<=b.length;j++)prev[j]=j;
 for(i=1;i<=a.length;i++){
  cur=[i];var low=i;
  for(j=1;j<=b.length;j++){
   var c=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
   if(pp&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])c=Math.min(c,pp[j-2]+1);
   cur[j]=c;if(c<low)low=c;
  }
  if(low>max)return max+1;pp=prev;prev=cur;
 }
 return prev[b.length];
}
function bTok(q,d,last,known){
 if(q===d)return 1;
 if(d.indexOf(q)===0&&(q.length>=3||(last&&q.length>=2)))return .82;
 if(!known&&q.length>=4&&d.length>=4){var max=q.length>=7?2:1;if(bLev(q,d,max)<=max)return .72}
 return 0;
}
function bBuild(){
 if(bIndex)return bIndex;
 var lessons=[],topics=[],areas=[];
 function split(s){return String(s||'').split(';').filter(Boolean)}
 data.lessons.forEach(function(l,k){
  var a=areaForLesson(l),t=topicInfo(subjectTopic(l,a)),tAl=split(BUSCA_ASSUNTO[t.id]),lAl=split(BUSCA_AULA[l.id]);
  lessons.push({kind:'aula',l:l,area:a,topic:t,order:k,
   fields:[{w:6,t:bToks(lAl.join(' '))},{w:5,t:bToks(l.title)},{w:3,t:bToks(t.title+' '+tAl.join(' '))},{w:1.5,t:bToks(l.summary)},{w:1,t:bToks(a.name)}],
   aliases:lAl.map(bPhrase),topicAliases:[bPhrase(t.title)].concat(tAl.map(bPhrase)),title:bPhrase(l.title),topicTitle:bPhrase(t.title)});
 });
 SUBJECT_TOPICS.forEach(function(t,k){
  var a=SUBJECT_AREAS.find(function(x){return x.id===t.area}),al=split(BUSCA_ASSUNTO[t.id]);
  topics.push({kind:'assunto',t:t,area:a,order:k,fields:[{w:5,t:bToks(t.title)},{w:4,t:bToks(al.join(' '))},{w:1.5,t:bToks(t.description)},{w:1,t:bToks(a.name)}],aliases:[bPhrase(t.title)].concat(al.map(bPhrase)),title:bPhrase(t.title)});
 });
 SUBJECT_AREAS.forEach(function(a,k){areas.push({kind:'area',a:a,order:k,fields:[{w:5,t:bToks(a.name)},{w:1.5,t:bToks(a.description)}],aliases:[bPhrase(a.name)],title:bPhrase(a.name)})});
 var vocab=new Map();
 lessons.concat(topics,areas).forEach(function(d){d.fields.forEach(function(f){f.t.forEach(function(t){vocab.set(t,(vocab.get(t)||0)+f.w)})})});
 bIndex={lessons:lessons,topics:topics,areas:areas,vocab:vocab};
 return bIndex;
}
function bQuery(q){
 var n=bNorm(q),words=n.split(' ').filter(Boolean),toks=[],soft=[],intent=null;
 words.forEach(function(w){var s=bStem(w);if(BUSCA_INTENT[s]){intent=intent||BUSCA_INTENT[s];soft.push(s);return}if(BUSCA_STOP.has(w))return;toks.push(s)});
 var V=bBuild().vocab,fixed=[];
 toks=toks.map(function(t,i){
  if(V.has(t)||/^\d+$/.test(t)||t.length<4)return t;
  var last=i===toks.length-1,pre=false;V.forEach(function(c,v){if(!pre&&last&&v.indexOf(t)===0)pre=true});if(pre)return t;
  var max=t.length>=7?2:1,best=null,bd=9,bc=0;
  V.forEach(function(c,v){if(Math.abs(v.length-t.length)>max)return;var d=bLev(t,v,max);if(d<=max&&(d<bd||(d===bd&&c>bc))){best=v;bd=d;bc=c}});
  if(best){fixed.push(best);return best}return t;
 });
 var code=null,m=n.replace(/\s+/g,'').match(/^([abc])0?(\d{1,2})$/);
 if(m){var id=m[1].toUpperCase()+('0'+m[2]).slice(-2);if(data.lessons.some(function(l){return l.id===id}))code=id}
 return {raw:q,n:n,toks:toks,soft:soft,intent:intent,phrase:toks.join(' '),code:code,fixed:fixed.length?toks.join(' '):null};
}
function bScore(doc,Q){
 if(!Q.toks.length)return 0;
 var total=0,miss=0;
 Q.toks.forEach(function(q,i){
  var last=i===Q.toks.length-1,best=0,known=bIndex.vocab.has(q);
  doc.fields.forEach(function(f){for(var j=0;j<f.t.length;j++){var m=bTok(q,f.t[j],last,known);if(m*f.w>best)best=m*f.w;if(m===1)break}});
  if(!best)miss++;total+=best;
 });
 if(miss===Q.toks.length)return 0;
 if(miss)total*=.3;
 Q.soft.forEach(function(s){if(doc.fields[1]&&doc.fields[1].t.indexOf(s)>=0)total+=1.5});
 var p=Q.phrase;
 if(p.length>=2){
  var al=doc.aliases||[];
  if(al.indexOf(p)>=0)total+=20;
  else if(p.length>=3&&al.some(function(x){return x.indexOf(p)===0}))total+=6;
  if(doc.title===p)total+=12;else if(p.length>=3&&(' '+doc.title+' ').indexOf(' '+p)>=0)total+=8;
  if(doc.topicAliases){
   if(doc.topicAliases.indexOf(p)>=0)total+=12;
   else if(p.length>=3&&(' '+doc.topicTitle+' ').indexOf(' '+p)>=0)total+=4;
  }
 }
 return total;
}
function bSearch(q){
 var I=bBuild(),Q=bQuery(q);
 function rank(list){return list.map(function(d){return {d:d,s:bScore(d,Q)}}).filter(function(x){return x.s>=2.4}).sort(function(a,b){return b.s-a.s||a.d.order-b.d.order})}
 var lessons=rank(I.lessons),topics=rank(I.topics),areas=rank(I.areas);
 // dentro de um assunto que combinou por inteiro, a ordem das aulas desempata
 if(Q.code){var cl=I.lessons.find(function(d){return d.l.id===Q.code});lessons=[{d:cl,s:999}].concat(lessons.filter(function(x){return x.d!==cl}))}
 var best=null;
 if(lessons.length)best={kind:'aula',d:lessons[0].d,s:lessons[0].s};
 if(!Q.code&&areas.length&&areas[0].d.aliases.indexOf(Q.phrase)>=0)best={kind:'area',d:areas[0].d,s:areas[0].s};
 else if(!Q.code&&Q.phrase.length>=3){
  var amb=I.areas.filter(function(d){return d.title.indexOf(Q.phrase)===0});
  if(amb.length>1&&!(lessons.length&&lessons[0].d.aliases.indexOf(Q.phrase)>=0))best={kind:'areas',list:amb,s:0};
 }
 var confident=!!best&&(Q.code||best.kind!=='aula'||best.s>=14||(lessons[1]?best.s>=lessons[1].s*1.25:best.s>=6));
 return {Q:Q,best:best,confident:confident,lessons:lessons,topics:topics,areas:areas,listas:!Q.toks.length&&!Q.code&&Q.intent==='levar'};
}
function bSuggest(q){
 // nenhuma aula: oferece os assuntos mais próximos com tolerância maior
 var Q=bQuery(q),I=bBuild(),out=[];
 if(!Q.toks.length)return out;
 I.topics.concat(I.lessons).forEach(function(d){
  var s=0;Q.toks.forEach(function(q){d.fields.forEach(function(f){f.t.forEach(function(t){if(q.length>=4&&t.length>=4&&bLev(q,t,3)<=3)s+=f.w})})});
  if(s)out.push({d:d,s:s});
 });
 return out.sort(function(a,b){return b.s-a.s}).slice(0,4).map(function(x){return x.d});
}
function bMark(text,Q){
 return String(text||'').split(/(\s+)/).map(function(w){
  if(!w.trim())return w;var nw=bStem(bNorm(w).replace(/\s+/g,''));
  return nw&&Q.toks.some(function(q){return bTok(q,nw,true)>=.82})?'<mark>'+esc(w)+'</mark>':esc(w);
 }).join('');
}
function bLessonHref(l,intent){return href(l)+(intent&&trHasLists(l.id)?'#'+intent:intent==='entenda'?'#entenda':'')}
function bListFiles(id){var fs=[];materialsAt('aula',id).forEach(function(x){(x.item.arquivos||[]).forEach(function(f){if(/^\/(?!\/)/.test(String(f.url||'')))fs.push(f)})});return fs}

function hvContinue(){
 var id=null;try{id=localStorage.getItem('matmat-ultima-aula')}catch(e){}
 var l=id&&data.lessons.find(function(x){return x.id===id});if(!l)return '';
 return '<a class="hv-continue" href="'+href(l)+'"><span class="hv-continue-k">Continuar de onde parou</span><span class="aula-id">'+esc(l.id)+'</span><span class="hv-continue-t">'+esc(l.title)+'</span></a>';
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
 '<main class="home-v2">'+
 '<section class="hv-hero" aria-labelledby="hero-title"><div class="shell"><div class="home-hero-copy">'+
 '<h1 id="hero-title">O que você quer <em>estudar hoje?</em></h1>'+
 '<p>Listas de Exercícios e Teoria grátis. Simples assim</p>'+
 '<div class="home-search-section"><label class="home-searchbox" for="hero-search"><span class="home-search-mark" aria-hidden="true">⌕</span><input type="search" id="hero-search" autocomplete="off" aria-label="Pesquisar aulas, assuntos e PDFs" aria-controls="quick-hits" aria-expanded="false" placeholder="Busque um assunto, aula ou PDF…"><button type="button" id="clear-search" aria-label="Limpar busca" hidden>×</button><button type="button" id="btn-search" aria-label="Pesquisar">Buscar ↗</button></label>'+
 '<div class="home-quick-hits" id="quick-hits" hidden aria-live="polite"></div>'+
 '</div>'+hvContinue()+
 '</div></div></section>'+
 '<div class="shell">'+
 '<section class="home-search-results" id="resultados" hidden aria-live="polite"><div class="home-results-head"><div><span class="home-section-label">SUA PESQUISA</span><h2 id="search-title">Resultados</h2></div><button id="return-home" class="home-back-button" type="button">← Voltar à exploração</button></div><div id="search-scope" class="home-search-scopes" role="group" aria-label="Filtrar resultados"></div><div id="search-output"></div></section>'+
 '<div id="home-discover">'+
 '<section id="explorar" class="home-explore hv-explore" aria-labelledby="explore-title"><div class="home-section-intro"><div><span class="hv-kicker">'+SUBJECT_AREAS.length+' áreas, '+SUBJECT_TOPICS.length+' assuntos e '+data.lessons.length+' aulas</span><h2 id="explore-title">Encontre seu material.</h2></div></div><div id="explore-content"></div></section>'+
 '</div></div></main>'+footer();

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
 function tile(area){
  var ls=areaLessons(area),n=ls.filter(function(l){return done.has(l.id)}).length;
  var ts=SUBJECT_TOPICS.filter(function(t){return t.area===area.id});
  var lists=ls.filter(function(l){return materialByCode.has(l.id)}).length;
  var deco=ts.filter(function(t){return t.icon!==area.icon}).slice(0,4).map(function(t,k){return '<span class="hv-deco hv-deco-'+k+'">'+esc(t.icon)+'</span>'}).join('');
  return '<article class="hv-area">'
   +'<a class="area-tile" href="/explorar/?area='+encodeURIComponent(area.id)+'"><span class="hv-cover tone-'+area.tone+'" aria-hidden="true"><span class="hv-icon">'+esc(area.icon)+'</span>'+deco+'</span>'
   +'<span class="hv-body"><span class="hv-name">'+esc(area.name)+'</span><span class="hv-desc">'+esc(area.description)+'</span></span></a>'
   +'<ul class="hv-topics" aria-label="Assuntos de '+esc(area.name)+'">'+ts.map(function(t){return '<li><a href="/explorar/?area='+encodeURIComponent(area.id)+'&assunto='+encodeURIComponent(t.id)+'"><span class="hv-ti" aria-hidden="true">'+esc(t.icon)+'</span>'+esc(t.title)+'</a></li>'}).join('')+'</ul>'
   +'<div class="hv-foot"><span><b>'+ls.length+' aulas</b> em '+ts.length+' assuntos</span>'+(n?'<span class="hv-done">'+n+' estudadas</span>':lists?'<span class="hv-lists">'+(lists===ls.length?'Todas com listas em PDF':plural(lists,'aula com listas','aulas com listas')+' em PDF')+'</span>':'')+'</div>'
   +(n?'<div class="tr-meter hv-meter" role="img" aria-label="'+n+' de '+ls.length+' aulas estudadas"><span style="width:'+Math.round(n*100/ls.length)+'%"></span></div>':'')
   +'</article>';
 }
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

 /* ---------- Busca: sugestões enquanto digita, Enter abre a melhor aula ---------- */
 var hits=[],active=-1;
 function openQuick(){quick.hidden=false;input.setAttribute('aria-expanded','true')}
 function closeQuick(){quick.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1}
 function setActive(i){
  active=i;hits.forEach(function(h,k){h.classList.toggle('is-active',k===i);h.setAttribute('aria-selected',String(k===i))});
  if(hits[i]){input.setAttribute('aria-activedescendant',hits[i].id);hits[i].scrollIntoView({block:'nearest'})}else input.removeAttribute('aria-activedescendant');
 }
 function topicUrl(t){return '/explorar/?area='+encodeURIComponent(t.area)+'&assunto='+encodeURIComponent(t.id)}
 function areaUrl(a){return '/explorar/?area='+encodeURIComponent(a.id)}
 function qRow(o){
  return '<a class="home-quick-row hq-row'+(o.best?' is-best':'')+'" role="option" href="'+esc(o.href)+'"'+(o.download?' download':'')+'><span class="hq-code'+(o.codeClass?' '+o.codeClass:'')+'">'+o.code+'</span><span class="hq-t"><b>'+o.title+'</b><small>'+(o.best?'<span class="hq-tag">Melhor resultado</span>':'')+o.sub+'</small></span><kbd class="hq-enter" aria-hidden="true">Enter</kbd></a>';
 }
 function renderQuick(){
  var q=search.query.trim(),rows=[];
  if(bNorm(q).length<2){
   if(document.activeElement!==input){closeQuick();return}
   quick.innerHTML='<div class="hq-head">Buscas comuns</div><div class="hq-pop">'+BUSCA_POPULARES.map(function(p){return '<button type="button" class="hq-chip" data-pop="'+esc(p)+'">'+esc(p)+'</button>'}).join('')+'</div>';
   hits=[];openQuick();return;
  }
  if(document.activeElement!==input){closeQuick();return}
  var R=bSearch(q),Q=R.Q,used={};
  if(R.listas){
   rows.push(qRow({best:true,href:'#resultados',code:AULA_SVG.down,codeClass:'is-icon',title:'Ver todas as listas em PDF',sub:plural(data.lessons.filter(function(l){return trHasLists(l.id)}).length,'aula','aulas')+' com listas publicadas'}));
  }
  if(R.best&&R.best.kind==='aula'){
   var l=R.best.d.l;used[l.id]=1;
   rows.push(qRow({best:R.confident,href:bLessonHref(l,Q.intent),code:esc(l.id),title:bMark(l.title,Q),sub:esc(R.best.d.topic.title)+(Q.intent==='levar'&&trHasLists(l.id)?', listas em PDF':Q.intent==='pratique'&&trHasLists(l.id)?', exercícios':Q.intent==='prova'&&trHasLists(l.id)?', modo prova':'')}));
  }else if(R.best&&R.best.kind==='area'){
   var a=R.best.d.a;
   rows.push(qRow({best:true,href:areaUrl(a),code:esc(a.icon),codeClass:'tone-'+a.tone,title:bMark(a.name,Q),sub:'Área com '+plural(SUBJECT_TOPICS.filter(function(t){return t.area===a.id}).length,'assunto','assuntos')}));
  }else if(R.best&&R.best.kind==='areas'){
   R.best.list.forEach(function(d){rows.push(qRow({href:areaUrl(d.a),code:esc(d.a.icon),codeClass:'tone-'+d.a.tone,title:bMark(d.a.name,Q),sub:'Área'}))});
  }
  R.lessons.filter(function(x){return !used[x.d.l.id]}).slice(0,R.best?3:5).forEach(function(x){var l=x.d.l;used[l.id]=1;rows.push(qRow({href:bLessonHref(l,Q.intent),code:esc(l.id),title:bMark(l.title,Q),sub:esc(x.d.topic.title)}))});
  var tp=R.topics[0];
  if(tp&&tp.s>=8&&!(R.best&&R.best.kind!=='aula')){var n=data.lessons.filter(function(l){return subjectTopic(l,areaForLesson(l))===tp.d.t.id}).length;rows.push(qRow({href:topicUrl(tp.d.t),code:esc(tp.d.t.icon),codeClass:'is-topic',title:'Todas as aulas de '+bMark(tp.d.t.title,Q),sub:'Assunto com '+plural(n,'aula','aulas')}))}
  if(R.best&&R.best.kind==='aula'&&Q.intent==='levar')bListFiles(R.best.d.l.id).forEach(function(f){rows.push(qRow({href:f.url,download:true,code:'PDF',codeClass:'is-pdf',title:esc(f.titulo),sub:'Baixar o PDF'}))});
  var head=Q.fixed&&rows.length?'<div class="hq-fixed">Mostrando resultados para <b>'+esc(Q.fixed)+'</b></div>':'';
  if(!rows.length){
   var sug=bSuggest(q);
   head='<div class="hq-empty"><b>Nenhuma aula com “'+esc(q)+'”.</b>'+(sug.length?' Você quis dizer:':' Tente outra palavra ou um código, como A17.')+'</div>';
   sug.forEach(function(d){rows.push(d.kind==='aula'?qRow({href:href(d.l),code:esc(d.l.id),title:esc(d.l.title),sub:esc(d.topic.title)}):qRow({href:topicUrl(d.t),code:esc(d.t.icon),codeClass:'is-topic',title:esc(d.t.title),sub:'Assunto'}))});
  }
  quick.innerHTML=head+'<div role="listbox" aria-label="Sugestões">'+rows.join('')+'</div>'+(R.lessons.length+R.topics.length>rows.length||R.listas?'<button type="button" class="home-quick-all" id="quick-all">Ver todos os resultados</button>':'');
  hits=[].slice.call(quick.querySelectorAll('.hq-row'));hits.forEach(function(h,k){h.id='hq-'+k});
  openQuick();setActive(hits.length?0:-1);
  var all=document.getElementById('quick-all');if(all)all.addEventListener('click',function(){closeQuick();resultArea.scrollIntoView({behavior:'smooth',block:'start'})});
 }
 quick.addEventListener('click',function(e){
  var pop=e.target.closest('[data-pop]');if(pop){setQuery(pop.dataset.pop,false);input.focus();return}
  var row=e.target.closest('.hq-row');if(row&&row.getAttribute('href')==='#resultados'){e.preventDefault();closeQuick();resultArea.scrollIntoView({behavior:'smooth',block:'start'})}
 });
 quick.addEventListener('mousemove',function(e){var row=e.target.closest('.hq-row');if(row){var i=hits.indexOf(row);if(i>=0&&i!==active)setActive(i)}});
 document.addEventListener('click',function(e){if(!e.target.closest('.home-search-section')&&!quick.hidden)closeQuick()});

 /* ---------- Página de resultados ---------- */
 function steps(l,intent){
  var lists=trHasLists(l.id),u=href(l);
  var st=[['entenda','Teoria',true],['pratique','20 exercícios',lists],['prova','Modo prova',lists],['levar','PDFs e vídeos',true]].filter(function(s){return s[2]});
  return '<nav class="tr-steps" aria-label="Etapas da aula '+l.id+'">'+st.map(function(s){return '<a href="'+u+'#'+s[0]+'"'+(intent===s[0]?' class="is-on"':'')+'>'+s[1]+'</a>'}).join('')+'</nav>';
 }
 function files(id){var fs=bListFiles(id);return fs.length?'<div class="hs-files">'+fs.map(function(f){var vest=/vestibular-/.test(f.url);return '<a class="hs-file" href="'+esc(f.url)+'" target="_blank" rel="noopener">'+AULA_SVG.down+'<span>'+(vest?'Lista de vestibular':'Lista de fixação')+'</span><small>PDF</small></a>'}).join('')+'</div>':''}
 function bestCard(R){
  var Q=R.Q,b=R.best;
  if(b.kind==='aula'){
   var d=b.d,l=d.l;
   return '<article class="hs-best"><p class="hs-best-k"><span class="hs-tag">'+(R.confident?'Melhor resultado':'Resultado mais próximo')+'</span><span>em <a href="'+topicUrl(d.topic)+'">'+esc(d.topic.title)+'</a>, <a href="'+areaUrl(d.area)+'">'+esc(d.area.name)+'</a></span></p>'
    +'<div class="hs-best-grid"><div class="hs-best-main"><p class="tr-lesson-kicker"><span class="aula-id">'+l.id+'</span>'+(done.has(l.id)?'<span class="tr-tag tr-tag-done">'+TR_SVG.check+'Estudada</span>':'')+'</p><h3><a href="'+bLessonHref(l,Q.intent)+'">'+bMark(l.title,Q)+'</a></h3><p class="tr-lesson-sum">'+esc(l.summary||'')+'</p>'
    +steps(l,Q.intent)+files(l.id)+'</div>'
    +'<a class="tr-formula hs-formula" href="'+href(l)+'" aria-label="Abrir a aula '+l.id+'"><div class="tr-formula-math" data-formula="'+l.id+'" data-mini></div></a></div>'
    +'<a class="aula-btn aula-btn-lime hs-open" href="'+bLessonHref(l,Q.intent)+'">Abrir a aula '+l.id+'</a></article>';
  }
  if(b.kind==='area'){
   var a=b.d.a,ts=SUBJECT_TOPICS.filter(function(t){return t.area===a.id});
   return '<article class="hs-best hs-best-area"><p class="hs-best-k"><span class="hs-tag">Melhor resultado</span><span>Área</span></p><div class="hs-area-top"><span class="hv-icon-sm tone-'+a.tone+'">'+esc(a.icon)+'</span><div><h3><a href="'+areaUrl(a)+'">'+esc(a.name)+'</a></h3><p class="tr-lesson-sum">'+esc(a.description)+'</p></div></div>'
    +'<ul class="hv-topics">'+ts.map(function(t){return '<li><a href="'+topicUrl(t)+'"><span class="hv-ti" aria-hidden="true">'+esc(t.icon)+'</span>'+esc(t.title)+'</a></li>'}).join('')+'</ul><a class="aula-btn aula-btn-lime hs-open" href="'+areaUrl(a)+'">Abrir a área</a></article>';
  }
  return '<section class="hs-group"><h3>Áreas</h3><div class="hs-areas">'+b.list.map(function(d){return '<a class="hs-area" href="'+areaUrl(d.a)+'"><span class="hv-icon-sm tone-'+d.a.tone+'">'+esc(d.a.icon)+'</span><b>'+esc(d.a.name)+'</b></a>'}).join('')+'</div></section>';
 }
 function listsView(){
  var ls=data.lessons.filter(function(l){return trHasLists(l.id)}),html='<p class="hs-lead">'+plural(ls.length,'aula já tem','aulas já têm')+' listas de fixação e de vestibular em PDF, com gabarito resolvido.</p>';
  SUBJECT_AREAS.forEach(function(a){var g=ls.filter(function(l){return subjectContains(a,l)});if(!g.length)return;
   html+='<section class="hs-group"><h3><a href="'+areaUrl(a)+'">'+esc(a.name)+'</a></h3><ol class="hs-pdfrows">'+g.map(function(l){return '<li class="hs-pdfrow"><a class="hs-pdfrow-t" href="'+href(l)+'"><span class="aula-id">'+l.id+'</span><span><b>'+esc(l.title)+'</b><small>'+esc(topicInfo(subjectTopic(l,a)).title)+'</small></span></a>'+files(l.id)+'</li>'}).join('')+'</ol></section>'});
  return html;
 }
 function renderSearch(){
  var q=search.query.trim(),R=bSearch(q),Q=R.Q,html='',shownIds={};
  document.getElementById('search-title').textContent=R.listas?'Listas em PDF':'Resultados para “'+q+'”';
  scopeWrap.innerHTML='';scopeWrap.hidden=true;
  if(R.listas){resultOutput.innerHTML=listsView();return}
  if(Q.fixed)html+='<p class="hs-fixed">Mostrando resultados para <b>'+esc(Q.fixed)+'</b>.</p>';
  if(R.best){html+=bestCard(R);if(R.best.kind==='aula')shownIds[R.best.d.l.id]=1}
  if(R.best&&R.best.kind==='aula'){
   var d=R.best.d,sib=data.lessons.filter(function(l){return subjectTopic(l,areaForLesson(l))===d.topic.id&&!shownIds[l.id]});
   if(sib.length){sib.forEach(function(l){shownIds[l.id]=1});html+='<section class="hs-group"><h3>Mais aulas de <a href="'+topicUrl(d.topic)+'">'+esc(d.topic.title)+'</a></h3><ol class="tr-rows">'+sib.map(function(l){return trRow(l,false)}).join('')+'</ol></section>'}
  }
  var others=R.lessons.filter(function(x){return !shownIds[x.d.l.id]});
  if(others.length)html+='<section class="hs-group"><h3>'+(R.best&&R.best.kind==='aula'?'Outras aulas que combinam':'Aulas que combinam')+'</h3><ol class="tr-rows">'+others.slice(0,search.shown).map(function(x){return trRow(x.d.l,true)}).join('')+'</ol>'+(others.length>search.shown?'<button type="button" class="aula-btn aula-btn-soft hs-more" data-more-search>Ver mais '+(others.length-search.shown)+'</button>':'')+'</section>';
  var bt=R.best&&R.best.kind==='aula'?R.best.d.topic.id:null,ts=R.topics.filter(function(x){return x.d.t.id!==bt}).slice(0,6);
  if(ts.length)html+='<section class="hs-group"><h3>Assuntos</h3><ul class="hv-topics hs-topics">'+ts.map(function(x){return '<li><a href="'+topicUrl(x.d.t)+'"><span class="hv-ti" aria-hidden="true">'+esc(x.d.t.icon)+'</span>'+esc(x.d.t.title)+'</a></li>'}).join('')+'</ul></section>';
  if(!html){
   var sug=bSuggest(q);
   html='<div class="hs-none"><b>Nenhuma aula encontrada para “'+esc(q)+'”.</b><p>'+(sug.length?'Talvez você esteja procurando:':'Tente outra palavra, um código de aula (como A17) ou escolha uma área.')+'</p>'+(sug.length?'<ul class="hv-topics hs-topics">'+sug.map(function(d){return d.kind==='aula'?'<li><a href="'+href(d.l)+'"><span class="hv-ti">'+d.l.id+'</span>'+esc(d.l.title)+'</a></li>':'<li><a href="'+topicUrl(d.t)+'"><span class="hv-ti">'+esc(d.t.icon)+'</span>'+esc(d.t.title)+'</a></li>'}).join('')+'</ul>':'')+'<button type="button" class="aula-btn aula-btn-ink" id="search-reset">Ver todas as áreas</button></div>'+exatooCard('busca');
  }
  resultOutput.innerHTML=html;
  trFormulas(resultOutput);
 }
 function setQuery(q,fromHistory){
  search.query=q;search.shown=12;input.value=q;
  clearBtn.hidden=!q.trim();
  var searching=bNorm(q).length>=2;main.hidden=searching;resultArea.hidden=!searching;
  if(searching)renderSearch();
  renderQuick();
  if(!fromHistory){
   var u=new URL(location.href);
   ['area','assunto','favoritos','todas','q'].forEach(function(k){u.searchParams.delete(k)});
   if(searching)u.searchParams.set('q',q.trim());
   history.replaceState(null,'',u.pathname+u.search);
  }
 }
 resultOutput.addEventListener('click',function(e){
  if(e.target.closest('button[data-more-search]')){search.shown+=12;renderSearch();return}
  if(e.target.closest('#search-reset')){setQuery('',false);document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'})}
 });
 input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');
 input.addEventListener('input',function(){setQuery(input.value,false)});
 input.addEventListener('focus',function(){renderQuick()});
 document.getElementById('btn-search').addEventListener('click',function(){if(search.query.trim()){closeQuick();resultArea.scrollIntoView({behavior:'smooth',block:'start'})}else input.focus()});
 input.addEventListener('keydown',function(e){
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(quick.hidden)renderQuick();if(!hits.length)return;e.preventDefault();var n=hits.length;setActive(e.key==='ArrowDown'?(active+1)%n:(active-1+n)%n);return}
  if(e.key==='Enter'){
   e.preventDefault();if(!search.query.trim())return;
   var row=!quick.hidden&&hits[active>=0?active:0];
   if(row){if(row.getAttribute('href')==='#resultados'){closeQuick();resultArea.scrollIntoView({behavior:'smooth',block:'start'})}else row.click();return}
   closeQuick();resultArea.scrollIntoView({behavior:'smooth',block:'start'});return;
  }
  if(e.key==='Escape'){if(!quick.hidden)closeQuick();else if(input.value)setQuery('',false)}
 });
 clearBtn.addEventListener('click',function(){setQuery('',false);input.focus()});
 document.getElementById('return-home').addEventListener('click',function(){setQuery('',false);document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'})});
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


/* ================= Trilha (v2): áreas → assunto → aula ================= */
var TR_SVG={
 check:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>',
 heart:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z"></path></svg>',
 doc:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5M9 13h6M9 17h4"></path></svg>'
};
function trAreaLessons(area){return data.lessons.filter(function(l){return subjectContains(area,l)})}
function trTopics(area){return SUBJECT_TOPICS.filter(function(t){return t.area===area.id})}
function trTopicLessons(area,topic){return trAreaLessons(area).filter(function(l){return subjectTopic(l,area)===topic.id})}
function trAreaUrl(area){return '/explorar/?area='+encodeURIComponent(area.id)}
function trTopicUrl(area,topic){return trAreaUrl(area)+'&assunto='+encodeURIComponent(topic.id)}
function trHasLists(id){return materialsAt('aula',id).some(function(x){return (x.item.arquivos||[]).some(function(f){return /\/(fixacao|vestibular)-[ABC]\d\d\.pdf$/.test(f.url||'')})})}
function trDone(ls){return ls.filter(function(l){return done.has(l.id)}).length}
function trNext(ls){return ls.find(function(l){return !done.has(l.id)})||null}
function trProgress(l){
 var st=aulaStore(l.id).st,fix=0;
 Object.keys(st.fix).forEach(function(k){if(st.fix[k]==='ok'||st.fix[k]==='erro')fix++});
 var p={done:done.has(l.id),entenda:!!st.entenda,fix:fix,best:st.prova.best,pdf:!!st.pdf};
 p.started=!!(p.entenda||p.fix||p.best!=null||p.pdf);
 return p;
}
function trMeter(n,total,label){var pct=total?Math.round(n*100/total):0;return '<div class="tr-meter" role="img" aria-label="'+esc(label)+'"><span style="width:'+pct+'%"></span></div>'}
function trMini(f){if(!f)return null;var s=String(f).split(/\\q?quad/)[0].replace(/[\s,;.]+$/,'')||String(f);if(s.length>40){var parts=s.split('=');if(parts.length>2)s=parts.slice(0,2).join('=')}return s}
async function trFormulas(root){
 var els=[].slice.call(root.querySelectorAll('[data-formula]'));if(!els.length)return;
 var ids=[];els.forEach(function(e){e.dataset.formula.split(',').forEach(function(id){if(ids.indexOf(id)<0)ids.push(id)})});
 var map={};
 await Promise.all(ids.map(function(id){return fetchJson('/conteudos/'+id+'.json').then(function(c){map[id]=heroFormula(c)})}));
 els.forEach(function(el){
  var f=null;el.dataset.formula.split(',').forEach(function(id){var g=map[id];if(g&&(!f||formulaScore(trMini(g))>formulaScore(trMini(f))))f=g});
  if(!f){var box=el.closest('.tr-formula');if(box)box.hidden=true;return}
  el.innerHTML='\\['+esc(el.hasAttribute('data-mini')?trMini(f):f)+'\\]';
 });
 await tex(root);
 els.forEach(function(el){fitFormula(el)});
}
/* adesivos: ícone central e os ícones dos assuntos em órbita */
function trSticker(center,tone,orbit,caption){
 var n=orbit.length;
 var items=orbit.map(function(o,k){
  var ang=-Math.PI/2+k*2*Math.PI/n,x=50+40*Math.cos(ang),y=50+38*Math.sin(ang),rot=(k%2?7:-8)+(k%3)*2;
  return '<span class="tr-orbit tone-'+esc(o.tone)+'" style="left:'+x.toFixed(1)+'%;top:'+y.toFixed(1)+'%;--r:'+rot+'deg">'+esc(o.icon)+'</span>';
 }).join('');
 return '<figure class="tr-sticker" aria-hidden="true"><div class="tr-sticker-card"><span class="tr-sticker-main tone-'+esc(tone)+'">'+esc(center)+'</span>'+items+'</div>'+(caption?'<figcaption>'+esc(caption)+'</figcaption>':'')+'</figure>';
}
function trCrumbs(items){return '<nav class="aula-crumbs" aria-label="Caminho"><a href="/">Início</a>'+items.map(function(it){return '<span aria-hidden="true">/</span>'+(it.url?'<a href="'+it.url+'">'+esc(it.name)+'</a>':'<span aria-current="page">'+esc(it.name)+'</span>')}).join('')+'</nav>'}
function trAreaSwitch(current){
 return '<nav class="tr-areas" aria-label="Outras áreas"><ol>'+SUBJECT_AREAS.map(function(a){var cur=current&&a.id===current.id;var ls=trAreaLessons(a),d=trDone(ls);return '<li><a href="'+trAreaUrl(a)+'" class="'+(cur?'is-current':'')+'"'+(cur?' aria-current="page"':'')+'><span class="tr-areas-icon tone-'+a.tone+'">'+esc(a.icon)+'</span><span class="tr-areas-name">'+esc(a.name)+'</span>'+(d?'<span class="tr-areas-done">'+d+'/'+ls.length+'</span>':'')+'</a></li>'}).join('')+'</ol></nav>';
}
function trRow(l,showTopic){
 var a=areaForLesson(l),p=trProgress(l),fav=saved.has(l.id);
 var status=p.done?'<span class="tr-tag tr-tag-done">'+TR_SVG.check+'Estudada</span>':p.best!=null?'<span class="tr-tag">Prova: '+p.best+'/20</span>':p.started?'<span class="tr-tag">Em andamento</span>':'';
 return '<li><a class="tr-row'+(p.done?' is-done':'')+'" href="'+href(l)+'"><span class="aula-id">'+esc(l.id)+'</span><span class="tr-row-t"><b>'+esc(l.title)+'</b><small>'+esc(showTopic?topicInfo(subjectTopic(l,a)).title:(l.summary||''))+'</small></span><span class="tr-row-s">'+(fav?'<span class="tr-fav" title="Favorita">'+TR_SVG.heart+'<span class="sr-only">Favorita</span></span>':'')+(trHasLists(l.id)?'<span class="tr-pdf-ico" title="Tem listas em PDF">'+TR_SVG.doc+'<span class="sr-only">Tem listas em PDF</span></span>':'')+status+'</span></a></li>';
}
function trPdfPanel(kind,id,label){
 var items=materialsAt(kind,id);if(!items.length)return '';
 var files=[];items.forEach(function(x){(x.item.arquivos||[]).forEach(function(f){files.push(f)})});
 return '<section class="tr-pdfs"><h2>'+esc(label)+'</h2><div class="tr-pdfs-list">'+files.map(function(f){var u=String(f.url||'');return /^\/(?!\/)/.test(u)||/^https:\/\//.test(u)?'<a class="aula-file" href="'+esc(u)+'" target="_blank" rel="noopener">'+AULA_SVG.down+'<span>'+esc(f.titulo||'Material em PDF')+'</span></a>':''}).join('')+'</div></section>';
}

function explorePage(){
 var q=new URLSearchParams(location.search);
 var area=SUBJECT_AREAS.find(function(a){return a.id===q.get('area')});
 var topic=area&&SUBJECT_TOPICS.find(function(t){return t.id===q.get('assunto')&&t.area===area.id});
 var app=document.getElementById('app'),html;
 if(q.has('favoritos')||q.has('todas'))html=trListPage(q.has('favoritos'));
 else if(topic)html=trTopicPage(area,topic);
 else if(area)html=trAreaPage(area);
 else html=trAreasPage();
 app.innerHTML=header()+'<main class="aula trilha" id="conteudo">'+html+'</main>'+footer();
 trFormulas(document.querySelector('main'));
 var cur=document.querySelector('.aula-trail .is-current,.tr-areas .is-current');
 if(cur){var ol=cur.closest('ol');if(ol&&ol.scrollWidth>ol.clientWidth+2){var r=cur.getBoundingClientRect(),o=ol.getBoundingClientRect();if(r.right>o.right||r.left<o.left)ol.scrollLeft+=r.left-o.left-24}}
 if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t)setTimeout(function(){t.scrollIntoView({block:'start'})},80)}
}

/* /explorar/ — escolha da área */
function trAreasPage(){
 title('Explorar assuntos');
 var total=data.lessons.length,d=trDone(data.lessons);
 var hero='<section class="aula-hero tr-hero" aria-labelledby="tr-titulo"><div class="shell">'+trCrumbs([{name:'Assuntos'}])
  +'<div class="aula-hero-grid"><div>'
  +'<p class="aula-kicker">'+SUBJECT_AREAS.length+' áreas, '+SUBJECT_TOPICS.length+' assuntos e '+total+' aulas</p>'
  +'<h1 id="tr-titulo">Escolha uma área</h1>'
  +'<p class="aula-summary">Cada área é uma trilha de assuntos, na ordem em que costumam ser estudados. Dentro de cada assunto, as aulas trazem teoria, exercícios resolvidos e modo prova.</p>'
  +'<div class="aula-hero-cta"><a class="aula-btn aula-btn-lime" href="/teste-seu-nivel/">Descobrir por onde começar</a><a class="aula-btn aula-btn-ghost" href="/explorar/?todas=1">Ver todas as aulas</a></div>'
  +(d?'<div class="tr-hero-progress">'+trMeter(d,total,d+' de '+total+' aulas estudadas')+'<span>Você já estudou <b>'+plural(d,'aula','aulas')+'</b> de '+total+'.</span></div>':'')
  +(saved.size?'<a class="tr-hero-link" href="/explorar/?favoritos=1">'+TR_SVG.heart+'Suas favoritas ('+saved.size+')</a>':'')
  +'</div>'+trSticker('∑','mint',SUBJECT_AREAS.map(function(a){return {icon:a.icon,tone:a.tone}}),'Toda a matemática do ensino médio')+'</div></div></section>';
 var tiles='<section class="shell tr-body"><header class="tr-head"><h2>As 9 áreas</h2><p>Toque em uma área para ver os assuntos dela.</p></header><div class="area-grid tr-area-grid">'+SUBJECT_AREAS.map(function(a){
  var ls=trAreaLessons(a),n=trDone(ls),ts=trTopics(a).length;
  return '<a class="area-tile" href="'+trAreaUrl(a)+'"><span class="area-tile-icon tone-'+a.tone+'">'+esc(a.icon)+'</span><span class="area-tile-name">'+esc(a.name)+'</span><span class="area-tile-subtitle">'+esc(a.description)+'</span>'
   +(n?trMeter(n,ls.length,n+' de '+ls.length+' aulas estudadas'):'')
   +'<span class="area-tile-foot"><span>'+plural(ts,'assunto','assuntos')+', '+ls.length+' aulas'+(n?' ('+n+' estudadas)':'')+'</span><span class="area-tile-go" aria-hidden="true">↗</span></span></a>'
 }).join('')+'</div></section>';
 return hero+tiles;
}

/* /explorar/?area=… — os assuntos da área como uma trilha */
function trAreaPage(area){
 title(area.name);
 var topics=trTopics(area),ls=trAreaLessons(area),d=trDone(ls),next=trNext(ls);
 var withLists=ls.filter(function(l){return trHasLists(l.id)}).length;
 var cta=next?(d?'<a class="aula-btn aula-btn-lime" href="'+href(next)+'">Continuar na '+next.id+'</a>':'<a class="aula-btn aula-btn-lime" href="'+href(next)+'">Começar pela primeira aula</a>'):'<a class="aula-btn aula-btn-lime" href="'+href(ls[0])+'">Revisar desde o início</a>';
 var hero='<section class="aula-hero tr-hero" aria-labelledby="tr-titulo"><div class="shell">'+trCrumbs([{name:'Assuntos',url:'/explorar/'},{name:area.name}])
  +'<div class="aula-hero-grid"><div>'
  +'<p class="aula-kicker"><span class="aula-id">'+esc(area.icon)+'</span>'+plural(topics.length,'assunto','assuntos')+' e '+ls.length+' aulas</p>'
  +'<h1 id="tr-titulo">'+esc(area.name)+'</h1>'
  +'<p class="aula-summary">'+esc(area.description)+'</p>'
  +'<div class="aula-hero-cta">'+cta+'<a class="aula-btn aula-btn-ghost" href="#trilha">Ver os assuntos</a></div>'
  +'<div class="tr-hero-progress">'+(d?trMeter(d,ls.length,d+' de '+ls.length+' aulas estudadas'):'')+'<span>'+(d?'<b>'+d+' de '+ls.length+'</b> aulas estudadas'+(next?'. A próxima é a '+next.id+', '+esc(next.title)+'.':'. Área completa!'):(withLists?withLists===ls.length?'Todas as aulas têm listas em PDF com gabarito resolvido.':withLists+' das '+ls.length+' aulas já têm listas em PDF com gabarito.':'Marque as aulas como estudadas e acompanhe seu avanço aqui.'))+'</span></div>'
  +'</div>'+trSticker(area.icon,area.tone,topics.map(function(t){return {icon:t.icon,tone:'paper'}}),area.name)+'</div>'
  +trAreaSwitch(area)+'</div></section>';
 var route='<section class="shell tr-body" id="trilha"><header class="tr-head"><h2>Os assuntos, em ordem</h2><p>Siga a trilha do começo ou vá direto ao assunto que você precisa. Cada aula abre direto pelo código.</p></header><ol class="tr-route">'+topics.map(function(t,k){
  var tl=trTopicLessons(area,t),td=trDone(tl),tn=trNext(tl);
  var state=tl.length&&td===tl.length?'is-done':(td||tl.some(function(l){return trProgress(l).started}))?'is-started':'';
  var lists=tl.filter(function(l){return trHasLists(l.id)}).length;
  return '<li class="tr-stop '+state+'" id="assunto-'+t.id+'"><span class="tr-stop-n" aria-hidden="true">'+(state==='is-done'?TR_SVG.check:(k+1))+'</span>'
   +'<article class="tr-topic"><div class="tr-topic-top"><span class="tr-topic-icon tone-'+area.tone+'" aria-hidden="true">'+esc(t.icon)+'</span><div class="tr-topic-copy"><h3><a href="'+trTopicUrl(area,t)+'">'+esc(t.title)+'</a></h3><p>'+esc(t.description)+'</p></div>'
   +(tl[0]?'<div class="tr-formula" aria-hidden="true"><div class="tr-formula-math" data-formula="'+tl[0].id+'" data-mini></div></div>':'')+'</div>'
   +'<ul class="tr-chips" aria-label="Aulas de '+esc(t.title)+'">'+tl.map(function(l){var dn=done.has(l.id);return '<li><a class="tr-chip'+(dn?' is-done':'')+(tn&&tn.id===l.id&&td?' is-next':'')+'" href="'+href(l)+'"><b>'+l.id+'</b><span>'+esc(l.title)+'</span>'+(dn?'<span class="sr-only">, estudada</span>':'')+'</a></li>'}).join('')+'</ul>'
   +'<div class="tr-topic-foot"><div class="tr-topic-meta"><span>'+plural(tl.length,'aula','aulas')+'</span>'+(lists?'<span>'+TR_SVG.doc+(lists===tl.length?'Todas com listas em PDF':plural(lists,'aula com listas','aulas com listas')+' em PDF')+'</span>':'')+(td?'<span class="tr-topic-done">'+td+' de '+tl.length+' estudadas</span>':'')+'</div>'
   +'<a class="aula-btn aula-btn-soft tr-topic-go" href="'+trTopicUrl(area,t)+'">Abrir o assunto</a></div></article></li>';
 }).join('')+'</ol>'
  +trPdfPanel('area',area.id,'Materiais gerais de '+area.name)
  +'<aside class="tr-nudge"><div><b>Não sabe em que ponto está?</b><p>O teste de nível mostra quais assuntos revisar primeiro.</p></div><a class="aula-btn aula-btn-ink" href="/teste-seu-nivel/">Fazer o teste de nível</a></aside></section>';
 return hero+route;
}

/* /explorar/?area=…&assunto=… — as aulas do assunto, em ordem */
function trTopicPage(area,topic){
 title(topic.title+' | '+area.name);
 var topics=trTopics(area),ti=topics.findIndex(function(t){return t.id===topic.id});
 var ls=trTopicLessons(area,topic),d=trDone(ls),next=trNext(ls);
 var anyLists=ls.some(function(l){return trHasLists(l.id)});
 var cta=next?'<a class="aula-btn aula-btn-lime" href="'+href(next)+'">'+(d?'Continuar na ':'Começar pela ')+next.id+'</a>':(ls[0]?'<a class="aula-btn aula-btn-lime" href="'+href(ls[0])+'#prova">Revisar com o modo prova</a>':'');
 var trail='<ol class="aula-trail" aria-label="Assuntos de '+esc(area.name)+'">'+topics.map(function(t){var cur=t.id===topic.id,tl=trTopicLessons(area,t),all=tl.length&&trDone(tl)===tl.length;return '<li class="'+(cur?'is-current ':'')+(all?'is-done':'')+'"><a href="'+trTopicUrl(area,t)+'"'+(cur?' aria-current="page"':'')+'><span class="aula-trail-dot" aria-hidden="true"></span><span class="aula-trail-id">'+esc(t.icon)+'</span><span class="aula-trail-name">'+esc(t.title)+'</span></a></li>'}).join('')+'</ol>';
 var hero='<section class="aula-hero tr-hero" aria-labelledby="tr-titulo"><div class="shell">'+trCrumbs([{name:area.name,url:trAreaUrl(area)},{name:topic.title}])
  +'<div class="aula-hero-grid"><div>'
  +'<p class="aula-kicker"><span class="aula-id">'+esc(topic.icon)+'</span>Assunto '+(ti+1)+' de '+topics.length+' em '+esc(area.name)+'</p>'
  +'<h1 id="tr-titulo">'+esc(topic.title)+'</h1>'
  +'<p class="aula-summary">'+esc(topic.description)+' '+plural(ls.length,'aula','aulas')+(anyLists?', cada uma com teoria, exercícios resolvidos e modo prova.':', com teoria e exemplos resolvidos.')+'</p>'
  +'<div class="aula-hero-cta">'+cta+'<a class="aula-btn aula-btn-ghost" href="#aulas">Ver as aulas</a></div>'
  +(d?'<div class="tr-hero-progress">'+trMeter(d,ls.length,d+' de '+ls.length+' aulas estudadas')+'<span>'+(d===ls.length?'<b>Assunto completo.</b> Todas as aulas estão marcadas como estudadas.':'<b>'+d+' de '+ls.length+'</b> aulas estudadas.')+'</span></div>':'')
  +'</div>'+(ls[0]?'<figure class="aula-formula"><div class="aula-formula-card"><div class="aula-formula-math tr-hero-formula" id="aula-formula-math" data-formula="'+ls.map(function(l){return l.id}).join(',')+'" data-mini></div></div><figcaption>A fórmula-chave do assunto</figcaption></figure>':'')+'</div>'
  +(topics.length>1?trail:'')+'</div></section>';
 var list='<section class="shell tr-body" id="aulas"><header class="tr-head"><h2>As aulas, em ordem</h2><p>'+(anyLists?'Toque no título para abrir a aula, ou vá direto à etapa que você quer: teoria, exercícios, modo prova ou PDFs.':'Toque no título para abrir a aula.')+'</p></header><ol class="tr-route tr-lessons">'+ls.map(function(l,k){
  var p=trProgress(l),lists=trHasLists(l.id),u=href(l);
  var state=p.done?'is-done':p.started?'is-started':'';
  var steps=[['entenda','Teoria',true],['pratique','20 exercícios',lists],['prova','Modo prova',lists],['levar','PDFs',lists]].filter(function(s){return s[2]});
  var segs=[p.entenda,lists&&p.fix>=20,p.best!=null,p.pdf];
  var label=p.done?'Estudada':p.best!=null?'Melhor nota na prova: '+p.best+' de 20':p.fix?plural(p.fix,'exercício conferido','exercícios conferidos'):p.entenda?'Teoria concluída':'';
  return '<li class="tr-stop '+state+'"><span class="tr-stop-n" aria-hidden="true">'+(p.done?TR_SVG.check:(k+1))+'</span>'
   +'<article class="tr-lesson"><div class="tr-lesson-main"><p class="tr-lesson-kicker"><span class="aula-id">'+l.id+'</span>'+(saved.has(l.id)?'<span class="tr-fav" title="Favorita">'+TR_SVG.heart+'<span class="sr-only">Favorita</span></span>':'')+(label?'<span class="tr-tag'+(p.done?' tr-tag-done':'')+'">'+(p.done?TR_SVG.check:'')+esc(label)+'</span>':'')+'</p>'
   +'<h3><a href="'+u+'">'+esc(l.title)+'</a></h3><p class="tr-lesson-sum">'+esc(l.summary||'')+'</p>'
   +'<div class="tr-lesson-foot"><nav class="tr-steps" aria-label="Etapas da aula '+l.id+'">'+steps.map(function(s){return '<a href="'+u+'#'+s[0]+'">'+s[1]+'</a>'}).join('')+'</nav>'
   +(p.started&&!p.done?'<span class="tr-segs" role="img" aria-label="Etapas concluídas: '+segs.filter(Boolean).length+' de 4">'+segs.map(function(s){return '<i class="'+(s?'on':'')+'"></i>'}).join('')+'</span>':'')+'</div></div>'
   +'<div class="tr-formula" aria-hidden="true"><div class="tr-formula-math" data-formula="'+l.id+'" data-mini></div></div></article></li>';
 }).join('')+'</ol>'
  +trPdfPanel('assunto',topic.id,'Listas gerais de '+topic.title);
 var prevT=topics[ti-1],nextT=topics[ti+1];
 if(!nextT){var ai=SUBJECT_AREAS.findIndex(function(a){return a.id===area.id}),na=SUBJECT_AREAS[ai+1];if(na)nextT={next:true,area:na,t:trTopics(na)[0]}}
 list+='<nav class="aula-seq tr-seq" aria-label="Outros assuntos">'
  +(prevT?'<a class="aula-seq-prev" href="'+trTopicUrl(area,prevT)+'"><small>Assunto anterior</small><b>'+esc(prevT.title)+'</b></a>':'<a class="aula-seq-prev" href="'+trAreaUrl(area)+'"><small>Voltar para a área</small><b>'+esc(area.name)+'</b></a>')
  +(nextT?(nextT.next?'<a class="aula-seq-next" href="'+trTopicUrl(nextT.area,nextT.t)+'"><small>Próxima área, '+esc(nextT.area.name)+'</small><b>'+esc(nextT.t.title)+'</b></a>':'<a class="aula-seq-next" href="'+trTopicUrl(area,nextT)+'"><small>Próximo assunto</small><b>'+esc(nextT.title)+'</b></a>'):'')
  +'</nav></section>';
 return hero+list;
}

/* /explorar/?todas=1 e ?favoritos=1 */
function trListPage(favs){
 title(favs?'Suas favoritas':'Todas as aulas');
 var hero='<section class="aula-hero tr-hero tr-hero-small" aria-labelledby="tr-titulo"><div class="shell">'+trCrumbs([{name:'Assuntos',url:'/explorar/'},{name:favs?'Favoritas':'Todas as aulas'}])
  +'<div class="tr-hero-solo"><p class="aula-kicker">'+(favs?plural(saved.size,'aula salva','aulas salvas'):data.lessons.length+' aulas em '+SUBJECT_AREAS.length+' áreas')+'</p><h1 id="tr-titulo">'+(favs?'Suas favoritas':'Todas as aulas')+'</h1>'
  +'<p class="aula-summary">'+(favs?'As aulas que você favoritou ficam guardadas neste navegador.':'O catálogo completo, organizado por área e assunto.')+'</p></div>'
  +(favs?'':trAreaSwitch(null).replace(/href="\/explorar\/\?area=([^"]+)"/g,'href="#area-$1"'))+'</div></section>';
 var body='<section class="shell tr-body tr-catalog">';
 if(favs){
  var ls=data.lessons.filter(function(l){return saved.has(l.id)});
  if(!ls.length)body+='<div class="tr-empty"><b>Nenhuma aula favoritada ainda.</b><p>Na página de qualquer aula, toque em Favoritar para guardá-la aqui.</p><a class="aula-btn aula-btn-ink" href="/explorar/">Escolher uma área</a></div>';
  else SUBJECT_AREAS.forEach(function(a){var g=ls.filter(function(l){return subjectContains(a,l)});if(g.length)body+='<section class="tr-group"><h2><span class="tr-areas-icon tone-'+a.tone+'" aria-hidden="true">'+esc(a.icon)+'</span><a href="'+trAreaUrl(a)+'">'+esc(a.name)+'</a></h2><ol class="tr-rows">'+g.map(function(l){return trRow(l,true)}).join('')+'</ol></section>'});
 }else{
  SUBJECT_AREAS.forEach(function(a){
   body+='<section class="tr-group" id="area-'+a.id+'"><h2><span class="tr-areas-icon tone-'+a.tone+'" aria-hidden="true">'+esc(a.icon)+'</span><a href="'+trAreaUrl(a)+'">'+esc(a.name)+'</a></h2>'
    +trTopics(a).map(function(t){return '<h3><a href="'+trTopicUrl(a,t)+'">'+esc(t.title)+'</a></h3><ol class="tr-rows">'+trTopicLessons(a,t).map(function(l){return trRow(l,false)}).join('')+'</ol>'}).join('')+'</section>';
  });
 }
 return hero+body+'</section>';
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
function formulaScore(f){var s=0;if(/=/.test(f))s+=2;if(/\\d?frac/.test(f))s+=2;if(/\\text/.test(f))s-=4;if(/\\Rightarrow/.test(f))s-=2;if(f.length>60)s-=2;if(f.length<6)s-=3;return s}
function heroFormula(content){
 if(content&&content.formulaChave)return content.formulaChave;
 var fs=[];(content&&content.teoria||[]).forEach(function(s){(s.formulas||[]).forEach(function(f){fs.push(f)})});
 if(!fs.length)return null;
 var best=fs[0];fs.forEach(function(f){if(formulaScore(f)>formulaScore(best))best=f});return best;
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
 try{localStorage.setItem('matmat-ultima-aula',id)}catch(e){}
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
 function apoioHtml(q){
  var h='';
  if(q.texto&&q.texto.length)h+=q.texto.map(function(t){return '<p class="aula-apoio">'+esc(t)+'</p>'}).join('');
  if(q.tabela)h+='<div class="aula-tab-wrap"><table class="aula-tab"><thead><tr>'+q.tabela.cabecalho.map(function(c){return '<th>'+esc(c)+'</th>'}).join('')+'</tr></thead><tbody>'+q.tabela.linhas.map(function(l){return '<tr>'+l.map(function(c){return '<td>'+esc(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table>'+(q.tabela.legenda?'<p class="aula-legenda">'+esc(q.tabela.legenda)+'</p>':'')+'</div>';
  if(q.figura)h+='<figure class="aula-fig"><img src="'+esc(q.figura)+'" alt="Figura da questão '+q.n+'" loading="lazy">'+(q.legenda?'<figcaption>'+esc(q.legenda)+'</figcaption>':'')+'</figure>';
  return h;
 }
 function exCard(q){
  var s=st.fix[q.n]||'';
  return '<article class="aula-ex'+(s?' is-'+s:'')+'" data-ex="'+q.n+'"><div class="aula-ex-q"><span class="aula-ex-n">'+q.n+'</span><div class="aula-ex-body">'+apoioHtml(q)+'<p>'+esc(q.enunciado)+'</p>'+(q.itens&&q.itens.length?'<ol class="aula-itens">'+q.itens.map(function(i){return '<li>'+esc(i)+'</li>'}).join('')+'</ol>':'')+'</div><span class="aula-ex-badge" aria-hidden="true"></span></div>'
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
    +'<div class="aula-prova-q"><div class="aula-prova-enun"><span class="aula-mcq-n">'+q.n+'</span><div class="aula-prova-txt">'+apoioHtml(q)+'<p>'+esc(q.enunciado)+'</p></div></div><div class="aula-opts aula-opts-big'+optsClass(q.opcoes)+'">'+q.opcoes.map(function(o,j){var cls='';if(ans!=null){if(j===q.correta)cls=' is-right';else if(j===ans)cls=' is-wrong'}return '<button type="button" class="aula-opt'+cls+'" data-popt="'+j+'"'+(ans!=null?' disabled':'')+'><span class="aula-opt-l">'+letter(j)+'</span><span class="aula-opt-t">'+esc(o)+'</span></button>'}).join('')+'</div>'
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
  box.innerHTML='<div class="aula-prova-q aula-review"><div class="aula-prova-enun"><span class="aula-mcq-n">'+q.n+'</span><div class="aula-prova-txt">'+apoioHtml(q)+'<p>'+esc(q.enunciado)+'</p></div></div><div class="aula-opts">'+q.opcoes.map(function(o,j){return '<div class="aula-opt'+(j===q.correta?' is-right':j===a?' is-wrong':'')+'"><span class="aula-opt-l">'+letter(j)+'</span><span class="aula-opt-t">'+esc(o)+'</span></div>'}).join('')+'</div><div class="aula-fb-box '+(a===q.correta?'is-right':'is-wrong')+'"><b>Resolução</b>'+q.resolucao.map(function(r){return '<p>'+esc(r)+'</p>'}).join('')+'</div></div>';
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
