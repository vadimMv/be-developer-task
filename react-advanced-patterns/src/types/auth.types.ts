/**
 * Authentication Types and Interfaces
 *
 * This file contains all TypeScript types and interfaces related to
 * authentication, SSO, and user management.
 */

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * SSO Configuration
 */
export interface SSOConfig {
  authUrl: string;
  logoutUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
}

/**
 * OAuth callback parameters
 */
export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

/**
 * Token validation result
 */
export interface TokenValidation {
  isValid: boolean;
  expiresAt?: number;
  user?: User;
}

/**
 * Login options
 */
export interface LoginOptions {
  returnUrl?: string;
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
  loginHint?: string;
  additionalParams?: Record<string, string>;
}

/**
 * Logout options
 */
export interface LogoutOptions {
  returnTo?: string;
  federated?: boolean;
}

/**
 * Auth context value
 */
export interface AuthContextValue {
  state: AuthState;
  login: (options?: LoginOptions) => void;
  logout: (options?: LogoutOptions) => Promise<void>;
  handleCallback: (params: OAuthCallbackParams) => Promise<void>;
  refreshToken: () => Promise<void>;
  isTokenExpired: () => boolean;
}

/**
 * Storage keys
 */
export enum StorageKeys {
  ACCESS_TOKEN = 'sso_access_token',
  REFRESH_TOKEN = 'sso_refresh_token',
  ID_TOKEN = 'sso_id_token',
  USER = 'sso_user',
  EXPIRES_AT = 'sso_expires_at',
  STATE = 'sso_state',
  RETURN_URL = 'sso_return_url',
}

/**
 * Auth action types for reducer
 */
export enum AuthActionType {
  LOGIN_START = 'LOGIN_START',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  REFRESH_TOKEN_START = 'REFRESH_TOKEN_START',
  REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE = 'REFRESH_TOKEN_FAILURE',
  UPDATE_USER = 'UPDATE_USER',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

/**
 * Auth actions
 */
export type AuthAction =
  | { type: AuthActionType.LOGIN_START }
  | { type: AuthActionType.LOGIN_SUCCESS; payload: { user: User; tokens: AuthTokens } }
  | { type: AuthActionType.LOGIN_FAILURE; payload: { error: string } }
  | { type: AuthActionType.LOGOUT }
  | { type: AuthActionType.REFRESH_TOKEN_START }
  | { type: AuthActionType.REFRESH_TOKEN_SUCCESS; payload: { tokens: AuthTokens } }
  | { type: AuthActionType.REFRESH_TOKEN_FAILURE; payload: { error: string } }
  | { type: AuthActionType.UPDATE_USER; payload: { user: User } }
  | { type: AuthActionType.CLEAR_ERROR };

/**
 * JWT Payload (standard claims)
 */
export interface JWTPayload {
  sub: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}
