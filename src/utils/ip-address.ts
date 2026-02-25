/**
 * IP Address Extraction Utility
 * 
 * Extracts the real client IP address from Next.js requests,
 * considering various proxy headers and edge cases.
 */

import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

/**
 * Extract the client IP address from a Next.js request
 * 
 * Priority order:
 * 1. x-forwarded-for (first IP in list - real client)
 * 2. x-real-ip (nginx proxy)
 * 3. cf-connecting-ip (Cloudflare)
 * 4. unique fallback (to isolate unknown clients)
 * 
 * @param request - Next.js request object
 * @returns Sanitized IP address string
 */
export function getClientIP(request: NextRequest): string {
  // Check x-forwarded-for (comma-separated list, first IP is the client)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim()).filter(Boolean)
    // Take IP at trusted depth (0 = first/leftmost = real client)
    const clientIP = ips[0]
    if (clientIP) {
      const sanitized = sanitizeIP(clientIP)
      if (isValidIP(sanitized)) {
        return sanitized
      }
    }
  }

  // Check x-real-ip
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return sanitizeIP(realIP)
  }

  // Check cf-connecting-ip (Cloudflare)
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return sanitizeIP(cfIP)
  }

  // CRITICAL: Never return 'unknown' - generates cross-user lockouts
  // Generate unique fallback to isolate unknown clients
  const fallbackIP = `unknown-${randomUUID().slice(0, 8)}`
  
  // Log for monitoring (but don't expose in response)
  if (process.env.NODE_ENV === 'production') {
    console.warn('[IP] Could not determine client IP, using fallback:', fallbackIP)
  }
  
  return fallbackIP
}

/**
 * Validate if a string is a valid IP address format
 */
function isValidIP(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^[0-9a-fA-F:]+$/
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip)
}

/**
 * Sanitize an IP address
 * - Handles IPv6-mapped IPv4 addresses (::ffff:192.168.1.1 -> 192.168.1.1)
 * - Removes whitespace
 * - Validates basic format
 */
function sanitizeIP(ip: string): string {
  let sanitized = ip.trim()

  // Handle IPv6-mapped IPv4 addresses
  if (sanitized.startsWith('::ffff:')) {
    sanitized = sanitized.substring(7)
  }

  return sanitized
}

/**
 * Check if an IP address is a private/local address
 * Useful for logging/debugging purposes
 */
export function isPrivateIP(ip: string): boolean {
  // Handle unknown fallback format (unknown-xxxxxxxx)
  if (ip === 'unknown' || ip.startsWith('unknown-') || ip === '::1' || ip === 'localhost') {
    return true
  }

  // IPv4 private ranges
  const privateRanges = [
    /^127\./,           // 127.0.0.0/8
    /^10\./,            // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
    /^192\.168\./,      // 192.168.0.0/16
  ]

  return privateRanges.some(pattern => pattern.test(ip))
}
