'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => {
    if (typeof document === 'undefined') {
      return 'en'
    }
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('language='))
    const cookieLang = match?.split('=')[1]
    return cookieLang || 'en'
  })

  // Persist selection for server-rendered routes
  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    if (typeof document !== 'undefined') {
      document.cookie = `language=${lang}; path=/; max-age=31536000`
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
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
