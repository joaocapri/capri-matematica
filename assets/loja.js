/* Loja MAT MAT MAT! • coleção física em 4 volumes.
   Carrinho com kit completo e volumes avulsos; o pedido vai pronto para o WhatsApp.
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
function descItem(k){return k==='kit'?'Os 4 volumes · '+soma('paginas')+' páginas':'Avulso · '+vol(+k.slice(1)).paginas+' páginas'}

function ticket(o){return '<div class="shop-ticket"><div><small>Cupom da coleção</small><strong>'+escape(o.cupom)+'</strong><span>'+escape(o.texto||o.desconto+' de desconto')+'</span></div><button type="button" class="of-copiar shop-copy" data-cupom="'+escape(o.cupom)+'">Copiar</button></div>'}

function details(){
 var v=item.volumes[active];
 document.getElementById('shop-cover-stage').innerHTML='<div class="shop-cover-frame">'+cover(v)+'</div>';
 document.getElementById('shop-current-volume').innerHTML='<strong>Volume '+v.id+' · '+escape(v.name)+'</strong><span>'+v.modulos+' módulos · '+v.tipos+' tipos de questão · '+v.paginas+' páginas</span><p>'+escape(v.themes)+'</p><button type="button" class="shop-mini-add" data-add="v'+v.id+'">Adicionar só o Volume '+v.id+'</button>';
 root.querySelectorAll('[data-vol]').forEach(function(b){var is=Number(b.dataset.vol)===active;b.classList.toggle('selected',is);b.setAttribute('aria-pressed',String(is))});
 gallery();
}
function gallery(){
 var v=item.volumes[active],g=document.getElementById('shop-pages');if(!g)return;
 document.getElementById('shop-pages-title').textContent='Volume '+v.id+' · '+v.name;
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
 document.getElementById('shop-cart-status').textContent=n?n+' '+(n===1?'item':'itens'):'Vazio';
 document.getElementById('shop-cart').innerHTML=n?keys.map(function(k){
   var cor=k==='kit'?'':'style="--c:'+vol(+k.slice(1)).color+'"';
   return '<div class="shop-cart-item"><span class="shop-cart-dot'+(k==='kit'?' kit':'')+'" '+cor+' aria-hidden="true"></span><div><b>'+escape(nomeItem(k))+'</b><small>'+escape(descItem(k))+'</small></div><div class="shop-count"><button type="button" data-count="-1" data-item="'+k+'" aria-label="Diminuir '+escape(nomeItem(k))+'">−</button><output>'+cart[k]+'</output><button type="button" data-count="1" data-item="'+k+'" aria-label="Aumentar '+escape(nomeItem(k))+'">+</button></div></div>'}).join('')+
   (o?'<div class="shop-cart-line shop-cart-cupom"><span>Cupom <b>'+escape(o.cupom)+'</b></span><strong>'+escape(o.desconto)+' off</strong></div>':'')+
   '<div class="shop-cart-line"><span>Valor</span><strong>'+money(item.price)+'</strong></div><div class="shop-cart-line"><span>Frete</span><strong>A calcular</strong></div>'+
   (cart.kit===0&&keys.length>=2?'<p class="shop-cart-tip">Vai levar mais de um volume? A coleção completa costuma sair melhor. Pergunte no atendimento.</p>':'')
  :'<div class="shop-empty"><p>Seu carrinho está vazio.</p><button type="button" class="shop-cta" data-add="kit">Adicionar a coleção completa</button><small>Ou escolha um volume avulso logo acima.</small></div>';
 document.getElementById('shop-checkout').hidden=!n;
 var lbl=document.getElementById('shop-cart-label');if(lbl)lbl.textContent=n?'Ver carrinho ('+n+')':'Ver carrinho';
 var bar=document.getElementById('shop-bar-count');if(bar)bar.textContent=n?n+' no carrinho':'Coleção completa · 4 volumes';
}
function add(k,scroll){cart[k]=Math.min(12,(cart[k]||0)+1);save();cart_();flash(k);if(scroll!==false)document.getElementById('pedido').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function flash(k){var t=document.getElementById('shop-flash');t.textContent=nomeItem(k)+' no carrinho ✓';t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(flash.t);flash.t=setTimeout(function(){t.classList.remove('show')},2600)}

function message(d){
 var o=oferta(),keys=Object.keys(cart).filter(function(k){return cart[k]>0});
 return ['Olá! Quero fazer um pedido da coleção física MAT MAT MAT!','','*ITENS*'].concat(keys.map(function(k){return '• '+cart[k]+'× '+nomeItem(k)+(k==='kit'?' (Números, Funções, Álgebra e Geometria)':'')}))
 .concat(o?['','*CUPOM:* '+o.cupom+' ('+(o.texto||o.desconto)+')']:[])
 .concat(['*Preço e frete:* a confirmar','','*COMPRADOR*','Nome: '+d.nome,'WhatsApp: '+d.telefone,'','*ENTREGA*','CEP: '+d.cep,'Endereço: '+d.logradouro+', nº '+d.numero,'Complemento: '+(d.complemento||'—'),'Bairro: '+d.bairro,'Cidade: '+d.cidade+' / '+d.uf.toUpperCase(),'','Observações: '+(d.observacoes||'—'),'','Pode confirmar preço, frete, prazo e disponibilidade, por favor?']).join('\n');
}
function submit(e){e.preventDefault();if(!total())return;var f=e.currentTarget;if(!f.reportValidity())return;var d=Object.fromEntries(new FormData(f));Object.keys(d).forEach(function(k){d[k]=String(d[k]).trim()});var number=d.telefone.replace(/\D/g,'');if(number.length<10||number.length>13){f.elements.telefone.setCustomValidity('Informe um WhatsApp válido com DDD.');f.elements.telefone.reportValidity();return}f.elements.telefone.setCustomValidity('');var url='https://wa.me/'+item.phone+'?text='+encodeURIComponent(message(d));var link=document.getElementById('shop-manual-wa');link.href=url;document.getElementById('shop-link-backup').hidden=false;window.location.assign(url)}

function view(){
 var o=oferta(),V=item.volumes,vv=origem?vol(origem):null;
 var nums=[[V.length,'volumes'],[soma('modulos'),'módulos'],[soma('tipos'),'tipos de questão'],[soma('paginas'),'páginas']];
 root.innerHTML=
 '<div class="shell shop-back"><a href="/">← Voltar às listas grátis</a><span>MAT MAT MAT! / LIVROS</span></div>'+
 (o?'<div class="shell"><div class="shop-cupom-bar"><span class="shop-cupom-pct" aria-hidden="true">%</span><p><b>'+escape(o.texto||o.desconto+' de desconto')+'</b> com o cupom <code>'+escape(o.cupom)+'</code>. Ele já vai escrito no seu pedido.</p></div></div>':'')+
 (vv?'<div class="shell"><div class="shop-origem" style="--c:'+vv.color+';--t:'+(claro(vv.color)?'#211946':'#fffefa')+'"><span>'+vv.id+'</span><p>O módulo que você estava estudando está no <b>Volume '+vv.id+' · '+escape(vv.name)+'</b>.</p></div></div>':'')+'<section class="shell shop-hero"><div class="shop-covers"><div class="shop-display"><span class="shop-display-tag">Os quatro volumes, no papel</span><div id="shop-cover-stage"></div>'+(o?'<span class="shop-burst" aria-hidden="true"><b>'+escape(o.desconto)+'</b><small>off</small></span>':'')+'</div>'+
 '<div class="shop-tabs" aria-label="Ver os quatro volumes">'+V.map(function(v,i){return '<button type="button" data-vol="'+i+'" aria-pressed="false" aria-label="Ver o volume '+v.id+': '+escape(v.name)+'"><span class="shop-tab-cover" aria-hidden="true">'+cover(v)+'</span><span class="shop-tab-label"><b>'+v.id+'</b> '+escape(v.name)+'</span></button>'}).join('')+'</div>'+
 '<div class="shop-volume-note" id="shop-current-volume"></div><small class="shop-art-disclaimer">Capas em prévia digital. As páginas de dentro, logo abaixo, são do livro de verdade.</small></div>'+
 '<div class="shop-information">'+
 
 '<span class="shop-eyebrow">Coleção física · Ensino médio e vestibulares</span><h1>A matemática toda. <em>Na sua mesa.</em></h1>'+
 '<p class="shop-lead">O site é grátis e segue a mesma numeração dos livros, módulo por módulo. Nos livros você tem a teoria de cada módulo, todos os tipos de questão com modelo resolvido e espaço para resolver.</p>'+
 '<dl class="shop-nums">'+nums.map(function(x){return '<div><dt>'+x[1]+'</dt><dd>'+x[0]+'</dd></div>'}).join('')+'</dl>'+
 '<div class="shop-pricing"><span>Valor da coleção</span><strong>'+money(item.price)+'</strong><small>Preço, disponibilidade e frete são confirmados no WhatsApp antes de qualquer pagamento.</small></div>'+
 (o?ticket(o):'')+
 '<div class="shop-main-actions"><button type="button" class="shop-cta" data-add="kit">Quero a coleção completa</button>'+(vv?'<button type="button" class="shop-subcta" data-add="v'+vv.id+'">Só o Volume '+vv.id+'</button>':'<a href="#volumes" class="shop-subcta">Comprar um volume</a>')+'</div>'+
 '<p class="shop-muted">Nenhum pagamento acontece no site. O pedido vai pronto para o WhatsApp e você revisa antes de enviar. <a href="#pedido" id="shop-cart-label">Ver carrinho</a></p></div></section>'+

 '<section class="shell shop-inside" id="por-dentro"><div class="shop-section-intro"><span>Por dentro</span><h2>Folheie antes <em>de pedir.</em></h2><p>Páginas reais de cada volume: o sumário, a abertura de um módulo, um tipo de questão e as misturadas do fim.</p></div>'+
 '<div class="shop-pvols" role="group" aria-label="Escolha o volume">'+V.map(function(v,i){return '<button type="button" data-pvol="'+i+'" aria-pressed="false" style="--c:'+v.color+'">'+v.id+' · '+escape(v.name)+'</button>'}).join('')+'</div>'+
 '<h3 class="shop-pages-title" id="shop-pages-title"></h3><div class="shop-pages" id="shop-pages"></div></section>'+

 '<section class="shell shop-module"><div class="shop-section-intro"><span>Como cada módulo funciona</span><h2>Do essencial <em>à prova.</em></h2><p>Os '+soma('modulos')+' módulos seguem sempre o mesmo caminho. Quem estuda pelo site reconhece na hora.</p></div>'+
 '<ol class="shop-steps">'+
 '<li><b>O essencial</b><p>A teoria do módulo, direta: definições, fórmulas e as pegadinhas que mais caem.</p></li>'+
 '<li><b>Tipos de questão</b><p>Cada tipo vem com <i>como reconhecer</i>, <i>o caminho</i> em passos e um <i>modelo resolvido</i>.</p></li>'+
 '<li><b>Aquecimento e vestibular</b><p>Logo depois de cada tipo: questões para treinar, das diretas às de vestibular.</p></li>'+
 '<li><b>Misturadas</b><p>No fim, tudo junto, como na prova. Você descobre o tipo e anota no quadradinho.</p></li>'+
 '</ol><p class="shop-qr"><span aria-hidden="true">▣</span>Cada módulo tem um QR code que abre as listas grátis do mesmo módulo aqui no site.</p></section>'+

 '<section class="shell shop-vs"><div class="shop-vs-col"><span>No site · grátis</span><h3>Listas para treinar</h3><ul><li>Lista de fixação e lista de vestibular em cada aula</li><li>Selos de nível: fácil, médio e difícil</li><li>PDF para imprimir e gabarito</li><li>Seu progresso salvo no navegador</li></ul></div>'+
 '<div class="shop-vs-col shop-vs-livro"><span>No livro</span><h3>O módulo inteiro</h3><ul><li>Teoria de cada módulo, sem enrolação</li><li>'+soma('tipos')+' tipos de questão com modelo resolvido</li><li>Misturadas no fim de cada módulo</li><li>Espaço para resolver no próprio livro</li></ul><button type="button" class="shop-cta" data-add="kit">Adicionar a coleção</button></div></section>'+

 '<section class="shell shop-volumes" id="volumes"><div class="shop-section-intro"><span>Volumes avulsos</span><h2>Comece pelo <em>que você precisa.</em></h2><p>Dá para pedir só um volume. A coleção completa cobre o ensino médio inteiro.</p></div><div class="shop-grid">'+
 V.map(function(v,i){return '<article class="shop-volume-card'+(origem===v.id?' origem':'')+'" style="--vol-accent:'+v.color+';--t:'+(claro(v.color)?'#211946':'#fffefa')+'"><span>Volume '+v.id+'</span><h3>'+escape(v.name)+'</h3><p class="shop-vol-nums">'+v.modulos+' módulos · '+v.tipos+' tipos · '+v.paginas+' p.</p><p>'+escape(v.themes)+'</p><div class="shop-vol-actions"><button type="button" data-add="v'+v.id+'">Adicionar</button><button type="button" class="ghost" data-peek="'+i+'">Ver páginas</button></div></article>'}).join('')+'</div></section>'+

 '<section class="shell shop-order" id="pedido"><div class="shop-section-intro"><span>Seu pedido</span><h2>Carrinho e <em>entrega.</em></h2><p>Os dados entram na mensagem do WhatsApp. Você revisa antes de enviar.</p></div><div class="shop-order-layout"><aside class="shop-basket"><div class="shop-basket-head"><h3>Carrinho</h3><span id="shop-cart-status"></span></div><div id="shop-cart"></div></aside><div id="shop-checkout" class="shop-checkout" hidden><h3>Para onde vamos enviar?</h3><p>Com o endereço, calculamos o frete e combinamos a entrega.</p><form id="shop-form"><div class="shop-fields">'+
 '<label><span>Nome completo <i>*</i></span><input name="nome" autocomplete="name" required maxlength="110"></label>'+
 '<label><span>WhatsApp com DDD <i>*</i></span><input name="telefone" type="tel" autocomplete="tel" required maxlength="20" placeholder="(43) 99999-9999"></label>'+
 '<label><span>CEP <i>*</i></span><input name="cep" autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}-?[0-9]{3}" required maxlength="9" placeholder="86000-000"></label>'+
 '<label><span>UF <i>*</i></span><input name="uf" autocomplete="address-level1" required minlength="2" maxlength="2" pattern="[A-Za-z]{2}" placeholder="PR"></label>'+
 '<label><span>Cidade <i>*</i></span><input name="cidade" autocomplete="address-level2" required maxlength="80"></label>'+
 '<label><span>Bairro <i>*</i></span><input name="bairro" required maxlength="90"></label>'+
 '<label class="shop-span2"><span>Rua / avenida <i>*</i></span><input name="logradouro" autocomplete="address-line1" required maxlength="120"></label>'+
 '<label><span>Número <i>*</i></span><input name="numero" required maxlength="20"></label>'+
 '<label><span>Complemento</span><input name="complemento" autocomplete="address-line2" maxlength="90"></label>'+
 '<label class="shop-span2"><span>Observações</span><textarea name="observacoes" rows="3" maxlength="300" placeholder="Opcional"></textarea></label></div>'+
 '<label class="shop-accept"><input type="checkbox" name="consentimento" required><span>Autorizo incluir estes dados na mensagem enviada ao vendedor pelo WhatsApp, para orçamento e entrega. O MAT MAT MAT! não guarda dados pessoais nesta página.</span></label>'+
 '<button class="shop-cta shop-submit" type="submit">Enviar pedido pelo WhatsApp</button><p class="shop-muted">O WhatsApp abre com a mensagem pronta'+(o?', já com o cupom '+escape(o.cupom):'')+'. Revise e toque em <b>Enviar</b>. Valores e prazo ainda serão confirmados.</p><p id="shop-link-backup" hidden>Não abriu? <a id="shop-manual-wa" href="#" rel="noopener noreferrer">Abrir a conversa com o pedido</a></p></form></div></div></section>'+

 '<section class="shell shop-how"><div class="shop-section-intro"><span>Do carrinho à entrega</span><h2>O pedido é <em>bem simples.</em></h2></div><div class="shop-how-grid"><article><span>1</span><h3>Monte o carrinho</h3><p>Coleção completa ou volumes avulsos, na quantidade que quiser.</p></article><article><span>2</span><h3>Informe a entrega</h3><p>Com o CEP e o endereço, calculamos frete e prazo.</p></article><article><span>3</span><h3>Feche no WhatsApp</h3><p>Você recebe preço e condições'+(o?' com o desconto do cupom':'')+' e decide se confirma.</p></article></div></section>'+

 '<section class="shell shop-faq"><div class="shop-section-intro"><span>Dúvidas</span><h2>Sem <em>letras miúdas.</em></h2></div><div class="shop-faq-list">'+
 '<details><summary>Quanto custa?</summary><p>O valor e o frete são confirmados no WhatsApp antes de qualquer pagamento. Nada é cobrado nesta página.</p></details>'+
 (o?'<details><summary>Como uso o cupom '+escape(o.cupom)+'?</summary><p>Não precisa fazer nada: ele já vai escrito na mensagem do pedido. '+escape(o.observacao||'')+'</p></details>':'')+
 '<details><summary>Posso comprar só um volume?</summary><p>Pode. Adicione o volume avulso ao carrinho; valor e disponibilidade são confirmados no atendimento.</p></details>'+
 '<details><summary>O livro tem o mesmo conteúdo do site?</summary><p>Os dois seguem a mesma numeração: o módulo 2.3 do site é o módulo 3 do Volume 2. No site ficam as listas de cada aula. No livro estão a teoria do módulo, todos os tipos de questão com modelo resolvido e as misturadas.</p></details>'+
 '<details><summary>Preciso criar conta?</summary><p>Não. Basta preencher contato e endereço para montar a mensagem.</p></details>'+
 '<details><summary>O site continua gratuito?</summary><p>Sim. As listas, os PDFs e o progresso salvo continuam grátis para todo mundo.</p></details></div></section>'+

 '<section class="shell shop-bottom"><div><span>Grátis sempre</span><h2>Treine no site. <em>Estude no livro.</em></h2><p>As listas de cada aula continuam abertas para todos.</p></div><a href="/explorar/">Ver as listas</a></section>'+
 '<div class="shop-bar" id="shop-bar"><span id="shop-bar-count"></span><a href="#pedido" class="shop-cta">Montar pedido</a></div>'+
 '<div class="shop-flash" id="shop-flash" role="status" aria-live="polite"></div>'+
 '<dialog class="shop-zoom" id="shop-zoom" aria-label="Página do livro"><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="shop-zoom-x" aria-label="Fechar">×</button><button type="button" class="shop-zoom-nav prev" aria-label="Página anterior">‹</button><button type="button" class="shop-zoom-nav next" aria-label="Próxima página">›</button></dialog>';

 details();cart_();
 root.addEventListener('click',function(e){
  var t=e.target.closest('button,a');if(!t||!root.contains(t))return;
  if(t.dataset.vol!=null){active=Number(t.dataset.vol);details()}
  else if(t.dataset.pvol!=null){active=Number(t.dataset.pvol);details()}
  else if(t.dataset.peek!=null){active=Number(t.dataset.peek);details();document.getElementById('por-dentro').scrollIntoView({behavior:'smooth'})}
  else if(t.dataset.add){add(t.dataset.add,!t.closest('.shop-volume-card'))}
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
 document.getElementById('shop-form').elements.telefone.addEventListener('input',function(){this.setCustomValidity('')});
 if('IntersectionObserver' in window){
  var bar=document.getElementById('shop-bar'),vis={};
  var io=new IntersectionObserver(function(es){es.forEach(function(x){vis[x.target.id||x.target.className]=x.isIntersecting});bar.classList.toggle('show',!Object.keys(vis).some(function(k){return vis[k]}))});
  [root.querySelector('.shop-main-actions'),document.getElementById('pedido')].forEach(function(el){vis[el.id||el.className]=true;io.observe(el)});
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
