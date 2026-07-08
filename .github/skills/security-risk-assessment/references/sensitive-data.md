# Sensitive Data Handling

Check what personal, financial, or credential data is logged, stored unencrypted, or sent without encryption.

## Data Inventory

First, identify what sensitive data the service handles:

- **PII**: user email, name, organization, IP address
- **Credentials**: passwords, API keys, tokens
- **Financial**: subscription/billing data
- **Geospatial**: user-uploaded shapefiles, coordinates (may be sensitive for some customers)
- **Business data**: customer lists, area of interest boundaries

## Logging

### What to Check

```bash
grep -RInE "console\.log|logger\.(log|info|warn|error|debug)" apps/ libs/ --include="*.ts" | grep -iE "(password|token|secret|key|email|user)"
```

Also check structured logging configurations:
```bash
grep -rn "winston\|pino\|bunyan\|morgan" apps/ --include="*.ts"
```

**Unsafe patterns:**
```typescript
// Never log request bodies that may contain credentials
logger.info('Request body:', req.body);
logger.error('Auth failed', { user, password }); // logs password!
```

**Safe pattern:**
```typescript
logger.info('Auth failed', { userId: user.id }); // log only non-sensitive identifiers
```

### Findings

| Finding | Severity |
|---------|----------|
| Passwords or tokens logged in plaintext | **Critical** |
| PII (email, name) logged without necessity | **High** |
| Full request bodies logged (may contain credentials) | **High** |
| User IP logged without privacy consideration | **Low** |

## Storage

### Database

- Are passwords hashed (bcrypt, Argon2)? Never MD5 or SHA1.
- Is PII stored in plaintext that could be encrypted at rest?
- Are database backups encrypted?

```bash
grep -rn "bcrypt\|argon2\|crypto\.createHash\|md5\|sha1" apps/ libs/ --include="*.ts" -i
```

### Files / S3

```bash
grep -rn "s3\|putObject\|upload\|ServerSideEncryption" libs/aws/ apps/ --include="*.ts" -i
```

- Are S3 buckets configured with server-side encryption?
- Are S3 bucket policies public-read? (should be private for user data)
- Are pre-signed URL TTLs appropriately short?

### Findings

| Finding | Severity |
|---------|----------|
| Passwords stored without hashing or with weak hash | **Critical** |
| PII stored in plaintext in publicly accessible storage | **Critical** |
| S3 bucket with public-read ACL containing user data | **High** |
| Encryption at rest not configured | **Medium** |

## Transport

- Is HTTPS enforced for all external communication?
- Are internal service-to-service calls over TLS?
- Are third-party API calls (Mapbox, Stripe, etc.) using HTTPS?

```bash
grep -rn "http://" apps/ libs/ --include="*.ts" | grep -v "localhost\|127.0.0.1\|comment\|//"
```

### Findings

| Finding | Severity |
|---------|----------|
| External API calls over HTTP (not HTTPS) | **High** |
| Internal service calls over unencrypted HTTP with sensitive data | **Medium** |

## Data Minimization for Open Source

Before open sourcing, verify:
- No real customer data in test fixtures or seed files
- No production database dumps in the repo
- No real email addresses, names, or organization data in test files

```bash
grep -rn "@globalforestwatch\|@wri\.org" test_files/ database/ --include="*.sql" --include="*.json" --include="*.ts"
```
