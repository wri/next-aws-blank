'use client'

import {
  Tag,
  Panel,
  InlineMessage,
  Button,
  TextInput,
  CheckboxList,
  RadioList,
} from '@worldresources/wri-design-systems'

import { useState, type ReactNode } from 'react'
import {
  InfoIcon,
  WriLogoIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../../../components/icons'

const header = (
  <div className='flex justify-between items-center px-4 py-3 bg-neutral-200 sm:rounded-t-lg border-b-[1px]'>
    <button className='flex justify-center items-center gap-1 underline text-neutral-800'>
      <ChevronLeftIcon />
      <span className='text-neutral-900'>Back</span>
    </button>

    <div className='hidden sm:block'>
      <Tag
        label='Progress saved to device'
        variant='success'
        icon={<InfoIcon />}
      />
    </div>
  </div>
)

type CollapsibleStepPanelProps = {
  label: string
  children: ReactNode
}

const CollapsibleStepPanel = ({
  label,
  children,
}: CollapsibleStepPanelProps) => {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div className='border border-gray-300 m-auto rounded-[10px] overflow-hidden mb-6 w-full '>
      <Panel
        width='full'
        header={
          <div className='flex justify-between items-center px-4 py-3 sm:rounded-t-lg'>
            <p className='text-neutral-900'>{label}</p>
            <button
              type='button'
              aria-expanded={isOpen}
              aria-controls={`${label}-panel-content`}
              onClick={() => setIsOpen((v) => !v)}
              className='flex items-center gap-2'
            >
              <Tag label='In progress' variant='info-grey' />
              {isOpen ? (
                <ChevronUpIcon boxSize='16px' className='text-neutral-800' />
              ) : (
                <ChevronDownIcon boxSize='16px' className='text-neutral-800' />
              )}
            </button>
          </div>
        }
        content={
          <div
            id={`${label}-panel-content`}
            className={
              isOpen
                ? 'max-h-[2000px] transition-[max-height] duration-300 ease-in-out overflow-hidden'
                : 'max-h-0 transition-[max-height] duration-300 ease-in-out overflow-hidden'
            }
            aria-hidden={!isOpen}
          >
            <div
              className={
                isOpen
                  ? 'p-6 opacity-100 translate-y-0 transition-all duration-300'
                  : 'p-6 opacity-0 -translate-y-1 transition-all duration-300'
              }
            >
              {children}
            </div>
          </div>
        }
      />
    </div>
  )
}

const SinglePageFormMultipleSections = () => {
  return (
    <div className='max-w-[560px] py-16 w-full flex flex-col overflow-y-auto mx-auto'>
      <div>
        <div className='my-4 flex items-center justify-between sm:hidden px-0'>
          <WriLogoIcon height='40px' width='120px' />
          <Tag
            label='Progress saved to device'
            variant='success'
            icon={<InfoIcon />}
          />
        </div>
        <div className='hidden sm:block my-[50px] mx-auto w-fit'>
          <WriLogoIcon height='64px' width='184px' />
        </div>
        <div className='border border-gray-300 m-auto rounded-none sm:rounded-[10px] overflow-hidden mb-6 w-full  '>
          <Panel
            width='full'
            header={<div>{header}</div>}
            content={
              <div className='p-6'>
                <h2 className='font-bold text-[30px] leading-[28px] py-2'>
                  Page title
                </h2>
                <div className='py-2 text-md text-gray-700'>
                  Page description
                </div>
                <p className='py-2 text-sm text-gray-700'>
                  Fields marked with * are required.
                </p>
              </div>
            }
          />
        </div>
        <div className='bg-neutral-200 p-6 sm:bg-transparent sm:p-0'>
          <CollapsibleStepPanel label='Step 1'>
            <p className='text-3xl font-bold text-neutral-800 mb-1'>
              Section title
            </p>
            <p className='text-neutral-700 mb-3'>Section description</p>
            <p className='text-sm'>
              Fields marked with <span className='text-error-500'>*</span> are
              required.
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
          </CollapsibleStepPanel>
          <CollapsibleStepPanel label='Step 2'>
            <p className='text-3xl font-bold text-neutral-800 mb-1'>
              Section title
            </p>
            <p className='text-neutral-700 mb-3'>Section description</p>
            <p className='text-sm'>
              Fields marked with <span className='text-error-500'>*</span> are
              required.
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
              name='radio-list-2'
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
          </CollapsibleStepPanel>
        </div>

        <div className='m-auto bg-neutral-200 px-6 sm:bg-transparent sm:p-0'>
          <InlineMessage
            variant='error'
            label='There are errors in the form:'
            caption='• Input label'
          />
          <Button label='Save and Continue' variant='primary' />
        </div>
      </div>
    </div>
  )
}

export default SinglePageFormMultipleSections
