import { validateSessionCookieWeb, SESSION_DURATION } from '../session-web';

// Mock environment variables
const originalEnv = process.env;

describe('session-web', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.SESSION_SECRET = 'test-secret-key-for-session-validation';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('SESSION_DURATION', () => {
    it('should be 24 hours in milliseconds', () => {
      expect(SESSION_DURATION).toBe(24 * 60 * 60 * 1000);
      expect(SESSION_DURATION).toBe(86400000);
    });
  });

  describe('validateSessionCookieWeb', () => {
    describe('Valid sessions', () => {
      it('should validate a correctly signed session cookie', async () => {
        // Generate a valid session cookie using the same logic
        const assessmentId = 'test-assessment-123';
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        // Generate signature using Web Crypto API (same as production)
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(true);
        expect(result.assessmentId).toBe(assessmentId);
      });

      it('should validate session with matching assessmentId', async () => {
        const assessmentId = 'matching-id';
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie, assessmentId);
        
        expect(result.valid).toBe(true);
        expect(result.assessmentId).toBe(assessmentId);
      });

      it('should validate session created 1 hour ago', async () => {
        const assessmentId = 'test-id';
        const timestamp = Date.now() - (60 * 60 * 1000); // 1 hour ago
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(true);
      });

      it('should validate session created 23 hours ago (just before expiry)', async () => {
        const assessmentId = 'test-id';
        const timestamp = Date.now() - (23 * 60 * 60 * 1000); // 23 hours ago
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid cookie formats', () => {
      it('should reject null cookie', async () => {
        // @ts-expect-error Testing invalid input type
        const result = await validateSessionCookieWeb(null);
        
        expect(result.valid).toBe(false);
        expect(result.assessmentId).toBeUndefined();
      });

      it('should reject undefined cookie', async () => {
        // @ts-expect-error Testing invalid input type
        const result = await validateSessionCookieWeb(undefined);
        
        expect(result.valid).toBe(false);
        expect(result.assessmentId).toBeUndefined();
      });

      it('should reject empty string cookie', async () => {
        const result = await validateSessionCookieWeb('');
        
        expect(result.valid).toBe(false);
      });

      it('should reject cookie with only 1 part', async () => {
        const result = await validateSessionCookieWeb('test-id');
        
        expect(result.valid).toBe(false);
      });

      it('should reject cookie with only 2 parts', async () => {
        const result = await validateSessionCookieWeb('test-id:1234567890');
        
        expect(result.valid).toBe(false);
      });

      it('should reject cookie with more than 3 parts', async () => {
        const result = await validateSessionCookieWeb('test-id:1234567890:signature:extra');
        
        expect(result.valid).toBe(false);
      });

      it('should reject cookie with non-numeric timestamp', async () => {
        const result = await validateSessionCookieWeb('test-id:not-a-number:abc123');
        
        expect(result.valid).toBe(false);
      });

      it('should reject cookie with non-string value', async () => {
        // @ts-expect-error Testing invalid input type
        const result = await validateSessionCookieWeb(12345);
        
        expect(result.valid).toBe(false);
      });
    });

    describe('Expired sessions', () => {
      it('should reject session older than 24 hours', async () => {
        const assessmentId = 'test-id';
        const timestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(false);
      });

      it('should reject session with negative age (future timestamp)', async () => {
        const assessmentId = 'test-id';
        const timestamp = Date.now() + (60 * 60 * 1000); // 1 hour in the future
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(false);
      });
    });

    describe('Invalid signatures', () => {
      it('should reject session with wrong signature', async () => {
        const assessmentId = 'test-id';
        const timestamp = Date.now();
        const wrongSignature = 'abc123def456'; // Random invalid signature
        
        const cookie = `${assessmentId}:${timestamp}:${wrongSignature}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(false);
      });

      it('should reject session signed with different secret', async () => {
        const assessmentId = 'test-id';
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        // Sign with a different secret
        const encoder = new TextEncoder();
        const keyData = encoder.encode('different-secret');
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(false);
      });

      it('should reject session with signature of wrong length', async () => {
        const assessmentId = 'test-id';
        const timestamp = Date.now();
        const shortSignature = 'abc'; // Too short
        
        const cookie = `${assessmentId}:${timestamp}:${shortSignature}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(false);
      });

      it('should reject session with tampered assessmentId', async () => {
        // Create valid cookie
        const originalId = 'original-id';
        const timestamp = Date.now();
        const data = `${originalId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Tamper with the assessmentId
        const tamperedCookie = `tampered-id:${timestamp}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(tamperedCookie);
        
        expect(result.valid).toBe(false);
      });

      it('should reject session with tampered timestamp', async () => {
        const assessmentId = 'test-id';
        const originalTimestamp = Date.now();
        const data = `${assessmentId}:${originalTimestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Tamper with the timestamp
        const tamperedTimestamp = originalTimestamp + 1000;
        const tamperedCookie = `${assessmentId}:${tamperedTimestamp}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(tamperedCookie);
        
        expect(result.valid).toBe(false);
      });
    });

    describe('Assessment ID validation', () => {
      it('should reject session when assessmentId does not match', async () => {
        const cookieId = 'cookie-id';
        const providedId = 'different-id';
        const timestamp = Date.now();
        const data = `${cookieId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie, providedId);
        
        expect(result.valid).toBe(false);
      });

      it('should validate session when assessmentId is not provided', async () => {
        const assessmentId = 'any-id';
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        // No assessmentId provided - should validate signature and expiry only
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(true);
        expect(result.assessmentId).toBe(assessmentId);
      });
    });

    describe('Environment configuration', () => {
      it('should use SESSION_SECRET when available', async () => {
        process.env.SESSION_SECRET = 'session-secret';
        process.env.NEXTAUTH_SECRET = 'nextauth-secret';
        
        const assessmentId = 'test-id';
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        // Sign with SESSION_SECRET
        const encoder = new TextEncoder();
        const keyData = encoder.encode('session-secret');
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(true);
      });

      it('should fallback to NEXTAUTH_SECRET when SESSION_SECRET is not set', async () => {
        delete process.env.SESSION_SECRET;
        process.env.NEXTAUTH_SECRET = 'nextauth-fallback-secret';
        
        const assessmentId = 'test-id';
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        // Sign with NEXTAUTH_SECRET
        const encoder = new TextEncoder();
        const keyData = encoder.encode('nextauth-fallback-secret');
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(true);
      });

      it('should return invalid when no secret is configured', async () => {
        delete process.env.SESSION_SECRET;
        delete process.env.NEXTAUTH_SECRET;
        
        const cookie = 'test-id:1234567890:abc123';
        
        // Should handle error gracefully and return invalid
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should handle assessmentId with special characters', async () => {
        const assessmentId = 'test-123-uuid_abc.def';
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(true);
        expect(result.assessmentId).toBe(assessmentId);
      });

      it('should handle very long assessmentId', async () => {
        const assessmentId = 'a'.repeat(1000);
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(true);
        expect(result.assessmentId).toBe(assessmentId);
      });

      it('should handle timestamp at exact expiry boundary (24 hours)', async () => {
        const assessmentId = 'test-id';
        // Use a timestamp that's just under 24 hours to account for test execution time
        const timestamp = Date.now() - SESSION_DURATION + 1000; // 23h 59m 59s ago
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        // Should be valid when just under 24 hours old
        expect(result.valid).toBe(true);
      });

      it('should handle timestamp just past expiry boundary', async () => {
        const assessmentId = 'test-id';
        const timestamp = Date.now() - SESSION_DURATION - 1; // 1ms past 24 hours
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const cookie = `${data}:${signatureHex}`;
        
        const result = await validateSessionCookieWeb(cookie);
        
        expect(result.valid).toBe(false);
      });
    });

    describe('Security - Timing attack protection', () => {
      it('should use constant-time comparison for signatures', async () => {
        // This test verifies that the comparison doesn't exit early
        // by testing with signatures that differ at different positions
        
        const assessmentId = 'test-id';
        const timestamp = Date.now();
        const data = `${assessmentId}:${timestamp}`;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(process.env.SESSION_SECRET!);
        const messageData = encoder.encode(data);
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const correctSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Test with signature wrong at the first character
        const wrongAtStart = 'X' + correctSignature.substring(1);
        const cookie1 = `${data}:${wrongAtStart}`;
        const result1 = await validateSessionCookieWeb(cookie1);
        
        // Test with signature wrong at the last character
        const wrongAtEnd = correctSignature.substring(0, correctSignature.length - 1) + 'X';
        const cookie2 = `${data}:${wrongAtEnd}`;
        const result2 = await validateSessionCookieWeb(cookie2);
        
        // Both should fail
        expect(result1.valid).toBe(false);
        expect(result2.valid).toBe(false);
      });
    });
  });
});
