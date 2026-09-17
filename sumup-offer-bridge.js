(()=>{
'use strict';
function toOfferItems(solution){
 return (solution?.items||[]).map(i=>({
  description:i.name||'SumUp Lösung',
  qty:1,
  unit:'Stück',
  price:Number(i.price)||0,
  type:i.type||'product'
 }));
}
window.neXaroSumUpOfferBridge={
 build(recommendation){
  const r=recommendation||window.__nxsuRecommendation||{};
  if(window.neXaroSumUpSolutionBuilder){
   return window.neXaroSumUpSolutionBuilder.create({
    hardware:r.hardware?[{...r.hardware,type:'hardware'}]:[],
    software:r.software?[{...r.software,type:'software'}]:[],
    addons:(r.addons||[]).map(x=>({...x,type:'addon'})),
    tariff:r.tariff?{name:r.tariff,type:'tariff'}:null
   });
  }
  return null;
 },
 toQuote(solution){
  return {items:toOfferItems(solution),source:'sumup-advisor'};
 }
};
window.addEventListener('nxsu:offer',e=>{
 const solution=window.neXaroSumUpOfferBridge.build(e.detail||window.__nxsuRecommendation);
 window.__nxsuSolution=solution;
 if(solution){
  const payload={solution,items:solution.items,quote:window.neXaroSumUpOfferBridge.toQuote(solution)};
  window.dispatchEvent(new CustomEvent('nxsu:solution-ready',{detail:payload}));
  window.dispatchEvent(new CustomEvent('nxsu:crm-offer-ready',{detail:payload.quote}));
 }
});
})();
