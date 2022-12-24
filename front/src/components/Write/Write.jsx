import React, { useCallback, useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { batch, useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'

import styles from './write.module.scss'

import { useGraphQL } from '../../helpers/graphQL'

import WriteLeft from './WriteLeft'
import WriteRight from './WriteRight'
import WorkingVersion from './WorkingVersion'
import Preview from './Preview'
import Loading from '../Loading'
import MonacoEditor from './providers/monaco/Editor'

export default function Write() {
  const { version: currentVersion, id: articleId, compareTo } = useParams()
  const userId = useSelector((state) => state.activeUser._id)
  const [readOnly, setReadOnly] = useState(Boolean(currentVersion))
  const dispatch = useDispatch()
  const runQuery = useGraphQL()
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

  const fullQuery = `query($article:ID!, $hasVersion: Boolean!, $version:ID!) {
    article(article:$article) {
      _id
      title
      zoteroLink
      updatedAt

      owner {
        displayName
      }

      contributors {
        user {
          displayName
        }
      }

      versions {
        _id
        version
        revision
        message
        updatedAt
        owner {
          displayName
        }
      }

      workingVersion @skip (if: $hasVersion) {
        md
        bib
        yaml
      }
    }

    version(version: $version) @include (if: $hasVersion) {
      _id
      md
      bib
      yaml
      message
      revision
      version
      owner{
        displayName
      }
    }
  }`

  const variables = {
    user: userId,
    article: articleId,
    version: currentVersion || '0123456789ab',
    hasVersion: typeof currentVersion === 'string',
  }

  const [graphqlError, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [live, setLive] = useState({})
  const [articleInfos, setArticleInfos] = useState({
    title: '',
    owner: '',
    contributors: [],
    zoteroLink: '',
  })

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
    setIsLoading(true)
    setReadOnly(Boolean(currentVersion))
    ;(async () => {
      const data = await runQuery({ query: fullQuery, variables })
        .then(({ version, article }) => ({ version, article }))
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
      <WriteLeft
        articleInfos={articleInfos}
        compareTo={compareTo}
        selectedVersion={currentVersion}
        readOnly={readOnly}
      />
      <WriteRight
        yaml={live.yaml}
        handleYaml={handleYaml}
        readOnly={readOnly}
      />

      <article className={styles.article}>
        <WorkingVersion articleInfos={articleInfos} selectedVersion={currentVersion} readOnly={readOnly} />

        <Switch>
          <Route path="*/preview" exact>
            <Preview />
          </Route>
          <Route path="*">
            <MonacoEditor
              text={live.md}
              readOnly={readOnly}
              onTextUpdate={handleMDCM}
              articleId={articleInfos._id}
              selectedVersion={currentVersion}
              compareTo={compareTo}
              currentArticleVersion={live.version} />
          </Route>
        </Switch>
      </article>


    </section>
  )
}

Write.propTypes = {
  version: PropTypes.string,
  id: PropTypes.string,
  compareTo: PropTypes.string
}
