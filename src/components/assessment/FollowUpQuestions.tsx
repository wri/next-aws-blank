'use client'

import type { AnswerValue } from '@/db/entities/Answer.entity'
import { Button } from '@worldresources/wri-design-systems';
import { PlusIcon } from '../icons';

interface FollowUpQuestionsProps {
  followUpQuestions: { 'if yes'?: string[]; 'if no'?: string[] } | null
  selectedAnswer: AnswerValue | null
}

export function FollowUpQuestions({ followUpQuestions, selectedAnswer }: FollowUpQuestionsProps) {
  // Don't show for N/A or no answer
  if (!selectedAnswer || selectedAnswer === 'na' || !followUpQuestions) {
    return null
  }
  
  // Parse follow-up questions
  let questions: string[] = []
  
  // Show based on answer value
  if (selectedAnswer === 'yes') {
    questions = followUpQuestions['if yes'] || []
  } else if (selectedAnswer === 'no') {
    questions = followUpQuestions['if no'] || []
  } else if (selectedAnswer === 'partly') {
    // Show ALL questions for partly
    questions = [...(followUpQuestions['if yes'] || []), ...(followUpQuestions['if no'] || [])]
  }
  
  if (questions.length === 0) {
    return null
  }
  
  return (
    <div className="space-y-2">
      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
      <div>
        <Button 
          variant="secondary"
          leftIcon={<PlusIcon />}
          style={{ borderRadius: '8px' }}>
          add custom topic
        </Button>
      </div>
    </div>
  )
}
