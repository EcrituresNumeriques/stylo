import React, { useCallback, useEffect, useState } from 'react'
import i18n from '../i18n.js'

import styles from './LanguageSelect.module.scss'

export default function LanguageSelect () {
  const [language, setLanguage] = useState(i18n.language)

  useEffect(() => {
    setLanguage(i18n.language)
  }, [i18n.language])

  const handleLanguageChange = useCallback(async (value) => {
    await i18n.changeLanguage(value)
    setLanguage(value)
  }, [])

  return (
    <ul className={styles.container}>
      <li onClick={() => handleLanguageChange('en')} className={language === 'en' ? styles.activeStyle: ''}>English</li>
      <li onClick={() => handleLanguageChange('fr')} className={language === 'fr' ? styles.activeStyle: ''}>Français</li>
    </ul>
  )
}

