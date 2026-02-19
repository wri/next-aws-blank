import { Questions } from '@/types/questions.types'
import CardContainer from '../CardContainer'
import { useRouter } from 'next/navigation'
import { Theme } from '@/db/entities'
import Stats from './Stats'
import KeySuccessFactorsTable from './KeySuccessFactorsTable'

const KeySuccessFactorsSection = ({
  questions,
  assessmentId,
  theme,
  title,
  caption,
}: {
  questions: Questions[]
  assessmentId: string
  theme: Theme
  title: string
  caption: string
}) => {
  const router = useRouter()

  const getQuestionsMetadata = () => {
    const shouldStart = questions.every((q) => !q.answer?.value)
    const shouldContinue = questions.some((q) => q.answer?.value)
    const firstUnansweredQuestion = questions
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .find((q) => !q.answer?.value)

    return {
      shouldStart,
      shouldContinue,
      firstUnansweredQuestion,
    }
  }

  const { shouldStart, shouldContinue, firstUnansweredQuestion } =
    getQuestionsMetadata()

  return (
    <CardContainer
      title={title}
      hideLabel='table'
      onStart={
        shouldStart
          ? () =>
              router.push(`/assessment/${assessmentId}/${theme.toLowerCase()}`)
          : undefined
      }
      onContinue={
        firstUnansweredQuestion
          ? () =>
              router.push(
                `/assessment/${assessmentId}/${theme.toLowerCase()}?questionCode=${firstUnansweredQuestion.questionCode}`,
              )
          : undefined
      }
      tag={
        shouldStart
          ? 'Not started'
          : shouldContinue
            ? 'In progress'
            : 'Complete'
      }
      noHorizontalPadding
    >
      <p className='text-neutral-800 w-full max-w-[560px] mb-2 px-4'>
        {caption}
      </p>

      <Stats questions={questions} className='px-4' />

      <KeySuccessFactorsTable
        questions={questions}
        assessmentId={assessmentId}
      />
    </CardContainer>
  )
}

export default KeySuccessFactorsSection
