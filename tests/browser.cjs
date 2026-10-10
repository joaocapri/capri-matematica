const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

const BASE='http://127.0.0.1:4173';
async function checkWidth(page,name){
 const d=await page.evaluate(()=>({
  scrollWidth:document.documentElement.scrollWidth,
  windowWidth:window.innerWidth,
  offending:[...document.querySelectorAll('body *')].filter(el=>{
   const b=el.getBoundingClientRect();
   const cs=getComputedStyle(el);
   return b.width&&cs.position!=='fixed'&&b.right>window.innerWidth+3&&b.left<window.innerWidth+3&&!['script','style','svg','path'].includes(el.tagName.toLowerCase())
  }).slice(0,6).map(el=>({tag:el.tagName,cls:el.className?.toString().slice(0,70),right:Math.round(el.getBoundingClientRect().right)}))
 }));
 assert.ok(d.scrollWidth<=d.windowWidth+3,name+' causa rolagem horizontal: '+JSON.stringify(d));
 console.log('✓ '+name+' | '+d.windowWidth+'px | sem rolagem horizontal');
}
(async()=>{
 fs.mkdirSync('screenshots',{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 for(const setting of [
  {name:'desktop',viewport:{width:1440,height:900}},
  {name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}
 ]){
  console.log('Iniciando '+setting.name);
  const page=await browser.newPage(setting);
  page.setDefaultTimeout(15000);
  // Bloqueia CDNs externos no CI: o teste valida a UI mesmo sem a rede pública.
  await page.route('**/*', route => {
    const u=new URL(route.request().url());
    if(u.hostname==='127.0.0.1')return route.continue();
    return route.abort();
  });
  page.on('pageerror',e=>{console.log('Page error:',e.message)});
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:18000});
  console.log('Home carregada: '+setting.name);
  await page.locator('.area-tile').first().waitFor({timeout:20000});
  assert.equal(await page.locator('input[type=search]').count(),1,'Somente uma busca');
  assert.equal(await page.locator('.area-tile').count(),9);
  await checkWidth(page,setting.name+' home');
  await page.screenshot({timeout:12000,path:'screenshots/'+setting.name+'-home.png',fullPage:true});

  await page.locator('#hero-search').fill('Bhaskara');
  await page.locator('#search-output a[href="/aulas/A17/"]').first().waitFor();
  assert.equal(await page.locator('#home-discover').isVisible(),false,'Explore sai ao buscar');
  await checkWidth(page,setting.name+' busca');
  await page.screenshot({path:'screenshots/'+setting.name+'-search.png',fullPage:true});

  await page.locator('#clear-search').click();
  await page.locator('[data-catalog="area"][data-id="funcoes"]').click();
  await page.locator('[data-catalog="topic"][data-id="fu-quadratica"]').click();
  assert.equal(await page.locator('#explore-content .browse-lesson-row').count(),6);
  await checkWidth(page,setting.name+' aulas do assunto');
  await page.screenshot({path:'screenshots/'+setting.name+'-topic.png',fullPage:true});

  await page.goto(BASE+'/aulas/A17/',{waitUntil:'domcontentloaded',timeout:18000});
  await page.locator('.contentpanel .tab').first().waitFor();
  await checkWidth(page,setting.name+' pagina de aula');
  await page.screenshot({path:'screenshots/'+setting.name+'-lesson.png',fullPage:true});
  await page.close();
 }
 await browser.close();
 console.log('✓ Browser smoke: desktop + mobile OK');
})().catch(e=>{console.error('Visual test failed:',e);process.exit(1);});
