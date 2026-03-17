'use client'

import { Button, Modal } from '@worldresources/wri-design-systems'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BulbIcon,
  InfoIcon,
  LeadThemeIcon,
  NoAnswerIcon,
  PartlyAnswerIcon,
  UserIcon,
  YesAnswerIcon,
} from '@/components/icons'

const FromPreparationModal = ({
  autoOpen,
  assessmentId,
}: {
  autoOpen: boolean
  assessmentId: string
}) => {
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(autoOpen)
  const router = useRouter()

  return (
    <Modal
      open={showDiagnosticModal}
      onClose={() => {
        setShowDiagnosticModal(false)
        router.push(`/assessment/${assessmentId}`)
      }}
      header={
        <div className='font-bold text-neutral-800'>
          Diagnostic successfully created
        </div>
      }
      content={
        <div className='text-base'>
          <p className='text-neutral-700 mb-2'>
            You can now assess whether the 31 key success factors for
            restoration in your chosen ecosystem are currently:
          </p>

          <div className='mb-4'>
            <div className='flex items-center gap-2 mb-2'>
              <YesAnswerIcon className='text-success-500 h-5 w-5' />
              <p className='text-neutral-800 capitalize'>In place</p>
            </div>

            <div className='flex items-center gap-2 mb-2'>
              <PartlyAnswerIcon className='text-warning-500 h-5 w-5' />
              <p className='text-neutral-800 capitalize'>Partly in place</p>
            </div>

            <div className='flex items-center gap-2 mb-2'>
              <NoAnswerIcon className='text-error-500 h-5 w-5' />
              <p className='text-neutral-800 capitalize'>Not in place</p>
            </div>

            <div className='flex items-center gap-2 mb-2'>
              <div className='border-2 border-neutral-600 h-5 w-5 rounded-full' />
              <p className='text-neutral-800 capitalize'>Not applicable</p>
            </div>
          </div>

          <div className='flex items-start gap-2 py-2.5 px-3 bg-secondary-100 rounded-md border border-secondary-200 mb-6'>
            <InfoIcon className='text-secondary-500 h-4 w-4' />
            <p className='text-secondary-700'>
              The objective is not to produce an exhaustive breakdown of every
              aspect of the restoration process, but to rapidly identify
              strengths, weaknesses, and potential bottlenecks.
            </p>
          </div>

          <div className='mb-4'>
            <p className='text-neutral-800 text-lg font-bold mb-3'>
              There are 3 key themes to assess:
            </p>
            <p className='text-neutral-700 mb-3'>
              The overview screen shows how much progress you have made through
              each theme.
            </p>
            <div className='flex flex-col gap-2.5'>
              <div className='border border-neutral-300 px-4 py-3 rounded-[4px] flex items-center gap-2'>
                <BulbIcon className='text-secondary-500 h-5 w-5' />
                <p className='text-neutral-800'>Motivate (8 questions)</p>
              </div>
              <div className='border border-neutral-300 px-4 py-3 rounded-[4px] flex items-center gap-2'>
                <UserIcon className='text-secondary-500 h-5 w-5' />
                <p className='text-neutral-800'>Plan (13 questions)</p>
              </div>
              <div className='border border-neutral-300 px-4 py-3 rounded-[4px] flex items-center gap-2'>
                <LeadThemeIcon className='text-secondary-500 h-5 w-5' />
                <p className='text-neutral-800'>Implement (9 questions)</p>
              </div>
            </div>
          </div>

          <div className='flex items-start gap-2 py-2.5 px-3 bg-secondary-100 rounded-md border border-secondary-200 mb-3'>
            <InfoIcon className='text-secondary-500 h-4 w-4' />
            <p className='text-secondary-700'>
              You can export or share your progress (in view-only or editable
              format) at any time; or use workshop mode (enabled from the top
              right of the screen) to see a simplified full screen view.
            </p>
          </div>

          <div className='flex items-center justify-start'>
            <Button
              onClick={() => {
                setShowDiagnosticModal(false)
                router.push(`/assessment/${assessmentId}`)
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      }
    />
  )
}

export default FromPreparationModal
