const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const ctx=await browser.newContext({viewport:{width:375,height:800}});
 const page=await ctx.newPage(),base='http://127.0.0.1:8768/p32b/';
 await page.goto(base+'?utm_source=chatgpt.com');
 await page.click('#prepare');
 await page.waitForFunction(()=>document.querySelector('#status').textContent==='Cache hors ligne prêt',null,{timeout:180000});
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 await ctx.setOffline(true);
 for(const suffix of ['','?utm_source=chatgpt.com','index.html?utm_source=chatgpt.com']){
 await page.goto(base+suffix);await page.reload();
 assert.equal(await page.locator('[data-sport]').count(),3);
 console.log('P32_UTM_PASS',suffix||'clean');
 }
 await page.click('[data-sport="nba"]');
 await page.waitForFunction(()=>document.querySelector('#status').textContent==='Calcul Python terminé',null,{timeout:120000});
 assert.equal(await page.locator('#out h3').count(),7);
 console.log('P32_UTM_OFFLINE_NBA_PASS');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
