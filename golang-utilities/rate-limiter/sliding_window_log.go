package ratelimiter

import (
	"sync"
	"time"
)

/*
SLIDING WINDOW LOG RATE LIMITER

Algorithm Explanation:
======================
The Sliding Window Log keeps a log of all request timestamps:

1. Maintain a log of timestamps for all requests within the time window
2. When a new request arrives:
   a. Remove all timestamps older than (current_time - window_size)
   b. Check if remaining count is under the limit
   c. If yes, add current timestamp to log and allow request
   d. If no, reject the request
3. The window "slides" continuously with each request

Example with 10 requests/second limit:
- At 1.5s: Check requests between 0.5s and 1.5s
- At 2.3s: Check requests between 1.3s and 2.3s
- Window slides smoothly, no boundary issues

Advantages:
- Very accurate rate limiting
- No boundary problem (unlike fixed window)
- Precise request tracking
- Fair distribution of requests

Disadvantages:
- High memory usage (stores all timestamps)
- O(n) time complexity for each request (to clean old entries)
- Not suitable for high-traffic systems
- Expensive for long time windows

Use Cases:
- Low to medium traffic APIs
- When accuracy is critical
- Short time windows (seconds to minutes)
- Systems where memory is not a constraint
*/

// SlidingWindowLog represents a sliding window log rate limiter
type SlidingWindowLog struct {
	mu         sync.Mutex
	limit      int              // Maximum requests per window
	windowSize time.Duration    // Size of the sliding window
	requests   []time.Time      // Log of request timestamps
}

// NewSlidingWindowLog creates a new sliding window log rate limiter
// Parameters:
//   - limit: maximum number of requests allowed per window
//   - windowSize: duration of the sliding window
func NewSlidingWindowLog(limit int, windowSize time.Duration) *SlidingWindowLog {
	return &SlidingWindowLog{
		limit:      limit,
		windowSize: windowSize,
		requests:   make([]time.Time, 0, limit),
	}
}

// Allow checks if a request should be allowed
// Returns true if under the limit, false otherwise
func (swl *SlidingWindowLog) Allow() bool {
	return swl.AllowN(1)
}

// AllowN checks if n requests should be allowed
// Returns true if under the limit, false otherwise
func (swl *SlidingWindowLog) AllowN(n int) bool {
	swl.mu.Lock()
	defer swl.mu.Unlock()

	now := time.Now()

	// Remove expired requests (older than window size)
	swl.removeExpiredRequests(now)

	// Check if we can accommodate n new requests
	if len(swl.requests)+n <= swl.limit {
		// Add n timestamps
		for i := 0; i < n; i++ {
			swl.requests = append(swl.requests, now)
		}
		return true
	}

	return false
}

// removeExpiredRequests removes all timestamps older than the window
// This method should be called with the mutex locked
func (swl *SlidingWindowLog) removeExpiredRequests(now time.Time) {
	cutoff := now.Add(-swl.windowSize)

	// Find the first index that is still valid
	validIndex := 0
	for validIndex < len(swl.requests) && swl.requests[validIndex].Before(cutoff) {
		validIndex++
	}

	// Remove expired requests
	if validIndex > 0 {
		swl.requests = swl.requests[validIndex:]
	}
}

// Wait blocks until a request can be allowed
func (swl *SlidingWindowLog) Wait() {
	swl.WaitN(1)
}

// WaitN blocks until n requests can be allowed
func (swl *SlidingWindowLog) WaitN(n int) {
	for {
		waitTime := swl.Reserve(n)
		if waitTime == 0 {
			return
		}
		time.Sleep(waitTime)
	}
}

// Reserve returns the duration to wait before n requests can be allowed
func (swl *SlidingWindowLog) Reserve(n int) time.Duration {
	swl.mu.Lock()
	defer swl.mu.Unlock()

	now := time.Now()
	swl.removeExpiredRequests(now)

	if len(swl.requests)+n <= swl.limit {
		// Add n timestamps
		for i := 0; i < n; i++ {
			swl.requests = append(swl.requests, now)
		}
		return 0
	}

	// Calculate wait time based on oldest request
	if len(swl.requests) > 0 {
		// We need to wait until the oldest request expires
		oldestRequest := swl.requests[0]
		waitTime := swl.windowSize - now.Sub(oldestRequest)
		if waitTime < 0 {
			waitTime = 0
		}
		return waitTime
	}

	return 0
}

// RemainingRequests returns how many more requests are allowed in current window
func (swl *SlidingWindowLog) RemainingRequests() int {
	swl.mu.Lock()
	defer swl.mu.Unlock()

	now := time.Now()
	swl.removeExpiredRequests(now)

	remaining := swl.limit - len(swl.requests)
	if remaining < 0 {
		return 0
	}
	return remaining
}

// RequestCount returns the number of requests in the current window
func (swl *SlidingWindowLog) RequestCount() int {
	swl.mu.Lock()
	defer swl.mu.Unlock()

	now := time.Now()
	swl.removeExpiredRequests(now)

	return len(swl.requests)
}

// Reset clears all request logs
func (swl *SlidingWindowLog) Reset() {
	swl.mu.Lock()
	defer swl.mu.Unlock()

	swl.requests = make([]time.Time, 0, swl.limit)
}

// OldestRequest returns the timestamp of the oldest request in the window
// Returns nil if no requests are in the window
func (swl *SlidingWindowLog) OldestRequest() *time.Time {
	swl.mu.Lock()
	defer swl.mu.Unlock()

	now := time.Now()
	swl.removeExpiredRequests(now)

	if len(swl.requests) > 0 {
		oldest := swl.requests[0]
		return &oldest
	}
	return nil
}
