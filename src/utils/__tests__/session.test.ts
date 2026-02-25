import { createHmac } from 'crypto';
import {
  createSessionCookie,
  validateSessionCookie,
  SESSION_DURATION
} from '../session';

// Store the original environment
const originalEnv = process.env;

describe('Session Utilities', () => {
  beforeAll(() => {
    // Set test environment variables
    process.env.SESSION_SECRET = 'test-secret-key-for-testing';
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Clear any test-specific overrides
    jest.clearAllMocks();
  });

  describe('SESSION_DURATION constant', () => {
    it('should equal 86400000 milliseconds (24 hours)', () => {
      expect(SESSION_DURATION).toBe(86400000);
      expect(SESSION_DURATION).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('createSessionCookie()', () => {
    it('should generate cookie with correct format', () => {
      const assessmentId = 'test-assessment-123';
      const cookie = createSessionCookie(assessmentId);

      // Should have format: assessmentId:timestamp:signature
      const parts = cookie.split(':');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe(assessmentId);
    });

    it('should include assessmentId, timestamp, and signature', () => {
      const assessmentId = 'test-assessment-456';
      const cookie = createSessionCookie(assessmentId);

      const [cookieAssessmentId, timestamp, signature] = cookie.split(':');

      // Verify assessmentId
      expect(cookieAssessmentId).toBe(assessmentId);

      // Verify timestamp is a valid number
      expect(Number(timestamp)).not.toBeNaN();
      expect(Number(timestamp)).toBeGreaterThan(0);

      // Verify signature exists and is hexadecimal
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^[a-f0-9]+$/);
      expect(signature.length).toBe(64); // SHA256 hex = 64 chars
    });

    it('should generate valid HMAC-SHA256 signature', () => {
      const assessmentId = 'test-assessment-789';
      const cookie = createSessionCookie(assessmentId);

      const [cookieAssessmentId, timestamp, providedSignature] = cookie.split(':');

      // Manually verify the signature
      const secret = process.env.SESSION_SECRET!;
      const data = `${cookieAssessmentId}:${timestamp}`;
      const expectedSignature = createHmac('sha256', secret)
        .update(data)
        .digest('hex');

      expect(providedSignature).toBe(expectedSignature);
    });

    it('should generate different timestamps for sequential calls', (done) => {
      const assessmentId = 'test-assessment-abc';
      const cookie1 = createSessionCookie(assessmentId);
      
      // Wait a small amount to ensure different timestamp
      setTimeout(() => {
        const cookie2 = createSessionCookie(assessmentId);
        
        const timestamp1 = cookie1.split(':')[1];
        const timestamp2 = cookie2.split(':')[1];
        
        expect(timestamp1).not.toBe(timestamp2);
        done();
      }, 10);
    });

    it('should throw error when SESSION_SECRET is not set', () => {
      const originalSecret = process.env.SESSION_SECRET;
      const originalNextAuthSecret = process.env.NEXTAUTH_SECRET;
      delete process.env.SESSION_SECRET;
      delete process.env.NEXTAUTH_SECRET;

      expect(() => {
        createSessionCookie('test-id');
      }).toThrow('SESSION_SECRET or NEXTAUTH_SECRET environment variable is required');

      // Restore
      process.env.SESSION_SECRET = originalSecret;
      process.env.NEXTAUTH_SECRET = originalNextAuthSecret;
    });

    it('should use NEXTAUTH_SECRET as fallback when SESSION_SECRET is not set', () => {
      const originalSecret = process.env.SESSION_SECRET;
      delete process.env.SESSION_SECRET;
      process.env.NEXTAUTH_SECRET = 'fallback-secret';

      expect(() => {
        createSessionCookie('test-id');
      }).not.toThrow();

      // Restore
      process.env.SESSION_SECRET = originalSecret;
    });
  });

  describe('validateSessionCookie()', () => {
    it('should return valid=true for valid cookies', () => {
      const assessmentId = 'test-assessment-valid';
      const cookie = createSessionCookie(assessmentId);

      const result = validateSessionCookie(cookie, assessmentId);

      expect(result.valid).toBe(true);
      expect(result.assessmentId).toBe(assessmentId);
    });

    it('should return valid=true without assessmentId parameter', () => {
      const assessmentId = 'test-assessment-no-check';
      const cookie = createSessionCookie(assessmentId);

      const result = validateSessionCookie(cookie);

      expect(result.valid).toBe(true);
      expect(result.assessmentId).toBe(assessmentId);
    });

    it('should return valid=false for expired cookies (>24 hours old)', () => {
      const assessmentId = 'test-assessment-expired';
      
      // Create a cookie manually with old timestamp
      const oldTimestamp = Date.now() - (SESSION_DURATION + 1000); // 24 hours + 1 second ago
      const secret = process.env.SESSION_SECRET!;
      const data = `${assessmentId}:${oldTimestamp}`;
      const signature = createHmac('sha256', secret)
        .update(data)
        .digest('hex');
      const expiredCookie = `${data}:${signature}`;

      const result = validateSessionCookie(expiredCookie, assessmentId);

      expect(result.valid).toBe(false);
      expect(result.assessmentId).toBeUndefined();
    });

    it('should return valid=false for invalid signatures', () => {
      const assessmentId = 'test-assessment-invalid-sig';
      const timestamp = Date.now();
      const invalidSignature = 'invalid_signature_here';
      const invalidCookie = `${assessmentId}:${timestamp}:${invalidSignature}`;

      const result = validateSessionCookie(invalidCookie, assessmentId);

      expect(result.valid).toBe(false);
      expect(result.assessmentId).toBeUndefined();
    });

    it('should return valid=false for malformed cookies - missing parts', () => {
      const malformedCookie1 = 'only-one-part';
      const malformedCookie2 = 'two:parts';
      const malformedCookie3 = 'too:many:parts:here:now';

      expect(validateSessionCookie(malformedCookie1).valid).toBe(false);
      expect(validateSessionCookie(malformedCookie2).valid).toBe(false);
      expect(validateSessionCookie(malformedCookie3).valid).toBe(false);
    });

    it('should return valid=false for malformed cookies - invalid timestamp', () => {
      const assessmentId = 'test-assessment-invalid-timestamp';
      const invalidTimestamp = 'not-a-number';
      const secret = process.env.SESSION_SECRET!;
      const data = `${assessmentId}:${invalidTimestamp}`;
      const signature = createHmac('sha256', secret)
        .update(data)
        .digest('hex');
      const invalidCookie = `${data}:${signature}`;

      const result = validateSessionCookie(invalidCookie, assessmentId);

      expect(result.valid).toBe(false);
    });

    it('should return valid=false when assessmentId does not match', () => {
      const assessmentId1 = 'test-assessment-1';
      const assessmentId2 = 'test-assessment-2';
      const cookie = createSessionCookie(assessmentId1);

      const result = validateSessionCookie(cookie, assessmentId2);

      expect(result.valid).toBe(false);
      expect(result.assessmentId).toBeUndefined();
    });

    it('should return valid=false for empty cookie string', () => {
      const result = validateSessionCookie('');

      expect(result.valid).toBe(false);
      expect(result.assessmentId).toBeUndefined();
    });

    it('should return valid=false for null/undefined cookie', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result1 = validateSessionCookie(null as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result2 = validateSessionCookie(undefined as any);

      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
    });

    it('should return valid=false for non-string cookie', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result1 = validateSessionCookie(123 as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result2 = validateSessionCookie({} as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result3 = validateSessionCookie([] as any);

      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
      expect(result3.valid).toBe(false);
    });

    it('should return valid=false for future timestamps', () => {
      const assessmentId = 'test-assessment-future';
      const futureTimestamp = Date.now() + 1000000; // Far in the future
      const secret = process.env.SESSION_SECRET!;
      const data = `${assessmentId}:${futureTimestamp}`;
      const signature = createHmac('sha256', secret)
        .update(data)
        .digest('hex');
      const futureCookie = `${data}:${signature}`;

      const result = validateSessionCookie(futureCookie, assessmentId);

      expect(result.valid).toBe(false);
    });

    it('should handle missing environment variables gracefully', () => {
      const assessmentId = 'test-assessment-no-env';
      const cookie = createSessionCookie(assessmentId);

      // Remove environment variables
      const originalSecret = process.env.SESSION_SECRET;
      const originalNextAuthSecret = process.env.NEXTAUTH_SECRET;
      delete process.env.SESSION_SECRET;
      delete process.env.NEXTAUTH_SECRET;

      const result = validateSessionCookie(cookie, assessmentId);

      expect(result.valid).toBe(false);
      expect(result.assessmentId).toBeUndefined();

      // Restore
      process.env.SESSION_SECRET = originalSecret;
      process.env.NEXTAUTH_SECRET = originalNextAuthSecret;
    });

    it('should validate cookies that are just under 24 hours old', () => {
      const assessmentId = 'test-assessment-almost-expired';
      
      // Create a cookie that's 23 hours and 59 minutes old
      const almostExpiredTimestamp = Date.now() - (SESSION_DURATION - 60000); // 1 minute before expiry
      const secret = process.env.SESSION_SECRET!;
      const data = `${assessmentId}:${almostExpiredTimestamp}`;
      const signature = createHmac('sha256', secret)
        .update(data)
        .digest('hex');
      const almostExpiredCookie = `${data}:${signature}`;

      const result = validateSessionCookie(almostExpiredCookie, assessmentId);

      expect(result.valid).toBe(true);
      expect(result.assessmentId).toBe(assessmentId);
    });

    it('should accept cookies with valid signature using NEXTAUTH_SECRET', () => {
      const assessmentId = 'test-assessment-nextauth';
      
      // Temporarily use NEXTAUTH_SECRET
      const originalSecret = process.env.SESSION_SECRET;
      delete process.env.SESSION_SECRET;
      process.env.NEXTAUTH_SECRET = 'nextauth-test-secret';

      const cookie = createSessionCookie(assessmentId);
      const result = validateSessionCookie(cookie, assessmentId);

      expect(result.valid).toBe(true);
      expect(result.assessmentId).toBe(assessmentId);

      // Restore
      process.env.SESSION_SECRET = originalSecret;
    });
  });
});
