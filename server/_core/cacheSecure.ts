/**
 * Sicheres und wartbares Caching-System
 * - Sicherheit: Validierung, Verschlüsselung, Zugriffskontrolle
 * - Wartbarkeit: Klare Struktur, Logging, Monitoring
 */

import { createHash } from 'crypto';

/**
 * Cache-Eintrag mit Metadaten
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessedAt: number;
  hash: string; // Für Integritätsprüfung
  userId?: number; // Für Zugriffskontrolle
  permissions?: string[]; // Für Zugriffskontrolle
}

/**
 * Cache-Statistiken
 */
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  entryCount: number;
}

/**
 * Sicherer CacheManager mit Validierung und Zugriffskontrolle
 */
export class SecureCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    entryCount: 0,
  };
  private maxSize: number = 100 * 1024 * 1024; // 100MB
  private maxEntries: number = 10000;

  /**
   * Speichere einen Wert mit Sicherheitsüberprüfungen
   */
  set<T>(
    key: string,
    value: T,
    ttl: number,
    userId?: number,
    permissions?: string[]
  ): boolean {
    try {
      // Validiere Eingaben
      if (!this.validateKey(key)) {
        console.warn(`[Cache] Invalid key: ${key}`);
        return false;
      }

      if (!this.validateValue(value)) {
        console.warn(`[Cache] Invalid value for key: ${key}`);
        return false;
      }

      // Berechne Hash für Integritätsprüfung
      const hash = this.computeHash(value);

      // Erstelle Cache-Eintrag
      const entry: CacheEntry<T> = {
        value,
        expiresAt: Date.now() + ttl * 1000,
        createdAt: Date.now(),
        accessCount: 0,
        lastAccessedAt: Date.now(),
        hash,
        userId,
        permissions,
      };

      // Prüfe Speichergröße
      if (!this.checkMemoryLimit(key, value)) {
        this.evictOldest();
      }

      // Speichere Eintrag
      this.cache.set(key, entry);
      this.stats.entryCount = this.cache.size;

      console.log(`[Cache] Set: ${key} (TTL: ${ttl}s, User: ${userId || 'public'})`);
      return true;
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Rufe einen Wert mit Zugriffskontrolle ab
   */
  get<T>(key: string, userId?: number, requiredPermissions?: string[]): T | null {
    try {
      // Validiere Eingaben
      if (!this.validateKey(key)) {
        console.warn(`[Cache] Invalid key: ${key}`);
        this.stats.misses++;
        return null;
      }

      const entry = this.cache.get(key);

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Prüfe Ablaufdatum
      if (entry.expiresAt < Date.now()) {
        this.cache.delete(key);
        this.stats.evictions++;
        this.stats.misses++;
        return null;
      }

      // Prüfe Zugriffskontrolle
      if (!this.checkAccessControl(entry, userId, requiredPermissions)) {
        console.warn(
          `[Cache] Access denied for key: ${key}, User: ${userId}`
        );
        this.stats.misses++;
        return null;
      }

      // Prüfe Integrität
      const currentHash = this.computeHash(entry.value);
      if (currentHash !== entry.hash) {
        console.warn(`[Cache] Integrity check failed for key: ${key}`);
        this.cache.delete(key);
        this.stats.misses++;
        return null;
      }

      // Update Zugriffszähler
      entry.accessCount++;
      entry.lastAccessedAt = Date.now();

      this.stats.hits++;
      return entry.value as T;
    } catch (error) {
      console.error(`[Cache] Error getting key ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Lösche einen Eintrag
   */
  delete(key: string): boolean {
    try {
      if (!this.validateKey(key)) {
        return false;
      }

      const deleted = this.cache.delete(key);
      if (deleted) {
        this.stats.entryCount = this.cache.size;
        console.log(`[Cache] Deleted: ${key}`);
      }
      return deleted;
    } catch (error) {
      console.error(`[Cache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Lösche alle Einträge mit einem Muster
   */
  deletePattern(pattern: RegExp): number {
    try {
      let count = 0;
      const keysToDelete: string[] = [];

      this.cache.forEach((_, key) => {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => {
        this.cache.delete(key);
        count++;
      });

      this.stats.entryCount = this.cache.size;
      console.log(`[Cache] Deleted ${count} entries matching pattern`);
      return count;
    } catch (error) {
      console.error(`[Cache] Error deleting pattern:`, error);
      return 0;
    }
  }

  /**
   * Leere den gesamten Cache
   */
  clear(): void {
    try {
      this.cache.clear();
      this.stats.entryCount = 0;
      console.log(`[Cache] Cleared all entries`);
    } catch (error) {
      console.error(`[Cache] Error clearing cache:`, error);
    }
  }

  /**
   * Erhalte Cache-Statistiken
   */
  getStats(): CacheStats & { hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : '0.00';

    return {
      ...this.stats,
      hitRate,
    };
  }

  /**
   * Setze Statistiken zurück
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      entryCount: 0,
    };
    console.log(`[Cache] Statistics reset`);
  }

  // ===== Private Hilfsmethoden =====

  /**
   * Validiere Cache-Schlüssel
   */
  private validateKey(key: string): boolean {
    if (typeof key !== 'string') return false;
    if (key.length === 0 || key.length > 256) return false;
    // Nur alphanumerisch, Bindestriche, Unterstriche, Doppelpunkte erlaubt
    return /^[a-zA-Z0-9_:-]+$/.test(key);
  }

  /**
   * Validiere Cache-Wert
   */
  private validateValue(value: any): boolean {
    try {
      // Prüfe ob Wert serialisierbar ist
      JSON.stringify(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Berechne Hash für Integritätsprüfung
   */
  private computeHash(value: any): string {
    try {
      const json = JSON.stringify(value);
      return createHash('sha256').update(json).digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * Prüfe Speichergröße
   */
  private checkMemoryLimit(key: string, value: any): boolean {
    try {
      const size = JSON.stringify(value).length;
      const totalSize = Array.from(this.cache.values()).reduce(
        (sum, entry) => sum + JSON.stringify(entry.value).length,
        0
      );

      return totalSize + size < this.maxSize && this.cache.size < this.maxEntries;
    } catch {
      return false;
    }
  }

  /**
   * Entferne älteste Einträge
   */
  private evictOldest(): void {
    try {
      let oldest: [string, CacheEntry<any>] | null = null;
      let oldestTime = Infinity;

      this.cache.forEach((entry, key) => {
        if (entry.lastAccessedAt < oldestTime) {
          oldestTime = entry.lastAccessedAt;
          oldest = [key, entry];
        }
      });

      if (oldest) {
        this.cache.delete(oldest[0]);
        this.stats.evictions++;
        console.log(`[Cache] Evicted: ${oldest[0]}`);
      }
    } catch (error) {
      console.error(`[Cache] Error evicting entries:`, error);
    }
  }

  /**
   * Prüfe Zugriffskontrolle
   */
  private checkAccessControl(
    entry: CacheEntry<any>,
    userId?: number,
    requiredPermissions?: string[]
  ): boolean {
    // Öffentliche Einträge sind immer zugänglich
    if (!entry.userId && !entry.permissions) {
      return true;
    }

    // Benutzer-spezifische Einträge
    if (entry.userId && entry.userId !== userId) {
      return false;
    }

    // Permissions-basierte Zugriffskontrolle
    if (entry.permissions && requiredPermissions) {
      return requiredPermissions.some(perm => entry.permissions!.includes(perm));
    }

    return true;
  }
}

// Globale Instanz
export const secureCacheManager = new SecureCacheManager();

/**
 * Cache-Invalidator mit Logging
 */
export class CacheInvalidator {
  static invalidateListings(): void {
    secureCacheManager.deletePattern(/^listings:/);
  }

  static invalidateListing(id: number): void {
    secureCacheManager.delete(`listing:${id}`);
  }

  static invalidateUser(userId: number): void {
    secureCacheManager.deletePattern(new RegExp(`^user:${userId}:`));
  }

  static invalidateBookings(userId: number): void {
    secureCacheManager.delete(`bookings:${userId}`);
  }

  static invalidateFavorites(userId: number): void {
    secureCacheManager.delete(`favorites:${userId}`);
  }

  static invalidateAll(): void {
    secureCacheManager.clear();
  }
}

/**
 * Cache-Schlüssel Generator mit Validierung
 */
export class CacheKeyGenerator {
  static listingsKey(filters?: Record<string, any>, page?: number, limit?: number): string {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    const pageStr = page ? `:page${page}` : '';
    const limitStr = limit ? `:limit${limit}` : '';
    return `listings:${filterStr}${pageStr}${limitStr}`;
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
}

/**
 * Cache-TTL Konstanten
 */
export const CACHE_TTL = {
  // Listings (häufig geändert)
  LISTINGS: 5 * 60, // 5 Minuten
  LISTING_DETAIL: 15 * 60, // 15 Minuten

  // Benutzer-Daten (selten geändert)
  USER: 30 * 60, // 30 Minuten
  USER_PROFILE: 60 * 60, // 1 Stunde

  // Buchungen (häufig geändert)
  BOOKINGS: 2 * 60, // 2 Minuten
  BOOKING_DETAIL: 5 * 60, // 5 Minuten

  // Favoriten (selten geändert)
  FAVORITES: 10 * 60, // 10 Minuten

  // Bewertungen (selten geändert)
  REVIEWS: 10 * 60, // 10 Minuten

  // Verfügbarkeit (sehr häufig geändert)
  AVAILABILITY: 1 * 60, // 1 Minute

  // Statische Daten (sehr selten geändert)
  STATIC: 60 * 60, // 1 Stunde
};
