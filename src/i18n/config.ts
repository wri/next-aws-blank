/**
 * i18n Configuration
 * 
 * Defines supported locales for the application
 */

export const locales = ['en', 'es', 'fr', 'pt'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]
