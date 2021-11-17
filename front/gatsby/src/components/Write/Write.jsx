import React, { useCallback, useEffect, useRef, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import 'codemirror/mode/markdown/markdown'
import { Controlled as CodeMirror } from 'react-codemirror2'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import 'codemirror/lib/codemirror.css'

import styles from './write.module.scss'

import askGraphQL from '../../helpers/graphQL'
import useDebounce from '../../hooks/debounce'

import WriteLeft from './WriteLeft'
import WriteRight from './WriteRight'
import Compare from './Compare'
import CompareSelect from './CompareSelect'
import Loading from '../Loading'

import ArticleService from "../../services/ArticleService"
import MetadataService from "../../services/MetadataService"

const mapStateToProps = ({ activeUser, applicationConfig }) => {
  return { activeUser, applicationConfig }
}

function ConnectedWrite ({ version: currentVersion, id: articleId, compareTo, activeUser, applicationConfig }) {
  const userId = activeUser && activeUser._id
  const [readOnly, setReadOnly] = useState(Boolean(currentVersion))
  const dispatch = useDispatch()
  const deriveArticleStructureAndStats = useCallback(
    throttle(({ text }) => {
      dispatch({ type: 'UPDATE_ARTICLE_STATS', md: text })
      dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md: text })
    }, 250, { leading: false, trailing: true }),
    []
  )
  const updateWorkingArticleText = useCallback(
    debounce(async ({ text }) => {
      const { updateWorkingVersion } = await new ArticleService(userId, articleId, applicationConfig).saveText(text)
    }, 1000, { leading: false, trailing: true }),
    [userId, articleId, applicationConfig]
  )
  const updateWorkingArticleMetadata = useCallback(
    debounce(({ metadata }) => {
      new MetadataService(userId, articleId, applicationConfig).saveMetadata(metadata)
    }, 1000, { leading: false, trailing: true }),
    [userId, articleId, applicationConfig]
  )

  const fullQuery = `query($article:ID!, $hasVersion: Boolean!, $version:ID!) {
    article(article:$article) {
      _id
      title
      zoteroLink
      updatedAt

      owners {
        displayName
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

  const instanceCM = useRef(null)

  const handleReload = useCallback(() => {
    setNeedReload(true)
  }, [])

  const handleUpdateCursorPosition = useCallback((line) => {
    try {
      const editor = instanceCM.current.editor
      editor.focus()
      editor.setCursor(line, 0)
      editor.execCommand('goLineEnd')
    } catch (err) {
      console.error('Unable to update CodeMirror cursor position', err)
    }
  }, [instanceCM])

  const variables = {
    user: userId,
    article: articleId,
    version: currentVersion || '0123456789ab',
    hasVersion: typeof currentVersion === 'string'
  }

  const [graphqlError, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [live, setLive] = useState({})
  const [versions, setVersions] = useState([])
  const [articleInfos, setArticleInfos] = useState({
    title: '',
    owners: [],
    zoteroLink: '',
  })
  const [firstLoad, setFirstLoad] = useState(true)

  const codeMirrorOptions = {
    mode: 'markdown',
    lineWrapping: true,
    lineNumbers: false,
    autofocus: true,
    viewportMargin: Infinity,
    spellcheck: true,
    extraKeys: {
      'Shift-Ctrl-Space': function (cm) {
        cm.replaceSelection('\u00a0')
      },
    },
  }

  const saveVersionQuery = `mutation($user: ID!, $article: ID!, $major: Boolean!, $message: String) {
  saveVersion(
    version: {
      article: $article,
      major: $major,
      message: $message
    },
    user: $user
  ) {
    _id
    version
    revision
    message
    updatedAt
    owner {
      displayName
    }
  }
}`

  const handleSaveVersion = useCallback(async (major = false, message = '') => {
    await sendVersion(major, message)
  }, [versions, userId, articleId])

  const sendVersion = async (major = false, message = '') => {
    try {
      const response = await askGraphQL(
        {
          query: saveVersionQuery,
          variables: {
            user: userId,
            article: articleId,
            major,
            message
          },
        },
        'saving new version',
        null,
        applicationConfig
      )
      setVersions([response.saveVersion, ...versions])
      return response
    } catch (err) {
      console.error('Something went wrong while saving a new version', err)
      alert(err)
    }
  }

  //Autosave debouncing on the live
  // TODO: Do not save when opening
  const debouncedLive = useDebounce(live, 1000)
  useEffect(() => {
    if (!readOnly && !isLoading && !firstLoad) {
      //sendVersion(true, false, 'Current version')
    } else if (!readOnly && !isLoading) {
      setFirstLoad(false)
    } else {
      setFirstLoad(true)
    }
  }, [debouncedLive])

  const handleMDCM = async (___, __, text) => {
    deriveArticleStructureAndStats({ text })
    updateWorkingArticleText({ text })
    // TODO: save working article with the updated text content (Markdown)
    await setLive({ ...live, md: text })

  }
  const handleYaml = async (metadata) => {
    updateWorkingArticleMetadata({ metadata })
    // TODO: save working article with the updated metadata (YAML)

    await setLive({ ...live, yaml: metadata })
  }

  //Reload when version switching
  useEffect(() => {
    setIsLoading(true)
    setReadOnly(currentVersion)
    ;(async () => {
      const data = await askGraphQL(
        {
          query: fullQuery,
          variables
        },
        'Fetching article',
        null,
        applicationConfig
      ).then(({ version, article }) => ({ version, article })
      ).catch((error) => {
        setError(error)
        return {}
      })

      if (data?.article) {
        const article = data.article
        const version = currentVersion ? data.version : article.workingVersion
        console.log({ version })
        setLive(version)
        setArticleInfos({
          _id: article._id,
          title: article.title,
          zoteroLink: article.zoteroLink,
          owners: article.owners.map((o) => o.displayName),
          updatedAt: article.updatedAt
        })

        setVersions(article.versions)

        const md = version.md
        const bib = version.bib
        dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
        dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
        dispatch({ type: 'UPDATE_ARTICLE_BIB', bib })
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
    return <Loading/>
  }

  return (
    <section className={styles.container}>
      <WriteLeft
        bib={live.bib}
        article={articleInfos}
        compareTo={compareTo}
        selectedVersion={currentVersion}
        versions={versions}
        readOnly={readOnly}
        sendVersion={handleSaveVersion}
        onTableOfContentClick={handleUpdateCursorPosition}
      />
      <WriteRight {...live} handleYaml={handleYaml} readOnly={readOnly}/>
      {compareTo && (
        <CompareSelect
          compareTo={compareTo}
          live={live}
          versions={versions}
          readOnly={readOnly}
          article={articleInfos}
          selectedVersion={currentVersion}
        />
      )}

      <article className={styles.article}>
        <>
          {readOnly && <pre>{live.md}</pre>}
          {!readOnly && (
            <CodeMirror
              value={live.md}
              cursor={{ line: 0, character: 0 }}
              editorDidMount={(_) => {
                window.scrollTo(0, 0)
                //editor.scrollIntoView({ line: 0, ch: 0 })
              }}
              onBeforeChange={handleMDCM}
              options={codeMirrorOptions}
              ref={instanceCM}
            />
          )}
          {compareTo && <Compare compareTo={compareTo} live={live}/>}
        </>
      </article>
    </section>
  )
}

const Write = connect(mapStateToProps)(ConnectedWrite)

export default Write
