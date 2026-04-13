/**
 * Example usage of all generic utilities
 */

import {
    Cache,
    TypedEventEmitter,
    EventMap,
    QueryBuilder,
    FSM,
    InMemoryRepository,
    Entity,
    Pipeline,
    DataPipeline,
    PipelineConfig,
    string,
    number,
    array,
    object,
    optional,
    memoize
} from '../src/index';

// ============================================================================
// 1. Cache Example
// ============================================================================
console.log('=== Cache Example ===');
const cache = new Cache<string, number>();
cache.set('a', 1);
cache.set('b', 2, 1000); // Expires in 1 second
console.log('Cache get a:', cache.get('a')); // 1
console.log('Cache has a:', cache.has('a')); // true
console.log('Cache size:', cache.size()); // 2

// ============================================================================
// 2. Event Emitter Example
// ============================================================================
console.log('\n=== Event Emitter Example ===');
interface MyEvents extends EventMap {
    userLogin: [userId: string, timestamp: Date];
    dataUpdate: [data: any[]];
    error: [message: string, code: number];
}

const emitter = new TypedEventEmitter<MyEvents>();

emitter.on('userLogin', (userId, timestamp) => {
    console.log(`User ${userId} logged in at ${timestamp.toISOString()}`);
});

emitter.on('error', (message, code) => {
    console.log(`Error ${code}: ${message}`);
});

emitter.emit('userLogin', 'user123', new Date());
emitter.emit('error', 'Something went wrong', 500);

// ============================================================================
// 3. Query Builder Example
// ============================================================================
console.log('\n=== Query Builder Example ===');
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

const query = new QueryBuilder<User>('users')
    .where({ age: 25 })
    .select('name', 'email')
    .orderBy('name', 'asc')
    .limit(10)
    .build();

console.log('SQL Query:', query);

// ============================================================================
// 4. State Machine Example
// ============================================================================
console.log('\n=== State Machine Example ===');
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

console.log('Current state:', trafficLight.getCurrentState()); // red
console.log('Can transition with timer?', trafficLight.canTransition('timer')); // true
trafficLight.transition('timer');
console.log('After timer transition:', trafficLight.getCurrentState()); // green

// ============================================================================
// 5. Repository Pattern Example
// ============================================================================
console.log('\n=== Repository Pattern Example ===');
interface Product extends Entity {
    id: number;
    name: string;
    price: number;
    category: string;
}

async function repositoryExample() {
    const repo = new InMemoryRepository<Product>();

    // Create products
    const product1 = await repo.create({ name: 'Laptop', price: 999, category: 'Electronics' });
    await repo.create({ name: 'Mouse', price: 29, category: 'Electronics' });
    await repo.create({ name: 'Desk', price: 299, category: 'Furniture' });

    console.log('Created product:', product1);

    // Find by ID
    const found = await repo.findById(1);
    console.log('Found by ID:', found);

    // Find by category
    const electronics = await repo.findBy('category', 'Electronics');
    console.log('Electronics count:', electronics.length);

    // Update
    const updated = await repo.update(1, { price: 899 });
    console.log('Updated product:', updated);

    // Get all
    const all = await repo.findAll();
    console.log('Total products:', all.length);
}

repositoryExample().catch(console.error);

// ============================================================================
// 6. Pipeline Example
// ============================================================================
console.log('\n=== Pipeline Example ===');
const result = new Pipeline("hello")
    .pipe(s => s.toUpperCase())
    .pipe(s => s.split(""))
    .if(arr => arr.length > 3)
    .then(arr => arr.slice(0, 3))
    .else(arr => [...arr, "!"])
    .execute();

console.log('Pipeline result:', result);

// ============================================================================
// 7. Validation System Example
// ============================================================================
console.log('\n=== Validation System Example ===');
const userValidator = object({
    name: string(),
    age: number(),
    hobbies: optional(array(string()))
});

const validUser = userValidator({
    name: 'John Doe',
    age: 30,
    hobbies: ['reading', 'coding']
});

console.log('Valid user:', validUser);

const invalidUser = userValidator({
    name: 'Jane',
    age: 'not a number', // Invalid
    hobbies: ['gaming']
});

console.log('Invalid user:', invalidUser);

// ============================================================================
// 8. Memoization Example
// ============================================================================
console.log('\n=== Memoization Example ===');
let callCount = 0;

const expensiveCalculation = (a: number, b: number): number => {
    callCount++;
    console.log(`Computing ${a} + ${b}...`);
    return a + b;
};

const memoizedCalc = memoize(expensiveCalculation);

console.log('Result 1:', memoizedCalc(5, 3)); // Computes
console.log('Result 2:', memoizedCalc(5, 3)); // Cached
console.log('Result 3:', memoizedCalc(10, 2)); // Computes
console.log('Total function calls:', callCount); // Should be 2

// Custom key function example
const complexKeyFunction = (obj: { id: number; data: string }): string => {
    console.log('Processing complex object...');
    return `${obj.id}-${obj.data}`;
};

const memoizedComplex = memoize(complexKeyFunction, (obj) => JSON.stringify(obj));

console.log('Complex 1:', memoizedComplex({ id: 1, data: 'test' }));
console.log('Complex 2:', memoizedComplex({ id: 1, data: 'test' })); // Cached

// ============================================================================
// 9. DataPipeline Example
// ============================================================================
console.log('\n=== DataPipeline Example ===');

const people = [
    { name: "Alice", age: 32, city: "Berlin" },
    { name: "Bob",   age: 25, city: "Paris"  },
    { name: "Carol", age: 28, city: "Berlin" },
    { name: "Dan",   age: 19, city: "London" },
];

const pipelineConfig: PipelineConfig = {
    steps: [
        { type: "filter", field: "age", operator: "gt", value: 20 },
        { type: "sort",   field: "age", direction: "asc" },
        { type: "map",    from: "name", to: "fullName" },
        { type: "limit",  count: 2 },
    ],
};

const pipelineResult = new DataPipeline(pipelineConfig).run(people);
console.log('DataPipeline result:', pipelineResult);
// Expected:
// [ { fullName: 'Bob', age: 25, city: 'Paris' },
//   { fullName: 'Carol', age: 28, city: 'Berlin' } ]

// Verify original data is untouched
console.log('Original data unchanged:', people[0].name === 'Alice'); // true

// Filter with "contains"
const cityFilter: PipelineConfig = {
    steps: [{ type: "filter", field: "city", operator: "contains", value: "er" }],
};
console.log('Contains "er":', new DataPipeline(cityFilter).run(people).map(r => r.city));
// [ 'Berlin', 'Berlin' ]

// Empty input
console.log('Empty input:', new DataPipeline(pipelineConfig).run([])); // []

// Unknown step throws
try {
    new DataPipeline({ steps: [{ type: "unknown" } as never] }).run(people);
} catch (e) {
    console.log('Unknown step error:', (e as Error).message); // Unknown step: unknown
}

// Unknown operator throws
try {
    new DataPipeline({ steps: [{ type: "filter", field: "age", operator: "neq" as never, value: 0 }] }).run(people);
} catch (e) {
    console.log('Unknown operator error:', (e as Error).message); // Unknown operator: neq
}

console.log('\n=== All Examples Complete ===');
