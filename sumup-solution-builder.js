(()=>{
'use strict';
window.neXaroSumUpSolutionBuilder={
 create({hardware=[],software=[],addons=[],tariff=null}={}){
  const items=[...hardware,...software,...addons];
  if(tariff) items.push(tariff);
  return {
   items,
   oneTime:items.filter(i=>i.type==='hardware').reduce((s,i)=>s+(Number(i.price)||0),0),
   monthly:items.filter(i=>['software','addon','tariff'].includes(i.type)).reduce((s,i)=>s+(Number(i.price)||0),0)
  };
 },
 toOffer(solution){
  return (solution?.items||[]).map(i=>({
   name:i.name,
   description:i.desc||'',
   price:Number(i.price)||0,
   type:i.type||'product'
  }));
 }
};
})();
