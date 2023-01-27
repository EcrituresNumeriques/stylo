import clsx from 'clsx'
import React from 'react'
import styles from './tag.module.scss'

export default function ArticleTag ({ tag, selected, key, onClick, disableAction }) {
  const isSelected = tag.selected || selected
  const classNames = clsx(
    styles.tag,
    isSelected && styles.selected
  )

  const backgroundColor = tag.color || 'grey'

  return (<label className={classNames}>
    { !disableAction && <input name={key} value={tag._id} data-id={tag._id} type="checkbox" checked={isSelected} onChange={onClick} />}
    {tag.name}
    <span className={styles.chip} style={{ backgroundColor }}/>
  </label>)
}
