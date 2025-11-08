import { Action, Middleware, StoreEnhancer, Dispatch, Store } from './types';

/**
 * Applies middleware to the store's dispatch function
 *
 * Middleware can intercept dispatched actions before they reach the reducer
 */
export function applyMiddleware<S, A extends Action = Action>(
  ...middlewares: Middleware<S, A>[]
): StoreEnhancer<S, A> {
  return (createStore) => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch: any = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
        'Other middleware would not be applied to this dispatch.'
      );
    };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action: A) => dispatch(action),
    };

    // Apply each middleware
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));

    // Compose the middleware chain
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch: dispatch as Dispatch<A>,
    };
  };
}

/**
 * Composes functions from right to left
 *
 * For example: compose(f, g, h) returns (...args) => f(g(h(...args)))
 */
export function compose(...funcs: Function[]): any {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) => (...args: any[]) => a(b(...args))
  );
}
