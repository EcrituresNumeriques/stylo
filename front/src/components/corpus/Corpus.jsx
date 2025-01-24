import { Button, Modal as GeistModal, useModal } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'

import { useCorpus } from '../../hooks/corpus.js'
import { useActiveWorkspace } from '../../hooks/workspace.js'
import styles from './corpus.module.scss'
import CorpusCreate from './CorpusCreate.jsx'

import Loading from '../molecules/Loading.jsx'
import WorkspaceLabel from '../workspace/WorkspaceLabel.jsx'

import CorpusItem from './CorpusItem.jsx'

export default function Corpus() {
  const { t } = useTranslation()
  const { corpus, isLoading } = useCorpus()
  const activeWorkspace = useActiveWorkspace()
  const {
    visible: createCorpusVisible,
    setVisible: setCreateCorpusVisible,
    bindings: createCorpusModalBinding,
  } = useModal()

  const handleCreateNewCorpus = useCallback(() => {
    setCreateCorpusVisible(false)
  }, [])

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

      <Button
        type="secondary"
        className={styles.button}
        onClick={() => setCreateCorpusVisible(true)}
      >
        {t('corpus.createAction.buttonText')}
      </Button>

      <GeistModal
        width="40rem"
        visible={createCorpusVisible}
        {...createCorpusModalBinding}
      >
        <h2>{t('corpus.createModal.title')}</h2>
        <GeistModal.Content>
          <CorpusCreate onSubmit={() => setCreateCorpusVisible(false)} />
        </GeistModal.Content>
        <GeistModal.Action
          passive
          onClick={() => setCreateCorpusVisible(false)}
        >
          {t('modal.close.text')}
        </GeistModal.Action>
      </GeistModal>

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
