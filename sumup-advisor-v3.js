(()=>{
'use strict';

/* neXaro SUMUP Advisor V3
   Beratungskern: Ist-Situation -> Analyse -> Empfehlung -> Angebot
*/
window.neXaroSumUpAdvisorV3={
 analyze(data={}){
  const volume=Number(data.monthlyVolume)||0;
  const transactions=Number(data.transactions)||0;
  const currentRate=Number(data.currentRate)||0;
  const currentFixed=Number(data.currentFixed)||0;
  const currentCost=(volume*(currentRate/100))+currentFixed;

  const plus=volume*0.0079+19;
  const basic=volume*0.0139;
  const tariff=plus<basic?{
    name:'SumUp Zahlungen Plus',
    monthly:19,
    rate:'0,79%'
   }:{
    name:'SumUp umsatzbasiert',
    monthly:0,
    rate:'1,39%'
   };

  const recommendedHardware=volume>10000?'SumUp Terminal':'SumUp Solo';
  return {
   currentCost,
   recommendation:tariff,
   hardware:recommendedHardware,
   potential:Math.max(0,currentCost-Math.min(plus,basic)),
   arguments:[
    'Passender Tarif anhand Ihres Zahlungsvolumens',
    'Keine langfristige Bindung',
    'Transparente Kostenstruktur',
    'Moderne Kartenzahlungslösung'
   ],
   input:{volume,transactions}
  };
 },
 parseText(text=''){
  const value=(regex)=>{const m=text.match(regex);return m?Number(m[1].replace('.','').replace(',','.')):0};
  return {
   monthlyVolume:value(/([0-9\.]+,[0-9]{2})\s*€?/),
   transactions:value(/([0-9\.]+)\s*(Transaktionen|Zahlungen)/i),
   raw:text
  };
 }
};
})();
