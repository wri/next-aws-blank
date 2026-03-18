#!/usr/bin/env ts-node
/**
 * Import Question Translations from CSV
 * 
 * Usage:
 *   npm run i18n:import-csv -- --file path/to/file.csv
 *   npm run i18n:import-csv -- --file path/to/file.csv --language en
 *   npm run i18n:import-csv -- --file path/to/file.csv --language es --dry-run
 *   npm run i18n:import-csv -- --file path/to/file.csv --force
 *   npm run i18n:import-csv -- --file path/to/file.csv --encoding windows-1252
 *   npm run i18n:import-csv -- --file path/to/file.csv --cleanup --force
 * 
 * Features:
 * - Validates question codes against existing questions
 * - Sanitizes text content 
 * - Parses follow-up questions
 * - Generates diff report
 * - Transactional (all or nothing)
 * - Optional cleanup: removes questions in DB not present in CSV
 * - Supports multiple languages via --language flag (default: en)
 * - Smart encoding detection (UTF-8 first, fallback to Windows-1252)
 */

import { parse } from 'csv-parse/sync'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { initializeDatabase } from '../../db/data-source'
import { Question } from '../../db/entities/Question.entity'
import { Diagnostic } from '../../db/entities/Diagnostic.entity'
import { sanitizeText, sanitizeQuestionText, parseFollowUpQuestions, decodeCSVBuffer, sanitizeListText } from '../../db/seeds/utils/sanitize-text'

interface CSVRow {
  id: string
  Theme: string
  'Enabling condition': string
  Minimal: string
  'Key Factor': string
  Question: string
  Definition: string
  Guidance: string
  'Follow up question(s)': string
  'Examples of strategies to address gap in key factor': string
}

interface Change {
  code: string
  action: 'insert' | 'update'
  field: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValue?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValue?: any
}

const QUESTION_CODE_MAP: { [key: number]: string } = {
  1: 'M01', 2: 'M02', 3: 'M03', 4: 'M04', 5: 'M05', 6: 'M06', 7: 'M07', 8: 'M08',
  9: 'E01', 10: 'E02', 11: 'E03', 12: 'E04', 13: 'E05', 14: 'E06', 15: 'E07', 16: 'E08',
  17: 'E09', 18: 'E10', 19: 'E11', 20: 'E12', 21: 'E13',
  22: 'I01', 23: 'I02', 24: 'I03', 25: 'I04', 26: 'I05', 27: 'I06', 28: 'I07', 29: 'I08', 30: 'I09', 31: 'I10'
}

// Map translated theme values to English enum values
const THEME_MAP: { [key: string]: string } = {
  // English
  'Motivate': 'Motivate',
  'Enable': 'Enable',
  'Implement': 'Implement',
  // Spanish / Portuguese (same words)
  'Motivar': 'Motivate',
  'Habilitar': 'Enable',
  'Implementar': 'Implement',
  // French
  'Motiver': 'Motivate',
  'Activer': 'Enable',
  'Mettre en œuvre': 'Implement',
}

async function importQuestionsFromCSV(
  filePath: string,
  options: { dryRun?: boolean; force?: boolean; cleanup?: boolean; language?: string; encoding?: 'utf-8' | 'windows-1252' } = {}
) {
  const language = options.language || 'en'
  const encoding = options.encoding
  
  console.log('\n📥 Starting CSV import...\n')
  console.log(`File: ${filePath}`)
  console.log(`Language: ${language}`)
  console.log(`Encoding: ${encoding || 'auto-detect'}`)
  console.log(`Dry run: ${options.dryRun ? 'YES' : 'NO'}`)
  console.log(`Force: ${options.force ? 'YES' : 'NO'}`)
  console.log(`Cleanup: ${options.cleanup ? 'YES' : 'NO'}\n`)

  // Initialize DB
  const dataSource = await initializeDatabase()
  const queryRunner = dataSource.createQueryRunner()
  
  try {
    // Read and parse CSV (with smart encoding detection)
    const rawBuffer = readFileSync(filePath)
    const fileContent = decodeCSVBuffer(rawBuffer, encoding)
    const rows: CSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // Handle CSVs with inconsistent column counts (trailing commas)
    })
    
    console.log(`Found ${rows.length} rows in CSV\n`)
    
    // Start transaction
    await queryRunner.connect()
    await queryRunner.startTransaction()
    
    // Resolve or create the target diagnostic
    let diagnostic = await queryRunner.manager.findOne(Diagnostic, {
      where: { version: 'v1.0.0', language }
    })
    
    if (!diagnostic) {
      console.log(`📝 Diagnostic v1.0.0 (${language}) not found. Creating...`)
      diagnostic = queryRunner.manager.create(Diagnostic, {
        version: 'v1.0.0',
        language,
        title: `Restoration Diagnostic v1.0.0 (${language})`,
        description: `Restoration diagnostic assessment questions translated to ${language}`,
      })
      await queryRunner.manager.save(diagnostic)
      console.log(`✅ Created diagnostic: ${diagnostic.id} (${diagnostic.version}/${diagnostic.language})\n`)
    } else {
      console.log(`✅ Resolved diagnostic: ${diagnostic.id} (${diagnostic.version}/${diagnostic.language})\n`)
    }
    
    const changes: Change[] = []
    let processed = 0
    let skipped = 0
    
    for (const row of rows) {
      const id = parseInt(row.id, 10)
      const questionCode = QUESTION_CODE_MAP[id]
      
      if (!questionCode) {
        console.warn(`⚠️  Row ${id}: No question code mapping found, skipping`)
        skipped++
        continue
      }
      
      // Find existing question by code (scoped to this diagnostic)
      const question = await queryRunner.manager.findOne(Question, {
        where: { questionCode, diagnosticId: diagnostic.id },
      })
      
      if (!question) {
        console.warn(`⚠️  ${questionCode}: Question not found in database, skipping`)
        skipped++
        continue
      }
      
      // Prepare sanitized data
      const updatedData = {
        questionText: sanitizeQuestionText(row.Question) || question.questionText,
        definition: sanitizeText(row.Definition),
        considerations: sanitizeText(row.Guidance),
        followUpQuestions: parseFollowUpQuestions(row['Follow up question(s)']),
        strategyExamples: sanitizeListText(row['Examples of strategies to address gap in key factor']),
        keySuccessFactor: row['Key Factor'] || question.keySuccessFactor,
        minimalKeySuccessFactor: row.Minimal || question.minimalKeySuccessFactor,
        enablingCondition: row['Enabling condition'] || question.enablingCondition,
        theme: (THEME_MAP[row.Theme] || row.Theme) as Question['theme'],
        locale: language, // Set locale from language flag
      }
      
      // Track what changed
      let hasChanges = false
      const fieldChanges: Change[] = []
      
      Object.entries(updatedData).forEach(([field, newValue]) => {
        const oldValue = question[field as keyof Question]
        
        // Normalize for comparison
        const normalizedOld = oldValue === null || oldValue === undefined ? null : String(oldValue).trim()
        const normalizedNew = newValue === null || newValue === undefined ? null : String(newValue).trim()
        
        if (normalizedOld !== normalizedNew) {
          hasChanges = true
          fieldChanges.push({
            code: questionCode,
            action: 'update',
            field,
            oldValue: normalizedOld,
            newValue: normalizedNew,
          })
        }
      })
      
      if (!hasChanges && !options.force) {
        console.log(`✓ ${questionCode}: No changes`)
        processed++
        continue
      }
      
      // Update question
      await queryRunner.manager.update(Question, question.id, updatedData)
      
      if (hasChanges) {
        console.log(`✏️  ${questionCode}: Updated (${fieldChanges.length} field${fieldChanges.length > 1 ? 's' : ''})`)
        changes.push(...fieldChanges)
      } else if (options.force) {
        console.log(`✏️  ${questionCode}: Force updated`)
      }
      
      processed++
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log(`Processed: ${processed}`)
    console.log(`Skipped: ${skipped}`)
    console.log(`Updated fields: ${changes.length}`)
    
    if (changes.length > 0) {
      console.log('\nDetailed Changes:')
      const changesByQuestion = changes.reduce((acc, change) => {
        if (!acc[change.code]) acc[change.code] = []
        acc[change.code].push(change)
        return acc
      }, {} as Record<string, Change[]>)
      
      Object.entries(changesByQuestion).forEach(([code, questionChanges]) => {
        console.log(`\n  ${code}:`)
        questionChanges.forEach(change => {
          console.log(`    - ${change.field}`)
          if (change.oldValue) {
            console.log(`      OLD: ${change.oldValue.substring(0, 80)}${change.oldValue.length > 80 ? '...' : ''}`)
          }
          if (change.newValue) {
            console.log(`      NEW: ${change.newValue.substring(0, 80)}${change.newValue.length > 80 ? '...' : ''}`)
          }
        })
      })
    }
    
    // Cleanup obsolete questions (if requested)
    if (options.cleanup) {
      console.log('\n' + '='.repeat(60))
      console.log('🧹 CLEANUP: Checking for obsolete questions...')
      console.log('='.repeat(60))
      
      // Get all question codes from CSV
      const csvQuestionCodes = new Set(
        rows
          .map(row => QUESTION_CODE_MAP[parseInt(row.id, 10)])
          .filter(code => code !== undefined)
      )
      
      // Find all questions in database (scoped to this diagnostic)
      const allDbQuestions = await queryRunner.manager.find(Question, {
        where: { diagnosticId: diagnostic.id },
        order: { questionCode: 'ASC' }
      })
      
      // Identify questions to delete (in DB but not in CSV)
      const toDelete = allDbQuestions.filter(q => !csvQuestionCodes.has(q.questionCode))
      
      if (toDelete.length > 0) {
        console.log(`\n⚠️  Found ${toDelete.length} question(s) in DB not present in CSV:`)
        toDelete.forEach(q => {
          console.log(`   - ${q.questionCode}: ${q.keySuccessFactor}`)
        })
        
        if (options.force && !options.dryRun) {
          // Delete obsolete questions
          await queryRunner.manager.remove(Question, toDelete)
          console.log(`\n✅ Deleted ${toDelete.length} obsolete question(s)`)
        } else if (!options.force) {
          console.log('\n⚠️  Use --force flag to delete these questions')
        }
      } else {
        console.log('✅ No obsolete questions found - database is clean')
      }
    }
    
    if (options.dryRun) {
      console.log('\n⚠️  DRY RUN - Rolling back changes\n')
      await queryRunner.rollbackTransaction()
    } else {
      await queryRunner.commitTransaction()
      console.log('\n✅ Transaction committed\n')

      // Auto-export updated questions to JSON translation file
      if (changes.length > 0 || options.force) {
        console.log(`📤 Syncing ${language} translations to JSON...\n`)
        const allQuestions = await queryRunner.manager.find(Question, {
          where: { diagnosticId: diagnostic.id },
          order: { sortOrder: 'ASC' },
        })

        const json: Record<string, Record<string, unknown>> = {}
        allQuestions.forEach((q) => {
          json[q.questionCode] = {
            questionText: q.questionText,
            definition: q.definition,
            considerations: q.considerations,
            followUpQuestions: q.followUpQuestions,
            strategyExamples: q.strategyExamples,
            keySuccessFactor: q.keySuccessFactor,
            minimalKeySuccessFactor: q.minimalKeySuccessFactor,
            enablingCondition: q.enablingCondition,
            theme: q.theme,
            lastUpdated: new Date().toISOString(),
          }
        })

        const jsonFilePath = `src/i18n/translations/questions-${language}.json`
        const dir = dirname(jsonFilePath)
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true })
        }
        writeFileSync(jsonFilePath, JSON.stringify(json, null, 2), 'utf-8')
        console.log(`✅ Exported ${allQuestions.length} questions to ${jsonFilePath}\n`)
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error during import:', error)
    await queryRunner.rollbackTransaction()
    throw error
  } finally {
    await queryRunner.release()
    await dataSource.destroy()
  }
}

// CLI Argument Parsing
function parseArgs() {
  const args = process.argv.slice(2)
  const options: { 
    file?: string; 
    dryRun?: boolean; 
    force?: boolean; 
    cleanup?: boolean;
    language?: string;
    encoding?: 'utf-8' | 'windows-1252'
  } = {}
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      options.file = args[i + 1]
      i++
    } else if (args[i] === '--language' && args[i + 1]) {
      options.language = args[i + 1]
      i++
    } else if (args[i] === '--encoding' && args[i + 1]) {
      const enc = args[i + 1]
      if (enc === 'utf-8' || enc === 'windows-1252') {
        options.encoding = enc
      } else {
        console.error(`❌ Invalid encoding: ${enc}. Must be 'utf-8' or 'windows-1252'`)
        process.exit(1)
      }
      i++
    } else if (args[i] === '--dry-run') {
      options.dryRun = true
    } else if (args[i] === '--force') {
      options.force = true
    } else if (args[i] === '--cleanup') {
      options.cleanup = true
    }
  }
  
  return options
}

// Main execution
if (require.main === module) {
  const { file, dryRun, force, cleanup, language, encoding } = parseArgs()
  
  if (!file) {
    console.error('❌ Error: --file parameter is required')
    console.log('\nUsage:')
    console.log('  npm run i18n:import-csv -- --file path/to/file.csv')
    console.log('  npm run i18n:import-csv -- --file path/to/file.csv --language es')
    console.log('  npm run i18n:import-csv -- --file path/to/file.csv --dry-run')
    console.log('  npm run i18n:import-csv -- --file path/to/file.csv --force')
    console.log('  npm run i18n:import-csv -- --file path/to/file.csv --encoding windows-1252')
    console.log('  npm run i18n:import-csv -- --file path/to/file.csv --cleanup --force')
    process.exit(1)
  }
  
  importQuestionsFromCSV(file, { dryRun, force, cleanup, language, encoding })
    .then(() => {
      console.log('✅ Import completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Import failed:', error)
      process.exit(1)
    })
}

export { importQuestionsFromCSV }
