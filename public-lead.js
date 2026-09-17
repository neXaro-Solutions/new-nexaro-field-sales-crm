// Public QR lead form handler
// Supabase connection will be added after public_leads table and RLS are deployed.

document.getElementById('leadForm').addEventListener('submit', function(e){
 e.preventDefault();
 const data = Object.fromEntries(new FormData(this).entries());
 data.source='QR-Code Flyer';
 data.status='neu';
 document.getElementById('result').textContent='Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich.';
 console.log('Lead prepared', data);
});
