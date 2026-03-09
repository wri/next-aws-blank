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
} from '@worldresources/wri-design-systems'
import {
  DownloadIcon,
} from '@/components/icons'
import {
  useAssessmentSetupForm,
  assessmentFormRules,
} from '@/hooks/useAssessmentSetupForm'
import {
  genderOptions,
  ageRangeOptions,
  identityOptions,
} from '@/constants/setup-assessment'
import type { AssessmentSetupFormData } from '@/types/assessment-setup.types'
import type { AssessmentCreatedResponse } from '@/types/api.types'
import Image from 'next/image'
import { Box } from '@chakra-ui/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { externalLinks } from '@/constants/external-links'



export default function SetupAssessmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { language } = useLanguage()
  const [error, setError] = useState<{
    message: string
    error?: string
    stack?: string
  } | null>(null)

  const isDev = process.env.NODE_ENV === 'development'

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
        router.push(
          `/assessment/${result.assessmentId}/created?token=${encodeURIComponent(result.password)}`,
        )
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

  const getErrorList = () => {
    const errorMessages: string[] = []
    Object.entries(errors).forEach(([, error]) => {
      if (error?.message) {
        errorMessages.push(`• ${error.message}`)
      }
    })
    return errorMessages.join('\n')
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <>
      {error && (
        <Modal
          open={true}
          onClose={() => setError(null)}
          size='large'
          header='Something went wrong'
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
                  label='Close'
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
                    Welcome to the Restoration Diagnostic Tool
                  </h2>

                  <p className='text-lg text-neutral-800 mb-4'>
                    A rapid assessment tool to evaluate the readiness of your
                    landscape/geography for restoration and design strategic
                    actions to ensure long-term success.
                  </p>

                  <div className='rounded-lg overflow-hidden'>
                    <Image
                      src='/images/Diagnostic Setup.jpg'
                      alt='Assessment Setup'
                      width={640}
                      height={480}
                    />
                  </div>

                  <div className='my-4 px-4 py-3 border border-neutral-300 rounded-lg bg-white'>
                    <div className='flex items-center justify-between gap-4'>
                      <div className='flex-1'>
                        <h3 className='font-bold text-lg text-neutral-800'>
                          Complete offline
                        </h3>
                        <p className='text-neutral-800'>
                          Download the spreadsheet template and PDF guidance document to complete a simplified version of the Diagnostic offline.
                        </p>
                      </div>
                      <Button
                        variant='secondary'
                        size='small'
                        leftIcon={<DownloadIcon />}
                        label='Download'
                        onClick={() =>
                          window.open(
                            externalLinks.offlineDownload,
                            '_blank',
                            'noopener noreferrer',
                          )
                        }
                      />
                    </div>
                  </div>

                  <p className='mt-3 text-sm text-neutral-700'>
                    Fields marked with <span className='text-error-500'>*</span>{' '}
                    are required.
                  </p>
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
                    Get started
                  </h3>
                  <p className='text-lg text-neutral-800 mb-4'>
                    Enter some basic details about this diagnostic to get
                    started.
                  </p>

                  <hr className='my-6' />

                  <Box 
                    css={{
                      '& label': {
                        fontSize: 'xl',
                        fontWeight: '600',
                        color: getThemedColor('neutral', 800),
                        marginBottom: '2'
                      },
                      '& span': {
                        fontSize: 'lg',
                        color: getThemedColor('neutral', 800)
                      }
                    }}>
                    <TextInput
                      label='Diagnostic title'
                      caption='Include a descriptive title for your diagnostic. This will be shown to anyone that accesses the diagnostic.'
                      placeholder='Enter a diagnostic title'
                      required
                      {...register('title', assessmentFormRules.title)}
                      errorMessage={errors.title?.message}
                    />
                  </Box>

                  <hr className='my-6' />

                  <h4 className='font-bold text-xl text-neutral-800 mb-2'>
                    Diagnostic lead
                  </h4>
                  <p className='text-lg text-neutral-800 mb-4'>
                    Add the details of the person who will coordinate and oversee this diagnostic. This may be you or another member of your team.
                  </p>

                  <InlineMessage
                    label="Answering on behalf of the diagnostic lead"
                    caption="If you are entering details for someone else, please provide this information with their knowledge and consent. Where possible, we recommend that the diagnostic lead creates the diagnostic to ensure continuity."
                    onActionClick={() => {}}
                    variant="warning"
                    size='full-width'
                  />

                  <div className='space-y-6'>

                    <div className='grid grid-cols-1 gap-4'>
                      <TextInput
                        label='Full name'
                        placeholder='Enter full name'
                        required
                        {...register('fullName', assessmentFormRules.fullName)}
                        errorMessage={errors.fullName?.message}
                      />
                      <TextInput
                        label='Email address'
                        type='email'
                        placeholder='name@organization.com'
                        required
                        {...register('email', assessmentFormRules.email)}
                        errorMessage={errors.email?.message}
                      />
                      <TextInput
                        label='Organization'
                        placeholder='Enter an organization name'
                        {...register(
                          'organization',
                          assessmentFormRules.organization,
                        )}
                        errorMessage={errors.organization?.message}
                      />
                      <TextInput
                        label='Job role'
                        placeholder='e.g. Project Manager'
                        {...register('role', assessmentFormRules.role)}
                        errorMessage={errors.role?.message}
                      />
                    </div>

                    {/* Demographic Information Section */}
                    <div className='flex flex-col gap-6 mb-6'>
                      <div className='flex flex-col gap-2'>
                        <h3 className='text-lg font-bold text-neutral-800'>
                          Demographic information
                        </h3>
                        <p className='text-sm text-neutral-600'>
                          The following questions are used for aggregated reporting only and do not affect participation.
                        </p>
                      </div>

                      <Controller
                        name='gender'
                        control={control}
                        rules={assessmentFormRules.gender}
                        render={({ field }) => (
                          <Select
                            label='Gender (optional)'
                            placeholder='Please select'
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
                            label='Age range (optional)'
                            placeholder='Please select'
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
                            label='Does the diagnostic lead identify as part of any of the following groups? (optional)'
                            name='identity'
                            radios={identityOptions}
                            defaultValue={field.value}
                            onCheckedChange={(_, selectedValue) => field.onChange(selectedValue)}
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
                    onCheckedChange={({ checked }) =>
                      field.onChange(checked)
                    }
                    required
                  >
                    <p className='text-neutral-800 font-normal'>
                      <span className='text-error-500'>*</span> I agree
                      to WRI&apos;s <a className='underline' rel='noopener noreferrer' href={externalLinks.tos} target='_blank'>Terms of Service</a> and <a className='underline' rel='noopener noreferrer' href={externalLinks.privacy} target="_blank">Privacy Policy</a>&nbsp;
                      so I can save and manage my progress.
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
                    onCheckedChange={({ checked }) =>
                      field.onChange(checked)
                    }
                  >
                    <p className='text-neutral-800 font-normal'>
                      I allow my anonymized data to be used in global
                      research and meta-analysis to help identify
                      restoration trends.
                    </p>
                  </Checkbox>
                )}
              />
            </div>

            {hasErrors && (
              <div className='mb-4'>
                <div className='p-4 bg-error-50 border-l-4 border-error-500 rounded'>
                  <p className='font-bold text-error-900 text-sm mb-3'>
                    There are errors in the form:
                  </p>
                  <div className='space-y-1 text-sm text-error-800 whitespace-pre-line'>
                    {getErrorList()}
                  </div>
                </div>
              </div>
            )}
            <Button
              label='Continue'
              variant='primary'
              type='submit'
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>
    </>
  )
}
