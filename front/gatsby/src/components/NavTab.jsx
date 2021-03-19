import React, { useState } from 'react'
import styles from './navTab.module.scss'

export default function NavTag ({ items = [], defaultValue, onChange = () => {}}) {
  const [selector, setSelector] = useState(defaultValue)

  return (<nav className={styles.selector}>
    {items.map((item) => (<button
        key={item.value}
        className={selector === item.value ? styles.selected : null}
        onClick={() => {
          setSelector(item.value)
          onChange(item.value)
        }}
      >
        {item.name}
      </button>))}
  </nav>)
}
