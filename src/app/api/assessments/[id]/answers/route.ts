import 'reflect-metadata'
import { AnswerStatus } from '@/types/answer.types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Lazy load database modules to avoid circular dependency issues
  const { initializeDatabase } = await import('@/db/data-source')
  await initializeDatabase()
  const { saveAnswer } = await import('@/db/queries/assessment-queries')
  
  // Await params as required by Next.js 15
  const { id: assessmentId } = await params
  
  try {
    const body = await request.json()
    const { questionId, value, rationale, notes, status, id: answerId } = body
    
    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'questionId is required' },
        { status: 400 }
      )
    }
    
    const answer = await saveAnswer(
      assessmentId,
      questionId,
      value || undefined,
      rationale || undefined,
      notes || undefined,
      status || AnswerStatus.IN_PROGRESS,
      answerId,
    )
    
    return NextResponse.json({ 
      success: true, 
      answer,
      savedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to save answer:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save answer',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined
      },
      { status: 500 }
    )
  }
}

// GET endpoint for fetching answers (optional, for refresh)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { initializeDatabase } = await import('@/db/data-source')
  await initializeDatabase()
  const { getQuestionsWithAnswers } = await import('@/db/queries/assessment-queries')
  
  // Await params as required by Next.js 15
  const { id } = await params
  
  try {
    const answers = await getQuestionsWithAnswers(id)
    return NextResponse.json({ success: true, answers })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch answers' },
      { status: 500 }
    )
  }
}
