package main

import (
	"fmt"
	"time"

	rl "be-developer-task/golang-utilities/rate-limiter"
)

func main() {
	fmt.Println("=== Rate Limiter Examples ===\n")

	// Example 1: Token Bucket Rate Limiter
	tokenBucketExample()

	// Example 2: Leaky Bucket Rate Limiter
	leakyBucketExample()

	// Example 3: Fixed Window Counter Rate Limiter
	fixedWindowExample()

	// Example 4: Sliding Window Log Rate Limiter
	slidingWindowLogExample()

	// Example 5: Sliding Window Counter Rate Limiter
	slidingWindowCounterExample()

	// Example 6: Comparison of All Rate Limiters
	comparisonExample()
}

// tokenBucketExample demonstrates the Token Bucket rate limiter
func tokenBucketExample() {
	fmt.Println("--- Token Bucket Example ---")
	fmt.Println("Configuration: 5 requests/second, burst of 10")

	// Create a token bucket: 5 requests per second, burst of 10
	limiter := rl.NewTokenBucket(5.0, 10)

	// Simulate burst traffic
	fmt.Println("\nSimulating burst of 12 requests:")
	for i := 1; i <= 12; i++ {
		if limiter.Allow() {
			fmt.Printf("  Request %d: ✓ Allowed (tokens: %.2f)\n", i, limiter.AvailableTokens())
		} else {
			fmt.Printf("  Request %d: ✗ Denied (tokens: %.2f)\n", i, limiter.AvailableTokens())
		}
	}

	// Wait for tokens to refill
	fmt.Println("\nWaiting 1 second for token refill...")
	time.Sleep(1 * time.Second)
	fmt.Printf("Tokens after 1s: %.2f\n", limiter.AvailableTokens())

	// Make another request
	if limiter.Allow() {
		fmt.Println("New request: ✓ Allowed")
	}

	fmt.Println()
}

// leakyBucketExample demonstrates the Leaky Bucket rate limiter
func leakyBucketExample() {
	fmt.Println("--- Leaky Bucket Example ---")
	fmt.Println("Configuration: 3 requests/second, capacity of 5")

	// Create a leaky bucket: 3 requests per second, capacity of 5
	limiter := rl.NewLeakyBucket(3.0, 5)

	// Add requests to the bucket
	fmt.Println("\nAdding 7 requests:")
	for i := 1; i <= 7; i++ {
		if limiter.Allow() {
			fmt.Printf("  Request %d: ✓ Added to queue (queue size: %d)\n", i, limiter.QueueSize())
		} else {
			fmt.Printf("  Request %d: ✗ Queue full (queue size: %d)\n", i, limiter.QueueSize())
		}
	}

	// Wait for requests to leak out
	fmt.Println("\nWaiting 1 second for requests to leak...")
	time.Sleep(1 * time.Second)
	fmt.Printf("Queue size after 1s: %d\n", limiter.QueueSize())
	fmt.Printf("Available capacity: %d\n", limiter.AvailableCapacity())

	fmt.Println()
}

// fixedWindowExample demonstrates the Fixed Window Counter rate limiter
func fixedWindowExample() {
	fmt.Println("--- Fixed Window Counter Example ---")
	fmt.Println("Configuration: 5 requests per 2-second window")

	// Create a fixed window limiter: 5 requests per 2 seconds
	limiter := rl.NewFixedWindow(5, 2*time.Second)

	// Make requests
	fmt.Println("\nMaking 7 requests:")
	for i := 1; i <= 7; i++ {
		if limiter.Allow() {
			fmt.Printf("  Request %d: ✓ Allowed (remaining: %d)\n", i, limiter.RemainingRequests())
		} else {
			fmt.Printf("  Request %d: ✗ Denied (remaining: %d)\n", i, limiter.RemainingRequests())
		}
	}

	// Wait for window to reset
	fmt.Println("\nWaiting 2 seconds for window reset...")
	time.Sleep(2 * time.Second)
	fmt.Printf("Remaining requests after reset: %d\n", limiter.RemainingRequests())

	// Make another request
	if limiter.Allow() {
		fmt.Println("New request: ✓ Allowed")
	}

	fmt.Println()
}

// slidingWindowLogExample demonstrates the Sliding Window Log rate limiter
func slidingWindowLogExample() {
	fmt.Println("--- Sliding Window Log Example ---")
	fmt.Println("Configuration: 4 requests per 2-second window")

	// Create a sliding window log limiter: 4 requests per 2 seconds
	limiter := rl.NewSlidingWindowLog(4, 2*time.Second)

	// Make initial requests
	fmt.Println("\nMaking 4 requests at t=0:")
	for i := 1; i <= 4; i++ {
		if limiter.Allow() {
			fmt.Printf("  Request %d: ✓ Allowed (count: %d)\n", i, limiter.RequestCount())
		}
	}

	// Try another request (should be denied)
	if !limiter.Allow() {
		fmt.Printf("  Request 5: ✗ Denied (count: %d)\n", limiter.RequestCount())
	}

	// Wait 1 second
	fmt.Println("\nWaiting 1 second...")
	time.Sleep(1 * time.Second)

	// Make more requests
	fmt.Println("Making 2 more requests at t=1s:")
	for i := 6; i <= 7; i++ {
		if limiter.Allow() {
			fmt.Printf("  Request %d: ✓ Allowed (count: %d)\n", i, limiter.RequestCount())
		} else {
			fmt.Printf("  Request %d: ✗ Denied (count: %d)\n", i, limiter.RequestCount())
		}
	}

	fmt.Println()
}

// slidingWindowCounterExample demonstrates the Sliding Window Counter rate limiter
func slidingWindowCounterExample() {
	fmt.Println("--- Sliding Window Counter Example ---")
	fmt.Println("Configuration: 5 requests per 2-second window")

	// Create a sliding window counter limiter: 5 requests per 2 seconds
	limiter := rl.NewSlidingWindowCounter(5, 2*time.Second)

	// Make requests in first window
	fmt.Println("\nMaking 4 requests at t=0:")
	for i := 1; i <= 4; i++ {
		limiter.Allow()
	}
	fmt.Printf("Current window count: %d\n", limiter.CurrentWindowCount())

	// Wait 1 second (halfway through window)
	fmt.Println("\nWaiting 1 second (50% into window)...")
	time.Sleep(1 * time.Second)

	// Make more requests
	fmt.Println("Making 3 requests at t=1s:")
	for i := 5; i <= 7; i++ {
		if limiter.Allow() {
			fmt.Printf("  Request %d: ✓ Allowed (estimated: %.2f, remaining: %d)\n",
				i, limiter.EstimatedCount(), limiter.RemainingRequests())
		} else {
			fmt.Printf("  Request %d: ✗ Denied (estimated: %.2f, remaining: %d)\n",
				i, limiter.EstimatedCount(), limiter.RemainingRequests())
		}
	}

	fmt.Printf("\nPrevious window count: %d\n", limiter.PreviousWindowCount())
	fmt.Printf("Current window count: %d\n", limiter.CurrentWindowCount())
	fmt.Printf("Estimated total: %.2f\n", limiter.EstimatedCount())

	fmt.Println()
}

// comparisonExample compares behavior of different rate limiters
func comparisonExample() {
	fmt.Println("--- Comparison Example ---")
	fmt.Println("Testing boundary behavior: 5 requests at t=0.9s, 5 requests at t=1.1s")
	fmt.Println("Limit: 5 requests per second")

	// Create limiters
	tokenBucket := rl.NewTokenBucket(5.0, 5)
	fixedWindow := rl.NewFixedWindow(5, 1*time.Second)
	slidingLog := rl.NewSlidingWindowLog(5, 1*time.Second)
	slidingCounter := rl.NewSlidingWindowCounter(5, 1*time.Second)

	// Simulate waiting to 0.9s (in reality, just make 5 requests)
	fmt.Println("\nAt t=0.9s - Making 5 requests:")
	tb1, fw1, sl1, sc1 := 0, 0, 0, 0

	for i := 0; i < 5; i++ {
		if tokenBucket.Allow() {
			tb1++
		}
		if fixedWindow.Allow() {
			fw1++
		}
		if slidingLog.Allow() {
			sl1++
		}
		if slidingCounter.Allow() {
			sc1++
		}
	}

	fmt.Printf("  Token Bucket: %d allowed\n", tb1)
	fmt.Printf("  Fixed Window: %d allowed\n", fw1)
	fmt.Printf("  Sliding Log: %d allowed\n", sl1)
	fmt.Printf("  Sliding Counter: %d allowed\n", sc1)

	// Wait 200ms (simulate going from 0.9s to 1.1s = 200ms elapsed)
	fmt.Println("\nWaiting 200ms (crossing window boundary)...")
	time.Sleep(200 * time.Millisecond)

	fmt.Println("At t=1.1s - Making 5 more requests:")
	tb2, fw2, sl2, sc2 := 0, 0, 0, 0

	for i := 0; i < 5; i++ {
		if tokenBucket.Allow() {
			tb2++
		}
		if fixedWindow.Allow() {
			fw2++
		}
		if slidingLog.Allow() {
			sl2++
		}
		if slidingCounter.Allow() {
			sc2++
		}
	}

	fmt.Printf("  Token Bucket: %d allowed\n", tb2)
	fmt.Printf("  Fixed Window: %d allowed (shows boundary problem!)\n", fw2)
	fmt.Printf("  Sliding Log: %d allowed\n", sl2)
	fmt.Printf("  Sliding Counter: %d allowed\n", sc2)

	fmt.Println("\nTotal requests allowed in 200ms:")
	fmt.Printf("  Token Bucket: %d (burst allowance)\n", tb1+tb2)
	fmt.Printf("  Fixed Window: %d (boundary problem - allows 2x limit!)\n", fw1+fw2)
	fmt.Printf("  Sliding Log: %d (accurate)\n", sl1+sl2)
	fmt.Printf("  Sliding Counter: %d (approximate but better than fixed)\n", sc1+sc2)

	fmt.Println("\n=== Summary ===")
	fmt.Println("Token Bucket: Good for APIs with burst allowance")
	fmt.Println("Leaky Bucket: Good for smooth, constant rate")
	fmt.Println("Fixed Window: Simple but has boundary problem")
	fmt.Println("Sliding Log: Most accurate but memory intensive")
	fmt.Println("Sliding Counter: Best balance of accuracy and efficiency")
}
