'use client'

import { Button, getThemedColor } from '@worldresources/wri-design-systems'
import { Box } from '@chakra-ui/react'
import { CheckIcon, ErrorCircleFilledIcon, ShareIcon } from '@/components/icons'
import type { AutoSaveStatus } from '@/hooks/useAutoSave'

interface SubNavbarProps {
  saveStatus?: AutoSaveStatus
}

export function SubNavbar({ saveStatus = 'idle' }: SubNavbarProps) {
  return (
    <div className="mx-auto py-2 px-4 flex items-center h-[44px] justify-between border-t-2 border-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-md text-grey-700">Overview</h2>
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
                  label='Saving progress'
                  disabled
                />
              )}
              {saveStatus === 'saved' && (
                <Button
                  variant='borderless'
                  size='small'
                  leftIcon={<CheckIcon />}
                  label='Progress auto-saved'
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
                  label='Error saving progress'
                  disabled
                />
              </Box>
            )}
          </div>
        )}

        {/* Share button (static, no functionality) */}
        <Button
          variant='borderless'
          size='small'
          leftIcon={<ShareIcon />}
          label='Share'
        />
      </div>
    </div>
  )
}
