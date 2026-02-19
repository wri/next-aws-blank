'use client'

import { useState } from 'react'
import { Collapsible } from '@/components/assessment/Collapsible'
import { ChakraRichTextEditor } from '@/components/assessment/ChakraRichTextEditor'
import { GuidanceTabIcon, NotesTabIcon } from '@/components/icons'
import type { PlainQuestion } from './ThemePageLayout'
import { TabBar } from '@worldresources/wri-design-systems'
import { Text } from '@chakra-ui/react'

interface GuidanceSidebarProps {
  question: PlainQuestion
  notes: string
  onNotesChange: (notes: string) => void
}

type TabType = 'guidance' | 'notes'

export function GuidanceSidebar({ question, notes, onNotesChange }: GuidanceSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('guidance')
  
  return (
    <aside className="bg-white w-[240px] flex-shrink-0 border-l border-slate-200 sticky top-[47px] h-[calc(100vh-47px)] overflow-y-auto">
      {/* Tab Navigation */}
      <TabBar
        defaultValue='guidance'
        tabs={[
          {
            label: 'Guidance',
            value: 'guidance',
            icon: <GuidanceTabIcon className="w-4 h-4" /> 
          },
          {
            label: 'Notes',
            value: 'notes',
            icon: <NotesTabIcon className="w-4 h-4" /> 
          }
        ]}
        onTabClick={(tab: string) => setActiveTab(tab as TabType)}
        variant="panel"
      />

      {/* Tab Content */}
      {activeTab === 'guidance' ? (
        <div className="collapsibles-container">
          <Collapsible title="Definition" defaultOpen>
            {question.definition ? (
              <Text className="prose prose-sm max-w-none">{question.definition}</Text>
            ) : (
              <Text className="text-slate-400 italic">No definition available.</Text>
            )}
          </Collapsible>
          
          <Collapsible title="Considerations">
            {question.considerations ? (
              <Text className="prose prose-sm max-w-none">{question.considerations}</Text>
            ) : (
              <Text className="text-slate-400 italic">No considerations available.</Text>
            )}
          </Collapsible>
          
          <Collapsible title="Example Strategies">
            {question.strategyExamples ? (
              <Text className="prose prose-sm max-w-none">{question.strategyExamples}</Text>
            ) : (
              <Text className="text-slate-400 italic">No example strategies available.</Text>
            )}
          </Collapsible>
        </div>
      ) : (
        <div className="p-4">
          <p className="text-sm text-slate-600 mb-3">
            Add any notes or observations about this question for your team.
          </p>
          <ChakraRichTextEditor
            value={notes}
            onChange={onNotesChange}
            placeholder="Add notes about this question..."
            minHeight="300px"
          />
        </div>
      )}
    </aside>
  )
}
