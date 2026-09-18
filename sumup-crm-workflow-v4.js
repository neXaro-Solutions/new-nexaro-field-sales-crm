(()=>{
'use strict';

/* neXaro SUMUP CRM Workflow V4
   Lead -> Analyse -> Empfehlung -> Angebot
*/

window.neXaroSumUpWorkflowV4={
 start(lead={}){
  const session={
   leadId:lead.id||null,
   customer:lead.customer||lead.company||'',
   started:new Date().toISOString(),
   status:'analysis'
  };
  window.__nxsuWorkflow=session;
  return session;
 },
 analyze(input={}){
  const advisor=window.neXaroSumUpAdvisorV3;
  if(!advisor?.analyze) return null;
  const result=advisor.analyze(input);
  window.__nxsuWorkflow={
   ...(window.__nxsuWorkflow||{}),
   result,
   status:'recommendation'
  };
  return result;
 },
 createOffer(){
  const result=window.__nxsuWorkflow?.result;
  if(!result)return false;
  const payload={
   leadId:window.__nxsuWorkflow.leadId,
   items:[
    {description:result.hardware,qty:1,unit:'Stück',price:0},
    {description:result.recommendation.name,qty:1,unit:'Monat',price:result.recommendation.monthly}
   ],
   source:'sumup-advisor-v4'
  };
  window.dispatchEvent(new CustomEvent('nxsu:crm-offer-ready',{detail:payload}));
  window.__nxsuWorkflow.status='offer';
  return payload;
 }
};
})();
