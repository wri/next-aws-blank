'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  onSave: (data: T) => Promise<void>
  debounceMs?: number
  retryDelayMs?: number
  onStatusChange?: (status: AutoSaveStatus, error: string | null) => void
}

interface AutoSaveState {
  status: AutoSaveStatus
  lastSaved: Date | null
  error: string | null
}

export function useAutoSave<T = unknown>({
  onSave,
  debounceMs = 1000,
  retryDelayMs = 5000,
  onStatusChange,
}: UseAutoSaveOptions<T>) {
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null
  })
  const onStatusChangeRef = useRef(onStatusChange)
  
  // Keep ref in sync
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  // Notify parent of status changes via effect (avoids setState-during-render)
  useEffect(() => {
    onStatusChangeRef.current?.(state.status, state.error)
  }, [state.status, state.error])
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingDataRef = useRef<T | null>(null)
  
  const save = useCallback(async (data: T, immediate = false) => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    
    pendingDataRef.current = data
    
    const executeSave = async () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      setState(prev => ({ ...prev, status: 'saving', error: null }))
      
      try {
        if (pendingDataRef.current !== null) {
          await onSave(pendingDataRef.current)
        }
        setState({
          status: 'saved',
          lastSaved: new Date(),
          error: null
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save'
        setState({
          status: 'error',
          lastSaved: null,
          error: errorMessage
        })

        // Keep retrying in the background until save succeeds.
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null
          if (pendingDataRef.current !== null) {
            void executeSave()
          }
        }, retryDelayMs)
      }
    }
    
    if (immediate) {
      await executeSave()
    } else {
      timeoutRef.current = setTimeout(executeSave, debounceMs)
    }
  }, [onSave, debounceMs, retryDelayMs])

  useEffect(() => {
    const handleOnline = () => {
      if (state.status === 'error' && pendingDataRef.current !== null) {
        void save(pendingDataRef.current, true)
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [state.status, save])
  
  // Clear error state (used when user acknowledges error via "Continue anyway")
  const clearError = useCallback(() => {
    setState(prev => {
      if (prev.status === 'error') {
        return { ...prev, status: 'idle', error: null }
      }
      return prev
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])
  
  return { ...state, save, clearError }
}
