import { useState, useCallback, useMemo } from 'react';
import { listingFilterSchema, type ListingFilter } from '../../../shared/validation-schemas';

/**
 * Custom Hook für zentralisierte Filter-Logik
 * Wird von SearchFilters und Listings Komponenten verwendet
 * Single Source of Truth für alle Filter-Operationen
 */

interface UseListingFiltersReturn {
  filters: ListingFilter;
  setCity: (city: string) => void;
  setMinPrice: (price: number | undefined) => void;
  setMaxPrice: (price: number | undefined) => void;
  setMaxDistanceToRadweg: (distance: number | undefined) => void;
  setAmenities: (amenities: string[]) => void;
  setLimit: (limit: number) => void;
  setOffset: (offset: number) => void;
  resetFilters: () => void;
  isFiltered: boolean;
}

const DEFAULT_FILTERS: ListingFilter = {
  city: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  maxDistanceToRadweg: undefined,
  amenities: [],
  limit: 20,
  offset: 0,
};

export function useListingFilters(): UseListingFiltersReturn {
  const [filters, setFilters] = useState<ListingFilter>(DEFAULT_FILTERS);

  // Validiere und aktualisiere Filter
  const updateFilters = useCallback((updates: Partial<ListingFilter>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...updates };
      try {
        // Validiere mit Zod Schema
        return listingFilterSchema.parse(newFilters);
      } catch (error) {
        console.error('Filter validation error:', error);
        return prev; // Behalte alte Filter bei Validierungsfehler
      }
    });
  }, []);

  const setCity = useCallback((city: string) => {
    updateFilters({ city: city || undefined, offset: 0 });
  }, [updateFilters]);

  const setMinPrice = useCallback((price: number | undefined) => {
    updateFilters({ minPrice: price, offset: 0 });
  }, [updateFilters]);

  const setMaxPrice = useCallback((price: number | undefined) => {
    updateFilters({ maxPrice: price, offset: 0 });
  }, [updateFilters]);

  const setMaxDistanceToRadweg = useCallback((distance: number | undefined) => {
    updateFilters({ maxDistanceToRadweg: distance, offset: 0 });
  }, [updateFilters]);

  const setAmenities = useCallback((amenities: string[]) => {
    updateFilters({ amenities, offset: 0 });
  }, [updateFilters]);

  const setLimit = useCallback((limit: number) => {
    updateFilters({ limit });
  }, [updateFilters]);

  const setOffset = useCallback((offset: number) => {
    updateFilters({ offset });
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Überprüfe ob Filter aktiv sind (nicht alle Defaults)
  const isFiltered = useMemo(() => {
    return (
      filters.city !== undefined ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.maxDistanceToRadweg !== undefined ||
      (filters.amenities && filters.amenities.length > 0)
    );
  }, [filters]);

  return {
    filters,
    setCity,
    setMinPrice,
    setMaxPrice,
    setMaxDistanceToRadweg,
    setAmenities,
    setLimit,
    setOffset,
    resetFilters,
    isFiltered,
  };
}
