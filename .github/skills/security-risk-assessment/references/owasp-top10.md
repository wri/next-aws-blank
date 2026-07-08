# OWASP Top 10 Mapping

Map findings from all other audit areas to the following categories. Assign severity based on exploitability and impact in a public open-source context.

## Categories

| # | Category | Key Questions |
|---|----------|---------------|
| A01 | Broken Access Control | Are all routes protected? Can users access other users' data? Are admin endpoints exposed? |
| A02 | Cryptographic Failures | Is sensitive data encrypted at rest and in transit? Are weak algorithms (MD5, SHA1) used? Are secrets hardcoded? |
| A03 | Injection | Is user input sanitized before SQL/shell/template usage? Are parameterized queries used? |
| A04 | Insecure Design | Are there design-level flaws — missing rate limiting, no MFA on critical paths, unbounded data exports? |
| A05 | Security Misconfiguration | Are default credentials present? Is debug mode enabled in prod? Are error messages verbose? |
| A06 | Vulnerable & Outdated Components | Are dependencies up to date? Are there known CVEs in used packages? |
| A07 | Identification & Authentication Failures | Are JWTs validated correctly? Are sessions invalidated on logout? Are brute force protections in place? |
| A08 | Software & Data Integrity Failures | Are package lock files committed? Are CI/CD pipelines protected? Is deserialization of untrusted data happening? |
| A09 | Security Logging & Monitoring Failures | Are auth failures logged? Are sensitive values excluded from logs? |
| A10 | Server-Side Request Forgery (SSRF) | Are user-supplied URLs fetched? Are internal AWS metadata endpoints reachable? |

## Severity Scale

| Severity | Definition |
|----------|------------|
| **Critical** | Direct, unauthenticated exploitation possible; data breach or full compromise likely |
| **High** | Exploitation requires auth or specific conditions; significant data or system impact |
| **Medium** | Exploitable with additional steps; limited impact or requires chaining |
| **Low** | Defense-in-depth issue; low exploitability or impact |
| **Info** | Observation or best-practice deviation; no direct exploit path |

## Mapping Template

For each finding from other audit areas, record:

```
Finding: <short description>
OWASP Category: A0X — <name>
Severity: Critical / High / Medium / Low / Info
Location: <file>:<line or function>
Exploitability: <how an attacker would exploit this>
Remediation: <specific fix>
```
