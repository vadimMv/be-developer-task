package ratelimiter

import (
	"sync"
	"time"
)

/*
TOKEN BUCKET RATE LIMITER

Algorithm Explanation:
======================
The Token Bucket algorithm is one of the most popular rate limiting algorithms.
It works like a bucket that holds tokens:

1. The bucket has a maximum capacity (burst size)
2. Tokens are added to the bucket at a fixed rate (refill rate)
3. When a request comes in, it consumes tokens from the bucket
4. If enough tokens are available, the request is allowed
5. If not enough tokens are available, the request is denied
6. Tokens are added continuously until the bucket is full

Advantages:
- Allows bursts of traffic up to the bucket capacity
- Smooth rate limiting over time
- Simple to implement and understand
- Memory efficient

Disadvantages:
- May allow temporary bursts that could overwhelm the system
- Not suitable for strict rate limiting requirements

Use Cases:
- API rate limiting with burst allowance
- Network traffic shaping
- Request throttling for web services
*/

// TokenBucket represents a token bucket rate limiter
type TokenBucket struct {
	mu           sync.Mutex    // Protects concurrent access
	capacity     float64       // Maximum number of tokens in the bucket
	tokens       float64       // Current number of tokens
	refillRate   float64       // Tokens added per second
	lastRefill   time.Time     // Last time tokens were refilled
}

// NewTokenBucket creates a new token bucket rate limiter
// Parameters:
//   - rate: number of requests allowed per second
//   - burst: maximum burst size (bucket capacity)
func NewTokenBucket(rate float64, burst int) *TokenBucket {
	return &TokenBucket{
		capacity:   float64(burst),
		tokens:     float64(burst), // Start with a full bucket
		refillRate: rate,
		lastRefill: time.Now(),
	}
}

// Allow checks if a request should be allowed
// Returns true if the request is allowed, false otherwise
func (tb *TokenBucket) Allow() bool {
	return tb.AllowN(1)
}

// AllowN checks if n requests should be allowed
// Returns true if n tokens are available, false otherwise
func (tb *TokenBucket) AllowN(n int) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	// Refill tokens based on elapsed time
	tb.refill()

	// Check if we have enough tokens
	if tb.tokens >= float64(n) {
		tb.tokens -= float64(n)
		return true
	}

	return false
}

// refill adds tokens to the bucket based on elapsed time
// This method should be called with the mutex locked
func (tb *TokenBucket) refill() {
	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()

	// Calculate tokens to add based on elapsed time
	tokensToAdd := elapsed * tb.refillRate

	// Add tokens but don't exceed capacity
	tb.tokens = min(tb.capacity, tb.tokens+tokensToAdd)
	tb.lastRefill = now
}

// Wait blocks until a request can be allowed
// Returns immediately if a token is available
func (tb *TokenBucket) Wait() {
	tb.WaitN(1)
}

// WaitN blocks until n requests can be allowed
func (tb *TokenBucket) WaitN(n int) {
	for {
		if tb.AllowN(n) {
			return
		}
		// Sleep for a short duration before retrying
		time.Sleep(time.Millisecond * 10)
	}
}

// Reserve returns the duration to wait before n requests can be allowed
// If the requests can be allowed immediately, returns 0
func (tb *TokenBucket) Reserve(n int) time.Duration {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.refill()

	if tb.tokens >= float64(n) {
		tb.tokens -= float64(n)
		return 0
	}

	// Calculate how long to wait for enough tokens
	tokensNeeded := float64(n) - tb.tokens
	waitTime := time.Duration(tokensNeeded/tb.refillRate*1000) * time.Millisecond

	return waitTime
}

// AvailableTokens returns the current number of available tokens
func (tb *TokenBucket) AvailableTokens() float64 {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.refill()
	return tb.tokens
}

// Helper function for min
func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
