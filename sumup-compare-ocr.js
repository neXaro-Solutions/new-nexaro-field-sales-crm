(()=>{
'use strict';
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const num=v=>{const s=String(v??'').trim().replace(/[^0-9,.-]/g,'');if(!s)return 0;return s.includes(',')?Number(s.replace(/\./g,'').replace(',','.'))||0:Number(s)||0};
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const byId=id=>document.getElementById(id);
function inject(){
 const form=byId('sumupProForm'); if(!form||byId('nxsuCompare'))return;
 const sec=document.createElement('div');sec.className='nxsu-section';sec.id='nxsuCompare';
 sec.innerHTML=`<h3>3 · Aktuellen Anbieter vergleichen</h3>
 <p class="nxsu-compare-intro">Direkt nach Eingabe der aktuellen Kosten zeigt der Berater die rechnerische Differenz zu SumUp. Alternativ kann eine aktuelle Abrechnung fotografiert und automatisch ausgelesen werden.</p>
 <div class="nxsu-ocr-row"><button type="button" class="secondary" id="nxsuOcrBtn">📷 Abrechnung per Foto einlesen</button><input id="nxsuOcrFile" type="file" accept="image/*" capture="environment" hidden><span id="nxsuOcrStatus"></span></div>
 <div class="nxsu-formgrid">
  <label>Aktueller Anbieter<input id="nxsuCurrentProvider" placeholder="z. B. myPOS, PayPal, VR Payment"></label>
  <label>Aktuelle Transaktionsgebühr (%)<input id="nxsuCurrentRate" type="number" min="0" step="0.01" placeholder="z. B. 1,79"></label>
  <label>Monatliche Grundgebühr aktuell (€)<input id="nxsuCurrentMonthly" type="number" min="0" step="0.01" value="0"></label>
  <label>Terminal-/Gerätemiete pro Monat (€)<input id="nxsuCurrentTerminal" type="number" min="0" step="0.01" value="0"></label>
  <label>Sonstige monatliche Kosten (€)<input id="nxsuCurrentOther" type="number" min="0" step="0.01" value="0"></label>
 </div>
 <div id="nxsuCompareResult" class="nxsu-empty">Noch keine Vergleichsdaten. Geben Sie die aktuellen Kosten ein oder lesen Sie eine Abrechnung ein.</div>`;
 const result=form.querySelector('.nxsu-result');form.insertBefore(sec,result||form.querySelector('.nxsu-footer'));
 const btn=byId('nxsuOcrBtn'),file=byId('nxsuOcrFile');btn.onclick=()=>file.click();file.onchange=()=>{if(file.files?.[0])readInvoice(file.files[0])};
 ['nxsuCurrentRate','nxsuCurrentMonthly','nxsuCurrentTerminal','nxsuCurrentOther','nxsuTpv'].forEach(id=>byId(id)?.addEventListener('input',renderCompare));
 renderCompare();
}
function sumupCost(tpv){const rate=tpv>=3900?.0079:.0139,monthly=tpv>=3900?19:0;return{rate,monthly,annual:tpv*rate*12+monthly*12,name:tpv>=3900?'Zahlungen Plus':'Umsatzbasiertes Zahlen'}}
function renderCompare(){
 const box=byId('nxsuCompareResult');if(!box)return;
 const tpv=num(byId('nxsuTpv')?.value),rate=num(byId('nxsuCurrentRate')?.value),monthly=num(byId('nxsuCurrentMonthly')?.value)+num(byId('nxsuCurrentTerminal')?.value)+num(byId('nxsuCurrentOther')?.value);
 if(!tpv||!rate){box.className='nxsu-empty';box.innerHTML='Noch keine Vergleichsdaten. <b>Kartenzahlungsvolumen</b> und <b>aktuelle Transaktionsgebühr</b> werden benötigt.';return}
 const currentAnnual=tpv*rate/100*12+monthly*12,s=sumupCost(tpv),diff=currentAnnual-s.annual;
 box.className='nxsu-compare-card';box.innerHTML=`<div class="nxsu-recommend-head"><div><span class="nxsu-kicker">KOSTENVERGLEICH</span><h3>${diff>=0?'Rechnerischer Kostenvorteil mit SumUp':'Kostenvergleich: aktueller Anbieter liegt rechnerisch niedriger'}</h3><p>${esc(byId('nxsuCurrentProvider')?.value||'Aktueller Anbieter')} → ${s.name}</p></div><div class="nxsu-price">${money(Math.abs(diff)/12)}<small>${diff>=0?'mögliche Ersparnis':'Mehrkosten'} pro Monat · ${money(Math.abs(diff))} pro Jahr</small></div></div><div class="nxsu-compare-grid"><div><b>Aktueller Anbieter</b><span>${money(currentAnnual/12)} / Monat</span><small>${rate.toLocaleString('de-DE')} % + ${money(monthly)} Fixkosten/Monat</small></div><div><b>SumUp</b><span>${money(s.annual/12)} / Monat</span><small>${(s.rate*100).toLocaleString('de-DE')} % + ${money(s.monthly)} / Monat · ${s.name}</small></div></div><div class="nxsu-important"><b>Berechnungsgrundlage:</b> ${money(tpv)} monatlicher Kartenzahlungsumsatz × jeweilige Transaktionsgebühr + monatliche Fixkosten. Weitere Kartenarten, Sondertarife oder Einmalgebühren können das tatsächliche Ergebnis verändern.</div>`;
}
async function loadTesseract(){
 if(window.Tesseract)return window.Tesseract;
 return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=()=>resolve(window.Tesseract);s.onerror=reject;document.head.appendChild(s)});
}
function extract(text){
 const t=text.replace(/\u00a0/g,' ').replace(/\r/g,'\n');
 const out={provider:'',rate:'',monthly:'',terminal:'',other:'',tpv:''};
 const providers=['myPOS','PayPal','Zettle','iZettle','Nexi','VR Payment','Worldline','Concardis','TeleCash','Stripe','Flatpay','SumUp','Ingenico'];
 const low=t.toLowerCase();const p=providers.find(x=>low.includes(x.toLowerCase()));if(p)out.provider=p;
 const ratePatterns=[/(?:transaktionsgebühr|transaktionsgebuehr|kartengebühr|kartengebuehr|aktionsgebühr|gebühr pro transaktion)[^\n]{0,80}(\d{1,2}[,.]\d{1,2})\s*%/i,/(\d{1,2}[,.]\d{1,2})\s*%[^\n]{0,60}(?:transaktion|kartenzahlung)/i];
 for(const r of ratePatterns){const m=t.match(r);if(m){out.rate=m[1].replace(',','.');break}}
 const monthlyPatterns=[/(?:monatliche grundgebühr|monatliche gebühr|grundgebühr|monatsgebühr|abo)[^\n]{0,80}(\d{1,4}[,.]\d{2})\s*€/i,/(?:monatlich|pro monat)[^\n]{0,40}(\d{1,4}[,.]\d{2})\s*€/i];
 for(const r of monthlyPatterns){const m=t.match(r);if(m){out.monthly=m[1].replace(',','.');break}}
 const terminalPatterns=[/(?:terminalmiete|gerätemiete|geraetemiete|miete.*terminal|miete.*gerät)[^\n]{0,80}(\d{1,4}[,.]\d{2})\s*€/i];
 for(const r of terminalPatterns){const m=t.match(r);if(m){out.terminal=m[1].replace(',','.');break}}
 const tpvPatterns=[/(?:kartenzahlungsumsatz|kartenumsatz|zahlungsumsatz|umsatz.*kartenzahlung)[^\n]{0,80}(\d{1,3}(?:[.]\d{3})*(?:,[0-9]{2})?)\s*€/i,/(?:umsatz)[^\n]{0,40}(\d{1,3}(?:[.]\d{3})*(?:,[0-9]{2})?)\s*€/i];
 for(const r of tpvPatterns){const m=t.match(r);if(m){out.tpv=m[1].replace(/\./g,'').replace(',','.');break}}
 return out;
}
async function readInvoice(file){
 const status=byId('nxsuOcrStatus');status.textContent='⏳ Abrechnung wird gelesen …';
 try{const T=await loadTesseract();const {data}=await T.recognize(file,'deu+eng',{logger:m=>{if(m.status==='recognizing text'&&m.progress)status.textContent='⏳ OCR '+Math.round(m.progress*100)+' % …'}});const x=extract(data.text);if(x.provider)byId('nxsuCurrentProvider').value=x.provider;if(x.rate)byId('nxsuCurrentRate').value=x.rate;if(x.monthly)byId('nxsuCurrentMonthly').value=x.monthly;if(x.terminal)byId('nxsuCurrentTerminal').value=x.terminal;if(x.tpv)byId('nxsuTpv').value=x.tpv;status.textContent='✓ Abrechnung ausgelesen – Werte bitte kurz prüfen.';renderCompare();byId('nxsuTpv')?.dispatchEvent(new Event('input',{bubbles:true}));}catch(e){console.error(e);status.textContent='⚠️ Foto konnte nicht automatisch gelesen werden. Bitte Werte manuell eingeben.'}
}
window.neXaroSumUpCompare={inject,render:renderCompare,readInvoice};
const start=()=>{inject();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
const obs=new MutationObserver(()=>{if(byId('sumupProForm'))inject()});obs.observe(document.body,{childList:true,subtree:true});
})();