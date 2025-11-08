"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineReducers = combineReducers;
/**
 * Combines multiple reducers into a single reducer function
 *
 * Each reducer manages its own slice of the state tree
 */
function combineReducers(reducers) {
    const reducerKeys = Object.keys(reducers);
    const finalReducers = {};
    // Filter out non-function reducers
    for (let i = 0; i < reducerKeys.length; i++) {
        const key = reducerKeys[i];
        if (typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key];
        }
    }
    const finalReducerKeys = Object.keys(finalReducers);
    // Return the combined reducer function
    return function combination(state, action) {
        let hasChanged = false;
        const nextState = {};
        for (let i = 0; i < finalReducerKeys.length; i++) {
            const key = finalReducerKeys[i];
            const reducer = finalReducers[key];
            const previousStateForKey = state ? state[key] : undefined;
            const nextStateForKey = reducer(previousStateForKey, action);
            if (typeof nextStateForKey === 'undefined') {
                throw new Error(`Reducer "${String(key)}" returned undefined. ` +
                    'Reducers must return the current state for any unknown action type.');
            }
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state || {}).length;
        return hasChanged ? nextState : state;
    };
}
//# sourceMappingURL=combineReducers.js.map