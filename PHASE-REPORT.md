# CRM-Prüfbericht · 18.09.2026

## Status

Der bearbeitete Stand enthält reproduzierte Fehlerkorrekturen und erste Verbesserungen für Phase 2. **Phase 1 ist nicht vollständig abgenommen.** Im Repository gibt es keine verbindliche Phase-1-Spezifikation. Die verbleibenden Prüf- und Fachentscheidungen stehen unten. Eine vollständige Fehlerfreiheit wird nicht behauptet.

## Sicherung

Vor jeder Änderung wurde der Branch `backup/pre-phase1-2026-09-18-6afd28f` auf Commit `6afd28fb79b9e76670676320158c902a62c147d4` erstellt. Zusätzlich wurde lokal ein Git-Bundle erzeugt. Diese Sicherung umfasst den Git-Repository-Zustand, nicht Kundenbestände in Browserprofilen oder ein vollständiges Datenbankbackup. Produktive Datensätze und Datenbankrichtlinien wurden nicht verändert.

## Commits und geänderte Dateien

Die folgenden IDs sind die veröffentlichten GitHub-Commits. Die lokal getestete und veröffentlichte Codeversion haben denselben Git-Tree: `bfe3e58d250fc798a942e5098e1002733c7e7fe5`.

| Commit | Dateien | Änderung |
| --- | --- | --- |
| [`4dae64a`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/4dae64ab3a086d5fa6e419da5da2fe43abf57c26) | `tests/regressions.test.cjs` | test: reproduce nine CRM authentication and data regressions |
| [`af53a85`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/af53a853428ba50b630305bbe222c99a3742fa5a) | `crm-auth-ui.js`, `crm-bootstrap.js`, `index.html`, `supabase-auth.js` | fix: validate and refresh sessions and restore the login gate |
| [`dd9b249`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/dd9b24924659cca0664c41afd94f7c552ad79990) | `supabase-lead-sync.js` | fix: import public leads without overwriting local sales work |
| [`8090feb`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/8090feb5c5cb625dfbef857992e515b8c2b59e66) | `app.js` | fix: retain invoice lead context and correct sales form state |
| [`df25b8c`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/df25b8c024714f8560cbb2fa88f5fe4a78918b76) | `sw.js` | fix: scope PWA caching and include authentication assets |
| [`bebe062`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/bebe0625451911e328d98313bdf880b8d038c533) | `public-lead.html`, `public-lead.js`, `supabase/migrations/20260918183447_public_lead_details.sql` | fix: align public intake fields and prevent duplicate submissions |
| [`8650e6c`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/8650e6c5d0ce177b98bb6806e6277cd52a79dc4e) | `app.js`, `crm-state.js`, `index.html`, `sw.js`, `tests/regressions.test.cjs` | fix: validate backups and initialize all CRM collections on reset |
| [`20e8c6f`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/20e8c6ff7d1de93c12958ea22111054a629a19e1) | `supabase-lead-sync.js`, `tests/regressions.test.cjs` | perf: paginate lead imports and index duplicate detection |
| [`c509934`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/c5099347621f272e8ac664c529094ee1a4b23d75) | `app.js`, `crm-state.js`, `tests/regressions.test.cjs` | perf: separate persistent CRM data from the runtime catalog |
| [`7a84b84`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/7a84b84b1f5a720bf3bebd51b1bddd23a8c4354e) | `sumup-pricing-policy.js`, `tests/regressions.test.cjs` | fix: repair syntax error preventing SumUp pricing from loading |
| [`6173eb4`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/6173eb4544a8997c53a2b08db099c8dd25aeb790) | `area-fix.js`, `sumup-advisor-fix.js`, `sumup-knowledge.js` | fix: use one SumUp advisor and remove conflicting offer loaders |
| [`e9f8a7a`](https://github.com/neXaro-Solutions/new-nexaro-field-sales-crm/commit/e9f8a7aae87fee1c27abdaa28b7e50b80354e453) | `.github/workflows/test.yml`, `.gitignore`, `package-lock.json`, `package.json`, `tests/browser.cjs`, `tests/regressions.test.cjs` | test: add browser workflows and repeatable CI regression checks |

## Reproduzierte und behobene Fehler

- Beliebige gespeicherte Tokens wurden als gültige Sitzung akzeptiert. Wiederherstellung prüft jetzt den Auth-Server; abgelaufene Tokens können mit gespeichertem Refresh-Token erneuert werden.
- Wiederhergestellte Sitzungen entfernten die Login-Sperre nicht automatisch. Startup und Login verwenden jetzt denselben Ablauf; Abmelden ist erreichbar.
- Ein fehlgeschlagener Lead-Abgleich ließ eine erfolgreiche Anmeldung als fehlgeschlagen erscheinen. Die Anmeldung bleibt gültig und meldet den Sync-Fehler separat.
- Lead-Import ersetzte lokale IDs, Status und Notizen durch die ursprüngliche Anfrage. Lokale Bearbeitungen und Kundenreferenzen bleiben erhalten. Neue Verknüpfungen werden auch ohne neue Leads gespeichert.
- Der Import war auf 200 Einträge begrenzt. Ein Test mit 450 Einträgen bestätigt vollständigen Import über mehrere Seiten und die Zusammenfassung gleichzeitiger Aufrufe. Ein späterer Seitenfehler verändert den lokalen Bestand nicht teilweise.
- Ein Gesprächsdatum wurde als wörtlicher Template-Ausdruck ins HTML geschrieben.
- Vape-Rechnungen verloren die Lead-Zuordnung ihres Quellangebots. Diese bleibt auch im Editor erhalten.
- Ungültige Backups konnten den Arbeitszustand ersetzen; leere/alte Backups und Reset initialisierten Vape-Sammlungen nicht. Die gemeinsame Validierung prüft vor der Übernahme. Beschädigte Startdaten werden nicht still durch einen leeren Bestand überschrieben.
- Das öffentliche Formular übernahm versteckte Felder des vorher gewählten Interesses und erlaubte parallele Übermittlungen. Nur aktive Felder werden gesendet; während des Requests ist die Übermittlung gesperrt.
- Die öffentliche Formular-Konfiguration war dupliziert. Sie wird jetzt gemeinsam geladen. Ein Publishable-Key wird nicht mehr als Benutzer-Bearer-Token versendet.
- Die versionierte Datenbankmigration enthielt nicht alle Formularfelder. Die ergänzende idempotente Migration entspricht den per SQL gelesenen Spalten der bestehenden produktiven Tabelle.
- Der Service Worker löschte fremde Origin-Caches, hielt alte Dateien unbegrenzt vor und lieferte HTML als Ersatz für fehlende Dateien. Caching ist auf bekannte eigene Ressourcen begrenzt und enthält die Auth-Skripte.
- `sumup-pricing-policy.js` hatte einen Syntaxfehler. Nach dessen Korrektur wurden konkurrierende Berater-Loader und ein `business is not defined`-Fehler im Browser reproduziert und behoben. Der Browserablauf reicht jetzt bis zum gespeicherten SumUp-Angebot.

## Testergebnisse

- Ausgangstest: **0/9 bestanden**, alle neun erwarteten Fehler reproduziert.
- Abschließende Node-Regressionssuite: **17/17 bestanden**, einschließlich Syntaxprüfung aller ausgelieferten JavaScript-Dateien, Session-Refresh, Import, Backupvalidierung und Persistenz.
- Chromium-Browserprüfung: **15/15 Prüfpunkte bestanden**, ohne unbehandelte JavaScript-Fehler. Enthält Login, Reload, sieben Navigationsansichten, Lead/Kundenverknüpfung, SumUp-Angebot, Task, Vape-Angebot/Rechnung, Backup, Reset und öffentliches Formular.
- Browserprüfungen verwenden synthetische Daten und abgefangene Supabase-Requests. Keine Kundenanfragen wurden produktiv erzeugt.
- Reale Datenbank wurde nur lesend geprüft: Formularspalten, Lead-Richtlinien, vorhandene Staff-Prüffunktion und Security Advisor.
- `git diff --check`: bestanden.
- GitHub-Actions-Workflow ist hinzugefügt. Sein erfolgreicher Lauf wird durch diesen Bericht nicht behauptet.

Wiederholen mit Node 22 oder neuer:

```sh
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:browser
```

Im Arbeitslauf wurde Playwright 1.62.1 mit einem separat bereitgestellten Chromium verwendet, da der normale Browserdownload nicht erreichbar war. `CHROMIUM_PATH` erlaubt eine alternative Browserdatei. Service Worker sind in diesen Browsertests deaktiviert; Cache-Verhalten wurde in der Node-Suite geprüft.

## Phase 2: bereits umgesetzt

- Gemeinsame Zustandsvalidierung und Serialisierung in `crm-state.js`.
- Seitenweiser Import, Map-Indizes zur Duplikaterkennung, Zusammenfassung paralleler Importe und Request-Timeouts.
- Rekonstruierbarer öffentlicher Katalog wird nicht mehr mit jedem Speichervorgang in localStorage geschrieben.
- Gemessener leerer Testbestand: **97.552 Byte Laufzeitzustand gegenüber 306 Byte persistierten Daten**. Das ist eine Messung dieses Testbestands, kein pauschales Performanceversprechen.
- Reproduzierbare Tests und CI-Konfiguration.

## Offen vor vollständiger Phase-1-Abnahme

1. **Verbindliches Rollenmodell:** Die produktive Richtlinie `authenticated_manage_leads` verwendet `USING (true)` und `WITH CHECK (true)`. Jeder angemeldete Nutzer hat damit bei vorhandenen Grants Zugriff auf alle öffentlichen Leads. Das Projekt enthält auch Händlerfunktionen und eine vorhandene `public.is_staff()`-Prüfung gegen aktive `staff_users`. Es muss entschieden werden, ob ausschließlich diese Staff-Liste das CRM freigeben soll. Ohne diese Entscheidung wurden keine Rechte produktiver Nutzer geändert.
2. Lokale CRM-Daten liegen weiterhin im gemeinsamen localStorage des Browserprofils, nicht in einem zentralen mandantenfähigen CRM-Backend. Eine UI-Anmeldesperre ersetzt keine Datentrennung auf gemeinsam verwendeten Geräten.
3. Echte Login-/Logout-/RLS-Integration mit Staff- und Händler-Testkonten sowie ein kontrollierter produktiver Formular-Smoke-Test stehen aus.
4. Live-Geocoding, Overpass, Wetter, OCR, Druck/PDF, mobile Endgeräte und Installation/Upgrade der PWA wurden nicht vollständig Ende-zu-Ende geprüft.
5. Datenbankmigration wurde im Repository ergänzt, nicht produktiv ausgeführt; die betreffenden Spalten sind produktiv bereits vorhanden.
6. Security Advisor meldet weitere projektweite Warnungen zu ausführbaren SECURITY-DEFINER-Funktionen und deaktiviertem Schutz vor kompromittierten Passwörtern. Das sind Prüfhinweise, keine in diesem Lauf nachgewiesenen Exploits. Diese Funktionen betreffen auch außerhalb des Repositorys liegende Händler-/Push-Abläufe.

Referenzen: [Supabase API-Schlüssel](https://supabase.com/docs/guides/getting-started/api-keys), [Serverseitige Benutzerprüfung](https://supabase.com/docs/reference/javascript/auth-getuser), [SECURITY-DEFINER-Prüfung für anon](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [SECURITY-DEFINER-Prüfung für authenticated](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [Passwortschutz](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
