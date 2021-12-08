import React from 'react'
import styles from './button.module.scss'

export default function Button (props) {
  const className = props.primary ? styles.primary : styles.secondary
  const classNames = [
    className,
    styles.button,
    props.icon === true ? styles.icon : null
  ]
  if (props.className) {
    classNames.push(props.className)
  }
  return (<button className={classNames.join(' ')}
                  type={props.type || props.primary ? 'submit' : 'button'}
                  title={props.title}
                  onClick={props.onClick}
                  onDoubleClick={props.onDoubleClick}
                  disabled={props.disabled}
  >{props.children}</button>)
}
