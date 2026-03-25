/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PasswordPrompt } from '../PasswordPrompt'

// Type definitions for mock components
type ButtonProps = {
  label: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
}

type InlineMessageProps = {
  label: string
  variant?: string
}

type PanelProps = {
  content: React.ReactNode
}

type PasswordProps = {
  label: string
  onChange: (data: {
    password: string
    strength: string
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    specialCharacters: boolean
  }) => void
  hideValidations?: boolean
  required?: boolean
  disabled?: boolean
}

type TextInputProps = {
  label?: string
  onChange?: (value: string) => void
  value?: string
  disabled?: boolean
  required?: boolean
}

type ChakraBoxProps = {
  children: React.ReactNode
  [key: string]: unknown
}

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock WRI Design System components
jest.mock('@worldresources/wri-design-systems', () => ({
  Button: ({ label, disabled, type, onClick, className }: ButtonProps) => (
    <button 
      type={type} 
      disabled={disabled} 
      onClick={onClick}
      className={className}
      data-testid="submit-button"
    >
      {label}
    </button>
  ),
  InlineMessage: ({ label, variant }: InlineMessageProps) => (
    <div data-testid="inline-message" data-variant={variant}>
      {label}
    </div>
  ),
  Panel: ({ content }: PanelProps) => <div data-testid="panel">{content}</div>,
  Password: ({ label, onChange, required, disabled }: PasswordProps) => (
    <div data-testid="password-input">
      <label>{label}</label>
      <input
        type="password"
        data-testid="password-field"
        onChange={(e) =>
          onChange({
            password: e.target.value,
            strength: 'strong',
            length: true,
            uppercase: true,
            lowercase: true,
            numbers: true,
            specialCharacters: true,
          })
        }
        disabled={disabled}
        required={required}
      />
    </div>
  ),
  TextInput: ({ label, onChange, value, disabled, required }: TextInputProps) => (
    <div data-testid="text-input">
      <label>{label}</label>
      <input
        type="text"
        data-testid="password-field"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
      />
    </div>
  ),
}))

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: ChakraBoxProps) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: ChakraBoxProps) => <span {...props}>{children}</span>,
}))

// Mock useTranslations from i18n/useTranslations
jest.mock('@/i18n/useTranslations', () => ({
  useTranslations: () => {
    // Simple mock that returns English translations
    const translations: Record<string, string> = {
      'passwordPrompt.title': 'Enter password to access the diagnostic',
      'passwordPrompt.passwordLabel': 'Password',
      'passwordPrompt.tooManyAttempts': 'Too many attempts',
      'passwordPrompt.submitButton': 'Resume diagnostic',
      'passwordPrompt.submitting': 'Authenticating...',
      'passwordPrompt.timeRemaining': 'Time remaining: {time}',
      'passwordPrompt.errors.required': 'Password is required',
      'passwordPrompt.errors.rateLimited': 'Too many failed attempts. Please try again in {time}.',
      'passwordPrompt.errors.incorrect': 'The password is incorrect or does not match this diagnostic. If the issue persists, please contact our team.',
      'passwordPrompt.errors.generic': 'An error occurred while authenticating. Please try again later.',
      'passwordPrompt.errors.network': 'Unable to connect to the server. Please check your connection and try again.',
      'passwordPrompt.time.minuteSingular': '{count} minute',
      'passwordPrompt.time.minutePlural': '{count} minutes',
      'passwordPrompt.time.secondSingular': '{count} second',
      'passwordPrompt.time.secondPlural': '{count} seconds',
    }

    return (key: string, values?: Record<string, string>) => {
      let result = translations[key] || key
      if (values) {
        Object.entries(values).forEach(([k, v]) => {
          result = result.replaceAll(`{${k}}`, v)
        })
      }
      return result
    }
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('PasswordPrompt Component', () => {
  let mockRouter: { refresh: jest.Mock; push: jest.Mock }
  let mockFetch: jest.MockedFunction<typeof fetch>
  let mockSearchParams: { get: jest.Mock }
  let mockLocationReload: jest.Mock
  let originalLocation: Location

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Mock window.location
    originalLocation = window.location
    mockLocationReload = jest.fn()
    
    // Track href assignments
    let currentHref = originalLocation.href
    
    // @ts-expect-error - Mocking window.location for tests
    delete window.location
    // @ts-expect-error - Mocking window.location for tests
    window.location = {
      ...originalLocation,
      reload: mockLocationReload,
      get href() {
        return currentHref
      },
      set href(url: string) {
        currentHref = url
      }
    } as Location

    mockRouter = {
      refresh: jest.fn(),
      push: jest.fn(),
    }
    mockSearchParams = {
      get: jest.fn(() => null), // No returnTo by default
    }
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    // Restore window.location
    // @ts-expect-error - Restoring window.location for tests
    window.location = originalLocation
  })

  describe('Basic rendering', () => {
    it('should render password input', () => {
      render(<PasswordPrompt assessmentId="test-123" />)
      expect(screen.getByTestId('password-field')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<PasswordPrompt assessmentId="test-123" />)
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should show correct button text initially', () => {
      render(<PasswordPrompt assessmentId="test-123" />)
      expect(screen.getByText('Resume diagnostic')).toBeInTheDocument()
    })

    it('should disable submit button when password is empty', () => {
      render(<PasswordPrompt assessmentId="test-123" />)
      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form submission', () => {
    it('should enable submit button when password is entered', () => {
      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'test-password' } })

      expect(submitButton).not.toBeDisabled()
    })

    it('should show loading state during submission', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                json: async () => ({ success: true }),
              } as Response)
            }, 1000)
          })
      )

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'test-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Authenticating...')).toBeInTheDocument()
      })
    })

    it('should call fetch with correct endpoint and payload', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)

      render(<PasswordPrompt assessmentId="assessment-456" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'my-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/assessments/assessment-456/login',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'my-password' }),
          })
        )
      })
    })

    it('should refresh router on successful login', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'correct-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLocationReload).toHaveBeenCalled()
      })
    })
  })

  describe('Error handling', () => {
    it('should show error on 401 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid password' }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'wrong-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('inline-message')).toHaveTextContent(
          'The password is incorrect or does not match this diagnostic'
        )
      })
    })

    it('should show generic error on non-401 failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('inline-message')).toHaveTextContent(
          'An error occurred while authenticating'
        )
      })
    })

    it('should show network error on fetch failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('inline-message')).toHaveTextContent(
          'Unable to connect to the server'
        )
      })
    })

    it('should clear error when user types again', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid password' }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      // Submit with wrong password
      fireEvent.change(passwordField, { target: { value: 'wrong-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('inline-message')).toBeInTheDocument()
      })

      // Type again
      fireEvent.change(passwordField, { target: { value: 'new-password' } })

      await waitFor(() => {
        expect(screen.queryByTestId('inline-message')).not.toBeInTheDocument()
      })
    })

    it('should show Required error when submitting empty password', () => {
      render(<PasswordPrompt assessmentId="test-123" />)
      const form = screen.getByTestId('password-field').closest('form')!

      fireEvent.submit(form)

      waitFor(() => {
        expect(screen.getByTestId('inline-message')).toHaveTextContent(
          'Password is required'
        )
      })
    })
  })

  describe('Rate limiting', () => {
    it('should display error on 429 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 600 }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('inline-message')).toHaveTextContent(
          'Too many failed attempts. Please try again in 10 minute'
        )
      })
    })

    it('should display countdown timer', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 65 }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Time remaining:/)).toBeInTheDocument()
      })

      // The time should be displayed somewhere
      const timeDisplay = screen.getByText(/Time remaining:/).parentElement
      expect(timeDisplay?.textContent).toMatch(/1 minute/)
      expect(timeDisplay?.textContent).toMatch(/5 seconds/)
    })

    it('should disable form when rate limited', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 600 }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('password-field')).toBeDisabled()
        expect(screen.getByTestId('submit-button')).toBeDisabled()
      })
    })

    it('should decrement countdown every second', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 5 }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const timeDisplay = screen.getByText(/Time remaining:/).parentElement
        expect(timeDisplay?.textContent).toMatch(/5 second/)
      })

      // Advance timer by 1 second
      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        const timeDisplay = screen.getByText(/Time remaining:/).parentElement
        expect(timeDisplay?.textContent).toMatch(/4 second/)
      })
    })

    it('should re-enable form after countdown reaches zero', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 2 }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('password-field')).toBeDisabled()
      })

      // Advance timer by 3 seconds (more than retryAfter)
      jest.advanceTimersByTime(3000)

      await waitFor(() => {
        expect(screen.getByTestId('password-field')).not.toBeDisabled()
        expect(screen.queryByTestId('inline-message')).not.toBeInTheDocument()
      })
    })

    it('should not clear rate limit error when typing', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 600 }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('inline-message')).toBeInTheDocument()
      })

      // Try to type again (field is disabled but test the logic)
      fireEvent.change(passwordField, { target: { value: 'new-password' } })

      // Error should still be visible
      expect(screen.getByTestId('inline-message')).toBeInTheDocument()
    })

    it('should format time correctly for minutes and seconds', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 125 }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const timeDisplay = screen.getByText(/Time remaining:/).parentElement
        expect(timeDisplay?.textContent).toMatch(/2 minutes 5 seconds/)
      })
    })

    it('should format time correctly for seconds only', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 45 }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const timeDisplay = screen.getByText(/Time remaining:/).parentElement
        expect(timeDisplay?.textContent).toMatch(/45 seconds/)
        expect(timeDisplay?.textContent).not.toMatch(/minute/)
      })
    })

    it('should handle default retryAfter when not provided', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts' }),
      } as Response)

      render(<PasswordPrompt assessmentId="test-123" />)
      const passwordField = screen.getByTestId('password-field')
      const submitButton = screen.getByTestId('submit-button')

      fireEvent.change(passwordField, { target: { value: 'any-password' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        // The error message has "15 minute" in it
        const errorMessage = screen.getByTestId('inline-message')
        expect(errorMessage.textContent).toMatch(/15 minute/) // 900 seconds = 15 minutes
      })
    })
  })

  describe('returnTo Redirect Functionality', () => {
    describe('Valid returnTo redirects', () => {
      it('should redirect to returnTo URL when valid motivate theme provided', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/test-123/motivate')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'correct-password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(window.location.href).toBe('/assessment/test-123/motivate')
          expect(mockLocationReload).not.toHaveBeenCalled()
        })
      })

      it('should redirect to returnTo URL when valid enable theme provided', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/abc-456/enable')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="abc-456" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'correct-password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(window.location.href).toBe('/assessment/abc-456/enable')
          expect(mockLocationReload).not.toHaveBeenCalled()
        })
      })

      it('should redirect to returnTo URL when valid implement theme provided', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/xyz-789/implement')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="xyz-789" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'correct-password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(window.location.href).toBe('/assessment/xyz-789/implement')
          expect(mockLocationReload).not.toHaveBeenCalled()
        })
      })

      it('should redirect to returnTo URL when valid enabling-conditions theme provided', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/test-123/enabling-conditions')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'correct-password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(window.location.href).toBe('/assessment/test-123/enabling-conditions')
          expect(mockLocationReload).not.toHaveBeenCalled()
        })
      })
    })

    describe('Security: Invalid returnTo handling', () => {
      it('should refresh instead of redirecting when returnTo has wrong assessment ID', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/wrong-id/motivate')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="correct-id" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          // href should not be changed
          expect(window.location.href).not.toBe('/assessment/wrong-id/motivate')
        })
      })

      it('should refresh instead of redirecting when returnTo has extra path segments', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/test-123/motivate/extra')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          expect(window.location.href).not.toBe('/assessment/test-123/motivate/extra')
        })
      })

      it('should refresh instead of redirecting when returnTo has query parameters', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/test-123/motivate?redirect=https://evil.com')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          expect(window.location.href).not.toContain('?redirect=')
        })
      })

      it('should refresh instead of redirecting when returnTo has URL fragments', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/test-123/motivate#section')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          expect(window.location.href).not.toContain('#section')
        })
      })

      it('should refresh instead of redirecting when returnTo has URL-encoded slashes', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/test-123/motivate%2Fextra')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          expect(window.location.href).not.toContain('%2F')
        })
      })

      it('should refresh instead of redirecting when returnTo is absolute URL', async () => {
        mockSearchParams.get.mockReturnValue('https://evil.com/assessment/test-123/motivate')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          expect(window.location.href).not.toBe('https://evil.com/assessment/test-123/motivate')
        })
      })

      it('should refresh instead of redirecting when returnTo is protocol-relative URL', async () => {
        mockSearchParams.get.mockReturnValue('//evil.com/assessment/test-123/motivate')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          expect(window.location.href).not.toBe('//evil.com/assessment/test-123/motivate')
        })
      })
    })

    describe('Fallback behavior', () => {
      it('should call router.refresh() when returnTo is null', async () => {
        mockSearchParams.get.mockReturnValue(null)
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
        })
      })

      it('should call router.refresh() when returnTo does not start with /assessment/', async () => {
        mockSearchParams.get.mockReturnValue('/other-route/test-123/motivate')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          expect(window.location.href).not.toBe('/other-route/test-123/motivate')
        })
      })

      it('should call router.refresh() when returnTo has empty theme segment', async () => {
        mockSearchParams.get.mockReturnValue('/assessment/test-123/')
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response)

        render(<PasswordPrompt assessmentId="test-123" />)
        const passwordField = screen.getByTestId('password-field')
        const submitButton = screen.getByTestId('submit-button')

        fireEvent.change(passwordField, { target: { value: 'password' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLocationReload).toHaveBeenCalled()
          expect(window.location.href).not.toBe('/assessment/test-123/')
        })
      })
    })
  })
})
