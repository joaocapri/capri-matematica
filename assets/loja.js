/* Página de vendas do material impresso (4 volumes).
   Carrinho com a coleção e volumes avulsos; o pedido (itens, nome e CEP) vai pronto para o WhatsApp.
   Nada é cobrado no site. Cupom e texto do desconto vêm de data/livros.json → "oferta". */
(function(){
'use strict';
var item=null,root=null,active=0,cart={kit:0,v1:0,v2:0,v3:0,v4:0},origem=0;
var KEY='matmatmat-carrinho',ANTIGA='matmatmat-kit-quantidade';
function escape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(v){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]})}
function money(n){return typeof n==='number'&&n>=0?n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Sob consulta'}
function restore(){
 try{var c=JSON.parse(localStorage.getItem(KEY)||'null');if(c&&typeof c==='object')Object.keys(cart).forEach(function(k){var n=Number(c[k]);cart[k]=Number.isInteger(n)&&n>=0&&n<=12?n:0});
  else{var v=Number(localStorage.getItem(ANTIGA));if(Number.isInteger(v)&&v>0&&v<=12)cart.kit=v;localStorage.removeItem(ANTIGA);save()}}catch(e){}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
function oferta(){return item&&item.oferta&&item.oferta.ativo&&item.oferta.cupom?item.oferta:null}
function total(){return Object.keys(cart).reduce(function(s,k){return s+cart[k]},0)}
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
function cover(v){return '<svg class="shop-cover-art" viewBox="0 0 360 575" role="img" aria-label="Prévia da capa do volume '+v.id+', '+escape(v.name)+'"><rect width="360" height="575" fill="#F3F1E9"/><text x="32" y="40" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#172524">MAT MAT MAT!</text><text x="277" y="40" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#27322C">VOLUME '+v.id+'</text><path d="M32 58 H328" stroke="#152321" stroke-width="1.1"/><text x="32" y="128" font-family="Arial,sans-serif" font-size="'+(v.name==='Geometria'?51:57)+'" font-weight="900" letter-spacing="-2" fill="#172524">'+escape(v.name)+'</text><text x="32" y="164" font-family="Arial,sans-serif" font-size="12" fill="#192924">Prof. Marco Capri</text><text x="32" y="183" font-family="Arial,sans-serif" font-size="12" fill="#192924">Prof. João Capri</text><rect x="0" y="217" width="360" height="298" fill="'+v.color+'"/>'+motif(v)+'<text x="33" y="495" fill="'+(v.id===2?'#F9F8F0':'#172524')+'" font-family="Arial,sans-serif" font-size="9" font-weight="700">MATEMÁTICA</text><text x="315" y="497" fill="'+(v.id===2?'#F9F8F0':'#172524')+'" font-family="Arial,sans-serif" font-size="26" font-weight="900">'+v.id+'</text><text x="32" y="543" fill="#172524" font-family="Arial,sans-serif" font-size="12" font-weight="900">ENSINO MÉDIO E VESTIBULARES</text></svg>';}

function nomeItem(k){return k==='kit'?'Coleção completa':'Volume '+k.slice(1)+' · '+vol(+k.slice(1)).name}
function descItem(k){return k==='kit'?'Os 4 volumes, '+soma('paginas')+' páginas':vol(+k.slice(1)).paginas+' páginas'}

function details(){
 var v=item.volumes[active],g=document.getElementById('shop-pages');if(!g)return;
 g.innerHTML=(v.amostras||[]).map(function(a,i){return '<button type="button" class="shop-page" data-page="'+i+'" aria-label="Ampliar: '+escape(a.legenda)+'"><img src="'+escape(a.src)+'" alt="'+escape(a.legenda)+' do Volume '+v.id+'" loading="lazy" width="640" height="909"><span>'+escape(a.legenda)+'</span></button>'}).join('');
 root.querySelectorAll('[data-pvol]').forEach(function(b){var is=Number(b.dataset.pvol)===active;b.classList.toggle('selected',is);b.setAttribute('aria-pressed',String(is))});
}
var zoomAt=0;
function zoom(i){
 var v=item.volumes[active],a=v.amostras,d=document.getElementById('shop-zoom');zoomAt=(i+a.length)%a.length;
 d.querySelector('img').src=a[zoomAt].src;d.querySelector('img').alt=a[zoomAt].legenda+' do Volume '+v.id;
 d.querySelector('figcaption').textContent='Volume '+v.id+' · '+a[zoomAt].legenda+' ('+(zoomAt+1)+' de '+a.length+')';
 if(!d.open){if(d.showModal)d.showModal();else d.setAttribute('open','')}
}

function cart_(){
 var n=total(),o=oferta(),keys=Object.keys(cart).filter(function(k){return cart[k]>0});
 document.getElementById('shop-cart').innerHTML=n?keys.map(function(k){
   var cor=k==='kit'?'':'style="--c:'+vol(+k.slice(1)).color+'"';
   return '<div class="shop-cart-item"><span class="shop-cart-dot'+(k==='kit'?' kit':'')+'" '+cor+' aria-hidden="true"></span><div><b>'+escape(nomeItem(k))+'</b><small>'+escape(descItem(k))+'</small></div><div class="shop-count"><button type="button" data-count="-1" data-item="'+k+'" aria-label="Diminuir '+escape(nomeItem(k))+'">−</button><output>'+cart[k]+'</output><button type="button" data-count="1" data-item="'+k+'" aria-label="Aumentar '+escape(nomeItem(k))+'">+</button></div></div>'}).join('')+
   (o&&cart.kit?'<p class="shop-cart-cupom">Cupom <b>'+escape(o.cupom)+'</b> aplicado: '+escape(o.desconto)+' off na coleção</p>':'')
  :'<div class="shop-empty"><p>Nada no pedido ainda.</p><button type="button" class="shop-cta" data-add="kit">Adicionar a coleção completa</button></div>';
 document.getElementById('shop-form').hidden=!n;var lay=root.querySelector('.shop-order-layout');if(lay)lay.classList.toggle('vazio',!n);
 var bar=document.getElementById('shop-bar');if(bar)bar.innerHTML=n?'<span>'+n+' '+(n===1?'item':'itens')+' no pedido</span><a href="#pedido" class="shop-cta">Finalizar</a>':'<span>4 volumes'+(o?' · '+escape(o.desconto)+' off':'')+'</span><button type="button" class="shop-cta" data-add="kit">Quero a coleção</button>';
}
function add(k,scroll){cart[k]=Math.min(12,(cart[k]||0)+1);save();cart_();flash(k);if(scroll!==false)document.getElementById('pedido').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function flash(k){var t=document.getElementById('shop-flash');t.textContent=nomeItem(k)+' no carrinho ✓';t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(flash.t);flash.t=setTimeout(function(){t.classList.remove('show')},2600)}

function message(d){
 var o=oferta(),keys=Object.keys(cart).filter(function(k){return cart[k]>0});
 return ['Olá! Quero o material impresso MAT MAT MAT!',''].concat(keys.map(function(k){return '• '+cart[k]+'× '+nomeItem(k)+(k==='kit'?' (Números, Funções, Álgebra e Geometria)':'')}))
 .concat(o&&cart.kit?['','Cupom: '+o.cupom+' ('+(o.texto||o.desconto)+')']:[])
 .concat(['','Nome: '+d.nome,'CEP: '+d.cep,'','Pode me passar o valor, o frete e o prazo?']).join('\n');
}
function submit(e){e.preventDefault();if(!total())return;var f=e.currentTarget;if(!f.reportValidity())return;var d=Object.fromEntries(new FormData(f));Object.keys(d).forEach(function(k){d[k]=String(d[k]).trim()});var url='https://wa.me/'+item.phone+'?text='+encodeURIComponent(message(d));var link=document.getElementById('shop-manual-wa');link.href=url;document.getElementById('shop-link-backup').hidden=false;window.location.assign(url)}

var CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
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
   '<div class="shop-acoes"><button type="button" class="shop-cta shop-cta-big" data-add="kit">Quero a coleção completa</button>'+(vv?'<button type="button" class="shop-subcta" data-add="v'+vv.id+'">Só o Volume '+vv.id+'</button>':'<a class="shop-link" href="#volumes">Prefiro um volume avulso</a>')+'</div>'+
   '<p class="shop-nota">Você confirma valor e frete no WhatsApp, antes de pagar.</p>'+
  '</div></section>'+

 '<section class="shell shop-dentro" id="por-dentro"><div class="shop-tit"><h2>Veja por dentro</h2><div class="shop-pvols" role="group" aria-label="Escolha o volume">'+V.map(function(v,i){return '<button type="button" data-pvol="'+i+'" aria-pressed="false" style="--c:'+v.color+'">'+v.id+' · '+escape(v.name)+'</button>'}).join('')+'</div></div><div class="shop-pages" id="shop-pages"></div></section>'+

 '<section class="shell shop-volumes" id="volumes"><div class="shop-tit"><h2>Ou só um volume</h2></div><div class="shop-grid">'+
 V.map(function(v){return '<article class="shop-vol'+(origem===v.id?' origem':'')+'"><div class="shop-vol-capa">'+cover(v)+'</div><div class="shop-vol-txt"><span>Volume '+v.id+'</span><h3>'+escape(v.name)+'</h3><p>'+v.tipos+' tipos de questão · '+v.paginas+' páginas</p></div><button type="button" data-add="v'+v.id+'">Adicionar</button></article>'}).join('')+'</div></section>'+

 '<section class="shell shop-order" id="pedido"><div class="shop-tit"><h2>Seu pedido</h2></div><div class="shop-order-layout"><div class="shop-basket" id="shop-cart"></div>'+
 '<form id="shop-form" class="shop-checkout" hidden><div class="shop-fields">'+
 '<label><span>Seu nome</span><input name="nome" autocomplete="name" required maxlength="110"></label>'+
 '<label><span>CEP para o frete</span><input name="cep" autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}-?[0-9]{3}" required maxlength="9" placeholder="86000-000"></label></div>'+
 '<button class="shop-cta shop-cta-big shop-submit" type="submit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 01-12.6 7.4L3.5 20.5l1.6-4.2A8.5 8.5 0 1120.5 11.6z"/></svg>Pedir pelo WhatsApp</button>'+
 '<p class="shop-nota">O WhatsApp abre com o pedido pronto'+(o?', já com o cupom':'')+'. Lá combinamos valor, frete e entrega. O site não guarda seus dados.</p><p id="shop-link-backup" class="shop-nota" hidden>Não abriu? <a id="shop-manual-wa" href="#" rel="noopener noreferrer">Abrir a conversa</a></p></form></div></section>'+

 '<section class="shell shop-faq"><div class="shop-tit"><h2>Dúvidas</h2></div><div class="shop-faq-list">'+
 '<details><summary>Quanto custa?</summary><p>O valor e o frete para o seu CEP vêm na conversa do WhatsApp. Você só paga se confirmar.</p></details>'+
 '<details><summary>O livro repete o que está no site?</summary><p>Não. O site tem as listas de cada aula. O livro tem a teoria de cada módulo e todos os tipos de questão com modelo resolvido, na mesma numeração: o módulo 2.3 do site é o módulo 3 do Volume 2.</p></details>'+
 '<details><summary>O site continua grátis?</summary><p>Sim. Listas, PDFs e caderno digital continuam abertos para todo mundo.</p></details></div></section>'+

 '<div class="shop-bar" id="shop-bar"></div>'+
 '<div class="shop-flash" id="shop-flash" role="status" aria-live="polite"></div>'+
 '<dialog class="shop-zoom" id="shop-zoom" aria-label="Página do livro"><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="shop-zoom-x" aria-label="Fechar">×</button><button type="button" class="shop-zoom-nav prev" aria-label="Página anterior">‹</button><button type="button" class="shop-zoom-nav next" aria-label="Próxima página">›</button></dialog>';

 details();cart_();
 root.addEventListener('click',function(e){
  var t=e.target.closest('button,a');if(!t||!root.contains(t))return;
  if(t.dataset.pvol!=null){active=Number(t.dataset.pvol);details()}
  else if(t.dataset.add){add(t.dataset.add,!t.closest('.shop-vol'))}
  else if(t.dataset.count){var k=t.dataset.item;cart[k]=Math.min(12,Math.max(0,cart[k]+Number(t.dataset.count)));save();cart_()}
  else if(t.dataset.page!=null)zoom(Number(t.dataset.page));
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
