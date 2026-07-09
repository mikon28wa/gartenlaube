import { renderHook, act } from '@testing-library/react';
import { useListingFilters } from './useListingFilters';

/**
 * Jest-Tests für useListingFilters Hook
 * Verwendet AAA-Muster (Arrange-Act-Assert)
 * Testet das aktuelle Verhalten vor Refaktorierung
 */

describe('useListingFilters Hook', () => {
  describe('Initial State', () => {
    it('should initialize with default filters', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      const { filters } = result.current;

      // Assert
      expect(filters.city).toBeUndefined();
      expect(filters.minPrice).toBeUndefined();
      expect(filters.maxPrice).toBeUndefined();
      expect(filters.maxDistanceToRadweg).toBeUndefined();
      expect(filters.amenities).toEqual([]);
      expect(filters.limit).toBe(20);
      expect(filters.offset).toBe(0);
    });

    it('should start with isFiltered as false', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      const { isFiltered } = result.current;

      // Assert
      expect(isFiltered).toBe(false);
    });
  });

  describe('City Filter', () => {
    it('should update city filter', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setCity('Berlin');
      });

      // Assert
      expect(result.current.filters.city).toBe('Berlin');
      expect(result.current.isFiltered).toBe(true);
    });

    it('should reset offset when city filter changes', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setOffset(5);
      });

      // Act
      act(() => {
        result.current.setCity('Dresden');
      });

      // Assert
      expect(result.current.filters.offset).toBe(0);
    });

    it('should clear city filter with empty string', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setCity('Hamburg');
      });

      // Act
      act(() => {
        result.current.setCity('');
      });

      // Assert
      expect(result.current.filters.city).toBeUndefined();
      expect(result.current.isFiltered).toBe(false);
    });
  });

  describe('Price Filters', () => {
    it('should update minPrice filter', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setMinPrice(30);
      });

      // Assert
      expect(result.current.filters.minPrice).toBe(30);
      expect(result.current.isFiltered).toBe(true);
    });

    it('should update maxPrice filter', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setMaxPrice(100);
      });

      // Assert
      expect(result.current.filters.maxPrice).toBe(100);
      expect(result.current.isFiltered).toBe(true);
    });

    it('should allow both minPrice and maxPrice together', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setMinPrice(30);
        result.current.setMaxPrice(100);
      });

      // Assert
      expect(result.current.filters.minPrice).toBe(30);
      expect(result.current.filters.maxPrice).toBe(100);
      expect(result.current.isFiltered).toBe(true);
    });

    it('should reset offset when price filters change', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setOffset(10);
      });

      // Act
      act(() => {
        result.current.setMinPrice(50);
      });

      // Assert
      expect(result.current.filters.offset).toBe(0);
    });

    it('should clear price filters with undefined', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setMinPrice(30);
        result.current.setMaxPrice(100);
      });

      // Act
      act(() => {
        result.current.setMinPrice(undefined);
        result.current.setMaxPrice(undefined);
      });

      // Assert
      expect(result.current.filters.minPrice).toBeUndefined();
      expect(result.current.filters.maxPrice).toBeUndefined();
      expect(result.current.isFiltered).toBe(false);
    });
  });

  describe('Distance Filter', () => {
    it('should update maxDistanceToRadweg filter', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setMaxDistanceToRadweg(5);
      });

      // Assert
      expect(result.current.filters.maxDistanceToRadweg).toBe(5);
      expect(result.current.isFiltered).toBe(true);
    });

    it('should reset offset when distance filter changes', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setOffset(8);
      });

      // Act
      act(() => {
        result.current.setMaxDistanceToRadweg(3);
      });

      // Assert
      expect(result.current.filters.offset).toBe(0);
    });
  });

  describe('Amenities Filter', () => {
    it('should update amenities filter', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      const amenities = ['wifi', 'parking'];

      // Act
      act(() => {
        result.current.setAmenities(amenities);
      });

      // Assert
      expect(result.current.filters.amenities).toEqual(amenities);
      expect(result.current.isFiltered).toBe(true);
    });

    it('should handle empty amenities array', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setAmenities(['wifi']);
      });

      // Act
      act(() => {
        result.current.setAmenities([]);
      });

      // Assert
      expect(result.current.filters.amenities).toEqual([]);
      expect(result.current.isFiltered).toBe(false);
    });

    it('should reset offset when amenities change', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setOffset(7);
      });

      // Act
      act(() => {
        result.current.setAmenities(['kitchen', 'shower']);
      });

      // Assert
      expect(result.current.filters.offset).toBe(0);
    });
  });

  describe('Pagination', () => {
    it('should update limit', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setLimit(50);
      });

      // Assert
      expect(result.current.filters.limit).toBe(50);
    });

    it('should update offset', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setOffset(10);
      });

      // Assert
      expect(result.current.filters.offset).toBe(10);
    });

    it('should not reset offset when only limit changes', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setOffset(5);
      });

      // Act
      act(() => {
        result.current.setLimit(100);
      });

      // Assert
      expect(result.current.filters.offset).toBe(5);
    });
  });

  describe('Reset Filters', () => {
    it('should reset all filters to default', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setCity('München');
        result.current.setMinPrice(40);
        result.current.setMaxPrice(150);
        result.current.setMaxDistanceToRadweg(10);
        result.current.setAmenities(['wifi', 'parking']);
        result.current.setLimit(50);
        result.current.setOffset(20);
      });

      // Act
      act(() => {
        result.current.resetFilters();
      });

      // Assert
      expect(result.current.filters.city).toBeUndefined();
      expect(result.current.filters.minPrice).toBeUndefined();
      expect(result.current.filters.maxPrice).toBeUndefined();
      expect(result.current.filters.maxDistanceToRadweg).toBeUndefined();
      expect(result.current.filters.amenities).toEqual([]);
      expect(result.current.filters.limit).toBe(20);
      expect(result.current.filters.offset).toBe(0);
      expect(result.current.isFiltered).toBe(false);
    });
  });

  describe('isFiltered Flag', () => {
    it('should be true when city is set', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setCity('Köln');
      });

      // Assert
      expect(result.current.isFiltered).toBe(true);
    });

    it('should be true when minPrice is set', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setMinPrice(25);
      });

      // Assert
      expect(result.current.isFiltered).toBe(true);
    });

    it('should be true when amenities are set', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setAmenities(['wifi']);
      });

      // Assert
      expect(result.current.isFiltered).toBe(true);
    });

    it('should be false when all filters are cleared', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());
      act(() => {
        result.current.setCity('Hamburg');
        result.current.setMinPrice(30);
        result.current.setAmenities(['parking']);
      });

      // Act
      act(() => {
        result.current.resetFilters();
      });

      // Assert
      expect(result.current.isFiltered).toBe(false);
    });
  });

  describe('Combined Filters', () => {
    it('should handle multiple filters together', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setCity('Frankfurt');
        result.current.setMinPrice(35);
        result.current.setMaxPrice(120);
        result.current.setMaxDistanceToRadweg(8);
        result.current.setAmenities(['wifi', 'kitchen', 'shower']);
      });

      // Assert
      expect(result.current.filters.city).toBe('Frankfurt');
      expect(result.current.filters.minPrice).toBe(35);
      expect(result.current.filters.maxPrice).toBe(120);
      expect(result.current.filters.maxDistanceToRadweg).toBe(8);
      expect(result.current.filters.amenities).toEqual(['wifi', 'kitchen', 'shower']);
      expect(result.current.isFiltered).toBe(true);
    });

    it('should maintain filter state across multiple updates', () => {
      // Arrange
      const { result } = renderHook(() => useListingFilters());

      // Act
      act(() => {
        result.current.setCity('Stuttgart');
      });
      act(() => {
        result.current.setMinPrice(45);
      });
      act(() => {
        result.current.setAmenities(['parking']);
      });

      // Assert
      expect(result.current.filters.city).toBe('Stuttgart');
      expect(result.current.filters.minPrice).toBe(45);
      expect(result.current.filters.amenities).toEqual(['parking']);
    });
  });
});
