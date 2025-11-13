package ratelimiter

import (
	"sync"
	"time"
)

/*
LEAKY BUCKET RATE LIMITER

Algorithm Explanation:
======================
The Leaky Bucket algorithm is similar to a bucket with a hole at the bottom:

1. Requests are added to a bucket (queue) when they arrive
2. The bucket has a maximum capacity
3. Requests "leak" out of the bucket at a constant rate
4. If the bucket is full, new requests are rejected
5. This ensures a smooth, constant output rate

The key difference from Token Bucket:
- Token Bucket: Allows bursts up to capacity, then limits rate
- Leaky Bucket: Enforces a constant output rate regardless of input

Advantages:
- Provides a perfectly smooth output rate
- Prevents bursts from overwhelming downstream systems
- Simple to understand conceptually
- Guarantees constant processing rate

Disadvantages:
- No burst allowance (stricter than token bucket)
- May reject valid requests during traffic spikes
- Queue management adds complexity

Use Cases:
- Network packet scheduling
- Strict rate limiting where bursts are not acceptable
- Smoothing bursty traffic
- Video streaming rate control
*/

// LeakyBucket represents a leaky bucket rate limiter
type LeakyBucket struct {
	mu         sync.Mutex
	capacity   int           // Maximum number of requests in the bucket
	queue      int           // Current number of requests in the bucket
	leakRate   float64       // Requests that leak out per second
	lastLeak   time.Time     // Last time the bucket leaked
}

// NewLeakyBucket creates a new leaky bucket rate limiter
// Parameters:
//   - rate: number of requests processed per second (leak rate)
//   - capacity: maximum number of requests that can be queued
func NewLeakyBucket(rate float64, capacity int) *LeakyBucket {
	return &LeakyBucket{
		capacity: capacity,
		queue:    0,
		leakRate: rate,
		lastLeak: time.Now(),
	}
}

// Allow checks if a request should be allowed
// Returns true if there's space in the bucket, false otherwise
func (lb *LeakyBucket) Allow() bool {
	return lb.AllowN(1)
}

// AllowN checks if n requests should be allowed
// Returns true if there's space for n requests, false otherwise
func (lb *LeakyBucket) AllowN(n int) bool {
	lb.mu.Lock()
	defer lb.mu.Unlock()

	// Leak requests based on elapsed time
	lb.leak()

	// Check if we have space for n requests
	if lb.queue+n <= lb.capacity {
		lb.queue += n
		return true
	}

	return false
}

// leak removes requests from the bucket based on elapsed time
// This method should be called with the mutex locked
func (lb *LeakyBucket) leak() {
	now := time.Now()
	elapsed := now.Sub(lb.lastLeak).Seconds()

	// Calculate how many requests have leaked out
	leaked := int(elapsed * lb.leakRate)

	if leaked > 0 {
		lb.queue = maxInt(0, lb.queue-leaked)
		lb.lastLeak = now
	}
}

// Wait blocks until a request can be allowed
func (lb *LeakyBucket) Wait() {
	lb.WaitN(1)
}

// WaitN blocks until n requests can be allowed
func (lb *LeakyBucket) WaitN(n int) {
	for {
		if lb.AllowN(n) {
			return
		}
		// Sleep for a short duration before retrying
		time.Sleep(time.Millisecond * 10)
	}
}

// Reserve returns the duration to wait before n requests can be allowed
func (lb *LeakyBucket) Reserve(n int) time.Duration {
	lb.mu.Lock()
	defer lb.mu.Unlock()

	lb.leak()

	if lb.queue+n <= lb.capacity {
		lb.queue += n
		return 0
	}

	// Calculate wait time based on how full the bucket is
	overflow := (lb.queue + n) - lb.capacity
	waitTime := time.Duration(float64(overflow)/lb.leakRate*1000) * time.Millisecond

	return waitTime
}

// QueueSize returns the current number of requests in the queue
func (lb *LeakyBucket) QueueSize() int {
	lb.mu.Lock()
	defer lb.mu.Unlock()

	lb.leak()
	return lb.queue
}

// AvailableCapacity returns the remaining capacity in the bucket
func (lb *LeakyBucket) AvailableCapacity() int {
	lb.mu.Lock()
	defer lb.mu.Unlock()

	lb.leak()
	return lb.capacity - lb.queue
}

// Helper function for max
func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
