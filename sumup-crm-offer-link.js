(()=>{
'use strict';
function setValue(el,value){
 if(!el)return;
 const v=String(value??'');
 el.value=v;
 el.setAttribute('value',v);
 el.dispatchEvent(new Event('input',{bubbles:true}));
 el.dispatchEvent(new Event('change',{bubbles:true}));
}
function applyRows(items){
 const box=document.getElementById('quoteItems');
 if(!box)return false;
 let rows=[...box.querySelectorAll('.line-item')];
 const add=window.addItem;
 if(rows.length<items.length&&typeof add==='function'){
  for(let i=rows.length;i<items.length;i++)add('quoteItems',{});
  rows=[...box.querySelectorAll('.line-item')];
 }
 if(rows.length<items.length)return false;
 items.forEach((item,i)=>{
  const r=rows[i];
  setValue(r.querySelector('.li-desc'),item.description||item.name||'SumUp Lösung');
  setValue(r.querySelector('.li-qty'),item.qty??1);
  setValue(r.querySelector('.li-unit'),item.unit||'Stück');
  setValue(r.querySelector('.li-price'),Number(item.price)||0);
  const total=r.querySelector('.li-total');
  if(total){const q=Number(item.qty??1)||0,p=Number(item.price)||0;total.textContent=new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(q*p)}
 });
 if(typeof window.recalcItems==='function')window.recalcItems('quoteItems','qNetPreview','qVatPreview','qGrossPreview');
 return true;
}
function fillOffer(items,leadId){
 window.__nxsuOfferItems=items;
 const openQuote=window.quote||window.neXaroQuote||null;
 if(typeof openQuote!=='function')return false;
 openQuote(null,leadId||null);
 let tries=0;
 const timer=setInterval(()=>{
  tries++;
  if(applyRows(items)||tries>=50)clearInterval(timer);
 },100);
 return true;
}
window.addEventListener('nxsu:crm-offer-ready',e=>{
 const detail=e.detail||{};
 const items=(detail.items||[]).map(x=>({
  description:x.description||x.name||'SumUp Lösung',
  qty:x.qty??1,
  unit:x.unit||'Stück',
  price:Number(x.price??x.finalPrice??0)||0
 }));
 window.__nxsuPendingOffer={...detail,items};
 fillOffer(items,detail.leadId);
});
window.neXaroSumUpCrmOffer={fill:fillOffer};
})();
