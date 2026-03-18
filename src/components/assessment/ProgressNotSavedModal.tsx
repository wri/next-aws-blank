'use client'

import { Button, Modal } from '@worldresources/wri-design-systems'
import { useTranslations } from '@/i18n/useTranslations'

interface ProgressNotSavedModalProps {
  open: boolean
  onDismiss: () => void
  onLeavePageAnyway: () => void
}

export function ProgressNotSavedModal({
  open,
  onDismiss,
  onLeavePageAnyway,
}: ProgressNotSavedModalProps) {
  const t = useTranslations()
  return (
    <Modal
      open={open}
      onClose={onDismiss}
      header={
        <p className='text-neutral-800 font-bold'>
          {t('assessment.modals.progressNotSaved.heading')}
        </p>
      }
      content={
        <div className='text-neutral-700 space-y-4'>
          <p>{t('assessment.modals.progressNotSaved.description1')}</p>
          <p>{t('assessment.modals.progressNotSaved.description2')}</p>
          <p>{t('assessment.modals.progressNotSaved.description3')}</p>
        </div>
      }
      footer={
        <>
          <Button label={t('common.buttons.cancel')} onClick={onDismiss} />
          <Button
            label={t('assessment.modals.progressNotSaved.leavePageButton')}
            onClick={onLeavePageAnyway}
            variant='outline'
          />
        </>
      }
    />
  )
}
