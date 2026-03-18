'use client'

import { PlainContributor, Strategy } from '@/types/answer.types'
import { Modal } from '@worldresources/wri-design-systems'
import { formatDeadline } from './utils'
import RichText from '@/components/ui/RichText'
import { useTranslations } from '@/i18n/useTranslations'

const StrategiesReadOnlyModal = ({
  strategy,
  keySuccessFactor,
  onClose,
  allContributors,
}: {
  strategy: Strategy | undefined
  keySuccessFactor: string
  onClose: () => void
  allContributors: PlainContributor[]
}) => {
  const t = useTranslations()
  if (!strategy || !strategy.id) return null

  const responsibilities = strategy.responsibility
    ? JSON.parse(strategy.responsibility)
    : []
  const selectedContributors = allContributors.filter((c) =>
    responsibilities.includes(c.id),
  )

  return (
    <Modal
      open={!!strategy?.id}
      onClose={onClose}
      header={
        <p className='font-bold text-neutral-800'>
          {t('assessment.strategies.modal.title')}
        </p>
      }
      content={
        <div className='text-neutral-800'>
          <div className='mb-6'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.fields.title.label')}
            </p>
            <p>
              {strategy?.title || t('assessment.strategies.readOnly.noTitle')}
            </p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.modal.relatedKeySuccessFactor')}
            </p>
            <p>{keySuccessFactor}</p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.fields.description.label')}
            </p>
            {strategy?.description ? (
              <RichText html={strategy.description} />
            ) : (
              t('assessment.strategies.modal.noDescription')
            )}
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.fields.priority.label')}
            </p>
            <p>
              {strategy.priority
                ? t(
                    `assessment.strategies.fields.priority.options.${strategy.priority}`,
                  )
                : t('assessment.strategies.modal.na')}
            </p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.fields.scale.label')}
            </p>
            <p>
              {strategy.scale
                ? t(
                    `assessment.strategies.fields.scale.options.${strategy.scale}`,
                  )
                : t('assessment.strategies.modal.na')}
            </p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.fields.deadline.label')}
            </p>
            <p>
              {formatDeadline(strategy.deadline) ||
                t('assessment.strategies.modal.na')}
            </p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>
              {t('assessment.strategies.fields.responsibility.label')}
            </p>
            <p>
              {selectedContributors?.length > 0
                ? selectedContributors.map((c) => c.name).join(', ')
                : t('assessment.strategies.modal.na')}
            </p>
          </div>
        </div>
      }
    />
  )
}

export default StrategiesReadOnlyModal
