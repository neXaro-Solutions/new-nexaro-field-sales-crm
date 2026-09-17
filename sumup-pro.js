(()=>{
'use strict';
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const DATA={
 fees:{payg:{name:'Umsatzbasiertes Zahlen',rate:.0139,monthly:0,label:'1,39 %',detail:'0 € Monatsgebühr · 1,39 % pro Kartenzahlung.'},plus:{name:'Zahlungen Plus',rate:.0079,monthly:19,label:'0,79 %',detail:'19 € monatlich · 0,79 % für berechtigte Vor-Ort-Zahlungen.'}},
 hardware:[
  {id:'tap',name:'Tap to Pay',price:0,desc:'Kontaktlose Zahlungen direkt mit dem Smartphone.',discountable:false},
  {id:'solo-lite',name:'Solo Lite',price:34,desc:'Kompaktes Kartenterminal mit Smartphone-Kopplung.',discountable:true},
  {id:'solo',name:'Solo',price:79,desc:'Eigenständiges Kartenterminal ohne Smartphone-Abhängigkeit.',discountable:true},
  {id:'terminal',name:'Terminal',price:169,desc:'Eigenständiges Terminal mit integriertem Belegdrucker.',discountable:true}
 ],
 pos:[
  {id:'kasse',name:'SumUp Kasse',price:399,desc:'All-in-one-Kassensystem für zentrale Kassenprozesse.',discountable:true},
  {id:'starter',name:'Kassensystem Starter-Kit',price:549,desc:'SumUp Kasse mit Bondrucker.',discountable:false},
  {id:'complete',name:'Komplettes Kassensystem-Set',price:599,desc:'SumUp Kasse mit Bondrucker und Kassenschublade.',discountable:false},
  {id:'retail',name:'Kassensystem-Set für Einzelhandel',price:649,desc:'SumUp Kasse mit Bondrucker, Kassenschublade und Barcode-Scanner.',discountable:false}
 ],
 software:{free:{name:'Kostenlose Kassensoftware',price:0},plus:{name:'Kassensystem Plus',price:49}},
 business:[['gastronomie','Gastronomie'],['retail','Einzelhandel'],['beauty','Beauty'],['service','Professionelle Dienstleistungen'],['craft','Handwerk'],['taxi','Taxi / Mobilität'],['events','Veranstaltungen'],['medical','Medizinische Versorgung'],['hotel','Hotel / Beherbergung'],['association','Verein / Organisation']]
};
let last=null;
function leads(){try{const s=JSON.parse(localStorage.getItem('nexaro-crm-v2-0')||'{}');return Array.isArray(s.leads)?s.leads:[]}catch{return[]}}
function choose(d){
 const tpv=Math.max(0,+d.tpv||0),business=d.business,mobile=d.mobile==='yes',smartphone=d.smartphone==='yes',printer=d.printer==='yes',pos=d.pos==='yes',team=d.team==='yes';
 let hardware,packageType='payment';
 if(pos){
  hardware=business==='retail'&&d.barcode==='yes'?DATA.pos.find(x=>x.id==='retail'):printer&&team?DATA.pos.find(x=>x.id==='complete'):printer?DATA.pos.find(x=>x.id==='starter'):DATA.pos.find(x=>x.id==='kasse');
  packageType='pos';
 }else if(mobile&&smartphone&&d.device==='phone')hardware=DATA.hardware.find(x=>x.id==='tap');
 else if(mobile&&smartphone&&d.device==='small')hardware=DATA.hardware.find(x=>x.id==='solo-lite');
 else if(printer)hardware=DATA.hardware.find(x=>x.id==='terminal');
 else if(d.device==='independent'||!smartphone)hardware=DATA.hardware.find(x=>x.id==='solo');
 else hardware=DATA.hardware.find(x=>x.id==='solo-lite');
 const tariff=tpv>3900?'plus':'payg';
 const software=packageType==='pos'?(d.advanced==='yes'?DATA.software.plus:DATA.software.free):null;
 const addons=[];
 if(d.online==='yes')addons.push({name:'Online-Zahlungen',price:0,desc:'Online-Zahlungen'});
 if(d.links==='yes')addons.push({name:'Zahlungslinks',price:0,desc:'Zahlungslinks'});
 if(d.bookings==='yes')addons.push({name:'SumUp Bookings',price:0,desc:'Online-Terminbuchung'});
 if(d.invoice==='yes')addons.push({name:'Rechnungen',price:0,desc:'Rechnungsfunktion'});
 const reasons=[tpv>3900?'TPV über 3.900 € → Zahlungen Plus wird vorgeschlagen.':'TPV bis 3.900 € → umsatzbasiertes Modell ohne Monatsgebühr.'];
 if(pos)reasons.push('Kassensystem wird benötigt.');
 if(business==='retail'&&d.barcode==='yes')reasons.push('Einzelhandel + Barcode-Scanner → Retail-Komplettset.');
 if(printer)reasons.push('Belegdrucker wird benötigt.');
 if(team)reasons.push('Mehrere Mitarbeitende / Stationen berücksichtigt.');
 if(mobile)reasons.push('Mobiler Einsatz berücksichtigt.');
 return {hardware,tariff,software,addons,packageType,reasons,tpv,business};
}
function formData(){const g=id=>document.getElementById(id)?.value||'';return{tpv:+g('nxsuTpv')||0,business:g('nxsuBusiness'),mobile:g('nxsuMobile'),smartphone:g('nxsuSmartphone'),device:g('nxsuDevice'),pos:g('nxsuPos'),printer:g('nxsuPrinter'),team:g('nxsuTeam'),barcode:g('nxsuBarcode'),online:g('nxsuOnline'),bookings:g('nxsuBookings'),invoice:g('nxsuInvoice'),advanced:g('nxsuAdvanced'),links:g('nxsuLinks')}}
function discount(r){const requested=Math.min(25,Math.max(0,+document.getElementById('nxsuDiscount')?.value||0)),h=r.hardware,allowed=h.discountable!==false&&h.price>0,pct=allowed?requested:0;return{pct,net:h.price-(h.price*pct/100)}}
function renderResult(r){const h=r.hardware,t=DATA.fees[r.tariff],d=discount(r),monthly=r.tpv*t.rate+t.monthly;return`<div class="nxsu-recommend"><div class="nxsu-recommend-head"><div><span class="nxsu-kicker">IHRE EMPFOHLENE LÖSUNG</span><h3>${esc(h.name)}</h3><p>${esc(h.desc)}</p></div><div class="nxsu-price">${money(d.net)}<small>regulär ${money(h.price)}${d.pct?' · interner Rabatt '+d.pct+' %':''}</small></div></div><div class="nxsu-pillrow"><span>Tarif: <b>${esc(t.name)}</b></span><span>${t.label}</span><span>${money(t.monthly)}/Monat</span><span>TPV ${money(r.tpv)} · rechnerisch ${money(monthly)}/Monat</span></div><div class="nxsu-grid"><div><b>Warum diese Lösung?</b><ul>${r.reasons.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><b>Bestandteile</b><ul><li>${esc(h.name)} – ${money(d.net)} einmalig</li>${r.software?`<li>${esc(r.software.name)} – ${money(r.software.price)}/Monat</li>`:''}<li>${esc(t.name)} – ${esc(t.detail)}</li>${r.addons.map(x=>`<li>${esc(x.name)} – ${esc(x.desc)}</li>`).join('')}</ul></div></div><div class="nxsu-important"><b>Preisregel:</b> Regulärer Hardwarepreis als Basis. Interner Rabatt maximal 25 % und nur auf rabattfähige Hardware. Kassenschublade, Epson-Drucker und Handscanner sind ausgeschlossen.</div><div class="nxsu-actions"><button type="button" class="primary" id="nxsuOffer">💼 Ausgewählte Lösung ins Angebot</button><button type="button" class="secondary" id="nxsuSaveLead">💾 Empfehlung am Lead speichern</button></div></div>`}
function update(){last=choose(formData());const box=document.getElementById('nxsuResult');if(!box)return;box.innerHTML=renderResult(last);document.getElementById('nxsuOffer').onclick=offer;document.getElementById('nxsuSaveLead').onclick=saveLead}
function ensureDialog(){
 if(document.getElementById('sumupProDialog'))return;
 const d=document.createElement('dialog');d.id='sumupProDialog';
 d.innerHTML=`<form method="dialog" id="sumupProForm"><div class="nxsu-head"><div><span class="nxsu-kicker">neXaro SOLUTIONS · SUMUP</span><h2>SumUp Lösungsberater</h2><p>Kunde → Bedarf → konkrete Empfehlung → Angebot</p></div><button type="button" class="icon-btn" id="nxsuClose">✕</button></div><div class="nxsu-section"><h3>1 · Kunde & Geschäft</h3><div class="nxsu-formgrid"><label>Lead / Kunde<select id="nxsuLead"><option value="">Kein Lead – manuell</option></select></label><label>Geschäftsart<select id="nxsuBusiness">${DATA.business.map(x=>`<option value="${x[0]}">${esc(x[1])}</option>`).join('')}</select></label><label>Kartenzahlungsvolumen / Monat €<input id="nxsuTpv" type="number" min="0" step="100" value="3000"></label><label>Interner Hardware-Rabatt %<input id="nxsuDiscount" type="number" min="0" max="25" step="1" value="0"><small>Maximal 25 % auf rabattfähige Hardware.</small></label><label>Standort / Einsatz<select id="nxsuMobile"><option value="no">Überwiegend stationär</option><option value="yes">Häufig mobil / unterwegs</option></select></label></div></div><div class="nxsu-section"><h3>2 · Bedarf</h3><div class="nxsu-formgrid"><label>Smartphone vorhanden?<select id="nxsuSmartphone"><option value="yes">Ja</option><option value="no">Nein / nicht gewünscht</option></select></label><label>Bevorzugtes Gerät<select id="nxsuDevice"><option value="small">Kompakt</option><option value="phone">Nur Smartphone</option><option value="independent">Eigenständig</option></select></label><label>Kassensystem benötigt?<select id="nxsuPos"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Belegdrucker benötigt?<select id="nxsuPrinter"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Mehrere Mitarbeitende / Stationen?<select id="nxsuTeam"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Barcode-Scanner / Retail?<select id="nxsuBarcode"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Online-Zahlungen?<select id="nxsuOnline"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Terminbuchung?<select id="nxsuBookings"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Rechnungen?<select id="nxsuInvoice"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Erweiterte Kassenfunktionen?<select id="nxsuAdvanced"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Zahlungslinks?<select id="nxsuLinks"><option value="no">Nein</option><option value="yes">Ja</option></select></label></div></div><div class="nxsu-result" id="nxsuResult"><div class="nxsu-empty">Empfehlung wird aus den Angaben berechnet.</div></div><div class="nxsu-footer"><small>Reguläre Hardwarepreise. Aktionspreise werden nicht verwendet. Nur die ausgewählte Empfehlung wird ins Angebot übernommen.</small><button type="button" class="secondary" id="nxsuSource">SumUp Originaldaten</button></div></form>`;
 document.body.appendChild(d);
 document.getElementById('nxsuClose').onclick=()=>d.close();
 document.getElementById('nxsuSource').onclick=()=>window.open('https://www.sumup.com/de-de/','_blank','noopener');
 const lead=document.getElementById('nxsuLead');leads().forEach(l=>{const o=document.createElement('option');o.value=l.id;o.textContent=(l.company||'Lead')+(l.city?' · '+l.city:'');lead.appendChild(o)});
 ['nxsuLead','nxsuBusiness','nxsuTpv','nxsuDiscount','nxsuMobile','nxsuSmartphone','nxsuDevice','nxsuPos','nxsuPrinter','nxsuTeam','nxsuBarcode','nxsuOnline','nxsuBookings','nxsuInvoice','nxsuAdvanced','nxsuLinks'].forEach(id=>document.getElementById(id).addEventListener('input',update));
 lead.addEventListener('change',()=>{const l=leads().find(x=>x.id===lead.value);if(l){document.getElementById('nxsuTpv').value=l.tpv||0;document.getElementById('nxsuBusiness').value=mapBusiness(l.industry||'');update()}})
}
function mapBusiness(s){s=String(s||'').toLowerCase();if(/retail|handel|shop|bekleidung|mode|geschäft|geschaeft/.test(s))return'retail';if(/cafe|restaurant|gastr|bar|imbiss|food|markt/.test(s))return'gastronomie';if(/friseur|barber|kosmetik|beauty|nagel|wellness/.test(s))return'beauty';if(/handwerk|bau|montage|reparatur/.test(s))return'craft';if(/taxi/.test(s))return'taxi';if(/hotel/.test(s))return'hotel';if(/medizin|arzt|praxis/.test(s))return'medical';if(/event|veranst/.test(s))return'events';return'service'}
function openCenter(){ensureDialog();const d=document.getElementById('sumupProDialog');if(d.open)d.close();update();d.showModal()}
function saveLead(){const id=document.getElementById('nxsuLead')?.value;if(!id||!last)return alert('Bitte zuerst einen Lead auswählen.');try{const s=JSON.parse(localStorage.getItem('nexaro-crm-v2-0')||'{}'),l=(s.leads||[]).find(x=>x.id===id);if(!l)return;const d=discount(last);l.product=last.hardware.name;l.terminal=last.hardware.name;l.provider='SumUp';l.need=`Empfohlene SumUp-Lösung: ${last.hardware.name} · ${DATA.fees[last.tariff].name}`;l.notes=[l.notes||'',`SumUp Beratung: ${last.hardware.name}; Hardware ${money(d.net)}; Rabatt ${d.pct} %; TPV ${money(last.tpv)}.`].filter(Boolean).join('\n');localStorage.setItem('nexaro-crm-v2-0',JSON.stringify(s));alert('Empfehlung am Lead gespeichert.')}catch{alert('Lead konnte nicht gespeichert werden.')}}
function quoteItemHtml(item){return`<div class="line-item"><div class="line-index"></div><input class="li-desc" placeholder="Bezeichnung / Leistung" value="${esc(item.description||'')}"><input class="li-qty" type="number" min="0" step="0.01" value="${item.qty??1}"><input class="li-unit" placeholder="Einheit" value="${esc(item.unit||'Stück')}"><input class="li-price" type="number" min="0" step="0.01" value="${Number(item.price)||0}"><div class="li-total">0,00 €</div><button type="button" class="icon-btn remove-line">✕</button></div>`}
function bindQuoteRows(box){box.querySelectorAll('.line-item').forEach((r,i)=>{const idx=r.querySelector('.line-index');if(idx)idx.textContent=String(i+1);const rem=r.querySelector('.remove-line');if(rem)rem.onclick=()=>{r.remove();if(typeof window.recalcItems==='function')window.recalcItems('quoteItems','qNetPreview','qVatPreview','qGrossPreview')}})}
function writeQuoteItems(items,attempt=0){
 const box=document.getElementById('quoteItems');
 if(!box){if(attempt<10)setTimeout(()=>writeQuoteItems(items,attempt+1),150);return false}
 box.innerHTML='';
 if(typeof window.addItem==='function'){
  items.forEach(i=>{try{window.addItem('quoteItems',i)}catch(e){}});
 }
 let rows=[...box.querySelectorAll('.line-item')];
 if(rows.length<items.length)box.innerHTML=items.map(quoteItemHtml).join('');
 rows=[...box.querySelectorAll('.line-item')];
 items.forEach((item,i)=>{const r=rows[i];if(!r)return;const set=(sel,val)=>{const el=r.querySelector(sel);if(el){el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}))}};set('.li-desc',item.description||'');set('.li-qty',item.qty??1);set('.li-unit',item.unit||'Stück');set('.li-price',Number(item.price)||0)});
 bindQuoteRows(box);
 if(typeof window.recalcItems==='function')window.recalcItems('quoteItems','qNetPreview','qVatPreview','qGrossPreview');
 return true;
}
function offer(){
 if(!last)return;
 const id=document.getElementById('nxsuLead')?.value||null;
 if(typeof window.quote!=='function')return alert('Angebotsmodul nicht verfügbar.');
 const d=discount(last),fee=DATA.fees[last.tariff];
 const items=[{description:last.hardware.name,qty:1,unit:'Stück',price:d.net}];
 if(last.software?.price)items.push({description:last.software.name,qty:1,unit:'Monat',price:last.software.price});
 if(fee.monthly)items.push({description:fee.name,qty:1,unit:'Monat',price:fee.monthly});
 last.addons.filter(x=>x.price>0).forEach(x=>items.push({description:x.name,qty:1,unit:'Monat',price:x.price}));
 window.__nxsuOfferItems=items;
 window.quote(null,id);
 const note=`Empfohlene SumUp-Lösung: ${last.hardware.name}\nRegulärer Hardwarepreis: ${money(last.hardware.price)}\nInterner Rabatt: ${d.pct} %\nAngebotspreis Hardware: ${money(d.net)}\nTarif: ${fee.name} · ${fee.label}\nTPV: ${money(last.tpv)} / Monat`;
 const apply=()=>{writeQuoteItems(items);const n=document.getElementById('qNote');if(n){n.value=note;n.dispatchEvent(new Event('input',{bubbles:true}))}};
 [250,500,850,1200].forEach(ms=>setTimeout(apply,ms));
 setTimeout(()=>document.getElementById('sumupProDialog')?.close(),350);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action="pricing"]');if(b){e.preventDefault();e.stopImmediatePropagation();openCenter()}},true);
window.neXaroSumUp={open:openCenter,data:DATA,recommend:choose};
})();