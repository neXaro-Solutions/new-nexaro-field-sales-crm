# neXaro Field Sales CRM V3.4

Mobile-first PWA for B2B field sales with shared customer master for SUMUP and VAPE.

## V3.1 – Gebiet & Außendienst
- Customer-based territory planning
- Radius search by PLZ / Ort or current location
- Route date and filters: all, due today, SUMUP, VAPE
- Automatic route ordering by proximity + priority
- Manual route reordering
- Single-customer navigation
- Full route handoff to Google Maps
- Save/load/delete local daily routes
- Public OSM/Overpass prospect search for new leads
- Existing CRM data preserved in localStorage

## Privacy
The public GitHub build does not contain private bank account data or private L3 price values.

## Run
Open `index.html` or host the folder as a static site / GitHub Pages PWA.


## V3.2 – Zentrale Kundenroute
- Außendienst-Routenplanung basiert auf dem zentralen Kundenstamm, nicht nur auf Leads.
- Filter: alle Kunden, fällige Kunden, SUMUP, VAPE.
- Kundenpriorität A/B/C wird über Hoch/Mittel/Niedrig abgebildet.
- Verkaufsgebiet und Besuchstag können für die Tagesroute gesetzt werden.
- Route kann manuell sortiert, in Google Maps geöffnet und lokal gespeichert werden.
- Bestehende lokale CRM-Daten bleiben erhalten.


## V3.4 – SUMUP Lead-Erfassung
- SUMUP-Leads können jetzt getrennt in Straße/Hausnummer, PLZ und Ort erfasst werden.
- PLZ und Ort sind für neue SUMUP-Leads Pflichtfelder, damit Gebiet und Routenplanung funktionieren.
- Bestehende Adressen werden beim Update nach Möglichkeit automatisch in Straße, PLZ und Ort aufgeteilt.
- SUMUP-Leads werden weiterhin mit dem zentralen Kundenstamm verknüpft.
- VAPE-Funktionen und der bestehende VAPE-Katalog bleiben unverändert und sind nicht Teil der SUMUP-Lead-Erfassung.


## V3.4
SUMUP Gesprächsleitfaden direkt im Lead: Einstieg, Bedarfsermittlung, Tarifvergleich, Einwandbehandlung, Abschluss und Gesprächsdokumentation. VAPE bleibt als eigener Bereich erhalten.
