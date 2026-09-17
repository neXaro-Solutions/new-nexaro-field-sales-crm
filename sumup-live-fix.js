(()=>{
'use strict';
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function buildItems(){
 const r=window.__nxsuRecommendation;
 if(!r)return [];
 const items=[];
 if(r.hardware)items.push({...r.hardware,type:'hardware'});
 if(r.software){if(Array.isArray(r.software))r.software.forEach(x=>items.push({...x,type:'software'}));else items.push({...r.software,type:'software'});}
 (r.addons||[]).forEach(x=>items.push({...x,type:'addon'}));
 const fee=window.neXaroSumUp?.data?.fees?.[r.tariff];
 if(fee)items.push({id:r.tariff,name:fee.name,desc:fee.detail||'',price:Number(fee.monthly)||0,type:'tariff'});
 return items;
}
function render(){
 const box=document.getElementById('nxsuResult');
 const r=window.__nxsuRecommendation;
 if(!box||!r||box.dataset.nxsuLiveFix==='1')return;
 const items=buildItems();
 const one=items.filter(i=>i.type==='hardware').reduce((s,i)=>s+(Number(i.price)||0),0);
 const monthly=items.filter(i=>['software','addon','tariff'].includes(i.type)).reduce((s,i)=>s+(Number(i.price)||0),0);
 const old=box.innerHTML;
 box.innerHTML=old+`<div class="nxsu-recommend nxsu-live-solution"><div class="nxsu-kicker">KOMPLETTES LÖSUNGSPAKET</div><h3>Ausgewählte Lösung</h3><div class="nxsu-grid"><div><b>Positionen</b><ul>${items.map(i=>`<li><b>${esc(i.name)}</b> – ${money(i.price)}${i.type==='tariff'?' / Monat':''}</li>`).join('')}</ul></div><div><b>Gesamtkosten</b><p><strong>${money(one)}</strong> einmalig</p><p><strong>${money(monthly)}</strong> monatlich</p></div></div><div class="nxsu-important">Nur diese empfohlene Lösung wird an das Angebot übergeben.</div></div>`;
 box.dataset.nxsuLiveFix='1';
}
function calculateFallback(){
 if(window.__nxsuRecommendation)return;
 const btn=document.getElementById('nxsuCalculate');
 if(btn&&typeof window.neXaroSumUp?.recommend==='function'){
   try{
     const d={tpv:document.getElementById('nxsuTpv')?.value,business:document.getElementById('nxsuBusiness')?.value,mobile:document.getElementById('nxsuMobile')?.value,smartphone:document.getElementById('nxsuSmartphone')?.value,device:document.getElementById('nxsuDevice')?.value,pos:document.getElementById('nxsuPos')?.value,printer:document.getElementById('nxsuPrinter')?.value,team:document.getElementById('nxsuTeam')?.value,barcode:document.getElementById('nxsuBarcode')?.value,online:document.getElementById('nxsuOnline')?.value,bookings:document.getElementById('nxsuBookings')?.value,invoice:document.getElementById('nxsuInvoice')?.value,advanced:document.getElementById('nxsuAdvanced')?.value,order:document.getElementById('nxsuOrder')?.value,links:document.getElementById('nxsuLinks')?.value,web:document.getElementById('nxsuOnline')?.value};
     window.__nxsuRecommendation=window.neXaroSumUp.recommend(d);
     render();
     return true;
   }catch(e){console.error('neXaro SumUp calculate fallback failed',e)}
 }
 return false;
}
function offer(){
 if(!window.__nxsuRecommendation)calculateFallback();
 const r=window.__nxsuRecommendation;
 if(!r)return;
 const items=buildItems();
 const leadId=document.getElementById('nxsuLead')?.value||null;
 const quoteItems=items.map(i=>({description:i.name||'SumUp Lösung',qty:1,unit:'Stück',price:Number(i.price)||0,type:i.type}));
 const payload={items:quoteItems,leadId,source:'sumup-advisor'};
 window.__nxsuSolution={items,oneTime:items.filter(i=>i.type==='hardware').reduce((s,i)=>s+(Number(i.price)||0),0),monthly:items.filter(i=>['software','addon','tariff'].includes(i.type)).reduce((s,i)=>s+(Number(i.price)||0),0)};
 window.__nxsuPendingOffer=payload;
 window.dispatchEvent(new CustomEvent('nxsu:crm-offer-ready',{detail:payload}));
 if(window.neXaroSumUpCrmOffer?.fill)window.neXaroSumUpCrmOffer.fill(quoteItems,leadId);
}
function install(){
 const calc=document.getElementById('nxsuCalculate');
 if(calc&&!calc.dataset.nxsuLiveFix){calc.dataset.nxsuLiveFix='1';calc.addEventListener('click',()=>setTimeout(()=>{if(!window.__nxsuRecommendation)calculateFallback();else render()},50),true)}
 const btn=document.getElementById('nxsuOffer');
 if(btn&&!btn.dataset.nxsuLiveFix){btn.dataset.nxsuLiveFix='1';btn.addEventListener('click',()=>setTimeout(offer,50),true)}
 const result=document.getElementById('nxsuResult');
 if(result&&window.__nxsuRecommendation)render();
}
new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
setInterval(install,300);
})();
