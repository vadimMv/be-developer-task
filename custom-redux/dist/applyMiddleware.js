"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMiddleware = applyMiddleware;
exports.compose = compose;
/**
 * Applies middleware to the store's dispatch function
 *
 * Middleware can intercept dispatched actions before they reach the reducer
 */
function applyMiddleware(...middlewares) {
    return (createStore) => (reducer, preloadedState) => {
        const store = createStore(reducer, preloadedState);
        let dispatch = () => {
            throw new Error('Dispatching while constructing your middleware is not allowed. ' +
                'Other middleware would not be applied to this dispatch.');
        };
        const middlewareAPI = {
            getState: store.getState,
            dispatch: (action) => dispatch(action),
        };
        // Apply each middleware
        const chain = middlewares.map((middleware) => middleware(middlewareAPI));
        // Compose the middleware chain
        dispatch = compose(...chain)(store.dispatch);
        return {
            ...store,
            dispatch: dispatch,
        };
    };
}
/**
 * Composes functions from right to left
 *
 * For example: compose(f, g, h) returns (...args) => f(g(h(...args)))
 */
function compose(...funcs) {
    if (funcs.length === 0) {
        return (arg) => arg;
    }
    if (funcs.length === 1) {
        return funcs[0];
    }
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
//# sourceMappingURL=applyMiddleware.js.map