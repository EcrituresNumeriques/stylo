import clsx from 'clsx'
import { Download, HardDriveUpload, Loader } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'
import { toast } from 'react-toastify'

import { useModal } from '../../../hooks/modal.js'
import { useAccount } from '../../../hooks/user.js'
import buttonStyles from '../../atoms/Button.module.scss'
import { Button } from '../../atoms/index.js'

import Modal from '../../molecules/Modal.jsx'
import UserBackupDownload from './UserBackupDownload.jsx'

import styles from './UserSection.module.scss'

export default function UserBackup() {
  const { t } = useTranslation()
  const { t: tUser } = useTranslation('user', { useSuspense: false })
  const downloadDataModal = useModal()
  const { download } = useAccount()
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useRouteLoaderData('app')
  const storage = user?.authProviders?.webdav

  // personal space, zipped, with every version
  async function saveToStorage() {
    setIsSaving(true)
    try {
      const { browseUrl } = await download({
        scope: 'mine',
        format: 'zip',
        versions: 'all',
        destination: 'storage',
      })
      const message = tUser('data.saveToStorageSuccess')
      toast(
        browseUrl ? (
          <>
            {message}{' '}
            <a href={browseUrl} target="_blank" rel="noreferrer">
              {tUser('data.saveToStorageBrowse')}
            </a>
          </>
        ) : (
          message
        ),
        { type: 'success' }
      )
    } catch (error) {
      toast(tUser('data.saveToStorageError', { errMessage: error.message }), {
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className={styles.section} id="backup">
      <h2>{t('user.data.title')}</h2>
      <div>
        <Button primary={true} onClick={() => downloadDataModal.show()}>
          {t('user.data.download')}
        </Button>{' '}
        <Button onClick={saveToStorage} disabled={!storage || isSaving}>
          {isSaving ? <Loader /> : <HardDriveUpload />}
          {tUser('data.saveToStorage')}
        </Button>{' '}
        {storage?.backupsUrl && (
          <a
            className={clsx(buttonStyles.button, buttonStyles.secondary)}
            href={storage.backupsUrl}
            target="_blank"
            rel="noreferrer"
          >
            {tUser('data.browseBackups')}
          </a>
        )}
      </div>
      <Modal
        {...downloadDataModal.bindings}
        title={
          <>
            <Download /> {t('user.data.download')}
          </>
        }
      >
        <UserBackupDownload onCancel={() => downloadDataModal.close()} />
      </Modal>
    </section>
  )
}
