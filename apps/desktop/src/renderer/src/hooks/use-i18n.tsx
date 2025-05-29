import { TranslationKeys, Translations } from '@manager/common/src'
import { useApplicationStore } from '@renderer/core/store/application.store'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    i18n: {
      getLocale: () => Translations
      setLocale: (lang: string) => Translations
    }
  }
}

let currentLocale: Translations | null = null

const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

const applyParams = (text: string, params?: Record<string, string>): string => {
  if (!params) return text
  return Object.keys(params).reduce(
    (result, key) => result.replace(`{${key}}`, params[key]),
    text
  )
}

// Shared logic for translation
export const translate = (
  key: TranslationKeys,
  params?: Record<string, string>
): string => {
  if (!currentLocale) return key
  const raw = getNestedValue(currentLocale, key) || key
  return applyParams(raw, params)
}

// Can be used in React components
export const useI18n = () => {
  const { language } = useApplicationStore()
  const [, setLocale] = useState<Translations | null>(currentLocale)

  useEffect(() => {
    if (language) {
      const newLocale = changeLanguage(language)
      setLocale(newLocale)
    }
  }, [language])

  const changeLanguage = (lang: string): Translations | null => {
    if (!window.i18n) return null
    currentLocale = window.i18n.setLocale(lang)
    setLocale(currentLocale)
    return currentLocale
  }

  return { t: translate, changeLanguage }
}

// Can be used in plain TypeScript files
export const getValue = (
  key: TranslationKeys,
  params?: Record<string, string>
): string => {
  return translate(key, params)
}

// Optional: Expose manual language change for non-hook contexts
export const setLanguage = (lang: string): Translations | null => {
  if (!window.i18n) return null
  currentLocale = window.i18n.setLocale(lang)
  return currentLocale
}
