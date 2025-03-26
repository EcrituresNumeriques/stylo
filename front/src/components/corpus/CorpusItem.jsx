import { useToasts } from '@geist-ui/core'
import React, { useCallback, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Printer,
  Settings,
  Trash,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCorpusActions } from '../../hooks/corpus.js'
import { useModal } from '../../hooks/modal.js'
import Button from '../Button.jsx'
import buttonStyles from '../button.module.scss'
import Export from '../Export.jsx'
import Modal from '../Modal.jsx'
import FormActions from '../molecules/FormActions.jsx'
import TimeAgo from '../TimeAgo.jsx'

import CorpusArticles from './CorpusArticles.jsx'

import styles from './corpusItem.module.scss'
import CorpusMetadataModal from './CorpusMetadataModal.jsx'
import CorpusUpdate from './CorpusUpdate.jsx'

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
  const { setToast } = useToasts()

  const deleteCorpusModal = useModal()
  const exportCorpusModal = useModal()
  const editCorpusModal = useModal()

  const { deleteCorpus } = useCorpusActions()
  const corpusId = useMemo(() => corpus._id, [corpus])

  const handleDeleteCorpus = useCallback(async () => {
    try {
      await deleteCorpus(corpusId)
      setToast({
        text: t('corpus.delete.toastSuccess'),
        type: 'default',
      })
    } catch (err) {
      setToast({
        text: `Unable to delete corpus ${corpus.name}: ${err}`,
        type: 'error',
      })
    }
  }, [corpusId])

  const [expanded, setExpanded] = useState(false)
  const toggleExpansion = useCallback(
    (event) => {
      if (!event.key || [' ', 'Enter'].includes(event.key)) {
        setExpanded(!expanded)
      }
    },
    [expanded]
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.heading} onClick={toggleExpansion}>
          <h4 className={styles.title}>
            <span
              tabIndex={0}
              onKeyUp={toggleExpansion}
              className={styles.icon}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </span>
            {corpus.name}
          </h4>
          <p className={styles.metadata}>
            <span className={styles.by}>{t('corpus.by.text')}</span>
            <span className={styles.creator}>
              {corpus.creator.displayName || corpus.creator.username}
            </span>
            <TimeAgo date={corpus.updatedAt} className={styles.updatedAt} />
          </p>
        </div>
        <aside className={styles.actionButtons}>
          <Button
            title={t('corpus.edit.buttonTitle')}
            icon={true}
            onClick={() => editCorpusModal.show()}
          >
            <Settings />
          </Button>

          <CorpusMetadataModal
            corpusId={corpusId}
            initialValue={corpus.metadata}
          />

          <Button
            title={t('corpus.delete.buttonTitle')}
            icon={true}
            onClick={(event) => {
              event.preventDefault()
              deleteCorpusModal.show()
            }}
          >
            <Trash />
          </Button>
          <Button
            title={t('corpus.export.buttonTitle')}
            icon={true}
            onClick={() => exportCorpusModal.show()}
          >
            <Printer />
          </Button>

          <Link
            title={t('corpus.preview.buttonTitle')}
            target="_blank"
            className={buttonStyles.icon}
            to={`/corpus/${corpus._id}/preview`}
          >
            <Eye />
          </Link>
        </aside>
      </div>
      {expanded && (
        <div className={styles.detail}>
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
        <CorpusUpdate
          corpus={corpus}
          onSubmit={() => editCorpusModal.close()}
          onCancel={() => editCorpusModal.close()}
        />
      </Modal>
    </div>
  )
}
