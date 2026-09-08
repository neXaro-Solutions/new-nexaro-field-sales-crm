# neXaro Field Sales CRM V2.9

Mobile-first PWA für den B2B-Außendienst mit sauber getrennten SUMUP- und VAPE-Modulen.

## SUMUP
Leads, Qualifizierung, Besuche, Follow-ups, Tarifvergleich und Angebote.

## VAPE
25 Startartikel, Produktkatalog, Angebote und Rechnungen.

### Interne L3/EK-Daten
L3-Einkaufspreise sind **nicht Bestandteil des öffentlichen GitHub-Codes**. Der öffentliche Katalog enthält nur die für den Vertrieb benötigten Produkt- und VK-Daten.

Über **Vape → L3-EK Preise → L3 importieren** kann eine private JSON-Datei lokal in den Browser geladen werden. Die Daten werden nur in `localStorage` dieses Browsers gespeichert.

Die öffentliche Version berechnet den VK **nicht** aus dem EK. Der VK ist als öffentlicher Katalogwert hinterlegt. Dadurch wird der EK nicht im JavaScript mitgeliefert.

## GitHub Pages
Repository → Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## PWA
Die veröffentlichte GitHub-Pages-Adresse kann auf dem Smartphone zum Home-Bildschirm hinzugefügt werden.

## Daten
CRM-Daten werden lokal im Browser gespeichert. Regelmäßig über die Backup-Funktion sichern.


## V2.9 Vape-Katalog
- ELFBAR, Einweg und Pods aus Händler-CSV
- L3/EK ausschließlich als private lokale Importdatei
- Aufschlag auf EK einstellbar von 25 % bis 15 %
- VK wird aus privatem L3-EK berechnet
- Öffentliche GitHub-Dateien enthalten keine EK/L3-Werte
- CSV-Import filtert erneut auf die gewünschten Produktgruppen


### V2.9
VAPE-Warenkorb + Kundenabschluss: Artikel hinzufügen, Mengen ändern, Warenkorb + Kundenabschluss leeren und direkt ein Angebot aus dem Warenkorb + Kundenabschluss erzeugen.


### V2.9 Vape-Katalog
Der öffentliche Vape-Katalog enthält nur noch: ELFA-Liquid (ELFLIQ), Einwegzigaretten, Prefilled Pods und Akkuträger. Alle anderen Artikel werden beim Start und beim CSV-Import ausgefiltert.

### V2.9 Briefpapier
Angebote und Vape-Rechnungen verwenden jetzt das Layout des bereitgestellten neXaro-Briefpapiers: Logo und Absenderblock oben rechts, Empfängerbereich, Angebots-/Rechnungsdaten, tabellarische Positionen sowie der dreispaltige Fußbereich. Die Bankverbindung wird bewusst nicht in den öffentlichen GitHub-Code übernommen.


## V2.9 – Zentraler Kundenstamm
- Ein zentraler Kunde für SUMUP und VAPE.
- Leads werden bei der Migration automatisch mit Kundenakten verknüpft.
- Neue Leads können einem bestehenden Kunden zugeordnet werden.
- Kunden können manuell angelegt, bearbeitet und als Kundenakte geöffnet werden.
- Kundenakten zeigen SUMUP-/VAPE-Aktivitäten, Angebote und VAPE-Rechnungen.
- VAPE-Angebote und Rechnungen können einen bestehenden Kunden verwenden oder bei direkter Neuerfassung eine Kundenakte anlegen.
- Bestehende lokale CRM-Daten bleiben erhalten; Migration arbeitet additiv.
