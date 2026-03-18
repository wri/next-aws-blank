import en from '@/i18n/translations/en.json'
import es from '@/i18n/translations/es.json'
import fr from '@/i18n/translations/fr.json'
import pt from '@/i18n/translations/pt.json'

type Messages = Record<string, unknown>
type TranslationValues = Record<string, string | number>

const messagesByLanguage: Record<string, Messages> = {
  en,
  es,
  fr,
  pt,
}

const getNestedValue = (messages: Messages, key: string): unknown =>
  key.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in value) {
      return (value as Record<string, unknown>)[segment]
    }

    return undefined
  }, messages)

const interpolate = (message: string, values?: TranslationValues) => {
  if (!values) {
    return message
  }

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    message,
  )
}

export const getMessages = (language?: string) =>
  messagesByLanguage[language ?? 'en'] ?? (en as Messages)

export const translate = (
  language: string | undefined,
  key: string,
  values?: TranslationValues,
) => {
  const localizedValue = getNestedValue(getMessages(language), key)
  const fallbackValue = getNestedValue(en, key)
  const value = localizedValue ?? fallbackValue

  if (typeof value !== 'string') {
    return key
  }

  return interpolate(value, values)
}

export const createTranslator =
  (language?: string) => (key: string, values?: TranslationValues) =>
    translate(language, key, values)
