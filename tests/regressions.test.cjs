const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const read = name => readFileSync(require('node:path').join(__dirname, '..', name), 'utf8');
function context(extra={}) {
  const storage = new Map();
  const ctx = vm.createContext({console, URL, Response, Request, AbortSignal, structuredClone,
    setTimeout, clearTimeout, Date, localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
    addEventListener(){}, NEXARO_SUPABASE_URL:'https://example.test', NEXARO_SUPABASE_KEY:'sb_publishable_test', ...extra});
  ctx.window=ctx; return ctx;
}
function run(ctx,name){vm.runInContext(read(name),ctx,{filename:name});return ctx;}
test('auth rejects an invalid stored access token',async()=>{
 const c=context({fetch:async()=>new Response('{}',{status:401})});
 c.localStorage.setItem('nexaro-supabase-access-token','forged');run(c,'supabase-auth.js');
 assert.equal((await c.nexaroAuth.restore()).ok,false);assert.equal(c.nexaroAuth.session,null);
});
test('auth validates a legacy token with the server',async()=>{
 let calls=0;const c=context({fetch:async()=>{calls++;return Response.json({id:'u1'})}});
 c.localStorage.setItem('nexaro-supabase-access-token','valid');run(c,'supabase-auth.js');
 assert.equal((await c.nexaroAuth.restore()).ok,true);assert.equal(calls,1);
});
test('sync preserves local IDs, status, notes and customer links',async()=>{
 const c=context({S:{leads:[{id:'local-1',publicLeadId:'r1',company:'Shop',email:'a@test.de',status:'gewonnen',notes:'Visit note',customerId:'c1'}]},
 nexaroAuth:{session:{access_token:'valid'},headers:{},restore:async()=>({ok:true})},fetch:async url=>Response.json(url.includes('offset=0')?[{id:'r1',company:'Shop',email:'a@test.de',status:'neu',message:'Old message'}]:[]),save(){},render(){}});
 run(c,'supabase-lead-sync.js');await c.nexaroLeadSync.sync();
 assert.equal(c.S.leads[0].id,'local-1');assert.equal(c.S.leads[0].status,'gewonnen');assert.equal(c.S.leads[0].notes,'Visit note');assert.equal(c.S.leads[0].customerId,'c1');
});
test('sync persists a deduplication link even without a new lead',async()=>{
 let saved=0;const c=context({S:{leads:[{id:'local-1',company:'Shop',email:'a@test.de'}]},
 nexaroAuth:{session:{access_token:'valid'},headers:{},restore:async()=>({ok:true})},fetch:async url=>Response.json(url.includes('offset=0')?[{id:'r1',company:'Shop',email:'a@test.de'}]:[]),save(){saved++},render(){}});
 run(c,'supabase-lead-sync.js');await c.nexaroLeadSync.sync();assert.equal(c.S.leads[0].publicLeadId,'r1');assert.equal(saved,1);
});
test('a failed lead sync does not turn successful authentication into failed login',async()=>{
 const app={style:{}};const c=context({document:{getElementById:()=>app},nexaroAuth:{restore:async()=>({ok:true})},nexaroLeadSync:{sync:async()=>{throw Error('unavailable')}}});
 run(c,'crm-bootstrap.js');assert.equal((await c.nexaroCRM.startSecureMode()).ok,true);assert.equal(app.style.display,'');
});
test('follow-up date markup interpolates the selected date',()=>{
 let html='';const c=context({guideState:{step:4,data:{followupDate:'2026-10-12'}},GUIDE_TEXT:{},GUIDE_OBJECTIONS:{},esc:String,today:()=>'', $:()=>({set innerHTML(v){html=v},insertAdjacentHTML:(_,v)=>{html+=v}})});
 vm.runInContext(read('app.js').split('\n').find(l=>l.startsWith('function renderGuideDynamic')),c);
 c.renderGuideDynamic('followup');assert.ok(html.includes('value="2026-10-12"'));
});
test('invoice retains the lead from its source quote',()=>{
 const nodes=new Map();const node=k=>{if(!nodes.has(k))nodes.set(k,{value:'',innerHTML:'',dataset:{},reset(){}});return nodes.get(k)};
 const c=context({$:node,S:{leads:[{id:'l1',customerId:'c1'}],vapeInvoices:[],vapeInvoiceSequence:0,customers:[{id:'c1'}]},customerOptions:()=>'',today:()=>'',newVapeLine(){},renderVapeTotals(){},open(){},getVapeItems:()=>[{description:'P',qty:1,price:2}],totals:()=>({net:2,vat:.38,gross:2.38}),customerById:()=>({id:'c1'}),ensureCustomerForLead(){},syncCustomer(){},uid:()=> 'i1',save(){},close(){},render(){},renderVape(){},toast(){},quote:function quote(){}});
 const source=read('app.js');vm.runInContext(source.split('\n').find(l=>l.startsWith('function newVapeInvoice')),c);
 c.newVapeInvoice(null,{leadId:'l1',customerId:'c1',company:'Shop',items:[]});
 const line=source.split('\n').find(l=>l.includes('const saveVapeInvoice='));
 vm.runInContext(line.slice(line.indexOf('const saveVapeInvoice='),line.indexOf(";$('#saveVapeInvoiceBtn')"))+';saveVapeInvoice()',c);
 assert.equal(c.S.vapeInvoices[0].leadId,'l1');
});
test('service worker does not delete caches owned by other applications',async()=>{
 const listeners={};const removed=[];const c=context({self:{addEventListener:(t,f)=>listeners[t]=f,clients:{claim(){}},skipWaiting(){}},caches:{keys:async()=>['other-app-v1','nexaro-field-crm-v3-40'],delete:async k=>removed.push(k)}});
 run(c,'sw.js');let done;listeners.activate({waitUntil:p=>done=p});await done;assert.deepEqual(removed,['nexaro-field-crm-v3-40']);
});
test('all local startup resources are included in the offline cache',()=>{
 const c=context({self:{addEventListener(){}}});run(c,'sw.js');const assets=vm.runInContext('ASSETS',c);
 const html=read('index.html');const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>'./'+m[1]);
 for(const src of scripts)assert.ok(assets.includes(src),`missing cache entry: ${src}`);
});
test('state rejects malformed backups before replacing existing data',()=>{
 const c=run(context(),'crm-state.js');
 for(const bad of [null,[],{leads:'bad'},{tasks:[null]},{quotes:[{items:{}}]},{customerSequence:-1}])assert.throws(()=>c.nexaroState.normalize(bad));
 const state=c.nexaroState.normalize({leads:[{id:'keep',company:'Shop'}]});
 assert.equal(state.leads[0].id,'keep');assert.ok(Array.isArray(state.vapeQuotes));assert.ok(Array.isArray(state.vapeCart));
});
test('sync reads beyond 200 leads and coalesces concurrent imports',async()=>{
 let requests=0,saves=0;const c=context({S:{leads:[]},nexaroAuth:{session:{access_token:'valid'},headers:{}},save(){saves++},render(){},fetch:async url=>{requests++;const offset=Number(new URL(url).searchParams.get('offset'));return Response.json(Array.from({length:Math.min(200,Math.max(0,450-offset))},(_,i)=>({id:String(offset+i),company:'Shop '+(offset+i)})))}});
 run(c,'supabase-lead-sync.js');const [a,b]=await Promise.all([c.nexaroLeadSync.sync(),c.nexaroLeadSync.sync()]);
 assert.equal(a.imported,450);assert.equal(b.imported,450);assert.equal(c.S.leads.length,450);assert.equal(saves,1);assert.equal(requests,4);
});
test('failed later sync page does not partially modify local CRM',async()=>{
 const c=context({S:{leads:[]},nexaroAuth:{session:{access_token:'valid'},headers:{}},fetch:async url=>url.includes('offset=0')?Response.json([{id:'r1'}]):new Response('',{status:503})});
 run(c,'supabase-lead-sync.js');await assert.rejects(()=>c.nexaroLeadSync.sync());assert.equal(c.S.leads.length,0);
});
test('persistence omits the rebuildable catalog while preserving private prices and sales',()=>{
 const c=run(context(),'crm-state.js');const state={leads:[{id:'keep'}],vapeProducts:[{id:'catalog'}],vapePrivatePrices:{VP001:2},_quoteFromCart:true};
 const saved=JSON.parse(c.nexaroState.serialize(state));assert.equal(saved.vapeProducts,undefined);assert.equal(saved._quoteFromCart,undefined);assert.equal(saved.vapePrivatePrices.VP001,2);assert.equal(saved.leads[0].id,'keep');assert.equal(state.vapeProducts.length,1);
});
test('every shipped JavaScript file parses before deployment',()=>{
 for(const file of require('node:fs').readdirSync(require('node:path').join(__dirname,'..')).filter(name=>name.endsWith('.js'))){assert.doesNotThrow(()=>new vm.Script(read(file),{filename:file}),file)}
});
