'use client'

import { Questions } from '@/types/questions.types'
import CardContainer from '../CardContainer'
import { useRouter } from 'next/navigation'
import { Theme } from '@/db/entities'
import Stats from './Stats'
import KeySuccessFactorsTable from './KeySuccessFactorsTable'
import { AnswerStatus } from '@/types/answer.types'
import { useTranslations } from '@/i18n/useTranslations'

const KeySuccessFactorsSection = ({
  questions,
  assessmentId,
  theme,
  title,
  caption,
  openByDefault,
}: {
  questions: Questions[]
  assessmentId: string
  theme: Theme
  title: string
  caption: string
  openByDefault?: boolean
}) => {
  const router = useRouter()
  const t = useTranslations()

  const getQuestionsMetadata = () => {
    const shouldStart = questions.every((q) => !q.answer?.status)
    const shouldContinue = questions.some(
      (q) => q.answer?.status === AnswerStatus.IN_PROGRESS,
    )
    const isComplete = questions.every(
      (q) => q.answer?.status === AnswerStatus.COMPLETE,
    )

    const sortedQuestions = questions.sort((a, b) => a.sortOrder - b.sortOrder)
    const firstUnansweredQuestion = sortedQuestions.find(
      (q) => !q.answer?.value,
    )
    const firstInProgressQuestion = sortedQuestions.find(
      (q) => q.answer?.status === AnswerStatus.IN_PROGRESS,
    )
    const firstQuestion = sortedQuestions[0]

    return {
      shouldStart,
      shouldContinue,
      isComplete,
      firstUnansweredQuestion,
      firstInProgressQuestion,
      firstQuestion,
    }
  }

  const {
    shouldStart,
    shouldContinue,
    isComplete,
    firstUnansweredQuestion,
    firstInProgressQuestion,
    firstQuestion,
  } = getQuestionsMetadata()

  const nextQuestionCode =
    firstUnansweredQuestion?.questionCode ||
    firstInProgressQuestion?.questionCode ||
    firstQuestion?.questionCode

  return (
    <CardContainer
      title={title}
      caption={caption}
      hideLabel={t('overview.scope.labels.table')}
      onStart={
        shouldStart
          ? () =>
              router.push(`/assessment/${assessmentId}/${theme.toLowerCase()}`)
          : undefined
      }
      onContinue={
        nextQuestionCode
          ? () =>
              router.push(
                `/assessment/${assessmentId}/${theme.toLowerCase()}?questionCode=${nextQuestionCode}`,
              )
          : undefined
      }
      tag={
        shouldStart
          ? t('overview.keySuccessFactors.status.notStarted')
          : shouldContinue
            ? t('overview.keySuccessFactors.status.inProgress')
            : isComplete
              ? t('overview.keySuccessFactors.status.complete')
              : undefined
      }
      noHorizontalPadding
      openByDefault={openByDefault}
    >
      <Stats questions={questions} className='px-4' />

      <KeySuccessFactorsTable
        questions={questions}
        assessmentId={assessmentId}
      />
    </CardContainer>
  )
}

export default KeySuccessFactorsSection
