package genericutils

import (
	"fmt"
	"sync"
)

// FSM (Finite State Machine) is a thread-safe state machine implementation
type FSM[State comparable, Event comparable] struct {
	mu           sync.RWMutex
	currentState State
	transitions  map[State]map[Event]State
}

// NewFSM creates a new finite state machine with the given transitions and initial state
func NewFSM[State comparable, Event comparable](
	transitions map[State]map[Event]State,
	initialState State,
) *FSM[State, Event] {
	return &FSM[State, Event]{
		currentState: initialState,
		transitions:  transitions,
	}
}

// GetCurrentState returns the current state of the FSM (thread-safe)
func (fsm *FSM[State, Event]) GetCurrentState() State {
	fsm.mu.RLock()
	defer fsm.mu.RUnlock()
	return fsm.currentState
}

// Transition attempts to transition to a new state based on an event
// Returns the new state and true if successful, current state and false otherwise
func (fsm *FSM[State, Event]) Transition(event Event) (State, bool) {
	fsm.mu.Lock()
	defer fsm.mu.Unlock()

	stateTransitions, exists := fsm.transitions[fsm.currentState]
	if !exists {
		return fsm.currentState, false
	}

	nextState, canTransition := stateTransitions[event]
	if !canTransition {
		return fsm.currentState, false
	}

	fsm.currentState = nextState
	return nextState, true
}

// CanTransition checks if a transition is valid from the current state (thread-safe)
func (fsm *FSM[State, Event]) CanTransition(event Event) bool {
	fsm.mu.RLock()
	defer fsm.mu.RUnlock()

	stateTransitions, exists := fsm.transitions[fsm.currentState]
	if !exists {
		return false
	}

	_, canTransition := stateTransitions[event]
	return canTransition
}

// GetValidEvents returns all valid events from the current state (thread-safe)
func (fsm *FSM[State, Event]) GetValidEvents() []Event {
	fsm.mu.RLock()
	defer fsm.mu.RUnlock()

	stateTransitions, exists := fsm.transitions[fsm.currentState]
	if !exists {
		return []Event{}
	}

	events := make([]Event, 0, len(stateTransitions))
	for event := range stateTransitions {
		events = append(events, event)
	}
	return events
}

// Reset resets the FSM to a specific state (thread-safe)
func (fsm *FSM[State, Event]) Reset(state State) {
	fsm.mu.Lock()
	defer fsm.mu.Unlock()
	fsm.currentState = state
}

// Peek returns the next state for a given event without transitioning (thread-safe)
func (fsm *FSM[State, Event]) Peek(event Event) (State, bool) {
	fsm.mu.RLock()
	defer fsm.mu.RUnlock()

	stateTransitions, exists := fsm.transitions[fsm.currentState]
	if !exists {
		var zero State
		return zero, false
	}

	nextState, canTransition := stateTransitions[event]
	return nextState, canTransition
}

// GetTransitions returns a copy of the transition map (thread-safe)
func (fsm *FSM[State, Event]) GetTransitions() map[State]map[Event]State {
	fsm.mu.RLock()
	defer fsm.mu.RUnlock()

	// Create a deep copy
	transitions := make(map[State]map[Event]State, len(fsm.transitions))
	for state, events := range fsm.transitions {
		transitions[state] = make(map[Event]State, len(events))
		for event, nextState := range events {
			transitions[state][event] = nextState
		}
	}
	return transitions
}

// String returns a string representation of the FSM
func (fsm *FSM[State, Event]) String() string {
	fsm.mu.RLock()
	defer fsm.mu.RUnlock()
	return fmt.Sprintf("FSM{currentState: %v, transitions: %v}", fsm.currentState, fsm.transitions)
}
