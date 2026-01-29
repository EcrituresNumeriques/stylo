import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { useGraphQLClient } from '../../../helpers/graphQL.js'
import { FormActions } from '../../molecules/index.js'

import Modal from '../../molecules/Modal.jsx'
import { ArticlesSelector } from './ArticlesSelector.jsx'

import { setCorpusArticles } from '../../../hooks/Corpus.graphql'

import styles from './ArticlesSelectorModal.module.scss'

export default function ArticlesSelectorModal({
  corpusId,
  corpusArticles,
  close,
  bindings,
  onUpdate,
}) {
  const { t } = useTranslation('corpus', { useSuspense: false })
  const [selectedArticleIds, setSelectedArticleIds] = useState([])
  const { query } = useGraphQLClient()

  const handleSubmit = useCallback(async () => {
    try {
      await query({
        query: setCorpusArticles,
        variables: { corpusId, articleIds: selectedArticleIds },
      })
      toast(t('actions.addArticles.success'), { type: 'info' })
      close()
      onUpdate()
    } catch (err) {
      toast(t('actions.addArticles.error', { errMessage: err }), {
        type: 'error',
      })
    }
  }, [corpusId, selectedArticleIds])

  return (
    <Modal {...bindings} title={t('actions.addArticles.modal.title')}>
      <div className={styles.container}>
        <ArticlesSelector
          corpusArticles={corpusArticles}
          onUpdate={(articleIds) => setSelectedArticleIds(articleIds)}
        />
      </div>
      <FormActions
        onCancel={() => close()}
        onSubmit={handleSubmit}
        cancelButton={{
          text: t('modal.closeButton.text'),
          title: t('modal.closeButton.text'),
        }}
        submitButton={{
          text: t(`actions.addArticles.modal.submit`),
          title: t(`actions.addArticles.modal.submit`),
        }}
      />
    </Modal>
  )
}
