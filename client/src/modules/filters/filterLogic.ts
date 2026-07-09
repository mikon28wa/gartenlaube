/**
 * Filter Module - Business Logic
 * Enthält die Geschäftslogik für Filter-Operationen
 */

import { FilterState, DEFAULT_FILTERS } from './filterTypes';
import { FilterValidator } from './filterValidation';

export class FilterLogic {
  /**
   * Kombiniert mehrere Filter-States
   */
  static mergeFilters(base: FilterState, updates: Partial<FilterState>): FilterState {
    return {
      ...base,
      ...updates,
    };
  }

  /**
   * Prüft, ob Filter aktiv sind (nicht auf Defaults)
   */
  static hasActiveFilters(filters: FilterState): boolean {
    return (
      filters.city !== DEFAULT_FILTERS.city ||
      filters.minPrice !== DEFAULT_FILTERS.minPrice ||
      filters.maxPrice !== DEFAULT_FILTERS.maxPrice ||
      filters.maxDistanceToRadweg !== DEFAULT_FILTERS.maxDistanceToRadweg ||
      filters.amenities.length > 0
    );
  }

  /**
   * Setzt alle Filter auf Defaults zurück
   */
  static resetFilters(): FilterState {
    return { ...DEFAULT_FILTERS };
  }

  /**
   * Validiert und bereinigt Filter
   */
  static processFilters(filters: Partial<FilterState>): { valid: boolean; filters: FilterState; errors: any[] } {
    const errors = FilterValidator.validateFilters(filters);
    const sanitized = FilterValidator.sanitizeFilters(filters);

    return {
      valid: errors.length === 0,
      filters: { ...DEFAULT_FILTERS, ...sanitized } as FilterState,
      errors,
    };
  }

  /**
   * Erstellt einen Query-String aus Filtern
   */
  static filtersToQueryString(filters: FilterState): string {
    const params = new URLSearchParams();

    if (filters.city) params.append('city', filters.city);
    if (filters.minPrice > DEFAULT_FILTERS.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice < DEFAULT_FILTERS.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters.maxDistanceToRadweg < DEFAULT_FILTERS.maxDistanceToRadweg)
      params.append('maxDistance', String(filters.maxDistanceToRadweg));
    if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));

    return params.toString();
  }

  /**
   * Parst Query-String zu Filtern
   */
  static queryStringToFilters(queryString: string): FilterState {
    const params = new URLSearchParams(queryString);
    const filters: Partial<FilterState> = {};

    const city = params.get('city');
    if (city) filters.city = city;

    const minPrice = params.get('minPrice');
    if (minPrice) filters.minPrice = Number(minPrice);

    const maxPrice = params.get('maxPrice');
    if (maxPrice) filters.maxPrice = Number(maxPrice);

    const maxDistance = params.get('maxDistance');
    if (maxDistance) filters.maxDistanceToRadweg = Number(maxDistance);

    const amenities = params.get('amenities');
    if (amenities) filters.amenities = amenities.split(',');

    return { ...DEFAULT_FILTERS, ...filters };
  }

  /**
   * Erstellt einen Beschreibungstext für aktive Filter
   */
  static getFilterDescription(filters: FilterState): string[] {
    const descriptions: string[] = [];

    if (filters.city) {
      descriptions.push(`in ${filters.city}`);
    }

    if (filters.minPrice > DEFAULT_FILTERS.minPrice || filters.maxPrice < DEFAULT_FILTERS.maxPrice) {
      descriptions.push(`€${filters.minPrice}-${filters.maxPrice}/Nacht`);
    }

    if (filters.maxDistanceToRadweg < DEFAULT_FILTERS.maxDistanceToRadweg) {
      descriptions.push(`max. ${filters.maxDistanceToRadweg}km zum Radweg`);
    }

    if (filters.amenities.length > 0) {
      descriptions.push(`mit ${filters.amenities.length} Ausstattungen`);
    }

    return descriptions;
  }
}
