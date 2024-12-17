import React, { useState, useCallback, useMemo } from 'react'
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
import checkboxStyles from './Checkbox.module.scss'
import CollaborativeSessionAction from './collaborative/CollaborativeSessionAction.jsx'
import fieldStyles from './field.module.scss'

import Modal from './Modal.jsx'
import Export from './Export.jsx'

import Chip from './Chip.jsx'
import Field from './Field.jsx'
import Button from './Button.jsx'
import Checkbox from './Checkbox.jsx'
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

import {
  addTags,
  removeTags,
  duplicateArticle,
  renameArticle,
  deleteArticle,
  getArticleDetails,
  addArticleToWorkspace,
  removeArticleFromWorkspace,
} from './Article.graphql'
import {
  addArticleToCorpus,
  removeArticleFromCorpus,
} from './corpus/Corpus.graphql'
import SoloSessionAction from './solo/SoloSessionAction.jsx'

import useGraphQL, { useMutation } from '../hooks/graphql'
import TimeAgo from './TimeAgo.jsx'
import { useSelector } from 'react-redux'
import ArticleContributors from './ArticleContributors.jsx'
import ArticleSendCopy from './ArticleSendCopy.jsx'

/**
 * @typedef {Object} Article
 * @property {string} _id
 * @property {string} title
 * @property {{ displayName: string }} owner
 * @property {Object=} collaborativeSession
 * @property {Object=} soloSession
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ArticleProps
 * @property {Article} article
 * @property {function} onArticleUpdated
 * @property {function} onArticleDeleted
 * @property {function} onArticleCreated
 */

export function ArticleDetails({ article, activeWorkspaceId: workspaceId }) {
  const { t } = useTranslation()
  const mutation = useMutation()

  const variables = {
    articleId: article._id,
    corpusFilters: { workspaceId },
  }

  const { data: detailsData, mutate } = useGraphQL(
    {
      query: getArticleDetails,
      variables,
    },
    { fallbackData: { article } }
  )

  const {
    tags = [],
    workspaces = [],
    corpus = [],
    details = {},
  } = useMemo(() => {
    if (!detailsData) return {}

    return {
      workspaces: detailsData.workspaces,
      tags: detailsData.tags,
      corpus: detailsData.corpus,
      details: detailsData.article,
    }
  }, [detailsData])

  const handleTagUpdate = useCallback(async (event) => {
    const [id, isChecked] = [event.target.value, event.target.checked]
    const query = isChecked ? addTags : removeTags

    await mutation({
      query,
      variables: { article: article._id, tags: [id] },
    })

    mutate({ query: getArticleDetails, variables })
  }, [])

  const handleWorkspaceUpdate = useCallback(async (event) => {
    const [id, isChecked] = [event.target.value, event.target.checked]
    const query = isChecked ? addArticleToWorkspace : removeArticleFromWorkspace

    await mutation({
      query,
      variables: { articleId: article._id, workspaceId: id },
    })

    mutate({ query: getArticleDetails, variables })
  }, [])

  const handleCorpusUpdate = useCallback(async (event) => {
    const [id, isChecked] = [event.target.value, event.target.checked]
    const query = isChecked ? addArticleToCorpus : removeArticleFromCorpus

    await mutation({
      query,
      variables: { articleId: article._id, corpusId: id },
    })

    mutate({ query: getArticleDetails, variables })
  }, [])

  return (
    <footer className={styles.areaDetails}>
      <ArticleVersionLinks
        articleId={article._id}
        versions={details.versions}
      />

      <aside hidden={!tags.length}>
        <h3 className="h4">{t('article.tags.title')}</h3>
        <ul className={checkboxStyles.inlineList}>
          {tags.map((tag) => (
            <li key={tag._id}>
              <Checkbox
                name="tags[]"
                color={tag.color}
                value={tag._id}
                defaultChecked={details.tags.some(({ _id }) => _id === tag._id)}
                onChange={handleTagUpdate}
              >
                {tag.name}
              </Checkbox>
            </li>
          ))}
        </ul>
      </aside>

      <aside hidden={!workspaces.length}>
        <h3 className="h4">{t('article.workspaces.title')}</h3>
        <ul className={styles.workspaces}>
          {workspaces.map((workspace) => (
            <li key={workspace._id}>
              <Checkbox
                name="workspaces[]"
                color={workspace.color}
                value={workspace._id}
                defaultChecked={details.workspaces.some(
                  ({ _id }) => _id === workspace._id
                )}
                onChange={handleWorkspaceUpdate}
              >
                {workspace.name}
              </Checkbox>
            </li>
          ))}
        </ul>
      </aside>

      <aside hidden={!corpus.length}>
        <h3 className="h4">{t('article.corpus.title')}</h3>
        <ul className={styles.corpusList}>
          {corpus.map((c) => (
            <li key={c._id}>
              <Checkbox
                name="corpus[]"
                value={c._id}
                defaultChecked={details.corpuses.some(
                  ({ _id }) => _id === c._id
                )}
                onChange={handleCorpusUpdate}
              >
                {c.name}
              </Checkbox>
            </li>
          ))}
        </ul>
      </aside>
    </footer>
  )
}

/**
 *
 * @param {ArticleProps} props
 * @returns {React.ReactElement}
 */
export default function Article({
  article,
  onArticleUpdated,
  onArticleDeleted,
  onArticleCreated,
}) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const activeWorkspace = useActiveWorkspace()
  const mutation = useMutation()

  const activeUserId = useSelector((state) => state.activeUser._id)
  const articleId = useMemo(() => article._id, [article])
  const isArticleOwner = useMemo(() => activeUserId === article.owner._id, [])

  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )

  const {
    visible: deleteArticleVisible,
    setVisible: setDeleteArticleVisible,
    bindings: deleteArticleModalBinding,
  } = useModal()

  const [isExpanded, setExpanded] = useState(false)
  const [isExporting, setExporting] = useState(false)
  const [isRenaming, setRenaming] = useState(false)
  const [isSharing, setSharing] = useState(false)
  const [isSending, setSending] = useState(false)

  const toggleExpansion = useCallback(
    (event) => {
      if (!event.key || [' ', 'Enter'].includes(event.key)) {
        setExpanded(!isExpanded)
      }
    },
    [setExpanded, isExpanded]
  )

  const contributors = useMemo(() => {
    return article.contributors.filter((c) => c.user._id !== article.owner._id)
  }, [article])

  const duplicate = async () => {
    const duplicatedArticleQuery = await mutation({
      query: duplicateArticle,
      variables: {
        user: activeUserId,
        to: activeUserId,
        article: articleId,
      },
    })
    onArticleCreated({
      ...article,
      ...duplicatedArticleQuery.duplicateArticle,
      contributors: [],
      versions: [],
    })
  }

  const handleRename = useCallback(async (e) => {
    e.preventDefault()
    const title = new FormData(e.target).get('title')

    await mutation({
      query: renameArticle,
      variables: { user: activeUserId, article: articleId, title },
    })
    onArticleUpdated({
      ...article,
      title,
    })
    setRenaming(false)
  })

  const handleDeleteArticle = async () => {
    try {
      await mutation({
        query: deleteArticle,
        variables: { article: articleId },
      })
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
  }, [])

  const closeSharingModal = useCallback(() => {
    setSharing(false)
  }, [])

  return (
    <article
      className={styles.article}
      aria-labelledby={`article-${article._id}-title`}
    >
      {isExporting && (
        <Modal title="Export" cancel={() => setExporting(false)}>
          <Export
            articleId={article._id}
            bib={article.workingVersion.bibPreview}
            name={article.title}
          />
        </Modal>
      )}

      <GeistModal width="30rem" visible={isSharing} onClose={closeSharingModal}>
        <h2>{t('article.shareModal.title')}</h2>
        <span className={styles.sendText}>
          {t('article.shareModal.description')}
        </span>
        <GeistModal.Content>
          <ArticleContributors article={article} />
        </GeistModal.Content>
        <GeistModal.Action passive onClick={closeSharingModal}>
          {t('modal.close.text')}
        </GeistModal.Action>
      </GeistModal>

      <GeistModal width="25rem" visible={isSending} onClose={closeSendingModal}>
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

      <button
        onClick={toggleExpansion}
        className={styles.toggleButton}
        type="button"
        role="switch"
        aria-checked={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown aria-label={t('modal.close.text')} />
        ) : (
          <ChevronRight aria-label={t('modal.open.text')} />
        )}
      </button>

      <div className={styles.areaTitle}>
        <h2
          hidden={isRenaming}
          tabIndex={0}
          onKeyUp={toggleExpansion}
          onClick={toggleExpansion}
          className={clsx(styles.title, 'h3')}
          id={`article-${article._id}-title`}
        >
          {article.title}
          <Button
            icon={true}
            type="button"
            className={styles.editTitleButton}
            onClick={() => setRenaming(true)}
          >
            <Edit3 size="20" aria-label={t('article.editName.button')} />
          </Button>
        </h2>

        {isRenaming && (
          <form className={fieldStyles.inlineFields} onSubmit={handleRename}>
            <Field
              className={styles.inlineField}
              name="title"
              autoFocus={true}
              defaultValue={article.title}
              placeholder="Article Title"
            />
            <Button primary={true}>
              <Check role="presentation" />
              {t('article.editName.buttonSave')}
            </Button>
            <Button
              title={t('article.editName.buttonCancel')}
              type="button"
              onClick={() => setRenaming(false)}
            >
              {t('article.editName.buttonCancel')}
            </Button>
          </form>
        )}
      </div>

      <aside className={styles.areaActions}>
        {isArticleOwner && !activeWorkspaceId && (
          <Button icon={true} onClick={() => setDeleteArticleVisible(true)}>
            <Trash aria-label={t('article.delete.button')} />
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

        <Button icon={true} onClick={() => duplicate()}>
          <Copy aria-label={t('article.duplicate.button')} />
        </Button>

        <Button icon={true} onClick={() => setSending(true)}>
          <Send aria-label={t('article.sendCopy.button')} />
        </Button>

        <Button icon={true} onClick={() => setSharing(true)}>
          <UserPlus aria-label={t('article.share.button')} />
        </Button>

        <Button icon={true} onClick={() => setExporting(true)}>
          <Printer aria-label={t('article.download.button')} />
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
          target="_blank"
          className={buttonStyles.icon}
          to={`/article/${article._id}/preview`}
        >
          <Eye aria-label={t('article.preview.button')} />
        </Link>
      </aside>

      <aside className={styles.areaMetadata}>
        <p className={styles.metadataAuthoring}>
          {article.tags.map((t) => (
            <Chip color={t.color} key={t._id} />
          ))}
          <span className={styles.author}>
            {t('article.by.text')} {article.owner.displayName}
          </span>
          <ul
            className={styles.contributorNames}
            hidden={!contributors?.length}
          >
            {contributors.map((c) => (
              <li key={c.user._id}>{c.user.displayName || c.user.username}</li>
            ))}
          </ul>
          <TimeAgo date={article.updatedAt} className={styles.momentsAgo} />
        </p>
      </aside>

      {isExpanded && (
        <ArticleDetails
          article={article}
          activeWorkspaceId={activeWorkspaceId}
        />
      )}
    </article>
  )
}
