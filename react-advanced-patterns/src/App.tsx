import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Callback } from './components/Callback';
import { Dashboard } from './components/Dashboard';
import { Logout } from './components/Logout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TextFieldExample } from './examples/TextFieldExample';
import { VirtualListExample } from './examples/VirtualListExample';
import { ErrorBoundaryExample } from './examples/ErrorBoundaryExample';
import { ContextSelectorExample } from './examples/ContextSelectorExample';
import { DynamicFormExample } from './examples/DynamicFormExample';
import { AsyncExample } from './examples/AsyncExample';
import { OptimisticUpdateExample } from './examples/OptimisticUpdateExample';
import { WebSocketExample } from './examples/WebSocketExample';

type ExampleKey =
  | 'textfield'
  | 'virtuallist'
  | 'errorboundary'
  | 'contextselector'
  | 'dynamicform'
  | 'async'
  | 'optimistic'
  | 'websocket';

interface Example {
  key: ExampleKey;
  title: string;
  component: React.ComponentType;
}

const examples: Example[] = [
  { key: 'textfield', title: '1. TextField (Controlled/Uncontrolled)', component: TextFieldExample },
  { key: 'virtuallist', title: '2. VirtualList (Windowing)', component: VirtualListExample },
  { key: 'errorboundary', title: '3. ErrorBoundary (Auto-Retry)', component: ErrorBoundaryExample },
  { key: 'contextselector', title: '4. Context Selector (Memoization)', component: ContextSelectorExample },
  { key: 'dynamicform', title: '5. Dynamic Form Engine', component: DynamicFormExample },
  { key: 'async', title: '6. useAsync Hook', component: AsyncExample },
  { key: 'optimistic', title: '7. Optimistic UI Updates', component: OptimisticUpdateExample },
  { key: 'websocket', title: '8. WebSocket with Auto-Reconnect', component: WebSocketExample },
];

/**
 * Examples Page Component (Protected)
 */
const ExamplesPage: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<ExampleKey>('textfield');
  const CurrentExample = examples.find((ex) => ex.key === selectedExample)?.component;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <nav
        style={{
          width: '300px',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '2rem 1rem',
          overflowY: 'auto',
        }}
      >
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>React Advanced Patterns</h1>
        <p style={{ marginBottom: '2rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          TypeScript Implementation
        </p>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {examples.map((example) => (
            <li key={example.key} style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={() => setSelectedExample(example.key)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  backgroundColor: selectedExample === example.key ? '#3b82f6' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedExample !== example.key) {
                    e.currentTarget.style.backgroundColor = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedExample !== example.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {example.title}
              </button>
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#374151',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>About</p>
          <p style={{ color: '#9ca3af', lineHeight: 1.5 }}>
            Comprehensive implementation of advanced React patterns including controlled/uncontrolled
            components, hooks, context optimization, and more.
          </p>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'block',
              padding: '0.75rem 1rem',
              backgroundColor: '#374151',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          overflowY: 'auto',
        }}
      >
        {CurrentExample && <CurrentExample />}
      </main>
    </div>
  );
};

/**
 * Main App Component with Routing
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<Callback />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/examples"
            element={
              <ProtectedRoute>
                <ExamplesPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
