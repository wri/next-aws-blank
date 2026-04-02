/**
 * i18n Configuration
 * 
 * Defines supported locales for the application
 */

export const locales = ['en', 'es', 'fr', 'pt'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

const localeSet = new Set<Locale>(locales)

export const isLocale = (value: string): value is Locale =>
  localeSet.has(value as Locale)

export const normalizeLocale = (
  locale?: string | null,
): Locale => {
  if (!locale) {
    return defaultLocale
  }

  const normalized = locale.trim().toLowerCase()
  if (isLocale(normalized)) {
    return normalized
  }

  const languageSubtag = normalized.split(/[-_]/)[0]
  if (isLocale(languageSubtag)) {
    return languageSubtag
  }

  return defaultLocale
}
