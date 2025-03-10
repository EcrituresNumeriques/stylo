import { Button, Textarea, useInput, useToasts } from '@geist-ui/core'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useActiveWorkspace } from '../../hooks/workspace.js'

import Field from '../Field.jsx'

import styles from './corpusCreate.module.scss'

import { createCorpus } from './Corpus.graphql'

export default function CorpusCreate({ onSubmit }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const dispatch = useDispatch()
  const { state: title, bindings: titleBindings } = useInput('')
  const { state: description, bindings: descriptionBindings } = useInput('')
  const titleInputRef = useRef()
  const { query } = useGraphQLClient()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )

  useEffect(() => {
    if (titleInputRef.current !== undefined) {
      titleInputRef.current.focus()
    }
  }, [titleInputRef])

  const handleSubmit = useCallback(
    async (event) => {
      try {
        event.preventDefault()
        const response = await query({
          query: createCorpus,
          variables: {
            createCorpusInput: {
              name: title,
              description,
              workspace: activeWorkspaceId,
              metadata: '',
            },
          },
        })
        dispatch({
          type: 'SET_LATEST_CORPUS_CREATED',
          data: { corpusId: response.createCorpus._id },
        })
        onSubmit()
        setToast({
          text: t('corpus.create.toastSuccess'),
          type: 'default',
        })
      } catch (err) {
        setToast({
          text: t('corpus.create.toastFailure'),
          type: 'error',
        })
      }
    },
    [title, description]
  )

  return (
    <section>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Field
          ref={titleInputRef}
          {...titleBindings}
          label={t('corpus.createForm.titleField')}
          type="text"
        />
        <div className={styles.controlField}>
          <label>{t('corpus.createForm.descriptionField')}</label>
          <Textarea
            {...descriptionBindings}
            label={t('corpus.createForm.descriptionField')}
            placeholder={t('corpus.createForm.descriptionPlaceholder')}
          />
        </div>
        <ul className={styles.actions}>
          <li>
            <Button
              onClick={handleSubmit}
              className={styles.button}
              type="secondary"
              title={t('corpus.createForm.buttonTitle')}
            >
              {t('corpus.createForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
