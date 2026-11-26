import clsx from 'clsx'
import {
  Book,
  FileDownIcon,
  FileText,
  MessageSquareShare,
  Pencil,
  Settings,
  UserPlus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { getArticleContributors } from '../../../hooks/Article.graphql'
import { useConditionalFetchData } from '../../../hooks/graphql.js'
import { useModal } from '../../../hooks/modal.js'
import { useWorkspaces } from '../../../hooks/workspace.js'
import buttonStyles from '../../atoms/Button.module.scss'
import { Button, TimeAgo } from '../../atoms/index.js'
import { Modal } from '../../molecules/index.js'
import ArticleContributors from '../article/sharing/ArticleContributors.jsx'
import Export from '../export/Export.jsx'

import headerStyles from './header.module.scss'
import styles from './SearchMenu.module.scss'

/**
 * Compact article card, with its three main actions.
 *
 * @param {object} props
 * @param {{id: string, title: string, updatedAt: string, owner: {id: string}}} props.article
 * @param {() => void} props.onSelect called when leaving the results
 */
export function ArticleResult({ article, onSelect }) {
  const { t } = useTranslation('article', { useSuspense: false })
  const sharingModal = useModal()
  // contributors are only needed to share
  const { data } = useConditionalFetchData(
    sharingModal.bindings.visible && {
      query: getArticleContributors,
      variables: { articleId: article.id },
    }
  )
  const contributors = (data?.article?.contributors ?? []).filter(
    (c) => c.user.id !== article.owner.id
  )

  return (
    <ResultItem workspaces={article.workspaces}>
      <header className={styles.header}>
        <h3 className={styles.title}>
          <FileText aria-hidden size={18} /> {article.title}
        </h3>
        <div role="menu" className={styles.actions}>
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
            to={`/article/${article.id}/annotate`}
            title={t('actions.annotate.title')}
          >
            <MessageSquareShare aria-label={t('actions.annotate.label')} />
          </Link>
          <Link
            role="menuitem"
            className={buttonStyles.primary}
            to={`/article/${article.id}`}
            onClick={onSelect}
            title={t('actions.edit.title')}
          >
            <Pencil aria-label={t('actions.edit.label')} />
          </Link>
        </div>
      </header>
      <ResultMetadata
        updatedAt={article.updatedAt}
        workspaces={article.workspaces}
      />

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
      </Modal>
    </ResultItem>
  )
}

/**
 * Compact corpus card, with its main actions.
 *
 * @param {object} props
 * @param {{id: string, name: string, updatedAt: string, workspaceId: string|null}} props.corpus
 * @param {() => void} props.onSelect called when leaving the results
 */
export function CorpusResult({ corpus, onSelect }) {
  const { t } = useTranslation('corpus', { useSuspense: false })
  const exportModal = useModal()
  const { workspaces: userWorkspaces } = useWorkspaces()
  const workspaces = (userWorkspaces ?? []).filter(
    ({ id }) => id === corpus.workspaceId
  )

  return (
    <ResultItem workspaces={workspaces}>
      <header className={styles.header}>
        <h3 className={styles.title}>
          <Book aria-hidden size={18} /> {corpus.name}
        </h3>
        <div role="menu" className={styles.actions}>
          <Button
            role="menuitem"
            icon={true}
            onClick={() => exportModal.show()}
            title={t('actions.export.title')}
          >
            <FileDownIcon aria-label={t('actions.export.label')} />
          </Button>
          <Link
            role="menuitem"
            target="_blank"
            className={buttonStyles.icon}
            to={`/corpus/${corpus.id}/annotate`}
            title={t('actions.annotate.title')}
          >
            <MessageSquareShare aria-label={t('actions.annotate.button')} />
          </Link>
          <Link
            role="menuitem"
            className={buttonStyles.primary}
            to={`${corpus.workspaceId ? `/workspaces/${corpus.workspaceId}` : ''}/corpus#corpus-${corpus.id}`}
            onClick={onSelect}
            title={t('actions.manage.title')}
          >
            <Settings aria-label={t('actions.manage.label')} />
          </Link>
        </div>
      </header>
      <ResultMetadata updatedAt={corpus.updatedAt} workspaces={workspaces} />

      <Modal
        {...exportModal.bindings}
        title={
          <>
            <FileDownIcon aria-hidden /> {t('actions.export.title')}
          </>
        }
      >
        <Export
          bookId={corpus.id}
          name={corpus.name}
          onCancel={() => exportModal.close()}
        />
      </Modal>
    </ResultItem>
  )
}

/**
 * Card of a result, edged with the color of its workspace (none for the
 * personal space).
 *
 * @param {object} props
 * @param {{color: string}[]} props.workspaces
 * @param {React.ReactNode} props.children
 */
function ResultItem({ workspaces, children }) {
  const color = workspaces[0]?.color
  return (
    <li
      className={clsx(styles.item, color && styles.inWorkspace)}
      style={color && { '--workspace-color': color }}
    >
      {children}
    </li>
  )
}

/**
 * Workspaces (not the personal space) and how long ago it was updated.
 *
 * @param {object} props
 * @param {string} props.updatedAt
 * @param {{id: string, name: string, color: string}[]} props.workspaces
 */
function ResultMetadata({ updatedAt, workspaces }) {
  const { t } = useTranslation()
  return (
    <div className={styles.metadata}>
      {workspaces.map(({ id, name, color }) => (
        <span key={id} className={styles.workspace}>
          <span
            className={headerStyles.chip}
            style={{ backgroundColor: color }}
          />
          {name} ·
        </span>
      ))}
      <span title={t('common.updatedAt.label')}>
        <TimeAgo date={updatedAt} />
      </span>
    </div>
  )
}
