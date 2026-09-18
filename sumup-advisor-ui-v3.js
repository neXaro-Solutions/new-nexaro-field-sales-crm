(()=>{
'use strict';

/* neXaro SUMUP Advisor V3 UI
   Mobile Beratungsoberfläche für den Vertrieb
*/
window.neXaroSumUpAdvisorUI={
 createAnalysisCard(result){
  const box=document.createElement('div');
  box.className='card nxsu-analysis-result';
  box.innerHTML=`
   <div class="section-title"><h3>SUMUP Analyse</h3><span class="badge">Empfehlung</span></div>
   <p><b>Tarif:</b> ${result.recommendation?.name||'-'}</p>
   <p><b>Hardware:</b> ${result.hardware||'-'}</p>
   <p><b>Potenzial:</b> ${new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(result.potential||0)} / Monat</p>
   <div><b>Vorteile</b><ul>${(result.arguments||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  return box;
 },
 bindFileInput(input,callback){
  if(!input)return;
  input.addEventListener('change',async e=>{
   const file=e.target.files?.[0];
   if(!file)return;
   const text=await file.text().catch(()=> '');
   callback({file,text});
  });
 }
};
})();
