import React from 'react';
import { useAsync } from '../hooks/useAsync';

// Simulate API call
const fetchUserData = (userId: number): Promise<{ id: number; name: string; email: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve({
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
        });
      } else {
        reject(new Error('Failed to fetch user data'));
      }
    }, 1500);
  });
};

export function AsyncExample() {
  const { run, data, loading, error, reset } = useAsync<{
    id: number;
    name: string;
    email: string;
  }>();

  const handleFetchUser = () => {
    const userId = Math.floor(Math.random() * 100) + 1;
    run(fetchUserData(userId));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>useAsync Hook Example</h2>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        Safe async state management with automatic cleanup and cancellation.
      </p>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleFetchUser}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Fetch User Data'}
        </button>
        <button
          onClick={reset}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {loading && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#dbeafe',
            borderRadius: '0.375rem',
          }}
        >
          Loading user data...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderRadius: '0.375rem',
            color: '#dc2626',
          }}
        >
          Error: {error.message}
        </div>
      )}

      {data && !loading && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            borderRadius: '0.375rem',
          }}
        >
          <h3 style={{ marginBottom: '0.5rem' }}>User Data</h3>
          <p>
            <strong>ID:</strong> {data.id}
          </p>
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Email:</strong> {data.email}
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Features:</p>
        <ul style={{ marginLeft: '1.5rem', color: '#6b7280' }}>
          <li>Prevents state updates after unmount</li>
          <li>Supports promise cancellation</li>
          <li>Handles loading, error, and success states</li>
          <li>30% chance of simulated error for testing</li>
        </ul>
      </div>
    </div>
  );
}
