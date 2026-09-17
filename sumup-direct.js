(()=>{
'use strict';
const wait=(fn,ms=150)=>{let n=0;const t=setInterval(()=>{if(fn()||++n>100)clearInterval(t)},ms)};
function load(src){if(document.querySelector(`script[data-nx-direct="${src}"]`))return;const s=document.createElement('script');s.src=src;s.dataset.nxDirect=src;document.head.appendChild(s)}
function openAdvisor(lead){
 if(typeof window.neXaroSumUp?.open==='function'){
  window.neXaroSumUp.open(lead?.id||null);return true;
 }
 return false;
}
function applyPendingOffer(){
 const items=window.__nxsuOfferItems;
 const box=document.getElementById('quoteItems');
 if(!Array.isArray(items)||!box)return false;
 const rows=[...box.querySelectorAll('.line-item')];
 if(rows.length<items.length)return false;
 items.forEach((item,i)=>{
  const r=rows[i]; if(!r)return;
  const set=(sel,val)=>{
   const el=r.querySelector(sel); if(!el)return;
   el.value=val;
   el.setAttribute('value',String(val));
   el.dispatchEvent(new Event('input',{bubbles:true}));
  };
  set('.li-desc',item.description||'');
  set('.li-qty',item.qty??1);
  set('.li-unit',item.unit||'Stück');
  set('.li-price',Number(item.price)||0);
  const total=r.querySelector('.li-total');
  if(total)total.textContent=new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format((Number(item.qty)||0)*(Number(item.price)||0));
 });
 if(typeof window.recalcItems==='function')window.recalcItems('quoteItems','qNetPreview','qVatPreview','qGrossPreview');
 return true;
}
function watchOffer(){
 if(document.documentElement.dataset.nxsuOfferWatch)return;
 document.documentElement.dataset.nxsuOfferWatch='1';
 const run=()=>{if(window.__nxsuOfferItems)applyPendingOffer()};
 new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
 setInterval(run,250);
}
function start(){
 load('./sumup-advisor-clean-v2.js?v=2');
 load('./sumup-solution-builder.js?v=3');
 load('./sumup-offer-bridge.js?v=3');
 load('./sumup-crm-offer-link.js?v=3');
 watchOffer();
}
function install(){
 document.querySelectorAll('[data-action="pricing"]').forEach(b=>{
  if(b.dataset.nxsuDirectBound)return;
  b.dataset.nxsuDirectBound='1';
  b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();start();setTimeout(()=>openAdvisor(null),500)},true);
 });
 const dash=document.querySelector('#dashboard');
 if(dash&&!document.getElementById('nxsuDashboardDirect')){
  const q=dash.querySelector('.quick-actions');
  if(q){const b=document.createElement('button');b.id='nxsuDashboardDirect';b.className='quick-action';b.innerHTML='<span>💶</span><b>SumUp Beratung</b><small>Bedarf → Lösung → Angebot</small>';b.onclick=()=>{start();setTimeout(()=>openAdvisor(null),500)};q.appendChild(b)}
 }
}
start();
wait(()=>{install();return !!window.neXaroSumUp?.open},150);
new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
})();