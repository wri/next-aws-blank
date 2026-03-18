import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { searchParams } = new URL(request.url)
  const language = searchParams.get('language') || 'en'

  const { initializeDatabase } = await import('@/db/data-source')
  await initializeDatabase()
  const { getLocalizedQuestionsWithAnswers } = await import(
    '@/db/queries/assessment-queries'
  )

  const { id: assessmentId } = await params

  try {
    const questionsWithAnswers = await getLocalizedQuestionsWithAnswers(
      assessmentId,
      language,
    )

    const questions = questionsWithAnswers.map((q) => {
      let followUpQuestions: { 'if yes'?: string[]; 'if no'?: string[] } | null =
        null

      if (q.followUpQuestions) {
        try {
          followUpQuestions = JSON.parse(q.followUpQuestions)
        } catch {
          followUpQuestions = null
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
        createdAt: q.createdAt,
      }
    })

    const answers = questionsWithAnswers
      .filter((q) => q.answer)
      .map((q) => ({ ...q.answer!, questionId: q.id }))

    return NextResponse.json({ success: true, questions, answers })
  } catch (error) {
    console.error('Failed to fetch localized questions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch localized questions' },
      { status: 500 },
    )
  }
}
