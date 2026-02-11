import { Send } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'

import { useArticleActions } from '../../../../hooks/article.js'

import ContactSearch from '../../contact/ContactSearch.jsx'

import styles from './ArticleSendCopy.module.scss'

export default function ArticleSendCopy({ article }) {
  const { workspaceId: activeWorkspaceId } = useParams()
  const { copy } = useArticleActions({
    articleId: article._id,
    activeWorkspaceId,
  })
  const { t } = useTranslation()

  const handleUserUpdated = useCallback(
    async ({ user, action }) => {
      if (action === 'select' || action === 'unselect') {
        try {
          await copy(user._id)
          toast(
            t('article.sendCopy.successNotification', {
              username: user.displayName || user.username,
            }),
            {
              type: 'success',
            }
          )
        } catch (err) {
          toast(
            t('article.sendCopy.errorNotification', {
              errMessage: err.message,
            }),
            {
              type: 'error',
            }
          )
        }
      }
    },
    [article._id]
  )

  return (
    <section className={styles.acquintances}>
      <ContactSearch
        selectedIcon={<Send />}
        unselectedIcon={<Send />}
        onUserUpdated={handleUserUpdated}
        members={[]}
      />
    </section>
  )
}
