import { z } from 'zod';

/**
 * Gemeinsame Validierungs-Schemas für GartenLaube
 * Diese Schemas werden sowohl im Frontend als auch im Backend verwendet
 * um Konsistenz und Single Source of Truth zu gewährleisten
 */

// Preis-Validierung
export const priceSchema = z
  .number()
  .min(0, 'Preis kann nicht negativ sein')
  .max(10000, 'Preis kann nicht über 10.000€ liegen')
  .optional();

// Gäste-Validierung
export const guestsSchema = z
  .number()
  .min(1, 'Mindestens 1 Gast erforderlich')
  .max(100, 'Maximal 100 Gäste')
  .int('Gäste müssen eine ganze Zahl sein')
  .optional();

// Datum-Validierung
export const dateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), 'Ungültiges Datumsformat')
  .optional();

// Entfernung zum Radweg
export const distanceSchema = z
  .number()
  .min(0, 'Entfernung kann nicht negativ sein')
  .max(100, 'Entfernung kann nicht über 100km liegen')
  .optional();

// Ausstattungen
export const amenitiesSchema = z
  .array(z.string().min(1).max(50))
  .optional()
  .default([]);

// Titel-Validierung
export const titleSchema = z
  .string()
  .min(3, 'Titel muss mindestens 3 Zeichen lang sein')
  .max(255, 'Titel darf maximal 255 Zeichen lang sein');

// Beschreibung-Validierung
export const descriptionSchema = z
  .string()
  .min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein')
  .max(5000, 'Beschreibung darf maximal 5000 Zeichen lang sein')
  .optional();

// Stadt-Validierung
export const citySchema = z
  .string()
  .min(2, 'Stadt muss mindestens 2 Zeichen lang sein')
  .max(100, 'Stadt darf maximal 100 Zeichen lang sein')
  .optional();

// Adresse-Validierung
export const addressSchema = z
  .string()
  .min(5, 'Adresse muss mindestens 5 Zeichen lang sein')
  .max(500, 'Adresse darf maximal 500 Zeichen lang sein');

// Postleitzahl-Validierung
export const postalCodeSchema = z
  .string()
  .regex(/^\d{5}$/, 'Postleitzahl muss 5 Ziffern haben')
  .optional();

// Koordinaten-Validierung
export const latitudeSchema = z
  .number()
  .min(-90, 'Breitengrad muss zwischen -90 und 90 liegen')
  .max(90, 'Breitengrad muss zwischen -90 und 90 liegen');

export const longitudeSchema = z
  .number()
  .min(-180, 'Längengrad muss zwischen -180 und 180 liegen')
  .max(180, 'Längengrad muss zwischen -180 und 180 liegen');

// Filter-Schema (konsolidiert)
export const listingFilterSchema = z.object({
  city: citySchema,
  minPrice: priceSchema,
  maxPrice: priceSchema,
  maxDistanceToRadweg: distanceSchema,
  amenities: amenitiesSchema,
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type ListingFilter = z.infer<typeof listingFilterSchema>;

// Gartenlaube-Erstellungs-Schema
export const createGartenlaubeSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  pricePerNight: z.string().or(z.number()),
  maxGuests: guestsSchema,
  latitude: z.string().or(latitudeSchema),
  longitude: z.string().or(longitudeSchema),
  address: addressSchema,
  city: citySchema,
  postalCode: postalCodeSchema,
  distanceToRadweg: z.string().or(distanceSchema),
  amenities: amenitiesSchema,
  images: z.array(z.string()).optional(),
});

export type CreateGartenlaube = z.infer<typeof createGartenlaubeSchema>;

// Gartenlaube-Update-Schema
export const updateGartenlaubeSchema = createGartenlaubeSchema.partial();

export type UpdateGartenlaube = z.infer<typeof updateGartenlaubeSchema>;

// Buchungs-Validierung
export const bookingSchema = z.object({
  gartenlaubeId: z.number().min(1),
  checkInDate: dateSchema,
  checkOutDate: dateSchema,
  numberOfGuests: guestsSchema,
  guestMessage: z.string().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// Bewertungs-Validierung
export const reviewSchema = z.object({
  gartenlaubeId: z.number().min(1),
  bookingId: z.number().min(1),
  rating: z.number().min(1).max(5).int(),
  title: z.string().min(3).max(100).optional(),
  comment: z.string().min(10).max(2000).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
