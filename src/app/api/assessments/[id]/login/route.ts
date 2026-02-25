import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcrypt'
import { getRateLimiter, createRateLimitKey } from '@/utils/rate-limiter'
import { getClientIP } from '@/utils/ip-address'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Initialize database FIRST
    const { initializeDatabase } = await import('@/db/data-source')
    await initializeDatabase()

    // 2. THEN import query functions
    const { getAssessmentById } = await import('@/db/queries/assessment-queries')

    // 3. Import session utilities
    const { createSessionCookie } = await import('@/utils/session')

    // 4. Parse request body and params
    const { id } = await params
    const body = await request.json()
    const { password } = body

    // 5. Extract IP address and create rate limit key
    const ipAddress = getClientIP(request)
    const rateLimitKey = createRateLimitKey(id, ipAddress)
    const rateLimiter = getRateLimiter()

    // 6. Check rate limit BEFORE password validation
    const rateLimitResult = rateLimiter.checkLimit(rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      )

      // Add rate limit headers
      const headers = rateLimiter.getHeaders(rateLimitKey)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      if (rateLimitResult.retryAfter) {
        response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
      }

      return response
    }

    // 7. Validate password field
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // 7. Fetch assessment with passwordHash field
    const assessment = await getAssessmentById(id)

    // 8. Verify credentials without revealing whether the assessment exists
    // This prevents assessment ID enumeration attacks
    let isPasswordValid = false
    if (assessment?.passwordHash) {
      isPasswordValid = await bcrypt.compare(password, assessment.passwordHash)
    }

    // 9. Return same error for both missing assessment and invalid password
    if (!assessment || !isPasswordValid) {
      // Increment rate limit counter on failed attempt
      rateLimiter.incrementAttempts(rateLimitKey)

      const response = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )

      // Add rate limit headers
      const headers = rateLimiter.getHeaders(rateLimitKey)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    // 10. Get rate limit headers BEFORE reset (for accurate remaining count)
    const rateLimitHeaders = rateLimiter.getHeaders(rateLimitKey)
    
    // 11. Reset rate limit counter on successful authentication
    rateLimiter.resetAttempts(rateLimitKey)

    // 12. Set cookie and return response
    const cookie = createSessionCookie(id)
    const response = NextResponse.json({ success: true })

    response.cookies.set('assessment_session', cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    })

    // Add rate limit headers to success response (using headers from before reset)
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response

  } catch (error) {
    console.error('Error in password login:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
