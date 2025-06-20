import { Languages } from 'lucide-react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import useComponentVisible from '../../hooks/componentVisible.js'

import styles from '../header.module.scss'

export default function LanguagesMenu() {
  const { t, i18n } = useTranslation()
  const { ref, isComponentVisible, toggleComponentIsVisible } =
    useComponentVisible(false)

  const handleLanguageChange = useCallback(async (event) => {
    const lang = event.target.getAttribute('lang')
    await i18n.changeLanguage(lang)
  }, [])

  return (
    <nav
      ref={ref}
      className={styles.languagesMenu}
      aria-labelledby="languages-selection"
      aria-description={t('header.languagesMenu.description')}
    >
      <button
        id="languages-selection"
        aria-expanded={isComponentVisible}
        aria-controls="header-languages-menu"
        onClick={toggleComponentIsVisible}
      >
        <Languages size={20} aria-hidden />
        <span className="sr-only">{t('header.languagesMenu.button')}</span>
      </button>

      {isComponentVisible && (
        <div
          className={styles.toggleMenuContainerAlignEnd}
          id="header-languages-menu"
        >
          <ul
            className={styles.toggleMenuList}
            aria-label={t('header.languagesMenu.list')}
          >
            <li>
              <button
                lang="en"
                onClick={handleLanguageChange}
                aria-pressed={i18n.language === 'en'}
              >
                English
              </button>
            </li>
            <li>
              <button
                lang="fr"
                onClick={handleLanguageChange}
                aria-pressed={i18n.language === 'fr'}
              >
                Français
              </button>
            </li>
            <li>
              <button
                lang="es"
                onClick={handleLanguageChange}
                aria-pressed={i18n.language === 'es'}
              >
                Español
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
