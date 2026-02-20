'use client'

import { SubNavbar } from './SubNavbar'
import { QuestionView } from './QuestionView'
import type { AnswerValue } from '@/db/entities/Answer.entity'
import type { Theme } from '@/db/entities/Question.entity'

// Plain object interfaces for data passed from server
export interface PlainQuestion {
  id: string
  questionCode: string
  theme: Theme
  enablingCondition: string
  keySuccessFactor: string
  minimalKeySuccessFactor: string
  definition: string | null
  questionText: string
  considerations: string | null
  followUpQuestions: { 'if yes'?: string[]; 'if no'?: string[] } | null
  strategyExamples: string | null
  sortOrder: number
  diagnosticId: string
  createdAt: Date
}

export interface PlainAnswer {
  id: string
  value: AnswerValue | null
  rationale: string | null
  notes: string | null
  assessmentId: string
  questionId: string
  createdAt: Date
  updatedAt: Date
}

interface ThemePageLayoutProps {
  assessmentId: string
  theme: 'Motivate' | 'Enable' | 'Implement'
  pathname: string
  language: string
  questions: PlainQuestion[]
  initialAnswers: Array<[string, PlainAnswer]>
  focusQuestionCode: string
  canGoPrev: boolean
  canGoNext: boolean
  prevTheme: string | null
  nextTheme: string | null
}

export function ThemePageLayout({
  assessmentId,
  theme,
  questions,
  initialAnswers,
  focusQuestionCode,
  canGoPrev,
  canGoNext,
  prevTheme,
  nextTheme,
}: ThemePageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background-light gradient-bg">
      
      {/* Sub-navbar - Custom */}
      <header className="border-b border-slate-200 sticky top-0 bg-white z-40">
        <SubNavbar />
      </header>
      
      {/* Main content with gradient background */}
      <div className="flex mx-auto w-full relative flex-1">
        <QuestionView
          assessmentId={assessmentId}
          theme={theme}
          questions={questions}
          initialAnswers={initialAnswers}
          focusQuestionCode={focusQuestionCode}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          prevTheme={prevTheme}
          nextTheme={nextTheme}
        />
      </div>
      
      
    </div>
  )
}
