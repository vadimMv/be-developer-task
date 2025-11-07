# Custom Observable - RxJS-Style Implementation

A from-scratch implementation of the Observable pattern similar to RxJS, written in TypeScript.

## Features

### Core Classes

- **Observable**: Represents a stream of values over time
- **Observer**: Interface for consuming values from an Observable
- **Subscription**: Represents a disposable resource that can be unsubscribed

### Creation Methods

- `Observable.of(...values)` - Create from values
- `Observable.from(array | iterable | promise)` - Create from various sources
- `Observable.range(start, count)` - Create sequence of numbers
- `Observable.interval(period)` - Emit sequential numbers at intervals
- `Observable.timer(delay, period?)` - Emit after delay, optionally repeat
- `Observable.never()` - Never emits or completes
- `Observable.empty()` - Completes immediately
- `Observable.throwError(error)` - Emits error immediately

### Operators

#### Transformation
- `map(project)` - Transform each value
- `scan(accumulator, seed?)` - Accumulate values over time
- `reduce(accumulator, seed?)` - Accumulate to single value

#### Filtering
- `filter(predicate)` - Filter values by condition
- `take(count)` - Take first n values
- `takeWhile(predicate)` - Take while condition is true
- `skip(count)` - Skip first n values
- `skipWhile(predicate)` - Skip while condition is true
- `first(predicate?, default?)` - Emit first value
- `last(predicate?, default?)` - Emit last value
- `distinctUntilChanged(compare?)` - Remove consecutive duplicates

#### Timing
- `debounceTime(duration)` - Debounce emissions
- `throttleTime(duration)` - Throttle emissions
- `delay(delayTime)` - Delay all emissions

#### Combination
- `mergeMap(project)` - Map to inner Observable and flatten
- `switchMap(project)` - Map to inner Observable, cancel previous

#### Error Handling
- `catchError(selector)` - Catch and recover from errors
- `retry(count?)` - Retry on error

#### Utility
- `tap(observer | next)` - Perform side effects

## Usage Examples

### Basic Observable

```typescript
import { Observable } from './custom-observable';

const observable$ = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

observable$.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Done!')
});
```

### Using Operators

```typescript
import { Observable, map, filter, take } from './custom-observable';

Observable.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
  .pipe(
    filter(x => x % 2 === 0),  // Get even numbers
    map(x => x * x),            // Square them
    take(3)                     // Take first 3
  )
  .subscribe({
    next: value => console.log(value),  // 4, 16, 36
    complete: () => console.log('Done!')
  });
```

### Interval and Timers

```typescript
import { Observable, map, take } from './custom-observable';

// Emit every 1 second, take first 5
Observable.interval(1000)
  .pipe(
    take(5),
    map(x => `Value: ${x}`)
  )
  .subscribe({
    next: value => console.log(value),
    complete: () => console.log('Done!')
  });
```

### Error Handling

```typescript
import { Observable, catchError } from './custom-observable';

const failingObservable$ = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.error('Something went wrong!');
});

failingObservable$
  .pipe(
    catchError(err => {
      console.log('Caught:', err);
      return Observable.of(999);  // Recover with fallback
    })
  )
  .subscribe({
    next: value => console.log(value),  // 1, 2, 999
    complete: () => console.log('Done!')
  });
```

### Flattening with mergeMap

```typescript
import { Observable, mergeMap } from './custom-observable';

Observable.of(1, 2, 3)
  .pipe(
    mergeMap(x => Observable.of(x, x * 10, x * 100))
  )
  .subscribe({
    next: value => console.log(value)  // 1, 10, 100, 2, 20, 200, 3, 30, 300
  });
```

### Switching with switchMap

```typescript
import { Observable, switchMap } from './custom-observable';

// User clicks trigger API calls - cancel previous request when new click occurs
userClicks$
  .pipe(
    switchMap(click => fetchDataFromAPI(click.userId))
  )
  .subscribe(data => updateUI(data));
```

### Unsubscribing

```typescript
import { Observable } from './custom-observable';

const subscription = Observable.interval(1000).subscribe({
  next: value => console.log(value)
});

// Later: stop receiving values
setTimeout(() => {
  subscription.unsubscribe();
}, 5000);
```

## Running Examples

To run the example tests:

```bash
# Compile TypeScript
npx tsc custom-observable/tests/example.ts --outDir ./dist --target ES2020 --module commonjs --esModuleInterop

# Run the examples
node dist/example.js
```

## Architecture

The implementation follows these design principles:

1. **Lazy Evaluation**: Observables don't execute until subscribed
2. **Push-based**: Values are pushed to observers as they become available
3. **Composable**: Operators can be chained using the `pipe()` method
4. **Resource Management**: Subscriptions can be unsubscribed to free resources
5. **Error Handling**: Errors are propagated through the operator chain
6. **Type Safety**: Full TypeScript support with proper type inference

## Comparison with RxJS

This implementation includes the core functionality of RxJS Observables:

- ✅ Core Observable, Observer, and Subscription
- ✅ Common creation operators
- ✅ Essential transformation and filtering operators
- ✅ Error handling and retry logic
- ✅ Flattening operators (mergeMap, switchMap)
- ✅ Timing operators (debounce, throttle, delay)

Note: This is a learning implementation and doesn't include all RxJS features like:
- Subjects and multicasting
- Schedulers
- Advanced operators (combineLatest, withLatestFrom, etc.)
- Complete RxJS operator library
