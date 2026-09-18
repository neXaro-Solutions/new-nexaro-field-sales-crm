const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright') : 'playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const filename=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html');
 if(!filename.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(filename,(error,body)=>{if(error){res.writeHead(404);return res.end()};const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml'};res.setHeader('Content-Type',types[path.extname(filename)]||'application/octet-stream');res.end(body)});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:process.env.CHROMIUM_PATH?['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--in-process-gpu','--disable-dev-shm-usage','--no-zygote','--single-process']:[]});
 const context=await browser.newContext({serviceWorkers:'block'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let submitted=[],acceptToken=true;
 await context.route('**/*',async route=>{
  const url=route.request().url();if(url.startsWith(origin))return route.continue();
  if(url.includes('/auth/v1/token'))return route.fulfill({json:{access_token:'valid',refresh_token:'refresh',user:{id:'u1'}}});
  if(url.includes('/auth/v1/user'))return route.fulfill({status:acceptToken?200:401,json:acceptToken?{id:'u1'}:{}});
  if(url.includes('/rest/v1/public_leads')){
   if(route.request().method()==='POST'){submitted.push(route.request().postDataJSON());return route.fulfill({status:201,body:''})}
   return route.fulfill({json:[]});
  }
  return route.abort();
 });
 const check=(name)=>console.log('PASS '+name);
 try{
  await page.goto(origin);await page.waitForSelector('#nxAuthLogin');assert.equal(await page.locator('#app').isVisible(),false);check('unauthenticated gate');
  await page.fill('#nxAuthEmail','test@example.test');await page.fill('#nxAuthPassword','test-password');await page.click('#nxAuthLogin');await page.waitForSelector('#nexaroAuthGate',{state:'detached'});assert.ok(await page.locator('#app').isVisible());check('login');
  await page.reload();await page.waitForSelector('#nexaroAuthGate',{state:'detached'});check('session restore');
  for(const screen of ['leads','pipeline','area','tasks','more','vape','dashboard']){await page.locator(`#nav [data-screen="${screen}"]`).click();assert.ok(await page.locator(`#${screen}`).isVisible())}check('all seven navigation screens');
  await page.evaluate(()=>lead());await page.fill('#fCompany','Regression Shop');await page.fill('#fZip','10115');await page.fill('#fCity','Berlin');await page.evaluate(()=>document.querySelector('#leadForm').requestSubmit());
  assert.equal(await page.evaluate(()=>S.leads.length),1);assert.equal(await page.evaluate(()=>S.customers.length),1);check('lead creates linked customer');
  await page.waitForFunction(()=>Boolean(window.neXaroSumUp?.open));await page.evaluate(()=>window.neXaroSumUp.open(S.leads[0].id));await page.waitForSelector('#nxsuCalculate');await page.fill('#nxsuTpv','5000');await page.click('#nxsuCalculate');assert.ok(await page.evaluate(()=>Boolean(window.__nxsuRecommendation?.hardware)));await page.click('#nxsuOffer');await page.waitForFunction(()=>!document.querySelector('#sumupProDialog').open);assert.ok(await page.locator('#quoteDialog').isVisible());assert.ok(await page.locator('#quoteItems .line-item').count()>0);await page.evaluate(()=>document.querySelector('#quoteForm').requestSubmit());assert.equal(await page.evaluate(()=>S.quotes.length),1);check('SumUp advisor calculates and saves an offer');
  await page.evaluate(()=>task());await page.fill('#tTitle','Test follow-up');await page.evaluate(()=>document.querySelector('#taskForm').requestSubmit());assert.equal(await page.evaluate(()=>S.tasks.length),1);check('task creation');
  await page.evaluate(()=>{const id=S.leads[0].id;newVapeQuote(null,id);const p=S.vapeProducts[0];document.querySelector('.vape-item-product').value=p.id;document.querySelector('.vape-item-price').value='10';});
  await page.click('#vapeQuoteForm button.primary');assert.equal(await page.evaluate(()=>S.vapeQuotes.length),1);check('one click creates exactly one vape quote');
  await page.evaluate(()=>newVapeInvoice(null,S.vapeQuotes[0]));await page.click('#vapeInvoiceForm button.primary');assert.equal(await page.evaluate(()=>S.vapeInvoices[0].leadId),await page.evaluate(()=>S.leads[0].id));check('quote to invoice lead link');
  const previous=await page.evaluate(()=>JSON.stringify(S));
  await page.locator('#restoreInput').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"leads":"broken"}')});await page.waitForFunction(()=>document.querySelector('#toast').textContent==='Backup ungültig');assert.equal(await page.evaluate(()=>JSON.stringify(S)),previous);check('invalid backup leaves current CRM untouched');
  await page.locator('#restoreInput').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from('{"leads":[],"tasks":[]}')});await page.waitForFunction(()=>document.querySelector('#toast').textContent==='Backup wiederhergestellt');await page.evaluate(()=>nav('vape'));assert.equal(await page.evaluate(()=>S.vapeQuotes.length),0);check('legacy backup initializes vape state');
  page.once('dialog',dialog=>dialog.accept());await page.evaluate(()=>act('clear'));await page.evaluate(()=>nav('vape'));assert.ok(await page.evaluate(()=>S.vapeProducts.length)>0);check('reset preserves runtime catalog');
  const sizes=await page.evaluate(()=>({runtime:new Blob([JSON.stringify(S)]).size,persisted:new Blob([localStorage.getItem(KEY)]).size}));console.log('Storage bytes '+JSON.stringify(sizes));
  await page.evaluate(()=>{localStorage.setItem('nexaro-supabase-session',JSON.stringify({access_token:'forged'}))});acceptToken=false;await page.reload();await page.waitForSelector('#nxAuthLogin');assert.equal(await page.locator('#app').isVisible(),false);check('invalid token remains locked');
  await page.goto(origin+'/public-lead.html');await page.fill('[name=first_name]','Test');await page.fill('[name=last_name]','User');await page.fill('[name=company]','Test Shop');await page.fill('[name=email]','test@example.test');await page.selectOption('#interestType','SumUp');await page.fill('[name=sumup_goal]','Old goal');await page.selectOption('#interestType','Vapes');await page.fill('[name=vape_goal]','New goal');await page.check('[name=consent]');
  await page.evaluate(()=>{const form=document.querySelector('#leadForm');form.dispatchEvent(new Event('submit',{cancelable:true}));form.dispatchEvent(new Event('submit',{cancelable:true}))});await page.waitForFunction(()=>document.querySelector('#result').textContent.startsWith('Vielen Dank'));assert.equal(submitted.length,1);assert.equal(submitted[0].requirement,'New goal');assert.equal(submitted[0].sumup_goal,'');assert.equal(submitted[0].vape_goal,'New goal');check('public intake excludes hidden fields and blocks double submission');
  assert.deepEqual(errors,[]);check('no uncaught browser errors');
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
