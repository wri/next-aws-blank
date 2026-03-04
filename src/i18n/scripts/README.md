# i18n Automation Scripts

Automated scripts for managing translation workflows.

## Scripts

### 1. `import-question-csv.ts`

Import question translations from CSV files.

**Features:**
- Maps CSV rows to question codes (M01-M08, E01-E13, I01-I10)
- Validates questions exist in database
- Sanitizes text content (bullets, quotes, formatting)
- Parses follow-up questions into JSON
- Shows detailed diff of changes
- Transactional (all-or-nothing)
- Dry-run mode for preview
- **Multi-language support** via `--language` flag (default: en)
- **Smart encoding detection** (UTF-8 first, fallback to Windows-1252)
- **Optional cleanup: removes questions not in CSV** (use with `--cleanup --force`)

**Usage:**

```bash
# Preview changes without applying them
npm run i18n:import-csv -- --file docs/resources/questions.csv --dry-run

# Import and apply changes (English, default)
npm run i18n:import-csv -- --file docs/resources/questions.csv

# Import Spanish questions
npm run i18n:import-csv -- --file docs/resources/questions-es.csv --language es

# Force update even if no changes detected
npm run i18n:import-csv -- --file docs/resources/questions.csv --force

# Explicit encoding for Windows-1252 files
npm run i18n:import-csv -- --file docs/resources/questions.csv --encoding windows-1252

# Import AND remove questions not in CSV (pristine database)
npm run i18n:import-csv -- --file docs/resources/questions.csv --cleanup --dry-run
npm run i18n:import-csv -- --file docs/resources/questions.csv --cleanup --force
```

**CSV Format Expected:**

```csv
id,Theme,Enabling condition,Minimal,Key Factor,Question,Definition,Guidance,Follow up question(s),Examples of strategies to address gap in key factor
1,Motivate,Benefits,Economic,Restoration generates economic benefits,"Is restoring...",..."
```

- `id` column maps to question codes:
  - 1-8 → M01-M08 (Motivate)
  - 9-21 → E01-E13 (Enable)  
  - 22-31 → I01-I10 (Implement)

### 2. `sync-translations.ts`

Bidirectional sync between database and JSON files.

**Features:**
- Export questions from DB to JSON (for version control)
- Import questions from JSON to DB (for bulk updates)
- Preserves question order
- Includes metadata (lastUpdated)

**Usage:**

```bash
# Export all questions to src/i18n/translations/questions-en.json
npm run i18n:export-questions

# Export with specific language (when multi-language support added)
npm run i18n:export-questions -- --language es

# Import from JSON files back to database
npm run i18n:import-questions

# Import specific language
npm run i18n:import-questions -- --language es
```

### 3. `validate-translations.ts`

Validate translation completeness and consistency.

**Features:**
- Checks all 31 questions exist
- Validates JSON files are valid
- Checks for missing content
- Generates coverage report
- CI mode (exits with error code if validation fails)

**Usage:**

```bash
# Validate all translations
npm run i18n:validate

# Check questions only (skip UI strings)
npm run i18n:validate -- --questions-only

# CI mode (for GitHub Actions)
npm run i18n:validate -- --ci
```

### 4. `cleanup-questions.ts`

Clean up database to ensure pristine state.

**Features:**
- Detects and removes duplicate question codes (keeps most recent)
- Finds questions with missing required fields
- Shows comprehensive database statistics
- Dry-run mode for safety

**Usage:**

```bash
# Check for issues (no changes)
npm run i18n:cleanup -- --dry-run

# Fix duplicates
npm run i18n:cleanup

# Check specific issues
npm run i18n:cleanup -- --duplicates --dry-run
```

## Workflows

### Workflow 1: Import CSV Containing Decided Structure

**Scenario:** Team sends updated CSV with question content

**Steps:**

1. **Save CSV File**
   ```bash
   # Place in docs/resources/
   docs/resources/questions-update-2026-02-26.csv
   ```

2. **Preview Changes**
   ```bash
   npm run i18n:import-csv -- \
     --file docs/resources/questions-update-2026-02-26.csv \
     --dry-run
   ```
   
   Review console output showing:
   - Which questions will be updated
   - What fields changed
   - Old vs. new values

3. **Apply Changes**
   ```bash
   npm run i18n:import-csv -- \
     --file docs/resources/questions-update-2026-02-26.csv
   ```

4. **Export to JSON** (for version control)
   ```bash
   npm run i18n:export-questions
   ```
   
   This updates `src/i18n/translations/questions-en.json`

5. **Validate**
   ```bash
   npm run i18n:validate
   ```

6. **Test in Application**
   ```bash
   npm run dev
   # Navigate through questions to verify updates
   ```

7. **Commit Changes**
   ```bash
   git add docs/resources/questions-update-2026-02-26.csv
   git add src/i18n/translations/questions-en.json
   git commit -m "chore(i18n): Update question content from team"
   ```

**Time:** ~10-15 minutes

### Workflow 2: Bulk JSON Edit

**Scenario:** Manual editing of question content

**Steps:**

1. **Export Current State**
   ```bash
   npm run i18n:export-questions
   ```

2. **Edit JSON File**
   - Open `src/i18n/translations/questions-en.json`
   - Make changes (preserve structure)
   - Save file

3. **Import Back to Database**
   ```bash
   npm run i18n:import-questions
   ```

4. **Validate**
   ```bash
   npm run i18n:validate
   ```

5. **Test & Commit**

**Time:** ~5-10 minutes

### Workflow 3: Maintain Pristine Database

**Scenario:** Ensure database has only the exact questions from the latest CSV (remove old/obsolete questions)

**Steps:**

1. **Check Current State**
   ```bash
   npm run i18n:cleanup -- --dry-run
   npm run i18n:validate
   ```

2. **Preview Import with Cleanup**
   ```bash
   npm run i18n:import-csv -- \
     --file docs/resources/latest-questions.csv \
     --cleanup \
     --dry-run
   ```
   
   This shows:
   - Questions that will be updated
   - Questions that will be deleted (not in CSV)

3. **Apply Changes** (pristine state)
   ```bash
   npm run i18n:import-csv -- \
     --file docs/resources/latest-questions.csv \
     --cleanup \
     --force
   ```
   
   ⚠️ **Warning:** `--cleanup --force` will DELETE questions not in the CSV!

4. **Verify Clean State**
   ```bash
   npm run i18n:cleanup -- --dry-run
   npm run i18n:validate
   ```

5. **Export & Commit**
   ```bash
   npm run i18n:export-questions
   git add -A
   git commit -m "chore(i18n): Sync database with canonical CSV (pristine state)"
   ```

**Time:** ~10 minutes

**⚠️ Use Case:** 
- When question codes have been reorganized
- After removing deprecated questions
- When establishing a "source of truth" CSV
- Before major releases

## CSV to Question Code Mapping

The CSV `id` column maps to database question codes:

| CSV ID | Code | Theme      |
|--------|------|------------|
| 1      | M01  | Motivate   |
| 2      | M02  | Motivate   |
| ...    | ...  | ...        |
| 8      | M08  | Motivate   |
| 9      | E01  | Enable     |
| ...    | ...  | ...        |
| 21     | E13  | Enable     |
| 22     | I01  | Implement  |
| ...    | ...  | ...        |
| 31     | I10  | Implement  |

## Text Sanitization

All scripts use the same sanitization utilities from `src/db/seeds/utils/sanitize-text.ts`:

- **Encoding Detection:** Smart detection tries UTF-8 first, falls back to Windows-1252 if needed
- **Bullets:** Converts `•` to newlines, removes list prefixes
- **Quotes:** Normalizes smart quotes to standard quotes  
- **Whitespace:** Trims and normalizes spacing
- **Follow-up Questions:** Parses into structured **JSON string** (not object):
  ```json
  "{\"if yes\":[\"Question 1\",\"Question 2\"],\"if no\":[\"Question 3\"]}"
  ```
  
## Database Schema

**Important:** There is no `QuestionTranslation` entity. Translations are stored directly in the `question` table, scoped by `diagnostic_id`.

- **`diagnostic` table:** Contains `version` + `language` (unique together), e.g., `v1.0.0/en`, `v1.0.0/es`
- **`question` table:** Contains question content, linked to one `diagnostic` via `diagnostic_id`
- **Multi-language:** Each diagnostic owns its own set of 31 questions
- **`followUpQuestions` field:** Stored as a **JSON string**, not an object

## Error Handling

All scripts:
- Use database transactions (rollback on error)
- Validate input before processing
- Provide detailed error messages
- Exit with appropriate codes for CI/CD

## CI/CD Integration

Add to `.github/workflows/validate-i18n.yml`:

```yaml
name: Validate Translations

on:
  pull_request:
    paths:
      - 'src/i18n/translations/**'
      - 'docs/resources/questions-*.csv'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run i18n:validate -- --ci
```

## Dependencies

- `csv-parse`: CSV parsing
- `typeorm`: Database operations
- `ts-node`: TypeScript execution
- `dotenv`: Environment variables

## Troubleshooting

**Issue:** "Question not found in database"
- **Cause:** CSV `id` doesn't map to a valid question code
- **Fix:** Check the mapping table above

**Issue:** "Invalid JSON"
- **Cause:** Malformed JSON in translation files
- **Fix:** Run `npm run i18n:validate` to identify the issue

**Issue:** "Transaction rollback"
- **Cause:** Database error during import
- **Fix:** Check database logs, ensure connection is active
