import { Textarea, useInput, useToasts } from '@geist-ui/core'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCorpusActions } from '../../hooks/corpus.js'

import Field from '../Field.jsx'
import FormActions from '../molecules/FormActions.jsx'

import styles from './corpusCreate.module.scss'

/**
 * @param props
 * @param {function} props.onSubmit
 * @param {function} props.onCancel
 * @return {Element}
 * @constructor
 */
export default function CorpusCreate({ onSubmit, onCancel }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const { state: title, bindings: titleBindings } = useInput('')
  const { state: description, bindings: descriptionBindings } = useInput('')
  const titleInputRef = useRef(null)
  const { createCorpus } = useCorpusActions()

  useEffect(() => {
    if (titleInputRef.current !== undefined) {
      titleInputRef.current.focus()
    }
  }, [titleInputRef])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      try {
        await createCorpus({ title, description })
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
          required={true}
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
        <FormActions
          onCancel={onCancel}
          submitButton={{
            text: t('corpus.createForm.buttonText'),
            title: t('corpus.createForm.buttonTitle'),
          }}
        />
      </form>
    </section>
  )
}
