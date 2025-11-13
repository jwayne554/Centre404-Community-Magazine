/**
 * useAuth Hook - Centralized authentication state management
 * Handles login, logout, session persistence, and auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MODERATOR' | 'CONTRIBUTOR';
}

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AUTO_REFRESH_INTERVAL = 13 * 60 * 1000; // 13 minutes (2 min buffer before 15 min expiry)

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Check authentication status by calling refresh endpoint
   * This validates the refresh token and gets a new access token
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Not authenticated or token expired
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setError('Failed to verify authentication');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with email and password
   * Returns true on success, false on failure
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error - please try again');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout - clears cookies on server and local state
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Clear local state
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set up auto-refresh interval when user is authenticated
   * Refreshes tokens 2 minutes before they expire
   */
  useEffect(() => {
    if (user) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up new interval
      refreshIntervalRef.current = setInterval(() => {
        console.log('Auto-refreshing auth token...');
        checkAuth();
      }, AUTO_REFRESH_INTERVAL);

      // Cleanup on unmount or when user changes
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [user, checkAuth]);

  /**
   * Check auth on mount
   * This allows sessions to persist across page refreshes
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  };
}
