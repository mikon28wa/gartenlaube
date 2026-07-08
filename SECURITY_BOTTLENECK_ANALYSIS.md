# GartenLaube - Sicherheits-, Engpass- und Redundanz-Analyse

**Analysedatum:** 2026-07-08  
**Projekt:** GartenLaube - Buchungsplattform für Gartenlauben  
**Status:** Produktionsreife-Überprüfung

---

## 1. SICHERHEITSLÜCKEN

### 1.1 Authentifizierung & Autorisierung

#### ❌ KRITISCH: Fehlende Rollen-Validierung bei Gastgeber-Operationen

**Lage:** `server/routers.ts` - Gastgeber-Dashboard

```typescript
// ❌ PROBLEM
gartenlauben: router({
  create: protectedProcedure.input(createGartenLaubeSchema).mutation(async ({ ctx, input }) => {
    // Keine Überprüfung, ob ctx.user.role === 'host'
    return db.createGartenLaube(ctx.user.id, input);
  }),
}),
```

**Auswirkung:** Normale Benutzer können Gartenlauben erstellen und bearbeiten

**Schweregrad:** KRITISCH

**Lösung:**
```typescript
gartenlauben: router({
  create: protectedProcedure.input(createGartenLaubeSchema).mutation(async ({ ctx, input }) => {
    // ✅ Rollen-Validierung
    if (ctx.user.role !== 'host' && ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Nur Gastgeber können Lauben erstellen' });
    }
    return db.createGartenLaube(ctx.user.id, input);
  }),
}),
```

---

#### ❌ HOCH: Fehlende Ownership-Überprüfung bei Bearbeitung

**Lage:** `server/routers.ts` - updateGartenLaube

```typescript
// ❌ PROBLEM
update: protectedProcedure
  .input(updateGartenLaubeSchema)
  .mutation(async ({ ctx, input }) => {
    // Keine Überprüfung, ob ctx.user.id === laube.hostId
    return db.updateGartenLaube(input.id, input);
  }),
```

**Auswirkung:** Benutzer können Lauben anderer Gastgeber bearbeiten

**Schweregrad:** HOCH

**Lösung:**
```typescript
update: protectedProcedure
  .input(updateGartenLaubeSchema)
  .mutation(async ({ ctx, input }) => {
    const laube = await db.getGartenlaubenById(input.id);
    if (!laube) throw new TRPCError({ code: 'NOT_FOUND' });
    
    // ✅ Ownership-Überprüfung
    if (laube.hostId !== ctx.user.id && ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung' });
    }
    
    return db.updateGartenLaube(input.id, input);
  }),
```

---

#### ❌ HOCH: Fehlende Validierung bei Buchungsbestätigung

**Lage:** `server/routers.ts` - confirmBooking

```typescript
// ❌ PROBLEM
confirmBooking: protectedProcedure
  .input(z.object({ bookingId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // Keine Überprüfung, ob der Benutzer der Gastgeber ist
    return db.confirmBooking(input.bookingId);
  }),
```

**Auswirkung:** Jeder Benutzer kann jede Buchung bestätigen

**Schweregrad:** HOCH

**Lösung:**
```typescript
confirmBooking: protectedProcedure
  .input(z.object({ bookingId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const booking = await db.getBookingById(input.bookingId);
    if (!booking) throw new TRPCError({ code: 'NOT_FOUND' });
    
    const laube = await db.getGartenlaubenById(booking.gartenlaubeId);
    
    // ✅ Ownership-Überprüfung
    if (laube.hostId !== ctx.user.id && ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    return db.confirmBooking(input.bookingId);
  }),
```

---

### 1.2 Datenschutz & Datensicherheit

#### ❌ KRITISCH: Keine Verschlüsselung sensibler Daten

**Lage:** `drizzle/schema.ts` - users Tabelle

```typescript
// ❌ PROBLEM - Keine Verschlüsselung
export const users = mysqlTable("users", {
  email: varchar("email", { length: 320 }),  // Klartext!
  phoneNumber: varchar("phoneNumber", { length: 20 }),  // Klartext!
  // ...
});
```

**Auswirkung:** E-Mail und Telefonnummern sind im Klartext in der Datenbank

**Schweregrad:** KRITISCH

**Lösung:**
```typescript
// ✅ Verschlüsselte Felder
export const users = mysqlTable("users", {
  email: varchar("email", { length: 320 }),  // Verschlüsselt in App-Layer
  phoneNumber: varchar("phoneNumber", { length: 20 }),  // Verschlüsselt
  // ...
});

// In server/db.ts:
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

function encryptField(value: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptField(encrypted: string): string {
  const [iv, encryptedData] = encrypted.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

#### ❌ HOCH: Keine Rate Limiting auf API-Endpoints

**Lage:** `server/_core/index.ts`

```typescript
// ❌ PROBLEM - Keine Rate Limiting
app.use('/api/trpc', trpcMiddleware);
```

**Auswirkung:** Brute-Force-Attacken, DDoS-Anfälligkeit

**Schweregrad:** HOCH

**Lösung:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 Minuten
  max: 100,  // Max 100 Requests pro IP
  message: 'Zu viele Anfragen, bitte später versuchen',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/trpc', limiter, trpcMiddleware);
```

---

#### ❌ HOCH: Fehlende CORS-Konfiguration

**Lage:** `server/_core/index.ts`

```typescript
// ❌ PROBLEM - Keine CORS-Konfiguration
const app = express();
```

**Auswirkung:** Cross-Origin-Anfragen von überall möglich

**Schweregrad:** HOCH

**Lösung:**
```typescript
import cors from 'cors';

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://gartenlaube.com'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

#### ❌ MITTEL: Keine Input-Validierung auf Länge

**Lage:** `server/routers.ts` - Alle Zod-Schemas

```typescript
// ❌ PROBLEM - Keine Längenbeschränkung
const createGartenLaubeSchema = z.object({
  title: z.string(),  // Unbegrenzt!
  description: z.string(),  // Unbegrenzt!
});
```

**Auswirkung:** DoS durch große Payloads, Speicherlecks

**Schweregrad:** MITTEL

**Lösung:**
```typescript
const createGartenLaubeSchema = z.object({
  title: z.string().min(3).max(100),  // ✅ Begrenzt
  description: z.string().min(10).max(5000),  // ✅ Begrenzt
  amenities: z.array(z.string()).max(20),  // ✅ Max 20 Amenities
});
```

---

### 1.3 API-Sicherheit

#### ❌ HOCH: Keine HTTPS-Erzwingung

**Lage:** `server/_core/index.ts`

```typescript
// ❌ PROBLEM - Keine HTTPS-Erzwingung
const server = app.listen(port);
```

**Auswirkung:** Man-in-the-Middle-Attacken möglich

**Schweregrad:** HOCH

**Lösung:**
```typescript
// ✅ HTTPS-Erzwingung
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
});
```

---

#### ❌ MITTEL: Fehlende Security Headers

**Lage:** `server/_core/index.ts`

```typescript
// ❌ PROBLEM - Keine Security Headers
app.use(express.json());
```

**Auswirkung:** XSS, Clickjacking, andere Browser-basierte Attacken

**Schweregrad:** MITTEL

**Lösung:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

---

### 1.4 Frontend-Sicherheit

#### ❌ HOCH: Keine XSS-Schutz bei Benutzereingaben

**Lage:** `client/src/pages/SearchFilters.tsx`

```typescript
// ❌ PROBLEM - Keine XSS-Schutz
<input 
  value={searchCity}
  onChange={(e) => setSearchCity(e.target.value)}
/>
```

**Auswirkung:** XSS-Attacken durch Benutzereingaben

**Schweregrad:** HOCH

**Lösung:**
```typescript
import DOMPurify from 'dompurify';

<input 
  value={DOMPurify.sanitize(searchCity)}
  onChange={(e) => setSearchCity(DOMPurify.sanitize(e.target.value))}
/>
```

---

#### ❌ MITTEL: Keine CSRF-Token-Validierung

**Lage:** `client/src/lib/trpc.ts`

```typescript
// ❌ PROBLEM - Keine CSRF-Token
const trpc = createTRPCReact();
```

**Auswirkung:** CSRF-Attacken möglich

**Schweregrad:** MITTEL

**Lösung:**
```typescript
// ✅ CSRF-Token in Request-Header
const trpc = createTRPCReact();

// In server/_core/index.ts:
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Token in Response:
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ token: req.csrfToken() });
});
```

---

## 2. ENGPÄSSE (Performance Bottlenecks)

### 2.1 Datenbankabfragen

#### ⚠️ HOCH: N+1 Query Problem bei Listings

**Lage:** `server/db.ts` - getAllGartenlauben

```typescript
// ❌ PROBLEM - N+1 Queries
export async function getAllGartenlauben(filters?: any) {
  const gartenlauben = await db.select().from(gartenlauben).where(...);
  
  // Für jede Gartenlaube: Separate Query für Host, Bewertungen, etc.
  return gartenlauben.map(async (laube) => {
    const host = await db.select().from(users).where(eq(users.id, laube.hostId));
    const ratings = await db.select().from(ratings).where(eq(ratings.gartenlaubeId, laube.id));
    return { ...laube, host, ratings };
  });
}
```

**Auswirkung:** 1 Query für Lauben + N Queries für Hosts + N Queries für Bewertungen = O(N) Queries

**Schweregrad:** HOCH

**Lösung:**
```typescript
// ✅ JOIN-Queries statt N+1
export async function getAllGartenlauben(filters?: any) {
  return await db
    .select()
    .from(gartenlauben)
    .leftJoin(users, eq(gartenlauben.hostId, users.id))
    .leftJoin(ratings, eq(gartenlauben.id, ratings.gartenlaubeId))
    .where(...)
    .groupBy(gartenlauben.id);
}
```

---

#### ⚠️ MITTEL: Fehlende Datenbankindizes

**Lage:** `drizzle/schema.ts`

```typescript
// ❌ PROBLEM - Keine Indizes
export const gartenlauben = mysqlTable("gartenlauben", {
  city: varchar("city", { length: 100 }),  // Keine Index!
  pricePerNight: int("pricePerNight"),  // Keine Index!
  // ...
});
```

**Auswirkung:** Langsame Filterabfragen, Full Table Scans

**Schweregrad:** MITTEL

**Lösung:**
```typescript
// ✅ Mit Indizes
export const gartenlauben = mysqlTable("gartenlauben", {
  city: varchar("city", { length: 100 }),
  pricePerNight: int("pricePerNight"),
  // ...
}, (table) => ({
  cityIdx: index('idx_city').on(table.city),
  priceIdx: index('idx_price').on(table.pricePerNight),
  hostIdx: index('idx_host').on(table.hostId),
}));
```

---

### 2.2 Frontend-Performance

#### ⚠️ HOCH: Keine Pagination bei Listings

**Lage:** `client/src/pages/SearchFilters.tsx`

```typescript
// ❌ PROBLEM - Alle Listings auf einmal laden
const { data: listings } = trpc.gartenlauben.list.useQuery(filters);
// Könnte 10.000+ Listings sein!
```

**Auswirkung:** Speicherlecks, langsames Rendering, hohe Bandbreite

**Schweregrad:** HOCH

**Lösung:**
```typescript
// ✅ Mit Pagination
const [page, setPage] = useState(1);
const pageSize = 20;

const { data: listings } = trpc.gartenlauben.list.useQuery({
  ...filters,
  limit: pageSize,
  offset: (page - 1) * pageSize,
});

// Infinite Scroll Alternative:
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['listings', filters],
  queryFn: ({ pageParam = 0 }) => 
    trpc.gartenlauben.list.query({
      ...filters,
      offset: pageParam,
      limit: pageSize,
    }),
  getNextPageParam: (lastPage, pages) => 
    lastPage.length === pageSize ? pages.length * pageSize : undefined,
});
```

---

#### ⚠️ MITTEL: Keine Bilder-Optimierung

**Lage:** `client/src/pages/Listings.tsx`

```typescript
// ❌ PROBLEM - Große Bilder ohne Optimierung
<img src={laube.images[0]} alt={laube.title} />
```

**Auswirkung:** Hohe Bandbreite, langsame Seitenladezeiten

**Schweregrad:** MITTEL

**Lösung:**
```typescript
// ✅ Mit Bildoptimierung
<img 
  src={laube.images[0]}
  alt={laube.title}
  loading="lazy"
  decoding="async"
  sizes="(max-width: 768px) 100vw, 50vw"
  srcSet={`
    ${laube.images[0]}?w=400 400w,
    ${laube.images[0]}?w=800 800w,
    ${laube.images[0]}?w=1200 1200w
  `}
/>
```

---

#### ⚠️ MITTEL: Keine Query-Caching-Strategie

**Lage:** `client/src/pages/SearchFilters.tsx`

```typescript
// ❌ PROBLEM - Keine Caching-Konfiguration
const { data: listings } = trpc.gartenlauben.list.useQuery(filters);
```

**Auswirkung:** Redundante API-Calls, hohe Serverbelastung

**Schweregrad:** MITTEL

**Lösung:**
```typescript
// ✅ Mit Cache-Konfiguration
const { data: listings } = trpc.gartenlauben.list.useQuery(filters, {
  staleTime: 5 * 60 * 1000,  // 5 Minuten
  gcTime: 30 * 60 * 1000,  // 30 Minuten (vorher cacheTime)
  refetchOnWindowFocus: false,
});
```

---

### 2.3 Server-Performance

#### ⚠️ HOCH: Keine Datenbankverbindungs-Pooling

**Lage:** `server/db.ts`

```typescript
// ❌ PROBLEM - Neue Verbindung pro Request
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);  // Neue Verbindung!
  }
  return _db;
}
```

**Auswirkung:** Zu viele offene Verbindungen, Speicherlecks

**Schweregrad:** HOCH

**Lösung:**
```typescript
// ✅ Mit Connection Pooling
import { createPool } from 'mysql2/promise';

const pool = createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function getDb() {
  if (!_db) {
    _db = drizzle(pool);
  }
  return _db;
}
```

---

#### ⚠️ MITTEL: Keine Response-Kompression

**Lage:** `server/_core/index.ts`

```typescript
// ❌ PROBLEM - Keine Kompression
app.use(express.json());
```

**Auswirkung:** Große Response-Größen, hohe Bandbreite

**Schweregrad:** MITTEL

**Lösung:**
```typescript
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024,  // Nur Responses > 1KB komprimieren
}));
```

---

## 3. REDUNDANZEN

### 3.1 Code-Redundanzen

#### 🔄 HOCH: Duplizierte Filter-Logik

**Lage:** `client/src/pages/SearchFilters.tsx` vs `client/src/pages/Listings.tsx`

```typescript
// ❌ PROBLEM - Gleiche Filter-Logik an zwei Stellen
// SearchFilters.tsx
const handleSearch = () => {
  const conditions = [];
  if (searchCity) conditions.push(like(...));
  if (minPrice) conditions.push(gte(...));
  // ...
};

// Listings.tsx
const handleFilter = () => {
  const conditions = [];
  if (city) conditions.push(like(...));
  if (minPrice) conditions.push(gte(...));
  // ...
};
```

**Auswirkung:** Wartungsprobleme, Inkonsistenzen, Bugs

**Schweregrad:** HOCH

**Lösung:**
```typescript
// ✅ Gemeinsame Filter-Komponente
export const FilterPanel = ({ onFilter }) => {
  const [filters, setFilters] = useState({});
  
  const handleApply = () => {
    onFilter(filters);
  };
  
  return <div>{/* Filter UI */}</div>;
};

// In SearchFilters.tsx und Listings.tsx:
<FilterPanel onFilter={handleSearch} />
```

---

#### 🔄 MITTEL: Duplizierte Validierungs-Schemas

**Lage:** `server/routers.ts`

```typescript
// ❌ PROBLEM - Schemas an mehreren Stellen definiert
const createSchema = z.object({ title: z.string(), ... });
const updateSchema = z.object({ title: z.string(), ... });
const filterSchema = z.object({ title: z.string(), ... });
```

**Auswirkung:** Wartungsprobleme, Inkonsistenzen

**Schweregrad:** MITTEL

**Lösung:**
```typescript
// ✅ Zentrale Schema-Definition
export const gartenlaubeBaseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  // ...
});

export const createGartenLaubeSchema = gartenlaubeBaseSchema;
export const updateGartenLaubeSchema = gartenlaubeBaseSchema.partial();
export const filterGartenLaubeSchema = gartenlaubeBaseSchema.partial();
```

---

### 3.2 Datenbank-Redundanzen

#### 🔄 MITTEL: Denormalisierte Daten ohne Konsistenz-Checks

**Lage:** `drizzle/schema.ts` - gartenlauben.distanceToRadweg

```typescript
// ❌ PROBLEM - Denormalisierte Daten
export const gartenlauben = mysqlTable("gartenlauben", {
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 10, scale: 8 }),
  distanceToRadweg: decimal("distanceToRadweg", { precision: 5, scale: 2 }),  // Redundant!
});
```

**Auswirkung:** Datenkonsistenz-Probleme, veraltete Werte

**Schweregrad:** MITTEL

**Lösung:**
```typescript
// ✅ Berechnung bei Bedarf
export async function getGartenlaubenWithDistance(id: number) {
  const laube = await db.select().from(gartenlauben).where(eq(gartenlauben.id, id));
  
  // Berechne Entfernung zu nächstem Radweg
  const distance = await calculateDistanceToNearestRadweg(
    laube.latitude,
    laube.longitude
  );
  
  return { ...laube, distanceToRadweg: distance };
}
```

---

### 3.3 API-Redundanzen

#### 🔄 HOCH: Duplizierte Endpoints

**Lage:** `server/routers.ts`

```typescript
// ❌ PROBLEM - Redundante Endpoints
gartenlauben: router({
  list: publicProcedure.query(...),
  getAll: publicProcedure.query(...),  // Redundant zu list!
  search: publicProcedure.query(...),  // Redundant zu list!
}),
```

**Auswirkung:** API-Verwirrung, Wartungsprobleme

**Schweregrad:** HOCH

**Lösung:**
```typescript
// ✅ Einziger Endpoint mit Filtern
gartenlauben: router({
  list: publicProcedure
    .input(z.object({
      city: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      // ... alle Filter-Parameter
    }))
    .query(async ({ input }) => {
      // Alle Filter-Logik hier
    }),
}),
```

---

## Zusammenfassung: Prioritäts-Matrix

| # | Problem | Typ | Schweregrad | Aufwand | Priorität |
|---|---|---|---|---|---|
| 1 | Fehlende Rollen-Validierung | Sicherheit | KRITISCH | Niedrig | 🔴 P0 |
| 2 | Keine Datenverschlüsselung | Sicherheit | KRITISCH | Mittel | 🔴 P0 |
| 3 | Fehlende Ownership-Überprüfung | Sicherheit | HOCH | Niedrig | 🔴 P0 |
| 4 | N+1 Query Problem | Engpass | HOCH | Mittel | 🟠 P1 |
| 5 | Keine Pagination | Engpass | HOCH | Mittel | 🟠 P1 |
| 6 | Keine HTTPS-Erzwingung | Sicherheit | HOCH | Niedrig | 🟠 P1 |
| 7 | Keine Rate Limiting | Sicherheit | HOCH | Niedrig | 🟠 P1 |
| 8 | Duplizierte Filter-Logik | Redundanz | HOCH | Mittel | 🟠 P1 |
| 9 | Keine Security Headers | Sicherheit | MITTEL | Niedrig | 🟡 P2 |
| 10 | Keine Datenbankindizes | Engpass | MITTEL | Niedrig | 🟡 P2 |

---

## Nächste Schritte

### Phase 1 (KRITISCH - Sofort):
1. ✅ Rollen-Validierung implementieren
2. ✅ Ownership-Überprüfung hinzufügen
3. ✅ Datenverschlüsselung einführen

### Phase 2 (HOCH - Diese Woche):
1. N+1 Query Problem beheben
2. Pagination implementieren
3. HTTPS-Erzwingung aktivieren
4. Rate Limiting hinzufügen

### Phase 3 (MITTEL - Nächste Woche):
1. Datenbankindizes erstellen
2. Security Headers konfigurieren
3. Redundanzen entfernen
