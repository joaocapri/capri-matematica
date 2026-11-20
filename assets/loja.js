/* Página de vendas do material impresso: só a coleção completa (4 volumes).
   O pedido (quantidade, nome e CEP) vai pronto para o WhatsApp; nada é cobrado no site.
   Cupom e texto do desconto vêm de data/livros.json → "oferta".
   "Veja por dentro" é um livro para folhear: começa na capa e as páginas viram ao arrastar ou tocar. */
(function(){
'use strict';
var item=null,root=null,active=0,cart={kit:0},origem=0;
var KEY='matmatmat-carrinho';
function escape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(v){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]})}
function restore(){try{var c=JSON.parse(localStorage.getItem(KEY)||'null'),n=Number(c&&c.kit);cart.kit=Number.isInteger(n)&&n>=0&&n<=12?n:0}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
function oferta(){return item&&item.oferta&&item.oferta.ativo&&item.oferta.cupom?item.oferta:null}
function vol(n){return item.volumes[n-1]}
function soma(k){return item.volumes.reduce(function(s,v){return s+(v[k]||0)},0)}
function claro(hex){var n=parseInt(hex.slice(1),16);return ((n>>16)*299+((n>>8&255)*587)+((n&255)*114))/1000>150}
function motif(v){
 if(v.id===1){var circles='';for(var i=0;i<9;i++)for(var j=0;j<9;j++){var r=3.6+((i+j*3)%5)*.95;circles+='<ellipse cx="'+(65+j*29)+'" cy="'+(278+i*19)+'" rx="'+r+'" ry="'+(r*1.4)+'" fill="'+(i===2&&j===6?'#F4F2EA':'#1E2926')+'"/>'}return circles;}
 if(v.id===2){var waves='';for(var k=0;k<24;k++){var y=275+k*6;waves+='<path d="M38 '+y+' C98 '+(y+25+k*.8)+' 118 '+(y+96-k*.7)+' 182 '+(y+58-k*.3)+' S274 '+(y-39+k*.5)+' 320 '+(y+22)+'" fill="none" stroke="#EEF2EA" stroke-width=".92" opacity=".9"/>'}return waves+'<circle cx="271" cy="295" r="11" fill="#172B28"/>';}
 if(v.id===3){var lines='';for(var t=0;t<8;t++){var y=315+t*20;lines+='<path d="M66 '+y+' L180 '+(y-63)+' L298 '+y+'" fill="none" stroke="#E7FFF4" stroke-width="1" opacity=".83"/>';}for(var z=0;z<8;z++){var x=80+z*28;lines+='<path d="M'+x+' 315 L'+x+' 468" fill="none" stroke="#E7FFF4" stroke-width=".75" opacity=".63"/>'}return '<polygon points="70,330 182,257 292,330 292,447 182,492 70,447" fill="none" stroke="#E7FFF4" stroke-width="1.15"/>'+lines+'<polygon points="221,324 241,308 263,323 241,338" fill="#192A27"/>';}
 var rings='<ellipse cx="182" cy="381" rx="100" ry="123" fill="none" stroke="#1F2925" stroke-width="1.5"/>';
 for(var m=0;m<7;m++){rings+='<ellipse cx="182" cy="381" rx="'+(14+m*14)+'" ry="123" fill="none" stroke="#27322A" stroke-width=".7"/>';}
 for(var u=0;u<7;u++){var yy=305+u*25;rings+='<ellipse cx="182" cy="'+yy+'" rx="'+(95-Math.abs(yy-381)*.22)+'" ry="'+(7+Math.abs(yy-381)*.05)+'" fill="none" stroke="#28332B" stroke-width=".6"/>';}
 return rings+'<path d="M182 255 L72 462 L294 462 Z" fill="none" stroke="#F8F2EA" stroke-width="2.5"/>';
}
function cover(v,larga){var x0=larga?-22.5:0,w=larga?405:360;return '<svg class="shop-cover-art" viewBox="'+x0+' 0 '+w+' 575" role="img" aria-label="Prévia da capa do volume '+v.id+', '+escape(v.name)+'"><rect x="'+x0+'" width="'+w+'" height="575" fill="#F3F1E9"/><text x="32" y="40" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#172524">MAT MAT MAT!</text><text x="277" y="40" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#27322C">VOLUME '+v.id+'</text><path d="M32 58 H328" stroke="#152321" stroke-width="1.1"/><text x="32" y="128" font-family="Arial,sans-serif" font-size="'+(v.name==='Geometria'?51:57)+'" font-weight="900" letter-spacing="-2" fill="#172524">'+escape(v.name)+'</text><text x="32" y="164" font-family="Arial,sans-serif" font-size="12" fill="#192924">Prof. Marco Capri</text><text x="32" y="183" font-family="Arial,sans-serif" font-size="12" fill="#192924">Prof. João Capri</text><rect x="'+x0+'" y="217" width="'+w+'" height="298" fill="'+v.color+'"/>'+motif(v)+'<text x="33" y="495" fill="'+(v.id===2?'#F9F8F0':'#172524')+'" font-family="Arial,sans-serif" font-size="9" font-weight="700">MATEMÁTICA</text><text x="315" y="497" fill="'+(v.id===2?'#F9F8F0':'#172524')+'" font-family="Arial,sans-serif" font-size="26" font-weight="900">'+v.id+'</text><text x="32" y="543" fill="#172524" font-family="Arial,sans-serif" font-size="12" font-weight="900">ENSINO MÉDIO E VESTIBULARES</text></svg>';}


/* ---------- Folhear ---------- */
var fb={folhas:[],faces:[],k:0,n:0,duplo:true,pw:0,anim:false,largura:0};
var DUR=matchMedia('(prefers-reduced-motion: reduce)').matches?0:700;
function facesDe(v){
 var f=[{html:'<div class="fb-capa">'+cover(v,true)+'</div>',leg:'Capa'},
  {html:'<div class="fb-guarda"><b>MAT MAT MAT!</b><span>Volume '+v.id+' · '+escape(v.name)+'</span><small>'+escape(item.authors||'')+'</small></div>',leg:'Folha de guarda'}];
 (v.amostras||[]).forEach(function(a,i){f.push({html:'<img src="'+escape(a.src)+'" alt="'+escape(a.legenda)+' do Volume '+v.id+'" draggable="false" width="640" height="909"'+(i>1?' loading="lazy"':'')+'>',leg:a.legenda,zoom:i})});
 f.push({html:'<div class="fb-contra"><img src="/assets/logo-mat-256.png" alt="" width="200" height="120" draggable="false"><p>Toda a matemática do ensino médio em 4 livros.</p><small>matcomjoao.com</small></div>',leg:'Contracapa'});
 if(f.length%2)f.splice(f.length-1,0,{html:'<div class="fb-branca"></div>',leg:''});
 return f;
}
function montarLivro(manter){
 var box=document.getElementById('fb');if(!box)return;
 var w=box.clientWidth,duploAntes=fb.duplo,kAntes=fb.k;
 fb.largura=w;fb.duplo=w>=640;
 fb.pw=fb.duplo?Math.min(430,Math.floor((w-16)/2)):Math.min(380,w-24);
 var ph=Math.round(fb.pw*909/640);
 fb.faces=facesDe(item.volumes[active]);
 var folhas=fb.duplo?fb.faces.filter(function(x,i){return i%2===0}).map(function(x,i){return {frente:x,verso:fb.faces[2*i+1]}}):fb.faces.map(function(x){return {frente:x}});
 fb.n=folhas.length;
 fb.k=!manter?0:duploAntes===fb.duplo?Math.min(kAntes,fb.n):fb.duplo?Math.ceil(kAntes/2):Math.min(fb.n-1,kAntes*2);
 box.style.setProperty('--pw',fb.pw+'px');box.style.setProperty('--ph',ph+'px');
 box.classList.toggle('fb-duplo',fb.duplo);
 box.innerHTML='<div class="fb-livro">'+folhas.map(function(f,i){return '<div class="fb-folha" data-i="'+i+'"><div class="fb-face fb-frente">'+f.frente.html+'</div>'+(f.verso?'<div class="fb-face fb-verso">'+f.verso.html+'</div>':'')+'</div>'}).join('')+'</div>';
 fb.livro=box.firstChild;fb.folhas=[].slice.call(box.querySelectorAll('.fb-folha'));
 posicionar(false);
 root.querySelectorAll('[data-pvol]').forEach(function(b){var is=Number(b.dataset.pvol)===active;b.classList.toggle('selected',is);b.setAttribute('aria-pressed',String(is))});
}
function posicionar(anim){
 fb.folhas.forEach(function(el,i){var virada=i<fb.k;el.style.transition=anim?'':'none';el.style.transform='rotateY('+(virada?-180:0)+'deg)';el.style.zIndex=virada?i+1:fb.n-i});
 deslocar(anim);legenda();
}
function deslocar(anim){
 var x=0;if(fb.duplo){if(fb.k===0)x=-fb.pw/2;else if(fb.k===fb.n)x=fb.pw/2}
 fb.livro.style.transition=anim&&DUR?'transform '+DUR+'ms cubic-bezier(.3,.1,.25,1)':'none';fb.livro.style.transform='translateX('+x+'px)';
}
function visiveis(){ // índices das faces à mostra
 if(!fb.duplo)return [Math.min(fb.k,fb.n-1)];
 return [2*fb.k-1,2*fb.k].filter(function(i){return i>=0&&i<fb.faces.length});
}
function legenda(){
 var el=document.getElementById('fb-leg');if(!el)return;
 el.textContent=visiveis().map(function(i){return fb.faces[i].leg}).filter(Boolean).join(' · ');
 var ant=document.getElementById('fb-ant'),pro=document.getElementById('fb-prox'),z=document.getElementById('fb-zoom');
 if(ant)ant.disabled=fb.k===0;if(pro)pro.disabled=fb.duplo?fb.k===fb.n:fb.k>=fb.n-1;
 if(z)z.hidden=!visiveis().some(function(i){return fb.faces[i].zoom!=null});
}
function virar(dir){
 if(fb.anim)return;
 var lim=fb.duplo?fb.n:fb.n-1,i=dir>0?fb.k:fb.k-1;
 if(i<0||i>=fb.n||(dir>0&&fb.k>=lim))return;
 dica(false);
 var el=fb.folhas[i];el.style.zIndex=fb.n+5;el.style.transition=DUR?'transform '+DUR+'ms cubic-bezier(.3,.1,.25,1)':'none';
 el.classList.remove('fb-virando');void el.offsetWidth;el.classList.add('fb-virando');
 fb.k+=dir;fb.anim=true;
 requestAnimationFrame(function(){el.style.transform='rotateY('+(dir>0?-180:0)+'deg)';deslocar(true);legenda()});
 setTimeout(function(){fb.anim=false;el.classList.remove('fb-virando');posicionar(false)},DUR+40);
}
function dica(mostrar){var d=document.getElementById('fb-dica');if(d)d.classList.toggle('on',!!mostrar)}
function ligarLivro(){
 var box=document.getElementById('fb'),d=null;
 box.addEventListener('pointerdown',function(e){if(fb.anim||e.button>0)return;d={x0:e.clientX,y0:e.clientY,id:e.pointerId,ativo:false,dir:0,i:-1,p:0,t0:performance.now()}});
 box.addEventListener('pointermove',function(e){
  if(!d||e.pointerId!==d.id)return;var dx=e.clientX-d.x0;
  if(!d.ativo){
   if(Math.abs(dx)<8)return;
   if(Math.abs(e.clientY-d.y0)>Math.abs(dx)){d=null;return}
   d.dir=dx<0?1:-1;d.i=d.dir>0?fb.k:fb.k-1;
   if(d.i<0||d.i>=fb.n||(d.dir>0&&!fb.duplo&&fb.k>=fb.n-1)){d=null;return}
   d.ativo=true;dica(false);try{box.setPointerCapture(e.pointerId)}catch(x){}
   var f=fb.folhas[d.i];f.style.transition='none';f.style.zIndex=fb.n+5;
  }
  var p=Math.max(0,Math.min(1,Math.abs(dx)/(fb.pw*1.15)));if((dx<0)!==(d.dir>0))p=0;d.p=p;
  var f2=fb.folhas[d.i];f2.style.transform='rotateY('+(d.dir>0?-180*p:-180*(1-p))+'deg)';f2.style.setProperty('--sombra',Math.sin(p*Math.PI).toFixed(3));
 });
 function fim(e){
  if(!d||e.pointerId!==d.id)return;var dd=d;d=null;
  if(!dd.ativo){if(e.type==='pointerup'){var r=box.getBoundingClientRect();virar(e.clientX>=r.left+r.width/2?1:-1)}return}
  var f=fb.folhas[dd.i];f.style.removeProperty('--sombra');
  var ok=dd.p>.35||(performance.now()-dd.t0<280&&dd.p>.06),t=Math.round(DUR*.55);
  if(ok)fb.k+=dd.dir;
  f.style.transition=t?'transform '+t+'ms ease-out':'none';f.style.transform='rotateY('+((dd.dir>0)===ok?-180:0)+'deg)';
  deslocar(true);legenda();fb.anim=true;setTimeout(function(){fb.anim=false;posicionar(false)},t+40);
 }
 box.addEventListener('pointerup',fim);box.addEventListener('pointercancel',fim);
 box.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();virar(1)}else if(e.key==='ArrowLeft'){e.preventDefault();virar(-1)}});
 document.getElementById('fb-ant').addEventListener('click',function(){virar(-1)});
 document.getElementById('fb-prox').addEventListener('click',function(){virar(1)});
 document.getElementById('fb-zoom').addEventListener('click',function(){var i=visiveis().filter(function(x){return fb.faces[x].zoom!=null}).pop();if(i!=null)zoom(fb.faces[i].zoom)});
 var t=0;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(function(){var w=document.getElementById('fb').clientWidth;if(Math.abs(w-fb.largura)>20)montarLivro(true)},150)});
}
var zoomAt=0;
function zoom(i){
 var v=item.volumes[active],a=v.amostras,d=document.getElementById('shop-zoom');zoomAt=(i+a.length)%a.length;
 d.querySelector('img').src=a[zoomAt].src;d.querySelector('img').alt=a[zoomAt].legenda+' do Volume '+v.id;
 d.querySelector('figcaption').textContent='Volume '+v.id+' · '+a[zoomAt].legenda+' ('+(zoomAt+1)+' de '+a.length+')';
 if(!d.open){if(d.showModal)d.showModal();else d.setAttribute('open','')}
}

/* ---------- Pedido ---------- */
function cart_(){
 var n=cart.kit,o=oferta();
 document.getElementById('shop-cart').innerHTML=n?'<div class="shop-cart-item"><span class="shop-cart-dot kit" aria-hidden="true"></span><div><b>Coleção completa</b><small>Os 4 volumes, '+soma('paginas')+' páginas</small></div><div class="shop-count"><button type="button" data-count="-1" aria-label="Diminuir a quantidade">−</button><output>'+n+'</output><button type="button" data-count="1" aria-label="Aumentar a quantidade">+</button></div></div>'
   +(o?'<p class="shop-cart-cupom">Cupom <b>'+escape(o.cupom)+'</b> aplicado: '+escape(o.desconto)+' off</p>':'')
  :'<div class="shop-empty"><p>Nada no pedido ainda.</p><button type="button" class="shop-cta" data-add="kit">Adicionar a coleção completa</button></div>';
 document.getElementById('shop-form').hidden=!n;var lay=root.querySelector('.shop-order-layout');if(lay)lay.classList.toggle('vazio',!n);
 var bar=document.getElementById('shop-bar');if(bar)bar.innerHTML=n?'<span>Coleção completa'+(n>1?' ×'+n:'')+'</span><a href="#pedido" class="shop-cta">Finalizar</a>':'<span>4 volumes'+(o?' · '+escape(o.desconto)+' off':'')+'</span><button type="button" class="shop-cta" data-add="kit">Quero a coleção</button>';
}
function add(){if(!cart.kit)cart.kit=1;save();cart_();flash();document.getElementById('pedido').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function flash(){var t=document.getElementById('shop-flash');t.textContent='Coleção completa no pedido ✓';t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(flash.t);flash.t=setTimeout(function(){t.classList.remove('show')},2600)}
function message(d){
 var o=oferta();
 return ['Olá! Quero o material impresso MAT MAT MAT!','','• '+cart.kit+'× Coleção completa (Números, Funções, Álgebra e Geometria)']
 .concat(o?['','Cupom: '+o.cupom+' ('+(o.texto||o.desconto)+')']:[])
 .concat(['','Nome: '+d.nome,'CEP: '+d.cep,'','Pode me passar o valor, o frete e o prazo?']).join('\n');
}
function submit(e){e.preventDefault();if(!cart.kit)return;var f=e.currentTarget;if(!f.reportValidity())return;var d=Object.fromEntries(new FormData(f));Object.keys(d).forEach(function(k){d[k]=String(d[k]).trim()});var url='https://wa.me/'+item.phone+'?text='+encodeURIComponent(message(d));var link=document.getElementById('shop-manual-wa');link.href=url;document.getElementById('shop-link-backup').hidden=false;window.location.assign(url)}

var CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
var SETA='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
function faq(o){
 var autores=item.authors?escape(item.authors).replace(/^Prof\. /,'Os professores ').replace(' e Prof. ',' e '):'';
 return [
  ['Quanto custa?','O valor e o frete para o seu CEP vêm na conversa do WhatsApp. Você só paga se confirmar.'],
  ['Dá para comprar um volume só?','Não. O material é vendido só como coleção completa, com os 4 volumes: Números, Funções, Álgebra e Geometria.'],
  ['Como é o material?','São 4 volumes no formato A5, com encadernação wire-o, que abre reto na mesa. Ao todo são '+soma('paginas')+' páginas, com espaço para resolver no próprio livro.'],
  ['Para quem é?','Para quem está no ensino médio ou se preparando para o Enem e os vestibulares. Os 4 volumes vão do básico às questões de prova.'],
  ['Como são o pagamento e a entrega?','Depois que você envia o pedido, combinamos tudo pelo WhatsApp: valor, forma de pagamento, frete e prazo para o seu CEP. Nada é cobrado nesta página.'],
  o?['Como uso o cupom?','Não precisa fazer nada: o cupom '+escape(o.cupom)+' já vai escrito na mensagem do pedido. '+escape(o.observacao||'')]:null,
  ['O livro repete o que está no site?','Não. O site tem as listas de cada aula. O livro tem a teoria de cada módulo e todos os tipos de questão com modelo resolvido, na mesma numeração: o módulo 2.3 do site é o módulo 3 do Volume 2.'],
  autores?['Quem escreveu?',autores+'.']:null,
  ['O site continua grátis?','Sim. Listas, PDFs e caderno digital continuam abertos para todo mundo.']
 ].filter(Boolean).map(function(x){return '<details><summary>'+x[0]+'</summary><p>'+x[1]+'</p></details>'}).join('');
}
function view(){
 var o=oferta(),V=item.volumes,vv=origem?vol(origem):null;
 root.innerHTML=
 '<section class="shell shop-hero">'+
  '<div class="shop-leque" aria-label="Os quatro volumes">'+V.map(function(v,i){return '<div class="shop-leque-capa c'+i+'">'+cover(v)+'</div>'}).join('')+(o?'<span class="shop-burst" aria-hidden="true"><b>'+escape(o.desconto)+'</b><small>off</small></span>':'')+'<small class="shop-previa">Capas em prévia</small></div>'+
  '<div class="shop-info">'+
   (vv?'<p class="shop-origem" style="--c:'+vv.color+';--t:'+(claro(vv.color)?'#211946':'#fffefa')+'"><span>'+vv.id+'</span>O módulo que você estudava está no Volume '+vv.id+', '+escape(vv.name)+'.</p>':'')+
   '<h1>Toda a matemática do ensino médio em 4 livros.</h1>'+
   '<p class="shop-lead">Na mesma ordem das aulas do site, com o que o site não tem.</p>'+
   '<ul class="shop-fatos"><li>'+CHECK+'<span><b>'+soma('tipos')+' tipos de questão</b> com modelo resolvido</span></li><li>'+CHECK+'<span>Teoria direta de cada um dos <b>'+soma('modulos')+' módulos</b></span></li><li>'+CHECK+'<span><b>'+soma('paginas')+' páginas</b> com espaço para resolver</span></li></ul>'+
   (o?'<div class="shop-cupom"><span>Cupom <b>'+escape(o.cupom)+'</b>: '+escape(o.texto||o.desconto+' de desconto')+'</span><button type="button" class="of-copiar shop-copy" data-cupom="'+escape(o.cupom)+'">Copiar</button></div>':'')+
   '<div class="shop-acoes"><button type="button" class="shop-cta shop-cta-big" data-add="kit">Quero a coleção completa</button><a class="shop-link" href="#por-dentro">Folhear antes</a></div>'+
   '<p class="shop-nota">Você confirma valor e frete no WhatsApp, antes de pagar.</p>'+
  '</div></section>'+

 '<section class="shell shop-dentro" id="por-dentro"><div class="shop-tit"><h2>Veja por dentro</h2><div class="shop-pvols" role="group" aria-label="Escolha o volume">'+V.map(function(v,i){return '<button type="button" data-pvol="'+i+'" aria-pressed="false" style="--c:'+v.color+'">'+v.id+' · '+escape(v.name)+'</button>'}).join('')+'</div></div>'+
 '<div class="fb" id="fb" tabindex="0" role="region" aria-roledescription="livro" aria-label="Folhear o livro. Use as setas para virar as páginas."></div>'+
 '<div class="fb-nav"><button type="button" class="fb-seta" id="fb-ant" aria-label="Página anterior">'+SETA+'</button><span class="fb-leg" id="fb-leg" aria-live="polite"></span><button type="button" class="fb-seta fb-seta-prox" id="fb-prox" aria-label="Próxima página">'+SETA+'</button></div>'+
 '<div class="fb-rodape"><span class="fb-dica on" id="fb-dica">Arraste para o lado para virar a página</span><button type="button" class="fb-ampliar" id="fb-zoom">Ampliar a página</button></div></section>'+

 '<section class="shell shop-order" id="pedido"><div class="shop-tit"><h2>Seu pedido</h2></div><div class="shop-order-layout"><div class="shop-basket" id="shop-cart"></div>'+
 '<form id="shop-form" class="shop-checkout" hidden><div class="shop-fields">'+
 '<label><span>Seu nome</span><input name="nome" autocomplete="name" required maxlength="110"></label>'+
 '<label><span>CEP para o frete</span><input name="cep" autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}-?[0-9]{3}" required maxlength="9" placeholder="86000-000"></label></div>'+
 '<button class="shop-cta shop-cta-big shop-submit" type="submit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 01-12.6 7.4L3.5 20.5l1.6-4.2A8.5 8.5 0 1120.5 11.6z"/></svg>Pedir pelo WhatsApp</button>'+
 '<p class="shop-nota">O WhatsApp abre com o pedido pronto'+(o?', já com o cupom':'')+'. Lá combinamos valor, frete e entrega. O site não guarda seus dados.</p><p id="shop-link-backup" class="shop-nota" hidden>Não abriu? <a id="shop-manual-wa" href="#" rel="noopener noreferrer">Abrir a conversa</a></p></form></div></section>'+

 '<section class="shell shop-faq"><div class="shop-tit"><h2>Dúvidas</h2></div><div class="shop-faq-list">'+faq(o)+'</div></section>'+

 '<div class="shop-bar" id="shop-bar"></div>'+
 '<div class="shop-flash" id="shop-flash" role="status" aria-live="polite"></div>'+
 '<dialog class="shop-zoom" id="shop-zoom" aria-label="Página do livro"><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="shop-zoom-x" aria-label="Fechar">×</button><button type="button" class="shop-zoom-nav prev" aria-label="Página anterior">‹</button><button type="button" class="shop-zoom-nav next" aria-label="Próxima página">›</button></dialog>';

 montarLivro(false);ligarLivro();cart_();
 root.addEventListener('click',function(e){
  var t=e.target.closest('button,a');if(!t||!root.contains(t))return;
  if(t.dataset.pvol!=null){if(Number(t.dataset.pvol)!==active){active=Number(t.dataset.pvol);montarLivro(false)}}
  else if(t.dataset.add)add();
  else if(t.dataset.count){cart.kit=Math.min(12,Math.max(0,cart.kit+Number(t.dataset.count)));save();cart_()}
 });
 var z=document.getElementById('shop-zoom');
 z.querySelector('.shop-zoom-x').addEventListener('click',function(){z.close()});
 z.querySelector('.prev').addEventListener('click',function(){zoom(zoomAt-1)});
 z.querySelector('.next').addEventListener('click',function(){zoom(zoomAt+1)});
 z.addEventListener('click',function(e){if(e.target===z)z.close()});
 z.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')zoom(zoomAt-1);if(e.key==='ArrowRight')zoom(zoomAt+1)});
 document.getElementById('shop-form').addEventListener('submit',submit);
 if('IntersectionObserver' in window){
  var bar=document.getElementById('shop-bar'),vis={};
  var io=new IntersectionObserver(function(es){es.forEach(function(x){vis[x.target.id||x.target.className]=x.isIntersecting});bar.classList.toggle('show',!Object.keys(vis).some(function(k){return vis[k]}))});
  [root.querySelector('.shop-acoes'),document.getElementById('pedido')].forEach(function(el){vis[el.id||el.className]=true;io.observe(el)});
 }
}
async function init(el){
 root=el;restore();
 var p=new URLSearchParams(location.search),v=Number(p.get('volume'));
 try{var r=await fetch('/data/livros.json');if(!r.ok)throw Error('Dados indisponíveis');item=await r.json();if(item.volumes.length!==4||!/^\d{12,13}$/.test(item.phone))throw Error('Cadastro incompleto');
  if(v>=1&&v<=4){origem=v;active=v-1}
  view();
  if(location.hash){var alvo=document.getElementById(location.hash.slice(1));if(alvo)alvo.scrollIntoView()}
 }catch(e){root.innerHTML='<section class="shell shop-error"><h1>Não foi possível carregar a coleção.</h1><a href="/">Voltar ao início</a></section>';console.error(e)}
}
window.MatShop={init:init};
})();
