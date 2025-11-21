# Single Sign-On (SSO) Implementation Guide

This document provides a comprehensive guide to the SSO authentication system implemented in this React application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Setup](#setup)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [API Reference](#api-reference)
8. [Components](#components)
9. [Customization](#customization)
10. [Security Considerations](#security-considerations)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This application implements a production-ready Single Sign-On (SSO) authentication system using **OAuth 2.0 / OpenID Connect (OIDC)** protocol. The implementation supports integration with popular identity providers such as:

- Auth0
- Okta
- Azure Active Directory
- Google OAuth
- Custom OAuth 2.0 providers

### Key Technologies

- **React 18.2** with TypeScript
- **React Router v6** for routing
- **Context API** for state management
- **JWT** for token parsing and validation
- **localStorage** for secure token storage

---

## Architecture

### Authentication Flow

```
┌─────────┐      ┌──────────┐      ┌─────────────┐      ┌──────────┐
│  User   │─────▶│  Login   │─────▶│    IdP      │─────▶│ Callback │
│         │      │   Page   │      │  (Auth0,    │      │   Page   │
└─────────┘      └──────────┘      │   Okta,     │      └──────────┘
                                    │   etc.)     │           │
                                    └─────────────┘           │
                                                              │
                                    ┌─────────────┐           │
                                    │  Protected  │◀──────────┘
                                    │    Pages    │
                                    └─────────────┘
```

### Directory Structure

```
src/
├── types/
│   └── auth.types.ts          # TypeScript interfaces and types
├── services/
│   └── authService.ts         # Authentication service layer
├── contexts/
│   └── AuthContext.tsx        # Authentication state management
├── components/
│   ├── Login.tsx              # Login page component
│   ├── Callback.tsx           # OAuth callback handler
│   ├── Logout.tsx             # Logout component
│   ├── ProtectedRoute.tsx     # Route guard component
│   └── Dashboard.tsx          # Example protected page
└── App.tsx                    # Main app with routing
```

---

## Features

### ✅ Implemented Features

- **OAuth 2.0 Authorization Code Flow** - Most secure OAuth flow
- **CSRF Protection** - State parameter validation
- **Automatic Token Refresh** - Prevents session expiration
- **Protected Routes** - Role and permission-based access control
- **Persistent Sessions** - Automatic session restoration
- **Federated Logout** - Sign out from both app and IdP
- **Loading States** - User-friendly loading indicators
- **Error Handling** - Comprehensive error messages
- **TypeScript** - Full type safety
- **Responsive Design** - Mobile-friendly UI

---

## Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- An OAuth 2.0 / OIDC provider account (Auth0, Okta, etc.)
- OAuth client credentials from your provider

### Installation

1. **Install dependencies:**

```bash
cd react-advanced-patterns
npm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env.local
```

3. **Edit `.env.local`** with your IdP credentials (see [Configuration](#configuration))

4. **Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Configuration

### Environment Variables

Create a `.env.local` file in the `react-advanced-patterns/` directory with the following variables:

```bash
# OAuth Authorization Endpoint
VITE_SSO_AUTH_URL=https://your-idp.com/oauth/authorize

# OAuth Logout Endpoint
VITE_SSO_LOGOUT_URL=https://your-idp.com/oauth/logout

# OAuth Token Endpoint
VITE_SSO_TOKEN_ENDPOINT=https://your-idp.com/oauth/token

# UserInfo Endpoint
VITE_SSO_USER_INFO_ENDPOINT=https://your-idp.com/oauth/userinfo

# OAuth Client ID
VITE_SSO_CLIENT_ID=your-client-id

# OAuth Redirect URI
VITE_SSO_REDIRECT_URI=http://localhost:5173/auth/callback

# OAuth Scopes (space-separated)
VITE_SSO_SCOPE=openid profile email

# OAuth Response Type
VITE_SSO_RESPONSE_TYPE=code
```

### Provider-Specific Examples

#### Auth0

```bash
VITE_SSO_AUTH_URL=https://YOUR_DOMAIN.auth0.com/authorize
VITE_SSO_LOGOUT_URL=https://YOUR_DOMAIN.auth0.com/v2/logout
VITE_SSO_TOKEN_ENDPOINT=https://YOUR_DOMAIN.auth0.com/oauth/token
VITE_SSO_USER_INFO_ENDPOINT=https://YOUR_DOMAIN.auth0.com/userinfo
VITE_SSO_CLIENT_ID=your_auth0_client_id
VITE_SSO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_SSO_SCOPE=openid profile email
VITE_SSO_RESPONSE_TYPE=code
```

#### Okta

```bash
VITE_SSO_AUTH_URL=https://YOUR_DOMAIN.okta.com/oauth2/default/v1/authorize
VITE_SSO_LOGOUT_URL=https://YOUR_DOMAIN.okta.com/oauth2/default/v1/logout
VITE_SSO_TOKEN_ENDPOINT=https://YOUR_DOMAIN.okta.com/oauth2/default/v1/token
VITE_SSO_USER_INFO_ENDPOINT=https://YOUR_DOMAIN.okta.com/oauth2/default/v1/userinfo
VITE_SSO_CLIENT_ID=your_okta_client_id
VITE_SSO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_SSO_SCOPE=openid profile email
VITE_SSO_RESPONSE_TYPE=code
```

#### Azure AD

```bash
VITE_SSO_AUTH_URL=https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/authorize
VITE_SSO_LOGOUT_URL=https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/logout
VITE_SSO_TOKEN_ENDPOINT=https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token
VITE_SSO_USER_INFO_ENDPOINT=https://graph.microsoft.com/oidc/userinfo
VITE_SSO_CLIENT_ID=your_azure_client_id
VITE_SSO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_SSO_SCOPE=openid profile email
VITE_SSO_RESPONSE_TYPE=code
```

### IdP Configuration

**Important:** In your IdP dashboard, you must configure:

1. **Allowed Callback URLs:**
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

2. **Allowed Logout URLs:**
   - Development: `http://localhost:5173/login`
   - Production: `https://yourdomain.com/login`

3. **Application Type:** Single Page Application (SPA)

4. **Grant Types:** Authorization Code with PKCE (recommended)

---

## Usage

### Basic Authentication

#### 1. Login

Users can access the login page at `/login` or will be automatically redirected if they try to access a protected route.

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { login } = useAuth();

  const handleLogin = () => {
    login({ returnUrl: '/dashboard' });
  };

  return <button onClick={handleLogin}>Sign In</button>;
}
```

#### 2. Access User Information

```tsx
import { useCurrentUser } from './contexts/AuthContext';

function Profile() {
  const user = useCurrentUser();

  if (!user) return null;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

#### 3. Logout

```tsx
import { Logout } from './components/Logout';

// As a button
function Header() {
  return (
    <header>
      <Logout asButton buttonText="Sign Out" />
    </header>
  );
}

// As a page (auto-logout)
// Navigate to /logout
```

### Protected Routes

#### Basic Protection

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

#### Role-Based Protection

```tsx
<ProtectedRoute requiredRoles={['admin', 'moderator']}>
  <AdminPanel />
</ProtectedRoute>
```

#### Permission-Based Protection

```tsx
<ProtectedRoute requiredPermissions={['read:reports', 'write:reports']}>
  <ReportsPage />
</ProtectedRoute>
```

#### Custom Fallback

```tsx
<ProtectedRoute
  requiredRoles={['admin']}
  fallback={<div>You need admin access to view this page.</div>}
>
  <AdminPanel />
</ProtectedRoute>
```

### Hooks

#### useAuth

Access the full authentication context:

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { state, login, logout, refreshToken } = useAuth();

  return (
    <div>
      {state.isAuthenticated ? (
        <p>Logged in as {state.user?.email}</p>
      ) : (
        <button onClick={() => login()}>Sign In</button>
      )}
    </div>
  );
}
```

#### useIsAuthenticated

Check authentication status:

```tsx
import { useIsAuthenticated } from './contexts/AuthContext';

function MyComponent() {
  const isAuthenticated = useIsAuthenticated();

  return <div>{isAuthenticated ? 'Logged in' : 'Not logged in'}</div>;
}
```

#### useCurrentUser

Get the current user:

```tsx
import { useCurrentUser } from './contexts/AuthContext';

function MyComponent() {
  const user = useCurrentUser();

  return <div>{user?.name}</div>;
}
```

#### useHasRole

Check if user has specific roles:

```tsx
import { useHasRole } from './components/ProtectedRoute';

function MyComponent() {
  const isAdmin = useHasRole(['admin']);

  return isAdmin ? <AdminButton /> : null;
}
```

#### useHasPermission

Check if user has specific permissions:

```tsx
import { useHasPermission } from './components/ProtectedRoute';

function MyComponent() {
  const canEdit = useHasPermission(['write:posts']);

  return canEdit ? <EditButton /> : null;
}
```

---

## API Reference

### AuthContext

#### State

```typescript
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### Methods

- **`login(options?: LoginOptions): void`** - Initiate SSO login
- **`logout(options?: LogoutOptions): Promise<void>`** - Sign out user
- **`handleCallback(params: OAuthCallbackParams): Promise<void>`** - Handle OAuth callback
- **`refreshToken(): Promise<void>`** - Manually refresh access token
- **`isTokenExpired(): boolean`** - Check if token is expired

### authService

Low-level authentication service:

```typescript
authService.login(options)
authService.handleCallback(params)
authService.logout(options)
authService.refreshToken()
authService.validateToken()
authService.isTokenExpired()
authService.getTokens()
authService.getUser()
```

---

## Components

### Login Component

Full-featured login page with SSO integration.

**Props:** None (uses routing state)

**Features:**
- Beautiful gradient UI
- Loading states
- Error display
- Auto-redirect on authentication

### Callback Component

Handles OAuth redirect after IdP authentication.

**Props:** None (uses URL parameters)

**Features:**
- Processes authorization code
- Exchanges code for tokens
- Handles errors
- Redirects to return URL

### Logout Component

Flexible logout component.

**Props:**

```typescript
interface LogoutProps {
  asButton?: boolean;
  buttonText?: string;
  buttonStyle?: React.CSSProperties;
  onLogoutComplete?: () => void;
  returnTo?: string;
  federated?: boolean;
}
```

### ProtectedRoute Component

Route guard for authenticated users.

**Props:**

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}
```

### Dashboard Component

Example protected page showing user info and features.

---

## Customization

### Custom User Fields

Extend the `User` interface in `src/types/auth.types.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles?: string[];
  permissions?: string[];

  // Add custom fields
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
}
```

### Custom Token Parsing

Modify `parseUserFromToken` in `src/services/authService.ts`:

```typescript
const parseUserFromToken = (token: string): User | null => {
  const decoded = jwtDecode<JWTPayload>(token);

  return {
    id: decoded.sub,
    email: decoded.email || '',
    name: decoded.name || '',
    // Map custom claims
    department: decoded.department as string,
    jobTitle: decoded['custom:job_title'] as string,
  };
};
```

### Custom Styling

All components use inline styles. To customize:

1. **Override inline styles:**

```tsx
<Logout asButton buttonStyle={{ backgroundColor: '#ff0000' }} />
```

2. **Create styled components:**

```tsx
import styled from 'styled-components';

const StyledLogoutButton = styled(Logout)`
  background-color: #ff0000;
  color: white;
`;
```

3. **Use CSS modules:**

Import CSS and apply classes to components.

---

## Security Considerations

### Best Practices Implemented

✅ **CSRF Protection** - State parameter validation
✅ **Secure Token Storage** - HttpOnly cookies recommended (localStorage used for SPA)
✅ **Token Expiration** - Automatic refresh before expiry
✅ **HTTPS in Production** - Always use HTTPS in production
✅ **No Secrets in Frontend** - Client secret handled by backend
✅ **Token Validation** - JWT signature and expiration validation

### Additional Recommendations

1. **Use PKCE (Proof Key for Code Exchange)** for additional security
2. **Implement rate limiting** on authentication endpoints
3. **Enable MFA** at the IdP level
4. **Use short-lived access tokens** (5-15 minutes)
5. **Store refresh tokens securely** (consider httpOnly cookies)
6. **Implement session timeout** warnings
7. **Log authentication events** for security auditing

### Production Checklist

- [ ] Use HTTPS for all endpoints
- [ ] Store sensitive credentials in environment variables
- [ ] Enable CORS with specific origins
- [ ] Implement Content Security Policy (CSP)
- [ ] Use refresh token rotation
- [ ] Enable audit logging
- [ ] Set up monitoring and alerts
- [ ] Test error scenarios (network failures, invalid tokens)
- [ ] Implement session timeout
- [ ] Configure IdP security settings (MFA, IP restrictions)

---

## Troubleshooting

### Common Issues

#### 1. "Invalid state parameter" Error

**Cause:** CSRF protection detected a mismatch between sent and received state.

**Solution:**
- Clear browser localStorage
- Ensure cookies are enabled
- Check if state is being modified by browser extensions

#### 2. "Token exchange failed" Error

**Cause:** Authorization code couldn't be exchanged for tokens.

**Solution:**
- Verify `VITE_SSO_TOKEN_ENDPOINT` is correct
- Check if redirect URI matches IdP configuration
- Ensure client ID is correct
- Verify authorization code hasn't expired

#### 3. Infinite Redirect Loop

**Cause:** Authentication state not persisting.

**Solution:**
- Check browser localStorage is enabled
- Verify tokens are being saved correctly
- Check `isAuthenticated` state in AuthContext

#### 4. "Failed to fetch user info" Error

**Cause:** UserInfo endpoint is unreachable or access token is invalid.

**Solution:**
- Verify `VITE_SSO_USER_INFO_ENDPOINT` is correct
- Check access token includes required scopes
- Ensure IdP supports userinfo endpoint

#### 5. Token Refresh Failing

**Cause:** Refresh token expired or invalid.

**Solution:**
- Check refresh token expiration time
- Verify `VITE_SSO_TOKEN_ENDPOINT` supports refresh grant
- Ensure refresh token is stored correctly

### Debug Mode

Enable verbose logging in `authService.ts`:

```typescript
const DEBUG = true;

if (DEBUG) {
  console.log('[AUTH]', 'Operation:', data);
}
```

### Support Resources

- [OAuth 2.0 RFC](https://oauth.net/2/)
- [OpenID Connect Spec](https://openid.net/connect/)
- Provider-specific documentation:
  - [Auth0 Docs](https://auth0.com/docs)
  - [Okta Docs](https://developer.okta.com/docs/)
  - [Azure AD Docs](https://docs.microsoft.com/en-us/azure/active-directory/)

---

## License

This SSO implementation is part of the React Advanced Patterns project.

---

**Questions or Issues?**
Please refer to the main project README or open an issue on the repository.
