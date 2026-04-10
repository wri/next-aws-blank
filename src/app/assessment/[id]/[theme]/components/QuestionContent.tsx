'use client'

import { AnswerOptions } from '@/components/assessment/AnswerOptions'
import { FollowUpQuestions } from '@/components/assessment/FollowUpQuestions'
import { ChakraRichTextEditor } from '@/components/assessment/ChakraRichTextEditor'
import type { PlainQuestion } from './ThemePageLayout'
import { ContributorsCombobox } from '@/components/assessment/ContributorsCombobox'
import AnswerOptionsResponse from '@/components/assessment/AnswerOptionsResponse'
import { hasRichTextContent } from '@/utils/validation'
import Strategies from './Strategies'
import StrategiesReadOnly from './Strategies/ReadOnly'
import { AnswerValue, PlainContributor } from '@/types/answer.types'
import RichText from '@/components/ui/RichText'
import { useTranslations } from '@/i18n/useTranslations'

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
}: QuestionContentProps) {
  const t = useTranslations()
  const isNA = selectedAnswer === AnswerValue.NA

  return (
    <section className='space-y-8'>
      <div>
        {/* Question heading */}
        <h2 className='text-3xl font-extrabold text-slate-900 mb-4 leading-tight'>
          {question.keySuccessFactor}
        </h2>

        {isVisuallyMarkedAsComplete ? (
          <p className='font-bold text-neutral-900 mb-2 mt-10'>
            {t('assessment.content.headers.question')}
          </p>
        ) : null}
        {/* Question body */}
        <p className='text-slate-600 text-base leading-relaxed max-w-3xl'>
          {question.questionText}
        </p>
      </div>

      {isVisuallyMarkedAsComplete ? (
        <div>
          <p className='font-bold text-neutral-900 mb-2'>
            {t('assessment.content.headers.response')}
          </p>
          <AnswerOptionsResponse value={selectedAnswer ?? ''} />
        </div>
      ) : (
        <AnswerOptions value={selectedAnswer} onChange={onAnswerChange} />
      )}

      {/* Rationale editor */}
      {!isVisuallyMarkedAsComplete && (
        <div className='space-y-4 mt-4'>
          <div>
            <h3 className='text-xl font-bold text-slate-900 mb-2'>
              {t('assessment.content.headers.rationale')}
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
            placeholder={t('assessment.content.placeholders.rationale')}
          />
        </div>
      )}

      {/* Contributors - Edit mode */}
      {!isVisuallyMarkedAsComplete && (
        <div className='mt-8'>
          <ContributorsCombobox
            selectedContributorIds={contributors}
            allContributors={allContributors}
            onContributorsChange={onContributorsChange}
            onContributorCreate={onContributorCreate}
          />
        </div>
      )}

      {/* Strategies - Edit mode */}
      {!isNA && !isVisuallyMarkedAsComplete && (
        <Strategies
          question={question}
          strategies={strategies}
          onStrategysChange={onStrategysChange}
          allContributors={allContributors}
          onContributorCreate={onContributorCreate}
        />
      )}

      {isVisuallyMarkedAsComplete && hasRichTextContent(rationale) ? (
        <div>
          <p className='font-bold text-neutral-900 mb-2'>
            {t('assessment.content.headers.rationale')}
          </p>
          <RichText html={rationale} />
        </div>
      ) : null}

      {/* Contributors - View-only mode */}
      {isVisuallyMarkedAsComplete && contributors.length > 0 && (
        <div className='mt-6'>
          <p className='font-bold text-neutral-900 mb-2'>
            {t('assessment.content.headers.contributors')}
          </p>
          <ul className='list-disc list-inside space-y-1'>
            {allContributors
              .filter((c) => contributors.includes(c.id))
              .map((contributor) => (
                <li key={contributor.id} className='text-neutral-800'>
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
