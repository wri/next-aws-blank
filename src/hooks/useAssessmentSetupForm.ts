import { useForm, UseFormReturn } from 'react-hook-form';
import { AssessmentSetupFormData } from '@/types/assessment-setup.types';
import { validateEmailFormat } from '@/utils/validation';

const defaultFormValues: AssessmentSetupFormData = {
  title: '',
  fullName: '',
  email: '',
  organization: '',
  role: '',
  country: '',
  subRegion: '',
  geographyType: '',
  scope: '',
  gisLink: '',
  ecosystems: [],
};

/**
 * Custom hook for managing assessment setup form state and validation
 * Uses React Hook Form with validation rules
 */
export function useAssessmentSetupForm(): UseFormReturn<AssessmentSetupFormData> {
  const formMethods = useForm<AssessmentSetupFormData>({
    defaultValues: defaultFormValues,
    mode: 'onBlur', // Validate on blur
    reValidateMode: 'onChange', // Re-validate on change after first validation
  });

  return formMethods;
}

/**
 * Validation rules for each field in the assessment setup form
 * Compatible with React Hook Form's register function
 */
export const assessmentFormRules = {
  title: {
    required: 'Title is required',
  },
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
  organization: {
    required: 'Organisation is required',
  },
  role: {
    required: 'Role is required',
  },
  country: {
    required: 'Country is required',
  },
  subRegion: {
    required: 'Sub-region is required',
  },
  geographyType: {
    required: 'Geography type is required',
  },
  scope: {
    required: 'Scope is required',
  },
  ecosystems: {
    validate: (val: string[]) =>
      val.length > 0 || 'Select at least one ecosystem type',
  },
} as const;
