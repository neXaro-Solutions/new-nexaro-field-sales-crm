/* neXaro Händlerverwaltung – CRM-Vorbereitung */
S.dealers=Array.isArray(S.dealers)?S.dealers:[];
function dealerById(id){return S.dealers.find(d=>d.id===id)||null}
function dealerMargin(d){return Math.min(25,Math.max(15,Number(d?.vapeMargin)||25))}
function dealerCustomer(d){return d?.customerId?customerById(d.customerId):null}
function dealerStatusLabel(s){return s==='active'?'Freigeschaltet':s==='blocked'?'Gesperrt':'Angelegt'}
function ensureDealerScreen(){
  if($('#dealers'))return;
  const navEl=$('#nav');
  const btn=document.createElement('button');btn.type='button';btn.dataset.screen='dealers';btn.textContent='🟣 Händler';btn.title='VAPE-Händlerverwaltung';navEl?.appendChild(btn);
  btn.addEventListener('click',e=>{e.preventDefault();nav('dealers')});
  const main=document.querySelector('main')||document.body;
  const sec=document.createElement('section');sec.id='dealers';sec.className='screen';
  sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">VAPE · B2B</div><h1>Händlerverwaltung</h1><p class="muted">Händlerzugänge vorbereiten und individuelle VAPE-Margen verwalten.</p></div><button type="button" class="primary" id="dealerNew">＋ Händler anlegen</button></div><div class="card" style="margin-bottom:14px"><div class="row"><div><b>🔒 Zugangssicherheit</b><div class="meta">Passwörter werden hier nicht gespeichert. Der echte externe Händler-Login wird später über eine sichere Authentifizierung angebunden.</div></div><span class="chip good">CRM-intern</span></div></div><div id="dealerList"></div>`;
  main.appendChild(sec);
  const dlg=document.createElement('dialog');dlg.id='dealerDialog';dlg.innerHTML=`<form method="dialog" id="dealerForm" class="dialog-form"><div class="row"><div><h2 id="dealerFormTitle">Händler anlegen</h2><div class="meta">B2B-Händlerprofil</div></div><button type="button" data-close="dealerDialog">✕</button></div><input type="hidden" id="dealerId"><label>Kunde / Firma<select id="dealerCustomer" required></select></label><label>Login-E-Mail<input id="dealerEmail" type="email" autocomplete="off" placeholder="händler@firma.de"></label><label>Händlerkennung<input id="dealerUsername" autocomplete="off" placeholder="z. B. firma-001"></label><label>VAPE-Marge <output id="dealerMarginValue">25 %</output><input id="dealerMargin" type="range" min="15" max="25" step="1" value="25"></label><label>Status<select id="dealerStatus"><option value="pending">Angelegt</option><option value="active">Freigeschaltet</option><option value="blocked">Gesperrt</option></select></label><div class="row" style="margin-top:12px"><button type="button" data-close="dealerDialog">Abbrechen</button><button type="submit" class="primary">Speichern</button></div></form>`;document.body.appendChild(dlg);
  $('#dealerNew').onclick=()=>newDealer();
  $('#dealerMargin').oninput=e=>$('#dealerMarginValue').textContent=`${e.target.value} %`;
  $('#dealerForm').onsubmit=e=>{e.preventDefault();saveDealer()};
}
function renderDealers(){
  ensureDealerScreen();
  const list=$('#dealerList');if(!list)return;
  const dealers=S.dealers.slice().sort((a,b)=>String(a.username||'').localeCompare(String(b.username||'')));
  list.innerHTML=dealers.map(d=>{const c=dealerCustomer(d);return `<article class="card"><div class="row"><div><h3>${esc(c?.company||d.company||'Ohne Firma')}</h3><div class="meta">${esc(d.username||'Keine Händlerkennung')}${d.email?' · '+esc(d.email):''}</div></div><span class="badge">${esc(dealerStatusLabel(d.status))}</span></div><div class="chips"><span class="chip good">🟣 VAPE-Marge ${dealerMargin(d)} %</span><span class="chip">${c?'Kundennr. '+esc(c.customerNo||'—'):'Kunde nicht verknüpft'}</span></div><div class="lead-actions"><button data-dealer-edit="${d.id}">✏️ Bearbeiten</button><button data-dealer-toggle="${d.id}">${d.status==='active'?'⛔ Sperren':'✅ Freischalten'}</button><button data-dealer-delete="${d.id}">🗑️</button></div></article>`}).join('')||'<div class="empty">Noch keine Händler angelegt.</div>';
}
function newDealer(id=''){
  ensureDealerScreen();$('#dealerForm').reset();$('#dealerId').value=id;
  $('#dealerCustomer').innerHTML=customerOptions();
  const d=id&&dealerById(id);$('#dealerFormTitle').textContent=d?'Händler bearbeiten':'Händler anlegen';
  if(d){$('#dealerCustomer').value=d.customerId||'';$('#dealerEmail').value=d.email||'';$('#dealerUsername').value=d.username||'';$('#dealerMargin').value=dealerMargin(d);$('#dealerStatus').value=d.status||'pending'}else{$('#dealerMargin').value=25;$('#dealerStatus').value='pending'}
  $('#dealerMarginValue').textContent=`${$('#dealerMargin').value} %`;open('dealerDialog');
}
function saveDealer(){
  const customerId=$('#dealerCustomer').value,email=$('#dealerEmail').value.trim(),username=$('#dealerUsername').value.trim();
  if(!customerId)return toast('Bitte einen Kunden verknüpfen');
  if(!username)return toast('Händlerkennung fehlt');
  const existing=S.dealers.find(d=>d.username.toLowerCase()===username.toLowerCase()&&d.id!==$('#dealerId').value);if(existing)return toast('Händlerkennung bereits vergeben');
  const c=customerById(customerId);if(!c)return toast('Kunde nicht gefunden');
  const id=$('#dealerId').value||uid(),d={id,customerId,email,username,vapeMargin:Math.min(25,Math.max(15,Number($('#dealerMargin').value)||25)),status:$('#dealerStatus').value||'pending',updatedAt:new Date().toISOString()};
  const i=S.dealers.findIndex(x=>x.id===id);i>=0?S.dealers[i]=d:S.dealers.unshift(d);
  c.vapeMargin=d.vapeMargin;save();close('dealerDialog');renderDealers();renderCustomers();toast('Händler gespeichert');
}
function toggleDealer(id){const d=dealerById(id);if(!d)return;d.status=d.status==='active'?'blocked':'active';d.updatedAt=new Date().toISOString();save();renderDealers();toast(d.status==='active'?'Händler freigeschaltet':'Händler gesperrt')}
function deleteDealer(id){const d=dealerById(id);if(!d)return;if(!confirm('Händlerprofil wirklich löschen?'))return;S.dealers=S.dealers.filter(x=>x.id!==id);save();renderDealers();toast('Händlerprofil gelöscht')}
ensureDealerScreen();
$('#dealerList')?.addEventListener('click',e=>{let id=e.target.closest('[data-dealer-edit]')?.dataset.dealerEdit;if(id)return newDealer(id);id=e.target.closest('[data-dealer-toggle]')?.dataset.dealerToggle;if(id)return toggleDealer(id);id=e.target.closest('[data-dealer-delete]')?.dataset.dealerDelete;if(id)return deleteDealer(id)});
const oldRenderWithDealers=render;render=function(){oldRenderWithDealers();renderDealers()};renderDealers();
