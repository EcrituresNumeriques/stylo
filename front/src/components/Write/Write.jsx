import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Switch, Route, useRouteMatch } from 'react-router-dom'
import { batch, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'

import styles from './write.module.scss'

import { useActiveUserId } from '../../hooks/user'
import { useGraphQL } from '../../helpers/graphQL'
import { getEditableArticle as query } from './Write.graphql'

import ArticleEditorMenu from './ArticleEditorMenu.jsx'
import ArticleEditorMetadata from './ArticleEditorMetadata.jsx'
import WorkingVersion from './WorkingVersion'
import PreviewHtml from './PreviewHtml'
import PreviewPaged from './PreviewPaged'
import Loading from '../Loading'
import MonacoEditor from './providers/monaco/Editor'
import clsx from 'clsx'

const MODES_PREVIEW = 'preview'
const MODES_READONLY = 'readonly'
const MODES_WRITE = 'write'

export function deriveModeFrom ({ path, currentVersion }) {
  if (path === '/article/:id/preview') {
    return MODES_PREVIEW
  }

  else if (currentVersion) {
    return MODES_READONLY
  }

  return MODES_WRITE
}

export default function Write() {
  const { version: currentVersion, id: articleId, compareTo } = useParams()
  const userId = useActiveUserId()
  const dispatch = useDispatch()
  const runQuery = useGraphQL()
  const routeMatch = useRouteMatch()
  const mode = useMemo(() => deriveModeFrom({ currentVersion, path: routeMatch.path}), [currentVersion, routeMatch.path])
  const [graphqlError, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [live, setLive] = useState({})
  const [articleInfos, setArticleInfos] = useState({
    title: '',
    owner: '',
    contributors: [],
    zoteroLink: '',
    preview: {},
  })

  const PreviewComponent = useMemo(
    () => articleInfos.preview.stylesheet ? PreviewPaged : PreviewHtml,
    [articleInfos.preview.stylesheet, currentVersion]
  )

  const deriveArticleStructureAndStats = useCallback(
    throttle(
      ({ text }) => {
        dispatch({ type: 'UPDATE_ARTICLE_STATS', md: text })
        dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md: text })
      },
      250,
      { leading: false, trailing: true }
    ),
    []
  )
  const setWorkingArticleDirty = useCallback(
    debounce(
      async () => {
        dispatch({ type: 'SET_WORKING_ARTICLE_STATE', workingArticleState: 'saving' })
      },
      1000,
      { leading: true, trailing: false }
    ),
    []
  )
  const updateWorkingArticleText = useCallback(
    debounce(
      async ({ text }) => {
        dispatch({ type: 'UPDATE_WORKING_ARTICLE_TEXT', articleId, text })
      },
      1000,
      { leading: false, trailing: true }
    ),
    []
  )
  const updateWorkingArticleMetadata = useCallback(
    debounce(
      ({ metadata }) => {
        dispatch({
          type: 'UPDATE_WORKING_ARTICLE_METADATA',
          articleId,
          metadata,
        })
      },
      1000,
      { leading: false, trailing: true }
    ),
    []
  )


  const handleMDCM = (___, __, text) => {
    deriveArticleStructureAndStats({ text })
    updateWorkingArticleText({ text })
    setWorkingArticleDirty()
    return setLive({ ...live, md: text })
  }

  const handleYaml = (metadata) => {
    updateWorkingArticleMetadata({ metadata })
    setWorkingArticleDirty()
    return setLive({ ...live, yaml: metadata })
  }

  // Reload when version switching
  useEffect(() => {
    const variables = {
      user: userId,
      article: articleId,
      version: currentVersion || 'latest',
      hasVersion: typeof currentVersion === 'string',
      isPreview: mode === MODES_PREVIEW
    }

    setIsLoading(true)
    ;(async () => {
      const data = await runQuery({ query, variables })
        .catch((error) => {
          setError(error)
          return {}
        })

      if (data?.article) {
        const article = data.article
        let currentArticle
        if (currentVersion) {
          currentArticle = {
            bib: data.version.bib,
            md: data.version.md,
            yaml: data.version.yaml,
            version: {
              message: data.version.message,
              major: data.version.version,
              minor: data.version.revision,
            },
          }
        } else {
          currentArticle = article.workingVersion
        }
        setLive(currentArticle)
        setArticleInfos({
          _id: article._id,
          title: article.title,
          owner: article.owner,
          contributors: article.contributors,
          zoteroLink: article.zoteroLink,
          preview: article.preview,
          updatedAt: article.updatedAt,
        })

        const { md, bib, yaml } = currentArticle

        batch(() => {
          dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: article.versions })
          dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
          dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
          dispatch({ type: 'SET_WORKING_ARTICLE_TEXT', text: md })
          dispatch({ type: 'SET_WORKING_ARTICLE_METADATA', metadata: yaml })
          dispatch({ type: 'SET_WORKING_ARTICLE_BIBLIOGRAPHY', bibliography: bib })
          dispatch({
            type: 'SET_WORKING_ARTICLE_UPDATED_AT',
            updatedAt: article.updatedAt,
          })
        })
      }

      setIsLoading(false)
    })()
  }, [currentVersion])

  if (graphqlError) {
    return (
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>Error</h2>
          <p>{graphqlError[0]?.message || 'Article not found.'}</p>
        </article>
      </section>
    )
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <section className={styles.container}>
      <ArticleEditorMenu
        articleInfos={articleInfos}
        compareTo={compareTo}
        selectedVersion={currentVersion}
        readOnly={mode === MODES_READONLY}
      />
      <article className={clsx({[styles.article]: mode !== MODES_PREVIEW})}>
        <WorkingVersion articleInfos={articleInfos} selectedVersion={currentVersion} mode={mode} />

        <Switch>
          <Route path="*/preview" exact>
            <PreviewComponent preview={articleInfos.preview} yaml={live.yaml} />
          </Route>
          <Route path="*">
            <MonacoEditor
              text={live.md}
              readOnly={mode === MODES_READONLY}
              onTextUpdate={handleMDCM}
              articleId={articleInfos._id}
              selectedVersion={currentVersion}
              compareTo={compareTo}
              currentArticleVersion={live.version} />
          </Route>
        </Switch>
      </article>
      <ArticleEditorMetadata
        yaml={live.yaml}
        handleYaml={handleYaml}
        readOnly={mode === MODES_READONLY}
      />
    </section>
  )
}

Write.propTypes = {
  version: PropTypes.string,
  id: PropTypes.string,
  compareTo: PropTypes.string
}
