# Modularisierungs-Refactoring-Plan

## Ziel
Erhöhe die Wartbarkeit durch Zerlegung von Monolithen in kleine, logische Module mit klarer Separation of Concerns.

## Prinzipien
1. **Single Responsibility Principle (SRP):** Jedes Modul hat eine Aufgabe
2. **Separation of Concerns:** Input-Validierung, Geschäftslogik, Datenverarbeitung trennen
3. **Dependency Injection:** Abhängigkeiten explizit machen
4. **Testbarkeit:** Jedes Modul isoliert testbar

## Module zu erstellen

### Frontend-Module

#### 1. Filter-Module (`client/src/modules/filters/`)
- `filterTypes.ts` - Type Definitions
- `filterValidation.ts` - Input-Validierung
- `filterLogic.ts` - Geschäftslogik (Kombinieren, Anwenden)
- `filterHooks.ts` - Custom Hooks (useFilters, useFilterValidation)
- `filterComponents/` - UI-Komponenten (FilterSidebar, FilterChip, etc.)

#### 2. Listing-Module (`client/src/modules/listings/`)
- `listingTypes.ts` - Type Definitions
- `listingValidation.ts` - Input-Validierung
- `listingLogic.ts` - Geschäftslogik (Sortieren, Filtern, Paginieren)
- `listingHooks.ts` - Custom Hooks (useListings, usePagination, useSorting)
- `listingComponents/` - UI-Komponenten (ListingCard, ListingGrid, etc.)

#### 3. Booking-Module (`client/src/modules/bookings/`)
- `bookingTypes.ts` - Type Definitions
- `bookingValidation.ts` - Input-Validierung
- `bookingLogic.ts` - Geschäftslogik (Status-Übergänge, Verfügbarkeit)
- `bookingHooks.ts` - Custom Hooks (useBooking, useAvailability)
- `bookingComponents/` - UI-Komponenten (BookingForm, BookingStatus, etc.)

#### 4. Calendar-Module (`client/src/modules/calendar/`)
- `calendarTypes.ts` - Type Definitions
- `calendarValidation.ts` - Input-Validierung
- `calendarLogic.ts` - Geschäftslogik (Datum-Berechnung, Verfügbarkeit)
- `calendarHooks.ts` - Custom Hooks (useCalendar, useDateRange)
- `calendarComponents/` - UI-Komponenten (Calendar, DatePicker, etc.)

### Backend-Module

#### 1. Validation-Module (`server/modules/validation/`)
- `schemas.ts` - Zod-Schemas
- `validators.ts` - Validierungs-Funktionen
- `errors.ts` - Custom Error-Klassen

#### 2. Business-Logic-Module (`server/modules/business/`)
- `bookingService.ts` - Buchungs-Logik
- `listingService.ts` - Listings-Logik
- `availabilityService.ts` - Verfügbarkeits-Logik
- `reviewService.ts` - Bewertungs-Logik

#### 3. Data-Access-Module (`server/modules/data/`)
- `userRepository.ts` - User-Datenzugriff
- `listingRepository.ts` - Listings-Datenzugriff
- `bookingRepository.ts` - Bookings-Datenzugriff
- `reviewRepository.ts` - Reviews-Datenzugriff

#### 4. API-Module (`server/modules/api/`)
- `listingRouter.ts` - Listings-Endpoints
- `bookingRouter.ts` - Bookings-Endpoints
- `reviewRouter.ts` - Reviews-Endpoints
- `userRouter.ts` - User-Endpoints

## Refactoring-Schritte

### Phase 1: Typen und Validierung
1. Erstelle `filterTypes.ts` mit allen Filter-Typen
2. Erstelle `filterValidation.ts` mit Validierungs-Logik
3. Erstelle `listingTypes.ts` mit Listing-Typen
4. Erstelle `listingValidation.ts` mit Validierungs-Logik

### Phase 2: Geschäftslogik
1. Extrahiere Sortier-Logik in `listingLogic.ts`
2. Extrahiere Filter-Logik in `filterLogic.ts`
3. Extrahiere Pagination-Logik in `listingLogic.ts`
4. Erstelle `bookingLogic.ts` für Buchungs-Logik

### Phase 3: Custom Hooks
1. Erstelle `useFilters` Hook
2. Erstelle `useListings` Hook
3. Erstelle `usePagination` Hook
4. Erstelle `useSorting` Hook

### Phase 4: Komponenten-Zerlegung
1. Zerlege `ListingsWithPagination.tsx` in kleinere Komponenten
2. Erstelle `FilterSidebar`, `ListingCard`, `ListingGrid`, `SortControls`
3. Zerlege `BookingConfirmation.tsx` in kleinere Komponenten
4. Erstelle `BookingDetails`, `BookingStatus`, `NextSteps`

### Phase 5: Backend-Modularisierung
1. Erstelle `userRepository.ts` für User-Datenzugriff
2. Erstelle `listingRepository.ts` für Listings-Datenzugriff
3. Erstelle `bookingService.ts` für Buchungs-Logik
4. Zerlege `routers.ts` in separate Router-Module

## Vorteile
- ✅ Bessere Testbarkeit (jedes Modul isoliert testbar)
- ✅ Bessere Wartbarkeit (klare Struktur)
- ✅ Bessere Wiederverwendbarkeit (Module können überall genutzt werden)
- ✅ Bessere Skalierbarkeit (einfach neue Module hinzufügen)
- ✅ Bessere Fehlerbehandlung (klare Verantwortlichkeiten)

## Status
- [ ] Phase 1: Typen und Validierung
- [ ] Phase 2: Geschäftslogik
- [ ] Phase 3: Custom Hooks
- [ ] Phase 4: Komponenten-Zerlegung
- [ ] Phase 5: Backend-Modularisierung
