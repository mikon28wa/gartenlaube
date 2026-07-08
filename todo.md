# GartenLaube - Projekt TODO

## Phase 1: Datenschema & Backend-Grundlagen
- [x] Datenbankschema definieren (Lauben, Buchungen, Bewertungen, Benutzer-Rollen)
- [x] Drizzle-Migrationen generieren und anwenden
- [x] tRPC-Router für Lauben-CRUD erstellen
- [x] tRPC-Router für Buchungen-Logik erstellen
- [x] Authentifizierung und Autorisierung (Gast vs. Gastgeber vs. Admin)

## Phase 2: Frontend-Grundlagen & Design-System
- [x] Design-Token definieren (Farben: Terrakotta, Ocker, Salbeigrün, Creme)
- [x] Globale Styles und Tailwind-Konfiguration
- [x] Basis-Layout-Komponenten (Header, Footer, Navigation)
- [x] Responsive Breakpoints testen

## Phase 3: Landingpage
- [x] Hero-Bereich mit Hintergrundbild/Grafik
- [x] Suchfeld (Ort, Datum, Personenanzahl)
- [x] Featured-Lauben-Sektion
- [x] Call-to-Action-Buttons
- [x] Statistiken/Highlights-Bereich

## Phase 4: Inserate-Übersichtsseite
- [x] Lauben-Listenseite mit Karten-Layout
- [x] Filter nach Preis, Entfernung zum Radweg, Ausstattung
- [ ] Sortierungsoptionen
- [ ] Pagination oder Infinite Scroll
- [x] Responsive Grid-Layout

## Phase 5: Detailseite für Gartenlaube
- [x] Foto-Galerie (mehrere Bilder)
- [x] Beschreibung und Ausstattungsmerkmale
- [x] Preis pro Nacht anzeigen
- [x] Verfügbarkeitskalender
- [x] Buchungsformular
- [x] Gastgeber-Informationen
- [x] Bewertungen und Ratings anzeigen

## Phase 6: Gastgeber-Dashboard
- [x] Dashboard-Layout mit Sidebar-Navigation
- [x] Lauben-Verwaltung (Erstellen, Bearbeiten, Löschen)
- [x] Buchungsanfragen-Verwaltung (Annehmen/Ablehnen)
- [x] Verfügbarkeitskalender verwalten
- [x] Statistiken und Übersicht

## Phase 7: Buchungssystem
- [x] Buchungsanfrage-Logik (Status: pending, confirmed, rejected, cancelled)
- [x] Verfügbarkeitsprüfung
- [x] Buchungsbestätigung
- [x] Buchungshistorie für Gäste

## Phase 8: Nutzerprofil
- [x] Profilseite mit Benutzerinformationen
- [x] Buchungshistorie anzeigen
- [x] Favoriten-Liste (gespeicherte Lauben)
- [x] Bewertungen des Benutzers anzeigen
- [x] Account-Einstellungen

## Phase 9: Bewertungssystem
- [ ] Bewertungsformular nach Aufenthalt
- [ ] Sternebewertung + Textbewertung
- [ ] Bewertungen auf Detailseite anzeigen
- [ ] Durchschnittliche Bewertung berechnen

## Phase 10: Kartenansicht
- [x] Google Maps-Integration
- [x] Marker für alle Lauben
- [x] Marker-Cluster für bessere Performance
- [x] Info-Fenster bei Marker-Klick
- [x] Radweg-Layer anzeigen (optional)

## Phase 11: Benachrichtigungen
- [ ] In-App-Benachrichtigungen
- [ ] E-Mail-Benachrichtigungen bei Buchungsanfragen
- [ ] E-Mail-Benachrichtigungen bei Buchungsbestätigung/Ablehnung
- [ ] Benachrichtigungs-Einstellungen für Nutzer

## Phase 12: Optimierung & Testing
- [ ] Vitest-Tests für kritische Funktionen
- [ ] Performance-Optimierung
- [ ] Responsive Design überprüfen
- [ ] Accessibility-Checks
- [ ] Browser-Kompatibilität testen

## Phase 13: Deployment
- [ ] Checkpoint erstellen
- [ ] Finale Tests durchführen
- [ ] Deployment vorbereiten
