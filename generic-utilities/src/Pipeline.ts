/**
 * Type-safe processing pipeline that maintains type safety through transformations
 * @template T - The current value type in the pipeline
 */
export class Pipeline<T> {
    /**
     * Create a new pipeline with an initial value
     * @param value - The initial value
     */
    constructor(private value: T) {}

    /**
     * Apply a transformation function to the current value
     * @template U - The output type of the transformation
     * @param fn - Transformation function
     * @returns New Pipeline with the transformed value
     */
    pipe<U>(fn: (value: T) => U): Pipeline<U> {
        return new Pipeline(fn(this.value));
    }

    /**
     * Create a conditional branch in the pipeline
     * @param condition - Predicate function to test the value
     * @returns ConditionalPipeline for handling then/else branches
     */
    if(condition: (value: T) => boolean): ConditionalPipeline<T> {
        return new ConditionalPipeline(this.value, condition(this.value));
    }

    /**
     * Execute the pipeline and return the final value
     * @returns The current value
     */
    execute(): T {
        return this.value;
    }

    /**
     * Apply a side effect without changing the value
     * @param fn - Side effect function
     * @returns The same Pipeline for chaining
     */
    tap(fn: (value: T) => void): Pipeline<T> {
        fn(this.value);
        return this;
    }

    /**
     * Apply a transformation only if a condition is met
     * @template U - The output type of the transformation
     * @param condition - Predicate function to test the value
     * @param fn - Transformation function to apply if condition is true
     * @returns Pipeline with either transformed or original value
     */
    pipeIf<U>(condition: (value: T) => boolean, fn: (value: T) => U): Pipeline<T | U> {
        if (condition(this.value)) {
            return new Pipeline(fn(this.value));
        }
        return this as Pipeline<T | U>;
    }
}

/**
 * Conditional pipeline for handling if-then-else logic
 * @template T - The value type
 */
export class ConditionalPipeline<T> {
    private hasExecutedBranch = false;
    private resultValue: T;

    /**
     * Create a new conditional pipeline
     * @param value - The current value
     * @param conditionResult - Whether the condition was true
     */
    constructor(
        private value: T,
        private conditionResult: boolean
    ) {
        this.resultValue = value;
    }

    /**
     * Execute this transformation if the condition was true
     * @template U - The output type of the transformation
     * @param fn - Transformation function
     * @returns Pipeline with the result
     */
    then<U>(fn: (value: T) => U): ConditionalPipeline<T | U> {
        if (this.conditionResult && !this.hasExecutedBranch) {
            this.resultValue = fn(this.value) as any;
            this.hasExecutedBranch = true;
        }
        return this as any;
    }

    /**
     * Execute this transformation if the condition was false
     * @template U - The output type of the transformation
     * @param fn - Transformation function
     * @returns Pipeline with the result
     */
    else<U>(fn: (value: T) => U): Pipeline<T | U> {
        if (!this.conditionResult && !this.hasExecutedBranch) {
            this.resultValue = fn(this.value) as any;
            this.hasExecutedBranch = true;
        }
        return new Pipeline(this.resultValue as T | U);
    }

    /**
     * Execute the pipeline and return the final value
     * @returns The current value
     */
    execute(): T {
        return this.resultValue;
    }
}
