import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSessionCookie } from '@/utils/session';

/**
 * Middleware for session validation and authentication enforcement
 * 
 * This middleware enforces authentication on protected assessment routes:
 * - Overview page (/assessment/[id]) - allowed without session (shows PasswordPrompt)
 * - Theme pages (/assessment/[id]/[theme]) - requires valid session, redirects if missing
 * 
 * Protected routes requiring authentication:
 * - /assessment/[id]/[theme] (Question pages)
 * 
 * Excluded routes (no validation):
 * - /assessment/setup (assessment creation)
 * - /assessment/[id]/created (success modal after creation)
 * - /assessment/[id] (overview - handles auth via PasswordPrompt component)
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  try {
    // Check if route is excluded from protection
    const excludedPatterns = [
      /^\/assessment\/setup/,
      /^\/assessment\/[^\/]+\/created$/,
    ];

    const isExcluded = excludedPatterns.some(pattern => pattern.test(path));
    if (isExcluded) {
      // Excluded routes - no validation needed
      return NextResponse.next();
    }

    // Check if route needs protection
    // Matches: /assessment/[id] or /assessment/[id]/[theme]
    const protectedRoutePattern = /^\/assessment\/([^\/]+)(?:\/([^\/]+))?$/;
    const match = path.match(protectedRoutePattern);

    if (!match) {
      // Not a protected route
      return NextResponse.next();
    }

    // Extract assessment ID and optional theme from URL
    const assessmentId = match[1];
    const theme = match[2]; // undefined for overview page

    // Allow overview page to pass through - it has its own PasswordPrompt
    if (!theme) {
      return NextResponse.next();
    }

    // For all other assessment routes (theme pages), enforce authentication
    const sessionCookie = request.cookies.get('assessment_session');

    if (!sessionCookie) {
      // No session - redirect to overview page
      const overviewUrl = new URL(`/assessment/${assessmentId}`, request.url);
      console.log(`[Middleware] No session - redirecting to overview: ${overviewUrl.pathname}`);
      return NextResponse.redirect(overviewUrl);
    }

    // Validate session
    const validationResult = validateSessionCookie(
      sessionCookie.value,
      assessmentId
    );

    if (!validationResult.valid) {
      // Invalid or expired session - redirect to overview page
      const overviewUrl = new URL(`/assessment/${assessmentId}`, request.url);
      console.log(`[Middleware] Invalid session - redirecting to overview: ${overviewUrl.pathname}`);
      return NextResponse.redirect(overviewUrl);
    }

    // Valid session - allow access
    console.log(`[Middleware] Valid session for ${path}`);
    return NextResponse.next();

  } catch (error) {
    // Log error and redirect to overview for safety
    console.error('[Middleware] Error during session validation:', error);
    
    // Extract assessment ID if possible for redirect
    const match = path.match(/^\/assessment\/([^\/]+)/);
    if (match) {
      const assessmentId = match[1];
      const overviewUrl = new URL(`/assessment/${assessmentId}`, request.url);
      return NextResponse.redirect(overviewUrl);
    }
    
    // If we can't extract ID, let it through (will likely 404)
    return NextResponse.next();
  }
}

/**
 * Middleware configuration
 * 
 * Matcher patterns define which routes this middleware runs on.
 * Using a broad matcher for all /assessment routes, with exclusions
 * handled in the middleware logic for better control.
 */
export const config = {
  matcher: [
    '/assessment/:id*',
  ],
};
