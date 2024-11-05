import PropTypes from "prop-types"
import React, { useCallback, useState } from "react"
import { Modal as GeistModal, useModal } from "@geist-ui/core"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"

import { updateMetadata } from './Corpus.graphql'
import { useGraphQL } from "../../helpers/graphQL.js"
import MetadataForm from '../metadata/MetadataForm.jsx'
import corpusMetadataSchema from '../../schemas/corpus-journal-metadata.schema.json'
import corpusUiSchema from '../../schemas/corpus-journal-ui-schema.json'
import Button from "../Button.jsx";
import { List } from "react-feather";
import Select from "../Select.jsx";


export default function CorpusMetadataModal({ corpusId, initialValue }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const runQuery = useGraphQL()
  const [corpusMetadata, setCorpusMetadata] = useState(initialValue)
  const {
    visible: editMetadataVisible,
    setVisible: setEditMetadataVisible,
    bindings: editMetadataBindings,
  } = useModal()

  const handleUpdateMetadata = useCallback(async () => {
    await runQuery({
      query: updateMetadata,
      variables: {
        corpusId: corpusId,
        metadata: corpusMetadata
      }
    })
    dispatch({ type: 'SET_LATEST_CORPUS_UPDATED', data: { corpusId, date: new Date() } })
    setEditMetadataVisible(false)
  }, [corpusId, dispatch, runQuery, updateMetadata, corpusId, corpusMetadata])

  const handleMetadataUpdated = useCallback((metadata) => {
    setCorpusMetadata(metadata)
  }, [setCorpusMetadata])

  return (
    <>
      <Button title="Metadata" icon={true} onClick={() => setEditMetadataVisible(true)}>
        <List/>
      </Button>
      <GeistModal width="40rem" visible={editMetadataVisible} {...editMetadataBindings}>
        <h2>{t('corpus.metadataModal.title')}</h2>
        <GeistModal.Content>
          <Select alignLabel={false} id="corpus-type" label="Type">
            <option value="journal">{t('corpus.type.journal')}</option>
          </Select>
          <MetadataForm
            data={initialValue}
            schema={corpusMetadataSchema}
            uiSchema={corpusUiSchema}
            onChange={handleMetadataUpdated}
          />
        </GeistModal.Content>
        <GeistModal.Action passive
                           onClick={() => setEditMetadataVisible(false)}>{t('modal.close.text')}</GeistModal.Action>
        <GeistModal.Action onClick={handleUpdateMetadata}>{t('modal.saveButton.text')}</GeistModal.Action>
      </GeistModal>
    </>)
}

CorpusMetadataModal.propTypes = {
  corpusId: PropTypes.string.isRequired,
  initialValue: PropTypes.object.isRequired
}
