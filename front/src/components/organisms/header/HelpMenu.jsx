import { MessageCircleQuestionMark } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import useComponentVisible from '../../../hooks/componentVisible.js'

import styles from './header.module.scss'

export default function HelpMenu() {
  const { t } = useTranslation(['home', 'translation'])
  const { user } = useRouteLoaderData('app')
  const { ref, isComponentVisible, toggleComponentIsVisible } =
    useComponentVisible(false)

  return (
    <nav
      ref={ref}
      className={styles.dropdownMenu}
      aria-labelledby="help-selection"
      aria-description={t('header.helpMenu.description')}
    >
      <button
        id="help-selection"
        aria-expanded={isComponentVisible}
        aria-controls="header-help-menu"
        onClick={toggleComponentIsVisible}
      >
        <MessageCircleQuestionMark size={20} aria-hidden />
        <span className="sr-only">{t('header.helpMenu.button')}</span>
      </button>

      <div
        className={styles.toggleMenuContainerAlignEnd}
        id="header-languages-menu"
        hidden={!isComponentVisible}
      >
        <ul
          className={styles.toggleMenuList}
          aria-label={t('header.languagesMenu.list')}
        >
          <li>
            <a
              href="https://stylo-doc.ecrituresnumeriques.ca/"
              target="_blank"
              rel="noreferrer noopener"
            >
              {t('footer.documentation.link', { ns: 'translation' })}
            </a>
          </li>
          <li>
            <a
              href="https://discussions.revue30.org/c/stylo/entraide-stylo/7"
              target="_blank"
              rel="noreferrer noopener"
            >
              {t('footer.community.link', { ns: 'translation' })}
            </a>
          </li>
          {user?._id && (
            <li>
              <a href="mailto:contact@ecrituresnumeriques.ca">
                {t('contactus.mailto')}
              </a>
            </li>
          )}
          <li>
            <a
              href="https://github.com/EcrituresNumeriques/stylo/issues"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t('contactus.newBug')}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
