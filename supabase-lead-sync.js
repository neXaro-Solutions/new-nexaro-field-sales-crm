// nexaro Supabase Lead Sync
// Public QR leads are mapped into the existing CRM lead structure.
// Activation requires Supabase client configuration.

function mapPublicLeadToCrmLead(publicLead){
  return {
    id: crypto?.randomUUID?.() || Date.now().toString(36),
    company: publicLead.company || '',
    contact: [publicLead.first_name, publicLead.last_name].filter(Boolean).join(' '),
    phone: publicLead.phone || '',
    email: publicLead.email || '',
    industry: publicLead.industry || '',
    city: publicLead.city || '',
    source: publicLead.source || 'QR-Code Flyer',
    status: 'neu',
    priority: 'Hoch',
    interest: publicLead.interest || [],
    need: publicLead.requirement || '',
    notes: publicLead.message || '',
    createdAt: publicLead.created_at || new Date().toISOString()
  };
}

window.nexaroLeadSync = { mapPublicLeadToCrmLead };
