import { Action, Middleware, StoreEnhancer } from './types';
/**
 * Applies middleware to the store's dispatch function
 *
 * Middleware can intercept dispatched actions before they reach the reducer
 */
export declare function applyMiddleware<S, A extends Action = Action>(...middlewares: Middleware<S, A>[]): StoreEnhancer<S, A>;
/**
 * Composes functions from right to left
 *
 * For example: compose(f, g, h) returns (...args) => f(g(h(...args)))
 */
export declare function compose(...funcs: Function[]): any;
//# sourceMappingURL=applyMiddleware.d.ts.map