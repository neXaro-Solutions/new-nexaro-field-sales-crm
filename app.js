const KEY="nexaro-crm-v2-0";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const uid=()=>crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const today=()=>new Date().toISOString().slice(0,10);
const money=n=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(n)||0);
const base={leads:[],tasks:[],quotes:[],invoices:[],quoteSequence:0,settings:{company:"neXaro Solutions"}};
let S=(()=>{try{
const legacy=localStorage.getItem(KEY)||localStorage.getItem("nexaro-crm-v1-2")||localStorage.getItem("nexaro-crm-v1-3")||"{}";
const x=JSON.parse(legacy);return {...base,...x,leads:x.leads||[],tasks:x.tasks||[],quotes:x.quotes||[],invoices:x.invoices||[],settings:x.settings||{}}}catch{return structuredClone(base)}})();
S.quotes=(S.quotes||[]).map(q=>({...q,items:q.items||[{description:q.product||"",qty:q.qty||1,unit:q.unit||"Stück",price:q.price||0}]}));
let lf="all",tf="open",area=null,route=[];
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1900)};
const close=id=>$("#"+id)?.close(), open=id=>$("#"+id)?.showModal();
function qual(t){t=+t||0;return t>=15000?{l:"A",x:"Sehr starkes Potenzial",c:"qual-A"}:t>=10000?{l:"B",x:"Stark qualifiziert",c:"qual-B"}:t>=5000?{l:"C",x:"Qualifiziert",c:"qual-C"}:{l:"D",x:"Unter internem Vertriebsziel",c:"qual-D"}}
const sl=s=>({neu:"Neu",kontaktiert:"Kontaktiert",termin:"Termin",angebot:"Angebot",gewonnen:"Gewonnen",verloren:"Verloren"}[s]||s);
function nav(id){$$('.screen').forEach(x=>x.classList.toggle('active',x.id===id));$$('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));window.scrollTo(0,0);render()}
$$('[data-screen]').forEach(b=>b.onclick=()=>nav(b.dataset.screen));
document.onclick=e=>{const c=e.target.closest('[data-close]');if(c){close(c.dataset.close);return}const a=e.target.closest('[data-action]')?.dataset.action;if(a)act(a)};
function act(a){if(a==='new-lead')return lead();if(a==='new-task')return task();if(a==='pricing')return pricing();if(a==='commission')return commission();if(a==='new-quote')return quote();if(a==='export-csv')return csv();if(a==='backup')return download('nexaro-crm-backup.json',JSON.stringify(S,null,2),'application/json');if(a==='restore')return $('#restoreInput').click();if(a==='demo')return demo();if(a==='clear'&&confirm('Alle lokalen CRM-Daten löschen?')){S=structuredClone(base);save();render();toast('CRM gelöscht')}}
function lead(id=null){$('#leadForm').reset();$('#leadId').value=id||'';$('#leadDialogTitle').textContent=id?'Lead bearbeiten':'Neuer Lead';const l=id&&S.leads.find(x=>x.id===id);if(l){for(const [k,i] of Object.entries({company:'fCompany',industry:'fIndustry',status:'fStatus',contact:'fContact',phone:'fPhone',email:'fEmail',address:'fAddress',tpv:'fTpv',provider:'fProvider',terminal:'fTerminal',product:'fProduct',priority:'fPriority',need:'fNeed',next:'fNext',due:'fDue',notes:'fNotes'}))$("#"+i).value=l[k]??''}else{$('#fDue').value=today();$('#fPriority').value='Hoch';$('#fStatus').value='neu'}hint();open('leadDialog')}
function hint(){const q=qual($('#fTpv').value);$('#qualificationHint').className='qual-box '+q.c;$('#qualificationHint').innerHTML='<b>Interne Qualifizierung: '+q.l+'</b><br>'+q.x+'. '+(+$('#fTpv').value>=5000?'Internes Vertriebsziel erreicht.':'Unter €5.000 TPV: intern niedriger priorisieren.')}$('#fTpv').oninput=hint;
$('#leadForm').onsubmit=e=>{e.preventDefault();const company=$('#fCompany').value.trim();if(!company)return toast('Firma fehlt');const tpv=+$('#fTpv').value||0,q=qual(tpv),d={id:$('#leadId').value||uid(),company,industry:$('#fIndustry').value,status:$('#fStatus').value,contact:$('#fContact').value.trim(),phone:$('#fPhone').value.trim(),email:$('#fEmail').value.trim(),address:$('#fAddress').value.trim(),tpv,qualification:q.l,qualified:tpv>=5000,provider:$('#fProvider').value.trim(),terminal:$('#fTerminal').value.trim(),product:$('#fProduct').value,priority:$('#fPriority').value,need:$('#fNeed').value.trim(),next:$('#fNext').value.trim(),due:$('#fDue').value,notes:$('#fNotes').value.trim(),updatedAt:new Date().toISOString()};const i=S.leads.findIndex(x=>x.id===d.id);i>=0?S.leads[i]={...S.leads[i],...d}:S.leads.unshift(d);save();close('leadDialog');render();toast('Lead gespeichert')};
function card(l){const q=qual(l.tpv);return `<article class="card lead-card"><div class="row"><div><h3>${esc(l.company)}</h3><div class="meta">${esc(l.industry||'')} · ${esc(l.address||'Keine Adresse')}</div>${l.contact?`<div class="meta">👤 ${esc(l.contact)}${l.phone?' · '+esc(l.phone):''}</div>`:''}</div><span class="badge">${esc(sl(l.status))}</span></div><div class="chips"><span class="chip ${q.l==='A'||q.l==='B'?'good':q.l==='C'?'warn':'bad'}">TPV ${money(l.tpv)} · ${q.l}</span><span class="chip">${esc(l.priority||'Mittel')} Priorität</span>${l.product?`<span class="chip">${esc(l.product)}</span>`:''}</div>${l.next||l.due?`<div class="meta" style="margin-top:9px">↗ ${esc(l.next||'Follow-up')} · ${esc(l.due||'')}</div>`:''}<div class="lead-actions">${l.phone?`<button data-phone="${esc(l.phone)}">☎️ Anrufen</button>`:''}${l.address?`<button data-map="${encodeURIComponent(l.address)}">🧭 Maps</button>`:''}<button data-edit="${l.id}">✏️ Bearbeiten</button><button data-visit="${l.id}">📝 Besuch</button><button data-quote="${l.id}">💼 Angebot</button><button data-del="${l.id}">🗑️</button></div></article>`}
function leads(){const s=($('#leadSearch').value||'').toLowerCase(),a=S.leads.filter(l=>lf==='all'||l.status===lf).filter(l=>[l.company,l.address,l.contact,l.phone,l.industry,l.provider].join(' ').toLowerCase().includes(s));$('#leadList').innerHTML=a.map(card).join('')||'<div class="empty">Keine Leads gefunden.</div>'}
$('#leadSearch').oninput=leads;$$('[data-filter]').forEach(b=>b.onclick=()=>{lf=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');leads()});
$('#leadList').onclick=e=>{let id=e.target.closest('[data-edit]')?.dataset.edit;if(id)return lead(id);id=e.target.closest('[data-del]')?.dataset.del;if(id){if(confirm('Diesen Lead wirklich löschen?')){S.leads=S.leads.filter(x=>x.id!==id);save();render()};return}id=e.target.closest('[data-visit]')?.dataset.visit;if(id)return visit(id);id=e.target.closest('[data-quote]')?.dataset.quote;if(id)return quote(null,id);const p=e.target.closest('[data-phone]')?.dataset.phone;if(p)location.href='tel:'+p;const m=e.target.closest('[data-map]')?.dataset.map;if(m)window.open('https://www.google.com/maps/search/?api=1&query='+m,'_blank')};
function visit(id){const l=S.leads.find(x=>x.id===id);$('#visitLead').value=id;$('#visitTitle').textContent='Besuch · '+l.company;$('#vDate').value=today();$('#vNote').value='';open('visitDialog')}
$('#visitForm').onsubmit=e=>{e.preventDefault();const l=S.leads.find(x=>x.id===$('#visitLead').value);l.lastVisit=$('#vDate').value;l.notes=$('#vNote').value.trim();if(l.status==='neu')l.status='kontaktiert';l.updatedAt=new Date().toISOString();if($('#vNext').value.trim()){S.tasks.unshift({id:uid(),title:$('#vNext').value.trim(),due:$('#vDue').value||today(),leadId:l.id,note:'Nach Besuch',done:false})}save();close('visitDialog');render();toast('Besuch gespeichert')};
function task(){ $('#taskForm').reset();$('#tDue').value=today();$('#tLead').innerHTML='<option value="">Ohne Lead</option>'+S.leads.map(l=>`<option value="${l.id}">${esc(l.company)}</option>`).join('');open('taskDialog') }
$('#taskForm').onsubmit=e=>{e.preventDefault();S.tasks.unshift({id:uid(),title:$('#tTitle').value.trim(),due:$('#tDue').value,leadId:$('#tLead').value,note:$('#tNote').value.trim(),done:false});save();close('taskDialog');render();toast('Task gespeichert')};
$$('[data-taskfilter]').forEach(b=>b.onclick=()=>{tf=b.dataset.taskfilter;$$('[data-taskfilter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');tasks()});
function tasks(){const a=S.tasks.filter(t=>tf==='all'||tf==='open'&&!t.done||tf==='done'&&t.done||tf==='today'&&!t.done&&t.due===today()).sort((a,b)=>(a.due||'').localeCompare(b.due||''));$('#taskList').innerHTML=a.map(t=>{const l=S.leads.find(x=>x.id===t.leadId);return `<div class="card task ${t.done?'done':''}"><input type="checkbox" ${t.done?'checked':''} data-task="${t.id}"><div class="task-body"><b>${esc(t.title)}</b><div class="meta ${!t.done&&t.due<today()?'overdue':''}">${esc(t.due||'ohne Datum')}${l?' · '+esc(l.company):''}</div>${t.note?`<div class="meta">${esc(t.note)}</div>`:''}</div></div>`}).join('')||'<div class="empty">Keine Tasks in dieser Ansicht.</div>'}
$('#taskList').onchange=e=>{const id=e.target.dataset.task;if(id){const t=S.tasks.find(x=>x.id===id);t.done=e.target.checked;save();tasks();renderDash()}};

const MOTIVATION_QUOTES=[
  ["Nicht jeder Besuch bringt einen Abschluss – aber jeder gute Besuch bringt dich näher zum Abschluss. 🚀","neXaro Tagesimpuls"],
  ["Heute nicht perfekt verkaufen. Heute besser verkaufen als gestern. 💪","neXaro Tagesimpuls"],
  ["Ein Nein ist kein Rückschritt. Es ist ein Filter auf dem Weg zum nächsten Ja. 😎","neXaro Tagesimpuls"],
  ["Dein stärkstes Verkaufstool bist du selbst. Der Rest ist Vorbereitung. 🔥","neXaro Tagesimpuls"],
  ["Tür auf, Bedarf finden, Lösung zeigen, Abschluss holen. Einfach machen. 🚪➡️🤝➡️🏆","neXaro Sales Energy"],
  ["Wer draußen ist, gewinnt Daten. Wer nachfasst, gewinnt Kunden. 📍📞","neXaro Sales Energy"]
];
let motivationIndex=Math.floor(Math.random()*MOTIVATION_QUOTES.length);
function renderMotivation(){const q=MOTIVATION_QUOTES[motivationIndex%MOTIVATION_QUOTES.length];if($('#motivationQuote'))$('#motivationQuote').textContent=q[0];if($('#motivationAuthor'))$('#motivationAuthor').textContent=q[1]}
const weatherText={0:'Klarer Himmel',1:'Überwiegend klar',2:'Teilweise bewölkt',3:'Bedeckt',45:'Nebel',48:'Reifnebel',51:'Leichter Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',61:'Leichter Regen',63:'Regen',65:'Starker Regen',71:'Leichter Schneefall',73:'Schneefall',75:'Starker Schneefall',80:'Regenschauer',81:'Regenschauer',82:'Starke Regenschauer',95:'Gewitter',96:'Gewitter mit Hagel',99:'Starkes Gewitter mit Hagel'};
function weatherIcon(c){return c===0?'☀️':([1,2].includes(c)?'🌤️':([3].includes(c)?'☁️':([45,48].includes(c)?'🌫️':([51,53,55,61,63,65,80,81,82].includes(c)?'🌧️':([71,73,75].includes(c)?'🌨️':'⛈️')))))}
async function loadWeather(){
 const btn=$('#loadWeather'); if(!btn)return; btn.disabled=true; btn.textContent='📍 Standort wird ermittelt …';
 try{
  const pos=await new Promise((res,rej)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:false,timeout:10000,maximumAge:600000}):rej());
  const {latitude:lat,longitude:lon}=pos.coords;
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
  if(!r.ok)throw new Error('weather'); const d=await r.json(); const c=d.current;
  const place=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,{headers:{'Accept-Language':'de'}}).then(x=>x.json()).catch(()=>null);
  const a=place?.address||{}; const label=a.city||a.town||a.village||a.municipality||'Mein Standort';
  $('#weatherLocation').textContent=label; $('#weatherTemp').textContent=`${Math.round(c.temperature_2m)}°C ${weatherIcon(c.weather_code)}`; $('#weatherLabel').textContent=weatherText[c.weather_code]||'Aktuelles Wetter'; $('#weatherDetails').textContent=`Gefühlt ${Math.round(c.apparent_temperature)}°C · Wind ${Math.round(c.wind_speed_10m)} km/h`;
  btn.textContent='🔄 Wetter aktualisieren';
 }catch(e){$('#weatherLabel').textContent='Wetter nicht verfügbar';$('#weatherDetails').textContent='Standortfreigabe prüfen oder später erneut versuchen.';btn.textContent='📍 Erneut versuchen'} finally{btn.disabled=false}
}
if($('#loadWeather'))$('#loadWeather').onclick=loadWeather;
if($('#nextQuote'))$('#nextQuote').onclick=()=>{motivationIndex++;renderMotivation()};
renderMotivation();

function renderDash(){const openLeads=S.leads.filter(l=>!['gewonnen','verloren'].includes(l.status)).length;$('#kLeads').textContent=openLeads;$('#kTasks').textContent=S.tasks.filter(t=>!t.done&&t.due<=today()).length;$('#kAppts').textContent=S.leads.filter(l=>l.status==='termin').length;$('#kWon').textContent=S.leads.filter(l=>l.status==='gewonnen').length;if($('#kQuotes')) $('#kQuotes').textContent=S.quotes.filter(q=>q.status!=='accepted').length;const stages=['neu','kontaktiert','termin','angebot','gewonnen'];const stageLabels={neu:'Neu',kontaktiert:'Kontakt',termin:'Termin',angebot:'Angebot',gewonnen:'Gewonnen'};const counts=Object.fromEntries(stages.map(st=>[st,S.leads.filter(l=>l.status===st).length]));const total=S.leads.length;$('#pipelineTotal').textContent=`${total} ${total===1?'Lead':'Leads'}`;$('#pipelineBar').innerHTML=stages.map(st=>`<div class="pipe-segment pipe-${st}" style="width:${total?Math.max(counts[st]/total*100,counts[st]?2:0):0}%" title="${stageLabels[st]}: ${counts[st]}"></div>`).join('');$('#pipelineLegend').innerHTML=stages.map(st=>`<span><i class="dot dot-${st}"></i>${stageLabels[st]} <b>${counts[st]}</b></span>`).join('');const a=[...S.leads].filter(l=>!['gewonnen','verloren'].includes(l.status)).sort((x,y)=>(x.due||'9999').localeCompare(y.due||'9999')).slice(0,4);$('#dashboardTasks').innerHTML=a.map(l=>`<div class="card"><div class="row"><b>${esc(l.company)}</b><span class="badge">${esc(l.due||'')}</span></div><div class="meta">${esc(l.next||'Nächsten Kontakt festlegen')}</div></div>`).join('')||'<div class="empty">Noch keine offenen Leads.</div>';const b=[...S.leads].sort((x,y)=>(y.tpv||0)-(x.tpv||0))[0];$('#assistantCard').innerHTML=b?`<div class="row"><div><b>${esc(b.company)}</b><div class="meta">Größtes aktuelles TPV-Potenzial</div></div><span class="chip good">${money(b.tpv)}</span></div><p class="muted">${b.tpv>=5000?'Qualifiziert: Bedarf prüfen und Tarifvergleich durchführen.':'TPV unter internem Ziel: Potenzial verifizieren.'}</p><button class="secondary" data-edit="${b.id}">Lead öffnen</button>`:'<b>Bereit für den ersten Lead.</b><p class="muted">Erfasse einen Händler und der Sales Assistant priorisiert ihn automatisch.</p>'}
$('#assistantCard').onclick=e=>{const id=e.target.closest('[data-edit]')?.dataset.edit;if(id)lead(id)};
async function geo(q){const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=de&q='+encodeURIComponent(q));const a=await r.json();if(!a[0])throw 0;return{lat:+a[0].lat,lon:+a[0].lon,label:a[0].display_name}}
const dist=(a,b)=>{const R=6371,r=x=>x*Math.PI/180,dlat=r(b.lat-a.lat),dlon=r(b.lon-a.lon),x=Math.sin(dlat/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dlon/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
async function coords(l){if(l.lat)return{lat:+l.lat,lon:+l.lon};try{return await geo(l.address)}catch{return null}}
async function makeRoute(){if(!area)return;const rad=+$('#areaRadius').value||5,a=[];for(const l of S.leads){if(!l.address)continue;const c=await coords(l);if(c&&dist(area,c)<=rad)a.push({...l,lat:c.lat,lon:c.lon})}a.sort((x,y)=>dist(area,x)-dist(area,y));route=a;$('#routeCount').textContent=a.length;$('#routeList').innerHTML=a.map((l,i)=>`<div class="route-item"><b>${i+1}. ${esc(l.company)}</b><span>${dist(area,l).toFixed(1)} km</span></div>`).join('')||'<div class="empty">Keine bestehenden Leads im Radius.</div>';$('#openRoute').disabled=!a.length;$('#areaStatus').textContent=a.length+' Leads im Gebiet.';}
async function prospects(){if(!area)return;$('#prospectList').innerHTML='<div class="muted">Unternehmen werden gesucht …</div>';try{const q=encodeURIComponent('shop OR kiosk OR cafe OR restaurant OR bakery OR hairdresser OR retail');const u=`https://overpass-api.de/api/interpreter?data=[out:json][timeout:20];(nwr["shop"](around:${(+$('#areaRadius').value||5)*1000},${area.lat},${area.lon});nwr["amenity"~"cafe|restaurant"](around:${(+$('#areaRadius').value||5)*1000},${area.lat},${area.lon});nwr["shop"="convenience"](around:${(+$('#areaRadius').value||5)*1000},${area.lat},${area.lon}););out center tags 80;`;const r=await fetch(u);const j=await r.json();const arr=j.elements.filter(x=>x.tags?.name).slice(0,30).map(x=>({name:x.tags.name,address:[x.tags['addr:street'],x.tags['addr:housenumber'],x.tags['addr:postcode'],x.tags['addr:city']].filter(Boolean).join(' '),lat:x.lat??x.center?.lat,lon:x.lon??x.center?.lon}));$('#prospectList').innerHTML=arr.map(p=>`<div class="prospect"><div><b>${esc(p.name)}</b><div class="meta">${esc(p.address||'Adresse nicht angegeben')}</div></div><button class="secondary" data-prospect="${encodeURIComponent(JSON.stringify(p))}">＋ Lead</button></div>`).join('')||'<div class="empty">Keine Treffer im öffentlichen Datenbestand.</div>'}catch{$('#prospectList').innerHTML='<div class="empty">Gebietssuche derzeit nicht verfügbar.</div>'}}
$('#searchArea').onclick=async()=>{const q=$('#areaQuery').value.trim();if(!q)return toast('PLZ oder Ort eingeben');$('#areaStatus').textContent='Gebiet wird ermittelt …';try{area=await geo(q);$('#areaStatus').textContent=area.label;await makeRoute();await prospects()}catch{$('#areaStatus').textContent='Gebiet nicht gefunden';toast('Ort/PLZ nicht gefunden')}};
$('#useLocation').onclick=()=>navigator.geolocation?.getCurrentPosition(async p=>{area={lat:p.coords.latitude,lon:p.coords.longitude,label:'Mein Standort'};$('#areaStatus').textContent='Mein Standort';await makeRoute();await prospects()},()=>toast('Standortzugriff nicht möglich'));
$('#openRoute').onclick=()=>{if(!route.length)return;const pts=route.map(x=>`${x.lat},${x.lon}`);window.open('https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(`${area.lat},${area.lon}`)+'&destination='+encodeURIComponent(pts.at(-1))+'&waypoints='+encodeURIComponent(pts.slice(0,-1).join('|'))+'&travelmode=driving','_blank')};
$('#prospectList').onclick=e=>{const b=e.target.closest('[data-prospect]');if(!b)return;const p=JSON.parse(decodeURIComponent(b.dataset.prospect));$('#leadForm').reset();$('#leadId').value='';$('#leadDialogTitle').textContent='Neuer Lead aus Gebiet';$('#fCompany').value=p.name;$('#fAddress').value=p.address||'';$('#fDue').value=today();$('#fStatus').value='neu';$('#fPriority').value='Mittel';hint();open('leadDialog')};
function pricing(){ $('#pTpv').value=5000;calcPricing();open('pricingDialog') }
function calcPricing(){
  const tpv=+$('#pTpv').value||0,rate=+$('#pCurrentRate').value||0,fixed=+$('#pCurrentFixed').value||0;
  const current=tpv*rate/100+fixed;
  const payg=tpv*0.0139;
  const plus=tpv*0.0079+19;
  const plans=[
    {key:'payg',name:'SumUp umsatzbasiert',monthly:payg,description:'1,39% auf Kartenzahlungen · 0 € Monatsgebühr',fee:'1,39%',fixed:0},
    {key:'plus',name:'SumUp Zahlungen Plus',monthly:plus,description:'0,79% auf berechtigte EEA-Verbraucherkarten · 19 € Monatsgebühr',fee:'0,79%',fixed:19}
  ];
  $('#pricingResult').innerHTML=
    `<div class="result"><b>Aktuell</b><strong>${money(current)}/Monat</strong><small>nach deinen Eingaben</small></div>`+
    plans.map(p=>`<div class="result tariff-result"><div><b>${esc(p.name)}</b><strong>${money(p.monthly)}/Monat</strong><small>${esc(p.description)}</small></div><button class="primary" data-use-tariff="${p.key}">💼 Ins Angebot</button></div>`).join('')+
    `<div class="qual-box qual-C"><b>Sales Assistant</b><br>Empfehlung anhand von TPV und Kartenmischung prüfen. Mit „Ins Angebot“ wird die ausgewählte SumUp-Lösung direkt als Angebotsposition übernommen.</div>`;
}
$('#pTpv').oninput=calcPricing;$('#pCurrentRate').oninput=calcPricing;$('#pCurrentFixed').oninput=calcPricing;
$('#pricingResult').onclick=e=>{
  const b=e.target.closest('[data-use-tariff]');
  if(!b)return;
  const tpv=+$('#pTpv').value||0;
  const key=b.dataset.useTariff;
  const tariff=key==='plus'
    ? {description:'SumUp Zahlungen Plus – Monatsgebühr',qty:1,unit:'Monat',price:19,note:`SumUp Zahlungen Plus: 0,79% auf berechtigte EEA-Verbraucherkarten. Berechnungsbasis im Vergleich: ${money(tpv)} monatliches Kartenzahlungsvolumen.`}
    : {description:'SumUp umsatzbasiert – Monatsgebühr',qty:1,unit:'Monat',price:0,note:`SumUp umsatzbasiertes Modell: 1,39% auf Kartenzahlungen, 0 € Monatsgebühr. Berechnungsbasis im Vergleich: ${money(tpv)} monatliches Kartenzahlungsvolumen.`};
  close('pricingDialog');
  quote(null,null,{tariff,tariffKey:key,tpv});
};
function commission(){calcCommission();open('commissionDialog')}
function calcCommission(){const tpv=+$('#cTpv').value||0,hw=+$('#cHardware').value||0,sw=+$('#cSoftware').value||0,activation=tpv>=500?200:0,pay=(tpv*0.007*12)*0.5,topup30=Math.max(0,pay-activation),hardware=hw*0.5,software=sw*12*0.5,bonus=(+$('#cContracts').value?100:0)+(+$('#cPos').value?100:0)+(+$('#cChampion').value?100:0)+(+$('#cMaster').value?100:0),total=activation+topup30+hardware+software+bonus;$('#commissionResult').innerHTML=`<div class="result"><b>Aktivierung</b><strong>${money(activation)}</strong></div><div class="result"><b>Payments Top-Up 30</b><strong>${money(topup30)}</strong><small>mit 0,7% angenommener Net Revenue Margin</small></div><div class="result"><b>Hardware</b><strong>${money(hardware)}</strong></div><div class="result"><b>Software</b><strong>${money(software)}</strong></div><div class="result"><b>Boni</b><strong>${money(bonus)}</strong></div><div class="result"><b>Interne Deal-Summe</b><strong>${money(total)}</strong><small>Nur intern · Vertragsbedingungen haben Vorrang</small></div>`}
$$('#commissionDialog input,#commissionDialog select').forEach(x=>x.oninput=calcCommission);


const VAT_RATE=0.19;
const calcTotals=items=>{const net=(items||[]).reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.price)||0),0);return {net,vat:net*VAT_RATE,gross:net*(1+VAT_RATE)}};
const fmtDate=d=>d?new Intl.DateTimeFormat("de-DE").format(new Date(d+"T12:00:00")):"";
const nextDate=days=>{const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};
const itemTemplate=(item={},idx=0)=>`<div class="line-item" data-index="${idx}"><div class="line-index">${idx+1}</div><input class="li-desc" placeholder="Bezeichnung / Leistung" value="${esc(item.description||item.product||"")}"><input class="li-qty" type="number" min="0" step="0.01" placeholder="Menge" value="${item.qty??1}"><input class="li-unit" placeholder="Einheit" value="${esc(item.unit||"Stück")}"><input class="li-price" type="number" min="0" step="0.01" placeholder="Einzel €" value="${item.price??0}"><div class="li-total">0,00 €</div><button type="button" class="icon-btn remove-line">✕</button></div>`;
function getItems(id){return [...document.querySelectorAll(`#${id} .line-item`)].map(r=>({description:r.querySelector(".li-desc").value.trim(),qty:+r.querySelector(".li-qty").value||0,unit:r.querySelector(".li-unit").value.trim()||"Stück",price:+r.querySelector(".li-price").value||0})).filter(i=>i.description||i.price)};
function recalcItems(id,netId,vatId,grossId){const rows=[...document.querySelectorAll(`#${id} .line-item`)],items=[];rows.forEach((r,i)=>{r.querySelector(".line-index").textContent=i+1;const q=+r.querySelector(".li-qty").value||0,p=+r.querySelector(".li-price").value||0;r.querySelector(".li-total").textContent=money(q*p);items.push({qty:q,price:p})});const t=calcTotals(items);$("#"+netId).textContent=money(t.net);$("#"+vatId).textContent=money(t.vat);$("#"+grossId).textContent=money(t.gross)}
function addItem(id,item={}){const c=document.getElementById(id);c.insertAdjacentHTML("beforeend",itemTemplate(item,c.children.length));const r=c.lastElementChild;r.querySelectorAll("input").forEach(x=>x.addEventListener("input",()=>recalcItems(id,id.includes("quote")?"qNetPreview":"iNetPreview",id.includes("quote")?"qVatPreview":"iVatPreview",id.includes("quote")?"qGrossPreview":"iGrossPreview")));r.querySelector(".remove-line").onclick=()=>{r.remove();if(!c.children.length)addItem(id);recalcItems(id,id.includes("quote")?"qNetPreview":"iNetPreview",id.includes("quote")?"qVatPreview":"iVatPreview",id.includes("quote")?"qGrossPreview":"iGrossPreview")}}
function fillItems(id,items){const c=document.getElementById(id);c.innerHTML="";(items&&items.length?items:[{}]).forEach(i=>addItem(id,i));recalcItems(id,id.includes("quote")?"qNetPreview":"iNetPreview",id.includes("quote")?"qVatPreview":"iVatPreview",id.includes("quote")?"qGrossPreview":"iGrossPreview")}
function quote(id=null,leadId=null,preset=null){
  $("#quoteForm").reset();
  $("#qLead").innerHTML='<option value="">Ohne Lead</option>'+S.leads.map(l=>`<option value="${l.id}">${esc(l.company)}</option>`).join("");
  $("#quoteId").value=id||"";
  let q=id&&S.quotes.find(x=>x.id===id);
  if(!q&&leadId){
    const l=S.leads.find(x=>x.id===leadId);
    q={leadId:l.id,company:l.company,contact:l.contact,email:l.email,items:[{description:l.product||"SumUp Lösung",qty:1,unit:"Stück",price:0}],date:today(),validUntil:nextDate(14),status:"draft"};
  }
  if(!q&&preset){
    q={company:"",contact:"",email:"",items:[preset.tariff],date:today(),validUntil:nextDate(14),status:"draft",note:preset.tariff.note||""};
  }
  if(q){
    $("#qLead").value=q.leadId||"";
    $("#qCompany").value=q.company||"";
    $("#qCustomerNo").value=q.customerNo||"";
    $("#qContact").value=q.contact||"";
    $("#qVatId").value=q.vatId||"";
    $("#qEmail").value=q.email||"";
    $("#qDate").value=q.date||today();
    $("#qValidUntil").value=q.validUntil||nextDate(14);
    $("#qStatus").value=q.status||"draft";
    $("#qNote").value=q.note||"";
    fillItems("quoteItems",q.items||[]);
  }else{
    $("#qDate").value=today();
    $("#qValidUntil").value=nextDate(14);
    $("#qStatus").value="draft";
    fillItems("quoteItems");
  }
  open("quoteDialog")
}
$("#qLead").onchange=()=>{
  const l=S.leads.find(x=>x.id===$("#qLead").value);
  if(!l)return;
  $("#qCompany").value=l.company||"";
  $("#qContact").value=l.contact||"";
  $("#qEmail").value=l.email||"";
  if(!$("#quoteItems .li-desc").length || !$("#quoteItems .li-desc").first().value){
    fillItems("quoteItems",[{description:l.product&&l.product!=="Noch offen"?`SumUp ${l.product}`:"SumUp Lösung",qty:1,unit:"Stück",price:0}]);
  }
};
$("#addQuoteItem").onclick=()=>{addItem("quoteItems");recalcItems("quoteItems","qNetPreview","qVatPreview","qGrossPreview")};
$("#quoteForm").onsubmit=e=>{e.preventDefault();const items=getItems("quoteItems"),t=calcTotals(items),d={id:$("#quoteId").value||uid(),leadId:$("#qLead").value,company:$("#qCompany").value.trim(),customerNo:$("#qCustomerNo").value.trim(),contact:$("#qContact").value.trim(),vatId:$("#qVatId").value.trim(),email:$("#qEmail").value.trim(),items,net:t.net,vat:t.vat,gross:t.gross,date:$("#qDate").value,validUntil:$("#qValidUntil").value,status:$("#qStatus").value,note:$("#qNote").value.trim()};const i=S.quotes.findIndex(x=>x.id===d.id);if(i<0){S.quoteSequence=(S.quoteSequence||0)+1;d.number="AG"+String(S.quoteSequence).padStart(4,"0");}else d.number=S.quotes[i].number||("AG"+String(i+1).padStart(4,"0"));i>=0?S.quotes[i]={...S.quotes[i],...d}:S.quotes.unshift(d);const l=S.leads.find(x=>x.id===d.leadId);if(l&&l.status!=="gewonnen")l.status="angebot";save();close("quoteDialog");render();toast("Angebot gespeichert")};
function docs(){$("#quoteList").innerHTML=S.quotes.map(x=>`<div class="card"><div class="row"><div><b>Angebot · ${esc(x.company)}</b><div class="meta">${(x.items||[]).length} Position(en) · ${money(x.gross)} brutto · ${esc(fmtDate(x.date))}${x.validUntil?" · gültig bis "+esc(fmtDate(x.validUntil)):""}</div></div><span class="badge">${esc(x.status||"draft")}</span></div><div class="lead-actions"><button data-pdfquote="${x.id}">📄 PDF / Drucken</button><button data-mailquote="${x.id}">✉️ E-Mail</button><button data-editquote="${x.id}">✏️</button></div></div>`).join("")||'<div class="empty">Noch keine Angebote.</div>'}
function printDocument(kind,id){const d=S.quotes.find(x=>x.id===id);if(!d)return;const items=d.items||[],t=calcTotals(items),title="ANGEBOT",number=d.number||("AG"+String(S.quotes.indexOf(d)+1).padStart(4,"0")),rows=items.map((i,n)=>`<tr><td>${n+1}</td><td><b>${esc(i.description)}</b></td><td class="right">${esc(i.qty)}</td><td>${esc(i.unit||"")}</td><td class="right">${money(i.price)}</td><td class="right">${money((+i.qty||0)*(+i.price||0))}</td></tr>`).join(""),recipient=`<div><b>${esc(d.company)}</b><br>${esc(d.contact||"")}<br>${esc(d.email||"")}${d.vatId?"<br>USt-IdNr.: "+esc(d.vatId):""}</div>`,meta=`<div class="meta-row"><span>Angebotsnr.</span><b>${esc(number)}</b></div><div class="meta-row"><span>Kundennr.</span><b>${esc(d.customerNo||"")}</b></div><div class="meta-row"><span>Datum</span><b>${esc(fmtDate(d.date))}</b></div><div class="meta-row"><span>gültig bis</span><b>${esc(fmtDate(d.validUntil))}</b></div>`;const w=window.open("","_blank","noopener,noreferrer,width=1000,height=1200");if(!w){toast("Popup blockiert – bitte Popups erlauben");return}w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>ANGEBOT ${number} · neXaro Solutions</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f4f6;color:#17181b;font:13px Arial,sans-serif}.page{width:210mm;min-height:297mm;margin:10mm auto;background:#fff;padding:17mm;box-shadow:0 4px 24px #0002}.brand{display:flex;justify-content:space-between;border-bottom:3px solid #ff6b00;padding-bottom:16px}.logo{font-size:30px;font-weight:900;letter-spacing:-2px}.logo span{color:#ff6b00}.sub{color:#6b7078;margin-top:4px}.eyebrow{color:#ff6b00;font-weight:800;letter-spacing:2px;font-size:10px}.recipient{margin-top:28px;display:flex;justify-content:space-between;gap:25px}.box{padding:13px;border:1px solid #ddd;border-radius:9px}.title{font-size:27px;margin:28px 0 7px}.muted{color:#6b7078}table{width:100%;border-collapse:collapse;margin-top:25px}th{background:#17181b;color:#fff;text-align:left;padding:9px}td{padding:9px;border-bottom:1px solid #e4e4e4}.right{text-align:right}.totals{width:50%;margin:22px 0 0 auto}.meta-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;gap:25px}.grand{font-size:18px;font-weight:900;border-top:2px solid #17181b}.note{margin-top:28px;padding:13px;background:#f7f7f7;border-radius:8px;white-space:pre-wrap}.footer{margin-top:48px;border-top:1px solid #ddd;padding-top:10px;color:#666;font-size:9px;line-height:1.45}.no-print{margin-top:22px;text-align:right}.no-print button{background:#ff6b00;color:#fff;border:0;border-radius:7px;padding:10px 15px;font-weight:800}@media print{body{background:#fff}.page{margin:0;box-shadow:none;width:auto;min-height:auto}.no-print{display:none}}</style></head><body><div class="page"><div class="brand"><div><div class="logo">ne<span>X</span>aro</div><div class="sub">neXaro Solutions · Sales & Field CRM</div></div><div class="eyebrow">ANGEBOT</div></div><div class="recipient"><div class="box">${recipient}</div><div class="box">${meta}</div></div><div class="title">Angebot</div><div class="muted">Gerne bieten wir Ihnen folgende Leistungen an:</div><table><thead><tr><th>Pos.</th><th>Bezeichnung</th><th class="right">Menge</th><th>Einheit</th><th class="right">Einzel €</th><th class="right">Gesamt €</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="meta-row"><span>Zwischensumme</span><b>${money(t.net)}</b></div><div class="meta-row"><span>MwSt. 19 %</span><b>${money(t.vat)}</b></div><div class="meta-row grand"><span>Gesamtbetrag</span><b>${money(t.gross)}</b></div></div>${d.note?`<div class="note"><b>Hinweise</b><br>${esc(d.note)}</div>`:""}<div class="footer"><b>neXaro Solutions</b> · Kirschstraße 1A · 15757 Halbe · Kontakt@nexaro-solutions.de · www.nexaro-solutions.de<br>USt-IdNr.: DE367084019 · Steuernummer: 049/2095/0926 · Einzelunternehmen · Inhaber: Sebastian Poetschke<br>Interne Provisionsinformationen werden nicht auf dem Angebot angezeigt.</div><div class="no-print"><button onclick="window.print()">📄 Drucken / Als PDF speichern</button></div></div></body></html>`);w.document.close();w.focus()}
function mailQuote(id){const q=S.quotes.find(x=>x.id===id),t=calcTotals(q.items||[]);location.href=`mailto:${encodeURIComponent(q.email||"")}?subject=${encodeURIComponent("Angebot AG"+String(S.quotes.indexOf(q)+1).padStart(4,"0")+" – neXaro Solutions")}&body=${encodeURIComponent(`Hallo ${q.contact||q.company},\n\nanbei unser Angebot von neXaro Solutions.\n\nGesamt brutto: ${money(t.gross)}\nGültig bis: ${fmtDate(q.validUntil)}\n\nFreundliche Grüße\nneXaro Solutions`)}`}
$("#quoteList").onclick=e=>{let id=e.target.closest("[data-pdfquote]")?.dataset.pdfquote;if(id)return printDocument("quote",id);id=e.target.closest("[data-editquote]")?.dataset.editquote;if(id)return quote(id);id=e.target.closest("[data-mailquote]")?.dataset.mailquote;if(id)mailQuote(id)};

function csv(){const rows=[['Firma','Branche','Status','Kontakt','Telefon','E-Mail','Adresse','TPV','Qualifizierung','Produkt','Priorität','Nächste Aktion','Nächster Kontakt'],...S.leads.map(l=>[l.company,l.industry,l.status,l.contact,l.phone,l.email,l.address,l.tpv,l.qualification,l.product,l.priority,l.next,l.due])];download('nexaro-leads.csv',rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\n'),'text/csv;charset=utf-8')}
function download(name,data,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('#restoreInput').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{S={...base,...JSON.parse(r.result)};save();render();toast('Backup wiederhergestellt')}catch{toast('Backup ungültig')}};r.readAsText(f)};
function demo(){S.leads=[{id:uid(),company:'Demo Kiosk',industry:'Kiosk / Späti',status:'neu',contact:'Max Beispiel',phone:'01700000000',email:'',address:'10115 Berlin',tpv:8500,qualified:true,qualification:'C',product:'Solo',priority:'Hoch',need:'Hohe Kartengebühren',next:'Tarifvergleich',due:today(),notes:''},{id:uid(),company:'Demo Gastro',industry:'Gastronomie',status:'termin',contact:'Anna Beispiel',phone:'',email:'',address:'10117 Berlin',tpv:18000,qualified:true,qualification:'A',product:'Terminal',priority:'Hoch',need:'Schnelleres Terminal',next:'Termin vor Ort',due:today(),notes:''}];S.tasks=[{id:uid(),title:'Demo Gastro besuchen',due:today(),leadId:S.leads[1].id,note:'Termin',done:false}];save();render();toast('Demo-Daten angelegt')}
function render(){renderDash();leads();tasks();docs();if($('#more')?.classList.contains('active'))docs()}
render();

// V2.0 public Vape catalog — EK/L3 is intentionally NOT shipped in the public GitHub build.
const VAPE_PRODUCTS = [
  {
    "id": "VP001",
    "name": "EB800",
    "category": "Disposables",
    "rrp": 10.99,
    "rrpOnline": 6.49,
    "vk": 4.33,
    "marginCap": 0.18
  },
  {
    "id": "VP002",
    "name": "BM600 QM600",
    "category": "Disposables",
    "rrp": 9.99,
    "rrpOnline": null,
    "vk": 4.09,
    "marginCap": 0.18
  },
  {
    "id": "VP003",
    "name": "ELFA",
    "category": "Prefilled Pods",
    "rrp": 11.99,
    "rrpOnline": 7.99,
    "vk": 5.91,
    "marginCap": 0.18
  },
  {
    "id": "VP004",
    "name": "ELFA NEW 1. July",
    "category": "Prefilled Pods",
    "rrp": 11.99,
    "rrpOnline": 7.99,
    "vk": 6.1,
    "marginCap": 0.18
  },
  {
    "id": "VP005",
    "name": "ELFA TAPPO EOL",
    "category": "Prefilled Pods",
    "rrp": 10.99,
    "rrpOnline": null,
    "vk": 5.12,
    "marginCap": 0.18
  },
  {
    "id": "VP006",
    "name": "ELFA Limited",
    "category": "Batteries",
    "rrp": 9.99,
    "rrpOnline": 7.49,
    "vk": 4.63,
    "marginCap": 0.18
  },
  {
    "id": "VP007",
    "name": "ELFA",
    "category": "Batteries",
    "rrp": 19.99,
    "rrpOnline": 19.99,
    "vk": 12.2,
    "marginCap": 0.18
  },
  {
    "id": "VP008",
    "name": "TAPPO EOL",
    "category": "Batteries",
    "rrp": 9.99,
    "rrpOnline": null,
    "vk": 4.63,
    "marginCap": 0.18
  },
  {
    "id": "VP009",
    "name": "ELFA Master",
    "category": "Batteries",
    "rrp": 13.99,
    "rrpOnline": 11.99,
    "vk": 7.32,
    "marginCap": 0.18
  },
  {
    "id": "VP010",
    "name": "ELFA MASTER Limited",
    "category": "Batteries",
    "rrp": 29.99,
    "rrpOnline": 26.99,
    "vk": 15.85,
    "marginCap": 0.18
  },
  {
    "id": "VP011",
    "name": "ELFA",
    "category": "Refillable Pods",
    "rrp": 7.99,
    "rrpOnline": 6.99,
    "vk": 3.9,
    "marginCap": 0.18
  },
  {
    "id": "VP012",
    "name": "ELFX V2.0",
    "category": "Refillable Pods",
    "rrp": 11.99,
    "rrpOnline": 10.99,
    "vk": 6.95,
    "marginCap": 0.18
  },
  {
    "id": "VP013",
    "name": "Elfliq",
    "category": "Liquids",
    "rrp": 11.99,
    "rrpOnline": 8.49,
    "vk": 6.71,
    "marginCap": 0.18
  },
  {
    "id": "VP014",
    "name": "Elfliq",
    "category": "Liquids",
    "rrp": 11.99,
    "rrpOnline": 8.49,
    "vk": 6.77,
    "marginCap": 0.18
  },
  {
    "id": "VP015",
    "name": "Elfbar Max",
    "category": "Refill Container",
    "rrp": 9.99,
    "rrpOnline": 7.99,
    "vk": 5.98,
    "marginCap": 0.18
  },
  {
    "id": "VP016",
    "name": "ELFA Turbo",
    "category": "Kits",
    "rrp": 13.99,
    "rrpOnline": 11.99,
    "vk": 7.32,
    "marginCap": 0.18
  },
  {
    "id": "VP017",
    "name": "ELFX",
    "category": "Kits",
    "rrp": 17.99,
    "rrpOnline": 16.99,
    "vk": 9.63,
    "marginCap": 0.18
  },
  {
    "id": "VP018",
    "name": "ELFX Pro",
    "category": "Kits",
    "rrp": 32.99,
    "rrpOnline": 30.99,
    "vk": 19.39,
    "marginCap": 0.18
  },
  {
    "id": "VP019",
    "name": "Elfbar Max",
    "category": "Kits",
    "rrp": 9.99,
    "rrpOnline": 7.99,
    "vk": 5.98,
    "marginCap": 0.18
  },
  {
    "id": "VP020",
    "name": "ELFX MEGA 10ml",
    "category": "Liquids",
    "rrp": 6.99,
    "rrpOnline": 5.99,
    "vk": 3.66,
    "marginCap": 0.18
  },
  {
    "id": "VP021",
    "name": "ELFX MEGA 5ml",
    "category": "Liquids",
    "rrp": 5.99,
    "rrpOnline": 4.99,
    "vk": 3.41,
    "marginCap": 0.18
  },
  {
    "id": "VP022",
    "name": "ELFA TURBO PRO",
    "category": "Kits",
    "rrp": 14.99,
    "rrpOnline": 12.99,
    "vk": 8.78,
    "marginCap": 0.18
  },
  {
    "id": "VP023",
    "name": "ELFX Mini",
    "category": "Kits",
    "rrp": 13.99,
    "rrpOnline": 11.99,
    "vk": 7.32,
    "marginCap": 0.18
  },
  {
    "id": "VP024",
    "name": "ELFX 2",
    "category": "Kits",
    "rrp": 17.99,
    "rrpOnline": 16.99,
    "vk": 10.0,
    "marginCap": 0.18
  },
  {
    "id": "VP025",
    "name": "ELFX MEGA",
    "category": "Kits",
    "rrp": 22.99,
    "rrpOnline": 21.99,
    "vk": 13.41,
    "marginCap": 0.18
  }
];

S.vapeProducts = S.vapeProducts?.length ? S.vapeProducts : VAPE_PRODUCTS;
S.vapeQuotes = S.vapeQuotes || [];
S.vapeInvoices = S.vapeInvoices || [];
S.vapeQuoteSequence = S.vapeQuoteSequence || 0;
S.vapeInvoiceSequence = S.vapeInvoiceSequence || 0;
save();


// ---- Private L3 data support ------------------------------------------------
// L3/EK data is stored only in browser localStorage after a private import.
// It is deliberately absent from this public source tree.
S.vapePrivatePrices = S.vapePrivatePrices || {};
function vapePrice(p){
  const ek = Number(S.vapePrivatePrices[p.id] ?? NaN);
  if(Number.isFinite(ek) && ek >= 0) return Math.round((ek / 0.82) * 100) / 100;
  return Number(p.vk || 0);
}
function vapeMargin(p){
  const ek = Number(S.vapePrivatePrices[p.id] ?? NaN);
  const vk = vapePrice(p);
  return Number.isFinite(ek) && vk > 0 ? (vk-ek)/vk : null;
}
function vapeProductOptions(){
  return '<option value="">Artikel wählen …</option>'+S.vapeProducts.map(p=>{
    const ek = Number(S.vapePrivatePrices[p.id] ?? NaN);
    const ekText = Number.isFinite(ek) ? ` · EK ${money(ek)}` : '';
    return `<option value="${p.id}">${esc(p.name)} · VK ${money(vapePrice(p))}${ekText}</option>`;
  }).join('');
}
function exportPrivateL3(){
  const payload = {version:1,source:"neXaro private L3 data",prices:S.vapePrivatePrices};
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="nexaro-private-l3-prices.json"; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importPrivateL3(file){
  if(!file) return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!d || typeof d.prices!=="object") throw new Error("Ungültige L3-Datei");
      S.vapePrivatePrices={...d.prices};
      save(); renderVape(); toast(`${Object.keys(S.vapePrivatePrices).length} L3-Preise importiert`);
    }catch(e){ toast("L3-Datei konnte nicht gelesen werden"); }
  };
  r.readAsText(file);
}

function renderVape(){
  const q=($('#vapeSearch')?.value||'').toLowerCase();
  const ps=S.vapeProducts.filter(p=>[p.name,p.category,p.id].join(' ').toLowerCase().includes(q));
  $('#vapeProductCount').textContent=S.vapeProducts.length; $('#vapeLeadCount').textContent=S.leads.length; $('#vapeQuoteCount').textContent=S.vapeQuotes.length; $('#vapeInvoiceCount').textContent=S.vapeInvoices.length;
  $('#vapeProductList').innerHTML=ps.map(p=>`<article class="card"><div class="row"><div><h3>${esc(p.name)}</h3><div class="meta">${esc(p.category)} · ${esc(p.id)}</div></div><span class="badge">max. 18 %</span></div><div class="chips"><span class="chip">RRP ${money(p.rrp)}</span>${Number.isFinite(Number(S.vapePrivatePrices[p.id]))?`<span class="chip">EK L3 🔒 ${money(Number(S.vapePrivatePrices[p.id]))}</span>`:''}<span class="chip good">VK ${money(vapePrice(p))}</span><span class="chip">Marge ${vapeMargin(p)==null?'Standard 18 %':(vapeMargin(p)*100).toFixed(2)+' %'}</span></div><div class="lead-actions"><button data-vape-add="${p.id}">＋ Angebot</button><button data-vape-invoice="${p.id}">🧾 Rechnung</button></div></article>`).join('')||'<div class="empty">Keine Artikel gefunden.</div>';
  $('#vapeQuoteList').innerHTML=S.vapeQuotes.map(q=>`<article class="card"><div class="row"><div><h3>${esc(q.number)} · ${esc(q.company)}</h3><div class="meta">${esc(q.date||'')} · ${esc(q.status||'Entwurf')}</div></div><b>${money(q.gross)}</b></div><div class="lead-actions"><button data-vq-edit="${q.id}">✏️ Bearbeiten</button><button data-vq-print="${q.id}">🖨️ Drucken / PDF</button><button data-vq-invoice="${q.id}">🧾 Rechnung</button></div></article>`).join('')||'<div class="empty">Noch keine Vape-Angebote.</div>';
  $('#vapeInvoiceList').innerHTML=S.vapeInvoices.map(i=>`<article class="card"><div class="row"><div><h3>${esc(i.number)} · ${esc(i.company)}</h3><div class="meta">${esc(i.date||'')} · fällig ${esc(i.due||'')}</div></div><b>${money(i.gross)}</b></div><div class="lead-actions"><button data-vi-edit="${i.id}">✏️ Bearbeiten</button><button data-vi-print="${i.id}">🖨️ Drucken / PDF</button></div></article>`).join('')||'<div class="empty">Noch keine Vape-Rechnungen.</div>';
}
$('#vapeSearch')?.addEventListener('input',renderVape);
function newVapeLine(container, item={}){
 const wrap=document.createElement('div'); wrap.className='line-item vape-line'; wrap.innerHTML=`<select class="vape-item-product">${vapeProductOptions()}</select><input class="vape-item-qty" type="number" min="0.01" step="1" value="${item.qty||1}"><input class="vape-item-price" type="number" min="0" step="0.01" value="${item.price??0}"><button type="button" class="icon-btn vape-remove">✕</button>`;
 container.appendChild(wrap); if(item.productId)wrap.querySelector('.vape-item-product').value=item.productId;
 const sel=wrap.querySelector('.vape-item-product'), price=wrap.querySelector('.vape-item-price'); sel.onchange=()=>{const p=S.vapeProducts.find(x=>x.id===sel.value); if(p)price.value=vapePrice(p)}; wrap.querySelector('.vape-remove').onclick=()=>{wrap.remove(); renderVapeTotals();}; wrap.querySelectorAll('input').forEach(x=>x.oninput=renderVapeTotals); return wrap;
}
function getVapeItems(container){return [...container.querySelectorAll('.line-item')].map(r=>{const p=S.vapeProducts.find(x=>x.id===r.querySelector('.vape-item-product').value);return {productId:p?.id||'',description:p?.name||'',qty:+r.querySelector('.vape-item-qty').value||0,unit:'Stück',price:+r.querySelector('.vape-item-price').value||0,ek:p?.ek||0}}).filter(x=>x.description&&x.qty>0)}
function totals(items){const net=items.reduce((a,x)=>a+x.qty*x.price,0);return {net,vat:net*.19,gross:net*1.19}}
function renderVapeTotals(){const a=totals(getVapeItems($('#vapeQuoteItems'))),b=totals(getVapeItems($('#vapeInvoiceItems'))); if($('#vqNetPreview')){$('#vqNetPreview').textContent=money(a.net);$('#vqVatPreview').textContent=money(a.vat);$('#vqGrossPreview').textContent=money(a.gross)} if($('#viNetPreview')){$('#viNetPreview').textContent=money(b.net);$('#viVatPreview').textContent=money(b.vat);$('#viGrossPreview').textContent=money(b.gross)}}
function fillLeadSelect(id){$('#'+id).innerHTML='<option value="">Ohne Lead</option>'+S.leads.map(l=>`<option value="${l.id}">${esc(l.company)}</option>`).join('')}
function newVapeQuote(productId=null, leadId=null, existing=null){
 $('#vapeQuoteForm').reset(); $('#vqId').value=existing?.id||''; fillLeadSelect('vqLead'); $('#vqDate').value=existing?.date||today(); $('#vqCompany').value=existing?.company||''; $('#vqCustomerNo').value=existing?.customerNo||''; $('#vqContact').value=existing?.contact||''; $('#vqEmail').value=existing?.email||''; $('#vqVatId').value=existing?.vatId||''; $('#vqNote').value=existing?.note||''; $('#vapeQuoteItems').innerHTML='';
 (existing?.items||[]).forEach(i=>newVapeLine($('#vapeQuoteItems'),i)); if(!existing?.items?.length)newVapeLine($('#vapeQuoteItems'), productId?{productId,qty:1,price:vapePrice(S.vapeProducts.find(p=>p.id===productId))}:{});
 if(leadId){$('#vqLead').value=leadId; $('#vqLead').dispatchEvent(new Event('change'))} if(existing)$('#vqLead').value=existing.leadId||''; renderVapeTotals(); open('vapeQuoteDialog');
}
$('#vqLead')?.addEventListener('change',()=>{const l=S.leads.find(x=>x.id===$('#vqLead').value);if(l){$('#vqCompany').value=l.company;$('#vqContact').value=l.contact||'';$('#vqEmail').value=l.email||''}});
$('#addVapeQuoteItem')?.addEventListener('click',()=>{newVapeLine($('#vapeQuoteItems'));renderVapeTotals()});
$('#vapeQuoteForm')?.addEventListener('submit',e=>{e.preventDefault();const items=getVapeItems($('#vapeQuoteItems')),t=totals(items);if(!items.length)return toast('Mindestens einen Artikel auswählen');const id=$('#vqId').value||uid(),old=S.vapeQuotes.find(x=>x.id===id),number=old?.number||`VP-ANG-${String(++S.vapeQuoteSequence).padStart(4,'0')}`;const d={id,number,leadId:$('#vqLead').value,company:$('#vqCompany').value.trim(),customerNo:$('#vqCustomerNo').value.trim(),contact:$('#vqContact').value.trim(),email:$('#vqEmail').value.trim(),vatId:$('#vqVatId').value.trim(),date:$('#vqDate').value,items,note:$('#vqNote').value.trim(),status:old?.status||'Entwurf',...t};const idx=S.vapeQuotes.findIndex(x=>x.id===id);idx>=0?S.vapeQuotes[idx]=d:S.vapeQuotes.unshift(d);save();close('vapeQuoteDialog');render();renderVape();toast('Vape-Angebot gespeichert')});
function newVapeInvoice(productId=null, quote=null, existing=null){
 $('#vapeInvoiceForm').reset(); $('#viId').value=existing?.id||''; $('#viDate').value=existing?.date||today(); $('#viDue').value=existing?.due||today(); $('#viCompany').value=existing?.company||quote?.company||''; $('#viCustomerNo').value=existing?.customerNo||quote?.customerNo||''; $('#viContact').value=existing?.contact||quote?.contact||''; $('#viEmail').value=existing?.email||quote?.email||''; $('#viVatId').value=existing?.vatId||quote?.vatId||''; $('#viNote').value=existing?.note||'Zahlungsziel gemäß Vereinbarung.'; $('#vapeInvoiceItems').innerHTML=''; (existing?.items||quote?.items||[]).forEach(i=>newVapeLine($('#vapeInvoiceItems'),i)); if(!existing?.items?.length&&!quote&&!productId)newVapeLine($('#vapeInvoiceItems'),{}); if(productId)newVapeLine($('#vapeInvoiceItems'),{productId,qty:1,price:vapePrice(S.vapeProducts.find(p=>p.id===productId))}); renderVapeTotals();open('vapeInvoiceDialog')}
$('#addVapeInvoiceItem')?.addEventListener('click',()=>{newVapeLine($('#vapeInvoiceItems'));renderVapeTotals()});
$('#vapeInvoiceForm')?.addEventListener('submit',e=>{e.preventDefault();const items=getVapeItems($('#vapeInvoiceItems')),t=totals(items);if(!items.length)return toast('Mindestens einen Artikel auswählen');const id=$('#viId').value||uid(),old=S.vapeInvoices.find(x=>x.id===id),number=old?.number||`VP-RE-${String(++S.vapeInvoiceSequence).padStart(4,'0')}`;const d={id,number,company:$('#viCompany').value.trim(),customerNo:$('#viCustomerNo').value.trim(),contact:$('#viContact').value.trim(),email:$('#viEmail').value.trim(),vatId:$('#viVatId').value.trim(),date:$('#viDate').value,due:$('#viDue').value,items,note:$('#viNote').value.trim(),status:old?.status||'Offen',...t};const idx=S.vapeInvoices.findIndex(x=>x.id===id);idx>=0?S.vapeInvoices[idx]=d:S.vapeInvoices.unshift(d);save();close('vapeInvoiceDialog');render();renderVape();toast('Vape-Rechnung gespeichert')});
function printVapeDoc(doc,type){const rows=doc.items.map(i=>`<tr><td>${esc(i.description)}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(i.qty*i.price)}</td></tr>`).join('');const title=type==='invoice'?'Rechnung':'Angebot';const num=doc.number;const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${title} ${esc(num)}</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#111}h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:30px}th,td{border-bottom:1px solid #ddd;padding:10px;text-align:left}th:nth-child(n+2),td:nth-child(n+2){text-align:right}.totals{margin:30px 0 0 auto;width:280px}.totals div{display:flex;justify-content:space-between;padding:5px}.brand{font-weight:800;font-size:22px;margin-bottom:30px}.muted{color:#666}.foot{margin-top:60px;border-top:1px solid #ddd;padding-top:12px;font-size:12px;color:#555}@media print{button{display:none}}</style></head><body><div class="brand">neXaro Solutions</div><h1>${title}</h1><div class="muted">${esc(num)} · ${esc(doc.date||'')}</div><h3>${esc(doc.company)}</h3><div>${esc(doc.contact||'')}</div><div>${esc(doc.email||'')}</div><table><thead><tr><th>Artikel</th><th>Menge</th><th>Einzelpreis</th><th>Gesamt</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Netto</span><b>${money(doc.net)}</b></div><div><span>MwSt. 19 %</span><b>${money(doc.vat)}</b></div><div><span>Brutto</span><b>${money(doc.gross)}</b></div></div><p>${esc(doc.note||'')}</p><div class="foot">neXaro Solutions · Kirschstraße 1A · 15757 Halbe · Kontakt@nexaro-solutions.de · www.nexaro-solutions.de · USt-IdNr. DE367084019</div><script>window.print()<\/script></body></html>`;const w=window.open('','_blank');w.document.write(html);w.document.close()}

const oldAct=act; act=function(a){if(a==='new-vape-quote')return newVapeQuote();if(a==='new-vape-invoice')return newVapeInvoice();return oldAct(a)};
$('#vapeProductList')?.addEventListener('click',e=>{const q=e.target.closest('[data-vape-add]');if(q)return newVapeQuote(q.dataset.vapeAdd);const i=e.target.closest('[data-vape-invoice]');if(i)return newVapeInvoice(i.dataset.vapeInvoice)});
$('#vapeQuoteList')?.addEventListener('click',e=>{let q=e.target.closest('[data-vq-edit]');if(q)return newVapeQuote(null,null,S.vapeQuotes.find(x=>x.id===q.dataset.vqEdit));q=e.target.closest('[data-vq-print]');if(q)return printVapeDoc(S.vapeQuotes.find(x=>x.id===q.dataset.vqPrint),'quote');q=e.target.closest('[data-vq-invoice]');if(q)return newVapeInvoice(null,S.vapeQuotes.find(x=>x.id===q.dataset.vqInvoice))});
$('#vapeInvoiceList')?.addEventListener('click',e=>{let q=e.target.closest('[data-vi-edit]');if(q)return newVapeInvoice(null,null,S.vapeInvoices.find(x=>x.id===q.dataset.viEdit));q=e.target.closest('[data-vi-print]');if(q)return printVapeDoc(S.vapeInvoices.find(x=>x.id===q.dataset.viPrint),'invoice')});
const oldRender=render; render=function(){oldRender(); if($('#vape')?.classList.contains('active'))renderVape()};
renderVape();

document.getElementById('importL3Btn')?.addEventListener('click',()=>document.getElementById('l3Input').click());
document.getElementById('l3Input')?.addEventListener('change',e=>importPrivateL3(e.target.files?.[0]));
document.getElementById('exportL3Btn')?.addEventListener('click',exportPrivateL3);
