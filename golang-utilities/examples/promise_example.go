package main

import (
	"errors"
	"fmt"
	"time"

	"github.com/vadimMv/be-developer-task/golang-utilities/promise"
)

func main() {
	fmt.Println("=== Promise Examples ===\n")

	// Example 1: Basic Promise
	fmt.Println("1. Basic Promise:")
	p1 := promise.New[string](func(resolve func(string), reject func(error)) {
		time.Sleep(100 * time.Millisecond)
		resolve("Hello from Promise!")
	})

	result, err := p1.Await()
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Result:", result)
	}

	// Example 2: Promise with error
	fmt.Println("\n2. Promise with Error:")
	p2 := promise.New[int](func(resolve func(int), reject func(error)) {
		time.Sleep(50 * time.Millisecond)
		reject(errors.New("something went wrong"))
	})

	result2, err2 := p2.Await()
	if err2 != nil {
		fmt.Println("Caught error:", err2)
	} else {
		fmt.Println("Result:", result2)
	}

	// Example 3: Chaining with Then
	fmt.Println("\n3. Promise Chaining with Then:")
	p3 := promise.Resolve(10)
	p3.Then(func(x int) interface{} {
		fmt.Println("  First then:", x)
		return x * 2
	}).Then(func(x interface{}) interface{} {
		fmt.Println("  Second then:", x)
		return fmt.Sprintf("Result: %v", x)
	}).Await()

	// Example 4: Catch error
	fmt.Println("\n4. Catch Error:")
	p4 := promise.Reject[int](errors.New("initial error"))
	result4, _ := p4.Catch(func(err error) int {
		fmt.Println("  Caught and recovered:", err)
		return 42
	}).Await()
	fmt.Println("  Final result:", result4)

	// Example 5: Finally
	fmt.Println("\n5. Finally:")
	p5 := promise.Resolve("done")
	p5.Finally(func() {
		fmt.Println("  Cleanup in finally block")
	}).Await()

	// Example 6: Promise.All
	fmt.Println("\n6. Promise.All:")
	promises := []*promise.Promise[int]{
		promise.New[int](func(resolve func(int), reject func(error)) {
			time.Sleep(50 * time.Millisecond)
			resolve(1)
		}),
		promise.New[int](func(resolve func(int), reject func(error)) {
			time.Sleep(30 * time.Millisecond)
			resolve(2)
		}),
		promise.New[int](func(resolve func(int), reject func(error)) {
			time.Sleep(70 * time.Millisecond)
			resolve(3)
		}),
	}

	allResult, _ := promise.All(promises...).Await()
	fmt.Println("  All results:", allResult)

	// Example 7: Promise.Race
	fmt.Println("\n7. Promise.Race:")
	racePromises := []*promise.Promise[string]{
		promise.New[string](func(resolve func(string), reject func(error)) {
			time.Sleep(100 * time.Millisecond)
			resolve("slow")
		}),
		promise.New[string](func(resolve func(string), reject func(error)) {
			time.Sleep(30 * time.Millisecond)
			resolve("fast")
		}),
	}

	winner, _ := promise.Race(racePromises...).Await()
	fmt.Println("  Winner:", winner)

	// Example 8: Promise.AllSettled
	fmt.Println("\n8. Promise.AllSettled:")
	mixedPromises := []*promise.Promise[int]{
		promise.Resolve(1),
		promise.Reject[int](errors.New("error in promise 2")),
		promise.Resolve(3),
	}

	settled, _ := promise.AllSettled(mixedPromises...).Await()
	for i, result := range settled {
		if result.IsSuccess() {
			fmt.Printf("  Promise %d: Success - %v\n", i+1, result.Value)
		} else {
			fmt.Printf("  Promise %d: Error - %v\n", i+1, result.Error)
		}
	}

	// Example 9: Async computation
	fmt.Println("\n9. Async Computation:")
	fibonacci := promise.New[int](func(resolve func(int), reject func(error)) {
		// Simulate expensive computation
		n := 10
		a, b := 0, 1
		for i := 0; i < n; i++ {
			a, b = b, a+b
		}
		resolve(a)
	})

	fibResult, _ := fibonacci.Await()
	fmt.Println("  Fibonacci(10):", fibResult)

	// Example 10: Error recovery chain
	fmt.Println("\n10. Error Recovery Chain:")
	p10 := promise.New[int](func(resolve func(int), reject func(error)) {
		reject(errors.New("initial failure"))
	})

	final, _ := p10.
		Catch(func(err error) int {
			fmt.Println("  First catch:", err)
			return 0
		}).
		ThenTyped(func(x int) int {
			fmt.Println("  Then after catch:", x)
			return x + 100
		}).
		Await()

	fmt.Println("  Final value:", final)

	fmt.Println("\n=== All Promise Examples Complete ===")
}
