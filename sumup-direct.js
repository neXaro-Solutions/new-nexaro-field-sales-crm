(()=>{
'use strict';
const wait=(fn,ms=150)=>{let n=0;const t=setInterval(()=>{if(fn()||++n>100)clearInterval(t)},ms)};
function load(src){if(document.querySelector(`script[data-nx-direct="${src}"]`))return;const s=document.createElement('script');s.src=src;s.dataset.nxDirect=src;document.head.appendChild(s)}
function leadFromCard(card){
  try{
    const text=(card.innerText||'').toLowerCase();
    const s=JSON.parse(localStorage.getItem('nexaro-crm-v2-0')||'{}');
    const leads=Array.isArray(s.leads)?s.leads:[];
    return leads.find(l=>l.company&&text.includes(String(l.company).toLowerCase()))||null;
  }catch{return null}
}
function openAdvisor(lead){
  if(typeof window.neXaroSumUp?.open==='function'){window.neXaroSumUp.open(lead?.id||null);return true}
  return false;
}
function addButton(parent,label,lead){
  if(!parent||parent.querySelector('[data-nxsu-direct]'))return;
  const b=document.createElement('button');b.type='button';b.className='secondary';b.dataset.nxsuDirect='1';b.textContent=label;b.style.marginLeft='6px';
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!openAdvisor(lead)){load('./sumup-advisor-fix.js?v=5');setTimeout(()=>openAdvisor(lead),500)}});
  parent.appendChild(b);
}
function install(){
  const pricing=[...document.querySelectorAll('[data-action="pricing"]')];
  pricing.forEach(b=>{b.removeAttribute('data-action');if(!b.dataset.nxsuDirectBound){b.dataset.nxsuDirectBound='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openAdvisor(null)||(load('./sumup-advisor-fix.js?v=5'),setTimeout(()=>openAdvisor(null),500))},true)}});
  const dash=document.querySelector('#dashboard');
  if(dash&&!document.getElementById('nxsuDashboardDirect')){
    const q=dash.querySelector('.quick-actions');
    if(q){const b=document.createElement('button');b.id='nxsuDashboardDirect';b.className='quick-action';b.type='button';b.innerHTML='<span>💶</span><b>SumUp Beratung</b><small>Bedarf → Lösung → Angebot</small>';b.onclick=()=>openAdvisor(null)||(load('./sumup-advisor-fix.js?v=5'),setTimeout(()=>openAdvisor(null),500));q.appendChild(b)}
  }
  document.querySelectorAll('.lead-card').forEach(card=>{const lead=leadFromCard(card);const actions=card.querySelector('.lead-actions')||card.querySelector('.actions')||card.lastElementChild;addButton(actions,'🧠 Beratung',lead)});
  if(window.neXaroSumUp?.open)load('./sumup-compare-ocr.js?v=2');
}
load('./sumup-advisor-fix.js?v=5');
wait(()=>{install();return !!window.neXaroSumUp?.open},150);
new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
})();