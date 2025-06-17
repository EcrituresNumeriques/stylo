import { merge } from 'allof-merge'
import YAML from 'js-yaml'
import { List } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import corpusJournalMetadataSchema from '../../schemas/corpus-journal-metadata.schema.json'
import corpusJournalUiSchema from '../../schemas/corpus-journal-ui-schema.json'
import corpusThesisMetadataSchema from '../../schemas/corpus-thesis-metadata.schema.json'
import corpusThesisUiSchema from '../../schemas/corpus-thesis-ui-schema.json'
import { Toggle, useToasts } from '@geist-ui/core'

import { useCorpusActions } from '../../hooks/corpus.js'
import { useModal } from '../../hooks/modal.js'
import { usePreferenceItem } from '../../hooks/user.js'
import { toYaml } from '../Write/metadata/yaml.js'

import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import MonacoYamlEditor from '../Write/providers/monaco/YamlEditor.jsx'
import MetadataForm from '../metadata/MetadataForm.jsx'
import FormActions from '../molecules/FormActions.jsx'

import styles from './CorpusMetadataModal.module.scss'

export default function CorpusMetadataModal({
  corpusId,
  corpusType,
  initialValue,
}) {
  const { t } = useTranslation()
  const { updateCorpus } = useCorpusActions()
  const modal = useModal()
  const { setToast } = useToasts()

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
  const corpusMetadataSchema = useMemo(
    () =>
      corpusType === 'journal'
        ? corpusJournalMetadataSchema
        : corpusThesisMetadataSchemaMerged,
    [corpusType]
  )
  const corpusUiSchema = useMemo(
    () =>
      corpusType === 'journal' ? corpusJournalUiSchema : corpusThesisUiSchema,
    [corpusType]
  )

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
      setToast({
        text: t(`corpus.update.toastSuccess`),
        type: 'default',
      })
    } catch (err) {
      setToast({
        text: t(`corpus.update.toastFailure`, { errorMessage: err.message }),
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
        <div
          className={styles.toggle}
          onClick={() => setSelector(selector === 'raw' ? 'basic' : 'raw')}
        >
          <Toggle
            id="raw-mode"
            checked={selector === 'raw'}
            title={t('metadata.showYaml')}
            onChange={(e) => {
              setSelector(e.target.checked ? 'raw' : 'basic')
            }}
          />
          <label htmlFor="raw-mode">YAML</label>
        </div>
        {selector === 'raw' && (
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
        {selector !== 'raw' && (
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
