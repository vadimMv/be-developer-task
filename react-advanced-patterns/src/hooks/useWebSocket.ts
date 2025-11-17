import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketMessage {
  data: string;
  timestamp: number;
}

export interface UseWebSocketOptions {
  // Reconnection options
  reconnect?: boolean;
  reconnectAttempts?: number; // Max reconnect attempts (0 = infinite)
  reconnectInterval?: number; // Initial reconnect interval in ms
  maxReconnectInterval?: number; // Maximum reconnect interval in ms

  // Connection options
  protocols?: string | string[];

  // Event handlers
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export interface UseWebSocketReturn {
  send: (data: string | object) => void;
  messages: WebSocketMessage[];
  connected: boolean;
  connecting: boolean;
  error: Event | null;
  reconnectCount: number;
  clearMessages: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

/**
 * Custom hook for WebSocket connections with auto-reconnect
 *
 * Features:
 * - Exponential backoff reconnection strategy
 * - Message queue (messages sent while disconnected are queued and sent on reconnect)
 * - Automatic cleanup on unmount
 * - Connection state tracking
 * - Message history
 *
 * @param url - WebSocket server URL
 * @param options - Configuration options
 * @returns Object with send function, messages array, connection state, and control functions
 *
 * @example
 * const { send, messages, connected } = useWebSocket('ws://localhost:8080');
 *
 * // Send message
 * send({ type: 'chat', message: 'Hello!' });
 *
 * // Display messages
 * messages.map(msg => <div>{msg.data}</div>)
 */
export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    reconnect = true,
    reconnectAttempts = 0, // 0 means infinite
    reconnectInterval = 1000,
    maxReconnectInterval = 30000,
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options;

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<string[]>([]);
  const shouldReconnectRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);
  const unmountedRef = useRef(false);

  // Calculate reconnect delay with exponential backoff
  const getReconnectDelay = useCallback(
    (attemptCount: number): number => {
      const delay = Math.min(
        reconnectInterval * Math.pow(2, attemptCount),
        maxReconnectInterval
      );
      // Add jitter to prevent thundering herd
      return delay + Math.random() * 1000;
    },
    [reconnectInterval, maxReconnectInterval]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      setConnecting(true);
      setError(null);

      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;

      ws.onopen = (event) => {
        if (unmountedRef.current) return;

        setConnected(true);
        setConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        setReconnectCount(0);

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        }

        if (onOpen) {
          onOpen(event);
        }
      };

      ws.onclose = (event) => {
        if (unmountedRef.current) return;

        setConnected(false);
        setConnecting(false);
        wsRef.current = null;

        if (onClose) {
          onClose(event);
        }

        // Attempt reconnection if enabled and not manually disconnected
        if (reconnect && shouldReconnectRef.current) {
          const shouldAttemptReconnect =
            reconnectAttempts === 0 || reconnectAttemptsRef.current < reconnectAttempts;

          if (shouldAttemptReconnect) {
            const delay = getReconnectDelay(reconnectAttemptsRef.current);
            reconnectAttemptsRef.current++;
            setReconnectCount(reconnectAttemptsRef.current);

            reconnectTimeoutRef.current = setTimeout(() => {
              if (!unmountedRef.current && shouldReconnectRef.current) {
                connect();
              }
            }, delay);
          }
        }
      };

      ws.onerror = (event) => {
        if (unmountedRef.current) return;

        setError(event);
        setConnecting(false);

        if (onError) {
          onError(event);
        }
      };

      ws.onmessage = (event) => {
        if (unmountedRef.current) return;

        const message: WebSocketMessage = {
          data: event.data,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, message]);

        if (onMessage) {
          onMessage(message);
        }
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setConnecting(false);
    }
  }, [url, protocols, reconnect, reconnectAttempts, getReconnectDelay, onOpen, onClose, onError, onMessage]);

  // Send message
  const send = useCallback((data: string | object) => {
    const message = typeof data === 'string' ? data : JSON.stringify(data);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      // Queue message if not connected
      messageQueueRef.current.push(message);
    }
  }, []);

  // Clear message history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Manual disconnect
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
  }, []);

  // Manual reconnect
  const reconnectManually = useCallback(() => {
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    setReconnectCount(0);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    connect();
  }, [connect]);

  // Initial connection and cleanup
  useEffect(() => {
    unmountedRef.current = false;
    shouldReconnectRef.current = true;
    connect();

    return () => {
      unmountedRef.current = true;
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    send,
    messages,
    connected,
    connecting,
    error,
    reconnectCount,
    clearMessages,
    disconnect,
    reconnect: reconnectManually,
  };
}
