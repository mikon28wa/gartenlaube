/**
 * Filter Module - Type Definitions
 * Definiert alle Filter-Typen für die Listenansicht
 */

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'distance-asc' | 'distance-desc';

export interface AmenityOption {
  id: string;
  label: string;
  category: 'Versorgung' | 'Konnektivität' | 'Ausstattung' | 'Außenbereiche' | 'Zusätzlich';
}

export interface FilterState {
  city: string;
  minPrice: number;
  maxPrice: number;
  maxDistanceToRadweg: number;
  amenities: string[];
}

export interface FilterChangeEvent {
  type: 'city' | 'price' | 'distance' | 'amenities' | 'reset';
  payload?: Partial<FilterState>;
}

export interface FilterValidationError {
  field: string;
  message: string;
}

export const AMENITY_OPTIONS: AmenityOption[] = [
  { id: 'wifi', label: 'WiFi / Internet', category: 'Konnektivität' },
  { id: 'electricity', label: 'Strom', category: 'Versorgung' },
  { id: 'water', label: 'Wasser', category: 'Versorgung' },
  { id: 'kitchen', label: 'Küche', category: 'Ausstattung' },
  { id: 'shower', label: 'Dusche / Bad', category: 'Ausstattung' },
  { id: 'bed', label: 'Bett', category: 'Ausstattung' },
  { id: 'terrace', label: 'Terrasse', category: 'Außenbereiche' },
  { id: 'garden', label: 'Garten', category: 'Außenbereiche' },
  { id: 'parking', label: 'Parkplatz', category: 'Zusätzlich' },
  { id: 'heating', label: 'Heizung', category: 'Versorgung' },
  { id: 'lighting', label: 'Beleuchtung', category: 'Versorgung' },
  { id: 'furniture', label: 'Möbel', category: 'Ausstattung' },
];

export const DEFAULT_FILTERS: FilterState = {
  city: '',
  minPrice: 0,
  maxPrice: 200,
  maxDistanceToRadweg: 10,
  amenities: [],
};

export const FILTER_CONSTRAINTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 500,
  MIN_DISTANCE: 0,
  MAX_DISTANCE: 100,
  MAX_CITY_LENGTH: 50,
} as const;
