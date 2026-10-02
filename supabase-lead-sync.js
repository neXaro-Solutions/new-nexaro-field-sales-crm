// neXaro Solutions · Supabase → local CRM lead sync
// CRM sync requires an authenticated Supabase session. Never use a service-role key in browser code.
(() => {
  const CONFIG = { url: window.NEXARO_SUPABASE_URL || '', key: window.NEXARO_SUPABASE_KEY || '' };
  const normEmail = v => String(v || '').trim().toLowerCase();
  const normPhone = v => String(v || '').replace(/[^0-9+]/g, '');
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

  function mapDailyCallLeadToCrmLead(p) {
    return {
      id: `call-${p.id}`,
      dailyCallLeadId: p.id,
      company: p.company || '',
      contact: '',
      phone: p.phone || '',
      email: p.email || '',
      website: p.website || '',
      industry: p.industry || 'Gewerbe',
      city: p.city || '',
      address: p.address || p.city || '',
      lat: p.lat ?? null,
      lon: p.lng ?? null,
      source: p.source || 'neXaro Telefonlead',
      status: p.status || 'neu',
      priority: 'Hoch',
      interest: ['sumup'],
      product: 'SumUp',
      need: 'Telefonische Erstansprache',
      notes: p.notes || 'Öffentliche Unternehmensdaten. Vor dem Anruf sachlichen B2B-Bezug prüfen. E-Mail erst nach dokumentierter Freigabe senden.',
      callBatchDate: p.batch_date || '',
      createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.created_at || new Date().toISOString()
    };
  }

  function findExisting(mapped, remoteIdKey) {
    return S.leads.find(l =>
      (mapped[remoteIdKey] && l[remoteIdKey] === mapped[remoteIdKey]) ||
      (normPhone(mapped.phone) && normPhone(l.phone) === normPhone(mapped.phone) && normCompany(l.company) === normCompany(mapped.company)) ||
      (normEmail(mapped.email) && normEmail(l.email) === normEmail(mapped.email) && normCompany(l.company) === normCompany(mapped.company))
    );
  }

  async function fetchRows(path) {
    const response = await fetch(`${CONFIG.url}/rest/v1/${path}`, {
      headers: {...window.nexaroAuth.headers, Accept:'application/json'}
    });
    if (!response.ok) throw new Error(`Supabase Lead-Sync fehlgeschlagen (${response.status})`);
    return response.json();
  }

  async function syncPublicLeads({silent = false} = {}) {
    if (!CONFIG.url || !CONFIG.key) return {ok:false, skipped:true, imported:0, reason:'config-missing'};
    if (!window.nexaroAuth?.session?.access_token) return {ok:false, skipped:true, imported:0, reason:'not-authenticated'};
    if (typeof S === 'undefined') return {ok:false, skipped:true, imported:0, reason:'crm-not-ready'};

    const [publicRows, callRows] = await Promise.all([
      fetchRows('public_leads?select=*&order=created_at.desc&limit=200'),
      fetchRows('nx_daily_call_leads?select=*&order=batch_date.desc,created_at.desc&limit=100')
    ]);

    let imported = 0;
    for (const p of publicRows) {
      const mapped = mapPublicLeadToCrmLead(p);
      const existing = findExisting(mapped, 'publicLeadId');
      if (existing) { Object.assign(existing, mapped); continue; }
      S.leads.unshift(mapped); imported++;
    }

    for (const p of callRows) {
      const mapped = mapDailyCallLeadToCrmLead(p);
      const existing = findExisting(mapped, 'dailyCallLeadId');
      if (existing) {
        // Preserve locally advanced pipeline status; refresh contact/source data only.
        const localStatus = existing.status;
        Object.assign(existing, mapped);
        if (localStatus && localStatus !== 'neu') existing.status = localStatus;
        continue;
      }
      S.leads.unshift(mapped); imported++;
    }

    if (imported) {
      if (typeof save === 'function') save();
      if (typeof render === 'function') render();
      if (!silent && typeof toast === 'function') toast(`${imported} neue Leads importiert`);
    }
    return {ok:true, skipped:false, imported, publicTotal:publicRows.length, dailyCallTotal:callRows.length};
  }

  window.nexaroLeadSync = {mapPublicLeadToCrmLead, mapDailyCallLeadToCrmLead, syncPublicLeads, sync:syncPublicLeads};
})();
