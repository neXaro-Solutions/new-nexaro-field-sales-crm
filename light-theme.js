// neXaro Solutions · QR lead sync bootstrap
// Loaded by the existing CRM enhancement loader.
(() => {
  const load = () => {
    if (window.nexaroLeadSync?.syncPublicLeads) {
      window.nexaroLeadSync.syncPublicLeads({silent:true}).catch(console.warn);
      return;
    }
    if (document.querySelector('script[data-nx="./supabase-lead-sync.js?v=1"]')) return;
    const s = document.createElement('script');
    s.src = './supabase-lead-sync.js?v=1';
    s.dataset.nx = './supabase-lead-sync.js?v=1';
    document.head.appendChild(s);
  };
  load();
})();
