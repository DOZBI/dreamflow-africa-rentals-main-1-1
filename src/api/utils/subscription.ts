/**
 * Utility functions for subscription management
 */

/**
 * Generate a unique alphanumeric subscription code
 * Format: 6 characters (e.g., A1B2C3)
 */
export function generateSubscriptionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate subscription duration based on payment amount
 * @param montant - Amount paid in FCFA
 * @returns Duration in minutes
 */
export function calculateDuration(montant: number): number {
  const durationMap: Record<number, number> = {
    200: 30,      // 30 minutes
    500: 90,      // 1h30
    1000: 120,    // 2h
    2000: 1440,   // 24h
  };

  return durationMap[montant] || 0;
}

/**
 * Calculate expiration date based on duration
 * @param durationMinutes - Duration in minutes
 * @returns Expiration date
 */
export function calculateExpirationDate(durationMinutes: number): Date {
  const now = new Date();
  return new Date(now.getTime() + durationMinutes * 60 * 1000);
}

/**
 * Extract amount from SMS content
 * Looks for patterns like "200 FCFA", "500F", "1000", etc.
 * @param smsContent - SMS message content
 * @returns Extracted amount or null
 */
export function extractAmountFromSMS(smsContent: string): number | null {
  // Remove spaces and convert to uppercase for easier parsing
  const normalized = smsContent.replace(/\s+/g, ' ').toUpperCase();
  
  // Try to match common patterns
  const patterns = [
    /(\d+)\s*FCFA/i,    // "200 FCFA"
    /(\d+)\s*F\b/i,     // "200F"
    /FCFA\s*(\d+)/i,    // "FCFA 200"
    /\b(\d+)\b/,        // Just numbers
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const amount = parseInt(match[1], 10);
      // Validate amount is one of the accepted values
      if ([200, 500, 1000, 2000].includes(amount)) {
        return amount;
      }
    }
  }

  return null;
}

/**
 * Format duration for SMS message
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "30 min", "1h30", "2h", "24h")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes === 1440) {
    return '24h';
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  }
}