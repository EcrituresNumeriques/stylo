import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

i18n
  .use(
    resourcesToBackend(
      (language, namespace) => import(`./locales/${language}/${namespace}.json`)
    )
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    // normalize detected languages (fr-FR, en-US@POSIX…) to a supported one
    supportedLngs: ['fr', 'en', 'es'],
    interpolation: {
      escapeValue: false,
      skipOnVariables: false,
    },
  })

i18n.on('languageChanged', (lng) => (document.documentElement.lang = lng))

export default i18n
