package genericutils

import (
	"errors"
	"sync"
)

// Entity is the base interface for all entities
type Entity interface {
	GetID() interface{}
}

// Repository defines the interface for CRUD operations
type Repository[T Entity] interface {
	FindByID(id interface{}) (T, error)
	FindAll() []T
	FindBy(predicate func(T) bool) []T
	Create(entity T) (T, error)
	Update(id interface{}, entity T) (T, error)
	Delete(id interface{}) error
	Count() int
	Exists(id interface{}) bool
	Clear()
}

// InMemoryRepository is a thread-safe in-memory implementation of Repository
type InMemoryRepository[T Entity] struct {
	mu     sync.RWMutex
	data   map[interface{}]T
	nextID int
}

// NewInMemoryRepository creates a new in-memory repository
func NewInMemoryRepository[T Entity]() *InMemoryRepository[T] {
	return &InMemoryRepository[T]{
		data:   make(map[interface{}]T),
		nextID: 1,
	}
}

// FindByID finds an entity by its ID (thread-safe)
func (r *InMemoryRepository[T]) FindByID(id interface{}) (T, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	entity, exists := r.data[id]
	if !exists {
		var zero T
		return zero, errors.New("entity not found")
	}
	return entity, nil
}

// FindAll returns all entities (thread-safe)
func (r *InMemoryRepository[T]) FindAll() []T {
	r.mu.RLock()
	defer r.mu.RUnlock()

	entities := make([]T, 0, len(r.data))
	for _, entity := range r.data {
		entities = append(entities, entity)
	}
	return entities
}

// FindBy finds entities matching a predicate (thread-safe)
func (r *InMemoryRepository[T]) FindBy(predicate func(T) bool) []T {
	r.mu.RLock()
	defer r.mu.RUnlock()

	results := make([]T, 0)
	for _, entity := range r.data {
		if predicate(entity) {
			results = append(results, entity)
		}
	}
	return results
}

// Create adds a new entity to the repository (thread-safe)
func (r *InMemoryRepository[T]) Create(entity T) (T, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	id := entity.GetID()
	if id == nil {
		var zero T
		return zero, errors.New("entity ID cannot be nil")
	}

	if _, exists := r.data[id]; exists {
		var zero T
		return zero, errors.New("entity with this ID already exists")
	}

	r.data[id] = entity
	return entity, nil
}

// Update updates an existing entity (thread-safe)
func (r *InMemoryRepository[T]) Update(id interface{}, entity T) (T, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.data[id]; !exists {
		var zero T
		return zero, errors.New("entity not found")
	}

	r.data[id] = entity
	return entity, nil
}

// Delete removes an entity by ID (thread-safe)
func (r *InMemoryRepository[T]) Delete(id interface{}) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.data[id]; !exists {
		return errors.New("entity not found")
	}

	delete(r.data, id)
	return nil
}

// Count returns the number of entities (thread-safe)
func (r *InMemoryRepository[T]) Count() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.data)
}

// Exists checks if an entity exists by ID (thread-safe)
func (r *InMemoryRepository[T]) Exists(id interface{}) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	_, exists := r.data[id]
	return exists
}

// Clear removes all entities (thread-safe)
func (r *InMemoryRepository[T]) Clear() {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data = make(map[interface{}]T)
}

// GetAll is an alias for FindAll
func (r *InMemoryRepository[T]) GetAll() []T {
	return r.FindAll()
}

// Save is a convenience method that creates or updates
func (r *InMemoryRepository[T]) Save(entity T) (T, error) {
	id := entity.GetID()
	if r.Exists(id) {
		return r.Update(id, entity)
	}
	return r.Create(entity)
}
