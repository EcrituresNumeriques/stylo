import clsx from 'clsx'

import styles from './EditorMenuItem.module.scss'

export default function EditorMenuItem({
  icon,
  text,
  minimized,
  selected,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(styles.container, selected && styles.selected)}
    >
      {icon}
      <span className={clsx(minimized && styles.hide)}>{text}</span>
    </button>
  )
}
