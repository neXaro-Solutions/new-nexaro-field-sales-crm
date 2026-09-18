// Supabase Auth: validate stored sessions with the server before unlocking the CRM.
(() => {
  const CONFIG = {url: window.NEXARO_SUPABASE_URL || '', key: window.NEXARO_SUPABASE_KEY || ''};
  const STORAGE = 'nexaro-supabase-session';
  const LEGACY = 'nexaro-supabase-access-token';
  let restoring = null;
  const request = (path, options = {}) => fetch(`${CONFIG.url}/auth/v1/${path}`, {
    ...options, signal: AbortSignal.timeout(15000),
    headers: {apikey: CONFIG.key, 'Content-Type': 'application/json', ...options.headers}
  });
  function persist(session) {
    localStorage.setItem(STORAGE, JSON.stringify(session));
    localStorage.removeItem(LEGACY);
    window.nexaroAuth.session = session;
  }
  const auth = window.nexaroAuth = {
    session: null,
    async login(email, password) {
      if (!CONFIG.url || !CONFIG.key) throw new Error('Supabase Konfiguration fehlt');
      const response = await request('token?grant_type=password', {method:'POST', body:JSON.stringify({email,password})});
      if (!response.ok) throw new Error('Login fehlgeschlagen');
      const data = await response.json();
      if (!data.access_token || !data.user?.id) throw new Error('Ungültige Sitzung');
      persist(data);
      return data;
    },
    restore() {
      if (restoring) return restoring;
      restoring = (async () => {
        this.session = null;
        if (!CONFIG.url || !CONFIG.key) return {ok:false, reason:'config-missing'};
        let stored;
        try {
          stored = JSON.parse(localStorage.getItem(STORAGE) || 'null');
          if (!stored) stored = {access_token:localStorage.getItem(LEGACY)};
        } catch { this.clear(); return {ok:false, reason:'invalid-session'}; }
        if (!stored?.access_token) return {ok:false, reason:'no-session'};
        try {
          let response = await request('user', {headers:{Authorization:`Bearer ${stored.access_token}`}});
          if (response.status === 401 && stored.refresh_token) {
            const refresh = await request('token?grant_type=refresh_token', {method:'POST',body:JSON.stringify({refresh_token:stored.refresh_token})});
            if (!refresh.ok) {
              if ([400,401,403].includes(refresh.status)) this.clear();
              return {ok:false,reason:'session-refresh-failed'};
            }
            stored = await refresh.json();
            if (!stored.access_token) { this.clear(); return {ok:false,reason:'invalid-session'}; }
            // Persist rotated refresh tokens even if the following validation loses the network.
            localStorage.setItem(STORAGE, JSON.stringify(stored));
            response = await request('user', {headers:{Authorization:`Bearer ${stored.access_token}`}});
          }
          if (!response.ok) {
            if ([401,403].includes(response.status)) this.clear();
            return {ok:false,reason:'session-validation-failed'};
          }
          const user = await response.json();
          if (!user.id) { this.clear(); return {ok:false,reason:'invalid-session'}; }
          persist({...stored,user});
          return {ok:true};
        } catch { return {ok:false,reason:'session-unavailable'}; }
      })().finally(() => { restoring = null; });
      return restoring;
    },
    clear() {
      localStorage.removeItem(STORAGE);
      localStorage.removeItem(LEGACY);
      this.session = null;
    },
    async logout() {
      const token = this.session?.access_token;
      this.clear();
      window.nexaroCRM?.hideApp();
      window.nexaroCRM?.showLogin?.();
      if (token) {
        try { await request('logout', {method:'POST',headers:{Authorization:`Bearer ${token}`}}); }
        catch { /* Local logout remains effective when the network is unavailable. */ }
      }
    },
    get headers() {
      return this.session?.access_token ? {Authorization:`Bearer ${this.session.access_token}`,apikey:CONFIG.key} : {apikey:CONFIG.key};
    }
  };
})();
