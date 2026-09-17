// neXaro Solutions · Supabase Auth for internal CRM users
// Internal access only. Never use service-role keys in browser code.
(() => {
  const CONFIG = { url: window.NEXARO_SUPABASE_URL || '', key: window.NEXARO_SUPABASE_KEY || '' };
  const STORAGE = 'nexaro-supabase-access-token';

  window.nexaroAuth = {
    session: null,

    async login(email, password) {
      if (!CONFIG.url || !CONFIG.key) throw new Error('Supabase Konfiguration fehlt');

      const res = await fetch(`${CONFIG.url}/auth/v1/token?grant_type=password`, {
        method:'POST',
        headers:{apikey:CONFIG.key,'Content-Type':'application/json'},
        body:JSON.stringify({email,password})
      });

      if (!res.ok) throw new Error('Login fehlgeschlagen');
      const data = await res.json();
      localStorage.setItem(STORAGE, data.access_token);
      this.session = data;
      return data;
    },

    async restore() {
      const token = localStorage.getItem(STORAGE);
      if (!token) return {ok:false, reason:'no-session'};
      this.session = {access_token:token};
      return {ok:true};
    },

    logout() {
      localStorage.removeItem(STORAGE);
      this.session = null;
    },

    get headers() {
      return this.session?.access_token
        ? {Authorization:`Bearer ${this.session.access_token}`, apikey:CONFIG.key}
        : {apikey:CONFIG.key};
    }
  };

  window.addEventListener('load', () => window.nexaroAuth.restore());
})();
