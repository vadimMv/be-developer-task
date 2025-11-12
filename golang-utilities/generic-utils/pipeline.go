package genericutils

// Pipeline provides a type-safe processing pipeline for data transformations
type Pipeline[T any] struct {
	value T
}

// NewPipeline creates a new pipeline with an initial value
func NewPipeline[T any](value T) *Pipeline[T] {
	return &Pipeline[T]{value: value}
}

// Pipe applies a transformation function to the current value
func (p *Pipeline[T]) Pipe(fn func(T) T) *Pipeline[T] {
	return &Pipeline[T]{value: fn(p.value)}
}

// PipeTransform applies a transformation that changes the type
func PipeTransform[T any, U any](p *Pipeline[T], fn func(T) U) *Pipeline[U] {
	return &Pipeline[U]{value: fn(p.value)}
}

// Tap executes a side effect without changing the value
func (p *Pipeline[T]) Tap(fn func(T)) *Pipeline[T] {
	fn(p.value)
	return p
}

// Execute returns the final value from the pipeline
func (p *Pipeline[T]) Execute() T {
	return p.value
}

// PipeIf applies a transformation only if a condition is met
func (p *Pipeline[T]) PipeIf(condition func(T) bool, fn func(T) T) *Pipeline[T] {
	if condition(p.value) {
		return &Pipeline[T]{value: fn(p.value)}
	}
	return p
}

// ConditionalPipeline handles if-then-else logic in pipelines
type ConditionalPipeline[T any] struct {
	value             T
	conditionResult   bool
	hasExecutedBranch bool
}

// If creates a conditional branch in the pipeline
func (p *Pipeline[T]) If(condition func(T) bool) *ConditionalPipeline[T] {
	return &ConditionalPipeline[T]{
		value:             p.value,
		conditionResult:   condition(p.value),
		hasExecutedBranch: false,
	}
}

// Then executes if the condition was true
func (cp *ConditionalPipeline[T]) Then(fn func(T) T) *ConditionalPipeline[T] {
	if cp.conditionResult && !cp.hasExecutedBranch {
		cp.value = fn(cp.value)
		cp.hasExecutedBranch = true
	}
	return cp
}

// Else executes if the condition was false
func (cp *ConditionalPipeline[T]) Else(fn func(T) T) *Pipeline[T] {
	if !cp.conditionResult && !cp.hasExecutedBranch {
		cp.value = fn(cp.value)
		cp.hasExecutedBranch = true
	}
	return &Pipeline[T]{value: cp.value}
}

// Execute returns the final value from a conditional pipeline
func (cp *ConditionalPipeline[T]) Execute() T {
	return cp.value
}

// ToPipeline converts a conditional pipeline back to a regular pipeline
func (cp *ConditionalPipeline[T]) ToPipeline() *Pipeline[T] {
	return &Pipeline[T]{value: cp.value}
}

// PipelineBuilder provides a builder pattern for complex pipelines
type PipelineBuilder[T any] struct {
	value T
	steps []func(T) T
}

// NewPipelineBuilder creates a new pipeline builder
func NewPipelineBuilder[T any](value T) *PipelineBuilder[T] {
	return &PipelineBuilder[T]{
		value: value,
		steps: make([]func(T) T, 0),
	}
}

// Add adds a transformation step to the builder
func (pb *PipelineBuilder[T]) Add(fn func(T) T) *PipelineBuilder[T] {
	pb.steps = append(pb.steps, fn)
	return pb
}

// Build executes all steps and returns the final value
func (pb *PipelineBuilder[T]) Build() T {
	result := pb.value
	for _, step := range pb.steps {
		result = step(result)
	}
	return result
}

// AsyncPipeline provides async processing with goroutines
type AsyncPipeline[T any] struct {
	valueChan chan T
}

// NewAsyncPipeline creates a new async pipeline
func NewAsyncPipeline[T any](value T) *AsyncPipeline[T] {
	ch := make(chan T, 1)
	ch <- value
	return &AsyncPipeline[T]{valueChan: ch}
}

// PipeAsync applies an async transformation
func (ap *AsyncPipeline[T]) PipeAsync(fn func(T) T) *AsyncPipeline[T] {
	resultChan := make(chan T, 1)

	go func() {
		value := <-ap.valueChan
		resultChan <- fn(value)
	}()

	return &AsyncPipeline[T]{valueChan: resultChan}
}

// Await waits for the pipeline to complete and returns the result
func (ap *AsyncPipeline[T]) Await() T {
	return <-ap.valueChan
}
