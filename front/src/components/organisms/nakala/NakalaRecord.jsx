import { Clipboard, FingerprintPattern } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../atoms/index.js'
import { ObjectMetadataLabel } from '../../molecules/index.js'

import styles from './NakalaRecord.module.scss'

export default function NakalaRecord({ data }) {
  const { i18n } = useTranslation()
  const metaTitles = data.metas.filter(
    (meta) => meta.propertyUri === 'http://nakala.fr/terms#title'
  )
  let metaTitle
  if (metaTitles.length > 1) {
    metaTitle =
      metaTitles.find((meta) => meta.lang === i18n.language) ?? metaTitles[0]
  } else if (metaTitles.length > 0) {
    metaTitle = metaTitles[0]
  }
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h3 className={styles.title}>{metaTitle?.value}</h3>
        <div>
          <div className={styles.identifier}>
            <FingerprintPattern size={16} /> <pre>{data.identifier}</pre>
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button title={''} onClick={() => {}} icon>
          <Clipboard />
        </Button>
      </div>
    </div>
  )
}
