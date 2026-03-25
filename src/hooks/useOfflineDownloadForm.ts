import { useForm, UseFormReturn } from 'react-hook-form'
import type { OfflineDownloadFormData } from '@/types/offline-download.types'
import { validateEmailFormat } from '@/utils/validation'
import type { createTranslator } from '@/i18n/utils'

const defaultFormValues: OfflineDownloadFormData = {
  name: '',
  email: '',
  organization: '',
  jobRole: '',
  targetGeography: '',
  contactAgreement: false,
}

export function useOfflineDownloadForm(): UseFormReturn<OfflineDownloadFormData> {
  return useForm<OfflineDownloadFormData>({
    defaultValues: defaultFormValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
}

type TranslationFunction = ReturnType<typeof createTranslator>

export const getOfflineDownloadFormRules = (t: TranslationFunction) => ({
  name: {
    required: t('home.cta.offlineModal.validation.nameRequired'),
  },
  email: {
    required: t('home.cta.offlineModal.validation.emailRequired'),
    validate: (value: string) =>
      validateEmailFormat(value) ||
      t('home.cta.offlineModal.validation.emailInvalid'),
  },
  targetGeography: {
    required: t('home.cta.offlineModal.validation.targetGeographyRequired'),
  },
})
