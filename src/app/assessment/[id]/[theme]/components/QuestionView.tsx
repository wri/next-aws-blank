'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeNavigation } from './ThemeNavigation'
import { QuestionContent } from './QuestionContent'
import { GuidanceSidebar } from './GuidanceSidebar'
import { useAutoSave, type AutoSaveStatus } from '@/hooks/useAutoSave'
import { CheckIcon, ChevronLeftIcon as ChevronLeft, ChevronRightIcon, GoBackIcon } from '@/components/icons'
import { ProgressNotSavedModal } from '@/components/assessment/ProgressNotSavedModal'
import { type AnswerValue } from '@/db/entities/Answer.entity'
import type { PlainQuestion, PlainAnswer, PlainContributor } from './ThemePageLayout'
import { Button, InlineMessage, Modal, Tag } from '@worldresources/wri-design-systems'
import { Box } from '@chakra-ui/react'
import { FactorPaginationContainer } from '@/components/assessment/FactorPaginationContainer'
import { AnswerStatus } from '@/types/answer.types'
import { hasRichTextContent } from '@/utils/validation'

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
  allowDataSharing: boolean
  allContributors: PlainContributor[]
  initialContributorsByAnswer: Array<[string, string[]]>
  onSaveStatusChange?: (status: AutoSaveStatus) => void
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
  nextTheme,
  allowDataSharing,
  allContributors: initialAllContributors,
  initialContributorsByAnswer,
  onSaveStatusChange,
}: QuestionViewProps) {
  const router = useRouter()
  
  // Reconstruct Map from serialized array (Maps cannot be passed from Server to Client Components)
  const [answersCache, setAnswersCache] = useState(() => 
    new Map<string, PlainAnswer>(initialAnswers)
  )
  
  // Contributor state
  const [allContributors, setAllContributors] = useState<PlainContributor[]>(initialAllContributors)
  const [contributorsByAnswer, setContributorsByAnswer] = useState(() =>
    new Map<string, string[]>(initialContributorsByAnswer)
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
  const [showProgressNotSavedModal, setShowProgressNotSavedModal] = useState(false)
  
  const currentContributorIds = contributorsByAnswer.get(currentAnswer?.id || '') || []
  
  // Handler: Create contributor (optimistic)
  const handleContributorCreate = useCallback(async (name: string) => {
    // Generate temporary ID for optimistic update
    const tempId = crypto.randomUUID()
    const tempContributor: PlainContributor = {
      id: tempId,
      name,
      assessmentId,
      createdAt: new Date().toISOString()
    }
    
    // Optimistically add to pool
    setAllContributors(prev => [...prev, tempContributor].sort((a, b) => 
      a.name.localeCompare(b.name)
    ))
    
    // Optimistically add to current answer's contributors
    if (currentAnswer?.id) {
      setContributorsByAnswer(prev => {
        const updated = new Map(prev)
        const current = prev.get(currentAnswer.id) || []
        updated.set(currentAnswer.id, [...current, tempId])
        return updated
      })
    }
    
    // Fire API request in background
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/contributors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create contributor')
      }
      
      const { contributor } = await response.json()
      
      // Replace temp ID with real ID in allContributors
      setAllContributors(prev => prev.map(c => 
        c.id === tempId ? contributor : c
      ))
      
      // Replace temp ID with real ID in contributorsByAnswer
      setContributorsByAnswer(prev => {
        const updated = new Map(prev)
        prev.forEach((contributorIds, answerId) => {
          updated.set(
            answerId,
            contributorIds.map(id => id === tempId ? contributor.id : id)
          )
        })
        return updated
      })
      
      // Now fire the association PUT request with the real ID
      if (currentAnswer?.id) {
        const contributorIds = [...(contributorsByAnswer.get(currentAnswer.id) || [])]
          .map(id => id === tempId ? contributor.id : id)
        
        const associationResponse = await fetch(
          `/api/assessments/${assessmentId}/answers/${currentAnswer.id}/contributors`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contributorIds })
          }
        )
        
        if (!associationResponse.ok) {
          throw new Error('Failed to associate contributor')
        }
      }
      
      contributorErrorRef.current = false
    } catch (error) {
      console.error('Failed to create contributor:', error)
      contributorErrorRef.current = true
      
      // Revert optimistic update - remove temp contributor
      setAllContributors(prev => prev.filter(c => c.id !== tempId))
      
      // Remove temp ID from contributorsByAnswer
      setContributorsByAnswer(prev => {
        const updated = new Map(prev)
        prev.forEach((contributorIds, answerId) => {
          updated.set(
            answerId,
            contributorIds.filter(id => id !== tempId)
          )
        })
        return updated
      })
    }
    
    // Return temp contributor immediately for UI feedback
    return tempContributor
  }, [assessmentId, currentAnswer, contributorsByAnswer])
  
  // Handler: Update contributors for answer
  const handleContributorsChange = useCallback(async (contributorIds: string[]) => {
    if (!currentAnswer?.id) return
    
    // Optimistic update
    setContributorsByAnswer(prev => {
      const updated = new Map(prev)
      updated.set(currentAnswer.id, contributorIds)
      return updated
    })
    
    // Save to API
    try {
      const response = await fetch(
        `/api/assessments/${assessmentId}/answers/${currentAnswer.id}/contributors`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contributorIds })
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to save contributors')
      }
    } catch (error) {
      console.error('Failed to save contributors:', error)
      // Revert optimistic update
      setContributorsByAnswer(prev => {
        const updated = new Map(prev)
        const current = contributorsByAnswer.get(currentAnswer.id) || []
        updated.set(currentAnswer.id, current)
        return updated
      })
    }
  }, [assessmentId, currentAnswer, contributorsByAnswer])
  
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
        allowDataSharing,
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
  }, [assessmentId, currentAnswer, allowDataSharing])
  
  // Ref to track current save status synchronously (for navigation guards)
  const saveStatusRef = useRef<AutoSaveStatus>('idle')
  // Track contributor creation errors separately
  const contributorErrorRef = useRef<boolean>(false)
  // Stores a deferred navigation callback when user tries to leave while saving
  const pendingNavigationRef = useRef<(() => void) | null>(null)
  const pendingCompleteGuardNavigationRef = useRef<(() => void) | null>(null)

  // Auto-save hook
  const handleAutoSaveStatusChange = useCallback((status: AutoSaveStatus) => {
    saveStatusRef.current = status
    onSaveStatusChange?.(status)
    // Don't show modal immediately on error - wait for navigation attempt
  }, [onSaveStatusChange])

  const { save } = useAutoSave({
    onSave: saveAnswer,
    debounceMs: 1000,
    onStatusChange: handleAutoSaveStatusChange,
  })

  // Browser-level navigation guard (tab close, refresh, external links)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatusRef.current === 'saving') {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Wraps a navigation action: if saving/error, defers it and shows modal; otherwise executes immediately
  const guardedNavigate = useCallback((navigateFn: () => void) => {
    if (saveStatusRef.current === 'saving' || saveStatusRef.current === 'error' || contributorErrorRef.current) {
      pendingNavigationRef.current = navigateFn
      setShowProgressNotSavedModal(true)
    } else {
      navigateFn()
    }
  }, [])

  // TODO - add the check for strategies
  const shouldTriggerCompleteGuard =
    !isVisuallyMarkedAsComplete &&
    selectedAnswer !== null &&
    hasRichTextContent(rationale)

  const navigateWithCompleteGuard = useCallback(
    (navigateFn: () => void) => {
      guardedNavigate(() => {
        if (shouldTriggerCompleteGuard) {
          pendingCompleteGuardNavigationRef.current = navigateFn
          setShowCompleteWarning(true)
          return
        }

        navigateFn()
      })
    },
    [guardedNavigate, shouldTriggerCompleteGuard],
  )
  
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
  const executeQuestionSelect = useCallback((code: string) => {
    const question = questions.find(q => q.questionCode === code)
    if (question) {
      router.push(`/assessment/${assessmentId}/${theme.toLowerCase()}?questionCode=${code}`)

      setCurrentQuestionCode(code)
      const answer = answersCache.get(question.id)
      setSelectedAnswer(answer?.value || null)
      setRationale(answer?.rationale || '')
      setNotes(answer?.notes || '')
      setIsVisuallyMarkedAsComplete(answer?.status === AnswerStatus.COMPLETE)
      // Contributors are loaded from state, no need to update here
    }
  }, [questions, answersCache, assessmentId, theme, router])

  const handleQuestionSelect = useCallback((code: string) => {
    navigateWithCompleteGuard(() => executeQuestionSelect(code))
  }, [navigateWithCompleteGuard, executeQuestionSelect])
  
  // Handle theme navigation
  const handleThemeChange = useCallback((direction: 'prev' | 'next') => {
    const targetTheme = direction === 'prev' ? prevTheme : nextTheme
    if (targetTheme) {
      navigateWithCompleteGuard(() =>
        router.push(`/assessment/${assessmentId}/${targetTheme}`),
      )
    }
  }, [assessmentId, prevTheme, nextTheme, router, navigateWithCompleteGuard])
  
  const buildPaginationNavigation = useCallback((direction: 'next' | 'prev') => {
    const currentIndex = questions.findIndex(
      (q) => q.questionCode === currentQuestionCode,
    )

    if (direction === 'next') {
      const nextQuestion =
        currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null
      const hasNextInTheme = nextQuestion !== null
      const canGoNextTheme = !hasNextInTheme && nextTheme !== null

      if (hasNextInTheme && nextQuestion) {
        return () => executeQuestionSelect(nextQuestion.questionCode)
      }

      if (canGoNextTheme) {
        return () => router.push(`/assessment/${assessmentId}/${nextTheme}`)
      }
    } else {
      const prevQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null
      const hasPrevInTheme = prevQuestion !== null
      const canGoPrevTheme = !hasPrevInTheme && prevTheme !== null

      if (hasPrevInTheme && prevQuestion) {
        return () => executeQuestionSelect(prevQuestion.questionCode)
      }

      if (canGoPrevTheme) {
        return () => router.push(`/assessment/${assessmentId}/${prevTheme}`)
      }
    }

    return null
  }, [
    questions,
    currentQuestionCode,
    nextTheme,
    prevTheme,
    executeQuestionSelect,
    router,
    assessmentId,
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
  
  const allowMarkAsComplete =
    selectedAnswer !== null && hasRichTextContent(rationale)

  const markCompleteAndContinue = async () => {
    await save({
      questionId: currentQuestion.id,
      value: selectedAnswer,
      rationale,
      notes,
      status: AnswerStatus.COMPLETE,
    }, true)

    setIsVisuallyMarkedAsComplete(true)

    setShowCompleteWarning(false)
    const pendingNavigation = pendingCompleteGuardNavigationRef.current
    pendingCompleteGuardNavigationRef.current = null
    pendingNavigation?.()
  }
  
  const continueWithoutMarking = async () => {
    setShowCompleteWarning(false)
    const pendingNavigation = pendingCompleteGuardNavigationRef.current
    pendingCompleteGuardNavigationRef.current = null
    pendingNavigation?.()
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
              onClick={() =>
                navigateWithCompleteGuard(() =>
                  router.push(`/assessment/${assessmentId}`),
                )
              }
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
            assessmentId={assessmentId}
            answerId={currentAnswer?.id}
            contributors={currentContributorIds}
            allContributors={allContributors}
            onContributorsChange={handleContributorsChange}
            onContributorCreate={handleContributorCreate}
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
            isMarkedAsComplete={!shouldTriggerCompleteGuard}
            setIsNextOrPrev={(direction) => {
              const navigateFn = buildPaginationNavigation(direction)

              if (!navigateFn) return

              navigateWithCompleteGuard(navigateFn)
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
        onClose={() => {
          setShowCompleteWarning(false)
          pendingCompleteGuardNavigationRef.current = null
        }}
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

      <ProgressNotSavedModal
        open={showProgressNotSavedModal}
        onCancel={() => {
          setShowProgressNotSavedModal(false)
          contributorErrorRef.current = false
          pendingNavigationRef.current = null
          // Retry the last save
          save({
            questionId: currentQuestion.id,
            value: selectedAnswer,
            rationale,
            notes,
            status: isVisuallyMarkedAsComplete ? AnswerStatus.COMPLETE : AnswerStatus.IN_PROGRESS,
          }, true)
        }}
        onLeavePageAnyway={() => {
          setShowProgressNotSavedModal(false)
          contributorErrorRef.current = false
          // Execute the deferred navigation if one was pending
          if (pendingNavigationRef.current) {
            pendingNavigationRef.current()
            pendingNavigationRef.current = null
          }
        }}
      />
        
    </>
  )
}
