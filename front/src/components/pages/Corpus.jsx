import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { useCorpus } from '../../hooks/corpus.js'
import { useModal } from '../../hooks/modal.js'
import { Button, PageTitle } from '../atoms/index.js'
import { Alert, Loading } from '../molecules/index.js'

import Modal from '../molecules/Modal.jsx'
import CorpusForm from '../organisms/corpus/CorpusForm.jsx'
import CorpusItem from '../organisms/corpus/CorpusItem.jsx'
import WorkspaceLabel from '../organisms/workspace/WorkspaceLabel.jsx'

import styles from './Corpus.module.scss'

export default function Corpus() {
  const { t } = useTranslation('corpus', { useSuspense: false })
  const { workspaceId } = useParams()
  const { corpus, workspace, isLoading, error } = useCorpus({ workspaceId })
  const createCorpusModal = useModal()

  return (
    <section className={styles.section}>
      <Helmet>
        <title>
          {t('title', {
            workspace: workspace.name ?? '$t(workspace.myspace)',
          })}
        </title>
      </Helmet>

      <header className={styles.header}>
        <PageTitle title={t('header')}></PageTitle>
        <Button primary onClick={() => createCorpusModal.show()}>
          {t('actions.create.label')}
        </Button>
      </header>
      <WorkspaceLabel color={workspace.color} name={workspace.name} />
      <p className={styles.introduction}>{t('description')}</p>

      <Modal {...createCorpusModal.bindings} title={t('actions.create.title')}>
        <CorpusForm
          onSubmit={() => createCorpusModal.close()}
          onCancel={() => createCorpusModal.close()}
        />
      </Modal>

      {error && <Alert className={styles.message} message={error.message} />}

      {isLoading ? (
        <Loading />
      ) : (
        <div className={styles.corpusList}>
          {corpus.map((c) => (
            <CorpusItem key={c._id} corpus={c} />
          ))}
        </div>
      )}
    </section>
  )
}
