import { useState, useCallback, useRef } from 'react';

interface OptimisticUpdate<T> {
  id: string;
  optimisticData: T;
  originalData: T;
  rollback: () => void;
}

interface UseOptimisticUpdateReturn<T> {
  data: T;
  isPending: boolean;
  performUpdate: (
    optimisticData: T,
    asyncUpdate: () => Promise<T>
  ) => Promise<void>;
  rollback: () => void;
}

/**
 * Hook for optimistic UI updates
 *
 * Features:
 * - Updates UI instantly before server response
 * - Automatically rolls back on error
 * - Keeps server and client data in sync
 * - Supports multiple concurrent optimistic updates
 *
 * @param initialData - Initial data state
 * @returns Object with data, isPending flag, performUpdate function, and manual rollback
 *
 * @example
 * const { data, performUpdate } = useOptimisticUpdate(posts);
 *
 * const handleLike = (postId) => {
 *   const optimisticPost = { ...post, liked: true, likes: post.likes + 1 };
 *   performUpdate(optimisticPost, () => api.likePost(postId));
 * };
 */
export function useOptimisticUpdate<T>(
  initialData: T
): UseOptimisticUpdateReturn<T> {
  const [data, setData] = useState<T>(initialData);
  const [isPending, setIsPending] = useState(false);

  const updateQueueRef = useRef<OptimisticUpdate<T>[]>([]);
  const rollbackDataRef = useRef<T>(initialData);

  // Perform an optimistic update
  const performUpdate = useCallback(
    async (optimisticData: T, asyncUpdate: () => Promise<T>): Promise<void> => {
      // Store current data for potential rollback
      const originalData = data;
      rollbackDataRef.current = originalData;

      // Create update ID
      const updateId = `update-${Date.now()}-${Math.random()}`;

      // Apply optimistic update immediately
      setData(optimisticData);
      setIsPending(true);

      // Create rollback function
      const rollback = () => {
        setData(originalData);
        setIsPending(false);
        // Remove from queue
        updateQueueRef.current = updateQueueRef.current.filter((u) => u.id !== updateId);
      };

      // Add to update queue
      const update: OptimisticUpdate<T> = {
        id: updateId,
        optimisticData,
        originalData,
        rollback,
      };
      updateQueueRef.current.push(update);

      try {
        // Perform actual async update
        const serverData = await asyncUpdate();

        // Update with server response
        setData(serverData);
        setIsPending(false);

        // Remove from queue on success
        updateQueueRef.current = updateQueueRef.current.filter((u) => u.id !== updateId);
      } catch (error) {
        // Rollback on error
        console.error('Optimistic update failed, rolling back:', error);
        rollback();
        throw error;
      }
    },
    [data]
  );

  // Manual rollback function
  const rollback = useCallback(() => {
    if (updateQueueRef.current.length > 0) {
      // Rollback all pending updates
      updateQueueRef.current.forEach((update) => update.rollback());
      updateQueueRef.current = [];
    } else {
      // Rollback to last known good state
      setData(rollbackDataRef.current);
      setIsPending(false);
    }
  }, []);

  return {
    data,
    isPending,
    performUpdate,
    rollback,
  };
}

/**
 * Hook for optimistic list updates (common pattern)
 *
 * Provides convenient methods for add, update, delete operations on arrays
 *
 * @param initialList - Initial array data
 * @returns Object with list data and CRUD operations
 */
export function useOptimisticList<T extends { id: string | number }>(
  initialList: T[]
) {
  const { data, isPending, performUpdate, rollback } = useOptimisticUpdate(initialList);

  const addItem = useCallback(
    (item: T, asyncAdd: () => Promise<T[]>) => {
      const optimisticList = [...data, item];
      return performUpdate(optimisticList, asyncAdd);
    },
    [data, performUpdate]
  );

  const updateItem = useCallback(
    (id: string | number, updates: Partial<T>, asyncUpdate: () => Promise<T[]>) => {
      const optimisticList = data.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      return performUpdate(optimisticList, asyncUpdate);
    },
    [data, performUpdate]
  );

  const deleteItem = useCallback(
    (id: string | number, asyncDelete: () => Promise<T[]>) => {
      const optimisticList = data.filter((item) => item.id !== id);
      return performUpdate(optimisticList, asyncDelete);
    },
    [data, performUpdate]
  );

  return {
    list: data,
    isPending,
    addItem,
    updateItem,
    deleteItem,
    rollback,
  };
}
