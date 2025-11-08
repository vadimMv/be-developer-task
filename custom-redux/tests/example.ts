/**
 * Comprehensive example demonstrating the Custom Redux implementation
 */

import {
  createStore,
  combineReducers,
  applyMiddleware,
  logger,
  thunk,
  Action,
  ActionWithPayload,
  Reducer,
  Store,
  ThunkAction,
} from '../src/index';

// ============================================================================
// Example 1: Basic Counter with Simple Actions
// ============================================================================

console.log('='.repeat(60));
console.log('Example 1: Basic Counter');
console.log('='.repeat(60));

// Define action types
type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'ADD'; payload: number };

// Action creators
const increment = (): CounterAction => ({ type: 'INCREMENT' });
const decrement = (): CounterAction => ({ type: 'DECREMENT' });
const add = (amount: number): CounterAction => ({ type: 'ADD', payload: amount });

// Reducer
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

// Create store
const counterStore = createStore(counterReducer, 0);

// Subscribe to changes
const unsubscribe = counterStore.subscribe(() => {
  console.log('Counter changed:', counterStore.getState());
});

// Dispatch actions
console.log('Initial state:', counterStore.getState());
counterStore.dispatch(increment());
counterStore.dispatch(increment());
counterStore.dispatch(add(5));
counterStore.dispatch(decrement());

unsubscribe();
console.log('Final state:', counterStore.getState());
console.log();

// ============================================================================
// Example 2: Todo List with Combined Reducers
// ============================================================================

console.log('='.repeat(60));
console.log('Example 2: Todo List with Combined Reducers');
console.log('='.repeat(60));

// Types
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  filter: 'ALL' | 'ACTIVE' | 'COMPLETED';
}

// Action types
type TodoAction =
  | { type: 'ADD_TODO'; payload: { id: number; text: string } }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'SET_FILTER'; payload: 'ALL' | 'ACTIVE' | 'COMPLETED' };

// Action creators
const addTodo = (id: number, text: string): TodoAction => ({
  type: 'ADD_TODO',
  payload: { id, text },
});

const toggleTodo = (id: number): TodoAction => ({
  type: 'TOGGLE_TODO',
  payload: id,
});

const setFilter = (filter: 'ALL' | 'ACTIVE' | 'COMPLETED'): TodoAction => ({
  type: 'SET_FILTER',
  payload: filter,
});

// Reducers
const todosReducer: Reducer<Todo[], TodoAction> = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.payload.id,
          text: action.payload.text,
          completed: false,
        },
      ];
    case 'TOGGLE_TODO':
      return state.map((todo) =>
        todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
      );
    default:
      return state;
  }
};

const filterReducer: Reducer<'ALL' | 'ACTIVE' | 'COMPLETED', TodoAction> = (
  state = 'ALL',
  action
) => {
  switch (action.type) {
    case 'SET_FILTER':
      return action.payload;
    default:
      return state;
  }
};

// Combine reducers
const rootReducer = combineReducers<TodoState, TodoAction>({
  todos: todosReducer,
  filter: filterReducer,
});

// Create store
const todoStore = createStore(rootReducer);

// Subscribe
todoStore.subscribe(() => {
  const state = todoStore.getState();
  console.log('Todo state updated:', JSON.stringify(state, null, 2));
});

// Dispatch actions
console.log('Adding todos...');
todoStore.dispatch(addTodo(1, 'Learn Redux'));
todoStore.dispatch(addTodo(2, 'Build an app'));
todoStore.dispatch(addTodo(3, 'Deploy to production'));

console.log('\nToggling todo #2...');
todoStore.dispatch(toggleTodo(2));

console.log('\nSetting filter to ACTIVE...');
todoStore.dispatch(setFilter('ACTIVE'));
console.log();

// ============================================================================
// Example 3: Async Actions with Thunk Middleware
// ============================================================================

console.log('='.repeat(60));
console.log('Example 3: Async Actions with Thunk Middleware');
console.log('='.repeat(60));

// Types
interface User {
  id: number;
  name: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

// Action types
type UserAction =
  | { type: 'FETCH_USERS_REQUEST' }
  | { type: 'FETCH_USERS_SUCCESS'; payload: User[] }
  | { type: 'FETCH_USERS_FAILURE'; payload: string };

// Action creators
const fetchUsersRequest = (): UserAction => ({ type: 'FETCH_USERS_REQUEST' });
const fetchUsersSuccess = (users: User[]): UserAction => ({
  type: 'FETCH_USERS_SUCCESS',
  payload: users,
});
const fetchUsersFailure = (error: string): UserAction => ({
  type: 'FETCH_USERS_FAILURE',
  payload: error,
});

// Async action creator (thunk)
const fetchUsers = (): ThunkAction<UserState, UserAction> => {
  return (dispatch, getState) => {
    dispatch(fetchUsersRequest());

    // Simulate API call
    setTimeout(() => {
      const mockUsers: User[] = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];

      dispatch(fetchUsersSuccess(mockUsers));
    }, 1000);
  };
};

// Reducer
const userReducer: Reducer<UserState, UserAction> = (
  state = { users: [], loading: false, error: null },
  action
) => {
  switch (action.type) {
    case 'FETCH_USERS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_USERS_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FETCH_USERS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Create store with thunk middleware
const userStore = createStore<UserState, UserAction>(userReducer, undefined, applyMiddleware(thunk) as any);

// Subscribe
userStore.subscribe(() => {
  const state = userStore.getState();
  console.log('User state:', {
    loading: state.loading,
    userCount: state.users.length,
    error: state.error,
  });
});

console.log('Fetching users asynchronously...');
userStore.dispatch(fetchUsers() as any);

// Wait for async action to complete
setTimeout(() => {
  console.log('Final users:', userStore.getState().users);
  console.log();

  // ============================================================================
  // Example 4: Middleware Chain with Logger
  // ============================================================================

  console.log('='.repeat(60));
  console.log('Example 4: Middleware Chain (Logger + Thunk)');
  console.log('='.repeat(60));

  // Create store with multiple middleware
  const enhancedStore = createStore<number, CounterAction>(
    counterReducer,
    0,
    applyMiddleware(logger, thunk) as any
  );

  console.log('Dispatching actions with logger middleware:');
  enhancedStore.dispatch(increment());
  enhancedStore.dispatch(add(10));
  console.log();

  // ============================================================================
  // Example 5: Store Replacement (Hot Module Replacement scenario)
  // ============================================================================

  console.log('='.repeat(60));
  console.log('Example 5: Reducer Replacement');
  console.log('='.repeat(60));

  const replaceStore = createStore(counterReducer, 5);
  console.log('Initial state:', replaceStore.getState());

  // Create a new reducer with different behavior
  const newCounterReducer: Reducer<number, CounterAction> = (state = 0, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return state + 2; // Now increments by 2!
      case 'DECREMENT':
        return state - 2; // Now decrements by 2!
      case 'ADD':
        return state + action.payload * 2; // Doubles the payload!
      default:
        return state;
    }
  };

  console.log('Replacing reducer with new implementation...');
  replaceStore.replaceReducer(newCounterReducer);

  replaceStore.dispatch(increment());
  console.log('After INCREMENT (now +2):', replaceStore.getState());

  replaceStore.dispatch(add(5));
  console.log('After ADD(5) (now +10):', replaceStore.getState());
  console.log();

  console.log('='.repeat(60));
  console.log('All examples completed successfully!');
  console.log('='.repeat(60));
}, 1500);
