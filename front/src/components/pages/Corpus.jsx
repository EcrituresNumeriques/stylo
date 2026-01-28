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
  const { t } = useTranslation()
  const { workspaceId } = useParams()
  const { corpus, workspace, isLoading, error } = useCorpus({ workspaceId })
  const createCorpusModal = useModal()

  return (
    <section className={styles.section}>
      <Helmet>
        <title>
          {t('corpus.page.title', {
            workspace: workspace.name ?? '$t(workspace.myspace)',
          })}
        </title>
      </Helmet>

      <header className={styles.header}>
        <PageTitle title={t('header.corpus.link')}></PageTitle>
        <Button primary onClick={() => createCorpusModal.show()}>
          {t('corpus.createAction.buttonText')}
        </Button>
      </header>
      <WorkspaceLabel color={workspace.color} name={workspace.name} />
      <p className={styles.introduction}>{t('corpus.page.description')}</p>

      <Modal
        {...createCorpusModal.bindings}
        title={t('corpus.createModal.title')}
      >
        <CorpusForm
          onSubmit={() => createCorpusModal.close()}
          onCancel={() => createCorpusModal.close()}
        />
      </Modal>

      {error && <Alert className={styles.message} message={error.message} />}

      {isLoading ? (
        <Loading />
      ) : (
        <ul className={styles.corpusList}>
          {corpus.map((c) => {
            return (
              <li key={c._id}>
                <CorpusItem corpus={c} />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
