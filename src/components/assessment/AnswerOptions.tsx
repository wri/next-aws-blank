/** @jsxImportSource @emotion/react */
'use client'

import { forwardRef } from 'react'
import type { AnswerValue } from '@/db/entities/Answer.entity'
import { YesAnswerIcon, PartlyAnswerIcon, NoAnswerIcon } from '@/components/icons'
import { Box } from '@chakra-ui/react'
import { Button, getThemedColor } from '@worldresources/wri-design-systems'
import { css } from '@emotion/react'

interface AnswerButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  isSelected: boolean
  selectedColor: string
  bgColor: string
  borderColor: string
}

const baseAnswerButtonStyles = css({
  backgroundColor: 'white',
  wordWrap: 'break-word',
  textTransform: 'none',
  display: 'flex',
  cursor: 'pointer',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  borderRadius: '0.5rem',
  padding: '4',
  transitionProperty: 'all',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  borderStyle: 'solid',
  width: '100%',
  height: 'auto',
  minHeight: '120px',
  '&:hover': {
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    }
  },
  '& svg': {
    width: "2rem", 
    height: "2rem",
  }
})

const getAnswerButtonStyles = (isSelected: boolean, selectedColor: string, bgColor: string) => {
  if (isSelected) {
    return css({
      backgroundColor: bgColor,
      borderWidth: '4px',
      borderColor: selectedColor,
      '&:hover': {
        backgroundColor: bgColor,
        borderColor: selectedColor,
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    })
  }
  
  return css({
    backgroundColor: 'white',
    borderWidth: '1px',
    borderColor: getThemedColor('neutral', 400),
    '&:hover': {
      backgroundColor: 'white',
      borderColor: getThemedColor('neutral', 400),
    },
    '&:active': {
      backgroundColor: 'white'
    }
  })
}

const AnswerButton = forwardRef<HTMLButtonElement, AnswerButtonProps>(
  ({ isSelected, selectedColor, bgColor, children, ...props }, ref) => {
    return (
      <Button 
        variant="outline"
        ref={ref} 
        {...props} 
        css={[
          baseAnswerButtonStyles,
          getAnswerButtonStyles(isSelected, selectedColor, bgColor)
        ]}
      >
        {children}
      </Button>
    )
  }
)

AnswerButton.displayName = 'AnswerButton'

interface AnswerOptionsProps {
  value: AnswerValue | null
  onChange: (value: AnswerValue) => void
  disabled?: boolean
}

const answerConfig: Record<AnswerValue, { 
  label: string
  icon: React.ReactNode
  selectedColor: string
  bgColor: string
  borderColor: string
}> = {
  yes: {
    label: 'Yes',
    icon: <YesAnswerIcon />,
    selectedColor: getThemedColor('success', 500),
    bgColor: getThemedColor('success', 100),
    borderColor: getThemedColor('success', 500),
  },
  partly: {
    label: 'Partly',
    icon: <PartlyAnswerIcon />,
    selectedColor: getThemedColor('warning', 500),
    bgColor: getThemedColor('warning', 100),
    borderColor: getThemedColor('warning', 500),
  },
  no: {
    label: 'No',
    icon: <NoAnswerIcon />,
    selectedColor: getThemedColor('error', 500),
    bgColor: getThemedColor('error', 100),
    borderColor: getThemedColor('error', 500),
  },
  na: {
    label: 'N/A',
    icon: <Box css={css({ 
      width: '2rem', 
      height: '2rem', 
      borderRadius: '9999px', 
      border: '2px solid',
      borderColor: getThemedColor('neutral', 600)
    })} />,
    selectedColor: getThemedColor('neutral', 600),
    bgColor: getThemedColor('neutral', 200),
    borderColor: getThemedColor('neutral', 400)
  }
}

const iconContainerStyles = (isSelected: boolean, color: string) => css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color,
  width: '2rem !important',
  height: '2rem !important'
})

const labelStyles = (isSelected: boolean) => css({
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: '1.5rem',
  color: isSelected ? getThemedColor('neutral', 900) : getThemedColor('neutral', 600), // slate-900 : slate-600
})

export function AnswerOptions({ value, onChange, disabled }: AnswerOptionsProps) {
  const unselectedColor = getThemedColor('neutral', 400);
  return (
    <Box css={css({
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '1rem',
    })}>
      {(Object.entries(answerConfig) as [AnswerValue, typeof answerConfig[AnswerValue]][]).map(([answerValue, config]) => {
        const isSelected = value === answerValue;
        const iconColor = isSelected ? config.selectedColor : unselectedColor;
        
        return (
          <AnswerButton
            key={answerValue}
            disabled={disabled}
            onClick={() => onChange(answerValue)}
            isSelected={isSelected}
            selectedColor={config.selectedColor}
            bgColor={config.bgColor}
            borderColor={config.borderColor}
          >
            <Box css={iconContainerStyles(isSelected, iconColor)}>
              {config.icon}
            </Box>
            <Box as="span" css={labelStyles(isSelected)}>
              {config.label}
            </Box>
          </AnswerButton>
        )
      })}
    </Box>
  )
}
