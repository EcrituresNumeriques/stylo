import clsx from 'clsx'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './WorkspaceLabel.module.scss'

/**
 *
 * @param {import('react').PropsWithoutRef} props
 * @param {{name: string, color: string}?} props.workspace
 * @param {string=} props.className
 * @returns {import('react').ReactElement}
 */
export default function WorkspaceLabel({ workspace, className }) {
  const { t } = useTranslation()
  const backgroundColor = workspace?.color ?? '#ccc'

  return (
    <div className={clsx(className, styles.container)} aria-label={name}>
      <span className={styles.chip} style={{ backgroundColor }} />
      <span className={styles.name}>
        {workspace?.name ?? t('workspace.myspace')}
      </span>
    </div>
  )
}
