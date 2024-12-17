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
        tabIndex={0}
        role="button"
      >
        <LanguagesIcon width={20} height={20} />
      </div>
      {isComponentVisible && (
        <div className={styles.menu}>
          <ul className={styles.languages}>
            <li
              onClick={() => handleLanguageChange('en')}
              tabIndex={0}
              className={language === 'en' ? styles.activeStyle : ''}
              aria-selected={language === 'en' ? true : false}
              lang="en"
            >
              English
            </li>
            <li
              onClick={() => handleLanguageChange('fr')}
              tabIndex={0}
              className={language === 'fr' ? styles.activeStyle : ''}
              aria-selected={language === 'fr' ? true : false}
              lang="fr"
            >
              Français
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
