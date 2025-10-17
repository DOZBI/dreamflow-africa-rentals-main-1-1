/**
 * API Route: /api/validate-code
 * Validates subscription code and generates access token
 */

import { createClient } from '@supabase/supabase-js';
import { generateSubscriptionToken } from './utils/jwt';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ValidateCodeRequest {
  numero: string;
  code: string;
}

interface APIResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    duree: number;
    date_expiration: string;
    numero: string;
  };
  error?: string;
}

/**
 * Validate subscription code
 */
export async function validateCode(request: ValidateCodeRequest): Promise<APIResponse> {
  try {
    const { numero, code } = request;

    // Validate input
    if (!numero || !code) {
      return {
        success: false,
        message: 'Numéro de téléphone et code requis',
        error: 'MISSING_FIELDS'
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
        error: 'INVALID_CODE'
      };
    }

    // Check if subscription is active
    if (subscription.statut !== 'actif') {
      return {
        success: false,
        message: `Abonnement ${subscription.statut}`,
        error: 'SUBSCRIPTION_NOT_ACTIVE'
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
        error: 'CODE_EXPIRED'
      };
    }

    // Mark subscription as used if it's the first time being validated
    if (subscription.statut === 'actif') {
      await supabase
        .from('abonnements')
        .update({ statut: 'utilisé' })
        .eq('id', subscription.id);
    }

    // Generate access token
    const token = generateSubscriptionToken(
      subscription.numero,
      subscription.code,
      expirationDate
    );

    // Calculate remaining duration in minutes
    const remainingMinutes = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60));

    console.log(`✅ Code validé pour ${numero}: ${code} (${remainingMinutes} min restantes)`);

    return {
      success: true,
      message: 'Code validé avec succès',
      data: {
        token,
        duree: remainingMinutes,
        date_expiration: expirationDate.toISOString(),
        numero: subscription.numero,
      }
    };

  } catch (error) {
    console.error('Error in validateCode:', error);
    return {
      success: false,
      message: 'Erreur interne du serveur',
      error: 'INTERNAL_ERROR'
    };
  }
}

/**
 * Express/Fastify handler
 */
export async function handler(req: Request): Promise<Response> {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      message: 'Méthode non autorisée',
      error: 'METHOD_NOT_ALLOWED'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    const payload = await req.json() as ValidateCodeRequest;
    const result = await validateCode(payload);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Erreur lors du traitement de la requête',
      error: 'INVALID_REQUEST'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}