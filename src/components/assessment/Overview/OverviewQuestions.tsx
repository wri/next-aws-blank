'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { applyQuestionTranslations } from '@/i18n/question-translations'
import KeySuccessFactors from './KeySuccessFactors'
import StrategicPlan from './StrategicPlan'
import type { QuestionWithAnswer } from '@/types/questions.types'
import type { PlainContributor } from '@/types/answer.types'

interface OverviewQuestionsProps {
  assessmentId: string
  initialQuestions: QuestionWithAnswer[]
  allContributors: PlainContributor[]
}

const EMPTY_ANSWER = {
  assessmentId: '',
  createdAt: new Date(),
  id: '',
  notes: null,
  questionId: '',
  rationale: '',
  updatedAt: new Date(),
  value: '',
  status: '',
  strategies: '',
}

const OverviewQuestions = ({
  assessmentId,
  initialQuestions,
  allContributors,
}: OverviewQuestionsProps) => {
  const { language } = useLanguage()
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>(initialQuestions)
  const localizedQuestions = useMemo(
    () => applyQuestionTranslations(questions, language),
    [questions, language],
  )

  useEffect(() => {
    const controller = new AbortController()

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/assessments/${assessmentId}/questions`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Failed to fetch localized questions')
        }

        const data = await response.json()
        const answersByQuestionId = new Map<string, QuestionWithAnswer['answer']>()

        ;(data.answers || []).forEach((answer: QuestionWithAnswer['answer']) => {
          answersByQuestionId.set(answer.questionId, answer)
        })

        setQuestions((prev) =>
          prev.map((q) => ({
            ...q,
            answer:
              answersByQuestionId.get(q.id) ||
              q.answer || {
                ...EMPTY_ANSWER,
                questionId: q.id,
              },
          })),
        )
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        console.error('Failed to refresh questions:', error)
      }
    }

    fetchQuestions()

    return () => controller.abort()
  }, [assessmentId])

  return (
    <>
      <KeySuccessFactors assessmentId={assessmentId} questions={localizedQuestions} />
      <StrategicPlan
        assessmentId={assessmentId}
        questions={localizedQuestions}
        allContributors={allContributors}
      />
    </>
  )
}

export default OverviewQuestions
