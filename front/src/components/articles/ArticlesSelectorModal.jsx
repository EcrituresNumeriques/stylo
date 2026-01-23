import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { useGraphQLClient } from '../../helpers/graphQL.js'
import { FormActions } from '../molecules/index.js'

import Modal from '../Modal.jsx'
import { ArticlesSelector } from './ArticlesSelector.jsx'

import { setCorpusArticles } from '../../hooks/Corpus.graphql'

import styles from './ArticlesSelectorModal.module.scss'

export default function ArticlesSelectorModal({
  corpusId,
  corpusArticles,
  close,
  bindings,
  onUpdate,
}) {
  const { t } = useTranslation()
  const [selectedArticleIds, setSelectedArticleIds] = useState([])
  const { query } = useGraphQLClient()

  const handleSubmit = useCallback(async () => {
    try {
      await query({
        query: setCorpusArticles,
        variables: { corpusId, articleIds: selectedArticleIds },
      })
      toast(t('article.addToCorpus.success'), { type: 'info' })
      close()
      onUpdate()
    } catch (err) {
      toast(t('article.addToCorpus.error', { errMessage: err }), {
        type: 'error',
      })
    }
  }, [corpusId, selectedArticleIds])

  return (
    <Modal {...bindings} title={t('article.addToCorpus.modal.title')}>
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
          text: t(`article.addToCorpus.label`),
          title: t(`article.addToCorpus.title`),
        }}
      />
    </Modal>
  )
}
