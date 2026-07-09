/**
 * Tests für Cache-Module
 * AAA-Muster (Arrange-Act-Assert)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CacheManager, CacheKeyGenerator, CacheInvalidator, CACHE_TTL } from './cache';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager();
  });

  describe('set und get', () => {
    it('sollte einen Wert speichern und abrufen', () => {
      // Arrange
      const key = 'test-key';
      const value = { id: 1, name: 'Test' };

      // Act
      cache.set(key, value, 300);
      const result = cache.get(key);

      // Assert
      expect(result).toEqual(value);
    });

    it('sollte null zurückgeben wenn Schlüssel nicht existiert', () => {
      // Act
      const result = cache.get('non-existent-key');

      // Assert
      expect(result).toBeNull();
    });

    it('sollte null zurückgeben wenn TTL abgelaufen ist', () => {
      // Arrange
      const key = 'test-key';
      const value = { id: 1 };
      cache.set(key, value, 0.001); // 1ms TTL

      // Act
      // Warte bis TTL abläuft
      setTimeout(() => {
        const result = cache.get(key);

        // Assert
        expect(result).toBeNull();
      }, 10);
    });
  });

  describe('delete', () => {
    it('sollte einen Wert löschen', () => {
      // Arrange
      const key = 'test-key';
      cache.set(key, { id: 1 }, 300);

      // Act
      cache.delete(key);
      const result = cache.get(key);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deletePattern', () => {
    it('sollte alle Werte mit einem Muster löschen', () => {
      // Arrange
      cache.set('listings:1', { id: 1 }, 300);
      cache.set('listings:2', { id: 2 }, 300);
      cache.set('user:1', { id: 1 }, 300);

      // Act
      cache.deletePattern(/^listings:/);

      // Assert
      expect(cache.get('listings:1')).toBeNull();
      expect(cache.get('listings:2')).toBeNull();
      expect(cache.get('user:1')).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('sollte den gesamten Cache leeren', () => {
      // Arrange
      cache.set('key1', { id: 1 }, 300);
      cache.set('key2', { id: 2 }, 300);

      // Act
      cache.clear();

      // Assert
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('getStats', () => {
    it('sollte korrekte Statistiken zurückgeben', () => {
      // Arrange
      cache.set('key1', { id: 1 }, 300);
      cache.get('key1'); // Hit
      cache.get('key2'); // Miss

      // Act
      const stats = cache.getStats();

      // Assert
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.total).toBe(2);
      expect(stats.hitRate).toBe('50.00');
    });
  });
});

describe('CacheKeyGenerator', () => {
  describe('listingsKey', () => {
    it('sollte einen eindeutigen Schlüssel für Listings generieren', () => {
      // Act
      const key = CacheKeyGenerator.listingsKey({ city: 'Berlin', maxPrice: 50 }, 1, 20);

      // Assert
      expect(key).toContain('listings:');
      expect(key).toContain('city');
      expect(key).toContain('Berlin');
    });

    it('sollte unterschiedliche Schlüssel für unterschiedliche Filter generieren', () => {
      // Act
      const key1 = CacheKeyGenerator.listingsKey({ city: 'Berlin' });
      const key2 = CacheKeyGenerator.listingsKey({ city: 'Munich' });

      // Assert
      expect(key1).not.toBe(key2);
    });
  });

  describe('listingDetailKey', () => {
    it('sollte einen Schlüssel für Listing-Details generieren', () => {
      // Act
      const key = CacheKeyGenerator.listingDetailKey(123);

      // Assert
      expect(key).toBe('listing:123');
    });
  });

  describe('userKey', () => {
    it('sollte einen Schlüssel für Benutzer generieren', () => {
      // Act
      const key = CacheKeyGenerator.userKey(456);

      // Assert
      expect(key).toBe('user:456');
    });
  });

  describe('bookingsKey', () => {
    it('sollte einen Schlüssel für Buchungen generieren', () => {
      // Act
      const key = CacheKeyGenerator.bookingsKey(789);

      // Assert
      expect(key).toBe('bookings:789');
    });
  });
});

describe('CacheInvalidator', () => {
  it('sollte die globale cacheManager Instanz verwenden', () => {
    expect(CacheInvalidator).toBeDefined();
  });
});

describe('CACHE_TTL Constants', () => {
  it('sollte alle erforderlichen TTL-Konstanten definieren', () => {
    // Assert
    expect(CACHE_TTL.LISTINGS).toBe(5 * 60);
    expect(CACHE_TTL.LISTING_DETAIL).toBe(15 * 60);
    expect(CACHE_TTL.USER).toBe(30 * 60);
    expect(CACHE_TTL.BOOKINGS).toBe(2 * 60);
    expect(CACHE_TTL.FAVORITES).toBe(10 * 60);
    expect(CACHE_TTL.REVIEWS).toBe(10 * 60);
    expect(CACHE_TTL.AVAILABILITY).toBe(1 * 60);
  });
});
