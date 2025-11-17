import React, { useState } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This is a simulated error!');
  }

  return (
    <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '0.375rem' }}>
      <p>Component is working correctly!</p>
    </div>
  );
}

export function ErrorBoundaryExample() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleThrowError = () => {
    setShouldThrow(true);
  };

  const handleRetry = () => {
    setShouldThrow(false);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>ErrorBoundary Component Example</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={handleThrowError}
          disabled={shouldThrow}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: shouldThrow ? '#9ca3af' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: shouldThrow ? 'not-allowed' : 'pointer',
            marginRight: '0.5rem',
          }}
        >
          Trigger Error
        </button>
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Retry count: {retryCount}
        </span>
      </div>

      <ErrorBoundary
        onRetry={handleRetry}
        onError={(error) => console.error('Caught error:', error)}
      >
        <BuggyComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}
