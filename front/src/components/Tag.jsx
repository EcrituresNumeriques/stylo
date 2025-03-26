import clsx from 'clsx'
import React from 'react'
import styles from './tag.module.scss'

export default function ArticleTag({
  tag,
  selected,
  key,
  onClick,
  disableAction,
  children,
  addon,
}) {
  const isSelected = tag.selected || selected
  const classNames = clsx(styles.tag, isSelected && styles.selected)

  const backgroundColor = tag.color || 'grey'

  return (
    <div className={classNames}>
      <label aria-label={tag.name}>
        {!disableAction && (
          <input
            name={key}
            value={tag._id}
            data-id={tag._id}
            type="checkbox"
            checked={isSelected}
            onChange={onClick}
          />
        )}
        {tag.name}
        <span className={styles.chip} style={{ backgroundColor }} aria-hidden />
        {children}
      </label>
      {addon && <div>{addon}</div>}
    </div>
  )
}
