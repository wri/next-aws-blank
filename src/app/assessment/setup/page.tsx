'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller } from 'react-hook-form';
import {
  Panel,
  Button,
  TextInput,
  Select,
  Checkbox,
  Navbar,
  Menu,
  Modal,
} from '@worldresources/wri-design-systems';
import {
  WriLogoIcon,
  ChevronLeftIcon,
  InfoIcon,
  LayerIcon,
  ListIcon,
  DownloadIcon,
  PersonIcon,
  EditIcon,
  CheckCircleIcon,
  ExpandMoreIcon,
} from '@/components/icons';
import {
  titleOptions,
  countryOptions,
  geographyTypeOptions,
  scopeOptions,
  ecosystemOptions,
} from '@/constants/setup-assessment';
import { languageOptions } from '@/constants/language-options';
import {
  useAssessmentSetupForm,
  assessmentFormRules,
} from '@/hooks/useAssessmentSetupForm';
import type { AssessmentSetupFormData } from '@/types/assessment-setup.types';
import type { AssessmentCreatedResponse } from '@/types/api.types';

export default function SetupAssessmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [error, setError] = useState<{ message: string; error?: string; stack?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const isDev = process.env.NODE_ENV === 'development';

  // Prevent hydration mismatch - Navbar has responsive logic that checks window dimensions
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    formState: { errors },
  } = useAssessmentSetupForm();

  const onSubmit = async (data: AssessmentSetupFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        language: selectedLanguage,
      };

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: AssessmentCreatedResponse = await response.json();

      if (result.success && result.assessmentId && result.password) {
        // Redirect to success page with password in query param
        router.push(`/assessment/${result.assessmentId}/created?token=${encodeURIComponent(result.password)}`);
      } else {
        setError({
          message: result.message || 'Failed to create assessment',
          error: result.error,
          stack: result.stack
        });
      }
    } catch (error) {
      setError({
        message: 'Unable to connect to the server. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Network error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageSelect = (selectedValue: string) => {
    const language = languageOptions.find(lang => lang.value === selectedValue);
    if (language) {
      setSelectedLanguage(language.value);
    }
  };

  const getErrorList = () => {
    const errorMessages: string[] = [];
    Object.entries(errors).forEach(([, error]) => {
      if (error?.message) {
        errorMessages.push(`• ${error.message}`);
      }
    });
    return errorMessages.join('\n');
  };

  const hasErrors = Object.keys(errors).length > 0;

  const header = (
    <div className="flex justify-between items-center px-4 py-3 bg-neutral-200 sm:rounded-t-lg border-b-[1px]">
      <button
        onClick={() => router.back()}
        className="flex justify-center items-center gap-1 underline text-neutral-800"
      >
        <ChevronLeftIcon />
        <span className="text-neutral-900">Back</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Error Modal */}
      {error && (
        <Modal
          open={true}
          onClose={() => setError(null)}
          size="large"
          header="Something went wrong"
          content={
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {error.message}
              </p>
              
              {isDev && error.error && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Error details:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                    <code className="text-xs text-red-600 font-mono">
                      {error.error}
                    </code>
                  </div>
                </div>
              )}
              
              {isDev && error.stack && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Stack trace:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button
                  label="Close"
                  variant="primary"
                  size="default"
                  onClick={() => setError(null)}
                />
              </div>
            </div>
          }
        />
      )}
      
      {mounted && (
        <Navbar 
          pathname="/assessment/setup"
          linkRouter={Link}
          logo={
            <Link href={'/'}>
              <WriLogoIcon height='auto' width='120px' />
              <span className="font-semibold ml-7">Restoration Diagnostic</span>
            </Link>
          }
          navigationSection={[]}
          utilitySection={[
            <Menu
              key='language-menu'
              label='Language'
              items={languageOptions}
              onSelect={handleLanguageSelect}
            />,
          ]}
          actionsSection={[]}
          maxWidth={1440}
          fixed
        />
      )}
      <form onSubmit={handleFormSubmit(onSubmit)} noValidate>
        <div className="max-w-[640px] py-16 w-full flex flex-col overflow-y-auto mx-auto">
          <div>
            {/* Mobile Logo & Tag */}
            <div className="my-4 flex items-center justify-between sm:hidden px-0">
              <WriLogoIcon height="40px" width="120px" />
            </div>

            {/* Header Panel */}
            <div className="border border-gray-300 m-auto rounded-none sm:rounded-[10px] overflow-hidden mb-6 w-full">
              <Panel
                width="full"
                header={<div>{header}</div>}
                content={
                  <div className="p-6">
                    <h2 className="font-bold text-[30px] leading-[28px] py-2">
                      Create a new assessment
                    </h2>
                    <div className="text-md text-gray-700 mb-6">
                      Enter your details to begin the restoration diagnostic
                      assessment.
                    </div>

                    {/* Info Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 border border-gray-300 rounded-lg flex flex-col bg-white hover:bg-neutral-50 transition-colors">
                        <LayerIcon className="text-neutral-700 mb-2" height="24px" width="24px" />
                        <span className="text-sm font-semibold">3 sections</span>
                      </div>
                      <div className="p-4 border border-gray-300 rounded-lg flex flex-col bg-white hover:bg-neutral-50 transition-colors">
                        <ListIcon className="text-neutral-700 mb-2" height="24px" width="24px" />
                        <span className="text-sm font-semibold">30 questions</span>
                      </div>
                    </div>

                    {/* Assessment Process Details */}
                    <details className="my-4 border border-gray-300 rounded-lg overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors list-none">
                        <div className="flex items-center gap-3">
                          <InfoIcon className="text-neutral-700" height="20px" width="20px" />
                          <span className="font-semibold text-sm">About the assessment process</span>
                        </div>
                        <ExpandMoreIcon className="text-neutral-700" height="24px" width="24px" />
                      </summary>
                      <div className="p-6 pt-0 space-y-4">
                        <div className="pt-4 border-t border-neutral-200">
                          <h3 className="font-bold text-sm mb-2">Assess key success factors</h3>
                          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                            You will be guided through a series of questions to score how well your project addresses set criteria, providing rationale and evidence for your answers.
                          </p>
                          <div className="space-y-3 bg-neutral-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center text-sm pb-3 border-b border-neutral-200">
                              <span className="flex items-center gap-2">
                                <PersonIcon className="text-neutral-700" height="18px" width="18px" />
                                <span>Motivate</span>
                              </span>
                              <span className="text-neutral-500">8 questions</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-3 border-b border-neutral-200">
                              <span className="flex items-center gap-2">
                                <EditIcon className="text-neutral-700" height="18px" width="18px" />
                                <span>Enable</span>
                              </span>
                              <span className="text-neutral-500">13 questions</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2">
                                <CheckCircleIcon className="text-neutral-700" height="18px" width="18px" />
                                <span>Implement</span>
                              </span>
                              <span className="text-neutral-500">9 questions</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <h3 className="font-bold text-sm mb-2">Create an action plan</h3>
                          <p className="text-sm text-grey-700 leading-relaxed">
                            For unmet or partially met criteria, you will be guided through a process of identifying steps to take in order to meet the relevant criteria, set to a timeline.
                          </p>
                        </div>
                      </div>
                    </details>

                    {/* Preparation Guide Widget */}
                    <div className="my-4 p-4 border border-gray-300 rounded-lg bg-white">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-[0.7]">
                          <h3 className="font-semibold text-sm mb-2">Preparation guide</h3>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            For more instructions, download the full pre-assessment preparation guide
                          </p>
                        </div>
                        <div className="flex items-center justify-center">
                          <a
                            href="https://files.wri.org/d8/s3fs-public/guide-restoration-opportunities-assessment-methodology.pdf"
                            download="restoration-diagnostic-preparation-guide.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <DownloadIcon className="text-neutral-700" height="18px" width="18px" />
                            <span className="text-sm font-medium">Download</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <p className="py-2 text-sm text-gray-700">
                      Fields marked with{' '}
                      <span className="text-error-500">*</span> are required.
                    </p>
                  </div>
                }
              />
            </div>

            {/* Form Sections */}
            <div className="bg-neutral-200 p-6 sm:bg-transparent sm:p-0">
              {/* Step 1: About You */}
              <div className="border border-gray-300 m-auto rounded-[10px] overflow-hidden mb-6 w-full">
                <Panel
                  width="full"
                  content={
                    <div className="p-6">
                      <p className="text-3xl font-bold text-neutral-800 mb-1">
                        About you
                      </p>
                      <p className="text-neutral-700 mb-6">
                        Provide some information about yourself.
                      </p>
                      <hr className="mb-6 sm:mb-8" />

                      <div className="space-y-6">
                        {/* Row 1: Title, Full Name, Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                          <div className="sm:col-span-2">
                            <Controller
                              name="title"
                              control={control}
                              rules={assessmentFormRules.title}
                              render={({ field }) => (
                                <Select
                                  label="Title"
                                  placeholder="--"
                                  required
                                  items={titleOptions}
                                  onChange={(values) => field.onChange(values[0] || '')}
                                  errorMessage={errors.title?.message}
                                />
                              )}
                            />
                          </div>
                          <div className="sm:col-span-5">
                            <TextInput
                              label="Full name"
                              placeholder="Enter full name"
                              required
                              {...register('fullName', assessmentFormRules.fullName)}
                              errorMessage={errors.fullName?.message}
                            />
                          </div>
                          <div className="sm:col-span-5">
                            <TextInput
                              label="Email address"
                              type="email"
                              placeholder="name@organization.com"
                              required
                              {...register('email', assessmentFormRules.email)}
                              errorMessage={errors.email?.message}
                            />
                          </div>
                        </div>

                        {/* Row 2: Organisation, Role */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <TextInput
                            label="Organisation"
                            placeholder="Your organization name"
                            required
                            {...register('organization', assessmentFormRules.organization)}
                            errorMessage={errors.organization?.message}
                          />

                          <TextInput
                            label="Role"
                            placeholder="e.g. Project Manager"
                            required
                            {...register('role', assessmentFormRules.role)}
                            errorMessage={errors.role?.message}
                          />
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>

              {/* Step 2: Geography */}
              <div className="border border-gray-300 m-auto rounded-[10px] overflow-hidden mb-6 w-full">
                <Panel
                  width="full"
                  content={
                    <div className="p-6">
                      <p className="text-3xl font-bold text-neutral-800 mb-1">
                        Geography
                      </p>
                      <p className="text-neutral-700 mb-6">
                        Enter details about the location of your restoration
                        project.
                      </p>
                      <hr className="mb-6 sm:mb-8" />

                      <div className="space-y-6">
                        {/* Row 1: Country, Sub-region */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Controller
                            name="country"
                            control={control}
                            rules={assessmentFormRules.country}
                            render={({ field }) => (
                              <Select
                                label="Country"
                                placeholder="Select country"
                                required
                                items={countryOptions}
                                onChange={(values) => field.onChange(values[0] || '')}
                                errorMessage={errors.country?.message}
                              />
                            )}
                          />

                          <TextInput
                            label="Sub-region / Province"
                            placeholder="Enter sub-region"
                            required
                            {...register('subRegion', assessmentFormRules.subRegion)}
                            errorMessage={errors.subRegion?.message}
                          />
                        </div>

                        {/* Row 2: Geography Type, Scope */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Controller
                            name="geographyType"
                            control={control}
                            rules={assessmentFormRules.geographyType}
                            render={({ field }) => (
                              <Select
                                label="Geography Type"
                                placeholder="Select geography type"
                                required
                                items={geographyTypeOptions}
                                onChange={(values) => field.onChange(values[0] || '')}
                                errorMessage={errors.geographyType?.message}
                              />
                            )}
                          />

                          <Controller
                            name="scope"
                            control={control}
                            rules={assessmentFormRules.scope}
                            render={({ field }) => (
                              <Select
                                label="Scope"
                                placeholder="Select scope"
                                required
                                items={scopeOptions}
                                onChange={(values) => field.onChange(values[0] || '')}
                                errorMessage={errors.scope?.message}
                              />
                            )}
                          />
                        </div>

                        {/* Row 3: GIS Link */}
                        <TextInput
                          label="GIS Link"
                          placeholder="Enter GIS link"
                          {...register('gisLink')}
                        />

                        <hr className="my-6 sm:my-8" />

                        <div>
                          <label className="block text-sm font-semibold mb-1">
                            <span className="text-error-500">*</span> Ecosystem context
                          </label>
                          <p className="text-xs text-gray-700 mb-4">
                            Select all ecosystem types present in your assessment area.
                          </p>
                        </div>
                        <div className="space-y-3">
                          {ecosystemOptions.map((ecosystem) => (
                            <Controller
                              key={ecosystem.id}
                              name="ecosystems"
                              control={control}
                              rules={assessmentFormRules.ecosystems}
                              render={({ field }) => (
                                <label
                                  className={`
                                    relative block cursor-pointer p-4 border rounded-lg bg-white
                                    transition-all hover:border-neutral-400
                                    ${field.value?.includes(ecosystem.id) ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'}
                                  `}
                                >
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={field.value?.includes(ecosystem.id)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...(field.value || []), ecosystem.id]
                                          : (field.value || []).filter((id) => id !== ecosystem.id);
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold">{ecosystem.label}</p>
                                      <p className="text-xs text-gray-700">{ecosystem.description}</p>
                                    </div>
                                  </div>
                                </label>
                              )}
                            />
                          ))}
                        </div>
                        {errors.ecosystems && (
                          <p className="text-sm text-error-500 mt-2">
                            {errors.ecosystems.message}
                          </p>
                        )}
                      </div>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Footer: Errors & Submit */}
            <div className="m-auto bg-neutral-200 px-6 sm:bg-transparent sm:p-0 mb-16">
              {hasErrors && (
                <div className="mb-4">
                  <div className="p-4 bg-error-50 border-l-4 border-error-500 rounded">
                    <p className="font-semibold text-error-900 text-sm mb-3">
                      There are errors in the form:
                    </p>
                    <div className="space-y-1 text-sm text-error-800 whitespace-pre-line">
                      {getErrorList()}
                    </div>
                  </div>
                </div>
              )}
              <Button
                label="Start assessment"
                variant="primary"
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
