package promise

import (
	"fmt"
	"sync"
)

// State represents the state of a Promise
type State int

const (
	Pending State = iota
	Fulfilled
	Rejected
)

// Promise represents a Promise pattern implementation in Go
// Promises are thread-safe and can be used concurrently
type Promise[T any] struct {
	mu       sync.RWMutex
	state    State
	value    T
	err      error
	done     chan struct{}
	onceInit sync.Once
}

// Executor function type for Promise constructor
type Executor[T any] func(resolve func(T), reject func(error))

// New creates a new Promise with the given executor function
// The executor is run in a goroutine immediately
func New[T any](executor Executor[T]) *Promise[T] {
	p := &Promise[T]{
		state: Pending,
		done:  make(chan struct{}),
	}

	go func() {
		defer func() {
			if r := recover(); r != nil {
				p.reject(fmt.Errorf("panic in promise executor: %v", r))
			}
		}()

		resolve := func(value T) {
			p.resolve(value)
		}

		reject := func(err error) {
			p.reject(err)
		}

		executor(resolve, reject)
	}()

	return p
}

// Resolve creates an already-resolved Promise with the given value
func Resolve[T any](value T) *Promise[T] {
	p := &Promise[T]{
		state: Fulfilled,
		value: value,
		done:  make(chan struct{}),
	}
	close(p.done)
	return p
}

// Reject creates an already-rejected Promise with the given error
func Reject[T any](err error) *Promise[T] {
	p := &Promise[T]{
		state: Rejected,
		err:   err,
		done:  make(chan struct{}),
	}
	close(p.done)
	return p
}

// resolve marks the promise as fulfilled with a value
func (p *Promise[T]) resolve(value T) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.state != Pending {
		return
	}

	p.state = Fulfilled
	p.value = value
	p.onceInit.Do(func() {
		close(p.done)
	})
}

// reject marks the promise as rejected with an error
func (p *Promise[T]) reject(err error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.state != Pending {
		return
	}

	p.state = Rejected
	p.err = err
	p.onceInit.Do(func() {
		close(p.done)
	})
}

// Then chains a callback for when the promise is fulfilled
// Returns a new Promise that resolves with the callback's return value
func (p *Promise[T]) Then(onFulfilled func(T) interface{}) *Promise[interface{}] {
	return New[interface{}](func(resolve func(interface{}), reject func(error)) {
		<-p.done

		p.mu.RLock()
		state := p.state
		value := p.value
		err := p.err
		p.mu.RUnlock()

		if state == Rejected {
			reject(err)
			return
		}

		defer func() {
			if r := recover(); r != nil {
				reject(fmt.Errorf("panic in then callback: %v", r))
			}
		}()

		result := onFulfilled(value)
		resolve(result)
	})
}

// ThenTyped chains a callback for when the promise is fulfilled with type preservation
// Returns a new Promise of the same type
func (p *Promise[T]) ThenTyped(onFulfilled func(T) T) *Promise[T] {
	return New[T](func(resolve func(T), reject func(error)) {
		<-p.done

		p.mu.RLock()
		state := p.state
		value := p.value
		err := p.err
		p.mu.RUnlock()

		if state == Rejected {
			reject(err)
			return
		}

		defer func() {
			if r := recover(); r != nil {
				reject(fmt.Errorf("panic in then callback: %v", r))
			}
		}()

		result := onFulfilled(value)
		resolve(result)
	})
}

// Catch handles errors from the promise
func (p *Promise[T]) Catch(onRejected func(error) T) *Promise[T] {
	return New[T](func(resolve func(T), reject func(error)) {
		<-p.done

		p.mu.RLock()
		state := p.state
		value := p.value
		err := p.err
		p.mu.RUnlock()

		if state == Fulfilled {
			resolve(value)
			return
		}

		defer func() {
			if r := recover(); r != nil {
				reject(fmt.Errorf("panic in catch callback: %v", r))
			}
		}()

		result := onRejected(err)
		resolve(result)
	})
}

// Finally registers a callback that runs regardless of promise state
func (p *Promise[T]) Finally(onFinally func()) *Promise[T] {
	return New[T](func(resolve func(T), reject func(error)) {
		<-p.done

		defer func() {
			if r := recover(); r != nil {
				reject(fmt.Errorf("panic in finally callback: %v", r))
			}
		}()

		onFinally()

		p.mu.RLock()
		state := p.state
		value := p.value
		err := p.err
		p.mu.RUnlock()

		if state == Fulfilled {
			resolve(value)
		} else {
			reject(err)
		}
	})
}

// Await blocks until the promise is settled and returns the result
// Similar to await in JavaScript
func (p *Promise[T]) Await() (T, error) {
	<-p.done

	p.mu.RLock()
	defer p.mu.RUnlock()

	if p.state == Rejected {
		var zero T
		return zero, p.err
	}

	return p.value, nil
}

// State returns the current state of the promise
func (p *Promise[T]) State() State {
	p.mu.RLock()
	defer p.mu.RUnlock()
	return p.state
}

// All waits for all promises to fulfill and returns their values
// If any promise rejects, the returned promise rejects with that error
func All[T any](promises ...*Promise[T]) *Promise[[]T] {
	return New[[]T](func(resolve func([]T), reject func(error)) {
		results := make([]T, len(promises))
		var wg sync.WaitGroup
		var mu sync.Mutex
		rejected := false

		for i, p := range promises {
			wg.Add(1)
			go func(index int, promise *Promise[T]) {
				defer wg.Done()

				value, err := promise.Await()

				mu.Lock()
				defer mu.Unlock()

				if rejected {
					return
				}

				if err != nil {
					rejected = true
					reject(err)
					return
				}

				results[index] = value
			}(i, p)
		}

		wg.Wait()

		mu.Lock()
		defer mu.Unlock()

		if !rejected {
			resolve(results)
		}
	})
}

// Race returns a promise that fulfills or rejects as soon as one of the promises fulfills or rejects
func Race[T any](promises ...*Promise[T]) *Promise[T] {
	return New[T](func(resolve func(T), reject func(error)) {
		var once sync.Once

		for _, p := range promises {
			go func(promise *Promise[T]) {
				value, err := promise.Await()

				once.Do(func() {
					if err != nil {
						reject(err)
					} else {
						resolve(value)
					}
				})
			}(p)
		}
	})
}

// AllSettled waits for all promises to settle (fulfill or reject)
// Returns a slice of results containing both values and errors
func AllSettled[T any](promises ...*Promise[T]) *Promise[[]Result[T]] {
	return New[[]Result[T]](func(resolve func([]Result[T]), reject func(error)) {
		results := make([]Result[T], len(promises))
		var wg sync.WaitGroup

		for i, p := range promises {
			wg.Add(1)
			go func(index int, promise *Promise[T]) {
				defer wg.Done()

				value, err := promise.Await()
				results[index] = Result[T]{
					Value: value,
					Error: err,
				}
			}(i, p)
		}

		wg.Wait()
		resolve(results)
	})
}

// Result represents the result of a settled promise
type Result[T any] struct {
	Value T
	Error error
}

// IsSuccess returns true if the result is successful
func (r Result[T]) IsSuccess() bool {
	return r.Error == nil
}
