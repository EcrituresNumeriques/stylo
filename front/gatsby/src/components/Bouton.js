import React from 'react'
import { Link } from 'gatsby'

import styles from './bouton.module.scss'

export default (props) => {
  if (props.href) {
    const span = <span title={props.title}>{props.children}</span>
    return props.href.startsWith('http') ? (
      <a
        href={props.href}
        id={styles.bouton}
        className={
          props.primary ? styles.primary : props.thin ? styles.thin : null
        }
        onClick={props.onClick}
        target="_blank"
        rel="noreferrer noopener"
      >
        {span}
      </a>
    ) : (
      <Link
        to={props.href}
        id={styles.bouton}
        className={
          props.primary ? styles.primary : props.thin ? styles.thin : null
        }
        onClick={props.onClick}
      >
        {span}
      </Link>
    )
  }
  return (
    <span
      id={styles.bouton}
      className={
        props.primary ? styles.primary : props.thin ? styles.thin : null
      }
      onClick={props.onClick}
      title={props.title}
    >
      {props.children}
    </span>
  )
}
