/**
 * Filter Module - Input Validation
 * Validiert Filter-Eingaben und gibt aussagekräftige Fehlermeldungen zurück
 */

import { FilterState, FilterValidationError, FILTER_CONSTRAINTS, AMENITY_OPTIONS } from './filterTypes';

export class FilterValidator {
  /**
   * Validiert die gesamte Filter-State
   */
  static validateFilters(filters: Partial<FilterState>): FilterValidationError[] {
    const errors: FilterValidationError[] = [];

    if (filters.city !== undefined) {
      const cityError = this.validateCity(filters.city);
      if (cityError) errors.push(cityError);
    }

    if (filters.minPrice !== undefined) {
      const minPriceError = this.validateMinPrice(filters.minPrice);
      if (minPriceError) errors.push(minPriceError);
    }

    if (filters.maxPrice !== undefined) {
      const maxPriceError = this.validateMaxPrice(filters.maxPrice);
      if (maxPriceError) errors.push(maxPriceError);
    }

    if (filters.maxDistanceToRadweg !== undefined) {
      const distanceError = this.validateDistance(filters.maxDistanceToRadweg);
      if (distanceError) errors.push(distanceError);
    }

    if (filters.amenities !== undefined) {
      const amenitiesError = this.validateAmenities(filters.amenities);
      if (amenitiesError) errors.push(amenitiesError);
    }

    // Validiere Preis-Bereich
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      if (filters.minPrice > filters.maxPrice) {
        errors.push({
          field: 'price',
          message: 'Mindestpreis kann nicht höher als Maximalpreis sein',
        });
      }
    }

    return errors;
  }

  /**
   * Validiert Stadt-Filter
   */
  static validateCity(city: string): FilterValidationError | null {
    if (typeof city !== 'string') {
      return { field: 'city', message: 'Stadt muss ein Text sein' };
    }

    if (city.length > FILTER_CONSTRAINTS.MAX_CITY_LENGTH) {
      return {
        field: 'city',
        message: `Stadt darf max. ${FILTER_CONSTRAINTS.MAX_CITY_LENGTH} Zeichen lang sein`,
      };
    }

    // Nur alphanumerische Zeichen, Leerzeichen und Bindestriche erlauben
    if (!/^[a-zA-Z0-9\s\-äöüßÄÖÜ]*$/.test(city)) {
      return { field: 'city', message: 'Stadt enthält ungültige Zeichen' };
    }

    return null;
  }

  /**
   * Validiert Mindestpreis
   */
  static validateMinPrice(price: number): FilterValidationError | null {
    if (typeof price !== 'number' || isNaN(price)) {
      return { field: 'minPrice', message: 'Mindestpreis muss eine Zahl sein' };
    }

    if (price < FILTER_CONSTRAINTS.MIN_PRICE) {
      return {
        field: 'minPrice',
        message: `Mindestpreis kann nicht unter ${FILTER_CONSTRAINTS.MIN_PRICE} liegen`,
      };
    }

    return null;
  }

  /**
   * Validiert Maximalpreis
   */
  static validateMaxPrice(price: number): FilterValidationError | null {
    if (typeof price !== 'number' || isNaN(price)) {
      return { field: 'maxPrice', message: 'Maximalpreis muss eine Zahl sein' };
    }

    if (price > FILTER_CONSTRAINTS.MAX_PRICE) {
      return {
        field: 'maxPrice',
        message: `Maximalpreis kann nicht über ${FILTER_CONSTRAINTS.MAX_PRICE} liegen`,
      };
    }

    return null;
  }

  /**
   * Validiert Entfernung zum Radweg
   */
  static validateDistance(distance: number): FilterValidationError | null {
    if (typeof distance !== 'number' || isNaN(distance)) {
      return { field: 'distance', message: 'Entfernung muss eine Zahl sein' };
    }

    if (distance < FILTER_CONSTRAINTS.MIN_DISTANCE) {
      return {
        field: 'distance',
        message: `Entfernung kann nicht unter ${FILTER_CONSTRAINTS.MIN_DISTANCE} liegen`,
      };
    }

    if (distance > FILTER_CONSTRAINTS.MAX_DISTANCE) {
      return {
        field: 'distance',
        message: `Entfernung kann nicht über ${FILTER_CONSTRAINTS.MAX_DISTANCE} liegen`,
      };
    }

    return null;
  }

  /**
   * Validiert Ausstattungs-Filter
   */
  static validateAmenities(amenities: string[]): FilterValidationError | null {
    if (!Array.isArray(amenities)) {
      return { field: 'amenities', message: 'Ausstattung muss ein Array sein' };
    }

    const validAmenityIds = AMENITY_OPTIONS.map((a) => a.id);
    const invalidAmenities = amenities.filter((a) => !validAmenityIds.includes(a));

    if (invalidAmenities.length > 0) {
      return {
        field: 'amenities',
        message: `Ungültige Ausstattungen: ${invalidAmenities.join(', ')}`,
      };
    }

    return null;
  }

  /**
   * Bereinigt Filter-Eingaben
   */
  static sanitizeFilters(filters: Partial<FilterState>): Partial<FilterState> {
    return {
      city: filters.city?.trim().toLowerCase() || '',
      minPrice: Math.max(FILTER_CONSTRAINTS.MIN_PRICE, filters.minPrice || 0),
      maxPrice: Math.min(FILTER_CONSTRAINTS.MAX_PRICE, filters.maxPrice || 200),
      maxDistanceToRadweg: Math.min(FILTER_CONSTRAINTS.MAX_DISTANCE, filters.maxDistanceToRadweg || 10),
      amenities: Array.isArray(filters.amenities) ? filters.amenities : [],
    };
  }
}
