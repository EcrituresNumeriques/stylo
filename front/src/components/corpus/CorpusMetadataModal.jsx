import { List } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useModal } from '../../hooks/modal.js'
import corpusJournalMetadataSchema from '../../schemas/corpus-journal-metadata.schema.json'
import corpusJournalUiSchema from '../../schemas/corpus-journal-ui-schema.json'
import corpusThesisUiSchema from '../../schemas/corpus-thesis-ui-schema.json'
import corpusThesisMetadataSchema from '../../schemas/corpus-thesis-metadata.schema.json'
import Button from '../Button.jsx'
import MetadataForm from '../metadata/MetadataForm.jsx'
import Modal from '../Modal.jsx'
import FormActions from '../molecules/FormActions.jsx'
import Select from '../Select.jsx'

import { updateMetadata } from './Corpus.graphql'
import styles from './CorpusMetadataModal.module.scss'

export default function CorpusMetadataModal ({ corpusId, initialValue }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const [corpusMetadata, setCorpusMetadata] = useState(initialValue)
  const modal = useModal()
  const [metadataType, setMetadataType] = useState('journal')

  const corpusMetadataSchema = useMemo(() => metadataType === 'journal' ? corpusJournalMetadataSchema : corpusThesisMetadataSchema, [metadataType])
  const corpusUiSchema = useMemo(() => metadataType === 'journal' ? corpusJournalUiSchema : corpusThesisUiSchema, [metadataType])
  const handleUpdateMetadata = useCallback(async () => {
    await query({
      query: updateMetadata,
      variables: {
        corpusId: corpusId,
        metadata: corpusMetadata,
      },
    })
    dispatch({
      type: 'SET_LATEST_CORPUS_UPDATED',
      data: { corpusId, date: new Date() },
    })
    modal.close()
  }, [corpusId, dispatch, query, updateMetadata, corpusId, corpusMetadata])

  const handleMetadataUpdated = useCallback(
    (metadata) => {
      setCorpusMetadata(metadata)
    },
    [setCorpusMetadata]
  )

  return (
    <>
      <Button title="Metadata" icon={true} onClick={() => modal.show()}>
        <List/>
      </Button>
      <Modal
        {...modal.bindings}
        title={
          <>
            <List/> {t('corpus.metadataModal.title')}
          </>
        }
      >
        <div className={styles.type}>
          <Select alignLabel={false} id="corpus-type" label="Type" value={metadataType} onChange={(event) => {
            setMetadataType(event.target.value)
          }}>
            <option value="journal">{t('corpus.type.journal')}</option>
            <option value="thesis">{t('corpus.type.thesis')}</option>
          </Select>
        </div>
        <MetadataForm
          data={initialValue}
          schema={corpusMetadataSchema}
          uiSchema={corpusUiSchema}
          onChange={handleMetadataUpdated}
        />
        <FormActions
          onCancel={() => modal.close()}
          onSubmit={handleUpdateMetadata}
          submitButton={{
            text: t('modal.saveButton.text'),
          }}
        />
      </Modal>
    </>
  )
}
