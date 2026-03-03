import { Assessment } from '@/db/entities'
import { AssessmentSetupFormData } from '@/types/assessment-setup.types'
import { type NextRequest } from 'next/server'

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
  const body: AssessmentSetupFormData & { step: number } = await request.json()
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

      if (body.step === 1) {
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
          gisUrl: body.gisUrl || undefined,
          ecosystems: JSON.stringify(body.ecosystems),
        })

        const savedRegion = await regionRepository.save(region)

        return savedRegion
      }

      if (body.step === 2) {
        const updatedAssessment = assessmentRepository.create({
          ...assessment,
          timeHorizon: body.timeHorizon,
        })

        const savedAssessment =
          await assessmentRepository.save(updatedAssessment)

        return savedAssessment
      }

      if (body.step === 3) {
        const updatedAssessment = assessmentRepository.create({
          ...assessment,
          restorationGoals: body.restorationGoals,
        })

        const savedAssessment =
          await assessmentRepository.save(updatedAssessment)

        return savedAssessment
      }

      if (body.step === 4) {
        const updatedAssessment = assessmentRepository.create({
          ...assessment,
          engagementStrategy: body.engagementStrategy,
        })

        const savedAssessment =
          await assessmentRepository.save(updatedAssessment)

        return savedAssessment
      }

      if (body.step === 5) {
        const updatedAssessment = assessmentRepository.create({
          ...assessment,
          materials: body.materials,
        })

        const savedAssessment =
          await assessmentRepository.save(updatedAssessment)

        return savedAssessment
      }
    },
  )

  return Response.json({ success: true, data: result })
}
