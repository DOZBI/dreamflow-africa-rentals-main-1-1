/**
 * API Route: /api/receive-sms
 * Receives SMS from SMS Gateway, generates subscription code, and stores in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { 
  generateSubscriptionCode, 
  calculateDuration, 
  calculateExpirationDate,
  extractAmountFromSMS,
  formatDuration 
} from './utils/subscription';

// Initialize Supabase client with service role key for admin access
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SMSWebhookPayload {
  phoneNumber: string;  // Sender's phone number
  message: string;      // SMS content
  timestamp?: string;   // Optional timestamp
}

interface APIResponse {
  success: boolean;
  message: string;
  data?: {
    code: string;
    numero: string;
    montant: number;
    duree: number;
    date_expiration: string;
  };
  error?: string;
}

/**
 * Handle incoming SMS webhook
 */
export async function handleReceiveSMS(payload: SMSWebhookPayload): Promise<APIResponse> {
  try {
    const { phoneNumber, message } = payload;

    // Validate input
    if (!phoneNumber || !message) {
      return {
        success: false,
        message: 'Numéro de téléphone et message requis',
        error: 'MISSING_FIELDS'
      };
    }

    // Extract amount from SMS content
    const montant = extractAmountFromSMS(message);
    
    if (!montant) {
      return {
        success: false,
        message: 'Montant invalide. Montants acceptés: 200, 500, 1000, 2000 FCFA',
        error: 'INVALID_AMOUNT'
      };
    }

    // Calculate duration based on amount
    const duree = calculateDuration(montant);
    
    if (duree === 0) {
      return {
        success: false,
        message: 'Montant non reconnu',
        error: 'INVALID_DURATION'
      };
    }

    // Generate unique subscription code
    let code = generateSubscriptionCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (!isUnique && attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('abonnements')
        .select('code')
        .eq('code', code)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        code = generateSubscriptionCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return {
        success: false,
        message: 'Erreur lors de la génération du code unique',
        error: 'CODE_GENERATION_FAILED'
      };
    }

    // Calculate expiration date
    const dateExpiration = calculateExpirationDate(duree);

    // Store subscription in database
    const { data: subscription, error: dbError } = await supabase
      .from('abonnements')
      .insert({
        numero: phoneNumber,
        code,
        montant,
        duree,
        date_creation: new Date().toISOString(),
        date_expiration: dateExpiration.toISOString(),
        statut: 'actif'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return {
        success: false,
        message: 'Erreur lors de l\'enregistrement de l\'abonnement',
        error: 'DATABASE_ERROR'
      };
    }

    // Trigger SMS sending (will be handled by send-sms endpoint)
    // In a real implementation, you would call the send-sms endpoint here
    // or use a queue system to send the SMS asynchronously
    
    console.log(`✅ Code généré pour ${phoneNumber}: ${code} (${formatDuration(duree)})`);

    return {
      success: true,
      message: 'Abonnement créé avec succès',
      data: {
        code,
        numero: phoneNumber,
        montant,
        duree,
        date_expiration: dateExpiration.toISOString()
      }
    };

  } catch (error) {
    console.error('Error in handleReceiveSMS:', error);
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
    const payload = await req.json() as SMSWebhookPayload;
    const result = await handleReceiveSMS(payload);

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