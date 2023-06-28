import { Button, Modal as GeistModal, Note, Spacer, useModal, useToasts } from '@geist-ui/core'
import Editor from '@monaco-editor/react'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory, useParams } from 'react-router-dom'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import { useMutation } from '../../hooks/graphql.js'

import { stopCollaborativeSession } from '../Article.graphql'

import styles from '../Write/providers/monaco/TextEditor.module.scss'


export default function CollaborativeEditingEditor () {
  const { t } = useTranslation()
  const mutation = useMutation()
  const { setToast } = useToasts()
  const history = useHistory()
  const { sessionId: collaborativeSessionId, articleId } = useParams()
  const ydocument = new Y.Doc()
  const provider = new WebsocketProvider(`${location.protocol === 'http:' ? 'ws:' : 'wss:'}//localhost:3030`, collaborativeSessionId, ydocument)
  const type = ydocument.getText('main')
  const status = ydocument.getText('status')

  const {
    visible: collaborativeSessionEndedVisible,
    setVisible: setCollaborativeSessionEndedVisible,
    bindings: collaborativeSessionEndedBinding
  } = useModal()

  const {
    visible: collaborativeSessionEndConfirmationVisible,
    setVisible: setCollaborativeSessionEndConfirmationVisible,
    bindings: collaborativeSessionEndConfirmationBinding
  } = useModal()

  useEffect(() => {
    status.observe(function () {
      if (status.toString() === 'ended') {
        setCollaborativeSessionEndedVisible(true)
      }
    })
  }, [status])

  const editorRef = useRef()

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor
    new MonacoBinding(type, editor.getModel(), new Set([editor]), provider.awareness)
  }, [])

  const handleCollaborativeSessionEnded = useCallback(() => {
    setCollaborativeSessionEndedVisible(false)
    history.push('/articles')
  }, [])

  const handleConfirmCollaborativeSessionEnd = useCallback(async () => {
    setCollaborativeSessionEndConfirmationVisible(true)
  }, [])

  const handleEndCollaborativeSession = useCallback(async () => {
    try {
      await mutation({ query: stopCollaborativeSession, variables: { articleId } })
      setToast({
        type: 'default',
        text: 'Collaborative session ended'
      })
      setCollaborativeSessionEndConfirmationVisible(false)
      history.push('/articles')
    } catch (err) {
      console.log({err})
      setToast({
        type: 'error',
        text: 'Unable to stop the collaborative session'
      })
    }
  }, [mutation])

  return (
    <>
      <Button onClick={handleConfirmCollaborativeSessionEnd}>End collaborative session</Button>
      <GeistModal width="35rem" visible={collaborativeSessionEndConfirmationVisible} {...collaborativeSessionEndConfirmationBinding}>
        <h2>{t('article.collaborativeSessionEndConfirmation.title')}</h2>
        <GeistModal.Content>
          {t('article.collaborativeSessionEndConfirmation.message')}
        </GeistModal.Content>
        <GeistModal.Action
          passive
          onClick={() => setCollaborativeSessionEndConfirmationVisible(false)}
        >
          {t('modal.cancelButton.text')}
        </GeistModal.Action>
        <GeistModal.Action onClick={handleEndCollaborativeSession}>{t('modal.confirmButton.text')}</GeistModal.Action>
      </GeistModal>
      <GeistModal width="35rem" visible={collaborativeSessionEndedVisible} {...collaborativeSessionEndedBinding}>
        <h2>{t('article.collaborativeSessionEnded.title')}</h2>
        <GeistModal.Content>
          {t('article.collaborativeSessionEnded.message')}
        </GeistModal.Content>
        <GeistModal.Action onClick={handleCollaborativeSessionEnded}>{t('modal.confirmButton.text')}</GeistModal.Action>
      </GeistModal>
      <Editor
        className={styles.editor}
        defaultLanguage="markdown"
        onMount={handleEditorDidMount}
      />
    </>)
}
