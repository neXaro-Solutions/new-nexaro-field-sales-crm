(()=>{
'use strict';
window.addEventListener('nxsu:crm-offer-ready',e=>{
 const detail=e.detail||{};
 window.__nxsuPendingOffer=detail;
 const items=(detail.items||[]).map(x=>({
  description:x.description||x.name||'SumUp Lösung',
  qty:1,
  unit:'Stück',
  price:Number(x.price||x.finalPrice||0)
 }));
 window.__nxsuOfferItems=items;
 if(typeof window.quote==='function'){
  window.quote(null,detail.leadId||null);
  setTimeout(()=>{
   const container=document.getElementById('quoteItems');
   if(container&&typeof window.addItem==='function'){
    container.innerHTML='';
    items.forEach(i=>window.addItem('quoteItems',i));
   }
  },300);
 }
});
})();
