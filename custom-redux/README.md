# Custom Redux

A from-scratch implementation of Redux state management in TypeScript, built to understand the core principles and architecture of Redux.

## Overview

This project implements the core Redux library with full TypeScript support, providing:

- **Single Source of Truth**: The entire application state is stored in a single store
- **State is Read-Only**: The only way to change state is to dispatch an action
- **Changes Made with Pure Functions**: Reducers are pure functions that specify how state changes

## Features

### Core Functionality

- ✅ **Store Creation**: `createStore()` with full state management
- ✅ **Actions**: Plain objects describing state changes
- ✅ **Reducers**: Pure functions that compute new state
- ✅ **Subscriptions**: Subscribe to state changes
- ✅ **Middleware Support**: Extensible middleware chain
- ✅ **Combine Reducers**: Compose multiple reducers
- ✅ **Reducer Replacement**: Hot module replacement support

### Built-in Middleware

- ✅ **Logger Middleware**: Logs actions and state changes for debugging
- ✅ **Thunk Middleware**: Enables async actions and conditional dispatching

### Type Safety

- Full TypeScript support with strict type checking
- Generic types for State and Actions
- Type inference for reducers and stores

## Installation

```bash
cd custom-redux
npm install
```

## Usage

### Basic Counter Example

```typescript
import { createStore, Reducer } from './src/index';

// Define action types
type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'ADD'; payload: number };

// Create a reducer
const counterReducer: Reducer<number, CounterAction> = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    case 'ADD':
      return state + action.payload;
    default:
      return state;
  }
};

// Create the store
const store = createStore(counterReducer, 0);

// Subscribe to changes
store.subscribe(() => {
  console.log('State changed:', store.getState());
});

// Dispatch actions
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'ADD', payload: 5 });
```

### Combining Reducers

```typescript
import { createStore, combineReducers, Reducer } from './src/index';

interface AppState {
  counter: number;
  user: { name: string };
}

const counterReducer: Reducer<number> = (state = 0, action) => {
  // ... reducer logic
  return state;
};

const userReducer: Reducer<{ name: string }> = (
  state = { name: '' },
  action
) => {
  // ... reducer logic
  return state;
};

const rootReducer = combineReducers<AppState>({
  counter: counterReducer,
  user: userReducer,
});

const store = createStore(rootReducer);
```

### Using Middleware

```typescript
import { createStore, applyMiddleware, logger, thunk } from './src/index';

// Create store with middleware
const store = createStore(
  reducer,
  initialState,
  applyMiddleware(logger, thunk)
);

// Dispatch a thunk (async action)
const fetchData = () => {
  return (dispatch, getState) => {
    dispatch({ type: 'FETCH_START' });

    setTimeout(() => {
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    }, 1000);
  };
};

store.dispatch(fetchData());
```

### Creating Custom Middleware

```typescript
import { Middleware } from './src/index';

const customMiddleware: Middleware = (store) => (next) => (action) => {
  console.log('Before action:', action);
  const result = next(action);
  console.log('After action:', store.getState());
  return result;
};

const store = createStore(reducer, applyMiddleware(customMiddleware));
```

## API Reference

### `createStore(reducer, [preloadedState], [enhancer])`

Creates a Redux store that holds the complete state tree.

**Parameters:**
- `reducer` (Reducer): A reducing function that returns the next state
- `preloadedState` (optional): The initial state
- `enhancer` (optional): Store enhancer (e.g., `applyMiddleware()`)

**Returns:** Store object with `dispatch`, `getState`, `subscribe`, and `replaceReducer`

### `combineReducers(reducers)`

Combines multiple reducers into a single reducing function.

**Parameters:**
- `reducers` (ReducersMapObject): An object with reducer functions

**Returns:** A reducer that invokes every reducer and constructs a state object

### `applyMiddleware(...middlewares)`

Creates a store enhancer that applies middleware to the dispatch function.

**Parameters:**
- `middlewares` (Middleware[]): Middleware functions to apply

**Returns:** A store enhancer

### Store Methods

#### `store.getState()`

Returns the current state tree.

#### `store.dispatch(action)`

Dispatches an action to trigger a state change.

**Parameters:**
- `action` (Action): A plain object describing the change

**Returns:** The dispatched action

#### `store.subscribe(listener)`

Adds a change listener that will be called whenever the state changes.

**Parameters:**
- `listener` (Function): Callback invoked on state changes

**Returns:** A function to unsubscribe the listener

#### `store.replaceReducer(nextReducer)`

Replaces the reducer currently used by the store.

**Parameters:**
- `nextReducer` (Reducer): The new reducer

## Middleware

### Logger Middleware

Logs every action and resulting state change to the console.

```typescript
import { logger } from './src/index';

const store = createStore(reducer, applyMiddleware(logger));
```

### Thunk Middleware

Allows you to write action creators that return functions instead of actions.

```typescript
import { thunk, ThunkAction } from './src/index';

const asyncAction: ThunkAction<AppState> = (dispatch, getState) => {
  // Can dispatch multiple actions
  dispatch({ type: 'START' });

  // Can access current state
  const state = getState();

  // Can be async
  setTimeout(() => {
    dispatch({ type: 'COMPLETE' });
  }, 1000);
};

const store = createStore(reducer, applyMiddleware(thunk));
store.dispatch(asyncAction);
```

## Building and Testing

### Build

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Run Examples

```bash
npm test
```

This runs the comprehensive example in `tests/example.ts` demonstrating all features.

## Architecture

### Core Concepts

1. **Store**: Holds the entire state tree
   - Single source of truth for application state
   - Provides `getState()`, `dispatch()`, `subscribe()`, `replaceReducer()`

2. **Actions**: Plain objects describing what happened
   - Must have a `type` property
   - Can include additional data in `payload`

3. **Reducers**: Pure functions `(state, action) => newState`
   - Must be pure (no side effects)
   - Must return new state objects (immutability)
   - Must handle unknown action types by returning current state

4. **Middleware**: Extends Redux with custom functionality
   - Can intercept dispatched actions
   - Can dispatch additional actions
   - Can access state via `getState()`

### Data Flow

```
Action dispatched
    ↓
Middleware chain (optional)
    ↓
Reducer computes new state
    ↓
Store updates state
    ↓
Subscribers notified
```

## Implementation Details

### Store Implementation

- Uses closure to maintain private state
- Implements listener pattern for subscriptions
- Guards against dispatching during reducer execution
- Handles listener mutations during dispatch

### Middleware Composition

- Uses function composition to chain middleware
- Each middleware can transform or pass through actions
- Middleware chain applied right-to-left

### Type Safety

- Generic types for State (`S`) and Actions (`A`)
- Type inference for reducer state
- Strict type checking with TypeScript

## Differences from Official Redux

This implementation follows Redux principles but includes some differences:

1. **Simplified API**: No `createAction`, `createSlice`, or Redux Toolkit features
2. **Basic Middleware**: Only logger and thunk provided (no saga, observable, etc.)
3. **No DevTools**: No Redux DevTools integration
4. **Educational Focus**: Code optimized for readability over performance

## Examples

See `tests/example.ts` for comprehensive examples including:

1. Basic counter with simple actions
2. Todo list with combined reducers
3. Async actions with thunk middleware
4. Middleware chain demonstration
5. Reducer replacement (HMR scenario)

## License

MIT

## Credits

Inspired by the official [Redux](https://redux.js.org/) library by Dan Abramov and the Redux team.
