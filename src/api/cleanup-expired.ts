/**
 * API Route: /api/cleanup-expired
 * Cleanup expired subscriptions (to be called via cron job)
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface APIResponse {
  success: boolean;
  message: string;
  data?: {
    expiredCount: number;
    updatedAt: string;
  };
  error?: string;
}

/**
 * Clean up expired subscriptions
 */
export async function cleanupExpiredSubscriptions(): Promise<APIResponse> {
  try {
    const now = new Date();

    // Update all active subscriptions that have passed their expiration date
    const { data, error } = await supabase
      .from('abonnements')
      .update({ statut: 'expiré' })
      .eq('statut', 'actif')
      .lt('date_expiration', now.toISOString())
      .select('id');

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        message: 'Erreur lors du nettoyage des abonnements expirés',
        error: 'DATABASE_ERROR'
      };
    }

    const expiredCount = data?.length || 0;

    console.log(`✅ Nettoyage terminé: ${expiredCount} abonnement(s) expiré(s)`);

    return {
      success: true,
      message: `${expiredCount} abonnement(s) marqué(s) comme expiré(s)`,
      data: {
        expiredCount,
        updatedAt: now.toISOString(),
      }
    };

  } catch (error) {
    console.error('Error in cleanupExpiredSubscriptions:', error);
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
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  // Allow POST and GET for cron jobs
  if (req.method !== 'POST' && req.method !== 'GET') {
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

  // Optional: Add authorization check for cron jobs
  const authHeader = req.headers.get('authorization');
  const cronSecret = import.meta.env.VITE_CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Non autorisé',
      error: 'UNAUTHORIZED'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    const result = await cleanupExpiredSubscriptions();

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
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
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}