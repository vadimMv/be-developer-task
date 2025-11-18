/**
 * Logout Component
 *
 * Handles user logout from both the application and the identity provider.
 * Can be used as a standalone page or as a button component.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Logout Component Props
 */
interface LogoutProps {
  /**
   * If true, renders as a button. Otherwise, auto-triggers logout on mount.
   */
  asButton?: boolean;
  /**
   * Custom button text
   */
  buttonText?: string;
  /**
   * Custom button styles
   */
  buttonStyle?: React.CSSProperties;
  /**
   * Callback after successful logout
   */
  onLogoutComplete?: () => void;
  /**
   * Return URL after logout (defaults to /login)
   */
  returnTo?: string;
  /**
   * Whether to perform federated logout (sign out from IdP)
   */
  federated?: boolean;
}

/**
 * Logout Component
 */
export const Logout: React.FC<LogoutProps> = ({
  asButton = false,
  buttonText = 'Sign Out',
  buttonStyle,
  onLogoutComplete,
  returnTo = '/login',
  federated = true,
}) => {
  const { logout, state } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);

      await logout({
        returnTo: `${window.location.origin}${returnTo}`,
        federated,
      });

      onLogoutComplete?.();

      // If not federated, navigate manually
      if (!federated) {
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
      setIsLoggingOut(false);
    }
  };

  /**
   * Auto-trigger logout if not rendered as button
   */
  useEffect(() => {
    if (!asButton && state.isAuthenticated) {
      handleLogout();
    }
  }, [asButton, state.isAuthenticated]);

  /**
   * Render as button
   */
  if (asButton) {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut || !state.isAuthenticated}
        style={{
          ...defaultButtonStyle,
          ...buttonStyle,
          ...(isLoggingOut || !state.isAuthenticated ? disabledButtonStyle : {}),
        }}
        aria-label="Sign out"
      >
        {isLoggingOut ? (
          <>
            <svg style={spinnerStyle} viewBox="0 0 24 24">
              <circle
                style={spinnerCircleStyle}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
            </svg>
            <span>Signing out...</span>
          </>
        ) : (
          <>
            <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{buttonText}</span>
          </>
        )}
      </button>
    );
  }

  /**
   * Render as page
   */
  if (error) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={errorIconContainerStyle}>
            <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '64px', height: '64px' }}>
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 style={titleStyle}>Logout Failed</h1>
          <p style={messageStyle}>{error}</p>
          <button onClick={() => navigate('/login')} style={retryButtonStyle}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoggingOut || state.isAuthenticated) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={spinnerContainerStyle}>
            <svg style={largeSpinnerStyle} viewBox="0 0 50 50">
              <circle
                style={largeSpinnerCircleStyle}
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
              />
            </svg>
          </div>
          <h1 style={titleStyle}>Signing Out</h1>
          <p style={messageStyle}>Please wait while we sign you out...</p>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Styles
 */
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '20px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  padding: '48px 32px',
  maxWidth: '450px',
  width: '100%',
  textAlign: 'center',
};

const spinnerContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '24px',
};

const largeSpinnerStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  animation: 'spin 1s linear infinite',
};

const largeSpinnerCircleStyle: React.CSSProperties = {
  stroke: '#667eea',
  strokeLinecap: 'round',
  strokeDasharray: '1, 150',
  strokeDashoffset: '0',
  animation: 'dash 1.5s ease-in-out infinite',
};

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const messageStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0 0 24px 0',
  lineHeight: '1.5',
};

const errorIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '24px',
  color: '#ef4444',
};

const retryButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '16px',
  fontWeight: '600',
  color: 'white',
  backgroundColor: '#667eea',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const defaultButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  backgroundColor: 'white',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  outline: 'none',
};

const disabledButtonStyle: React.CSSProperties = {
  opacity: 0.6,
  cursor: 'not-allowed',
};

const iconStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
};

const spinnerStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  animation: 'spin 1s linear infinite',
};

const spinnerCircleStyle: React.CSSProperties = {
  opacity: 0.25,
};

// Add keyframe animations
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('logout-animations');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'logout-animations';
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes dash {
        0% {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -35;
        }
        100% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -124;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
