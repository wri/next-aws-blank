'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller } from 'react-hook-form'
import {
  Panel,
  Button,
  TextInput,
  Checkbox,
  Modal,
  InlineMessage,
  getThemedColor,
  Select,
  RadioList,
  DesignSystemLocaleProvider,
} from '@worldresources/wri-design-systems'
import { InfoIcon } from '@/components/icons'
import { AccessDetailsModal } from '@/components/assessment/AccessDetailsModal'
import {
  useAssessmentSetupForm,
  getAssessmentFormRules,
} from '@/hooks/useAssessmentSetupForm'
import type { AssessmentSetupFormData } from '@/types/assessment-setup.types'
import type { AssessmentCreatedResponse } from '@/types/api.types'
import Image from 'next/image'
import { Box, Text } from '@chakra-ui/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { externalLinks } from '@/constants/external-links'
import { useTranslations } from '@/i18n/useTranslations'

export default function SetupAssessmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { language } = useLanguage()
  const t = useTranslations()
  const [error, setError] = useState<{
    message: string
    error?: string
    stack?: string
  } | null>(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [createdAssessmentId, setCreatedAssessmentId] = useState<string | null>(
    null,
  )
  const [assessmentPassword, setAssessmentPassword] = useState<string | null>(
    null,
  )
  const [showDemographicInfoModal, setShowDemographicInfoModal] =
    useState(false)

  const isDev = process.env.NODE_ENV === 'development'
  const assessmentFormRules = getAssessmentFormRules(t)
  const genderOptions = [
    { label: t('forms.setup.genderOptions.woman'), value: 'woman' },
    { label: t('forms.setup.genderOptions.man'), value: 'man' },
    { label: t('forms.setup.genderOptions.nonBinary'), value: 'non_binary' },
    { label: t('forms.setup.genderOptions.transgender'), value: 'transgender' },
    { label: t('forms.setup.genderOptions.intersex'), value: 'intersex' },
    {
      label: t('forms.setup.genderOptions.preferNotToSay'),
      value: 'prefer_not_to_say',
    },
    {
      label: t('forms.setup.genderOptions.identityNotListed'),
      value: 'identity_not_listed',
    },
  ]
  const ageRangeOptions = [
    { label: t('forms.setup.ageRangeOptions.under25'), value: 'under_25' },
    { label: t('forms.setup.ageRangeOptions.25to34'), value: '25_34' },
    { label: t('forms.setup.ageRangeOptions.35to44'), value: '35_44' },
    { label: t('forms.setup.ageRangeOptions.45to54'), value: '45_54' },
    { label: t('forms.setup.ageRangeOptions.55to64'), value: '55_64' },
    { label: t('forms.setup.ageRangeOptions.65plus'), value: '65_plus' },
    {
      label: t('forms.setup.ageRangeOptions.preferNotToSay'),
      value: 'prefer_not_to_say',
    },
  ]
  const identityOptions = [
    {
      value: 'indigenous_peoples',
      children: t('forms.setup.identityOptions.indigenousPeoples'),
    },
    {
      value: 'local_communities',
      children: t('forms.setup.identityOptions.localCommunities'),
    },
    { value: 'both', children: t('forms.setup.identityOptions.both') },
    {
      value: 'prefer_not_to_say',
      children: t('forms.setup.identityOptions.preferNotToSay'),
    },
    { value: 'none', children: t('forms.setup.identityOptions.none') },
  ]

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    formState: { errors },
  } = useAssessmentSetupForm()

  const onSubmit = async (data: AssessmentSetupFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        language,
      }

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result: AssessmentCreatedResponse = await response.json()

      if (result.success && result.assessmentId && result.password) {
        setCreatedAssessmentId(result.assessmentId)
        setAssessmentPassword(result.password)
        setShowAccessModal(true)
      } else {
        setError({
          message: result.message || 'Failed to create assessment',
          error: result.error,
          stack: result.stack,
        })
      }
    } catch (error) {
      setError({
        message:
          'Unable to connect to the server. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Network error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueAssessment = () => {
    if (createdAssessmentId) {
      router.push(`/assessment/${createdAssessmentId}/preparation`)
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

  const hasErrors = Object.keys(errors).length > 0

  return (
    <DesignSystemLocaleProvider labels={{
      TextInput: {
        optionalSuffix: t('common.optional'),
        requiredSymbolLabel: t('common.required'),
      }
    }}>
      {error && (
        <Modal
          open={true}
          onClose={() => setError(null)}
          size='large'
          header={t('forms.setup.errors.genericError')}
          content={
            <div className='space-y-4'>
              <p className='text-gray-700 leading-relaxed'>{error.message}</p>

              {isDev && error.error && (
                <div className='space-y-2'>
                  <p className='text-sm font-bold text-gray-700'>
                    Error details:
                  </p>
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto'>
                    <code className='text-xs text-red-600 font-mono'>
                      {error.error}
                    </code>
                  </div>
                </div>
              )}

              {isDev && error.stack && (
                <div className='space-y-2'>
                  <p className='text-sm font-bold text-gray-700'>
                    Stack trace:
                  </p>
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto'>
                    <pre className='text-xs text-gray-800 font-mono whitespace-pre-wrap'>
                      {error.stack}
                    </pre>
                  </div>
                </div>
              )}

              <div className='pt-4'>
                <Button
                  label={t('common.buttons.close')}
                  variant='primary'
                  size='default'
                  onClick={() => setError(null)}
                />
              </div>
            </div>
          }
        />
      )}

      <form
        onSubmit={handleFormSubmit(onSubmit)}
        noValidate
        className='bg-gradient-to-b from-white to-primary-200'
      >
        <div className='max-w-[640px] py-16 w-full flex flex-col overflow-y-auto mx-auto'>
          <div className='border border-neutral-300 m-auto rounded-none sm:rounded-[10px] overflow-hidden mb-6 w-full'>
            <Panel
              width='full'
              content={
                <div className='p-6 sm:p-8'>
                  <h2 className='font-bold text-4xl text-neutral-800 mb-2'>
                    {t('forms.setup.page.title')}
                  </h2>

                  <p className='text-lg text-neutral-800 mb-4'>
                    {t('forms.setup.page.subtitle')}
                  </p>

                  <div className='rounded-lg overflow-hidden'>
                    <Image
                      src='/images/Diagnostic Setup.jpg'
                      alt='Assessment Setup'
                      width={640}
                      height={480}
                    />
                  </div>
                </div>
              }
            />
          </div>

          <div className='border border-neutral-300 m-auto rounded-none sm:rounded-[10px] overflow-hidden mb-6 w-full'>
            <Panel
              width='full'
              content={
                <div className='p-6 sm:p-8'>
                  <h3 className='font-bold text-4xl text-neutral-800 mb-2'>
                    {t('forms.setup.sections.getStarted')}
                  </h3>
                  <p className='text-lg text-neutral-800 mb-4'>
                    {t('forms.setup.sections.getStartedDescription')}
                  </p>

                  <hr className='my-6' />

                  <Box
                    css={{
                      '& label': {
                        fontSize: 'xl',
                        fontWeight: '600',
                        color: getThemedColor('neutral', 800),
                        marginBottom: '2',
                      },
                      '& span[data-part="helper-text"]': {
                        fontSize: 'lg',
                        color: getThemedColor('neutral', 800),
                      },
                    }}
                  >
                    <TextInput
                      label={t('forms.setup.labels.diagnosticTitle')}
                      caption={t('forms.setup.captions.diagnosticTitle')}
                      placeholder={t(
                        'forms.setup.placeholders.diagnosticTitle',
                      )}
                      required
                      {...register('title', assessmentFormRules.title)}
                      errorMessage={errors.title?.message}
                    />
                  </Box>

                  <hr className='my-6' />

                  <h4 className='font-bold text-xl text-neutral-800 mb-2'>
                    {t('forms.setup.sections.diagnosticLead')}
                  </h4>
                  <p className='text-lg text-neutral-800 mb-4'>
                    {t('forms.setup.sections.diagnosticLeadDescription')}
                  </p>

                  <InlineMessage
                    label={t(
                      'forms.setup.sections.diagnosticLeadWarning.label',
                    )}
                    caption={t(
                      'forms.setup.sections.diagnosticLeadWarning.caption',
                    )}
                    onActionClick={() => {}}
                    variant='warning'
                    size='full-width'
                  />

                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 gap-4'>
                      <TextInput
                        label={t('forms.setup.labels.fullName')}
                        placeholder={t('forms.setup.placeholders.fullName')}
                        required
                        {...register('fullName', assessmentFormRules.fullName)}
                        errorMessage={errors.fullName?.message}
                      />
                      <TextInput
                        label={t('forms.setup.labels.email')}
                        type='email'
                        placeholder={t('forms.setup.placeholders.email')}
                        required
                        {...register('email', assessmentFormRules.email)}
                        errorMessage={errors.email?.message}
                      />
                      <TextInput
                        label={t('forms.setup.labels.organization')}
                        placeholder={t('forms.setup.placeholders.organization')}
                        {...register(
                          'organization',
                          assessmentFormRules.organization,
                        )}
                        errorMessage={errors.organization?.message}
                      />
                      <TextInput
                        label={t('forms.setup.labels.role')}
                        placeholder={t('forms.setup.placeholders.role')}
                        {...register('role', assessmentFormRules.role)}
                        errorMessage={errors.role?.message}
                      />
                    </div>

                    {/* Demographic Information Section */}
                    <div className='flex flex-col gap-6 mb-6'>
                      <div className='flex flex-col gap-2'>
                        <h3 className='text-lg font-bold text-neutral-800'>
                          {t('forms.setup.sections.demographicInformation')}
                        </h3>
                        <p className='text-neutral-700'>
                          {t(
                            'forms.setup.sections.demographicInformationDescription',
                          )}
                        </p>
                        <div>
                          <Button
                            variant='secondary'
                            size='small'
                            leftIcon={<InfoIcon />}
                            style={{ borderRadius: '8px' }}
                            onClick={() => setShowDemographicInfoModal(true)}
                          >
                            {t(
                              'forms.setup.sections.demographicInfoModal.buttonLabel',
                            )}
                          </Button>
                        </div>
                      </div>

                      <Controller
                        name='gender'
                        control={control}
                        rules={assessmentFormRules.gender}
                        render={({ field }) => (
                          <Select
                            label={t('forms.setup.labels.gender')}
                            placeholder={t('forms.setup.placeholders.gender')}
                            items={genderOptions}
                            value={field.value ? [field.value] : []}
                            onChange={(value) => field.onChange(value[0] || '')}
                            errorMessage={errors.gender?.message}
                          />
                        )}
                      />

                      <Controller
                        name='ageRange'
                        control={control}
                        rules={assessmentFormRules.ageRange}
                        render={({ field }) => (
                          <Select
                            label={t('forms.setup.labels.ageRange')}
                            placeholder={t('forms.setup.placeholders.ageRange')}
                            items={ageRangeOptions}
                            value={field.value ? [field.value] : []}
                            onChange={(value) => field.onChange(value[0] || '')}
                            errorMessage={errors.ageRange?.message}
                          />
                        )}
                      />

                      <Controller
                        name='identity'
                        control={control}
                        rules={assessmentFormRules.identity}
                        render={({ field }) => (
                          <RadioList
                            label={t('forms.setup.labels.identity')}
                            name='identity'
                            radios={identityOptions}
                            defaultValue={field.value}
                            onCheckedChange={(_, selectedValue) =>
                              field.onChange(selectedValue)
                            }
                            errorMessage={errors.identity?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              }
            />
          </div>

          <div className='px-6 bg-transparent sm:p-0 mb-16'>
            <div className='flex flex-col gap-2 mb-4'>
              <Controller
                name='terms'
                control={control}
                rules={assessmentFormRules.terms}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={({ checked }) => field.onChange(checked)}
                    required
                  >
                    <p className='text-neutral-800 font-normal'>
                      <span className='text-error-500'>*</span>{' '}
                      {t('forms.setup.checkboxes.termsPrefix')}{' '}
                      <a
                        className='underline'
                        rel='noopener noreferrer'
                        href={externalLinks.tos}
                        target='_blank'
                      >
                        {t('common.footer.termsOfService')}
                      </a>{' '}
                      {t('forms.setup.checkboxes.termsMiddle')}{' '}
                      <a
                        className='underline'
                        rel='noopener noreferrer'
                        href={externalLinks.privacy}
                        target='_blank'
                      >
                        {t('common.footer.privacyPolicy')}
                      </a>{' '}
                      {t('forms.setup.checkboxes.termsSuffix')}
                    </p>
                  </Checkbox>
                )}
              />

              <Controller
                name='allowDataSharing'
                control={control}
                rules={assessmentFormRules.allowDataSharing}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={({ checked }) => field.onChange(checked)}
                  >
                    <p className='text-neutral-800 font-normal'>
                      {t('forms.setup.checkboxes.allowDataSharing')}
                    </p>
                  </Checkbox>
                )}
              />
            </div>

            {hasErrors && (
              <div className='mb-4'>
                <InlineMessage
                  variant='error'
                  label={t('scoping.validation.formErrors', {
                    count: Object.keys(errors).length,
                    verb: Object.keys(errors).length > 1 ? 'are' : 'is',
                    plural: Object.keys(errors).length > 1 ? 's' : '',
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
            )}
            <Button
              label={t('common.buttons.continue')}
              variant='primary'
              type='submit'
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>

      {showAccessModal && createdAssessmentId && assessmentPassword && (
        <AccessDetailsModal
          open={showAccessModal}
          assessmentId={createdAssessmentId}
          password={assessmentPassword}
          onContinue={handleContinueAssessment}
        />
      )}

      {showDemographicInfoModal && (
        <Modal
          open={showDemographicInfoModal}
          onClose={() => setShowDemographicInfoModal(false)}
          size='medium'
          header={
            <Text fontWeight={'bold'}>
              {t('forms.setup.sections.demographicInfoModal.title')}
            </Text>
          }
          content={
            <div className='space-y-4'>
              <p className='text-neutral-700 leading-relaxed'>
                {t('forms.setup.sections.demographicInfoModal.description1')}
              </p>
              <p className='text-neutral-700 leading-relaxed'>
                {t('forms.setup.sections.demographicInfoModal.description2')}
              </p>
            </div>
          }
        />
      )}
    </DesignSystemLocaleProvider>
  )
}
