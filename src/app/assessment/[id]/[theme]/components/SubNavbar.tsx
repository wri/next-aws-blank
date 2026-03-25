'use client'

import { Button, Breadcrumb, getThemedColor } from '@worldresources/wri-design-systems'
import { Box } from '@chakra-ui/react'
import { CheckIcon, ErrorCircleFilledIcon } from '@/components/icons'
import type { AutoSaveStatus } from '@/hooks/useAutoSave'
import type { PlainQuestion } from './ThemePageLayout'
import Link from 'next/link'
import { useTranslations } from '@/i18n/useTranslations'
import { useEffect, useState } from 'react'

interface SubNavbarProps {
  saveStatus?: AutoSaveStatus
  assessmentId: string
  questions: PlainQuestion[]
  focusQuestionCode: string
}

export function SubNavbar({ 
  saveStatus = 'idle', 
  assessmentId, 
  questions, 
  focusQuestionCode 
}: SubNavbarProps) {
  const t = useTranslations()
  const [isClient, setIsClient] = useState(false)

  // Find current question
  const currentQuestion = questions.find(q => q.questionCode === focusQuestionCode)
  
  // Build breadcrumb links
  const breadcrumbLinks = [
    { label: t('navigation.overview'), link: `/assessment/${assessmentId}` },
  ]
  
  // Add current question if it exists
  if (currentQuestion) {
    // Use empty string for current page (no link needed as it's the active page)
    breadcrumbLinks.push({ 
      label: currentQuestion.minimalKeySuccessFactor,
      link: '' 
    })
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return <div className='h-11' />
  
  return (
    <header
      className="h-11 px-4 border-b border-neutral-400 sticky top-0 bg-white z-10 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <Breadcrumb 
          links={breadcrumbLinks}
          linkRouter={Link}
          size="default"
        />
      </div>

      <div className="flex items-center gap-0">
        {/* Auto-save indicator */}
        {saveStatus !== 'idle' && (
          <div className="flex items-center border-r border-neutral-300 pr-3 mr-3">
            <Box
                css={{
                  '& button': {
                    color: getThemedColor('neutral', 800)
                  },
                }}
              >
              {saveStatus === 'saving' && (
                <Button
                  variant='borderless'
                  size='small'
                  loading={true}
                  label={t('assessment.autoSave.status.saving')}
                  disabled
                />
              )}
              {saveStatus === 'saved' && (
                <Button
                  variant='borderless'
                  size='small'
                  leftIcon={<CheckIcon />}
                  label={t('assessment.autoSave.status.saved')}
                  disabled
                />
              )}
            </Box>
            {saveStatus === 'error' && (
              <Box
                css={{
                  '& button': {
                    color: getThemedColor('error', 500)
                  },
                }}
                >
                  <Button
                    variant='borderless'
                    size='small'
                    leftIcon={<ErrorCircleFilledIcon />}
                    label={t('assessment.autoSave.status.error')}
                    disabled
                  />
                </Box>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
