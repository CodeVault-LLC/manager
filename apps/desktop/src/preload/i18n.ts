import en from '@shared/locales/en.json'
import no from '@shared/locales/no.json'
import { Locale, Translations } from '@shared/types/i18n'
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
