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
} from '@worldresources/wri-design-systems'
import {
  InfoIcon,
  ListIcon,
  DownloadIcon,
  CalendarIcon,
  ChevronDownIcon,
} from '@/components/icons'
import {
  useAssessmentSetupForm,
  assessmentFormRules,
} from '@/hooks/useAssessmentSetupForm'
import type { AssessmentSetupFormData } from '@/types/assessment-setup.types'
import type { AssessmentCreatedResponse } from '@/types/api.types'
import Image from 'next/image'
import { Collapsible } from '@chakra-ui/react'
import { useLanguage } from '@/contexts/LanguageContext'

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

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <div className='px-4 py-3 border border-secondary-200 rounded-lg flex flex-col bg-secondary-100 transition-colors'>
                      <ListIcon
                        className='text-secondary-500 mb-3'
                        height='24px'
                        width='24px'
                      />
                      <span className='text-secondary-700'>3 step process</span>
                    </div>
                    <div className='px-4 py-3 border border-secondary-200 rounded-lg flex flex-col bg-secondary-100 transition-colors'>
                      <CalendarIcon
                        className='text-secondary-500 mb-3'
                        height='24px'
                        width='24px'
                      />
                      <span className='text-secondary-700'>
                        3 - 5 weeks to complete
                      </span>
                    </div>
                  </div>

                  <div className='rounded-lg overflow-hidden'>
                    <Image
                      src='/images/Diagnostic Setup.jpg'
                      alt='Assessment Setup'
                      width={640}
                      height={480}
                    />
                  </div>

                  <Collapsible.Root className='mt-5 border border-neutral-300 rounded-lg'>
                    <Collapsible.Trigger asChild>
                      <div className='px-4 py-3 flex items-center justify-between gap-3 cursor-pointer'>
                        <div className='flex items-center gap-3'>
                          <InfoIcon className='text-secondary-500 h-4 w-4' />
                          <span className='font-bold text-neutral-800'>
                            What is the Restoration Diagnostic Tool?
                          </span>
                        </div>
                        <Collapsible.Indicator
                          _open={{ transform: 'rotate(180deg)' }}
                        >
                          <ChevronDownIcon className='text-neutral-800 h-4 w-4' />
                        </Collapsible.Indicator>
                      </div>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <div className='px-4 py-3'>
                        The WRI Restoration Diagnostic helps assess whether
                        cultural, financial, political, and environmental
                        &quot;enabling conditions&quot; support ecosystem
                        restoration. By identifying bottlenecks, you can move
                        from general planning to targeted, effective action.
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>

                  <div className='my-4 px-4 py-3 border border-neutral-300 rounded-lg bg-white'>
                    <div className='flex items-center justify-between gap-4'>
                      <div className='flex-1'>
                        <h3 className='font-bold text-lg text-neutral-800'>
                          Preparation guide
                        </h3>
                        <p className='text-neutral-800'>
                          Download a PDF pre-diagnostic preparation guide.
                        </p>
                      </div>
                      <Button
                        variant='secondary'
                        size='small'
                        leftIcon={<DownloadIcon />}
                        label='Download'
                        onClick={() =>
                          window.open(
                            'https://files.wri.org/d8/s3fs-public/guide-restoration-opportunities-assessment-methodology.pdf',
                            '_blank',
                            'noopener noreferrer',
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className='my-4 px-4 py-3 border border-neutral-300 rounded-lg bg-white'>
                    <div className='flex items-center justify-between gap-4'>
                      <div className='flex-1'>
                        <h3 className='font-bold text-lg text-neutral-800'>
                          Spreadsheet template
                        </h3>
                        <p className='text-neutral-800'>
                          Use this option if offline access is needed.
                        </p>
                      </div>
                      <Button
                        variant='secondary'
                        size='small'
                        leftIcon={<DownloadIcon />}
                        label='Download'
                        onClick={() =>
                          window.open(
                            'https://files.wri.org/d8/s3fs-public/guide-restoration-opportunities-assessment-methodology.pdf',
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

                  <h4 className='font-bold text-xl text-neutral-800 mb-2'>
                    Diagnostic lead
                  </h4>
                  <p className='text-lg text-neutral-800 mb-4'>
                    Please enter details for the primary person responsible for
                    this diagnostic.
                  </p>

                  <div className='space-y-6'>
                    <TextInput
                      label='Diagnostic title'
                      caption='Include a descriptive title for your diagnostic. This will be shown to anyone that accesses the diagnostic.'
                      placeholder='Enter a diagnostic title'
                      required
                      {...register('title', assessmentFormRules.title)}
                      errorMessage={errors.title?.message}
                    />

                    <hr className='my-6' />

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

                    <hr className='my-6' />

                    <div className='flex flex-col gap-2'>
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
                            <p className='text-neutral-800'>
                              <span className='text-error-500'>*</span> I agree
                              to WRI&apos;s Terms of Service and Privacy Policy
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
                            <p className='text-neutral-800'>
                              I allow my anonymized data to be used in global
                              research and meta-analysis to help identify
                              restoration trends.
                            </p>
                          </Checkbox>
                        )}
                      />
                    </div>
                  </div>
                </div>
              }
            />
          </div>

          <div className='px-6 bg-transparent sm:p-0 mb-16'>
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
