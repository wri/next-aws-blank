'use client'

import {
  CheckCircleIcon,
  PopulatedCheckIcon,
  NotStartedIcon,
  InProgressIcon,
} from '@/components/icons'
import { Questions } from '@/types/questions.types'
import { hasRichTextContent } from '@/utils/validation'
import { Tag } from '@worldresources/wri-design-systems'
import Link from 'next/link'
import AnswerOptionsResponse from '../../AnswerOptionsResponse'
import { AnswerStatus } from '@/types/answer.types'
import { useTranslations } from '@/i18n/useTranslations'

interface KeySuccessFactorsTableProps {
  questions: Questions[]
  assessmentId: string
}

const KeySuccessFactorsTable = ({
  questions,
  assessmentId,
}: KeySuccessFactorsTableProps) => {
  const t = useTranslations()
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
          {t('overview.keySuccessFactors.table.headers.keySuccessFactor')}
        </p>
        <p className='text-neutral-800 font-bold w-[130px]'>
          {t('overview.keySuccessFactors.table.headers.status')}
        </p>
        <p className='text-neutral-800 font-bold w-[130px]'>
          {t('overview.keySuccessFactors.table.headers.response')}
        </p>
        <p className='text-neutral-800 font-bold w-[130px]'>
          {t('overview.keySuccessFactors.table.headers.rationale')}
        </p>
        <p className='text-neutral-800 font-bold w-[130px]'>
          {t('overview.keySuccessFactors.table.headers.strategies')}
        </p>
      </div>

      {Object.entries(groupedQuestions).map(
        ([enablingCondition, questions]) => (
          <div key={enablingCondition}>
            <p className='text-neutral-800 font-bold px-5 py-[10px]'>
              {enablingCondition}
            </p>
            <div>
              {questions.map((q) => {
                const strategies = q?.answer?.strategies
                  ? JSON.parse(q?.answer?.strategies)
                  : []

                return (
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
                        <Tag
                          label={t(
                            'overview.keySuccessFactors.status.complete',
                          )}
                          variant='success'
                          icon={<CheckCircleIcon />}
                        />
                      ) : q.answer.status === AnswerStatus.IN_PROGRESS ? (
                        <Tag
                          label={t(
                            'overview.keySuccessFactors.status.inProgress',
                          )}
                          variant='warning'
                          icon={<InProgressIcon />}
                        />
                      ) : (
                        <Tag
                          label={t(
                            'overview.keySuccessFactors.status.notStarted',
                          )}
                          variant='info-grey'
                          icon={<NotStartedIcon />}
                        />
                      )}
                    </div>
                    <div className='w-full max-w-[130px]'>
                      <AnswerOptionsResponse value={q.answer.value} />
                    </div>
                    <div className='w-full max-w-[130px] h-6 flex items-center'>
                      {q.answer.value?.toLowerCase() === 'na' ? (
                        t('overview.keySuccessFactors.table.na')
                      ) : hasRichTextContent(q.answer.rationale) ? (
                        <PopulatedCheckIcon className='h-6 w-6' />
                      ) : (
                        <div className='bg-neutral-600 h-[3px] w-6' />
                      )}
                    </div>
                    <div className='w-full max-w-[130px] h-6 flex items-center'>
                      {q.answer.value?.toLowerCase() === 'na' ? (
                        t('overview.keySuccessFactors.table.na')
                      ) : strategies.length > 0 ? (
                        t('overview.keySuccessFactors.table.added', {
                          count: strategies.length,
                        })
                      ) : (
                        <div className='bg-neutral-600 h-[3px] w-6' />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ),
      )}
    </div>
  )
}

export default KeySuccessFactorsTable
