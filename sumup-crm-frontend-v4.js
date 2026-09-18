(()=>{
'use strict';

/* neXaro SUMUP Advisor CRM Frontend V4
   Lead -> Analyse -> Empfehlung -> Angebot
*/
window.neXaroSumUpFrontendV4={
 open(lead={}){
  const old=document.getElementById('nxsuFrontendPanel');
  if(old)old.remove();
  const panel=document.createElement('section');
  panel.id='nxsuFrontendPanel';
  panel.className='card';
  panel.innerHTML=`
   <div class="section-title"><h2>🟠 SUMUP Kundenanalyse</h2><span class="badge">V4</span></div>
   <div class="grid-2">
    <label>Monatlicher Kartenumsatz<input id="nxsuFrontendVolume" type="number" placeholder="z.B. 8500"></label>
    <label>Transaktionen<input id="nxsuFrontendTransactions" type="number" placeholder="Anzahl"></label>
    <label>Aktuelle Gebühren %<input id="nxsuFrontendRate" type="number" step="0.01" placeholder="z.B. 1.9"></label>
    <label>Fixkosten monatlich<input id="nxsuFrontendFixed" type="number" placeholder="0"></label>
   </div>
   <label style="display:block;margin-top:12px">📷 Abrechnung hochladen<input id="nxsuFrontendUpload" type="file" accept="image/*,.pdf"></label>
   <div class="row compact"><button class="primary" id="nxsuRunAnalysis">Analyse starten</button><button class="secondary" id="nxsuCreateOffer">Angebot erstellen</button></div>
   <div id="nxsuFrontendResult"></div>`;
  document.body.appendChild(panel);
  panel.querySelector('#nxsuRunAnalysis').onclick=()=>this.analyze(lead);
  panel.querySelector('#nxsuCreateOffer').onclick=()=>this.offer(lead);
  return panel;
 },
 analyze(lead={}){
  const data={
   monthlyVolume:Number(document.getElementById('nxsuFrontendVolume')?.value||0),
   transactions:Number(document.getElementById('nxsuFrontendTransactions')?.value||0),
   currentRate:Number(document.getElementById('nxsuFrontendRate')?.value||0),
   currentFixed:Number(document.getElementById('nxsuFrontendFixed')?.value||0)
  };
  const result=window.neXaroSumUpAdvisorV3?.analyze(data)||data;
  window.__nxsuFrontendResult=result;
  const box=document.getElementById('nxsuFrontendResult');
  if(box)box.innerHTML=`<div class="card"><h3>Empfehlung</h3><p>Tarif: <b>${result.recommendation?.name||'-'}</b></p><p>Hardware: <b>${result.hardware||'-'}</b></p><p>Vorteilspotenzial: <b>${result.potential||0} € / Monat</b></p></div>`;
  return result;
 },
 offer(lead={}){
  const result=window.__nxsuFrontendResult;
  if(!result)return;
  window.dispatchEvent(new CustomEvent('nxsu:crm-offer-ready',{detail:{leadId:lead.id,items:[
   {description:result.hardware||'SUMUP Hardware',qty:1,price:0},
   {description:result.recommendation?.name||'SUMUP Tarif',qty:1,price:result.recommendation?.monthly||0}
  ]}}));
 }
};

})();
