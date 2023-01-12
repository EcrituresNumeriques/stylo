import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, ChevronRight } from 'react-feather'

import menuStyles from './menu.module.scss'

export default function WriteStats ({ stats }) {
  const expand = useSelector(state => state.articlePreferences.expandStats)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandStats' }), [])

  return (
    <section className={menuStyles.section}>
      <h1 onClick={toggleExpand}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Stats
      </h1>
      {expand && (
        <>
          <p>Words : {stats.wordCount}</p>
          <p>Characters : {stats.charCountNoSpace}</p>
          <p>Characters (with spaces) : {stats.charCountPlusSpace}</p>
          <p>Citations : {stats.citationNb}</p>
        </>
      )}
    </section>
  )
}
