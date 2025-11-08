import { Action, Reducer, Store, StoreEnhancer } from './types';
/**
 * Creates a Redux store that holds the complete state tree
 *
 * The only way to change the state is to dispatch an action
 */
export declare function createStore<S, A extends Action = Action>(reducer: Reducer<S, A>, preloadedState?: S, enhancer?: StoreEnhancer<S, A>): Store<S, A>;
//# sourceMappingURL=Store.d.ts.map