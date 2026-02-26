/**
 * Session duration in milliseconds (24 hours)
 */
export const SESSION_DURATION = 24 * 60 * 60 * 1000;

/**
 * Constant-time string comparison to prevent timing attacks
 * Compares two strings character by character without early exit
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Get the signing secret from environment variables
 * Uses SESSION_SECRET if available, falls back to NEXTAUTH_SECRET
 * @throws {Error} If no secret is configured
 */
function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    throw new Error('SESSION_SECRET or NEXTAUTH_SECRET environment variable is required');
  }
  
  return secret;
}

/**
 * Generate HMAC-SHA256 signature using Web Crypto API (Edge Runtime compatible)
 * @param data - The data to sign
 * @param secret - The signing secret
 * @returns The hexadecimal signature
 */
async function generateSignatureWeb(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  // Import the key
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Sign the data
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate a session cookie signature and expiry (Edge Runtime compatible)
 * @param cookie - The cookie string to validate
 * @param assessmentId - Optional assessment ID to verify against the cookie
 * @returns An object with validation result and assessmentId if valid
 */
export async function validateSessionCookieWeb(
  cookie: string,
  assessmentId?: string
): Promise<{ valid: boolean; assessmentId?: string }> {
  try {
    // Check if cookie is provided
    if (!cookie || typeof cookie !== 'string') {
      return { valid: false };
    }

    // Parse cookie format: assessmentId:timestamp:signature
    const parts = cookie.split(':');
    if (parts.length !== 3) {
      return { valid: false };
    }

    const [cookieAssessmentId, timestampStr, providedSignature] = parts;

    // Validate timestamp format
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return { valid: false };
    }

    // Check expiry (24 hours from timestamp)
    const now = Date.now();
    const age = now - timestamp;
    
    if (age < 0 || age > SESSION_DURATION) {
      return { valid: false };
    }

    // Verify signature using Web Crypto API
    const secret = getSigningSecret();
    const data = `${cookieAssessmentId}:${timestampStr}`;
    const expectedSignature = await generateSignatureWeb(data, secret);

    // Check signature length
    if (providedSignature.length !== expectedSignature.length) {
      return { valid: false };
    }

    // Use constant-time comparison to prevent timing attacks
    if (!timingSafeEqual(providedSignature, expectedSignature)) {
      return { valid: false };
    }

    // If assessmentId is provided, verify it matches
    if (assessmentId && cookieAssessmentId !== assessmentId) {
      return { valid: false };
    }

    return {
      valid: true,
      assessmentId: cookieAssessmentId,
    };
  } catch (error) {
    // Handle any errors (e.g., missing environment variables)
    console.error('[Session Web] Validation error:', error);
    return { valid: false };
  }
}
