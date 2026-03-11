import Scope from '@/components/assessment/Overview/Scope'
import KeySuccessFactors from '@/components/assessment/Overview/KeySuccessFactors'
import StrategicPlan from '@/components/assessment/Overview/StrategicPlan'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { validateSessionCookie } from '@/utils/session'
import { PasswordPrompt } from '@/components/assessment/PasswordPrompt'
import FromPreparationModal from '@/components/assessment/Overview/FromPreparationModal'
import { PREPARATION_STEPS } from '@/components/assessment/DiagnosticPreparation/utils'

export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ isFromPreparation?: string | string[] }>
}) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const isFromPreparation = resolvedSearchParams.isFromPreparation as string

  // Check session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('assessment_session')

  let hasValidSession = false
  if (sessionCookie) {
    try {
      const validation = validateSessionCookie(sessionCookie.value, id)
      hasValidSession = validation.valid
    } catch (error) {
      // Treat validation errors as invalid session
      void error
      hasValidSession = false
    }
  }

  // If no valid session, show password prompt
  if (!hasValidSession) {
    return <PasswordPrompt assessmentId={id} />
  }
  const {
    getAssessmentById,
    getQuestionsWithAnswers,
    getContributorsByAssessment,
  } = await import('@/db/queries/assessment-queries')

  const assessment = await getAssessmentById(id)
  if (!assessment) {
    return notFound()
  }

  // COMPLETE is the last step of the preparation
  if (assessment.preparationStep !== PREPARATION_STEPS.COMPLETE) {
    return redirect(
      `/assessment/${id}/preparation/${assessment.preparationStep}`,
    )
  }

  const questionsAnswersData = await getQuestionsWithAnswers(assessment.id)

  const questions = questionsAnswersData.map((qa) => ({
    id: qa.id,
    questionCode: qa.questionCode,
    theme: qa.theme,
    enablingCondition: qa.enablingCondition,
    keySuccessFactor: qa.keySuccessFactor,
    definition: qa.definition,
    questionText: qa.questionText,
    considerations: qa.considerations,
    followUpQuestions: qa.followUpQuestions,
    strategyExamples: qa.strategyExamples,
    sortOrder: qa.sortOrder,
    createdAt: qa.createdAt,
    diagnosticId: qa.diagnosticId,
    answer: {
      assessmentId: qa.answer?.assessmentId ?? '',
      createdAt: qa.answer?.createdAt ?? qa.createdAt,
      id: qa.answer?.id ?? '',
      notes: qa.answer?.notes ?? null,
      questionId: qa.answer?.questionId ?? qa.id,
      rationale: qa.answer?.rationale ?? '',
      updatedAt: qa.answer?.updatedAt ?? qa.createdAt,
      value: qa.answer?.value ?? '',
      status: qa.answer?.status ?? '',
      strategies: qa.answer?.strategies ?? '',
    },
  }))

  const allContributors = await getContributorsByAssessment(assessment.id)
  const plainContributors = allContributors.map(c => ({
    id: c.id,
    name: c.name,
    assessmentId: c.assessmentId,
    createdAt: c.createdAt
  }))

  const scopeData = {
    title: assessment.title,
    diagnosticLead: {
      name: assessment.lead.name,
      email: assessment.lead.email,
      organization: assessment.lead.organization,
      role: assessment.lead.role,
    },
    diagnosticScope: {
      geography: {
        country: assessment.region.countries,
        geographyType: assessment.region.geographyType,
        subRegion: assessment.region.subRegion,
        gisUrl: assessment.region.gisUrl,
      },
      timeHorizon: {
        completionYear: assessment.timeHorizon,
      },
      restorationGoals: {
        goals: assessment.restorationGoals,
        ecosystems: assessment.region.ecosystems
          ? (JSON.parse(assessment.region.ecosystems) as string[])
          : ([] as string[]),
      },
    },
  }

  return (
    <div className='pb-20'>
      <div className='py-2 px-4 border-b border-neutral-400 mb-16'>
        <h1 className='text-lg font-bold text-neutral-800'>Overview</h1>
      </div>

      <div className='w-full max-w-screen-1100 p-4 mx-auto flex flex-col gap-10'>
        <Scope data={scopeData} />
        <KeySuccessFactors assessmentId={id} questions={questions} />
        <StrategicPlan
          assessmentId={id}
          questions={questions}
          allContributors={plainContributors}
        />
        <FromPreparationModal
          autoOpen={isFromPreparation === 'true'}
          assessmentId={id}
        />
      </div>
    </div>
  )
}
