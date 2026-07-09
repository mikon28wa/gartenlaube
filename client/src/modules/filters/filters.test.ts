/**
 * Filter Module - Tests
 * Umfassende Tests für Filter-Typen, Validierung und Logik
 */

import { describe, it, expect } from 'vitest';
import { FilterValidator } from './filterValidation';
import { FilterLogic } from './filterLogic';
import { DEFAULT_FILTERS, FILTER_CONSTRAINTS } from './filterTypes';

describe('FilterValidator', () => {
  describe('validateCity', () => {
    it('sollte valide Stadt akzeptieren', () => {
      const error = FilterValidator.validateCity('Berlin');
      expect(error).toBeNull();
    });

    it('sollte Stadt mit Umlauten akzeptieren', () => {
      const error = FilterValidator.validateCity('München');
      expect(error).toBeNull();
    });

    it('sollte Stadt mit Bindestrich akzeptieren', () => {
      const error = FilterValidator.validateCity('Bad-Homburg');
      expect(error).toBeNull();
    });

    it('sollte zu lange Stadt ablehnen', () => {
      const longCity = 'a'.repeat(FILTER_CONSTRAINTS.MAX_CITY_LENGTH + 1);
      const error = FilterValidator.validateCity(longCity);
      expect(error).not.toBeNull();
      expect(error?.field).toBe('city');
    });

    it('sollte ungültige Zeichen ablehnen', () => {
      const error = FilterValidator.validateCity('Berlin@#$');
      expect(error).not.toBeNull();
    });
  });

  describe('validateMinPrice', () => {
    it('sollte validen Preis akzeptieren', () => {
      const error = FilterValidator.validateMinPrice(50);
      expect(error).toBeNull();
    });

    it('sollte negativen Preis ablehnen', () => {
      const error = FilterValidator.validateMinPrice(-10);
      expect(error).not.toBeNull();
    });

    it('sollte NaN ablehnen', () => {
      const error = FilterValidator.validateMinPrice(NaN);
      expect(error).not.toBeNull();
    });
  });

  describe('validateMaxPrice', () => {
    it('sollte validen Preis akzeptieren', () => {
      const error = FilterValidator.validateMaxPrice(150);
      expect(error).toBeNull();
    });

    it('sollte zu hohen Preis ablehnen', () => {
      const error = FilterValidator.validateMaxPrice(FILTER_CONSTRAINTS.MAX_PRICE + 1);
      expect(error).not.toBeNull();
    });
  });

  describe('validateDistance', () => {
    it('sollte valide Entfernung akzeptieren', () => {
      const error = FilterValidator.validateDistance(5);
      expect(error).toBeNull();
    });

    it('sollte negative Entfernung ablehnen', () => {
      const error = FilterValidator.validateDistance(-1);
      expect(error).not.toBeNull();
    });

    it('sollte zu große Entfernung ablehnen', () => {
      const error = FilterValidator.validateDistance(FILTER_CONSTRAINTS.MAX_DISTANCE + 1);
      expect(error).not.toBeNull();
    });
  });

  describe('validateAmenities', () => {
    it('sollte valide Ausstattungen akzeptieren', () => {
      const error = FilterValidator.validateAmenities(['wifi', 'parking']);
      expect(error).toBeNull();
    });

    it('sollte leeres Array akzeptieren', () => {
      const error = FilterValidator.validateAmenities([]);
      expect(error).toBeNull();
    });

    it('sollte ungültige Ausstattungen ablehnen', () => {
      const error = FilterValidator.validateAmenities(['wifi', 'invalid-amenity']);
      expect(error).not.toBeNull();
    });

    it('sollte Non-Array ablehnen', () => {
      const error = FilterValidator.validateAmenities('wifi' as any);
      expect(error).not.toBeNull();
    });
  });

  describe('sanitizeFilters', () => {
    it('sollte Stadt trimmen und zu Lowercase konvertieren', () => {
      const sanitized = FilterValidator.sanitizeFilters({ city: '  Berlin  ' });
      expect(sanitized.city).toBe('berlin');
    });

    it('sollte Preise begrenzen', () => {
      const sanitized = FilterValidator.sanitizeFilters({
        minPrice: -100,
        maxPrice: 1000,
      });
      expect(sanitized.minPrice).toBe(FILTER_CONSTRAINTS.MIN_PRICE);
      expect(sanitized.maxPrice).toBe(FILTER_CONSTRAINTS.MAX_PRICE);
    });

    it('sollte Entfernung begrenzen', () => {
      const sanitized = FilterValidator.sanitizeFilters({
        maxDistanceToRadweg: 500,
      });
      expect(sanitized.maxDistanceToRadweg).toBe(FILTER_CONSTRAINTS.MAX_DISTANCE);
    });
  });
});

describe('FilterLogic', () => {
  describe('mergeFilters', () => {
    it('sollte Filter zusammenführen', () => {
      const base = { ...DEFAULT_FILTERS, city: 'Berlin' };
      const updates = { maxPrice: 100 };
      const merged = FilterLogic.mergeFilters(base, updates);

      expect(merged.city).toBe('Berlin');
      expect(merged.maxPrice).toBe(100);
    });

    it('sollte Updates überschreiben', () => {
      const base = { ...DEFAULT_FILTERS, city: 'Berlin' };
      const updates = { city: 'München' };
      const merged = FilterLogic.mergeFilters(base, updates);

      expect(merged.city).toBe('München');
    });
  });

  describe('hasActiveFilters', () => {
    it('sollte false zurückgeben für Default-Filter', () => {
      const result = FilterLogic.hasActiveFilters(DEFAULT_FILTERS);
      expect(result).toBe(false);
    });

    it('sollte true zurückgeben bei Stadt-Filter', () => {
      const filters = { ...DEFAULT_FILTERS, city: 'Berlin' };
      const result = FilterLogic.hasActiveFilters(filters);
      expect(result).toBe(true);
    });

    it('sollte true zurückgeben bei Preis-Filter', () => {
      const filters = { ...DEFAULT_FILTERS, maxPrice: 100 };
      const result = FilterLogic.hasActiveFilters(filters);
      expect(result).toBe(true);
    });

    it('sollte true zurückgeben bei Ausstattungs-Filter', () => {
      const filters = { ...DEFAULT_FILTERS, amenities: ['wifi'] };
      const result = FilterLogic.hasActiveFilters(filters);
      expect(result).toBe(true);
    });
  });

  describe('filtersToQueryString', () => {
    it('sollte leere Query für Default-Filter erstellen', () => {
      const query = FilterLogic.filtersToQueryString(DEFAULT_FILTERS);
      expect(query).toBe('');
    });

    it('sollte Query mit Stadt erstellen', () => {
      const filters = { ...DEFAULT_FILTERS, city: 'Berlin' };
      const query = FilterLogic.filtersToQueryString(filters);
      expect(query).toContain('city=Berlin');
    });

    it('sollte Query mit mehreren Parametern erstellen', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        city: 'Berlin',
        maxPrice: 100,
        amenities: ['wifi', 'parking'],
      };
      const query = FilterLogic.filtersToQueryString(filters);
      expect(query).toContain('city=Berlin');
      expect(query).toContain('maxPrice=100');
      expect(query).toContain('amenities=wifi%2Cparking');
    });
  });

  describe('queryStringToFilters', () => {
    it('sollte Query-String zu Filtern parsen', () => {
      const query = 'city=Berlin&maxPrice=100&amenities=wifi,parking';
      const filters = FilterLogic.queryStringToFilters(query);

      expect(filters.city).toBe('Berlin');
      expect(filters.maxPrice).toBe(100);
      expect(filters.amenities).toEqual(['wifi', 'parking']);
    });

    it('sollte Default-Filter bei leerer Query zurückgeben', () => {
      const filters = FilterLogic.queryStringToFilters('');
      expect(filters).toEqual(DEFAULT_FILTERS);
    });
  });

  describe('getFilterDescription', () => {
    it('sollte leere Beschreibung für Default-Filter zurückgeben', () => {
      const descriptions = FilterLogic.getFilterDescription(DEFAULT_FILTERS);
      expect(descriptions).toEqual([]);
    });

    it('sollte Stadt-Beschreibung erstellen', () => {
      const filters = { ...DEFAULT_FILTERS, city: 'Berlin' };
      const descriptions = FilterLogic.getFilterDescription(filters);
      expect(descriptions).toContain('in Berlin');
    });

    it('sollte Preis-Beschreibung erstellen', () => {
      const filters = { ...DEFAULT_FILTERS, maxPrice: 100 };
      const descriptions = FilterLogic.getFilterDescription(filters);
      expect(descriptions.some((d) => d.includes('€'))).toBe(true);
    });

    it('sollte mehrere Beschreibungen erstellen', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        city: 'Berlin',
        maxPrice: 100,
        amenities: ['wifi', 'parking'],
      };
      const descriptions = FilterLogic.getFilterDescription(filters);
      expect(descriptions.length).toBeGreaterThan(1);
    });
  });
});
