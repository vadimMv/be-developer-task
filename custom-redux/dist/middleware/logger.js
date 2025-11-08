"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createLogger = createLogger;
/**
 * Logger middleware that logs actions and state changes
 *
 * Useful for debugging Redux state changes
 */
function createLogger() {
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
exports.logger = createLogger();
//# sourceMappingURL=logger.js.map