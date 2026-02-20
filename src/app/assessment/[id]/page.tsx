import Scope from '@/components/assessment/Overview/Scope'
import KeySuccessFactors from '@/components/assessment/Overview/KeySuccessFactors'
import StrategicPlan from '@/components/assessment/Overview/StrategicPlan'
import { notFound } from 'next/navigation'

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { getAssessmentById, getQuestionsWithAnswers } =
    await import('@/db/queries/assessment-queries')

  const assessment = await getAssessmentById(id)
  if (!assessment) {
    return notFound()
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
    },
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
        completionYear: '2046',
      },
      restorationGoals: {
        goals: [],
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
        <StrategicPlan />
      </div>
    </div>
  )
}
