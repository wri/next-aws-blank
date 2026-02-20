'use client'

import { AnswerOptions } from '@/components/assessment/AnswerOptions'
import { FollowUpQuestions } from '@/components/assessment/FollowUpQuestions'
import { ChakraRichTextEditor } from '@/components/assessment/ChakraRichTextEditor'
import type { AnswerValue } from '@/db/entities/Answer.entity'
import type { PlainQuestion } from './ThemePageLayout'

interface QuestionContentProps {
  question: PlainQuestion
  selectedAnswer: AnswerValue | null
  rationale: string
  onAnswerChange: (value: AnswerValue) => void
  onRationaleChange: (value: string) => void
  onSaveAndContinue: () => void // TODO: deprecated, wait for RD-29 implementation to keep/remove
}

export function QuestionContent({
  question,
  selectedAnswer,
  rationale,
  onAnswerChange,
  onRationaleChange,
}: QuestionContentProps) {
  const hideRationale = selectedAnswer === 'na'
  
  return (
    <section className="space-y-8">
      <div>
        {/* Question heading */}
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
          {question.keySuccessFactor}
        </h2>
        {/* Question body */}
        <p className="text-slate-600 text-base leading-relaxed max-w-3xl">
          {question.questionText}
        </p>
      </div>
      
      {/* Answer options */}
      <AnswerOptions
        value={selectedAnswer}
        onChange={onAnswerChange}
      />
      
      {/* Rationale editor - hidden for N/A */}
      {!hideRationale && (
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Rationale
            </h3>
            <p className="text-sm text-slate-600">
              Topics to include
            </p>
          </div>
                
          {/* Follow-up questions */}
          <FollowUpQuestions
            followUpQuestions={question.followUpQuestions}
            selectedAnswer={selectedAnswer}
          />

          <ChakraRichTextEditor
            value={rationale}
            onChange={onRationaleChange}
            placeholder="Add your rationale..."
          />
        </div>
      )}
    </section>
  )
}
