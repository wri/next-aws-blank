#!/usr/bin/env ts-node
/**
 * Clone English questions to new language diagnostics
 * This prepares the database for translation imports
 */

import { initializeDatabase } from '../data-source'
import { Question } from '../entities/Question.entity'
import { Diagnostic } from '../entities/Diagnostic.entity'

async function cloneQuestionsForTranslations(): Promise<void> {
  console.log('\n🔄 Cloning questions for translations...\n')
  
  const dataSource = await initializeDatabase()
  const queryRunner = dataSource.createQueryRunner()
  
  await queryRunner.connect()
  await queryRunner.startTransaction()
  
  try {
    // Get English diagnostic and its questions
    const englishDiagnostic = await queryRunner.manager.findOne(Diagnostic, {
      where: { version: 'v1.0.0', language: 'en' }
    })
    
    if (!englishDiagnostic) {
      throw new Error('English diagnostic v1.0.0 not found')
    }
    
    const englishQuestions = await queryRunner.manager.find(Question, {
      where: { diagnosticId: englishDiagnostic.id },
      order: { sortOrder: 'ASC' }
    })
    
    console.log(`✅ Found ${englishQuestions.length} English questions\n`)
    
    // Clone to each language
    const languages = ['es', 'fr', 'pt']
    
    for (const lang of languages) {
      console.log(`📝 Cloning questions for ${lang}...`)
      
      const diagnostic = await queryRunner.manager.findOne(Diagnostic, {
        where: { version: 'v1.0.0', language: lang }
      })
      
      if (!diagnostic) {
       console.log(`⏭️  Diagnostic v1.0.0 (${lang}) not found, skipping`)
        continue
      }
      
      let cloned = 0
      let skipped = 0
      
      for (const enQuestion of englishQuestions) {
        // Check if question already exists
        const existing = await queryRunner.manager.findOne(Question, {
          where: { 
            diagnosticId: diagnostic.id,
            questionCode: enQuestion.questionCode 
          }
        })
        
        if (existing) {
          skipped++
          continue
        }
        
        // Clone question with new diagnosticId and locale
        const clonedQuestion = queryRunner.manager.create(Question, {
          questionCode: enQuestion.questionCode,
          theme: enQuestion.theme,
          enablingCondition: enQuestion.enablingCondition,
          keySuccessFactor: enQuestion.keySuccessFactor,
          minimalKeySuccessFactor: enQuestion.minimalKeySuccessFactor,
          definition: enQuestion.definition,
          questionText: enQuestion.questionText,
          considerations: enQuestion.considerations,
          followUpQuestions: enQuestion.followUpQuestions,
          strategyExamples: enQuestion.strategyExamples,
          sortOrder: enQuestion.sortOrder,
          locale: lang,
          diagnosticId: diagnostic.id,
        })
        
        await queryRunner.manager.save(clonedQuestion)
        cloned++
      }
      
      console.log(`  ✅ ${lang}: Cloned ${cloned}, Skipped ${skipped}\n`)
    }
    
    await queryRunner.commitTransaction()
    console.log('✅ Successfully cloned questions for all languages!\n')
    
  } catch (error) {
    await queryRunner.rollbackTransaction()
    console.error('❌ Error cloning questions:', error)
    throw error
  } finally {
    await queryRunner.release()
    await dataSource.destroy()
  }
}

// Run if called directly
if (require.main === module) {
  cloneQuestionsForTranslations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { cloneQuestionsForTranslations }
