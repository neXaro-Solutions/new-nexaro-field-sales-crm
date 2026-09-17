(()=>{
'use strict';
const wait=(fn,ms=150)=>{let n=0;const t=setInterval(()=>{if(fn()||++n>100)clearInterval(t)},ms)};
function load(src){if(document.querySelector(`script[data-nx-direct="${src}"]`))return;const s=document.createElement('script');s.src=src;s.dataset.nxDirect=src;document.head.appendChild(s)}
function openAdvisor(lead){
 if(typeof window.neXaroSumUp?.open==='function'){
  window.neXaroSumUp.open(lead?.id||null);return true;
 }
 return false;
}
function start(){
 load('./sumup-solution-builder.js?v=2');
 load('./sumup-live-fix.js?v=6');
 load('./sumup-crm-offer-link.js?v=2');
}
function install(){
 document.querySelectorAll('[data-action="pricing"]').forEach(b=>{
  if(b.dataset.nxsuDirectBound)return;
  b.dataset.nxsuDirectBound='1';
  b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();start();setTimeout(()=>openAdvisor(null),500)},true);
 });
 const dash=document.querySelector('#dashboard');
 if(dash&&!document.getElementById('nxsuDashboardDirect')){
  const q=dash.querySelector('.quick-actions');
  if(q){const b=document.createElement('button');b.id='nxsuDashboardDirect';b.className='quick-action';b.innerHTML='<span>💶</span><b>SumUp Beratung</b><small>Bedarf → Lösung → Angebot</small>';b.onclick=()=>{start();setTimeout(()=>openAdvisor(null),500)};q.appendChild(b)}
 }
}
start();
wait(()=>{install();return !!window.neXaroSumUp?.open},150);
new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
})();