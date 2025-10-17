/**
 * SMS Authentication Context
 * Manages SMS-based authentication with subscription codes
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { verifySubscriptionToken, isTokenExpired } from '../api/utils/jwt';

interface SMSAuthState {
  isAuthenticated: boolean;
  numero: string | null;
  token: string | null;
  expiresAt: Date | null;
  remainingMinutes: number;
}

interface SMSAuthContextType extends SMSAuthState {
  login: (numero: string, code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  checkTokenValidity: () => boolean;
}

const SMSAuthContext = createContext<SMSAuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'sms_auth_token';
const NUMERO_STORAGE_KEY = 'sms_auth_numero';
const EXPIRES_AT_STORAGE_KEY = 'sms_auth_expires_at';

export function SMSAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<SMSAuthState>({
    isAuthenticated: false,
    numero: null,
    token: null,
    expiresAt: null,
    remainingMinutes: 0,
  });

  // Check token validity
  const checkTokenValidity = (): boolean => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return false;

    const expiresAtStr = localStorage.getItem(EXPIRES_AT_STORAGE_KEY);
    if (!expiresAtStr) return false;

    const expiresAt = new Date(expiresAtStr);
    const now = new Date();

    if (expiresAt <= now || isTokenExpired(token)) {
      logout();
      return false;
    }

    return true;
  };

  // Calculate remaining minutes
  const calculateRemainingMinutes = (expiresAt: Date): number => {
    const now = new Date();
    const remaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
    return Math.max(0, remaining);
  };

  // Login with phone number and subscription code
  const login = async (numero: string, code: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Call validate-code API
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numero, code }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Code invalide',
        };
      }

      const { token, date_expiration, numero: validatedNumero } = result.data;
      const expiresAt = new Date(date_expiration);

      // Store authentication data
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(NUMERO_STORAGE_KEY, validatedNumero);
      localStorage.setItem(EXPIRES_AT_STORAGE_KEY, expiresAt.toISOString());

      // Update state
      setAuthState({
        isAuthenticated: true,
        numero: validatedNumero,
        token,
        expiresAt,
        remainingMinutes: calculateRemainingMinutes(expiresAt),
      });

      return {
        success: true,
        message: 'Connexion réussie',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Erreur de connexion',
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(NUMERO_STORAGE_KEY);
    localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);

    setAuthState({
      isAuthenticated: false,
      numero: null,
      token: null,
      expiresAt: null,
      remainingMinutes: 0,
    });
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const numero = localStorage.getItem(NUMERO_STORAGE_KEY);
    const expiresAtStr = localStorage.getItem(EXPIRES_AT_STORAGE_KEY);

    if (token && numero && expiresAtStr) {
      const expiresAt = new Date(expiresAtStr);
      const now = new Date();

      if (expiresAt > now && !isTokenExpired(token)) {
        setAuthState({
          isAuthenticated: true,
          numero,
          token,
          expiresAt,
          remainingMinutes: calculateRemainingMinutes(expiresAt),
        });
      } else {
        logout();
      }
    }
  }, []);

  // Auto-logout when token expires
  useEffect(() => {
    if (!authState.expiresAt) return;

    const checkInterval = setInterval(() => {
      if (!checkTokenValidity()) {
        clearInterval(checkInterval);
      } else {
        // Update remaining minutes
        setAuthState(prev => ({
          ...prev,
          remainingMinutes: calculateRemainingMinutes(prev.expiresAt!),
        }));
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [authState.expiresAt]);

  const value: SMSAuthContextType = {
    ...authState,
    login,
    logout,
    checkTokenValidity,
  };

  return (
    <SMSAuthContext.Provider value={value}>
      {children}
    </SMSAuthContext.Provider>
  );
}

export function useSMSAuth() {
  const context = useContext(SMSAuthContext);
  if (!context) {
    throw new Error('useSMSAuth must be used within SMSAuthProvider');
  }
  return context;
}