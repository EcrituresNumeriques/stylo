import React, { useCallback, useEffect, useRef, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import 'codemirror/mode/markdown/markdown'
import { Controlled as CodeMirror } from 'react-codemirror2'
import throttle from 'lodash/throttle'

import askGraphQL from '../../helpers/graphQL'
import styles from './write.module.scss'

import WriteLeft from './WriteLeft'
import WriteRight from './WriteRight'
import Compare from './Compare'
import CompareSelect from './CompareSelect'
import Loading from '../Loading'

import useDebounce from '../../hooks/debounce'
import 'codemirror/lib/codemirror.css'

const mapStateToProps = ({ sessionToken, activeUser, applicationConfig }) => {
  return { sessionToken, activeUser, applicationConfig }
}

function ConnectedWrite(props) {
  const { version: currentVersion } = props
  const [readOnly, setReadOnly] = useState(Boolean(currentVersion))
  const dispatch = useDispatch()
  const deriveArticleStructureAndStats = useCallback(
    throttle(({ md }) => {
      dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
      dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
    }, 250, { leading: false, trailing: true }),
    []
  )

  const fullQuery = `query($article:ID!, $hasVersion: Boolean!, $version:ID!) {
    article(article:$article) {
      _id
      title
      zoteroLink
      owners {
        displayName
      }
      versions {
        _id
        version
        revision
        message
        autosave
        updatedAt
        owner {
          displayName
        }
      }

      live @skip (if: $hasVersion) {
        md
        bib
        yaml
        message
        owner {
          displayName
        }
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

  const setCodeMirrorCursor = (line) => {
    try {
      const editor = instanceCM.current.editor
      editor.focus()
      editor.setCursor(line, 0)
      editor.execCommand('goLineEnd')
    } catch (err) {
      console.log('Unable to update CodeMirror cursor position', err)
    }
  }

  const variables = {
    user: props.activeUser && props.activeUser._id,
    article: props.id,
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

  const sendVersion = async (autosave = true, major = false, message = '') => {
    try {
      const query = `mutation($user: ID!, $article: ID!, $md: String!, $bib: String!, $yaml: String!, $autosave: Boolean!, $major: Boolean!, $message: String) {
  saveVersion(version: {
      article: $article,
      major: $major,
      auto: $autosave,
      md: $md,
      yaml: $yaml,
      bib: $bib,
      message: $message
    },
    user: $user
  ) { 
    _id 
    version
    revision
    message
    autosave
    updatedAt
    owner { 
      displayName
    }
  }
}`
      const response = await askGraphQL(
        {
          query,
          variables: { ...variables, ...live, autosave, major, message },
        },
        'saving new version',
        props.sessionToken,
        props.applicationConfig
      )
      if (versions[0]._id !== response.saveVersion._id) {
        setVersions([response.saveVersion, ...versions])
      } else {
        //Last version had same _id, we gucchi to update!
        const immutableV = [...versions]
        //shift the first item of the array
        const [_, ...rest] = immutableV
        setVersions([response.saveVersion, ...rest])
      }
      return response
    } catch (err) {
      alert(err)
    }
  }

  //Autosave debouncing on the live
  // TODO: Do not save when opening
  const debouncedLive = useDebounce(live, 1000)
  useEffect(() => {
    if (!readOnly && !isLoading && !firstLoad) {
      sendVersion(true, false, 'Current version')
    } else if (!readOnly && !isLoading) {
      setFirstLoad(false)
    } else {
      setFirstLoad(true)
    }
  }, [debouncedLive])

  const handleMDCM = async (___, __, md) => {
    deriveArticleStructureAndStats({ md })

    await setLive({ ...live, md: md })
  }
  const handleYaml = async (yaml) => {
    await setLive({ ...live, yaml: yaml })
  }

  //Reload when version switching
  useEffect(() => {
    setIsLoading(true)
    setReadOnly(currentVersion)
    ;(async () => {
      const data = await askGraphQL(
        { query: fullQuery, variables },
        'fetching Live version',
        props.sessionToken,
        props.applicationConfig
      ).then(({ version, article }) => ({ version, article })
      ).catch((error) => {
        setError(error)
        return {}
      })

      if (data?.article) {
        const article = data.article
        const version = currentVersion ? data.version : article.live
        setLive(version)
        setArticleInfos({
          _id: article._id,
          title: article.title,
          zoteroLink: article.zoteroLink,
          owners: article.owners.map((o) => o.displayName),
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
    return <Loading />
  }

  return (
    <section className={styles.container}>
      <WriteLeft
        article={articleInfos}
        {...live}
        compareTo={props.compareTo}
        selectedVersion={currentVersion}
        versions={versions}
        readOnly={readOnly}
        sendVersion={sendVersion}
        setCodeMirrorCursor={setCodeMirrorCursor}
      />

      <WriteRight {...live} handleYaml={handleYaml} readOnly={readOnly} />

      {props.compareTo && (
        <CompareSelect
          live={live}
          {...props}
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
          {props.compareTo && <Compare {...props} live={live} />}
        </>
      </article>
    </section>
  )
}

const Write = connect(mapStateToProps)(ConnectedWrite)

export default Write
