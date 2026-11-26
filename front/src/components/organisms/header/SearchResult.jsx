import clsx from 'clsx'
import {
  Book,
  FileDownIcon,
  FileText,
  MessageSquareShare,
  Pencil,
  UserPlus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { getArticleContributors } from '../../../hooks/Article.graphql'
import { useConditionalFetchData } from '../../../hooks/graphql.js'
import { useModal } from '../../../hooks/modal.js'
import { useDisplayName } from '../../../hooks/user.js'
import buttonStyles from '../../atoms/Button.module.scss'
import { Button } from '../../atoms/index.js'
import { Modal, ObjectMetadataLabel } from '../../molecules/index.js'
import ArticleContributors from '../article/sharing/ArticleContributors.jsx'
import Export from '../export/Export.jsx'

import styles from './SearchMenu.module.scss'

/**
 * Compact article card, with its three main actions.
 *
 * @param {object} props
 * @param {{id: string, title: string, updatedAt: string, owner: {id: string}}} props.article
 * @param {() => void} props.onSelect called when leaving the results
 */
export function ArticleResult({ article, onSelect }) {
  const { t } = useTranslation('article')
  const displayName = useDisplayName()
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
    <li className={styles.item}>
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
            className={clsx(buttonStyles.primary, styles.primaryAction)}
            to={`/article/${article.id}`}
            onClick={onSelect}
            title={t('actions.edit.title')}
          >
            <Pencil aria-label={t('actions.edit.label')} />
          </Link>
        </div>
      </header>
      <ObjectMetadataLabel
        className={styles.metadata}
        updatedAtDate={article.updatedAt}
        creatorName={displayName(article.owner)}
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
    </li>
  )
}

/**
 * Compact corpus card, with its main actions.
 *
 * @param {object} props
 * @param {{id: string, name: string, updatedAt: string, creator: object}} props.corpus
 */
export function CorpusResult({ corpus }) {
  const { t } = useTranslation('corpus')
  const displayName = useDisplayName()
  const exportModal = useModal()

  return (
    <li className={styles.item}>
      <header className={styles.header}>
        <h3 className={styles.title}>
          <Book aria-hidden size={18} /> {corpus.name}
        </h3>
        <div role="menu" className={styles.actions}>
          <Link
            role="menuitem"
            target="_blank"
            className={buttonStyles.icon}
            to={`/corpus/${corpus.id}/annotate`}
            title={t('actions.annotate.title')}
          >
            <MessageSquareShare aria-label={t('actions.annotate.button')} />
          </Link>
          <Button
            role="menuitem"
            icon={true}
            primary={true}
            className={clsx(buttonStyles.primary, styles.primaryAction)}
            onClick={() => exportModal.show()}
            title={t('actions.export.title')}
          >
            <FileDownIcon aria-label={t('actions.export.label')} />
          </Button>
        </div>
      </header>
      <ObjectMetadataLabel
        className={styles.metadata}
        updatedAtDate={corpus.updatedAt}
        creatorName={displayName(corpus.creator)}
      />

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
    </li>
  )
}
