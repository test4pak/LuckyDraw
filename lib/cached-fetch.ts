/**
 * Cached data fetching utilities with stale-while-revalidate pattern
 */

import { getCachedData, setCachedData, getCachedDataStale, CacheKeys, CacheTTL } from './cache';

// Re-export for convenience
export { CacheKeys, CacheTTL };

/**
 * Fetch data with caching support
 * Returns cached data immediately if available, then fetches fresh data in background
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  // Try to get cached data first
  const cached = getCachedData<T>(cacheKey);
  if (cached !== null) {
    // Return cached data immediately, then refresh in background
    fetchFn().then(freshData => {
      setCachedData(cacheKey, freshData, ttl);
    }).catch(() => {
      // Silently fail background refresh
    });
    return cached;
  }

  // No cache, fetch fresh data
  const data = await fetchFn();
  setCachedData(cacheKey, data, ttl);
  return data;
}

/**
 * Fetch data with stale-while-revalidate
 * Returns stale cached data immediately if available, then fetches fresh data
 */
export async function fetchWithStaleRevalidate<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  // Get stale cached data if available
  const stale = getCachedDataStale<T>(cacheKey);
  
  // Always fetch fresh data
  const freshPromise = fetchFn().then(data => {
    setCachedData(cacheKey, data, ttl);
    return data;
  });

  // Return stale data immediately if available, otherwise wait for fresh
  if (stale !== null) {
    // Don't await, let it update in background
    freshPromise.catch(() => {});
    return stale;
  }

  return freshPromise;
}

/**
 * Invalidate cache for a specific key
 */
export function invalidateCache(key: string): void {
  const { clearCache } = require('./cache');
  clearCache(key);
}

/**
 * Invalidate all event-related caches
 */
export function invalidateEventCaches(eventId?: string): void {
  const { clearCache, CacheKeys } = require('./cache');
  
  if (eventId) {
    clearCache(CacheKeys.event(eventId));
    clearCache(CacheKeys.eventPrizes(eventId));
    clearCache(CacheKeys.eventParticipants(eventId));
  }
  
  // Clear all events cache
  clearCache(CacheKeys.events());
  clearCache(CacheKeys.events('running'));
  clearCache(CacheKeys.events('upcoming'));
  clearCache(CacheKeys.events('completed'));
  clearCache(CacheKeys.heroEvents());
  clearCache(CacheKeys.stats());
}

