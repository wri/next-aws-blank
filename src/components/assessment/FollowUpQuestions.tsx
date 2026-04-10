'use client'

import { AnswerValue } from '@/types/answer.types'
import { useTranslations } from '@/i18n/useTranslations'

interface FollowUpQuestionsProps {
  followUpQuestions: { 'if yes'?: string[]; 'if no'?: string[] } | null
  selectedAnswer: AnswerValue | null
}

export function FollowUpQuestions({
  followUpQuestions = { 'if yes': [], 'if no': [] },
  selectedAnswer,
}: FollowUpQuestionsProps) {
  const t = useTranslations()
  if (!selectedAnswer) {
    return null
  }

  // Parse follow-up questions
  let questions: string[] = []

  // Show based on answer value
  if (selectedAnswer === AnswerValue.YES) {
    questions = followUpQuestions?.['if yes'] || []
  } else if (selectedAnswer === AnswerValue.NO) {
    questions = followUpQuestions?.['if no'] || []
  } else if (selectedAnswer === AnswerValue.PARTLY) {
    // Show ALL questions for partly
    questions = [
      ...(followUpQuestions?.['if yes'] || []),
      ...(followUpQuestions?.['if no'] || []),
    ]
  } else if (selectedAnswer === AnswerValue.NA) {
    questions = [
      t('assessment.content.naFollowUp.whyNotApplicable'),
      t('assessment.content.naFollowUp.notes'),
      t('assessment.content.naFollowUp.links'),
    ]
  }

  if (questions.length === 0) {
    return null
  }

  return (
    <div className='space-y-2'>
      <p className='text-sm text-slate-600'>
        {t('assessment.content.subheadings.topicsToInclude')}
      </p>
      <ul className='list-disc pl-5 space-y-1 text-sm text-slate-600'>
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
      {/* Out of scope: <div>
        <Button 
          variant="secondary"
          size="small"
          leftIcon={<PlusIcon />}
          style={{ borderRadius: '8px' }}>
          add custom topic
        </Button>
      </div> */}
    </div>
  )
}
