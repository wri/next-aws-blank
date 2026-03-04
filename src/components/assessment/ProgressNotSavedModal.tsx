'use client'

import { Button, Modal } from '@worldresources/wri-design-systems'

interface ProgressNotSavedModalProps {
  open: boolean
  onCancel: () => void
  onLeavePageAnyway: () => void
}

export function ProgressNotSavedModal({
  open,
  onCancel,
  onLeavePageAnyway,
}: ProgressNotSavedModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      header={
        <p className='text-neutral-800 font-bold'>Progress not saved</p>
      }
      content={
        <div className='text-neutral-700 space-y-4'>
          <p>
            We&apos;re currently having trouble saving your progress.
          </p>
          <p>
            Please check your internet connection and try again.
          </p>
          <p>
            If the issue continues, we recommend copying your answers to another
            document before leaving this page to avoid losing your work.
          </p>
        </div>
      }
      footer={
        <>
          <Button
            label='Cancel'
            onClick={onCancel}
          />
          <Button
            label='Continue anyway'
            onClick={onLeavePageAnyway}
            variant='outline'
          />
        </>
      }
    />
  )
}
