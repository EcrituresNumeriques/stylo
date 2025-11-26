import clsx from 'clsx'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import React from 'react'

import styles from './Sidebar.module.scss'

export default function Sidebar({
  className,
  opened,
  setOpened,
  labelOpened = 'Close',
  labelClosed = 'Open',
  children,
}) {
  const ButtonIcon = opened ? PanelRightClose : PanelRightOpen
  const label = opened ? labelOpened : labelClosed

  return (
    <aside
      aria-labelledby="editor-sidebar-label"
      className={clsx(
        styles.sidebar,
        opened ? styles.opened : styles.closed,
        className
      )}
    >
      <button
        className={styles.action}
        onClick={setOpened}
        aria-pressed={opened}
      >
        <div className={styles.icon}>
          <ButtonIcon size={36} aria-hidden />
        </div>
        <div className={styles.label} id="editor-sidebar-label">
          {label}
        </div>
      </button>

      {opened && <div className={styles.content}>{children}</div>}
    </aside>
  )
}
