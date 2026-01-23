'use client'

import { ChevronLeftIcon, InfoIcon, WriLogoIcon } from '@/components/icons'
import {
  Button,
  CheckboxList,
  InlineMessage,
  Menu,
  ProgressBar,
  RadioList,
  StepProgressIndicator,
  Tag,
  TextInput,
  Panel,
} from '@worldresources/wri-design-systems'
import { useRef, useState } from 'react'

const steps = [
  {
    label: 'Label 1',
    value: 'step-1',
  },
  {
    label: 'Label 2',
    value: 'step-2',
  },
  {
    label: 'Label 3',
    value: 'step-3',
  },
  {
    label: 'Label 4',
    value: 'step-4',
  },
  {
    label: 'Label 5',
    value: 'step-5',
  },
]

const MultiPageFormSingleSection = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const scrollToRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <div className='flex flex-col items-center justify-start' ref={scrollToRef}>
      <div className='h-12 w-full px-4 sm:hidden flex items-center justify-between'>
        <WriLogoIcon height='32px' width='92px' />
        <Tag
          label='Progress saved to device'
          variant='success'
          icon={<InfoIcon />}
        />
      </div>
      <div className='w-full sm:hidden'>
        <ProgressBar progress={(currentStep * 100) / steps.length} />
      </div>
      <WriLogoIcon className='hidden sm:block sm:mb-[50px]' />
      <div className='w-full sm:max-w-[560px]'>
        <div className='hidden sm:block sm:mb-6'>
          <StepProgressIndicator
            currentStep={currentStep}
            steps={steps.map((step) => ({
              label: step.label,
              onClick: () => setCurrentStep(steps.indexOf(step) + 1),
            }))}
          />
        </div>
        <div className='overflow-hidden w-full sm:border sm:border-neutral-400 bg-neutral-100 sm:rounded-lg sm:shadow-md mb-6'>
          <Panel
            width='full'
            header={
              <div className='flex justify-between items-center px-4 py-3 bg-neutral-200 sm:rounded-t-lg border-b-[1px]'>
                {currentStep > 1 ? (
                  <button
                    className='flex justify-center items-center gap-1 underline text-neutral-800'
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    <ChevronLeftIcon />
                    <p className='text-neutral-900'>Back</p>
                  </button>
                ) : (
                  <div />
                )}
                <div className='hidden sm:block'>
                  <Tag
                    label='Progress saved to device'
                    variant='success'
                    icon={<InfoIcon />}
                  />
                </div>
                <div className='block sm:hidden'>
                  <Menu
                    label={`Step ${currentStep}: ${
                      steps[currentStep - 1].label
                    }`}
                    items={steps.map((step) => ({
                      ...step,
                      disabled:
                        steps.findIndex((s) => s.value === step.value) + 1 >
                        currentStep,
                    }))}
                    onSelect={(step) =>
                      setCurrentStep(
                        steps.findIndex((s) => s.value === step) + 1,
                      )
                    }
                  />
                </div>
              </div>
            }
            content={
              <div className='p-6 sm:py-8'>
                <p className='text-3xl font-bold text-neutral-800 mb-1'>
                  Section title {currentStep}
                </p>
                <p className='text-neutral-700 mb-3'>Section description</p>
                <p className='text-sm'>
                  Fields marked with <span className='text-error-500'>*</span>{' '}
                  are required.
                </p>
                <hr className='mt-5 mb-6 sm:mt-6 sm:mb-8' />
                <CheckboxList
                  label='Label'
                  caption='Caption'
                  checkboxes={[
                    {
                      children: 'Checkbox 1',
                      name: 'checkbox-1',
                      value: 'checkbox-1',
                    },
                    {
                      children: 'Checkbox 2',
                      name: 'checkbox-2',
                      value: 'checkbox-2',
                    },
                    {
                      children: 'Checkbox 3',
                      name: 'checkbox-3',
                      value: 'checkbox-3',
                    },
                  ]}
                  required
                />
                <hr className='my-6 sm:my-8' />
                <div className='max-w-72'>
                  <TextInput
                    label='Label'
                    caption='Caption'
                    placeholder='Placeholder'
                    required
                  />
                </div>
                <hr className='my-6 sm:my-8' />
                <RadioList
                  label='Label'
                  caption='Caption'
                  name='radio-list-1'
                  onCheckedChange={() => {}}
                  radios={[
                    {
                      children: 'Radio 1',
                      value: 'radio-1',
                    },
                    {
                      children: 'Radio 2',
                      value: 'radio-2',
                    },
                    {
                      children: 'Radio 3',
                      value: 'radio-3',
                    },
                  ]}
                  required
                />
                {currentStep === 2 && (
                  <div>
                    <hr className='my-6 sm:my-8' />
                    <CheckboxList
                      label='Label'
                      caption='Caption'
                      checkboxes={[
                        {
                          children: 'Checkbox 1',
                          name: 'checkbox-1',
                          value: 'checkbox-1',
                        },
                        {
                          children: 'Checkbox 2',
                          name: 'checkbox-2',
                          value: 'checkbox-2',
                        },
                        {
                          children: 'Checkbox 3',
                          name: 'checkbox-3',
                          value: 'checkbox-3',
                        },
                      ]}
                    />
                  </div>
                )}
                {currentStep >= 3 && (
                  <div>
                    <hr className='my-6 sm:my-8' />
                    <CheckboxList
                      label='Label'
                      caption='Caption'
                      checkboxes={[
                        {
                          children: 'Checkbox 1',
                          name: 'checkbox-1',
                          value: 'checkbox-1',
                        },
                        {
                          children: 'Checkbox 2',
                          name: 'checkbox-2',
                          value: 'checkbox-2',
                        },
                        {
                          children: 'Checkbox 3',
                          name: 'checkbox-3',
                          value: 'checkbox-3',
                        },
                      ]}
                    />
                    <hr className='my-6 sm:my-8' />
                    <div className='max-w-72'>
                      <TextInput
                        label='Label'
                        caption='Caption'
                        placeholder='Placeholder'
                      />
                    </div>
                  </div>
                )}
              </div>
            }
          />
        </div>
        <div className='px-6 sm:px-0 sm:mb-6'>
          <InlineMessage
            variant='error'
            label='There are errors in the form:'
            caption='• Input label'
          />
        </div>
        <div className='px-6 sm:px-0'>
          <Button
            label={
              currentStep === steps.length ? 'Submit' : 'Save and continue'
            }
            onClick={() => {
              setCurrentStep(
                currentStep <= steps.length - 1 ? currentStep + 1 : currentStep,
              )

              setTimeout(scrollToTop, 200)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MultiPageFormSingleSection
