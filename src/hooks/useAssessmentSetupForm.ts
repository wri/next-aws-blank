import { useForm, UseFormReturn } from 'react-hook-form'
import { AssessmentSetupFormData, TargetGeographyType } from '@/types/assessment-setup.types'
import { validateEmailFormat } from '@/utils/validation'
import type { createTranslator } from '@/i18n/utils'

const defaultFormValues: AssessmentSetupFormData = {
  title: '',
  jobTitle: '',
  fullName: '',
  email: '',
  organization: '',
  role: '',
  gender: '',
  ageRange: '',
  identity: '',
  country: '',
  subRegion: '',
  geographyType: '' as TargetGeographyType,
  scope: '',
  gisUrl: '',
  ecosystems: [],
  terms: false,
  allowDataSharing: false,
}

/**
 * Custom hook for managing assessment setup form state and validation
 * Uses React Hook Form with validation rules
 */
export function useAssessmentSetupForm(): UseFormReturn<AssessmentSetupFormData> {
  const formMethods = useForm<AssessmentSetupFormData>({
    defaultValues: defaultFormValues,
    mode: 'onBlur', // Validate on blur
    reValidateMode: 'onChange', // Re-validate on change after first validation
  })

  return formMethods
}

type TranslationFunction = ReturnType<typeof createTranslator>

/**
 * Validation rules for each field in the assessment setup form
 * Compatible with React Hook Form's register function
 */
export const getAssessmentFormRules = (t: TranslationFunction) =>
  ({
    title: {
      required: t('forms.setup.validation.titleRequired'),
    },
    jobTitle: {},
    fullName: {
      required: t('forms.setup.validation.fullNameRequired'),
      minLength: {
        value: 2,
        message: t('forms.setup.validation.fullNameMinLength'),
      },
    },
    email: {
      required: t('forms.setup.validation.emailRequired'),
      validate: (val: string) =>
        validateEmailFormat(val) || t('forms.setup.validation.emailInvalid'),
    },
    organization: {},
    role: {},
    country: {},
    gender: {},
    ageRange: {},
    identity: {},
    subRegion: {
      required: t('forms.setup.validation.subRegionRequired'),
    },
    geographyType: {
      required: t('scoping.validation.targetScale.required'),
    },
    scope: {
      required: t('forms.setup.validation.scopeRequired'),
    },
    ecosystems: {
      validate: (val: string[]) =>
        val.length > 0 || t('scoping.validation.ecosystems.required'),
    },
    terms: {
      validate: (val: boolean) =>
        val || t('forms.setup.validation.termsRequired'),
    },
    allowDataSharing: {},
  }) as const
