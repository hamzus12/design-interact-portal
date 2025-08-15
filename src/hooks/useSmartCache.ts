
import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
}

export function useSmartCache<T>(key: string, options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 50 } = options; // Default 5 minutes TTL
  
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() > entry.timestamp + entry.expiry;
  }, []);

  const cleanupExpired = useCallback(() => {
    setCache(currentCache => {
      const newCache = new Map(currentCache);
      for (const [key, entry] of newCache.entries()) {
        if (isExpired(entry)) {
          newCache.delete(key);
        }
      }
      return newCache;
    });
  }, [isExpired]);

  const enforceMaxSize = useCallback(() => {
    setCache(currentCache => {
      if (currentCache.size <= maxSize) return currentCache;
      
      const entries = Array.from(currentCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by timestamp (oldest first)
      
      const newCache = new Map();
      const keepCount = Math.floor(maxSize * 0.8); // Keep 80% when cleaning
      
      for (let i = entries.length - keepCount; i < entries.length; i++) {
        const [key, entry] = entries[i];
        newCache.set(key, entry);
      }
      
      return newCache;
    });
  }, [maxSize]);

  const get = useCallback((cacheKey: string): T | null => {
    const entry = cache.get(cacheKey);
    
    if (!entry) return null;
    
    if (isExpired(entry)) {
      setCache(currentCache => {
        const newCache = new Map(currentCache);
        newCache.delete(cacheKey);
        return newCache;
      });
      return null;
    }
    
    return entry.data;
  }, [cache, isExpired]);

  const set = useCallback((cacheKey: string, data: T, customTtl?: number) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: customTtl || ttl
    };

    setCache(currentCache => {
      const newCache = new Map(currentCache);
      newCache.set(cacheKey, entry);
      return newCache;
    });

    // Cleanup after setting
    setTimeout(() => {
      cleanupExpired();
      enforceMaxSize();
    }, 0);
  }, [ttl, cleanupExpired, enforceMaxSize]);

  const remove = useCallback((cacheKey: string) => {
    setCache(currentCache => {
      const newCache = new Map(currentCache);
      newCache.delete(cacheKey);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  const fetchWithCache = useCallback(async <R>(
    cacheKey: string,
    fetchFn: () => Promise<R>,
    customTtl?: number
  ): Promise<R> => {
    // Try to get from cache first
    const cached = get(cacheKey);
    if (cached) {
      return cached as unknown as R;
    }

    // Fetch new data
    const freshData = await fetchFn();
    set(cacheKey, freshData as unknown as T, customTtl);
    
    return freshData;
  }, [get, set]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpired();
    }, 60 * 1000); // Cleanup every minute

    return () => clearInterval(interval);
  }, [cleanupExpired]);

  return {
    get,
    set,
    remove,
    clear,
    fetchWithCache,
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}
