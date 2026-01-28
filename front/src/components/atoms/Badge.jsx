import clsx from 'clsx'

import styles from './Badge.module.scss'

export default function Badge({ label, color = '#fff', className }) {
  return (
    <div
      className={clsx(styles.container, className)}
      style={{ backgroundColor: color || '#fff' }}
    >
      {label}
    </div>
  )
}
