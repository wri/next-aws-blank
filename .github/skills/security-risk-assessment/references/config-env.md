# Config & Environment Safety for Public Release

Ensure no secrets are hardcoded, environment files are gitignored, and the repository is safe to publish as-is.

## Pre-Open-Source Checklist

### 1. .gitignore Coverage

Verify the following are excluded:

```bash
cat .gitignore | grep -E "\.env|\.pem|\.key|secrets|credentials"
```

Required `.gitignore` entries:
```
.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.pfx
secrets/
credentials/
```

Any `.env` file (except `.env.example`) committed to the repo is a Critical finding.

### 2. Environment Variable Usage

All secrets and environment-specific config must be injected via environment variables — never hardcoded.

```bash
# Find hardcoded connection strings
grep -RInE "Server=|Data Source=|jdbc:" apps/ libs/ --include="*.ts" --include="*.json" | grep -Ev "process\.env|config\."

# Find hardcoded API keys
grep -RInE "apiKey[[:space:]]*[:=][[:space:]]*['\"]" apps/ libs/ --include="*.ts" | grep -v "process\.env"
```

### 3. Example Config Files

`.env.example`, `appsettings.example.json`, `docker-compose.override.yml.example` must:
- Exist (so contributors know what variables are needed)
- Contain **only** placeholder values (`YOUR_SECRET_HERE`, `changeme`, `<REPLACE>`)
- Not contain real values, internal hostnames, or account IDs

```bash
find . -name "*.example" -o -name "*.sample" | head -20
```

### 4. Docker / CI Configuration

```bash
# Check docker-compose files for hardcoded credentials
grep -RInE "password|secret|key" docker-compose*.yml | grep -v "#"

# Check CI pipeline files
find . -name "*.yml" -path "*/.github/workflows/*" | xargs grep -El "password|secret" 2>/dev/null
```

- Are GitHub Actions secrets used (`${{ secrets.MY_SECRET }}`) rather than hardcoded values?
- Are Docker images built without baking in credentials?

### 5. Dependency Security

```bash
# Check for known vulnerabilities
npm audit --audit-level=high

# Check for outdated dependencies with known CVEs
npx nx affected --target=build  # ensure no build-time credential injection
```

Flag any `npm audit` findings at High or Critical severity.

### 6. Internal Infrastructure Exposure

Before open sourcing, scrub or document all references to:
- Internal AWS account IDs
- Internal VPC hostnames or IP ranges
- Internal S3 bucket names
- Internal database hostnames

```bash
grep -RInE "\.internal|\.local|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\." apps/ libs/ database/ --include="*.ts" --include="*.sql" --include="*.json"
```

### 7. Database Schema & Seed Data

```bash
ls database/
```

Review all SQL files in `database/` for:
- Hardcoded credentials in stored procedures
- Real customer/user data in seed files
- Internal business logic that reveals sensitive proprietary information

## Findings Classification

| Finding | Severity |
|---------|----------|
| `.env` file with real credentials committed | **Critical** |
| Secret hardcoded in source file | **Critical** |
| Internal AWS account ID or infrastructure detail exposed | **High** |
| `.env.example` missing (contributors can't configure the app) | **Medium** |
| `npm audit` High/Critical CVEs in production dependencies | **High** |
| Docker Compose with hardcoded credentials | **High** |
| CI pipeline with inline secrets (not using GitHub secrets) | **High** |
| Real customer data in test fixtures or seed files | **High** |
| `.gitignore` missing `.env` entry | **High** |

## Open Sourcing Readiness Gate

The repository is **CLEAR** to open source when:
- [ ] All Critical and High findings are resolved
- [ ] `.env.example` exists with placeholder values only
- [ ] `npm audit` shows no High/Critical in production deps
- [ ] No real customer/user data in repo
- [ ] All secrets use environment variables
- [ ] `.gitignore` covers all secret file patterns
- [ ] Git history has been audited and cleaned if needed
