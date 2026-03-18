'use client'

import { WarningIcon } from '@/components/icons'
import { InlineMessage, Modal } from '@worldresources/wri-design-systems'
import Link from 'next/link'
import { useTranslations } from '@/i18n/useTranslations'

const StrategiesAboutModal = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const t = useTranslations()
  return (
    <Modal
      open={open}
      onClose={onClose}
      header={
        <p className='font-bold text-neutral-800'>
          {t('assessment.strategies.about.title')}
        </p>
      }
      content={
        <div className='text-neutral-800'>
          <div className='mb-3'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.about.sections.why.title')}
            </p>
            <p>{t('assessment.strategies.about.sections.why.body')}</p>
          </div>
          <div className='mb-3'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.about.sections.include.title')}
            </p>
            <p>{t('assessment.strategies.about.sections.include.body1')}</p>
            <p className='mt-1'>
              {t('assessment.strategies.about.sections.include.body2')}
            </p>
          </div>
          <div className='mb-3'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.about.sections.considerations.title')}
            </p>
            <p>
              {t('assessment.strategies.about.sections.considerations.body1')}
            </p>
            <p className='mt-1'>
              {t('assessment.strategies.about.sections.considerations.body2')}
            </p>
          </div>
          <div className='mb-3'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.about.sections.priority.title')}
            </p>
            <p>{t('assessment.strategies.about.sections.priority.body1')}</p>
            <p className='mt-1'>
              {t('assessment.strategies.about.sections.priority.body2')}
            </p>
          </div>
          <InlineMessage
            label={t('assessment.strategies.about.note.title')}
            caption={
              <div>
                <p className='mb-2'>
                  {t('assessment.strategies.about.note.body')}
                </p>
                <p>
                  {t('assessment.strategies.about.note.linkPrefix')}{' '}
                  <Link
                    href='https://www.wri.org/research/restoration-opportunities-assessment-methodology-roam'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline'
                  >
                    {t('assessment.strategies.about.note.linkLabel')}
                  </Link>
                  {t('assessment.strategies.about.note.linkSuffix')}
                </p>
              </div>
            }
            icon={<WarningIcon />}
            variant='warning'
            size='full-width'
          />
        </div>
      }
    />
  )
}

export default StrategiesAboutModal
