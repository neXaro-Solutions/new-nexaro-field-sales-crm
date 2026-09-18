(()=>{
'use strict';
const PRODUCTS=[
 {name:'Solo Lite',price:34,benefits:['Mobiles Terminal','Smartphone gekoppelt']},
 {name:'Solo',price:79,benefits:['Eigenständiges Terminal','Mehr Flexibilität']},
 {name:'Terminal',price:169,benefits:['Terminal mit Kassenfunktionen','Geeignet für Verkauf vor Ort']}
];
const TARIFFS=[
 {name:'Umsatzbasiertes Zahlen',monthly:0,rate:.0139,benefits:['Keine Monatsgebühr','Volle Flexibilität']},
 {name:'Zahlungen Plus',monthly:19,rate:.0079,benefits:['Niedrigere Transaktionskosten','Planbare Monatskosten']}
];
function money(v){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(v)}
function estimate(tpv){
 const rows=TARIFFS.map(t=>({...t,cost:t.monthly+tpv*t.rate}));
 return rows.sort((a,b)=>a.cost-b.cost)[0];
}
function analyze(text){
 const tpv=Number((text.match(/(?:umsatz|volumen|tpv)[^0-9]{0,20}([0-9.]+)/i)||[])[1]?.replace(/\./g,'')||0);
 const tariff=estimate(tpv||5000);
 const hardware=tpv>10000?PRODUCTS[2]:tpv>4000?PRODUCTS[1]:PRODUCTS[0];
 return {tpv,tariff,hardware};
}
function render(){
 if(document.getElementById('nxsuAnalyzer'))return;
 const box=document.createElement('div');box.id='nxsuAnalyzer';box.className='card';
 box.innerHTML=`<div class="eyebrow">SUMUP · ANALYSE</div><h3>Ist-Situation analysieren</h3><p class="muted">Kartenzahlungsabrechnung fotografieren oder Text einfügen. Die Analyse erzeugt eine Lösungsempfehlung.</p><input id="nxsuDoc" type="file" accept="image/*,.pdf"><textarea id="nxsuText" placeholder="Kartenzahlungsabrechnung / aktueller Anbieter / Monatsvolumen"></textarea><button class="primary" id="nxsuAnalyze">Analyse starten</button><div id="nxsuAnalysisResult"></div>`;
 const target=document.querySelector('#pricingDialog .dialog-body')||document.querySelector('#more')||document.body;
 target.appendChild(box);
 document.getElementById('nxsuAnalyze').onclick=()=>{
  const result=analyze(document.getElementById('nxsuText').value);
  document.getElementById('nxsuAnalysisResult').innerHTML=`<h4>Empfehlung</h4><b>${result.hardware.name}</b> ${money(result.hardware.price)}<br><b>${result.tariff.name}</b><br>Geschätzte monatliche Kosten: ${money(result.tariff.cost)}<ul>${[...result.hardware.benefits,...result.tariff.benefits].map(x=>`<li>${x}</li>`).join('')}</ul>`;
 };
}
window.neXaroSumUpAnalyzer={analyze};
new MutationObserver(render).observe(document.body,{childList:true,subtree:true});
setTimeout(render,500);
})();