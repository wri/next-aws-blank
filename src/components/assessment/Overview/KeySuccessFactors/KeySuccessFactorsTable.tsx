import { CheckIcon } from '@/components/icons'
import { Questions } from '@/types/questions.types'
import { hasRichTextContent } from '@/utils/validation'
import { Tag } from '@worldresources/wri-design-systems'
import Link from 'next/link'
import AnswerOptionsResponse from '../../AnswerOptionsResponse'
import { AnswerStatus } from '@/types/answer.types'

interface KeySuccessFactorsTableProps {
  questions: Questions[]
  assessmentId: string
}

const KeySuccessFactorsTable = ({
  questions,
  assessmentId,
}: KeySuccessFactorsTableProps) => {
  const groupedQuestions = questions
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .reduce(
      (acc, q) => {
        const enablingCondition = q.enablingCondition
        if (!acc[enablingCondition]) {
          acc[enablingCondition] = []
        }
        acc[enablingCondition].push(q)
        return acc
      },
      {} as Record<string, Questions[]>,
    )

  return (
    <div>
      <div className='flex items-center gap-3 bg-neutral-200 border border-neutral-300 px-3 py-[10px]'>
        <p className='text-neutral-800 font-bold w-[440px]'>
          Key success factor
        </p>
        <p className='text-neutral-800 font-bold w-[130px]'>Status</p>
        <p className='text-neutral-800 font-bold w-[130px]'>Response</p>
        <p className='text-neutral-800 font-bold w-[130px]'>Rationale</p>
        <p className='text-neutral-800 font-bold w-[130px]'>Strategies</p>
      </div>

      {Object.entries(groupedQuestions).map(
        ([enablingCondition, questions]) => (
          <div key={enablingCondition}>
            <p className='text-neutral-800 font-bold px-5 py-[10px]'>
              {enablingCondition}
            </p>
            <div>
              {questions.map((q) => (
                <div
                  key={q.id}
                  className='flex items-start gap-3 py-3 px-[10px]'
                >
                  <Link
                    href={`/assessment/${assessmentId}/${q.theme.toLowerCase()}?questionCode=${q.questionCode}`}
                    className='max-w-[440px] w-full pl-8 underline decoration-dotted'
                  >
                    <p>{q.keySuccessFactor}</p>
                  </Link>
                  <div className='w-full max-w-[130px] flex'>
                    {q.answer.status === AnswerStatus.COMPLETE ? (
                      <Tag label='Complete' variant='success' />
                    ) : q.answer.status === AnswerStatus.IN_PROGRESS ? (
                      <Tag label='In progress' variant='info-white' />
                    ) : (
                      <Tag label='Not started' variant='info-grey' />
                    )}
                  </div>
                  <div className='w-full max-w-[130px]'>
                    <AnswerOptionsResponse value={q.answer.value} />
                  </div>
                  <div className='w-full max-w-[130px] h-6 flex items-center'>
                    {hasRichTextContent(q.answer.rationale) ? (
                      <CheckIcon className='text-success-900 h-6 w-6' />
                    ) : (
                      <div className='bg-neutral-600 h-[3px] w-6' />
                    )}
                  </div>
                  <div className='w-full max-w-[130px] h-6 flex items-center'>
                    <div className='bg-neutral-600 h-[3px] w-6' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  )
}

export default KeySuccessFactorsTable
