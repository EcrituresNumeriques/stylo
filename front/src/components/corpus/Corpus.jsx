import {
  Button,
  Modal as GeistModal,
  useModal,
  useToasts,
} from '@geist-ui/core'
import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet'
import { CurrentUserContext } from '../../contexts/CurrentUser'

import { useGraphQLClient } from '../../helpers/graphQL'
import { useActiveWorkspace } from '../../hooks/workspace.js'
import styles from './corpus.module.scss'
import CorpusCreate from './CorpusCreate.jsx'

import Loading from '../Loading'
import { useActiveUserId } from '../../hooks/user'
import WorkspaceLabel from '../workspace/WorkspaceLabel.jsx'

import { getCorpus } from './Corpus.graphql'
import CorpusItem from './CorpusItem.jsx'

export default function Corpus() {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const currentUser = useSelector((state) => state.activeUser, shallowEqual)
  const latestCorpusCreated = useSelector(
    (state) => state.latestCorpusCreated,
    shallowEqual
  )
  const latestCorpusDeleted = useSelector(
    (state) => state.latestCorpusDeleted,
    shallowEqual
  )
  const latestCorpusUpdated = useSelector(
    (state) => state.latestCorpusUpdated,
    shallowEqual
  )
  const [isLoading, setIsLoading] = useState(true)
  const [corpus, setCorpus] = useState([])
  const activeUserId = useActiveUserId()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = activeWorkspace?._id
  const {
    visible: createCorpusVisible,
    setVisible: setCreateCorpusVisible,
    bindings: createCorpusModalBinding,
  } = useModal()

  const { query } = useGraphQLClient()

  const handleCreateNewCorpus = useCallback(() => {
    setCreateCorpusVisible(false)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const variables = activeWorkspaceId
          ? { filter: { workspaceId: activeWorkspaceId } }
          : {}
        const data = await query({ query: getCorpus, variables })
        setCorpus(data.corpus)
        setIsLoading(false)
      } catch (err) {
        setToast({
          type: 'error',
          text: t('corpus.load.toastFailure', { errorMessage: err.toString() }),
        })
      }
    })()
  }, [
    activeUserId,
    activeWorkspaceId,
    latestCorpusCreated,
    latestCorpusDeleted,
    latestCorpusUpdated,
  ])

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Helmet>
        <title>
          {t('corpus.page.title', {
            workspace: activeWorkspace?.name ?? '$t(workspace.myspace)',
          })}
        </title>
      </Helmet>
      <section className={styles.section}>
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
            <CorpusCreate onSubmit={handleCreateNewCorpus} />
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
    </CurrentUserContext.Provider>
  )
}
