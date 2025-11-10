/**
 * Observable Examples and Tests
 * Demonstrates various Observable patterns and operators
 */

import {
  Observable,
  map,
  filter,
  tap,
  take,
  takeWhile,
  skip,
  skipWhile,
  mergeMap,
  switchMap,
  catchError,
  distinctUntilChanged,
  scan,
  reduce,
  first,
  last
} from '../src';

console.log('=== Custom Observable Examples ===\n');

// Example 1: Basic Observable Creation
// console.log('1. Basic Observable Creation:');
// const basic$ = new Observable<number>(subscriber => {
//   subscriber.next(1);
//   subscriber.next(2);
//   subscriber.next(3);
//   subscriber.complete();
// });

// basic$.subscribe({
//   next: value => console.log(`  Value: ${value}`),
//   complete: () => console.log('  Completed!\n')
// });

// // Example 2: Observable.of
// console.log('2. Observable.of - Create from values:');
// Observable.of(10, 20, 30, 40, 50).subscribe({
//   next: value => console.log(`  Value: ${value}`),
//   complete: () => console.log('  Completed!\n')
// });

// // Example 3: Observable.from (Array)
// console.log('3. Observable.from - Create from array:');
// Observable.from([100, 200, 300]).subscribe({
//   next: value => console.log(`  Value: ${value}`),
//   complete: () => console.log('  Completed!\n')
// });

// // Example 4: Observable.range
// console.log('4. Observable.range - Sequence of numbers:');
// Observable.range(1, 5).subscribe({
//   next: value => console.log(`  Value: ${value}`),
//   complete: () => console.log('  Completed!\n')
// });

// Example 5: map operator
// console.log('5. map - Transform values:');
// Observable.of(1, 2, 3, 4, 5)
//   .pipe(map(x => x * 10))
//   .subscribe({
//     next: value => console.log(`  Value: ${value}`),
//     complete: () => console.log('  Completed!\n')
//   });

// // Example 6: filter operator
// console.log('6. filter - Filter even numbers:');
// Observable.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
//   .pipe(filter(x => x % 2 === 0))
//   .subscribe({
//     next: value => console.log(`  Value: ${value}`),
//     complete: () => console.log('  Completed!\n')
//   });

// Example 7: Chaining operators
console.log('7. Chaining operators (filter + map):');
Observable.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
  .pipe(
    filter(x => x % 2 === 0),
    map(x => x * x)
  )
  .subscribe({
    next: value => console.log(`  Square of even: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 8: tap operator (side effects)
console.log('8. tap - Side effects without modification:');
Observable.of('A', 'B', 'C')
  .pipe(
    tap(value => console.log(`  [TAP] Processing: ${value}`)),
    map(value => value.toLowerCase())
  )
  .subscribe({
    next: value => console.log(`  Result: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 9: take operator
console.log('9. take - Take first 3 values:');
Observable.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
  .pipe(take(3))
  .subscribe({
    next: value => console.log(`  Value: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 10: takeWhile operator
console.log('10. takeWhile - Take while less than 5:');
Observable.of(1, 2, 3, 4, 5, 6, 7, 8)
  .pipe(takeWhile(x => x < 5))
  .subscribe({
    next: value => console.log(`  Value: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 11: skip operator
console.log('11. skip - Skip first 3 values:');
Observable.of(1, 2, 3, 4, 5, 6, 7)
  .pipe(skip(3))
  .subscribe({
    next: value => console.log(`  Value: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 12: skipWhile operator
console.log('12. skipWhile - Skip while less than 5:');
Observable.of(1, 2, 3, 4, 5, 6, 7, 8)
  .pipe(skipWhile(x => x < 5))
  .subscribe({
    next: value => console.log(`  Value: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 13: distinctUntilChanged
console.log('13. distinctUntilChanged - Remove consecutive duplicates:');
Observable.of(1, 1, 2, 2, 2, 3, 3, 1, 1, 4)
  .pipe(distinctUntilChanged())
  .subscribe({
    next: value => console.log(`  Value: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 14: scan operator (running accumulation)
console.log('14. scan - Running sum:');
Observable.of(1, 2, 3, 4, 5)
  .pipe(scan((acc, value) => acc + value, 0))
  .subscribe({
    next: value => console.log(`  Running sum: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 15: reduce operator (final accumulation)
console.log('15. reduce - Final sum:');
Observable.of(1, 2, 3, 4, 5)
  .pipe(reduce((acc, value) => acc + value, 0))
  .subscribe({
    next: value => console.log(`  Total sum: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 16: first operator
console.log('16. first - Get first even number:');
Observable.of(1, 3, 5, 6, 7, 8)
  .pipe(first(x => x % 2 === 0))
  .subscribe({
    next: value => console.log(`  First even: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 17: last operator
console.log('17. last - Get last odd number:');
Observable.of(1, 2, 3, 4, 5, 6, 7, 8)
  .pipe(last(x => x % 2 === 1))
  .subscribe({
    next: value => console.log(`  Last odd: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 18: mergeMap (flatMap)
console.log('18. mergeMap - Flatten nested observables:');
Observable.of(1, 2, 3)
  .pipe(
    mergeMap(x => Observable.of(x, x * 10, x * 100))
  )
  .subscribe({
    next: value => console.log(`  Value: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 19: catchError
console.log('19. catchError - Handle errors gracefully:');
const errorObservable$ = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.error('Something went wrong!');
});

errorObservable$
  .pipe(
    catchError(err => {
      console.log(`  Caught error: ${err}`);
      return Observable.of(999);
    })
  )
  .subscribe({
    next: value => console.log(`  Value: ${value}`),
    complete: () => console.log('  Completed!\n')
  });

// Example 20: Complex real-world example
console.log('20. Complex example - Data processing pipeline:');
interface User {
  id: number;
  name: string;
  age: number;
}

const users: User[] = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 25 },
  { id: 4, name: 'David', age: 35 },
  { id: 5, name: 'Eve', age: 30 }
];

Observable.from(users)
  .pipe(
    tap(user => console.log(`  Processing: ${user.name}`)),
    filter(user => user.age >= 30),
    map(user => ({ ...user, senior: true })),
    take(2),
    scan((acc, _user) => acc + 1, 0)
  )
  .subscribe({
    next: count => console.log(`  Processed count: ${count}`),
    complete: () => console.log('  Processing completed!\n')
  });

// Example 21: Interval with operators
console.log('21. Interval - First 5 values with delay:');
Observable.interval(100)
  .pipe(
    take(5),
    map(x => x * 2)
  )
  .subscribe({
    next: value => console.log(`  Interval value: ${value}`),
    complete: () => console.log('  Interval completed!\n')
  });

// Example 22: Timer
setTimeout(() => {
  console.log('22. Timer - Single emission after delay:');
  Observable.timer(100)
    .subscribe({
      next: value => console.log(`  Timer value: ${value}`),
      complete: () => console.log('  Timer completed!\n')
    });
}, 600);

// Example 23: Unsubscribe demonstration
setTimeout(() => {
  console.log('23. Unsubscribe - Manual cleanup:');
  const sub = Observable.interval(100)
    .pipe(map(x => x + 1))
    .subscribe({
      next: value => console.log(`  Value: ${value}`),
      complete: () => console.log('  Should not complete')
    });

  setTimeout(() => {
    console.log('  Unsubscribing...');
    sub.unsubscribe();
    console.log('  Unsubscribed!\n');
  }, 350);
}, 800);

// Example 24: Error handling
setTimeout(() => {
  console.log('24. Error handling:');
  const errorObs$ = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    setTimeout(() => {
      subscriber.error(new Error('Async error occurred'));
    }, 100);
  });

  errorObs$.subscribe({
    next: value => console.log(`  Value: ${value}`),
    error: err => console.log(`  Error: ${err.message}`),
    complete: () => console.log('  Should not complete')
  });
}, 1300);

// Example 25: From Promise
setTimeout(() => {
  console.log('\n25. From Promise:');
  const promise = Promise.resolve('Promise value');
  Observable.from(promise).subscribe({
    next: value => console.log(`  Value: ${value}`),
    complete: () => console.log('  Completed!')
  });
}, 1500);

// Example 26: switchMap demonstration
setTimeout(() => {
  console.log('\n26. switchMap - Cancel previous inner observables:');
  Observable.of(1, 2, 3)
    .pipe(
      switchMap(x => Observable.of(`Value: ${x}`, `Doubled: ${x * 2}`))
    )
    .subscribe({
      next: value => console.log(`  ${value}`),
      complete: () => console.log('  Completed!')
    });
}, 1700);

// End message
setTimeout(() => {
  console.log('\n=== All examples completed! ===');
}, 2000);
