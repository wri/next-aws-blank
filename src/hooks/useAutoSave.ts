'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseAutoSaveOptions<T> {
  onSave: (data: T) => Promise<void>
  debounceMs?: number
}

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
  error: string | null
}

export function useAutoSave<T = unknown>({ onSave, debounceMs = 1000 }: UseAutoSaveOptions<T>) {
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null
  })
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingDataRef = useRef<T | null>(null)
  
  const save = useCallback(async (data: T, immediate = false) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
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
        setTimeout(() => {
          setState(prev => prev.status === 'saved' ? { ...prev, status: 'idle' } : prev)
        }, 2000)
      } catch (error) {
        setState({
          status: 'error',
          lastSaved: null,
          error: error instanceof Error ? error.message : 'Failed to save'
        })
      }
    }
    
    if (immediate) {
      await executeSave()
    } else {
      timeoutRef.current = setTimeout(executeSave, debounceMs)
    }
  }, [onSave, debounceMs])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return { ...state, save }
}
