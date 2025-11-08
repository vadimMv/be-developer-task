import { Action, Middleware, Dispatch } from '../types';
/**
 * Thunk action - a function that can dispatch actions and access state
 */
export type ThunkAction<S, A extends Action = Action, R = void> = (dispatch: Dispatch<A>, getState: () => S) => R;
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
export declare function createThunkMiddleware<S, A extends Action = Action>(): Middleware<S, A>;
/**
 * Default thunk instance
 */
export declare const thunk: Middleware<unknown, Action<any>>;
//# sourceMappingURL=thunk.d.ts.map