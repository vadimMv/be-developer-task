/**
 * Dashboard Component
 *
 * Example protected page that displays user information and demonstrates
 * the SSO authentication integration.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../contexts/AuthContext';
import { Logout } from './Logout';

/**
 * Dashboard Component
 */
export const Dashboard: React.FC = () => {
  const user = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Dashboard</h1>
          <Logout asButton buttonStyle={styles.logoutButton} />
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Welcome Card */}
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeHeader}>
            {user.picture && (
              <img src={user.picture} alt={user.name} style={styles.avatar} />
            )}
            <div>
              <h2 style={styles.welcomeTitle}>Welcome back, {user.name}!</h2>
              <p style={styles.welcomeSubtitle}>You're successfully authenticated via SSO</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>User Information</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>User ID</span>
              <span style={styles.infoValue}>{user.id}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>{user.email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Name</span>
              <span style={styles.infoValue}>{user.name}</span>
            </div>
            {user.roles && user.roles.length > 0 && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Roles</span>
                <div style={styles.badgeContainer}>
                  {user.roles.map((role) => (
                    <span key={role} style={styles.badge}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {user.permissions && user.permissions.length > 0 && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Permissions</span>
                <div style={styles.badgeContainer}>
                  {user.permissions.map((permission) => (
                    <span key={permission} style={styles.badge}>
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quick Actions</h3>
          <div style={styles.actionsGrid}>
            <Link to="/examples" style={styles.actionButton}>
              <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <div>
                <div style={styles.actionTitle}>View Examples</div>
                <div style={styles.actionDescription}>Explore React advanced patterns</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Features Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>SSO Features</h3>
          <div style={styles.featureGrid}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 style={styles.featureTitle}>Secure Authentication</h4>
                <p style={styles.featureDescription}>
                  OAuth 2.0 / OpenID Connect protocol for secure authentication
                </p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div>
                <h4 style={styles.featureTitle}>User Profile</h4>
                <p style={styles.featureDescription}>
                  Automatic user profile synchronization from your IdP
                </p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
              </div>
              <div>
                <h4 style={styles.featureTitle}>Protected Routes</h4>
                <p style={styles.featureDescription}>
                  Role-based access control for route protection
                </p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 style={styles.featureTitle}>Auto Token Refresh</h4>
                <p style={styles.featureDescription}>
                  Automatic token refresh before expiration
                </p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 style={styles.featureTitle}>Session Management</h4>
                <p style={styles.featureDescription}>
                  Persistent sessions with secure token storage
                </p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 style={styles.featureTitle}>Federated Logout</h4>
                <p style={styles.featureDescription}>
                  Sign out from both app and identity provider
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Card (if available) */}
        {user.metadata && Object.keys(user.metadata).length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Additional Metadata</h3>
            <pre style={styles.codeBlock}>{JSON.stringify(user.metadata, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * Styles
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '24px',
    marginBottom: '24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  welcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '3px solid white',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
  },
  welcomeSubtitle: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '24px',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px 0',
  },
  infoGrid: {
    display: 'grid',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: '14px',
    color: '#111827',
    fontWeight: '500',
  },
  badgeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  badge: {
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#667eea',
    backgroundColor: '#eef2ff',
    borderRadius: '12px',
  },
  actionsGrid: {
    display: 'grid',
    gap: '12px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s',
    border: '1px solid #e5e7eb',
  },
  actionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  actionDescription: {
    fontSize: '14px',
    color: '#6b7280',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  featureIcon: {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    color: '#667eea',
    borderRadius: '8px',
  },
  featureTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  featureDescription: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
  },
  codeBlock: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#111827',
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    overflow: 'auto',
    margin: 0,
  },
};
