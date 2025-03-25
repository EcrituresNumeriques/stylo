import clsx from 'clsx'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

import styles from './Sidebar.module.scss'

export default function Sidebar({
  className,
  opened,
  setOpened,
  labelOpened,
  labelClosed,
  children,
}) {
  const button = opened ? (
    <PanelRightClose size={36} />
  ) : (
    <PanelRightOpen size={36} />
  )

  const label = opened ? labelOpened ?? 'Close' : labelClosed ?? 'Open'

  return (
    <div
      className={clsx(
        styles.sidebar,
        opened ? styles.opened : styles.closed,
        className
      )}
    >
      <div className={styles.action} onClick={() => setOpened(!opened)}>
        <div className={styles.icon}>{button}</div>
        <div className={styles.label}>{label}</div>
      </div>
      {opened && <div className={styles.content}>{children}</div>}
    </div>
  )
}
