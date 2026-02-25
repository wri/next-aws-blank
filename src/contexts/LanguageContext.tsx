'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to English ('en')
  const [language, setLanguage] = useState('en')

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
