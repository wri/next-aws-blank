# Session, Cookie, CORS & Security Headers

Review cookie configuration, CORS policies, and HTTP security response headers.

## Cookies

### What to Check

```bash
grep -RInIE "(cookie|session|setCookie|res\.cookie)" apps/ --include="*.ts"
```

For every cookie set, verify the following flags are present:

| Flag | Required | Purpose |
|------|----------|---------|
| `HttpOnly` | Yes (for session cookies) | Prevents JS access (XSS mitigation) |
| `Secure` | Yes (production) | HTTPS-only transmission |
| `SameSite=Strict` or `Lax` | Yes | CSRF mitigation |
| `Path=/` | Recommended | Scope the cookie correctly |
| `Max-Age` / `Expires` | Recommended | Explicit expiry |

### Findings

| Finding | Severity |
|---------|----------|
| Session cookie missing `HttpOnly` | **High** |
| Session cookie missing `Secure` in production | **High** |
| Session cookie missing `SameSite` | **Medium** |
| Overly long-lived session cookie (>24h for sensitive apps) | **Low** |

## CORS

### What to Check

```bash
grep -RInE "cors|Access-Control|origin" apps/ --include="*.ts" -i
```

**Unsafe patterns:**
```typescript
// Wildcard — dangerous if credentials are also allowed
app.use(cors({ origin: '*', credentials: true })); // CRITICAL

// Dynamic origin reflection without allowlist
app.use(cors({ origin: req.headers.origin })); // HIGH
```

**Safe pattern:**
```typescript
app.use(cors({
  origin: ['https://<your-allowed-origin-1>', 'https://<your-allowed-origin-2>'],
  credentials: true,
}));
```

### Findings

| Finding | Severity |
|---------|----------|
| `origin: '*'` with `credentials: true` | **Critical** |
| Reflected `Origin` without allowlist validation | **High** |
| Overly broad CORS allowlist (e.g., `*.example.com` without validation) | **Medium** |
| No CORS configuration on public API (may be intentional — document it) | **Info** |

## Security Response Headers

### What to Check

```bash
grep -RInE "helmet|Content-Security-Policy|X-Frame-Options|Strict-Transport" apps/ --include="*.ts" -i
```

Verify [Helmet.js](https://helmetjs.github.io/) or equivalent is configured and not disabled. Minimum headers required:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Prevent clickjacking |
| `Content-Security-Policy` | Restrictive policy | Prevent XSS |
| `Referrer-Policy` | `no-referrer` or `strict-origin` | Limit referrer leakage |
| `Permissions-Policy` | Disable unused browser features | Defense in depth |

### Findings

| Finding | Severity |
|---------|----------|
| No security headers configured at all | **High** |
| Missing HSTS | **Medium** |
| Missing CSP | **Medium** |
| Helmet installed but overridden with permissive values | **Medium** |

## Rate Limiting

```bash
grep -RInE "rateLimit|throttle|express-rate-limit|ThrottlerGuard" apps/ --include="*.ts" -i
```

- Is rate limiting applied on auth endpoints (login, token refresh)?
- Is rate limiting applied on expensive endpoints (data exports, geospatial queries)?

| Finding | Severity |
|---------|----------|
| No rate limiting on auth endpoints | **High** |
| No rate limiting on expensive/unbounded endpoints | **Medium** |
