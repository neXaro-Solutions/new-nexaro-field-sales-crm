const SUPABASE_CONFIG = {url:window.NEXARO_SUPABASE_URL || '',key:window.NEXARO_SUPABASE_KEY || ''};

async function createLead(payload){
  const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/public_leads`, {
    method:'POST',
    signal:AbortSignal.timeout(15000),
    headers:{'Content-Type':'application/json','apikey':SUPABASE_CONFIG.key,'Prefer':'return=minimal'},
    body:JSON.stringify(payload)
  });
  if(!response.ok) throw new Error(await response.text());
}

const interestType=document.getElementById('interestType');
const updateFields=()=>{
  document.getElementById('sumupFields').hidden=interestType.value!=='SumUp';
  document.getElementById('vapeFields').hidden=interestType.value!=='Vapes';
  for (const id of ['sumupFields','vapeFields']) {
    const section=document.getElementById(id);
    section.querySelectorAll('input,textarea,select').forEach(field=>{field.disabled=section.hidden;});
  }
};
interestType?.addEventListener('change',updateFields);
updateFields();

document.getElementById('leadForm')?.addEventListener('submit',async function(e){
 e.preventDefault();
 if(this.dataset.submitting==='true')return;
 if(!this.reportValidity())return;
 const data=Object.fromEntries(new FormData(this).entries());
 const lead={
  source:'QR-Code Flyer',status:'neu',
  first_name:data.first_name||'',last_name:data.last_name||'',company:data.company||'',position:data.position||'',
  email:data.email||'',phone:data.phone||'',city:data.city||'',industry:data.industry||'',
  interest:[data.interest_type].filter(Boolean),
  requirement:data.sumup_goal||data.vape_goal||'',
  message:data.message||'',
  sumup_provider:data.sumup_provider||'',sumup_volume:data.sumup_volume||'',sumup_transactions:data.sumup_transactions||'',
  sumup_goal:data.sumup_goal||'',vape_goal:data.vape_goal||'',
  vape_supplier:data.vape_supplier||'',vape_quantity:data.vape_quantity||'',vape_products:data.vape_products||'',
  consent:data.consent==='on'
 };
 const result=document.getElementById('result');
 const button=this.querySelector('button[type="submit"]');
 this.dataset.submitting='true';button.disabled=true;
 try{
  if(!lead.consent) throw new Error('consent');
  await createLead(lead);
  result.textContent='Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich.';
  this.reset(); updateFields();
 }catch(err){result.textContent='Die Anfrage konnte nicht gespeichert werden. Bitte erneut versuchen.';console.error('Lead-Anfrage fehlgeschlagen');}
 finally{this.dataset.submitting='false';button.disabled=false;}
});