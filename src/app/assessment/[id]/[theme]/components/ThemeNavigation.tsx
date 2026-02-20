'use client'

import { getThemedColor, Panel, IconButton, Tooltip, ProgressBar } from '@worldresources/wri-design-systems'
import { 
  ChevronLeftIcon as ChevronLeft, 
  ChevronRightIcon as ChevronRight,
  YesAnswerIcon,
  PartlyAnswerIcon,
  NoAnswerIcon,
  LeadThemeIcon
} from '@/components/icons'
import type { AnswerValue } from '@/db/entities/Answer.entity'
import type { PlainQuestion, PlainAnswer } from './ThemePageLayout'
import { Box } from '@chakra-ui/react'

interface ThemeNavigationProps {
  theme: 'Motivate' | 'Enable' | 'Implement'
  questions: PlainQuestion[]
  answers: Map<string, PlainAnswer>
  currentQuestionCode: string
  onQuestionSelect: (code: string) => void
  onThemeChange: (direction: 'prev' | 'next') => void
  canGoPrev: boolean
  canGoNext: boolean
}

// Helper to group questions by enabling condition
function groupByEnablingCondition(questions: PlainQuestion[]) {
  const grouped: Record<string, PlainQuestion[]> = {}
  questions.forEach(q => {
    const condition = q.enablingCondition || 'Other'
    if (!grouped[condition]) {
      grouped[condition] = []
    }
    grouped[condition].push(q)
  })
  return grouped
}

// Helper to get status counts
function calculateStatusCounts(questions: PlainQuestion[], answers: Map<string, PlainAnswer>) {
  const counts = { yes: 0, partly: 0, no: 0, na: 0 }
  questions.forEach(q => {
    const answer = answers.get(q.id)
    if (answer?.value) {
      counts[answer.value]++
    }
  })
  return counts
}

// Theme icon component
function ThemeIcon() {
  return <LeadThemeIcon className="w-4 h-4 text-slate-600" />
}

// Answer status badge
function AnswerStatusBadge({ answer }: { answer?: PlainAnswer }) {
  if (!answer?.value) {
    return <span className="text-[11px] mt-1 block text-slate-400">Not answered</span>
  }
  
  const config: Record<AnswerValue, { label: string; icon: React.ReactNode }> = {
    yes: { 
      label: 'Yes', 
      icon: <YesAnswerIcon css={{ color: getThemedColor('success', 400) }} className="w-3 h-3" /> },
    partly: { 
      label: 'Partly', 
      icon: <PartlyAnswerIcon css={{ color: getThemedColor('warning', 400) }} className="w-3 h-3" /> },
    no: { 
      label: 'No', 
      icon: <NoAnswerIcon css={{ color: getThemedColor('error', 400) }} className="w-3 h-3" /> 
    },
    na: { 
      label: 'N/A', 
      icon: <Box className="w-3 h-3 rounded-full border" css={{ borderColor:  getThemedColor('neutral', 300) || '#3D3B3B' }} /> 
    }
  }
  
  const status = config[answer.value]
  
  return (
    <span className="text-[12px] flex items-center gap-1 text-neutral-700 mt-1">
      <span>{status.icon}</span>
      {status.label}
    </span>
  )
}

export function ThemeNavigation({
  theme,
  questions,
  answers,
  currentQuestionCode,
  onQuestionSelect,
  onThemeChange,
  canGoPrev,
  canGoNext
}: ThemeNavigationProps) {
  // Group questions by enabling condition
  const groupedQuestions = groupByEnablingCondition(questions)
  
  // Calculate progress
  const answeredCount = questions.filter(q => answers.has(q.id)).length
  const totalCount = questions.length
  
  // Calculate status counts
  const statusCounts = calculateStatusCounts(questions, answers)
  
  const headerContent = (
    <div className="bg-white">
      {/* Theme title and navigation */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2 font-bold capitalize text-sm text-grey-500">
          <ThemeIcon />
          <span className='text-lg'>{theme}</span>
        </div>
        <Box className="flex gap-1">
          <Tooltip content="Previous theme">
            <IconButton
              color="primary"
              as="span"
              disabled={!canGoPrev}
              onClick={() => onThemeChange('prev')} 
              icon={<ChevronLeft />}
            />
          </Tooltip>
          <Tooltip content="Next theme">
            <IconButton
              color="primary"
              as="span"
              disabled={!canGoNext}
              onClick={() => onThemeChange('next')}
              icon={<ChevronRight />}
            />
          </Tooltip>
        </Box>
      </div>
      
      {/* Progress bar */}
      <div className="flex items-center p-2 border-b">
        <div className="text-xs text-grey-500 pr-1">{answeredCount}/{totalCount}</div>
        <Box className="w-full rounded-full ml-[5px]" css={{
          '& div[role="progressbar"]': {
            borderRadius: 'full'
          }
        }}>
          <ProgressBar progress={totalCount > 0 ? (answeredCount / totalCount) * 100 : 0} />
        </Box>
      </div>
      
      {/* Status counts */}
      <div className="flex items-center gap-3 text-xs p-2">
        <span className="text-grey-200">Responses:</span>
        <span className="flex items-center gap-1 text-slate-700">
          <YesAnswerIcon className="w-4 h-4" style={{ color: '#009E77' }} /> {statusCounts.yes}
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <PartlyAnswerIcon className="w-4 h-4" style={{ color: '#A88100' }} /> {statusCounts.partly}
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <NoAnswerIcon className="w-4 h-4" style={{ color: '#C11101' }} /> {statusCounts.no}
        </span>
      </div>
    </div>
  )
  
  const contentBlock = (
    <div>
      {Object.entries(groupedQuestions).map(([enablingCondition, conditionQuestions]) => (
        <div key={enablingCondition} className="enabling-condition-list">
          <h3 className="text-[11px] p-2 text-grey-600 capitalize tracking-widest">
            {enablingCondition}
          </h3>
          <ul className="border-b">
            {conditionQuestions.map((question) => {
              const answer = answers.get(question.id)
              const isSelected = question.questionCode === currentQuestionCode
              
              return (
                <li
                  key={question.id}
                  onClick={() => onQuestionSelect(question.questionCode)}
                  className={`px-2 py-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50 shadow-sm' 
                      : 'hover:bg-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 py-0.5 px-2 rounded mt-0.5">
                      {question.questionCode}
                    </span>
                    <div>
                      <p className={`text-sm leading-tight ${
                        isSelected ? 'font-semibold text-slate-800' : 'font-medium text-grey-500'
                      }`}>
                        {question.minimalKeySuccessFactor}
                      </p>
                      <AnswerStatusBadge answer={answer} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
  
  return (
    <Box 
      pl="8" 
      pt="8" 
      pr="8"
      pb="8"
      css={{
        '& > div': {
          width: '240px',
          position: 'sticky',
          top: '60px',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          borderRight: '1px solid #e2e8f0',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          borderRadius: '0.25rem',
          marginBottom: '4rem'
        }
      }}
    >
      <Panel
        header={headerContent} 
        content={contentBlock}
      />
    </Box>
  )
}
