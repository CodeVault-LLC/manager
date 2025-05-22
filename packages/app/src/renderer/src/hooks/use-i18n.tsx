import { TranslationKeys, Translations } from '@shared/types/i18n'
import { useEffect, useState } from 'react'
import { useApplicationStore } from '@renderer/core/store/application.store'

declare global {
  interface Window {
    i18n: {
      getLocale: () => Translations
      setLocale: (lang: string) => Translations
    }
  }
}

export const useI18n = () => {
  const { language } = useApplicationStore()
  const [locale, setLocale] = useState<Translations | null>(null)

  useEffect(() => {
    if (language) {
      changeLanguage(language)
    }
  }, [language])

  const changeLanguage = (lang: string) => {
    if (!window.i18n) return

    console.log('Changing language to:', lang)

    setLocale(window.i18n.setLocale(lang))
  }

  // Utility to retrieve nested keys
  const getNestedValue = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const t = (key: TranslationKeys, params?: Record<string, string>) => {
    if (!locale) return key

    let translation = getNestedValue(locale, key) || key
    if (params) {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{${param}}`, params[param])
      })
    }
    return translation
  }

  return { t, changeLanguage }
}
