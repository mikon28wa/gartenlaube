/**
 * Tests für SecureCacheManager
 * AAA-Muster (Arrange-Act-Assert)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SecureCacheManager, CacheKeyGenerator, CacheInvalidator, CACHE_TTL } from './cacheSecure';

describe('SecureCacheManager', () => {
  let cache: SecureCacheManager;

  beforeEach(() => {
    cache = new SecureCacheManager();
  });

  describe('set und get', () => {
    it('sollte einen Wert speichern und abrufen', () => {
      // Arrange
      const key = 'test-key';
      const value = { id: 1, name: 'Test' };

      // Act
      const setResult = cache.set(key, value, 300);
      const getResult = cache.get(key);

      // Assert
      expect(setResult).toBe(true);
      expect(getResult).toEqual(value);
    });

    it('sollte null zurückgeben wenn Schlüssel nicht existiert', () => {
      // Act
      const result = cache.get('non-existent-key');

      // Assert
      expect(result).toBeNull();
    });

    it('sollte ungültige Schlüssel ablehnen', () => {
      // Arrange
      const invalidKey = ''; // Leerer Schlüssel
      const value = { id: 1 };

      // Act
      const result = cache.set(invalidKey, value, 300);

      // Assert
      expect(result).toBe(false);
    });

    it('sollte nicht-serialisierbare Werte ablehnen', () => {
      // Arrange
      const key = 'test-key';
      const circularValue: any = { id: 1 };
      circularValue.self = circularValue; // Zirkuläre Referenz

      // Act
      const result = cache.set(key, circularValue, 300);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Zugriffskontrolle', () => {
    it('sollte öffentliche Einträge allen erlauben', () => {
      // Arrange
      const key = 'public-key';
      const value = { id: 1 };
      cache.set(key, value, 300); // Keine userId

      // Act
      const result = cache.get(key, 123); // Andere userId

      // Assert
      expect(result).toEqual(value);
    });

    it('sollte benutzer-spezifische Einträge blockieren', () => {
      // Arrange
      const key = 'user-key';
      const value = { id: 1 };
      cache.set(key, value, 300, 123); // userId 123

      // Act
      const result = cache.get(key, 456); // Andere userId

      // Assert
      expect(result).toBeNull();
    });

    it('sollte benutzer-spezifische Einträge dem Besitzer erlauben', () => {
      // Arrange
      const key = 'user-key';
      const value = { id: 1 };
      cache.set(key, value, 300, 123); // userId 123

      // Act
      const result = cache.get(key, 123); // Gleiche userId

      // Assert
      expect(result).toEqual(value);
    });
  });

  describe('Integritätsprüfung', () => {
    it('sollte Datenintegrität überprüfen', () => {
      // Arrange
      const key = 'integrity-key';
      const value = { id: 1, data: 'test' };
      cache.set(key, value, 300);

      // Act - Manipuliere den Cache direkt (simuliere Corruption)
      const cacheAny = cache as any;
      const entry = cacheAny.cache.get(key);
      entry.hash = 'invalid-hash'; // Beschädige den Hash

      const result = cache.get(key);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('sollte einen Wert löschen', () => {
      // Arrange
      const key = 'test-key';
      cache.set(key, { id: 1 }, 300);

      // Act
      const deleteResult = cache.delete(key);
      const getResult = cache.get(key);

      // Assert
      expect(deleteResult).toBe(true);
      expect(getResult).toBeNull();
    });

    it('sollte false zurückgeben wenn Schlüssel nicht existiert', () => {
      // Act
      const result = cache.delete('non-existent-key');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('deletePattern', () => {
    it('sollte alle Werte mit einem Muster löschen', () => {
      // Arrange
      cache.set('listings:1', { id: 1 }, 300);
      cache.set('listings:2', { id: 2 }, 300);
      cache.set('user:1', { id: 1 }, 300);

      // Act
      const count = cache.deletePattern(/^listings:/);

      // Assert
      expect(count).toBe(2);
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
      expect(stats.entryCount).toBe(1);
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

  describe('Spezifische Schlüssel', () => {
    it('sollte einen Schlüssel für Listing-Details generieren', () => {
      // Act
      const key = CacheKeyGenerator.listingDetailKey(123);

      // Assert
      expect(key).toBe('listing:123');
    });

    it('sollte einen Schlüssel für Benutzer generieren', () => {
      // Act
      const key = CacheKeyGenerator.userKey(456);

      // Assert
      expect(key).toBe('user:456');
    });

    it('sollte einen Schlüssel für Buchungen generieren', () => {
      // Act
      const key = CacheKeyGenerator.bookingsKey(789);

      // Assert
      expect(key).toBe('bookings:789');
    });

    it('sollte einen Schlüssel für Favoriten generieren', () => {
      // Act
      const key = CacheKeyGenerator.favoritesKey(111);

      // Assert
      expect(key).toBe('favorites:111');
    });

    it('sollte einen Schlüssel für Bewertungen generieren', () => {
      // Act
      const key = CacheKeyGenerator.reviewsKey(222);

      // Assert
      expect(key).toBe('reviews:222');
    });
  });
});

describe('CacheInvalidator', () => {
  it('sollte Invalidator-Methoden definieren', () => {
    // Assert
    expect(CacheInvalidator.invalidateListings).toBeDefined();
    expect(CacheInvalidator.invalidateListing).toBeDefined();
    expect(CacheInvalidator.invalidateUser).toBeDefined();
    expect(CacheInvalidator.invalidateBookings).toBeDefined();
    expect(CacheInvalidator.invalidateFavorites).toBeDefined();
    expect(CacheInvalidator.invalidateAll).toBeDefined();
  });
});

describe('CACHE_TTL', () => {
  it('sollte alle erforderlichen TTL-Konstanten definieren', () => {
    // Assert
    expect(CACHE_TTL.LISTINGS).toBe(5 * 60);
    expect(CACHE_TTL.LISTING_DETAIL).toBe(15 * 60);
    expect(CACHE_TTL.USER).toBe(30 * 60);
    expect(CACHE_TTL.USER_PROFILE).toBe(60 * 60);
    expect(CACHE_TTL.BOOKINGS).toBe(2 * 60);
    expect(CACHE_TTL.BOOKING_DETAIL).toBe(5 * 60);
    expect(CACHE_TTL.FAVORITES).toBe(10 * 60);
    expect(CACHE_TTL.REVIEWS).toBe(10 * 60);
    expect(CACHE_TTL.AVAILABILITY).toBe(1 * 60);
    expect(CACHE_TTL.STATIC).toBe(60 * 60);
  });
});
