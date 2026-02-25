/**
 * Rate Limiter Utility
 * 
 * In-memory rate limiting for authentication endpoints.
 * Tracks failed attempts per IP per assessment with automatic cleanup.
 * 
 * Configuration via environment variables (with sensible defaults):
 * - RATE_LIMIT_ENABLED: Enable/disable rate limiting (default: true)
 * - RATE_LIMIT_MAX_ATTEMPTS: Maximum attempts before blocking (default: 5)
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 900000 = 15 minutes)
 */

interface RateLimitEntry {
  attempts: number
  resetAt: number // Unix timestamp in milliseconds
}

interface RateLimiterConfig {
  maxAttempts: number       // Default: 5
  windowMs: number          // Default: 900000 (15 minutes)
  enabled: boolean          // Default: true
}

interface RateLimitCheckResult {
  allowed: boolean
  retryAfter?: number // Seconds until reset
  remaining?: number  // Attempts remaining
}

// Constants for environment variable validation
const MIN_ATTEMPTS = 1
const MAX_ATTEMPTS = 100
const DEFAULT_ATTEMPTS = 5

const MIN_WINDOW_MS = 60000      // 1 minute minimum
const MAX_WINDOW_MS = 3600000    // 1 hour maximum
const DEFAULT_WINDOW_MS = 900000 // 15 minutes

class RateLimiter {
  private storage: Map<string, RateLimitEntry>
  private config: RateLimiterConfig
  private cleanupInterval: NodeJS.Timeout | null

  constructor(config?: Partial<RateLimiterConfig>) {
    this.storage = new Map()
    this.config = {
      maxAttempts: this.getEnvNumber(
        'RATE_LIMIT_MAX_ATTEMPTS',
        config?.maxAttempts ?? DEFAULT_ATTEMPTS,
        MIN_ATTEMPTS,
        MAX_ATTEMPTS
      ),
      windowMs: this.getEnvNumber(
        'RATE_LIMIT_WINDOW_MS',
        config?.windowMs ?? DEFAULT_WINDOW_MS,
        MIN_WINDOW_MS,
        MAX_WINDOW_MS
      ),
      enabled: this.getEnvBoolean('RATE_LIMIT_ENABLED', config?.enabled ?? true),
    }

    // Start cleanup interval (runs every 5 minutes)
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Check if a request is allowed based on rate limit
   */
  checkLimit(key: string): RateLimitCheckResult {
    // If rate limiting is disabled, always allow
    if (!this.config.enabled) {
      return { allowed: true }
    }

    const now = Date.now()
    const entry = this.storage.get(key)

    // No entry or expired entry - allow request
    if (!entry || now >= entry.resetAt) {
      return {
        allowed: true,
        remaining: this.config.maxAttempts, // Full allowance available, not maxAttempts - 1
      }
    }

    // Check if limit exceeded
    if (entry.attempts >= this.config.maxAttempts) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return {
        allowed: false,
        retryAfter,
        remaining: 0,
      }
    }

    // Within limit
    return {
      allowed: true,
      remaining: this.config.maxAttempts - entry.attempts,
    }
  }

  /**
   * Increment failed attempt counter for a key
   */
  incrementAttempts(key: string): void {
    if (!this.config.enabled) {
      return
    }

    const now = Date.now()
    const entry = this.storage.get(key)

    if (!entry || now >= entry.resetAt) {
      // Create new entry
      this.storage.set(key, {
        attempts: 1,
        resetAt: now + this.config.windowMs,
      })
    } else {
      // Increment existing entry
      entry.attempts += 1
      this.storage.set(key, entry)
    }
  }

  /**
   * Reset attempts for a key (called on successful authentication)
   */
  resetAttempts(key: string): void {
    this.storage.delete(key)
  }

  /**
   * Remove expired entries from storage
   */
  cleanup(): void {
    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetAt) {
        toDelete.push(key)
      }
    }

    for (const key of toDelete) {
      this.storage.delete(key)
    }
  }

  /**
   * Get rate limit headers for inclusion in responses
   */
  getHeaders(key: string): Record<string, string> {
    if (!this.config.enabled) {
      return {}
    }

    const result = this.checkLimit(key)
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': this.config.maxAttempts.toString(),
    }

    if (result.remaining !== undefined) {
      headers['X-RateLimit-Remaining'] = result.remaining.toString()
    }

    const entry = this.storage.get(key)
    if (entry) {
      headers['X-RateLimit-Reset'] = Math.floor(entry.resetAt / 1000).toString()
    }

    return headers
  }

  /**
   * Destroy the rate limiter and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.storage.clear()
  }

  /**
   * Helper to get number from environment with validation and bounds checking
   */
  private getEnvNumber(key: string, fallback: number, min: number, max: number): number {
    const value = process.env[key]
    if (value === undefined) return fallback
    
    const parsed = parseInt(value, 10)
    
    // Invalid number - use fallback
    if (isNaN(parsed)) {
      console.warn(`[RateLimiter] Invalid ${key}="${value}", using default: ${fallback}`)
      return fallback
    }
    
    // Out of bounds - clamp to valid range
    if (parsed < min) {
      console.warn(`[RateLimiter] ${key}=${parsed} below minimum ${min}, using ${min}`)
      return min
    }
    if (parsed > max) {
      console.warn(`[RateLimiter] ${key}=${parsed} above maximum ${max}, using ${max}`)
      return max
    }
    
    return parsed
  }

  /**
   * Helper to get boolean from environment with fallback
   */
  private getEnvBoolean(key: string, fallback: boolean): boolean {
    const value = process.env[key]
    if (value === undefined) return fallback
    return value.toLowerCase() === 'true'
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null

/**
 * Get the global rate limiter instance
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter()
    
    // Warn if using in-memory storage in production
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
      console.warn(
        '[RateLimiter] Running in-memory mode in production. ' +
        'Rate limiting will NOT work across multiple instances. ' +
        'Set REDIS_URL to enable distributed rate limiting.'
      )
    }
  }
  return rateLimiterInstance
}

/**
 * Create a rate limiter key for a specific assessment and IP
 */
export function createRateLimitKey(assessmentId: string, ipAddress: string): string {
  return `${assessmentId}:${ipAddress}`
}

// Export types
export type { RateLimiterConfig, RateLimitCheckResult, RateLimitEntry }
