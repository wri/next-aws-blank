'use client'

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  InterviewIcon,
  PeopleIcon,
  SendIcon,
} from '@/components/icons'
import { Button } from '@worldresources/wri-design-systems'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ChakraRichTextEditor } from '../ChakraRichTextEditor'
import { Collapsible } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import Loader from '@/components/ui/Loader'
import { PREPARATION_STEPS } from '@/constants'
import RichText from '@/components/ui/RichText'
import {
  usePreparationSubmit,
  type PreparationSubmitAction,
} from './PreparationSubmitContext'
import { useTranslations } from '@/i18n/useTranslations'

const DefineEngagement = () => {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [engagementStrategy, setEngagementStrategy] = useState('')
  const t = useTranslations()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('isEditMode')
  const isEditing = isEditMode === 'true'
  const { registerSubmitHandler } = usePreparationSubmit()

  const assessmentId = params.id as string
  const activeStep =
    (params.step as string) || PREPARATION_STEPS.DEFINE_ENGAGEMENT

  const getAssessmentData = useCallback(async () => {
    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const jsonResult = await result.json()

    if (jsonResult.success && jsonResult.data.engagementStrategy) {
      setEngagementStrategy(jsonResult.data.engagementStrategy)
    }

    setIsLoading(false)
  }, [assessmentId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAssessmentData()
  }, [getAssessmentData])

  const onSubmit = useCallback(
    async (action: PreparationSubmitAction = 'advance') => {
      setIsSubmitting(true)

      const payload = {
        engagementStrategy,
        step: activeStep,
        isEditing,
      }

      const result = await fetch(
        `/api/assessments/${assessmentId}/preparation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )
      const jsonResult = await result.json()

      if (jsonResult.success) {
        const destination =
          action === 'exit'
            ? `/assessment/${assessmentId}`
            : `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.GATHER_MATERIALS}${isEditing ? '?isEditMode=true' : ''}`

        router.push(destination)
      }

      setIsSubmitting(false)
    },
    [activeStep, assessmentId, engagementStrategy, isEditing, router],
  )

  useEffect(() => {
    registerSubmitHandler(onSubmit)

    return () => registerSubmitHandler(null)
  }, [onSubmit, registerSubmitHandler])

  if (isLoading) {
    return <Loader />
  }

  const suggestedApproaches = [
    {
      title: t('scoping.step4.accordions.participatory.title'),
      icon: <PeopleIcon className='w-4 h-4 text-secondary-500' />,
      content: t('scoping.step4.accordions.participatory.content'),
    },
    {
      title: t('scoping.step4.accordions.interviews.title'),
      icon: <InterviewIcon className='w-4 h-4 text-secondary-500' />,
      content: t('scoping.step4.accordions.interviews.content'),
    },
    {
      title: t('scoping.step4.accordions.distributed.title'),
      icon: <SendIcon className='w-4 h-4 text-secondary-500' />,
      content: t('scoping.step4.accordions.distributed.content'),
    },
  ]

  return (
    <div className='pb-28'>
      <Button
        variant='borderless'
        className='text-neutral-700 mb-4'
        leftIcon={<ChevronLeftIcon className='w-3 h-3' />}
        onClick={() =>
          router.push(
            `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.RESTORATION_GOALS}${isEditing ? '?isEditMode=true' : ''}`,
          )
        }
      >
        <span className='underline underline-offset-1'>
          {t('scoping.common.buttons.previous')}
        </span>
      </Button>

      <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
        {t('scoping.step4.heading')}
      </h1>
      <p className='text-neutral-800 mb-2'>{t('scoping.step4.description1')}</p>
      <p className='text-neutral-800 mb-2'>{t('scoping.step4.description2')}</p>
      <p className='text-neutral-800 mb-8'>{t('scoping.step4.description3')}</p>

      <div className='mb-10'>
        <p className='text-neutral-900 text-xl mb-2 font-bold'>
          {t('scoping.step4.suggestedApproachesHeading')}
        </p>
        <p className='text-neutral-800 mb-4'>
          {t('scoping.step4.suggestedApproachesDescription')}
        </p>

        {suggestedApproaches.map((approach, idx) => (
          <Collapsible.Root
            key={approach.title}
            className='mt-5 border border-neutral-300 rounded-lg bg-white'
            defaultOpen={idx === 0}
          >
            <Collapsible.Trigger asChild>
              <div className='px-4 py-3 flex items-start justify-between gap-3 cursor-pointer'>
                <div className='font-bold text-neutral-800 flex items-center gap-2'>
                  {approach.icon}
                  {approach.title}
                </div>
                <Collapsible.Indicator _open={{ transform: 'rotate(180deg)' }}>
                  <ChevronDownIcon className='text-neutral-800 h-4 w-4' />
                </Collapsible.Indicator>
              </div>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <RichText
                html={approach.content}
                className='p-3 text-neutral-700 text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-1.5 [&_li]:mb-0.5 [&_p]:mb-0 border-t border-neutral-300'
              />
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
      </div>

      <div className='mb-10'>
        <p className='text-neutral-900 text-xl mb-4 font-bold'>
          {t('scoping.step4.fields.notes.label')}{' '}
          <span className='text-neutral-700 text-sm font-normal ml-1'>
            {t('common.optional')}
          </span>
        </p>
        <ChakraRichTextEditor
          value={engagementStrategy}
          onChange={(value) => setEngagementStrategy(value)}
        />
      </div>

      <div className='flex items-center gap-5 mt-10'>
        <Button
          onClick={() => onSubmit('advance')}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {t('scoping.common.buttons.saveAndContinue')}
        </Button>
        <Button
          variant='borderless'
          onClick={() => onSubmit('advance')}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {t('scoping.common.buttons.skip')}
        </Button>
      </div>
    </div>
  )
}

export default DefineEngagement
