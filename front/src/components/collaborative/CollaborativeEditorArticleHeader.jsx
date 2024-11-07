import { Loading, useModal, Modal as GeistModal } from '@geist-ui/core'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { Eye, Printer } from 'react-feather'

import useGraphQL from '../../hooks/graphql.js'
import { getArticleInfo } from '../Article.graphql'
import Button from '../Button.jsx'
import buttonStyles from '../button.module.scss'
import Export from '../Export.jsx'
import TableOfContents from '../Write/TableOfContents.jsx'

import styles from './CollaborativeEditorArticleHeader.module.scss'


export default function CollaborativeEditorArticleHeader ({ articleId }) {
  const { data, isLoading } = useGraphQL({ query: getArticleInfo, variables: { articleId } }, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  const {
    visible: exportModalVisible,
    setVisible: setExportModalVisible,
    bindings: exportModalBinding
  } = useModal()

  const handleOpenExportModal = useCallback(() => {
    setExportModalVisible(true)
  }, [])

  if (isLoading) {
    return <Loading/>
  }

  return (<header className={styles.header}>
    <h1 className={styles.title}>
      <TableOfContents/>
      {data?.article?.title}
    </h1>

    <div className={styles.actions}>
      <Button icon title="Download a printable version" onClick={handleOpenExportModal}>
        <Printer/>
      </Button>
      <Link to={`/article/${articleId}/preview`}
            title="Preview (open a new window)"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles.icon}>
        <Eye/>
      </Link>
    </div>

    <GeistModal width="40rem" visible={exportModalVisible} {...exportModalBinding}>
      <h2>Export</h2>
      <GeistModal.Content>
        <Export articleId={articleId} name={data?.article?.title} bib={data?.article?.workingVersion?.bibPreview}/>
      </GeistModal.Content>
      <GeistModal.Action passive onClick={() => setExportModalVisible(false)}>Cancel</GeistModal.Action>
    </GeistModal>
  </header>)
}

CollaborativeEditorArticleHeader.propTypes = {
  articleId: PropTypes.string.isRequired
}
