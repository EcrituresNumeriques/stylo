import { Button, Modal as GeistModal, useModal } from '@geist-ui/core'
import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { CurrentUserContext } from '../contexts/CurrentUser'

import { useGraphQL } from '../helpers/graphQL'
import { useActiveWorkspace } from '../hooks/workspace.js'
import ArticleCreate from './ArticleCreate.jsx'
import styles from './articles.module.scss'
import CorpusCreate from './corpus/CorpusCreate.jsx'

import Loading from './Loading'
import { useActiveUserId } from '../hooks/user'
import WorkspaceLabel from './workspace/WorkspaceLabel.jsx'

export default function Books () {

  const { t } = useTranslation()
  const currentUser = useSelector(state => state.activeUser, shallowEqual)
  const [isLoading, setIsLoading] = useState(true)
  const activeUserId = useActiveUserId()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = activeWorkspace?._id
  const { visible: createCorpusVisible, setVisible: setCreateCorpusVisible, bindings: createCorpusModalBinding } = useModal()

  const runQuery = useGraphQL()

  const handleCreateNewCorpus = useCallback(() => {
    setCreateCorpusVisible(false)
  }, [])

  useEffect(() => {
    //Self invoking async function
    (async () => {
      try {
        setIsLoading(true)
        //const data = await runQuery({ query, variables: { user: activeUserId } })
        setIsLoading(false)
      } catch (err) {
        alert(err)
      }
    })()
  }, [activeUserId, activeWorkspaceId])

  return (<CurrentUserContext.Provider value={currentUser}>

    <section className={styles.section}>
      <header className={styles.articlesHeader}>
        <h1>Corpus</h1>
        {activeWorkspace && <WorkspaceLabel color={activeWorkspace.color} name={activeWorkspace.name}/>}
      </header>
      <p>
        A corpus is a collection of articles that you can sort and export all at once.
      </p>

      <hr className={styles.horizontalSeparator}/>

      <Button onClick={() => setCreateCorpusVisible(true)}>{t('corpus.createAction.buttonText')}</Button>

      <GeistModal width='40rem' visible={createCorpusVisible} {...createCorpusModalBinding}>
        <h2>{t('corpus.createModal.title')}</h2>
        <GeistModal.Content>
          <CorpusCreate onSubmit={handleCreateNewCorpus} />
        </GeistModal.Content>
      </GeistModal>

      {isLoading ? <Loading/> : <></>}
    </section>
  </CurrentUserContext.Provider>)
}
