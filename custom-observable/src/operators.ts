/**
 * Observable Operators
 * Common operators for transforming and composing Observables
 */

import { Observable, OperatorFunction } from './Observable';

/**
 * Transform values emitted by the source Observable
 */
export function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>(subscriber => {
      let index = 0;
      return source.subscribe({
        next: value => {
          try {
            const result = project(value, index++);
            subscriber.next(result);
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Filter values emitted by the source Observable
 */
export function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let index = 0;
      return source.subscribe({
        next: value => {
          try {
            if (predicate(value, index++)) {
              subscriber.next(value);
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Perform side effects for each value without modifying the stream
 */
export function tap<T>(
  nextOrObserver?: ((value: T) => void) | {
    next?: (value: T) => void;
    error?: (err: any) => void;
    complete?: () => void;
  }
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      const tapObserver = typeof nextOrObserver === 'function'
        ? { next: nextOrObserver }
        : nextOrObserver || {};

      return source.subscribe({
        next: value => {
          try {
            if (tapObserver.next) tapObserver.next(value);
            subscriber.next(value);
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => {
          try {
            if (tapObserver.error) tapObserver.error(err);
          } catch (e) {
            // Ignore tap errors in error handler
          }
          subscriber.error(err);
        },
        complete: () => {
          try {
            if (tapObserver.complete) tapObserver.complete();
          } catch (err) {
            subscriber.error(err);
            return;
          }
          subscriber.complete();
        }
      });
    });
}

/**
 * Emit only the first n values
 */
export function take<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let taken = 0;
      const subscription = source.subscribe({
        next: value => {
          if (taken < count) {
            subscriber.next(value);
            taken++;
            if (taken >= count) {
              subscriber.complete();
            }
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });

      return subscription;
    });
}

/**
 * Emit values while the predicate returns true
 */
export function takeWhile<T>(
  predicate: (value: T, index: number) => boolean,
  inclusive = false
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let index = 0;
      return source.subscribe({
        next: value => {
          try {
            const result = predicate(value, index++);
            if (result) {
              subscriber.next(value);
            } else {
              if (inclusive) {
                subscriber.next(value);
              }
              subscriber.complete();
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Skip the first n values
 */
export function skip<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let skipped = 0;
      return source.subscribe({
        next: value => {
          if (skipped >= count) {
            subscriber.next(value);
          } else {
            skipped++;
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Skip values while the predicate returns true
 */
export function skipWhile<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let index = 0;
      let skipping = true;
      return source.subscribe({
        next: value => {
          if (skipping) {
            try {
              skipping = predicate(value, index++);
            } catch (err) {
              subscriber.error(err);
              return;
            }
          }
          if (!skipping) {
            subscriber.next(value);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Debounce emissions by the specified time
 */
export function debounceTime<T>(dueTime: number): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let timeoutId: NodeJS.Timeout | null = null;

      const subscription = source.subscribe({
        next: value => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            subscriber.next(value);
            timeoutId = null;
          }, dueTime);
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    });
}

/**
 * Throttle emissions - emit first value then ignore for duration
 */
export function throttleTime<T>(duration: number): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let throttling = false;

      return source.subscribe({
        next: value => {
          if (!throttling) {
            subscriber.next(value);
            throttling = true;
            setTimeout(() => {
              throttling = false;
            }, duration);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Map to inner Observable and flatten (mergeMap/flatMap)
 */
export function mergeMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>(subscriber => {
      let index = 0;
      let outerCompleted = false;
      let activeInnerSubscriptions = 0;

      const checkComplete = () => {
        if (outerCompleted && activeInnerSubscriptions === 0) {
          subscriber.complete();
        }
      };

      const outerSubscription = source.subscribe({
        next: value => {
          try {
            const innerObservable = project(value, index++);
            activeInnerSubscriptions++;

            const innerSubscription = innerObservable.subscribe({
              next: innerValue => subscriber.next(innerValue),
              error: err => subscriber.error(err),
              complete: () => {
                activeInnerSubscriptions--;
                checkComplete();
              }
            });

            outerSubscription.add(innerSubscription);
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => {
          outerCompleted = true;
          checkComplete();
        }
      });

      return outerSubscription;
    });
}

// Alias for mergeMap
export const flatMap = mergeMap;

/**
 * Map to inner Observable and switch to latest (cancel previous)
 */
export function switchMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>(subscriber => {
      let index = 0;
      let innerSubscription: any = null;

      const outerSubscription = source.subscribe({
        next: value => {
          try {
            // Cancel previous inner subscription
            if (innerSubscription) {
              innerSubscription.unsubscribe();
            }

            const innerObservable = project(value, index++);
            innerSubscription = innerObservable.subscribe({
              next: innerValue => subscriber.next(innerValue),
              error: err => subscriber.error(err),
              complete: () => {
                innerSubscription = null;
              }
            });
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => {
          if (!innerSubscription || innerSubscription.closed) {
            subscriber.complete();
          } else {
            // Wait for inner to complete
            const originalComplete = innerSubscription._observer?.complete;
            if (innerSubscription._observer) {
              innerSubscription._observer.complete = () => {
                if (originalComplete) originalComplete();
                subscriber.complete();
              };
            }
          }
        }
      });

      return () => {
        outerSubscription.unsubscribe();
        if (innerSubscription) {
          innerSubscription.unsubscribe();
        }
      };
    });
}

/**
 * Catch errors and continue with another Observable
 */
export function catchError<T, R>(
  selector: (err: any, caught: Observable<T>) => Observable<R>
): OperatorFunction<T, T | R> {
  return (source: Observable<T>) =>
    new Observable<T | R>(subscriber => {
      return source.subscribe({
        next: value => subscriber.next(value),
        error: err => {
          try {
            const result = selector(err, source);
            result.subscribe({
              next: value => subscriber.next(value),
              error: e => subscriber.error(e),
              complete: () => subscriber.complete()
            });
          } catch (e) {
            subscriber.error(e);
          }
        },
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Retry the Observable on error up to count times
 */
export function retry<T>(count = -1): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let retries = 0;

      const attemptSubscribe = () => {
        source.subscribe({
          next: value => subscriber.next(value),
          error: err => {
            if (count === -1 || retries < count) {
              retries++;
              attemptSubscribe();
            } else {
              subscriber.error(err);
            }
          },
          complete: () => subscriber.complete()
        });
      };

      attemptSubscribe();
    });
}

/**
 * Only emit when value changes from previous
 */
export function distinctUntilChanged<T>(
  compare?: (previous: T, current: T) => boolean
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let hasValue = false;
      let previousValue: T;

      return source.subscribe({
        next: value => {
          let shouldEmit = false;

          if (!hasValue) {
            hasValue = true;
            shouldEmit = true;
          } else {
            const isEqual = compare
              ? compare(previousValue, value)
              : previousValue === value;
            shouldEmit = !isEqual;
          }

          if (shouldEmit) {
            previousValue = value;
            subscriber.next(value);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Apply accumulator function over source values
 */
export function scan<T, R>(
  accumulator: (acc: R, value: T, index: number) => R,
  seed?: R
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>(subscriber => {
      let index = 0;
      let acc: R;
      let hasAcc = arguments.length >= 2;

      if (hasAcc) {
        acc = seed as R;
      }

      return source.subscribe({
        next: value => {
          try {
            if (!hasAcc) {
              acc = value as any;
              hasAcc = true;
              subscriber.next(acc);
            } else {
              acc = accumulator(acc, value, index++);
              subscriber.next(acc);
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    });
}

/**
 * Reduce values to a single value (emitted on complete)
 */
export function reduce<T, R>(
  accumulator: (acc: R, value: T, index: number) => R,
  seed?: R
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>(subscriber => {
      let index = 0;
      let acc: R;
      let hasAcc = arguments.length >= 2;

      if (hasAcc) {
        acc = seed as R;
      }

      return source.subscribe({
        next: value => {
          try {
            if (!hasAcc) {
              acc = value as any;
              hasAcc = true;
            } else {
              acc = accumulator(acc, value, index++);
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => {
          if (hasAcc) {
            subscriber.next(acc);
          }
          subscriber.complete();
        }
      });
    });
}

/**
 * Delay emissions by specified time
 */
export function delay<T>(delayTime: number): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      const timeouts: NodeJS.Timeout[] = [];

      const subscription = source.subscribe({
        next: value => {
          const timeoutId = setTimeout(() => {
            subscriber.next(value);
          }, delayTime);
          timeouts.push(timeoutId);
        },
        error: err => {
          timeouts.forEach(clearTimeout);
          subscriber.error(err);
        },
        complete: () => {
          setTimeout(() => {
            subscriber.complete();
          }, delayTime);
        }
      });

      return () => {
        timeouts.forEach(clearTimeout);
        subscription.unsubscribe();
      };
    });
}

/**
 * Emit only the first value (or first that passes predicate)
 */
export function first<T>(
  predicate?: (value: T, index: number) => boolean,
  defaultValue?: T
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let index = 0;
      let hasValue = false;

      const subscription = source.subscribe({
        next: value => {
          try {
            if (!predicate || predicate(value, index++)) {
              hasValue = true;
              subscriber.next(value);
              subscriber.complete();
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => {
          if (!hasValue) {
            if (defaultValue !== undefined) {
              subscriber.next(defaultValue);
            } else {
              subscriber.error(new Error('No value matching predicate'));
            }
          }
          subscriber.complete();
        }
      });

      return subscription;
    });
}

/**
 * Emit only the last value
 */
export function last<T>(
  predicate?: (value: T, index: number) => boolean,
  defaultValue?: T
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      let index = 0;
      let lastValue: T | undefined;
      let hasValue = false;

      return source.subscribe({
        next: value => {
          try {
            if (!predicate || predicate(value, index++)) {
              lastValue = value;
              hasValue = true;
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: err => subscriber.error(err),
        complete: () => {
          if (hasValue) {
            subscriber.next(lastValue as T);
          } else if (defaultValue !== undefined) {
            subscriber.next(defaultValue);
          } else {
            subscriber.error(new Error('No value matching predicate'));
          }
          subscriber.complete();
        }
      });
    });
}
