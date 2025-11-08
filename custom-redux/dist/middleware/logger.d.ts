import { Action, Middleware } from '../types';
/**
 * Logger middleware that logs actions and state changes
 *
 * Useful for debugging Redux state changes
 */
export declare function createLogger<S, A extends Action = Action>(): Middleware<S, A>;
/**
 * Default logger instance
 */
export declare const logger: Middleware<unknown, Action<any>>;
//# sourceMappingURL=logger.d.ts.map