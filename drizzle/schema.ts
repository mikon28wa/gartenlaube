import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  date,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role field to distinguish between guests and hosts.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "host", "admin"]).default("user").notNull(),
  profileImage: text("profileImage"),
  bio: text("bio"),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Gartenlauben (garden sheds/huts) that hosts offer for rent
 */
export const gartenlauben = mysqlTable("gartenlauben", {
  id: int("id").autoincrement().primaryKey(),
  hostId: int("hostId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pricePerNight: decimal("pricePerNight", { precision: 10, scale: 2 }).notNull(),
  maxGuests: int("maxGuests").notNull().default(2),
  
  // Location & Radweg (bike path) info
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 20 }),
  distanceToRadweg: decimal("distanceToRadweg", { precision: 8, scale: 2 }), // in km
  
  // Amenities stored as JSON array
  amenities: json("amenities").$type<string[]>().default([]),
  
  // Images stored as JSON array of URLs
  images: json("images").$type<string[]>().default([]),
  
  // Status & Visibility
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Gartenlaube = typeof gartenlauben.$inferSelect;
export type InsertGartenlaube = typeof gartenlauben.$inferInsert;

/**
 * Bookings/Reservations for gartenlauben
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  gartenlaubeId: int("gartenlaubeId").notNull().references(() => gartenlauben.id),
  guestId: int("guestId").notNull().references(() => users.id),
  hostId: int("hostId").notNull().references(() => users.id),
  
  checkInDate: date("checkInDate").notNull(),
  checkOutDate: date("checkOutDate").notNull(),
  numberOfGuests: int("numberOfGuests").notNull(),
  
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  
  // Booking status: pending (awaiting host confirmation), confirmed, rejected, cancelled, completed
  status: mysqlEnum("status", ["pending", "confirmed", "rejected", "cancelled", "completed"]).default("pending").notNull(),
  
  guestMessage: text("guestMessage"),
  hostMessage: text("hostMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Reviews/Ratings for gartenlauben
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  gartenlaubeId: int("gartenlaubeId").notNull().references(() => gartenlauben.id),
  guestId: int("guestId").notNull().references(() => users.id),
  bookingId: int("bookingId").notNull().references(() => bookings.id),
  
  rating: int("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Favorites/Saved gartenlauben by guests
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  guestId: int("guestId").notNull().references(() => users.id),
  gartenlaubeId: int("gartenlaubeId").notNull().references(() => gartenlauben.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Availability calendar for gartenlauben
 * Tracks blocked/unavailable dates
 */
export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  gartenlaubeId: int("gartenlaubeId").notNull().references(() => gartenlauben.id),
  
  date: date("date").notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  reason: varchar("reason", { length: 255 }), // e.g., "maintenance", "blocked by host"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

/**
 * Notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  type: mysqlEnum("type", [
    "booking_request",
    "booking_confirmed",
    "booking_rejected",
    "booking_cancelled",
    "new_review",
    "message",
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedBookingId: int("relatedBookingId").references(() => bookings.id),
  relatedGartenlaubeId: int("relatedGartenlaubeId").references(() => gartenlauben.id),
  
  isRead: boolean("isRead").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
