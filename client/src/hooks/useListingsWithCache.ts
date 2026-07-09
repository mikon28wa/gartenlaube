/**
 * Custom Hook für paginierte Listings mit Caching
 * Integriert die Caching-Strategie direkt in die Listenansicht
 */

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { CACHE_CONFIG } from '@/lib/trpcWithCache';
import type { FilterState } from '@/modules/filters';

interface UseListingsWithCacheOptions {
  filters: FilterState;
  page: number;
  limit: number;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'distance-asc' | 'distance-desc';
}

/**
 * Hook für paginierte Listings mit automatischem Caching
 */
export function useListingsWithCache(options: UseListingsWithCacheOptions) {
  const { filters, page, limit, sortBy = 'featured' } = options;

  // Erstelle einen stabilen Query-Key basierend auf Filtern und Pagination
  const queryKey = useMemo(
    () => ({
      filters,
      page,
      limit,
      sortBy,
    }),
    [filters, page, limit, sortBy]
  );

  // tRPC Query mit Cache-Konfiguration
  const { data, isLoading, error, isFetching } = trpc.gartenlauben.list.useQuery(
    {
      ...filters,
      limit,
      offset: (page - 1) * limit,
    },
    {
      // Cache-Konfiguration für Listings
      staleTime: CACHE_CONFIG.listings.staleTime,
      gcTime: CACHE_CONFIG.listings.gcTime,
      // Nur neu laden wenn Query-Key sich ändert
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      // Retry-Strategie
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  // Sortiere Listings basierend auf sortBy
  const sortedListings = useMemo(() => {
    if (!data) return [];

    const listings = [...data];

    switch (sortBy) {
      case 'price-asc':
        return listings.sort((a, b) => {
          const aPrice = typeof a.pricePerNight === 'number' ? a.pricePerNight : 0;
          const bPrice = typeof b.pricePerNight === 'number' ? b.pricePerNight : 0;
          return aPrice - bPrice;
        });

      case 'price-desc':
        return listings.sort((a, b) => {
          const aPrice = typeof a.pricePerNight === 'number' ? a.pricePerNight : 0;
          const bPrice = typeof b.pricePerNight === 'number' ? b.pricePerNight : 0;
          return bPrice - aPrice;
        });

      case 'distance-asc':
        return listings.sort((a, b) => {
          const aDist = typeof a.distanceToRadweg === 'number' ? a.distanceToRadweg : 0;
          const bDist = typeof b.distanceToRadweg === 'number' ? b.distanceToRadweg : 0;
          return aDist - bDist;
        });

      case 'distance-desc':
        return listings.sort((a, b) => {
          const aDist = typeof a.distanceToRadweg === 'number' ? a.distanceToRadweg : 0;
          const bDist = typeof b.distanceToRadweg === 'number' ? b.distanceToRadweg : 0;
          return bDist - aDist;
        });

      case 'featured':
      default:
        return listings;
    }
  }, [data, sortBy]);

  // Cache-Status
  const cacheStatus = useMemo(
    () => ({
      isCached: !isFetching && !isLoading,
      isFetching,
      isLoading,
      hasError: !!error,
    }),
    [isFetching, isLoading, error]
  );

  return {
    listings: sortedListings,
    isLoading,
    isFetching,
    error,
    cacheStatus,
    totalCount: data?.length || 0,
    hasNextPage: (data?.length || 0) >= limit,
  };
}

/**
 * Hook für Listing-Details mit Caching
 */
export function useListingDetailWithCache(id: number) {
  const { data, isLoading, error } = trpc.gartenlauben.getById.useQuery(
    { id },
    {
      // Cache-Konfiguration für Detail-Seiten
      staleTime: CACHE_CONFIG.listingDetail.staleTime,
      gcTime: CACHE_CONFIG.listingDetail.gcTime,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retry: 2,
    }
  );

  return {
    listing: data,
    isLoading,
    error,
  };
}

/**
 * Hook für Benutzer-Daten mit Caching
 */
export function useUserWithCache() {
  const { data, isLoading, error } = trpc.auth.me.useQuery(undefined, {
    // Cache-Konfiguration für Benutzer
    staleTime: CACHE_CONFIG.user.staleTime,
    gcTime: CACHE_CONFIG.user.gcTime,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 1,
  });

  return {
    user: data,
    isLoading,
    error,
  };
}

/**
 * Hook für Buchungen mit Caching
 */
export function useBookingsWithCache(userId?: number) {
  const { data, isLoading, error } = trpc.bookings.myBookings.useQuery(
    undefined,
    {
      // Cache-Konfiguration für Buchungen (häufig geändert)
      staleTime: CACHE_CONFIG.bookings.staleTime,
      gcTime: CACHE_CONFIG.bookings.gcTime,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: 2,
    }
  );

  return {
    bookings: data || [],
    isLoading,
    error,
  };
}

/**
 * Hook für Favoriten mit Caching
 */
export function useFavoritesWithCache() {
  const { data, isLoading, error } = trpc.favorites.list.useQuery(
    undefined,
    {
      staleTime: CACHE_CONFIG.static.staleTime,
      gcTime: CACHE_CONFIG.static.gcTime,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  return {
    favorites: data || [],
    isLoading,
    error,
  };
}
