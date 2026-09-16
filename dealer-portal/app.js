import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL='https://hbuqzdmjqvgybwohfnqy.supabase.co';
const SUPABASE_KEY='sb_publishable_zoRbvS06zi6X4_shxXQkMg_O7h0Go6r';
const sb=createClient(SUPABASE_URL,SUPABASE_KEY);
let catalog=[]; let cart=new Map(); let dealer=null;
const $=id=>document.getElementById(id);
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const msg=(el,t)=>$(el).textContent=t||'';

async function loadSession(){
  const {data}=await sb.auth.getSession();
  if(data.session) await enter(data.session.user); else showLogin();
  sb.auth.onAuthStateChange((_e,s)=>s?enter(s.user):showLogin());
}
async function enter(user){
  const {data,error}=await sb.from('dealers').select('id,company_name,dealer_code,margin_percent,status').eq('auth_user_id',user.id).maybeSingle();
  if(error||!data||data.status!=='freigeschaltet'){await sb.auth.signOut();showLogin();msg('loginMsg',data?'Dein Händlerzugang ist noch nicht freigeschaltet.':'Für diesen Benutzer ist kein Händlerkonto hinterlegt.');return;}
  dealer=data; $('login').classList.add('hidden'); $('shop').classList.remove('hidden'); $('logout').classList.remove('hidden');
  $('dealerName').textContent=data.company_name; $('dealerMeta').textContent=`Händlernummer ${data.dealer_code} · persönlicher Händlerpreis`;
  await loadCatalog();
}
function showLogin(){$('login').classList.remove('hidden');$('shop').classList.add('hidden');$('logout').classList.add('hidden');}
async function loadCatalog(){
  const {data,error}=await sb.rpc('get_my_dealer_catalog');
  if(error){$('products').innerHTML='<div class="card">Katalog konnte nicht geladen werden.</div>';return;}
  catalog=data||[]; buildCategories(); render();
}
function buildCategories(){const s=$('category');const cats=[...new Set(catalog.map(p=>p.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));s.innerHTML='<option value="">Alle Kategorien</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){const q=$('search').value.trim().toLowerCase(),cat=$('category').value;const rows=catalog.filter(p=>(!q||`${p.name} ${p.variant||''} ${p.article_no} ${p.ean||''}`.toLowerCase().includes(q))&&(!cat||p.category===cat));$('products').innerHTML=rows.map(p=>`<article class="card product"><h3>${esc(p.name)}</h3><div class="meta">${esc(p.variant||'')}${p.variant?' · ':''}${esc(p.article_no)}</div>${p.category?`<div class="meta">${esc(p.category)}</div>`:''}<div><span class="badge">Händlerpreis netto</span></div><div class="price">${euro(p.price_net)}</div><button class="primary" data-add="${p.id}">In Warenkorb</button></article>`).join('')||'<div class="card">Keine Produkte gefunden.</div>';document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(b.dataset.add));}
function add(id){const p=catalog.find(x=>x.id===id);if(!p)return;cart.set(id,(cart.get(id)||0)+1);updateCartCount();}
function updateCartCount(){$('cartCount').textContent=[...cart.values()].reduce((a,b)=>a+b,0);}
function cartRows(){return [...cart.entries()].map(([id,qty])=>{const p=catalog.find(x=>x.id===id);return p?{p,qty}:null}).filter(Boolean)}
function renderCart(){const rows=cartRows();$('cartItems').innerHTML=rows.map(({p,qty})=>`<div class="cart-row"><div><b>${esc(p.name)}</b><br><small>${esc(p.article_no)} · ${euro(p.price_net)} netto</small></div><div class="qty"><button class="ghost" data-dec="${p.id}">−</button><b>${qty}</b><button class="ghost" data-inc="${p.id}">+</button></div></div>`).join('')||'<p>Warenkorb ist leer.</p>';const total=rows.reduce((s,{p,qty})=>s+p.price_net*qty,0);$('cartTotal').textContent=euro(total);document.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{add(b.dataset.inc);renderCart()});document.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{const n=(cart.get(b.dataset.dec)||1)-1;if(n<=0)cart.delete(b.dataset.dec);else cart.set(b.dataset.dec,n);updateCartCount();renderCart()});}
$('loginBtn').onclick=async()=>{msg('loginMsg','');const email=$('email').value.trim(),password=$('password').value;if(!email||!password)return msg('loginMsg','Bitte E-Mail und Passwort eingeben.');$('loginBtn').disabled=true;$('loginBtn').textContent='Anmeldung…';const {data,error}=await sb.auth.signInWithPassword({email,password});$('loginBtn').disabled=false;$('loginBtn').textContent='Einloggen';if(error)return msg('loginMsg','Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');await enter(data.user)};
$('logout').onclick=()=>sb.auth.signOut();$('search').oninput=render;$('category').onchange=render;$('openCart').onclick=()=>{renderCart();$('cartDialog').showModal()};$('closeCart').onclick=()=>$('cartDialog').close();
$('orderBtn').onclick=async()=>{const rows=cartRows();if(!rows.length)return msg('orderMsg','Warenkorb ist leer.');msg('orderMsg','Bestellung wird gesendet…');const {data,error}=await sb.rpc('place_dealer_order',{p_items:rows.map(({p,qty})=>({product_id:p.id,quantity:qty})),p_note:$('note').value.trim()||null});if(error)return msg('orderMsg','Bestellung konnte nicht gesendet werden.');cart.clear();updateCartCount();$('note').value='';msg('orderMsg',`Bestellung ${String(data).slice(0,8)}… wurde übermittelt.`);renderCart();};
loadSession();
