import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { Controlled as CodeMirror } from 'react-codemirror2'

import askGraphQL from '../../helpers/graphQL'
import styles from './write.module.scss'

import WriteLeft from './WriteLeft'
import WriteRight from './WriteRight'
import Compare from './Compare'
import CompareSelect from './CompareSelect'

import useDebounce from '../../hooks/debounce'

const mapStateToProps = ({ sessionToken, activeUser }) => {
  return { sessionToken, activeUser }
}

// lazy-loading otherwise "gatsby build" will fail:
// WebpackError: ReferenceError: navigator is not defined
// - codemirror.js:18 
//   node_modules/codemirror/lib/codemirror.js:18:1
// - codemirror.js:11 
//   node_modules/codemirror/lib/codemirror.js:11:63
// - codemirror.js:14 
//   node_modules/codemirror/lib/codemirror.js:14:2
// - markdown.js:6 
//   node_modules/codemirror/mode/markdown/markdown.js:6:9
// - markdown.js:11 
//   node_modules/codemirror/mode/markdown/markdown.js:11:2
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  require('codemirror/mode/markdown/markdown')
}

const ConnectedWrite = (props) => {
  const readOnly = props.version ? true : false
  const query =
    'query($article:ID!){article(article:$article){ _id title zoteroLink owners{ displayName } versions{ _id version revision message autosave updatedAt owner{ displayName }} '
  const getLive = 'live{ md bib yaml message owner{ displayName }} } }'
  const getVersion = `} version(version:"${props.version}"){ _id md bib yaml message revision version owner{ displayName }} }`

  const fullQuery = props.version ? query + getVersion : query + getLive

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
  }
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
      const query = `mutation($user:ID!,$article:ID!,$md:String!,$bib:String!,$yaml:String!,$autosave:Boolean!,$major:Boolean!,$message:String){saveVersion(version:{article:$article,major:$major,auto:$autosave,md:$md,yaml:$yaml,bib:$bib,message:$message},user:$user){ _id version revision message autosave updatedAt owner{ displayName }} }`
      const response = await askGraphQL(
        {
          query,
          variables: { ...variables, ...live, autosave, major, message },
        },
        'saving new version',
        props.sessionToken
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
    console.log('article.useEffect')
    if (!readOnly && !isLoading && !firstLoad) {
      sendVersion(true, false, 'Autosave')
    }
    if (!readOnly && !isLoading) {
      setFirstLoad(false)
    } else {
      setFirstLoad(true)
    }
  }, [debouncedLive])

  const handleMDCM = async (___, __, md) => {
    await setLive({ ...live, md: md })
  }
  const handleYaml = async (yaml) => {
    await setLive({ ...live, yaml: yaml })
  }
  const handleBib = async (bib) => {
    await setLive({ ...live, bib: bib })
  }

  //Reload when version switching
  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      const data = await askGraphQL(
        { query: fullQuery, variables },
        'fetching Live version',
        props.sessionToken
      )
      setLive(props.version ? data.version : data.article.live)
      setArticleInfos({
        _id: data.article._id,
        title: data.article.title,
        zoteroLink: data.article.zoteroLink,
        owners: data.article.owners.map((o) => o.displayName),
      })
      setVersions(data.article.versions)
      setIsLoading(false)
    })()
  }, [props.version])

  return (
    <section className={styles.container}>
      {!isLoading && (
        <WriteLeft
          article={articleInfos}
          {...live}
          compareTo={props.compareTo}
          selectedVersion={props.version}
          versions={versions}
          readOnly={readOnly}
          sendVersion={sendVersion}
          handleBib={handleBib}
          setCodeMirrorCursor={setCodeMirrorCursor}
        />
      )}
      {!isLoading && (
        <WriteRight {...live} handleYaml={handleYaml} readOnly={readOnly} />
      )}

      {props.compareTo && (
        <CompareSelect
          live={live}
          {...props}
          versions={versions}
          readOnly={readOnly}
          article={articleInfos}
          selectedVersion={props.version}
        />
      )}
      <article className={styles.article}>
        {isLoading && <p>Loading...</p>}
        {!isLoading && (
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
        )}
      </article>
    </section>
  )
}

const Write = connect(mapStateToProps)(ConnectedWrite)

export default Write
