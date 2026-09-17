const SUPABASE_CONFIG = {
  url: 'https://hbuqzdmjqvgybwohfnqy.supabase.co',
  key: 'sb_publishable_zoRbvS06zi6X4_shxXQkMg_O7h0Go6r'
};

async function createLead(payload){
  const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/public_leads`, {
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':SUPABASE_CONFIG.key,'Authorization':`Bearer ${SUPABASE_CONFIG.key}`,'Prefer':'return=minimal'},
    body:JSON.stringify(payload)
  });
  if(!response.ok) throw new Error(await response.text());
}

const interestType=document.getElementById('interestType');
const updateFields=()=>{
  document.getElementById('sumupFields').hidden=interestType.value!=='SumUp';
  document.getElementById('vapeFields').hidden=interestType.value!=='Vapes';
};
interestType?.addEventListener('change',updateFields);
updateFields();

document.getElementById('leadForm')?.addEventListener('submit',async function(e){
 e.preventDefault();
 const data=Object.fromEntries(new FormData(this).entries());
 const lead={
  source:'QR-Code Flyer',status:'neu',
  first_name:data.first_name||'',last_name:data.last_name||'',company:data.company||'',position:data.position||'',
  email:data.email||'',phone:data.phone||'',city:data.city||'',industry:data.industry||'',
  interest:[data.interest_type].filter(Boolean),
  requirement:data.sumup_goal||data.vape_goal||'',
  message:data.message||'',
  sumup_provider:data.sumup_provider||'',sumup_volume:data.sumup_volume||'',sumup_transactions:data.sumup_transactions||'',
  vape_supplier:data.vape_supplier||'',vape_quantity:data.vape_quantity||'',vape_products:data.vape_products||'',
  consent:data.consent==='on'
 };
 const result=document.getElementById('result');
 try{
  if(!lead.consent) throw new Error('consent');
  await createLead(lead);
  result.textContent='Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich.';
  this.reset(); updateFields();
 }catch(err){result.textContent='Die Anfrage konnte nicht gespeichert werden. Bitte erneut versuchen.';console.error(err)}
});