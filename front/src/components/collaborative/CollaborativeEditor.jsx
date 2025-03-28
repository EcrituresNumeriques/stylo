import React from 'react'
import { useParams } from 'react-router-dom'

import ArticleStats from '../ArticleStats.jsx'
import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'
import CollaborativeEditorMenu from './CollaborativeEditorMenu.jsx'

import styles from './CollaborativeEditor.module.scss'

export default function CollaborativeEditor() {
  const { articleId } = useParams()

  return (
    <section className={styles.container}>
      <div className={styles.main} role="main">
        <CollaborativeEditorArticleHeader articleId={articleId} />
        <CollaborativeTextEditor articleId={articleId} />
        <ArticleStats />
      </div>
      <CollaborativeEditorMenu articleId={articleId} />
    </section>
  )
}
