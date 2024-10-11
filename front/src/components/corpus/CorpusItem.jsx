import {Modal as GeistModal, useModal, useToasts} from '@geist-ui/core'
import React, {useCallback, useMemo, useState} from 'react'
import PropTypes from 'prop-types'
import {ChevronDown, ChevronRight, Eye, List, Printer, Settings, Trash} from 'react-feather'
import {useTranslation} from 'react-i18next'
import {useDispatch} from 'react-redux'
import {Link} from 'react-router-dom'
import {useGraphQL} from '../../helpers/graphQL.js'
import Button from '../Button.jsx'
import buttonStyles from '../button.module.scss'
import Export from '../Export.jsx'
import TimeAgo from '../TimeAgo.jsx'

import CorpusArticles from './CorpusArticles.jsx'
import CorpusUpdate from './CorpusUpdate.jsx'

import {deleteCorpus, updateMetadata} from './Corpus.graphql'
import styles from './corpusItem.module.scss'
import MetadataForm from "../metadata/MetadataForm.jsx";
import YAML from "js-yaml";


export default function CorpusItem({corpus}) {
  const {t} = useTranslation()
  const {setToast} = useToasts()
  const dispatch = useDispatch()
  const {
    visible: deleteCorpusVisible,
    setVisible: setDeleteCorpusVisible,
    bindings: deleteCorpusModalBinding
  } = useModal()

  const {
    visible: exportCorpusVisible,
    setVisible: setExportCorpusVisible,
    bindings: exportCorpusBindings,
  } = useModal()

  const {
    visible: editCorpusVisible,
    setVisible: setEditCorpusVisible,
    bindings: editCorpusBindings,
  } = useModal()

  const {
    visible: editMetadataVisible,
    setVisible: setEditMetadataVisible,
    bindings: editMetadataBindings,
  } = useModal()

  const runQuery = useGraphQL()
  const corpusId = useMemo(() => corpus._id, [corpus])
  const corpusMetadata = useMemo(() =>  YAML.loadAll(corpus.metadata || '')[0] || {}, [corpus])

  console.log({corpus})
  const handleCorpusUpdated = useCallback(() => {
    setEditCorpusVisible(false)
    dispatch({type: 'SET_LATEST_CORPUS_UPDATED', data: {corpusId, date: new Date()}})
  }, [corpusId])

  const handleMetadataUpdated = useCallback(async (metadata) => {
    await runQuery({
      query: updateMetadata,
      variables: {
        corpusId: corpusId,
        metadata
      }
    })
    dispatch({type: 'SET_LATEST_CORPUS_UPDATED', data: {corpusId, date: new Date()}})
  }, [corpusId, dispatch, runQuery, updateMetadata, corpusId])

  const handleDeleteCorpus = useCallback(async () => {
    try {
      await runQuery({query: deleteCorpus, variables: {corpusId}})
      dispatch({type: 'SET_LATEST_CORPUS_DELETED', data: {corpusId}})
      setToast({
        text: t('corpus.delete.toastSuccess'),
        type: 'default'
      })
    } catch (err) {
      setToast({
        text: `Unable to delete corpus ${corpus.name}: ${err}`,
        type: 'error'
      })
    }
  }, [corpusId])

  const [expanded, setExpanded] = useState(false)
  const toggleExpansion = useCallback((event) => {
    if (!event.key || [' ', 'Enter'].includes(event.key)) {
      setExpanded(!expanded)
    }
  }, [expanded])

  return (<div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.heading} onClick={toggleExpansion}>
          <h4 className={styles.title}>
          <span tabIndex={0} onKeyUp={toggleExpansion} className={styles.icon}>
            {expanded ? <ChevronDown/> : <ChevronRight/>}
          </span>{corpus.name}
          </h4>
          <p className={styles.metadata}>
            <span className={styles.by}>{t('corpus.by.text')}</span>
            <span className={styles.creator}>{corpus.creator.displayName || corpus.creator.username}</span>
            <TimeAgo date={corpus.updatedAt} className={styles.updatedAt}/>
          </p>
        </div>
        <aside className={styles.actionButtons}>
          <Button title="Edit" icon={true} onClick={() => setEditCorpusVisible(true)}>
            <Settings/>
          </Button>

          <Button title="Metadata" icon={true} onClick={() => setEditMetadataVisible(true)}>
            <List/>
          </Button>

          <Button title="Delete" icon={true} onClick={(event) => {
            event.preventDefault()
            setDeleteCorpusVisible(true)
          }}>
            <Trash/>
          </Button>
          <Button title="Download a printable version" icon={true} onClick={() => setExportCorpusVisible(true)}>
            <Printer/>
          </Button>

          <Link title="Preview (open a new window)" target="_blank" className={buttonStyles.icon}
                to={`/books/${corpus._id}/preview`}>
            <Eye/>
          </Link>
        </aside>
      </div>
      {expanded && <div className={styles.detail}>
        {corpus.description && <p>{corpus.description}</p>}
        <CorpusArticles corpusId={corpusId}/>
      </div>}

      <GeistModal visible={deleteCorpusVisible} {...deleteCorpusModalBinding}>
        <h2>{t('corpus.deleteModal.title')}</h2>
        <GeistModal.Content>
          {t('corpus.deleteModal.confirmMessage')}
        </GeistModal.Content>
        <GeistModal.Action passive
                           onClick={() => setDeleteCorpusVisible(false)}>{t('modal.cancelButton.text')}</GeistModal.Action>
        <GeistModal.Action onClick={handleDeleteCorpus}>{t('modal.confirmButton.text')}</GeistModal.Action>
      </GeistModal>

      <GeistModal visible={exportCorpusVisible} {...exportCorpusBindings}>
        <h2>{t('corpus.exportModal.title')}</h2>
        <GeistModal.Content>
          <Export bookId={corpusId} name={corpus.name}/>
        </GeistModal.Content>
        <GeistModal.Action passive
                           onClick={() => setExportCorpusVisible(false)}>{t('modal.cancelButton.text')}</GeistModal.Action>
      </GeistModal>

      <GeistModal width="40rem" visible={editCorpusVisible} {...editCorpusBindings}>
        <h2>{t('corpus.editModal.title')}</h2>
        <GeistModal.Content>
          <CorpusUpdate corpus={corpus} onSubmit={handleCorpusUpdated}/>
        </GeistModal.Content>
        <GeistModal.Action passive
                           onClick={() => setEditCorpusVisible(false)}>{t('modal.cancelButton.text')}</GeistModal.Action>
      </GeistModal>

      <GeistModal width="40rem" visible={editMetadataVisible} {...editMetadataBindings}>
        <h2>{t('corpus.metadataModal.title')}</h2>
        <GeistModal.Content>
          <MetadataForm
          data={corpusMetadata}
          templates={['basic']}
          onChange={handleMetadataUpdated}
          />
        </GeistModal.Content>
        <GeistModal.Action passive
                           onClick={() => setEditMetadataVisible(false)}>{t('modal.close.text')}</GeistModal.Action>
      </GeistModal>
    </div>
  )
}

CorpusItem.propTypes = {
  corpus: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    creator: PropTypes.shape({
      displayName: PropTypes.string,
      username: PropTypes.string
    }),
    articles: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
    })),
    updatedAt: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  })
}
