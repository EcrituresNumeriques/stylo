import React from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'

import { useCorpus } from '../../hooks/corpus.js'
import { useModal } from '../../hooks/modal.js'
import { useActiveWorkspace } from '../../hooks/workspace.js'
import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import styles from './corpus.module.scss'
import CorpusCreate from './CorpusCreate.jsx'

import Loading from '../molecules/Loading.jsx'
import WorkspaceLabel from '../workspace/WorkspaceLabel.jsx'

import CorpusItem from './CorpusItem.jsx'

export default function Corpus() {
  const { t } = useTranslation()
  const { corpus, isLoading } = useCorpus()
  const activeWorkspace = useActiveWorkspace()
  const createCorpusModal = useModal()

  return (
    <section className={styles.section}>
      <Helmet>
        <title>
          {t('corpus.page.title', {
            workspace: activeWorkspace?.name ?? '$t(workspace.myspace)',
          })}
        </title>
      </Helmet>

      <header className={styles.header}>
        <h1>{t('header.corpus.link')}</h1>
        {activeWorkspace && (
          <WorkspaceLabel
            color={activeWorkspace.color}
            name={activeWorkspace.name}
          />
        )}
      </header>
      <p className={styles.introduction}>{t('corpus.page.description')}</p>

      <Button primary onClick={() => createCorpusModal.show()}>
        {t('corpus.createAction.buttonText')}
      </Button>

      <Modal
        {...createCorpusModal.bindings}
        title={t('corpus.createModal.title')}
      >
        <CorpusCreate
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
