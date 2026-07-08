import { eq, and, gte, lte, desc, asc, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  gartenlauben,
  bookings,
  reviews,
  favorites,
  availability,
  notifications,
  type Gartenlaube,
  type Booking,
  type Review,
  type Favorite,
  type Notification,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Gartenlauben queries
export async function createGartenlaube(data: {
  hostId: number;
  title: string;
  description?: string;
  pricePerNight: string;
  maxGuests: number;
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  postalCode?: string;
  distanceToRadweg?: string;
  amenities?: string[];
  images?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(gartenlauben).values({
    hostId: data.hostId,
    title: data.title,
    description: data.description,
    pricePerNight: data.pricePerNight as any,
    maxGuests: data.maxGuests,
    latitude: data.latitude as any,
    longitude: data.longitude as any,
    address: data.address,
    city: data.city,
    postalCode: data.postalCode,
    distanceToRadweg: data.distanceToRadweg as any,
    amenities: data.amenities || [],
    images: data.images || [],
  });

  return result;
}

export async function getGartenlaubenById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(gartenlauben)
    .where(eq(gartenlauben.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getGartenlaubenByHostId(hostId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(gartenlauben)
    .where(eq(gartenlauben.hostId, hostId));
}

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

  let whereConditions = eq(gartenlauben.isActive, true);

  if (filters?.city) {
    whereConditions = and(
      whereConditions,
      like(gartenlauben.city, `%${filters.city}%`)
    ) as any;
  }

  if (filters?.minPrice) {
    whereConditions = and(
      whereConditions,
      gte(gartenlauben.pricePerNight, filters.minPrice as any)
    ) as any;
  }

  if (filters?.maxPrice) {
    whereConditions = and(
      whereConditions,
      lte(gartenlauben.pricePerNight, filters.maxPrice as any)
    ) as any;
  }

  if (filters?.maxDistanceToRadweg) {
    whereConditions = and(
      whereConditions,
      lte(gartenlauben.distanceToRadweg, filters.maxDistanceToRadweg as any)
    ) as any;
  }

  let query = db
    .select()
    .from(gartenlauben)
    .where(whereConditions)
    .orderBy(desc(gartenlauben.isFeatured), desc(gartenlauben.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  let results = await query;

  // Client-side amenities filtering
  if (filters?.amenities && filters.amenities.length > 0) {
    results = results.filter((laube: any) => {
      const laubeAmenities = Array.isArray(laube.amenities) 
        ? laube.amenities 
        : typeof laube.amenities === 'string' 
          ? JSON.parse(laube.amenities) 
          : [];
      return filters.amenities!.some((amenity: string) => 
        laubeAmenities.includes(amenity)
      );
    });
  }

  return results;
}

export async function updateGartenlaube(
  id: number,
  data: Partial<typeof gartenlauben.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(gartenlauben)
    .set(data)
    .where(eq(gartenlauben.id, id));
}

export async function deleteGartenlaube(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(gartenlauben).where(eq(gartenlauben.id, id));
}

// Bookings queries
export async function createBooking(data: {
  gartenlaubeId: number;
  guestId: number;
  hostId: number;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  totalPrice: string;
  guestMessage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(bookings).values({
    gartenlaubeId: data.gartenlaubeId,
    guestId: data.guestId,
    hostId: data.hostId,
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    numberOfGuests: data.numberOfGuests,
    totalPrice: data.totalPrice as any,
    guestMessage: data.guestMessage,
    status: "pending",
  });
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getBookingsByGuestId(guestId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.guestId, guestId))
    .orderBy(desc(bookings.createdAt));
}

export async function getBookingsByHostId(hostId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.hostId, hostId))
    .orderBy(desc(bookings.createdAt));
}

export async function getBookingsByGartenlaubeId(gartenlaubeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.gartenlaubeId, gartenlaubeId))
    .orderBy(desc(bookings.createdAt));
}

export async function updateBookingStatus(
  id: number,
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed",
  hostMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(bookings)
    .set({ status, hostMessage })
    .where(eq(bookings.id, id));
}

// Reviews queries
export async function createReview(data: {
  gartenlaubeId: number;
  guestId: number;
  bookingId: number;
  rating: number;
  title?: string;
  comment?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(reviews).values(data);
}

export async function getReviewsByGartenlaubeId(gartenlaubeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.gartenlaubeId, gartenlaubeId))
    .orderBy(desc(reviews.createdAt));
}

export async function getAverageRating(gartenlaubeId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({
      avgRating: reviews.rating,
    })
    .from(reviews)
    .where(eq(reviews.gartenlaubeId, gartenlaubeId));

  if (result.length === 0) return 0;

  const sum = result.reduce((acc, r) => acc + (r.avgRating || 0), 0);
  return sum / result.length;
}

// Favorites queries
export async function addFavorite(guestId: number, gartenlaubeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(favorites).values({ guestId, gartenlaubeId });
}

export async function removeFavorite(guestId: number, gartenlaubeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.guestId, guestId),
        eq(favorites.gartenlaubeId, gartenlaubeId)
      )
    );
}

export async function getFavoritesByGuestId(guestId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(favorites)
    .where(eq(favorites.guestId, guestId));
}

export async function isFavorite(guestId: number, gartenlaubeId: number) {
  const db = await getDb();
  if (!db) return false;

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
}

// Availability queries
export async function checkAvailability(
  gartenlaubeId: number,
  checkInDate: Date,
  checkOutDate: Date
) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(availability)
    .where(
      and(
        eq(availability.gartenlaubeId, gartenlaubeId),
        gte(availability.date, checkInDate),
        lte(availability.date, checkOutDate),
        eq(availability.isAvailable, false)
      )
    );

  return result.length === 0; // Available if no blocked dates found
}

export async function blockDate(
  gartenlaubeId: number,
  date: Date,
  reason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(availability).values({
    gartenlaubeId,
    date,
    isAvailable: false,
    reason,
  });
}

// Notifications queries
export async function createNotification(data: {
  userId: number;
  type:
    | "booking_request"
    | "booking_confirmed"
    | "booking_rejected"
    | "booking_cancelled"
    | "new_review"
    | "message";
  title: string;
  message?: string;
  relatedBookingId?: number;
  relatedGartenlaubeId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(notifications).values(data);
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
}
