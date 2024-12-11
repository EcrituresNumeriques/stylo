import React, { useState } from 'react'
import styles from './navTab.module.scss'

export default function NavTag(props) {
  const [selector, setSelector] = useState(props.defaultValue)
  return (
    <nav className={styles.selector}>
      {props.items.map((item) => (
        <button
          key={item.value}
          className={selector === item.value ? styles.selected : null}
          onClick={() => {
            setSelector(item.value)
            props.onChange(item.value)
          }}
        >
          {item.name}
        </button>
      ))}
    </nav>
  )
}
