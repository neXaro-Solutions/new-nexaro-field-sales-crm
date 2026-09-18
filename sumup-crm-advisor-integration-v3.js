(()=>{
'use strict';

/* neXaro SUMUP CRM Integration V3
   Lead -> Analyse -> Empfehlung -> Angebot
*/
window.neXaroSumUpCRM={
 currentLead:null,
 start(lead={}){
  this.currentLead=lead;
  window.__nxsuCurrentLead=lead;
  return {lead,ready:true};
 },
 analyzeAndStore(data={}){
  const result=window.neXaroSumUpAdvisorV3?.analyze(data)||null;
  if(!result)return null;
  const payload={
   lead:this.currentLead,
   analysis:result,
   createdAt:new Date().toISOString()
  };
  window.__nxsuLastAnalysis=payload;
  return payload;
 },
 createOffer(){
  const analysis=window.__nxsuLastAnalysis?.analysis;
  if(!analysis)return false;
  const items=[
   {description:analysis.hardware,qty:1,unit:'Stück',price:0},
   {description:analysis.recommendation.name,qty:1,unit:'Monat',price:analysis.recommendation.monthly||0}
  ];
  window.dispatchEvent(new CustomEvent('nxsu:crm-offer-ready',{detail:{
    leadId:this.currentLead?.id||null,
    items,
    analysis
  }}));
  return true;
 },
 bind(){
  document.addEventListener('nxsu:lead-selected',e=>this.start(e.detail||{}));
 }
};
window.neXaroSumUpCRM.bind();
})();
