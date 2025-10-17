/**
 * SMS Authentication Context
 * Manages SMS-based authentication with subscription codes
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { generateSubscriptionToken, verifySubscriptionToken, isTokenExpired } from '../api/utils/jwt';
import { supabase } from '../integrations/supabase/client';

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
      // Validate input
      if (!numero || !code) {
        return {
          success: false,
          message: 'Numéro de téléphone et code requis',
        };
      }

      // Query subscription from database
      const { data: subscription, error: dbError } = await supabase
        .from('abonnements')
        .select('*')
        .eq('numero', numero)
        .eq('code', code)
        .single();

      if (dbError || !subscription) {
        return {
          success: false,
          message: 'Code invalide ou introuvable',
        };
      }

      // Check if subscription is active
      if (subscription.statut !== 'actif' && subscription.statut !== 'utilisé') {
        return {
          success: false,
          message: `Abonnement ${subscription.statut}`,
        };
      }

      // Check if subscription is expired
      const now = new Date();
      const expirationDate = new Date(subscription.date_expiration);

      if (expirationDate < now) {
        // Update status to expired
        await supabase
          .from('abonnements')
          .update({ statut: 'expiré' })
          .eq('id', subscription.id);

        return {
          success: false,
          message: 'Code expiré',
        };
      }

      // Mark subscription as used if it's the first time being validated
      if (subscription.statut === 'actif') {
        await supabase
          .from('abonnements')
          .update({ statut: 'utilisé' })
          .eq('id', subscription.id);
      }

      // Sign in to Supabase Auth (create user if needed)
      const email = `${numero.replace(/\+/g, '')}@sms.local`;
      const password = `${numero}_${code}`;

      // Try to sign in first
      let authResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If user doesn't exist, create one
      if (authResult.error && authResult.error.message.includes('Invalid login credentials')) {
        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: numero,
              phone_number: numero,
            }
          }
        });

        if (signUpResult.error) {
          console.error('Error creating Supabase user:', signUpResult.error);
          return {
            success: false,
            message: 'Erreur lors de la création du compte',
          };
        }

        // Sign in after creating user
        authResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (authResult.error) {
        console.error('Supabase auth error:', authResult.error);
        return {
          success: false,
          message: 'Erreur d\'authentification',
        };
      }

      // Generate access token
      const token = generateSubscriptionToken(
        subscription.numero,
        subscription.code,
        expirationDate
      );

      // Store authentication data
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(NUMERO_STORAGE_KEY, subscription.numero);
      localStorage.setItem(EXPIRES_AT_STORAGE_KEY, expirationDate.toISOString());

      // Update state
      setAuthState({
        isAuthenticated: true,
        numero: subscription.numero,
        token,
        expiresAt: expirationDate,
        remainingMinutes: calculateRemainingMinutes(expirationDate),
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
  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();

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