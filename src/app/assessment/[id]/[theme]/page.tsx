import { notFound } from 'next/navigation'
import { ThemePageLayout } from './components/ThemePageLayout'
import { Theme } from '@/db/entities'
import type { Answer } from '@/db/entities/Answer.entity'

interface PageProps {
  params: Promise<{ id: string; theme: string }>
  searchParams: Promise<{ questionCode?: string | string[] }>
}

const THEME_ORDER = [
  Theme.MOTIVATE, 
  Theme.ENABLE, 
  Theme.IMPLEMENT
] as const;

function normalizeTheme(theme: string): Theme | null {
  const normalized = theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase()
  return THEME_ORDER.includes(normalized as Theme) ? normalized as Theme : null
}

export default async function ThemeQuestionPage({ params, searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const questionCodeFromUrl = resolvedSearchParams.questionCode as string

  // Await params as required by Next.js 15
  const { id: assessmentId, theme: themeParam } = await params
  
  // Validate theme
  const theme = normalizeTheme(themeParam)
  if (!theme) {
    notFound()
  }
  
  // Initialize database connection and lazy load queries
  const { initializeDatabase } = await import('@/db/data-source')
  await initializeDatabase()
  
  const { getAssessmentById, getQuestionsByTheme, getQuestionsWithAnswers } = await import('@/db/queries/assessment-queries')
  
  // Fetch data
  const assessment = await getAssessmentById(assessmentId)
  if (!assessment) {
    notFound()
  }
  
  const questions = await getQuestionsByTheme(assessment.diagnosticId, theme)
  const answersData = await getQuestionsWithAnswers(assessmentId)

  // TODO: Implement language switching
  const language = 'en'
  const pathname = `/assessment/${assessmentId}/${theme.toLowerCase()}`
  
  // Serialize TypeORM entities to plain objects for client components
  const plainQuestions = questions.map(q => {
    // Parse followUpQuestions from JSON string
    let followUpQuestions: { 'if yes'?: string[]; 'if no'?: string[] } | null = null
    if (q.followUpQuestions) {
      try {
        followUpQuestions = JSON.parse(q.followUpQuestions)
      } catch {
        console.error('Failed to parse followUpQuestions for question', q.id)
      }
    }
    
    return {
      id: q.id,
      questionCode: q.questionCode,
      theme: q.theme,
      enablingCondition: q.enablingCondition,
      keySuccessFactor: q.keySuccessFactor,
      minimalKeySuccessFactor: q.minimalKeySuccessFactor,
      definition: q.definition,
      questionText: q.questionText,
      considerations: q.considerations,
      followUpQuestions,
      strategyExamples: q.strategyExamples,
      sortOrder: q.sortOrder,
      diagnosticId: q.diagnosticId,
      createdAt: q.createdAt
    }
  })
  
  // Build answers map - each question has 0 or 1 answer
  const answersMap = new Map<string, Answer>()
  answersData.forEach(q => {
    if (q.answers && q.answers.length > 0) {
      // Take the first answer (there should only be one per question)
      const answer = q.answers[0]
      // Serialize answer to plain object
      answersMap.set(q.id, {
        id: answer.id,
        value: answer.value,
        rationale: answer.rationale,
        notes: answer.notes,
        assessmentId: answer.assessmentId,
        questionId: answer.questionId,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt
      } as Answer)
    }
  })
  
  // Find first unanswered question
  const firstUnanswered = plainQuestions.find(q => !answersMap.has(q.id))
  const urlQuestionExists = plainQuestions.some(q => q.questionCode === questionCodeFromUrl)
  const focusQuestionCode = urlQuestionExists
    ? questionCodeFromUrl
    : (firstUnanswered?.questionCode || plainQuestions[0]?.questionCode)
  
  if (!focusQuestionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No questions found</h1>
          <p className="text-slate-600">There are no questions for the {theme} theme.</p>
        </div>
      </div>
    )
  }
  
  // Calculate theme navigation state
  const themeIndex = THEME_ORDER.indexOf(theme)
  const canGoPrev = themeIndex > 0
  const canGoNext = themeIndex < THEME_ORDER.length - 1
  const prevTheme = canGoPrev ? THEME_ORDER[themeIndex - 1].toLowerCase() : null
  const nextTheme = canGoNext ? THEME_ORDER[themeIndex + 1].toLowerCase() : null
  
  return (
    <ThemePageLayout
      assessmentId={assessmentId}
      theme={theme}
      pathname={pathname}
      language={language}
      questions={plainQuestions}
      initialAnswers={answersMap}
      focusQuestionCode={focusQuestionCode}
      canGoPrev={canGoPrev}
      canGoNext={canGoNext}
      prevTheme={prevTheme}
      nextTheme={nextTheme}
    />
  )
}
