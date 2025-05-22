import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import styles from './WorkspaceLabel.module.scss'
import { useTranslation } from 'react-i18next'

/**
 *
 * @param {import('react').PropsWithoutRef} props
 * @param {string=} props.name
 * @param {string=} props.color
 * @param {string=} props.className
 * @returns {import('react').ReactElement}
 */
export default function WorkspaceLabel({ name, color: backgroundColor = '#ccc', className }) {
  const { t } = useTranslation()

  return (
    <div className={clsx(className, styles.container)} aria-label={name}>
      <span className={styles.chip} style={{ backgroundColor }} />
      <span className={styles.name}>{name ?? t('workspace.myspace')}</span>
    </div>
  )
}
