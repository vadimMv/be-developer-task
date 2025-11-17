import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface FetchOptions extends RequestInit {
  cacheTime?: number; // Time in ms to keep cache valid (default: 5 minutes)
}

interface UseFetchWithCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Global cache shared across all hook instances
const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Custom hook for data fetching with caching
 *
 * Features:
 * - Caches results by URL
 * - Cancels requests on unmount using AbortController
 * - Supports refetching via refetch()
 * - Configurable cache time
 *
 * @param url - The URL to fetch from
 * @param options - Fetch options including custom cacheTime
 * @returns Object with data, loading, error, and refetch function
 */
export function useFetchWithCache<T = unknown>(
  url: string,
  options: FetchOptions = {}
): UseFetchWithCacheResult<T> {
  const { cacheTime = 5 * 60 * 1000, ...fetchOptions } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchCountRef = useRef(0);

  const fetchData = useCallback(
    async (skipCache = false) => {
      try {
        // Check cache first (unless skipCache is true for refetch)
        if (!skipCache) {
          const cachedEntry = cache.get(url) as CacheEntry<T> | undefined;
          if (cachedEntry) {
            const isExpired = Date.now() - cachedEntry.timestamp > cacheTime;
            if (!isExpired) {
              setData(cachedEntry.data);
              setLoading(false);
              setError(null);
              return;
            }
          }
        }

        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const currentFetchCount = ++fetchCountRef.current;

        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Only update state if this is still the latest fetch
        if (currentFetchCount === fetchCountRef.current) {
          // Update cache
          cache.set(url, {
            data: result,
            timestamp: Date.now(),
          });

          setData(result);
          setLoading(false);
        }
      } catch (err) {
        // Ignore abort errors (they're intentional)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        // Only update error state if this is still the latest fetch
        if (fetchCountRef.current === fetchCountRef.current) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
          setLoading(false);
        }
      }
    },
    [url, cacheTime, fetchOptions]
  );

  // Refetch function to manually trigger a fresh fetch
  const refetch = useCallback(() => {
    fetchData(true); // Skip cache when manually refetching
  }, [fetchData]);

  // Fetch on mount or when url changes
  useEffect(() => {
    fetchData();

    // Cleanup: abort request on unmount or when dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Utility function to clear the cache
 * Can be used to manually clear all cached data or specific URL
 */
export function clearCache(url?: string): void {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
}

/**
 * Utility function to get cache size
 * Useful for debugging
 */
export function getCacheSize(): number {
  return cache.size;
}
