// neXaro Solutions · Supabase → local CRM lead sync
// CRM sync requires an authenticated Supabase session. Never use a service-role key in browser code.
(() => {
  const CONFIG = { url: window.NEXARO_SUPABASE_URL || '', key: window.NEXARO_SUPABASE_KEY || '' };
  const normEmail = v => String(v || '').trim().toLowerCase();
  const normCompany = v => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');

  function mapPublicLeadToCrmLead(p) {
    return {
      id: `qr-${p.id}`,
      publicLeadId: p.id,
      company: p.company || '',
      contact: [p.first_name, p.last_name].filter(Boolean).join(' '),
      phone: p.phone || '',
      email: p.email || '',
      industry: p.industry || '',
      city: p.city || '',
      address: p.city || '',
      source: p.source || 'QR-Code Flyer',
      status: p.status || 'neu',
      module: (p.interest || []).some(v => /vape/i.test(v)) && !(p.interest || []).some(v => /sumup/i.test(v)) ? 'vape' : 'sumup',
      provider: p.sumup_provider || '',
      tpv: Number(String(p.sumup_volume || '').replace(/\s|€/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')) || 0,
      priority: 'Hoch',
      interest: Array.isArray(p.interest) ? p.interest : [],
      need: p.requirement || '',
      notes: p.message || '',
      sumup_provider: p.sumup_provider || '',
      sumup_volume: p.sumup_volume || '',
      sumup_transactions: p.sumup_transactions || '',
      sumup_goal: p.sumup_goal || '',
      vape_supplier: p.vape_supplier || '',
      vape_quantity: p.vape_quantity || '',
      vape_products: p.vape_products || '',
      vape_goal: p.vape_goal || '',
      createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.created_at || new Date().toISOString()
    };
  }

  async function syncPublicLeads({silent = false} = {}) {
    if (!CONFIG.url || !CONFIG.key) return {ok:false, skipped:true, imported:0, reason:'config-missing'};
    if (!window.nexaroAuth?.session?.access_token) return {ok:false, skipped:true, imported:0, reason:'not-authenticated'};
    if (typeof S === 'undefined') return {ok:false, skipped:true, imported:0, reason:'crm-not-ready'};

    const response = await fetch(`${CONFIG.url}/rest/v1/public_leads?select=*&order=created_at.desc&limit=200`, {
      headers: {...window.nexaroAuth.headers, Accept:'application/json'}
    });
    if (!response.ok) throw new Error(`Supabase Lead-Sync fehlgeschlagen (${response.status})`);
    const remote = await response.json();
    let imported = 0;
    let linked = 0;

    for (const p of remote) {
      const mapped = mapPublicLeadToCrmLead(p);
      const existing = S.leads.find(l => l.publicLeadId === p.id || (normEmail(l.email) && normEmail(l.email) === normEmail(mapped.email) && normCompany(l.company) === normCompany(mapped.company)));
      if (existing) {
        // Intake is an import, not a source of truth for local sales work.
        if (!existing.publicLeadId) { existing.publicLeadId = p.id; linked++; }
        continue;
      }
      S.leads.unshift(mapped);
      if (typeof ensureCustomerForLead === 'function') ensureCustomerForLead(mapped.id);
      imported++;
    }

    if (imported || linked) {
      if (typeof save === 'function') save();
      if (typeof render === 'function') render();
      if (imported && !silent && typeof toast === 'function') toast(`${imported} neue QR-Leads importiert`);
    }
    return {ok:true, skipped:false, imported, linked, total:remote.length};
  }

  window.nexaroLeadSync = {mapPublicLeadToCrmLead, syncPublicLeads, sync:syncPublicLeads};
})();
