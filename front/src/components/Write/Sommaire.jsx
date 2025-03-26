import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePandocAnchoring } from '../../hooks/pandoc.js'

import styles from './sommaire.module.scss'
import menuStyles from './menu.module.scss'

export default function Sommaire() {
  const articleStructure = useSelector((state) => state.articleStructure)
  const expand = useSelector((state) => state.articlePreferences.expandSommaire)
  const dispatch = useDispatch()
  const routeMatch = useRouteMatch()
  const toggleExpand = useCallback(
    () =>
      dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandSommaire' }),
    []
  )
  const getAnchor = usePandocAnchoring()
  const hasHtmlAnchors = routeMatch.path === '/article/:id/preview'
  const handleTableEntryClick = useCallback(
    ({ target }) => {
      hasHtmlAnchors
        ? document
            .querySelector(`#${target.dataset.headingAnchor}`)
            ?.scrollIntoView()
        : dispatch({
            type: 'UPDATE_EDITOR_CURSOR_POSITION',
            lineNumber: parseInt(target.dataset.index, 10),
            column: 0,
          })
    },
    [hasHtmlAnchors]
  )
  const { t } = useTranslation()

  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <h1 onClick={toggleExpand}>
        {expand ? <ChevronDown /> : <ChevronRight />}{' '}
        {t('write.titleToc.sidebar')}
      </h1>
      {expand && (
        <ul>
          {articleStructure.map((item) => (
            <li
              className={styles.headlineItem}
              key={`line-${item.index}-${item.line}`}
              role="button"
              tabIndex={0}
              data-index={item.index}
              data-heading-anchor={getAnchor(item.line)}
              onClick={handleTableEntryClick}
            >
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
