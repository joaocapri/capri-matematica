/* MAT MAT MAT! / Turmas — somente links diretos, sem menu público. */
(function(){
'use strict';
const root=document.getElementById('class-app');
if(!root)return;
const id=document.body.getAttribute('data-turma')||'';
const supported=['maxi-1p1','maxi-1p2','maxi-2p1','maxi-3p1','maxi-3p2','maxi-fera','maxi-med','integral-3a','integral-3b','integral-3c','integral-semi'];
if(!supported.includes(id)){root.textContent='Turma não encontrada.';return}
const logo='<img src="/assets/logo-mat-256.png" width="66" height="66" alt="MAT MAT MAT!" loading="eager">';
const icons={
 notice:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7z"/><path d="M8 9h8M8 13h6"/></svg>',
 file:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v6h5M9 14h6M9 18h6"/></svg>',
 link:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7.5.5l2-2a5 5 0 1 0-7-7l-1.2 1.2"/><path d="M14 10a5 5 0 0 0-7.5-.5l-2 2a5 5 0 1 0 7 7l1.2-1.2"/></svg>',
 share:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5m-8 7 8 5"/></svg>',
 arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
};
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function date(iso){if(!iso)return '';const d=new Date(iso+'T12:00:00');return Number.isNaN(d.getTime())?'':d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}
function safeUrl(value){if(typeof value!=='string')return null;try{const u=new URL(value,location.origin);return ['https:','http:'].includes(u.protocol)?u.href:null}catch(e){return null}}
function resourceType(type){return ({lista:'Lista em PDF',teoria:'Teoria',resumo:'Resumo',revisao:'Revisão',video:'Vídeo',link:'Link de estudo'})[type]||'Material'}
function resourceCategory(type){return type==='lista'?'listas':type==='teoria'||type==='resumo'?'teoria':type==='revisao'?'revisao':'links'}
function composeCard(r){
 const type=resourceType(r.type),category=resourceCategory(r.type),url=safeUrl(r.url),body=Array.isArray(r.body)?r.body.filter(Boolean):[];
 const act=url?'<a class="class-material-action" href="'+esc(url)+'"'+(url.startsWith(location.origin)?'':' target="_blank" rel="noopener noreferrer"')+'>'+icons.arrow+' <span>'+esc(r.action||'Abrir material')+'</span></a>':
 body.length?'<details class="class-inline-theory"><summary>Leia o conteúdo '+icons.arrow+'</summary>'+body.map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+'</details>':'';
 return '<article class="class-material" data-category="'+esc(category)+'" data-search="'+esc([r.title,r.description,type,r.lesson].join(' ').toLocaleLowerCase('pt-BR'))+'"><div class="class-material-icon">'+icons.file+'</div><div class="class-material-content"><div class="class-material-meta"><span>'+esc(type)+'</span>'+(r.date?'<time datetime="'+esc(r.date)+'">'+date(r.date)+'</time>':'')+(r.lesson?'<span>Aula '+esc(r.lesson)+'</span>':'')+'</div><h3>'+esc(r.title)+'</h3>'+(r.description?'<p>'+esc(r.description)+'</p>':'')+act+'</div></article>';
}
async function shareRoom(data){
 const url=location.origin+location.pathname;
 const title='Matemática • '+data.school+' '+data.className+' | MAT MAT MAT!';
 const text='Materiais e avisos da nossa turma: '+data.school+' '+data.className;
 if(navigator.share){try{await navigator.share({title,text,url});return}catch(e){if(e&&e.name==='AbortError')return}}
 try{await navigator.clipboard.writeText(url);status('Link copiado! Agora você pode enviar para seus colegas.');return}catch(e){}
 status('Copie o endereço desta página para compartilhar com sua turma.');
}
function status(t){const p=document.getElementById('share-feedback');if(p)p.textContent=t}
function notice(n){return '<article class="class-notice">'+(n.pinned?'<span class="class-notice-tag">FIXADO</span>':'')+'<div class="class-notice-inner"><span class="class-notice-ico">'+icons.notice+'</span><div><h3>'+esc(n.title)+'</h3><p>'+esc(n.text)+'</p>'+(n.date?'<time datetime="'+esc(n.date)+'">'+date(n.date)+'</time>':'')+'</div></div></article>'}
function render(data){
 document.title=data.school+' '+data.className+' | Turmas MAT MAT MAT!';
 const notices=Array.isArray(data.notices)?data.notices:[];
 const resources=Array.isArray(data.materials)?data.materials:[];
 const roadmap=Array.isArray(data.studyPlan)?data.studyPlan:[];
 const lessons=Array.isArray(data.relatedLessons)?data.relatedLessons:[];
 root.innerHTML=
 '<header class="class-header"><div class="class-container class-header-row"><a href="/" class="class-logo">'+logo+'<span><strong>MAT MAT MAT!</strong><small>MATEMÁTICA • PROF. JOÃO CAPRI</small></span></a><div class="class-header-actions"><span class="class-class-tag">'+esc(data.school)+' · '+esc(data.className)+'</span><a class="class-return" href="/">Portal gratuito ↗</a></div></div></header>'+
 '<main class="class-main"><section class="class-hero"><div class="class-container class-hero-grid"><div><span class="class-eyebrow"><span class="class-dot"></span> ESPAÇO DA TURMA · '+esc(data.school.toLocaleUpperCase('pt-BR'))+'</span><h1>'+esc(data.className)+'</h1><p>'+esc(data.description||'Materiais, listas e avisos para acompanhar nossas aulas de matemática.')+'</p><div class="class-hero-actions"><a href="#materiais" class="class-cta-primary">'+icons.file+' Ver materiais</a><button id="class-share" type="button" class="class-cta-secondary">'+icons.share+' Compartilhar link</button></div><p id="share-feedback" aria-live="polite" class="class-share-feedback"></p></div><div class="class-hero-art" aria-hidden="true"><div class="class-hero-sheet"><span>PLANO DE ESTUDOS</span><b>MAT<br>MAT<br>MAT<span>!</span></b><small>'+esc(data.school)+' / '+esc(data.className)+'</small></div><span class="class-hero-glyph">∑</span></div></div></section>'+
 '<div class="class-container class-body"><div class="class-overview"><div><span class="class-overview-number">'+resources.length+'</span><span>MATERIAIS PUBLICADOS</span></div><div><span class="class-overview-number">'+notices.length+'</span><span>AVISOS DA TURMA</span></div><div><span class="class-overview-number">'+roadmap.length+'</span><span>ITENS NO ROTEIRO</span></div></div>'+
 '<section id="avisos" class="class-section"><div class="class-section-top"><div><span class="class-section-kicker">01 / ACOMPANHE</span><h2>Quadro de <em>avisos.</em></h2><p>Atualizações e orientações direcionadas à sua turma.</p></div></div><div class="class-notice-grid">'+(notices.length?notices.map(notice).join(''):'<div class="class-empty"><strong>Sem avisos por enquanto.</strong><p>Os recados aparecerão aqui quando forem publicados.</p></div>')+'</div></section>'+
 '<section id="materiais" class="class-section"><div class="class-section-top"><div><span class="class-section-kicker">02 / SUA BIBLIOTECA</span><h2>Materiais da <em>turma.</em></h2><p>Listas, teoria, resumos e arquivos de apoio, tudo em um só lugar.</p></div><span class="class-section-counter">'+resources.length+' '+(resources.length===1?'material':'materiais')+'</span></div>'+
 '<div class="class-filters" role="group" aria-label="Filtrar materiais"><button type="button" data-filter="todos" class="active" aria-pressed="true">Todos</button><button type="button" data-filter="listas" aria-pressed="false">Listas e PDFs</button><button type="button" data-filter="teoria" aria-pressed="false">Teoria e resumos</button><button type="button" data-filter="revisao" aria-pressed="false">Revisão</button><button type="button" data-filter="links" aria-pressed="false">Vídeos e links</button></div>'+
 (resources.length?'<div class="class-material-list" id="class-material-list">'+resources.map(composeCard).join('')+'</div><div class="class-empty" id="class-no-results" hidden><strong>Nenhum material nesta categoria.</strong><p>Experimente selecionar outra opção acima.</p></div>':'<div class="class-empty" id="class-empty-materials"><span class="class-empty-icon">'+icons.file+'</span><strong>Os materiais vão aparecer aqui.</strong><p>Assim que o professor publicar as primeiras listas, PDFs ou resumos, eles ficarão disponíveis nesta página.</p></div>')+
 '</section>'+
 '<section id="roteiro" class="class-section"><div class="class-section-top"><div><span class="class-section-kicker">03 / PRÓXIMOS ESTUDOS</span><h2>Roteiro de <em>estudos.</em></h2><p>O que estamos trabalhando e o que vem pela frente.</p></div></div>'+
 (roadmap.length?'<div class="class-roadmap">'+roadmap.map(function(x,i){const href=safeUrl(x.url);return '<article class="class-roadmap-row"><span>'+String(i+1).padStart(2,'0')+'</span><div><strong>'+esc(x.title)+'</strong>'+(x.description?'<p>'+esc(x.description)+'</p>':'')+'</div>'+(href?'<a href="'+esc(href)+'">Ver conteúdo ↗</a>':'')+'</article>'}).join('')+'</div>':'<div class="class-roadmap-wait"><span>✳</span><p>O roteiro será atualizado conforme nossas aulas avançarem.</p></div>')+'</section>'+
 (lessons.length?'<section class="class-section"><div class="class-section-top"><div><span class="class-section-kicker">04 / CONTINUE ESTUDANDO</span><h2>Aulas do <em>portal.</em></h2></div></div><div class="class-related">'+lessons.map(function(x){const href=safeUrl(x.url);return href?'<a href="'+esc(href)+'"><span>'+esc(x.code||'AULA')+'</span><strong>'+esc(x.title)+'</strong><b>↗</b></a>':''}).join('')+'</div></section>':'')+
 '<section class="class-free"><div><span>✳ FORA DA SALA DE AULA</span><h2>Travou em algum exercício?</h2><p>Explore a biblioteca gratuita MAT MAT MAT! ou peça ajuda personalizada no Exatoo.</p></div><div><a href="/" class="class-free-link">Explorar aulas gratuitas ↗</a><a href="https://app.exatoo.com/" target="_blank" rel="noopener noreferrer" class="class-free-exatoo">Estudar com Exatoo ↗</a></div></section>'+
 '</div></main><footer class="class-footer"><div class="class-container"><strong>MAT MAT MAT!</strong><span>Materiais organizados pelo Prof. João Capri · '+esc(data.school)+' '+esc(data.className)+'</span><a href="/">Voltar ao portal ↗</a></div></footer>';
 const share=document.getElementById('class-share');if(share)share.addEventListener('click',function(){shareRoom(data)});
 const filterButtons=root.querySelectorAll('[data-filter]');filterButtons.forEach(function(b){b.addEventListener('click',function(){
  const filter=b.dataset.filter;
  filterButtons.forEach(function(btn){const on=btn===b;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on))});
  const cards=root.querySelectorAll('.class-material');let count=0;
  cards.forEach(function(card){const visible=filter==='todos'||card.dataset.category===filter;card.hidden=!visible;if(visible)count++});
  const empty=document.getElementById('class-no-results');if(empty)empty.hidden=count>0;
 })});
}
async function boot(){
 try{
  const response=await fetch('/data/turmas/'+id+'.json',{cache:'no-store'});
  if(!response.ok)throw Error('Turma indisponível');
  const payload=await response.json();
  if(!payload||payload.id!==id)throw Error('Dados inconsistentes');
  render(payload);
 }catch(err){
  root.innerHTML='<main class="class-container class-error"><img src="/assets/logo-mat-256.png" width="90" alt="MAT MAT MAT!"><h1>Não foi possível carregar a turma.</h1><p>Tente atualizar a página. Se continuar, avise o professor.</p><a href="/">Ir ao MAT MAT MAT! ↗</a></main>';
  console.error(err);
 }
}
boot();
})();
