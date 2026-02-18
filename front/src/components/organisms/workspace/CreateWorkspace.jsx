import clsx from 'clsx'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import { useWorkspaceActions } from '../../../hooks/workspace.js'
import { Field } from '../../atoms/index.js'
import { FormActions } from '../../molecules/index.js'

import styles from './createWorkspace.module.scss'

/**
 * @param {object} props
 * @param {() => void} props.onSubmit
 * @param {() => void} props.onCancel
 * @returns {JSX.Element}
 */
export default function CreateWorkspace({ onSubmit, onCancel }) {
  const { t } = useTranslation('workspace', { useSuspense: false })
  const { addWorkspace } = useWorkspaceActions()

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    try {
      const createWorkspaceInput = fromFormData(event.target)
      await addWorkspace(createWorkspaceInput)
      toast(t('actions.create.success'), {
        type: 'info',
      })

      onSubmit()
    } catch (err) {
      toast(t('actions.create.error', { errMessage: err }), {
        type: 'error',
      })
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Field
        autoFocus={true}
        required={true}
        type="text"
        name="name"
        label={t('actions.create.fields.name')}
      />
      <Field
        type="textarea"
        name="description"
        label={t('actions.create.fields.description.label')}
        placeholder={t('actions.create.fields.description.placeholder')}
      />
      <Field
        label={t('actions.create.fields.color')}
        type="color"
        name="color"
      />
      <FormActions
        onCancel={onCancel}
        submitButton={{
          text: t('actions.create.label'),
          title: t('actions.create.submit'),
        }}
      />
    </form>
  )
}
