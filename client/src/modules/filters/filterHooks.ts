/**
 * Filter Module - Custom Hooks
 * Bietet Hooks für Filter-Management in React-Komponenten
 */

import { useState, useCallback, useMemo } from 'react';
import { FilterState, DEFAULT_FILTERS } from './filterTypes';
import { FilterLogic } from './filterLogic';
import { FilterValidator } from './filterValidation';

/**
 * Hook für Filter-Verwaltung
 */
export function useFilters(initialFilters: Partial<FilterState> = {}) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  }));

  const hasActiveFilters = useMemo(() => FilterLogic.hasActiveFilters(filters), [filters]);

  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => FilterLogic.mergeFilters(prev, updates));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(FilterLogic.resetFilters());
  }, []);

  const toggleAmenity = useCallback((amenityId: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  }, []);

  return {
    filters,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    toggleAmenity,
  };
}

/**
 * Hook für Filter-Validierung
 */
export function useFilterValidation(filters: Partial<FilterState>) {
  const errors = useMemo(() => FilterValidator.validateFilters(filters), [filters]);

  const isValid = useMemo(() => errors.length === 0, [errors]);

  const getError = useCallback(
    (field: string) => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  return {
    errors,
    isValid,
    getError,
  };
}

/**
 * Hook für Filter-Persistierung (URL/LocalStorage)
 */
export function usePersistedFilters(storageKey: string = 'gartenlaube-filters') {
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load persisted filters:', e);
    }
    return DEFAULT_FILTERS;
  });

  const updateFilter = useCallback(
    (updates: Partial<FilterState>) => {
      setFilters((prev) => {
        const merged = FilterLogic.mergeFilters(prev, updates);
        try {
          localStorage.setItem(storageKey, JSON.stringify(merged));
        } catch (e) {
          console.warn('Failed to persist filters:', e);
        }
        return merged;
      });
    },
    [storageKey]
  );

  const clearPersistedFilters = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Failed to clear persisted filters:', e);
    }
    setFilters(DEFAULT_FILTERS);
  }, [storageKey]);

  return {
    filters,
    updateFilter,
    clearPersistedFilters,
  };
}
