'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
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
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>(
    initialQuestions,
  )

  useEffect(() => {
    const controller = new AbortController()

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/assessments/${assessmentId}/questions?language=${language}`,
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

        const nextQuestions: QuestionWithAnswer[] = (data.questions || []).map(
          (question: QuestionWithAnswer) => ({
            ...question,
            followUpQuestions:
              typeof question.followUpQuestions === 'string'
                ? question.followUpQuestions
                : question.followUpQuestions
                  ? JSON.stringify(question.followUpQuestions)
                  : null,
            answer:
              answersByQuestionId.get(question.id) || {
                ...EMPTY_ANSWER,
                questionId: question.id,
              },
          }),
        )

        setQuestions(nextQuestions)
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        console.error('Failed to refresh questions:', error)
      }
    }

    fetchQuestions()

    return () => controller.abort()
  }, [assessmentId, language])

  return (
    <>
      <KeySuccessFactors assessmentId={assessmentId} questions={questions} />
      <StrategicPlan
        assessmentId={assessmentId}
        questions={questions}
        allContributors={allContributors}
      />
    </>
  )
}

export default OverviewQuestions
