import { Theme } from '@/db/entities'

export interface Answer {
  assessmentId: string
  createdAt: Date
  id: string
  notes: string | null
  questionId: string
  rationale: string
  updatedAt: Date
  value: string
  status: string
  strategies: string
}

export interface QuestionWithAnswer {
  id: string
  questionCode: string
  theme: Theme
  enablingCondition: string
  keySuccessFactor: string
  definition: string | null
  questionText: string
  considerations: string | null
  followUpQuestions: string | null
  strategyExamples: string | null
  sortOrder: number
  createdAt: Date
  diagnosticId: string
  answer: Answer
}

export type Questions = QuestionWithAnswer
