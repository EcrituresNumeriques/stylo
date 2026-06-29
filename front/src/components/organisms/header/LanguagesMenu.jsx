import clsx from 'clsx'
import { ArrowLeftIcon, LanguagesIcon } from 'lucide-react'
import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import useComponentVisible from '../../../hooks/componentVisible.js'

import styles from './header.module.scss'

const SUPPORTED_LOCALES = new Map([
  ['fr', 'Français'],
  ['en', 'English'],
  ['es', 'Español (castellano)'],
])

export default function LanguagesMenu({ mode = 'full', teleportRef }) {
  const { t } = useTranslation()
  const {
    ref,
    id: menuId,
    isComponentVisible,
    setIsComponentVisible,
    toggleComponentIsVisible,
  } = useComponentVisible({ track: [teleportRef] })

  const isFullMode = mode !== 'compact'

  const renderedSubmenu = (
    <Submenu
      {...{
        id: menuId,
        isComponentVisible,
        setIsComponentVisible,
        toggleComponentIsVisible,
      }}
    />
  )

  return (
    <div ref={ref} className={styles.dropdownMenu}>
      <button
        aria-controls={menuId}
        aria-expanded={isComponentVisible}
        onClick={toggleComponentIsVisible}
        className={clsx(isFullMode && styles.hasDropdown)}
        aria-label={t('header.languagesMenu.label')}
        type="button"
      >
        <LanguagesIcon aria-hidden className="icon" />
        <span className={styles.hiddenIfDesktop}>
          {t('header.languagesMenu.menuButton')}
        </span>
      </button>

      {teleportRef?.current && isComponentVisible
        ? createPortal(renderedSubmenu, teleportRef.current)
        : renderedSubmenu}
    </div>
  )
}

function Submenu({
  id,
  isComponentVisible,
  setIsComponentVisible,
  toggleComponentIsVisible,
}) {
  const { t, i18n } = useTranslation()

  const handleLanguageChange = useCallback(async (event) => {
    const lang = event.target.getAttribute('lang')
    await i18n.changeLanguage(lang)
    setIsComponentVisible(false)
  }, [])

  return (
    <div id={id} hidden={!isComponentVisible}>
      <button
        aria-controls={id}
        className={clsx(styles.toggleMenuButton, styles.hiddenIfDesktop)}
        onClick={toggleComponentIsVisible}
        title={t('header.backButtonLabel')}
        type="button"
      >
        <ArrowLeftIcon aria-hidden className="icon" />
        <span>{t('header.backButton')}</span>
      </button>

      <ul
        className={styles.toggleMenuList}
        aria-label={t('header.languagesMenu.listLabel')}
      >
        {SUPPORTED_LOCALES.entries()
          .toArray()
          .map(([langKey, langLabel]) => (
            <li key={langKey}>
              <button
                lang={langKey}
                onClick={handleLanguageChange}
                aria-pressed={i18n.language === langKey}
                type="button"
              >
                {langLabel}
              </button>
            </li>
          ))}
      </ul>
    </div>
  )
}
