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
  TextInput,
} from '@worldresources/wri-design-systems'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  freshwaterEcosystems,
  marineEcosystems,
  terrestrialEcosystems,
} from './utils'

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

  const assessmentId = params.id as string
  const activeStep = Number.isNaN(params.step) ? 1 : Number(params.step)

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

  const onSubmit = async (data: TargetGeographyFormData) => {
    setIsSubmitting(true)

    const payload = {
      ...data,
      step: activeStep,
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

      router.push(`/assessment/${assessmentId}/preparation/${activeStep + 1}`)
    }
  }

  const getErrorList = () => {
    const errorMessages: string[] = []
    Object.entries(errors).forEach(([, error]) => {
      if (error?.message) {
        errorMessages.push(`• ${error.message}`)
      }
    })

    return errorMessages
  }

  const errorsLength = Object.keys(errors).length

  if (isLoading) {
    return <Loader />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className='pb-28'>
      <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
        Target geography
      </h1>
      <p className='text-neutral-800 mb-8'>
        The target geography defines the landscape or area where the diagnostic
        will be applied. This may be a country, sub-national administrative
        area, municipality, watershed, biome, or ecological region.
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
          rules={assessmentFormRules.country}
          render={({ field }) => (
            <Select
              label='Country'
              placeholder='Please select'
              defaultValue={[assessmentData.countries ?? '']}
              items={COUNTRIES.map((country) => ({
                value: country,
                label: country,
              }))}
              required
              onChange={(values) => field.onChange(values[0] || '')}
              errorMessage={errors.country?.message}
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
      <p className='text-neutral-900 mb-3'>
        <span className='text-error-500'>*</span> Select all ecosystems being
        restored
      </p>
      <Controller
        name='ecosystems'
        control={control}
        rules={assessmentFormRules.ecosystems}
        render={({ field }) => (
          <div className='flex flex-col gap-4 w-80'>
            <CheckboxList
              checkboxes={terrestrialEcosystems}
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
              checkboxes={freshwaterEcosystems}
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
              checkboxes={marineEcosystems}
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
            caption={
              <div>
                {getErrorList().map((error, index) => (
                  <p key={index}>{error}</p>
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
        Save and continue
      </Button>
    </form>
  )
}

export default TargetGeography
