import { FingerprintPattern } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
      <h2 className={styles.title}>{metaTitle?.value}</h2>
      <div>
        <div className={styles.identifier}>
          <FingerprintPattern size={16} /> <pre>{data.identifier}</pre>
        </div>
      </div>
      <ObjectMetadataLabel
        creatorName={data.owner.name}
        updatedAtDate={data.modDate}
      ></ObjectMetadataLabel>
    </div>
  )
}
