import React from 'react'
import { useParams } from 'react-router'

import ArticleStats from '../ArticleStats.jsx'
import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'
import CollaborativeEditorMenu from './CollaborativeEditorMenu.jsx'

import styles from './CollaborativeEditor.module.scss'

export default function CollaborativeEditor({ mode = 'write' }) {
  const { id: articleId, compareTo, version: versionId } = useParams()

  return (
    <section className={styles.container}>
      <div className={styles.main}>
        <CollaborativeEditorArticleHeader
          articleId={articleId}
          versionId={versionId}
        />
        <CollaborativeTextEditor
          mode={mode}
          articleId={articleId}
          versionId={versionId}
        />
        <ArticleStats />
      </div>

      <CollaborativeEditorMenu
        articleId={articleId}
        versionId={versionId}
        compareTo={compareTo}
      />
    </section>
  )
}
