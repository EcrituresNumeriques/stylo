import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useComponentVisible from '../../hooks/componentVisible.js'
import i18n from '../../i18n.js'
import LanguagesIcon from './LanguagesIcon.jsx'
import styles from './LanguagesMenu.module.scss'

export default function LanguagesMenu() {
  const { t } = useTranslation()
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false)

  const [language, setLanguage] = useState(i18n.language)

  useEffect(() => {
    setLanguage(i18n.language)
  }, [i18n.language])

  const handleLanguageChange = useCallback(async (value) => {
    await i18n.changeLanguage(value)
    setLanguage(value)
  }, [])

  useEffect(() => {
    setIsComponentVisible(false)
  }, [])

  return (
    <div ref={ref} className={styles.container}>
      <div
        className={styles.languagesMenuLink}
        onClick={() => setIsComponentVisible(!isComponentVisible)}
      >
        <LanguagesIcon width={20} height={20} />
      </div>
      {isComponentVisible && (
        <div className={styles.menu}>
          <div>
            <ul className={styles.languages}>
              <li
                onClick={() => handleLanguageChange('en')}
                className={language === 'en' ? styles.activeStyle : ''}
                title="English"
              >
                English
              </li>
              <li
                onClick={() => handleLanguageChange('fr')}
                className={language === 'fr' ? styles.activeStyle : ''}
                title="Français"
              >
                Français
              </li>
              <li
                onClick={() => handleLanguageChange('es')}
                className={language === 'es' ? styles.activeStyle : ''}
                title="Español"
              >
                Español
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
