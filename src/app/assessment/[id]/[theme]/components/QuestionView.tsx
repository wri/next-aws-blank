'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeNavigation } from './ThemeNavigation'
import { QuestionContent } from './QuestionContent'
import { GuidanceSidebar } from './GuidanceSidebar'
import { useAutoSave } from '@/hooks/useAutoSave'
import { CheckIcon, ChevronLeftIcon as ChevronLeft } from '@/components/icons'
import type { AnswerValue } from '@/db/entities/Answer.entity'
import type { PlainQuestion, PlainAnswer } from './ThemePageLayout'
import { Button, InlineMessage, Tag } from '@worldresources/wri-design-systems'
import { Box } from '@chakra-ui/react'

interface QuestionViewProps {
  assessmentId: string
  theme: 'Motivate' | 'Enable' | 'Implement'
  questions: PlainQuestion[]
  initialAnswers: Array<[string, PlainAnswer]>
  focusQuestionCode: string
  canGoPrev: boolean
  canGoNext: boolean
  prevTheme: string | null
  nextTheme: string | null
}

export function QuestionView({
  assessmentId,
  theme,
  questions,
  initialAnswers,
  focusQuestionCode,
  canGoPrev,
  canGoNext,
  prevTheme,
  nextTheme
}: QuestionViewProps) {
  const router = useRouter()
  
  // Reconstruct Map from serialized array (Maps cannot be passed from Server to Client Components)
  const [answersCache, setAnswersCache] = useState(() => 
    new Map<string, PlainAnswer>(initialAnswers)
  )
  
  // Current question state
  const [currentQuestionCode, setCurrentQuestionCode] = useState(focusQuestionCode)
  const currentQuestion = questions.find(q => q.questionCode === currentQuestionCode) || questions[0]
  const currentAnswer = answersCache.get(currentQuestion?.id || '')
  
  // Answer state
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerValue | null>(
    currentAnswer?.value || null
  )
  const [rationale, setRationale] = useState(currentAnswer?.rationale || '')
  const [notes, setNotes] = useState(currentAnswer?.notes || '')
  
  // Auto-save function
  const saveAnswer = useCallback(async (data: {
    questionId: string
    value: AnswerValue | null
    rationale?: string
    notes?: string
  }) => {
    const response = await fetch(`/api/assessments/${assessmentId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to save answer')
    }
    
    const result = await response.json()
    
    // Update local cache
    setAnswersCache(prev => {
      const updated = new Map(prev)
      updated.set(data.questionId, result.answer)
      return updated
    })
    
    return result
  }, [assessmentId])
  
  // Auto-save hook
  const { save } = useAutoSave({
    onSave: saveAnswer,
    debounceMs: 1000
  })
  
  // Handle answer selection (immediate save)
  const handleAnswerChange = useCallback((value: AnswerValue) => {
    setSelectedAnswer(value)
    save({
      questionId: currentQuestion.id,
      value,
      rationale,
      notes
    }, true) // Immediate save for answer selection
  }, [currentQuestion?.id, rationale, notes, save])
  
  // Handle rationale change (debounced save)
  const handleRationaleChange = useCallback((value: string) => {
    setRationale(value)
    save({
      questionId: currentQuestion.id,
      value: selectedAnswer,
      rationale: value,
      notes
    }, false) // Debounced save for text input
  }, [currentQuestion?.id, selectedAnswer, notes, save])
  
  // Handle notes change (debounced save)
  const handleNotesChange = useCallback((value: string) => {
    setNotes(value)
    save({
      questionId: currentQuestion.id,
      value: selectedAnswer,
      rationale,
      notes: value
    }, false) // Debounced save for text input
  }, [currentQuestion?.id, selectedAnswer, rationale, save])
  
  // Handle question selection
  const handleQuestionSelect = useCallback((code: string) => {
    const question = questions.find(q => q.questionCode === code)
    if (question) {
      setCurrentQuestionCode(code)
      const answer = answersCache.get(question.id)
      setSelectedAnswer(answer?.value || null)
      setRationale(answer?.rationale || '')
      setNotes(answer?.notes || '')
    }
  }, [questions, answersCache])
  
  // Handle theme navigation
  const handleThemeChange = useCallback((direction: 'prev' | 'next') => {
    const targetTheme = direction === 'prev' ? prevTheme : nextTheme
    if (targetTheme) {
      router.push(`/assessment/${assessmentId}/${targetTheme}`)
    }
  }, [assessmentId, prevTheme, nextTheme, router])
  
  // Handle "Save and continue"
  const handleSaveAndContinue = useCallback(async () => {
    // Save current answer
    await save({
      questionId: currentQuestion.id,
      value: selectedAnswer,
      rationale,
      notes
    }, true)
    
    // Find next unanswered question in theme
    const currentIndex = questions.findIndex(q => q.questionCode === currentQuestionCode)
    const nextQuestion = questions.slice(currentIndex + 1).find(q => !answersCache.has(q.id))
    
    if (nextQuestion) {
      handleQuestionSelect(nextQuestion.questionCode)
    } else if (canGoNext && nextTheme) {
      // Move to next theme
      router.push(`/assessment/${assessmentId}/${nextTheme}`)
    } else {
      // All done - go to overview
      router.push(`/assessment/${assessmentId}/overview`)
    }
  }, [
    currentQuestion?.id, selectedAnswer, rationale, notes, save,
    questions, currentQuestionCode, answersCache, canGoNext, nextTheme,
    assessmentId, router, handleQuestionSelect
  ])
  
  if (!currentQuestion) {
    return <div className="p-8 text-center text-slate-500">No questions found for this theme.</div>
  }

  const markAsCompleteHandler = () => console.log('Not implemented', void 0);
  
  // Calculate current question position within theme for Tag display
  const currentIndex = questions.findIndex(q => q.questionCode === currentQuestionCode)
  const questionPosition = currentIndex + 1
  const totalQuestions = questions.length
  
  return (
    <>
      {/* Left Sidebar - Theme Navigation */}
      <ThemeNavigation
        theme={theme}
        questions={questions}
        answers={answersCache}
        currentQuestionCode={currentQuestionCode}
        onQuestionSelect={handleQuestionSelect}
        onThemeChange={handleThemeChange}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 bg-transparent">
        <div className="max-w-4xl mx-auto pr-8 py-8">
          {/* Auto-save indicator */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="borderless" 
              className="text-neutral-700"
              leftIcon={<ChevronLeft className="w-3 h-3" />}
              onClick={() => router.push(`/assessment/${assessmentId}`)}
              style={{ paddingLeft: '0' }}
            >
              <span className="underline underline-offset-1">Back to overview</span>
            </Button>
          </div>
          <div className="flex items-center justify-between mb-6">
            <Tag
              label={`Success Factor ${questionPosition} of ${totalQuestions}`}
              variant="info-white"
            />
            {/* RD-29 */}
            <Button 
              leftIcon={<CheckIcon /> }
              variant="primary"
              onClick={markAsCompleteHandler}
              >
              Mark complete
            </Button>
          </div>
          
          <QuestionContent
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            rationale={rationale}
            onAnswerChange={handleAnswerChange}
            onRationaleChange={handleRationaleChange}
            onSaveAndContinue={handleSaveAndContinue}
          />

          {/* Note: adaptation for design variation until design system is updated */}
          <Box css={{
            mt: '8',
            '& p': {
              ml: 0
            }
          }}>
            <InlineMessage
              actionLabel="Mark complete"
              caption="Mark this factor as complete when you’ve finished reviewing the response, rationale, and strategies."
              isButtonRight
              icon={null}
              label="Ready to finish this factor?"
              size="full-width"
              onActionClick={markAsCompleteHandler}
              variant="info-grey"
            />
          </Box>

          {/* RD-15-PT-2 Implementation Pagination Card Buttons, here first */}
        </div>
      </main>
      
      <GuidanceSidebar
        question={currentQuestion}
        notes={notes}
        onNotesChange={handleNotesChange}
      />
    </>
  )
}
