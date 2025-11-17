import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  run: (promise: Promise<T>) => Promise<T>;
  reset: () => void;
}

interface PendingTask<T> {
  id: number;
  promise: Promise<T>;
  cancel: () => void;
}

/**
 * Custom hook for handling async operations safely
 *
 * Features:
 * - Prevents state updates after component unmount
 * - Supports running multiple parallel tasks
 * - Promise cancellation pattern
 * - Manual reset capability
 * - Type-safe with TypeScript generics
 *
 * @returns Object with data, loading, error, run function, and reset function
 *
 * @example
 * const { run, data, loading, error } = useAsync();
 *
 * const fetchUser = () => {
 *   run(fetch('/api/user').then(r => r.json()));
 * };
 */
export function useAsync<T = unknown>(): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const pendingTasksRef = useRef<Map<number, PendingTask<T>>>(new Map());
  const taskIdCounterRef = useRef(0);

  // Track mount status to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel all pending tasks on unmount
      pendingTasksRef.current.forEach((task) => task.cancel());
      pendingTasksRef.current.clear();
    };
  }, []);

  // Safe state setter that only updates if component is mounted
  const safeSetState = useCallback((updater: Partial<UseAsyncState<T>>) => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, ...updater }));
    }
  }, []);

  // Run an async operation
  const run = useCallback(
    (promise: Promise<T>): Promise<T> => {
      // Create task ID
      const taskId = ++taskIdCounterRef.current;

      // Create cancellation flag
      let isCancelled = false;

      // Create cancellable promise wrapper
      const cancellablePromise = new Promise<T>((resolve, reject) => {
        promise
          .then((data) => {
            if (!isCancelled && isMountedRef.current) {
              resolve(data);
            }
          })
          .catch((error) => {
            if (!isCancelled && isMountedRef.current) {
              reject(error);
            }
          });
      });

      // Store task for potential cancellation
      pendingTasksRef.current.set(taskId, {
        id: taskId,
        promise: cancellablePromise,
        cancel: () => {
          isCancelled = true;
          pendingTasksRef.current.delete(taskId);
        },
      });

      // Set loading state
      safeSetState({ loading: true, error: null });

      // Handle promise resolution
      cancellablePromise
        .then((data) => {
          // Only update if not cancelled and still mounted
          if (!isCancelled && isMountedRef.current) {
            safeSetState({ data, loading: false, error: null });
            pendingTasksRef.current.delete(taskId);
          }
        })
        .catch((error) => {
          // Only update if not cancelled and still mounted
          if (!isCancelled && isMountedRef.current) {
            safeSetState({
              error: error instanceof Error ? error : new Error('An error occurred'),
              loading: false,
            });
            pendingTasksRef.current.delete(taskId);
          }
        });

      return cancellablePromise;
    },
    [safeSetState]
  );

  // Reset state to initial values
  const reset = useCallback(() => {
    // Cancel all pending tasks
    pendingTasksRef.current.forEach((task) => task.cancel());
    pendingTasksRef.current.clear();

    // Reset state
    safeSetState({ data: null, loading: false, error: null });
  }, [safeSetState]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    run,
    reset,
  };
}

/**
 * Hook for running an async function immediately on mount
 *
 * @param asyncFunction - Async function to run
 * @param deps - Dependency array (similar to useEffect)
 * @returns UseAsyncReturn object
 */
export function useAsyncEffect<T = unknown>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
): UseAsyncReturn<T> {
  const asyncState = useAsync<T>();

  useEffect(() => {
    asyncState.run(asyncFunction());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return asyncState;
}
