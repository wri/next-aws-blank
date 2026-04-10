'use client'

import {
  YesAnswerIcon,
  PartlyAnswerIcon,
  NoAnswerIcon,
} from '@/components/icons'
import { useTranslations } from '@/i18n/useTranslations'
import { AnswerValue } from '@/types/answer.types'

const AnswerOptionsResponse = ({ value = '' }: { value: string }) => {
  const t = useTranslations()
  let icon = <YesAnswerIcon className='text-success-500 h-6 w-6' />
  let text = ''

  if (value?.toLowerCase() === AnswerValue.YES) {
    icon = <YesAnswerIcon className='text-success-500 h-6 w-6' />
    text = t('assessment.navigation.status.yes')
  } else if (value?.toLowerCase() === AnswerValue.PARTLY) {
    icon = <PartlyAnswerIcon className='text-warning-500 h-6 w-6' />
    text = t('assessment.navigation.status.partly')
  } else if (value?.toLowerCase() === AnswerValue.NO) {
    icon = <NoAnswerIcon className='text-error-500 h-6 w-6' />
    text = t('assessment.navigation.status.no')
  } else if (value?.toLowerCase() === AnswerValue.NA) {
    icon = <div className='border-2 border-neutral-600 h-6 w-6 rounded-full' />
    text = t('assessment.navigation.status.na')
  } else {
    icon = <div className='bg-neutral-600 h-[3px] w-6' />
  }

  return (
    <div className='h-6 flex items-center gap-1.5'>
      {icon}
      <p className='text-neutral-800 capitalize'>{text}</p>
    </div>
  )
}

export default AnswerOptionsResponse
