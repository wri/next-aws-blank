'use client'

import { useState } from 'react'
import { Collapsible } from '@/components/assessment/Collapsible'
import { ChakraRichTextEditor } from '@/components/assessment/ChakraRichTextEditor'
import { GuidanceTabIcon, NotesTabIcon } from '@/components/icons'
import type { PlainQuestion } from './ThemePageLayout'
import { TabBar } from '@worldresources/wri-design-systems'
import { Text } from '@chakra-ui/react'
import { useTranslations } from '@/i18n/useTranslations'

interface GuidanceSidebarProps {
  question: PlainQuestion
  notes: string
  onNotesChange: (notes: string) => void
}

type TabType = 'guidance' | 'notes'

export function GuidanceSidebar({
  question,
  notes,
  onNotesChange,
}: GuidanceSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('guidance')
  const t = useTranslations()

  return (
    <aside className='bg-white w-[320px] flex-shrink-0 border-l border-slate-200 flex flex-col'>
      {/* Tab Navigation */}
      <TabBar
        defaultValue='guidance'
        tabs={[
          {
            label: t('assessment.guidance.tabs.guidance'),
            value: 'guidance',
            icon: <GuidanceTabIcon className='w-4 h-4' />,
          },
          {
            label: t('assessment.guidance.tabs.notes'),
            value: 'notes',
            icon: <NotesTabIcon className='w-4 h-4' />,
          },
        ]}
        onTabClick={(tab: string) => setActiveTab(tab as TabType)}
        variant='panel'
      />

      {/* Tab Content */}
      {activeTab === 'guidance' ? (
        <div className='collapsibles-container pb-16'>
          <Collapsible
            title={t('assessment.guidance.sections.definition')}
            defaultOpen
          >
            {question.definition ? (
              <Text className='prose prose-sm max-w-none whitespace-pre-line'>
                {question.definition}
              </Text>
            ) : (
              <Text className='text-slate-400 italic'>
                {t('assessment.guidance.empty.definition')}
              </Text>
            )}
          </Collapsible>

          <Collapsible title={t('assessment.guidance.sections.considerations')}>
            {question.considerations ? (
              <ul className='prose prose-sm max-w-none list-disc pl-5 space-y-2'>
                {question.considerations
                  .split(/\r?\n/)
                  .filter((line) => line.trim() !== '')
                  .map((line, index) => (
                    <li key={index}>{line.trim()}</li>
                  ))}
              </ul>
            ) : (
              <Text className='text-slate-400 italic'>
                {t('assessment.guidance.empty.considerations')}
              </Text>
            )}
          </Collapsible>
        </div>
      ) : (
        <div className='flex flex-col flex-1 overflow-hidden'>
          <ChakraRichTextEditor
            value={notes}
            onChange={onNotesChange}
            placeholder={t('assessment.content.placeholders.notes')}
            borderless
          />
        </div>
      )}
    </aside>
  )
}
