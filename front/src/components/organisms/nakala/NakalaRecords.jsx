import {
  getCollectionIdentifier,
  useNakalaSearchCollectionDatas,
} from '../../../hooks/nakala.js'
import { Alert, Loading } from '../../molecules/index.js'

import NakalaRecord from './NakalaRecord.jsx'

import styles from './NakalaRecords.module.scss'

export default function NakalaRecords({ collectionUri }) {
  const { records, isLoading, error } = useNakalaSearchCollectionDatas({
    collectionIdentifier: getCollectionIdentifier(collectionUri),
  })
  if (isLoading) return <Loading />
  if (error) return <Alert message={error.message} />

  return (
    <section>
      <div className={styles.records}>
        {records &&
          records.map((item, index) => (
            <article key={index}>
              <NakalaRecord data={item} />
            </article>
          ))}
      </div>
    </section>
  )
}
