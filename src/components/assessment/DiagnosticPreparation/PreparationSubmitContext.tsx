'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type PreparationSubmitAction = 'advance' | 'exit'
export type PreparationSubmitHandler = (
  action?: PreparationSubmitAction,
) => Promise<void> | void

type PreparationSubmitContextValue = {
  submitHandler: PreparationSubmitHandler | null
  registerSubmitHandler: (handler: PreparationSubmitHandler | null) => void
}

const PreparationSubmitContext =
  createContext<PreparationSubmitContextValue | null>(null)

export const PreparationSubmitProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [submitHandler, setSubmitHandler] =
    useState<PreparationSubmitHandler | null>(null)

  const registerSubmitHandler = useCallback(
    (handler: PreparationSubmitHandler | null) => {
      setSubmitHandler(() => handler)
    },
    [],
  )

  const value = useMemo(
    () => ({ submitHandler, registerSubmitHandler }),
    [registerSubmitHandler, submitHandler],
  )

  return (
    <PreparationSubmitContext.Provider value={value}>
      {children}
    </PreparationSubmitContext.Provider>
  )
}

export const usePreparationSubmit = () => {
  const context = useContext(PreparationSubmitContext)

  if (!context) {
    throw new Error(
      'usePreparationSubmit must be used within a PreparationSubmitProvider',
    )
  }

  return context
}
