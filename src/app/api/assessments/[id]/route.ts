import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { initializeDatabase } = await import('@/db/data-source')
  await initializeDatabase()
  const { getAssessmentById } = await import('@/db/queries/assessment-queries')

  const { id } = await params

  try {
    const assessment = await getAssessmentById(id)
    return NextResponse.json({
      success: true,
      assessmentTitle: assessment?.title || '',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 },
    )
  }
}
