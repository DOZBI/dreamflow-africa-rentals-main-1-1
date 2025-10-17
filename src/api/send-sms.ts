/**
 * API Route: /api/send-sms
 * Sends SMS via SMS Gateway for Android
 */

import { formatDuration } from './utils/subscription';

interface SMSGatewayConfig {
  apiUrl: string;
  username: string;
  password: string;
  deviceId: string;
}

interface SendSMSRequest {
  numero: string;
  code: string;
  montant: number;
  duree: number;
}

interface APIResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

/**
 * Get SMS Gateway configuration from environment variables
 */
function getSMSGatewayConfig(): SMSGatewayConfig {
  return {
    apiUrl: import.meta.env.VITE_SMS_GATEWAY_API_URL || '',
    username: import.meta.env.VITE_SMS_GATEWAY_USERNAME || '',
    password: import.meta.env.VITE_SMS_GATEWAY_PASSWORD || '',
    deviceId: import.meta.env.VITE_SMS_GATEWAY_DEVICE_ID || '',
  };
}

/**
 * Send SMS via SMS Gateway for Android
 */
export async function sendSMS(request: SendSMSRequest): Promise<APIResponse> {
  try {
    const { numero, code, montant, duree } = request;
    const config = getSMSGatewayConfig();

    // Validate configuration
    if (!config.apiUrl || !config.username || !config.password || !config.deviceId) {
      console.error('SMS Gateway configuration incomplete');
      return {
        success: false,
        message: 'Configuration SMS Gateway incomplète',
        error: 'CONFIG_MISSING'
      };
    }

    // Format SMS message
    const durationText = formatDuration(duree);
    const smsMessage = `Votre code d'abonnement: ${code}\nMontant: ${montant} FCFA\nDurée: ${durationText}\nUtilisez ce code pour accéder à la plateforme.`;

    // Prepare SMS Gateway API request
    const smsGatewayPayload = {
      phoneNumber: numero,
      message: smsMessage,
      deviceId: config.deviceId,
    };

    // Send request to SMS Gateway
    const response = await fetch(`${config.apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
      },
      body: JSON.stringify(smsGatewayPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SMS Gateway error:', errorText);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi du SMS',
        error: 'SMS_GATEWAY_ERROR'
      };
    }

    const result = await response.json();

    console.log(`✅ SMS envoyé à ${numero}: Code ${code}`);

    return {
      success: true,
      message: 'SMS envoyé avec succès',
      messageId: result.messageId || result.id,
    };

  } catch (error) {
    console.error('Error in sendSMS:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'envoi du SMS',
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
    const payload = await req.json() as SendSMSRequest;
    const result = await sendSMS(payload);

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