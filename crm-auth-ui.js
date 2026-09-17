// neXaro Solutions · CRM Auth UI bridge
(() => {
  function ensureAuthGate(){
    if(document.getElementById('nexaroAuthGate')) return;
    const box=document.createElement('div');
    box.id='nexaroAuthGate';
    box.innerHTML=`<div class="nx-auth-card"><h2>neXaro CRM Login</h2><p>Interner Zugriff für Vertrieb und Administration.</p><input id="nxAuthEmail" type="email" placeholder="E-Mail"><input id="nxAuthPassword" type="password" placeholder="Passwort"><button id="nxAuthLogin">Anmelden</button><small id="nxAuthMessage"></small></div>`;
    document.body.appendChild(box);
    document.getElementById('nxAuthLogin').onclick=async()=>{
      const msg=document.getElementById('nxAuthMessage');
      if(!window.nexaroAuth){msg.textContent='Auth-Modul nicht geladen';return;}
      msg.textContent='Login wird vorbereitet...';
    };
  }
  window.addEventListener('load', ensureAuthGate);
})();
