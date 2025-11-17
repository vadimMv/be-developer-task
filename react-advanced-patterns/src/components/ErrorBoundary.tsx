import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  onRetry?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component that catches React render errors
 *
 * Features:
 * - Catches render errors in child components
 * - Provides a fallback UI
 * - Supports retry functionality
 * - Resets internal state on retry
 * - Optional error callback for logging
 *
 * Usage:
 * <ErrorBoundary fallback={<ErrorUI />} onRetry={resetApp}>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error information
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional retry callback
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleRetry);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '2rem',
            margin: '2rem',
            border: '2px solid #ef4444',
            borderRadius: '0.5rem',
            backgroundColor: '#fef2f2',
          }}
        >
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Oops! Something went wrong
          </h2>
          <details style={{ marginBottom: '1rem', color: '#991b1b' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
              Error details
            </summary>
            <pre
              style={{
                marginTop: '0.5rem',
                padding: '1rem',
                backgroundColor: '#fee2e2',
                borderRadius: '0.375rem',
                overflow: 'auto',
                fontSize: '0.875rem',
              }}
            >
              {this.state.error.toString()}
              {this.state.errorInfo && (
                <>
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </>
              )}
            </pre>
          </details>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    // Render children normally when there's no error
    return this.props.children;
  }
}
