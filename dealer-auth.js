(() => {
  // The internal CRM must remain accessible. The dealer login is only activated
  // explicitly for the protected dealer portal via ?dealer=1.
  const dealerPortal = new URLSearchParams(location.search).get('dealer') === '1';
  if (!dealerPortal) {
    const showDashboard = () => {
      document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
      document.querySelector('#dashboard')?.classList.add('active');
      document.querySelectorAll('#nav button').forEach(x => x.classList.toggle('active', x.dataset.screen === 'dashboard'));
      window.scrollTo(0, 0);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showDashboard, {once:true});
    else showDashboard();
    return;
  }

  const SUPABASE_URL = 'https://hbuqzdmjqvgybwohfnqy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_zoRbvS06zi6X4_shxXQkMg_O7h0Go6r';
  const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

  const style = document.createElement('style');
  style.textContent = `
    #dealerAuthGate{position:fixed;inset:0;z-index:99999;background:#08111f;display:none;align-items:center;justify-content:center;padding:20px}
    #dealerAuthGate .box{width:min(440px,100%);background:#101b2d;border:1px solid #2a3d59;border-radius:20px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.45)}
    #dealerAuthGate h2{margin:0 0 8px;color:#fff}.dealer-auth-muted{color:#9fb0c8;font-size:14px;line-height:1.5;margin-bottom:20px}
    #dealerAuthGate label{display:block;color:#dce6f5;font-weight:700;font-size:13px;margin:14px 0 7px}
    #dealerAuthGate input{width:100%;box-sizing:border-box;background:#0b1525;border:1px solid #344967;border-radius:10px;padding:12px;color:#fff;font-size:16px}
    #dealerAuthGate button{width:100%;margin-top:18px;border:0;border-radius:10px;padding:13px;background:#ff7a22;color:#08111f;font-weight:800;font-size:16px;cursor:pointer}
    #dealerAuthMessage{margin-top:14px;color:#ffb4a2;font-size:14px;min-height:20px}
    #dealerAuthUser{position:fixed;right:16px;top:16px;z-index:9998;display:none;background:#101b2d;border:1px solid #2a3d59;border-radius:12px;padding:8px 10px;color:#dce6f5;font-size:12px}
    #dealerAuthUser button{margin-left:8px;border:0;background:transparent;color:#ffb47f;cursor:pointer;font-weight:700}
  `;
  document.head.appendChild(style);

  const gate = document.createElement('div');
  gate.id = 'dealerAuthGate';
  gate.innerHTML = `<div class="box"><div class="eyebrow">VAPE · B2B</div><h2>Händler-Login</h2><div class="dealer-auth-muted">Nur freigeschaltete Händler erhalten Zugriff auf den geschützten B2B-Bereich.</div><label>E-Mail</label><input id="dealerAuthEmail" type="email" autocomplete="username" placeholder="händler@firma.de"><label>Passwort</label><input id="dealerAuthPassword" type="password" autocomplete="current-password" placeholder="••••••••"><button id="dealerAuthLogin">Einloggen</button><div id="dealerAuthMessage"></div></div>`;
  document.body.appendChild(gate);

  const userBar = document.createElement('div');
  userBar.id = 'dealerAuthUser';
  document.body.appendChild(userBar);

  const load = async () => {
    const { createClient } = await import(CDN);
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const msg = text => { document.getElementById('dealerAuthMessage').textContent = text || ''; };
    const setGate = show => { gate.style.display = show ? 'flex' : 'none'; document.body.style.overflow = show ? 'hidden' : ''; };

    const checkDealer = async user => {
      if (!user) return { ok:false, reason:'Bitte anmelden.' };
      const { data, error } = await supabase.from('dealers').select('id,company_name,login_email,dealer_code,margin_percent,status').eq('auth_user_id', user.id).maybeSingle();
      if (error) return { ok:false, reason:'Händlerkonto konnte nicht geprüft werden.' };
      if (!data) return { ok:false, reason:'Für diesen Benutzer ist noch kein Händlerkonto hinterlegt.' };
      if (data.status !== 'freigeschaltet') return { ok:false, reason:'Dein Händlerzugang ist noch nicht freigeschaltet.' };
      return { ok:true, dealer:data };
    };

    const applySession = async session => {
      const result = await checkDealer(session?.user);
      if (!result.ok) {
        if (session?.user) await supabase.auth.signOut();
        setGate(true); msg(result.reason); userBar.style.display='none';
        return;
      }
      window.neXaroDealer = result.dealer;
      setGate(false);
      userBar.innerHTML = `${result.dealer.company_name} · ${result.dealer.margin_percent}% <button id="dealerLogout">Abmelden</button>`;
      userBar.style.display='block';
      document.getElementById('dealerLogout').onclick = async () => { await supabase.auth.signOut(); };
      document.documentElement.dataset.dealerAuth='true';
    };

    document.getElementById('dealerAuthLogin').onclick = async () => {
      msg('');
      const email = document.getElementById('dealerAuthEmail').value.trim();
      const password = document.getElementById('dealerAuthPassword').value;
      if (!email || !password) return msg('Bitte E-Mail und Passwort eingeben.');
      const btn = document.getElementById('dealerAuthLogin'); btn.disabled=true; btn.textContent='Anmeldung…';
      const { data, error } = await supabase.auth.signInWithPassword({email,password});
      btn.disabled=false; btn.textContent='Einloggen';
      if (error) return msg('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');
      await applySession(data.session);
    };

    const { data } = await supabase.auth.getSession();
    await applySession(data.session);
    supabase.auth.onAuthStateChange((_event, session) => { applySession(session); });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, {once:true}); else load();
})();
