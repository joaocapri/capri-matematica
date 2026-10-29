/* MAT MAT MAT! • ofertas da coleção física dentro do site.
   Notificações (toasts), um modal de cupom e um selo de cupom fixo.
   Tudo é verdadeiro: sem "fulano acabou de comprar" e sem contagem regressiva.
   O cupom e o texto do desconto vêm de data/livros.json → "oferta".

   Regras de frequência
   - toasts: no máximo 3 por sessão, com 60 s de intervalo; se a pessoa fechar 2, param na sessão.
   - modal: no máximo 1 por sessão; "Agora não" silencia modais por 3 dias; clicar na oferta, por 7 dias.
   - nada aparece na loja (/livros/), nas turmas, na impressão, ou enquanto a pessoa digita.
   Testes automatizados (navigator.webdriver) não veem ofertas, a menos que a URL tenha ?ofertas=on.
   Para revisar: ?ofertas=on (tempos curtos) e ?ofertas=reset (zera o histórico). */
(function(){
'use strict';
var LKEY='matmat-ofertas',SKEY='matmat-ofertas-sessao';
var MIN=60e3,DIA=864e5;
var params=new URLSearchParams(location.search);
var forcar=params.get('ofertas')==='on';
var T=forcar?{contexto:3e3,engaja:8e3,toast:4e3}:{contexto:20e3,engaja:90e3,toast:MIN};
var reduz=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var cfg=null,vols={},blocos={},fila=[],pronto=false,ctx={tipo:'outro'},inicioPagina=Date.now();
var visivelDesde=document.hidden?0:Date.now();

function ler(k,st){try{return JSON.parse(st.getItem(k))||{}}catch(e){return {}}}
function gravar(k,st,o){try{st.setItem(k,JSON.stringify(o))}catch(e){}}
var L=ler(LKEY,localStorage),S=ler(SKEY,sessionStorage);
function salvar(){gravar(LKEY,localStorage,L);gravar(SKEY,sessionStorage,S)}
if(params.get('ofertas')==='reset'){L={};S={};salvar()}
var desligado=(navigator.webdriver&&!forcar)||/^\/(turmas|imprimir)\//.test(location.pathname);

/* visitas: uma visita nova depois de 30 min sem abrir o site */
var agora=Date.now();
if(!S.iniciada){S.iniciada=agora;S.toasts=0;S.fechados=0;S.ativo=0;if(!L.ultima||agora-L.ultima>30*MIN)L.visitas=(L.visitas||0)+1}
L.ultima=agora;salvar();

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function oferta(){return cfg&&cfg.oferta&&cfg.oferta.ativo&&cfg.oferta.cupom?cfg.oferta:null}
function claro(hex){var n=parseInt(hex.slice(1),16);return ((n>>16)*299+((n>>8&255)*587)+((n&255)*114))/1000>150}
function lojaHref(vol){var o=oferta(),q=[];if(vol)q.push('volume='+vol);if(o)q.push('cupom='+encodeURIComponent(o.cupom));return '/livros/'+(q.length?'?'+q.join('&'):'')}
function digitando(){var a=document.activeElement;return a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable)}
function modalAberto(){return !!document.querySelector('.of-fundo')}

/* ---------- peças visuais ---------- */
function capa(vol){
 var v=vols[vol];if(!v)return '<span class="of-capa of-capa-colecao" aria-hidden="true">'+[1,2,3,4].map(function(i){var c=vols[i]&&vols[i].color||'#d3fc61';return '<i style="background:'+c+'"></i>'}).join('')+'</span>';
 return '<span class="of-capa" aria-hidden="true" style="--c:'+v.color+';--t:'+(claro(v.color)?'#211946':'#fffefa')+'"><b>'+v.id+'</b><small>'+esc(v.name)+'</small></span>';
}
function estrela(texto,sub){
 var p=[],n=18;for(var i=0;i<n*2;i++){var r=i%2?41:50,a=Math.PI*i/n;p.push((50+r*Math.cos(a)).toFixed(1)+','+(50+r*Math.sin(a)).toFixed(1))}
 return '<span class="of-selo" aria-hidden="true"><svg viewBox="0 0 100 100"><polygon points="'+p.join(' ')+'"/></svg><b>'+esc(texto)+'</b><small>'+esc(sub)+'</small></span>';
}
function ticket(o){
 return '<div class="of-ticket"><div><small>Seu cupom</small><strong>'+esc(o.cupom)+'</strong><span>'+esc(o.texto||o.desconto+' de desconto')+'</span></div><button type="button" class="of-copiar" data-cupom="'+esc(o.cupom)+'">Copiar</button></div>';
}

/* ---------- toast ---------- */
var pilha=null;
function areaToasts(){if(!pilha){pilha=document.createElement('div');pilha.className='of-pilha';pilha.setAttribute('role','status');pilha.setAttribute('aria-live','polite');document.body.appendChild(pilha)}return pilha}
function podeToast(prior){
 if(desligado||modalAberto()||digitando())return false;
 if((S.toasts||0)>=3||(S.fechados||0)>=2)return false;
 if(!prior&&S.ultimoToast&&Date.now()-S.ultimoToast<T.toast)return false;
 return true;
}
function toast(o){
 if(!podeToast(o.prioridade))return false;
 var area=areaToasts();var velho=area.querySelector('.of-toast');if(velho)velho.remove();
 S.toasts=(S.toasts||0)+1;S.ultimoToast=Date.now();salvar();
 var el=document.createElement('div');el.className='of-toast'+(o.tom?' of-'+o.tom:'');
 el.innerHTML=capa(o.volume)+'<div class="of-toast-corpo"><strong>'+o.titulo+'</strong><p>'+o.texto+'</p><a class="of-btn" href="'+o.href+'" data-of-cta>'+esc(o.cta)+'</a></div><button type="button" class="of-x" aria-label="Fechar aviso">×</button><i class="of-tempo" aria-hidden="true"></i>';
 area.appendChild(el);
 var vida=14e3,restante=vida,inicio=Date.now(),timer=null,barra=el.querySelector('.of-tempo');
 function sair(fechou){if(!el.isConnected)return;clearTimeout(timer);if(fechou){S.fechados=(S.fechados||0)+1;salvar()}el.classList.add('of-saindo');setTimeout(function(){el.remove()},reduz?0:260)}
 function rodar(){inicio=Date.now();barra.style.transition='none';barra.style.transform='scaleX('+(restante/vida)+')';void barra.offsetWidth;barra.style.transition='transform '+restante+'ms linear';barra.style.transform='scaleX(0)';timer=setTimeout(function(){sair(false)},restante)}
 function pausar(){clearTimeout(timer);restante=Math.max(1500,restante-(Date.now()-inicio));var w=getComputedStyle(barra).transform;barra.style.transition='none';barra.style.transform=w}
 el.addEventListener('mouseenter',pausar);el.addEventListener('mouseleave',rodar);el.addEventListener('focusin',pausar);
 el.querySelector('.of-x').addEventListener('click',function(){sair(true)});
 el.querySelector('[data-of-cta]').addEventListener('click',function(){L.clicouAte=Date.now()+7*DIA;salvar()});
 requestAnimationFrame(function(){el.classList.add('of-entra');rodar()});
 return true;
}

/* ---------- modal ---------- */
function podeModal(){
 if(desligado||!oferta()||modalAberto()||digitando())return false;
 if(S.modal)return false;
 var ate=Math.max(L.modalAte||0,L.clicouAte||0);return Date.now()>ate;
}
function modal(o){
 if(!podeModal())return false;
 S.modal=1;L.cupomVisto=1;salvar();
 if(pilha)pilha.innerHTML='';
 var of=oferta(),antes=document.activeElement;
 var fundo=document.createElement('div');fundo.className='of-fundo';
 fundo.innerHTML='<div class="of-modal" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="of-titulo" aria-describedby="of-texto">'+estrela(of.desconto,'off')+
  '<div class="of-modal-topo">'+(o.placar?'<span class="of-placar">'+o.placar+'</span>':capa(o.volume))+'<h2 id="of-titulo">'+o.titulo+'</h2></div>'+
  '<div class="of-modal-corpo"><p id="of-texto">'+o.texto+'</p>'+ticket(of)+
  '<a class="of-btn of-btn-grande" href="'+o.href+'" data-of-cta>'+esc(o.cta)+'</a>'+
  '<button type="button" class="of-depois">Agora não</button><small class="of-nota">'+esc(of.observacao||'')+'</small></div>'+
  '<button type="button" class="of-x of-x-modal" aria-label="Fechar">×</button></div>';
 document.body.appendChild(fundo);document.documentElement.classList.add('of-travado');
 var caixa=fundo.querySelector('.of-modal');
 function fechar(dias){if(dias){L.modalAte=Date.now()+dias*DIA;salvar()}document.removeEventListener('keydown',tecla);fundo.classList.add('of-saindo');document.documentElement.classList.remove('of-travado');setTimeout(function(){fundo.remove();pilula();if(antes&&antes.focus)antes.focus()},reduz?0:220)}
 function tecla(e){
  if(e.key==='Escape'){e.preventDefault();fechar(1)}
  if(e.key==='Tab'){var f=caixa.querySelectorAll('a,button');var a=f[0],z=f[f.length-1];if(document.activeElement===caixa){e.preventDefault();(e.shiftKey?z:a).focus()}else if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
 }
 document.addEventListener('keydown',tecla);
 fundo.addEventListener('click',function(e){if(e.target===fundo)fechar(1)});
 fundo.querySelector('.of-depois').addEventListener('click',function(){fechar(3)});
 fundo.querySelector('.of-x-modal').addEventListener('click',function(){fechar(1)});
 fundo.querySelector('[data-of-cta]').addEventListener('click',function(){L.clicouAte=Date.now()+7*DIA;salvar()});
 requestAnimationFrame(function(){fundo.classList.add('of-entra');caixa.focus({preventScroll:true})});
 return true;
}

/* ---------- selo fixo do cupom ---------- */
function pilula(){
 var of=oferta();
 if(desligado||!of||!L.cupomVisto||S.semPilula||document.querySelector('.of-pilula'))return;
 var el=document.createElement('div');el.className='of-pilula';
 el.innerHTML='<a href="'+lojaHref(ctx.volume)+'" data-of-cta><span class="of-pilula-ic" aria-hidden="true">%</span><span><b>'+esc(of.cupom)+'</b> '+esc(of.desconto)+' off nos livros</span></a><button type="button" aria-label="Esconder cupom">×</button>';
 el.querySelector('button').addEventListener('click',function(){S.semPilula=1;salvar();el.remove()});
 el.querySelector('a').addEventListener('click',function(){L.clicouAte=Date.now()+7*DIA;salvar()});
 document.body.appendChild(el);
}

/* copiar cupom (modal e loja) */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('.of-copiar');if(!b)return;
 var c=b.dataset.cupom,ok=function(){b.textContent='Copiado ✓';b.classList.add('ok');setTimeout(function(){b.textContent='Copiar';b.classList.remove('ok')},2200)};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(c).then(ok,ok);else{var t=document.createElement('textarea');t.value=c;document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(err){}t.remove();ok()}
});

/* ---------- textos ---------- */
function infoModulo(id){var b=blocos[id];if(!b)return null;return {titulo:b.title,tipos:(b.tipos||[]).length,extra:b.extra,volume:b.front}}
function cupomFrase(){var o=oferta();return o?' Com o cupom <b>'+esc(o.cupom)+'</b>, '+esc(o.desconto)+' off.':''}
function msgContexto(){
 var m=infoModulo(ctx.modulo);if(!m||m.extra)return null;
 var v=vols[m.volume];if(!v)return null;
 return {volume:m.volume,titulo:esc(m.titulo)+' está no Volume '+m.volume,
  texto:'No livro, esse módulo tem '+(m.tipos?m.tipos+' tipos de questão, cada um ':'os tipos de questão ')+'com modelo resolvido, aquecimento e vestibular. Tudo no papel.',
  cta:'Ver o Volume '+m.volume,href:lojaHref(m.volume)};
}

/* ---------- gatilhos ---------- */
function aoPagina(d){
 ctx=d||{tipo:'outro'};inicioPagina=Date.now();
 if(ctx.tipo==='home'&&(L.visitas||0)>=3&&!S.boasVindas){
  S.boasVindas=1;salvar();
  setTimeout(function(){
   var o=oferta();
   toast({tom:'roxo',titulo:L.viuLoja?'Ainda pensando nos livros?':'Que bom te ver de novo!',
    texto:(L.viuLoja?'Os quatro volumes seguem a mesma ordem do site: Números, Funções, Álgebra e Geometria.':'Você já é de casa por aqui. Que tal ter a matemática toda no papel, em 4 volumes?')+(o?' O cupom <b>'+esc(o.cupom)+'</b> continua valendo.':''),
    cta:'Conhecer a coleção',href:lojaHref()});
  },forcar?1500:6e3);
 }
 if((ctx.tipo==='aula'||ctx.tipo==='modulo')&&ctx.modulo){
  var chave=ctx.modulo;L.vistos=L.vistos||{};
  if(L.vistos[chave]&&Date.now()-L.vistos[chave]<DIA)return;
  var mod=ctx.modulo;
  setTimeout(function(){
   if(ctx.modulo!==mod||document.hidden)return;
   var msg=msgContexto();if(msg&&toast(msg)){L.vistos[chave]=Date.now();salvar()}
  },T.contexto);
 }
}
function aoExercicio(d){
 if(!d||d.marca==='visto')return;
 S.exercicios=(S.exercicios||0)+1;salvar();
 if(S.exercicios===5){
  var m=infoModulo(d.modulo);
  toast({volume:d.volume,tom:'lima',titulo:'5 questões na conta!',
   texto:(m&&!m.extra?'Gostou de treinar '+esc(m.titulo.toLowerCase())+'? No Volume '+d.volume+' tem o módulo completo, com espaço pra resolver.':'Gostou de treinar? A coleção traz cada módulo completo, com espaço pra resolver.')+cupomFrase(),
   cta:'Quero o livro',href:lojaHref(m&&!m.extra?d.volume:null)});
 }
}
function aoProva(d){
 if(!d||!d.total)return;
 var pct=d.acertos/d.total,placar=d.acertos+'/'+d.total;
 var titulo=pct>=.7?'Mandou bem demais!':pct>=.4?'Bom treino!':'Valeu o esforço!';
 var m=infoModulo(d.modulo),noLivro=m&&!m.extra;
 var texto=(pct>=.7?'Você acertou '+d.acertos+' de '+d.total+'. ':'Você acertou '+d.acertos+' de '+d.total+', e é errando que a gente aprende. ')+
  (noLivro?'Pra seguir treinando no papel, o Volume '+d.volume+' tem '+esc(m.titulo)+' com todos os tipos de questão.':'Pra seguir treinando no papel, a coleção tem os quatro volumes com tudo organizado.');
 if(modal({placar:placar,titulo:titulo,texto:texto,cta:'Ver a coleção com desconto',href:lojaHref(noLivro?d.volume:null)}))return;
 toast({volume:noLivro?d.volume:null,prioridade:true,tom:'lima',titulo:titulo+' '+placar,texto:texto+cupomFrase(),cta:'Ver o livro',href:lojaHref(noLivro?d.volume:null)});
}
function aoPdf(d){
 var m=d&&infoModulo(d.modulo),noLivro=m&&!m.extra;
 setTimeout(function(){
  toast({volume:noLivro?d.volume:null,titulo:'Lista baixada ✓',
   texto:'Curte estudar no papel? A coleção MAT MAT MAT! tem 4 volumes e 983 páginas'+(noLivro?', e '+esc(m.titulo)+' está no Volume '+d.volume:'')+'.'+cupomFrase(),
   cta:'Ver a coleção',href:lojaHref(noLivro?d.volume:null)});
 },1200);
}

/* tempo ativo + rolagem: convite com cupom depois de 90 s de estudo */
var rolou=0;
function medirRolagem(){var h=document.documentElement.scrollHeight-innerHeight;if(h>0)rolou=Math.max(rolou,scrollY/h)}
addEventListener('scroll',medirRolagem,{passive:true});
document.addEventListener('visibilitychange',function(){if(document.hidden){if(visivelDesde){S.ativo=(S.ativo||0)+(Date.now()-visivelDesde);salvar()}visivelDesde=0}else visivelDesde=Date.now()});
function ativoMs(){return (S.ativo||0)+(visivelDesde?Date.now()-visivelDesde:0)}
setInterval(function(){
 if(!pronto||S.modal||desligado)return;
 if(ativoMs()<T.engaja||rolou<.5||Date.now()-inicioPagina<(forcar?2e3:25e3))return;
 if(!/^(aula|modulo|volume|catalogo|home)$/.test(ctx.tipo))return;
 var m=infoModulo(ctx.modulo),noLivro=m&&!m.extra;
 modal({volume:noLivro?m.volume:null,titulo:'Estudando firme? Leva o MAT pro papel.',
  texto:'A coleção tem 4 volumes na mesma ordem do site, com teoria direta, modelo resolvido e muita questão de vestibular.',
  cta:noLivro?'Ver o Volume '+m.volume:'Ver a coleção',href:lojaHref(noLivro?m.volume:null)});
},4e3);

/* intenção de saída (computador): uma vez por sessão */
document.addEventListener('mouseout',function(e){
 if(e.relatedTarget||e.clientY>8||!pronto||S.saida)return;
 if(!matchMedia('(pointer:fine)').matches)return;
 if(Date.now()-inicioPagina<(forcar?1e3:15e3))return;
 S.saida=1;salvar();
 var o=oferta();if(!o)return;
 modal({volume:ctx.volume,titulo:'Antes de ir: '+esc(o.desconto)+' off nos livros',
  texto:'O site continua grátis. Se quiser a matemática toda no papel, use o cupom no pedido pelo WhatsApp.',
  cta:'Usar meu cupom',href:lojaHref(ctx.volume)});
});

/* ---------- ligação com o site ---------- */
function ouvir(n,fn){document.addEventListener('mat:'+n,function(e){if(pronto)fn(e.detail);else fila.push([fn,e.detail])})}
ouvir('pagina',aoPagina);ouvir('exercicio',aoExercicio);ouvir('prova-fim',aoProva);ouvir('pdf',aoPdf);

async function carregar(){
 if(document.body&&document.body.dataset.view==='loja'){L.viuLoja=1;salvar();return}
 if(desligado)return;
 try{
  var r=await Promise.all([fetch('/data/livros.json'),fetch('/data/aulas.json')]);
  cfg=await r[0].json();var a=await r[1].json();
  (cfg.volumes||[]).forEach(function(v){vols[v.id]=v});
  (a.blocks||[]).forEach(function(b){blocos[b.id]=b});
 }catch(e){return}
 pronto=true;pilula();
 fila.splice(0).forEach(function(x){x[0](x[1])});
}
window.MatOfertas={
 /* atalhos para revisão manual no console */
 toast:function(){S.toasts=0;S.fechados=0;S.ultimoToast=0;return toast({volume:2,titulo:'Função quadrática está no Volume 2',texto:'No livro, esse módulo tem 4 tipos de questão, cada um com modelo resolvido, aquecimento e vestibular. Tudo no papel.',cta:'Ver o Volume 2',href:lojaHref(2)})},
 modal:function(){S.modal=0;L.modalAte=0;L.clicouAte=0;return aoProva({acertos:8,total:10,volume:'2',modulo:'2.3'})},
 reset:function(){L={};S={};salvar()}
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',carregar);else carregar();
})();
