'use client'

import { useState, useEffect, useRef } from 'react'
import { Button, TextInput, Modal, Checkbox, IconButton } from '@worldresources/wri-design-systems'
import { CheckIcon, CopyIcon } from '@/components/icons'
import { Box, Text } from '@chakra-ui/react'

interface AccessDetailsModalProps {
  open: boolean
  assessmentId: string
  password: string
  onContinue: () => void
}

export function AccessDetailsModal({
  open,
  assessmentId,
  password,
  onContinue,
}: AccessDetailsModalProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [bothCopied, setBothCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const linkTimerRef = useRef<NodeJS.Timeout | null>(null)
  const passwordTimerRef = useRef<NodeJS.Timeout | null>(null)
  const bothTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (linkTimerRef.current) clearTimeout(linkTimerRef.current)
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current)
      if (bothTimerRef.current) clearTimeout(bothTimerRef.current)
    }
  }, [])

  const assessmentLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/assessment/${assessmentId}`
    : `/assessment/${assessmentId}`

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(assessmentLink)
        setLinkCopied(true)
        if (linkTimerRef.current) clearTimeout(linkTimerRef.current)
        linkTimerRef.current = setTimeout(() => setLinkCopied(false), 2000)
      } else {
        // Fallback for browsers without Clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = assessmentLink
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (!success) {
          throw new Error('execCommand copy failed')
        }
        setLinkCopied(true)
        if (linkTimerRef.current) clearTimeout(linkTimerRef.current)
        linkTimerRef.current = setTimeout(() => setLinkCopied(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Still show copied feedback even if there's an error
      // User can manually copy from the input field
    }
  }

  const handleCopyPassword = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(password)
        setPasswordCopied(true)
        if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current)
        passwordTimerRef.current = setTimeout(() => setPasswordCopied(false), 2000)
      } else {
        // Fallback for browsers without Clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = password
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (!success) {
          throw new Error('execCommand copy failed')
        }
        setPasswordCopied(true)
        if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current)
        passwordTimerRef.current = setTimeout(() => setPasswordCopied(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy password:', error)
      // Still show copied feedback even if there's an error
      // User can manually copy from the input field
    }
  }

  const handleCopyBoth = async () => {
    const textToCopy = `${assessmentLink}\n${password}`
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy)
        setBothCopied(true)
        if (bothTimerRef.current) clearTimeout(bothTimerRef.current)
        bothTimerRef.current = setTimeout(() => setBothCopied(false), 2000)
      } else {
        // Fallback for browsers without Clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (!success) {
          throw new Error('execCommand copy failed')
        }
        setBothCopied(true)
        if (bothTimerRef.current) clearTimeout(bothTimerRef.current)
        bothTimerRef.current = setTimeout(() => setBothCopied(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy link and password:', error)
    }
  }

  return (
    <Modal
      open={open}
      size="medium"
      header={<Text fontWeight={'bold'}>Save your access details</Text>}
      blocking={true}
      content={
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            This diagnostic doesn&apos;t use accounts. To keep your progress secure and return later, 
            you&apos;ll need to save both the diagnostic link and password.
          </p>

          {/* input box */}
          <div className="p-4 space-y-4 border border-slate-300 rounded-md">
              {/* diagnostic Link */}
              <div className="flex space-y-1">
                <div className="flex-1">
                  <label className="block text-sm text-neutral-900">Diagnostic link</label>
                  <Box className="flex items-center justify-center gap-3" 
                    css={{
                      '& .ds-text-input-container': {
                        marginBottom: '8px'
                      }
                    }}>
                    <TextInput
                      value={assessmentLink}
                      disabled
                      aria-label="Diagnostic link"
                    />
                    <IconButton
                      padding="8px !important"
                      icon={linkCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                      onClick={handleCopyLink}
                      aria-label={linkCopied ? 'Diagnostic link copied to clipboard' : 'Copy diagnostic link to clipboard'}
                      aria-live="polite"
                    />
                  </Box>
                </div>
              </div>

              {/* Password */}
              <div className="flex space-y-1">
                <div className="flex-1">
                  <label className="block text-sm text-neutral-900">Password</label>
                  <Box className="flex items-center justify-center gap-3" 
                    css={{
                      '& .ds-text-input-container': {
                        marginBottom: '8px'
                      }
                    }}>
                    <TextInput
                      value={password}
                      disabled
                      aria-label="Password"
                    />
                    <IconButton
                      padding="8px !important"
                      icon={passwordCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                      onClick={handleCopyPassword}
                      aria-label={passwordCopied ? 'Password copied to clipboard' : 'Copy password to clipboard'}
                      aria-live="polite"
                    />
                  </Box>
                </div>
              </div>

              {/* Copy Both Button */}
              <div className="pt-2">
                <Button
                  variant="secondary"
                  leftIcon={<CopyIcon className="w-4 h-4" />}
                  label={bothCopied ? 'Copied!' : 'Copy link & password'}
                  onClick={handleCopyBoth}
                  aria-label={bothCopied ? 'Link and password copied to clipboard' : 'Copy both link and password to clipboard'}
                  aria-live="polite"
                />
              </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start transition-all">
            <Checkbox
              name="Checkbox"
              onCheckedChange={({checked}) => setConfirmed(Boolean(checked))}
              checked={confirmed}
            >
              I&apos;ve saved the link and password securely, and understand that if I lose these I will not be able to access the diagnostic.
            </Checkbox>
          </label>

          {/* Start Button */}
          <div>
            <Button
              label="Continue"
              variant="primary"
              size="default"
              onClick={onContinue}
              disabled={!confirmed}
            />
          </div>
        </div>
      }
    />
  )
}
