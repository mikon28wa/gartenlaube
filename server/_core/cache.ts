/**
 * Server-Cache Module
 * Implementiert In-Memory Cache für häufig abgerufene Daten
 */

// FilterState wird als any typisiert um Zirkuläre Abhängigkeiten zu vermeiden

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-Memory Cache Manager
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  /**
   * Setzt einen Wert in den Cache
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
    this.stats.sets++;
  }

  /**
   * Holt einen Wert aus dem Cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Prüfe ob TTL abgelaufen ist
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Löscht einen Wert aus dem Cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.stats.deletes++;
  }

  /**
   * Löscht alle Werte mit einem Muster
   */
  deletePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.stats.deletes++;
    });
  }

  /**
   * Leert den gesamten Cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
  }

  /**
   * Gibt Cache-Statistiken zurück
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total === 0 ? 0 : (this.stats.hits / total) * 100;

    return {
      ...this.stats,
      total,
      hitRate: hitRate.toFixed(2),
      size: this.cache.size,
    };
  }

  /**
   * Setzt Statistiken zurück
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }
}

// Globale Cache-Instanz
export const cacheManager = new CacheManager();

/**
 * Cache-Key Generator
 */
export class CacheKeyGenerator {
  static listingsKey(filters: Record<string, any>, page: number = 1, limit: number = 20): string {
    const filterStr = JSON.stringify(filters).replace(/"/g, '');
    return `listings:${filterStr}:${page}:${limit}`;
  }

  static listingDetailKey(id: number): string {
    return `listing:${id}`;
  }

  static userKey(userId: number): string {
    return `user:${userId}`;
  }

  static bookingsKey(userId: number): string {
    return `bookings:${userId}`;
  }

  static favoritesKey(userId: number): string {
    return `favorites:${userId}`;
  }

  static reviewsKey(listingId: number): string {
    return `reviews:${listingId}`;
  }

  static availabilityKey(listingId: number): string {
    return `availability:${listingId}`;
  }
}

/**
 * Cache-Konfiguration
 */
export const CACHE_TTL = {
  LISTINGS: 5 * 60, // 5 Minuten
  LISTING_DETAIL: 15 * 60, // 15 Minuten
  USER: 30 * 60, // 30 Minuten
  BOOKINGS: 2 * 60, // 2 Minuten
  FAVORITES: 10 * 60, // 10 Minuten
  REVIEWS: 10 * 60, // 10 Minuten
  AVAILABILITY: 1 * 60, // 1 Minute
} as const;

/**
 * Cache-Invalidation Utilities
 */
export class CacheInvalidator {
  static invalidateListings(): void {
    cacheManager.deletePattern(/^listings:/);
  }

  static invalidateListing(id: number): void {
    cacheManager.delete(CacheKeyGenerator.listingDetailKey(id));
  }

  static invalidateUser(userId: number): void {
    cacheManager.delete(CacheKeyGenerator.userKey(userId));
  }

  static invalidateBookings(userId: number): void {
    cacheManager.delete(CacheKeyGenerator.bookingsKey(userId));
  }

  static invalidateFavorites(userId: number): void {
    cacheManager.delete(CacheKeyGenerator.favoritesKey(userId));
  }

  static invalidateReviews(listingId: number): void {
    cacheManager.delete(CacheKeyGenerator.reviewsKey(listingId));
  }

  static invalidateAvailability(listingId: number): void {
    cacheManager.delete(CacheKeyGenerator.availabilityKey(listingId));
  }

  static invalidateAll(): void {
    cacheManager.clear();
  }
}
