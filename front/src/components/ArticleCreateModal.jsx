import { Modal as GeistModal } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ArticleCreate from './ArticleCreate.jsx'

export default function ArticleCreateModal({
  visible,
  setVisible,
  bindings,
  onCreate,
  onClose,
}) {
  const { t } = useTranslation()
  const handleClose = useCallback(() => {
    setVisible(false)
    if (onClose) {
      onClose()
    }
  }, [setVisible, onClose])
  return (
    <GeistModal width="40rem" visible={visible} {...bindings}>
      <h2>{t('article.createModal.title')}</h2>
      <GeistModal.Content>
        <ArticleCreate onSubmit={onCreate} />
      </GeistModal.Content>
      <GeistModal.Action passive onClick={handleClose}>
        {t('modal.close.text')}
      </GeistModal.Action>
    </GeistModal>
  )
}
