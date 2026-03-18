'use client'

import { ChevronLeftIcon } from '@/components/icons'
import Loader from '@/components/ui/Loader'
import { Button, TextInput } from '@worldresources/wri-design-systems'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { PREPARATION_STEPS } from '@/constants'
import {
  usePreparationSubmit,
  type PreparationSubmitAction,
} from './PreparationSubmitContext'
import { useTranslations } from '@/i18n/useTranslations'

const TimeHorizon = () => {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeHorizon, setTimeHorizon] = useState('')
  const t = useTranslations()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('isEditMode')
  const isEditing = isEditMode === 'true'
  const { registerSubmitHandler } = usePreparationSubmit()

  const assessmentId = params.id as string
  const activeStep = (params.step as string) || PREPARATION_STEPS.TIME_HORIZON

  const getAssessmentData = async () => {
    setIsLoading(true)

    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const jsonResult = await result.json()

    if (jsonResult.success && jsonResult.data.timeHorizon) {
      setTimeHorizon(jsonResult.data.timeHorizon)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getAssessmentData()
  }, [])

  const onSubmit = useCallback(
    async (action: PreparationSubmitAction = 'advance') => {
      setIsSubmitting(true)

      const payload = {
        timeHorizon,
        step: activeStep,
        isEditing,
      }

      const response = await fetch(
        `/api/assessments/${assessmentId}/preparation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      const result = await response.json()

      if (result.success) {
        const destination =
          action === 'exit'
            ? `/assessment/${assessmentId}`
            : `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.RESTORATION_GOALS}${isEditing ? '?isEditMode=true' : ''}`

        router.push(destination)
      }

      setIsSubmitting(false)
    },
    [activeStep, assessmentId, isEditing, router, timeHorizon],
  )

  useEffect(() => {
    registerSubmitHandler(onSubmit)

    return () => registerSubmitHandler(null)
  }, [onSubmit, registerSubmitHandler])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className='pb-28'>
      <Button
        variant='borderless'
        className='text-neutral-700 mb-4'
        leftIcon={<ChevronLeftIcon className='w-3 h-3' />}
        onClick={() =>
          router.push(
            `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.TARGET_GEOGRAPHY}${isEditing ? '?isEditMode=true' : ''}`,
          )
        }
        >
        <span className='underline underline-offset-1'>
          {t('scoping.common.buttons.previous')}
        </span>
      </Button>

      <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
        {t('scoping.step2.heading')}
      </h1>
      <p className='text-neutral-800 mb-8'>
        {t('scoping.step2.description')}
      </p>

      <div className='mb-10'>
        <TextInput
          label={t('scoping.step2.fields.restorationPeriod.label')}
          style={{ width: '120px' }}
          type='number'
          min={1}
          value={timeHorizon}
          onChange={(e) => setTimeHorizon(e.target.value)}
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

export default TimeHorizon
