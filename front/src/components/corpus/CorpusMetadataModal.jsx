import { List } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import corpusMetadataSchema from '../../schemas/corpus-journal-metadata.schema.json'
import corpusUiSchema from '../../schemas/corpus-journal-ui-schema.json'

import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useModal } from '../../hooks/modal.js'

import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import MetadataForm from '../metadata/MetadataForm.jsx'
import FormActions from '../molecules/FormActions.jsx'

import { updateMetadata } from './Corpus.graphql'

export default function CorpusMetadataModal({
  corpusId,
  corpusType,
  initialValue,
}) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const [corpusMetadata, setCorpusMetadata] = useState(initialValue)
  const modal = useModal()

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
      <Button title={t('metadata.title')} icon={true} onClick={() => modal.show()}>
        <List />
      </Button>
      <Modal
        {...modal.bindings}
        title={
          <>
            <List /> {t('corpus.metadataModal.title')}
          </>
        }
      >
        {corpusType === 'journal' && (
          <MetadataForm
            data={initialValue}
            schema={corpusMetadataSchema}
            uiSchema={corpusUiSchema}
            onChange={handleMetadataUpdated}
          />
        )}
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
