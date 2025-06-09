import { useToasts } from '@geist-ui/core'
import clsx from 'clsx'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { fromFormData } from '../../helpers/forms.js'
import { useCorpusActions } from '../../hooks/corpus.js'

import Field from '../Field.jsx'
import fieldStyles from '../field.module.scss'
import FormActions from '../molecules/FormActions.jsx'

import styles from './corpusCreate.module.scss'

/**
 * @param props
 * @param {{[key: string]: any}|undefined} props.corpus
 * @param {function} props.onSubmit
 * @param {function} props.onCancel
 * @return {Element}
 * @constructor
 */
export default function CorpusForm({ corpus, onSubmit = () => {}, onCancel }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const titleInputRef = useRef(null)
  const { createCorpus, updateCorpus } = useCorpusActions()

  const action = useMemo(
    () => (corpus === undefined ? 'create' : 'update'),
    [corpus]
  )

  useEffect(() => {
    if (titleInputRef.current !== undefined) {
      titleInputRef.current.focus()
    }
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    try {
      const editCorpusInput = fromFormData(event.target)
      if (corpus !== undefined) {
        await updateCorpus({
          corpusId: corpus._id,
          ...editCorpusInput,
        })
      } else {
        await createCorpus(editCorpusInput)
      }
      console.log({onSubmit})
      onSubmit()
      setToast({
        text: t(`corpus.${action}.toastSuccess`),
        type: 'default',
      })
    } catch (err) {
      setToast({
        text: t(`corpus.${action}.toastFailure`, { errorMessage: err.message }),
        type: 'error',
      })
    }
  }, [])

  return (
    <section>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Field
          required={true}
          ref={titleInputRef}
          name="title"
          label={t('corpus.createForm.titleField')}
          type="text"
          defaultValue={corpus?.name}
        />
        <div className={clsx(fieldStyles.field, 'control-field')}>
          <label htmlFor="description">
            {t('corpus.createForm.descriptionField')}
          </label>
          <textarea
            name="description"
            id="description"
            placeholder={t('corpus.createForm.descriptionPlaceholder')}
            rows="5"
            defaultValue={corpus?.description}
          ></textarea>
        </div>
        <FormActions
          onCancel={onCancel}
          submitButton={{
            text: t(`corpus.${action}Form.buttonText`),
            title: t(`corpus.${action}Form.buttonTitle`),
          }}
        />
      </form>
    </section>
  )
}
