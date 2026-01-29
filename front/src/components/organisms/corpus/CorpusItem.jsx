import clsx from 'clsx'
import {
  EllipsisVertical,
  List,
  MessageSquareShare,
  Printer,
  Settings,
  Trash,
} from 'lucide-react'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'react-toastify'
import { useCopyToClipboard } from 'react-use'

import useComponentVisible from '../../../hooks/componentVisible.js'
import { useCorpusActions } from '../../../hooks/corpus.js'
import { useModal } from '../../../hooks/modal.js'
import { useDisplayName } from '../../../hooks/user.js'
import { Badge, Button } from '../../atoms/index.js'
import {
  FormActions,
  Modal,
  ObjectMetadataLabel,
} from '../../molecules/index.js'

import Export from '../export/Export.jsx'
import CorpusArticles from './CorpusArticles.jsx'
import CorpusForm from './CorpusForm.jsx'
import CorpusMetadata from './CorpusMetadata.jsx'

import buttonStyles from '../../atoms/Button.module.scss'
import styles from './CorpusItem.module.scss'

/**
 * @typedef Article
 * @type {object}
 * @property {string} _id
 * @property {string} title
 */

/**
 * @typedef Corpus
 * @type {object}
 * @property {string} _id
 * @property {string} type
 * @property {string} name
 * @property {string} description
 * @property {any} metadata
 * @property {object} creator
 * @property {string} creator.displayName
 * @property {string} creator.username
 * @property {Article[]} articles
 * @property {string} updatedAt
 * @property {string} createdAt
 */

/**
 * @param {Corpus} corpus
 * @return {Element}
 */
export default function CorpusItem({ corpus }) {
  const displayName = useDisplayName()
  const { t } = useTranslation('corpus', { useSuspense: false })
  const [, copyToClipboard] = useCopyToClipboard()

  const {
    ref: actionsRef,
    isComponentVisible: areActionsVisible,
    toggleComponentIsVisible: toggleActions,
  } = useComponentVisible(false, 'actions')

  const deleteCorpusModal = useModal()
  const exportCorpusModal = useModal()
  const updateCorpusModal = useModal()
  const metadataCorpusModal = useModal()

  const { deleteCorpus } = useCorpusActions()
  const corpusId = useMemo(() => corpus._id, [corpus])

  const handleDeleteCorpus = useCallback(async () => {
    try {
      await deleteCorpus(corpusId)
      toast(t('actions.delete.success'), { type: 'info' })
    } catch (err) {
      toast(`Unable to delete corpus ${corpus.name}: ${err}`, {
        type: 'error',
      })
    }
  }, [corpusId])

  const handleCopyId = useCallback(() => {
    copyToClipboard(corpusId)
    toast(t('actions.copyId.success'), { type: 'success' })
  }, [])

  return (
    <article
      className={styles.corpus}
      aria-labelledby={`corpus-${corpus._id}-title`}
      role="listitem"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id={`corpus-${corpus._id}-title`} className={styles.title}>
            {corpus.name}
          </h2>
          <Badge className={styles.badge} label={t(`types.${corpus.type}`)} />
        </div>

        <div role="menu" className={styles.actionButtons}>
          <Link
            role="menuitem"
            target="_blank"
            className={buttonStyles.icon}
            to={`/corpus/${corpus._id}/annotate`}
            title={t('actions.annotate.title')}
          >
            <MessageSquareShare aria-label={t('actions.annotate.button')} />
          </Link>
          <Button
            role="menuitem"
            icon={true}
            primary={true}
            className={clsx(buttonStyles.primary, styles.primaryAction)}
            onClick={() => exportCorpusModal.show()}
            title={t('actions.export.title')}
          >
            <Printer aria-label={t('actions.export.label')} />
          </Button>

          <div className={styles.dropdownMenu} ref={actionsRef}>
            <Button
              title={t('actions.menu.title')}
              onClick={() => toggleActions()}
              icon
            >
              <EllipsisVertical />
            </Button>

            <div className={styles.menu} hidden={!areActionsVisible}>
              <ul>
                <li
                  onClick={() => metadataCorpusModal.show()}
                  title={t('actions.metadata.title')}
                >
                  {t('actions.metadata.label')}
                </li>
                <li
                  onClick={() => updateCorpusModal.show()}
                  title={t('actions.update.title')}
                >
                  {t('actions.update.label')}
                </li>
                <li onClick={handleCopyId} title={t('actions.copyId.title')}>
                  {t('actions.copyId.label')}
                </li>
                <li
                  onClick={() => deleteCorpusModal.show()}
                  title={t('actions.delete.title')}
                >
                  {t('actions.delete.label')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <div id={`corpus-${corpus._id}-chapters`} className={styles.details}>
        <ObjectMetadataLabel
          className={styles.metadata}
          updatedAtDate={corpus.updatedAt}
          creatorName={displayName(corpus.creator)}
        />
        {corpus.description && <p>{corpus.description}</p>}
        <CorpusArticles corpusId={corpusId} />
      </div>

      <Modal
        {...metadataCorpusModal.bindings}
        title={t('actions.metadata.label')}
      >
        <CorpusMetadata
          corpusId={corpusId}
          corpusType={corpus.type}
          initialValue={corpus.metadata}
          onCancel={() => metadataCorpusModal.close()}
          onSubmit={() => metadataCorpusModal.close()}
        />
      </Modal>

      <Modal
        {...deleteCorpusModal.bindings}
        title={
          <>
            <Trash /> {t('actions.delete.title')}
          </>
        }
      >
        <p>{t('actions.delete.confirm')}</p>
        <FormActions
          onCancel={() => deleteCorpusModal.close()}
          onSubmit={handleDeleteCorpus}
        />
      </Modal>

      <Modal
        {...exportCorpusModal.bindings}
        title={
          <>
            <Printer /> {t('actions.export.title')}
          </>
        }
      >
        <Export
          bookId={corpusId}
          name={corpus.name}
          onCancel={() => exportCorpusModal.close()}
        />
      </Modal>

      <Modal
        {...updateCorpusModal.bindings}
        title={
          <>
            <Settings /> {t('actions.update.title')}
          </>
        }
      >
        <CorpusForm
          corpus={corpus}
          onSubmit={() => updateCorpusModal.close()}
          onCancel={() => updateCorpusModal.close()}
        />
      </Modal>
    </article>
  )
}
