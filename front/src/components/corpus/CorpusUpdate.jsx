import { Textarea, useInput, useToasts } from '@geist-ui/core'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCorpusActions } from '../../hooks/corpus.js'

import Field from '../Field.jsx'
import FormActions from '../molecules/FormActions.jsx'

import styles from './corpusUpdate.module.scss'

export default function CorpusUpdate({ corpus, onSubmit, onCancel }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const { state: title, bindings: titleBindings } = useInput(corpus.name)
  const { state: description, bindings: descriptionBindings } = useInput(
    corpus.description
  )
  const titleInputRef = useRef(null)
  const { updateCorpus } = useCorpusActions()

  useEffect(() => {
    if (titleInputRef.current !== undefined) {
      titleInputRef.current.focus()
    }
  }, [titleInputRef])

  const handleSubmit = useCallback(
    async (event) => {
      try {
        event.preventDefault()
        await updateCorpus({
          corpusId: corpus._id,
          title,
          description,
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
        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitButton={{
            text: t('corpus.editForm.buttonText'),
            title: t('corpus.editForm.buttonTitle'),
          }}
        />
      </form>
    </section>
  )
}
