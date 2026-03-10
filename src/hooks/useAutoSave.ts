'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  onSave: (data: T) => Promise<void>
  debounceMs?: number
  onStatusChange?: (status: AutoSaveStatus, error: string | null) => void
}

interface AutoSaveState {
  status: AutoSaveStatus
  lastSaved: Date | null
  error: string | null
}

export function useAutoSave<T = unknown>({ onSave, debounceMs = 1000, onStatusChange }: UseAutoSaveOptions<T>) {
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
  const idleResetTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingDataRef = useRef<T | null>(null)
  
  const save = useCallback(async (data: T, immediate = false) => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (idleResetTimeoutRef.current) {
      clearTimeout(idleResetTimeoutRef.current)
      idleResetTimeoutRef.current = null
    }
    
    pendingDataRef.current = data
    
    const executeSave = async () => {
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
        
        // Reset to idle after 2 seconds
        idleResetTimeoutRef.current = setTimeout(() => {
          setState(prev => {
            if (prev.status === 'saved') {
              return { ...prev, status: 'idle' }
            }
            return prev
          })
          idleResetTimeoutRef.current = null
        }, 2000)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save'
        setState({
          status: 'error',
          lastSaved: null,
          error: errorMessage
        })
      }
    }
    
    if (immediate) {
      await executeSave()
    } else {
      timeoutRef.current = setTimeout(executeSave, debounceMs)
    }
  }, [onSave, debounceMs])
  
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
      if (idleResetTimeoutRef.current) {
        clearTimeout(idleResetTimeoutRef.current)
      }
    }
  }, [])
  
  return { ...state, save, clearError }
}
