# Translation Files

This directory contains all user-facing text for the Restoration Diagnostic application.

## Structure

```
src/i18n/translations/
├── README.md              # This file
├── en.json               # English UI strings (source of truth)
├── es.json               # Spanish UI strings
├── questions-en.json     # English question content (from database)
└── questions-es.json     # Spanish question content
```

## File Types

### UI Translation Files (`en.json`, `es.json`)

**Purpose:** Static UI text like buttons, labels, error messages, navigation text.

**Source:** Extracted from React components throughout the application.

**Structure:** Nested JSON organized by feature area:
- `common` - Shared elements (buttons, brand, footer)
- `navigation` - Navigation menus and themes
- `home` - Home/hero page content
- `forms` - Form labels, placeholders, validation messages
- `assessment` - Assessment engine UI (navigation, content, guidance, actions)
- `auth` - Authentication and password prompts
- `errors` - Error messages (API and generic)
- `metadata` - Page titles and descriptions for SEO

**Update Frequency:** When new features are added or UI text changes.

**How to Update:**
1. Edit the JSON file directly (both `en.json` and target language file)
2. Validate: `npm run i18n:validate`
3. Test in application
4. Commit to git

---

### Question Translation Files (`questions-en.json`, `questions-es.json`)

**Purpose:** Question content for the 31 key success factors across Motivate/Enable/Implement themes.

**Source:** Database QuestionTranslation table (synced bidirectionally).

**Structure:** Flat object with questionCode as key (M01, M02, ..., E01, ..., I01, ...):

```json
{
  "M01": {
    "questionText": "...",
    "definition": "...",
    "considerations": "...",
    "followUpQuestions": { "if yes": [...], "if no": [...] },
    "strategyExamples": "...",
    "keySuccessFactor": "...",
    "minimalKeySuccessFactor": "...",
    "lastUpdated": "2026-02-26T12:00:00.000Z"
  }
}
```

**Update Frequency:** When stakeholders provide updated question translations.

**How to Update:**

**Option 1: Import from CSV**
```bash
npm run i18n:import-csv -- --file docs/resources/questions-es.csv --language es
npm run i18n:export-questions -- --language es  # Sync to JSON
```

**Option 2: Edit JSON and sync to DB**
```bash
# 1. Edit questions-es.json manually
# 2. Import to database:
npm run i18n:import-questions -- --language es
```

**Option 3: Bidirectional sync**
```bash
# Detect and resolve conflicts:
npm run i18n:sync
```

---

## Translation Guidelines

### Key Principles

1. **Preserve Keys:** Never change JSON keys, only values
2. **Preserve Placeholders:** Keep `{variable}` placeholders exactly as shown
3. **Maintain Structure:** Keep nesting levels identical across languages
4. **Context Matters:** Review the component/page where text appears

### Placeholder Syntax

**Simple Variables:**
```json
{
  "welcome": "Welcome, {name}!"
}
```
Usage: `t('welcome', { name: 'John' })` → "Welcome, John!"

**Pluralization (ICU MessageFormat):**
```json
{
  "items": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}
```
Usage: 
- `t('items', { count: 0 })` → "No items"
- `t('items', { count: 1 })` → "One item"
- `t('items', { count: 5 })` → "5 items"

**Time Expressions:**
```json
{
  "tooManyAttempts": "Too many failed attempts. Please try again in {time}."
}
```
Usage: `t('tooManyAttempts', { time: '5 minutes' })`

### Character Limits

Some UI elements have space constraints. Recommended maximum lengths:

- **Buttons:** 20 characters
- **Navigation items:** 15 characters
- **Tab labels:** 12 characters
- **Form labels:** 30 characters
- **Validation messages:** 80 characters
- **Modal titles:** 50 characters

If translation exceeds recommended length, consider abbreviations or restructuring.

---

## Translation Workflow

### For Translators

1. **Receive Request**
   - Developer provides `en.json` or `questions-en.json`
   - Target language specified (e.g., Spanish)

2. **Translate**
   - Open corresponding file (`es.json` or `questions-es.json`)
   - Translate all values (keep keys unchanged)
   - Preserve placeholders: `{name}`, `{count}`, etc.
   - Review context notes (see [TRANSLATION_GUIDE.md](../../docs/TRANSLATION_GUIDE.md))

3. **Validate Structure**
   - Ensure valid JSON syntax
   - Check all keys from English file are present
   - Run: `npm run i18n:validate`

4. **Return Files**
   - Send translated JSON back to developer
   - Or commit directly to git (if technical)

### For Developers

1. **Add New Strings**
   - Add to `en.json` in appropriate namespace
   - Run: `npm run i18n:extract-ui` (automated detection)
   - Add empty values to other language files (`es.json`)
   - Request translation from team

2. **Import Question Updates**
   ```bash
   # From CSV file:
   npm run i18n:import-csv -- --file path/to/questions-es.csv --language es
   
   # Sync to JSON:
   npm run i18n:export-questions
   
   # Validate:
   npm run i18n:validate
   
   # Commit:
   git add src/i18n/translations/questions-es.json
   git commit -m "chore(i18n): Update Spanish question translations"
   ```

3. **Import UI Translation Updates**
   ```bash
   # 1. Receive updated es.json from translator
   # 2. Replace file in src/i18n/translations/
   # 3. Validate:
   npm run i18n:validate
   
   # 4. Test in application:
   npm run dev
   # (Switch to Spanish, navigate UI)
   
   # 5. Commit:
   git add src/i18n/translations/es.json
   git commit -m "chore(i18n): Update Spanish UI translations"
   ```

---

## Validation

**Run validation before committing:**

```bash
# Validate all languages:
npm run i18n:validate

# Validate specific language:
npm run i18n:validate -- --language es

# CI mode (exits with error code if invalid):
npm run i18n:validate -- --ci
```

**What validation checks:**
- ✅ Valid JSON syntax
- ✅ All keys from English file present in other languages
- ✅ No extra keys in other languages
- ✅ Placeholder consistency (same variables)
- ✅ Question count matches (31 questions per language)
- ✅ ICU MessageFormat syntax valid

---

## Tools & Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `i18n:extract-ui` | Extract strings from components | `npm run i18n:extract-ui` |
| `i18n:validate` | Validate translation completeness | `npm run i18n:validate` |
| `i18n:import-csv` | Import questions from CSV | `npm run i18n:import-csv -- --file path.csv --language es` |
| `i18n:export-questions` | Export DB → JSON | `npm run i18n:export-questions` |
| `i18n:import-questions` | Import JSON → DB | `npm run i18n:import-questions` |
| `i18n:sync` | Bidirectional sync | `npm run i18n:sync` |

---

## Adding a New Language

1. **Create language files:**
   ```bash
   cp src/i18n/translations/en.json src/i18n/translations/fr.json
   cp src/i18n/translations/questions-en.json src/i18n/translations/questions-fr.json
   ```

2. **Update config:**
   ```typescript
   // src/i18n/config.ts
   export const locales = ['en', 'es', 'fr'] as const
   ```

3. **Update language selector:**
   ```typescript
   // src/constants/language-options.ts
   export const languageOptions = [
     { value: 'en', label: 'English' },
     { value: 'es', label: 'Español' },
     { value: 'fr', label: 'Français' }
   ]
   ```

4. **Translate content:**
   - Send `fr.json` and `questions-fr.json` to French translator
   - Receive completed files
   - Run validation

5. **Create database seed:**
   ```bash
   # Create seed file for French question translations
   # src/db/seeds/005-question-translations-fr.seed.ts
   ```

6. **Test thoroughly:**
   - Switch to French in navbar
   - Navigate all pages
   - Test forms and validations
   - Verify questions display correctly

---

## Troubleshooting

### Common Issues

**"Missing keys" validation error:**
- Compare your language file with `en.json`
- Ensure all keys are present (check nested objects)
- Keys are case-sensitive

**"Extra keys" validation warning:**
- Remove keys that don't exist in `en.json`
- Might be from old/removed features

**Placeholder mismatch:**
- Ensure placeholders match exactly: `{name}` not `{nombre}`
- Placeholders must be in English (variable names)

**JSON syntax error:**
- Use JSON linter/validator
- Check for missing commas, quotes, brackets
- Use online tool: https://jsonlint.com/

**Questions not displaying in new language:**
- Ensure QuestionTranslation records exist in DB
- Run: `npm run i18n:import-questions -- --language es`
- Check query includes LEFT JOIN on QuestionTranslation table

---

## Resources

- **Translation Guide:** [docs/TRANSLATION_GUIDE.md](../../docs/TRANSLATION_GUIDE.md)
- **Developer Guide:** [docs/I18N_DEVELOPER_GUIDE.md](../../docs/I18N_DEVELOPER_GUIDE.md)
- **Translation Workflow:** [docs/TRANSLATION_WORKFLOW.md](../../docs/TRANSLATION_WORKFLOW.md)
- **Translation Status:** [docs/TRANSLATION_STATUS.md](../../docs/TRANSLATION_STATUS.md)
- **ICU MessageFormat Docs:** https://unicode-org.github.io/icu/userguide/format_parse/messages/
- **next-intl Docs:** https://next-intl-docs.vercel.app/

---

## Contact

- **Translation Requests:** [TBD]
- **Spanish Translator:** [TBD]
- **French Translator:** [TBD]
- **Technical Questions:** Development team
