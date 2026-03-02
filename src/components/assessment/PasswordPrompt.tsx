'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Button,
  InlineMessage,
  Panel,
  Password,
  TextInput,
} from '@worldresources/wri-design-systems'
import { Box, Text } from '@chakra-ui/react'

interface PasswordPromptProps {
  assessmentId: string
}

export function PasswordPrompt({ assessmentId }: PasswordPromptProps) {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number>(0)

  // Countdown timer for rate limiting
  useEffect(() => {
    if (retryAfter <= 0) {
      setIsRateLimited(false)
      return
    }

    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        const newValue = prev - 1
        if (newValue <= 0) {
          setIsRateLimited(false)
          setError(null)
        }
        return newValue
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [retryAfter])

  const formatRetryTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''}`
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!password) {
      setError('Password is required')
      return
    }

    if (isRateLimited) {
      return
    }

    // Clear any existing errors
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      // Handle rate limiting
      if (response.status === 429) {
        const data = await response.json()
        const retryAfterSeconds = data.retryAfter || 900 // Default to 15 minutes
        setRetryAfter(retryAfterSeconds)
        setIsRateLimited(true)
        setError(`Too many failed attempts. Please try again in ${formatRetryTime(retryAfterSeconds)}.`)
        setIsLoading(false)
        return
      }

      if (response.status === 401) {
        setError(
          'The password is incorrect or does not match this diagnostic. If the issue persists, please contact our team.',
        )
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        setError(
          'An error occurred while authenticating. Please try again later.',
        )
        setIsLoading(false)
        return
      }

      // Success - redirect to intended URL or reload page
      if (returnTo && returnTo.startsWith('/assessment/')) {
        // Validate returnTo is a safe relative URL for this assessment
        const expectedPrefix = `/assessment/${assessmentId}/`
        
        if (returnTo.startsWith(expectedPrefix)) {
          const remainder = returnTo.slice(expectedPrefix.length)
          
          // Validate theme segment: must have content, no slashes, no query params, no fragments, no URL encoding
          const isValidTheme = remainder.length > 0 && 
                              !remainder.includes('/') && 
                              !remainder.includes('?') && 
                              !remainder.includes('#') &&
                              !remainder.includes('%')
          
          if (isValidTheme) {
            // Use hard navigation to ensure cookie is recognized
            window.location.href = returnTo
          } else {
            // If returnTo is invalid, reload current page
            window.location.reload()
          }
        } else {
          // Wrong assessment ID or invalid format - reload
          window.location.reload()
        }
      } else {
        // No returnTo parameter or doesn't start with /assessment/ - reload current page
        window.location.reload()
      }
    } catch (error) {
      console.warn(error);
      setError(
        'Unable to connect to the server. Please check your connection and try again.',
      )
      setIsLoading(false)
    }
  }

  const handlePasswordChange = ({
    password: newPassword,
  }: {
    strength: string
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    specialCharacters: boolean
    password: string
  }) => {
    setPassword(newPassword)
    // Clear error when user starts typing again (except rate limit errors)
    if (error && !isRateLimited) {
      setError(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-b from-white to-primary-200 min-h-[100vh]">
      <div className="max-w-[540px] py-16 w-full flex flex-col overflow-y-auto mx-auto">
        <div className="border border-neutral-300 m-auto rounded-none sm:rounded-[10px] overflow-hidden mb-6 w-full">
          <Panel 
            width='540px'
            content={
              <div className='p-6 sm:p-8'>
                <Text 
                  fontSize='3xl' 
                  fontWeight='bold' 
                  marginBottom={3} 
                  textAlign='left'
                  lineHeight={'short'}>
                  Enter password to access the diagnostic
                </Text>

                <Box marginBottom={error ? 3 : 5}>
                  {isRateLimited ? (
                    <TextInput
                        caption="Too many attempts"
                        disabled
                      /> 
                    ) : (
                    <Password
                      label='Password'
                      onChange={handlePasswordChange}
                      hideValidations
                      required
                    />
                  )}
                </Box>

                {error && (
                  <Box marginBottom={3}>
                    <InlineMessage 
                      size='full-width'
                      variant='error' 
                      label={error}
                    />
                  </Box>
                )}

                {isRateLimited && retryAfter > 0 && (
                  <Box marginBottom={3}>
                    <Text fontSize='sm' color='neutral.700'>
                      Time remaining: {formatRetryTime(retryAfter)}
                    </Text>
                  </Box>
                )}

                <Button
                  type='submit'
                  label={isLoading ? 'Authenticating...' : 'Resume diagnostic'}
                  disabled={isLoading || !password || isRateLimited}
                  className='w-full'
                />
              </div>
            }
          />
        </div>
      </div>
    </form>
  )
}
