'use client'

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  InterviewIcon,
  PeopleIcon,
  SendIcon,
} from '@/components/icons'
import { Button, TextInput } from '@worldresources/wri-design-systems'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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

const GatherMaterials = () => {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [materials, setMaterials] = useState('')
  const t = useTranslations()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('isEditMode')
  const isEditing = isEditMode === 'true'
  const { registerSubmitHandler } = usePreparationSubmit()

  const assessmentId = params.id as string
  const activeStep =
    (params.step as string) || PREPARATION_STEPS.GATHER_MATERIALS

  const getAssessmentData = async () => {
    setIsLoading(true)

    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const jsonResult = await result.json()

    if (jsonResult.success && jsonResult.data.materials) {
      setMaterials(jsonResult.data.materials)
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
        materials,
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
          action === 'exit' || isEditing
            ? `/assessment/${assessmentId}`
            : `/assessment/${assessmentId}?isFromPreparation=true`

        router.push(destination)
      }

      setIsSubmitting(false)
    },
    [activeStep, assessmentId, isEditing, materials, router],
  )

  useEffect(() => {
    registerSubmitHandler(onSubmit)

    return () => registerSubmitHandler(null)
  }, [onSubmit, registerSubmitHandler])

  if (isLoading) {
    return <Loader />
  }

  const suggestedDocuments = [
    {
      title: t('scoping.step5.accordions.policy.title'),
      icon: <PeopleIcon className='w-4 h-4 text-secondary-500' />,
      content: t('scoping.step5.accordions.policy.content'),
    },
    {
      title: t('scoping.step5.accordions.implementation.title'),
      icon: <InterviewIcon className='w-4 h-4 text-secondary-500' />,
      content: t('scoping.step5.accordions.implementation.content'),
    },
    {
      title: t('scoping.step5.accordions.biophysical.title'),
      icon: <SendIcon className='w-4 h-4 text-secondary-500' />,
      content: t('scoping.step5.accordions.biophysical.content'),
    },
    {
      title: t('scoping.step5.accordions.monitoring.title'),
      icon: <SendIcon className='w-4 h-4 text-secondary-500' />,
      content: t('scoping.step5.accordions.monitoring.content'),
    },
  ]

  return (
    <>
      <div className='pb-28'>
        <Button
          variant='borderless'
          className='text-neutral-700 mb-4'
          leftIcon={<ChevronLeftIcon className='w-3 h-3' />}
          onClick={() =>
            router.push(
              `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.DEFINE_ENGAGEMENT}${isEditing ? '?isEditMode=true' : ''}`,
            )
          }
        >
          <span className='underline underline-offset-1'>
            {t('scoping.common.buttons.previous')}
          </span>
        </Button>

        <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
          {t('scoping.step5.heading')}
        </h1>
        <p className='text-neutral-800 mb-8'>
          {t('scoping.step5.description')}
        </p>

        <div className='mb-10'>
          <p className='text-neutral-900 text-xl mb-4 font-bold'>
            {t('scoping.step5.suggestedDocumentationHeading')}
          </p>

          {suggestedDocuments.map((document, idx) => (
            <Collapsible.Root
              key={document.title}
              className='mt-5 border border-neutral-300 rounded-lg bg-white'
              defaultOpen={idx === 0}
            >
              <Collapsible.Trigger asChild>
                <div className='px-4 py-3 flex items-start justify-between gap-3 cursor-pointer'>
                  <div className='font-bold text-neutral-800 flex items-center gap-2'>
                    {document.icon}
                    {document.title}
                  </div>
                  <Collapsible.Indicator
                    _open={{ transform: 'rotate(180deg)' }}
                  >
                    <ChevronDownIcon className='text-neutral-800 h-4 w-4' />
                  </Collapsible.Indicator>
                </div>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <RichText
                  html={document.content}
                  className='p-3 text-neutral-700 text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-1.5 [&_li]:mb-0.5 [&_p]:mb-0 border-t border-neutral-300'
                />
              </Collapsible.Content>
            </Collapsible.Root>
          ))}
        </div>

        <div className='w-96 mb-8'>
          <TextInput
            label={t('scoping.step5.fields.sharedFolder.label')}
            caption={t('scoping.step5.fields.sharedFolder.caption')}
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            labels={{
              optionalSuffix: t('common.optional'),
              requiredSymbolLabel: t('common.required'),
            }}
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
    </>
  )
}

export default GatherMaterials
