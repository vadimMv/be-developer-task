/**
 * Protected Route Component
 *
 * A route guard component that ensures only authenticated users can access
 * protected routes. Redirects unauthenticated users to the login page.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional roles required to access this route
   */
  requiredRoles?: string[];
  /**
   * Optional permissions required to access this route
   */
  requiredPermissions?: string[];
  /**
   * Custom fallback component when user doesn't have required permissions
   */
  fallback?: React.ReactNode;
}

/**
 * Protected Route Component
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallback,
}) => {
  const { state } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (state.isLoading) {
    return (
      <div style={styles.container}>
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
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = state.user?.roles || [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return fallback ? (
        <>{fallback}</>
      ) : (
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            </svg>
            <h2 style={styles.errorTitle}>Access Denied</h2>
            <p style={styles.errorMessage}>
              You don't have the required role to access this page.
            </p>
            <p style={styles.errorDetail}>Required roles: {requiredRoles.join(', ')}</p>
          </div>
        </div>
      );
    }
  }

  // Check permission-based access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = state.user?.permissions || [];
    const hasRequiredPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      return fallback ? (
        <>{fallback}</>
      ) : (
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            </svg>
            <h2 style={styles.errorTitle}>Access Denied</h2>
            <p style={styles.errorMessage}>
              You don't have the required permission to access this page.
            </p>
            <p style={styles.errorDetail}>
              Required permissions: {requiredPermissions.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required permissions/roles
  return <>{children}</>;
};

/**
 * Hook to check if user has specific roles
 */
export const useHasRole = (roles: string[]): boolean => {
  const { state } = useAuth();
  const userRoles = state.user?.roles || [];
  return roles.some((role) => userRoles.includes(role));
};

/**
 * Hook to check if user has specific permissions
 */
export const useHasPermission = (permissions: string[]): boolean => {
  const { state } = useAuth();
  const userPermissions = state.user?.permissions || [];
  return permissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Higher-Order Component for protecting components
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRoles?: string[];
    requiredPermissions?: string[];
    fallback?: React.ReactNode;
  }
) => {
  return (props: P) => (
    <ProtectedRoute
      requiredRoles={options?.requiredRoles}
      requiredPermissions={options?.requiredPermissions}
      fallback={options?.fallback}
    >
      <Component {...props} />
    </ProtectedRoute>
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
    backgroundColor: '#f9fafb',
    padding: '20px',
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    animation: 'spin 1s linear infinite',
  },
  spinnerCircle: {
    stroke: '#667eea',
    strokeLinecap: 'round',
    strokeDasharray: '1, 150',
    strokeDashoffset: '0',
    animation: 'dash 1.5s ease-in-out infinite',
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '48px 32px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    color: '#ef4444',
    margin: '0 auto 24px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 8px 0',
    lineHeight: '1.5',
  },
  errorDetail: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '8px 0 0 0',
    fontStyle: 'italic',
  },
};

// Add keyframe animations
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('protected-route-animations');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'protected-route-animations';
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
