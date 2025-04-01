import Editor from '@monaco-editor/react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { applicationConfig } from '../../config.js'
import { useArticleVersion } from '../../hooks/article.js'
import Alert from '../molecules/Alert.jsx'

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
 * @param props.versionId
 * @return {Element}
 */
export default function CollaborativeTextReader({ articleId, versionId }) {
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
  const { version, isLoading, error } = useArticleVersion({ versionId })

  const options = {
    ...defaultEditorOptions,
    contextmenu: false,
    readOnly: true,
  }

  useEffect(() => {
    const line = editorCursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({ lineNumber: line + 1, column: endOfLineColumn })
    editor?.revealLineNearTop(line + 1, 1) // smooth
  }, [editorRef, editorCursorPosition])

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Alert message={error.message} />
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
        value={version.md}
        className={styles.editor}
        defaultLanguage="markdown"
      />
    </>
  )
}
