import { Loading, Popover, Link } from '@geist-ui/core'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { AlignLeft } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'

import useGraphQL from '../../hooks/graphql.js'
import { getArticleInfo } from '../Article.graphql'

import styles from './CollaborativeEditorArticleHeader.module.scss'


export default function CollaborativeEditorArticleHeader ({ articleId }) {
  const dispatch = useDispatch()
  const articleStructure = useSelector(state => state.articleStructure)
  const { data, isLoading } = useGraphQL({ query: getArticleInfo, variables: { articleId } }, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  const handleTableOfContentsEntryClicked = useCallback(({ target }) => {
    dispatch({ type: 'UPDATE_EDITOR_CURSOR_POSITION', lineNumber: parseInt(target.dataset.index, 10), column: 0 })
  }, [])

  if (isLoading) {
    return <Loading/>
  }

  const content = () => (
    <>
      {articleStructure.map((item) => (
        <Popover.Item key={`line-${item.index}-${item.line}`} tabIndex={0}>
          <Link href="#" data-index={item.index} onClick={handleTableOfContentsEntryClicked}>{item.title}</Link>
        </Popover.Item>
      ))}
    </>
  )

  return (<header>
    <h1 className={styles.title}>
      <Popover className={styles.tocTooltip} placement="bottomStart" content={content}>
        <AlignLeft/>
      </Popover>
      {data?.article?.title}
    </h1>
  </header>)
}

CollaborativeEditorArticleHeader.propTypes = {
  articleId: PropTypes.string.isRequired
}
