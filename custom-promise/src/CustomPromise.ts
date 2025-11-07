/**
 * Custom Promise Implementation
 * A from-scratch implementation of the Promise/A+ specification
 */

enum PromiseState {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}

type Executor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
) => void;

type OnFulfilled<T, TResult> = ((value: T) => TResult | PromiseLike<TResult>) | null;
type OnRejected<TResult> = ((reason: any) => TResult | PromiseLike<TResult>) | null;

interface PromiseHandler<T, TResult> {
  onFulfilled: OnFulfilled<T, TResult>;
  onRejected: OnRejected<TResult>;
  resolve: (value: TResult | PromiseLike<TResult>) => void;
  reject: (reason?: any) => void;
}

export class CustomPromise<T> {
  private state: PromiseState = PromiseState.PENDING;
  private value: T | undefined;
  private reason: any;
  private handlers: PromiseHandler<T, any>[] = [];

  constructor(executor: Executor<T>) {
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  private resolve(value: T | PromiseLike<T>): void {
    if (this.state !== PromiseState.PENDING) return;

    // Handle thenable values
    if (value && typeof value === 'object' && 'then' in value) {
      try {
        (value as PromiseLike<T>).then(
          this.resolve.bind(this),
          this.reject.bind(this)
        );
      } catch (error) {
        this.reject(error);
      }
      return;
    }

    this.state = PromiseState.FULFILLED;
    this.value = value as T;
    this.executeHandlers();
  }

  private reject(reason?: any): void {
    if (this.state !== PromiseState.PENDING) return;

    this.state = PromiseState.REJECTED;
    this.reason = reason;
    this.executeHandlers();
  }

  private executeHandlers(): void {
    if (this.state === PromiseState.PENDING) return;

    // Execute handlers asynchronously
    setTimeout(() => {
      this.handlers.forEach(handler => {
        if (this.state === PromiseState.FULFILLED) {
          this.handleFulfilled(handler);
        } else if (this.state === PromiseState.REJECTED) {
          this.handleRejected(handler);
        }
      });
      this.handlers = [];
    }, 0);
  }

  private handleFulfilled<TResult>(handler: PromiseHandler<T, TResult>): void {
    try {
      if (handler.onFulfilled) {
        const result = handler.onFulfilled(this.value as T);
        handler.resolve(result);
      } else {
        handler.resolve(this.value as any);
      }
    } catch (error) {
      handler.reject(error);
    }
  }

  private handleRejected<TResult>(handler: PromiseHandler<T, TResult>): void {
    try {
      if (handler.onRejected) {
        const result = handler.onRejected(this.reason);
        handler.resolve(result);
      } else {
        handler.reject(this.reason);
      }
    } catch (error) {
      handler.reject(error);
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: OnFulfilled<T, TResult1>,
    onRejected?: OnRejected<TResult2>
  ): CustomPromise<TResult1 | TResult2> {
    return new CustomPromise<TResult1 | TResult2>((resolve, reject) => {
      this.handlers.push({
        onFulfilled: onFulfilled || null,
        onRejected: onRejected || null,
        resolve,
        reject
      });

      this.executeHandlers();
    });
  }

  catch<TResult = never>(
    onRejected?: OnRejected<TResult>
  ): CustomPromise<T | TResult> {
    return this.then(null, onRejected);
  }

  finally(onFinally?: (() => void) | null): CustomPromise<T> {
    return this.then(
      value => {
        if (onFinally) onFinally();
        return value;
      },
      reason => {
        if (onFinally) onFinally();
        throw reason;
      }
    );
  }

  // Static methods

  static resolve<T>(value: T | PromiseLike<T>): CustomPromise<T> {
    if (value instanceof CustomPromise) {
      return value;
    }
    return new CustomPromise<T>((resolve) => resolve(value));
  }

  static reject<T = never>(reason?: any): CustomPromise<T> {
    return new CustomPromise<T>((_, reject) => reject(reason));
  }

  static all<T>(promises: Array<T | PromiseLike<T>>): CustomPromise<T[]> {
    return new CustomPromise<T[]>((resolve, reject) => {
      if (promises.length === 0) {
        resolve([]);
        return;
      }

      const results: T[] = [];
      let completedCount = 0;

      promises.forEach((promise, index) => {
        CustomPromise.resolve(promise)
          .then(value => {
            results[index] = value;
            completedCount++;

            if (completedCount === promises.length) {
              resolve(results);
            }
          })
          .catch(reject);
      });
    });
  }

  static race<T>(promises: Array<T | PromiseLike<T>>): CustomPromise<T> {
    return new CustomPromise<T>((resolve, reject) => {
      if (promises.length === 0) {
        return;
      }

      promises.forEach(promise => {
        CustomPromise.resolve(promise)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  static allSettled<T>(
    promises: Array<T | PromiseLike<T>>
  ): CustomPromise<Array<PromiseSettledResult<T>>> {
    return new CustomPromise<Array<PromiseSettledResult<T>>>((resolve) => {
      if (promises.length === 0) {
        resolve([]);
        return;
      }

      const results: Array<PromiseSettledResult<T>> = [];
      let completedCount = 0;

      promises.forEach((promise, index) => {
        CustomPromise.resolve(promise)
          .then(value => {
            results[index] = { status: 'fulfilled', value };
            completedCount++;

            if (completedCount === promises.length) {
              resolve(results);
            }
          })
          .catch(reason => {
            results[index] = { status: 'rejected', reason };
            completedCount++;

            if (completedCount === promises.length) {
              resolve(results);
            }
          });
      });
    });
  }

  static any<T>(promises: Array<T | PromiseLike<T>>): CustomPromise<T> {
    return new CustomPromise<T>((resolve, reject) => {
      if (promises.length === 0) {
        reject(new AggregateError([], 'All promises were rejected'));
        return;
      }

      const errors: any[] = [];
      let rejectedCount = 0;

      promises.forEach((promise, index) => {
        CustomPromise.resolve(promise)
          .then(resolve)
          .catch(reason => {
            errors[index] = reason;
            rejectedCount++;

            if (rejectedCount === promises.length) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          });
      });
    });
  }
}

// Type for settled results
type PromiseSettledResult<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: any };

// AggregateError polyfill if needed
class AggregateError extends Error {
  errors: any[];

  constructor(errors: any[], message?: string) {
    super(message);
    this.name = 'AggregateError';
    this.errors = errors;
  }
}
