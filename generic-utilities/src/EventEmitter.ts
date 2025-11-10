/**
 * Event map interface that defines event names and their argument types
 */
export interface EventMap {
    [key: string]: any[];
}

/**
 * Type-safe Event Emitter that enforces event argument types
 * @template T - Event map defining event names and their argument types
 */
export class TypedEventEmitter<T extends EventMap> {
    private listeners: Map<keyof T, Set<(...args: any[]) => void>> = new Map();

    /**
     * Register an event listener
     * @param event - Event name
     * @param listener - Callback function to be called when the event is emitted
     */
    on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);
    }

    /**
     * Emit an event with arguments
     * @param event - Event name
     * @param args - Arguments to pass to the listeners
     */
    emit<K extends keyof T>(event: K, ...args: T[K]): void {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners) {
            return;
        }

        for (const listener of eventListeners) {
            listener(...args);
        }
    }

    /**
     * Remove an event listener
     * @param event - Event name
     * @param listener - Callback function to remove
     */
    off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners) {
            return;
        }

        eventListeners.delete(listener);

        // Clean up empty listener sets
        if (eventListeners.size === 0) {
            this.listeners.delete(event);
        }
    }

    /**
     * Register a one-time event listener
     * @param event - Event name
     * @param listener - Callback function to be called once when the event is emitted
     */
    once<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
        const onceWrapper = (...args: T[K]) => {
            listener(...args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }

    /**
     * Remove all listeners for a specific event or all events
     * @param event - Event name (optional)
     */
    removeAllListeners<K extends keyof T>(event?: K): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get the number of listeners for a specific event
     * @param event - Event name
     * @returns Number of listeners
     */
    listenerCount<K extends keyof T>(event: K): number {
        return this.listeners.get(event)?.size ?? 0;
    }
}
