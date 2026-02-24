'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeNavigation } from './ThemeNavigation'
import { QuestionContent } from './QuestionContent'
import { GuidanceSidebar } from './GuidanceSidebar'
import { useAutoSave } from '@/hooks/useAutoSave'
import { CheckIcon, ChevronLeftIcon as ChevronLeft, ChevronRightIcon, GoBackIcon } from '@/components/icons'
import { type AnswerValue } from '@/db/entities/Answer.entity'
import type { PlainQuestion, PlainAnswer } from './ThemePageLayout'
import { Button, InlineMessage, Modal, Tag } from '@worldresources/wri-design-systems'
import { Box } from '@chakra-ui/react'
import { FactorPaginationContainer } from '@/components/assessment/FactorPaginationContainer'
import { AnswerStatus } from '@/types/answer.types'

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
  const [isVisuallyMarkedAsComplete, setIsVisuallyMarkedAsComplete] = useState(
    currentAnswer?.status === AnswerStatus.COMPLETE,
  )
  const [showCompleteWarning, setShowCompleteWarning] = useState(false)
  const [isNextOrPrev, setIsNextOrPrev] = useState<'next' | 'prev' | ''>('')
  
  // Auto-save function
  const saveAnswer = useCallback(async (data: {
    questionId: string
    value: AnswerValue | null
    rationale?: string
    notes?: string
    status: AnswerStatus
  }) => {
    const response = await fetch(`/api/assessments/${assessmentId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        id: currentAnswer?.id,
      })
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
  }, [assessmentId, currentAnswer])
  
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
      notes,
      status: AnswerStatus.IN_PROGRESS,
    }, true) // Immediate save for answer selection
  }, [currentQuestion?.id, rationale, notes, save])
  
  // Handle rationale change (debounced save)
  const handleRationaleChange = useCallback((value: string) => {
    setRationale(value)
    save({
      questionId: currentQuestion.id,
      value: selectedAnswer,
      rationale: value,
      notes,
      status: AnswerStatus.IN_PROGRESS,
    }, false) // Debounced save for text input
  }, [currentQuestion?.id, selectedAnswer, notes, save])
  
  // Handle notes change (debounced save)
  const handleNotesChange = useCallback((value: string) => {
    setNotes(value)
    save({
      questionId: currentQuestion.id,
      value: selectedAnswer,
      rationale,
      notes: value,
      status: AnswerStatus.IN_PROGRESS,
    }, false) // Debounced save for text input
  }, [currentQuestion?.id, selectedAnswer, rationale, save])
  
  // Handle question selection
  const handleQuestionSelect = useCallback((code: string) => {
    const question = questions.find(q => q.questionCode === code)
    if (question) {
      router.push(`/assessment/${assessmentId}/${theme.toLowerCase()}?questionCode=${code}`)

      setCurrentQuestionCode(code)
      const answer = answersCache.get(question.id)
      setSelectedAnswer(answer?.value || null)
      setRationale(answer?.rationale || '')
      setNotes(answer?.notes || '')
      setIsVisuallyMarkedAsComplete(answer?.status === AnswerStatus.COMPLETE)
    }
  }, [questions, answersCache, assessmentId, theme, router])
  
  // Handle theme navigation
  const handleThemeChange = useCallback((direction: 'prev' | 'next') => {
    const targetTheme = direction === 'prev' ? prevTheme : nextTheme
    if (targetTheme) {
      router.push(`/assessment/${assessmentId}/${targetTheme}`)
    }
  }, [assessmentId, prevTheme, nextTheme, router])
  
  // Handle "Save and continue"
  const handleSaveAndContinue = useCallback(async (markAsComplete?: boolean) => {
    // Save current answer
    await save({
      questionId: currentQuestion.id,
      value: selectedAnswer,
      rationale,
      notes,
      status: markAsComplete ? AnswerStatus.COMPLETE : AnswerStatus.IN_PROGRESS,
    }, true)
    
    // Find next unanswered question in theme
    const currentIndex = questions.findIndex(q => q.questionCode === currentQuestionCode)
    const nextQuestion = questions.slice(currentIndex + 1)?.[0]
    const prevQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null
    
    if (nextQuestion && isNextOrPrev === 'next') {
      handleQuestionSelect(nextQuestion.questionCode)
    } else if (prevQuestion && isNextOrPrev === 'prev') {
      handleQuestionSelect(prevQuestion.questionCode)
    } else if (canGoNext && nextTheme) {
      // Move to next theme
      router.push(`/assessment/${assessmentId}/${nextTheme}`)
    } else {
      // All done - go to overview
      router.push(`/assessment/${assessmentId}/overview`)
    }
  }, [
    currentQuestion?.id, selectedAnswer, rationale, notes, save,
    questions, currentQuestionCode, canGoNext, nextTheme,
    assessmentId, router, handleQuestionSelect, isNextOrPrev,
  ])
  
  if (!currentQuestion) {
    return <div className="p-8 text-center text-slate-500">No questions found for this theme.</div>
  }

  const markAsCompleteHandler = async () => {
    setIsVisuallyMarkedAsComplete(true)

    await save({
      questionId: currentQuestion.id,
      value: selectedAnswer,
      rationale,
      notes,
      status: AnswerStatus.COMPLETE,
    }, true)
  }
  
  // Calculate current question position within theme for Tag display
  const currentIndex = questions.findIndex(q => q.questionCode === currentQuestionCode)
  const questionPosition = currentIndex + 1
  const totalQuestions = questions.length
  
  const allowMarkAsComplete = selectedAnswer

  const markCompleteAndContinue = async () => {
    await handleSaveAndContinue(true)

    setShowCompleteWarning(false)
  }
  
  const continueWithoutMarking = async () => {
    setShowCompleteWarning(false)

    let newQuestionCode = ''
    const currentIndex = questions.findIndex(
      (q) => q.questionCode === currentQuestionCode,
    )
    if (isNextOrPrev === 'next') {
      const nextQuestion = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null
      const hasNextInTheme = nextQuestion !== null
      const canGoNextTheme = !hasNextInTheme && nextTheme !== null

      if (hasNextInTheme) {
        newQuestionCode = nextQuestion.questionCode
      } else if (canGoNextTheme) {
        router.push(`/assessment/${assessmentId}/${nextTheme}`)
        
        return
      }
    } else {
      const prevQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null
      const hasPrevInTheme = prevQuestion !== null
      const canGoPrevTheme = !hasPrevInTheme && prevTheme !== null

      if (hasPrevInTheme) {
        newQuestionCode = prevQuestion.questionCode
      } else if (canGoPrevTheme) {
        router.push(`/assessment/${assessmentId}/${prevTheme}`)
        
        return
      }
    }

    handleQuestionSelect(newQuestionCode)
  }

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
            
            {isVisuallyMarkedAsComplete ? (
              <div className='flex items-center gap-2'>
                <Tag
                  label='Complete'
                  variant='success'
                  icon={<CheckIcon />}
                />
                <Button
                  leftIcon={<GoBackIcon />}
                  variant='borderless'
                  size='small'
                  onClick={() => setIsVisuallyMarkedAsComplete(false)}
                  label='Edit factor'
                />
              </div>
            ) : (
              <Button
                leftIcon={<CheckIcon />}
                variant='primary'
                size='small'
                onClick={markAsCompleteHandler}
                disabled={!allowMarkAsComplete}
              >
                Mark complete
              </Button>
            )}
          </div>

          <QuestionContent
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            rationale={rationale}
            onAnswerChange={handleAnswerChange}
            onRationaleChange={handleRationaleChange}
            isVisuallyMarkedAsComplete={isVisuallyMarkedAsComplete}
          />

          {allowMarkAsComplete && !isVisuallyMarkedAsComplete ? (
            <Box
              css={{
                mt: '8',
                '& p': {
                  ml: 0,
                },
              }}
            >
              <InlineMessage
                actionLabel='Mark complete'
                caption='Mark this factor as complete when you’ve finished reviewing the response, rationale, and strategies.'
                isButtonRight
                icon={null}
                label='Ready to finish this factor?'
                size='full-width'
                onActionClick={markAsCompleteHandler}
                buttonLeftIcon={<CheckIcon />}
                variant='info-grey'
              />
            </Box>
          ) : null}

          {isVisuallyMarkedAsComplete ? (
            <div className='mt-10'>
              <InlineMessage
                actionLabel='Edit factor'
                isButtonRight
                icon={<CheckIcon />}
                label='This factor is marked as complete.'
                size='full-width'
                onActionClick={() => setIsVisuallyMarkedAsComplete(false)}
                buttonLeftIcon={<GoBackIcon />}
                variant='success'
              />
            </div>
          ) : null}

          {/* Factor Navigation Cards */}
          <FactorPaginationContainer
            assessmentId={assessmentId}
            currentTheme={theme}
            questions={questions}
            currentQuestionCode={currentQuestionCode}
            prevTheme={prevTheme}
            nextTheme={nextTheme}
            onNavigate={handleQuestionSelect}
            isMarkedAsComplete={isVisuallyMarkedAsComplete}
            setIsNextOrPrev={(direction) => {
              setIsNextOrPrev(direction)
              setShowCompleteWarning(true)
            }}
          />
        </div>
      </main>
      
      <GuidanceSidebar
        question={currentQuestion}
        notes={notes}
        onNotesChange={handleNotesChange}
      />

      <Modal
        open={showCompleteWarning}
        onClose={() => setShowCompleteWarning(false)}
        header={
          <p className='text-neutral-800 font-bold'>Mark factor as complete?</p>
        }
        content='You’ve filled in the response and required fields for this factor. Would you like to mark it as complete before moving on?'
        footer={
          <>
            <Button
              label='Mark complete & continue'
              onClick={markCompleteAndContinue}
            />
            <Button
              label='Continue without marking'
              onClick={continueWithoutMarking}
              rightIcon={<ChevronRightIcon />}
              variant='borderless'
              size='small'
            />
          </>
        }
      />
        
    </>
  )
}
