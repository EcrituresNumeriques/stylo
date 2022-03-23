import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ChevronDown, ChevronRight } from 'react-feather'

import styles from './sommaire.module.scss'
import menuStyles from './menu.module.scss'


export default function Sommaire () {
  const articleStructure = useSelector(state => state.articleStructure)
  const [expand, setExpand] = useState(true)
  const dispatch = useDispatch()

  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <h1 onClick={() => setExpand(!expand)}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Table of contents
      </h1>
      {expand && (<ul>
        {articleStructure.map((item) => (
          <li
            className={styles.headlineItem}
            key={`line-${item.index}-${item.line}`}
            onClick={() => dispatch({ type: 'UPDATE_EDITOR_CURSOR_POSITION', lineNumber: item.index, column: 0 })}
          >
            {item.title}
          </li>
        ))}
      </ul>)}
    </section>
  )
}
