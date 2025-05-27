import React from 'react'
import { useParams } from 'react-router'

import createReduxStore from '../../createReduxStore.js'
import { executeQuery } from '../../helpers/graphQL.js'
import { getUserProfile } from '../../helpers/user.js'

import ArticleStats from '../ArticleStats.jsx'
import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorMenu from './CollaborativeEditorMenu.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'

import { getArticleInfo } from '../Article.graphql'

import styles from './CollaborativeEditor.module.scss'

const articleIdRx = /^[a-f\d]{24}$/i

export async function loader({ params }) {
  const { id: articleId } = params
  if (articleId && articleIdRx.test(articleId) === false) {
    const error = new Error()
    error.message = `Invalid article id ${articleId}`
    error.status = 404
    throw error
  }
  const store = createReduxStore()
  const { sessionToken } = store.getState()
  const { user } = await getUserProfile({ sessionToken })
  try {
    const result = await executeQuery({
      query: getArticleInfo,
      variables: { articleId },
      sessionToken,
    })
    return { user, result }
  } catch (err) {
    const errorMessage = err.messages?.[0]?.message ?? err.message
    const errorType = err.messages?.[0]?.extensions?.type
    if (errorType === 'NOT_FOUND') {
      const error = new Error()
      error.message = errorMessage
      error.status = 404
      throw error
    }
    throw err
  }
}

export default function CollaborativeEditor({ mode = 'write' }) {
  const { id: articleId, compareTo, version: versionId } = useParams()

  return (
    <section className={styles.container}>
      <div className={styles.editorArea}>
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
        className={styles.sidebarArea}
        articleId={articleId}
        versionId={versionId}
        compareTo={compareTo}
      />
    </section>
  )
}
