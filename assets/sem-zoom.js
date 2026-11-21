/* Trava o zoom da página inteira no caderno digital, no modo aula e na aula ao vivo.
   No iPad, dois toques rápidos num botão (o + do zoom, a seta da próxima questão) faziam o Safari ampliar a página
   toda: a barra saía da tela e não dava para voltar. O zoom da folha é outro, feito pelo próprio caderno, e continua.
   1. Os botões não respondem ao "toque duplo" do navegador: o segundo toque vira um clique comum.
   2. A pinça fora da folha não amplia a página.
   3. Se a página ainda assim ficar ampliada, ela volta sozinha ao tamanho normal; se o navegador não deixar,
      aparece um botão para voltar, e a pinça fica liberada para o aluno desfazer o zoom com os dedos. */
(() => {
  const vv = window.visualViewport;
  const ampliada = () => !!vv && vv.scale > 1.01;
  window.__paginaAmpliada = ampliada; // o caderno e o modo aula ignoram os dedos enquanto a página está ampliada

  const estilo = document.createElement('style');
  estilo.textContent = 'html,body,button,a,label,select,summary,[role="button"],[role="menuitem"],[role="radio"]{touch-action:manipulation}' +
    '.sz-volta{position:fixed;z-index:2147483647;left:0;top:0;transform-origin:0 0;margin:0;padding:12px 18px;border:0;border-radius:999px;' +
    'background:#4a27b7;color:#fff;font:700 15px/1.2 "DM Sans",system-ui,sans-serif;box-shadow:0 8px 26px rgba(33,25,70,.35);white-space:nowrap;cursor:pointer}' +
    '.sz-volta[hidden]{display:none}';
  document.head.appendChild(estilo);

  const editavel = (el) => !!el?.closest?.('input,textarea,select,[contenteditable="true"]');

  // 1. toque duplo: o segundo toque rápido não amplia a página; se foi num botão, conta como clique
  let ultimo = { t: 0, x: 0, y: 0 };
  let pendente = null;
  document.addEventListener('touchend', (e) => {
    if (e.touches.length || e.changedTouches.length !== 1) return;
    const tq = e.changedTouches[0], agora = performance.now();
    const perto = Math.hypot(tq.clientX - ultimo.x, tq.clientY - ultimo.y) < 60;
    if (agora - ultimo.t < 400 && perto && !editavel(e.target) && !ampliada()) {
      e.preventDefault();
      const b = e.target.closest?.('button,a[href],label,[role="button"],[role="menuitem"],[role="radio"]');
      // o clique do segundo toque é feito aqui; se o navegador também mandar o dele, o nosso não acontece
      if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true') { pendente = b; setTimeout(() => { if (pendente === b) { pendente = null; b.click(); } }, 60); }
      ultimo = { t: 0, x: 0, y: 0 }; // um terceiro toque começa a contagem de novo
      return;
    }
    ultimo = { t: agora, x: tq.clientX, y: tq.clientY };
  }, { passive: false, capture: true });
  document.addEventListener('click', (e) => { if (pendente && e.isTrusted && pendente.contains(e.target)) pendente = null; }, true);
  document.addEventListener('dblclick', (e) => { if (!editavel(e.target)) e.preventDefault(); }, { passive: false });

  // 2. pinça fora da folha (a folha tem o próprio zoom): com a página normal, não deixa ampliar
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 && !ampliada()) e.preventDefault(); }, { passive: false, capture: true });
  document.addEventListener('gesturestart', (e) => { if (!ampliada()) e.preventDefault(); }, { passive: false, capture: true });

  // 3. se a página ficou ampliada, volta ao normal
  if (!vv) return;
  const meta = document.querySelector('meta[name="viewport"]');
  const BASE = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
  let alterna = false;
  function voltarAoNormal() {
    if (!meta) return;
    // trocar o conteúdo da meta faz o Safari recalcular a escala (e voltar a 1)
    alterna = !alterna;
    meta.setAttribute('content', alterna ? BASE.replace('initial-scale=1,', 'initial-scale=1.0,') : BASE);
    window.scrollTo(0, 0);
  }
  if (meta) meta.setAttribute('content', BASE);

  let botao = null;
  function mostrarBotao() {
    if (!botao) {
      botao = document.createElement('button');
      botao.type = 'button'; botao.className = 'sz-volta'; botao.textContent = 'Voltar ao tamanho normal';
      botao.addEventListener('click', () => {
        voltarAoNormal();
        setTimeout(() => { if (ampliada()) botao.textContent = 'Junte dois dedos na tela para diminuir'; }, 400);
      });
      document.body.appendChild(botao);
    }
    botao.hidden = false; posicionar();
  }
  function posicionar() {
    if (!botao || botao.hidden) return;
    const k = 1 / vv.scale, w = botao.offsetWidth * k;
    botao.style.transform = `translate(${vv.offsetLeft + (vv.width - w) / 2}px, ${vv.offsetTop + 14 * k}px) scale(${k})`;
  }
  let timer = 0;
  function checar() {
    clearTimeout(timer);
    if (!ampliada()) { if (botao) { botao.hidden = true; botao.textContent = 'Voltar ao tamanho normal'; } return; }
    posicionar();
    // espera os dedos saírem da tela e devolve a página ao tamanho normal
    timer = setTimeout(() => {
      voltarAoNormal();
      setTimeout(() => { if (ampliada()) mostrarBotao(); }, 450);
    }, 300);
  }
  vv.addEventListener('resize', checar);
  vv.addEventListener('scroll', posicionar);
  addEventListener('orientationchange', () => setTimeout(checar, 400));
})();
