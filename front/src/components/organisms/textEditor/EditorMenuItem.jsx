import clsx from 'clsx'

import styles from './EditorMenuItem.module.scss'

export default function EditorMenuItem({
  icon,
  text,
  minimized,
  selected,
  external = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(styles.container, selected && styles.selected)}
      title={text}
    >
      {icon}
      <span
        className={clsx(
          styles.text,
          minimized && styles.hide,
          external && styles.external
        )}
      >
        {text}
      </span>
    </button>
  )
}
