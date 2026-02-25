import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Session duration in milliseconds (24 hours)
 */
export const SESSION_DURATION = 24 * 60 * 60 * 1000;

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
 * Generate HMAC-SHA256 signature for the given data
 * @param data - The data to sign
 * @param secret - The signing secret
 * @returns The hexadecimal signature
 */
function generateSignature(data: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Create a signed session cookie value
 * @param assessmentId - The assessment ID to associate with the session
 * @returns A signed cookie string in the format: `{assessmentId}:{timestamp}:{signature}`
 * @throws {Error} If SESSION_SECRET or NEXTAUTH_SECRET is not configured
 * 
 * @example
 * ```typescript
 * const cookie = createSessionCookie('assessment-uuid-123');
 * // Returns: "assessment-uuid-123:1234567890:abc123def456..."
 * ```
 */
export function createSessionCookie(assessmentId: string): string {
  const secret = getSigningSecret();
  const timestamp = Date.now().toString();
  const data = `${assessmentId}:${timestamp}`;
  const signature = generateSignature(data, secret);
  
  return `${data}:${signature}`;
}

/**
 * Validate a session cookie signature and expiry
 * @param cookie - The cookie string to validate
 * @param assessmentId - Optional assessment ID to verify against the cookie
 * @returns An object with validation result and assessmentId if valid
 * 
 * @example
 * ```typescript
 * const result = validateSessionCookie(cookie, 'assessment-uuid-123');
 * // Returns: { valid: true, assessmentId: 'assessment-uuid-123' }
 * 
 * const result2 = validateSessionCookie(invalidCookie);
 * // Returns: { valid: false }
 * ```
 */
export function validateSessionCookie(
  cookie: string,
  assessmentId?: string
): { valid: boolean; assessmentId?: string } {
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

    // Verify signature using constant-time comparison to prevent timing attacks
    const secret = getSigningSecret();
    const data = `${cookieAssessmentId}:${timestampStr}`;
    const expectedSignature = generateSignature(data, secret);

    // Convert hex strings to buffers for secure comparison
    // Both signatures should be the same length (64 hex chars for SHA-256)
    if (providedSignature.length !== expectedSignature.length) {
      return { valid: false };
    }

    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    // Use constant-time comparison to prevent timing attacks
    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
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
    console.error('Session validation error:', error);
    return { valid: false };
  }
}

/**
 * Extend the session expiry for sliding window implementation
 * @returns A new cookie string with extended expiry (stub for future implementation)
 * 
 * @remarks
 * This is a placeholder for future sliding window session management.
 * When implemented, this function will:
 * - Take an existing valid cookie
 * - Generate a new cookie with updated timestamp
 * - Maintain the same assessment ID and signature validity
 */
export function extendSessionExpiry(): void {
  // Stub for future sliding window implementation
  // TODO: Implement sliding window session extension
}
