// import { NextRequest } from 'next/server';

// Mock Next.js server
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body, init) => {
      const mockHeaders = new Map<string, string>();
      const mockResponse = {
        json: async () => body,
        status: init?.status || 200,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        cookies: {
          set: jest.fn()
        },
        headers: {
          set: jest.fn((key: string, value: string) => {
            mockHeaders.set(key, value);
          }),
          get: jest.fn((key: string) => mockHeaders.get(key)),
          has: jest.fn((key: string) => mockHeaders.has(key)),
        }
      };
      return mockResponse;
    })
  }
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));

// Mock database modules
jest.mock('@/db/data-source', () => ({
  AppDataSource: {
    isInitialized: false,
    initialize: jest.fn().mockResolvedValue(undefined)
  },
  initializeDatabase: jest.fn().mockResolvedValue(undefined)
}));

// Mock assessment queries
jest.mock('@/db/queries/assessment-queries', () => ({
  getAssessmentById: jest.fn()
}));

// Mock session utilities
jest.mock('@/utils/session', () => ({
  createSessionCookie: jest.fn()
}));

// Mock rate limiter
jest.mock('@/utils/rate-limiter', () => {
  const mockCheckLimit = jest.fn();
  const mockIncrementAttempts = jest.fn();
  const mockResetAttempts = jest.fn();
  const mockGetHeaders = jest.fn();

  return {
    getRateLimiter: jest.fn(() => ({
      checkLimit: mockCheckLimit,
      incrementAttempts: mockIncrementAttempts,
      resetAttempts: mockResetAttempts,
      getHeaders: mockGetHeaders,
    })),
    createRateLimitKey: jest.fn((assessmentId, ip) => `${assessmentId}:${ip}`),
    __mockCheckLimit: mockCheckLimit,
    __mockIncrementAttempts: mockIncrementAttempts,
    __mockResetAttempts: mockResetAttempts,
    __mockGetHeaders: mockGetHeaders,
  };
});

// Mock IP address extraction
jest.mock('@/utils/ip-address', () => ({
  getClientIP: jest.fn()
}));

// Import after mocks are set up
import { POST } from './route';
import * as bcrypt from 'bcrypt';
import { getAssessmentById } from '@/db/queries/assessment-queries';
import { createSessionCookie } from '@/utils/session';
import { getClientIP } from '@/utils/ip-address';
import { 
  getRateLimiter, 
  createRateLimitKey,
  // @ts-expect-error - accessing mock helpers
  __mockCheckLimit,
  // @ts-expect-error - accessing mock helpers
  __mockIncrementAttempts,
  // @ts-expect-error - accessing mock helpers
  __mockResetAttempts,
  // @ts-expect-error - accessing mock helpers
  __mockGetHeaders,
} from '@/utils/rate-limiter';

// Mock data
const mockAssessment = {
  id: 'assessment-123',
  leadId: 'lead-123',
  regionId: 'region-123',
  diagnosticId: 'diagnostic-123',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
  diagnosticYear: '2026',
  projectType: 'other',
  status: 'draft'
};

// Helper to create mock request
function createMockRequest(body: { password?: string } = {}) {
  return {
    json: jest.fn().mockResolvedValue(body)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

// Helper to create mock params
function createMockParams(id: string) {
  return Promise.resolve({ id });
}

describe('POST /api/assessments/[id]/login', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set test environment
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
    process.env.SESSION_SECRET = 'test-secret-key';

    // Setup default mock implementations
    (getAssessmentById as jest.Mock).mockResolvedValue(mockAssessment);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (createSessionCookie as jest.Mock).mockReturnValue('mock-cookie-value');
    (getClientIP as jest.Mock).mockReturnValue('192.168.1.1');

    // Setup rate limiter mocks
    __mockCheckLimit.mockReturnValue({ allowed: true, remaining: 4 });
    __mockGetHeaders.mockReturnValue({
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '4',
      'X-RateLimit-Reset': '1234567890'
    });
  });

  describe('Successful login (200)', () => {
    it('should return success with valid password', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should verify password with bcrypt.compare', async () => {
      const request = createMockRequest({ password: 'test-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'test-password',
        mockAssessment.passwordHash
      );
    });

    it('should set assessment_session cookie correctly', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');
      (createSessionCookie as jest.Mock).mockReturnValue('session-cookie-123');

      const response = await POST(request, { params });

      expect(createSessionCookie).toHaveBeenCalledWith('assessment-123');
      expect(response.cookies.set).toHaveBeenCalledWith(
        'assessment_session',
        'session-cookie-123',
        expect.objectContaining({
          httpOnly: true,
          secure: false, // test environment
          sameSite: 'strict',
          maxAge: 86400,
          path: '/'
        })
      );
    });

    it('should set secure=true in production environment', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).toHaveBeenCalledWith(
        'assessment_session',
        expect.any(String),
        expect.objectContaining({
          secure: true
        })
      );
    });

    it('should set secure=false in development environment', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).toHaveBeenCalledWith(
        'assessment_session',
        expect.any(String),
        expect.objectContaining({
          secure: false
        })
      );
    });
  });

  describe('Invalid password (401)', () => {
    it('should return 401 with incorrect password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const request = createMockRequest({ password: 'wrong-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should not set cookie on invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const request = createMockRequest({ password: 'wrong-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).not.toHaveBeenCalled();
    });

    it('should not create session cookie on invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const request = createMockRequest({ password: 'wrong-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(createSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Missing password field (400)', () => {
    it('should return 400 when password is missing', async () => {
      const request = createMockRequest({});
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password is required');
    });

    it('should return 400 when password is empty string', async () => {
      const request = createMockRequest({ password: '' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password is required');
    });

    it('should return 400 when password is not a string', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request = createMockRequest({ password: 123 as any });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password is required');
    });

    it('should not query database when password is missing', async () => {
      const request = createMockRequest({});
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(getAssessmentById).not.toHaveBeenCalled();
    });

    it('should not set cookie when password is missing', async () => {
      const request = createMockRequest({});
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).not.toHaveBeenCalled();
    });
  });

  describe('Assessment not found (401 to prevent enumeration)', () => {
    it('should return 401 when assessment does not exist', async () => {
      (getAssessmentById as jest.Mock).mockResolvedValue(null);
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('nonexistent-id');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should not check password when assessment not found', async () => {
      (getAssessmentById as jest.Mock).mockResolvedValue(null);
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('nonexistent-id');

      await POST(request, { params });

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should increment rate limit on missing assessment', async () => {
      (getAssessmentById as jest.Mock).mockResolvedValue(null);
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('nonexistent-id');

      await POST(request, { params });

      expect(__mockIncrementAttempts).toHaveBeenCalled();
    });

    it('should not set cookie when assessment not found', async () => {
      (getAssessmentById as jest.Mock).mockResolvedValue(null);
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('nonexistent-id');

      const response = await POST(request, { params });

      expect(response.cookies.set).not.toHaveBeenCalled();
    });

    it('should query database with correct assessment ID', async () => {
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('specific-assessment-id');

      await POST(request, { params });

      expect(getAssessmentById).toHaveBeenCalledWith('specific-assessment-id');
    });
  });

  describe('Cookie properties', () => {
    it('should set httpOnly=true', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ httpOnly: true })
      );
    });

    it('should set sameSite=strict', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ sameSite: 'strict' })
      );
    });

    it('should set maxAge=86400 (24 hours in seconds)', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ maxAge: 86400 })
      );
    });

    it('should set path=/', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ path: '/' })
      );
    });

    it('should set cookie name as assessment_session', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).toHaveBeenCalledWith(
        'assessment_session',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      (getAssessmentById as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('An unexpected error occurred. Please try again later.');
    });

    it('should return 500 on bcrypt error', async () => {
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt comparison failed')
      );
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('An unexpected error occurred. Please try again later.');
    });

    it('should not set cookie on internal error', async () => {
      (getAssessmentById as jest.Mock).mockRejectedValue(
        new Error('Internal error')
      );
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.cookies.set).not.toHaveBeenCalled();
    });
  });

  describe('Database initialization', () => {
    it('should initialize database before processing request', async () => {
      const { initializeDatabase } = await import('@/db/data-source');
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(initializeDatabase).toHaveBeenCalled();
    });
  });

  describe('Multiple requests', () => {
    it('should handle different assessment IDs correctly', async () => {
      const request1 = createMockRequest({ password: 'password1' });
      const params1 = createMockParams('assessment-111');

      const request2 = createMockRequest({ password: 'password2' });
      const params2 = createMockParams('assessment-222');

      await POST(request1, { params: params1 });
      await POST(request2, { params: params2 });

      expect(getAssessmentById).toHaveBeenCalledWith('assessment-111');
      expect(getAssessmentById).toHaveBeenCalledWith('assessment-222');
      expect(createSessionCookie).toHaveBeenCalledWith('assessment-111');
      expect(createSessionCookie).toHaveBeenCalledWith('assessment-222');
    });

    it('should create unique cookies for each successful login', async () => {
      (createSessionCookie as jest.Mock)
        .mockReturnValueOnce('cookie-1')
        .mockReturnValueOnce('cookie-2');

      const request1 = createMockRequest({ password: 'password1' });
      const params1 = createMockParams('assessment-111');

      const request2 = createMockRequest({ password: 'password2' });
      const params2 = createMockParams('assessment-222');

      const response1 = await POST(request1, { params: params1 });
      const response2 = await POST(request2, { params: params2 });

      expect(response1.cookies.set).toHaveBeenCalledWith(
        'assessment_session',
        'cookie-1',
        expect.any(Object)
      );
      expect(response2.cookies.set).toHaveBeenCalledWith(
        'assessment_session',
        'cookie-2',
        expect.any(Object)
      );
    });
  });

  describe('Rate limiting', () => {
    it('should extract IP address from request', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(getClientIP).toHaveBeenCalledWith(request);
    });

    it('should create rate limit key with assessment ID and IP', async () => {
      (getClientIP as jest.Mock).mockReturnValue('203.0.113.1');
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(createRateLimitKey).toHaveBeenCalledWith('assessment-123', '203.0.113.1');
      expect(getRateLimiter).toHaveBeenCalled();
    });

    it('should check rate limit before password validation', async () => {
      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      // Verify checkLimit was called
      expect(__mockCheckLimit).toHaveBeenCalled();
    });

    it('should return 429 when rate limit exceeded', async () => {
      __mockCheckLimit.mockReturnValue({ 
        allowed: false, 
        retryAfter: 600,
        remaining: 0 
      });

      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many login attempts. Please try again later.');
      expect(data.retryAfter).toBe(600);
    });

    it('should include Retry-After header in 429 response', async () => {
      __mockCheckLimit.mockReturnValue({ 
        allowed: false, 
        retryAfter: 900,
        remaining: 0 
      });
      __mockGetHeaders.mockReturnValue({
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '1234567890'
      });

      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      // Verify the response status and Retry-After header
      expect(response.status).toBe(429);
      expect(response.headers.set).toHaveBeenCalledWith('Retry-After', '900');
    });

    it('should include rate limit headers in 429 response', async () => {
      __mockCheckLimit.mockReturnValue({ 
        allowed: false, 
        retryAfter: 600,
        remaining: 0 
      });
      __mockGetHeaders.mockReturnValue({
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '1234567890'
      });

      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(__mockGetHeaders).toHaveBeenCalled();
      // Verify specific header values
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Reset', '1234567890');
    });

    it('should not check password when rate limited', async () => {
      __mockCheckLimit.mockReturnValue({ 
        allowed: false, 
        retryAfter: 600,
        remaining: 0 
      });

      const request = createMockRequest({ password: 'any-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(getAssessmentById).not.toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should increment counter on failed authentication', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const request = createMockRequest({ password: 'wrong-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(__mockIncrementAttempts).toHaveBeenCalled();
    });

    it('should not increment counter on successful authentication', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(__mockIncrementAttempts).not.toHaveBeenCalled();
    });

    it('should reset counter on successful authentication', async () => {
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      await POST(request, { params });

      expect(__mockResetAttempts).toHaveBeenCalled();
    });

    it('should include rate limit headers in success response', async () => {
      __mockGetHeaders.mockReturnValue({
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '3',
        'X-RateLimit-Reset': '1234567890'
      });
      
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(__mockGetHeaders).toHaveBeenCalled();
      // Verify specific header values
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '3');
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Reset', '1234567890');
    });

    it('should include rate limit headers in 401 response', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      __mockGetHeaders.mockReturnValue({
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '2',
        'X-RateLimit-Reset': '1234567890'
      });
      
      const request = createMockRequest({ password: 'wrong-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(__mockGetHeaders).toHaveBeenCalled();
      // Verify specific header values
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '2');
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Reset', '1234567890');
    });

    it('should isolate rate limits per assessment', async () => {
      (getClientIP as jest.Mock).mockReturnValue('203.0.113.5');
      
      const request1 = createMockRequest({ password: 'password1' });
      const params1 = createMockParams('assessment-aaa');

      const request2 = createMockRequest({ password: 'password2' });
      const params2 = createMockParams('assessment-bbb');

      await POST(request1, { params: params1 });
      await POST(request2, { params: params2 });

      expect(createRateLimitKey).toHaveBeenCalledWith('assessment-aaa', '203.0.113.5');
      expect(createRateLimitKey).toHaveBeenCalledWith('assessment-bbb', '203.0.113.5');
    });

    it('should isolate rate limits per IP', async () => {
      (getClientIP as jest.Mock)
        .mockReturnValueOnce('203.0.113.10')
        .mockReturnValueOnce('203.0.113.20');
      
      const request1 = createMockRequest({ password: 'password1' });
      const params1 = createMockParams('assessment-123');

      const request2 = createMockRequest({ password: 'password2' });
      const params2 = createMockParams('assessment-123');

      await POST(request1, { params: params1 });
      await POST(request2, { params: params2 });

      expect(createRateLimitKey).toHaveBeenCalledWith('assessment-123', '203.0.113.10');
      expect(createRateLimitKey).toHaveBeenCalledWith('assessment-123', '203.0.113.20');
    });

    it('should handle missing IP address gracefully', async () => {
      (getClientIP as jest.Mock).mockReturnValue('unknown');
      const request = createMockRequest({ password: 'correct-password' });
      const params = createMockParams('assessment-123');

      const response = await POST(request, { params });

      expect(response.status).toBe(200);
      expect(createRateLimitKey).toHaveBeenCalledWith('assessment-123', 'unknown');
    });
  });
});
