import { merge } from 'allof-merge'
import YAML from 'js-yaml'
import { List } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import corpusBookMetadataSchema from '../../../schemas/corpus-book-metadata.schema.json'
import corpusBookUiSchema from '../../../schemas/corpus-book-ui-schema.json'
import corpusJournalMetadataSchema from '../../../schemas/corpus-journal-metadata.schema.json'
import corpusJournalUiSchema from '../../../schemas/corpus-journal-ui-schema.json'
import corpusThesisMetadataSchema from '../../../schemas/corpus-thesis-metadata.schema.json'
import corpusThesisUiSchema from '../../../schemas/corpus-thesis-ui-schema.json'

import { useCorpusActions } from '../../../hooks/corpus.js'
import { useModal } from '../../../hooks/modal.js'
import { usePreferenceItem } from '../../../hooks/user.js'
import { Button } from '../../atoms/index.js'
import { FormActions, Toggle } from '../../molecules/index.js'
import { toYaml } from '../metadata/yaml.js'

import Modal from '../../molecules/Modal.jsx'
import MetadataForm from '../metadata/MetadataForm.jsx'
import MonacoYamlEditor from '../metadata/YamlEditor.jsx'

import styles from './CorpusMetadataModal.module.scss'

export default function CorpusMetadataModal({
  corpusId,
  corpusType,
  initialValue,
}) {
  const { t } = useTranslation()
  const { updateCorpus } = useCorpusActions()
  const modal = useModal()

  const [metadata, setMetadata] = useState(initialValue)
  const yaml = useMemo(() => toYaml(metadata), [metadata])
  const [error, setError] = useState('')
  const { value: selector, setValue: setSelector } = usePreferenceItem(
    'metadataFormMode',
    'corpus'
  )
  const corpusThesisMetadataSchemaMerged = useMemo(
    () => merge(corpusThesisMetadataSchema),
    [corpusThesisMetadataSchema]
  )
  const corpusBookMetadataSchemaMerged = useMemo(
    () => merge(corpusBookMetadataSchema),
    [corpusBookMetadataSchema]
  )
  const corpusMetadataSchema = useMemo(() => {
    if (corpusType === 'journal') {
      return corpusJournalMetadataSchema
    }
    if (corpusType === 'thesis') {
      return corpusThesisMetadataSchemaMerged
    }
    if (corpusType === 'book') {
      return corpusBookMetadataSchemaMerged
    }
    return null
  }, [corpusType])
  const corpusUiSchema = useMemo(() => {
    if (corpusType === 'journal') {
      return corpusJournalUiSchema
    }
    if (corpusType === 'thesis') {
      return corpusThesisUiSchema
    }
    if (corpusType === 'book') {
      return corpusBookUiSchema
    }
    return null
  }, [corpusType])

  // handlers
  const handleYamlChange = useCallback(
    async (yaml) => {
      try {
        const [metadata = {}] = YAML.loadAll(yaml)
        setError('')
        setMetadata(metadata)
      } catch (err) {
        setError(err.message)
      }
    },
    [setMetadata]
  )
  const handleUpdateMetadata = useCallback(async () => {
    try {
      await updateCorpus({ corpusId, metadata })
      modal.close()
      toast(t(`corpus.update.toastSuccess`), { type: 'info' })
    } catch (err) {
      toast(t(`corpus.update.toastFailure`, { errorMessage: err.message }), {
        type: 'error',
      })
    }
  }, [corpusId, modal, corpusId, metadata])
  const handleMetadataUpdated = useCallback(
    (metadata) => {
      setMetadata(metadata)
    },
    [setMetadata]
  )
  const handleCancel = useCallback(() => {
    setMetadata(initialValue)
    modal.close()
  }, [setMetadata, initialValue, modal])

  const showYamlEditor = useMemo(
    () => corpusType === 'neutral' || selector === 'raw',
    [selector, corpusType]
  )

  const showMetadataForm = useMemo(
    () => corpusType !== 'neutral' && selector !== 'raw',
    [selector, corpusType]
  )

  return (
    <>
      <Button
        title={t('metadata.title')}
        icon={true}
        onClick={() => modal.show()}
      >
        <List />
      </Button>
      <Modal
        {...modal.bindings}
        cancel={handleCancel}
        title={
          <>
            <List /> {t('corpus.metadataModal.title')}
          </>
        }
      >
        <div className={styles.header}>
          <Toggle
            disabled={corpusType === 'neutral'}
            id="raw-mode"
            checked={selector === 'raw' || corpusType === 'neutral'}
            title={t('metadata.showYaml')}
            onChange={(checked) => {
              setSelector(checked ? 'raw' : 'basic')
            }}
            className={styles.toggle}
          >
            YAML
          </Toggle>
        </div>
        {showYamlEditor && (
          <>
            {error !== '' && <p className={styles.error}>{error}</p>}
            <MonacoYamlEditor
              height="calc(100vh - 350px)"
              fontSize="14"
              text={yaml}
              onTextUpdate={handleYamlChange}
            />
          </>
        )}
        {showMetadataForm && (
          <MetadataForm
            data={metadata}
            schema={corpusMetadataSchema}
            uiSchema={corpusUiSchema}
            onChange={handleMetadataUpdated}
          />
        )}
        <FormActions
          onCancel={handleCancel}
          onSubmit={handleUpdateMetadata}
          submitButton={{
            text: t('modal.saveButton.text'),
          }}
        />
      </Modal>
    </>
  )
}
