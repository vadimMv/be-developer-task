"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thunk = void 0;
exports.createThunkMiddleware = createThunkMiddleware;
/**
 * Thunk middleware allows you to dispatch functions instead of actions
 *
 * These functions receive dispatch and getState as arguments,
 * allowing for async action creators and conditional dispatching
 */
function createThunkMiddleware() {
    return (store) => (next) => (action) => {
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
exports.thunk = createThunkMiddleware();
//# sourceMappingURL=thunk.js.map