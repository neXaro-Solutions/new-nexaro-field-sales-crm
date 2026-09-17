// neXaro Solutions · Supabase Auth bootstrap
// Creates a protected session for internal CRM access.
(() => {
  const CONFIG = { url: window.NEXARO_SUPABASE_URL || '', key: window.NEXARO_SUPABASE_KEY || '' };
  window.nexaroAuth = {
    session: null,
    async restore() {
      if (!CONFIG.url || !CONFIG.key) return {ok:false, reason:'config-missing'};
      const token = localStorage.getItem('nexaro-supabase-access-token');
      if (!token) return {ok:false, reason:'no-session'};
      this.session = {access_token: token};
      return {ok:true};
    },
    async logout() {
      localStorage.removeItem('nexaro-supabase-access-token');
      this.session = null;
    },
    get headers() {
      return this.session?.access_token ? {Authorization:`Bearer ${this.session.access_token}`, apikey:CONFIG.key} : {apikey:CONFIG.key};
    }
  };
  window.addEventListener('load', () => window.nexaroAuth.restore());
})();
