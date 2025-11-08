"use strict";
/**
 * Custom Redux - A from-scratch Redux implementation in TypeScript
 *
 * Provides predictable state management with:
 * - Single source of truth (store)
 * - State is read-only (immutability)
 * - Changes are made with pure functions (reducers)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.thunk = exports.createThunkMiddleware = exports.logger = exports.createLogger = exports.compose = exports.applyMiddleware = exports.combineReducers = exports.createStore = void 0;
// Core functionality
var Store_1 = require("./Store");
Object.defineProperty(exports, "createStore", { enumerable: true, get: function () { return Store_1.createStore; } });
var combineReducers_1 = require("./combineReducers");
Object.defineProperty(exports, "combineReducers", { enumerable: true, get: function () { return combineReducers_1.combineReducers; } });
var applyMiddleware_1 = require("./applyMiddleware");
Object.defineProperty(exports, "applyMiddleware", { enumerable: true, get: function () { return applyMiddleware_1.applyMiddleware; } });
Object.defineProperty(exports, "compose", { enumerable: true, get: function () { return applyMiddleware_1.compose; } });
// Middleware
var logger_1 = require("./middleware/logger");
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return logger_1.createLogger; } });
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
var thunk_1 = require("./middleware/thunk");
Object.defineProperty(exports, "createThunkMiddleware", { enumerable: true, get: function () { return thunk_1.createThunkMiddleware; } });
Object.defineProperty(exports, "thunk", { enumerable: true, get: function () { return thunk_1.thunk; } });
//# sourceMappingURL=index.js.map