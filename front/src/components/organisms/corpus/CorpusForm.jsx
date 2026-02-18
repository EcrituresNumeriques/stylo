import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import { useCorpusActions } from '../../../hooks/corpus.js'
import { Field, Select } from '../../atoms/index.js'
import { FormActions } from '../../molecules/index.js'

import styles from './corpusCreate.module.scss'

/**
 * @param {object} props
 * @param {{[key: string]: unknown}|undefined} props.corpus
 * @param {() => void} props.onSubmit
 * @param {() => void} props.onCancel
 * @returns {Element}
 */
export default function CorpusForm({ corpus, onSubmit = () => {}, onCancel }) {
  const { t } = useTranslation('corpus', { useSuspense: false })
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
      onSubmit()
      toast(t(`actions.${action}.success`), {
        type: 'info',
      })
    } catch (err) {
      toast(t(`actions.${action}.error`, { errorMessage: err.message }), {
        type: 'error',
      })
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Field
        required={true}
        ref={titleInputRef}
        name="title"
        label={t('actions.create.fields.name')}
        type="text"
        defaultValue={corpus?.name}
      />
      <Select
        name="type"
        id="type"
        label={t('actions.create.fields.type')}
        defaultValue={corpus?.type}
        disabled={corpus !== undefined}
      >
        <option value={'neutral'} key={'neutral'}>
          {t('types.neutral')}
        </option>
        <option value={'journal'} key={'journal'}>
          {t('types.journal')}
        </option>
        <option value={'thesis'} key={'thesis'}>
          {t('types.thesis')}
        </option>
        <option value={'book'} key={'book'}>
          {t('types.book')}
        </option>
      </Select>
      <Field
        name="tdescriptione"
        label={t('actions.create.fields.description.label')}
        placeholder={t('actions.create.fields.description.placeholder')}
        type="textarea"
        rows={5}
        defaultValue={corpus?.description}
      />
      <FormActions
        onCancel={onCancel}
        submitButton={{
          text: t(`actions.${action}.submit`),
          title: t(`actions.${action}.submit`),
        }}
      />
    </form>
  )
}
