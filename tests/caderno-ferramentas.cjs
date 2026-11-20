// Caderno: favoritas na barra, lápis, caixa de texto, seleção (mover, duplicar, apagar) e exportação com texto.
// Rode com o servidor local: python3 -m http.server 4173 --bind 127.0.0.1
const {chromium,devices}=require('playwright');const assert=require('assert');const fs=require('fs');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPad (gen 7) landscape']});const p=await c.newPage();
const erros=[];p.on('pageerror',e=>erros.push(e.message));p.on('console',m=>{if(m.type()==='error')erros.push(m.text())});
await p.goto((process.env.BASE||'http://127.0.0.1:4173')+'/caderno/?aula=3.1.1&lista=fixacao');
await p.waitForFunction(()=>window.__caderno&&window.__caderno.mapa&&!document.querySelector('#cd-carregando:not([hidden])'));
await p.evaluate(()=>{const d=document.querySelector('#cd-dica');if(d)d.hidden=true});await p.waitForTimeout(400);
const C=window=>0; const st=()=>p.evaluate(()=>JSON.parse(JSON.stringify(window.__caderno.estado)));
const tr=async()=> (await st()).tracos['q-1']||[];
assert.equal(await p.locator('#cd-favs .cd-fav').count(),4,'4 favoritas na barra');
await p.locator('#cd-favs .cd-fav').nth(1).click();
assert.equal((await st()).cor.caneta,'#2459d6','favorita 2 = azul');
const linha=async(x0,y0,x1,y1,n=12)=>{await p.mouse.move(x0,y0);await p.mouse.down();for(let i=1;i<=n;i++)await p.mouse.move(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n+Math.sin(i)*3);await p.mouse.up();};
await linha(650,420,800,450);
let t=await tr(); assert.equal(t.length,1); assert.equal(t[0].c,'#2459d6');
// lápis
await p.keyboard.press('l'); assert.equal((await st()).ferramenta,'lapis');
await linha(650,500,820,540);
t=await tr(); assert.equal(t[1].f,'lapis'); assert.equal(t[1].c,'#3b3b3b');
// texto
await p.keyboard.press('t');
await p.mouse.click(660,610);
assert.equal(await p.locator('.cd-texto-ed').count(),1,'abre a caixa de texto');
assert.equal(await p.evaluate(()=>document.activeElement.className),'cd-texto-ed','com foco');
await p.keyboard.type('x = 2');await p.keyboard.press('Enter');await p.keyboard.type('Ângulo: 30°');
await p.mouse.click(900,300);
assert.equal(await p.locator('.cd-texto-ed').count(),0,'fecha ao tocar fora');
t=await tr(); assert.equal(t.length,3); assert.equal(t[2].f,'texto'); assert.equal(t[2].txt,'x = 2\nÂngulo: 30°');
assert.equal((await tr()).length,3,'tocar fora só fechou, não criou outra');
// editar texto existente
await p.mouse.click(t[2] ? 670 : 0, 622); await p.waitForTimeout(50);
assert.equal(await p.locator('.cd-texto-ed').inputValue(),'x = 2\nÂngulo: 30°','abre o texto existente');
await p.keyboard.press('End'); await p.keyboard.type('!'); await p.keyboard.press('Escape');
t=await tr(); assert.equal(t[2].txt,'x = 2\nÂngulo: 30°!');
// seleção: laço em volta da primeira linha
await p.keyboard.press('v');
await p.mouse.move(630,400);await p.mouse.down();for(const [x,y] of [[830,400],[830,470],[630,470],[628,402]])await p.mouse.move(x,y,{steps:5});await p.mouse.up();
await p.waitForTimeout(150);let sel=await p.evaluate(()=>window.__caderno.selecao&&window.__caderno.selecao.itens.length);
assert.equal(sel,1,'laço seleciona a linha');
assert.equal(await p.locator('#cd-sel-menu').isVisible(),true,'menu da seleção');
const x0=(await tr())[0].p[0][0];
await p.mouse.move(720,435);await p.mouse.down();await p.mouse.move(760,470,{steps:6});await p.mouse.move(820,520,{steps:6});
await p.mouse.up();await p.waitForTimeout(100);
const x1=(await tr())[0].p[0][0], z=await p.evaluate(()=>window.__caderno.vista.z);
assert.ok(Math.abs((x1-x0)-100/z)<1,'moveu a seleção');
await p.keyboard.press('Control+z'); assert.ok(Math.abs((await tr())[0].p[0][0]-x0)<0.05,'desfaz o mover');
await p.keyboard.press('Control+Shift+z');
// duplicar e apagar
await p.mouse.click(825,521); // toque sobre a linha movida seleciona
await p.waitForTimeout(50);
let n=(await tr()).length; if(await p.locator('#cd-sel-menu').isVisible()){ await p.locator('#cd-sel-dup').click(); assert.equal((await tr()).length,n+1,'duplicou'); await p.locator('#cd-sel-del').click(); assert.equal((await tr()).length,n,'apagou'); } else assert.fail('toque sobre o traço não selecionou');
// favoritas no painel
await p.keyboard.press('p'); await p.locator('#cd-traco').click();
await p.locator('#cd-favs-ed button').first().click();
await p.locator('#cd-painel-cores .cd-cor[aria-label="Roxo"]').click();
assert.equal((await st()).favoritas[0],'#6a3fd8','troca a favorita');
await p.mouse.click(900,650);
// exportar
await p.evaluate(()=>window.__caderno.exportar());
await p.waitForFunction(()=>window.__caderno.ultimoPdf);
assert.ok(await p.evaluate(()=>window.__caderno.ultimoPdf.length>1000),'exportou o PDF');
await b.close();console.log('OK');})().catch(e=>{console.error(e);process.exit(1)});
