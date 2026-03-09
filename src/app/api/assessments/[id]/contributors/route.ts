import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/assessments/[id]/contributors
 * List all contributors for an assessment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { initializeDatabase } = await import('@/db/data-source')
  await initializeDatabase()
  const { getContributorsByAssessment } = await import('@/db/queries/assessment-queries')
  
  const { id: assessmentId } = await params
  
  try {
    const contributors = await getContributorsByAssessment(assessmentId)
    return NextResponse.json({ success: true, contributors })
  } catch (error) {
    console.error('Failed to fetch contributors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contributors' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/assessments/[id]/contributors
 * Create a new contributor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { initializeDatabase } = await import('@/db/data-source')
  await initializeDatabase()
  const { createContributor } = await import('@/db/queries/assessment-queries')
  
  const { id: assessmentId } = await params
  
  try {
    const body = await request.json()
    const { name } = body
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Contributor name is required' },
        { status: 400 }
      )
    }
    
    const contributor = await createContributor(assessmentId, name.trim())
    return NextResponse.json({ success: true, contributor })
  } catch (error) {
    console.error('Failed to create contributor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create contributor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/assessments/[id]/contributors
 * Delete a contributor from the pool
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { initializeDatabase } = await import('@/db/data-source')
  await initializeDatabase()
  const { deleteContributor } = await import('@/db/queries/assessment-queries')
  
  const { id: assessmentId } = await params
  
  try {
    const body = await request.json()
    const { contributorId } = body
    
    if (!contributorId) {
      return NextResponse.json(
        { success: false, error: 'contributorId is required' },
        { status: 400 }
      )
    }
    
    const deleted = await deleteContributor(contributorId, assessmentId)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Contributor not found in this assessment' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete contributor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contributor' },
      { status: 500 }
    )
  }
}
