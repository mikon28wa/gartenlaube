# Redundanzen-Eliminierungs-Plan für GartenLaube

## Identifizierte Redundanzen

### 1. Duplizierte Filter-Logik

**Betroffene Dateien:**
- `client/src/pages/SearchFilters.tsx`
- `client/src/pages/Listings.tsx`

**Problem:**
Beide Komponenten implementieren identische Filter-Logik für:
- Stadt-Filter
- Preis-Filter (min/max)
- Entfernung zum Radweg-Filter
- Amenities-Filter

**Lösung:**
- Erstelle einen Custom Hook `useListingFilters()` in `client/src/hooks/useListingFilters.ts`
- Zentralisiere alle Filter-Logik
- Beide Komponenten nutzen denselben Hook

---

### 2. Duplizierte Validierungs-Schemas

**Betroffene Dateien:**
- `server/routers.ts` - Zod-Schemas für Gartenlauben-Input
- `client/src/pages/SearchFilters.tsx` - Frontend-Validierung
- `client/src/pages/ListingDetail.tsx` - Buchungsformular-Validierung

**Problem:**
Validierungs-Regeln sind an mehreren Stellen definiert:
- Preis-Validierung (min: 0, max: 10000)
- Gäste-Validierung (min: 1, max: 100)
- Datum-Validierung
- Amenities-Validierung

**Lösung:**
- Erstelle `shared/validation-schemas.ts` mit gemeinsamen Zod-Schemas
- Exportiere vordefinierte Schemas für:
  - `priceSchema`
  - `guestsSchema`
  - `dateSchema`
  - `amenitiesSchema`
  - `filterSchema`
- Importiere in Server und Client

---

### 3. Redundante API-Endpoints

**Betroffene Endpoints:**
- `gartenlauben.list` - Alle Lauben mit Filtern
- `gartenlauben.getAll` - Alle Lauben ohne Filter (falls vorhanden)
- `gartenlauben.search` - Suchfunktion (falls vorhanden)

**Problem:**
Mehrere Endpoints für ähnliche Funktionalität:
- Verwirrung über welcher Endpoint zu verwenden ist
- Duplizierte Backend-Logik
- Schwerer zu warten

**Lösung:**
- Konsolidiere zu einem einzigen `gartenlauben.list` Endpoint
- Alle Filter sind optional
- Unterstützt:
  - Keine Filter → alle aktiven Lauben
  - Mit Filtern → gefilterte Lauben
  - Pagination → limit/offset

---

## Implementierungs-Schritte

### Phase 1: Validierungs-Schemas konsolidieren
1. Erstelle `shared/validation-schemas.ts`
2. Definiere alle gemeinsamen Zod-Schemas
3. Aktualisiere `server/routers.ts` um neue Schemas zu verwenden
4. Aktualisiere Frontend-Komponenten

### Phase 2: Filter-Logik in Hook auslagern
1. Erstelle `client/src/hooks/useListingFilters.ts`
2. Implementiere Filter-State-Management
3. Aktualisiere `SearchFilters.tsx`
4. Aktualisiere `Listings.tsx`

### Phase 3: API-Endpoints konsolidieren
1. Überprüfe alle Endpoints in `server/routers.ts`
2. Entferne redundante Endpoints
3. Konsolidiere zu `gartenlauben.list`
4. Aktualisiere Frontend-Aufrufe

---

## Erwartete Vorteile

- **Wartbarkeit:** Weniger Code, einfacher zu verstehen
- **Konsistenz:** Einheitliche Validierung überall
- **Performance:** Weniger redundante Logik
- **Skalierbarkeit:** Einfacher neue Filter hinzufügen
- **Fehlerreduktion:** Single Source of Truth für Validierung

---

## Risikoanalyse

- **Risiko:** Breaking Changes in API
- **Mitigation:** Gründliches Testen vor Deployment
- **Risiko:** Frontend-Komponenten funktionieren nicht mehr
- **Mitigation:** Schrittweise Refaktorierung mit Tests

---

## Zeitschätzung

- Phase 1: 30 Minuten
- Phase 2: 45 Minuten
- Phase 3: 30 Minuten
- Testing: 30 Minuten
- **Total: ~2.5 Stunden**
