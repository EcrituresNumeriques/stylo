import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { useCorpus } from '../../hooks/corpus.js'
import { useModal } from '../../hooks/modal.js'

import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import Loading from '../molecules/Loading.jsx'
import WorkspaceLabel from '../workspace/WorkspaceLabel.jsx'
import CorpusForm from './CorpusForm.jsx'
import CorpusItem from './CorpusItem.jsx'

import styles from './corpus.module.scss'

export default function Corpus() {
  const { t } = useTranslation()
  const { workspaceId } = useParams()
  const { corpus, workspace, isLoading } = useCorpus({ workspaceId })
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
        <h1>{t('header.corpus.link')}</h1>

        <WorkspaceLabel color={workspace.color} name={workspace.name} />
      </header>

      <p className={styles.introduction}>{t('corpus.page.description')}</p>

      <Button primary onClick={() => createCorpusModal.show()}>
        {t('corpus.createAction.buttonText')}
      </Button>

      <Modal
        {...createCorpusModal.bindings}
        title={t('corpus.createModal.title')}
      >
        <CorpusForm
          onSubmit={() => createCorpusModal.close()}
          onCancel={() => createCorpusModal.close()}
        />
      </Modal>

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
