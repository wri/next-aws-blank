import { useForm, UseFormReturn } from 'react-hook-form'
import { AssessmentSetupFormData, TargetGeographyType } from '@/types/assessment-setup.types'
import { validateEmailFormat } from '@/utils/validation'

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

/**
 * Validation rules for each field in the assessment setup form
 * Compatible with React Hook Form's register function
 */
export const assessmentFormRules = {
  title: {
    required: 'Title is required',
  },
  jobTitle: {},
  fullName: {
    required: 'Full name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
  },
  email: {
    required: 'Email address is required',
    validate: (val: string) =>
      validateEmailFormat(val) || 'Please provide a valid email address',
  },
  organization: {},
  role: {},
  country: {},
  gender: {},
  ageRange: {},
  identity: {},
  subRegion: {
    required: 'Sub-region is required',
  },
  geographyType: {
    required: 'Please add target scale',
  },
  scope: {
    required: 'Scope is required',
  },
  ecosystems: {
    validate: (val: string[]) =>
      val.length > 0 || 'Select at least one (1) ecosystem type',
  },
  terms: {
    validate: (val: boolean) =>
      val || 'You must agree to the terms and conditions',
  },
  allowDataSharing: {},
} as const
