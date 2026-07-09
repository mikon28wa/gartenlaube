import { z } from 'zod';

/**
 * Konsolidierte tRPC Input-Validierungs-Schemas
 * Eliminiert duplizierte Validierungslogik in Procedures
 */

// ============================================================================
// Gartenlaube Schemas
// ============================================================================

export const gartenlaubenListInputSchema = z.object({
  city: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  maxDistanceToRadweg: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

export const gartenlaubenCreateInputSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  pricePerNight: z.string(),
  maxGuests: z.number().min(1),
  latitude: z.string(),
  longitude: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string().optional(),
  distanceToRadweg: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export const gartenlaubenUpdateInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  pricePerNight: z.string().optional(),
  maxGuests: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  distanceToRadweg: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const gartenlaubenIdInputSchema = z.object({
  id: z.number(),
});

// ============================================================================
// Booking Schemas
// ============================================================================

export const bookingCreateInputSchema = z.object({
  gartenlaubeId: z.number(),
  checkInDate: z.date(),
  checkOutDate: z.date(),
  numberOfGuests: z.number().min(1),
  guestMessage: z.string().optional(),
});

export const bookingIdInputSchema = z.object({
  id: z.number(),
});

export const bookingRejectInputSchema = z.object({
  id: z.number(),
  message: z.string().optional(),
});

// ============================================================================
// Review Schemas
// ============================================================================

export const reviewListInputSchema = z.object({
  gartenlaubeId: z.number(),
});

export const reviewCreateInputSchema = z.object({
  gartenlaubeId: z.number(),
  bookingId: z.number(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

// ============================================================================
// Favorites Schemas
// ============================================================================

export const favoriteGartenlaubeInputSchema = z.object({
  gartenlaubeId: z.number(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type GartenlaubenListInput = z.infer<typeof gartenlaubenListInputSchema>;
export type GartenlaubenCreateInput = z.infer<typeof gartenlaubenCreateInputSchema>;
export type GartenlaubenUpdateInput = z.infer<typeof gartenlaubenUpdateInputSchema>;
export type GartenlaubenIdInput = z.infer<typeof gartenlaubenIdInputSchema>;

export type BookingCreateInput = z.infer<typeof bookingCreateInputSchema>;
export type BookingIdInput = z.infer<typeof bookingIdInputSchema>;
export type BookingRejectInput = z.infer<typeof bookingRejectInputSchema>;

export type ReviewListInput = z.infer<typeof reviewListInputSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateInputSchema>;

export type FavoriteGartenlaubeInput = z.infer<typeof favoriteGartenlaubeInputSchema>;
