# Generic TypeScript Utilities

A comprehensive collection of type-safe generic utilities for common programming patterns in TypeScript.

## Features

This library includes 8 powerful generic utilities:

1. **Cache** - Type-safe cache with TTL support
2. **TypedEventEmitter** - Strongly-typed event emitter system
3. **QueryBuilder** - Fluent builder pattern for SQL queries
4. **FSM (Finite State Machine)** - Type-safe state machine
5. **Repository** - Generic repository pattern with CRUD operations
6. **Pipeline** - Type-safe processing pipeline with conditional logic
7. **Validation** - Composable validation system
8. **Memoization** - Generic memoization with multiple strategies

## Installation

```bash
npm install
npm run build
```

## Usage

### 1. Cache

A generic cache implementation with optional Time-To-Live (TTL) support.

```typescript
import { Cache } from './src/Cache';

const cache = new Cache<string, number>();

// Set without TTL (permanent)
cache.set('key1', 100);

// Set with TTL (expires in 5000ms)
cache.set('key2', 200, 5000);

// Get values
console.log(cache.get('key1')); // 100
console.log(cache.has('key2')); // true

// Size and clear
console.log(cache.size()); // 2
cache.clear();
```

### 2. TypedEventEmitter

A strongly-typed event emitter that enforces event argument types at compile time.

```typescript
import { TypedEventEmitter } from './src/EventEmitter';

interface MyEvents {
    userLogin: [userId: string, timestamp: Date];
    dataUpdate: [data: any[]];
    error: [message: string, code: number];
}

const emitter = new TypedEventEmitter<MyEvents>();

// Type-safe event listeners
emitter.on('userLogin', (userId, timestamp) => {
    console.log(`User ${userId} logged in`);
});

emitter.on('error', (message, code) => {
    console.error(`Error ${code}: ${message}`);
});

// Type-safe event emission
emitter.emit('userLogin', 'user123', new Date());
emitter.emit('error', 'Connection failed', 500);

// Remove listeners
emitter.off('userLogin', listener);
```

### 3. QueryBuilder

A fluent API for building SQL queries with type safety.

```typescript
import { QueryBuilder } from './src/QueryBuilder';

interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

const query = new QueryBuilder<User>('users')
    .select('name', 'email')
    .where({ age: 25 })
    .orderBy('name', 'asc')
    .limit(10)
    .build();

console.log(query);
// Output: SELECT name, email FROM users WHERE age = 25 ORDER BY name ASC LIMIT 10
```

### 4. Finite State Machine (FSM)

A type-safe state machine implementation.

```typescript
import { FSM } from './src/StateMachine';

type TrafficLightStates = 'red' | 'yellow' | 'green';
type TrafficLightEvents = 'timer' | 'manual';

const trafficLight = new FSM<TrafficLightStates, TrafficLightEvents>(
    {
        red: { timer: 'green' },
        yellow: { timer: 'red' },
        green: { timer: 'yellow', manual: 'red' }
    },
    'red'
);

console.log(trafficLight.getCurrentState()); // 'red'
console.log(trafficLight.canTransition('timer')); // true

trafficLight.transition('timer');
console.log(trafficLight.getCurrentState()); // 'green'
```

### 5. Repository Pattern

Generic repository with full CRUD operations for in-memory data storage.

```typescript
import { InMemoryRepository, Entity } from './src/Repository';

interface Product extends Entity {
    id: number;
    name: string;
    price: number;
    category: string;
}

const repo = new InMemoryRepository<Product>();

// Create
const product = await repo.create({
    name: 'Laptop',
    price: 999,
    category: 'Electronics'
});

// Read
const found = await repo.findById(1);
const electronics = await repo.findBy('category', 'Electronics');
const all = await repo.findAll();

// Update
const updated = await repo.update(1, { price: 899 });

// Delete
const deleted = await repo.delete(1);
```

### 6. Pipeline

Type-safe processing pipeline with conditional logic.

```typescript
import { Pipeline } from './src/Pipeline';

const result = new Pipeline("hello")
    .pipe(s => s.toUpperCase())
    .pipe(s => s.split(""))
    .if(arr => arr.length > 3)
    .then(arr => arr.slice(0, 3))
    .else(arr => [...arr, "!"])
    .execute();

console.log(result); // ['H', 'E', 'L']
```

### 7. Validation System

Composable validation system with full type inference.

```typescript
import { object, string, number, array, optional } from './src/Validator';

const userValidator = object({
    name: string(),
    age: number(),
    hobbies: optional(array(string()))
});

const result = userValidator({
    name: 'John Doe',
    age: 30,
    hobbies: ['reading', 'coding']
});

if (result.success) {
    console.log('Valid user:', result.data);
} else {
    console.error('Validation errors:', result.errors);
}
```

Available validators:
- `string()` - String validator
- `number()` - Number validator
- `boolean()` - Boolean validator
- `array(validator)` - Array validator
- `object(schema)` - Object validator
- `optional(validator)` - Optional value validator
- `nullable(validator)` - Nullable value validator
- `literal(value)` - Literal value validator
- `union(...validators)` - Union type validator
- `refine(validator, predicate, error)` - Custom validation

### 8. Memoization

Generic memoization that preserves function signatures.

```typescript
import { memoize, memoizeWithLimit, memoizeWithTTL } from './src/Memoize';

// Basic memoization
const expensiveCalc = (a: number, b: number): number => {
    console.log('Computing...');
    return a + b;
};

const memoized = memoize(expensiveCalc);
console.log(memoized(5, 3)); // Computes
console.log(memoized(5, 3)); // Cached

// Custom key function
const memoizedCustom = memoize(
    expensiveCalc,
    (a, b) => `${a}-${b}`
);

// With size limit (LRU-like)
const memoizedLimited = memoizeWithLimit(expensiveCalc, 100);

// With TTL
const memoizedTTL = memoizeWithTTL(expensiveCalc, 5000); // 5 seconds
```

## Running Examples

```bash
npm install
npm test
```

This will run the comprehensive examples in `tests/example.ts` that demonstrate all utilities.

## Building

```bash
npm run build
```

Compiled files will be in the `dist/` directory.

## Type Safety

All utilities are fully type-safe and leverage TypeScript's powerful type system:

- Generic constraints ensure correct usage
- Type inference reduces boilerplate
- Compile-time errors catch mistakes early
- Full IntelliSense support in IDEs

## License

MIT
