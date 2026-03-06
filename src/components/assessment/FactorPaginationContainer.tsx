'use client'

import { Box } from '@chakra-ui/react'
import { PaginationCard } from './PaginationCard'
import type { PlainQuestion } from '@/app/assessment/[id]/[theme]/components/ThemePageLayout'

/**
 * FactorPaginationContainer - Navigation between success factors
 * 
 * Handles navigation:
 * - Within theme: Previous/next question
 * - Cross-theme: Last of one theme → first of next theme
 * - Boundaries: Disabled at first question of Motivate, last question of Implement
 */

export interface FactorPaginationContainerProps {
  /** Assessment ID for URL construction */
  assessmentId: string
  
  /** Current theme being viewed */
  currentTheme: 'Motivate' | 'Enable' | 'Implement'
  
  /** All questions in current theme (ordered) */
  questions: PlainQuestion[]
  
  /** Current question code (e.g., "M01", "E05") */
  currentQuestionCode: string
  
  /** Previous theme name for cross-theme navigation (null if at Motivate) */
  prevTheme: string | null
  
  /** Next theme name for cross-theme navigation (null if at Implement) */
  nextTheme: string | null
  
  /** Optional callback when navigating within same theme */
  onNavigate?: (questionCode: string) => void

  isMarkedAsComplete: boolean
  setIsNextOrPrev: (direction: 'next' | 'prev') => void
}

export function FactorPaginationContainer({
  assessmentId,
  currentTheme,
  questions,
  currentQuestionCode,
  prevTheme,
  nextTheme,
  onNavigate,
  isMarkedAsComplete,
  setIsNextOrPrev,
}: FactorPaginationContainerProps) {
  // Find current question index
  const currentIndex = questions.findIndex(q => q.questionCode === currentQuestionCode)
  
  // Determine previous question
  const prevQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null
  const hasPrevInTheme = prevQuestion !== null
  const canGoPrevTheme = !hasPrevInTheme && prevTheme !== null
  
  // Determine next question  
  const nextQuestion = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null
  const hasNextInTheme = nextQuestion !== null
  const canGoNextTheme = !hasNextInTheme && nextTheme !== null
  
  // Build URLs
  const prevHref = hasPrevInTheme
    ? `/assessment/${assessmentId}/${currentTheme.toLowerCase()}?questionCode=${prevQuestion.questionCode}`
    : canGoPrevTheme
      ? `/assessment/${assessmentId}/${prevTheme}` // Will load last question of prev theme
      : '#'
  
  const nextHref = hasNextInTheme
    ? `/assessment/${assessmentId}/${currentTheme.toLowerCase()}?questionCode=${nextQuestion.questionCode}`
    : canGoNextTheme
      ? `/assessment/${assessmentId}/${nextTheme}` // Will load first question of next theme
      : '#'
  
  // Get factor names for display
  const prevFactorName = hasPrevInTheme
    ? prevQuestion.minimalKeySuccessFactor
    : canGoPrevTheme
      ? `Last factor in ${capitalize(prevTheme)}`
      : ''
  
  const nextFactorName = hasNextInTheme
    ? nextQuestion.minimalKeySuccessFactor
    : canGoNextTheme
      ? `First factor in ${capitalize(nextTheme)}`
      : ''
  
  return (
    <Box
      css={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '24px',
        width: '100%',
        padding: '32px 0'
      }}
    >
      {/* Previous Factor Card */}
      {!hasPrevInTheme && !canGoPrevTheme ? <div>&nbsp;</div> : (<PaginationCard
        direction="left"
        label="Previous factor"
        factorName={prevFactorName}
        href={!isMarkedAsComplete ? '#' : prevHref}
        isDisabled={!hasPrevInTheme && !canGoPrevTheme}
        onClick={() => {
          if (!isMarkedAsComplete) {
            setIsNextOrPrev('prev')
            return
          }

          if (hasPrevInTheme && onNavigate) {
            onNavigate(prevQuestion.questionCode)
          }
        }}
      />)}
      
      {/* Next Factor Card */}
      <PaginationCard
        direction="right"
        label="Next factor"
        factorName={nextFactorName}
        href={!isMarkedAsComplete ? '#' : nextHref}
        isDisabled={!hasNextInTheme && !canGoNextTheme}
        onClick={() => {
          if (!isMarkedAsComplete) {
            setIsNextOrPrev('next')
            return
          }

          if (hasNextInTheme && onNavigate) {
            onNavigate(nextQuestion.questionCode)
          }
        }}
      />
    </Box>
  )
}

// Helper function
function capitalize(str: string | null): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
