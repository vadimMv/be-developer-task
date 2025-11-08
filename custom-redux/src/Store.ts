import { Action, Reducer, Listener, Unsubscribe, Store, Dispatch, StoreEnhancer } from './types';

/**
 * Action type for initializing the store
 */
const INIT_ACTION = '@@redux/INIT' as const;

/**
 * Action type for replacing the reducer
 */
const REPLACE_ACTION = '@@redux/REPLACE' as const;

/**
 * Creates a Redux store that holds the complete state tree
 *
 * The only way to change the state is to dispatch an action
 */
export function createStore<S, A extends Action = Action>(
  reducer: Reducer<S, A>,
  preloadedState?: S,
  enhancer?: StoreEnhancer<S, A>
): Store<S, A> {
  // If preloadedState is a function and enhancer is not provided,
  // treat preloadedState as enhancer
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState as unknown as StoreEnhancer<S, A>;
    preloadedState = undefined as any;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function');
  }

  let currentReducer = reducer;
  let currentState = preloadedState as S;
  let currentListeners: Listener[] = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  /**
   * Ensures that a change to the listeners during a dispatch
   * doesn't affect the current dispatch
   */
  function ensureCanMutateNextListeners(): void {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Returns the current state tree
   */
  function getState(): S {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
        'The reducer has already received the state as an argument. ' +
        'Pass it down from the top reducer instead of reading it from the store.'
      );
    }

    return currentState;
  }

  /**
   * Adds a change listener that will be called when state changes
   */
  function subscribe(listener: Listener): Unsubscribe {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function');
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
        'If you would like to be notified after the store has been updated, ' +
        'subscribe from a component and invoke store.getState() in the callback ' +
        'to access the latest state.'
      );
    }

    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing.'
        );
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = [];
    };
  }

  /**
   * Dispatches an action to trigger a state change
   */
  function dispatch(action: A): A {
    if (!action || typeof action !== 'object') {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      );
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      );
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    // Notify all listeners
    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store
   */
  function replaceReducer(nextReducer: Reducer<S, A>): void {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function');
    }

    currentReducer = nextReducer;
    dispatch({ type: REPLACE_ACTION } as A);
  }

  // Initialize the store state
  dispatch({ type: INIT_ACTION } as A);

  return {
    dispatch: dispatch as Dispatch<A>,
    subscribe,
    getState,
    replaceReducer,
  };
}
