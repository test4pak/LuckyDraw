/**
 * Simple caching utility for client-side data caching
 * Uses localStorage with expiration and stale-while-revalidate pattern
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_PREFIX = 'luckydraw_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

/**
 * Get cached data if it exists and is not expired
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if expired
    if (now > entry.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Set data in cache with optional TTL (time to live in milliseconds)
 */
export function setCachedData<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (typeof window === 'undefined') return;

  try {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded or other storage errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Clear old cache entries
      clearOldCacheEntries();
      try {
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttl,
        }));
      } catch (retryError) {
        console.error('Cache write error after cleanup:', retryError);
      }
    } else {
      console.error('Cache write error:', error);
    }
  }
}

/**
 * Check if cached data exists and is still valid (not expired)
 */
export function isCachedValid(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return false;

    const entry: CacheEntry<any> = JSON.parse(cached);
    return Date.now() <= entry.expiresAt;
  } catch {
    return false;
  }
}

/**
 * Get cached data even if expired (for stale-while-revalidate)
 */
export function getCachedDataStale<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Clear a specific cache entry
 */
export function clearCache(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Clear old/expired cache entries to free up space
 */
function clearOldCacheEntries(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  const now = Date.now();
  let cleared = 0;

  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<any> = JSON.parse(cached);
          if (now > entry.expiresAt) {
            localStorage.removeItem(key);
            cleared++;
          }
        }
      } catch {
        // Remove invalid entries
        localStorage.removeItem(key);
        cleared++;
      }
    }
  });

  if (cleared > 0) {
    console.log(`Cleared ${cleared} expired cache entries`);
  }
}

/**
 * Cache key generators for different data types
 */
export const CacheKeys = {
  events: (status?: string) => `events_${status || 'all'}`,
  event: (id: string) => `event_${id}`,
  eventPrizes: (eventId: string) => `event_prizes_${eventId}`,
  eventParticipants: (eventId: string) => `event_participants_${eventId}`,
  user: (userId: string) => `user_${userId}`,
  userEvents: (userId: string) => `user_events_${userId}`,
  stats: () => 'stats',
  heroEvents: () => 'hero_events',
};

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
};

