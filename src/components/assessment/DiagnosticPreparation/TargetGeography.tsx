'use client'

import Loader from '@/components/ui/Loader'
import { COUNTRIES, TARGET_GEOGRAPHY_TYPE_OPTIONS } from '@/constants'
import { assessmentFormRules } from '@/hooks/useAssessmentSetupForm'
import type { AssessmentSetupFormData } from '@/types/assessment-setup.types'
import { TargetGeographyType } from '@/types/assessment-setup.types'
import {
  Button,
  CheckboxList,
  InlineMessage,
  Select,
  Tag,
  TextInput,
} from '@worldresources/wri-design-systems'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  freshwaterEcosystems,
  marineEcosystems,
  terrestrialEcosystems,
} from './utils'
import { PREPARATION_STEPS } from '@/constants'
import Link from 'next/link'
import {
  usePreparationSubmit,
  type PreparationSubmitAction,
} from './PreparationSubmitContext'

type AssessmentData = {
  geographyType: TargetGeographyType
  country: string
  countries: string
  subRegion: string
  gisUrl: string
  ecosystems?: string
}

type TargetGeographyFormData = Pick<
  AssessmentSetupFormData,
  | 'geographyType'
  | 'country'
  | 'countries'
  | 'subRegion'
  | 'gisUrl'
  | 'ecosystems'
>

const mergeEcosystemSelection = (
  currentSelection: string[],
  checkedByGroup: Record<string, boolean>,
  groupValues: string[],
) => {
  const withoutCurrentGroup = currentSelection.filter(
    (value) => !groupValues.includes(value),
  )
  const selectedInCurrentGroup = groupValues.filter(
    (value) => checkedByGroup[value],
  )

  return [...withoutCurrentGroup, ...selectedInCurrentGroup]
}

const TargetGeography = () => {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    geographyType: '' as TargetGeographyType,
    country: '',
    countries: '',
    subRegion: '',
    gisUrl: '',
    ecosystems: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('isEditMode')
  const isEditing = isEditMode === 'true'
  const { registerSubmitHandler } = usePreparationSubmit()

  const assessmentId = params.id as string
  const activeStep =
    (params.step as string) || PREPARATION_STEPS.TARGET_GEOGRAPHY

  const getAssessmentData = async () => {
    setIsLoading(true)

    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const jsonResult = await result.json()

    if (jsonResult.success) {
      setAssessmentData(jsonResult.data)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getAssessmentData()
  }, [])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TargetGeographyFormData>({
    defaultValues: {
      geographyType: assessmentData.geographyType,
      country: assessmentData.countries,
      subRegion: assessmentData.subRegion,
      gisUrl: assessmentData.gisUrl,
      ecosystems: assessmentData.ecosystems
        ? JSON.parse(assessmentData.ecosystems)
        : [],
    },
    values: {
      geographyType: assessmentData.geographyType,
      country: assessmentData.countries ?? '',
      subRegion: assessmentData.subRegion,
      gisUrl: assessmentData.gisUrl,
      ecosystems: assessmentData.ecosystems
        ? JSON.parse(assessmentData.ecosystems)
        : [],
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const formValues = watch()
  const selectedEcosystems = formValues.ecosystems || []
  const allEcosystemOptions = [
    ...terrestrialEcosystems,
    ...freshwaterEcosystems,
    ...marineEcosystems,
  ]

  const onSubmit = useCallback(
    async (
      data: TargetGeographyFormData,
      action: PreparationSubmitAction = 'advance',
    ) => {
      setIsSubmitting(true)

      const payload = {
        ...data,
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

      setIsSubmitting(false)

      if (result.success) {
        setAssessmentData(result.data)

        const destination =
          action === 'exit'
            ? `/assessment/${assessmentId}`
            : `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.TIME_HORIZON}${isEditing ? '?isEditMode=true' : ''}`

        router.push(destination)
      }
    },
    [activeStep, assessmentId, isEditing, router],
  )

  useEffect(() => {
    registerSubmitHandler((action = 'advance') =>
      handleSubmit((data) => onSubmit(data, action))(),
    )

    return () => registerSubmitHandler(null)
  }, [handleSubmit, onSubmit, registerSubmitHandler])

  const getErrorList = () => {
    const errorMessages: string[] = []
    Object.entries(errors).forEach(([key, error]) => {
      if (key === 'ecosystems' && error?.message) {
        errorMessages.push('• Capture ecosystem types is mandatory')
      }
      if (key === 'geographyType' && error?.message) {
        errorMessages.push('• Target scale is mandatory')
      }
    })

    return errorMessages
  }

  const errorsLength = Object.keys(errors).length

  if (isLoading) {
    return <Loader />
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, 'advance'))}
      noValidate
      className='pb-28'
    >
      <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
        Target geography
      </h1>
      <p className='text-neutral-800 mb-8'>
        The target geography defines the area or scale where the diagnostic will be applied. This may be a country, sub-national administrative area, municipality, watershed, biome, or ecological region.
      </p>
      <p className='text-neutral-900 text-xl mb-3 font-bold'>
        Define the geographic area
      </p>
      <div className='w-96 mb-10'>
        {/* replaces Geography type */}
        <Controller
          name='geographyType'
          control={control}
          rules={assessmentFormRules.geographyType}
          render={({ field }) => (
            <Select
              label='Target scale'
              placeholder='Please select'
              defaultValue={[assessmentData.geographyType]}
              items={[
                {
                  value: TargetGeographyType.NATIONAL,
                  label:
                    TARGET_GEOGRAPHY_TYPE_OPTIONS[TargetGeographyType.NATIONAL],
                },
                {
                  value: TargetGeographyType.SUBNATIONAL,
                  label:
                    TARGET_GEOGRAPHY_TYPE_OPTIONS[
                      TargetGeographyType.SUBNATIONAL
                    ],
                },
                {
                  value: TargetGeographyType.LANDSCAPE,
                  label:
                    TARGET_GEOGRAPHY_TYPE_OPTIONS[
                      TargetGeographyType.LANDSCAPE
                    ],
                },
                {
                  value: TargetGeographyType.RESTORATION_SITE,
                  label:
                    TARGET_GEOGRAPHY_TYPE_OPTIONS[
                      TargetGeographyType.RESTORATION_SITE
                    ],
                },
                {
                  value: TargetGeographyType.TRANSBOUNDARY,
                  label:
                    TARGET_GEOGRAPHY_TYPE_OPTIONS[
                      TargetGeographyType.TRANSBOUNDARY
                    ],
                },
              ]}
              onChange={(values) => field.onChange(values[0] || '')}
              errorMessage={errors.geographyType?.message}
              required
            />
          )}
        />
        <Controller
          name='country'
          control={control}
          render={({ field }) => (
            <Select
              label='Country'
              placeholder='Please select'
              defaultValue={[assessmentData.countries ?? '']}
              items={COUNTRIES.map((country) => ({
                value: country,
                label: country,
              }))}
              onChange={(values) => field.onChange(values[0] || '')}
            />
          )}
        />
        <TextInput
          label='Sub-region / Province'
          {...register('subRegion')}
          defaultValue={assessmentData.subRegion}
        />
        <TextInput
          label='Restoration boundary link'
          caption='Add a link to a GIS dataset or boundary file'
          {...register('gisUrl')}
          defaultValue={assessmentData.gisUrl}
        />
      </div>
      <p className='text-neutral-900 text-xl mb-1.5 font-bold'>
        Capture ecosystem types
      </p>
      <p className='text-neutral-900 mb-0.5'>
        <span className='text-error-500'>*</span> Select all ecosystems being
        restored
      </p>
      <p className='text-neutral-700 text-sm mb-3'>
        <span>
          Ecosystems types based on the{' '}
          <Link
            href='https://portals.iucn.org/library/sites/library/files/documents/2020-037-En.pdf'
            target='_blank'
            rel='noopener noreferrer'
            className='underline decoration-dotted'
          >
            IUCN Global Ecosystem Typology 2.0
          </Link>
          ,{' '}
          <Link
            href='https://global-ecosystems.org/'
            target='_blank'
            rel='noopener noreferrer'
            className='underline decoration-dotted'
          >
            Global Ecosystem
          </Link>
          .
        </span>
      </p>

      <div className='mb-4 flex gap-2 items-center flex-wrap'>
        {selectedEcosystems.map((item) => (
          <Tag
            key={item}
            label={
              allEcosystemOptions.find((option) => option.value === item)
                ?.children ?? item
            }
            variant='info-grey'
            onClose={() => {
              setValue(
                'ecosystems',
                selectedEcosystems.filter((value) => value !== item),
                {
                  shouldDirty: true,
                  shouldValidate: true,
                },
              )
            }}
            closable
          />
        ))}
      </div>

      <Controller
        name='ecosystems'
        control={control}
        rules={assessmentFormRules.ecosystems}
        render={({ field }) => (
          <div className='flex flex-col gap-4 w-80'>
            <CheckboxList
              checkboxes={terrestrialEcosystems.map((option) => ({
                ...option,
                checked: selectedEcosystems.includes(option.value),
              }))}
              label={{
                label: 'Terrestrial',
                name: 'all',
                type: 'checkbox',
              }}
              defaultValues={
                assessmentData.ecosystems
                  ? JSON.parse(assessmentData.ecosystems)
                  : []
              }
              onCheckedChange={(checkedByGroup) => {
                field.onChange(
                  mergeEcosystemSelection(
                    field.value || [],
                    checkedByGroup,
                    terrestrialEcosystems?.map((option) => option.value),
                  ),
                )
              }}
              errorMessage={errors.ecosystems?.message}
              required
            />
            <CheckboxList
              checkboxes={freshwaterEcosystems.map((option) => ({
                ...option,
                checked: selectedEcosystems.includes(option.value),
              }))}
              label={{
                label: 'Freshwater',
                name: 'all',
                type: 'checkbox',
              }}
              defaultValues={
                assessmentData.ecosystems
                  ? JSON.parse(assessmentData.ecosystems)
                  : []
              }
              onCheckedChange={(checkedByGroup) => {
                field.onChange(
                  mergeEcosystemSelection(
                    field.value || [],
                    checkedByGroup,
                    freshwaterEcosystems?.map((option) => option.value),
                  ),
                )
              }}
              errorMessage={errors.ecosystems?.message}
              required
            />
            <CheckboxList
              checkboxes={marineEcosystems.map((option) => ({
                ...option,
                checked: selectedEcosystems.includes(option.value),
              }))}
              label={{
                label: 'Marine',
                name: 'all',
                type: 'checkbox',
              }}
              defaultValues={
                assessmentData.ecosystems
                  ? JSON.parse(assessmentData.ecosystems)
                  : []
              }
              onCheckedChange={(checkedByGroup) => {
                field.onChange(
                  mergeEcosystemSelection(
                    field.value || [],
                    checkedByGroup,
                    marineEcosystems?.map((option) => option.value),
                  ),
                )
              }}
              errorMessage={errors.ecosystems?.message}
              required
            />
          </div>
        )}
      />
      {errorsLength > 0 ? (
        <div className='mt-10'>
          <InlineMessage
            variant='error'
            label={`${errorsLength > 1 ? 'There are' : 'There is'} ${errorsLength} error${errorsLength > 1 ? 's' : ''} in the form`}
            caption={getErrorList().join(' ')}
            size='full-width'
          />
        </div>
      ) : null}
      <Button
        className='mt-10'
        type='submit'
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        Save and continue
      </Button>
    </form>
  )
}

export default TargetGeography
