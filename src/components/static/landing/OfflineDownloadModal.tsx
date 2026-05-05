'use client'

import { useState } from 'react'
import { Controller } from 'react-hook-form'
import {
  Modal,
  Button,
  TextInput,
  Checkbox,
  InlineMessage,
  DesignSystemLocaleProvider,
} from '@worldresources/wri-design-systems'
import { useTranslations } from '@/i18n/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  useOfflineDownloadForm,
  getOfflineDownloadFormRules,
} from '@/hooks/useOfflineDownloadForm'
import type { OfflineDownloadFormData } from '@/types/offline-download.types'

interface OfflineDownloadModalProps {
  open: boolean
  onClose: () => void
}

export const OfflineDownloadModal = ({
  open,
  onClose,
}: OfflineDownloadModalProps) => {
  const t = useTranslations()
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useOfflineDownloadForm()

  const rules = getOfflineDownloadFormRules(t)

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onClose()
  }

  const onSubmit = async (data: OfflineDownloadFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/assessments/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, language }),
      })

      if (response.ok) {
        const files = {
          en: 'Restoration_Diagnostic_v2 Abr062026.xlsx',
          es: 'Restoration_Diagnostic_v2_ESP Abr062026.xlsx',
          fr: 'Restoration_Diagnostic_v2_FRA Abr082026.xlsx',
          pt: 'Restoration_Diagnostic_v2_PORT Abr062026.xlsx',
        }
        const fileName = files[language as keyof typeof files] || files.en
        const link = document.createElement('a')
        link.href = `/offline-version/${encodeURIComponent(fileName)}`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        reset()
        onClose()
      } else {
        let message = t('home.cta.offlineModal.errors.defaultError')
        try {
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const result = await response.json()
            if (result && typeof result.message === 'string' && result.message.trim()) {
              message = result.message
            }
          } else {
            const text = await response.text()
            if (text && text.trim()) {
              message = text
            }
          }
        } catch {
          // Ignore parsing errors and fall back to the default message
        }
        setSubmitError(message)
      }
    } catch {
      setSubmitError(t('home.cta.offlineModal.errors.unableToConnect'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
     <DesignSystemLocaleProvider labels={{
      TextInput: {
        optionalSuffix: t('common.optional'),
        requiredSymbolLabel: t('common.required'),
      }
    }}>
    <Modal
      open={open}
      onClose={handleClose}
      size="medium"
      header={
        <p className="font-bold text-lg text-neutral-900">
          {t('home.cta.offlineModal.title')}
        </p>
      }
      content={
        <form
          id="offline-download-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <p className="text-neutral-700 text-sm leading-relaxed">
            {t('home.cta.offlineModal.description')}
          </p>

          <TextInput
            label={t('home.cta.offlineModal.labels.name')}
            placeholder={t('home.cta.offlineModal.placeholders.name')}
            required
            {...register('name', rules.name)}
            errorMessage={errors.name?.message}
          />

          <TextInput
            label={t('home.cta.offlineModal.labels.email')}
            placeholder={t('home.cta.offlineModal.placeholders.email')}
            type="email"
            required
            {...register('email', rules.email)}
            errorMessage={errors.email?.message}
          />

          <TextInput
            label={`${t('home.cta.offlineModal.labels.organization')}`}
            placeholder={t('home.cta.offlineModal.placeholders.organization')}
            {...register('organization')}
          />

          <TextInput
            label={`${t('home.cta.offlineModal.labels.jobRole')}`}
            placeholder={t('home.cta.offlineModal.placeholders.jobRole')}
            {...register('jobRole')}
          />

          <TextInput
            label={t('home.cta.offlineModal.labels.targetGeography')}
            placeholder={t('home.cta.offlineModal.placeholders.targetGeography')}
            required
            {...register('targetGeography', rules.targetGeography)}
            errorMessage={errors.targetGeography?.message}
          />

          <Controller
            name="contactAgreement"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={({ checked }) =>
                  field.onChange(Boolean(checked))
                }
              >
                <span className="text-neutral-800 text-sm">
                  {t('home.cta.offlineModal.labels.contactAgreement')}
                </span>
              </Checkbox>
            )}
          />

          {hasErrors && !submitError && (
            <InlineMessage
              variant="error"
              label={t('forms.common.requiredNote')}
              size="full-width"
            />
          )}

          {submitError && (
            <InlineMessage
              variant="error"
              label={submitError}
              size="full-width"
            />
          )}
        </form>
      }
      footer={
        <Button
          type="submit"
          form="offline-download-form"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {t('home.cta.offlineModal.buttons.download')}
        </Button>
      }
    />
    </DesignSystemLocaleProvider>
  )
}
