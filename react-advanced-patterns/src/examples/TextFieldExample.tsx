import React, { useState, useRef } from 'react';
import { TextField } from '../components/TextField';

export function TextFieldExample() {
  // Controlled mode
  const [controlledValue, setControlledValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  // Uncontrolled mode
  const uncontrolledRef = useRef<HTMLInputElement>(null);

  const handleGetUncontrolledValue = () => {
    if (uncontrolledRef.current) {
      alert(`Uncontrolled value: ${uncontrolledRef.current.value}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>TextField Component Examples</h2>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Controlled Mode</h3>
        <TextField
          label="Controlled Input"
          value={controlledValue}
          onChange={(value) => setControlledValue(value)}
          placeholder="Type something..."
        />
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Current value: {controlledValue}
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Uncontrolled Mode with Ref</h3>
        <TextField
          ref={uncontrolledRef}
          label="Uncontrolled Input"
          defaultValue="Default value"
          placeholder="Type something..."
        />
        <button
          onClick={handleGetUncontrolledValue}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Get Value via Ref
        </button>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Debounced onChange (300ms)</h3>
        <TextField
          label="Search"
          defaultValue=""
          onDebouncedChange={setDebouncedValue}
          placeholder="Type to search..."
        />
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Debounced value (updates after 300ms): {debouncedValue}
        </p>
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem' }}>With Validation Error</h3>
        <TextField
          label="Email"
          type="email"
          error="Please enter a valid email address"
          placeholder="user@example.com"
        />
      </section>
    </div>
  );
}
