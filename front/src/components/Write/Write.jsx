import {
  Code,
  Modal as GeistModal,
  Text,
  useModal,
  useToasts,
} from '@geist-ui/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch, Route, useRouteMatch } from 'react-router-dom'
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'
import { applicationConfig } from '../../config.js'
import ArticleStats from '../ArticleStats.jsx'
import ErrorMessageCard from '../ErrorMessageCard.jsx'

import styles from './write.module.scss'

import { useActiveUserId } from '../../hooks/user'
import { useGraphQLClient } from '../../helpers/graphQL'
import {
  getEditableArticle as getEditableArticleQuery,
  stopSoloSession,
} from './Write.graphql'

import ArticleEditorMenu from './ArticleEditorMenu.jsx'
import ArticleEditorMetadata from './ArticleEditorMetadata.jsx'
import WorkingVersion from './WorkingVersion'
import PreviewHtml from './PreviewHtml'
import PreviewPaged from './PreviewPaged'
import Loading from '../Loading'
import MonacoEditor from './providers/monaco/Editor'
import clsx from 'clsx'
import { Helmet } from 'react-helmet'

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

export default function Write() {
  const { setToast } = useToasts()
  const { backendEndpoint } = applicationConfig
  const { t } = useTranslation()
  const { version: currentVersion, id: articleId, compareTo } = useParams()
  const workingArticle = useSelector(
    (state) => state.workingArticle,
    shallowEqual
  )
  const userId = useActiveUserId()
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const routeMatch = useRouteMatch()
  const [collaborativeSessionActive, setCollaborativeSessionActive] =
    useState(false)
  const [soloSessionActive, setSoloSessionActive] = useState(false)
  const mode = useMemo(() => {
    if (collaborativeSessionActive || soloSessionActive) {
      return MODES_READONLY
    }
    return deriveModeFrom({ currentVersion, path: routeMatch.path })
  }, [
    currentVersion,
    routeMatch.path,
    collaborativeSessionActive,
    soloSessionActive,
  ])
  const [graphQLError, setGraphQLError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [live, setLive] = useState({})
  const [soloSessionTakenOverBy, setSoloSessionTakenOverBy] = useState('')
  const [articleInfos, setArticleInfos] = useState({
    title: '',
    owner: '',
    contributors: [],
    zoteroLink: '',
    preview: {},
  })

  const {
    visible: collaborativeSessionActiveVisible,
    setVisible: setCollaborativeSessionActiveVisible,
    bindings: collaborativeSessionActiveBinding,
  } = useModal()

  const {
    visible: soloSessionActiveVisible,
    setVisible: setSoloSessionActiveVisible,
    bindings: soloSessionActiveBinding,
  } = useModal()

  const {
    visible: soloSessionTakeOverModalVisible,
    setVisible: setSoloSessionTakeOverModalVisible,
    bindings: soloSessionTakeOverModalBinding,
  } = useModal()

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

  const handleStateUpdated = useCallback(
    (event) => {
      const parsedData = JSON.parse(event.data)
      if (parsedData.articleStateUpdated) {
        const articleStateUpdated = parsedData.articleStateUpdated
        if (articleId === articleStateUpdated._id) {
          if (
            articleStateUpdated.soloSession &&
            articleStateUpdated.soloSession.id
          ) {
            if (userId !== articleStateUpdated.soloSession.creator._id) {
              setSoloSessionTakenOverBy(
                articleStateUpdated.soloSession.creatorUsername
              )
              setSoloSessionActive(true)
              setSoloSessionTakeOverModalVisible(true)
            }
          } else if (articleStateUpdated.collaborativeSession) {
            setCollaborativeSessionActiveVisible(true)
            setCollaborativeSessionActive(true)
          }
        }
      }
    },
    [articleId]
  )

  useEffect(() => {
    // FIXME: should retrieve extensions.type 'COLLABORATIVE_SESSION_CONFLICT'
    if (
      workingArticle &&
      workingArticle.state === 'saveFailure' &&
      workingArticle.stateMessage ===
        'Active collaborative session, cannot update the working copy.'
    ) {
      setCollaborativeSessionActiveVisible(true)
      setCollaborativeSessionActive(true)
    }
  }, [workingArticle])

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
        if (data.article.soloSession && data.article.soloSession.id) {
          if (userId !== data.article.soloSession.creator._id) {
            setSoloSessionActive(true)
            setSoloSessionActiveVisible(true)
          }
        }
        setCollaborativeSessionActive(
          data.article.collaborativeSession &&
            data.article.collaborativeSession.id
        )
        setCollaborativeSessionActiveVisible(
          data.article.collaborativeSession &&
            data.article.collaborativeSession.id
        )
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

    return async () => {
      try {
        await query({ query: stopSoloSession, variables: { articleId } })
      } catch (err) {
        if (
          err &&
          err.messages &&
          err.messages.length > 0 &&
          err.messages[0].extensions &&
          err.messages[0].extensions.type === 'UNAUTHORIZED'
        ) {
          // cannot end solo session... ignoring
        } else {
          setToast({
            type: 'error',
            text: `Unable to end solo session: ${err.toString()}`,
          })
        }
      }
    }
  }, [currentVersion, articleId])

  useEffect(() => {
    let events
    if (!isLoading) {
      events = new EventSource(`${backendEndpoint}/events?userId=${userId}`)
      events.onmessage = (event) => {
        handleStateUpdated(event)
      }
    }
    return () => {
      if (events) {
        events.close()
      }
    }
  }, [isLoading, handleStateUpdated])

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
      <GeistModal
        width="40rem"
        visible={collaborativeSessionActiveVisible}
        {...collaborativeSessionActiveBinding}
      >
        <h2>{t('article.collaborativeSessionActive.title')}</h2>
        <GeistModal.Content>
          {t('article.collaborativeSessionActive.message')}
        </GeistModal.Content>
        <GeistModal.Action
          onClick={() => setCollaborativeSessionActiveVisible(false)}
        >
          {t('modal.confirmButton.text')}
        </GeistModal.Action>
      </GeistModal>

      <GeistModal
        width="40rem"
        visible={soloSessionActiveVisible}
        {...soloSessionActiveBinding}
      >
        <h2>{t('article.soloSessionActive.title')}</h2>
        <GeistModal.Content>
          {t('article.soloSessionActive.message')}
        </GeistModal.Content>
        <GeistModal.Action onClick={() => setSoloSessionActiveVisible(false)}>
          {t('modal.confirmButton.text')}
        </GeistModal.Action>
      </GeistModal>

      <GeistModal
        width="40rem"
        visible={soloSessionTakeOverModalVisible}
        {...soloSessionTakeOverModalBinding}
      >
        <h2>{t('article.soloSessionTakeOver.title')}</h2>
        <GeistModal.Content>
          {t('article.soloSessionTakeOver.message', {
            username: soloSessionTakenOverBy,
          })}
        </GeistModal.Content>
        <GeistModal.Action
          onClick={() => setSoloSessionTakeOverModalVisible(false)}
        >
          {t('modal.confirmButton.text')}
        </GeistModal.Action>
      </GeistModal>

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

Write.propTypes = {
  version: PropTypes.string,
  id: PropTypes.string,
  compareTo: PropTypes.string,
}
