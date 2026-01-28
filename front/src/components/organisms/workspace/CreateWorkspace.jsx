import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import { useWorkspaceActions } from '../../../hooks/workspace.js'
import { Field } from '../../atoms/index.js'
import { FormActions } from '../../molecules/index.js'

import styles from './createWorkspace.module.scss'

/**
 * @param {Object} props
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 * @return {JSX.Element}
 */
export default function CreateWorkspace({ onSubmit, onCancel }) {
  const { t } = useTranslation()
  const { addWorkspace } = useWorkspaceActions()

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    try {
      const createWorkspaceInput = fromFormData(event.target)
      await addWorkspace(createWorkspaceInput)
      toast(t('workspace.create.successNotification'), {
        type: 'info',
      })

      onSubmit()
    } catch (err) {
      toast(t('workspace.create.errorNotification', { errMessage: err }), {
        type: 'error',
      })
    }
  }, [])

  return (
    <section>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Field
          autoFocus={true}
          required={true}
          type="text"
          name="name"
          label={t('workspace.createForm.nameField')}
          className={styles.name}
        />
        <Field
          label={t('workspace.createForm.descriptionField')}
          type="text"
          name="description"
        />
        <Field
          label={t('workspace.createForm.colorField')}
          type="color"
          name="color"
        />
        <FormActions
          onCancel={onCancel}
          submitButton={{
            text: t('workspace.createForm.buttonText'),
            title: t('workspace.createForm.buttonTitle'),
          }}
        />
      </form>
    </section>
  )
}
