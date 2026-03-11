'use client'

import { AnswerOptions } from '@/components/assessment/AnswerOptions'
import { FollowUpQuestions } from '@/components/assessment/FollowUpQuestions'
import { ChakraRichTextEditor } from '@/components/assessment/ChakraRichTextEditor'
import type { AnswerValue } from '@/db/entities/Answer.entity'
import type { PlainQuestion } from './ThemePageLayout'
import { ContributorsCombobox } from '@/components/assessment/ContributorsCombobox'
import AnswerOptionsResponse from '@/components/assessment/AnswerOptionsResponse'
import { hasRichTextContent } from '@/utils/validation'
import Strategies from './Strategies'
import StrategiesReadOnly from './Strategies/ReadOnly'
import { PlainContributor } from '@/types/answer.types'

interface QuestionContentProps {
  question: PlainQuestion
  selectedAnswer: AnswerValue | null
  rationale: string
  strategies: string
  onAnswerChange: (value: AnswerValue) => void
  onRationaleChange: (value: string) => void
  onStrategysChange: (value: string) => void
  isVisuallyMarkedAsComplete: boolean
  contributors: string[]
  allContributors: PlainContributor[]
  onContributorsChange: (contributorIds: string[]) => void
  onContributorCreate: (name: string) => Promise<PlainContributor>
  assessmentId: string
}

export function QuestionContent({
  question,
  selectedAnswer,
  rationale,
  strategies,
  onAnswerChange,
  onRationaleChange,
  onStrategysChange,
  isVisuallyMarkedAsComplete,
  contributors,
  allContributors,
  onContributorsChange,
  onContributorCreate,
  assessmentId,
}: QuestionContentProps) {
  const hideRationale = selectedAnswer === 'na'
  
  return (
    <section className="space-y-8">
      <div>
        {/* Question heading */}
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
          {question.keySuccessFactor}
        </h2>

        {isVisuallyMarkedAsComplete ? (
          <p className="font-bold text-neutral-900 mb-2 mt-10">
            Question
          </p>
        ) : null}
        {/* Question body */}
        <p className="text-slate-600 text-base leading-relaxed max-w-3xl">
          {question.questionText}
        </p>
      </div>

      {isVisuallyMarkedAsComplete ? (
        <div>
          <p className="font-bold text-neutral-900 mb-2">
            Response
          </p>
          <AnswerOptionsResponse value={selectedAnswer ?? ''} />
        </div>
      ) : (
        <AnswerOptions
          value={selectedAnswer}
          onChange={onAnswerChange}
        />
      )}
      
      {/* Rationale editor - hidden for N/A */}
      {!hideRationale && !isVisuallyMarkedAsComplete && (
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Rationale
            </h3>
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
      
      {/* Contributors - Edit mode */}
      {!hideRationale && !isVisuallyMarkedAsComplete && (
        <div className="mt-8">
          <ContributorsCombobox
            selectedContributorIds={contributors}
            allContributors={allContributors}
            onContributorsChange={onContributorsChange}
            onContributorCreate={onContributorCreate}
          />
        </div>
      )}
      
      {/* Strategies - Edit mode */}
      {!hideRationale && !isVisuallyMarkedAsComplete && (
        <Strategies
          question={question}
          strategies={strategies}
          onStrategysChange={onStrategysChange}
          allContributors={allContributors}
          assessmentId={assessmentId}
        />
      )}

      {isVisuallyMarkedAsComplete && hasRichTextContent(rationale) ? (
        <div>
          <p className='font-bold text-neutral-900 mb-2'>Rationale</p>
          <div
            className="[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-neutral-800 [&_h1]:mb-1 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-800 [&_h2]:mb-1 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-neutral-800 [&_h3]:mb-1 [&_p]:text-neutral-800 [&_p]:mb-2"
            dangerouslySetInnerHTML={{ __html: rationale }}
          />
        </div>
      ) : null}
      
      {/* Contributors - View-only mode */}
      {isVisuallyMarkedAsComplete && contributors.length > 0 && (
        <div className="mt-6">
          <p className="font-bold text-neutral-900 mb-2">Contributors</p>
          <ul className="list-disc list-inside space-y-1">
            {allContributors
              .filter(c => contributors.includes(c.id))
              .map(contributor => (
                <li key={contributor.id} className="text-neutral-800">
                  {contributor.name}
                </li>
              ))}
          </ul>
        </div>
      )}

      {isVisuallyMarkedAsComplete &&
        strategies &&
        JSON.parse(strategies).length > 0 && (
          <StrategiesReadOnly
            strategies={strategies}
            keySuccessFactor={question.keySuccessFactor}
            allContributors={allContributors}
          />
        )}
    </section>
  )
}
