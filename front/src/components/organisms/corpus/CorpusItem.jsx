import clsx from 'clsx'
import { FileDownIcon, MessageSquareShare, Settings, Trash } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { toast } from 'react-toastify'
import { useCopyToClipboard } from 'react-use'

import { useCorpusActions } from '../../../hooks/corpus.js'
import useFocusZone from '../../../hooks/focusZone.js'
import { useModal } from '../../../hooks/modal.js'
import { useDisplayName } from '../../../hooks/user.js'
import buttonStyles from '../../atoms/Button.module.scss'
import { Badge, Button } from '../../atoms/index.js'
import {
  DropdownMenu,
  FormActions,
  Modal,
  ObjectMetadataLabel,
} from '../../molecules/index.js'
import Export from '../export/Export.jsx'
import CorpusArticles from './CorpusArticles.jsx'
import CorpusForm from './CorpusForm.jsx'
import styles from './CorpusItem.module.scss'
import CorpusMetadata from './CorpusMetadata.jsx'

/**
 * @typedef Article
 * @type {object}
 * @property {string} id
 * @property {string} title
 */

/**
 * @typedef Corpus
 * @type {object}
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {string} description
 * @property {Record<string, unknown>} metadata
 * @property {object} creator
 * @property {string} creator.displayName
 * @property {string} creator.username
 * @property {Article[]} articles
 * @property {string} updatedAt
 * @property {string} createdAt
 */

/**
 * @param {object} props
 * @param {Corpus} props.corpus
 * @param {string=} props.keyboardHintId id of the element describing the keyboard navigation
 * @returns {JSX.Element}
 */
export default function CorpusItem({ corpus, keyboardHintId }) {
  const focusZoneRef = useFocusZone()
  const displayName = useDisplayName()
  const { t } = useTranslation('corpus', { useSuspense: false })
  const [, copyToClipboard] = useCopyToClipboard()

  const deleteCorpusModal = useModal()
  const exportCorpusModal = useModal()
  const updateCorpusModal = useModal()
  const metadataCorpusModal = useModal()

  const { deleteCorpus } = useCorpusActions()
  const corpusId = useMemo(() => corpus.id, [corpus])
  const { hash } = useLocation()
  const anchor = `corpus-${corpusId}`

  // reached from a link to #corpus-<id> (e.g. a search result)
  useEffect(() => {
    if (hash === `#${anchor}`) {
      const element = document.getElementById(anchor)
      element?.scrollIntoView({ block: 'center' })
      element?.focus({ preventScroll: true })
    }
  }, [hash, anchor])

  const handleDeleteCorpus = useCallback(async () => {
    try {
      await deleteCorpus(corpusId)
      deleteCorpusModal.close()
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
      id={anchor}
      ref={focusZoneRef}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: focus zone, Enter gives access to its content
      tabIndex={0}
      className={styles.corpus}
      aria-labelledby={`corpus-${corpus.id}-title`}
      aria-describedby={keyboardHintId}
      role="listitem"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id={`corpus-${corpus.id}-title`} className={styles.title}>
            {corpus.name}
          </h2>
          <Badge className={styles.badge} label={t(`types.${corpus.type}`)} />
        </div>

        <div role="menu" className={styles.actionButtons}>
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
            onClick={() => exportCorpusModal.show()}
            title={t('actions.export.title')}
          >
            <FileDownIcon aria-label={t('actions.export.label')} />
          </Button>

          <DropdownMenu title={t('actions.menu.title')}>
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => metadataCorpusModal.show()}
                  title={t('actions.metadata.title')}
                >
                  {t('actions.metadata.label')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => updateCorpusModal.show()}
                  title={t('actions.update.title')}
                >
                  {t('actions.update.label')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title={t('actions.copyId.title')}
                >
                  {t('actions.copyId.label')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => deleteCorpusModal.show()}
                  title={t('actions.delete.title')}
                >
                  {t('actions.delete.label')}
                </button>
              </li>
            </ul>
          </DropdownMenu>
        </div>
      </header>

      <div id={`corpus-${corpus.id}-chapters`} className={styles.details}>
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
            <FileDownIcon aria-hidden /> {t('actions.export.title')}
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
