(()=>{
'use strict';
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const val=id=>document.getElementById(id)?.value||'';
function localRecommend(){
 const d={tpv:val('nxsuTpv'),business:val('nxsuBusiness'),mobile:val('nxsuMobile'),smartphone:val('nxsuSmartphone'),device:val('nxsuDevice'),pos:val('nxsuPos'),printer:val('nxsuPrinter'),team:val('nxsuTeam'),barcode:val('nxsuBarcode'),online:val('nxsuOnline'),bookings:val('nxsuBookings'),invoice:val('nxsuInvoice'),advanced:val('nxsuAdvanced'),order:val('nxsuOrder'),links:val('nxsuLinks'),web:val('nxsuOnline')};
 if(typeof window.neXaroSumUp?.recommend==='function')return window.neXaroSumUp.recommend(d);
 let hardware;
 if(d.pos==='yes')hardware=d.business==='retail'&&d.barcode==='yes'?{id:'retail',name:'Kassensystem-Set für Einzelhandel',price:649,desc:'Kassensystem mit Bondrucker, Kassenschublade und Barcode-Scanner.'}:d.printer==='yes'&&d.team==='yes'?{id:'complete',name:'Komplettes Kassensystem-Set',price:599,desc:'Kassensystem mit Bondrucker und Kassenschublade.'}:d.printer==='yes'?{id:'starter',name:'Kassensystem Starter-Kit',price:549,desc:'Kassensystem mit Bondrucker.'}:{id:'kasse',name:'SumUp Kasse',price:399,desc:'TSE-konformes Kassensystem.'};
 else if(d.mobile==='yes'&&d.smartphone==='yes'&&d.device==='phone')hardware={id:'tap',name:'Tap to Pay',price:0,desc:'Kontaktlose Zahlungen direkt mit dem Smartphone.'};
 else if(d.mobile==='yes'&&d.smartphone==='yes'&&d.device==='small')hardware={id:'solo-lite',name:'Solo Lite',price:34,desc:'Kompaktes Kartenterminal zur Smartphone-Kopplung.'};
 else if(d.printer==='yes')hardware={id:'terminal',name:'Terminal',price:169,desc:'Eigenständiges Terminal mit integriertem Belegdrucker.'};
 else hardware={id:d.device==='independent'||d.smartphone==='no'?'solo':'solo-lite',name:d.device==='independent'||d.smartphone==='no'?'Solo':'Solo Lite',price:d.device==='independent'||d.smartphone==='no'?79:34,desc:d.device==='independent'||d.smartphone==='no'?'Eigenständiges Kartenterminal.':'Kompaktes Kartenterminal zur Smartphone-Kopplung.'};
 return {hardware,tariff:Number(d.tpv)>=3900?'plus':'payg',addons:[],software:d.pos==='yes'?{name:'Kostenlose Kassensoftware',price:0}:null,reasons:[]};
}
function ensureRecommendation(){
 if(!window.__nxsuRecommendation)window.__nxsuRecommendation=localRecommend();
 return window.__nxsuRecommendation;
}
function buildItems(){
 const r=ensureRecommendation(),items=[];
 if(r.hardware)items.push({...r.hardware,type:'hardware'});
 if(r.software){if(Array.isArray(r.software))r.software.forEach(x=>items.push({...x,type:'software'}));else items.push({...r.software,type:'software'});}
 (r.addons||[]).forEach(x=>items.push({...x,type:'addon'}));
 const fee=window.neXaroSumUp?.data?.fees?.[r.tariff];
 if(fee)items.push({id:r.tariff,name:fee.name,desc:fee.detail||'',price:Number(fee.monthly)||0,type:'tariff'});
 else items.push({id:r.tariff,name:r.tariff==='plus'?'Zahlungen Plus':'Umsatzbasiertes Zahlen',price:r.tariff==='plus'?19:0,type:'tariff'});
 return items;
}
function render(){
 const box=document.getElementById('nxsuResult');if(!box)return;
 const r=ensureRecommendation(),items=buildItems();
 const one=items.filter(i=>i.type==='hardware').reduce((s,i)=>s+(Number(i.price)||0),0);
 const monthly=items.filter(i=>['software','addon','tariff'].includes(i.type)).reduce((s,i)=>s+(Number(i.price)||0),0);
 box.innerHTML=`<div class="nxsu-recommend nxsu-live-solution"><div class="nxsu-kicker">IHRE EMPFOHLENE LÖSUNG</div><h3>${esc(r.hardware?.name||'Passende SumUp Lösung')}</h3><p>${esc(r.hardware?.desc||'')}</p><div class="nxsu-grid"><div><b>Ausgewählte Lösung</b><ul>${items.map(i=>`<li><b>${esc(i.name)}</b> – ${money(i.price)}${i.type==='tariff'?' / Monat':''}</li>`).join('')}</ul></div><div><b>Gesamtkosten</b><p><strong>${money(one)}</strong> einmalig</p><p><strong>${money(monthly)}</strong> monatlich</p></div></div><div class="nxsu-important">Nur diese empfohlene Lösung wird an das Angebot übergeben.</div></div>`;
}
function calculate(e){
 if(e){e.preventDefault();e.stopImmediatePropagation();}
 const existing=val('nxsuExisting');if(existing==='yes'){const box=document.getElementById('nxsuResult');if(box)box.innerHTML='<div class="nxsu-important"><b>⛔ Bestandskunde erkannt.</b><br>Keine Neukunden-Empfehlung oder Angebotserstellung.</div>';return;}
 window.__nxsuRecommendation=localRecommend();
 render();
}
function offer(e){
 if(e){e.preventDefault();e.stopImmediatePropagation();}
 ensureRecommendation();
 const items=buildItems(),leadId=val('nxsuLead')||null;
 const quoteItems=items.map(i=>({description:i.name||'SumUp Lösung',qty:1,unit:'Stück',price:Number(i.price)||0,type:i.type}));
 const payload={items:quoteItems,leadId,source:'sumup-advisor'};
 window.__nxsuSolution={items,oneTime:items.filter(i=>i.type==='hardware').reduce((s,i)=>s+(Number(i.price)||0),0),monthly:items.filter(i=>['software','addon','tariff'].includes(i.type)).reduce((s,i)=>s+(Number(i.price)||0),0)};
 window.__nxsuPendingOffer=payload;
 window.dispatchEvent(new CustomEvent('nxsu:crm-offer-ready',{detail:payload}));
 if(window.neXaroSumUpCrmOffer?.fill)window.neXaroSumUpCrmOffer.fill(quoteItems,leadId);
}
function install(){
 const calc=document.getElementById('nxsuCalculate');
 if(calc&&!calc.dataset.nxsuLiveFixV4){calc.dataset.nxsuLiveFixV4='1';calc.onclick=calculate;}
 const btn=document.getElementById('nxsuOffer');
 if(btn&&!btn.dataset.nxsuLiveFixV4){btn.dataset.nxsuLiveFixV4='1';btn.onclick=offer;}
}
const obs=new MutationObserver(install);obs.observe(document.body,{childList:true,subtree:true});
setInterval(install,250);install();
})();
