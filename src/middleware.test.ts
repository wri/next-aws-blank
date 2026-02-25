// Mock Next.js server modules BEFORE importing
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: jest.fn(() => ({ type: 'next' })),
      redirect: jest.fn((url: URL) => ({
        type: 'redirect',
        status: 307,
        headers: new Map([['location', url.toString()]]),
      })),
    },
  };
});

// Mock the session validation
jest.mock('@/utils/session', () => ({
  validateSessionCookie: jest.fn()
}));

import { NextResponse, NextRequest } from 'next/server';
import { validateSessionCookie } from '@/utils/session';
import { middleware } from './middleware';

const mockValidateSessionCookie = validateSessionCookie as jest.MockedFunction<typeof validateSessionCookie>;
const mockNext = NextResponse.next as jest.MockedFunction<typeof NextResponse.next>;
const mockRedirect = NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>;

/**
 * Helper to create a mock NextRequest
 */
function createMockRequest(url: string, cookies: Record<string, string> = {}) {
  const mockRequest = {
    nextUrl: new URL(url),
    url,
    cookies: {
      get: jest.fn((name: string) => {
        const value = cookies[name];
        return value ? { name, value } : undefined;
      }),
    },
  };

  return mockRequest;
}

describe('Middleware Authentication', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Excluded Routes', () => {
    it('allows access to /assessment/setup without session', () => {
      const request = createMockRequest('http://localhost:3000/assessment/setup');
      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });

    it('allows access to /assessment/{id}/created without session', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/created');
      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });

    it('allows access to /assessment/setup/step-2 without session', () => {
      const request = createMockRequest('http://localhost:3000/assessment/setup/step-2');
      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Overview Page (/assessment/[id])', () => {
    it('allows unauthenticated access to overview page', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id');
      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      // Should not validate session - page handles auth
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });

    it('allows authenticated access to overview page', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id', {
        assessment_session: 'valid-session-cookie'
      });
      mockValidateSessionCookie.mockReturnValue({ valid: true });

      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      // Should not validate - overview page handles its own auth
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Theme Pages (/assessment/[id]/[theme])', () => {
    it('redirects unauthenticated users from theme pages to overview', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/enabling-conditions');
      middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      
      // Check redirect URL
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('No session - redirecting to overview')
      );
    });

    it('redirects users with invalid session from theme pages', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/motivate', {
        assessment_session: 'invalid-session'
      });
      mockValidateSessionCookie.mockReturnValue({ valid: false });

      middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(mockValidateSessionCookie).toHaveBeenCalledWith('invalid-session', 'test-id');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid session - redirecting to overview')
      );
    });

    it('allows authenticated users to access theme pages', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/enable', {
        assessment_session: 'valid-session'
      });
      mockValidateSessionCookie.mockReturnValue({ valid: true });

      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).toHaveBeenCalledWith('valid-session', 'test-id');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Valid session for /assessment/test-id/enable')
      );
    });

    it('redirects when session is for different assessment ID', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/implement', {
        assessment_session: 'session-for-other-id'
      });
      mockValidateSessionCookie.mockReturnValue({ valid: false });

      middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(mockValidateSessionCookie).toHaveBeenCalledWith('session-for-other-id', 'test-id');
    });
  });

  describe('Multiple Theme Variations', () => {
    const themes = ['motivate', 'enable', 'implement', 'enabling-conditions'];
    
    themes.forEach(theme => {
      it(`enforces authentication on /${theme} theme page`, () => {
        const request = createMockRequest(`http://localhost:3000/assessment/abc123/${theme}`);
        middleware(request as unknown as NextRequest);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalled();
        const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
        expect(redirectUrl.pathname).toBe('/assessment/abc123');
      });
    });
  });

  describe('Error Handling', () => {
    it('redirects to overview on session validation error', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/motivate', {
        assessment_session: 'malformed-session'
      });
      mockValidateSessionCookie.mockImplementation(() => {
        throw new Error('Validation error');
      });

      middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Middleware] Error during session validation:',
        expect.any(Error)
      );
    });

    it('handles errors gracefully on non-assessment routes', () => {
      const request = createMockRequest('http://localhost:3000/some-other-route');
      
      // Even if validation throws, non-matching routes should pass through
      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles assessment IDs with special characters', () => {
      const request = createMockRequest('http://localhost:3000/assessment/uuid-123-abc/motivate');
      middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/uuid-123-abc');
    });

    it('does not match assessment routes with extra path segments', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/motivate/extra');
      middleware(request as unknown as NextRequest);

      // Should not match the pattern, so it passes through
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });

    it('handles missing session cookie gracefully', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/enable');
      // No cookies provided
      
      middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
    });
  });

  describe('Redirect Loop Prevention', () => {
    it('overview page never redirects (prevents loops)', () => {
      // Even with no session, overview should not redirect to itself
      const request = createMockRequest('http://localhost:3000/assessment/test-id');
      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('overview page with invalid session does not redirect', () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id', {
        assessment_session: 'invalid'
      });
      mockValidateSessionCookie.mockReturnValue({ valid: false });

      middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      // Should not even validate - overview handles its own auth
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Session Validation Details', () => {
    it('validates session with correct assessment ID', () => {
      const request = createMockRequest('http://localhost:3000/assessment/correct-id/motivate', {
        assessment_session: 'session-cookie'
      });
      mockValidateSessionCookie.mockReturnValue({ valid: true });

      middleware(request as unknown as NextRequest);

      expect(mockValidateSessionCookie).toHaveBeenCalledWith('session-cookie', 'correct-id');
    });

    it('extracts assessment ID correctly from URL', () => {
      const request = createMockRequest('http://localhost:3000/assessment/uuid-abc-123/enable', {
        assessment_session: 'test-session'
      });
      mockValidateSessionCookie.mockReturnValue({ valid: true });

      middleware(request as unknown as NextRequest);

      expect(mockValidateSessionCookie).toHaveBeenCalledWith('test-session', 'uuid-abc-123');
    });
  });
});
