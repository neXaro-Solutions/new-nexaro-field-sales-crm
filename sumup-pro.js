(()=>{
'use strict';
const KEY='nexaro-crm-v2-0';
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const SUMUP={
 updated:'2026-09-17',
 fees:{payg:{name:'Umsatzbasiertes Zahlen',rate:.0139,monthly:0,label:'1,39 %',detail:'0 € Monatsgebühr. 1,39 % pro Kartenzahlung.'},plus:{name:'Zahlungen Plus',rate:.0079,monthly:19,label:'0,79 %',detail:'19 € monatlich oder 199 € jährlich; 0,79 % für berechtigte Vor-Ort-Zahlungen mit Verbraucherkarten aus dem EWR. Karten außerhalb des EWR sowie Firmen-/Premiumkarten inkl. American Express: 1,39 %. Online-Zahlungen: 2,50 %.'}},
 hardware:[
  {id:'tap',name:'Tap to Pay',price:0,regular:0,unit:'Smartphone',tag:'Kein Zusatzgerät',desc:'Kontaktlose Zahlungen direkt mit iPhone oder Android über die SumUp Business App.',best:'Mobile Dienstleister, Taxi, Handwerk, Marktstand, spontane Zahlungen',features:['Keine zusätzliche Hardware','Mobil überall mit Empfang','Bei höheren Beträgen PIN-Eingabe möglich','Apple Pay und Google Pay']},
  {id:'solo-lite',name:'Solo Lite',price:22,regular:34,unit:'Gerät',tag:'Smartphone-Kopplung',desc:'Kompaktes Kartenlesegerät, das mit dem Smartphone gekoppelt wird.',best:'Kleine mobile Betriebe mit physischem Terminal und Smartphone',features:['126 g','83 × 83 mm','USB-C','Chip & PIN, kontaktlos, Wallets','Bis zu 1.000 Zahlungen pro Akkuladung']},
  {id:'solo',name:'Solo',price:59,regular:79,unit:'Gerät',tag:'Eigenständig',desc:'Eigenständiges Kartenterminal mit Touchscreen, WLAN und integrierter 4G-SIM.',best:'Mobile und stationäre Betriebe, die ohne Smartphone kassieren möchten',features:['Eigenständig ohne Smartphone','WLAN + 4G mit unbegrenztem Datenvolumen','Bis zu 8 Stunden Laufzeit','Ladestation inklusive','Drucker optional']},
  {id:'terminal',name:'Terminal',price:139,regular:169,unit:'Gerät',tag:'Mit Belegdrucker',desc:'Eigenständiges All-in-one-Terminal mit Touchscreen, Bestellverwaltung und integriertem Belegdrucker.',best:'Gastronomie, Einzelhandel und Betriebe mit hohem Durchsatz',features:['Integrierter Belegdrucker','Eigenständiges Gerät','Kassensystem-Funktionen','Bestellverwaltung','Bis zu 250 Zahlungen inkl. Belegdruck pro Ladung']}
 ],
 pos:[
  {id:'kasse',name:'SumUp Kasse',price:399,vat:474.81,tag:'TSE-Kassensystem',desc:'All-in-one-Kassensystem mit 13-Zoll-Händlerdisplay und 8-Zoll-Kundendisplay.',features:['TSE-konform','Bar- und Kartenzahlungen','Artikel, Bestände, Teams und Berichte','Kundendisplay','Kostenlose Kassensoftware inklusive']},
  {id:'starter',name:'Kassensystem Starter-Kit',price:549,vat:653.31,tag:'Kasse + Bondrucker',desc:'SumUp Kasse mit Bondrucker.',features:['2 Touchscreens','Bondrucker','Kassenabläufe zentral','Geeignet für Gastronomie und Einzelhandel']},
  {id:'complete',name:'Komplettes Kassensystem-Set',price:599,vat:712.81,tag:'Kasse + Drucker + Schublade',desc:'SumUp Kasse mit Bondrucker und Kassenschublade.',features:['2 Touchscreens','Bondrucker','Kassenschublade','Komplettlösung für Verkaufstresen']},
  {id:'retail',name:'Kassensystem-Set für Einzelhandel',price:649,vat:772.31,tag:'Retail komplett',desc:'SumUp Kasse mit Bondrucker, Kassenschublade und Barcode-Scanner.',features:['2 Touchscreens','Bondrucker','Kassenschublade','Barcode-Scanner','Für Warenverkauf und Bestandsprozesse']}
 ],
 software:[{id:'pos-free',name:'Kostenlose Kassensoftware',price:0,desc:'Grundlegende Kassensoftware ohne monatliche Softwarekosten.'},{id:'pos-plus',name:'Kassensystem Plus',price:49,desc:'Erweiterte Kassensoftware; laut SumUp u. a. für zusätzliche Funktionen wie Barcode-Scanning und Order & Pay.'}],
 digital:[
  {id:'online',name:'Online-Zahlungen',price:0,fee:'2,50 %',desc:'Online-Zahlungen für Websites und digitale Verkaufskanäle.'},
  {id:'links',name:'Zahlungslinks',price:0,fee:'2,50 %',desc:'Zahlungslinks ohne monatliche Gebühr; Zahlung online per Link.'},
  {id:'shop',name:'SumUp Onlineshop',price:0,fee:'2,50 %',desc:'Kostenloser Onlineshop ohne monatliche Kosten; Online-Transaktionsgebühr 2,5 %.'},
  {id:'bookings',name:'SumUp Bookings',price:0,fee:'2,50 %',desc:'Kostenloses Online-Buchungssystem für Terminplanung; 2,5 % bei Zahlungen.'},
  {id:'invoice',name:'Rechnungen',price:0,fee:'2,50 % online',desc:'Kostenloses Abo mit bis zu 4 Rechnungen pro Kalendermonat; Online-Kartenzahlungen 2,5 %.'},
  {id:'invoice-plus',name:'Rechnungen Plus',price:10,annual:8,fee:'2,50 % online',desc:'Unbegrenzte Rechnungen, mehr Gestaltung, mehrere Währungen und Bankkonten; 10 €/Monat bzw. 8 €/Monat im Jahresabo.'}
 ],
 business:[
  ['gastronomie','Gastronomie','Café, Restaurant, Bar, Club, Foodtruck, Schnellrestaurant, Lebensmittelgeschäft, Marktstand'],
  ['retail','Einzelhandel','Einzelhandel, Bekleidung, Geschenkartikel'],
  ['beauty','Beauty','Kosmetik, Friseur, Barber, Nagelstudio, Wellness'],
  ['service','Professionelle Dienstleistungen','Beratung, Agentur, Büro, Freiberufler'],
  ['craft','Handwerk','Handwerker, Montage, Reparatur, Vor-Ort-Service'],
  ['taxi','Taxi / Mobilität','Taxi und mobile Dienstleistungen'],
  ['events','Veranstaltungen','Events, Catering, temporäre Verkaufsstellen'],
  ['medical','Medizinische Versorgung','Praxen und medizinische Dienstleistungen'],
  ['hotel','Hotel / Beherbergung','Hotel und Beherbergung'],
  ['association','Verein / Organisation','Mitgliederorganisationen und Wohltätigkeit']
 ],
 tools:[
  ['account','Geschäftskonto','0 €','Auszahlungen bis 7 Uhr am Folgetag, auch am Wochenende; Mastercard, Echtzeitüberweisungen, Ausgaben und integrierte Rechnungen.'],
  ['expenses','Ausgaben','0 €','Belege erfassen, Ausgaben kategorisieren und Daten exportieren; besonders sinnvoll zusammen mit dem Geschäftskonto.'],
  ['loyalty','Treueprogramm','0 €','Punkte oder Stempel, Kampagnen und SumUp Local zur Kundenbindung.'],
  ['vouchers','Gutscheine','abhängig vom Verkaufsweg','Online und im Geschäft verkaufen/einlösen; Gebühren entsprechen dem jeweiligen Verkaufsweg.'],
  ['finance','Sofortfinanzierung','individuell','Nur für berechtigte SumUp Händler:innen; personalisiertes Angebot, feste Gebühr, Rückzahlung umsatzbasiert.']
 ],
 sources:{home:'https://www.sumup.com/de-de/',terminals:'https://www.sumup.com/de-de/kartenterminals/',pos:'https://www.sumup.com/de-de/kassensystem-kasse/',tap:'https://www.sumup.com/de-de/tap-to-pay/',invoice:'https://www.sumup.com/de-de/e-rechnung/preise/',shop:'https://www.sumup.com/de-de/onlineshop/',links:'https://www.sumup.com/de-de/zahlungslinks/',bookings:'https://www.sumup.com/de-de/bookings/',account:'https://www.sumup.com/de-de/geschaeftskonto/',loyalty:'https://www.sumup.com/de-de/sumup-treueprogramm/',expenses:'https://www.sumup.com/de-de/ausgaben/',finance:'https://www.sumup.com/de-de/sofortfinanzierung/'}
};
function readCRM(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function writeCRM(x){try{localStorage.setItem(KEY,JSON.stringify(x));return true}catch{return false}}
function getLeads(){const s=readCRM();return Array.isArray(s.leads)?s.leads:[]}
function leadOptions(){return '<option value="">Kein Lead – manuell</option>'+getLeads().map(l=>`<option value="${esc(l.id)}">${esc(l.company)}${l.city?' · '+esc(l.city):''}</option>`).join('')}
function productById(id){return [...SUMUP.hardware,...SUMUP.pos].find(x=>x.id===id)||null}
function choose(d){
 const tpv=Math.max(0,+d.tpv||0), b=d.business, mobile=d.mobile==='yes', smartphone=d.smartphone==='yes', printer=d.printer==='yes', pos=d.pos==='yes', online=d.online==='yes', bookings=d.bookings==='yes', team=d.team==='yes';
 let hardware, packageType='payment';
 if(pos){
   const p= b==='retail'&&d.barcode==='yes'?SUMUP.pos.find(x=>x.id==='retail'):printer&&team?SUMUP.pos.find(x=>x.id==='complete'):printer?SUMUP.pos.find(x=>x.id==='starter'):SUMUP.pos.find(x=>x.id==='kasse');
   hardware=p;packageType='pos';
 }else if(mobile&&smartphone&&d.device==='phone') hardware=SUMUP.hardware.find(x=>x.id==='tap');
 else if(mobile&&smartphone&&d.device==='small') hardware=SUMUP.hardware.find(x=>x.id==='solo-lite');
 else if(printer) hardware=SUMUP.hardware.find(x=>x.id==='terminal');
 else if(d.device==='independent'||!smartphone) hardware=SUMUP.hardware.find(x=>x.id==='solo');
 else hardware=SUMUP.hardware.find(x=>x.id==='solo-lite');
 const tariff=tpv>3900?'plus':'payg';
 const software=(pos&&d.advanced==='yes')?SUMUP.software.find(x=>x.id==='pos-plus'):SUMUP.software.find(x=>x.id==='pos-free');
 const addons=[];
 if(online) addons.push(SUMUP.digital.find(x=>x.id==='online'));
 if(d.links==='yes') addons.push(SUMUP.digital.find(x=>x.id==='links'));
 if(b==='retail'&&d.web==='yes') addons.push(SUMUP.digital.find(x=>x.id==='shop'));
 if((b==='beauty'||bookings)) addons.push(SUMUP.digital.find(x=>x.id==='bookings'));
 if(d.invoice==='yes') addons.push(tpv>0?SUMUP.digital.find(x=>x.id==='invoice'):SUMUP.digital.find(x=>x.id==='invoice'));
 if(b==='gastronomie'&&pos&&d.order==='yes') addons.push({id:'order-pay',name:'Order & Pay',price:49,fee:'2,50 %',desc:'Bestell- und Bezahllösung für Gastronomie; Bestandteil von Kassensystem Plus.'});
 const reasons=[];
 if(tpv>3900) reasons.push('Monatliches Kartenzahlungsvolumen liegt über 3.900 € – SumUp nennt Zahlungen Plus als günstigere Wahl.'); else reasons.push('Bei bis zu 3.900 € monatlichem Kartenzahlungsvolumen bleibt das umsatzbasierte Modell flexibel ohne Monatsgebühr.');
 if(pos) reasons.push('Der Kunde braucht einen zentralen Kassenprozess statt nur eines Kartenlesers.');
 if(hardware.id==='tap') reasons.push('Das Smartphone ist bereits vorhanden und Mobilität steht im Vordergrund.');
 if(hardware.id==='solo-lite') reasons.push('Physisches Terminal gewünscht, Smartphone vorhanden, kompakte Lösung.');
 if(hardware.id==='solo') reasons.push('Eigenständiges Gerät ohne Smartphone-Abhängigkeit.');
 if(hardware.id==='terminal') reasons.push('Belegdruck bzw. höherer Durchsatz spricht für das All-in-one-Terminal.');
 if(online) reasons.push('Online-Zahlungen werden als zusätzlicher Vertriebskanal benötigt.');
 if(bookings) reasons.push('Terminplanung und Online-Buchung sind relevant.');
 return {hardware,tariff,software,addons:addons.filter(Boolean),packageType,reasons,tpv,business};
}
function monthlyCost(r){return r.tpv*(r.tariff==='plus'?.0079:.0139)+(r.tariff==='plus'?19:0)}
function renderResult(r){
 const h=r.hardware,t=SUMUP.fees[r.tariff];
 const totalOne=h.price+(r.software?.price||0)*0;
 return `<div class="nxsu-recommend"><div class="nxsu-recommend-head"><div><span class="nxsu-kicker">IHRE EMPFOHLENE LÖSUNG</span><h3>${esc(h.name)}</h3><p>${esc(h.desc)}</p></div><div class="nxsu-price">${money(h.price)}<small>einmalig${h.regular>h.price?' · regulär '+money(h.regular):''}</small></div></div>
 <div class="nxsu-pillrow"><span>Tarif: <b>${esc(t.name)}</b></span><span>${esc(t.label)}</span><span>${money(t.monthly)}/Monat</span><span>ca. ${money(monthlyCost(r))}/Monat bei TPV ${money(r.tpv)}</span></div>
 <div class="nxsu-grid"><div><b>Warum diese Lösung?</b><ul>${r.reasons.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><b>Enthalten / vorgesehen</b><ul><li>${esc(h.name)} – ${esc(h.desc)}</li>${r.packageType==='pos'?`<li>${esc(r.software.name)} – ${money(r.software.price)}/Monat</li>`:''}<li>${esc(t.name)} – ${esc(t.detail)}</li>${r.addons.map(x=>`<li>${esc(x.name)} – ${esc(x.desc)}</li>`).join('')}</ul></div></div>
 <div class="nxsu-important"><b>Wichtig:</b> Es wird im Angebot nur diese ausgewählte Lösung ausgeschrieben. Alternativen bleiben ausschließlich im internen Beratungsbereich.</div>
 <div class="nxsu-actions"><button class="primary" id="nxsuOffer">💼 Ausgewählte Lösung ins Angebot</button><button class="secondary" id="nxsuSaveLead">💾 Empfehlung am Lead speichern</button></div></div>`;
}
function dialog(){if(document.getElementById('sumupProDialog'))return;const d=document.createElement('dialog');d.id='sumupProDialog';d.innerHTML=`<form method="dialog" id="sumupProForm"><div class="nxsu-head"><div><span class="nxsu-kicker">neXaro SOLUTIONS · SUMUP</span><h2>SumUp Lösungsberater</h2><p>Bedarf erfassen → passende Lösung auswählen → nur diese Lösung ins Angebot übernehmen.</p></div><button type="button" class="icon-btn" id="nxsuClose">✕</button></div><div class="nxsu-section"><h3>1 · Kunde & Geschäft</h3><div class="nxsu-formgrid"><label>Lead / Kunde<select id="nxsuLead">${leadOptions()}</select></label><label>Geschäftsart<select id="nxsuBusiness">${SUMUP.business.map(x=>`<option value="${x[0]}">${esc(x[1])}</option>`).join('')}</select></label><label>Monatliches Kartenzahlungsvolumen €<input id="nxsuTpv" type="number" min="0" step="100" value="3000"></label><label>Standort / Einsatz<select id="nxsuMobile"><option value="no">Überwiegend stationär</option><option value="yes">Häufig mobil / unterwegs</option></select></label></div></div><div class="nxsu-section"><h3>2 · Bedarf</h3><div class="nxsu-formgrid"><label>Smartphone vorhanden?<select id="nxsuSmartphone"><option value="yes">Ja</option><option value="no">Nein / nicht gewünscht</option></select></label><label>Gerätewunsch<select id="nxsuDevice"><option value="small">Kompakt & günstig</option><option value="phone">Nur Smartphone</option><option value="independent">Eigenständiges Terminal</option></select></label><label>Kassensystem / Artikelverwaltung nötig?<select id="nxsuPos"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Belege / Drucker nötig?<select id="nxsuPrinter"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Mehrere Mitarbeitende / Stationen?<select id="nxsuTeam"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Barcode-Scanner / Retail-Fokus?<select id="nxsuBarcode"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Online verkaufen / Online-Zahlungen?<select id="nxsuOnline"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Online-Terminbuchung?<select id="nxsuBookings"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Rechnungen / Angebote regelmäßig?<select id="nxsuInvoice"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Erweiterte Kassenfunktionen?<select id="nxsuAdvanced"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>QR-Bestellung / Order & Pay?<select id="nxsuOrder"><option value="no">Nein</option><option value="yes">Ja</option></select></label><label>Zahlungslinks?<select id="nxsuLinks"><option value="no">Nein</option><option value="yes">Ja</option></select></label></div></div><div id="nxsuResult" class="nxsu-result"><div class="nxsu-empty">Bitte Bedarf erfassen – die Empfehlung wird automatisch berechnet.</div></div><div class="nxsu-footer"><small>Datenstand: ${SUMUP.updated}. Preise/Aktionen können sich ändern; vor Abschluss immer die aktuelle SumUp-Seite prüfen.</small><button type="button" class="secondary" id="nxsuSource">SumUp Originaldaten</button></div></form>`;document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close()});document.getElementById('nxsuClose').onclick=()=>d.close();document.getElementById('nxsuSource').onclick=()=>window.open(SUMUP.sources.home,'_blank','noopener');const ids=['nxsuLead','nxsuBusiness','nxsuTpv','nxsuMobile','nxsuSmartphone','nxsuDevice','nxsuPos','nxsuPrinter','nxsuTeam','nxsuBarcode','nxsuOnline','nxsuBookings','nxsuInvoice','nxsuAdvanced','nxsuOrder','nxsuLinks'];ids.forEach(id=>document.getElementById(id).addEventListener('input',update));document.getElementById('nxsuLead').addEventListener('change',()=>{const l=getLeads().find(x=>x.id===document.getElementById('nxsuLead').value);if(l){if(l.industry)document.getElementById('nxsuBusiness').value=mapBusiness(l.industry);if(l.tpv)document.getElementById('nxsuTpv').value=l.tpv}update()});
}
function mapBusiness(s){s=String(s||'').toLowerCase();if(/cafe|restaurant|gastr|bar|imbiss|food|bäck|baeck|markt/.test(s))return'gastronomie';if(/retail|handel|shop|bekleidung|mode|geschäft|geschaeft/.test(s))return'retail';if(/friseur|barber|kosmetik|beauty|nagel|wellness/.test(s))return'beauty';if(/handwerk|bau|monteur|reparatur/.test(s))return'craft';if(/taxi/.test(s))return'taxi';if(/hotel/.test(s))return'hotel';if(/medizin|arzt|praxis/.test(s))return'medical';if(/event|veranst/.test(s))return'events';return'service'}
let lastRecommendation=null;
function formData(){return {tpv:+document.getElementById('nxsuTpv').value||0,business:document.getElementById('nxsuBusiness').value,mobile:document.getElementById('nxsuMobile').value,smartphone:document.getElementById('nxsuSmartphone').value,device:document.getElementById('nxsuDevice').value,pos:document.getElementById('nxsuPos').value,printer:document.getElementById('nxsuPrinter').value,team:document.getElementById('nxsuTeam').value,barcode:document.getElementById('nxsuBarcode').value,online:document.getElementById('nxsuOnline').value,bookings:document.getElementById('nxsuBookings').value,invoice:document.getElementById('nxsuInvoice').value,advanced:document.getElementById('nxsuAdvanced').value,order:document.getElementById('nxsuOrder').value,links:document.getElementById('nxsuLinks').value,web:document.getElementById('nxsuOnline').value};}
function update(){lastRecommendation=choose(formData());document.getElementById('nxsuResult').innerHTML=renderResult(lastRecommendation);document.getElementById('nxsuOffer').onclick=offer;document.getElementById('nxsuSaveLead').onclick=saveLead}
function saveLead(){const id=document.getElementById('nxsuLead').value;if(!id)return alert('Bitte zuerst einen Lead auswählen.');const s=readCRM(),l=(s.leads||[]).find(x=>x.id===id);if(!l)return;const r=lastRecommendation;l.product=r.hardware.name;l.terminal=r.hardware.name;l.provider='SumUp';l.need=`Empfohlene SumUp-Lösung: ${r.hardware.name} · Tarif: ${SUMUP.fees[r.tariff].name}`;l.notes=[l.notes||'',`SumUp Beratung ${SUMUP.updated}: ${r.hardware.name}; ${SUMUP.fees[r.tariff].name}; TPV ${money(r.tpv)}. ${r.reasons.join(' ')}`].filter(Boolean).join('\n');l.updatedAt=new Date().toISOString();writeCRM(s);alert('SumUp-Empfehlung am Lead gespeichert.');}
function offer(){const r=lastRecommendation,id=document.getElementById('nxsuLead').value;const l=getLeads().find(x=>x.id===id);if(typeof window.quote!=='function'){alert('Angebotsmodul nicht verfügbar.');return;}window.quote(null,id||null);setTimeout(()=>{const set=(sel,v)=>{const el=document.querySelector(sel);if(el)el.value=v??''};if(l){set('#qCompany',l.company);set('#qCustomerNo',l.customerNo||'');set('#qAddress',l.address||[l.street,l.zip,l.city].filter(Boolean).join(', '));set('#qLead',id)}const box=document.querySelector('#quoteItems');if(box){box.innerHTML='';const add=(desc,qty,unit,price)=>{const fn=window.addItem;if(typeof fn==='function')fn('quoteItems',{description:desc,qty,unit,price});};add(`${r.hardware.name} – ${r.hardware.desc}`,1,'Stück',r.hardware.price);if(r.packageType==='pos'&&r.software?.price)add(r.software.name,1,'Monat',r.software.price);const fee=SUMUP.fees[r.tariff];if(fee.monthly)add(`${fee.name} – ${fee.label} Kartenzahlungsgebühr gemäß SumUp`,1,'Monat',fee.monthly);r.addons.filter(x=>x.price>0).forEach(x=>add(x.name,1,'Monat',x.price));box.querySelectorAll('.li-desc').forEach((el,i)=>{if(i===0)el.value=`${r.hardware.name} – ${r.hardware.desc} Enthalten: ${(r.hardware.features||[]).join('; ')}.`});box.querySelectorAll('input').forEach(x=>x.dispatchEvent(new Event('input',{bubbles:true})))}const note=document.querySelector('#qNote');if(note)note.value=`Empfohlene SumUp-Lösung für ${l?.company||'Kunde'}:\n${r.hardware.name}\nTarif: ${SUMUP.fees[r.tariff].name} (${SUMUP.fees[r.tariff].label}; ${SUMUP.fees[r.tariff].monthly?money(SUMUP.fees[r.tariff].monthly)+'/Monat':'0 € Monatsgebühr'})\nKartenzahlungsvolumen: ${money(r.tpv)} monatlich\n\n${r.hardware.desc}\n${(r.hardware.features||[]).map(x=>'• '+x).join('\n')}\n\nWichtiger Hinweis: Gebühren und Aktionspreise können sich ändern. Es gilt die aktuelle SumUp-Preisgestaltung zum Vertragsabschluss.`;document.getElementById('sumupProDialog').close()},250)}
function openCenter(){dialog();const d=document.getElementById('sumupProDialog');document.getElementById('nxsuLead').innerHTML=leadOptions();update();d.showModal()}
document.addEventListener('click',e=>{const a=e.target.closest('[data-action="pricing"]');if(a){e.preventDefault();e.stopImmediatePropagation();openCenter()}},true);
window.neXaroSumUp={open:openCenter,data:SUMUP,recommend:choose};
})();