# neXaro Solutions – Domain-Migration Webador → GitHub Pages

Stand: 2026-09-24. Diese Datei ist ein Migrationsplan; **es wurden noch keine Webador-DNS-Einträge geändert und keine GitHub-Custom-Domain aktiviert.**

## Ausgangslage
- Bestehende Webador-Website: `nexaro-solutions.de` / `www.nexaro-solutions.de`.
- Bestehendes CRM: `https://nexaro-solutions.github.io/new-nexaro-field-sales-crm/hub/`.
- Neue öffentliche Landingpage: `landing/index.html` in `neXaro-Solutions/new-nexaro-field-sales-crm`.
- Kontaktformular ist eine `mailto:`-Übergabe, keine serverseitige Formulareinreichung oder CRM-Lead-Speicherung.

## Wichtig: Separates GitHub-Pages-Repository für die Domain
Die Custom-Domain **nicht direkt** im CRM-Repository setzen. GitHub Pages kann dann die URL der CRM-Projektseiten auf die Custom-Domain umleiten. Die öffentliche Landingpage gehört in eine eigene Pages-Site, z. B. `neXaro-Solutions/nexaro-solutions-website` (separat erstellen/verbinden). Die HTML-Datei aus `landing/index.html` dort als `index.html` veröffentlichen. Relative Asset- und CRM-Links prüfen: `../hub/favicon.svg` und `../hub/` sind für ein separates Site-Repository ungeeignet; im öffentlichen Webauftritt auf eine eigene Icon-Datei bzw. auf die vollständige, unveränderte CRM-URL umstellen. Vor Freigabe auf Mobilgerät und Desktop prüfen.

## Vor dem DNS-Wechsel
1. Aktuelle Webador-Website und bestehende DNS-Einträge dokumentieren/sichern.
2. E-Mail-Konfiguration prüfen und die vorhandenen MX-, SPF-, DKIM- und DMARC-Einträge erhalten. Keine Nameserver umstellen.
3. Eigenständige GitHub-Pages-Site deployen, dort die Custom-Domain `www.nexaro-solutions.de` setzen und nach GitHub-Anleitung den Domainbesitz per TXT verifizieren.
4. Erst wenn die neue Site vollständig getestet ist, im Webador-Konto: Webador-Logo → Meine Websites → Mein Abonnement → Domains verwalten → DNS ändern.
5. Den `www`-CNAME auf `nexaro-solutions.github.io` setzen, sofern keine widersprechenden Einträge bestehen. Für die Root-Domain `@` die von GitHub dokumentierten A-Records verwenden: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Bereits vorhandene, widersprechende A/AAAA/ALIAS/ANAME-Einträge nur kontrolliert ersetzen; Einträge für E-Mail erhalten.
6. DNS/HTTPS und Weiterleitung beider Domainvarianten testen. In GitHub Pages `Enforce HTTPS` aktivieren, sobald verfügbar.
7. Alten Webador-Auftritt erst nach erfolgreichem Umschalten sichern/ggf. deaktivieren.

## Referenzen
- https://help.webador.com/hc/de/articles/29426730759441-Wie-%C3%A4ndere-ich-die-DNS-Einstellungen
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
