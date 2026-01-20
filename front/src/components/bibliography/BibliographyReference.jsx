import { Clipboard, Trash } from 'lucide-react'
import React, { memo, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useCopyToClipboard } from 'react-use'

import { useModal } from '../../hooks/modal.js'

import Modal from '../Modal.jsx'
import ReferenceTypeIcon from '../ReferenceTypeIcon.jsx'
import Button from '../atoms/Button.jsx'
import FormActions from '../molecules/FormActions.jsx'

import styles from './BibliographyReference.module.scss'

const CopyButton = memo(function ReferenceCopyButton({ text }) {
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()

  const handleCopy = useCallback(() => {
    copyToClipboard(text)
    toast(t('write.copyReferenceToClipboard.successToast', { text }), {
      type: 'info',
    })
  }, [])

  return (
    <Button
      title={t('write.copyReferenceToClipboard.Button', { text })}
      className={styles.copyToClipboard}
      onClick={handleCopy}
      icon
    >
      <Clipboard />
    </Button>
  )
})

export default function BibliographyReference({ entry, onRemove }) {
  const { key, title, type, date, authorName } = entry
  const text = `[@${key}]`
  const { t } = useTranslation()
  const deleteReferenceModal = useModal()

  return (
    <>
      <div className={styles.reference}>
        <ReferenceTypeIcon type={type} className={styles.referenceTypeIcon} />

        <div className={styles.referenceInfo}>
          <p
            className={styles.referencePrimaryInfo}
            title={authorName + ' | ' + title}
          >
            {authorName && (
              <span className={styles.referenceAuthor}>{authorName}</span>
            )}
            <span className={styles.referenceTitle} title={title}>
              {title}
            </span>
            <span className={styles.referenceDate}>{date}</span>
          </p>
          <p className={styles.referenceSecondaryInfo}>
            <span className={styles.referenceKey} title={'@' + key}>
              @{key}
            </span>
          </p>
        </div>

        <CopyButton text={text} />
        <Button icon={true} onClick={() => deleteReferenceModal.show()}>
          <Trash />
        </Button>
      </div>

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
