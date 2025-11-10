/**
 * State machine type definition
 */
export type StateMachine<States extends string, Events extends string> = {
    states: States[];
    events: Events[];
    transitions: Record<States, Partial<Record<Events, States>>>;
    currentState: States;
};

/**
 * Finite State Machine (FSM) implementation with type safety
 * @template States - Union type of all possible state names
 * @template Events - Union type of all possible event names
 */
export class FSM<States extends string, Events extends string> {
    private currentState: States;

    /**
     * Create a new FSM instance
     * @param transitions - Transition map defining valid state transitions for each state
     * @param initialState - The initial state of the FSM
     */
    constructor(
        private transitions: Record<States, Partial<Record<Events, States>>>,
        initialState: States
    ) {
        this.currentState = initialState;
    }

    /**
     * Get the current state of the FSM
     * @returns The current state
     */
    getCurrentState(): States {
        return this.currentState;
    }

    /**
     * Attempt to transition to a new state based on an event
     * @param event - The event to trigger
     * @returns The new state if transition was successful, null otherwise
     */
    transition(event: Events): States | null {
        const currentStateTransitions = this.transitions[this.currentState];
        const nextState = currentStateTransitions?.[event];

        if (nextState === undefined) {
            return null;
        }

        this.currentState = nextState;
        return nextState;
    }

    /**
     * Check if a transition is valid from the current state
     * @param event - The event to check
     * @returns true if the transition is valid, false otherwise
     */
    canTransition(event: Events): boolean {
        const currentStateTransitions = this.transitions[this.currentState];
        return currentStateTransitions?.[event] !== undefined;
    }

    /**
     * Get all valid events from the current state
     * @returns Array of valid event names
     */
    getValidEvents(): Events[] {
        const currentStateTransitions = this.transitions[this.currentState];
        return Object.keys(currentStateTransitions || {}) as Events[];
    }

    /**
     * Reset the FSM to a specific state
     * @param state - The state to reset to
     */
    reset(state: States): void {
        this.currentState = state;
    }

    /**
     * Get the next state for a given event without transitioning
     * @param event - The event to check
     * @returns The next state if transition would be valid, null otherwise
     */
    peek(event: Events): States | null {
        const currentStateTransitions = this.transitions[this.currentState];
        return currentStateTransitions?.[event] ?? null;
    }

    /**
     * Get the complete transition map
     * @returns The transition map
     */
    getTransitions(): Record<States, Partial<Record<Events, States>>> {
        return this.transitions;
    }
}
