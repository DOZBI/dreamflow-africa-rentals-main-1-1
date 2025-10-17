/**
 * SMS Authentication Context
 * Manages SMS-based authentication with subscription codes
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';

interface SMSAuthState {
  isAuthenticated: boolean;
  numero: string | null;
  code: string | null;
  expiresAt: Date | null;
  remainingMinutes: number;
}

interface SMSAuthContextType extends SMSAuthState {
  login: (numero: string, code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  checkTokenValidity: () => boolean;
}

const SMSAuthContext = createContext<SMSAuthContextType | undefined>(undefined);

const CODE_STORAGE_KEY = 'sms_auth_code';
const NUMERO_STORAGE_KEY = 'sms_auth_numero';
const EXPIRES_AT_STORAGE_KEY = 'sms_auth_expires_at';

export function SMSAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<SMSAuthState>({
    isAuthenticated: false,
    numero: null,
    code: null,
    expiresAt: null,
    remainingMinutes: 0,
  });

  const checkTokenValidity = (): boolean => {
    const code = localStorage.getItem(CODE_STORAGE_KEY);
    if (!code) return false;

    const expiresAtStr = localStorage.getItem(EXPIRES_AT_STORAGE_KEY);
    if (!expiresAtStr) return false;

    const expiresAt = new Date(expiresAtStr);
    const now = new Date();

    if (expiresAt <= now) {
      logout();
      return false;
    }

    return true;
  };

  const calculateRemainingMinutes = (expiresAt: Date): number => {
    const now = new Date();
    const remaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
    return Math.max(0, remaining);
  };

  const login = async (numero: string, code: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!numero || !code) {
        return {
          success: false,
          message: 'Numéro de téléphone et code requis',
        };
      }

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

      if (subscription.statut !== 'actif' && subscription.statut !== 'utilisé') {
        return {
          success: false,
          message: `Abonnement ${subscription.statut}`,
        };
      }

      const now = new Date();
      const expirationDate = new Date(subscription.date_expiration);

      if (expirationDate < now) {
        await supabase
          .from('abonnements')
          .update({ statut: 'expiré' })
          .eq('id', subscription.id);

        return {
          success: false,
          message: 'Code expiré',
        };
      }

      if (subscription.statut === 'actif') {
        await supabase
          .from('abonnements')
          .update({ statut: 'utilisé' })
          .eq('id', subscription.id);
      }

      // Créer ou mettre à jour le profil basé sur le code d'abonnement
      const { error: profileError } = await supabase
        .from('subscription_profiles')
        .upsert({
          code: subscription.code,
          numero: subscription.numero,
          full_name: `Utilisateur ${subscription.code}`,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'code'
        });

      if (profileError) {
        console.error('Error creating/updating profile:', profileError);
      }

      localStorage.setItem(CODE_STORAGE_KEY, subscription.code);
      localStorage.setItem(NUMERO_STORAGE_KEY, subscription.numero);
      localStorage.setItem(EXPIRES_AT_STORAGE_KEY, expirationDate.toISOString());

      setAuthState({
        isAuthenticated: true,
        numero: subscription.numero,
        code: subscription.code,
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

  const logout = () => {
    localStorage.removeItem(CODE_STORAGE_KEY);
    localStorage.removeItem(NUMERO_STORAGE_KEY);
    localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);

    setAuthState({
      isAuthenticated: false,
      numero: null,
      code: null,
      expiresAt: null,
      remainingMinutes: 0,
    });
  };

  useEffect(() => {
    const code = localStorage.getItem(CODE_STORAGE_KEY);
    const numero = localStorage.getItem(NUMERO_STORAGE_KEY);
    const expiresAtStr = localStorage.getItem(EXPIRES_AT_STORAGE_KEY);

    if (code && numero && expiresAtStr) {
      const expiresAt = new Date(expiresAtStr);
      const now = new Date();

      if (expiresAt > now) {
        setAuthState({
          isAuthenticated: true,
          numero,
          code,
          expiresAt,
          remainingMinutes: calculateRemainingMinutes(expiresAt),
        });
      } else {
        logout();
      }
    }
  }, []);

  useEffect(() => {
    if (!authState.expiresAt) return;

    const checkInterval = setInterval(() => {
      if (!checkTokenValidity()) {
        clearInterval(checkInterval);
      } else {
        setAuthState(prev => ({
          ...prev,
          remainingMinutes: calculateRemainingMinutes(prev.expiresAt!),
        }));
      }
    }, 60000);

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