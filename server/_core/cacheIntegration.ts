/**
 * Cache-Integration für tRPC Procedures
 * Wrapper-Funktionen für automatisches Caching
 */

import { cacheManager, CacheKeyGenerator, CacheInvalidator, CACHE_TTL } from './cache';

/**
 * Cached Query Wrapper
 * Versucht Daten aus Cache zu laden, ansonsten aus Datenbank
 */
export async function cachedQuery<T>(
  key: string,
  ttl: number,
  queryFn: () => Promise<T>
): Promise<T> {
  // Versuche aus Cache zu lesen
  const cached = cacheManager.get<T>(key);
  if (cached) {
    console.log(`✅ Cache Hit: ${key}`);
    return cached;
  }

  // Cache Miss: Führe Query aus
  console.log(`❌ Cache Miss: ${key}`);
  const result = await queryFn();

  // Speichere in Cache
  cacheManager.set(key, result, ttl);

  return result;
}

/**
 * Cached Mutation Wrapper
 * Führt Mutation aus und invalidiert relevante Caches
 */
export async function cachedMutation<T>(
  mutationFn: () => Promise<T>,
  invalidatePatterns: string[]
): Promise<T> {
  // Führe Mutation aus
  const result = await mutationFn();

  // Invalidiere Caches
  invalidatePatterns.forEach(pattern => {
    cacheManager.deletePattern(pattern);
    console.log(`🗑️  Cache Invalidated: ${pattern}`);
  });

  return result;
}

/**
 * Middleware für automatisches Caching
 */
export function withCache<T>(
  key: string,
  ttl: number,
  queryFn: () => Promise<T>
) {
  return async () => {
    return cachedQuery(key, ttl, queryFn);
  };
}

/**
 * Middleware für automatische Cache-Invalidation
 */
export function withCacheInvalidation<T>(
  mutationFn: () => Promise<T>,
  invalidatePatterns: string[]
) {
  return async () => {
    return cachedMutation(mutationFn, invalidatePatterns);
  };
}

/**
 * Cache-Statistiken Endpoint
 */
export function getCacheStats() {
  return cacheManager.getStats();
}

/**
 * Cache-Verwaltung Endpoint
 */
export function manageCacheEndpoint(action: 'clear' | 'stats' | 'reset') {
  switch (action) {
    case 'clear':
      cacheManager.clear();
      return { message: 'Cache geleert' };

    case 'stats':
      return getCacheStats();

    case 'reset':
      cacheManager.resetStats();
      return { message: 'Cache-Statistiken zurückgesetzt' };

    default:
      return { error: 'Unbekannte Aktion' };
  }
}
