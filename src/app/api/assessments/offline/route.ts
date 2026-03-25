import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import type { OfflineDownloadFormData } from '@/types/offline-download.types'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
export async function POST(request: NextRequest) {
  try {
    const { AppDataSource } = await import('@/db/data-source')
    const { Lead } = await import('@/db/entities/Lead.entity')
    const { Region } = await import('@/db/entities/Region.entity')
    const { Assessment, ProjectType, AssessmentStatus } = await import(
      '@/db/entities/Assessment.entity'
    )
    const { Diagnostic } = await import('@/db/entities/Diagnostic.entity')

    const body: OfflineDownloadFormData & { language?: string } =
      await request.json()

    const { name, email, organization, jobRole, targetGeography, contactAgreement } = body

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !targetGeography?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name, email, targetGeography' },
        { status: 400 },
      )
    }

    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 },
      )
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    await AppDataSource.transaction(async (manager) => {
      const leadRepository = manager.getRepository(Lead)
      const regionRepository = manager.getRepository(Region)
      const assessmentRepository = manager.getRepository(Assessment)
      const diagnosticRepository = manager.getRepository(Diagnostic)

      // 1. Create Lead
      const lead = leadRepository.create({
        name: name.trim(),
        email: normalizedEmail,
        organization: organization?.trim() || null,
        jobTitle: jobRole?.trim() || null,
        contactAgreement: contactAgreement ?? false,
      })
      const savedLead = await leadRepository.save(lead)

      // 2. Create Region — target geography stored as free-text
      const region = regionRepository.create({
        regionName: targetGeography.trim(),
        geographyType: targetGeography.trim(),
        ecosystems: JSON.stringify([]),
      })
      const savedRegion = await regionRepository.save(region)

      // 3. Find most recent diagnostic (default to 'en' if no language provided)
      const language = body.language || 'en'
      const diagnostic = await diagnosticRepository.findOne({
        where: { language },
        order: { createdAt: 'DESC' },
      })

      if (!diagnostic) {
        throw new Error(`No diagnostic found for language: ${language}`)
      }

      // 4. Create Assessment with OFFLINE status — no password needed
      const currentYear = new Date().getFullYear().toString()
      const assessment = assessmentRepository.create({
        leadId: savedLead.id,
        regionId: savedRegion.id,
        diagnosticId: diagnostic.id,
        passwordHash: '',
        diagnosticYear: currentYear,
        projectType: ProjectType.OTHER,
        status: AssessmentStatus.OFFLINE,
        title: `Offline - ${targetGeography.trim()}`,
        allowDataSharing: false,
      })
      await assessmentRepository.save(assessment)
    })

    return NextResponse.json(
      { success: true, message: 'Offline assessment created successfully' },
      { status: 201 },
    )
  } catch (error) {
    console.error('Failed to create offline assessment:', error)

    const isDev = process.env.NODE_ENV === 'development'
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'

    return NextResponse.json(
      {
        success: false,
        message: 'We encountered an issue. Please try again.',
        ...(isDev && { error: errorMessage }),
      },
      { status: 500 },
    )
  }
}
