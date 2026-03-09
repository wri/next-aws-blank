import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { Answer } from '@/db/entities/Answer.entity'

/**
 * GET /api/assessments/[id]/answers/[answerId]/contributors
 * Get contributors for a specific answer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> }
) {
  const { initializeDatabase, AppDataSource } = await import('@/db/data-source')
  await initializeDatabase()
  const { getContributorsByAnswer } = await import('@/db/queries/assessment-queries')
  
  const { id: assessmentId, answerId } = await params
  
  try {
    // Verify answer belongs to this assessment
    const answerRepo = AppDataSource.getRepository(Answer)
    const answer = await answerRepo.findOne({
      where: { id: answerId, assessmentId },
      order: { updatedAt: 'DESC' }
    })
    
    if (!answer) {
      return NextResponse.json(
        { success: false, error: 'Answer not found in this assessment' },
        { status: 404 }
      )
    }
    
    const contributors = await getContributorsByAnswer(answerId)
    return NextResponse.json({ success: true, contributors })
  } catch (error) {
    console.error('Failed to fetch answer contributors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch answer contributors' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/assessments/[id]/answers/[answerId]/contributors
 * Set contributors for an answer (replaces existing)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> }
) {
  const { initializeDatabase, AppDataSource } = await import('@/db/data-source')
  await initializeDatabase()
  const { setAnswerContributors } = await import('@/db/queries/assessment-queries')
  const { Contributor } = await import('@/db/entities/Contributor.entity')
  
  const { id: assessmentId, answerId } = await params
  
  try {
    const body = await request.json()
    const { contributorIds } = body
    
    if (!Array.isArray(contributorIds)) {
      return NextResponse.json(
        { success: false, error: 'contributorIds must be an array' },
        { status: 400 }
      )
    }
    
    // Verify answer belongs to this assessment
    const answerRepo = AppDataSource.getRepository(Answer)
    const answer = await answerRepo.findOne({
      where: { id: answerId, assessmentId },
      order: { updatedAt: 'DESC' }
    })
    
    if (!answer) {
      return NextResponse.json(
        { success: false, error: 'Answer not found in this assessment' },
        { status: 404 }
      )
    }
    
    // Verify all contributors belong to this assessment
    if (contributorIds.length > 0) {
      const contributorRepo = AppDataSource.getRepository(Contributor)
      const validContributors = await contributorRepo.count({
        where: contributorIds.map(id => ({ id, assessmentId }))
      })
      
      if (validContributors !== contributorIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more contributors do not belong to this assessment' },
          { status: 400 }
        )
      }
    }
    
    await setAnswerContributors(answerId, contributorIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to set answer contributors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set answer contributors' },
      { status: 500 }
    )
  }
}
