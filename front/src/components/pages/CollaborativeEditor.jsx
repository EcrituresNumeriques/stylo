import { useCallback, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { executeQuery } from '../../helpers/graphQL.js'
import { computeTextStats } from '../../helpers/markdown.js'
import { getArticleInfo } from '../../hooks/Article.graphql'
import { usePreferenceItem } from '../../hooks/user.js'
import {
  ArticleStats,
  CollaborativeTextEditor,
  EditorMenu,
} from '../organisms/index.js'
import EditorMenuContent from '../organisms/textEditor/EditorMenuContent.jsx'

import styles from './CollaborativeEditor.module.scss'

function parseArticleStructure(md) {
  const text = (md || '').trim()
  return text
    .split('\n')
    .map((line, index) => ({ line, index }))
    .filter((lineWithIndex) => lineWithIndex.line.match(/^##+ /))
    .map((lineWithIndex) => {
      const title = lineWithIndex.line
        .replace(/##/, '')
        //arrow backspace (↳)
        .replace(/#\s/g, '↳')
        // middle dot (·) + non-breaking space (\xa0)
        .replace(/#/g, '·\xa0')
      return { ...lineWithIndex, title }
    })
}

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
  const { id: articleId, version: versionId } = useParams()
  const [searchParams] = useSearchParams({ mode: props.mode ?? 'write' })
  const mode = searchParams.get('mode')
  const { value: activeMenu, setValue: setActiveMenu } = usePreferenceItem(
    `${articleId}.activeMenu`,
    'article'
  )

  const [articleStats, setArticleStats] = useState({
    wordCount: 0,
    charCountNoSpace: 0,
    charCountPlusSpace: 0,
    citationNb: 0,
  })
  const [articleStructure, setArticleStructure] = useState([])
  const [writers, setWriters] = useState({})
  const [workingCopyStatus, setWorkingCopyStatus] = useState('synced')
  const [cursorPosition, setCursorPosition] = useState(null)

  const handleStatsChange = useCallback(
    (md) => setArticleStats(computeTextStats(md)),
    []
  )
  const handleStructureChange = useCallback(
    (md) => setArticleStructure(parseArticleStructure(md)),
    []
  )
  const handleCursorPositionChange = useCallback(
    (position) => setCursorPosition(position),
    []
  )

  const handleActiveMenuChange = useCallback(
    (value) => {
      setActiveMenu(value)
    },
    [setActiveMenu]
  )

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.editor}>
          <CollaborativeTextEditor
            mode={mode}
            articleId={articleId}
            versionId={versionId}
            writers={writers}
            cursorPosition={cursorPosition}
            onWritersChange={setWriters}
            onStatsChange={handleStatsChange}
            onStructureChange={handleStructureChange}
            onWorkingCopyStatusChange={setWorkingCopyStatus}
          />
          <ArticleStats stats={articleStats} />
        </div>
        <EditorMenuContent
          articleId={articleId}
          versionId={versionId}
          activeMenu={activeMenu}
          writers={writers}
          structure={articleStructure}
          workingCopyStatus={workingCopyStatus}
          onCursorPositionChange={handleCursorPositionChange}
        />
      </div>

      <div>
        <EditorMenu articleId={articleId} onChange={handleActiveMenuChange} />
      </div>
    </section>
  )
}
