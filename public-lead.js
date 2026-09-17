// neXaro public QR lead form
// Public endpoint: creates leads only. No CRM data access.
// The publishable/anon key is safe for public use; RLS is the security boundary.
const SUPABASE_CONFIG = {
  url: 'https://hbuqzdmjqvgybwohfnqy.supabase.co',
  key: 'sb_publishable_zoRbvS06zi6X4_shxXQkMg_O7h0Go6r'
};

async function createLead(payload){
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
  if(!response.ok){
    const detail = await response.text().catch(()=> '');
    throw new Error(`Lead konnte nicht gespeichert werden (${response.status}) ${detail}`);
  }
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
    interest:data.interest ? String(data.interest).split(',').map(x=>x.trim()).filter(Boolean) : [],
    requirement:data.requirement || '',
    message:data.message || '',
    consent:data.consent === 'on' || data.consent === 'true' || data.consent === true
  };

  const result = document.getElementById('result');
  try {
    if(!lead.consent) throw new Error('Einwilligung fehlt');
    await createLead(lead);
    if(result) result.textContent='Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich.';
    this.reset();
  } catch(error){
    if(result) result.textContent='Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es erneut.';
    console.error(error);
  }
});
