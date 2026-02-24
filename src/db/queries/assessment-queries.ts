import { AppDataSource, initializeDatabase } from '../data-source'
import { Question, Theme } from '../entities/Question.entity'
import { Answer, AnswerValue } from '../entities/Answer.entity'
import { Assessment } from '../entities/Assessment.entity'
import { AnswerStatus } from '@/types/answer.types'

/**
 * Fetch assessment by ID with related data
 */
export async function getAssessmentById(assessmentId: string) {
  await initializeDatabase()
  const assessmentRepo = AppDataSource.getRepository(Assessment)
  
  const assessment = await assessmentRepo.findOne({
    where: { id: assessmentId },
    relations: ['diagnostic', 'lead', 'region']
  })

  return assessment
}

/**
 * Fetch all questions for a diagnostic, grouped by theme
 */
export async function getQuestionsByDiagnostic(diagnosticId: string) {
  await initializeDatabase()
  const questionRepo = AppDataSource.getRepository(Question)
  
  const questions = await questionRepo.find({
    where: { diagnosticId },
    order: {
      theme: 'ASC',
      sortOrder: 'ASC'
    }
  })

  // Group by theme
  const grouped = {
    [Theme.MOTIVATE]: questions.filter(q => q.theme === Theme.MOTIVATE),
    [Theme.ENABLE]: questions.filter(q => q.theme === Theme.ENABLE),
    [Theme.IMPLEMENT]: questions.filter(q => q.theme === Theme.IMPLEMENT),
  }

  return grouped
}

/**
 * Fetch questions with their answers for an assessment
 * Optimized single query with LEFT JOIN
 */
export async function getQuestionsWithAnswers(assessmentId: string) {
  await initializeDatabase()
  const assessmentRepo = AppDataSource.getRepository(Assessment)
  
  const assessment = await assessmentRepo.findOne({
    where: { id: assessmentId },
    relations: ['diagnostic']
  })

  if (!assessment) {
    throw new Error('Assessment not found')
  }

  const questionRepo = AppDataSource.getRepository(Question)
  
  // Single optimized query with LEFT JOIN to get questions and their answers
  const questionsWithAnswers = await questionRepo
    .createQueryBuilder('question')
    .leftJoinAndMapOne(
      'question.answer',
      Answer,
      'answer',
      'answer.question_id = question.id AND answer.assessment_id = :assessmentId',
      { assessmentId }
    )
    .where('question.diagnostic_id = :diagnosticId', { diagnosticId: assessment.diagnosticId })
    .orderBy('question.theme', 'ASC')
    .addOrderBy('question.sort_order', 'ASC')
    .addOrderBy('answer.updatedAt', 'DESC')
    .getMany()

  return questionsWithAnswers
}

/**
 * Fetch summary of answers by theme for an assessment
 * Returns count of yes/partly/no/unanswered per theme
 */
export async function getAnswerSummary(assessmentId: string) {
  await initializeDatabase()
  const answerRepo = AppDataSource.getRepository(Answer)
  
  const summary = await answerRepo
    .createQueryBuilder('answer')
    .innerJoin('answer.question', 'question')
    .select('question.theme', 'theme')
    .addSelect('answer.value', 'value')
    .addSelect('COUNT(*)', 'count')
    .where('answer.assessment_id = :assessmentId', { assessmentId })
    .groupBy('question.theme')
    .addGroupBy('answer.value')
    .getRawMany()

  // Get total questions per theme for unanswered count
  const questionRepo = AppDataSource.getRepository(Question)
  const assessmentRepo = AppDataSource.getRepository(Assessment)
  
  const assessment = await assessmentRepo.findOne({
    where: { id: assessmentId },
    select: ['diagnosticId']
  })

  if (!assessment) {
    throw new Error('Assessment not found')
  }

  const totalByTheme = await questionRepo
    .createQueryBuilder('question')
    .select('question.theme', 'theme')
    .addSelect('COUNT(*)', 'total')
    .where('question.diagnostic_id = :diagnosticId', { diagnosticId: assessment.diagnosticId })
    .groupBy('question.theme')
    .getRawMany()

  // Format the result
  const result: Record<Theme, {
    yes: number
    partly: number
    no: number
    unanswered: number
    total: number
  }> = {
    [Theme.MOTIVATE]: { yes: 0, partly: 0, no: 0, unanswered: 0, total: 0 },
    [Theme.ENABLE]: { yes: 0, partly: 0, no: 0, unanswered: 0, total: 0 },
    [Theme.IMPLEMENT]: { yes: 0, partly: 0, no: 0, unanswered: 0, total: 0 },
  }

  // Set totals
  for (const row of totalByTheme) {
    const theme = row.theme as Theme
    result[theme].total = parseInt(row.total, 10)
    result[theme].unanswered = parseInt(row.total, 10)
  }

  // Set answer counts
  for (const row of summary) {
    const theme = row.theme as Theme
    const value = row.value as AnswerValue | null
    const count = parseInt(row.count, 10)

    if (value === AnswerValue.YES) {
      result[theme].yes = count
    } else if (value === AnswerValue.PARTLY) {
      result[theme].partly = count
    } else if (value === AnswerValue.NO) {
      result[theme].no = count
    }
    
    // Reduce unanswered count
    if (value !== null) {
      result[theme].unanswered -= count
    }
  }

  return result
}

/**
 * Save or update an answer
 */
export async function saveAnswer(
  assessmentId: string,
  questionId: string,
  value: AnswerValue | null,
  rationale?: string,
  notes?: string,
  status?: AnswerStatus,
  answerId?: string,
) {
  await initializeDatabase()
  const answerRepo = AppDataSource.getRepository(Answer)

  let answer
  if (answerId) {
    answer = await answerRepo.findOne({
      where: { id: answerId },
      order: { updatedAt: 'DESC' }
    })
  } else {
    answer = await answerRepo.findOne({
      where: { assessmentId, questionId },
      order: { updatedAt: 'DESC' }
    })
  }

  const isMarkingAsComplete = status === AnswerStatus.COMPLETE

  if (answer) {
    const oldUpdatedAt = answer.updatedAt

    if (isMarkingAsComplete && answer.status !== AnswerStatus.COMPLETE) {
      // 1. "edit the existing one (status: complete)"
      // Because we can't update a PK via TypeORM save(), we insert a new record to act as the "updated" one,
      // and delete the old one to simulate an in-place edit with a changing timestamp.
      const updatedRecordTime = new Date()
      const updatedRecord = answerRepo.create({
        id: answer.id,
        assessmentId,
        questionId,
        value,
        rationale: rationale || null,
        notes: notes || null,
        status: AnswerStatus.COMPLETE,
        createdAt: answer.createdAt,
        updatedAt: updatedRecordTime, // new timestamp 1
      })
      await answerRepo.insert(updatedRecord)
      await answerRepo.delete({ id: answer.id, updatedAt: oldUpdatedAt }) // delete old to "update" it

      // 2. "create a new record with the same info (duplicate with complete status)"
      // This is the history snapshot they requested, must have a slightly newer timestamp so it doesn't collide
      const historyRecordTime = new Date(updatedRecordTime.getTime() + 10) // 10ms later
      const historyRecord = answerRepo.create({
        id: answer.id,
        assessmentId,
        questionId,
        value,
        rationale: rationale || null,
        notes: notes || null,
        status: AnswerStatus.COMPLETE,
        createdAt: answer.createdAt,
        updatedAt: historyRecordTime, // newer timestamp 2
      })
      await answerRepo.insert(historyRecord)

      return updatedRecord
    } else {
      // Normal edit (IN_PROGRESS, or continuing to edit a COMPLETE one)
      // "the record should be always updated unless is marked as complete"
      const newEditTime = new Date()
      const editedRecord = answerRepo.create({
        id: answer.id,
        assessmentId,
        questionId,
        value,
        rationale: rationale || null,
        notes: notes || null,
        status: AnswerStatus.IN_PROGRESS,
        createdAt: answer.createdAt,
        updatedAt: newEditTime,
      })
      await answerRepo.insert(editedRecord)
      await answerRepo.delete({ id: answer.id, updatedAt: oldUpdatedAt })
      return editedRecord
    }
  } else {
    // Brand new answer created for the first time
    const newRecordTime = new Date()
    answer = answerRepo.create({
      assessmentId,
      questionId,
      value,
      rationale: rationale || null,
      notes: notes || null,
      status: AnswerStatus.IN_PROGRESS,
      updatedAt: newRecordTime,
    })
    // For a brand new record where no history or duplicates exist yet from a previous partial save,
    // we just use simple create + save because `answerId` wasn't passed, meaning typeorm will generate the id.
    await answerRepo.save(answer)

    return answer
  }
}
/**
 * Bulk save answers (for import or batch operations)
 */
export async function bulkSaveAnswers(
  assessmentId: string,
  answers: Array<{
    questionId: string
    value: AnswerValue | null
    rationale?: string
    notes?: string
  }>
) {
  await initializeDatabase()
  const answerRepo = AppDataSource.getRepository(Answer)

  // Use upsert for efficiency
  const entities = answers.map(a => ({
    assessmentId,
    questionId: a.questionId,
    value: a.value,
    rationale: a.rationale || null,
    notes: a.notes || null
  }))

  await answerRepo.upsert(entities, ['assessment_id', 'question_id'])

  return entities.length
}

/**
 * Get a single question with full details
 */
export async function getQuestionById(questionId: string) {
  await initializeDatabase()
  const questionRepo = AppDataSource.getRepository(Question)
  
  return questionRepo.findOne({
    where: { id: questionId }
  })
}

/**
 * Get questions by theme for a diagnostic
 */
export async function getQuestionsByTheme(diagnosticId: string, theme: Theme) {
  await initializeDatabase()
  const questionRepo = AppDataSource.getRepository(Question)
  
  return questionRepo.find({
    where: { diagnosticId, theme },
    order: { sortOrder: 'ASC' }
  })
}

/**
 * Get complete question data with answer (candidate entities removed)
 * Optimized for single question view in assessment engine
 * Note: Guidance is now embedded in Question fields (definition, considerations, strategyExamples)
 */
export async function getCompleteQuestionData(
  assessmentId: string,
  questionId: string
) {
  await initializeDatabase()
  const questionRepo = AppDataSource.getRepository(Question)
  const answerRepo = AppDataSource.getRepository(Answer)
  
  // Get question (guidance is now embedded in question fields)
  const question = await questionRepo.findOne({
    where: { id: questionId }
  })
  
  if (!question) {
    throw new Error('Question not found')
  }

  // Get answer
  const answer = await answerRepo.findOne({
    where: {
      assessmentId,
      questionId,
    },
    order: {
      updatedAt: 'DESC',
    },
  })

  return {
    question,
    answer
  }
}
