import Editor from '@monaco-editor/react'
import throttle from 'lodash.throttle'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { MonacoBinding } from 'y-monaco'
import { applicationConfig } from '../../config.js'
import Loading from '../molecules/Loading.jsx'
import defaultEditorOptions from '../Write/providers/monaco/options.js'
import * as collaborating from './collaborating.js'
import CollaborativeEditorStatus from './CollaborativeEditorStatus.jsx'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'

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

/**
 * @param props
 * @param props.articleId
 * @param props.onCollaborativeSessionStateUpdated
 * @return {Element}
 */
export default function CollaborativeTextEditor({
  articleId,
  onCollaborativeSessionStateUpdated,
}) {
  const connectingRef = useRef(false)
  const [dynamicStyles, setDynamicStyles] = useState('')
  const [websocketStatus, setWebsocketStatus] = useState('')
  const [yText, setYText] = useState(null)
  const [awareness, setAwareness] = useState(null)
  const { websocketEndpoint } = applicationConfig
  const activeUser = useSelector(
    (state) => ({
      _id: state.activeUser._id,
      email: state.activeUser.email,
      displayName: state.activeUser.displayName,
      username: state.activeUser.username,
    }),
    shallowEqual
  )
  const dispatch = useDispatch()
  const editorRef = useRef(null)
  const editorCursorPosition = useSelector(
    (state) => state.editorCursorPosition,
    shallowEqual
  )

  const options = useMemo(
    () => ({
      ...defaultEditorOptions,
      contextmenu: websocketStatus === 'connected',
      readOnly: websocketStatus !== 'connected',
    }),
    [websocketStatus]
  )

  const handleUpdateArticleStructureAndStats = throttle(
    ({ text }) => {
      dispatch({ type: 'UPDATE_ARTICLE_STATS', md: text })
      dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md: text })
    },
    250,
    { leading: false, trailing: true }
  )

  const writerInfo = useMemo(
    () => ({
      id: activeUser._id,
      email: activeUser.email,
      displayName: activeUser.displayName,
      username: activeUser.username,
      color: colors[Math.floor(Math.random() * 14)],
    }),
    [activeUser]
  )

  const handleWritersUpdated = useCallback(
    ({ states }) => {
      const writers = Object.fromEntries(states)
      dispatch({ type: 'UPDATE_ARTICLE_WRITERS', articleWriters: writers })
      setDynamicStyles(
        Object.entries(writers)
          .map(([key, writer]) => {
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
          })
          .join('\n')
      )
    },
    [setDynamicStyles]
  )

  const handleWebsocketStatusUpdated = useCallback(
    (status) => {
      setWebsocketStatus(status)
    },
    [setWebsocketStatus]
  )

  const handleEditorDidMount = useCallback(
    (editor) => {
      editorRef.current = editor
      new MonacoBinding(yText, editor.getModel(), new Set([editor]), awareness)
    },
    [yText, awareness]
  )

  useEffect(() => {
    if (connectingRef.current) {
      return
    }
    connectingRef.current = true
    const {
      awareness,
      doc: yDocument,
      wsProvider,
    } = collaborating.connect({
      roomName: articleId,
      websocketEndpoint,
      user: writerInfo,
      onChange: handleWritersUpdated,
      onStatusUpdated: handleWebsocketStatusUpdated,
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
      connectingRef.current = false
      awareness.destroy()
      if (wsProvider.wsconnected) {
        wsProvider.disconnect()
        wsProvider.destroy()
      }
    }
  }, [articleId, websocketEndpoint, writerInfo])

  useEffect(() => {
    const line = editorCursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({ lineNumber: line + 1, column: endOfLineColumn })
    editor?.revealLineNearTop(line + 1, 1) // smooth
  }, [editorRef, editorCursorPosition])

  if (!yText) {
    return <Loading />
  }

  return (
    <>
      <style>{dynamicStyles}</style>
      <CollaborativeEditorStatus />
      <div className={styles.inlineStatus}>
        <CollaborativeEditorWebSocketStatus status={websocketStatus} />
      </div>
      <Editor
        width={'100%'}
        height={'auto'}
        options={options}
        className={styles.editor}
        defaultLanguage="markdown"
        onMount={handleEditorDidMount}
      />
    </>
  )
}
