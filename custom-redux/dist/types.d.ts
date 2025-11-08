/**
 * Core Redux type definitions
 */
/**
 * Action represents a plain object describing a state change
 */
export interface Action<T = any> {
    type: T;
}
/**
 * ActionWithPayload extends Action to include data
 */
export interface ActionWithPayload<T = any, P = any> extends Action<T> {
    payload: P;
}
/**
 * Reducer function that takes the current state and an action,
 * and returns the new state
 */
export type Reducer<S = any, A extends Action = Action> = (state: S | undefined, action: A) => S;
/**
 * Listener function called when state changes
 */
export type Listener = () => void;
/**
 * Unsubscribe function to remove a listener
 */
export type Unsubscribe = () => void;
/**
 * Dispatch function to send actions to the store
 */
export interface Dispatch<A extends Action = Action> {
    <T extends A>(action: T): T;
}
/**
 * Middleware function signature
 * Middleware has access to the store's dispatch and getState
 */
export interface MiddlewareAPI<S = any, A extends Action = Action> {
    dispatch: Dispatch<A>;
    getState(): S;
}
export type Middleware<S = any, A extends Action = Action> = (api: MiddlewareAPI<S, A>) => (next: Dispatch<A>) => (action: A) => A;
/**
 * Store enhancer function
 */
export type StoreEnhancer<S = any, A extends Action = Action> = (createStore: StoreCreator<S, A>) => StoreCreator<S, A>;
/**
 * Store creator function
 */
export type StoreCreator<S = any, A extends Action = Action> = (reducer: Reducer<S, A>, preloadedState?: S) => Store<S, A>;
/**
 * Main Store interface
 */
export interface Store<S = any, A extends Action = Action> {
    /**
     * Dispatches an action to update state
     */
    dispatch: Dispatch<A>;
    /**
     * Returns the current state
     */
    getState(): S;
    /**
     * Subscribes to state changes
     */
    subscribe(listener: Listener): Unsubscribe;
    /**
     * Replaces the reducer currently used by the store
     */
    replaceReducer(nextReducer: Reducer<S, A>): void;
}
/**
 * Helper type for extracting state type from a reducer
 */
export type StateFromReducer<R> = R extends Reducer<infer S, any> ? S : never;
/**
 * Helper type for a map of reducers
 */
export type ReducersMapObject<S = any, A extends Action = Action> = {
    [K in keyof S]: Reducer<S[K], A>;
};
//# sourceMappingURL=types.d.ts.map