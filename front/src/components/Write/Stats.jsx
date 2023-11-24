import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, ChevronRight } from 'react-feather'
import { useTranslation } from 'react-i18next'

import menuStyles from './menu.module.scss'

export default function WriteStats ({ stats }) {
  const expand = useSelector(state => state.articlePreferences.expandStats)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandStats' }), [])
  const { t } = useTranslation()

  return (
    <section className={menuStyles.section}>
      <h1 onClick={toggleExpand}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Stats
      </h1>
      {expand && (
        <>
          <p>{t('write.wordCountStat.text', {stats: stats.wordCount})}</p>
          <p>{t('write.charCountNoSpaceStat.text', {stats: stats.charCountNoSpace})}</p>
          <p>{t('write.charCountPlusSpaceStat.text', {stats: stats.charCountPlusSpace})}</p>
          <p>{t('write.citationsStat.text', {stats: stats.citationNb})}</p>
        </>
      )}
    </section>
  )
}
