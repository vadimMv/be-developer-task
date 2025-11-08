import { Action, Middleware, Dispatch } from '../types';

/**
 * Thunk action - a function that can dispatch actions and access state
 */
export type ThunkAction<S, A extends Action = Action, R = void> = (
  dispatch: Dispatch<A>,
  getState: () => S
) => R;

/**
 * Extended dispatch that can handle both actions and thunks
 */
export interface ThunkDispatch<S, A extends Action = Action> {
  <T extends A>(action: T): T;
  <R>(thunk: ThunkAction<S, A, R>): R;
}

/**
 * Thunk middleware allows you to dispatch functions instead of actions
 *
 * These functions receive dispatch and getState as arguments,
 * allowing for async action creators and conditional dispatching
 */
export function createThunkMiddleware<S, A extends Action = Action>(): Middleware<S, A> {
  return (store) => (next) => (action: any) => {
    // If action is a function, call it with dispatch and getState
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState);
    }

    // Otherwise, pass the action through
    return next(action);
  };
}

/**
 * Default thunk instance
 */
export const thunk = createThunkMiddleware();
