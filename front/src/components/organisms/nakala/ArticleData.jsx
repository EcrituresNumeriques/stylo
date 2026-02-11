import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditableArticle } from '../../../hooks/article.js'
import { useModal } from '../../../hooks/modal.js'
import { Button } from '../../atoms/index.js'
import { Loading } from '../../molecules/index.js'

import Modal from '../../molecules/Modal.jsx'
import DataNakalaFetch from './DataNakalaFetch.jsx'
import NakalaRecords from './NakalaRecords.jsx'

import styles from './ArticleData.module.scss'

export default function ArticleData({ articleId }) {
  const { article, updateNakalaLink, isLoading } = useEditableArticle({
    articleId,
  })
  const { t } = useTranslation('data', { useSuspense: false })
  const nakalaModal = useModal()
  const handleCollectionChange = useCallback(
    async (value) => {
      nakalaModal.close()
      await updateNakalaLink(value)
    },
    [nakalaModal, updateNakalaLink]
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <section>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('title')}</h2>
      </header>
      <section>
        <div className={styles.headingActions}>
          <Button small={true} onClick={() => nakalaModal.show()}>
            {t('actions.fetch.label')}
          </Button>
        </div>
        <NakalaRecords collectionUri={article?.nakalaLink} />
        <Modal {...nakalaModal.bindings} title={t('actions.fetch.label')}>
          <DataNakalaFetch
            initialCollectionUri={article?.nakalaLink}
            onChange={handleCollectionChange}
          />
        </Modal>
      </section>
    </section>
  )
}
