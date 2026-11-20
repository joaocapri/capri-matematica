// Caderno: o botão Ver questão aparece quando o zoom recorta o enunciado e some ao voltar o zoom.
// Rode com o servidor local: python3 -m http.server 4173 --bind 127.0.0.1
const {chromium,devices}=require('playwright');const assert=require('assert');
(async()=>{const b=await chromium.launch();
for(const cfg of [{name:'ipad',ctx:{...devices['iPad (gen 7) landscape']}},{name:'celular',ctx:{viewport:{width:390,height:780},deviceScaleFactor:2,hasTouch:true}}]){
const c=await b.newContext(cfg.ctx);const p=await c.newPage();p.on('pageerror',e=>console.log('ERRO',e.message));
await p.goto((process.env.BASE||'http://127.0.0.1:4173')+'/caderno/?aula=3.1.1&lista=fixacao');
await p.waitForFunction(()=>window.__caderno&&window.__caderno.mapa&&!document.querySelector('#cd-carregando:not([hidden])'));
await p.evaluate(()=>{const d=document.querySelector('#cd-dica');if(d)d.hidden=true});
await p.waitForTimeout(500);
assert.equal(await p.locator('#cd-vq').isHidden(),true,'sem botão no zoom ajustado');
// zoom 2.6x no centro da tela
await p.evaluate(()=>{const v=window.__caderno.vista;const z=v.z*2.6;const r=document.querySelector('#cd-folha').getBoundingClientRect();const sx=r.width*0.5,sy=r.height*0.45;const wx=(sx-v.tx)/v.z,wy=(sy-v.ty)/v.z;window.__caderno.aplicarVista({z,tx:sx-wx*z,ty:sy-wy*z})});
await p.waitForTimeout(150);
await p.waitForTimeout(500);
assert.equal(await p.locator('#cd-vq').isVisible(),true,'botão aparece com zoom');
await p.locator('#cd-vq').click();await p.waitForTimeout(700);
assert.equal(await p.locator('#cd-vq-caixa').isVisible(),true);
const zAntes=await p.evaluate(()=>window.__caderno.vista.z);
await p.mouse.click(cfg.name==='ipad'?900:300,650);await p.waitForTimeout(200);
assert.equal(await p.locator('#cd-vq-caixa').isHidden(),true,'fecha ao tocar fora');
assert.equal(await p.evaluate(()=>window.__caderno.vista.z),zAntes,'zoom não mudou');
assert.equal(await p.evaluate(()=>window.__caderno.estado.tracos['q-1']?.length||0),0,'tocar fora não risca');
await p.locator('#cd-vq').click();await p.waitForTimeout(300);await p.locator('#cd-vq-x').click();await p.waitForTimeout(200);
assert.equal(await p.locator('#cd-vq-caixa').isHidden(),true,'fecha no X');
await p.locator('#cd-ajustar').click().catch(()=>p.evaluate(()=>window.__caderno.aplicarVista(window.__caderno.vista)));
await p.evaluate(()=>{});
await p.keyboard.press('Control+0');await p.waitForTimeout(700);
assert.equal(await p.locator('#cd-vq').isHidden(),true,'some ao voltar o zoom');
console.log(cfg.name,'OK');await c.close();}
await b.close()})();
