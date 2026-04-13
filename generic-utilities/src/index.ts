/**
 * Generic TypeScript Utilities
 * A collection of type-safe generic utilities for common programming patterns
 */

// Cache
export { Cache } from './Cache';

// Event Emitter
export { TypedEventEmitter, EventMap } from './EventEmitter';

// Query Builder
export { QueryBuilder } from './QueryBuilder';

// State Machine
export { FSM, StateMachine } from './StateMachine';

// Repository Pattern
export { Repository, Entity, InMemoryRepository } from './Repository';

// Pipeline
export { Pipeline, ConditionalPipeline } from './Pipeline';

// Data Pipeline (config-driven data transformation)
export { DataPipeline, PipelineConfig, TransformStep, Operator, DataRecord } from './DataPipeline';

// Validation
export {
    ValidationResult,
    Validator,
    string,
    number,
    boolean,
    array,
    object,
    optional,
    nullable,
    literal,
    union,
    refine
} from './Validator';

// Memoization
export { memoize, memoizeWithLimit, memoizeWithTTL } from './Memoize';
