import React from 'react'
import styles from './tag.module.scss'

export default function ArticleTag ({ tag, key, onClick, disableAction }) {
  const classNames = [
    styles.tag,
    tag.selected ? styles.selected : null
  ].join(' ')

  const color = tag.color || 'grey'

  console.log('disableAction', disableAction)
  return (<label className={classNames}>
    { !disableAction && <input name={key} type="checkbox" checked={tag.selected} onChange={onClick} />}
    {tag.name}
    <span className={styles.chip} style={{backgroundColor: color}}/>
  </label>)
}
