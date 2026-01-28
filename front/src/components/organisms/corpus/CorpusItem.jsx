import clsx from 'clsx'
import {
  ChevronDown,
  ChevronRight,
  Clipboard,
  EllipsisVertical,
  MessageSquareShare,
  Pencil,
  Printer,
  Settings,
  Trash,
  UserPlus,
} from 'lucide-react'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'react-toastify'
import { useCopyToClipboard } from 'react-use'

import useComponentVisible from '../../../hooks/componentVisible.js'
import { useCorpusActions } from '../../../hooks/corpus.js'
import { useModal } from '../../../hooks/modal.js'
import { useDisplayName } from '../../../hooks/user.js'
import { Button, TimeAgo } from '../../atoms/index.js'
import { FormActions, ObjectMetadataLabel } from '../../molecules/index.js'

import Modal from '../../molecules/Modal.jsx'
import Export from '../export/Export.jsx'
import CorpusArticles from './CorpusArticles.jsx'
import CorpusForm from './CorpusForm.jsx'
import CorpusMetadataModal from './CorpusMetadataModal.jsx'

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
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()

  const {
    ref: actionsRef,
    isComponentVisible: areActionsVisible,
    toggleComponentIsVisible: toggleActions,
  } = useComponentVisible(false, 'actions')

  const deleteCorpusModal = useModal()
  const exportCorpusModal = useModal()
  const editCorpusModal = useModal()

  const { deleteCorpus } = useCorpusActions()
  const corpusId = useMemo(() => corpus._id, [corpus])

  const handleDeleteCorpus = useCallback(async () => {
    try {
      await deleteCorpus(corpusId)
      toast(t('corpus.delete.toastSuccess'), { type: 'info' })
    } catch (err) {
      toast(`Unable to delete corpus ${corpus.name}: ${err}`, {
        type: 'error',
      })
    }
  }, [corpusId])

  const [expanded, setExpanded] = useState(false)

  const handleCopyId = useCallback(() => {
    copyToClipboard(corpusId)
    toast(t('corpus.copyId.successToast'), { type: 'success' })
  }, [])

  return (
    <article
      className={styles.corpus}
      aria-labelledby={`corpus-${corpus._id}-title`}
      role="listitem"
    >
      <header className={styles.header}>
        <div className={styles.title}>
          <h2 id={`corpus-${corpus._id}-title`}>{corpus.name}</h2>
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
                <li title={t('actions.export.title')}>
                  {t('actions.export.label')}
                </li>
                <li title={t('actions.update.title')}>
                  {t('actions.update.label')}
                </li>
                <li title={t('actions.duplicate.title')}>
                  {t('actions.duplicate.label')}
                </li>
                <li title={t('actions.sendCopy.title')}>
                  {t('actions.sendCopy.label')}
                </li>
                <li title={t('actions.copyId.title')}>
                  {t('actions.copyId.label')}
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
        {...deleteCorpusModal.bindings}
        title={
          <>
            <Trash /> {t('corpus.deleteModal.title')}
          </>
        }
      >
        <p>{t('corpus.deleteModal.confirmMessage')}</p>
        <FormActions
          onCancel={() => deleteCorpusModal.close()}
          onSubmit={handleDeleteCorpus}
        />
      </Modal>

      <Modal
        {...exportCorpusModal.bindings}
        title={
          <>
            <Printer /> {t('corpus.exportModal.title')}
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
        {...editCorpusModal.bindings}
        title={
          <>
            <Settings /> {t('corpus.editModal.title')}
          </>
        }
      >
        <CorpusForm
          corpus={corpus}
          onSubmit={() => editCorpusModal.close()}
          onCancel={() => editCorpusModal.close()}
        />
      </Modal>
    </article>
  )
}
