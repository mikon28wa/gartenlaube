/**
 * tRPC Client mit optimierter Cache-Konfiguration
 * Implementiert Browser-Cache mit differenzierten Stale Times
 */

import { createTRPCReact } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../../../server/routers';

/**
 * Cache-Konfiguration nach Datentyp
 */
export const CACHE_CONFIG = {
  // Häufig geänderte Daten
  listings: {
    staleTime: 5 * 60 * 1000, // 5 Minuten
    gcTime: 10 * 60 * 1000, // 10 Minuten
  },
  // Selten geänderte Daten
  listingDetail: {
    staleTime: 15 * 60 * 1000, // 15 Minuten
    gcTime: 30 * 60 * 1000, // 30 Minuten
  },
  // Sehr selten geänderte Daten
  user: {
    staleTime: 30 * 60 * 1000, // 30 Minuten
    gcTime: 60 * 60 * 1000, // 60 Minuten
  },
  // Echtzeit-Daten
  bookings: {
    staleTime: 0, // Immer fresh
    gcTime: 5 * 60 * 1000, // 5 Minuten
  },
  // Statische Daten
  static: {
    staleTime: 60 * 60 * 1000, // 60 Minuten
    gcTime: 24 * 60 * 60 * 1000, // 24 Stunden
  },
} as const;

/**
 * Erstellt einen optimierten QueryClient
 */
export function createOptimizedQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 Minuten Standard
        gcTime: 10 * 60 * 1000, // 10 Minuten Standard
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

/**
 * tRPC React Hook mit Cache-Konfiguration
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Cache-Invalidation Utilities
 */
export class CacheInvalidator {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidiert alle Listings
   */
  invalidateListings() {
    this.queryClient.invalidateQueries({
      queryKey: [['gartenlauben', 'list']],
    });
  }

  /**
   * Invalidiert eine spezifische Gartenlaube
   */
  invalidateListing(id: number) {
    this.queryClient.invalidateQueries({
      queryKey: [['gartenlauben', 'getById', { id }]],
    });
  }

  /**
   * Invalidiert Benutzer-Daten
   */
  invalidateUser() {
    this.queryClient.invalidateQueries({
      queryKey: [['auth', 'me']],
    });
  }

  /**
   * Invalidiert Buchungen
   */
  invalidateBookings() {
    this.queryClient.invalidateQueries({
      queryKey: [['bookings']],
    });
  }

  /**
   * Invalidiert alles
   */
  invalidateAll() {
    this.queryClient.clear();
  }
}

/**
 * Cache-Statistiken
 */
export class CacheStats {
  private hits = 0;
  private misses = 0;
  private startTime = Date.now();

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? 0 : (this.hits / total) * 100;
    const uptime = Date.now() - this.startTime;

    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: hitRate.toFixed(2),
      uptime: `${(uptime / 1000 / 60).toFixed(2)}m`,
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
  }
}

export const cacheStats = new CacheStats();
