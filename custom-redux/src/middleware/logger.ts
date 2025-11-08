import { Action, Middleware } from '../types';

/**
 * Logger middleware that logs actions and state changes
 *
 * Useful for debugging Redux state changes
 */
export function createLogger<S, A extends Action = Action>(): Middleware<S, A> {
  return (store) => (next) => (action) => {
    console.group(action.type);
    console.log('dispatching:', action);
    console.log('previous state:', store.getState());

    const result = next(action);

    console.log('next state:', store.getState());
    console.groupEnd();

    return result;
  };
}

/**
 * Default logger instance
 */
export const logger = createLogger();
