import { Delete } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useModal } from '../../../hooks/modal.js'
import { Button } from '../../atoms/index.js'

import Modal from '../../molecules/Modal.jsx'
import UserDeleteConfirm from './UserDeleteConfirm.jsx'

import styles from './UserSection.module.scss'

export default function UserDelete() {
  const { t } = useTranslation('user', { useSuspense: false })
  const deleteAccountModal = useModal()
  return (
    <section className={styles.section}>
      <h2>{t('actions.delete.title')}</h2>
      <div className={styles.description}>
        {t('actions.delete.description')}
      </div>
      <div>
        <Button
          className={styles.danger}
          onClick={() => deleteAccountModal.show()}
        >
          {t('actions.delete.title')}
        </Button>
      </div>
      <Modal
        {...deleteAccountModal.bindings}
        title={
          <>
            <Delete /> {t('actions.delete.title')}
          </>
        }
      >
        <UserDeleteConfirm onCancel={() => deleteAccountModal.close()} />
      </Modal>
    </section>
  )
}
