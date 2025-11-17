import React, {
  createContext,
  useContext,
  useRef,
  useMemo,
  useCallback,
  useSyncExternalStore,
  ReactNode,
} from 'react';

type Listener = () => void;

/**
 * Creates a context with selector functionality to prevent unnecessary re-renders
 *
 * This implementation uses useSyncExternalStore to efficiently track state changes
 * and only re-render components when their selected slice of state changes.
 *
 * Features:
 * - Components only re-render when their selected state changes
 * - Uses referential equality to determine if state changed
 * - Built on top of useSyncExternalStore for optimal performance
 *
 * @example
 * const ThemeContext = createContextSelector({ mode: 'light', color: 'blue' });
 *
 * // In provider
 * <ThemeContext.Provider value={themeState}>
 *   <App />
 * </ThemeContext.Provider>
 *
 * // In consumer - only re-renders when mode changes
 * const mode = ThemeContext.useSelector(s => s.mode);
 */
export function createContextSelector<State>(defaultValue: State) {
  type ContextValue = {
    state: State;
    listeners: Set<Listener>;
    subscribe: (listener: Listener) => () => void;
  };

  const Context = createContext<ContextValue | null>(null);

  interface ProviderProps {
    value: State;
    children: ReactNode;
  }

  function Provider({ value, children }: ProviderProps) {
    const stateRef = useRef(value);
    const listenersRef = useRef(new Set<Listener>());

    // Update state ref when value changes
    if (stateRef.current !== value) {
      stateRef.current = value;
      // Notify all listeners
      listenersRef.current.forEach((listener) => listener());
    }

    const subscribe = useCallback((listener: Listener) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    }, []);

    const contextValue = useMemo(
      () => ({
        state: stateRef.current,
        listeners: listenersRef.current,
        subscribe,
      }),
      [subscribe]
    );

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  }

  function useSelector<Selected>(selector: (state: State) => Selected): Selected {
    const context = useContext(Context);

    if (!context) {
      throw new Error('useSelector must be used within a Provider');
    }

    const selectorRef = useRef(selector);
    const selectedRef = useRef<Selected>();

    // Update selector ref
    selectorRef.current = selector;

    // Get current selected value
    const getSnapshot = useCallback(() => {
      const selected = selectorRef.current(context.state);
      // Only update if reference changed
      if (selectedRef.current !== selected) {
        selectedRef.current = selected;
      }
      return selectedRef.current as Selected;
    }, [context.state]);

    // Use useSyncExternalStore for efficient subscriptions
    const selected = useSyncExternalStore(
      context.subscribe,
      getSnapshot,
      getSnapshot
    );

    return selected;
  }

  function useValue(): State {
    const context = useContext(Context);

    if (!context) {
      throw new Error('useValue must be used within a Provider');
    }

    return context.state;
  }

  return {
    Provider,
    useSelector,
    useValue,
  };
}

// Example usage: Theme context
export interface ThemeState {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontSize: number;
}

export const ThemeContext = createContextSelector<ThemeState>({
  mode: 'light',
  primaryColor: '#3b82f6',
  fontSize: 16,
});
