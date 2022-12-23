import React from 'react'
import styles from './tag.module.scss'

export default function ArticleTag ({ tag, selected, key, onClick, disableAction }) {
  const classNames = [
    styles.tag,
    (tag.selected || selected) ? styles.selected : null
  ].join(' ')

  const backgroundColor = tag.color || 'grey'

  return (<label className={classNames}>
    { !disableAction && <input name={key} value={tag._id} type="checkbox" checked={tag.selected || selected} onChange={onClick} />}
    {tag.name}
    <span className={styles.chip} style={{ backgroundColor }}/>
  </label>)
}
