import { Link as GeistLink, Popover } from '@geist-ui/core'
import clsx from 'clsx'
import React, { useCallback } from 'react'
import { AlignLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { usePandocAnchoring } from '../../hooks/pandoc.js'
import styles from './tableOfContents.module.scss'

export default function TableOfContents () {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const articleStructure = useSelector(state => state.articleStructure)
  const routeMatch = useRouteMatch()
  const getAnchor = usePandocAnchoring()
  const hasHtmlAnchors = routeMatch.path === '/article/:id/preview'
  const handleTableEntryClick = useCallback(({ target }) => {
    hasHtmlAnchors
      ? document.querySelector(`#${target.dataset.headingAnchor}`)?.scrollIntoView()
      : dispatch({ type: 'UPDATE_EDITOR_CURSOR_POSITION', lineNumber: parseInt(target.dataset.index, 10), column: 0 })
  }, [hasHtmlAnchors])

  const content = () => {
    if (articleStructure.length === 0) {
      return <></>
    }
    return <div className={styles.tocPopover}>
      <Popover.Item title>
        <span>{t('toc.title')}</span>
      </Popover.Item>
      {articleStructure.map((item) => (
        <Popover.Item key={`line-${item.index}-${item.line}`} tabIndex={0} data-index={item.index}
                      data-heading-anchor={getAnchor(item.line)}>
          <GeistLink href="#" data-index={item.index} onClick={handleTableEntryClick}>{item.title}</GeistLink>
        </Popover.Item>
      ))}
    </div>
  }

  return (
    <Popover className={clsx(styles.tocTooltip, articleStructure.length === 0 && styles.empty)}
             placement="bottomStart"
             content={content} 
             hideArrow={articleStructure.length === 0}>
      <AlignLeft/>
    </Popover>)
}
