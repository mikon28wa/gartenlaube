# Tiefenanalyse: Kritische Engpässe

## 1. DATABASE_URL-Konfiguration (KRITISCH)

### Problem
```
Error: Table 'kerqgrdfvqmxpzuhhzfjan.gartenlauben' doesn't exist
```

Die Datenbank-Tabellen existieren nicht, obwohl das Schema definiert ist.

### Root Cause Analysis

#### Ursache 1: Migrationen nicht angewendet
```
Drizzle-Migrationen wurden generiert, aber nicht auf die Live-Datenbank angewendet.
```

**Symptome:**
- `drizzle/0000_nice_riptide.sql` existiert
- `drizzle/0001_rapid_black_tom.sql` existiert
- Aber: Tabellen existieren nicht in der Datenbank

**Lösung:**
```bash
# Migrationen explizit anwenden
pnpm drizzle-kit migrate
# oder über webdev_execute_sql
```

#### Ursache 2: DATABASE_URL falsch konfiguriert
```
DATABASE_URL könnte auf falsche Datenbank zeigen
```

**Überprüfung:**
```typescript
// server/_core/env.ts
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('Host:', new URL(process.env.DATABASE_URL).hostname);
console.log('Database:', new URL(process.env.DATABASE_URL).pathname);
```

#### Ursache 3: Datenbankverbindung fehlgeschlagen
```
Verbindung wird nicht hergestellt, obwohl URL korrekt ist
```

**Überprüfung:**
```typescript
// server/db.ts
async function testConnection() {
  try {
    const db = await getDb();
    const result = await db.execute(sql`SELECT 1`);
    console.log('✅ Datenbankverbindung OK');
  } catch (error) {
    console.error('❌ Datenbankverbindung fehlgeschlagen:', error);
  }
}
```

### Lösungsstrategie

#### Schritt 1: Verbindung testen
```typescript
// server/_core/connectionTest.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export async function testDatabaseConnection() {
  try {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL!,
    });
    
    const result = await connection.execute('SELECT 1');
    console.log('✅ Datenbankverbindung erfolgreich');
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Datenbankverbindung fehlgeschlagen:', error);
    return false;
  }
}
```

#### Schritt 2: Migrationen anwenden
```typescript
// server/_core/runMigrations.ts
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export async function runMigrations() {
  try {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL!,
    });
    
    const db = drizzle(connection);
    
    await migrate(db, {
      migrationsFolder: './drizzle/migrations',
    });
    
    console.log('✅ Migrationen erfolgreich angewendet');
    await connection.end();
  } catch (error) {
    console.error('❌ Migrationen fehlgeschlagen:', error);
    throw error;
  }
}
```

#### Schritt 3: Startup-Prüfung
```typescript
// server/_core/index.ts
async function startServer() {
  // 1. Verbindung testen
  const connected = await testDatabaseConnection();
  if (!connected) {
    console.error('Datenbankverbindung fehlgeschlagen. Server wird nicht gestartet.');
    process.exit(1);
  }
  
  // 2. Migrationen anwenden
  await runMigrations();
  
  // 3. Server starten
  app.listen(PORT, () => {
    console.log(`✅ Server läuft auf Port ${PORT}`);
  });
}
```

### Monitoring & Alerts

```typescript
// server/_core/healthCheck.ts
export async function healthCheck() {
  const checks = {
    database: await testDatabaseConnection(),
    tables: await checkTablesExist(),
    api: true,
  };
  
  return {
    status: Object.values(checks).every(c => c) ? 'healthy' : 'unhealthy',
    checks,
  };
}

// Health-Check Endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

---

## 2. Fehlerbehandlung (HOCH)

### Problem
```
Nutzer sehen keine aussagekräftigen Fehlermeldungen bei API-Fehlern
```

### Fehlertypen identifiziert

| Fehlertyp | Häufigkeit | Auswirkung | Aktuell |
|-----------|-----------|-----------|---------|
| Datenbankfehler | Hoch | Seite lädt nicht | ❌ Keine Behandlung |
| Validierungsfehler | Hoch | Formular-Fehler | ⚠️ Teilweise |
| Netzwerkfehler | Mittel | Timeout | ❌ Keine Behandlung |
| Authentifizierungsfehler | Mittel | Login erforderlich | ⚠️ Teilweise |
| Autorisierungsfehler | Niedrig | Zugriff verweigert | ❌ Keine Behandlung |

### Lösungsstrategie

#### 1. Error Boundary für React
```typescript
// client/src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-bold">Fehler aufgetreten</h2>
          <p className="text-red-700 text-sm mt-2">{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Seite neu laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

#### 2. tRPC Error Handler
```typescript
// client/src/lib/trpcErrorHandler.ts
export function handleTRPCError(error: TRPCClientError<AppRouter>) {
  const code = error.data?.code;
  
  switch (code) {
    case 'UNAUTHORIZED':
      return {
        title: 'Authentifizierung erforderlich',
        message: 'Bitte melden Sie sich an',
        action: 'login',
      };
    
    case 'FORBIDDEN':
      return {
        title: 'Zugriff verweigert',
        message: 'Sie haben keine Berechtigung für diese Aktion',
        action: null,
      };
    
    case 'NOT_FOUND':
      return {
        title: 'Nicht gefunden',
        message: 'Die angeforderte Ressource existiert nicht',
        action: 'back',
      };
    
    case 'INTERNAL_SERVER_ERROR':
      return {
        title: 'Serverfehler',
        message: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
        action: 'retry',
      };
    
    case 'BAD_REQUEST':
      return {
        title: 'Ungültige Eingabe',
        message: error.message || 'Bitte überprüfen Sie Ihre Eingaben',
        action: null,
      };
    
    default:
      return {
        title: 'Fehler',
        message: error.message || 'Ein Fehler ist aufgetreten',
        action: 'retry',
      };
  }
}
```

#### 3. Query Error Handling
```typescript
// client/src/hooks/useListingsWithErrorHandling.ts
export function useListingsWithErrorHandling() {
  const { data, isLoading, error } = trpc.gartenlauben.list.useQuery();
  
  const errorInfo = error ? handleTRPCError(error) : null;
  
  return {
    listings: data || [],
    isLoading,
    error: errorInfo,
    hasError: !!error,
  };
}
```

#### 4. Toast-Notifications
```typescript
// client/src/components/ErrorToast.tsx
export function ErrorToast({ error, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
      <p className="font-bold">{error.title}</p>
      <p className="text-sm mt-1">{error.message}</p>
      <button 
        onClick={onDismiss}
        className="mt-2 text-sm underline"
      >
        Schließen
      </button>
    </div>
  );
}
```

---

## 3. Caching-Strategie (MITTEL)

### Problem
```
Jeder Request führt zu einer Datenbankabfrage
→ Unnötige Belastung
→ Langsame Response-Zeiten
```

### Caching-Ebenen

#### Ebene 1: Browser-Cache (tRPC)
```typescript
// client/src/lib/trpc.ts
export const trpc = createTRPCReact<AppRouter>({
  config() {
    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,      // 5 Minuten
            gcTime: 10 * 60 * 1000,        // 10 Minuten
            retry: 2,
            retryDelay: 1000,
          },
        },
      },
    };
  },
});
```

**Strategie:**
- Listings: 5 Min (häufig geändert)
- Detailseite: 10 Min (selten geändert)
- Benutzer: 30 Min (sehr selten geändert)

#### Ebene 2: Server-Cache (Redis)
```typescript
// server/_core/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedListings(filters: FilterState) {
  const cacheKey = `listings:${JSON.stringify(filters)}`;
  
  // Versuche aus Cache zu lesen
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('✅ Cache Hit:', cacheKey);
    return JSON.parse(cached);
  }
  
  // Cache Miss: Aus Datenbank laden
  const listings = await db.getAllGartenlauben(filters);
  
  // In Cache speichern (5 Minuten)
  await redis.setex(cacheKey, 300, JSON.stringify(listings));
  
  return listings;
}
```

#### Ebene 3: Database-Query-Optimization
```typescript
// server/db.ts
export async function getAllGartenlauben(
  filters: FilterState,
  limit: number = 20,
  offset: number = 0
) {
  // Mit Indizes optimiert
  return db
    .select()
    .from(gartenlauben)
    .where(
      and(
        eq(gartenlauben.isActive, true),
        filters.city ? ilike(gartenlauben.city, `%${filters.city}%`) : undefined,
        filters.maxPrice ? lte(gartenlauben.pricePerNight, filters.maxPrice) : undefined,
      )
    )
    .orderBy(desc(gartenlauben.isFeatured), desc(gartenlauben.createdAt))
    .limit(limit)
    .offset(offset);
}
```

### Caching-Invalidation

```typescript
// server/routers.ts
export const appRouter = router({
  gartenlauben: router({
    create: protectedProcedure
      .input(createListingSchema)
      .mutation(async ({ input, ctx }) => {
        const listing = await db.createGartenlaube(input);
        
        // Cache invalidieren
        await redis.del('listings:*');
        
        return listing;
      }),
    
    update: protectedProcedure
      .input(updateListingSchema)
      .mutation(async ({ input, ctx }) => {
        const listing = await db.updateGartenlaube(input);
        
        // Spezifisches Cache-Entry löschen
        await redis.del(`listing:${input.id}`);
        await redis.del('listings:*');
        
        return listing;
      }),
  }),
});
```

### Cache-Metriken

```typescript
// server/_core/cacheMetrics.ts
export class CacheMetrics {
  static hits = 0;
  static misses = 0;
  
  static getHitRate() {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : (this.hits / total) * 100;
  }
  
  static log() {
    console.log(`
      Cache Hit Rate: ${this.getHitRate().toFixed(2)}%
      Hits: ${this.hits}
      Misses: ${this.misses}
    `);
  }
}
```

---

## Implementierungs-Roadmap

### Phase 1: Datenbank-Konfiguration (SOFORT)
- [ ] DATABASE_URL überprüfen
- [ ] Migrationen anwenden
- [ ] Verbindungs-Test implementieren
- [ ] Health-Check Endpoint hinzufügen

### Phase 2: Fehlerbehandlung (DIESE WOCHE)
- [ ] Error Boundary erweitern
- [ ] tRPC Error Handler implementieren
- [ ] Toast-Notifications hinzufügen
- [ ] Error-Seiten erstellen

### Phase 3: Caching (NÄCHSTE WOCHE)
- [ ] Browser-Cache konfigurieren
- [ ] Redis-Integration hinzufügen
- [ ] Cache-Invalidation implementieren
- [ ] Cache-Metriken überwachen

### Phase 4: Monitoring (SPÄTER)
- [ ] Health-Check Dashboard
- [ ] Error-Logging
- [ ] Performance-Monitoring
- [ ] Alerts konfigurieren

---

## Erfolgs-Metriken

| Metrik | Aktuell | Ziel | Status |
|--------|---------|------|--------|
| Datenbankverbindung | ❌ Fehler | ✅ OK | Zu tun |
| Error-Handling | 30% | 100% | Zu tun |
| Cache Hit Rate | 0% | 80% | Zu tun |
| Response-Zeit | >2s | <500ms | Zu tun |
| Verfügbarkeit | 50% | 99.9% | Zu tun |
