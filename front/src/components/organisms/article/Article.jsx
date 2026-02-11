import clsx from 'clsx'
import {
  Book,
  MessageSquareShare,
  Pencil,
  Printer,
  Send,
  Tag,
  Trash,
  UserPlus,
} from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { useCopyToClipboard } from 'react-use'

import { useArticleActions } from '../../../hooks/article.js'
import useFetchData from '../../../hooks/graphql.js'
import { useModal } from '../../../hooks/modal.js'
import { useDisplayName } from '../../../hooks/user.js'
import { Button, Color } from '../../atoms/index.js'
import {
  DropdownMenu,
  FormActions,
  ObjectMetadataLabel,
} from '../../molecules/index.js'
import { ArticleForm } from '../index.js'

import Modal from '../../molecules/Modal.jsx'
import Export from '../export/Export.jsx'
import ArticleContributors from './sharing/ArticleContributors.jsx'
import ArticleSendCopy from './sharing/ArticleSendCopy.jsx'

import {
  getArticleContributors,
  getArticleTags,
} from '../../../hooks/Article.graphql'

import buttonStyles from '../../atoms/Button.module.scss'
import styles from './Article.module.scss'

/**
 * @param {object} props
 * @param {{title: string, owner: {displayName: string|undefined, username: string}, updatedAt: string, _id: string }} props.article
 * @param {{id: string, name: string}[]} props.corpus
 * @returns {JSX.Element}
 * @class
 */
export default function Article({ article, corpus }) {
  const displayName = useDisplayName()
  const activeUser = useSelector((state) => state.activeUser)
  const articleId = useMemo(() => article._id, [article])
  const { workspaceId: activeWorkspaceId } = useParams()
  const articleActions = useArticleActions({ articleId, activeWorkspaceId })

  const { data: contributorsQueryData, error: contributorsError } =
    useFetchData(
      { query: getArticleContributors, variables: { articleId } },
      {
        fallbackData: {
          article,
        },
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }
    )
  const contributors = (
    contributorsQueryData?.article?.contributors || []
  ).filter((c) => c.user._id !== article.owner._id)
  const { data: articleTagsQueryData } = useFetchData(
    { query: getArticleTags, variables: { articleId } },
    {
      fallbackData: {
        article,
      },
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const tags = articleTagsQueryData?.article?.tags || []
  const { t } = useTranslation('article', { useSuspense: false })
  const { t: tModal } = useTranslation('modal', { useSuspense: false })
  const [, copyToClipboard] = useCopyToClipboard()

  const exportModal = useModal()
  const sharingModal = useModal()
  const sendCopyModal = useModal()
  const deleteModal = useModal()
  const updateModal = useModal()

  const isArticleOwner = activeUser._id === article.owner._id

  useEffect(() => {
    if (contributorsError) {
      toast(`Unable to load contributors: ${contributorsError.toString()}`, {
        type: 'error',
      })
    }
  }, [contributorsError])

  const handleDuplicate = useCallback(async () => {
    await articleActions.duplicate(article)
  }, [articleActions])

  const handleCopyId = useCallback(() => {
    copyToClipboard(articleId)
    toast(t('actions.copyId.success'), { type: 'success' })
  }, [articleId])

  const handleDeleteArticle = async () => {
    deleteModal.close()
    try {
      await articleActions.remove()
      toast(t('actions.delete.success'), { type: 'info' })
    } catch (err) {
      toast(t('actions.delete.error', { errMessage: err.message }), {
        type: 'error',
      })
    }
  }

  const canDeleteArticle = isArticleOwner && !activeWorkspaceId
  return (
    <article
      className={styles.article}
      aria-labelledby={`article-${article._id}-title`}
      role="listitem"
    >
      <header className={styles.header}>
        <div className={styles.title}>
          <h2 id={`article-${article._id}-title`}>{article.title}</h2>
        </div>

        <div role="menu" className={styles.actionButtons}>
          <Button
            role="menuitem"
            icon={true}
            onClick={() => sharingModal.show()}
            title={t('actions.share.title')}
          >
            <UserPlus aria-label={t('actions.share.label')} />
          </Button>

          <Link
            role="menuitem"
            target="_blank"
            className={buttonStyles.icon}
            to={`/article/${article._id}/annotate`}
            title={t('actions.annotate.title')}
          >
            <MessageSquareShare aria-label={t('actions.annotate.label')} />
          </Link>

          <Link
            role="menuitem"
            className={clsx(buttonStyles.primary, styles.primaryAction)}
            to={`/article/${article._id}`}
            title={t('actions.edit.title')}
          >
            <Pencil aria-label={t('actions.edit.label')} />
          </Link>
          <DropdownMenu title={t('actions.menu.title')}>
            <ul>
              <li
                onClick={() => {
                  exportModal.show()
                }}
                title={t('actions.export.title')}
              >
                {t('actions.export.label')}
              </li>
              <li
                onClick={() => {
                  updateModal.show()
                }}
                title={t('actions.update.title')}
              >
                {t('actions.update.label')}
              </li>
              <li
                onClick={handleDuplicate}
                title={t('actions.duplicate.title')}
              >
                {t('actions.duplicate.label')}
              </li>
              <li
                onClick={() => {
                  sendCopyModal.show()
                }}
                title={t('actions.sendCopy.title')}
              >
                {t('actions.sendCopy.label')}
              </li>
              <li onClick={handleCopyId} title={t('actions.copyId.title')}>
                {t('actions.copyId.label')}
              </li>
              {canDeleteArticle && (
                <li
                  onClick={() => {
                    deleteModal.show()
                  }}
                  title={t('actions.delete.title')}
                >
                  {t('actions.delete.label')}
                </li>
              )}
            </ul>
          </DropdownMenu>
        </div>
      </header>
      <section style={{ width: '100%' }}>
        <div className={styles.details}>
          {tags.length > 0 && (
            <div className={styles.tags}>
              <Tag size={18} />
              {tags.map((t) => (
                <div
                  key={t._id}
                  className={styles.tag}
                  style={{
                    backgroundColor: Color.rrggbbaa(t.color || '#cccccc', 10),
                    borderColor: Color.rrggbbaa(t.color || '#cccccc', 20),
                  }}
                >
                  <div>{t.name}</div>
                  <div
                    key={'tag-' + t._id}
                    className={styles.tagChip}
                    style={{ backgroundColor: t.color || '#ccc' }}
                    aria-hidden
                  />
                </div>
              ))}
            </div>
          )}
          {corpus.length > 0 && (
            <div className={styles.corpuses}>
              <Book size={18} />
              {corpus.map((c) => (
                <div key={c.id}>{c.name}</div>
              ))}
            </div>
          )}
          <ObjectMetadataLabel
            className={styles.metadata}
            updatedAtDate={article.updatedAt}
            creatorName={displayName(article.owner)}
          />
        </div>
      </section>

      <Modal
        {...exportModal.bindings}
        title={
          <>
            <Printer /> {t('actions.export.title')}
          </>
        }
      >
        <Export
          articleId={article._id}
          bib={article.workingVersion?.bibPreview}
          name={article.title}
          onCancel={() => exportModal.close()}
        />
      </Modal>

      <Modal
        {...sharingModal.bindings}
        title={
          <>
            <UserPlus /> {t('actions.share.title')}
          </>
        }
        subtitle={t('actions.share.description')}
      >
        <ArticleContributors article={article} contributors={contributors} />
        <footer className={styles.actions}>
          <Button type="button" onClick={() => sharingModal.close()}>
            {tModal('closeButton.text')}
          </Button>
        </footer>
      </Modal>

      <Modal
        {...sendCopyModal.bindings}
        title={
          <>
            <Send /> {t('actions.sendCopy.title')}
          </>
        }
        subtitle={
          <>
            <span className={styles.sendText}>
              {t('actions.sendCopy.description')}
            </span>
            <span>
              <Send className={styles.sendIcon} />
            </span>
          </>
        }
      >
        <ArticleSendCopy
          article={article}
          cancel={() => sendCopyModal.close()}
        />
        <footer className={styles.actions}>
          <Button type="button" onClick={() => sendCopyModal.close()}>
            {tModal('closeButton.text')}
          </Button>
        </footer>
      </Modal>

      <Modal
        {...deleteModal.bindings}
        title={
          <>
            <Trash /> {t('actions.delete.title')}
          </>
        }
      >
        {t('actions.delete.confirm')}
        {contributors && contributors.length > 0 && (
          <div className={clsx(styles.note, styles.important)}>
            {t('actions.delete.contributorsRemovalNote')}
          </div>
        )}
        <FormActions
          onSubmit={handleDeleteArticle}
          onCancel={() => deleteModal.close()}
          submitButton={{
            text: tModal('deleteButton.text'),
            title: tModal('deleteButton.text'),
          }}
        />
      </Modal>

      <Modal {...updateModal.bindings} title={t('actions.update.title')}>
        <ArticleForm
          article={article}
          onSubmit={() => updateModal.close()}
          workspaceId={activeWorkspaceId}
          onCancel={() => updateModal.close()}
        />
      </Modal>
    </article>
  )
}
