'use client'

import Link from 'next/link'
import { Box, Text } from '@chakra-ui/react'
import { getThemedColor } from '@worldresources/wri-design-systems'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'

/**
 * PaginationCard - A navigation card component for prev/next navigation
 * 
 * @description Candidate for inclusion in @worldresources/wri-design-systems
 * Built with Chakra UI primitives and WRI design tokens.
 * 
 * @see https://github.com/wri/wri-design-systems
 */

export interface PaginationCardProps {
  /** Navigation direction - controls icon placement and layout */
  direction: 'left' | 'right'
  
  /** Main label text - typically "Previous factor" or "Next factor" */
  label: string
  
  /** Factor/item name shown below label (e.g., "Economic", "Social") */
  factorName: string
  
  /** URL/route to navigate to when clicked */
  href: string
  
  /** Optional click handler - executes AFTER navigation (additive) */
  onClick?: () => void
  
  /** Disables card interaction and applies disabled styling */
  isDisabled?: boolean
  
  /** Custom aria-label for accessibility (defaults to "label: factorName") */
  ariaLabel?: string
}

// Style tokens
const labelStyles = {
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '1.4',
  color: getThemedColor('neutral', 900),
  marginBottom: '2px'
}

const factorNameStyles = {
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '1.4',
  color: getThemedColor('neutral', 600),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const
}

const iconStyles = {
  color: getThemedColor('neutral', 600),
  flexShrink: 0,
  width: '20px',
  height: '20px'
}

export function PaginationCard({
  direction,
  label,
  factorName,
  href,
  onClick,
  isDisabled = false,
  ariaLabel
}: PaginationCardProps) {
  const computedAriaLabel = ariaLabel || `${label}: ${factorName}`
  
  const cardContent = (
    <Box
      as="span"
      role="link"
      aria-disabled={isDisabled}
      aria-label={computedAriaLabel}
      tabIndex={isDisabled ? -1 : 0}
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        minWidth: '220px',
        backgroundColor: 'white',
        border: `1px solid ${getThemedColor('neutral', 300)}`,
        borderRadius: '6px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        textDecoration: 'none',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.10)',
        transition: 'all 0.15s ease-in-out',
        
        '&:hover:not([aria-disabled="true"])': {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.10), 0px 4px 6px rgba(0, 0, 0, 0.10)',
          borderColor: getThemedColor('neutral', 400)
        },
        
        '&:active:not([aria-disabled="true"])': {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06)'
        },
        
        '&:focus-visible': {
          outline: `2px solid ${getThemedColor('primary', 500)}`,
          outlineOffset: '2px'
        },
        
        '&:focus': {
          outline: 'none'
        }
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
          if (!isDisabled) {
            (e.currentTarget as HTMLElement).click()
          }
        }
      }}
    >
      {direction === 'left' ? (
        <>
          <ChevronLeftIcon css={iconStyles} />
          <Box css={{ flex: 1, minWidth: 0 }}>
            <Text css={labelStyles}>{label}</Text>
            <Text css={factorNameStyles}>{factorName}</Text>
          </Box>
        </>
      ) : (
        <>
          <Box css={{ flex: 1, minWidth: 0 }}>
            <Text css={labelStyles}>{label}</Text>
            <Text css={factorNameStyles}>{factorName}</Text>
          </Box>
          <ChevronRightIcon css={iconStyles} />
        </>
      )}
    </Box>
  )

  if (isDisabled) {
    return (
      <Box
        as="div"
        onClick={(e: React.MouseEvent) => e.preventDefault()}
      >
        {cardContent}
      </Box>
    )
  }

  return (
    <Link
      href={href}
      passHref
      legacyBehavior={false}
      style={{ textDecoration: 'none' }}
      onClick={() => onClick?.()}
    >
      {cardContent}
    </Link>
  )
}
