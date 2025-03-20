import { Locale, Translations } from '@shared/types/i18n'
import { contextBridge } from 'electron'

import en from '@shared/locales/en.json'
import no from '@shared/locales/no.json'

export const loadLocale = (lang: Locale): Translations => {
  switch (lang) {
    case 'en':
      return en
    case 'no':
      return no
  }
}

export const exposeToMainWorld = () => {
  let currentLang: Locale = 'no'

  // Expose i18n functions to the renderer
  contextBridge.exposeInMainWorld('i18n', {
    getLocale: (): Translations => loadLocale(currentLang),
    setLocale: (lang: Locale): Translations => {
      currentLang = lang
      return loadLocale(currentLang)
    }
  })
}
