# Input Handling & Injection Analysis

Trace all user-controlled inputs through query construction, shell execution, and template rendering.

## What to Look For

### SQL Injection

**MSSQL / TypeORM patterns to audit:**

```bash
# Raw query construction with string interpolation
grep -rn "query\s*\`\|createQueryBuilder\|query(.*\${\|\.query(\`" apps/ libs/ --include="*.ts"

# TypeORM raw queries
grep -rn "\.query\(" apps/ libs/ --include="*.ts"
```

**Safe patterns (parameterized):**
```typescript
// Safe
repository.query('SELECT * FROM users WHERE id = @0', [userId]);
queryBuilder.where('user.id = :id', { id: userId });
```

**Unsafe patterns (injection risk):**
```typescript
// Unsafe — never do this
repository.query(`SELECT * FROM users WHERE id = '${userId}'`);
```

### Command Injection

```bash
grep -rn "exec\|spawn\|execSync\|spawnSync\|child_process" apps/ libs/ --include="*.ts"
```

Check if any user-controlled input reaches shell commands. All shell arguments must use array form (`spawn('cmd', [arg1, arg2])` not `exec('cmd ' + userInput)`).

### Template Injection

```bash
grep -rn "render\|template\|handlebars\|mustache\|ejs\|nunjucks" apps/ libs/ --include="*.ts"
```

Verify user input is HTML-escaped before template rendering. Check for `dangerouslySetInnerHTML` equivalents on the server side.

### NoSQL / ORM Operator Injection

If any MongoDB or Elasticsearch is used (check for it):
```bash
grep -rn "mongoose\|elasticsearch\|opensearch" apps/ libs/ --include="*.ts"
```

Ensure user input cannot inject query operators (`$where`, `$regex`, etc.).

### Path Traversal

```bash
grep -rn "readFile\|writeFile\|createReadStream\|path\.join\|path\.resolve" apps/ libs/ --include="*.ts"
```

Check if user-controlled values are used in file paths without sanitization (e.g., blocking `../`).

## GFW Pro Specifics

- `libs/sql/src/lib/queries/` — review all SQL query templates for interpolation
- Any list upload/download functionality (`list-processing`, `list-downloader`) — check filenames and content parsing
- Geospatial input (GeoJSON, coordinates) — validate bounds and structure before DB insertion

## Findings Classification

| Finding | Severity |
|---------|----------|
| SQL injection with direct string interpolation into raw query | **Critical** |
| Command injection via user-controlled shell argument | **Critical** |
| Path traversal to read arbitrary files | **Critical** |
| Unparameterized query with indirect user input | **High** |
| Missing input validation on numeric/enum fields | **Medium** |
| No size/length limits on user-supplied data | **Medium** |
| Template rendering with unescaped user input | **High** |

## Remediation

- Always use parameterized queries / TypeORM query builder with bound parameters
- Use `child_process.spawn` with array arguments, never `exec` with string concatenation
- Validate and sanitize all inputs at the boundary (controller/route level)
- Use an allowlist for file extensions and paths where user input affects filesystem access
