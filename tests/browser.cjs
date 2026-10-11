const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const BASE='http://127.0.0.1:4173';
async function checkWidth(page,label){
 const d=await page.evaluate(()=>({width:window.innerWidth,scroll:document.documentElement.scrollWidth}));
 assert.ok(d.scroll<=d.width+3,label+' horizontal scroll: '+JSON.stringify(d));
 console.log('✓ '+label+' '+d.width+'px');
}
(async()=>{
 fs.mkdirSync('screenshots',{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const config of [{name:'desktop',viewport:{width:1440,height:900}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
  const page=await browser.newPage(config);
  page.setDefaultTimeout(15000);
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  page.on('pageerror',err=>console.log('Page error:',err.message));
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  await page.locator('.area-tile').first().waitFor();
  assert.match(await page.locator('#hero-title').textContent(),/O que você quer estudar hoje/);
  assert.equal(await page.locator('input[type=search]').count(),1);
  assert.equal(await page.locator('.home-explore-decoration').count(),0);
  assert.equal(await page.locator('.home-explore .home-section-intro p').count(),0);
  assert.equal(await page.locator('.home-explore .browser-toolbar').count(),0);
  assert.equal(await page.locator('.home-explore .browser-shortcuts').count(),0);
  assert.equal(await page.locator('#explore-content .area-tile').count(),9);
  assert.equal(await page.locator('.discovery-preview').count(),0);
  assert.equal(await page.locator('.home-hero-art').count(),0);
  assert.equal(await page.locator('[data-preview]').count(),0);
  assert.equal(await page.locator('.mat-bang').count(),2);
  assert.equal(await page.locator('.home-hero-copy>p').textContent(),'Listas de Exercícios e Teoria grátis. Simples assim');
  assert.match(await page.title(),/MAT MAT MAT!/);
  assert.equal(await page.locator('a.nav-cta[href="/teste-seu-nivel/"]').count(),1);
  await checkWidth(page,config.name+' home');
  await page.screenshot({path:'screenshots/'+config.name+'-home.png',fullPage:true});
  await page.locator('#hero-search').fill('Bhaskara');
  await page.locator('#search-output a[href="/aulas/A17/"]').first().waitFor();
  await checkWidth(page,config.name+' pesquisa');
  await page.screenshot({path:'screenshots/'+config.name+'-search.png',fullPage:true});
  await page.locator('#clear-search').click();
  await page.locator('a.area-tile[href="/explorar/?area=funcoes"]').click();
  await page.locator('a.browse-topic[href="/explorar/?area=funcoes&assunto=fu-quadratica"]').waitFor();
  assert.equal(await page.locator('input[type=search]').count(),0,'explorador sem busca duplicada');
  await checkWidth(page,config.name+' assuntos');
  await page.screenshot({path:'screenshots/'+config.name+'-subjects.png',fullPage:true});
  await page.locator('a.browse-topic[href="/explorar/?area=funcoes&assunto=fu-quadratica"]').click();
  await page.locator('.browse-lesson-row').first().waitFor();
  assert.equal(await page.locator('.browse-lesson-row').count(),6);
  await checkWidth(page,config.name+' aulas do assunto');
  await page.screenshot({path:'screenshots/'+config.name+'-topic.png',fullPage:true});
  await page.locator('a.browse-lesson-row[href="/aulas/A17/"]').click();
  await page.waitForURL('**/aulas/A17/');
  await page.locator('.contentpanel .tab').first().waitFor();
  assert.equal(await page.locator('.contentpanel .tab').count(),4);
  await checkWidth(page,config.name+' aula');
  await page.screenshot({path:'screenshots/'+config.name+'-lesson.png',fullPage:true});
  await page.goto(BASE+'/teste-seu-nivel/',{waitUntil:'domcontentloaded'});
  await page.locator('#diagnosis-start').waitFor();
  await checkWidth(page,config.name+' diagnóstico');
  await page.screenshot({path:'screenshots/'+config.name+'-diagnostic.png',fullPage:true});
  await page.locator('#diagnosis-start').click();
  for(let i=0;i<15;i++){
   await page.locator('[data-diagnosis-answer="1"]').click();
   await page.locator('#diagnosis-next').click();
  }
  await page.locator('.diagnosis-score').waitFor();
  assert.equal(await page.locator('.diagnosis-domain').count(),5);
  await checkWidth(page,config.name+' resultado');
  await page.screenshot({path:'screenshots/'+config.name+'-diagnostic-result.png',fullPage:true});
  await page.close();
 }
 await browser.close();
 console.log('✓ Browser: home, busca, catálogo e diagnóstico em desktop e celular');
})().catch(e=>{console.error(e);process.exit(1)});
