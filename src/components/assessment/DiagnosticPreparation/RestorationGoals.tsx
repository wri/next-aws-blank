'use client'

import { ChevronLeftIcon } from '@/components/icons'
import { Button } from '@worldresources/wri-design-systems'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ChakraRichTextEditor } from '../ChakraRichTextEditor'
import { useCallback, useEffect, useState } from 'react'
import Loader from '@/components/ui/Loader'
import { PREPARATION_STEPS } from '@/constants'
import {
  usePreparationSubmit,
  type PreparationSubmitAction,
} from './PreparationSubmitContext'

const RestorationGoals = () => {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [restorationGoals, setRestorationGoals] = useState('')
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('isEditMode')
  const isEditing = isEditMode === 'true'
  const { registerSubmitHandler } = usePreparationSubmit()

  const assessmentId = params.id as string
  const activeStep =
    (params.step as string) || PREPARATION_STEPS.RESTORATION_GOALS

  const getAssessmentData = async () => {
    setIsLoading(true)

    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const jsonResult = await result.json()

    if (jsonResult.success && jsonResult.data.restorationGoals) {
      setRestorationGoals(jsonResult.data.restorationGoals)
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
        restorationGoals,
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
            : `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.DEFINE_ENGAGEMENT}${isEditing ? '?isEditMode=true' : ''}`

        router.push(destination)
      }

      setIsSubmitting(false)
    },
    [activeStep, assessmentId, isEditing, restorationGoals, router],
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
            `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.TIME_HORIZON}${isEditing ? '?isEditMode=true' : ''}`,
          )
        }
      >
        <span className='underline underline-offset-1'>Previous</span>
      </Button>

      <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
        Restoration goals
      </h1>
      <p className='text-neutral-800 mb-2'>
        Restoration goals describe the intended outcomes for the landscape.
        These may focus on a single ecosystem type or on a mix of ecosystems.
      </p>
      <p className='text-neutral-800 mb-8'>
        Goals commonly relate to biodiversity conservation, climate mitigation
        or adaptation, livelihood improvement, water security, or food
        production.
      </p>

      <div className='mb-10'>
        <p className='text-neutral-900 text-xl mb-4 font-bold'>
          Describe your goals for restoration
        </p>
        <ChakraRichTextEditor
          value={restorationGoals}
          onChange={setRestorationGoals}
        />
      </div>

      <div className='flex items-center gap-5 mt-10'>
        <Button
          onClick={() => onSubmit('advance')}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Save and continue
        </Button>
        <Button
          variant='borderless'
          onClick={() => onSubmit('advance')}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Skip
        </Button>
      </div>
    </div>
  )
}

export default RestorationGoals
