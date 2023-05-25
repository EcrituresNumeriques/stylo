import { Modal as GeistModal, Note, Spacer, useModal, useToasts } from '@geist-ui/core'
import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { ChevronDown, ChevronRight, Edit3, Eye, Printer, Trash } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGraphQL } from '../../helpers/graphQL.js'
import Button from '../Button.jsx'
import TimeAgo from '../TimeAgo.jsx'

import { deleteCorpus } from './Corpus.graphql'

import styles from './corpusItem.module.scss'

export default function CorpusItem ({ corpus }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const {
    visible: deleteCorpusVisible,
    setVisible: setDeleteCorpusVisible,
    bindings: deleteCorpusModalBinding
  } = useModal()

  const runQuery = useGraphQL()

  const handleDeleteCorpus = useCallback(async () => {
    try {
      await runQuery({ query: deleteCorpus, variables: { corpusId: corpus._id } })
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
  }, [corpus._id])

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
          <Button title="Delete" icon={true} onClick={(event) => {
            event.preventDefault()
            setDeleteCorpusVisible(true)
          }}>
            <Trash/>
          </Button>
          <Button title="Download a printable version" icon={true}>
            <Printer/>
          </Button>
          <Button title="Edit article" icon={true}>
            <Edit3/>
          </Button>
          <Button title="Preview (open a new window)" icon={true}>
            <Eye/>
          </Button>
        </aside>
      </div>
      {expanded && <div className={styles.detail}>
        {corpus.description && <p>{corpus.description}</p>}
        <h5 className={styles.partsTitle}>{t('corpus.parts.label')}</h5>
        {corpus.articles && corpus.articles.length > 0 && <ul>
          {corpus.articles.map((a) => (
            <li key={a._id}><Link to={`/article/${a.article._id}`}>{a.article.title}</Link></li>
          ))}
        </ul>}
        {(corpus.articles && corpus.articles.length === 0) &&
          <>
            <Spacer/>
            <Note type="secondary">
              Pour ajouter un nouveau chapitre,
              aller sur la page des articles et dans le détail d'un article sélectionner ce corpus.
            </Note>
          </>
        }
      </div>}

      <GeistModal visible={deleteCorpusVisible} {...deleteCorpusModalBinding}>
        <h2>{t('corpus.deleteModal.title')}</h2>
        <GeistModal.Content>
          {t('corpus.deleteModal.confirmMessage')}
        </GeistModal.Content>
        <GeistModal.Action passive onClick={() => setDeleteCorpusVisible(false)}>{t('modal.cancelButton.text')}</GeistModal.Action>
        <GeistModal.Action onClick={handleDeleteCorpus}>{t('modal.confirmButton.text')}</GeistModal.Action>
      </GeistModal>
    </div>
  )
}

CorpusItem.propTypes = {
  corpus: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    creator: PropTypes.shape({
      displayName: PropTypes.string,
      username: PropTypes.string
    }),
    updatedAt: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  })
}
