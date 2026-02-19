'use client'

import { Button } from '@worldresources/wri-design-systems'
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
  onSaveAndContinue: () => void
}

export function QuestionContent({
  question,
  selectedAnswer,
  rationale,
  onAnswerChange,
  onRationaleChange,
  onSaveAndContinue
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
      
      {/* Follow-up questions */}
      <FollowUpQuestions
        followUpQuestions={question.followUpQuestions}
        selectedAnswer={selectedAnswer}
      />
      
      {/* Rationale editor - hidden for N/A */}
      {!hideRationale && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Rationale and adaptation
            </h3>
            <p className="text-sm text-slate-600">
              Provide your rationale and supporting documents below. If you have modified the questions above, please explain how they were adapted for your specific goals or region.
            </p>
          </div>
          <ChakraRichTextEditor
            value={rationale}
            onChange={onRationaleChange}
            placeholder="Add your rationale..."
            minHeight="200px"
          />
        </div>
      )}
      
      {/* Save and continue button */}
      <div className="pt-10">
        <Button
          variant="primary"
          onClick={onSaveAndContinue}
        >
          Save and continue
        </Button>
      </div>
    </section>
  )
}
