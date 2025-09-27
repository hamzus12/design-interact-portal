import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
}

export function useSmartCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });

  const isExpired = useCallback((entry: CacheEntry<T>) => {
    return Date.now() > entry.expiry;
  }, []);

  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.entries());
    
    entries.forEach(([key, entry]) => {
      if (now > entry.expiry) {
        cache.current.delete(key);
      }
    });
    
    updateStats();
  }, []);

  const updateStats = useCallback(() => {
    setCacheStats(prev => ({
      ...prev,
      size: cache.current.size
    }));
  }, []);

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    
    if (!entry) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }
    
    if (isExpired(entry)) {
      cache.current.delete(key);
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      updateStats();
      return null;
    }
    
    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return entry.data;
  }, [isExpired, updateStats]);

  const set = useCallback((key: string, data: T, customTtl?: number) => {
    const effectiveTtl = customTtl || ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + effectiveTtl
    };
    
    // Enforce max size
    if (cache.current.size >= maxSize) {
      // Remove oldest entry
      const firstKey = cache.current.keys().next().value;
      if (firstKey) {
        cache.current.delete(firstKey);
      }
    }
    
    cache.current.set(key, entry);
    updateStats();
  }, [ttl, maxSize, updateStats]);

  const remove = useCallback((key: string) => {
    cache.current.delete(key);
    updateStats();
  }, [updateStats]);

  const clear = useCallback(() => {
    cache.current.clear();
    setCacheStats({ hits: 0, misses: 0, size: 0 });
  }, []);

  const getCacheKey = useCallback((prefix: string, params: Record<string, any>): string => {
    return `${prefix}_${JSON.stringify(params)}`;
  }, []);

  const fetchWithCache = useCallback(async <R>(
    cacheKey: string,
    fetchFn: () => Promise<R>,
    customTtl?: number
  ): Promise<R> => {
    const cached = get(cacheKey) as unknown as R | null;
    if (cached) {
      return cached;
    }
    
    const result = await fetchFn();
    set(cacheKey, result as unknown as T, customTtl);
    return result;
  }, [get, set]);

  // Auto cleanup expired entries periodically
  const startCleanupTimer = useCallback(() => {
    const interval = setInterval(cleanupExpired, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, [cleanupExpired]);

  return {
    get,
    set,
    remove,
    clear,
    getCacheKey,
    fetchWithCache,
    cacheStats,
    startCleanupTimer,
    size: cache.current.size,
    keys: Array.from(cache.current.keys())
  };
}