import { ArrowLeft } from 'lucide-react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch } from 'react-router'

import { usePandocAnchoring } from '../../hooks/pandoc.js'
import {
  useArticleEditorStore,
  useArticleStructureStore,
} from '../../stores/articleStore.js'

import styles from './ArticleTableOfContents.module.scss'

export default function ArticleTableOfContents({ onBack }) {
  const { t } = useTranslation()
  const { updateCursorPosition } = useArticleEditorStore()
  const { structure: articleStructure } = useArticleStructureStore()
  const getAnchor = usePandocAnchoring()
  const routeMatch =
    useMatch('/article/:id/version/:versionId/*') || useMatch('/article/:id/*')
  const { '*': mode = null } = routeMatch?.params ?? {}
  const hasHtmlAnchors = mode === 'preview'

  const handleTableOfContentsEntryClicked = useCallback(
    ({ target }) => {
      hasHtmlAnchors
        ? document
            .querySelector(`#${target.dataset.headingAnchor}`)
            ?.scrollIntoView()
        : updateCursorPosition({
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
            key={`line-${item.index}`}
            role="button"
            tabIndex={0}
            data-index={item.index}
            data-heading-anchor={getAnchor(item.line)}
            onClick={handleTableOfContentsEntryClicked}
          >
            {item.level > 1 && '\u00B7\xa0'.repeat(item.level - 2)}
            {item.level > 1 && '\u21B3'}
            {item.title}
          </li>
        ))}
      </ul>
    </>
  )
}
