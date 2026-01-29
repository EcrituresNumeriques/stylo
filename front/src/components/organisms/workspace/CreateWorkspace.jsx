import clsx from 'clsx'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import { useWorkspaceActions } from '../../../hooks/workspace.js'
import { Field } from '../../atoms/index.js'
import { FormActions } from '../../molecules/index.js'

import fieldStyles from '../../atoms/Field.module.scss'
import styles from './createWorkspace.module.scss'

/**
 * @param {Object} props
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 * @return {JSX.Element}
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
    <section>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Field
          autoFocus={true}
          required={true}
          type="text"
          name="name"
          label={t('actions.create.fields.name')}
          className={styles.name}
        />
        <div className={clsx(fieldStyles.field, 'control-field')}>
          <label htmlFor="description">
            {t('actions.create.fields.description.label')}
          </label>
          <textarea
            name="description"
            id="description"
            placeholder={t('actions.create.fields.description.placeholder')}
            rows="5"
          ></textarea>
        </div>
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
    </section>
  )
}
