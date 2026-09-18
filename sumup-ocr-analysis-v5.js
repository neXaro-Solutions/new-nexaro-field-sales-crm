(()=>{
'use strict';

/* neXaro SUMUP OCR Analysis V5
   Abrechnung -> Datenextraktion -> Beratungsgrundlage
*/
window.neXaroSumUpOCRV5={
 extract(text=''){
  const clean=text.replace(/\s+/g,' ');
  const find=(regex)=>{
   const m=clean.match(regex);
   if(!m)return 0;
   return Number(m[1].replace(/\./g,'').replace(',','.'))||0;
  };
  return {
   provider: clean.match(/(sumup|izettle|zettle|paypal|stripe|ingenico|worldline)/i)?.[1]||'Unbekannt',
   monthlyVolume:find(/([0-9\.]+,[0-9]{2})\s*€/),
   fees:find(/(?:Gebühren|Provision|Kosten)\s*[:\-]?\s*([0-9\.]+,[0-9]{2})\s*€/i),
   transactions:find(/([0-9\.]+)\s*(?:Transaktionen|Zahlungen)/i),
   raw:text,
   confidence:'Basisanalyse'
  };
 },
 analyzeDocument(text){
  const data=this.extract(text);
  window.dispatchEvent(new CustomEvent('nxsu:ocr-analysis-ready',{detail:data}));
  return data;
 }
};
})();
