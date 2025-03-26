import React, { useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { usePandocAnchoring } from '../../hooks/pandoc.js'

import styles from './ArticleTableOfContents.module.scss'

export default function ArticleTableOfContents({ onBack }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const articleStructure = useSelector((state) => state.articleStructure)
  const getAnchor = usePandocAnchoring()
  const routeMatch = useRouteMatch()
  const hasHtmlAnchors = routeMatch.path === '/article/:id/preview'
  const handleTableOfContentsEntryClicked = useCallback(
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

  const title = onBack ? (
    <h2
      className={styles.title}
      onClick={onBack}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span onClick={onBack} style={{ display: 'flex' }}>
        <ArrowLeft style={{ strokeWidth: 3 }} />
      </span>
      <span>{t('toc.title')}</span>
    </h2>
  ) : (
    <h2 className={styles.title}>{t('toc.title')}</h2>
  )

  return (
    <>
      <header>{title}</header>
      <ul>
        {articleStructure?.map((item) => (
          <li
            className={styles.headlineItem}
            key={`line-${item.index}-${item.line}`}
            role="button"
            tabIndex={0}
            data-index={item.index}
            data-heading-anchor={getAnchor(item.line)}
            onClick={handleTableOfContentsEntryClicked}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </>
  )
}
