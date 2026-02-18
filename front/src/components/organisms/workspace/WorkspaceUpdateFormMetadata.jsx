import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import { useWorkspaceActions } from '../../../hooks/workspace.js'
import { FormActions } from '../../molecules/index.js'
import { Field } from '../../atoms/index.js'

import buttonStyles from '../../atoms/Button.module.scss'
import styles from './createWorkspace.module.scss'

/**
 * @param {object} props
 * @param {() => void} props.onSubmit
 * @param {() => void} props.onCancel
 * @param {object} props.workspace
 * @returns {JSX.Element}
 */
export default function WorkspaceUpdateFormMetadata({
  onSubmit,
  onCancel,
  workspace,
}) {
  const { t } = useTranslation('workspace', { useSuspense: false })
  const { t: tModal } = useTranslation('modal', { useSuspense: false })
  const { updateFormMetadata } = useWorkspaceActions()

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    try {
      const updateFormMetadataInput = fromFormData(event.target)
      await updateFormMetadata(workspace._id, updateFormMetadataInput)
      toast(t('actions.metadata.success'), {
        type: 'info',
      })

      onSubmit()
    } catch (err) {
      toast(t('actions.metadata.error', { errMessage: err }), {
        type: 'error',
      })
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Field
        autoFocus={true}
        label={t('actions.metadata.fields.data')}
        type="textarea"
        rows={12}
        name="data"
        defaultValue={workspace.formMetadata?.data}
      />

      <Field
        label={t('actions.metadata.fields.ui')}
        type="textarea"
        rows={12}
        name="ui"
        defaultValue={workspace.formMetadata?.ui}
        />

      <FormActions
        onCancel={onCancel}
        submitButton={{
          text: tModal('update.text'),
          title: tModal('update.text'),
        }}
      />
    </form>
  )
}
