// eslint-disable-next-line no-restricted-imports
import en from '@manager/common/src/locales/en.json'
// eslint-disable-next-line no-restricted-imports
import no from '@manager/common/src/locales/no.json'

import { Locale, Translations } from '@manager/common/src'
import { contextBridge } from 'electron'

export const loadLocale = (lang: Locale): Translations => {
  switch (lang) {
    case 'en':
      return en
    case 'no':
      return no
    default:
      return en
  }
}

export const exposeToMainWorld = () => {
  let currentLang: Locale = 'en'

  // Expose i18n functions to the renderer
  contextBridge.exposeInMainWorld('i18n', {
    getLocale: (): Translations => loadLocale(currentLang),
    setLocale: (lang: Locale): Translations => {
      currentLang = lang
      return loadLocale(currentLang)
    }
  })
}
