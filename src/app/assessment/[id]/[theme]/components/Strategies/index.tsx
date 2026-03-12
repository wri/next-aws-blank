import { InfoIcon, PlusIcon, TrashIcon } from '@/components/icons'
import { Button, TextInput, Select } from '@worldresources/wri-design-systems'
import { useState } from 'react'
import { PlainQuestion } from '../ThemePageLayout'
import { Text } from '@chakra-ui/react'
import { ChakraRichTextEditor } from '@/components/assessment/ChakraRichTextEditor'
import DatePicker from '@/components/ui/DatePicker'
import clsx from 'clsx'
import { PRIORITY_OPTIONS, SCALE_OPTIONS } from '@/constants'
import StrategiesAboutModal from './AboutModal'
import { PlainContributor, Strategy } from '@/types/answer.types'
import { Responsibility } from './Responsibility'

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
  const [showAboutModal, setShowAboutModal] = useState(false)
  const newStrategies: Strategy[] = strategies ? JSON.parse(strategies) : []

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
          <p className='text-2xl font-bold text-neutral-900'>Strategies</p>
          <Button
            variant='borderless'
            size='small'
            rightIcon={<InfoIcon />}
            label='About'
            onClick={() => setShowAboutModal(true)}
          />
        </div>
        <p className='text-neutral-800 mb-2'>
          Examples of strategies for this factor:
        </p>
        {question.strategyExamples ? (
          <Text className='prose prose-sm max-w-none whitespace-pre-wrap text-neutral-800'>
            {question.strategyExamples}
          </Text>
        ) : (
          <Text className='text-neutral-700 italic'>
            No example strategies available.
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
                  Strategy {index + 1}
                </p>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='secondary'
                    size='small'
                    label='Delete'
                    className='!text-error-900 !border-error-300 !bg-error-100 hover:!bg-error-200'
                    leftIcon={<TrashIcon className='w-4 h-4 text-error-900' />}
                    onClick={() => handleDeleteStrategy(strategy.id)}
                  />
                </div>
              </div>

              <div className='mb-5'>
                <TextInput
                  label='Title'
                  value={strategy.title}
                  onChange={(e) =>
                    updateStrategy(strategy.id, 'title', e.target.value)
                  }
                  placeholder='Strategy title'
                  maxLength={200}
                />
                <p className='text-sm text-neutral-500 -mt-1'>
                  You have {200 - strategy.title.length} characters remaining
                </p>
              </div>

              <div className='mb-5'>
                <p className='text-neutral-900'>
                  Description{' '}
                  <span className='text-neutral-700 text-sm'>(optional)</span>
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
                    label='Scale (optional)'
                    placeholder='Select scale'
                    items={SCALE_OPTIONS}
                    onChange={(vals) =>
                      updateStrategy(strategy.id, 'scale', vals[0] || '')
                    }
                    defaultValue={strategy.scale ? [strategy.scale] : []}
                  />
                </div>
                <div className='flex flex-col mt-1.5'>
                  <p className='text-neutral-900'>
                    Deadline{' '}
                    <span className='text-neutral-700 text-sm'>(optional)</span>
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
                    label='Priority (optional)'
                    placeholder='Select priority'
                    items={PRIORITY_OPTIONS}
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
          label='Add strategy'
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
