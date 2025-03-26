import React, { memo, useCallback } from 'react'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import { useToasts } from '@geist-ui/core'

import { Clipboard } from 'lucide-react'
import styles from './reference.module.scss'
import ReferenceTypeIcon from '../ReferenceTypeIcon'
import Button from '../Button'

const CopyButton = memo(function ReferenceCopyButton({ text }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()

  const handleCopy = useCallback(() => {
    copy(text)
    setToast({
      type: 'default',
      text: t('write.copyReferenceToClipboard.successToast', { text }),
    })
  })

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

export default function BibliographyReference({ entry }) {
  const { key, title, type, date, authorName } = entry
  const text = `[@${key}]`

  return (
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
    </div>
  )
}
