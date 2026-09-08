# neXaro Field Sales CRM V2.0

Mobile-first PWA für den B2B-Außendienst.

## Module

- 🟠 SUMUP: Leads, Qualifizierung, Besuch, Follow-up, Tarifvergleich, Angebote
- 🟣 VAPE: Startkatalog mit 25 bekannten Artikeln, Angebote und Rechnungen
- 👥 gemeinsamer Kunden-/Lead-Stamm
- 🔄 Cross-Selling
- 📊 getrennte Vertriebsbereiche
- 📱 PWA / GitHub Pages

## Vape-Preislogik

- Standardmarge: maximal 18 %
- Formel: `VK = EK / 0,82`
- Individuelle Verkaufspreise können später ergänzt werden.
- L3/EK ist eine interne Information.

## WICHTIG: Öffentliches GitHub-Repository

Diese GitHub-Version enthält **keine L3-Einkaufspreise** und **keine Bankverbindung**. Das ist absichtlich so, weil das Repository öffentlich ist.

Der öffentliche Katalog enthält die bereits aus deiner Preisliste abgeleiteten Verkaufspreise. Deine L3-Preise können in der App über **Vape → L3 importieren** aus einer privaten JSON-Datei geladen werden. Sie werden anschließend nur lokal im Browser gespeichert.

## GitHub Pages

1. Inhalt dieses Ordners in das Repository hochladen.
2. GitHub → Settings → Pages.
3. Source: `Deploy from a branch`.
4. Branch: `main` und Ordner `/ (root)`.
5. Speichern.
6. Die erzeugte GitHub-Pages-Adresse öffnen.

## PWA

Auf dem Smartphone die GitHub-Pages-Adresse öffnen und „Zum Startbildschirm hinzufügen“ verwenden.

## Datenhaltung

CRM-Daten werden lokal im Browser gespeichert. Regelmäßig über **JSON Backup** sichern.

## Rechtlicher Hinweis

Die App ist ein Vertriebs-/Dokumentenwerkzeug und ersetzt keine steuerliche oder rechtliche Prüfung. Rechnungsangaben und Umsatzsteuerlogik vor produktivem Einsatz prüfen.
