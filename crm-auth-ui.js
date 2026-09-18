// neXaro Solutions · CRM Auth UI
(() => {
  function ensureAuthGate(){
    if (document.getElementById('nexaroAuthGate')) return;

    const style = document.createElement('style');
    style.textContent = `#nexaroAuthGate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:#08111f;color:#fff;padding:20px}#nexaroAuthGate .nx-auth-card{width:min(420px,100%);background:#101b2d;border:1px solid #243552;border-radius:20px;padding:28px;box-shadow:0 20px 60px #0008}#nexaroAuthGate h2{margin:0 0 8px}#nexaroAuthGate p{color:#aab7cc;margin:0 0 20px}#nexaroAuthGate input{display:block;width:100%;box-sizing:border-box;margin:10px 0;padding:13px;border-radius:10px;border:1px solid #31415d;background:#0b1525;color:#fff}#nexaroAuthGate button{width:100%;margin-top:8px;padding:13px;border:0;border-radius:10px;font-weight:700;cursor:pointer;background:#fff;color:#08111f}#nexaroAuthGate small{display:block;margin-top:12px;color:#ffb4b4;min-height:18px}`;
    document.head.appendChild(style);

    const box = document.createElement('div');
    box.id = 'nexaroAuthGate';
    box.innerHTML = `<div class="nx-auth-card"><h2>neXaro CRM Login</h2><p>Interner Zugriff für Vertrieb und Administration.</p><input id="nxAuthEmail" type="email" autocomplete="username" placeholder="E-Mail"><input id="nxAuthPassword" type="password" autocomplete="current-password" placeholder="Passwort"><button id="nxAuthLogin">Anmelden</button><small id="nxAuthMessage"></small></div>`;
    document.body.appendChild(box);

    const login = document.getElementById('nxAuthLogin');
    box.addEventListener('keydown', e => { if (e.key === 'Enter' && !login.disabled) login.click(); });
    login.onclick = async () => {
      const msg = document.getElementById('nxAuthMessage');
      const email = document.getElementById('nxAuthEmail').value.trim();
      const password = document.getElementById('nxAuthPassword').value;
      if (!email || !password) { msg.textContent = 'Bitte E-Mail und Passwort eingeben.'; return; }
      login.disabled = true;
      msg.textContent = 'Anmeldung läuft …';
      try {
        await window.nexaroAuth.login(email, password);
        const result = await window.nexaroCRM.startSecureMode();
        if (!result.ok) throw new Error(result.reason || 'Anmeldung fehlgeschlagen');
        box.remove();
      } catch (error) {
        msg.textContent = error?.message || 'Anmeldung fehlgeschlagen.';
        login.disabled = false;
      }
    };
  }

  // Scripts are loaded at the end of index.html, so the DOM already exists.
  window.nexaroCRM.showLogin = ensureAuthGate;
  ensureAuthGate();
  const logout = document.createElement('button');
  logout.textContent = 'Abmelden';
  logout.type = 'button';
  logout.onclick = () => window.nexaroAuth.logout();
  document.getElementById('nav')?.appendChild(logout);
  const restore = async () => {
    try {
      const result = await window.nexaroCRM.startSecureMode();
      if (result.ok) document.getElementById('nexaroAuthGate')?.remove();
    } catch {
      window.nexaroCRM.hideApp();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore, {once:true});
  else restore();
})();
