import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import type { AssessmentSetupFormData } from '@/types/assessment-setup.types'
import { randomBytes } from 'crypto'
import * as bcrypt from 'bcrypt'

function generatePassword(): string {
  // Generate a 10-character alphanumeric password (uppercase, lowercase, numbers)
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789' // Excludes ambiguous chars: 0, O, 1, I, l
  const length = 10
  let password = ''

  const randomValues = randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length]
  }

  return password
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    // Lazy-load database dependencies to avoid circular dependencies during build
    const { AppDataSource } = await import('@/db/data-source')
    const { Lead } = await import('@/db/entities/Lead.entity')
    const { Region } = await import('@/db/entities/Region.entity')
    const { Assessment, ProjectType, AssessmentStatus } =
      await import('@/db/entities/Assessment.entity')
    const { Diagnostic } = await import('@/db/entities/Diagnostic.entity')

    const body: AssessmentSetupFormData & { language: string } =
      await request.json()

    // Normalize and validate email server-side
    const normalizedEmail = normalizeEmail(body.email)
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 },
      )
    }

    // Initialize database connection if not already
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    // Generate a secure password for this assessment
    const password = generatePassword()

    // Wrap all DB operations in a transaction to prevent orphan records
    const result = await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        const leadRepository = transactionalEntityManager.getRepository(Lead)
        const regionRepository =
          transactionalEntityManager.getRepository(Region)
        const assessmentRepository =
          transactionalEntityManager.getRepository(Assessment)
        const diagnosticRepository =
          transactionalEntityManager.getRepository(Diagnostic)

        // 1. Create or find Lead (user information)
        let lead = await leadRepository.findOne({
          where: { email: normalizedEmail },
        })

        if (!lead) {
          lead = leadRepository.create({
            jobTitle: body.jobTitle,
            name: body.fullName,
            email: normalizedEmail,
            organization: body.organization,
            role: body.role,
          })
          lead = await leadRepository.save(lead)
        }

        // 2. Create Region (geography information)
        const region = regionRepository.create({
          regionName: `${body.country} - ${body.subRegion}`,
          geographyType: body.geographyType,
          countries: body.country,
          subRegion: body.subRegion,
          scope: body.scope,
          ecosystems: JSON.stringify(body.ecosystems),
          gisUrl: body.gisUrl || undefined,
        })
        const savedRegion = await regionRepository.save(region)

        // 3. Find the most recent diagnostic for the user's language
        const diagnostic = await diagnosticRepository.findOne({
          where: { language: body.language },
          order: { createdAt: 'DESC' },
        })

        if (!diagnostic) {
          throw new Error(`No diagnostic found for language: ${body.language}`)
        }

        // 4. Create Assessment (linking lead, region, and diagnostic)
        const currentYear = new Date().getFullYear().toString()

        // Hash the password before storing (plaintext returned only once)
        const passwordHash = await bcrypt.hash(password, 10)

        const assessment = assessmentRepository.create({
          leadId: lead.id,
          regionId: savedRegion.id,
          diagnosticId: diagnostic.id,
          passwordHash: passwordHash,
          diagnosticYear: currentYear,
          projectType: ProjectType.OTHER,
          status: AssessmentStatus.DRAFT,
          title: body.title,
          allowDataSharing: body.allowDataSharing,
        })

        const savedAssessment = await assessmentRepository.save(assessment)

        return {
          assessmentId: savedAssessment.id,
          password: password,
        }
      },
    )

    // Create session cookie for immediate access
    const { createSessionCookie } = await import('@/utils/session')
    const sessionCookie = createSessionCookie(result.assessmentId)

    const response = NextResponse.json(
      {
        success: true,
        assessmentId: result.assessmentId,
        password: result.password,
        message: 'Assessment created successfully',
      },
      { status: 201 },
    )

    // Set session cookie so creator is automatically authenticated
    response.cookies.set('assessment_session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Failed to create assessment:', error)

    const isDev = process.env.NODE_ENV === 'development'
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    const userMessage =
      'We encountered an issue while creating your assessment. Please check your information and try again.'

    return NextResponse.json(
      {
        success: false,
        message: userMessage,
        error: errorMessage,
        ...(isDev && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 },
    )
  }
}
