import {
  useNakalaCollectionData,
  useNakalaUsersData,
} from '../../../hooks/nakala.js'
import { Alert, Loading } from '../../molecules/index.js'

import NakalaRecord from './NakalaRecord.jsx'

import styles from './NakalaRecords.module.scss'

export default function NakalaRecords({ collection }) {
  const { records, total, isLoading, error } =
    useNakalaCollectionData(collection)
  if (isLoading) return <Loading />
  if (error) return <Alert message={error.message} />

  console.log({ records })
  return (
    <section className={styles.container}>
      <div className={styles.counter}>{total} données</div>
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
