import React, { forwardRef } from 'react'
import styles from './button.module.scss'

const Select = forwardRef((props, forwardedRef) => {
  return (<div className={styles.selectContainer} ref={forwardedRef}>
    <select className={props.className || styles.select} {...props}>{props.children}</select>
  </div>)
})

Select.displayName = 'Select'

export default Select
