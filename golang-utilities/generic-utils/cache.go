package genericutils

import (
	"sync"
	"time"
)

// CacheEntry stores a value along with optional expiration time
type CacheEntry[V any] struct {
	Value     V
	ExpiresAt *time.Time
}

// Cache is a generic thread-safe cache implementation with TTL support
type Cache[K comparable, V any] struct {
	mu    sync.RWMutex
	cache map[K]CacheEntry[V]
}

// NewCache creates a new Cache instance
func NewCache[K comparable, V any]() *Cache[K, V] {
	return &Cache[K, V]{
		cache: make(map[K]CacheEntry[V]),
	}
}

// Set stores a value in the cache with optional TTL
// ttl is the time-to-live duration; pass 0 for no expiration
func (c *Cache[K, V]) Set(key K, value V, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	entry := CacheEntry[V]{
		Value: value,
	}

	if ttl > 0 {
		expiresAt := time.Now().Add(ttl)
		entry.ExpiresAt = &expiresAt
	}

	c.cache[key] = entry
}

// Get retrieves a value from the cache
// Returns the value and true if found and not expired, zero value and false otherwise
func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	entry, exists := c.cache[key]
	if !exists {
		var zero V
		return zero, false
	}

	// Check if expired
	if entry.ExpiresAt != nil && time.Now().After(*entry.ExpiresAt) {
		delete(c.cache, key)
		var zero V
		return zero, false
	}

	return entry.Value, true
}

// Has checks if a key exists in the cache and is not expired
func (c *Cache[K, V]) Has(key K) bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	entry, exists := c.cache[key]
	if !exists {
		return false
	}

	// Check if expired
	if entry.ExpiresAt != nil && time.Now().After(*entry.ExpiresAt) {
		delete(c.cache, key)
		return false
	}

	return true
}

// Delete removes a key from the cache
func (c *Cache[K, V]) Delete(key K) bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	_, exists := c.cache[key]
	if exists {
		delete(c.cache, key)
	}
	return exists
}

// Clear removes all entries from the cache
func (c *Cache[K, V]) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.cache = make(map[K]CacheEntry[V])
}

// Size returns the number of non-expired entries in the cache
func (c *Cache[K, V]) Size() int {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.cleanExpired()
	return len(c.cache)
}

// cleanExpired removes all expired entries from the cache
// Must be called with lock held
func (c *Cache[K, V]) cleanExpired() {
	now := time.Now()
	for key, entry := range c.cache {
		if entry.ExpiresAt != nil && now.After(*entry.ExpiresAt) {
			delete(c.cache, key)
		}
	}
}

// GetOrSet retrieves a value from cache, or sets it using the provided function if not found
func (c *Cache[K, V]) GetOrSet(key K, fn func() V, ttl time.Duration) V {
	// Try to get first (with read lock)
	if value, ok := c.Get(key); ok {
		return value
	}

	// Not found, need to compute and set
	c.mu.Lock()
	defer c.mu.Unlock()

	// Double-check after acquiring write lock
	entry, exists := c.cache[key]
	if exists && (entry.ExpiresAt == nil || time.Now().Before(*entry.ExpiresAt)) {
		return entry.Value
	}

	// Compute value
	value := fn()

	// Set in cache
	newEntry := CacheEntry[V]{
		Value: value,
	}
	if ttl > 0 {
		expiresAt := time.Now().Add(ttl)
		newEntry.ExpiresAt = &expiresAt
	}
	c.cache[key] = newEntry

	return value
}

// Keys returns all non-expired keys in the cache
func (c *Cache[K, V]) Keys() []K {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.cleanExpired()
	keys := make([]K, 0, len(c.cache))
	for key := range c.cache {
		keys = append(keys, key)
	}
	return keys
}
