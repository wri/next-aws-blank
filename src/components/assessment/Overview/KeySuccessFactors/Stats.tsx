'use client'

import {
  YesAnswerIcon,
  PartlyAnswerIcon,
  NoAnswerIcon,
} from '@/components/icons'
import { Questions } from '@/types/questions.types'
import clsx from 'clsx'
import { useTranslations } from '@/i18n/useTranslations'

const Stats = ({
  questions,
  className,
}: {
  questions: Questions[]
  className?: string
}) => {
  const t = useTranslations()
  const yes = questions.filter(
    (q) => q?.answer?.value?.toLowerCase() === 'yes',
  ).length
  const partly = questions.filter(
    (q) => q?.answer?.value?.toLowerCase() === 'partly',
  ).length
  const no = questions.filter(
    (q) => q?.answer?.value?.toLowerCase() === 'no',
  ).length
  const nA = questions.filter(
    (q) => q?.answer?.value?.toLowerCase() === 'na',
  ).length

  const total = questions.length
  const complete = yes + partly + no + (nA ?? 0)

  return (
    <div className={clsx('flex items-center gap-2 mt-2 mb-5', className)}>
      <p className='text-neutral-700 text-sm'>
        {t('overview.keySuccessFactors.stats.complete', { complete, total })}
      </p>
      <div className='w-[1px] h-5 bg-neutral-300' />
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-0.5'>
          <YesAnswerIcon className='text-success-500 h-4 w-4' />
          <p className='text-neutral-700 text-sm'>{yes}</p>
        </div>
        <div className='flex items-center gap-0.5'>
          <PartlyAnswerIcon className='text-warning-500 h-4 w-4' />
          <p className='text-neutral-700 text-sm'>{partly}</p>
        </div>
        <div className='flex items-center gap-0.5'>
          <NoAnswerIcon className='text-error-500 h-4 w-4' />
          <p className='text-neutral-700 text-sm'>{no}</p>
        </div>
        {nA ? (
          <div className='flex items-center gap-0.5'>
            <div className='border-2 border-neutral-600 h-4 w-4 rounded-full' />
            <p className='text-neutral-700 text-sm'>{nA}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Stats
