import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Code, Text } from '@geist-ui/core'
import clsx from 'clsx'
import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { batch, useDispatch } from 'react-redux'
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom'

import { useGraphQLClient } from '../../helpers/graphQL'
import { useActiveUserId } from '../../hooks/user'

import ArticleStats from '../ArticleStats.jsx'
import ErrorMessageCard from '../ErrorMessageCard.jsx'
import Loading from '../molecules/Loading.jsx'
import ArticleEditorMenu from './ArticleEditorMenu.jsx'
import ArticleEditorMetadata from './ArticleEditorMetadata.jsx'

import PreviewHtml from './PreviewHtml'
import PreviewPaged from './PreviewPaged'
import MonacoEditor from './providers/monaco/Editor'
import WorkingVersion from './WorkingVersion'

import { getEditableArticle as getEditableArticleQuery } from './Write.graphql'

import styles from './write.module.scss'

const MODES_PREVIEW = 'preview'
const MODES_READONLY = 'readonly'
const MODES_WRITE = 'write'

export function deriveModeFrom({ path, currentVersion }) {
  if (path === '/article/:id/preview') {
    return MODES_PREVIEW
  } else if (currentVersion) {
    return MODES_READONLY
  }

  return MODES_WRITE
}

/**
 * @return {Element}
 */
export default function Write() {
  const { t } = useTranslation()
  const { version: currentVersion, id: articleId, compareTo } = useParams()
  const userId = useActiveUserId()
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const routeMatch = useRouteMatch()
  const mode = useMemo(() => {
    return deriveModeFrom({ currentVersion, path: routeMatch.path })
  }, [currentVersion, routeMatch.path])
  const [graphQLError, setGraphQLError] = useState()
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
    () => (articleInfos.preview.stylesheet ? PreviewPaged : PreviewHtml),
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
        dispatch({
          type: 'SET_WORKING_ARTICLE_STATE',
          workingArticleState: 'saving',
        })
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

  const handleMDCM = (text) => {
    deriveArticleStructureAndStats({ text })
    updateWorkingArticleText({ text })
    setWorkingArticleDirty()
    return setLive({ ...live, md: text })
  }

  const handleMetadataChange = (metadata) => {
    updateWorkingArticleMetadata({ metadata })
    setWorkingArticleDirty()
    return setLive({ ...live, metadata })
  }

  // Reload when version switching
  useEffect(() => {
    const variables = {
      user: userId,
      article: articleId,
      version: currentVersion || 'latest',
      hasVersion: typeof currentVersion === 'string',
      isPreview: mode === MODES_PREVIEW,
    }

    setIsLoading(true)
    ;(async () => {
      const data = await query({
        query: getEditableArticleQuery,
        variables,
      }).catch((error) => {
        setGraphQLError(error)
        return {}
      })

      if (data?.article) {
        const article = data.article
        let currentArticle
        if (currentVersion) {
          currentArticle = {
            bib: data.version.bib,
            md: data.version.md,
            metadata: data.version.metadata,
            bibPreview: data.version.bibPreview,
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

        const { md, bib, metadata } = currentArticle

        batch(() => {
          dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: article.versions })
          dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
          dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
          dispatch({ type: 'SET_WORKING_ARTICLE_TEXT', text: md })
          dispatch({ type: 'SET_WORKING_ARTICLE_METADATA', metadata })
          dispatch({
            type: 'SET_WORKING_ARTICLE_BIBLIOGRAPHY',
            bibliography: bib,
          })
          dispatch({
            type: 'SET_WORKING_ARTICLE_UPDATED_AT',
            updatedAt: article.updatedAt,
          })
        })
      }

      setIsLoading(false)
    })()
  }, [currentVersion, articleId])

  if (graphQLError) {
    return (
      <section className={styles.errorContainer}>
        <ErrorMessageCard title="Error">
          <Text>
            <Code>{graphQLError?.message || graphQLError.toString()}</Code>
          </Text>
        </ErrorMessageCard>
      </section>
    )
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <section className={styles.container}>
      <Helmet>
        <title>{t('article.page.title', { title: articleInfos.title })}</title>
      </Helmet>
      <ArticleEditorMenu
        articleInfos={articleInfos}
        compareTo={compareTo}
        selectedVersion={currentVersion}
        readOnly={mode === MODES_READONLY}
      />
      <article className={clsx({ [styles.article]: mode !== MODES_PREVIEW })}>
        <WorkingVersion
          articleInfos={articleInfos}
          live={live}
          selectedVersion={currentVersion}
          mode={mode}
        />

        <Switch>
          <Route path="*/preview" exact>
            <PreviewComponent
              preview={articleInfos.preview}
              metadata={live.metadata}
            />
          </Route>
          <Route path="*">
            <MonacoEditor
              text={live.md}
              readOnly={mode === MODES_READONLY}
              onTextUpdate={handleMDCM}
              articleId={articleInfos._id}
              selectedVersion={currentVersion}
              compareTo={compareTo}
              currentArticleVersion={live.version}
            />

            <ArticleStats />
          </Route>
        </Switch>
      </article>
      <ArticleEditorMetadata
        metadata={live.metadata}
        onChange={handleMetadataChange}
        readOnly={mode === MODES_READONLY}
      />
    </section>
  )
}
