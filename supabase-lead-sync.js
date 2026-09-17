// neXaro Solutions · Supabase → local CRM lead sync
// CRM sync requires an authenticated Supabase session. Never use a service-role key in browser code.
(() => {
  const CONFIG = { url: window.NEXARO_SUPABASE_URL || '', key: window.NEXARO_SUPABASE_KEY || '' };
  const normEmail = v => String(v || '').trim().toLowerCase();
  const normCompany = v => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');

  function mapPublicLeadToCrmLead(p) {
    return {
      id: `qr-${p.id}`, publicLeadId: p.id, company: p.company || '',
      contact: [p.first_name, p.last_name].filter(Boolean).join(' '),
      phone: p.phone || '', email: p.email || '', industry: p.industry || '',
      city: p.city || '', address: p.city || '', source: p.source || 'QR-Code Flyer',
      status: p.status || 'neu', priority: 'Hoch',
      interest: Array.isArray(p.interest) ? p.interest : [], need: p.requirement || '',
      notes: p.message || '', createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.created_at || new Date().toISOString()
    };
  }

  async function syncPublicLeads({silent = false} = {}) {
    if (!CONFIG.url || !CONFIG.key) {
      if (!silent) console.info('QR-Lead-Sync: Supabase-Konfiguration fehlt.');
      return {ok:false, skipped:true, imported:0, reason:'config-missing'};
    }
    if (!window.nexaroAuth?.session?.access_token) {
      return {ok:false, skipped:true, imported:0, reason:'not-authenticated'};
    }
    if (typeof S === 'undefined') return {ok:false, skipped:true, imported:0, reason:'crm-not-ready'};

    const response = await fetch(`${CONFIG.url}/rest/v1/public_leads?select=*&order=created_at.desc&limit=200`, {
      headers: {
        ...window.nexaroAuth.headers,
        Accept: 'application/json'
      }
    });
    if (!response.ok) throw new Error(`Supabase Lead-Sync fehlgeschlagen (${response.status})`);
    const remote = await response.json();
    let imported = 0;

    for (const p of remote) {
      const mapped = mapPublicLeadToCrmLead(p);
      const existing = S.leads.find(l =>
        l.publicLeadId === p.id ||
        (normEmail(l.email) && normEmail(l.email) === normEmail(mapped.email) && normCompany(l.company) === normCompany(mapped.company))
      );
      if (existing) {
        existing.publicLeadId = p.id;
        existing.source = existing.source || mapped.source;
        existing.createdAt = existing.createdAt || mapped.createdAt;
        continue;
      }
      S.leads.unshift(mapped);
      imported++;
    }

    if (imported) {
      if (typeof save === 'function') save();
      if (typeof render === 'function') render();
      if (!silent && typeof toast === 'function') toast(`${imported} neue QR-Leads importiert`);
    }
    return {ok:true, skipped:false, imported, total:remote.length};
  }

  window.nexaroLeadSync = {
    mapPublicLeadToCrmLead,
    syncPublicLeads,
    sync: syncPublicLeads
  };
})();
