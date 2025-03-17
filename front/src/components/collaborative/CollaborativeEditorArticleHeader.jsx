import {
  Loading,
  Popover,
  Link as GeistLink,
  useModal,
  Modal as GeistModal,
} from '@geist-ui/core'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { AlignLeft, Eye, Printer } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'

import useFetchData from '../../hooks/graphql.js'
import { getArticleInfo } from '../Article.graphql'
import Button from '../Button.jsx'
import buttonStyles from '../button.module.scss'
import Export from '../Export.jsx'

import styles from './CollaborativeEditorArticleHeader.module.scss'

export default function CollaborativeEditorArticleHeader({ articleId }) {
  const dispatch = useDispatch()
  const articleStructure = useSelector((state) => state.articleStructure)
  const { data, isLoading } = useFetchData(
    { query: getArticleInfo, variables: { articleId } },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const {
    visible: exportModalVisible,
    setVisible: setExportModalVisible,
    bindings: exportModalBinding,
  } = useModal()

  const handleTableOfContentsEntryClicked = useCallback(({ target }) => {
    dispatch({
      type: 'UPDATE_EDITOR_CURSOR_POSITION',
      lineNumber: parseInt(target.dataset.index, 10),
      column: 0,
    })
  }, [])

  const handleOpenExportModal = useCallback(() => {
    setExportModalVisible(true)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  const content = () => {
    if (articleStructure.length === 0) {
      return <></>
    }
    return (
      <>
        <Popover.Item title>
          <span>Table Of Contents</span>
        </Popover.Item>
        {articleStructure.map((item) => (
          <Popover.Item key={`line-${item.index}-${item.line}`} tabIndex={0}>
            <GeistLink
              href="#"
              data-index={item.index}
              onClick={handleTableOfContentsEntryClicked}
            >
              {item.title}
            </GeistLink>
          </Popover.Item>
        ))}
      </>
    )
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <Popover
          className={clsx(
            styles.tocTooltip,
            articleStructure.length === 0 && styles.empty
          )}
          placement="bottomStart"
          content={content}
          hideArrow={articleStructure.length === 0}
        >
          <AlignLeft />
        </Popover>
        {data?.article?.title}
      </h1>

      <div className={styles.actions}>
        <Button
          icon
          title="Download a printable version"
          onClick={handleOpenExportModal}
        >
          <Printer />
        </Button>
        <Link
          to={`/article/${articleId}/preview`}
          title="Preview (open a new window)"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles.icon}
        >
          <Eye />
        </Link>
      </div>

      <GeistModal
        width="40rem"
        visible={exportModalVisible}
        {...exportModalBinding}
      >
        <h2>Export</h2>
        <GeistModal.Content>
          <Export
            articleId={articleId}
            name={data?.article?.title}
            bib={data?.article?.workingVersion?.bibPreview}
          />
        </GeistModal.Content>
        <GeistModal.Action passive onClick={() => setExportModalVisible(false)}>
          Cancel
        </GeistModal.Action>
      </GeistModal>
    </header>
  )
}

CollaborativeEditorArticleHeader.propTypes = {
  articleId: PropTypes.string.isRequired,
}
