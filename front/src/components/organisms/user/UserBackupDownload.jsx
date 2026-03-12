import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import { useBackup } from '../../../hooks/user.js'
import { Select } from '../../atoms/index.js'
import { FormActions } from '../../molecules/index.js'

import WorkspaceSelector from '../../molecules/WorkspaceSelector.jsx'

import fieldStyles from '../../atoms/Field.module.scss'
import styles from './Credentials.module.scss'

export default function UserBackupDownload({ onCancel }) {
  const { t } = useTranslation('user', { useSuspense: false })
  const [isDownloading, setIsDownloading] = useState(false)
  const [scope, setScope] = useState('mine')
  const [format, setFormat] = useState('zip')
  const [versions, setVersions] = useState('latest')
  const { download } = useBackup()
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        const formInput = fromFormData(event.target)
        setIsDownloading(true)
        try {
          await download({
            scope,
            versions,
            format,
            workspaceId: formInput.workspace,
          })
          toast(t('actions.download.form.success'), { type: 'success' })
        } catch (e) {
          toast(t('actions.download.form.error', { errMessage: e.message }), {
            type: 'error',
          })
        } finally {
          setIsDownloading(false)
        }
      }}
      className={styles.form}
    >
      <Select
        name="type"
        id="type"
        label={t('actions.download.form.scope.label')}
        defaultValue={scope}
        disabled={isDownloading}
        onChange={(e) => setScope(e.target.value)}
      >
        <option value={'mine'} key={'mine'}>
          {t('actions.download.form.scope.mine')}
        </option>
        <option value={'workspace'} key={'workspace'}>
          {t('actions.download.form.scope.workspace')}
        </option>
        <option value={'all'} key={'all'}>
          {t('actions.download.form.scope.all')}
        </option>
      </Select>

      {scope === 'workspace' && (
        <WorkspaceSelector
          label={t('actions.download.form.workspace.label')}
          disabled={isDownloading}
        />
      )}

      <div>
        <div className={fieldStyles.field}>
          <label htmlFor="format">
            {t('actions.download.form.format.label')}
          </label>
        </div>
        <div className={styles.radio}>
          <label>
            <input
              type="radio"
              name="format"
              value="json"
              checked={format === 'json'}
              disabled={isDownloading}
              onChange={(e) => setFormat(e.target.value)}
            />
            {t('actions.download.form.format.json')}
          </label>
          <label>
            <input
              type="radio"
              name="format"
              value="zip"
              checked={format === 'zip'}
              disabled={isDownloading}
              onChange={(e) => setFormat(e.target.value)}
            />
            {t('actions.download.form.format.zip')}
          </label>
        </div>
      </div>

      <div>
        <div className={fieldStyles.field}>
          <label htmlFor="versions">
            {t('actions.download.form.versions.label')}
          </label>
        </div>
        <div className={styles.radio}>
          <label>
            <input
              type="radio"
              name="versions"
              value="latest"
              checked={versions === 'latest'}
              disabled={isDownloading}
              onChange={(e) => setVersions(e.target.value)}
            />
            {t('actions.download.form.versions.latest')}
          </label>
          <label>
            <input
              type="radio"
              name="versions"
              value="all"
              checked={versions === 'all'}
              disabled={isDownloading}
              onChange={(e) => setVersions(e.target.value)}
            />
            {t('actions.download.form.versions.all')}
          </label>
        </div>
      </div>

      <FormActions
        onCancel={onCancel}
        submitButton={{
          text: t('actions.download.form.submit.text'),
          title: t('actions.download.form.submit.title'),
          disabled: isDownloading,
        }}
      />
    </form>
  )
}
