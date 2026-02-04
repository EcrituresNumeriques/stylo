import { useNakalaUsersData } from '../../../hooks/nakala.js'
import { Alert, Loading } from '../../molecules/index.js'

import NakalaRecord from './NakalaRecord.jsx'

import styles from './NakalaRecords.module.scss'

export default function NakalaRecords() {
  const { records, total, isLoading, error } = useNakalaUsersData('readable', {
    page: 1,
    limit: 20,
    orders: ['creDate,desc'],
  })
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
