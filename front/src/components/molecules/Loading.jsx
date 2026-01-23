import clsx from 'clsx'
import { Loader } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Loading.module.scss'

/**
 * @param props
 * @param {string=} props.className
 * @param {string=} props.label translation label
 * @param {string=} props.size (default: '1rem')
 * @param {boolean=} props.hidden (default: false)
 * @returns {React.ReactHTMLElement}
 */
export default function Loading({
  label = '',
  size = '1rem',
  hidden = false,
  className,
}) {
  const { t } = useTranslation()
  label = t([label, 'loading.label'])

  return (
    <div
      className={clsx(styles.loading, className)}
      style={{ fontSize: size }}
      hidden={hidden}
    >
      <Loader className={styles.icon} aria-hidden />
      {label}
    </div>
  )
}
