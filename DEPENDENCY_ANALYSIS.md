# Abhängigkeitsanalyse - GartenLaube

## Übersicht

Diese Analyse identifiziert Abhängigkeiten zwischen Modulen, kritische Pfade und potenzielle Engpässe.

## Frontend-Abhängigkeitsbaum

```
App.tsx
├── Home.tsx
│   └── Keine kritischen Abhängigkeiten
├── Listings.tsx
│   ├── trpc.gartenlauben.list (KRITISCH)
│   └── ListingCard (UI-Komponente)
├── ListingsWithPagination.tsx
│   ├── trpc.gartenlauben.list (KRITISCH)
│   ├── useFilters (Custom Hook)
│   └── ListingPagination (UI-Komponente)
├── ListingDetail.tsx
│   ├── trpc.gartenlauben.getById (KRITISCH)
│   ├── AvailabilityCalendar (Komponente)
│   └── BookingForm (Komponente)
├── HostDashboard.tsx
│   ├── trpc.gartenlauben.list (KRITISCH)
│   ├── trpc.gartenlauben.create (KRITISCH)
│   ├── trpc.gartenlauben.update (KRITISCH)
│   ├── trpc.gartenlauben.delete (KRITISCH)
│   └── trpc.bookings.list (KRITISCH)
├── Profile.tsx
│   ├── trpc.auth.me (KRITISCH)
│   ├── trpc.bookings.getUserBookings (KRITISCH)
│   └── trpc.favorites.getUserFavorites (KRITISCH)
├── MapView.tsx
│   ├── trpc.gartenlauben.list (KRITISCH)
│   └── Google Maps API (EXTERN)
└── BookingConfirmation.tsx
    └── Keine kritischen Abhängigkeiten
```

## Backend-Abhängigkeitsbaum

```
server/routers.ts
├── server/db.ts (KRITISCH)
│   ├── drizzle/schema.ts (KRITISCH)
│   │   └── DATABASE_URL (KRITISCH - EXTERN)
│   └── Drizzle ORM (KRITISCH - EXTERN)
├── server/_core/context.ts
│   └── Manus OAuth (EXTERN)
└── shared/trpc-schemas.ts
    └── Zod (EXTERN)
```

## Kritische Module (Tier 1)

| Modul | Abhängigkeiten | Kritikalität | Fehlerauswirkung |
|-------|-----------------|--------------|-----------------|
| **server/db.ts** | DATABASE_URL, Drizzle ORM | KRITISCH | Alle Datenoperationen fehlgeschlagen |
| **drizzle/schema.ts** | DATABASE_URL | KRITISCH | Keine Datenbankverbindung möglich |
| **server/routers.ts** | server/db.ts, shared/trpc-schemas.ts | KRITISCH | API nicht funktional |
| **trpc.gartenlauben.list** | server/db.ts | KRITISCH | Listings-Seiten nicht funktional |
| **trpc.gartenlauben.getById** | server/db.ts | KRITISCH | Detailseiten nicht funktional |
| **trpc.auth.me** | Manus OAuth | KRITISCH | Authentifizierung fehlgeschlagen |

## Abhängigkeitsketten (Kritische Pfade)

### Pfad 1: Listings anzeigen
```
ListingsWithPagination.tsx
  → trpc.gartenlauben.list
    → server/routers.ts
      → server/db.ts
        → DATABASE_URL
        → drizzle/schema.ts
          → gartenlauben Tabelle
```

**Fehlerquellen:** DATABASE_URL, Datenbankverbindung, Tabelle existiert nicht

### Pfad 2: Buchung erstellen
```
ListingDetail.tsx
  → BookingForm
    → trpc.bookings.create
      → server/routers.ts
        → server/db.ts
          → DATABASE_URL
          → bookings Tabelle
```

**Fehlerquellen:** DATABASE_URL, Datenbankverbindung, Validierung fehlgeschlagen

### Pfad 3: Authentifizierung
```
App.tsx
  → useAuth()
    → trpc.auth.me
      → Manus OAuth
        → OAUTH_SERVER_URL
```

**Fehlerquellen:** OAuth-Konfiguration, Session-Cookie

## Abhängigkeitszyklen (Circular Dependencies)

✅ **Keine Zyklen erkannt** - Architektur ist sauber

## Externe Abhängigkeiten

| Abhängigkeit | Kritikalität | Fallback | Status |
|--------------|--------------|----------|--------|
| DATABASE_URL | KRITISCH | Keine | ⚠️ Fehlt |
| Manus OAuth | KRITISCH | Keine | ✅ Konfiguriert |
| Google Maps API | MITTEL | Placeholder | ⚠️ Optional |
| Drizzle ORM | KRITISCH | Keine | ✅ Installiert |
| Zod | HOCH | Keine | ✅ Installiert |
| React | KRITISCH | Keine | ✅ Installiert |
| Tailwind CSS | MITTEL | Fallback-Styles | ✅ Installiert |

## Engpässe identifiziert

### 1. Datenbankverbindung (KRITISCH)
- **Problem:** DATABASE_URL ist nicht konfiguriert
- **Auswirkung:** Alle Datenoperationen fehlgeschlagen
- **Lösung:** DATABASE_URL in Umgebungsvariablen setzen

### 2. N+1 Query Problem (HOCH)
- **Problem:** getAllGartenlauben lädt alle Listings auf einmal
- **Auswirkung:** Performance-Degradation bei vielen Listings
- **Lösung:** Pagination implementiert ✅

### 3. Fehlende Fehlerbehandlung (HOCH)
- **Problem:** Keine Fallback-UI bei API-Fehlern
- **Auswirkung:** Nutzer sehen keine aussagekräftigen Fehlermeldungen
- **Lösung:** Error Boundaries und Toast-Notifications hinzufügen

### 4. Fehlende Caching (MITTEL)
- **Problem:** Jeder Request führt zu Datenbankabfrage
- **Auswirkung:** Unnötige Datenbankbelastung
- **Lösung:** tRPC Query-Caching konfigurieren

## Modularisierungs-Empfehlungen

### Phase 2: Listing-Modul
```
client/src/modules/listings/
├── listingTypes.ts
├── listingValidation.ts
├── listingLogic.ts
├── listingHooks.ts
├── listingComponents/
│   ├── ListingCard.tsx
│   ├── ListingGrid.tsx
│   └── ListingDetail.tsx
└── listings.test.ts
```

### Phase 3: Booking-Modul
```
client/src/modules/bookings/
├── bookingTypes.ts
├── bookingValidation.ts
├── bookingLogic.ts
├── bookingHooks.ts
├── bookingComponents/
│   ├── BookingForm.tsx
│   ├── BookingStatus.tsx
│   └── BookingConfirmation.tsx
└── bookings.test.ts
```

### Phase 4: Backend-Module
```
server/modules/
├── validation/
│   ├── schemas.ts
│   └── validators.ts
├── business/
│   ├── listingService.ts
│   ├── bookingService.ts
│   └── availabilityService.ts
├── data/
│   ├── listingRepository.ts
│   ├── bookingRepository.ts
│   └── userRepository.ts
└── api/
    ├── listingRouter.ts
    ├── bookingRouter.ts
    └── userRouter.ts
```

## Abhängigkeitsmetriken

| Metrik | Wert | Status |
|--------|------|--------|
| Zyklomatische Komplexität | Niedrig | ✅ |
| Abhängigkeitstiefen | 4-5 Ebenen | ⚠️ Moderat |
| Kritische Pfade | 3 | ⚠️ Managebar |
| Externe Abhängigkeiten | 7 | ✅ Wenige |
| Circular Dependencies | 0 | ✅ Keine |

## Empfohlene Aktionen

1. **SOFORT:** DATABASE_URL konfigurieren
2. **DIESE WOCHE:** Error Boundaries implementieren
3. **DIESE WOCHE:** Caching-Strategie definieren
4. **NÄCHSTE WOCHE:** Listing-Modul modularisieren
5. **NÄCHSTE WOCHE:** Booking-Modul modularisieren
6. **SPÄTER:** Backend-Module refaktorieren

## Status

- [x] Abhängigkeitsanalyse durchgeführt
- [x] Kritische Module identifiziert
- [x] Engpässe erkannt
- [ ] Modularisierung Phase 2-4 implementieren
- [ ] Error Handling verbessern
- [ ] Caching implementieren
