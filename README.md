# neXaro Field Sales CRM V3.0

Mobile-first PWA für den B2B-Außendienst mit getrennten SUMUP- und VAPE-Modulen und zentralem Kundenstamm.

## V3.0 – Kundenakte
- Ein zentraler Kunde für SUMUP und VAPE.
- Automatische Verknüpfung bestehender und neuer SUMUP-Leads.
- Kunden können manuell angelegt und bearbeitet werden.
- Kundenakte mit Stammdaten, SUMUP, VAPE, Besuchen, Aufgaben, Terminen und Dokumenten.
- Aktivitäts-Timeline über die wichtigsten Kundenaktivitäten.
- Besuchshistorie wird separat gespeichert.
- Aufgaben/Wiedervorlagen können direkt einem Kunden zugeordnet werden.
- Schnellaktionen aus der Kundenakte: Aufgabe, SUMUP-Angebot, VAPE-Angebot, Rechnung.
- Bestehende lokale CRM-Daten bleiben erhalten; Migration arbeitet additiv.

## SUMUP
Leads, Qualifizierung, Besuche, Follow-ups, Tarifvergleich und Angebote. Keine Rechnungsfunktion im SUMUP-Modul.

## VAPE
VAPE-Katalog, Warenkorb, Angebote und Rechnungen.

### Öffentlicher VAPE-Katalog
Der Katalog enthält nur die gewünschten Gruppen: ELFA-Liquid (ELFLIQ), Einwegzigaretten, Prefilled Pods und Akkuträger. Beim Start und beim CSV-Import werden andere Artikel ausgefiltert.

### Interne L3/EK-Daten
L3-Einkaufspreise sind **nicht Bestandteil des öffentlichen GitHub-Codes**. Eine private L3-JSON-Datei kann lokal importiert werden. Der Aufschlag auf EK ist im VAPE-Modul einstellbar (15–25 %).

### Briefpapier
Angebote und VAPE-Rechnungen verwenden das neXaro-Briefpapier-Layout. Die Bankverbindung wird bewusst nicht im öffentlichen GitHub-Code hinterlegt.

## GitHub Pages
Repository → Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Daten
CRM-Daten werden lokal im Browser gespeichert. Regelmäßig über die Backup-Funktion sichern.
