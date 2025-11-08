import { Action, Reducer, ReducersMapObject } from './types';
/**
 * Combines multiple reducers into a single reducer function
 *
 * Each reducer manages its own slice of the state tree
 */
export declare function combineReducers<S, A extends Action = Action>(reducers: ReducersMapObject<S, A>): Reducer<S, A>;
//# sourceMappingURL=combineReducers.d.ts.map