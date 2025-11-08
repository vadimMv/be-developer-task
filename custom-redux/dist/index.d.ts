/**
 * Custom Redux - A from-scratch Redux implementation in TypeScript
 *
 * Provides predictable state management with:
 * - Single source of truth (store)
 * - State is read-only (immutability)
 * - Changes are made with pure functions (reducers)
 */
export { createStore } from './Store';
export { combineReducers } from './combineReducers';
export { applyMiddleware, compose } from './applyMiddleware';
export { createLogger, logger } from './middleware/logger';
export { createThunkMiddleware, thunk } from './middleware/thunk';
export type { ThunkAction, ThunkDispatch } from './middleware/thunk';
export type { Action, ActionWithPayload, Reducer, Listener, Unsubscribe, Dispatch, MiddlewareAPI, Middleware, StoreEnhancer, StoreCreator, Store, StateFromReducer, ReducersMapObject, } from './types';
//# sourceMappingURL=index.d.ts.map