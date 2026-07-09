/**
 * Performance-Optimierungs-Utilities
 * - Datenbankindizes
 * - Query-Optimierungen
 * - Memory-Optimierungen
 */

import { sql } from 'drizzle-orm';

/**
 * SQL-Statements für Datenbankindizes
 */
export const DATABASE_INDEXES = {
  // Gartenlauben Indizes
  gartenlauben_city: sql`CREATE INDEX IF NOT EXISTS idx_gartenlauben_city ON gartenlauben(city)`,
  gartenlauben_price: sql`CREATE INDEX IF NOT EXISTS idx_gartenlauben_price ON gartenlauben(pricePerNight)`,
  gartenlauben_distance: sql`CREATE INDEX IF NOT EXISTS idx_gartenlauben_distance ON gartenlauben(distanceToRadweg)`,
  gartenlauben_active_featured: sql`CREATE INDEX IF NOT EXISTS idx_gartenlauben_active_featured ON gartenlauben(isActive, isFeatured)`,
  gartenlauben_host: sql`CREATE INDEX IF NOT EXISTS idx_gartenlauben_host ON gartenlauben(hostId)`,

  // Buchungen Indizes
  bookings_user: sql`CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(userId)`,
  bookings_listing: sql`CREATE INDEX IF NOT EXISTS idx_bookings_listing ON bookings(listingId)`,
  bookings_status: sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`,
  bookings_dates: sql`CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(checkInDate, checkOutDate)`,

  // Bewertungen Indizes
  reviews_listing: sql`CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listingId)`,
  reviews_user: sql`CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(userId)`,

  // Favoriten Indizes
  favorites_user: sql`CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(userId)`,
  favorites_listing: sql`CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listingId)`,

  // Verfügbarkeit Indizes
  availability_listing: sql`CREATE INDEX IF NOT EXISTS idx_availability_listing ON availability(listingId)`,
  availability_dates: sql`CREATE INDEX IF NOT EXISTS idx_availability_dates ON availability(date)`,
};

/**
 * Performance-Metriken für Monitoring
 */
export interface PerformanceMetrics {
  queryTime: number; // ms
  memoryUsed: number; // bytes
  itemsProcessed: number;
  cacheHitRate: number; // 0-100%
  timestamp: number;
}

/**
 * Performance-Tracker
 */
export class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private maxMetricsPerKey = 1000;

  /**
   * Erfasse eine Performance-Metrik
   */
  recordMetric(key: string, metric: PerformanceMetrics): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metrics = this.metrics.get(key)!;
    metrics.push(metric);

    // Behalte nur die letzten N Metriken
    if (metrics.length > this.maxMetricsPerKey) {
      metrics.shift();
    }
  }

  /**
   * Erhalte Durchschnitts-Metriken
   */
  getAverageMetrics(key: string): PerformanceMetrics | null {
    const metrics = this.metrics.get(key);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const sum = metrics.reduce(
      (acc, m) => ({
        queryTime: acc.queryTime + m.queryTime,
        memoryUsed: acc.memoryUsed + m.memoryUsed,
        itemsProcessed: acc.itemsProcessed + m.itemsProcessed,
        cacheHitRate: acc.cacheHitRate + m.cacheHitRate,
        timestamp: Date.now(),
      }),
      {
        queryTime: 0,
        memoryUsed: 0,
        itemsProcessed: 0,
        cacheHitRate: 0,
        timestamp: 0,
      }
    );

    return {
      queryTime: sum.queryTime / metrics.length,
      memoryUsed: sum.memoryUsed / metrics.length,
      itemsProcessed: sum.itemsProcessed / metrics.length,
      cacheHitRate: sum.cacheHitRate / metrics.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Erhalte alle Metriken für einen Key
   */
  getMetrics(key: string): PerformanceMetrics[] {
    return this.metrics.get(key) || [];
  }

  /**
   * Lösche Metriken
   */
  clearMetrics(key?: string): void {
    if (key) {
      this.metrics.delete(key);
    } else {
      this.metrics.clear();
    }
  }
}

/**
 * Query-Optimierungs-Utilities
 */
export class QueryOptimizer {
  /**
   * Generiere eine optimierte SELECT-Query mit nur benötigten Spalten
   */
  static selectOptimized(columns: string[]): string {
    return `SELECT ${columns.join(', ')} FROM gartenlauben`;
  }

  /**
   * Generiere eine Query mit JOIN für Gastgeber-Daten
   */
  static selectWithHost(): string {
    return `
      SELECT 
        g.id, g.hostId, g.title, g.description, g.pricePerNight, 
        g.maxGuests, g.latitude, g.longitude, g.address, g.city, 
        g.postalCode, g.distanceToRadweg, g.amenities, g.images, 
        g.isActive, g.isFeatured, g.createdAt, g.updatedAt,
        u.name as hostName, u.email as hostEmail
      FROM gartenlauben g
      LEFT JOIN users u ON g.hostId = u.id
      WHERE g.isActive = 1
    `;
  }

  /**
   * Generiere eine Query mit Pagination
   */
  static selectWithPagination(
    offset: number,
    limit: number,
    sortBy: string = 'isFeatured DESC'
  ): string {
    return `
      SELECT * FROM gartenlauben
      WHERE isActive = 1
      ORDER BY ${sortBy}
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
}

/**
 * Memory-Optimierungs-Utilities
 */
export class MemoryOptimizer {
  /**
   * Berechne die Größe eines Objekts in Bytes
   */
  static getObjectSize(obj: any): number {
    const seen = new WeakSet();

    function sizeOf(object: any): number {
      let bytes = 0;

      const objectList: any[] = [];
      const stack = [object];

      while (stack.length) {
        let value = stack.pop();

        if (typeof value === 'boolean') {
          bytes += 4;
        } else if (typeof value === 'string') {
          bytes += value.length * 2;
        } else if (typeof value === 'number') {
          bytes += 8;
        } else if (typeof value === 'object' && value !== null) {
          if (!seen.has(value)) {
            seen.add(value);

            objectList.push(value);

            if (Array.isArray(value)) {
              for (let i = 0; i < value.length; i++) {
                stack.push(value[i]);
              }
            } else {
              for (const prop in value) {
                if (value.hasOwnProperty(prop)) {
                  stack.push(value[prop]);
                }
              }
            }
          }
        }
      }

      return bytes;
    }

    return sizeOf(obj);
  }

  /**
   * Normalisiere Daten um Speicher zu sparen
   */
  static normalizeData(listingsArray: any[]): {
    listings: Map<number, any>;
    hosts: Map<number, any>;
  } {
    const listingsMap = new Map<number, any>();
    const hosts = new Map<number, any>();

    for (const listing of listingsArray) {
      const { hostId, hostName, hostEmail, ...listingData } = listing;

      listingsMap.set(listing.id, listingData);

      if (hostId && !hosts.has(hostId)) {
        hosts.set(hostId, {
          id: hostId,
          name: hostName,
          email: hostEmail,
        });
      }
    }

    return { listings: listingsMap, hosts };
  }

  /**
   * Komprimiere Strings durch Interning
   */
  static internStrings(obj: any, stringPool = new Map<string, string>()): any {
    if (typeof obj === 'string') {
      if (stringPool.has(obj)) {
        return stringPool.get(obj)!;
      }
      stringPool.set(obj, obj);
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.internStrings(item, stringPool));
    }

    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = this.internStrings(obj[key], stringPool);
        }
      }
      return result;
    }

    return obj;
  }
}

/**
 * Globale Performance-Tracker-Instanz
 */
export const performanceTracker = new PerformanceTracker();

/**
 * Performance-Monitoring Decorator
 */
export function monitorPerformance(key: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;

      try {
        const result = await originalMethod.apply(this, args);

        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;

        performanceTracker.recordMetric(key, {
          queryTime: endTime - startTime,
          memoryUsed: endMemory - startMemory,
          itemsProcessed: Array.isArray(result) ? result.length : 1,
          cacheHitRate: 0,
          timestamp: Date.now(),
        });

        return result;
      } catch (error) {
        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;

        performanceTracker.recordMetric(key, {
          queryTime: endTime - startTime,
          memoryUsed: endMemory - startMemory,
          itemsProcessed: 0,
          cacheHitRate: 0,
          timestamp: Date.now(),
        });

        throw error;
      }
    };

    return descriptor;
  };
}
