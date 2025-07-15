import React from 'react'
import { useParams, useSearchParams } from 'react-router'

import { executeQuery } from '../../helpers/graphQL.js'

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
    throw new Response(`Invalid article id ${articleId}`, { status: 400 })
  }

  const sessionToken = localStorage.getItem('sessionToken')
  try {
    const { article } = await executeQuery({
      query: getArticleInfo,
      variables: { articleId },
      sessionToken,
    })
    return { article }
  } catch (err) {
    const errorMessage = err.messages?.[0]?.message ?? err.message
    const errorType = err.messages?.[0]?.extensions?.type

    if (errorType === 'NOT_FOUND') {
      throw new Response(errorMessage, { status: 404 })
    }

    throw err
  }
}

export default function CollaborativeEditor(props) {
  const { id: articleId, compareTo, version: versionId } = useParams()
  const [searchParams] = useSearchParams({ mode: props.mode ?? 'write' })
  const mode = searchParams.get('mode')

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
