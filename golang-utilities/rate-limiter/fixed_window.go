package ratelimiter

import (
	"sync"
	"time"
)

/*
FIXED WINDOW COUNTER RATE LIMITER

Algorithm Explanation:
======================
The Fixed Window Counter divides time into fixed-size windows:

1. Time is divided into fixed windows (e.g., 1 second, 1 minute)
2. Each window has a counter that tracks requests
3. When a request arrives, increment the counter for current window
4. If counter exceeds limit, reject the request
5. Counter resets at the start of each new window

Example with 10 requests/second limit:
- Window 1 (0-1s): 10 requests allowed
- Window 2 (1-2s): 10 requests allowed
- At 1.5s, counter resets even if 10 requests came at 0.9s

Advantages:
- Simple to implement
- Memory efficient (only need current window counter)
- Easy to understand and reason about
- Low computational overhead

Disadvantages:
- Boundary problem: Can allow 2x limit at window boundaries
  Example: 10 requests at 0.9s + 10 requests at 1.1s = 20 requests in 0.2s
- Doesn't smooth out traffic spikes
- Not suitable for strict rate limiting

Use Cases:
- Simple API rate limiting
- Request counting for analytics
- When approximate rate limiting is acceptable
- High-throughput systems where performance matters
*/

// FixedWindow represents a fixed window counter rate limiter
type FixedWindow struct {
	mu          sync.Mutex
	limit       int           // Maximum requests per window
	windowSize  time.Duration // Size of each window
	counter     int           // Current window counter
	windowStart time.Time     // Start time of current window
}

// NewFixedWindow creates a new fixed window counter rate limiter
// Parameters:
//   - limit: maximum number of requests allowed per window
//   - windowSize: duration of each window
func NewFixedWindow(limit int, windowSize time.Duration) *FixedWindow {
	return &FixedWindow{
		limit:       limit,
		windowSize:  windowSize,
		counter:     0,
		windowStart: time.Now(),
	}
}

// Allow checks if a request should be allowed
// Returns true if under the limit, false otherwise
func (fw *FixedWindow) Allow() bool {
	return fw.AllowN(1)
}

// AllowN checks if n requests should be allowed
// Returns true if under the limit, false otherwise
func (fw *FixedWindow) AllowN(n int) bool {
	fw.mu.Lock()
	defer fw.mu.Unlock()

	// Check if we need to reset the window
	fw.resetWindowIfNeeded()

	// Check if adding n requests would exceed the limit
	if fw.counter+n <= fw.limit {
		fw.counter += n
		return true
	}

	return false
}

// resetWindowIfNeeded resets the counter if current window has expired
// This method should be called with the mutex locked
func (fw *FixedWindow) resetWindowIfNeeded() {
	now := time.Now()
	elapsed := now.Sub(fw.windowStart)

	// If we've moved to a new window, reset the counter
	if elapsed >= fw.windowSize {
		// Calculate how many windows have passed
		windowsPassed := int(elapsed / fw.windowSize)
		fw.windowStart = fw.windowStart.Add(time.Duration(windowsPassed) * fw.windowSize)
		fw.counter = 0
	}
}

// Wait blocks until a request can be allowed
func (fw *FixedWindow) Wait() {
	fw.WaitN(1)
}

// WaitN blocks until n requests can be allowed
func (fw *FixedWindow) WaitN(n int) {
	for {
		waitTime := fw.Reserve(n)
		if waitTime == 0 {
			return
		}
		time.Sleep(waitTime)
	}
}

// Reserve returns the duration to wait before n requests can be allowed
func (fw *FixedWindow) Reserve(n int) time.Duration {
	fw.mu.Lock()
	defer fw.mu.Unlock()

	fw.resetWindowIfNeeded()

	if fw.counter+n <= fw.limit {
		fw.counter += n
		return 0
	}

	// Calculate time until next window
	elapsed := time.Since(fw.windowStart)
	waitTime := fw.windowSize - elapsed

	return waitTime
}

// RemainingRequests returns how many more requests are allowed in current window
func (fw *FixedWindow) RemainingRequests() int {
	fw.mu.Lock()
	defer fw.mu.Unlock()

	fw.resetWindowIfNeeded()
	remaining := fw.limit - fw.counter
	if remaining < 0 {
		return 0
	}
	return remaining
}

// CurrentWindowStart returns the start time of the current window
func (fw *FixedWindow) CurrentWindowStart() time.Time {
	fw.mu.Lock()
	defer fw.mu.Unlock()

	fw.resetWindowIfNeeded()
	return fw.windowStart
}

// Reset manually resets the rate limiter
func (fw *FixedWindow) Reset() {
	fw.mu.Lock()
	defer fw.mu.Unlock()

	fw.counter = 0
	fw.windowStart = time.Now()
}
