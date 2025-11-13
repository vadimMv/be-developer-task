# Golang Utilities Collection

A comprehensive, thread-safe collection of Go utilities converted from TypeScript examples, including:
- **Promise Pattern** - JavaScript-style promises with goroutines
- **Mini Twitter** - Social media simulation with thread-safe operations
- **Generic Utilities** - Reusable patterns and data structures
- **Rate Limiters** - Production-ready rate limiting algorithms

## Features

### 🔄 Promise Pattern
JavaScript-style promises implemented with Go generics and goroutines:
- `Promise.New()` - Create new promises
- `Promise.Resolve()` / `Promise.Reject()` - Create already-settled promises
- `.Then()` / `.Catch()` / `.Finally()` - Promise chaining
- `Promise.All()` / `Promise.Race()` / `Promise.AllSettled()` - Concurrent operations
- Full thread safety with mutex protection

### 🐦 Mini Twitter
Thread-safe social media simulation:
- **User Management** - Create users, manage followers/following
- **Tweet System** - Post tweets, view timelines
- **Social Features** - Follow/unfollow, walls (feeds)
- **Thread Safety** - All operations use RWMutex for concurrent access

### 🛠️ Generic Utilities

#### Cache
Thread-safe generic cache with TTL support:
```go
cache := NewCache[string, int]()
cache.Set("key", 42, 5*time.Second) // TTL optional
value, ok := cache.Get("key")
```

#### Event Emitter
Thread-safe event system with typed and untyped variants:
```go
emitter := NewEventEmitter()
emitter.On("event", func(args ...interface{}) {
    fmt.Println(args...)
})
emitter.Emit("event", "data1", "data2")
```

#### Query Builder
Fluent SQL query builder:
```go
query := NewQueryBuilder("users").
    Select("name", "email").
    Where("age", 25).
    OrderBy("name", "asc").
    Limit(10).
    Build()
```

#### Finite State Machine (FSM)
Thread-safe state machine:
```go
fsm := NewFSM(transitions, initialState)
nextState, ok := fsm.Transition(event)
```

#### Memoization
Thread-safe function memoization with variants:
- `Memoize()` - Basic memoization
- `MemoizeWithLimit()` - LRU-style with size limit
- `MemoizeWithTTL()` - Time-based expiration

#### Pipeline
Functional data transformation pipelines:
```go
result := NewPipeline("hello").
    Pipe(func(s string) string { return s + " world" }).
    Execute()
```

#### Repository Pattern
Generic CRUD operations with in-memory implementation:
```go
repo := NewInMemoryRepository[Product]()
repo.Create(product)
found, _ := repo.FindByID(id)
```

#### Validator
Type-safe validation system:
```go
validator := String()
result := validator("hello")
if result.Success {
    fmt.Println(result.Data)
}
```

### 🚦 Rate Limiters

Five production-ready rate limiting algorithms, each with different characteristics:

#### Token Bucket
Allows bursts up to capacity, refills at constant rate:
```go
// 10 requests/second with burst of 20
limiter := ratelimiter.NewTokenBucket(10.0, 20)
if limiter.Allow() {
    // Process request
}
```

**Characteristics:**
- ✅ Allows traffic bursts
- ✅ Simple and memory efficient
- ✅ Good for APIs with bursty traffic
- ⚠️ Can temporarily overwhelm downstream systems

**Use Cases:** API rate limiting, network traffic shaping, web services with burst allowance

#### Leaky Bucket
Enforces smooth, constant output rate:
```go
// 5 requests/second, queue capacity of 10
limiter := ratelimiter.NewLeakyBucket(5.0, 10)
if limiter.Allow() {
    // Request added to queue
}
```

**Characteristics:**
- ✅ Perfectly smooth output rate
- ✅ Prevents bursts
- ✅ Queue-based design
- ⚠️ No burst allowance (stricter)

**Use Cases:** Network packet scheduling, video streaming, strict rate enforcement

#### Fixed Window Counter
Simple counter reset at fixed intervals:
```go
// 100 requests per minute
limiter := ratelimiter.NewFixedWindow(100, 1*time.Minute)
if limiter.Allow() {
    // Process request
}
```

**Characteristics:**
- ✅ Very simple implementation
- ✅ Memory efficient (single counter)
- ✅ High performance
- ⚠️ Boundary problem (2x rate at window edges)

**Use Cases:** Simple analytics, approximate rate limiting, high-throughput systems

#### Sliding Window Log
Maintains precise log of all requests:
```go
// 50 requests per 10 seconds
limiter := ratelimiter.NewSlidingWindowLog(50, 10*time.Second)
if limiter.Allow() {
    // Process request
}
```

**Characteristics:**
- ✅ Most accurate algorithm
- ✅ No boundary problem
- ✅ Precise tracking
- ⚠️ High memory usage (stores all timestamps)
- ⚠️ O(n) time complexity

**Use Cases:** Low/medium traffic APIs, critical accuracy requirements, short time windows

#### Sliding Window Counter
Hybrid approach with weighted calculation:
```go
// 1000 requests per minute
limiter := ratelimiter.NewSlidingWindowCounter(1000, 1*time.Minute)
if limiter.Allow() {
    // Process request
}
```

**Characteristics:**
- ✅ Excellent accuracy
- ✅ O(1) time complexity
- ✅ Memory efficient (two counters)
- ✅ No boundary problem
- ✅ Production-ready (used by CloudFlare, etc.)

**Use Cases:** High-traffic APIs, production systems, best general-purpose choice

#### Comparison Table

| Algorithm | Accuracy | Memory | Performance | Burst Support | Boundary Safe |
|-----------|----------|--------|-------------|---------------|---------------|
| Token Bucket | Good | O(1) | Excellent | ✅ Yes | ✅ Yes |
| Leaky Bucket | Good | O(1) | Excellent | ❌ No | ✅ Yes |
| Fixed Window | Fair | O(1) | Excellent | ❌ No | ❌ No |
| Sliding Log | Excellent | O(n) | Good | ❌ No | ✅ Yes |
| Sliding Counter | Very Good | O(1) | Excellent | ❌ No | ✅ Yes |

**Recommendation:** Use **Sliding Window Counter** for most production scenarios - it provides the best balance of accuracy, performance, and memory efficiency.

#### Advanced Features

All rate limiters support:

**Wait Operations** - Block until request can be allowed:
```go
limiter.Wait()  // Blocks until 1 request can proceed
limiter.WaitN(5) // Blocks until 5 requests can proceed
```

**Reservations** - Check wait time without blocking:
```go
waitTime := limiter.Reserve(3)
if waitTime == 0 {
    // Can proceed immediately
} else {
    // Need to wait 'waitTime' duration
}
```

**Metrics** - Query current state:
```go
// Token Bucket
tokens := limiter.AvailableTokens()

// Leaky Bucket
queueSize := limiter.QueueSize()
capacity := limiter.AvailableCapacity()

// Fixed Window
remaining := limiter.RemainingRequests()

// Sliding Window Log
count := limiter.RequestCount()
oldest := limiter.OldestRequest()

// Sliding Window Counter
estimated := limiter.EstimatedCount()
prevCount := limiter.PreviousWindowCount()
currCount := limiter.CurrentWindowCount()
```

## Thread Safety

All utilities are designed with concurrency in mind:
- ✅ **Cache** - RWMutex for concurrent reads/writes
- ✅ **EventEmitter** - Safe concurrent emission and subscription
- ✅ **FSM** - Protected state transitions
- ✅ **Repository** - Thread-safe CRUD operations
- ✅ **Mini Twitter** - All user and tweet operations protected
- ✅ **Memoization** - Concurrent function calls safely cached
- ✅ **Rate Limiters** - All algorithms use Mutex for thread-safe operations

## Installation

```bash
go get github.com/vadimMv/be-developer-task/golang-utilities
```

## Usage Examples

### Promise Example
```go
import "github.com/vadimMv/be-developer-task/golang-utilities/promise"

p := promise.New[string](func(resolve func(string), reject func(error)) {
    time.Sleep(100 * time.Millisecond)
    resolve("Hello!")
})

result, err := p.Await()
if err != nil {
    log.Fatal(err)
}
fmt.Println(result)
```

### Mini Twitter Example
```go
import minitwitter "github.com/vadimMv/be-developer-task/golang-utilities/mini-twitter"

twitter := minitwitter.NewTwitterService()
alice, _ := twitter.CreateUser("alice")
bob, _ := twitter.CreateUser("bob")

twitter.FollowUser(alice.ID(), bob.ID())
twitter.PostTweet(alice.ID(), "Hello Twitter!")

wall, _ := twitter.GetWall(alice.ID())
for _, tweet := range wall {
    fmt.Println(tweet.Content())
}
```

### Generic Utilities Example
```go
import utils "github.com/vadimMv/be-developer-task/golang-utilities/generic-utils"

// Cache
cache := utils.NewCache[string, int]()
cache.Set("key", 42, 5*time.Second)

// Event Emitter
emitter := utils.NewEventEmitter()
emitter.On("event", func(args ...interface{}) {
    fmt.Println(args...)
})

// Query Builder
query := utils.NewQueryBuilder("users").
    Select("name", "email").
    Where("age", 25).
    Build()

// State Machine
fsm := utils.NewFSM(transitions, "initial")
fsm.Transition("event")

// Memoization
memoized := utils.Memoize(expensiveFunc)
result := memoized.Call(arg1, arg2)

// Pipeline
result := utils.NewPipeline(data).
    Pipe(transform1).
    Pipe(transform2).
    Execute()
```

## Running Examples

```bash
# Promise examples
go run examples/promise_example.go

# Mini Twitter examples
go run examples/minitwitter_example.go

# Generic utilities examples
go run examples/genericutils_example.go

# Rate limiter examples
go run examples/ratelimiter_example.go
```

## Project Structure

```
golang-utilities/
├── promise/              # Promise implementation
│   └── promise.go
├── mini-twitter/         # Mini Twitter implementation
│   ├── user.go
│   ├── tweet.go
│   └── service.go
├── generic-utils/        # Generic utilities
│   ├── cache.go
│   ├── eventemitter.go
│   ├── querybuilder.go
│   ├── statemachine.go
│   ├── memoize.go
│   ├── pipeline.go
│   ├── repository.go
│   └── validator.go
├── rate-limiter/         # Rate limiting algorithms
│   ├── token_bucket.go
│   ├── leaky_bucket.go
│   ├── fixed_window.go
│   ├── sliding_window_log.go
│   └── sliding_window_counter.go
├── examples/             # Example programs
│   ├── promise_example.go
│   ├── minitwitter_example.go
│   ├── genericutils_example.go
│   └── ratelimiter_example.go
└── README.md
```

## Key Differences from TypeScript Version

1. **Generics** - Uses Go 1.18+ generics for type safety
2. **Thread Safety** - All shared state protected with mutexes
3. **Error Handling** - Go-style error returns instead of exceptions
4. **Goroutines** - Promises use goroutines instead of event loop
5. **Interfaces** - Repository uses Entity interface for type constraints
6. **Channels** - Promise synchronization uses channels

## Performance Considerations

- **RWMutex** used for read-heavy operations (Cache, Repository)
- **Mutex** used for write-heavy operations (EventEmitter)
- **Goroutines** pooling not implemented (rely on Go runtime)
- **Cache expiration** is lazy (cleaned on access)
- **Memoization** uses map lookups (O(1) average case)

## Testing

The example programs demonstrate:
- Basic functionality of all utilities
- Thread safety with concurrent operations
- Error handling and edge cases
- Integration between different utilities

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please ensure:
- Thread safety for concurrent operations
- Comprehensive examples
- Clear documentation
- Error handling

## Author

Converted from TypeScript examples to Go with thread-safe implementations.
