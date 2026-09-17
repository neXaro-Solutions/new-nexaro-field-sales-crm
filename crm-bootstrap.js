// neXaro Solutions · CRM bootstrap bridge
// Connects protected sessions with future lead synchronization.
(() => {
  window.nexaroCRM = window.nexaroCRM || {};

  window.nexaroCRM.startSecureMode = async function () {
    if (!window.nexaroAuth) {
      return { ok: false, reason: 'auth-module-missing' };
    }

    const session = await window.nexaroAuth.restore();
    if (!session.ok) {
      return session;
    }

    if (window.nexaroLeadSync?.sync) {
      await window.nexaroLeadSync.sync();
    }

    return { ok: true };
  };
})();
