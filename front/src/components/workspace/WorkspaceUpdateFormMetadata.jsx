import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { fromFormData } from '../../helpers/forms.js'
import { useWorkspaceActions } from '../../hooks/workspace.js'
import { FormActions } from '../molecules/index.js'

import buttonStyles from '../atoms/Button.module.scss'
import styles from './createWorkspace.module.scss'

/**
 * @param {Object} props
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 * @param {Object} props.workspace
 * @return {JSX.Element}
 */
export default function WorkspaceUpdateFormMetadata({
  onSubmit,
  onCancel,
  workspace,
}) {
  const { t } = useTranslation()
  const { updateFormMetadata } = useWorkspaceActions()

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    try {
      const updateFormMetadataInput = fromFormData(event.target)
      await updateFormMetadata(workspace._id, updateFormMetadataInput)
      toast(t('workspace.updateFormMetadata.successNotification'), {
        type: 'info',
      })

      onSubmit()
    } catch (err) {
      toast(
        t('workspace.updateFormMetadata.errorNotification', {
          errMessage: err,
        }),
        {
          type: 'error',
        }
      )
    }
  }, [])

  return (
    <section>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="data">{t('workspace.formMetadata.data')}</label>
        <div>
          <textarea
            id="data"
            name="data"
            className={buttonStyles.textarea}
            style={{ width: '100%' }}
            rows="12"
          >
            {workspace.formMetadata?.data}
          </textarea>
        </div>
        <label htmlFor="ui">{t('workspace.formMetadata.ui')}</label>
        <div>
          <textarea
            id="ui"
            name="ui"
            className={buttonStyles.textarea}
            style={{ width: '100%' }}
            rows="10"
          >
            {workspace.formMetadata?.ui}
          </textarea>
        </div>

        <FormActions
          onCancel={onCancel}
          submitButton={{
            text: t('workspace.updateFormMetadata.buttonText'),
            title: t('workspace.updateFormMetadata.buttonTitle'),
          }}
        />
      </form>
    </section>
  )
}
