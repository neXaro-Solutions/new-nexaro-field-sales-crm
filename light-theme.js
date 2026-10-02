// neXaro Solutions · lead sync bootstrap
// Loaded by the existing CRM enhancement loader.
(() => {
  const load = () => {
    if (window.nexaroLeadSync?.syncPublicLeads) {
      window.nexaroLeadSync.syncPublicLeads({silent:true}).catch(console.warn);
      return;
    }
    if (document.querySelector('script[data-nx="./supabase-lead-sync.js?v=2"]')) return;
    const s = document.createElement('script');
    s.src = './supabase-lead-sync.js?v=2';
    s.dataset.nx = './supabase-lead-sync.js?v=2';
    s.onload = () => window.nexaroLeadSync?.syncPublicLeads?.({silent:true}).catch(console.warn);
    document.head.appendChild(s);
  };
  load();
})();
