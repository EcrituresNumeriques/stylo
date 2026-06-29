import clsx from 'clsx'
import { ArrowLeft, MessageCircleQuestionMark } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import useComponentVisible from '../../../hooks/componentVisible.js'

import styles from './header.module.scss'

/**
 *
 * @param {Object} props
 * @param {'full'|'compact'} props.mode
 * @param {import('react').Ref<HTMLDivElement>} props.teleportRef
 * @returns
 */
export default function HelpMenu({ mode = 'full', teleportRef }) {
  const { t } = useTranslation()
  const {
    ref,
    id: menuId,
    isComponentVisible,
    toggleComponentIsVisible,
  } = useComponentVisible({ track: [teleportRef] })

  const isFullMode = mode !== 'compact'

  const renderedSubmenu = (
    <Submenu
      {...{ id: menuId, isComponentVisible, toggleComponentIsVisible }}
    />
  )

  return (
    <div ref={ref} className={styles.dropdownMenu}>
      <button
        aria-expanded={isComponentVisible}
        aria-controls={menuId}
        onClick={toggleComponentIsVisible}
        className={clsx(isFullMode && styles.hasDropdown)}
        type="button"
        aria-label={t('header.helpMenu.button')}
      >
        <MessageCircleQuestionMark className="icon" aria-hidden />
        <span hidden={!isFullMode}>{t('header.helpMenu.button')}</span>
      </button>

      {teleportRef?.current && isComponentVisible
        ? createPortal(renderedSubmenu, teleportRef.current)
        : renderedSubmenu}
    </div>
  )
}

function Submenu({ id, isComponentVisible, toggleComponentIsVisible }) {
  const { t } = useTranslation()
  const { user } = useRouteLoaderData('app')

  return (
    <div id={id} hidden={!isComponentVisible}>
      <button
        aria-controls={id}
        title={t('header.backButtonLabel')}
        className={clsx(styles.toggleMenuButton, styles.hiddenIfDesktop)}
        onClick={toggleComponentIsVisible}
        type="button"
      >
        <ArrowLeft size={20} className="icon" aria-hidden />
        <span>{t('header.backButton')}</span>
      </button>

      <ul
        className={styles.toggleMenuList}
        aria-label={t('header.helpMenu.listLabel')}
      >
        <li>
          <a
            href="https://stylo-doc.ecrituresnumeriques.ca/"
            target="_blank"
            rel="noreferrer noopener"
          >
            {t('header.helpMenu.documentation')}
          </a>
        </li>
        <li>
          <a
            href="https://discussions.revue30.org/c/stylo/entraide-stylo/7"
            target="_blank"
            rel="noreferrer noopener"
          >
            {t('header.helpMenu.community')}
          </a>
        </li>

        <li>
          <a href="mailto:contact@ecrituresnumeriques.ca">
            {t('header.helpMenu.contact')}
          </a>
        </li>

        <li>
          <a
            href="https://github.com/EcrituresNumeriques/stylo/issues"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('header.helpMenu.openIssue')}
          </a>
        </li>
      </ul>
    </div>
  )
}
