/**
 * Authentication Service
 *
 * This service handles all SSO-related operations including:
 * - Initiating SSO login flow
 * - Handling OAuth callbacks
 * - Token management (storage, validation, refresh)
 * - User profile management
 * - Logout operations
 */

import { jwtDecode } from 'jwt-decode';
import type {
  User,
  AuthTokens,
  SSOConfig,
  OAuthCallbackParams,
  TokenValidation,
  LoginOptions,
  LogoutOptions,
  StorageKeys,
  JWTPayload,
} from '../types/auth.types';

/**
 * SSO Configuration from environment variables
 */
const getConfig = (): SSOConfig => ({
  authUrl: import.meta.env.VITE_SSO_AUTH_URL || 'https://your-idp.com/oauth/authorize',
  logoutUrl: import.meta.env.VITE_SSO_LOGOUT_URL || 'https://your-idp.com/oauth/logout',
  clientId: import.meta.env.VITE_SSO_CLIENT_ID || 'your-client-id',
  redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  scope: import.meta.env.VITE_SSO_SCOPE || 'openid profile email',
  responseType: import.meta.env.VITE_SSO_RESPONSE_TYPE || 'code',
  tokenEndpoint: import.meta.env.VITE_SSO_TOKEN_ENDPOINT || 'https://your-idp.com/oauth/token',
  userInfoEndpoint: import.meta.env.VITE_SSO_USER_INFO_ENDPOINT || 'https://your-idp.com/oauth/userinfo',
});

/**
 * Storage utility for secure token management
 */
class SecureStorage {
  private static readonly storageType: Storage = window.localStorage;

  static setItem(key: StorageKeys, value: string): void {
    try {
      this.storageType.setItem(key, value);
    } catch (error) {
      console.error(`Failed to save ${key} to storage:`, error);
    }
  }

  static getItem(key: StorageKeys): string | null {
    try {
      return this.storageType.getItem(key);
    } catch (error) {
      console.error(`Failed to retrieve ${key} from storage:`, error);
      return null;
    }
  }

  static removeItem(key: StorageKeys): void {
    try {
      this.storageType.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
    }
  }

  static clear(): void {
    try {
      Object.values(StorageKeys).forEach((key) => {
        if (typeof key === 'string') {
          this.storageType.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}

/**
 * Generate a random string for OAuth state parameter (CSRF protection)
 */
const generateRandomState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Parse JWT token and extract user information
 */
const parseUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);

    return {
      id: decoded.sub,
      email: decoded.email || '',
      name: decoded.name || decoded.email || '',
      picture: decoded.picture,
      roles: Array.isArray(decoded.roles) ? (decoded.roles as string[]) : undefined,
      permissions: Array.isArray(decoded.permissions) ? (decoded.permissions as string[]) : undefined,
      metadata: decoded,
    };
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
};

/**
 * Validate if a JWT token is expired
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    // Add 60 second buffer to refresh before actual expiry
    return decoded.exp - currentTime < 60;
  } catch (error) {
    console.error('Failed to validate token:', error);
    return true;
  }
};

/**
 * Build OAuth authorization URL
 */
const buildAuthUrl = (options?: LoginOptions): string => {
  const config = getConfig();
  const state = generateRandomState();

  // Store state for validation and optional return URL
  SecureStorage.setItem(StorageKeys.STATE, state);
  if (options?.returnUrl) {
    SecureStorage.setItem(StorageKeys.RETURN_URL, options.returnUrl);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: config.responseType,
    scope: config.scope,
    state,
    ...(options?.prompt && { prompt: options.prompt }),
    ...(options?.loginHint && { login_hint: options.loginHint }),
    ...(options?.additionalParams || {}),
  });

  return `${config.authUrl}?${params.toString()}`;
};

/**
 * Exchange authorization code for tokens
 */
const exchangeCodeForTokens = async (code: string): Promise<AuthTokens> => {
  const config = getConfig();

  if (!config.tokenEndpoint) {
    throw new Error('Token endpoint not configured');
  }

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      // Note: In production, client_secret should be handled by backend
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
};

/**
 * Fetch user information from userinfo endpoint
 */
const fetchUserInfo = async (accessToken: string): Promise<User> => {
  const config = getConfig();

  if (!config.userInfoEndpoint) {
    // Fallback to parsing ID token
    const idToken = SecureStorage.getItem(StorageKeys.ID_TOKEN);
    if (idToken) {
      const user = parseUserFromToken(idToken);
      if (user) return user;
    }
    throw new Error('UserInfo endpoint not configured and no ID token available');
  }

  const response = await fetch(config.userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();

  return {
    id: data.sub || data.id,
    email: data.email,
    name: data.name || data.email,
    picture: data.picture,
    roles: data.roles,
    permissions: data.permissions,
    metadata: data,
  };
};

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Initiate SSO login flow
   */
  login(options?: LoginOptions): void {
    const authUrl = buildAuthUrl(options);
    window.location.href = authUrl;
  },

  /**
   * Handle OAuth callback
   */
  async handleCallback(params: OAuthCallbackParams): Promise<{ user: User; tokens: AuthTokens }> {
    // Check for errors
    if (params.error) {
      throw new Error(params.error_description || params.error);
    }

    // Validate state (CSRF protection)
    const storedState = SecureStorage.getItem(StorageKeys.STATE);
    if (!storedState || storedState !== params.state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Validate authorization code
    if (!params.code) {
      throw new Error('Authorization code not found');
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(params.code);

    // Store tokens
    SecureStorage.setItem(StorageKeys.ACCESS_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      SecureStorage.setItem(StorageKeys.REFRESH_TOKEN, tokens.refreshToken);
    }
    if (tokens.idToken) {
      SecureStorage.setItem(StorageKeys.ID_TOKEN, tokens.idToken);
    }

    // Calculate and store expiration time
    if (tokens.expiresIn) {
      const expiresAt = Date.now() + tokens.expiresIn * 1000;
      SecureStorage.setItem(StorageKeys.EXPIRES_AT, expiresAt.toString());
    }

    // Fetch user information
    const user = await fetchUserInfo(tokens.accessToken);
    SecureStorage.setItem(StorageKeys.USER, JSON.stringify(user));

    // Clean up state
    SecureStorage.removeItem(StorageKeys.STATE);

    return { user, tokens };
  },

  /**
   * Logout user
   */
  async logout(options?: LogoutOptions): Promise<void> {
    const config = getConfig();
    const idToken = SecureStorage.getItem(StorageKeys.ID_TOKEN);

    // Clear local storage
    SecureStorage.clear();

    // Build logout URL
    const logoutParams = new URLSearchParams({
      client_id: config.clientId,
      ...(options?.returnTo && { returnTo: options.returnTo }),
      ...(idToken && { id_token_hint: idToken }),
    });

    const logoutUrl = `${config.logoutUrl}?${logoutParams.toString()}`;

    // Redirect to IdP logout
    if (options?.federated !== false) {
      window.location.href = logoutUrl;
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const config = getConfig();
    const refreshToken = SecureStorage.getItem(StorageKeys.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (!config.tokenEndpoint) {
      throw new Error('Token endpoint not configured');
    }

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
      }).toString(),
    });

    if (!response.ok) {
      // If refresh fails, clear storage and throw
      SecureStorage.clear();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      idToken: data.id_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };

    // Update stored tokens
    SecureStorage.setItem(StorageKeys.ACCESS_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      SecureStorage.setItem(StorageKeys.REFRESH_TOKEN, tokens.refreshToken);
    }
    if (tokens.idToken) {
      SecureStorage.setItem(StorageKeys.ID_TOKEN, tokens.idToken);
    }

    if (tokens.expiresIn) {
      const expiresAt = Date.now() + tokens.expiresIn * 1000;
      SecureStorage.setItem(StorageKeys.EXPIRES_AT, expiresAt.toString());
    }

    return tokens;
  },

  /**
   * Validate stored token
   */
  validateToken(): TokenValidation {
    const accessToken = SecureStorage.getItem(StorageKeys.ACCESS_TOKEN);

    if (!accessToken) {
      return { isValid: false };
    }

    const expired = isTokenExpired(accessToken);

    if (expired) {
      return { isValid: false };
    }

    const userStr = SecureStorage.getItem(StorageKeys.USER);
    const user = userStr ? JSON.parse(userStr) : null;

    const expiresAtStr = SecureStorage.getItem(StorageKeys.EXPIRES_AT);
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : undefined;

    return {
      isValid: true,
      expiresAt,
      user,
    };
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const accessToken = SecureStorage.getItem(StorageKeys.ACCESS_TOKEN);
    if (!accessToken) return true;
    return isTokenExpired(accessToken);
  },

  /**
   * Get stored tokens
   */
  getTokens(): AuthTokens | null {
    const accessToken = SecureStorage.getItem(StorageKeys.ACCESS_TOKEN);
    if (!accessToken) return null;

    return {
      accessToken,
      refreshToken: SecureStorage.getItem(StorageKeys.REFRESH_TOKEN) || undefined,
      idToken: SecureStorage.getItem(StorageKeys.ID_TOKEN) || undefined,
    };
  },

  /**
   * Get stored user
   */
  getUser(): User | null {
    const userStr = SecureStorage.getItem(StorageKeys.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get return URL after authentication
   */
  getReturnUrl(): string | null {
    const returnUrl = SecureStorage.getItem(StorageKeys.RETURN_URL);
    SecureStorage.removeItem(StorageKeys.RETURN_URL);
    return returnUrl;
  },
};
