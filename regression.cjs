const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{
for(const [port,old] of [[8765,true],[8766,false]]){
const ctx=await browser.newContext({viewport:{width:375,height:800},isMobile:true,serviceWorkers:'allow'});
const page=await ctx.newPage();const url='http://127.0.0.1:'+port+'/BET-ANALYST-P31-PREVIEW/';
await page.goto(url);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
if(old){process.kill(Number(process.env.OLD_PID));await ctx.setOffline(true);}
if(old){let failed=false;try{await page.goto(url+'?utm_source=chatgpt.com')}catch(e){failed=/ERR_FAILED|ERR_INTERNET_DISCONNECTED/.test(e.message);console.log('BASELINE',e.message)}assert(failed);await ctx.close();continue}
for(const offline of [false,true]){if(offline)process.kill(Number(process.env.NEW_PID));await ctx.setOffline(offline);for(const suffix of ['', '?utm_source=chatgpt.com']){await page.goto(url+suffix);for(const sport of ['football','nba','tennis']){await page.locator('[data-sport='+sport+']').click();assert.equal(await page.locator('[data-sport='+sport+']').getAttribute('aria-pressed'),'true');await page.click('#load');await page.waitForFunction(s=>document.querySelector('#status').textContent.includes('Rejeu précalculé — '+s),sport);assert.equal(await page.locator('#c4-output article h4').count(),7);await page.locator('#c4-output details').first().locator('summary').click();assert(await page.locator('#c4-output article').last().isVisible());assert(await page.getByText('Conclusion sportive : non établie',{exact:true}).isVisible());assert.equal(await page.locator('#c4-output pre').count(),1);assert(await page.getByText('Marchés : aucun marché évalué',{exact:true}).isVisible());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);console.log('P31_REGRESSION PASS',offline,suffix||'clean',sport)}}}
await ctx.close();
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
