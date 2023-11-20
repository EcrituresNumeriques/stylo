import { Loading } from '@geist-ui/core'
import PropTypes from 'prop-types'
import Editor from '@monaco-editor/react'
import throttle from 'lodash.throttle'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { MonacoBinding } from 'y-monaco'
import * as collaborating from './collaborating.js'
import CollaborativeEditorStatus from './CollaborativeEditorStatus.jsx'

import styles from './CollaborativeTextEditor.module.scss'

const colors = [
  // navy
  '#70b8ff',
  // blue
  '#75bfff',
  // aqua
  '#7FDBFF',
  // teal
  '#39CCCC',
  // olive
  '#92d3b6',
  // green
  '#97e7a0',
  // yellow
  '#ffeb66',
  // orange
  '#ffbb80',
  // red
  '#ff726b',
  // maroon
  '#ff6666',
  // fuchsia
  '#f674d8',
  // purple
  '#e46ff6',
  // gray
  '#AAAAAA',
  // silver
  '#DDDDDD',
]

export default function CollaborativeTextEditor ({ articleId, collaborativeSessionCreatorId, collaborativeSessionId, onCollaborativeSessionStateUpdated }) {
  const connectingRef = useRef(false)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)
  const [editorVerticalOffset, setEditorVerticalOffset] = useState(0)
  const [dynamicStyles, setDynamicStyles] = useState('')
  const [websocketStatus, setWebsocketStatus] = useState('')
  const [yText, setYText] = useState(null)
  const [awareness, setAwareness] = useState(null)
  const { websocketEndpoint } = useSelector(state => state.applicationConfig, shallowEqual)
  const activeUser = useSelector(state => ({
    _id: state.activeUser._id,
    email: state.activeUser.email,
    displayName: state.activeUser.displayName,
    username: state.activeUser.username
  }), shallowEqual)
  const dispatch = useDispatch()
  const editorRef = useRef()
  const editorCursorPosition = useSelector(state => state.editorCursorPosition, shallowEqual)

  const options = useMemo(() => ({
    automaticLayout: true,
    readOnly: websocketStatus !== 'connected',
    contextmenu: websocketStatus === 'connected',
    autoClosingBrackets: 'never',
    wordBasedSuggestions: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    wrappingIndent: 'none',
    minimap: {
      enabled: false
    }
  }), [websocketStatus])

  const handleUpdateArticleStructureAndStats = throttle(({ text }) => {
      dispatch({ type: 'UPDATE_ARTICLE_STATS', md: text })
      dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md: text })
    },
    250,
    { leading: false, trailing: true }
  )

  const writerInfo = useMemo(() => ({
    id: activeUser._id,
    email: activeUser.email,
    displayName: activeUser.displayName,
    username: activeUser.username,
    color: colors[Math.floor(Math.random() * 14)]
  }), [activeUser])

  const handleWritersUpdated = useCallback(({ states }) => {
    const writers = Object.fromEntries(states)
    dispatch({ type: 'UPDATE_ARTICLE_WRITERS', articleWriters: writers })
    setDynamicStyles(Object.entries(writers).map(([key, writer]) => {
      const color = writer.user.color
      return `
.yRemoteSelection-${key} {
  background-color: ${color};
}
.yRemoteSelectionHead-${key} {
  border-left: ${color} solid 2px;
  border-top: ${color} solid 2px;
  border-bottom: ${color} solid 2px;
}`
    }).join('\n'))
  }, [setDynamicStyles])

  const handleWebsocketStatusUpdated = useCallback((status) => {
    setWebsocketStatus(status)
  }, [setWebsocketStatus])

  useEffect(() => {
    if (connectingRef.current) return
    connectingRef.current = true
    const { awareness, doc: yDocument, wsProvider } = collaborating.connect({
      roomName: collaborativeSessionId,
      websocketEndpoint,
      user: writerInfo,
      onChange: handleWritersUpdated,
      onStatusUpdated: handleWebsocketStatusUpdated
    })
    const yText = yDocument.getText('main')
    const yState = yDocument.getText('state')
    yText.observe(function () {
      handleUpdateArticleStructureAndStats({ text: yText.toString() })
    })
    yState.observe(function () {
      onCollaborativeSessionStateUpdated({ state: yState.toString() })
    })
    setAwareness(awareness)
    setYText(yText)
    return () => {
      try {
        awareness.destroy()
        wsProvider.disconnect()
        wsProvider.destroy()
      } catch (err) {
        // try to disconnect..
      }
    }
  }, [collaborativeSessionId, websocketEndpoint, writerInfo])

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor
    setEditorVerticalOffset(editor._domElement.getBoundingClientRect().y + window.scrollY + 50)
    new MonacoBinding(yText, editor.getModel(), new Set([editor]), awareness)
  }, [yText, awareness, setEditorVerticalOffset])

  useEffect(() => {
    const line = editorCursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({ lineNumber: line + 1, column: endOfLineColumn })
    editor?.revealLine(line + 1, 1) // smooth
  }, [editorRef, editorCursorPosition])

  const updateViewportHeight = useCallback(() => {
    setViewportHeight(window.innerHeight)
    const editor = editorRef.current
    if (editor) {
      setEditorVerticalOffset(editor._domElement.getBoundingClientRect().y + window.scrollY + 50)
    }
  }, [setViewportHeight, editorRef, setEditorVerticalOffset])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateViewportHeight)
    }
    return () => {
      window.removeEventListener('resize', updateViewportHeight)
    }
  }, [updateViewportHeight])

  if (!yText) {
    return <Loading/>
  }

  return (<>
    <style>{dynamicStyles}</style>
    <CollaborativeEditorStatus
      articleId={articleId}
      websocketStatus={websocketStatus}
      collaborativeSessionCreatorId={collaborativeSessionCreatorId}
    />
    <Editor
      options={options}
      className={styles.editor}
      height={viewportHeight - editorVerticalOffset + "px"}
      defaultLanguage="markdown"
      onMount={handleEditorDidMount}
    />
  </>)
}

CollaborativeTextEditor.propTypes = {
  articleId: PropTypes.string.isRequired,
  collaborativeSessionId: PropTypes.string.isRequired,
  collaborativeSessionCreatorId: PropTypes.string.isRequired,
  onCollaborativeSessionStateUpdated: PropTypes.func
}
