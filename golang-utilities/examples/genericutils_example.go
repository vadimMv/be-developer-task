package main

import (
	"fmt"
	"time"

	utils "github.com/vadimMv/be-developer-task/golang-utilities/generic-utils"
)

// Product entity for Repository example
type Product struct {
	ID       int
	Name     string
	Price    float64
	Category string
}

func (p Product) GetID() interface{} {
	return p.ID
}

func main() {
	fmt.Println("=== Generic Utilities Examples ===\n")

	// ============================================================================
	// 1. Cache Example
	// ============================================================================
	fmt.Println("1. Cache Example:")
	cache := utils.NewCache[string, int]()
	cache.Set("a", 1, 0)                      // No expiration
	cache.Set("b", 2, 1*time.Second)          // Expires in 1 second
	fmt.Println("   Cache get a:", cache.Get("a"))
	fmt.Println("   Cache has a:", cache.Has("a"))
	fmt.Println("   Cache size:", cache.Size())

	// GetOrSet example
	value := cache.GetOrSet("c", func() int {
		fmt.Println("   Computing value for 'c'...")
		return 100
	}, 0)
	fmt.Println("   GetOrSet result:", value)
	fmt.Println("   Cache size after GetOrSet:", cache.Size())

	// ============================================================================
	// 2. Event Emitter Example
	// ============================================================================
	fmt.Println("\n2. Event Emitter Example:")
	emitter := utils.NewEventEmitter()

	emitter.On("userLogin", func(args ...interface{}) {
		if len(args) >= 2 {
			fmt.Printf("   User %v logged in at %v\n", args[0], args[1])
		}
	})

	emitter.On("error", func(args ...interface{}) {
		if len(args) >= 2 {
			fmt.Printf("   Error %v: %v\n", args[1], args[0])
		}
	})

	emitter.Emit("userLogin", "user123", time.Now().Format(time.RFC3339))
	emitter.Emit("error", "Something went wrong", 500)

	// Once example
	emitter.Once("onetime", func(args ...interface{}) {
		fmt.Println("   This will only print once")
	})
	emitter.Emit("onetime")
	emitter.Emit("onetime") // Won't trigger

	fmt.Println("   Listener count for 'userLogin':", emitter.ListenerCount("userLogin"))

	// ============================================================================
	// 3. Typed Event Emitter Example
	// ============================================================================
	fmt.Println("\n3. Typed Event Emitter Example:")
	typedEmitter := utils.NewTypedEventEmitter[string]()

	typedEmitter.On("message", func(data string) {
		fmt.Println("   Received message:", data)
	})

	typedEmitter.Emit("message", "Hello, World!")
	typedEmitter.Emit("message", "Thread-safe events!")

	// ============================================================================
	// 4. Query Builder Example
	// ============================================================================
	fmt.Println("\n4. Query Builder Example:")
	query := utils.NewQueryBuilder("users").
		Select("name", "email", "age").
		Where("age", 25, "active", true).
		OrderBy("name", "asc").
		Limit(10).
		Build()

	fmt.Println("   SQL Query:", query)

	// Using WhereMap
	query2 := utils.NewQueryBuilder("products").
		WhereMap(map[string]interface{}{
			"category": "Electronics",
			"price":    999,
		}).
		Build()

	fmt.Println("   SQL Query 2:", query2)

	// ============================================================================
	// 5. State Machine (FSM) Example
	// ============================================================================
	fmt.Println("\n5. State Machine Example:")
	trafficLight := utils.NewFSM(
		map[string]map[string]string{
			"red":    {"timer": "green"},
			"yellow": {"timer": "red"},
			"green":  {"timer": "yellow", "manual": "red"},
		},
		"red",
	)

	fmt.Println("   Current state:", trafficLight.GetCurrentState())
	fmt.Println("   Can transition with 'timer'?", trafficLight.CanTransition("timer"))

	nextState, _ := trafficLight.Transition("timer")
	fmt.Println("   After 'timer' transition:", nextState)

	fmt.Println("   Valid events:", trafficLight.GetValidEvents())

	// ============================================================================
	// 6. Memoization Example
	// ============================================================================
	fmt.Println("\n6. Memoization Example:")
	callCount := 0

	expensiveCalc := utils.Memoize(func(args ...interface{}) int {
		callCount++
		a := args[0].(int)
		b := args[1].(int)
		fmt.Printf("   Computing %d + %d...\n", a, b)
		return a + b
	})

	fmt.Println("   Result 1:", expensiveCalc.Call(5, 3))
	fmt.Println("   Result 2:", expensiveCalc.Call(5, 3)) // Cached
	fmt.Println("   Result 3:", expensiveCalc.Call(10, 2))
	fmt.Println("   Total function calls:", callCount)
	fmt.Println("   Cache size:", expensiveCalc.Size())

	// Memoization with limit
	fmt.Println("\n   Memoization with Limit:")
	limitedMemo := utils.MemoizeWithLimit(func(args ...interface{}) string {
		return fmt.Sprintf("Result: %v", args[0])
	}, 2) // Max 2 entries

	limitedMemo.Call(1)
	limitedMemo.Call(2)
	limitedMemo.Call(3) // Will evict least recently used
	fmt.Println("   Cache size after limit:", limitedMemo.Size())

	// ============================================================================
	// 7. Pipeline Example
	// ============================================================================
	fmt.Println("\n7. Pipeline Example:")

	// Basic pipeline
	result := utils.NewPipeline("hello").
		Pipe(func(s string) string {
			return s + " world"
		}).
		Pipe(func(s string) string {
			return s + "!"
		}).
		Execute()

	fmt.Println("   Basic pipeline result:", result)

	// Conditional pipeline
	numbers := []int{1, 2, 3, 4, 5}
	pipeResult := utils.NewPipeline(numbers).
		If(func(arr []int) bool {
			return len(arr) > 3
		}).
		Then(func(arr []int) []int {
			return arr[:3]
		}).
		Else(func(arr []int) []int {
			return append(arr, 999)
		}).
		Execute()

	fmt.Println("   Conditional pipeline result:", pipeResult)

	// Pipeline with tap
	utils.NewPipeline(10).
		Tap(func(x int) {
			fmt.Println("   Tap: value is", x)
		}).
		Pipe(func(x int) int {
			return x * 2
		}).
		Execute()

	// ============================================================================
	// 8. Repository Pattern Example
	// ============================================================================
	fmt.Println("\n8. Repository Pattern Example:")
	repo := utils.NewInMemoryRepository[Product]()

	// Create products
	product1 := Product{ID: 1, Name: "Laptop", Price: 999.99, Category: "Electronics"}
	product2 := Product{ID: 2, Name: "Mouse", Price: 29.99, Category: "Electronics"}
	product3 := Product{ID: 3, Name: "Desk", Price: 299.99, Category: "Furniture"}

	repo.Create(product1)
	repo.Create(product2)
	repo.Create(product3)

	fmt.Println("   Created products, count:", repo.Count())

	// Find by ID
	found, _ := repo.FindByID(1)
	fmt.Printf("   Found by ID: %s - $%.2f\n", found.Name, found.Price)

	// Find by predicate
	electronics := repo.FindBy(func(p Product) bool {
		return p.Category == "Electronics"
	})
	fmt.Println("   Electronics count:", len(electronics))

	// Update
	updated := Product{ID: 1, Name: "Laptop Pro", Price: 1299.99, Category: "Electronics"}
	repo.Update(1, updated)
	fmt.Println("   Updated product 1")

	// Get all
	all := repo.FindAll()
	fmt.Println("   Total products:", len(all))
	for _, p := range all {
		fmt.Printf("     - %s: $%.2f\n", p.Name, p.Price)
	}

	// ============================================================================
	// 9. Validation System Example
	// ============================================================================
	fmt.Println("\n9. Validation System Example:")

	// String validation
	strValidator := utils.String()
	strResult := strValidator("hello")
	fmt.Println("   String validation:", strResult.Success, "-", strResult.Data)

	// Number validation
	numValidator := utils.Number()
	numResult := numValidator(42)
	fmt.Println("   Number validation:", numResult.Success, "-", numResult.Data)

	// Array validation
	arrValidator := utils.Array(utils.Integer())
	arrResult := arrValidator([]interface{}{1, 2, 3, 4, 5})
	fmt.Println("   Array validation:", arrResult.Success, "-", arrResult.Data)

	// Refined validation (with constraints)
	minLengthValidator := utils.MinLength(5)
	result1 := minLengthValidator("hello")
	result2 := minLengthValidator("hi")
	fmt.Println("   MinLength validation:")
	fmt.Println("     'hello':", result1.Success)
	fmt.Println("     'hi':", result2.Success, "-", result2.Errors)

	// Min/Max number validation
	rangeValidator := utils.Refine(
		utils.Number(),
		func(n float64) bool { return n >= 0 && n <= 100 },
		"Number must be between 0 and 100",
	)
	rangeResult1 := rangeValidator(50)
	rangeResult2 := rangeValidator(150)
	fmt.Println("   Range validation:")
	fmt.Println("     50:", rangeResult1.Success)
	fmt.Println("     150:", rangeResult2.Success, "-", rangeResult2.Errors)

	// Email validation
	emailValidator := utils.Email()
	emailResult1 := emailValidator("user@example.com")
	emailResult2 := emailValidator("invalid-email")
	fmt.Println("   Email validation:")
	fmt.Println("     'user@example.com':", emailResult1.Success)
	fmt.Println("     'invalid-email':", emailResult2.Success)

	// ============================================================================
	// 10. Thread Safety Demonstration
	// ============================================================================
	fmt.Println("\n10. Thread Safety Demonstration:")
	threadSafeCache := utils.NewCache[int, string]()
	done := make(chan bool)

	// Concurrent writes
	for i := 0; i < 10; i++ {
		go func(num int) {
			threadSafeCache.Set(num, fmt.Sprintf("Value %d", num), 0)
			done <- true
		}(i)
	}

	// Wait for all goroutines
	for i := 0; i < 10; i++ {
		<-done
	}

	fmt.Println("   ✓ Completed 10 concurrent cache writes")
	fmt.Println("   Final cache size:", threadSafeCache.Size())

	// Concurrent FSM transitions
	fsm := utils.NewFSM(
		map[int]map[string]int{
			0: {"next": 1},
			1: {"next": 2},
			2: {"next": 0},
		},
		0,
	)

	for i := 0; i < 5; i++ {
		go func() {
			fsm.Transition("next")
			done <- true
		}()
	}

	for i := 0; i < 5; i++ {
		<-done
	}

	fmt.Println("   ✓ Completed 5 concurrent FSM transitions")
	fmt.Println("   Final FSM state:", fsm.GetCurrentState())

	fmt.Println("\n=== All Examples Complete ===")
}
