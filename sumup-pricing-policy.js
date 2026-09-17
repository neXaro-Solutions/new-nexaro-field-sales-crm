(()=>{
'use strict';
const MAX=25;
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const wait=fn=>{if(window.neXaroSumUp?.data){fn();return}setTimeout(()=>wait(fn),100)};
function eligible(p){return !!p&&['solo-lite','solo','terminal','kasse'].includes(p.id)}
function normalize(data){
 (data.hardware||[]).forEach(p=>{if(typeof p.regular==='number')p.price=p.regular});
 // Interner Rabatt gilt nur für rabattfähige SumUp Hardware. Kassenschublade,
 // Epson-Bondrucker und Handscanner bleiben vom Rabatt ausgeschlossen.
 (data.pos||[]).forEach(p=>{p.discountEligible=p.id==='kasse'});
 (data.hardware||[]).forEach(p=>{p.discountEligible=eligible(p)});
}
function addDiscountField(){
 if(document.getElementById('nxsuDiscount'))return;
 const form=document.getElementById('sumupProForm');if(!form)return;
 const sec=document.createElement('div');sec.className='nxsu-section';sec.id='nxsuInternalPricing';
 sec.innerHTML='<h3>Interne Preisgestaltung</h3><div class="nxsu-formgrid"><label>Hardware-Rabatt intern (%)<input id="nxsuDiscount" type="number" min="0" max="25" step="1" value="0"><small>Max. 25 %. Gilt nur für rabattfähige SumUp Hardware. Kassenschublade, Epson-Drucker und Handscanner bleiben ausgeschlossen.</small></label><div class="nxsu-important"><b>Vertriebspreis:</b> Das Angebot verwendet den regulären SumUp-Hardwarepreis als Basis und zieht nur den hier eingetragenen internen Rabatt ab.</div></div>';
 const footer=form.querySelector('.nxsu-footer');form.insertBefore(sec,footer||null);
}
function discount(){const el=document.getElementById('nxsuDiscount');let n=el?Number(el.value):0;if(!Number.isFinite(n))n=0;return Math.max(0,Math.min(MAX,n))}
function readLeads(){try{return JSON.parse(localStorage.getItem('nexaro-crm-v2-0')||'{}').leads||[]}catch{return[]}}
function formData(){const v=id=>document.getElementById(id)?.value;return{tpv:+v('nxsuTpv')||0,business:v('nxsuBusiness'),mobile:v('nxsuMobile'),smartphone:v('nxsuSmartphone'),device:v('nxsuDevice'),pos:v('nxsuPos'),printer:v('nxsuPrinter'),team:v('nxsuTeam'),barcode:v('nxsuBarcode'),online:v('nxsuOnline'),bookings:v('nxsuBookings'),invoice:v('nxsuInvoice'),advanced:v('nxsuAdvanced'),order:v('nxsuOrder'),links:v('nxsuLinks'),web:v('nxsuOnline')}}
function offer(){
 const r=window.neXaroSumUp.recommend(formData()),id=document.getElementById('nxsuLead')?.value||'',l=readLeads().find(x=>x.id===id);
 if(typeof window.quote!=='function'){alert('Angebotsmodul nicht verfügbar.');return}
 window.quote(null,id||null);
 setTimeout(()=>{
  const set=(sel,v)=>{const el=document.querySelector(sel);if(el)el.value=v??''};
  if(l){set('#qCompany',l.company);set('#qCustomerNo',l.customerNo||'');set('#qAddress',l.address||[l.street,l.zip,l.city].filter(Boolean).join(', '));set('#qLead',id)}
  const box=document.querySelector('#quoteItems');
  if(box){
   box.innerHTML='';
   const add=(desc,qty,unit,price)=>{if(typeof window.addItem==='function')window.addItem('quoteItems',{description:desc,qty,unit,price})};
   const base=Number(r.hardware?.price)||0,pct=discount(),can=eligible(r.hardware),finalPrice=can?Math.round(base*(1-pct/100)*100)/100:base;
   add(`${r.hardware.name} – ${r.hardware.desc}${can&&pct?` · ${pct}% interner Hardware-Rabatt`:''}`,1,'Stück',finalPrice);
   if(r.packageType==='pos'&&r.software?.price)add(r.software.name,1,'Monat',r.software.price);
   const fee=window.neXaroSumUp.data.fees[r.tariff];if(fee.monthly)add(`${fee.name} – ${fee.label} Kartenzahlungsgebühr gemäß SumUp`,1,'Monat',fee.monthly);
   r.addons.filter(x=>x.price>0).forEach(x=>add(x.name,1,'Monat',x.price));
   box.querySelectorAll('.li-desc').forEach((el,i)=>{if(i===0)el.value=`${r.hardware.name} – ${r.hardware.desc}${can&&pct?` Interner Hardware-Rabatt: ${pct} %. Listenpreis: ${money(base)}. Angebotspreis: ${money(finalPrice)}.`:''} Enthalten: ${(r.hardware.features||[]).join('; ')}.`});
   box.querySelectorAll('input').forEach(x=>x.dispatchEvent(new Event('input',{bubbles:true})));
  }
  const fee=window.neXaroSumUp.data.fees[r.tariff],note=document.querySelector('#qNote');
  if(note)note.value=`Empfohlene SumUp-Lösung für ${l?.company||'Kunde'}:\n${r.hardware.name}\nHardware-Listenpreis: ${money(r.hardware.price)}${eligible(r.hardware)&&discount()?`\nInterner Hardware-Rabatt: ${discount()} %\nAngebotspreis Hardware: ${money((Number(r.hardware.price)||0)*(1-discount()/100))}`:''}\nTarif: ${fee.name} (${fee.label}; ${fee.monthly?money(fee.monthly)+'/Monat':'0 € Monatsgebühr'})\nKartenzahlungsvolumen: ${money(r.tpv)} monatlich\n\n${r.hardware.desc}\n${(r.hardware.features||[]).map(x=>'• '+x).join('\n')}\n\nInterner Hinweis: Kassenschublade, Epson-Drucker und Handscanner sind vom Hardware-Rabatt ausgeschlossen. Preise basieren auf den regulären SumUp-Verkaufspreisen, nicht auf Aktionspreisen.`;
  document.getElementById('sumupProDialog')?.close();
 },250);
}
wait(()=>{
 normalize(window.neXaroSumUp.data);
 const observer=new MutationObserver(()=>{addDiscountField();const b=document.getElementById('nxsuOffer');if(b&&!b.dataset.nxsuPolicy){b.dataset.nxsuPolicy='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();offer()},true)}});
 observer.observe(document.body,{childList:true,subtree:true});
 addDiscountField();
 const b=document.getElementById('nxsuOffer');if(b){b.dataset.nxsuPolicy='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();offer()},true)}
});
})();