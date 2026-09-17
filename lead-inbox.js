// nexaro CRM Lead Inbox
// Public QR leads are loaded here after Supabase sync is connected.

function normalizePublicLead(lead){
  return {
    id: lead.id,
    company: lead.company || '',
    contact: [lead.first_name, lead.last_name].filter(Boolean).join(' '),
    email: lead.email || '',
    phone: lead.phone || '',
    source: lead.source || 'QR-Code Flyer',
    interest: lead.interest || [],
    message: lead.message || '',
    requirement: lead.requirement || '',
    provider: lead.provider || '',
    payment_provider: lead.payment_provider || '',
    payment_volume: lead.payment_volume || '',
    transactions_month: lead.transactions_month || '',
    improvement_goal: lead.improvement_goal || '',
    vape_supplier: lead.vape_supplier || '',
    vape_volume_month: lead.vape_volume_month || '',
    product_interest: lead.product_interest || '',
    status: lead.status || 'neu',
    created_at: lead.created_at
  };
}

function leadPriority(lead){
  let score = 0;
  if(lead.company) score += 2;
  if(lead.phone) score += 2;
  if(lead.email) score += 1;
  if(lead.message || lead.requirement) score += 2;
  if(Array.isArray(lead.interest) && lead.interest.length) score += 2;
  if(lead.payment_volume || lead.vape_volume_month) score += 2;

  return score >= 8 ? 'A' : score >= 5 ? 'B' : 'C';
}

window.nexaroLeadInbox = {
  normalizePublicLead,
  leadPriority
};
