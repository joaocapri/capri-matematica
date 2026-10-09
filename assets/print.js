
(async function(){
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
var params=new URLSearchParams(location.search),id=params.get('aula'),tipo=params.get('tipo')==='gabarito'?'gabarito':'lista';
var root=document.getElementById('print-app');
if(!/^[ABC][0-4][0-9]$/.test(id||'')){root.textContent='Código de aula inválido.';return}
try{
 var rr=await Promise.all([fetch('/data/aulas.json'),fetch('/conteudos/'+id+'.json')]);
 if(!rr[0].ok||!rr[1].ok)throw Error('Aula sem material.');
 var data=await rr[0].json(),content=await rr[1].json(),lesson=data.lessons.find(function(l){return l.id===id});
 if(!lesson||!content.lista||!content.lista.length)throw Error('Lista ainda não publicada.');
 var qs=content.lista;
 var item=tipo==='lista'?qs.map(function(q,i){return '<div class="question"><div class="qtop"><span class="qno">'+String(i+1).padStart(2,'0')+'</span><span class="level">'+esc(q.nivel||'Treino')+'</span></div><p>'+esc(q.enunciado)+'</p><div class="options">'+q.opcoes.map(function(o,j){return '<div class="option"><b>'+String.fromCharCode(65+j)+')</b><span>'+esc(o)+'</span></div>'}).join('')+'</div></div>'}).join(''):qs.map(function(q,i){return '<div class="answer"><b>Questão '+String(i+1).padStart(2,'0')+'</b><span class="bubble">'+String.fromCharCode(65+q.correta)+'</span><p>'+esc(q.comentario)+'</p></div>'}).join('');
 root.innerHTML='<div class="toolbar"><b>✳ capri.mat · Prévia de impressão</b><div><a href="/aulas/'+id+'/">Voltar à aula</a><button id="printBtn">Imprimir / Salvar PDF ↗</button></div></div><main class="paper"><div class="brandline"></div><div class="dochead"><div><div class="logo">capri<span>.</span>mat ✳</div><div class="title">PROF. JOÃO CAPRI · '+(tipo==='lista'?'LISTA DE EXERCÍCIOS':'GABARITO COMENTADO')+'</div><h1>'+esc(lesson.title)+'</h1><div class="sub">Aula '+id+' · Frente '+esc(lesson.front)+' · Material autoral estilo vestibular</div></div><div class="meta"><b>EDIÇÃO 01</b><br>'+qs.length+' QUESTÕES<br>MATEMÁTICA</div></div>'+(tipo==='lista'?'<div class="student"><div>NOME:</div><div>TURMA:</div><div>DATA:</div></div><div class="intro">Leia com atenção e marque uma única alternativa em cada questão. Questões autorais inspiradas em competências trabalhadas em vestibulares; não são reproduções de provas oficiais.</div>':'<div class="intro">Respostas acompanhadas de uma ideia de resolução. Consulte este material depois de tentar as questões.</div>')+item+'<div class="footer"><span>PROF. JOÃO CAPRI · CAPRI MATEMÁTICA</span><span>AULA '+id+' · '+(tipo==='lista'?'LISTA':'GABARITO')+'</span></div><p class="notice">Material de estudo autoral. Versão piloto sujeita à revisão pedagógica.</p></main>';
 document.getElementById('printBtn').addEventListener('click',function(){window.print()});
 document.title='Capri Matematica - '+id+' - '+tipo;
 if(window.MathJax&&window.MathJax.typesetPromise)window.MathJax.typesetPromise();
}catch(e){root.innerHTML='<p style="padding:32px">Não foi possível abrir este material. '+esc(e.message)+'</p>'}
})();
