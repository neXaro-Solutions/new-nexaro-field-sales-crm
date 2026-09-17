(()=>{
'use strict';
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
 }
};
window.addEventListener('nxsu:offer',e=>{
 const solution=window.neXaroSumUpOfferBridge.build(e.detail||window.__nxsuRecommendation);
 window.__nxsuSolution=solution;
 if(solution){
  window.dispatchEvent(new CustomEvent('nxsu:solution-ready',{detail:{solution,items:solution.items}}));
 }
});
})();
