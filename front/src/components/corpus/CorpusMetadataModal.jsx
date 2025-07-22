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
import { useCorpusPreferences } from '../../stores/preferencesStore.js'
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

  const { metadataFormMode: selector, setValue } = useCorpusPreferences()
  function setSelector(value) {
    setValue('metadataFormMode', value)
  }
  const corpusThesisMetadataSchemaMerged = useMemo(
    () => merge(corpusThesisMetadataSchema),
    [corpusThesisMetadataSchema]
  )
  const corpusMetadataSchema = useMemo(() => {
    if (corpusType === 'journal') {
      return corpusJournalMetadataSchema
    }
    if (corpusType === 'thesis') {
      return corpusThesisMetadataSchemaMerged
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
        <div
          className={styles.toggle}
          onClick={() => setSelector(selector === 'raw' ? 'basic' : 'raw')}
        >
          <Toggle
            disabled={corpusType === 'neutral'}
            id="raw-mode"
            checked={selector === 'raw' || corpusType === 'neutral'}
            title={t('metadata.showYaml')}
            onChange={(e) => {
              setSelector(e.target.checked ? 'raw' : 'basic')
            }}
          />
          <label aria-disabled={corpusType === 'neutral'} htmlFor="raw-mode">
            YAML
          </label>
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
