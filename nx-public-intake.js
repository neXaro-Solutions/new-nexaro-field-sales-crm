"use strict";
const endpoint =
  "https://hbuqzdmjqvgybwohfnqy.supabase.co/functions/v1/nx-public-intake";
const form = document.getElementById("leadForm");
const result = document.getElementById("result");
const button = document.getElementById("submitLead");
const submitLabel=button.textContent.trim();
const offerMode=document.getElementById("offerMode");
const offerDetails=document.getElementById("offerDetails");
const statementFile=document.getElementById("statementFile");
let pendingUpload=null;
function toggleOffer(){
 if(!offerMode)return;
 offerDetails.hidden=!offerMode.checked;
 statementFile.required=offerMode.checked;
 const mode=form.querySelector('[name="request_type"]');
 if(mode)mode.value=offerMode.checked?"sumup_fee_check":"sumup_consultation";
}
offerMode?.addEventListener("change",toggleOffer);
toggleOffer();
async function uploadStatement(challengeData,file){
 const extension=(file?.name?.split(".").pop()||"").toLowerCase();
 const allowed={pdf:"application/pdf",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp"};
 if(!file||!allowed[extension]||file.type!==allowed[extension]||!file.size||file.size>8388608)
  throw Error("Bitte nur PDF, JPG, PNG oder WebP bis 8 MB auswählen.");
 const formData=new FormData();
 formData.append("challenge",JSON.stringify(challengeData));
 formData.append("statement",file,file.name);
 const response=await fetch("https://hbuqzdmjqvgybwohfnqy.supabase.co/functions/v1/nx-public-statement",{
  method:"POST",body:formData,signal:AbortSignal.timeout(45000)
 });
 if(!response.ok)throw Error(response.status===409?"Die Abrechnung wurde bereits übertragen.":"Abrechnung konnte nicht gespeichert werden. Bitte erneut versuchen oder direkt Kontakt aufnehmen.");
}

let challenge = null,
  busy = false,
  receivedAt = 0;
async function loadChallenge() {
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw Error("unavailable");
  challenge = await response.json();
  receivedAt = Date.now();
  return challenge;
}
loadChallenge().catch(() => {
  result.textContent = "Die Verbindung wird beim Absenden erneut geprüft.";
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  busy = true;
  button.disabled = true;
  button.textContent = "Anfrage wird gesendet …";
  result.textContent = "";
  try {
    if(pendingUpload){
      await uploadStatement(pendingUpload,statementFile?.files?.[0]);
      result.textContent="Vielen Dank! Ihre Anfrage und Abrechnung sind sicher eingegangen. Wir melden uns persönlich.";
      form.reset();pendingUpload=null;toggleOffer();challenge=null;
      void loadChallenge().catch(()=>{});
      return;
    }
    if(offerMode?.checked&&(!statementFile?.files?.length||statementFile.files[0].size>8388608)){
      throw Error("Für die Angebotsvorbereitung bitte eine Abrechnung bis 8 MB hochladen. Alternativ die einfache Beratung auswählen.");
    }
    if (!challenge || Date.now() - receivedAt > 3500000) await loadChallenge();
    const wait = Math.max(0, 2200 - (Date.now() - receivedAt));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    const values = Object.fromEntries(new FormData(form).entries());
    const { website, consent, ...fields } = values;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { ...fields, consent: consent === "on" },
        website,
        challenge,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) {
      if (response.status === 429)
        throw Error(
          "Bitte warten Sie einige Minuten vor einer weiteren Anfrage. Sie erreichen uns auch per E-Mail oder Telefon.",
        );
      if (response.status === 400) {
        challenge = null;
        throw Error(
          "Bitte prüfen Sie Ihre Angaben und senden Sie die Anfrage erneut.",
        );
      }
      throw Error(
        "Die Anfrage konnte nicht bestätigt werden. Ihre Eingaben bleiben erhalten. Bitte erneut versuchen oder uns direkt kontaktieren.",
      );
    }
    if(offerMode?.checked){
      pendingUpload=challenge;
      try{
        await uploadStatement(challenge,statementFile.files[0]);
        result.textContent="Vielen Dank! Ihre Anfrage und Abrechnung sind eingegangen. Wir melden uns persönlich.";
        pendingUpload=null;
      }catch(error){
        result.textContent="Ihre Anfrage ist bereits im CRM gespeichert. Die Abrechnung konnte noch nicht übertragen werden. Bitte auf „Datei erneut hochladen“ klicken. "+(error instanceof Error?error.message:"");
        button.textContent="Datei erneut hochladen ↗";
        return;
      }
    }else{
      result.textContent="Vielen Dank! Ihre Beratungsanfrage ist eingegangen. Wir melden uns persönlich bei Ihnen.";
    }
    form.reset();toggleOffer();
    challenge = null;
    void loadChallenge().catch(() => {});
  } catch (error) {
    result.textContent =
      error instanceof Error && error.message !== "unavailable"
        ? error.message
        : "Die Verbindung ist gerade nicht verfügbar. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.";
  } finally {
    busy = false;
    button.disabled = false;
    button.textContent = pendingUpload ? "Datei erneut hochladen ↗" : submitLabel;
  }
});
// The previous CRM service worker used cache-first navigation. Remove only the
// registration whose scope contains this legacy form, so future visits stay fresh.
if ("serviceWorker" in navigator)
  navigator.serviceWorker
    .getRegistration(location.href)
    .then((reg) => reg?.unregister())
    .catch(() => {});
