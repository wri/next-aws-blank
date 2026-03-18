'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { createTranslator } from './utils'

export const useTranslations = () => {
  const { language } = useLanguage()

  return createTranslator(language)
}
