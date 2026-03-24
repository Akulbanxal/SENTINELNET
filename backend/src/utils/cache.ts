import { config } from '../config/index.js';
import { logger } from './logger.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds || config.cache.ttlSeconds;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000,
    });
    logger.debug('Cache set', { key, ttl });
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.debug('Cache miss', { key });
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      logger.debug('Cache expired', { key, age: Math.round(age / 1000) });
      this.cache.delete(key);
      return null;
    }

    logger.debug('Cache hit', { key, age: Math.round(age / 1000) });
    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    logger.debug('Cache delete', { key });
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    logger.info('Cache cleared', { entries: this.cache.size });
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let expired = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        expired++;
      }
    }

    if (expired > 0) {
      logger.debug('Cache cleanup', { expired, remaining: this.cache.size });
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new SimpleCache();
export default cache;
