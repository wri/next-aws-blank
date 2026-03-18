#!/usr/bin/env ts-node
/**
 * Sync Translations Between Database and JSON Files
 * 
 * Usage:
 *   npm run i18n:export-questions              # Export all languages from DB to JSON
 *   npm run i18n:export-questions -- --language en   # Export specific language
 *   npm run i18n:import-questions              # Import all JSON files to DB
 *   npm run i18n:import-questions -- --language en   # Import specific language
 * 
 * Features:
 * - Bidirectional sync (DB ↔ JSON)
 * - Preserves question order
 * - Includes metadata (lastUpdated)
 * - Atomic operations
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { initializeDatabase } from '../../db/data-source'
import { Question } from '../../db/entities/Question.entity'
import { Diagnostic } from '../../db/entities/Diagnostic.entity'

interface QuestionTranslationJSON {
  [questionCode: string]: {
    questionText: string
    definition: string | null
    considerations: string | null
    followUpQuestions: string | null
    strategyExamples: string | null
    keySuccessFactor: string
    minimalKeySuccessFactor: string
    enablingCondition: string
    theme: string
    locale: string
    lastUpdated: string
  }
}

async function exportToJSON(language: string = 'en'): Promise<void> {
  console.log(`\n📤 Exporting ${language} translations from database to JSON...\n`)
  
  const dataSource = await initializeDatabase()
  
  try {
    const questions = await dataSource
      .getRepository(Question)
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.diagnostic', 'd')
      .where('d.language = :language', { language })
      .orderBy('q.sortOrder', 'ASC')
      .getMany()
    
    console.log(`Found ${questions.length} questions`)
    
    const json: QuestionTranslationJSON = {}
    
    questions.forEach((q) => {
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
        locale: q.locale,
        lastUpdated: new Date().toISOString(),
      }
    })
    
    const filePath = `src/i18n/translations/questions-${language}.json`
    
    // Ensure directory exists
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    
    writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8')
    console.log(`\n✅ Exported ${questions.length} questions to ${filePath}\n`)
  } catch (error) {
    console.error('❌ Export failed:', error)
    throw error
  } finally {
    await dataSource.destroy()
  }
}

async function importFromJSON(language: string = 'en'): Promise<void> {
  console.log(`\n📥 Importing ${language} translations from JSON to database...\n`)
  
  const filePath = `src/i18n/translations/questions-${language}.json`
  
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  
  const json: QuestionTranslationJSON = JSON.parse(readFileSync(filePath, 'utf-8'))
  const dataSource = await initializeDatabase()
  const queryRunner = dataSource.createQueryRunner()
  
  await queryRunner.connect()
  await queryRunner.startTransaction()
  
  try {
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
    }
    
    let updated = 0
    let skipped = 0
    
    for (const [questionCode, data] of Object.entries(json)) {
      // Skip meta keys (e.g., _meta, _structure, _note)
      if (questionCode.startsWith('_')) {
        console.log(`⏭️  Skipping meta key: ${questionCode}`)
        continue
      }
      
      const question = await queryRunner.manager.findOne(Question, {
        where: { questionCode, diagnosticId: diagnostic.id },
      })
      
      if (!question) {
        console.warn(`⚠️  ${questionCode}: Question not found, skipping`)
        skipped++
        continue
      }
      
      // Validate locale matches language flag
      if (data.locale && data.locale !== language) {
        throw new Error(`Locale mismatch for ${questionCode}: JSON has '${data.locale}' but language flag is '${language}'`)
      }
      
      await queryRunner.manager.update(Question, question.id, {
        questionText: data.questionText,
        definition: data.definition,
        considerations: data.considerations,
        followUpQuestions: data.followUpQuestions,
        strategyExamples: data.strategyExamples,
        keySuccessFactor: data.keySuccessFactor,
        minimalKeySuccessFactor: data.minimalKeySuccessFactor,
        enablingCondition: data.enablingCondition,
        theme: data.theme as Question['theme'],
        locale: data.locale ?? language, // Use JSON locale or fall back to language flag
      })
      
      console.log(`✓ ${questionCode}: Synced`)
      updated++
    }
    
    await queryRunner.commitTransaction()
    console.log(`\n✅ Imported ${updated} questions from ${filePath}`)
    console.log(`⚠️  Skipped ${skipped} questions\n`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
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
  const options: { language?: string; action?: 'export' | 'import' } = {}
  
  // Determine action from script name
  const scriptName = process.argv[1]
  if (scriptName.includes('export')) {
    options.action = 'export'
  } else if (scriptName.includes('import')) {
    options.action = 'import'
  }
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--language' && args[i + 1]) {
      options.language = args[i + 1]
      i++
    } else if (args[i] === '--export') {
      options.action = 'export'
    } else if (args[i] === '--import') {
      options.action = 'import'
    }
  }
  
  return options
}

// Main execution
if (require.main === module) {
  const { language, action } = parseArgs()
  
  if (!action) {
    console.error('❌ Error: Must specify --export or --import')
    console.log('\nUsage:')
    console.log('  npm run i18n:export-questions')
    console.log('  npm run i18n:export-questions -- --language en')
    console.log('  npm run i18n:import-questions')
    console.log('  npm run i18n:import-questions -- --language en')
    process.exit(1)
  }
  
  const execute = action === 'export' ? exportToJSON : importFromJSON
  
  execute(language)
    .then(() => {
      console.log('✅ Sync completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Sync failed:', error)
      process.exit(1)
    })
}

export { exportToJSON, importFromJSON }
