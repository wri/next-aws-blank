# Secret & Key Exposure Scanning

A leaked secret in git history or source code is an immediate Critical finding that blocks open sourcing.

## What to Scan For

- API keys and tokens (AWS, Stripe, SendGrid, Mapbox, Google, etc.)
- Database connection strings with embedded credentials
- Private keys and certificates (PEM, RSA, DSA)
- JWT secrets and signing keys
- OAuth client secrets
- MSSQL passwords in connection strings
- Hardcoded usernames/passwords in source or config files
- Internal hostnames, IP addresses, or AWS account IDs

## Scan Procedure

### 1. Use the GitHub Secret Scanning tool

```
github-run_secret_scanning
```

Pass the content of all non-gitignored source files. Prioritize:
- `*.env*`, `*.config.*`, `appsettings*.json`, `docker-compose*.yml`
- Any file with "secret", "key", "token", "password", "credential" in its name
- All TypeScript/JavaScript source files

### 2. Grep for common patterns

```bash
# Connection strings
grep -rn "Password=" --include="*.ts" --include="*.js" --include="*.json" .

# AWS credentials
grep -RInE "AKIA[0-9A-Z]{16}" .
# Generic secrets
grep -RInE "(secret|password|apikey)[[:space:]]*=[[:space:]]*['\"][^'\"]+" .

### 3. Check git history

```bash
# Search commit history for sensitive patterns
git log --all --full-history -p -- "**/*.env" | head -200
git log --all -S "password" --oneline | head -20
```

### 4. Check example/template files

Review all `.env.example`, `*.sample`, `*.template` files — ensure they contain only placeholder values, not real credentials.

## Findings Classification

| Finding | Severity |
|---------|----------|
| Real credential in source code or committed `.env` | **Critical** |
| Real credential in git history (not in current HEAD) | **Critical** |
| Hardcoded internal hostname/IP with auth bypass potential | **High** |
| Placeholder that looks real (could cause confusion) | **Low** |
| `.env` file not in `.gitignore` | **High** |

## Remediation

- Rotate any exposed credential immediately, before any other action.
- Remove secrets from code and replace with environment variable references.
- If in git history: use `git filter-repo` or BFG Repo Cleaner to purge. Note that history rewriting is required before open sourcing.
- Add `.env`, `*.pem`, `*.key` to `.gitignore`.
