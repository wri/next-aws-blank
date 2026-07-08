---
name: security-risk-assessment
description: "Security Risk Assessment Prior to Open Sourcing repositories. Use when auditing a repo for open source release, checking for secrets, OWASP vulnerabilities, auth gaps, injection risks, CORS/session hardening, sensitive data leaks, or config safety. Runs a code-first, exploitability-focused security review across 7 audit areas."
argument-hint: "<repo-path or app name>"
how to use:
Invoke it with /security-risk-assessment <repo or app name> — it'll run the full 7-area audit and produce a severity-graded report with a BLOCKED / CONDITIONAL / CLEAR open sourcing recommendation.

---

# Security Risk Assessment Prior to Open Sourcing

A code-first, exploitability-focused security review framework. Run this before making any GFW Pro repository public.

## When to Use

- Before open sourcing a private repository
- When assessing security posture of a service
- When reviewing a PR that touches auth, input handling, or config
- When checking for secrets or sensitive data exposure

## Audit Areas

1. [OWASP Top 10 Mapping](./references/owasp-top10.md)
2. [Secret & Key Exposure Scanning](./references/secrets-scanning.md)
3. [AuthN/AuthZ Path Review](./references/authn-authz.md)
4. [Input Handling & Injection Analysis](./references/injection.md)
5. [Session, Cookie, CORS & Security Headers](./references/session-cors-headers.md)
6. [Sensitive Data Handling](./references/sensitive-data.md)
7. [Config & Environment Safety](./references/config-env.md)

## Procedure

### Step 1 — Scope & Inventory

1. Identify all entry points: HTTP routes, queue consumers, cron jobs, CLI commands.
2. List all external dependencies (npm packages, external APIs, AWS services).
3. Note which services are being open sourced vs remaining private.

### Step 2 — Secret & Key Scanning (Area 2)

Run secret scanning on the full codebase before anything else — a leaked secret is an immediate blocker.

Follow the [Secret & Key Exposure Scanning reference](./references/secrets-scanning.md).

### Step 3 — Auth Coverage (Area 3)

Map every route/handler to its auth middleware/guard. Any unprotected route that touches sensitive data is a critical finding.

Follow the [AuthN/AuthZ Path Review reference](./references/authn-authz.md).

### Step 4 — Input & Injection Analysis (Area 4)

Trace all user-controlled inputs through query construction, shell commands, and templates.

Follow the [Input Handling & Injection reference](./references/injection.md).

### Step 5 — Session, CORS & Headers (Area 5)

Review cookie flags, CORS allowlists, and security response headers.

Follow the [Session, Cookie, CORS & Security Headers reference](./references/session-cors-headers.md).

### Step 6 — Sensitive Data (Area 6)

Check what PII/credentials are logged, stored unencrypted, or sent over unencrypted transport.

Follow the [Sensitive Data Handling reference](./references/sensitive-data.md).

### Step 7 — Config & Environment Safety (Area 7)

Verify no secrets are hardcoded, `.env` files are gitignored, and example configs don't contain real values.

Follow the [Config & Environment Safety reference](./references/config-env.md).

### Step 8 — OWASP Top 10 Cross-Check (Area 1)

Map findings from steps 2–7 to OWASP Top 10 categories and assign severity.

Follow the [OWASP Top 10 Mapping reference](./references/owasp-top10.md).

### Step 9 — Report

Produce a findings report grouped by severity (Critical / High / Medium / Low / Info):

```
## Security Risk Assessment Report — <repo>

### Critical
- [AREA] Finding: ... | Location: ... | Remediation: ...

### High
...

### Summary
Total: X Critical, X High, X Medium, X Low
Open Sourcing Recommendation: BLOCKED / CONDITIONAL / CLEAR
```

A repo is **BLOCKED** from open sourcing if any Critical findings remain unresolved.
