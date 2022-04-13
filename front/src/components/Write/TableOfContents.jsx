import React, { useCallback, useEffect, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import styles from './sommaire.module.scss'
import menuStyles from './menu.module.scss'
import Field from '../Field'
import formStyles from '../field.module.scss'

export default function TableOfContents ({ cancel }) {
  const dispatch = useDispatch()
  const articleStructure = useSelector(state => state.articleStructure, shallowEqual)
  const [filter, setFilter] = useState('')

  const filterByText = (articleStructure) => {
    if (filter.trim().length === 0) {
      return true
    }
    return articleStructure.title.toLowerCase().includes(filter.toLowerCase())
  }

  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <Field
        autoFocus={true}
        className={formStyles.fullWidth}
        placeholder='Filter headings'
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {articleStructure.filter(filterByText).map((item) => (
          <li
            className={styles.headlineItem}
            key={`line-${item.index}-${item.line}`}
            onClick={() => {
              dispatch({ type: 'UPDATE_EDITOR_CURSOR_POSITION', lineNumber: item.index, column: 0 })
              cancel()
            }}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </section>
  )
}
