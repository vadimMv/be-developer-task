/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Uses React's useReducer for state management and Context API for distribution.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';
import type {
  AuthState,
  AuthAction,
  AuthActionType,
  AuthContextValue,
  LoginOptions,
  LogoutOptions,
  OAuthCallbackParams,
} from '../types/auth.types';

/**
 * Initial authentication state
 */
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check for existing session
  error: null,
};

/**
 * Authentication reducer
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'REFRESH_TOKEN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        tokens: action.payload.tokens,
        isLoading: false,
        error: null,
      };

    case 'REFRESH_TOKEN_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload.user,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

/**
 * Authentication Context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Initialize authentication state from storage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const validation = authService.validateToken();

        if (validation.isValid && validation.user) {
          const tokens = authService.getTokens();
          if (tokens) {
            dispatch({
              type: 'LOGIN_SUCCESS' as AuthActionType.LOGIN_SUCCESS,
              payload: {
                user: validation.user,
                tokens,
              },
            });
            return;
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }

      // If validation failed or no stored session, mark as not loading
      dispatch({ type: 'LOGOUT' as AuthActionType.LOGOUT });
    };

    initializeAuth();
  }, []);

  /**
   * Auto-refresh token before expiry
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.tokens) {
      return;
    }

    const checkTokenExpiry = async () => {
      if (authService.isTokenExpired()) {
        try {
          dispatch({ type: 'REFRESH_TOKEN_START' as AuthActionType.REFRESH_TOKEN_START });
          const newTokens = await authService.refreshToken();
          dispatch({
            type: 'REFRESH_TOKEN_SUCCESS' as AuthActionType.REFRESH_TOKEN_SUCCESS,
            payload: { tokens: newTokens },
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          dispatch({
            type: 'REFRESH_TOKEN_FAILURE' as AuthActionType.REFRESH_TOKEN_FAILURE,
            payload: { error: error instanceof Error ? error.message : 'Token refresh failed' },
          });
        }
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.tokens]);

  /**
   * Login handler
   */
  const login = useCallback((options?: LoginOptions) => {
    dispatch({ type: 'LOGIN_START' as AuthActionType.LOGIN_START });
    authService.login(options);
  }, []);

  /**
   * Logout handler
   */
  const logout = useCallback(async (options?: LogoutOptions) => {
    try {
      await authService.logout(options);
      dispatch({ type: 'LOGOUT' as AuthActionType.LOGOUT });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if IdP logout fails
      dispatch({ type: 'LOGOUT' as AuthActionType.LOGOUT });
    }
  }, []);

  /**
   * Handle OAuth callback
   */
  const handleCallback = useCallback(async (params: OAuthCallbackParams) => {
    try {
      dispatch({ type: 'LOGIN_START' as AuthActionType.LOGIN_START });
      const { user, tokens } = await authService.handleCallback(params);
      dispatch({
        type: 'LOGIN_SUCCESS' as AuthActionType.LOGIN_SUCCESS,
        payload: { user, tokens },
      });
    } catch (error) {
      console.error('Callback handling failed:', error);
      dispatch({
        type: 'LOGIN_FAILURE' as AuthActionType.LOGIN_FAILURE,
        payload: { error: error instanceof Error ? error.message : 'Authentication failed' },
      });
      throw error;
    }
  }, []);

  /**
   * Refresh token handler
   */
  const refreshToken = useCallback(async () => {
    try {
      dispatch({ type: 'REFRESH_TOKEN_START' as AuthActionType.REFRESH_TOKEN_START });
      const newTokens = await authService.refreshToken();
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS' as AuthActionType.REFRESH_TOKEN_SUCCESS,
        payload: { tokens: newTokens },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({
        type: 'REFRESH_TOKEN_FAILURE' as AuthActionType.REFRESH_TOKEN_FAILURE,
        payload: { error: error instanceof Error ? error.message : 'Token refresh failed' },
      });
      throw error;
    }
  }, []);

  /**
   * Check if token is expired
   */
  const isTokenExpired = useCallback(() => {
    return authService.isTokenExpired();
  }, []);

  /**
   * Memoized context value
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      login,
      logout,
      handleCallback,
      refreshToken,
      isTokenExpired,
    }),
    [state, login, logout, handleCallback, refreshToken, isTokenExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to get only authentication state (for optimization)
 */
export const useAuthState = () => {
  const { state } = useAuth();
  return state;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { state } = useAuth();
  return state.isAuthenticated;
};

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  const { state } = useAuth();
  return state.user;
};
