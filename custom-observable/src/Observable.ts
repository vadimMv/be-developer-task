/**
 * Custom Observable Implementation
 * A from-scratch implementation of Observable pattern similar to RxJS
 */

/**
 * Observer interface - defines how to handle values emitted by Observable
 */
export interface Observer<T> {
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

/**
 * Subscription - represents a disposable resource
 * Can be unsubscribed to stop receiving values
 */
export class Subscription {
  private _unsubscribed = false;
  private _teardownLogic: (() => void) | null = null;

  constructor(teardown?: () => void) {
    if (teardown) {
      this._teardownLogic = teardown;
    }
  }

  unsubscribe(): void {
    if (this._unsubscribed) return;

    this._unsubscribed = true;
    if (this._teardownLogic) {
      this._teardownLogic();
    }
  }

  get closed(): boolean {
    return this._unsubscribed;
  }

  add(teardown: Subscription | (() => void)): void {
    if (this._unsubscribed) return;

    const oldTeardown = this._teardownLogic;

    if (teardown instanceof Subscription) {
      this._teardownLogic = () => {
        if (oldTeardown) oldTeardown();
        teardown.unsubscribe();
      };
    } else {
      this._teardownLogic = () => {
        if (oldTeardown) oldTeardown();
        teardown();
      };
    }
  }
}

/**
 * Subscriber - wraps an Observer and manages subscription state
 */
class Subscriber<T> implements Observer<T> {
  private _subscription: Subscription;
  private _observer: Observer<T>;
  private _closed = false;

  constructor(observer: Observer<T>, subscription: Subscription) {
    this._observer = observer;
    this._subscription = subscription;
  }

  next(value: T): void {
    if (this._closed || this._subscription.closed) return;

    if (this._observer.next) {
      try {
        this._observer.next(value);
      } catch (error) {
        this.error(error);
      }
    }
  }

  error(err: any): void {
    if (this._closed || this._subscription.closed) return;

    this._closed = true;

    if (this._observer.error) {
      try {
        this._observer.error(err);
      } catch (error) {
        console.error('Error in error handler:', error);
      }
    } else {
      console.error('Unhandled Observable error:', err);
    }

    this._subscription.unsubscribe();
  }

  complete(): void {
    if (this._closed || this._subscription.closed) return;

    this._closed = true;

    if (this._observer.complete) {
      try {
        this._observer.complete();
      } catch (error) {
        console.error('Error in complete handler:', error);
      }
    }

    this._subscription.unsubscribe();
  }

  get closed(): boolean {
    return this._closed || this._subscription.closed;
  }
}

/**
 * SubscriberFunction type - the function passed to Observable constructor
 */
type SubscriberFunction<T> = (subscriber: Subscriber<T>) => void | (() => void);

/**
 * Observable class - represents a stream of values over time
 */
export class Observable<T> {
  private _subscribe: SubscriberFunction<T>;

  constructor(subscribe: SubscriberFunction<T>) {
    this._subscribe = subscribe;
  }

  /**
   * Subscribe to the Observable with an Observer
   */
  subscribe(observer: Observer<T>): Subscription;
  subscribe(
    next?: (value: T) => void,
    error?: (err: any) => void,
    complete?: () => void
  ): Subscription;
  subscribe(
    observerOrNext?: Observer<T> | ((value: T) => void),
    error?: (err: any) => void,
    complete?: () => void
  ): Subscription {
    // Normalize arguments to Observer
    const observer: Observer<T> =
      typeof observerOrNext === 'function'
        ? { next: observerOrNext, error, complete }
        : observerOrNext || {};

    const subscription = new Subscription();
    const subscriber = new Subscriber(observer, subscription);

    try {
      const teardown = this._subscribe(subscriber);
      if (teardown) {
        subscription.add(teardown);
      }
    } catch (err) {
      subscriber.error(err);
    }

    return subscription;
  }

  /**
   * Pipe operators together to transform the Observable
   */
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  pipe<A, B>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>
  ): Observable<B>;
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;
  pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
    return operations.reduce(
      (prev, fn) => fn(prev),
      this as Observable<any>
    );
  }

  // Static creation methods

  /**
   * Create an Observable that emits values from an array
   */
  static of<T>(...values: T[]): Observable<T> {
    return new Observable<T>(subscriber => {
      for (const value of values) {
        if (subscriber.closed) break;
        subscriber.next(value);
      }
      subscriber.complete();
    });
  }

  /**
   * Create an Observable from an array, iterable, or Promise
   */
  static from<T>(input: T[] | Iterable<T> | PromiseLike<T>): Observable<T> {
    if (Array.isArray(input) || (input as any)[Symbol.iterator]) {
      return new Observable<T>(subscriber => {
        const iterable = Array.isArray(input) ? input : Array.from(input as Iterable<T>);
        for (const value of iterable) {
          if (subscriber.closed) break;
          subscriber.next(value);
        }
        subscriber.complete();
      });
    }

    if (input && typeof (input as any).then === 'function') {
      return new Observable<T>(subscriber => {
        (input as PromiseLike<T>).then(
          value => {
            if (!subscriber.closed) {
              subscriber.next(value);
              subscriber.complete();
            }
          },
          err => {
            if (!subscriber.closed) {
              subscriber.error(err);
            }
          }
        );
      });
    }

    throw new TypeError('Input must be an array, iterable, or Promise');
  }

  /**
   * Create an Observable that emits values in a sequence
   */
  static range(start: number, count: number): Observable<number> {
    return new Observable<number>(subscriber => {
      for (let i = 0; i < count; i++) {
        if (subscriber.closed) break;
        subscriber.next(start + i);
      }
      subscriber.complete();
    });
  }

  /**
   * Create an Observable that emits sequential numbers at a specified interval
   */
  static interval(period: number): Observable<number> {
    return new Observable<number>(subscriber => {
      let count = 0;
      const intervalId = setInterval(() => {
        if (subscriber.closed) {
          clearInterval(intervalId);
          return;
        }
        subscriber.next(count++);
      }, period);

      return () => clearInterval(intervalId);
    });
  }

  /**
   * Create an Observable that emits a value after a delay
   */
  static timer(delay: number, period?: number): Observable<number> {
    return new Observable<number>(subscriber => {
      let count = 0;
      let intervalId: NodeJS.Timeout | null = null;

      const timeoutId = setTimeout(() => {
        if (subscriber.closed) return;

        subscriber.next(count++);

        if (period !== undefined) {
          intervalId = setInterval(() => {
            if (subscriber.closed) {
              if (intervalId) clearInterval(intervalId);
              return;
            }
            subscriber.next(count++);
          }, period);
        } else {
          subscriber.complete();
        }
      }, delay);

      return () => {
        clearTimeout(timeoutId);
        if (intervalId) clearInterval(intervalId);
      };
    });
  }

  /**
   * Create an Observable that never emits and never completes
   */
  static never<T>(): Observable<T> {
    return new Observable<T>(() => {
      // Do nothing
    });
  }

  /**
   * Create an Observable that emits no values and completes immediately
   */
  static empty<T>(): Observable<T> {
    return new Observable<T>(subscriber => {
      subscriber.complete();
    });
  }

  /**
   * Create an Observable that emits an error
   */
  static throwError<T>(error: any): Observable<T> {
    return new Observable<T>(subscriber => {
      subscriber.error(error);
    });
  }
}

/**
 * OperatorFunction type - transforms one Observable into another
 */
export type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;
