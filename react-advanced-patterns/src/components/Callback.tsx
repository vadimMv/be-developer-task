/**
 * OAuth Callback Component
 *
 * Handles the OAuth redirect after successful authentication at the IdP.
 * Processes the authorization code and completes the authentication flow.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import type { OAuthCallbackParams } from '../types/auth.types';

/**
 * Callback Component
 */
export const Callback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract OAuth parameters from URL
        const params: OAuthCallbackParams = {
          code: searchParams.get('code') || undefined,
          state: searchParams.get('state') || undefined,
          error: searchParams.get('error') || undefined,
          error_description: searchParams.get('error_description') || undefined,
        };

        // Check for errors from IdP
        if (params.error) {
          throw new Error(params.error_description || params.error);
        }

        // Handle the callback
        await handleCallback(params);

        // Get return URL (if stored) or default to dashboard
        const returnUrl = authService.getReturnUrl() || '/dashboard';

        // Navigate to the return URL
        navigate(returnUrl, { replace: true });
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>
            <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '64px', height: '64px' }}>
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 style={styles.title}>Authentication Failed</h1>
          <p style={styles.message}>{error}</p>
          <p style={styles.redirect}>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinnerContainer}>
            <svg style={styles.spinner} viewBox="0 0 50 50">
              <circle
                style={styles.spinnerCircle}
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
              />
            </svg>
          </div>
          <h1 style={styles.title}>Completing Sign In</h1>
          <p style={styles.message}>Please wait while we authenticate your credentials...</p>
          <div style={styles.progressBar}>
            <div style={styles.progressFill}></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Styles
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '48px 32px',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  spinner: {
    width: '64px',
    height: '64px',
    animation: 'spin 1s linear infinite',
  },
  spinnerCircle: {
    stroke: '#667eea',
    strokeLinecap: 'round',
    strokeDasharray: '1, 150',
    strokeDashoffset: '0',
    animation: 'dash 1.5s ease-in-out infinite',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  message: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
  redirect: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '16px 0 0 0',
    fontStyle: 'italic',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: '2px',
    animation: 'progress 2s ease-in-out infinite',
  },
  errorIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
    color: '#ef4444',
  },
};

// Add keyframe animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
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

    @keyframes progress {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(400%);
      }
    }
  `;
  document.head.appendChild(style);
}
