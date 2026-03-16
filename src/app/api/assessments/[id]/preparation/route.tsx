import { Assessment } from '@/db/entities'
import { AssessmentSetupFormData } from '@/types/assessment-setup.types'
import { type NextRequest } from 'next/server'
import { PREPARATION_STEPS } from '@/constants'
import { steps } from '@/components/assessment/DiagnosticPreparation/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { AppDataSource } = await import('@/db/data-source')
  const { Region } = await import('@/db/entities/Region.entity')

  const { id: assessmentId } = await params

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const result = await AppDataSource.transaction(
    async (transactionalEntityManager) => {
      const assessmentRepository =
        transactionalEntityManager.getRepository(Assessment)
      const regionRepository = transactionalEntityManager.getRepository(Region)

      const assessment = await assessmentRepository.findOne({
        where: { id: assessmentId },
      })

      if (!assessment) {
        throw new Error('Assessment not found')
      }

      const region = await regionRepository.findOne({
        where: { id: assessment.regionId },
      })

      if (!region) {
        throw new Error('Region not found')
      }

      return {
        ...region,
        timeHorizon: assessment.timeHorizon ?? '',
        restorationGoals: assessment.restorationGoals ?? '',
        engagementStrategy: assessment.engagementStrategy ?? '',
        materials: assessment.materials ?? '',
        preparationStep:
          assessment.preparationStep ?? PREPARATION_STEPS.TARGET_GEOGRAPHY,
      }
    },
  )

  return Response.json({ success: true, data: result })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { AppDataSource } = await import('@/db/data-source')
  const { Region } = await import('@/db/entities/Region.entity')
  const body: AssessmentSetupFormData & { step: string } = await request.json()
  const { id: assessmentId } = await params

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const result = await AppDataSource.transaction(
    async (transactionalEntityManager) => {
      const assessmentRepository =
        transactionalEntityManager.getRepository(Assessment)
      const regionRepository = transactionalEntityManager.getRepository(Region)

      const assessment = await assessmentRepository.findOne({
        where: { id: assessmentId },
      })

      if (!assessment) {
        throw new Error('Assessment not found')
      }

      if (body.step === PREPARATION_STEPS.TARGET_GEOGRAPHY) {
        const oldRegion = await regionRepository.findOne({
          where: { id: assessment.regionId },
        })

        if (!oldRegion) {
          throw new Error('Region not found')
        }

        const region = regionRepository.create({
          ...oldRegion,
          regionName: `${body.country} - ${body.subRegion}`,
          geographyType: body.geographyType,
          countries: body.country,
          subRegion: body.subRegion,
          gisUrl: body.gisUrl || '',
          ecosystems: JSON.stringify(body.ecosystems),
        })

        await regionRepository.save(region)
      }

      const isEditing = body.isEditing
      const currentStepIndex = steps.findIndex((s) => s.id === body.step)
      const nextStepId = isEditing
        ? PREPARATION_STEPS.COMPLETE
        : currentStepIndex !== -1 && currentStepIndex < steps.length - 1
          ? steps[currentStepIndex + 1].id
          : PREPARATION_STEPS.COMPLETE

      let updatedAssessmentData = {
        ...assessment,
        preparationStep: nextStepId,
      }

      if (body.step === PREPARATION_STEPS.TIME_HORIZON) {
        updatedAssessmentData = {
          ...updatedAssessmentData,
          timeHorizon: body.timeHorizon || '',
        }
      }

      if (body.step === PREPARATION_STEPS.RESTORATION_GOALS) {
        updatedAssessmentData = {
          ...updatedAssessmentData,
          restorationGoals: body.restorationGoals || '',
        }
      }

      if (body.step === PREPARATION_STEPS.DEFINE_ENGAGEMENT) {
        updatedAssessmentData = {
          ...updatedAssessmentData,
          engagementStrategy: body.engagementStrategy || '',
        }
      }

      if (body.step === PREPARATION_STEPS.GATHER_MATERIALS) {
        updatedAssessmentData = {
          ...updatedAssessmentData,
          materials: body.materials || '',
        }
      }

      const updatedAssessment = assessmentRepository.create({
        ...updatedAssessmentData,
      })
      const savedAssessment = await assessmentRepository.save(updatedAssessment)

      return savedAssessment
    },
  )

  return Response.json({ success: true, data: result })
}
