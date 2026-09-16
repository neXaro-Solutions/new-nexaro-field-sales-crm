import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL='https://hbuqzdmjqvgybwohfnqy.supabase.co';
const SUPABASE_KEY='sb_publishable_zoRbvS06zi6X4_shxXQkMg_O7h0Go6r';
const VAPID_PUBLIC_KEY='BMY4ZImAXi6v35cNF0KhID3IXidItW0J-YEVa3xQE1Y2vZC0C7TQUr7lPgAvLO82gR_oTVwBX4Nx79pK7Tzw3Y8';
const sb=createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(d)):'—';

function msg(t){$('status').textContent=t||'';}
function loginMsg(t){$('loginMsg').textContent=t||'';}
function showLogin(){ $('login').classList.remove('hidden'); $('admin').classList.add('hidden'); $('logout').classList.add('hidden'); $('pushBtn').classList.add('hidden'); }
function showAdmin(){ $('login').classList.add('hidden'); $('admin').classList.remove('hidden'); $('logout').classList.remove('hidden'); $('pushBtn').classList.remove('hidden'); loadRegistrations(); updatePushState(); }

async function checkStaff(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session)return showLogin();
  const {data,error}=await sb.from('staff_users').select('id,role,active').eq('id',session.user.id).maybeSingle();
  if(error||!data||!data.active){await sb.auth.signOut();showLogin();loginMsg('Dieser Benutzer ist nicht als aktiver Mitarbeiter hinterlegt.');return;}
  showAdmin();
}

async function loadRegistrations(){
  msg('Lade Händleranfragen …');
  const {data,error}=await sb.from('dealer_registrations').select('id,company_name,contact_name,email,phone,status,created_at,updated_at').order('created_at',{ascending:false});
  if(error){msg('Händleranfragen konnten nicht geladen werden.');return;}
  msg('');
  render(data||[]);
}

function render(rows){
  const pending=rows.filter(r=>r.status==='pending');
  $('registrations').innerHTML=`
    <div class="stats"><div class="stat"><span>Offen</span><b>${pending.length}</b></div><div class="stat"><span>Freigeschaltet</span><b>${rows.filter(r=>r.status==='approved').length}</b></div><div class="stat"><span>Abgelehnt</span><b>${rows.filter(r=>r.status==='rejected').length}</b></div></div>
    ${rows.length?rows.map(r=>card(r)).join(''):'<div class="card empty">Noch keine Händlerregistrierungen.</div>'}`;
  document.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>approve(b.dataset.approve));
  document.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>reject(b.dataset.reject));
}

function card(r){
  const pending=r.status==='pending';
  return `<article class="card registration ${pending?'pending':''}">
    <div class="row"><div><h3>${esc(r.company_name)}</h3><div class="meta">${esc(r.contact_name)} · ${esc(r.email)}</div>${r.phone?`<div class="meta">☎ ${esc(r.phone)}</div>`:''}</div><span class="badge ${pending?'open':''}">${r.status==='pending'?'Offen':r.status==='approved'?'Freigeschaltet':'Abgelehnt'}</span></div>
    <div class="meta">Registriert: ${esc(fmt(r.created_at))}</div>
    ${pending?`<div class="approval"><label>VAPE-Marge <strong class="marginValue" data-margin-value="${r.id}">25 %</strong><input data-margin="${r.id}" type="range" min="15" max="25" step="1" value="25"></label><div class="actions"><button class="primary" data-approve="${r.id}">✓ Händler freischalten</button><button class="secondary" data-reject="${r.id}">Ablehnen</button></div></div>`:''}
  </article>`;
}

async function approve(id){
  const slider=document.querySelector(`[data-margin="${CSS.escape(id)}"]`);
  const margin=Number(slider?.value||25);
  if(!confirm(`Händler freischalten und ${margin}% VAPE-Marge setzen?`))return;
  msg('Freischaltung wird durchgeführt …');
  const {data,error}=await sb.functions.invoke('approve-dealer-registration',{body:{p_registration_id:id,p_margin:margin}});
  if(error){msg('Freischaltung fehlgeschlagen: '+error.message);return;}
  if(!data?.dealer){msg('Freischaltung fehlgeschlagen: Keine Händlerdaten zurückgegeben.');return;}
  msg('Händler wurde freigeschaltet.');
  await loadRegistrations();
}

async function reject(id){
  if(!confirm('Diese Händlerregistrierung wirklich ablehnen?'))return;
  msg('Anfrage wird abgelehnt …');
  const {error}=await sb.rpc('reject_dealer_registration',{p_registration_id:id});
  if(error){msg('Ablehnung fehlgeschlagen: '+error.message);return;}
  msg('Händleranfrage wurde abgelehnt.');
  await loadRegistrations();
}

function urlBase64ToUint8Array(base64String){
  const padding='='.repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);
  return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
}

function pushSupported(){
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

async function updatePushState(){
  const btn=$('pushBtn');
  if(!btn)return;
  if(!pushSupported()){btn.textContent='🔔 Push nicht verfügbar';btn.disabled=true;return;}
  try{
    const reg=await navigator.serviceWorker.getRegistration('./');
    const sub=reg?await reg.pushManager.getSubscription():null;
    const keyVersion=localStorage.getItem('nexaro_vapid_public_key');
    if(sub && keyVersion!==VAPID_PUBLIC_KEY){
      try{
        await sub.unsubscribe();
        await sb.from('push_subscriptions').delete().eq('endpoint',sub.endpoint);
      }catch(_){ }
      localStorage.removeItem('nexaro_vapid_public_key');
      btn.textContent='🔔 Push neu aktivieren';btn.disabled=false;btn.classList.remove('push-active');
      return;
    }
    if(sub){btn.textContent='🔔 Push aktiv';btn.disabled=true;btn.classList.add('push-active');}
    else{btn.textContent='🔔 Push aktivieren';btn.disabled=false;btn.classList.remove('push-active');}
  }catch(e){btn.textContent='🔔 Push aktivieren';btn.disabled=false;}
}

async function enablePush(){
  const btn=$('pushBtn');
  if(!pushSupported())return;
  btn.disabled=true;btn.textContent='Push wird eingerichtet …';
  try{
    const permission=await Notification.requestPermission();
    if(permission!=='granted'){btn.disabled=false;btn.textContent='🔔 Push aktivieren';$('pushStatus').textContent='Push-Berechtigung wurde nicht erteilt.';return;}
    const reg=await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(sub && localStorage.getItem('nexaro_vapid_public_key')!==VAPID_PUBLIC_KEY){
      try{await sub.unsubscribe();await sb.from('push_subscriptions').delete().eq('endpoint',sub.endpoint);}catch(_){ }
      sub=null;
    }
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
    const json=sub.toJSON();
    const {data:{session}}=await sb.auth.getSession();
    if(!session)throw new Error('Keine Anmeldung vorhanden.');
    const {error}=await sb.from('push_subscriptions').upsert({user_id:session.user.id,endpoint:json.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth,updated_at:new Date().toISOString()},{onConflict:'endpoint'});
    if(error)throw error;
    localStorage.setItem('nexaro_vapid_public_key',VAPID_PUBLIC_KEY);
    $('pushStatus').textContent='Push-Benachrichtigungen sind aktiviert.';
    btn.textContent='🔔 Push aktiv';btn.classList.add('push-active');
  }catch(e){
    console.error(e);
    $('pushStatus').textContent='Push konnte nicht aktiviert werden: '+(e?.message||'Unbekannter Fehler');
    btn.disabled=false;btn.textContent='🔔 Push aktivieren';
  }
}

$('loginBtn').onclick=async()=>{
  loginMsg('');$('loginBtn').disabled=true;$('loginBtn').textContent='Anmeldung …';
  const {data,error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
  $('loginBtn').disabled=false;$('loginBtn').textContent='Einloggen';
  if(error){loginMsg('Anmeldung fehlgeschlagen.');return;}
  if(data.user)await checkStaff();
};
$('logout').onclick=()=>sb.auth.signOut();
$('refresh').onclick=loadRegistrations;
$('pushBtn').onclick=enablePush;
document.addEventListener('input',e=>{const id=e.target.dataset.margin;if(id){document.querySelector(`[data-margin-value="${CSS.escape(id)}"]`).textContent=`${e.target.value} %`;}});
sb.auth.onAuthStateChange((_event)=>checkStaff());
checkStaff();
