/**
 * Login Component
 *
 * Displays the SSO login page and initiates the authentication flow.
 * When users click the login button, they're redirected to the IdP.
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useIsAuthenticated } from '../contexts/AuthContext';

/**
 * Login Component
 */
export const Login: React.FC = () => {
  const { login, state } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  /**
   * Handle SSO login
   */
  const handleLogin = () => {
    const returnUrl = (location.state as { from?: string })?.from || '/dashboard';
    login({ returnUrl });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account using Single Sign-On</p>
        </div>

        {state.error && (
          <div style={styles.errorBanner}>
            <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        <div style={styles.content}>
          <button
            onClick={handleLogin}
            disabled={state.isLoading}
            style={{
              ...styles.button,
              ...(state.isLoading ? styles.buttonDisabled : {}),
            }}
          >
            {state.isLoading ? (
              <>
                <svg style={styles.spinner} viewBox="0 0 24 24">
                  <circle
                    style={styles.spinnerCircle}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sign in with SSO</span>
              </>
            )}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerText}>Secure authentication powered by OAuth 2.0</span>
          </div>

          <div style={styles.info}>
            <p style={styles.infoText}>
              You'll be redirected to your organization's identity provider to complete the sign-in
              process.
            </p>
          </div>
        </div>
      </div>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  );
};

/**
 * Styles
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxWidth: '450px',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    padding: '32px 32px 24px',
    textAlign: 'center',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  content: {
    padding: '32px',
  },
  button: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonIcon: {
    width: '20px',
    height: '20px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
  },
  spinnerCircle: {
    opacity: 0.25,
  },
  divider: {
    margin: '24px 0',
    textAlign: 'center',
  },
  dividerText: {
    fontSize: '12px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  info: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '16px',
  },
  infoText: {
    fontSize: '14px',
    color: '#4b5563',
    margin: 0,
    lineHeight: '1.5',
  },
  errorBanner: {
    margin: '0 32px',
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#991b1b',
    fontSize: '14px',
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
  },
};

// Add keyframe animation for spinner in a style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
