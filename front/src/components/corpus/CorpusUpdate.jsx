import { Button, Textarea, useInput, useToasts } from '@geist-ui/core'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGraphQLClient } from '../../helpers/graphQL.js'

import Field from '../Field.jsx'

import { updateCorpus } from './Corpus.graphql'

import styles from './corpusUpdate.module.scss'

export default function CorpusUpdate({ corpus, onSubmit }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const { state: title, bindings: titleBindings } = useInput(corpus.name)
  const { state: description, bindings: descriptionBindings } = useInput(
    corpus.description
  )
  const titleInputRef = useRef()
  const { query } = useGraphQLClient()

  useEffect(() => {
    if (titleInputRef.current !== undefined) {
      titleInputRef.current.focus()
    }
  }, [titleInputRef])

  const handleSubmit = useCallback(
    async (event) => {
      try {
        event.preventDefault()
        await query({
          query: updateCorpus,
          variables: {
            corpusId: corpus._id,
            updateCorpusInput: {
              name: title,
              description,
            },
          },
        })
        onSubmit()
        setToast({
          text: t('corpus.update.toastSuccess'),
          type: 'default',
        })
      } catch (err) {
        setToast({
          text: t('corpus.update.toastFailure', {
            errorMessage: err.toString(),
          }),
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
          <label>Description</label>
          <Textarea
            {...descriptionBindings}
            label={t('corpus.editForm.descriptionField')}
            placeholder={t('corpus.createForm.descriptionPlaceholder')}
          />
        </div>
        <ul className={styles.actions}>
          <li>
            <Button
              onClick={handleSubmit}
              className={styles.button}
              type="secondary"
              title={t('corpus.editForm.buttonTitle')}
            >
              {t('corpus.editForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
