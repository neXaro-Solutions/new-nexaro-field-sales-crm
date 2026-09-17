// neXaro public QR lead form
// Public endpoint: creates leads only. No CRM data access.
// Supabase URL and publishable key will be injected via secure configuration.

const SUPABASE_CONFIG = {
  url: window.NEXARO_SUPABASE_URL || '',
  key: window.NEXARO_SUPABASE_KEY || ''
};

async function createLead(payload){
  if(!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key){
    console.warn('Supabase config missing - lead stored as prepared payload', payload);
    return false;
  }

  const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/public_leads`, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'apikey': SUPABASE_CONFIG.key,
      'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
      'Prefer':'return=minimal'
    },
    body: JSON.stringify(payload)
  });

  if(!response.ok) throw new Error('Lead konnte nicht gespeichert werden');
  return true;
}

document.getElementById('leadForm')?.addEventListener('submit', async function(e){
  e.preventDefault();

  const data = Object.fromEntries(new FormData(this).entries());

  const lead = {
    source:'QR-Code Flyer',
    status:'neu',
    first_name:data.first_name || '',
    last_name:data.last_name || '',
    company:data.company || '',
    position:data.position || '',
    email:data.email || '',
    phone:data.phone || '',
    industry:data.industry || '',
    city:data.city || '',
    requirement:data.requirement || '',
    message:data.message || '',
    consent:true
  };

  try {
    await createLead(lead);
    document.getElementById('result').textContent='Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich.';
    this.reset();
  } catch(error){
    document.getElementById('result').textContent='Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.';
    console.error(error);
  }
});
