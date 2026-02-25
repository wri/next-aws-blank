import { Questions } from '@/types/questions.types'
import CardContainer from '../CardContainer'
import { useRouter } from 'next/navigation'
import { Theme } from '@/db/entities'
import Stats from './Stats'
import KeySuccessFactorsTable from './KeySuccessFactorsTable'
import { AnswerStatus } from '@/types/answer.types'

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
      hideLabel='table'
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
          ? 'Not started'
          : shouldContinue
            ? 'In progress'
            : isComplete
              ? 'Complete'
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
