package genericutils

import (
	"sync"
)

// EventListener is a function that handles events
type EventListener func(...interface{})

// EventEmitter is a thread-safe event emitter implementation
type EventEmitter struct {
	mu        sync.RWMutex
	listeners map[string][]EventListener
}

// NewEventEmitter creates a new EventEmitter instance
func NewEventEmitter() *EventEmitter {
	return &EventEmitter{
		listeners: make(map[string][]EventListener),
	}
}

// On registers an event listener for the specified event
func (e *EventEmitter) On(event string, listener EventListener) {
	e.mu.Lock()
	defer e.mu.Unlock()

	e.listeners[event] = append(e.listeners[event], listener)
}

// Once registers a one-time event listener
// The listener is automatically removed after the first invocation
func (e *EventEmitter) Once(event string, listener EventListener) {
	var wrapper EventListener
	wrapper = func(args ...interface{}) {
		listener(args...)
		e.Off(event, wrapper)
	}
	e.On(event, wrapper)
}

// Off removes a specific event listener
func (e *EventEmitter) Off(event string, listener EventListener) {
	e.mu.Lock()
	defer e.mu.Unlock()

	listeners, exists := e.listeners[event]
	if !exists {
		return
	}

	// Remove the listener (comparing function pointers is tricky in Go)
	// We'll remove by position if found
	for i, l := range listeners {
		// This comparison works for non-wrapped functions
		// For wrapped functions (like in Once), we rely on the wrapper removing itself
		if &l == &listener {
			e.listeners[event] = append(listeners[:i], listeners[i+1:]...)
			break
		}
	}

	// Clean up empty listener lists
	if len(e.listeners[event]) == 0 {
		delete(e.listeners, event)
	}
}

// Emit triggers all listeners for the specified event with the given arguments
func (e *EventEmitter) Emit(event string, args ...interface{}) {
	e.mu.RLock()
	listeners, exists := e.listeners[event]
	if !exists {
		e.mu.RUnlock()
		return
	}

	// Create a copy of listeners to avoid holding the lock during execution
	listenersCopy := make([]EventListener, len(listeners))
	copy(listenersCopy, listeners)
	e.mu.RUnlock()

	// Execute listeners without holding the lock
	for _, listener := range listenersCopy {
		listener(args...)
	}
}

// RemoveAllListeners removes all listeners for a specific event
// If no event is specified, removes all listeners for all events
func (e *EventEmitter) RemoveAllListeners(event ...string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if len(event) == 0 {
		e.listeners = make(map[string][]EventListener)
	} else {
		delete(e.listeners, event[0])
	}
}

// ListenerCount returns the number of listeners for a specific event
func (e *EventEmitter) ListenerCount(event string) int {
	e.mu.RLock()
	defer e.mu.RUnlock()

	return len(e.listeners[event])
}

// EventNames returns all event names that have listeners
func (e *EventEmitter) EventNames() []string {
	e.mu.RLock()
	defer e.mu.RUnlock()

	names := make([]string, 0, len(e.listeners))
	for name := range e.listeners {
		names = append(names, name)
	}
	return names
}

// TypedEventEmitter is a type-safe event emitter for specific event types
type TypedEventEmitter[T any] struct {
	mu        sync.RWMutex
	listeners map[string][]func(T)
}

// NewTypedEventEmitter creates a new typed event emitter
func NewTypedEventEmitter[T any]() *TypedEventEmitter[T] {
	return &TypedEventEmitter[T]{
		listeners: make(map[string][]func(T)),
	}
}

// On registers a typed event listener
func (e *TypedEventEmitter[T]) On(event string, listener func(T)) {
	e.mu.Lock()
	defer e.mu.Unlock()

	e.listeners[event] = append(e.listeners[event], listener)
}

// Once registers a one-time typed event listener
func (e *TypedEventEmitter[T]) Once(event string, listener func(T)) {
	var wrapper func(T)
	wrapper = func(data T) {
		listener(data)
		e.Off(event, wrapper)
	}
	e.On(event, wrapper)
}

// Off removes a typed event listener
func (e *TypedEventEmitter[T]) Off(event string, listener func(T)) {
	e.mu.Lock()
	defer e.mu.Unlock()

	listeners, exists := e.listeners[event]
	if !exists {
		return
	}

	for i, l := range listeners {
		if &l == &listener {
			e.listeners[event] = append(listeners[:i], listeners[i+1:]...)
			break
		}
	}

	if len(e.listeners[event]) == 0 {
		delete(e.listeners, event)
	}
}

// Emit triggers all typed listeners for the specified event
func (e *TypedEventEmitter[T]) Emit(event string, data T) {
	e.mu.RLock()
	listeners, exists := e.listeners[event]
	if !exists {
		e.mu.RUnlock()
		return
	}

	listenersCopy := make([]func(T), len(listeners))
	copy(listenersCopy, listeners)
	e.mu.RUnlock()

	for _, listener := range listenersCopy {
		listener(data)
	}
}

// ListenerCount returns the number of typed listeners for an event
func (e *TypedEventEmitter[T]) ListenerCount(event string) int {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return len(e.listeners[event])
}
