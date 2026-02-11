import { Trash } from 'lucide-react'
import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { useModal } from '../../../hooks/modal.js'
import { Button } from '../../atoms/index.js'
import { CopyButton, FormActions } from '../../molecules/index.js'

import Modal from '../../molecules/Modal.jsx'
import ReferenceTypeIcon from './ReferenceTypeIcon.jsx'

import styles from './BibliographyReference.module.scss'

export default function BibliographyReference({ entry, onRemove }) {
  const { key, title, type, date, authorName } = entry
  const { t } = useTranslation()
  const deleteReferenceModal = useModal()

  const text = useMemo(() => `[@${key}]`, [key])
  const referenceTitle = useMemo(
    () => [authorName, title, date].filter((e) => e).join(' | '),
    [authorName, title, date]
  )
  return (
    <>
      <article className={styles.container}>
        <div className={styles.content}>
          <header>
            <ReferenceTypeIcon type={type} className={styles.icon} />
            <h3 className={styles.title} title={referenceTitle}>
              {referenceTitle}
            </h3>
          </header>
          <div>
            <div className={styles.identifier} title={'@' + key}>
              <pre>@{key}</pre>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <CopyButton text={text} />
          <Button icon={true} onClick={() => deleteReferenceModal.show()}>
            <Trash />
          </Button>
        </div>
      </article>

      <Modal
        {...deleteReferenceModal.bindings}
        title={
          <>
            <Trash /> {t('bibliography.deleteReferenceModal.title')}
          </>
        }
      >
        <span>
          <Trans i18nKey="bibliography.deleteReferenceModal.confirmMessage">
            Text <span className={styles.key}>{{ key }}</span>
          </Trans>
        </span>
        <FormActions
          onSubmit={() => onRemove()}
          onCancel={() => deleteReferenceModal.close()}
          submitButton={{
            text: t('modal.deleteButton.text'),
            title: t('modal.deleteButton.text'),
          }}
        />
      </Modal>
    </>
  )
}
