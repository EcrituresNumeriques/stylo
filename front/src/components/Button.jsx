import clsx from 'clsx'
import React from 'react'
import styles from './button.module.scss'

export default function Button (props) {
  const classNames = clsx({
    [styles.primary]: props.primary,
    [styles.secondary]: props.secondary || (!props.primary && !props.tertiary),
    [styles.tertiary]: props.tertiary,
    [styles.small]: props.small,
    [styles.icon]: props.icon === true,
    [props.className]: Boolean(props.className)
  })

  return (<button className={classNames}
                  type={props.type || props.primary ? 'submit' : 'button'}
                  title={props.title}
                  onClick={props.onClick}
                  onDoubleClick={props.onDoubleClick}
                  disabled={props.disabled}
                  aria-label={props['aria-label']}
  >{props.children}</button>)
}
