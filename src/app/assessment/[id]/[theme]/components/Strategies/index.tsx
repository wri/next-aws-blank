'use client'

import { InfoIcon, PlusIcon, TrashIcon } from '@/components/icons'
import { Button, TextInput, Select } from '@worldresources/wri-design-systems'
import { useState } from 'react'
import { PlainQuestion } from '../ThemePageLayout'
import { Text } from '@chakra-ui/react'
import { ChakraRichTextEditor } from '@/components/assessment/ChakraRichTextEditor'
import DatePicker from '@/components/ui/DatePicker'
import clsx from 'clsx'
import StrategiesAboutModal from './AboutModal'
import { PlainContributor, Strategy } from '@/types/answer.types'
import { Responsibility } from './Responsibility'
import { useTranslations } from '@/i18n/useTranslations'

const Strategies = ({
  question,
  strategies,
  onStrategysChange,
  allContributors,
  assessmentId,
}: {
  question: PlainQuestion
  strategies: string
  onStrategysChange: (value: string) => void
  allContributors: PlainContributor[]
  assessmentId: string
}) => {
  const t = useTranslations()
  const [showAboutModal, setShowAboutModal] = useState(false)
  const newStrategies: Strategy[] = strategies ? JSON.parse(strategies) : []
  const scaleOptions = [
    {
      value: 'national',
      label: t('assessment.strategies.fields.scale.options.national'),
    },
    {
      value: 'subnational',
      label: t('assessment.strategies.fields.scale.options.subnational'),
    },
    {
      value: 'landscape',
      label: t('assessment.strategies.fields.scale.options.landscape'),
    },
    {
      value: 'site',
      label: t('assessment.strategies.fields.scale.options.site'),
    },
    {
      value: 'transboundary',
      label: t('assessment.strategies.fields.scale.options.transboundary'),
    },
  ]
  const priorityOptions = [
    {
      value: 'high',
      label: t('assessment.strategies.fields.priority.options.high'),
    },
    {
      value: 'medium',
      label: t('assessment.strategies.fields.priority.options.medium'),
    },
    {
      value: 'low',
      label: t('assessment.strategies.fields.priority.options.low'),
    },
  ]

  const handleAddStrategy = () => {
    const next = [
      ...newStrategies,
      {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        scale: '',
        deadline: '',
        responsibility: '',
        priority: '',
      },
    ]
    onStrategysChange(JSON.stringify(next))
  }

  const handleDeleteStrategy = (id: string) => {
    const next = [...newStrategies].filter((s) => s.id !== id)
    onStrategysChange(JSON.stringify(next))
  }

  const updateStrategy = (id: string, field: keyof Strategy, value: string) => {
    const next = [...newStrategies].map((s) =>
      s.id === id ? { ...s, [field]: value } : s,
    )
    onStrategysChange(JSON.stringify(next))
  }

  return (
    <>
      <div className='!mt-8'>
        <div className='flex items-center gap-3 mb-1'>
          <p className='text-2xl font-bold text-neutral-900'>
            {t('assessment.strategies.heading')}
          </p>
          <Button
            variant='borderless'
            size='small'
            rightIcon={<InfoIcon />}
            label={t('assessment.strategies.actions.about')}
            onClick={() => setShowAboutModal(true)}
          />
        </div>
        <p className='text-neutral-800 mb-2'>
          {t('assessment.strategies.exampleIntro')}
        </p>
        {question.strategyExamples ? (
          <Text className='prose prose-sm max-w-none whitespace-pre-wrap text-neutral-800'>
            {question.strategyExamples}
          </Text>
        ) : (
          <Text className='text-neutral-700 italic'>
            {t('assessment.guidance.empty.exampleStrategies')}
          </Text>
        )}

        <div
          className={clsx('space-y-6', newStrategies.length > 0 ? 'mt-8' : '')}
        >
          {newStrategies.map((strategy, index) => (
            <div
              key={strategy.id}
              className='border border-neutral-300 rounded-lg py-3 px-4 bg-white shadow-sm'
            >
              <div className='flex items-center justify-between mb-4'>
                <p className='text-lg font-bold text-neutral-900'>
                  {t('assessment.strategies.labels.strategyNumber', {
                    number: index + 1,
                  })}
                </p>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='secondary'
                    size='small'
                    label={t('assessment.strategies.actions.delete')}
                    className='!text-error-900 !border-error-300 !bg-error-100 hover:!bg-error-200'
                    leftIcon={<TrashIcon className='w-4 h-4 text-error-900' />}
                    onClick={() => handleDeleteStrategy(strategy.id)}
                  />
                </div>
              </div>

              <div className='mb-5'>
                <TextInput
                  label={t('assessment.strategies.fields.title.label')}
                  value={strategy.title}
                  onChange={(e) =>
                    updateStrategy(strategy.id, 'title', e.target.value)
                  }
                  placeholder={t(
                    'assessment.strategies.fields.title.placeholder',
                  )}
                  maxLength={200}
                  labels={{
                    optionalSuffix: t('common.optional'),
                    requiredSymbolLabel: t('common.required'),
                  }}
                />
                <p className='text-sm text-neutral-500 -mt-1'>
                  {t('assessment.strategies.fields.title.remaining', {
                    remaining: 200 - strategy.title.length,
                  })}
                </p>
              </div>

              <div className='mb-5'>
                <p className='text-neutral-900'>
                  {t('assessment.strategies.fields.description.label')}{' '}
                  <span className='text-neutral-700'>
                    ({t('common.optional')})
                  </span>
                </p>
                <div className='mt-1'>
                  <ChakraRichTextEditor
                    value={strategy.description}
                    onChange={(val: string) =>
                      updateStrategy(strategy.id, 'description', val)
                    }
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-5'>
                <div className='flex flex-col'>
                  <Select
                    label={`${t('assessment.strategies.fields.scale.label')} (${t('common.optional')})`}
                    placeholder={t(
                      'assessment.strategies.fields.scale.placeholder',
                    )}
                    items={scaleOptions}
                    onChange={(vals) =>
                      updateStrategy(strategy.id, 'scale', vals[0] || '')
                    }
                    defaultValue={strategy.scale ? [strategy.scale] : []}
                  />
                </div>
                <div className='flex flex-col mt-1.5'>
                  <p className='text-neutral-900'>
                    {t('assessment.strategies.fields.deadline.label')}{' '}
                    <span className='text-neutral-700'>
                      ({t('common.optional')})
                    </span>
                  </p>
                  <DatePicker
                    defaultValue={strategy.deadline}
                    onChange={(value: string) =>
                      updateStrategy(strategy.id, 'deadline', value)
                    }
                  />
                </div>
                <div>
                  <Responsibility
                    selectedContributorIds={
                      strategy.responsibility
                        ? JSON.parse(strategy.responsibility)
                        : []
                    }
                    allContributors={allContributors}
                    onContributorsChange={(ids) =>
                      updateStrategy(
                        strategy.id,
                        'responsibility',
                        JSON.stringify(ids),
                      )
                    }
                    assessmentId={assessmentId}
                  />
                </div>
                <div className='flex flex-col'>
                  <Select
                    label={`${t('assessment.strategies.fields.priority.label')} (${t('common.optional')})`}
                    placeholder={t(
                      'assessment.strategies.fields.priority.placeholder',
                    )}
                    items={priorityOptions}
                    onChange={(vals) =>
                      updateStrategy(strategy.id, 'priority', vals[0] || '')
                    }
                    defaultValue={strategy.priority ? [strategy.priority] : []}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          className='mt-5'
          size='small'
          variant='secondary'
          leftIcon={<PlusIcon />}
          label={t('assessment.strategies.actions.addStrategy')}
          onClick={handleAddStrategy}
        />
      </div>

      <StrategiesAboutModal
        open={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </>
  )
}

export default Strategies
