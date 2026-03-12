import { Download } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

import { useModal } from '../../../hooks/modal.js'
import { Button } from '../../atoms/index.js'

import Modal from '../../molecules/Modal.jsx'
import UserBackupDownload from './UserBackupDownload.jsx'

import styles from './Credentials.module.scss'

export default function UserBackup() {
  const { t } = useTranslation()
  const downloadDataModal = useModal()
  return (
    <>
      <Helmet>
        <title>{t('user.account.title')}</title>
      </Helmet>
      <section className={styles.section}>
        <h2>{t('user.data.title')}</h2>
        <div>
          <Button primary={true} onClick={() => downloadDataModal.show()}>
            {t('user.data.download')}
          </Button>
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
    </>
  )
}
