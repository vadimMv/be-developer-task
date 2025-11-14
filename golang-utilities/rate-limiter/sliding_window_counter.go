package ratelimiter

import (
	"sync"
	"time"
)

/*
SLIDING WINDOW COUNTER RATE LIMITER

Algorithm Explanation:
======================
The Sliding Window Counter is a hybrid approach combining Fixed Window and Sliding Window Log:

1. Divide time into fixed windows, but keep two windows: current and previous
2. When a request arrives at time T within current window:
   a. Calculate what percentage of previous window overlaps with sliding window
   b. Estimate count using weighted formula:
      estimated_count = previous_count × overlap_percentage + current_count
   c. If estimated_count < limit, allow request

Example with 10 requests/window (60s window):
- Previous window (0-60s): 8 requests
- Current window (60-120s): 5 requests
- Request at 90s (50% into current window):
  * Previous overlap: 50% (30s of previous window is in sliding window)
  * Estimated count = 8 × 0.5 + 5 = 9
  * 9 < 10, so allow request

Mathematical Formula:
estimated_count = prev_count × ((window_size - elapsed_time) / window_size) + curr_count

Advantages:
- More accurate than fixed window
- Much more memory efficient than sliding window log
- O(1) time complexity
- Smooths out boundary spikes
- Good balance between accuracy and performance

Disadvantages:
- Not as precise as sliding window log
- Uses approximation (not exact count)
- Slightly more complex than fixed window

Use Cases:
- High-traffic APIs
- Production rate limiting systems
- When both accuracy and performance matter
- Popular choice for real-world applications (used by CloudFlare, etc.)
*/

// SlidingWindowCounter represents a sliding window counter rate limiter
type SlidingWindowCounter struct {
	mu              sync.Mutex
	limit           int           // Maximum requests per window
	windowSize      time.Duration // Size of each window
	prevCount       int           // Count from previous window
	currCount       int           // Count in current window
	prevWindowStart time.Time     // Start of previous window
	currWindowStart time.Time     // Start of current window
}

// NewSlidingWindowCounter creates a new sliding window counter rate limiter
// Parameters:
//   - limit: maximum number of requests allowed per window
//   - windowSize: duration of each window
func NewSlidingWindowCounter(limit int, windowSize time.Duration) *SlidingWindowCounter {
	now := time.Now()
	return &SlidingWindowCounter{
		limit:           limit,
		windowSize:      windowSize,
		prevCount:       0,
		currCount:       0,
		prevWindowStart: now.Add(-windowSize),
		currWindowStart: now,
	}
}

// Allow checks if a request should be allowed
// Returns true if under the limit, false otherwise
func (swc *SlidingWindowCounter) Allow() bool {
	return swc.AllowN(1)
}

// AllowN checks if n requests should be allowed
// Returns true if under the limit, false otherwise
func (swc *SlidingWindowCounter) AllowN(n int) bool {
	swc.mu.Lock()
	defer swc.mu.Unlock()

	now := time.Now()

	// Update windows if needed
	swc.updateWindows(now)

	// Calculate estimated count in sliding window
	estimatedCount := swc.calculateEstimatedCount(now)

	// Check if we can accommodate n new requests
	if estimatedCount+float64(n) <= float64(swc.limit) {
		swc.currCount += n
		return true
	}

	return false
}

// updateWindows shifts windows forward if current time has moved to a new window
// This method should be called with the mutex locked
func (swc *SlidingWindowCounter) updateWindows(now time.Time) {
	elapsed := now.Sub(swc.currWindowStart)

	// If we've moved past the current window
	if elapsed >= swc.windowSize {
		// Calculate how many windows have passed
		windowsPassed := int(elapsed / swc.windowSize)

		if windowsPassed == 1 {
			// Move to next window: current becomes previous
			swc.prevCount = swc.currCount
			swc.currCount = 0
			swc.prevWindowStart = swc.currWindowStart
			swc.currWindowStart = swc.currWindowStart.Add(swc.windowSize)
		} else {
			// Multiple windows have passed: reset everything
			swc.prevCount = 0
			swc.currCount = 0
			swc.prevWindowStart = now.Add(-swc.windowSize)
			swc.currWindowStart = now
		}
	}
}

// calculateEstimatedCount estimates the number of requests in the sliding window
// Formula: prev_count × ((window_size - elapsed) / window_size) + curr_count
// This method should be called with the mutex locked
func (swc *SlidingWindowCounter) calculateEstimatedCount(now time.Time) float64 {
	elapsed := now.Sub(swc.currWindowStart)

	// Calculate overlap percentage of previous window
	// If we're 30% into current window, we use 70% of previous window
	prevWindowWeight := 1.0 - (float64(elapsed) / float64(swc.windowSize))

	if prevWindowWeight < 0 {
		prevWindowWeight = 0
	}

	// Estimated count = weighted previous count + current count
	estimatedCount := float64(swc.prevCount)*prevWindowWeight + float64(swc.currCount)

	return estimatedCount
}

// Wait blocks until a request can be allowed
func (swc *SlidingWindowCounter) Wait() {
	swc.WaitN(1)
}

// WaitN blocks until n requests can be allowed
func (swc *SlidingWindowCounter) WaitN(n int) {
	for {
		waitTime := swc.Reserve(n)
		if waitTime == 0 {
			return
		}
		time.Sleep(waitTime)
	}
}

// Reserve returns the duration to wait before n requests can be allowed
func (swc *SlidingWindowCounter) Reserve(n int) time.Duration {
	swc.mu.Lock()
	defer swc.mu.Unlock()

	now := time.Now()
	swc.updateWindows(now)

	estimatedCount := swc.calculateEstimatedCount(now)

	if estimatedCount+float64(n) <= float64(swc.limit) {
		swc.currCount += n
		return 0
	}

	// Calculate approximate wait time
	// Wait until enough of the previous window has expired
	elapsed := now.Sub(swc.currWindowStart)
	timeToNextWindow := swc.windowSize - elapsed

	return timeToNextWindow
}

// RemainingRequests returns an estimate of how many more requests are allowed
func (swc *SlidingWindowCounter) RemainingRequests() int {
	swc.mu.Lock()
	defer swc.mu.Unlock()

	now := time.Now()
	swc.updateWindows(now)

	estimatedCount := swc.calculateEstimatedCount(now)
	remaining := float64(swc.limit) - estimatedCount

	if remaining < 0 {
		return 0
	}
	return int(remaining)
}

// CurrentWindowCount returns the count in the current window
func (swc *SlidingWindowCounter) CurrentWindowCount() int {
	swc.mu.Lock()
	defer swc.mu.Unlock()

	now := time.Now()
	swc.updateWindows(now)

	return swc.currCount
}

// PreviousWindowCount returns the count from the previous window
func (swc *SlidingWindowCounter) PreviousWindowCount() int {
	swc.mu.Lock()
	defer swc.mu.Unlock()

	now := time.Now()
	swc.updateWindows(now)

	return swc.prevCount
}

// EstimatedCount returns the estimated count in the sliding window
func (swc *SlidingWindowCounter) EstimatedCount() float64 {
	swc.mu.Lock()
	defer swc.mu.Unlock()

	now := time.Now()
	swc.updateWindows(now)

	return swc.calculateEstimatedCount(now)
}

// Reset clears all counters
func (swc *SlidingWindowCounter) Reset() {
	swc.mu.Lock()
	defer swc.mu.Unlock()

	now := time.Now()
	swc.prevCount = 0
	swc.currCount = 0
	swc.prevWindowStart = now.Add(-swc.windowSize)
	swc.currWindowStart = now
}
