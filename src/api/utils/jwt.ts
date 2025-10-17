/**
 * JWT utilities for subscription tokens
 */

/**
 * Generate a subscription token (JWT-like structure)
 * In production, use a proper JWT library like 'jsonwebtoken'
 * @param numero - Phone number
 * @param code - Subscription code
 * @param expirationDate - Token expiration date
 * @returns Token string
 */
export function generateSubscriptionToken(
  numero: string,
  code: string,
  expirationDate: Date
): string {
  const payload = {
    numero,
    code,
    exp: Math.floor(expirationDate.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
  };

  // In production, use: jwt.sign(payload, process.env.JWT_SECRET)
  // For now, we'll use a simple base64 encoding
  const token = btoa(JSON.stringify(payload));
  return token;
}

/**
 * Verify and decode a subscription token
 * @param token - Token string
 * @returns Decoded payload or null if invalid
 */
export function verifySubscriptionToken(token: string): {
  numero: string;
  code: string;
  exp: number;
  iat: number;
} | null {
  try {
    // In production, use: jwt.verify(token, process.env.JWT_SECRET)
    const decoded = JSON.parse(atob(token));
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - Token string
 * @returns True if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = verifySubscriptionToken(token);
  return decoded === null;
}