import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import {
  gartenlaubenListInputSchema,
  gartenlaubenCreateInputSchema,
  gartenlaubenUpdateInputSchema,
  gartenlaubenIdInputSchema,
  bookingCreateInputSchema,
  bookingIdInputSchema,
  bookingRejectInputSchema,
  reviewListInputSchema,
  reviewCreateInputSchema,
  favoriteGartenlaubeInputSchema,
} from "../shared/trpc-schemas";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Gartenlauben procedures
  gartenlauben: router({
    // Get all gartenlauben with optional filters
    list: publicProcedure
      .input(gartenlaubenListInputSchema)
      .query(async ({ input }) => {
        return await db.getAllGartenlauben({
          city: input.city,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          maxDistanceToRadweg: input.maxDistanceToRadweg,
          amenities: input.amenities,
          limit: input.limit,
          offset: input.offset,
        });
      }),

    // Get single gartenlaube by ID
    getById: publicProcedure
      .input(gartenlaubenIdInputSchema)
      .query(async ({ input }) => {
        const gartenlaube = await db.getGartenlaubenById(input.id);
        if (!gartenlaube) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return gartenlaube;
      }),

    // Get gartenlauben for current host
    myListings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "host" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getGartenlaubenByHostId(ctx.user.id);
    }),

    // Create new gartenlaube
    create: protectedProcedure
      .input(gartenlaubenCreateInputSchema)
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "host" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return await db.createGartenlaube({
          hostId: ctx.user.id,
          ...input,
        });
      }),

    // Update gartenlaube
    update: protectedProcedure
      .input(gartenlaubenUpdateInputSchema)
      .mutation(async ({ input, ctx }) => {
        const gartenlaube = await db.getGartenlaubenById(input.id);
        if (!gartenlaube) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (
          gartenlaube.hostId !== ctx.user.id &&
          ctx.user.role !== "admin"
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { id, ...updateData } = input;
        return await db.updateGartenlaube(id, updateData as any);
      }),

    // Delete gartenlaube
    delete: protectedProcedure
      .input(gartenlaubenIdInputSchema)
      .mutation(async ({ input, ctx }) => {
        const gartenlaube = await db.getGartenlaubenById(input.id);
        if (!gartenlaube) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (
          gartenlaube.hostId !== ctx.user.id &&
          ctx.user.role !== "admin"
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return await db.deleteGartenlaube(input.id);
      }),
  }),

  // Bookings procedures
  bookings: router({
    // Get bookings for current user (as guest)
    myBookings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getBookingsByGuestId(ctx.user.id);
    }),

    // Get booking requests for host
    hostRequests: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "host" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getBookingsByHostId(ctx.user.id);
    }),

    // Get single booking
    getById: protectedProcedure
      .input(bookingIdInputSchema)
      .query(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (
          booking.guestId !== ctx.user.id &&
          booking.hostId !== ctx.user.id &&
          ctx.user.role !== "admin"
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return booking;
      }),

    // Create booking request
    create: protectedProcedure
      .input(bookingCreateInputSchema)
      .mutation(async ({ input, ctx }) => {
        const gartenlaube = await db.getGartenlaubenById(
          input.gartenlaubeId
        );
        if (!gartenlaube) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (input.numberOfGuests > gartenlaube.maxGuests) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Too many guests",
          });
        }

        // Check availability
        const isAvailable = await db.checkAvailability(
          input.gartenlaubeId,
          input.checkInDate,
          input.checkOutDate
        );

        if (!isAvailable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not available for selected dates",
          });
        }

        // Calculate total price
        const days = Math.ceil(
          (input.checkOutDate.getTime() - input.checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const totalPrice = (
          Number(gartenlaube.pricePerNight) * days
        ).toString();

        const result = await db.createBooking({
          gartenlaubeId: input.gartenlaubeId,
          guestId: ctx.user.id,
          hostId: gartenlaube.hostId,
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
          numberOfGuests: input.numberOfGuests,
          totalPrice,
          guestMessage: input.guestMessage,
        });

        // Create notification for host
        await db.createNotification({
          userId: gartenlaube.hostId,
          type: "booking_request",
          title: "Neue Buchungsanfrage",
          message: `${ctx.user.name} möchte Ihre Gartenlaube buchen`,
          relatedBookingId: 0,
          relatedGartenlaubeId: input.gartenlaubeId,
        });

        return result;
      }),

    // Confirm booking (host only)
    confirm: protectedProcedure
      .input(bookingIdInputSchema)
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (booking.hostId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateBookingStatus(input.id, "confirmed");

        // Create notification for guest
        const guest = await db.getUserById(booking.guestId);
        if (guest) {
          await db.createNotification({
            userId: booking.guestId,
            type: "booking_confirmed",
            title: "Buchung bestätigt",
            message: "Ihre Buchung wurde bestätigt",
            relatedBookingId: input.id,
          });
        }

        return { success: true };
      }),

    // Reject booking (host only)
    reject: protectedProcedure
      .input(bookingRejectInputSchema)
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (booking.hostId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateBookingStatus(
          input.id,
          "rejected",
          input.message
        );

        // Create notification for guest
        await db.createNotification({
          userId: booking.guestId,
          type: "booking_rejected",
          title: "Buchung abgelehnt",
          message: "Ihre Buchungsanfrage wurde abgelehnt",
          relatedBookingId: input.id,
        });

        return { success: true };
      }),

    // Cancel booking (guest only)
    cancel: protectedProcedure
      .input(bookingIdInputSchema)
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (booking.guestId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateBookingStatus(input.id, "cancelled");

        // Create notification for host
        await db.createNotification({
          userId: booking.hostId,
          type: "booking_cancelled",
          title: "Buchung storniert",
          message: "Eine Buchung wurde storniert",
          relatedBookingId: input.id,
        });

        return { success: true };
      }),
  }),

  // Favorites procedures
  favorites: router({
    // Get user's favorites
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getFavoritesByGuestId(ctx.user.id);
    }),

    // Add to favorites
    add: protectedProcedure
      .input(favoriteGartenlaubeInputSchema)
      .mutation(async ({ input, ctx }) => {
        const gartenlaube = await db.getGartenlaubenById(
          input.gartenlaubeId
        );
        if (!gartenlaube) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return await db.addFavorite(ctx.user.id, input.gartenlaubeId);
      }),

    // Remove from favorites
    remove: protectedProcedure
      .input(favoriteGartenlaubeInputSchema)
      .mutation(async ({ input, ctx }) => {
        return await db.removeFavorite(ctx.user.id, input.gartenlaubeId);
      }),

    // Check if favorited
    isFavorite: protectedProcedure
      .input(favoriteGartenlaubeInputSchema)
      .query(async ({ input, ctx }) => {
        return await db.isFavorite(ctx.user.id, input.gartenlaubeId);
      }),
  }),

  // Reviews procedures
  reviews: router({
    // Get reviews for gartenlaube
    list: publicProcedure
      .input(reviewListInputSchema)
      .query(async ({ input }) => {
        return await db.getReviewsByGartenlaubeId(input.gartenlaubeId);
      }),

    // Get average rating
    averageRating: publicProcedure
      .input(reviewListInputSchema)
      .query(async ({ input }) => {
        return await db.getAverageRating(input.gartenlaubeId);
      }),

    // Create review
    create: protectedProcedure
      .input(reviewCreateInputSchema)
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (booking.guestId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (booking.status !== "completed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only review completed bookings",
          });
        }

        const result = await db.createReview({
          gartenlaubeId: input.gartenlaubeId,
          guestId: ctx.user.id,
          bookingId: input.bookingId,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
        });

        // Create notification for host
        const gartenlaube = await db.getGartenlaubenById(
          input.gartenlaubeId
        );
        if (gartenlaube) {
          await db.createNotification({
            userId: gartenlaube.hostId,
            type: "new_review",
            title: "Neue Bewertung",
            message: `${ctx.user.name} hat Ihre Gartenlaube bewertet`,
            relatedGartenlaubeId: input.gartenlaubeId,
          });
        }

        return result;
      }),
  }),

  // Notifications procedures
  notifications: router({
    // Get user's notifications
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUserId(ctx.user.id);
    }),

    // Mark as read
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
