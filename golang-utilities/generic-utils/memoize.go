package genericutils

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

// MemoizedFunc represents a memoized function with cache management methods
type MemoizedFunc[T any] struct {
	mu    sync.RWMutex
	cache map[string]T
	fn    func(...interface{}) T
	keyFn func(...interface{}) string
}

// Memoize creates a memoized version of a function (thread-safe)
// The function caches results based on input arguments
func Memoize[T any](fn func(...interface{}) T, keyFn ...func(...interface{}) string) *MemoizedFunc[T] {
	var keyGenerator func(...interface{}) string

	if len(keyFn) > 0 && keyFn[0] != nil {
		keyGenerator = keyFn[0]
	} else {
		// Default key generator using JSON serialization
		keyGenerator = func(args ...interface{}) string {
			data, err := json.Marshal(args)
			if err != nil {
				// Fallback to string formatting
				return fmt.Sprintf("%v", args)
			}
			return string(data)
		}
	}

	return &MemoizedFunc[T]{
		cache: make(map[string]T),
		fn:    fn,
		keyFn: keyGenerator,
	}
}

// Call invokes the memoized function with the given arguments
func (mf *MemoizedFunc[T]) Call(args ...interface{}) T {
	key := mf.keyFn(args...)

	// Try to get from cache with read lock
	mf.mu.RLock()
	if value, exists := mf.cache[key]; exists {
		mf.mu.RUnlock()
		return value
	}
	mf.mu.RUnlock()

	// Not in cache, compute with write lock
	mf.mu.Lock()
	defer mf.mu.Unlock()

	// Double-check after acquiring write lock
	if value, exists := mf.cache[key]; exists {
		return value
	}

	result := mf.fn(args...)
	mf.cache[key] = result
	return result
}

// Clear removes all cached entries
func (mf *MemoizedFunc[T]) Clear() {
	mf.mu.Lock()
	defer mf.mu.Unlock()
	mf.cache = make(map[string]T)
}

// Delete removes a specific cached entry
func (mf *MemoizedFunc[T]) Delete(args ...interface{}) bool {
	key := mf.keyFn(args...)

	mf.mu.Lock()
	defer mf.mu.Unlock()

	_, exists := mf.cache[key]
	if exists {
		delete(mf.cache, key)
	}
	return exists
}

// Has checks if a result is cached for the given arguments
func (mf *MemoizedFunc[T]) Has(args ...interface{}) bool {
	key := mf.keyFn(args...)

	mf.mu.RLock()
	defer mf.mu.RUnlock()

	_, exists := mf.cache[key]
	return exists
}

// Size returns the number of cached entries
func (mf *MemoizedFunc[T]) Size() int {
	mf.mu.RLock()
	defer mf.mu.RUnlock()
	return len(mf.cache)
}

// MemoizedFuncWithLimit represents a memoized function with LRU-like cache limit
type MemoizedFuncWithLimit[T any] struct {
	mu          sync.RWMutex
	cache       map[string]cacheEntryWithTime[T]
	fn          func(...interface{}) T
	keyFn       func(...interface{}) string
	maxSize     int
	accessOrder []string
}

type cacheEntryWithTime[T any] struct {
	Value      T
	LastAccess time.Time
}

// MemoizeWithLimit creates a memoized function with a maximum cache size (thread-safe)
// Uses LRU-like eviction when the cache is full
func MemoizeWithLimit[T any](fn func(...interface{}) T, maxSize int, keyFn ...func(...interface{}) string) *MemoizedFuncWithLimit[T] {
	var keyGenerator func(...interface{}) string

	if len(keyFn) > 0 && keyFn[0] != nil {
		keyGenerator = keyFn[0]
	} else {
		keyGenerator = func(args ...interface{}) string {
			data, err := json.Marshal(args)
			if err != nil {
				return fmt.Sprintf("%v", args)
			}
			return string(data)
		}
	}

	return &MemoizedFuncWithLimit[T]{
		cache:       make(map[string]cacheEntryWithTime[T]),
		fn:          fn,
		keyFn:       keyGenerator,
		maxSize:     maxSize,
		accessOrder: make([]string, 0),
	}
}

// Call invokes the memoized function with size limit
func (mf *MemoizedFuncWithLimit[T]) Call(args ...interface{}) T {
	key := mf.keyFn(args...)

	// Try to get from cache
	mf.mu.Lock()
	defer mf.mu.Unlock()

	if entry, exists := mf.cache[key]; exists {
		entry.LastAccess = time.Now()
		mf.cache[key] = entry
		return entry.Value
	}

	// Compute result
	result := mf.fn(args...)

	// Evict if at max size
	if len(mf.cache) >= mf.maxSize {
		// Find least recently used
		var oldestKey string
		oldestTime := time.Now()

		for k, entry := range mf.cache {
			if entry.LastAccess.Before(oldestTime) {
				oldestTime = entry.LastAccess
				oldestKey = k
			}
		}

		delete(mf.cache, oldestKey)
	}

	mf.cache[key] = cacheEntryWithTime[T]{
		Value:      result,
		LastAccess: time.Now(),
	}

	return result
}

// Clear removes all cached entries
func (mf *MemoizedFuncWithLimit[T]) Clear() {
	mf.mu.Lock()
	defer mf.mu.Unlock()
	mf.cache = make(map[string]cacheEntryWithTime[T])
	mf.accessOrder = make([]string, 0)
}

// Size returns the current cache size
func (mf *MemoizedFuncWithLimit[T]) Size() int {
	mf.mu.RLock()
	defer mf.mu.RUnlock()
	return len(mf.cache)
}

// MemoizedFuncWithTTL represents a memoized function with TTL-based expiration
type MemoizedFuncWithTTL[T any] struct {
	mu    sync.RWMutex
	cache map[string]cacheEntryWithExpiry[T]
	fn    func(...interface{}) T
	keyFn func(...interface{}) string
	ttl   time.Duration
}

type cacheEntryWithExpiry[T any] struct {
	Value     T
	ExpiresAt time.Time
}

// MemoizeWithTTL creates a memoized function with TTL (thread-safe)
func MemoizeWithTTL[T any](fn func(...interface{}) T, ttl time.Duration, keyFn ...func(...interface{}) string) *MemoizedFuncWithTTL[T] {
	var keyGenerator func(...interface{}) string

	if len(keyFn) > 0 && keyFn[0] != nil {
		keyGenerator = keyFn[0]
	} else {
		keyGenerator = func(args ...interface{}) string {
			data, err := json.Marshal(args)
			if err != nil {
				return fmt.Sprintf("%v", args)
			}
			return string(data)
		}
	}

	return &MemoizedFuncWithTTL[T]{
		cache: make(map[string]cacheEntryWithExpiry[T]),
		fn:    fn,
		keyFn: keyGenerator,
		ttl:   ttl,
	}
}

// Call invokes the memoized function with TTL
func (mf *MemoizedFuncWithTTL[T]) Call(args ...interface{}) T {
	key := mf.keyFn(args...)
	now := time.Now()

	mf.mu.Lock()
	defer mf.mu.Unlock()

	// Check if cached and not expired
	if entry, exists := mf.cache[key]; exists {
		if now.Before(entry.ExpiresAt) {
			return entry.Value
		}
		delete(mf.cache, key)
	}

	// Compute result
	result := mf.fn(args...)
	mf.cache[key] = cacheEntryWithExpiry[T]{
		Value:     result,
		ExpiresAt: now.Add(mf.ttl),
	}

	return result
}

// Clear removes all cached entries
func (mf *MemoizedFuncWithTTL[T]) Clear() {
	mf.mu.Lock()
	defer mf.mu.Unlock()
	mf.cache = make(map[string]cacheEntryWithExpiry[T])
}

// Size returns the current cache size (includes expired entries)
func (mf *MemoizedFuncWithTTL[T]) Size() int {
	mf.mu.RLock()
	defer mf.mu.RUnlock()
	return len(mf.cache)
}
