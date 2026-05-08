'use client'

import Loader from '@/components/ui/Loader'
import { COUNTRIES } from '@/constants'
import { getAssessmentFormRules } from '@/hooks/useAssessmentSetupForm'
import type { AssessmentSetupFormData } from '@/types/assessment-setup.types'
import { TargetGeographyType } from '@/types/assessment-setup.types'
import {
  Button,
  Checkbox,
  CheckboxList,
  DesignSystemLocaleProvider,
  InlineMessage,
  Select,
  Tag,
  TextInput,
} from '@worldresources/wri-design-systems'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  getFreshwaterEcosystems,
  getMarineEcosystems,
  getOtherEcosystems,
  getTerrestrialEcosystems,
} from './utils'
import { PREPARATION_STEPS } from '@/constants'
import Link from 'next/link'
import {
  usePreparationSubmit,
  type PreparationSubmitAction,
} from './PreparationSubmitContext'
import { useTranslations } from '@/i18n/useTranslations'

type AssessmentData = {
  geographyType: TargetGeographyType
  countries: string
  subRegion: string
  gisUrl: string
  ecosystems?: string
}

type TargetGeographyFormData = Pick<
  AssessmentSetupFormData,
  'geographyType' | 'countries' | 'subRegion' | 'gisUrl' | 'ecosystems'
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
    countries: '',
    subRegion: '',
    gisUrl: '',
    ecosystems: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations()
  const assessmentFormRules = getAssessmentFormRules(t)
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('isEditMode')
  const isEditing = isEditMode === 'true'
  const { registerSubmitHandler } = usePreparationSubmit()

  const assessmentId = params.id as string
  const activeStep =
    (params.step as string) || PREPARATION_STEPS.TARGET_GEOGRAPHY

  const getAssessmentData = useCallback(async () => {
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
  }, [assessmentId])

  useEffect(() => {
    getAssessmentData()
  }, [getAssessmentData])

  let countries = []
  try {
    if (assessmentData.countries) {
      countries = JSON.parse(assessmentData.countries)
    }
  } catch {
    if (
      assessmentData.countries &&
      typeof assessmentData.countries === 'string'
    ) {
      countries = [assessmentData.countries]
    }
  }

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
      countries,
      subRegion: assessmentData.subRegion,
      gisUrl: assessmentData.gisUrl,
      ecosystems: assessmentData.ecosystems
        ? JSON.parse(assessmentData.ecosystems)
        : [],
    },
    values: {
      geographyType: assessmentData.geographyType,
      countries,
      subRegion: assessmentData.subRegion,
      gisUrl: assessmentData.gisUrl,
      ecosystems: assessmentData.ecosystems
        ? JSON.parse(assessmentData.ecosystems)
        : [],
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const formValues = watch()
  const selectedEcosystems = formValues.ecosystems || []
  const terrestrialEcosystems = getTerrestrialEcosystems(t)
  const freshwaterEcosystems = getFreshwaterEcosystems(t)
  const marineEcosystems = getMarineEcosystems(t)
  const otherEcosystems = getOtherEcosystems(t)
  const allEcosystemOptions = [
    ...terrestrialEcosystems,
    ...freshwaterEcosystems,
    ...marineEcosystems,
    ...otherEcosystems,
  ]
  const geographyTypeOptions = [
    {
      value: TargetGeographyType.NATIONAL,
      label: t('scoping.step1.fields.targetScale.options.national'),
    },
    {
      value: TargetGeographyType.SUBNATIONAL,
      label: t('scoping.step1.fields.targetScale.options.subnational'),
    },
    {
      value: TargetGeographyType.LANDSCAPE,
      label: t('scoping.step1.fields.targetScale.options.landscape'),
    },
    {
      value: TargetGeographyType.RESTORATION_SITE,
      label: t('scoping.step1.fields.targetScale.options.site'),
    },
    {
      value: TargetGeographyType.TRANSBOUNDARY,
      label: t('scoping.step1.fields.targetScale.options.transboundary'),
    },
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
        errorMessages.push(`• ${t('scoping.validation.ecosystems.summary')}`)
      }
      if (key === 'geographyType' && error?.message) {
        errorMessages.push(`• ${t('scoping.validation.targetScale.summary')}`)
      }
    })

    return errorMessages
  }

  const errorsLength = Object.keys(errors).length

  if (isLoading) {
    return <Loader />
  }

  return (
    <DesignSystemLocaleProvider
      labels={{
        CheckboxList: {
          errorPrefix: t(
            'scoping.ecosystems.checkboxListI18nLabels.errorPrefix',
          ),
          expandLabel: t(
            'scoping.ecosystems.checkboxListI18nLabels.expandLabel',
          ),
          hideLabel: t('scoping.ecosystems.checkboxListI18nLabels.hideLabel'),
          optionalLabel: t(
            'scoping.ecosystems.checkboxListI18nLabels.optionalLabel',
          ),
          requiredLabel: t(
            'scoping.ecosystems.checkboxListI18nLabels.requiredLabel',
          ),
          requiredSymbolLabel: t(
            'scoping.ecosystems.checkboxListI18nLabels.requiredSymbolLabel',
          ),
        },
        TextInput: {
          optionalSuffix: t('common.optional'),
          requiredSymbolLabel: t('common.required'),
        },
      }}
    >
      <form
        onSubmit={handleSubmit((data) => onSubmit(data, 'advance'))}
        noValidate
        className='pb-28'
      >
        <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
          {t('scoping.step1.heading')}
        </h1>
        <p className='text-neutral-800 mb-8'>
          {t('scoping.step1.description')}
        </p>
        <p className='text-neutral-900 text-xl mb-3 font-bold'>
          {t('scoping.step1.defineGeographicArea')}
        </p>
        <div className='w-96 mb-10'>
          {/* replaces Geography type */}
          <Controller
            name='geographyType'
            control={control}
            rules={assessmentFormRules.geographyType}
            render={({ field }) => (
              <Select
                label={t('scoping.step1.fields.targetScale.label')}
                placeholder={t('scoping.step1.fields.targetScale.placeholder')}
                defaultValue={[assessmentData.geographyType]}
                items={geographyTypeOptions}
                onChange={(values) => field.onChange(values[0] || '')}
                errorMessage={errors.geographyType?.message}
                required
              />
            )}
          />
          <Controller
            name='countries'
            control={control}
            render={({ field }) => (
              <Select
                label={t('scoping.step1.fields.country.label')}
                placeholder={t('scoping.step1.fields.country.placeholder')}
                defaultValue={countries}
                items={COUNTRIES.map((country) => ({
                  value: country,
                  label: country,
                }))}
                onChange={(values) => field.onChange(values)}
                multiple
              />
            )}
          />
          <TextInput
            label={t('scoping.step1.fields.subRegion.label')}
            {...register('subRegion')}
            defaultValue={assessmentData.subRegion}
          />
        </div>
        <p className='text-neutral-900 text-xl mb-1.5 font-bold'>
          {t('scoping.step1.fields.ecosystems.label')}
        </p>
        <p className='text-neutral-900 mb-0.5'>
          <span className='text-error-500'>*</span>{' '}
          {t('scoping.step1.fields.ecosystems.requiredLabel')}
        </p>
        <p className='text-neutral-700 text-sm mb-3'>
          <span>
            {t('scoping.step1.fields.ecosystems.sourcePrefix')}{' '}
            <Link
              href='https://portals.iucn.org/library/sites/library/files/documents/2020-037-En.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='underline decoration-dotted'
            >
              {t('scoping.step1.fields.ecosystems.sourceLink1Label')}
            </Link>
            ,{' '}
            <Link
              href='https://global-ecosystems.org/'
              target='_blank'
              rel='noopener noreferrer'
              className='underline decoration-dotted'
            >
              {t('scoping.step1.fields.ecosystems.sourceLink2Label')}
            </Link>
            {t('scoping.step1.fields.ecosystems.sourceSuffix')}
          </span>
        </p>

        <div className='my-2'>
          <InlineMessage
            label={t('scoping.step1.fields.ecosystems.inlineMessage')}
            variant='info-grey'
            size='full-width'
          />
        </div>

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
                  label: t('scoping.ecosystems.terrestrial.label'),
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
                  label: t('scoping.ecosystems.freshwater.label'),
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
                  label: t('scoping.ecosystems.marine.label'),
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
              <Checkbox
                name='other'
                checked={selectedEcosystems.includes('other')}
                onCheckedChange={({ checked }) => {
                  field.onChange(
                    mergeEcosystemSelection(
                      field.value || [],
                      { other: !!checked },
                      ['other'],
                    ),
                  )
                }}
              >
                {t('scoping.ecosystems.other.label')}
              </Checkbox>
            </div>
          )}
        />
        {errorsLength > 0 ? (
          <div className='mt-10'>
            <InlineMessage
              variant='error'
              label={t('scoping.validation.formErrors', {
                count: errorsLength,
                verb: errorsLength > 1 ? 'are' : 'is',
                plural: errorsLength > 1 ? 's' : '',
              })}
              caption={
                <div className='flex flex-col'>
                  {getErrorList().map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              }
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
          {t('scoping.common.buttons.saveAndContinue')}
        </Button>
      </form>
    </DesignSystemLocaleProvider>
  )
}

export default TargetGeography
