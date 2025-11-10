/**
 * Cache entry that stores value along with optional expiration time
 */
interface CacheEntry<V> {
    value: V;
    expiresAt?: number;
}

/**
 * Generic Cache implementation with TTL (Time To Live) support
 * @template K - Key type (must be string or number)
 * @template V - Value type
 */
export class Cache<K extends string | number, V> {
    private cache: Map<K, CacheEntry<V>> = new Map();

    /**
     * Set a value in the cache with optional TTL
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttlMs - Time to live in milliseconds (optional)
     */
    set(key: K, value: V, ttlMs?: number): void {
        const entry: CacheEntry<V> = {
            value,
            expiresAt: ttlMs ? Date.now() + ttlMs : undefined
        };
        this.cache.set(key, entry);
    }

    /**
     * Get a value from the cache
     * @param key - Cache key
     * @returns The cached value or undefined if not found or expired
     */
    get(key: K): V | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        // Check if the entry has expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.value;
    }

    /**
     * Check if a key exists in the cache and is not expired
     * @param key - Cache key
     * @returns true if the key exists and is not expired
     */
    has(key: K): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // Check if the entry has expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Clear all entries from the cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get the number of non-expired entries in the cache
     * @returns The number of valid entries
     */
    size(): number {
        // Clean up expired entries before returning size
        this.cleanExpired();
        return this.cache.size;
    }

    /**
     * Remove all expired entries from the cache
     * @private
     */
    private cleanExpired(): void {
        const now = Date.now();
        const keysToDelete: K[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt && now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }
}
