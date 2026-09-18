// neXaro Solutions · CRM secure bootstrap
(() => {
  window.nexaroCRM = window.nexaroCRM || {};

  const hideApp = () => {
    const app = document.getElementById('app');
    const nav = document.getElementById('nav');
    if (app) app.style.display = 'none';
    if (nav) nav.style.display = 'none';
  };

  const showApp = () => {
    const app = document.getElementById('app');
    const nav = document.getElementById('nav');
    if (app) app.style.display = '';
    if (nav) nav.style.display = '';
  };

  window.nexaroCRM.startSecureMode = async function () {
    hideApp();
    if (!window.nexaroAuth) return { ok:false, reason:'auth-module-missing' };
    const session = await window.nexaroAuth.restore();
    if (!session.ok) return session;

    showApp();
    if (window.nexaroLeadSync?.sync) {
      try {
        await window.nexaroLeadSync.sync({ silent:false });
      } catch {
        if (typeof toast === 'function') toast('Angemeldet · Lead-Abgleich fehlgeschlagen. Bitte später erneut versuchen.');
        return {ok:true, syncFailed:true};
      }
    }
    return { ok:true };
  };

  window.nexaroCRM.showApp = showApp;
  window.nexaroCRM.hideApp = hideApp;

  // The scripts are loaded immediately before app.js. Keep the CRM hidden
  // until an authenticated Supabase session has been restored.
  hideApp();
})();
