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
          <p>{t('write.wordCount.stat', {stats: stats.wordCount})}</p>
          <p>{t('write.charCountNoSpace.stat', {stats: stats.charCountNoSpace})}</p>
          <p>{t('write.charCountPlusSpace.stat', {stats: stats.charCountPlusSpace})}</p>
          <p>{t('write.citations.stat', {stats: stats.citationNb})}</p>
        </>
      )}
    </section>
  )
}
