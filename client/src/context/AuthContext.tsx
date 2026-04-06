"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, type RegisterRequest, type User, type LoginRequest } from '@/src/services/authService';
import { useCVStore } from '@/src/store/useCVStore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const currentUser = await authService.me();
        if (cancelled) return;
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch {
        if (cancelled) return;
        clearAuthState();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    const handleUnauthorized = () => {
      clearAuthState();
      useCVStore.getState().reset();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [clearAuthState]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      clearAuthState();
      useCVStore.getState().reset();
    }
  }, [clearAuthState]);

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const loginWithGoogle = async (token: string) => {
    const response = await authService.googleLogin(token);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, loginWithGoogle, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
