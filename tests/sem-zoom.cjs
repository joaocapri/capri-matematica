// Caderno e modo aula: dois toques rápidos nos botões não ampliam a página; se ela ficar ampliada, aparece o
// botão de voltar e os dedos deixam de escrever. Também confere o padrão do caderno (pincel de 0,79 mm).
// Rode com o servidor local: python3 -m http.server 4173 --bind 127.0.0.1
const { chromium, devices } = require('playwright'); const assert = require('assert');
const BASE = process.env.BASE || 'http://127.0.0.1:4173';
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ ...devices['iPad (gen 7) landscape'] });
  await c.addInitScript(() => { const d = Object.getOwnPropertyDescriptor(VisualViewport.prototype, 'scale'); Object.defineProperty(VisualViewport.prototype, 'scale', { get() { return window.__escala || d.get.call(this); } }); });
  const p = await c.newPage(); p.on('pageerror', (e) => console.log('ERRO', e.message));
  await p.goto(BASE + '/caderno/?aula=3.1.1&lista=fixacao');
  await p.evaluate(() => indexedDB.deleteDatabase('matmat-caderno'));
  await p.reload();
  await p.waitForFunction(() => window.__caderno && window.__caderno.mapa && !document.querySelector('#cd-carregando:not([hidden])'));
  await p.evaluate(() => { const d = document.querySelector('#cd-dica'); if (d) d.hidden = true; });
  // padrão: pincel 0,79 mm
  const st = await p.evaluate(() => ({ e: window.__caderno.estado.estilo, s: window.__caderno.estado.esp.caneta }));
  assert.equal(st.e, 'pincel'); assert.equal(st.s, 2.24);
  await p.click('#cd-traco'); await p.waitForTimeout(150);
  assert.equal(await p.textContent('#cd-esp-valor'), '0,79 mm');
  await p.click('#cd-traco'); await p.waitForTimeout(150);
  // botões com touch-action: manipulation (o Safari não faz zoom no toque duplo)
  for (const sel of ['#cd-mais', '#cd-prox', '#cd-ant', '#cd-qbtn', '#cd-ajustar']) assert.equal(await p.$eval(sel, (el) => getComputedStyle(el).touchAction), 'manipulation', sel);
  // toque duplo no +: dois cliques (o zoom da folha sobe duas vezes) e a página continua em 100%
  const z0 = await p.evaluate(() => window.__caderno.vista.z);
  const r = await p.$eval('#cd-mais', (el) => { const q = el.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  await p.touchscreen.tap(r[0], r[1]); await p.waitForTimeout(90); await p.touchscreen.tap(r[0], r[1]); await p.waitForTimeout(600);
  const z1 = await p.evaluate(() => window.__caderno.vista.z);
  assert.ok(Math.abs(z1 / z0 - 1.5625) < 0.02, 'dois toques = dois cliques: ' + (z1 / z0));
  assert.equal(await p.evaluate(() => visualViewport.scale), 1);
  // toque duplo na seta: avança duas questões
  const q0 = await p.evaluate(() => window.__caderno.estado.atual);
  const s2 = await p.$eval('#cd-prox', (el) => { const q = el.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  await p.touchscreen.tap(s2[0], s2[1]); await p.waitForTimeout(90); await p.touchscreen.tap(s2[0], s2[1]); await p.waitForTimeout(400);
  assert.equal(await p.evaluate(() => window.__caderno.estado.atual), q0 + 2);
  // página ampliada (simulada: o Chromium respeita o maximum-scale e não deixa ampliar de verdade).
  // O caderno tenta voltar sozinho; se não der, mostra o botão, e os dedos param de escrever para o aluno desfazer o zoom.
  await p.evaluate(() => { window.__escala = 2; visualViewport.dispatchEvent(new Event('resize')); });
  await p.waitForTimeout(1000);
  assert.equal(await p.evaluate(() => window.__paginaAmpliada()), true);
  assert.equal(await p.locator('.sz-volta').isVisible(), true, 'botão de voltar');
  assert.equal(await p.evaluate(() => { const e = new TouchEvent('touchmove', { cancelable: true, bubbles: true, touches: [] }); document.querySelector('#cd-tela').dispatchEvent(e); return e.defaultPrevented; }), false, 'dedos livres');
  await p.evaluate(() => { window.__escala = 1; visualViewport.dispatchEvent(new Event('resize')); });
  await p.waitForTimeout(300);
  assert.equal(await p.locator('.sz-volta').isHidden(), true, 'botão some');
  assert.equal(await p.evaluate(() => { const e = new TouchEvent('touchmove', { cancelable: true, bubbles: true, touches: [] }); document.querySelector('#cd-tela').dispatchEvent(e); return e.defaultPrevented; }), true, 'folha volta a segurar os dedos');
  console.log('caderno OK');

  // modo aula: lápis, formas, cores livres
  const m = await c.newPage(); m.on('pageerror', (e) => console.log('ERRO', e.message));
  await m.goto(BASE + '/modo-aula/'); await m.evaluate(() => { localStorage.removeItem('ma:pref'); }); await m.reload();
  await m.click('#ma-nova'); await m.waitForTimeout(600);
  for (const sel of ['#ma-ant', '#ma-prox', '#ma-nova-pag', '#ma-desfazer']) assert.equal(await m.$eval(sel, (el) => getComputedStyle(el).touchAction), 'manipulation', sel);
  const folha = await m.$eval('#ma-folha', (el) => { const q = el.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; });
  const desenhar = async (pts) => { await m.mouse.move(pts[0][0], pts[0][1]); await m.mouse.down(); for (const [x, y] of pts.slice(1)) await m.mouse.move(x, y, { steps: 2 }); await m.mouse.up(); await m.waitForTimeout(120); };
  // formas ligadas: um círculo torto vira círculo
  await m.click('#ma-formas'); assert.equal(await m.getAttribute('#ma-formas', 'aria-pressed'), 'true');
  const cx = folha.x + folha.w * 0.3, cy = folha.y + folha.h * 0.4, pts = [];
  for (let i = 0; i <= 40; i++) { const t = i / 40 * Math.PI * 2; pts.push([cx + 80 * Math.cos(t) * (1 + 0.05 * Math.sin(5 * t)), cy + 78 * Math.sin(t)]); }
  await desenhar(pts);
  const forma = await m.evaluate(() => window.__modoAula.aula.paginas[0].tracos.at(-1).forma);
  assert.equal(forma, 'Círculo');
  await m.click('#ma-formas');
  // lápis com cor personalizada
  await m.click('.ma-bar-meio [data-ferramenta="lapis"]'); await m.click('.ma-bar-meio [data-ferramenta="lapis"]'); await m.waitForTimeout(200);
  assert.equal(await m.locator('#ma-painel').isVisible(), true, 'painel abre no segundo toque');
  assert.ok((await m.$$('#ma-paleta .ma-cor')).length >= 12, 'paleta ampliada');
  await m.$eval('#ma-paleta input[type=color]', (el) => { el.value = '#12a4b0'; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); });
  // troca a 1ª cor da barra pela de 'Marrom'
  await m.click('#ma-favs-ed .ma-cor >> nth=0'); await m.click('#ma-paleta .ma-cor[aria-label="Marrom"]');
  const favs = await m.evaluate(() => JSON.parse(localStorage.getItem('ma:pref')).favs.caneta[0]);
  assert.equal(favs, '#8a5a2b');
  await m.screenshot({ path: process.env.SHOT || '/tmp/modo-aula-painel.png' });
  await m.keyboard.press('Escape');
  await desenhar([[folha.x + 500, folha.y + 300], [folha.x + 600, folha.y + 340], [folha.x + 700, folha.y + 300]]);
  const t = await m.evaluate(() => window.__modoAula.aula.paginas[0].tracos.at(-1));
  assert.equal(t.f, 'lapis'); assert.equal(t.c, '#8a5a2b');
  console.log('modo aula OK');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
