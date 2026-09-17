(()=>{
'use strict';
function fillOffer(items,leadId){
 window.__nxsuOfferItems=items;
 const openQuote=window.quote||window.neXaroQuote||null;
 if(typeof openQuote==='function'){
  openQuote(null,leadId||null);
  setTimeout(()=>{
   const container=document.getElementById('quoteItems');
   const add=window.addItem;
   if(container&&typeof add==='function'){
    container.innerHTML='';
    items.forEach(i=>add('quoteItems',i));
    if(typeof window.recalcItems==='function'){
     window.recalcItems('quoteItems','qNetPreview','qVatPreview','qGrossPreview');
    }
   }
  },500);
  return true;
 }
 return false;
}
window.addEventListener('nxsu:crm-offer-ready',e=>{
 const detail=e.detail||{};
 const items=(detail.items||[]).map(x=>({
  description:x.description||x.name||'SumUp Lösung',
  qty:1,
  unit:'Stück',
  price:Number(x.price||x.finalPrice||0)
 }));
 window.__nxsuPendingOffer={...detail,items};
 fillOffer(items,detail.leadId);
});
window.neXaroSumUpCrmOffer={fill:fillOffer};
})();
