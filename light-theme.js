// neXaro Solutions · lead sync bootstrap + compact phone lead helper
// Loaded by the existing CRM enhancement loader.
(() => {
  const CALL_OPENER = 'Hallo, hier ist Sebastian Pötschke von neXaro Solutions. Ich betreue Unternehmen hier in der Region rund um Kartenzahlung mit SumUp. Ein kurzer Vergleich lohnt sich, weil man sofort sieht, ob sich Kosten oder Abläufe verbessern lassen. Ich schicke Ihnen gern unverbindlich die Infos dazu – welche E-Mail-Adresse darf ich dafür nutzen?';

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

  const enhancePhoneLeadCards = () => {
    if (typeof S === 'undefined' || !Array.isArray(S.leads)) return;
    document.querySelectorAll('#leadList .lead-card').forEach(card => {
      if (card.querySelector('[data-nx-call-opener]')) return;
      const edit = card.querySelector('[data-edit]');
      const id = edit?.dataset?.edit;
      const lead = id && S.leads.find(l => l.id === id);
      if (!lead?.dailyCallLeadId) return;

      const actions = card.querySelector('.lead-actions');
      if (!actions) return;
      const box = document.createElement('div');
      box.dataset.nxCallOpener = '1';
      box.style.cssText = 'margin:12px 0 4px;padding:12px 14px;border:1px solid rgba(255,107,0,.28);border-left:4px solid #ff6b00;border-radius:12px;background:rgba(255,107,0,.06);font-size:13px;line-height:1.45';
      box.innerHTML = '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;color:#a84200;margin-bottom:5px">📞 GESPRÄCHSEINSTIEG</div><div></div>';
      box.lastElementChild.textContent = CALL_OPENER;
      actions.before(box);
    });
  };

  load();
  const observer = new MutationObserver(() => enhancePhoneLeadCards());
  const startObserver = () => {
    const list = document.querySelector('#leadList');
    if (!list) return setTimeout(startObserver, 250);
    observer.observe(list, {childList:true, subtree:true});
    enhancePhoneLeadCards();
  };
  startObserver();
})();
