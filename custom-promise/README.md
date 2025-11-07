# Custom Promise Implementation

A from-scratch implementation of the JavaScript Promise/A+ specification in TypeScript.

## Features

This custom Promise implementation includes:

- ✅ Core Promise functionality (pending, fulfilled, rejected states)
- ✅ `.then()` method with proper chaining
- ✅ `.catch()` method for error handling
- ✅ `.finally()` method
- ✅ Static methods:
  - `CustomPromise.resolve()`
  - `CustomPromise.reject()`
  - `CustomPromise.all()`
  - `CustomPromise.race()`
  - `CustomPromise.allSettled()`
  - `CustomPromise.any()`
- ✅ Proper thenable/PromiseLike handling
- ✅ Asynchronous execution using setTimeout
- ✅ Full TypeScript type safety

## Structure

```
custom-promise/
├── src/
│   ├── CustomPromise.ts    # Main implementation
│   └── index.ts             # Export file
├── tests/
│   └── example.ts           # Comprehensive test suite
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### Basic Promise Creation

```typescript
import { CustomPromise } from './src/CustomPromise';

const promise = new CustomPromise<string>((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!');
  }, 1000);
});

promise.then(value => {
  console.log(value); // "Success!"
});
```

### Chaining

```typescript
CustomPromise.resolve(5)
  .then(x => x * 2)
  .then(x => x + 10)
  .then(x => console.log(x)); // 20
```

### Error Handling

```typescript
CustomPromise.reject('Error!')
  .catch(error => console.error(error))
  .finally(() => console.log('Cleanup'));
```

### Static Methods

```typescript
// Promise.all
CustomPromise.all([
  CustomPromise.resolve(1),
  CustomPromise.resolve(2),
  CustomPromise.resolve(3)
]).then(values => console.log(values)); // [1, 2, 3]

// Promise.race
CustomPromise.race([
  new CustomPromise(resolve => setTimeout(() => resolve('slow'), 100)),
  new CustomPromise(resolve => setTimeout(() => resolve('fast'), 50))
]).then(value => console.log(value)); // "fast"

// Promise.allSettled
CustomPromise.allSettled([
  CustomPromise.resolve(1),
  CustomPromise.reject('error'),
  CustomPromise.resolve(3)
]).then(results => console.log(results));
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'error' },
//   { status: 'fulfilled', value: 3 }
// ]

// Promise.any
CustomPromise.any([
  CustomPromise.reject('error1'),
  CustomPromise.resolve('success'),
  CustomPromise.reject('error2')
]).then(value => console.log(value)); // "success"
```

## Building

```bash
npm install
npm run build
```

The compiled JavaScript will be output to the `dist/` directory.

## Running Tests

```bash
# First, build the project
npm run build

# Then run the tests
npm test
```

Or directly with TypeScript:

```bash
npx ts-node tests/example.ts
```

## Implementation Details

### State Management

The CustomPromise maintains three possible states:
- **PENDING**: Initial state
- **FULFILLED**: Operation completed successfully
- **REJECTED**: Operation failed

### Asynchronous Execution

The implementation uses `setTimeout` to ensure that promise handlers are executed asynchronously, matching the behavior of native Promises.

### Thenable Support

The implementation properly handles "thenable" objects (objects with a `then` method), allowing for Promise interoperability.

### Type Safety

Full TypeScript generics support ensures type safety throughout the promise chain.

## Differences from Native Promises

While this implementation closely follows the Promise/A+ specification, there are some differences from native JavaScript Promises:

1. Uses `setTimeout` for async execution instead of the microtask queue
2. Simplified internal structure for educational purposes
3. May have slight performance differences due to the polyfill nature

## License

MIT
