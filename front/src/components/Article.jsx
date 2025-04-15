import { useToasts } from '@geist-ui/core'
import clsx from 'clsx'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  Pencil,
  Printer,
  Send,
  Trash,
  UserPlus,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { useArticleActions } from '../hooks/article.js'
import useFetchData from '../hooks/graphql'
import { useModal } from '../hooks/modal.js'
import { useActiveWorkspace } from '../hooks/workspace.js'

import ArticleContributors from './ArticleContributors.jsx'
import ArticleSendCopy from './ArticleSendCopy.jsx'
import ArticleTags from './ArticleTags.jsx'
import ArticleVersionLinks from './ArticleVersionLinks.jsx'
import Button from './Button.jsx'
import CorpusSelectItems from './corpus/CorpusSelectItems.jsx'
import Export from './Export.jsx'
import Field from './Field.jsx'
import Modal from './Modal.jsx'
import FormActions from './molecules/FormActions.jsx'
import TimeAgo from './TimeAgo.jsx'
import WorkspaceSelectionItems from './workspace/WorkspaceSelectionItems.jsx'

import { getArticleContributors, getArticleTags } from './Article.graphql'
import { getTags } from './Tag.graphql'

import buttonStyles from './button.module.scss'
import fieldStyles from './field.module.scss'
import styles from './article.module.scss'

/**
 * @param props
 * @param {{title: string, owner: {displayName: string}, updatedAt: string, _id: string }} props.article
 * @param props.onArticleUpdated
 * @param props.onArticleDeleted
 * @param props.onArticleCreated
 * @return {Element}
 * @constructor
 */
export default function Article({
  article,
  onArticleUpdated,
  onArticleDeleted,
  onArticleCreated,
}) {
  const activeUser = useSelector((state) => state.activeUser)
  const articleId = useMemo(() => article._id, [article])
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )
  const articleActions = useArticleActions({ articleId })

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
  const { data: userTagsQueryData } = useFetchData(
    { query: getTags, variables: {} },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const userTags = userTagsQueryData?.user?.tags || []
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
  const { t } = useTranslation()
  const { setToast } = useToasts()

  const exportModal = useModal()
  const sharingModal = useModal()
  const sendCopyModal = useModal()
  const deleteModal = useModal()
  const [expanded, setExpanded] = useState(false)
  const [renaming, setRenaming] = useState(false)

  const [newTitle, setNewTitle] = useState(article.title)

  const isArticleOwner = activeUser._id === article.owner._id

  useEffect(() => {
    if (contributorsError) {
      setToast({
        type: 'error',
        text: `Unable to load contributors: ${contributorsError.toString()}`,
      })
    }
  }, [contributorsError])

  const toggleExpansion = useCallback(
    (event) => {
      if (!event.key || [' ', 'Enter'].includes(event.key)) {
        setExpanded(!expanded)
      }
    },
    [setExpanded, expanded]
  )

  const duplicate = async () => {
    const duplicatedArticleQuery = await articleActions.duplicate()
    onArticleCreated({
      ...article,
      ...duplicatedArticleQuery.duplicateArticle,
      contributors: [],
      versions: [],
    })
  }

  const rename = async (e) => {
    e.preventDefault()
    await articleActions.rename(newTitle)
    onArticleUpdated({
      ...article,
      title: newTitle,
    })
    setRenaming(false)
  }

  const handleDeleteArticle = async () => {
    try {
      await articleActions.remove()
      onArticleDeleted(article)
      setToast({
        type: 'default',
        text: t('article.delete.toastSuccess'),
      })
    } catch (err) {
      setToast({
        type: 'error',
        text: t('article.delete.toastError', { errMessage: err.message }),
      })
    }
  }

  const handleArticleTagsUpdated = useCallback(
    (event) => {
      onArticleUpdated({
        ...article,
        tags: event.updatedTags,
      })
    },
    [article]
  )

  return (
    <article className={styles.article}>
      <Modal
        {...exportModal.bindings}
        title={
          <>
            <Printer /> Export
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
            <UserPlus /> {t('article.shareModal.title')}
          </>
        }
        subtitle={t('article.shareModal.description')}
      >
        <ArticleContributors article={article} contributors={contributors} />
        <footer className={styles.actions}>
          <Button type="button" onClick={() => sharingModal.close()}>
            {t('modal.closeButton.text')}
          </Button>
        </footer>
      </Modal>

      <Modal
        {...sendCopyModal.bindings}
        title={
          <>
            <Send /> {t('article.sendCopyModal.title')}
          </>
        }
        subtitle={
          <>
            <span className={styles.sendText}>
              {t('article.sendCopyModal.description')}
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
            {t('modal.closeButton.text')}
          </Button>
        </footer>
      </Modal>

      <Modal
        {...deleteModal.bindings}
        title={
          <>
            <Trash /> {t('article.deleteModal.title')}
          </>
        }
      >
        {t('article.deleteModal.confirmMessage')}
        {contributors && contributors.length > 0 && (
          <div className={clsx(styles.note, styles.important)}>
            {t('article.deleteModal.contributorsRemovalNote')}
          </div>
        )}
        <FormActions
          onSubmit={handleDeleteArticle}
          onCancel={() => deleteModal.close()}
          submitButton={{
            text: t('modal.deleteButton.text'),
            title: t('modal.deleteButton.text'),
          }}
        />
      </Modal>

      {!renaming && (
        <h1 className={styles.title} onClick={toggleExpansion}>
          <span tabIndex={0} onKeyUp={toggleExpansion} className={styles.icon}>
            {expanded ? <ChevronDown /> : <ChevronRight />}
          </span>

          <span>
            {article.title}
            <Button
              title={t('article.editName.button')}
              icon={true}
              className={styles.editTitleButton}
              onClick={(evt) => evt.stopPropagation() || setRenaming(true)}
            >
              <Edit3 size="20" />
            </Button>
          </span>
        </h1>
      )}
      {renaming && (
        <form
          className={clsx(styles.renamingForm, fieldStyles.inlineFields)}
          onSubmit={(e) => rename(e)}
        >
          <Field
            className={styles.inlineField}
            autoFocus={true}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Article Title"
          />
          <Button
            title={t('article.editName.buttonSave')}
            primary={true}
            onClick={(e) => rename(e)}
          >
            <Check /> {t('article.editName.buttonSave')}
          </Button>
          <Button
            title={t('article.editName.buttonCancel')}
            type="button"
            onClick={() => {
              setRenaming(false)
              setNewTitle(article.title)
            }}
          >
            {t('article.editName.buttonCancel')}
          </Button>
        </form>
      )}

      <aside className={styles.actionButtons}>
        {isArticleOwner && !activeWorkspaceId && (
          <Button
            title={t('article.delete.button')}
            icon={true}
            onClick={() => deleteModal.show()}
          >
            <Trash />
          </Button>
        )}

        <Button
          title={t('article.duplicate.button')}
          icon={true}
          onClick={() => duplicate()}
        >
          <Copy />
        </Button>

        {
          <Button
            title={t('article.sendCopy.button')}
            icon={true}
            onClick={() => sendCopyModal.show()}
          >
            <Send />
          </Button>
        }

        {
          <Button
            title={t('article.share.button')}
            icon={true}
            onClick={() => sharingModal.show()}
          >
            <UserPlus />
          </Button>
        }

        <Button
          title={t('article.download.button')}
          icon={true}
          onClick={() => exportModal.show()}
        >
          <Printer />
        </Button>

        <Link
          title={t('article.editor.edit.title')}
          primary={true}
          className={buttonStyles.primary}
          to={`/article/${article._id}`}
        >
          <Pencil />
        </Link>

        <Link
          title={t('article.preview.button')}
          target="_blank"
          className={buttonStyles.icon}
          to={`/article/${article._id}/preview`}
        >
          <Eye />
        </Link>
      </aside>

      <section className={styles.metadata}>
        <p className={styles.metadataAuthoring}>
          {tags.map((t) => (
            <span
              className={styles.tagChip}
              key={'tagColor-' + t._id}
              style={{ backgroundColor: t.color || 'grey' }}
            />
          ))}
          <span className={styles.by}>{t('article.by.text')}</span>{' '}
          <span className={styles.author}>{article.owner.displayName}</span>
          {contributors?.length > 0 && (
            <span className={styles.contributorNames}>
              <span>
                ,{' '}
                {contributors
                  .map((c) => c.user.displayName || c.user.username)
                  .join(', ')}
              </span>
            </span>
          )}
          <TimeAgo date={article.updatedAt} className={styles.momentsAgo} />
        </p>

        {expanded && (
          <div>
            <ArticleVersionLinks article={article} articleId={articleId} />

            {userTags.length > 0 && (
              <>
                <h4>{t('article.tags.title')}</h4>
                <div className={styles.editTags}>
                  <ArticleTags
                    articleId={article._id}
                    userTags={userTags}
                    onArticleTagsUpdated={handleArticleTagsUpdated}
                  />
                </div>
              </>
            )}

            <h4>{t('article.workspaces.title')}</h4>
            <ul className={styles.workspaces}>
              <WorkspaceSelectionItems articleId={articleId} />
            </ul>

            <h4>{t('article.corpus.title')}</h4>
            <ul className={styles.corpusList}>
              <CorpusSelectItems articleId={articleId} />
            </ul>
          </div>
        )}
      </section>
    </article>
  )
}
