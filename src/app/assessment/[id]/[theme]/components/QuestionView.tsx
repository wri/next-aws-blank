'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeNavigation } from './ThemeNavigation'
import { QuestionContent } from './QuestionContent'
import { GuidanceSidebar } from './GuidanceSidebar'
import { useAutoSave, type AutoSaveStatus } from '@/hooks/useAutoSave'
import {
  CheckIcon,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon,
  CheckCircleIcon,
  InProgressIcon,
  NotStartedIcon,
  EditIcon,
} from '@/components/icons'
import { ProgressNotSavedModal } from '@/components/assessment/ProgressNotSavedModal'
import type { PlainQuestion, PlainAnswer } from './ThemePageLayout'
import {
  Button,
  getThemedColor,
  InlineMessage,
  Modal,
} from '@worldresources/wri-design-systems'
import { Box, Flex, Text } from '@chakra-ui/react'
import { FactorPaginationContainer } from '@/components/assessment/FactorPaginationContainer'
import {
  AnswerStatus,
  AnswerValue,
  PlainContributor,
} from '@/types/answer.types'
import { hasRichTextContent } from '@/utils/validation'
import { useTranslations } from '@/i18n/useTranslations'

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
  onFocusChange?: (code: string) => void

  onOverviewNavigateRequestChange?: (handler: (() => void) | null) => void
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
  onFocusChange,
  onOverviewNavigateRequestChange,
}: QuestionViewProps) {
  const router = useRouter()
  const t = useTranslations()

  // Reconstruct Map from serialized array (Maps cannot be passed from Server to Client Components)
  const [answersCache, setAnswersCache] = useState(
    () => new Map<string, PlainAnswer>(initialAnswers),
  )

  useEffect(() => {
    setAnswersCache(new Map(initialAnswers))
  }, [initialAnswers])

  // Contributor state
  const [allContributors, setAllContributors] = useState<PlainContributor[]>(
    initialAllContributors,
  )
  const [contributorsByAnswer, setContributorsByAnswer] = useState(
    () => new Map<string, string[]>(initialContributorsByAnswer),
  )

  // Current question state
  const [currentQuestionCode, setCurrentQuestionCode] =
    useState(focusQuestionCode)
  const currentQuestion =
    questions.find((q) => q.questionCode === currentQuestionCode) ||
    questions[0]
  const currentAnswer = answersCache.get(currentQuestion?.id || '')

  // Answer state
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerValue | null>(
    currentAnswer?.value || null,
  )
  const [rationale, setRationale] = useState(currentAnswer?.rationale || '')
  const [notes, setNotes] = useState(currentAnswer?.notes || '')
  const [strategies, setStrategies] = useState(
    currentAnswer?.strategies || '[]',
  )
  const [isVisuallyMarkedAsComplete, setIsVisuallyMarkedAsComplete] = useState(
    currentAnswer?.status === AnswerStatus.COMPLETE,
  )
  const [showCompleteWarning, setShowCompleteWarning] = useState(false)
  const [showProgressNotSavedModal, setShowProgressNotSavedModal] =
    useState(false)

  useEffect(() => {
    const targetQuestion =
      questions.find((q) => q.questionCode === focusQuestionCode) ||
      questions[0]

    if (!targetQuestion) return

    setCurrentQuestionCode(targetQuestion.questionCode)
    const answer = answersCache.get(targetQuestion.id)
    setSelectedAnswer(answer?.value || null)
    setRationale(answer?.rationale || '')
    setNotes(answer?.notes || '')
    setStrategies(answer?.strategies || '[]')
    setIsVisuallyMarkedAsComplete(answer?.status === AnswerStatus.COMPLETE)
  }, [focusQuestionCode, questions, answersCache])

  const currentContributorIds =
    contributorsByAnswer.get(currentAnswer?.id || '') || []

  // Helper: Ensure an answer exists for the current question (creates if needed)
  const ensureAnswerExists = useCallback(async () => {
    // If answer already exists, return it
    if (currentAnswer?.id) {
      return currentAnswer
    }

    // If there's already a pending creation, await it instead of creating duplicate
    if (pendingAnswerCreationRef.current) {
      return pendingAnswerCreationRef.current
    }

    // Create a new answer with minimal data
    const creationPromise = (async () => {
      const response = await fetch(`/api/assessments/${assessmentId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          value: selectedAnswer,
          rationale: rationale || '',
          notes: notes || '',
          strategies: strategies || '[]',
          status: AnswerStatus.IN_PROGRESS,
          allowDataSharing,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create answer')
      }

      const result = await response.json()
      const newAnswer = result.answer

      // Update local cache
      setAnswersCache((prev) => {
        const updated = new Map(prev)
        updated.set(currentQuestion.id, newAnswer)
        return updated
      })

      return newAnswer
    })()

    // Store the promise so concurrent calls can await it
    pendingAnswerCreationRef.current = creationPromise

    try {
      const result = await creationPromise
      return result
    } finally {
      // Clear the ref after completion (success or failure)
      pendingAnswerCreationRef.current = null
    }
  }, [
    assessmentId,
    currentQuestion,
    currentAnswer,
    selectedAnswer,
    rationale,
    notes,
    strategies,
    allowDataSharing,
  ])

  // Handler: Create contributor (optimistic)
  const handleContributorCreate = useCallback(
    async (name: string) => {
      // Ensure an answer exists first
      let answerToUse = currentAnswer
      if (!answerToUse) {
        try {
          answerToUse = await ensureAnswerExists()
        } catch (error) {
          console.error('Failed to create answer for contributor:', error)
          contributorErrorRef.current = true
          throw error
        }
      }

      // Defensive check (should never happen after ensureAnswerExists)
      if (!answerToUse) {
        contributorErrorRef.current = true
        throw new Error('No answer available for contributor')
      }

      // Generate temporary ID for optimistic update
      const tempId = crypto.randomUUID()
      const tempContributor: PlainContributor = {
        id: tempId,
        name,
        assessmentId,
        createdAt: new Date().toISOString(),
      }

      // Optimistically add to pool
      setAllContributors((prev) =>
        [...prev, tempContributor].sort((a, b) => a.name.localeCompare(b.name)),
      )

      // Optimistically add to answer's contributors
      setContributorsByAnswer((prev) => {
        const updated = new Map(prev)
        const current = prev.get(answerToUse!.id) || []
        updated.set(answerToUse!.id, [...current, tempId])
        return updated
      })

      let realContributor: PlainContributor | null = null

      // Fire API request in background
      try {
        const response = await fetch(
          `/api/assessments/${assessmentId}/contributors`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          },
        )

        if (!response.ok) {
          throw new Error('Failed to create contributor')
        }

        const { contributor } = await response.json()
        realContributor = contributor

        // Replace temp ID with real ID in allContributors
        setAllContributors((prev) =>
          prev.map((c) => (c.id === tempId ? contributor : c)),
        )

        // Replace temp ID with real ID in contributorsByAnswer
        setContributorsByAnswer((prev) => {
          const updated = new Map(prev)
          prev.forEach((contributorIds, answerId) => {
            updated.set(
              answerId,
              contributorIds.map((id) => (id === tempId ? contributor.id : id)),
            )
          })
          return updated
        })

        // Fire the association PUT request with the real ID
        // Read from ref to get the latest state (avoids stale closure from useCallback deps)
        const contributorIds = [
          ...(contributorsByAnswerRef.current.get(answerToUse.id) || []),
        ].map((id) => (id === tempId ? contributor.id : id))

        const associationResponse = await fetch(
          `/api/assessments/${assessmentId}/answers/${answerToUse.id}/contributors`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contributorIds }),
          },
        )

        if (!associationResponse.ok) {
          throw new Error('Failed to associate contributor')
        }

        contributorErrorRef.current = false
      } catch (error) {
        console.error('Failed to create contributor:', error)
        contributorErrorRef.current = true

        // Revert optimistic update - remove temp contributor
        setAllContributors((prev) => prev.filter((c) => c.id !== tempId))

        // Remove temp ID from contributorsByAnswer
        setContributorsByAnswer((prev) => {
          const updated = new Map(prev)
          prev.forEach((contributorIds, answerId) => {
            updated.set(
              answerId,
              contributorIds.filter((id) => id !== tempId),
            )
          })
          return updated
        })
      }

      // Return real contributor so callers (e.g. Responsibility) use the stable ID
      // that matches allContributors. Fall back to tempContributor only if API failed.
      return realContributor ?? tempContributor
    },
    [assessmentId, currentAnswer, ensureAnswerExists],
  )

  // Handler: Update contributors for answer
  const handleContributorsChange = useCallback(
    async (contributorIds: string[]) => {
      // Ensure an answer exists first
      let answerToUse = currentAnswer
      if (!answerToUse) {
        try {
          answerToUse = await ensureAnswerExists()
        } catch (error) {
          console.error('Failed to create answer for contributors:', error)
          return
        }
      }

      // Defensive check (should never happen after ensureAnswerExists)
      if (!answerToUse) {
        console.error('No answer available for contributors')
        return
      }

      // Optimistic update
      setContributorsByAnswer((prev) => {
        const updated = new Map(prev)
        updated.set(answerToUse!.id, contributorIds)
        return updated
      })

      // Save to API
      try {
        const response = await fetch(
          `/api/assessments/${assessmentId}/answers/${answerToUse.id}/contributors`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contributorIds }),
          },
        )

        if (!response.ok) {
          throw new Error('Failed to save contributors')
        }
      } catch (error) {
        console.error('Failed to save contributors:', error)
        // Revert optimistic update
        setContributorsByAnswer((prev) => {
          const updated = new Map(prev)
          const current = contributorsByAnswer.get(answerToUse!.id) || []
          updated.set(answerToUse!.id, current)
          return updated
        })
      }
    },
    [assessmentId, currentAnswer, contributorsByAnswer, ensureAnswerExists],
  )

  // Auto-save function
  const saveAnswer = useCallback(
    async (data: {
      questionId: string
      value: AnswerValue | null
      rationale?: string
      notes?: string
      strategies?: string
      status: AnswerStatus
    }) => {
      const response = await fetch(`/api/assessments/${assessmentId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          id: currentAnswer?.id,
          allowDataSharing,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save answer')
      }

      const result = await response.json()

      // Update local cache
      setAnswersCache((prev) => {
        const updated = new Map(prev)
        updated.set(data.questionId, result.answer)
        return updated
      })

      return result
    },
    [assessmentId, currentAnswer, allowDataSharing],
  )

  // Ref to track current save status synchronously (for navigation guards)
  const saveStatusRef = useRef<AutoSaveStatus>('idle')
  // Track contributor creation errors separately
  const contributorErrorRef = useRef<boolean>(false)
  // Track pending answer creation to prevent race conditions
  const pendingAnswerCreationRef = useRef<Promise<PlainAnswer> | null>(null)
  // Keep a ref to the latest contributorsByAnswer for use in async callbacks (avoids stale closures)
  const contributorsByAnswerRef = useRef(contributorsByAnswer)
  useEffect(() => {
    contributorsByAnswerRef.current = contributorsByAnswer
  }, [contributorsByAnswer])
  // Stores a deferred navigation callback when user tries to leave while saving
  const pendingNavigationRef = useRef<(() => void) | null>(null)
  const pendingCompleteGuardNavigationRef = useRef<(() => void) | null>(null)

  // Auto-save hook
  const handleAutoSaveStatusChange = useCallback(
    (status: AutoSaveStatus) => {
      saveStatusRef.current = status
      onSaveStatusChange?.(status)
      // Don't show modal immediately on error - wait for navigation attempt
    },
    [onSaveStatusChange],
  )

  const { save, clearError } = useAutoSave({
    onSave: saveAnswer,
    debounceMs: 1000,
    onStatusChange: handleAutoSaveStatusChange,
  })

  // Browser-level navigation guard (tab close, refresh, external links)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        saveStatusRef.current === 'saving' ||
        saveStatusRef.current === 'error' ||
        contributorErrorRef.current
      ) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Wraps a navigation action: if saving/error, defers it and shows modal; otherwise executes immediately
  const guardedNavigate = useCallback((navigateFn: () => void) => {
    if (
      saveStatusRef.current === 'saving' ||
      saveStatusRef.current === 'error' ||
      contributorErrorRef.current
    ) {
      pendingNavigationRef.current = navigateFn
      setShowProgressNotSavedModal(true)
    } else {
      navigateFn()
    }
  }, [])

  const shouldTriggerCompleteGuard =
    !isVisuallyMarkedAsComplete &&
    selectedAnswer !== null &&
    (selectedAnswer === AnswerValue.NA || hasRichTextContent(rationale))

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

  const handleOverviewNavigation = useCallback(() => {
    navigateWithCompleteGuard(() => router.push(`/assessment/${assessmentId}`))
  }, [navigateWithCompleteGuard, router, assessmentId])

  useEffect(() => {
    onOverviewNavigateRequestChange?.(handleOverviewNavigation)

    return () => {
      onOverviewNavigateRequestChange?.(null)
    }
  }, [onOverviewNavigateRequestChange, handleOverviewNavigation])

  // Handle answer selection (immediate save)
  const handleAnswerChange = useCallback(
    (value: AnswerValue) => {
      setSelectedAnswer(value)
      save(
        {
          questionId: currentQuestion.id,
          value,
          rationale,
          notes,
          strategies,
          status: AnswerStatus.IN_PROGRESS,
        },
        true,
      ) // Immediate save for answer selection
    },
    [currentQuestion?.id, rationale, notes, strategies, save],
  )

  // Handle rationale change (debounced save)
  const handleRationaleChange = useCallback(
    (value: string) => {
      setRationale(value)
      save(
        {
          questionId: currentQuestion.id,
          value: selectedAnswer,
          rationale: value,
          notes,
          strategies,
          status: AnswerStatus.IN_PROGRESS,
        },
        false,
      ) // Debounced save for text input
    },
    [currentQuestion?.id, selectedAnswer, notes, strategies, save],
  )

  // Handle notes change (debounced save)
  const handleNotesChange = useCallback(
    (value: string) => {
      setNotes(value)
      save(
        {
          questionId: currentQuestion.id,
          value: selectedAnswer,
          rationale,
          notes: value,
          strategies,
          status: AnswerStatus.IN_PROGRESS,
        },
        false,
      ) // Debounced save for text input
    },
    [currentQuestion?.id, selectedAnswer, rationale, strategies, save],
  )

  const handleStrategysChange = useCallback(
    (value: string) => {
      setStrategies(value)

      save(
        {
          questionId: currentQuestion.id,
          value: selectedAnswer,
          rationale,
          notes,
          strategies: value,
          status: AnswerStatus.IN_PROGRESS,
        },
        false,
      ) // Debounced save for text input
    },
    [currentQuestion?.id, selectedAnswer, rationale, notes, save],
  )

  // Handle question selection
  const executeQuestionSelect = useCallback(
    (code: string) => {
      const question = questions.find((q) => q.questionCode === code)
      if (question) {
        router.push(
          `/assessment/${assessmentId}/${theme.toLowerCase()}?questionCode=${code}`,
        )

        setCurrentQuestionCode(code)
        onFocusChange?.(code)
        const answer = answersCache.get(question.id)
        setSelectedAnswer(answer?.value || null)
        setRationale(answer?.rationale || '')
        setNotes(answer?.notes || '')
        setStrategies(answer?.strategies || '[]')
        setIsVisuallyMarkedAsComplete(answer?.status === AnswerStatus.COMPLETE)
        // Contributors are loaded from state, no need to update here
      }
    },
    [questions, answersCache, assessmentId, theme, router, onFocusChange],
  )

  const handleQuestionSelect = useCallback(
    (code: string) => {
      navigateWithCompleteGuard(() => executeQuestionSelect(code))
    },
    [navigateWithCompleteGuard, executeQuestionSelect],
  )

  // Handle theme navigation
  const handleThemeChange = useCallback(
    (direction: 'prev' | 'next') => {
      const targetTheme = direction === 'prev' ? prevTheme : nextTheme
      if (targetTheme) {
        navigateWithCompleteGuard(() =>
          router.push(`/assessment/${assessmentId}/${targetTheme}`),
        )
      }
    },
    [assessmentId, prevTheme, nextTheme, router, navigateWithCompleteGuard],
  )

  const buildPaginationNavigation = useCallback(
    (direction: 'next' | 'prev') => {
      const currentIndex = questions.findIndex(
        (q) => q.questionCode === currentQuestionCode,
      )

      if (direction === 'next') {
        const nextQuestion =
          currentIndex < questions.length - 1
            ? questions[currentIndex + 1]
            : null
        const hasNextInTheme = nextQuestion !== null
        const canGoNextTheme = !hasNextInTheme && nextTheme !== null

        if (hasNextInTheme && nextQuestion) {
          return () => executeQuestionSelect(nextQuestion.questionCode)
        }

        if (canGoNextTheme) {
          return () => router.push(`/assessment/${assessmentId}/${nextTheme}`)
        }
      } else {
        const prevQuestion =
          currentIndex > 0 ? questions[currentIndex - 1] : null
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
    },
    [
      questions,
      currentQuestionCode,
      nextTheme,
      prevTheme,
      executeQuestionSelect,
      router,
      assessmentId,
    ],
  )

  if (!currentQuestion) {
    return (
      <div className='p-8 text-center text-slate-500'>
        {t('assessment.content.empty.noQuestions')}
      </div>
    )
  }

  const markAsCompleteHandler = async () => {
    setIsVisuallyMarkedAsComplete(true)

    await save(
      {
        questionId: currentQuestion.id,
        value: selectedAnswer,
        rationale,
        notes,
        strategies,
        status: AnswerStatus.COMPLETE,
      },
      true,
    )
  }

  const allowMarkAsComplete =
    selectedAnswer !== null && selectedAnswer === AnswerValue.NA
      ? true
      : selectedAnswer !== null && hasRichTextContent(rationale)

  const markCompleteAndContinue = async () => {
    await save(
      {
        questionId: currentQuestion.id,
        value: selectedAnswer,
        rationale,
        notes,
        strategies,
        status: AnswerStatus.COMPLETE,
      },
      true,
    )

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
      <main className='flex-1 pb-20 bg-transparent'>
        <div className='max-w-4xl mx-auto pr-8 py-8'>
          <div className='flex items-center justify-between mb-6'>
            {/* Back to overview */}
            <Button
              variant='borderless'
              className='text-neutral-700'
              leftIcon={<ChevronLeft className='w-3 h-3' />}
              onClick={handleOverviewNavigation}
              style={{ paddingLeft: '0' }}
            >
              <span className='underline underline-offset-1'>
                {t('common.buttons.backToOverview')}
              </span>
            </Button>

            {/* Right side: Status indicator + Mark complete/Edit factor button */}
            <div className='flex items-center gap-3'>
              {/* Status Tag indicator */}
              {currentAnswer?.status === AnswerStatus.COMPLETE ? (
                <Flex
                  align='center'
                  gap={2}
                  px={3}
                  py={1}
                  color={getThemedColor('success', 900)}
                >
                  <CheckCircleIcon boxSize='12px' />
                  <Text fontSize='sm'>
                    {t('overview.keySuccessFactors.status.complete')}
                  </Text>
                </Flex>
              ) : currentAnswer?.status === AnswerStatus.IN_PROGRESS ? (
                <Flex
                  align='center'
                  gap={2}
                  px={3}
                  py={1}
                  color={getThemedColor('primary', 800)}
                >
                  <InProgressIcon boxSize='12px' />
                  <Text fontSize='sm'>
                    {t('overview.keySuccessFactors.status.inProgress')}
                  </Text>
                </Flex>
              ) : (
                <Flex
                  align='center'
                  gap={2}
                  px={3}
                  py={1}
                  color={getThemedColor('neutral', 800)}
                >
                  <NotStartedIcon boxSize='12px' />
                  <Text fontSize='sm'>
                    {t('overview.keySuccessFactors.status.notStarted')}
                  </Text>
                </Flex>
              )}

              {/* Mark complete or Edit factor button */}
              {isVisuallyMarkedAsComplete ? (
                <Button
                  leftIcon={
                    <EditIcon css={{ width: '12px', height: '12px' }} />
                  }
                  variant='secondary'
                  size='small'
                  onClick={() => setIsVisuallyMarkedAsComplete(false)}
                  label={t('assessment.actions.buttons.editFactor')}
                />
              ) : currentAnswer?.status &&
                currentAnswer.status !== AnswerStatus.NOT_STARTED ? (
                <Button
                  leftIcon={<CheckIcon />}
                  variant='primary'
                  size='small'
                  onClick={markAsCompleteHandler}
                  disabled={!allowMarkAsComplete}
                >
                  {t('overview.keySuccessFactors.status.complete')}
                </Button>
              ) : null}
            </div>
          </div>

          <QuestionContent
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            rationale={rationale}
            onAnswerChange={handleAnswerChange}
            onRationaleChange={handleRationaleChange}
            strategies={strategies}
            onStrategysChange={handleStrategysChange}
            isVisuallyMarkedAsComplete={isVisuallyMarkedAsComplete}
            contributors={currentContributorIds}
            allContributors={allContributors}
            onContributorsChange={handleContributorsChange}
            onContributorCreate={handleContributorCreate}
            assessmentId={assessmentId}
          />

          {allowMarkAsComplete && !isVisuallyMarkedAsComplete ? (
            <Box
              css={{
                mt: '20',
                '& p': {
                  ml: 0,
                },
              }}
            >
              <InlineMessage
                actionLabel={t('assessment.actions.messages.markAsComplete')}
                caption={t('assessment.actions.captions.markComplete')}
                isButtonRight
                icon={null}
                label={t('assessment.actions.messages.readyToFinish')}
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
                actionLabel={t('assessment.actions.buttons.editFactor')}
                isButtonRight
                icon={<CheckIcon />}
                label={t('assessment.actions.messages.factorMarkedComplete')}
                size='full-width'
                onActionClick={() => setIsVisuallyMarkedAsComplete(false)}
                buttonLeftIcon={
                  <EditIcon css={{ width: '12px', height: '12px' }} />
                }
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
          <p className='text-neutral-800 font-bold'>
            {t('assessment.actions.modal.markComplete.header')}
          </p>
        }
        content={t('assessment.actions.modal.markComplete.content')}
        footer={
          <>
            <Button
              label={t('assessment.actions.modal.markComplete.confirmButton')}
              onClick={markCompleteAndContinue}
            />
            <Button
              label={t('assessment.actions.modal.markComplete.cancelButton')}
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
        onDismiss={() => {
          setShowProgressNotSavedModal(false)
          contributorErrorRef.current = false
          pendingNavigationRef.current = null
          // Retry save immediately when user decides to stay on page.
          save(
            {
              questionId: currentQuestion.id,
              value: selectedAnswer,
              rationale,
              notes,
              strategies,
              status: isVisuallyMarkedAsComplete
                ? AnswerStatus.COMPLETE
                : AnswerStatus.IN_PROGRESS,
            },
            true,
          ).catch(() => {
            /* best-effort */
          })
        }}
        onLeavePageAnyway={() => {
          setShowProgressNotSavedModal(false)
          contributorErrorRef.current = false
          // Clear the error state so future navigations aren't blocked
          clearError()
          saveStatusRef.current = 'idle'
          // Fire-and-forget save attempt (best-effort)
          save(
            {
              questionId: currentQuestion.id,
              value: selectedAnswer,
              rationale,
              notes,
              strategies,
              status: isVisuallyMarkedAsComplete
                ? AnswerStatus.COMPLETE
                : AnswerStatus.IN_PROGRESS,
            },
            true,
          ).catch(() => {
            /* best-effort */
          })
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
