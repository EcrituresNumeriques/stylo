import React from 'react'
import { DiffEditor } from '@monaco-editor/react'
import { useParams } from 'react-router-dom'

import ArticleStats from '../ArticleStats.jsx'
import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'
import CollaborativeEditorMenu from './CollaborativeEditorMenu.jsx'

import defaultEditorOptions from '../Write/providers/monaco/options.js'

import styles from './CollaborativeEditor.module.scss'

export default function CollaborativeEditor() {
  const { articleId, compareTo, versionId } = useParams()

  if (compareTo) {
    return (
      <section className={styles.container}>
        <div className={styles.main} role="main">
          <DiffEditor
            className={styles.diffEditor}
            width={'100%'}
            height={'auto'}
            modified={'aa'}
            original={'bb'}
            language="markdown"
            theme="dark"
            options={defaultEditorOptions}
          />
        </div>
      </section>
    )
  }

  return (
    <section className={styles.container}>
      <div className={styles.main} role="main">
        <CollaborativeEditorArticleHeader articleId={articleId} />
        <CollaborativeTextEditor articleId={articleId} versionId={versionId} />
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
