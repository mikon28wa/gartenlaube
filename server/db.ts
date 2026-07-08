import { eq, and, like, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, gartenlauben, bookings, reviews, favorites, notifications, availability } from "../drizzle/schema";
import { ENV } from './_core/env';
import crypto from 'crypto';

let _db: ReturnType<typeof drizzle> | null = null;

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function encryptField(value: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (e) {
    console.error('Encryption error:', e);
    return value;
  }
}

function decryptField(encrypted: string): string {
  try {
    const [iv, encryptedData] = encrypted.split(':');
    if (!iv || !encryptedData) return encrypted;
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('Decryption error:', e);
    return encrypted;
  }
}

// Lazily create the drizzle instance
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by openId:", error);
    return undefined;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by id:", error);
    return undefined;
  }
}

// ============ GARTENLAUBE FUNCTIONS ============

export async function getAllGartenlauben(filters?: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistanceToRadweg?: number;
  amenities?: string[];
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions: any[] = [eq(gartenlauben.isActive, true)];

    if (filters?.city && typeof filters.city === 'string' && filters.city.trim()) {
      conditions.push(like(gartenlauben.city, `%${filters.city.trim()}%`));
    }

    if (filters?.minPrice !== undefined && typeof filters.minPrice === 'number' && filters.minPrice > 0) {
      conditions.push(gte(gartenlauben.pricePerNight, filters.minPrice.toString()));
    }

    if (filters?.maxPrice !== undefined && typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
      conditions.push(lte(gartenlauben.pricePerNight, filters.maxPrice.toString()));
    }

    if (filters?.maxDistanceToRadweg !== undefined && typeof filters.maxDistanceToRadweg === 'number' && filters.maxDistanceToRadweg > 0) {
      conditions.push(lte(gartenlauben.distanceToRadweg, filters.maxDistanceToRadweg.toString()));
    }

    const whereConditions = conditions.length > 1 ? and(...conditions) : conditions[0];

    const limit = Math.min(filters?.limit || 20, 1000);
    const offset = Math.max(filters?.offset || 0, 0);

    const query = db
      .select()
      .from(gartenlauben)
      .where(whereConditions)
      .orderBy(desc(gartenlauben.isFeatured), desc(gartenlauben.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    if (filters?.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
      const amenitiesSet = new Set(filters.amenities.filter(a => typeof a === 'string'));
      
      return results.filter((laube: any) => {
        try {
          const laubeAmenities = Array.isArray(laube.amenities)
            ? laube.amenities
            : typeof laube.amenities === 'string'
            ? JSON.parse(laube.amenities)
            : [];
          
          return Array.isArray(laubeAmenities) &&
            laubeAmenities.some((amenity: string) => amenitiesSet.has(amenity));
        } catch (e) {
          console.error('Error parsing amenities for laube', laube.id, ':', e);
          return false;
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Error in getAllGartenlauben:', error);
    return [];
  }
}

export async function getGartenlaubenById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(gartenlauben).where(eq(gartenlauben.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('Error in getGartenlaubenById:', error);
    return undefined;
  }
}

export async function getGartenlaubenByHostId(hostId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(gartenlauben).where(eq(gartenlauben.hostId, hostId));
  } catch (error) {
    console.error('Error in getGartenlaubenByHostId:', error);
    return [];
  }
}

export async function createGartenlaube(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const result = await db.insert(gartenlauben).values({
      hostId: data.hostId,
      title: data.title,
      description: data.description || '',
      pricePerNight: data.pricePerNight,
      maxGuests: data.maxGuests,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode || '',
      distanceToRadweg: data.distanceToRadweg,
      amenities: data.amenities || [],
      images: data.images || [],
      isActive: true,
      isFeatured: false,
    });
    return result;
  } catch (error) {
    console.error('Error in createGartenlaube:', error);
    throw error;
  }
}

export async function updateGartenlaube(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.pricePerNight !== undefined) updateData.pricePerNight = data.pricePerNight;
    if (data.maxGuests !== undefined) updateData.maxGuests = data.maxGuests;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.distanceToRadweg !== undefined) updateData.distanceToRadweg = data.distanceToRadweg;
    if (data.amenities !== undefined) updateData.amenities = JSON.stringify(data.amenities);
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await db.update(gartenlauben).set(updateData).where(eq(gartenlauben.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error in updateGartenlaube:', error);
    throw error;
  }
}

export async function deleteGartenlaube(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db.delete(gartenlauben).where(eq(gartenlauben.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error in deleteGartenlaube:', error);
    throw error;
  }
}

// ============ BOOKING FUNCTIONS ============

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('Error in getBookingById:', error);
    return undefined;
  }
}

export async function getBookingsByGuestId(guestId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(bookings).where(eq(bookings.guestId, guestId));
  } catch (error) {
    console.error('Error in getBookingsByGuestId:', error);
    return [];
  }
}

export async function getBookingsByHostId(hostId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(bookings).where(eq(bookings.hostId, hostId));
  } catch (error) {
    console.error('Error in getBookingsByHostId:', error);
    return [];
  }
}

export async function createBooking(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const result = await db.insert(bookings).values({
      gartenlaubeId: data.gartenlaubeId,
      guestId: data.guestId,
      hostId: data.hostId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      numberOfGuests: data.numberOfGuests,
      totalPrice: data.totalPrice,
      status: 'pending',
      guestMessage: data.guestMessage,
    });
    return result;
  } catch (error) {
    console.error('Error in createBooking:', error);
    throw error;
  }
}

export async function updateBookingStatus(id: number, status: string, message?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const updateData: any = { status };
    if (message !== undefined) updateData.rejectionReason = message;
    
    await db.update(bookings).set(updateData).where(eq(bookings.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    throw error;
  }
}

export async function checkAvailability(gartenlaubeId: number, checkInDate: Date, checkOutDate: Date) {
  const db = await getDb();
  if (!db) return true;

  try {
    const conflictingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.gartenlaubeId, gartenlaubeId),
          eq(bookings.status, 'confirmed')
        )
      );

    for (const booking of conflictingBookings) {
      if (
        (checkInDate < booking.checkOutDate && checkOutDate > booking.checkInDate)
      ) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error in checkAvailability:', error);
    return true;
  }
}

// ============ FAVORITE FUNCTIONS ============

export async function getFavoritesByGuestId(guestId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(favorites).where(eq(favorites.guestId, guestId));
  } catch (error) {
    console.error('Error in getFavoritesByGuestId:', error);
    return [];
  }
}

export async function addFavorite(guestId: number, gartenlaubeId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db.insert(favorites).values({
      guestId,
      gartenlaubeId,
    });
    return { success: true };
  } catch (error) {
    console.error('Error in addFavorite:', error);
    throw error;
  }
}

export async function removeFavorite(guestId: number, gartenlaubeId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db.delete(favorites).where(
      and(
        eq(favorites.guestId, guestId),
        eq(favorites.gartenlaubeId, gartenlaubeId)
      )
    );
    return { success: true };
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    throw error;
  }
}

export async function isFavorite(guestId: number, gartenlaubeId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.guestId, guestId),
          eq(favorites.gartenlaubeId, gartenlaubeId)
        )
      )
      .limit(1);
    return result.length > 0;
  } catch (error) {
    console.error('Error in isFavorite:', error);
    return false;
  }
}

// ============ RATING FUNCTIONS ============

export async function getReviewsByGartenlaubeId(gartenlaubeId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(reviews).where(eq(reviews.gartenlaubeId, gartenlaubeId));
  } catch (error) {
    console.error('Error in getReviewsByGartenlaubeId:', error);
    return [];
  }
}

export async function getAverageRating(gartenlaubeId: number) {
  const db = await getDb();
  if (!db) return 0;

  try {
    const reviewList = await getReviewsByGartenlaubeId(gartenlaubeId);
    if (reviewList.length === 0) return 0;
    const sum = reviewList.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / reviewList.length;
  } catch (error) {
    console.error('Error in getAverageRating:', error);
    return 0;
  }
}

export async function createReview(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const result = await db.insert(reviews).values({
      gartenlaubeId: data.gartenlaubeId,
      guestId: data.guestId,
      rating: data.rating,
      comment: data.comment,
      bookingId: data.bookingId,
    });
    return result;
  } catch (error) {
    console.error('Error in createReview:', error);
    throw error;
  }
}

// ============ NOTIFICATION FUNCTIONS ============

export async function createNotification(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const result = await db.insert(notifications).values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedBookingId: data.relatedBookingId,
      relatedGartenlaubeId: data.relatedGartenlaubeId,
      isRead: false,
    });
    return result;
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  } catch (error) {
    console.error('Error in getNotificationsByUserId:', error);
    return [];
  }
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    throw error;
  }
}

// ============ AVAILABILITY FUNCTIONS ============

export async function createAvailability(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const result = await db.insert(availability).values({
      gartenlaubeId: data.gartenlaubeId,
      date: data.date,
      isAvailable: data.isAvailable,
    });
    return result;
  } catch (error) {
    console.error('Error in createAvailability:', error);
    throw error;
  }
}
