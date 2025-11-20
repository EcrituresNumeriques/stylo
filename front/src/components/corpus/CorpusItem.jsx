import {
  ChevronDown,
  ChevronRight,
  Clipboard,
  MessageSquareShare,
  Printer,
  Settings,
  Trash,
} from 'lucide-react'
import { useCopyToClipboard } from 'react-use'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'react-toastify'

import { useCorpusActions } from '../../hooks/corpus.js'
import { useModal } from '../../hooks/modal.js'

import Button from '../Button.jsx'
import Export from '../Export.jsx'
import Modal from '../Modal.jsx'
import TimeAgo from '../TimeAgo.jsx'
import FormActions from '../molecules/FormActions.jsx'
import CorpusArticles from './CorpusArticles.jsx'
import CorpusForm from './CorpusForm.jsx'
import CorpusMetadataModal from './CorpusMetadataModal.jsx'

import buttonStyles from '../button.module.scss'
import styles from './corpusItem.module.scss'

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
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()

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

  const toggleExpansion = useCallback(
    (event) => {
      if (!event.key || [' ', 'Enter'].includes(event.key)) {
        setExpanded(!expanded)
      }
    },
    [expanded]
  )

  return (
    <div className={styles.container} aria-labelledby={`corpus-${corpus._id}-title`}>
      <div className={styles.header}>
        <div className={styles.heading} onClick={toggleExpansion}>
          <h2 className={styles.title} id={`corpus-${corpus._id}-title`}>
            <span
              tabIndex={0}
              role="button"
              aria-expanded={expanded}
              aria-controls={`corpus-${corpus._id}-chapters`}
              onKeyUp={toggleExpansion}
              className={styles.icon}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </span>
            {corpus.name}
          </h2>
          <p className={styles.metadata}>
            <span className={styles.by}>{t('corpus.by.text')}</span>
            <span className={styles.creator}>
              {corpus.creator.displayName || corpus.creator.username}
            </span>
            <TimeAgo date={corpus.updatedAt} className={styles.updatedAt} />
          </p>
        </div>

        <div role="menu" className={styles.actionButtons}>
          <Button
            role="menuitem"
            icon={true}
            onClick={() => editCorpusModal.show()}
          >
            <Settings aria-label={t('corpus.edit.buttonTitle')} />
          </Button>

          <CorpusMetadataModal
            corpusId={corpusId}
            corpusType={corpus.type}
            initialValue={corpus.metadata}
          />

          <Button
            role="menuitem"
            icon={true}
            onClick={(event) => {
              event.preventDefault()
              deleteCorpusModal.show()
            }}
          >
            <Trash aria-label={t('corpus.delete.buttonTitle')} />
          </Button>
          <Button
            role="menuitem"
            icon={true}
            onClick={() => exportCorpusModal.show()}
          >
            <Printer aria-label={t('corpus.export.buttonTitle')} />
          </Button>

          <Link
            role="menuitem"
            target="_blank"
            className={buttonStyles.icon}
            to={`/corpus/${corpus._id}/annotate`}
          >
            <MessageSquareShare aria-label={t('article.annotate.button')} />
          </Link>

          <Button
            title={t('corpus.copyId.button')}
            className={styles.copyToClipboard}
            onClick={handleCopyId}
            icon
          >
            <Clipboard />
          </Button>
        </div>
      </div>
      {expanded && (
        <div id={`corpus-${corpus._id}-chapters`} className={styles.detail}>
          {corpus.description && <p>{corpus.description}</p>}
          <CorpusArticles corpusId={corpusId} />
        </div>
      )}

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
    </div>
  )
}
