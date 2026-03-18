'use client'

import { Button, Modal } from '@worldresources/wri-design-systems'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BulbIcon,
  InfoIcon,
  SettingsIcon,
  NoAnswerIcon,
  PartlyAnswerIcon,
  UserIcon,
  YesAnswerIcon,
} from '@/components/icons'
import { useTranslations } from '@/i18n/useTranslations'

const FromPreparationModal = ({
  autoOpen,
  assessmentId,
}: {
  autoOpen: boolean
  assessmentId: string
}) => {
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(autoOpen)
  const router = useRouter()
  const t = useTranslations()

  return (
    <Modal
      open={showDiagnosticModal}
      onClose={() => {
        setShowDiagnosticModal(false)
        router.push(`/assessment/${assessmentId}`)
      }}
      header={
        <div className='font-bold text-neutral-800'>
          {t('scoping.success.heading')}
        </div>
      }
      content={
        <div className='text-base'>
          <p className='text-neutral-700 mb-2'>
            {t('scoping.success.description')}
          </p>

          <div className='mb-4'>
            <div className='flex items-center gap-2 mb-2'>
              <YesAnswerIcon className='text-success-500 h-5 w-5' />
              <p className='text-neutral-800 capitalize'>
                {t('scoping.success.statusList.inPlace')}
              </p>
            </div>

            <div className='flex items-center gap-2 mb-2'>
              <PartlyAnswerIcon className='text-warning-500 h-5 w-5' />
              <p className='text-neutral-800 capitalize'>
                {t('scoping.success.statusList.partlyInPlace')}
              </p>
            </div>

            <div className='flex items-center gap-2 mb-2'>
              <NoAnswerIcon className='text-error-500 h-5 w-5' />
              <p className='text-neutral-800 capitalize'>
                {t('scoping.success.statusList.notInPlace')}
              </p>
            </div>

            <div className='flex items-center gap-2 mb-2'>
              <div className='border-2 border-neutral-600 h-5 w-5 rounded-full' />
              <p className='text-neutral-800 capitalize'>
                {t('scoping.success.statusList.notApplicable')}
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2 py-2.5 px-3 bg-secondary-100 rounded-md border border-secondary-200 mb-6'>
            <InfoIcon className='text-secondary-500 h-4 w-4' />
            <p className='text-secondary-700'>
              {t('scoping.success.infoBoxes.objective')}
            </p>
          </div>

          <div className='mb-4'>
            <p className='text-neutral-800 text-lg font-bold mb-3'>
              {t('scoping.success.themes.heading')}
            </p>
            <p className='text-neutral-700 mb-3'>
              {t('scoping.success.themes.description')}
            </p>
            <div className='flex flex-col gap-2.5'>
              <div className='border border-neutral-300 px-4 py-3 rounded-[4px] flex items-center gap-2'>
                <BulbIcon className='text-secondary-500 h-5 w-5' />
                <p className='text-neutral-800'>
                  {t('scoping.success.themes.cards.motivate', { count: 8 })}
                </p>
              </div>
              <div className='border border-neutral-300 px-4 py-3 rounded-[4px] flex items-center gap-2'>
                <UserIcon className='text-secondary-500 h-5 w-5' height="20px" width="20px" />
                <p className='text-neutral-800'>
                  {t('scoping.success.themes.cards.enable', { count: 13 })}
                </p>
              </div>
              <div className='border border-neutral-300 px-4 py-3 rounded-[4px] flex items-center gap-2'>
                <SettingsIcon className='text-secondary-500 h-5 w-5' />
                <p className='text-neutral-800'>
                  {t('scoping.success.themes.cards.implement', { count: 9 })}
                </p>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-start'>
            <Button
              onClick={() => {
                setShowDiagnosticModal(false)
                router.push(`/assessment/${assessmentId}`)
              }}
            >
              {t('scoping.success.button')}
            </Button>
          </div>
        </div>
      }
    />
  )
}

export default FromPreparationModal
