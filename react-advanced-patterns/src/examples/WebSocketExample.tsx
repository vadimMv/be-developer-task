import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export function WebSocketExample() {
  const [message, setMessage] = useState('');
  const [wsUrl, setWsUrl] = useState('wss://echo.websocket.org');

  const { send, messages, connected, connecting, reconnectCount, clearMessages, disconnect, reconnect } =
    useWebSocket(wsUrl, {
      reconnect: true,
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      onOpen: () => console.log('WebSocket connected'),
      onClose: () => console.log('WebSocket disconnected'),
      onError: (error) => console.error('WebSocket error:', error),
    });

  const handleSendMessage = () => {
    if (message.trim()) {
      send(message);
      setMessage('');
    }
  };

  const getConnectionStatus = () => {
    if (connecting) return { text: 'Connecting...', color: '#f59e0b' };
    if (connected) return { text: 'Connected', color: '#10b981' };
    return { text: 'Disconnected', color: '#ef4444' };
  };

  const status = getConnectionStatus();

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>WebSocket Hook Example</h2>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        Real-time WebSocket connection with auto-reconnect. Uses echo.websocket.org for testing.
      </p>

      <div
        style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.375rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: status.color,
              marginRight: '0.5rem',
            }}
          />
          <strong>Status:</strong> {status.text}
          {reconnectCount > 0 && (
            <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
              (Reconnect attempts: {reconnectCount})
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={reconnect}
            disabled={connecting || connected}
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: connecting || connected ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: connecting || connected ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Reconnect
          </button>
          <button
            onClick={disconnect}
            disabled={!connected && !connecting}
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: !connected && !connecting ? '#9ca3af' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: !connected && !connecting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Disconnect
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          WebSocket URL
        </label>
        <input
          type="text"
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            marginBottom: '0.25rem',
          }}
        />
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Change URL and reconnect to test different servers
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          Send Message
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            disabled={!connected}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!connected || !message.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: !connected || !message.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: !connected || !message.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <label style={{ fontWeight: 500 }}>Messages ({messages.length})</label>
          <button
            onClick={clearMessages}
            disabled={messages.length === 0}
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: messages.length === 0 ? '#9ca3af' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Clear
          </button>
        </div>
        <div
          style={{
            height: '300px',
            overflow: 'auto',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
          }}
        >
          {messages.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', paddingTop: '2rem' }}>
              No messages yet. Send a message to see it echoed back.
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <div>{msg.data}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Features:</p>
        <ul style={{ marginLeft: '1.5rem', color: '#6b7280' }}>
          <li>Exponential backoff reconnection strategy</li>
          <li>Message queue (messages sent while disconnected are queued)</li>
          <li>Automatic cleanup on unmount</li>
          <li>Connection state tracking</li>
          <li>Manual reconnect/disconnect controls</li>
        </ul>
      </div>
    </div>
  );
}
