import React from 'react'
import styles from './tag.module.scss'

export default function ArticleTag ({ tag, key, onClick, activeUser }) {
  const classNames = [
    styles.tag,
    tag.selected ? styles.selected : null
  ].join(' ')

  const color = tag.color || 'grey'

  return (<label className={classNames}>
    { activeUser._id === tag.owner && <input name={key} type="checkbox" checked={tag.selected} onChange={onClick} />}
    {tag.name}
    <span className={styles.chip} style={{backgroundColor: color}}/>
  </label>)
}
