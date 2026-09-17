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
    status: lead.status || 'neu',
    created_at: lead.created_at
  };
}

function leadPriority(lead){
  let score = 0;
  if(lead.company) score += 2;
  if(lead.phone) score += 2;
  if(lead.email) score += 1;
  if(lead.message) score += 2;
  if(Array.isArray(lead.interest) && lead.interest.length) score += 2;

  return score >= 7 ? 'A' : score >= 4 ? 'B' : 'C';
}

window.nexaroLeadInbox = {
  normalizePublicLead,
  leadPriority
};
