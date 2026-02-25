/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { getClientIP, isPrivateIP } from '../ip-address'

describe('IP Address Extraction Utility', () => {
  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for (first IP)', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.1')
    })

    it('should handle single IP in x-forwarded-for', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '203.0.113.50',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.50')
    })

    it('should trim whitespace from x-forwarded-for', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '  203.0.113.2  , 198.51.100.2',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.2')
    })

    it('should fall back to x-real-ip when x-forwarded-for not present', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-real-ip': '203.0.113.3',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.3')
    })

    it('should fall back to cf-connecting-ip when others not present', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'cf-connecting-ip': '203.0.113.4',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.4')
    })

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '203.0.113.5',
          'x-real-ip': '198.51.100.5',
          'cf-connecting-ip': '192.0.2.5',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.5')
    })

    it('should handle IPv6-mapped IPv4 addresses', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '::ffff:192.168.1.1',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('should handle pure IPv6 addresses', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    })

    it('should handle compressed IPv6 addresses', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '2001:db8::1',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('2001:db8::1')
    })

    it('should return "unknown" when no IP available', () => {
      const request = new NextRequest('http://localhost:3000')

      const ip = getClientIP(request)
      expect(ip).toMatch(/^unknown-[0-9a-f]{8}$/) // Unique fallback format
    })

    it('should return "unknown" for invalid IP format', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': 'not-an-ip-address',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toMatch(/^unknown-[0-9a-f]{8}$/) // Unique fallback format
    })

    it('should handle empty x-forwarded-for', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toMatch(/^unknown-[0-9a-f]{8}$/) // Unique fallback format
    })

    it('should handle x-forwarded-for with only commas', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': ',,,',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toMatch(/^unknown-[0-9a-f]{8}$/) // Unique fallback format
    })

    it('should handle x-forwarded-for with whitespace only', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '   ',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toMatch(/^unknown-[0-9a-f]{8}$/) // Unique fallback format
    })
  })

  describe('isPrivateIP', () => {
    it('should identify localhost as private', () => {
      expect(isPrivateIP('127.0.0.1')).toBe(true)
      expect(isPrivateIP('127.1.2.3')).toBe(true)
      expect(isPrivateIP('localhost')).toBe(true)
      expect(isPrivateIP('::1')).toBe(true)
    })

    it('should identify 10.x.x.x as private', () => {
      expect(isPrivateIP('10.0.0.1')).toBe(true)
      expect(isPrivateIP('10.255.255.255')).toBe(true)
      expect(isPrivateIP('10.123.45.67')).toBe(true)
    })

    it('should identify 172.16-31.x.x as private', () => {
      expect(isPrivateIP('172.16.0.1')).toBe(true)
      expect(isPrivateIP('172.20.10.5')).toBe(true)
      expect(isPrivateIP('172.31.255.255')).toBe(true)
    })

    it('should not identify 172.15.x.x as private', () => {
      expect(isPrivateIP('172.15.0.1')).toBe(false)
    })

    it('should not identify 172.32.x.x as private', () => {
      expect(isPrivateIP('172.32.0.1')).toBe(false)
    })

    it('should identify 192.168.x.x as private', () => {
      expect(isPrivateIP('192.168.0.1')).toBe(true)
      expect(isPrivateIP('192.168.1.1')).toBe(true)
      expect(isPrivateIP('192.168.255.255')).toBe(true)
    })

    it('should identify unknown as private', () => {
      expect(isPrivateIP('unknown')).toBe(true)
      expect(isPrivateIP('unknown-12345678')).toBe(true) // Unique fallback format
    })

    it('should identify public IPs as not private', () => {
      expect(isPrivateIP('8.8.8.8')).toBe(false)
      expect(isPrivateIP('1.1.1.1')).toBe(false)
      expect(isPrivateIP('203.0.113.1')).toBe(false)
      expect(isPrivateIP('198.51.100.1')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isPrivateIP('192.167.1.1')).toBe(false) // Not 192.168
      expect(isPrivateIP('9.255.255.255')).toBe(false) // Not 10.x
      expect(isPrivateIP('11.0.0.0')).toBe(false) // Not 10.x
    })

    it('should handle empty string', () => {
      expect(isPrivateIP('')).toBe(false)
    })

    it('should handle IPv6 addresses', () => {
      // Currently, function only checks IPv4 private ranges
      // IPv6 would need additional logic
      expect(isPrivateIP('2001:db8::1')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle requests with no headers', () => {
      const request = new NextRequest('http://localhost:3000')
      const ip = getClientIP(request)
      expect(ip).toMatch(/^unknown-[0-9a-f]{8}$/) // Unique fallback format
    })

    it('should handle malformed x-forwarded-for with spaces', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '   ,   ,   ',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toMatch(/^unknown-[0-9a-f]{8}$/) // Unique fallback format
    })

    it('should extract valid IP even if followed by invalid ones', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '203.0.113.10, invalid, another-invalid',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.10')
    })

    it('should handle multiple IPv6-mapped addresses', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '::ffff:192.168.1.1, ::ffff:10.0.0.1',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.1')
    })
  })

  describe('production scenarios', () => {
    it('should handle AWS ALB x-forwarded-for format', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '203.0.113.20, 10.0.1.50',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.20')
    })

    it('should handle Cloudflare headers', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'cf-connecting-ip': '203.0.113.30',
          'x-forwarded-for': '203.0.113.30, 172.68.1.1',
        },
      })

      // x-forwarded-for takes priority
      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.30')
    })

    it('should handle nginx x-real-ip', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-real-ip': '203.0.113.40',
        },
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.40')
    })
  })
})
