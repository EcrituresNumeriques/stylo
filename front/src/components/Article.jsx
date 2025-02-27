import React, { useState, useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  Modal as GeistModal,
  Note,
  Spacer,
  useModal,
  useToasts,
} from '@geist-ui/core'
import { useActiveWorkspace } from '../hooks/workspace.js'

import styles from './article.module.scss'
import ArticleVersionLinks from './ArticleVersionLinks.jsx'
import buttonStyles from './button.module.scss'
import CollaborativeSessionAction from './collaborative/CollaborativeSessionAction.jsx'
import CorpusSelectItems from './corpus/CorpusSelectItems.jsx'
import fieldStyles from './field.module.scss'

import Modal from './Modal'
import Export from './Export'
import ArticleTags from './ArticleTags'

import Field from './Field'
import Button from './Button'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  Printer,
  Send,
  Trash,
  UserPlus,
} from 'react-feather'

import { getArticleTags, getArticleContributors } from './Article.graphql'
import SoloSessionAction from './solo/SoloSessionAction.jsx'

import { getTags } from './Tag.graphql'

import useFetchData from '../hooks/graphql'
import TimeAgo from './TimeAgo.jsx'
import WorkspaceSelectionItems from './workspace/WorkspaceSelectionItems.jsx'
import { useSelector } from 'react-redux'
import ArticleContributors from './ArticleContributors.jsx'
import ArticleSendCopy from './ArticleSendCopy.jsx'
import { useArticleActions } from '../hooks/article.js'

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
  const articleActions = useArticleActions(articleId)

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
  const {
    visible: deleteArticleVisible,
    setVisible: setDeleteArticleVisible,
    bindings: deleteArticleModalBinding,
  } = useModal()

  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [renaming, setRenaming] = useState(false)

  const [newTitle, setNewTitle] = useState(article.title)

  const [sharing, setSharing] = useState(false)
  const [sending, setSending] = useState(false)

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

  const closeSendingModal = useCallback(() => {
    setSending(false)
  }, [setSending])

  const closeSharingModal = useCallback(() => {
    setSharing(false)
  }, [setSharing])

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
      {exporting && (
        <Modal title="Export" cancel={() => setExporting(false)}>
          <Export
            articleId={article._id}
            bib={article.workingVersion.bibPreview}
            name={article.title}
          />
        </Modal>
      )}

      <GeistModal width="30rem" visible={sharing} onClose={closeSharingModal}>
        <h2>{t('article.shareModal.title')}</h2>
        <span className={styles.sendText}>
          {t('article.shareModal.description')}
        </span>
        <GeistModal.Content>
          <ArticleContributors article={article} contributors={contributors} />
        </GeistModal.Content>
        <GeistModal.Action passive onClick={closeSharingModal}>
          {t('modal.close.text')}
        </GeistModal.Action>
      </GeistModal>

      <GeistModal width="30rem" visible={sharing} onClose={closeSharingModal}>
        <h2>{t('article.shareModal.title')}</h2>
        <span className={styles.sendText}>
          {t('article.shareModal.description')}
        </span>
        <GeistModal.Content>
          <ArticleContributors article={article} contributors={contributors} />
        </GeistModal.Content>
        <GeistModal.Action passive onClick={closeSharingModal}>
          {t('modal.close.text')}
        </GeistModal.Action>
      </GeistModal>

      <GeistModal width="25rem" visible={sending} onClose={closeSendingModal}>
        <h2>{t('article.sendCopyModal.title')}</h2>
        <span>
          <span className={styles.sendText}>
            {t('article.sendCopyModal.description')}{' '}
          </span>
          <span>
            <Send className={styles.sendIcon} />
          </span>
        </span>
        <GeistModal.Content>
          <ArticleSendCopy article={article} cancel={closeSendingModal} />
        </GeistModal.Content>
        <GeistModal.Action passive onClick={closeSendingModal}>
          {t('modal.close.text')}
        </GeistModal.Action>
      </GeistModal>

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
            onClick={() => setDeleteArticleVisible(true)}
          >
            <Trash />
          </Button>
        )}

        <GeistModal
          visible={deleteArticleVisible}
          {...deleteArticleModalBinding}
        >
          <h2>{t('article.deleteModal.title')}</h2>
          <GeistModal.Content>
            {t('article.deleteModal.confirmMessage')}
            {contributors && contributors.length > 0 && (
              <>
                <Spacer h={1} />
                <Note label="Important" type="error">
                  {t('article.deleteModal.contributorsRemovalNote')}
                </Note>
              </>
            )}
          </GeistModal.Content>
          <GeistModal.Action
            passive
            onClick={() => setDeleteArticleVisible(false)}
          >
            {t('modal.cancelButton.text')}
          </GeistModal.Action>
          <GeistModal.Action onClick={handleDeleteArticle}>
            {t('modal.confirmButton.text')}
          </GeistModal.Action>
        </GeistModal>

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
            onClick={() => setSending(true)}
          >
            <Send />
          </Button>
        }

        {
          <Button
            title={t('article.share.button')}
            icon={true}
            onClick={() => setSharing(true)}
          >
            <UserPlus />
          </Button>
        }

        <Button
          title={t('article.download.button')}
          icon={true}
          onClick={() => setExporting(true)}
        >
          <Printer />
        </Button>

        <CollaborativeSessionAction
          collaborativeSession={article.collaborativeSession}
          articleId={articleId}
        />

        <SoloSessionAction
          collaborativeSession={article.collaborativeSession}
          soloSession={article.soloSession}
          articleId={articleId}
        />

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

Article.propTypes = {
  article: PropTypes.shape({
    title: PropTypes.string,
    owner: PropTypes.shape({
      displayName: PropTypes.string,
    }),
    collaborativeSession: PropTypes.object,
    soloSession: PropTypes.object,
    updatedAt: PropTypes.string,
    _id: PropTypes.string,
  }),
}
