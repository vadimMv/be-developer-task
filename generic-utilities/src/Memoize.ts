/**
 * Memoization decorator that caches function results
 * Preserves the original function signature and type safety
 *
 * @template TFunc - The function type to memoize
 * @param fn - The function to memoize
 * @param keyFn - Optional custom key generation function
 * @returns Memoized version of the function
 */
export function memoize<TFunc extends (...args: any[]) => any>(
    fn: TFunc,
    keyFn?: (...args: Parameters<TFunc>) => string
): TFunc {
    const cache = new Map<string, ReturnType<TFunc>>();

    /**
     * Default key generation function
     * Converts arguments to a JSON string for simple cases
     */
    const defaultKeyFn = (...args: Parameters<TFunc>): string => {
        try {
            return JSON.stringify(args);
        } catch (error) {
            // Fallback for non-serializable objects
            return args.map((arg, index) => `${index}:${String(arg)}`).join('|');
        }
    };

    const getKey = keyFn || defaultKeyFn;

    const memoized = function(this: any, ...args: Parameters<TFunc>): ReturnType<TFunc> {
        const key = getKey(...args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };

    // Add utility methods to the memoized function
    (memoized as any).clear = () => {
        cache.clear();
    };

    (memoized as any).delete = (...args: Parameters<TFunc>) => {
        const key = getKey(...args);
        return cache.delete(key);
    };

    (memoized as any).has = (...args: Parameters<TFunc>) => {
        const key = getKey(...args);
        return cache.has(key);
    };

    (memoized as any).size = () => {
        return cache.size;
    };

    return memoized as TFunc;
}

/**
 * Memoization with size limit (LRU-like behavior)
 * @template TFunc - The function type to memoize
 * @param fn - The function to memoize
 * @param maxSize - Maximum cache size
 * @param keyFn - Optional custom key generation function
 * @returns Memoized version of the function
 */
export function memoizeWithLimit<TFunc extends (...args: any[]) => any>(
    fn: TFunc,
    maxSize: number,
    keyFn?: (...args: Parameters<TFunc>) => string
): TFunc {
    const cache = new Map<string, { value: ReturnType<TFunc>; lastAccess: number }>();
    const accessOrder: string[] = [];

    const defaultKeyFn = (...args: Parameters<TFunc>): string => {
        try {
            return JSON.stringify(args);
        } catch (error) {
            return args.map((arg, index) => `${index}:${String(arg)}`).join('|');
        }
    };

    const getKey = keyFn || defaultKeyFn;

    const memoized = function(this: any, ...args: Parameters<TFunc>): ReturnType<TFunc> {
        const key = getKey(...args);

        if (cache.has(key)) {
            const entry = cache.get(key)!;
            entry.lastAccess = Date.now();
            return entry.value;
        }

        const result = fn.apply(this, args);

        // If cache is at max size, remove least recently used
        if (cache.size >= maxSize) {
            let oldestKey = accessOrder[0];
            let oldestTime = cache.get(oldestKey)?.lastAccess ?? Infinity;

            for (const [cacheKey, entry] of cache.entries()) {
                if (entry.lastAccess < oldestTime) {
                    oldestTime = entry.lastAccess;
                    oldestKey = cacheKey;
                }
            }

            cache.delete(oldestKey);
            const index = accessOrder.indexOf(oldestKey);
            if (index > -1) {
                accessOrder.splice(index, 1);
            }
        }

        cache.set(key, { value: result, lastAccess: Date.now() });
        accessOrder.push(key);
        return result;
    };

    (memoized as any).clear = () => {
        cache.clear();
        accessOrder.length = 0;
    };

    (memoized as any).size = () => {
        return cache.size;
    };

    return memoized as TFunc;
}

/**
 * Memoization with TTL (Time To Live)
 * @template TFunc - The function type to memoize
 * @param fn - The function to memoize
 * @param ttlMs - Time to live in milliseconds
 * @param keyFn - Optional custom key generation function
 * @returns Memoized version of the function
 */
export function memoizeWithTTL<TFunc extends (...args: any[]) => any>(
    fn: TFunc,
    ttlMs: number,
    keyFn?: (...args: Parameters<TFunc>) => string
): TFunc {
    const cache = new Map<string, { value: ReturnType<TFunc>; expiresAt: number }>();

    const defaultKeyFn = (...args: Parameters<TFunc>): string => {
        try {
            return JSON.stringify(args);
        } catch (error) {
            return args.map((arg, index) => `${index}:${String(arg)}`).join('|');
        }
    };

    const getKey = keyFn || defaultKeyFn;

    const memoized = function(this: any, ...args: Parameters<TFunc>): ReturnType<TFunc> {
        const key = getKey(...args);
        const now = Date.now();

        if (cache.has(key)) {
            const entry = cache.get(key)!;
            if (now < entry.expiresAt) {
                return entry.value;
            }
            cache.delete(key);
        }

        const result = fn.apply(this, args);
        cache.set(key, { value: result, expiresAt: now + ttlMs });
        return result;
    };

    (memoized as any).clear = () => {
        cache.clear();
    };

    (memoized as any).size = () => {
        return cache.size;
    };

    return memoized as TFunc;
}
