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

// Mock the session validation (Web Crypto version for Edge Runtime)
jest.mock('@/utils/session-web', () => ({
  validateSessionCookieWeb: jest.fn()
}));

import { NextResponse, NextRequest } from 'next/server';
import { validateSessionCookieWeb } from '@/utils/session-web';
import { middleware } from './middleware';

const mockValidateSessionCookie = validateSessionCookieWeb as jest.MockedFunction<typeof validateSessionCookieWeb>;
const mockNext = NextResponse.next as jest.MockedFunction<typeof NextResponse.next>;
const mockRedirect = NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>;

/**
 * Helper to create a mock NextRequest
 */
function createMockRequest(url: string, cookies: Record<string, string> = {}) {
  const cookieEntries = Object.entries(cookies).map(([name, value]) => ({ name, value }));
  
  const mockRequest = {
    nextUrl: new URL(url),
    url,
    method: 'GET',
    cookies: {
      get: jest.fn((name: string) => {
        const value = cookies[name];
        return value ? { name, value } : undefined;
      }),
      getAll: jest.fn(() => cookieEntries),
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
    it('allows access to /assessment/setup without session', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/setup');
      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });

    it('allows access to /assessment/{id}/created without session', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/created');
      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });

    it('allows access to /assessment/setup/step-2 without session', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/setup/step-2');
      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Overview Page (/assessment/[id])', () => {
    it('allows unauthenticated access to overview page', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id');
      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      // Should not validate session - page handles auth
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });

    it('allows authenticated access to overview page', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id', {
        assessment_session: 'valid-session-cookie'
      });
      mockValidateSessionCookie.mockResolvedValue({ valid: true });

      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      // Should not validate - overview page handles its own auth
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Theme Pages (/assessment/[id]/[theme])', () => {
    it('redirects unauthenticated users from theme pages to overview', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/enabling-conditions');
      await middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      
      // Check redirect URL includes returnTo parameter
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/assessment/test-id/enabling-conditions');
    });

    it('redirects users with invalid session from theme pages', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/motivate', {
        assessment_session: 'invalid-session'
      });
      mockValidateSessionCookie.mockResolvedValue({ valid: false });

      await middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/assessment/test-id/motivate');
      expect(mockValidateSessionCookie).toHaveBeenCalledWith('invalid-session', 'test-id');
    });

    it('allows authenticated users to access theme pages', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/enable', {
        assessment_session: 'valid-session'
      });
      mockValidateSessionCookie.mockResolvedValue({ valid: true });

      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).toHaveBeenCalledWith('valid-session', 'test-id');
    });

    it('redirects when session is for different assessment ID', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/implement', {
        assessment_session: 'session-for-other-id'
      });
      mockValidateSessionCookie.mockResolvedValue({ valid: false });

      await middleware(request as unknown as NextRequest);

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
      it(`enforces authentication on /${theme} theme page`, async () => {
        const request = createMockRequest(`http://localhost:3000/assessment/abc123/${theme}`);
        await middleware(request as unknown as NextRequest);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalled();
        const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
        expect(redirectUrl.pathname).toBe('/assessment/abc123');
        expect(redirectUrl.searchParams.get('returnTo')).toBe(`/assessment/abc123/${theme}`);
      });
    });
  });

  describe('Error Handling', () => {
    it('redirects to overview on session validation error', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/motivate', {
        assessment_session: 'malformed-session'
      });
      mockValidateSessionCookie.mockImplementation(() => {
        throw new Error('Validation error');
      });

      await middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Middleware] Session validation error:',
        expect.any(String)
      );
    });

    it('handles errors gracefully on non-assessment routes', async () => {
      const request = createMockRequest('http://localhost:3000/some-other-route');
      
      // Even if validation throws, non-matching routes should pass through
      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles assessment IDs with special characters', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/uuid-123-abc/motivate');
      await middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/uuid-123-abc');
    });

    it('matches assessment routes with extra path segments and enforces authentication', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/motivate/extra');
      await middleware(request as unknown as NextRequest);

      // It matches, so we expect a redirect to the overview page if there is no session
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/assessment/test-id/motivate/extra');
    });

    it('handles missing session cookie gracefully', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/enable');
      // No cookies provided
      
      await middleware(request as unknown as NextRequest);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
    });
  });

  describe('Redirect Loop Prevention', () => {
    it('overview page never redirects (prevents loops)', async () => {
      // Even with no session, overview should not redirect to itself
      const request = createMockRequest('http://localhost:3000/assessment/test-id');
      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('overview page with invalid session does not redirect', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id', {
        assessment_session: 'invalid'
      });
      mockValidateSessionCookie.mockResolvedValue({ valid: false });

      await middleware(request as unknown as NextRequest);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      // Should not even validate - overview handles its own auth
      expect(mockValidateSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe('Session Validation Details', () => {
    it('validates session with correct assessment ID', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/correct-id/motivate', {
        assessment_session: 'session-cookie'
      });
      mockValidateSessionCookie.mockResolvedValue({ valid: true });

      await middleware(request as unknown as NextRequest);

      expect(mockValidateSessionCookie).toHaveBeenCalledWith('session-cookie', 'correct-id');
    });

    it('extracts assessment ID correctly from URL', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/uuid-abc-123/enable', {
        assessment_session: 'test-session'
      });
      mockValidateSessionCookie.mockResolvedValue({ valid: true });

      await middleware(request as unknown as NextRequest);

      expect(mockValidateSessionCookie).toHaveBeenCalledWith('test-session', 'uuid-abc-123');
    });
  });

  describe('Return URL (Deep Link) Functionality', () => {
    it('includes returnTo parameter when redirecting unauthenticated user from theme page', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/implement');
      await middleware(request as unknown as NextRequest);

      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/assessment/test-id/implement');
    });

    it('includes returnTo parameter when redirecting user with invalid session', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/my-assessment/enabling-conditions', {
        assessment_session: 'expired-session'
      });
      mockValidateSessionCookie.mockResolvedValue({ valid: false });

      await middleware(request as unknown as NextRequest);

      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/my-assessment');
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/assessment/my-assessment/enabling-conditions');
    });

    it('includes returnTo when session validation throws error', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id/motivate', {
        assessment_session: 'bad-session'
      });
      mockValidateSessionCookie.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      await middleware(request as unknown as NextRequest);

      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/assessment/test-id');
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/assessment/test-id/motivate');
    });

    it('does not include returnTo when overview page is accessed', async () => {
      const request = createMockRequest('http://localhost:3000/assessment/test-id');
      await middleware(request as unknown as NextRequest);

      // Overview page should not redirect
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
