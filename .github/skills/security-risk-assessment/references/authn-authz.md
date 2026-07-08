# AuthN/AuthZ Path Review

Map every route and handler to its authentication and authorization coverage. Any gap on a sensitive endpoint is a High or Critical finding.

## Review Procedure

### 1. Enumerate All Entry Points

For **Express.js** (webserver):
```bash
grep -rn "router\.\(get\|post\|put\|patch\|delete\|use\)" apps/webserver/src --include="*.ts" | sort
```

For **NestJS** (microservices):
```bash
grep -rn "@\(Get\|Post\|Put\|Patch\|Delete\|Controller\)" apps/microservices --include="*.ts" | sort
grep -rn "@UseGuards\|@Public\|@Roles" apps/microservices --include="*.ts" | sort
```

### 2. Map Routes to Middleware/Guards

For each route record:

| Route | Method | Auth Middleware/Guard | Roles/Scopes Required | Notes |
|-------|--------|-----------------------|----------------------|-------|
| `/api/v1/...` | GET | `authMiddleware` | `user` | |
| `/health` | GET | None | None | Intentionally public |

### 3. Check for Auth Bypass Patterns

- Routes registered **before** global auth middleware are unprotected
- `@Public()` decorators or `skipAuth` flags on sensitive endpoints
- Wildcard routes that may match before protected routes
- Missing auth on internal/admin routes

### 4. Authorization (not just authentication)

Beyond "is the user logged in", check:
- Can a user access **another user's** resources? (IDOR)
- Are subscription tier checks enforced server-side?
- Are admin/internal APIs reachable by regular users?
- Are organization/workspace boundaries enforced?

### 5. Token/Session Validation

- Are JWTs verified with the correct algorithm and secret? (watch for `alg: none` acceptance)
- Are token expiry (`exp`) claims checked?
- Is the token issuer (`iss`) and audience (`aud`) validated?
- Are revoked tokens rejected (blocklist or short TTL)?

## GFW Pro Specifics

- Check `featureFlagsService` usage — are feature-flagged endpoints still accessible when the flag is off?
- Verify subscription type checks (Standard vs Premium) are enforced server-side, not just client-side
- B2B API (`apps/microservices/b2b/`) — confirm API key scoping and rate limiting

## Findings Classification

| Finding | Severity |
|---------|----------|
| Sensitive route with no auth at all | **Critical** |
| IDOR — user can access another user's data | **Critical** |
| Admin endpoint accessible to regular users | **Critical** |
| Weak JWT validation (alg:none, no expiry check) | **High** |
| Missing subscription tier enforcement (server-side) | **High** |
| Overly broad role/scope grants | **Medium** |
| Missing auth on low-sensitivity internal endpoint | **Low** |
