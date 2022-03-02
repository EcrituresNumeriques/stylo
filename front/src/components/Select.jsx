import React, { forwardRef } from 'react'
import styles from './button.module.scss'

const Select = forwardRef((props, forwardedRef) => {
  const classNames = [
    styles.select
  ]
  if (props.className) {
    classNames.push(props.className)
  }
  return (<div className={styles.selectContainer} ref={forwardedRef}>
    <select className={classNames.join(' ')} {...props}>{props.children}</select>
  </div>)
})

Select.displayName = 'Select'

export default Select
