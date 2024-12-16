import { Button, Modal as GeistModal } from '@geist-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { Search } from 'react-feather'

import { CurrentUserContext } from '../../contexts/CurrentUser'

import styles from './workspaces.module.scss'
import Field from '../../components/Field.jsx'

import WorkspaceItem from '../../components/workspace/WorkspaceItem.jsx'
import { useGraphQL } from '../../helpers/graphQL.js'
import { getWorkspaces, getUserStats } from './Workspaces.graphql'
import CreateWorkspace from '../../components/workspace/CreateWorkspace.jsx'

export default function Workspaces() {
  const { t } = useTranslation()
  const activeUser = useSelector((state) => state.activeUser, shallowEqual)
  const [filter, setFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [workspaces, setWorkspaces] = useState([])
  const [personalWorkspace, setPersonalWorkspace] = useState({
    _id: activeUser._id,
    personal: true,
    members: [],
  })
  const currentWorkspaces = activeUser.workspaces
  const handleCloseCreate = useCallback(() => {
    setCreating(false)
  }, [])
  const runQuery = useGraphQL()

  useEffect(() => {
    ;(async () => {
      try {
        const getUserStatsResponse = await runQuery({ query: getUserStats })
        const userStats = getUserStatsResponse.user.stats
        setPersonalWorkspace({
          _id: activeUser._id,
          personal: true,
          name: t('workspace.myspace'),
          description: '',
          color: '#D9D9D9',
          createdAt: activeUser.createdAt,
          updatedAt: activeUser.updatedAt,
          members: [],
          articlesCount:
            userStats.myArticlesCount + userStats.contributedArticlesCount,
        })
      } catch (err) {
        alert(err)
      }
    })()
  }, [activeUser._id, t])

  useEffect(() => {
    ;(async () => {
      try {
        const getWorkspacesResponse = await runQuery({ query: getWorkspaces })
        const workspaces = getWorkspacesResponse.workspaces
        setWorkspaces(workspaces)
        setCreating(false)
      } catch (err) {
        alert(err)
      }
    })()
  }, [currentWorkspaces])

  return (
    <CurrentUserContext.Provider value={activeUser}>
      <section className={styles.section}>
        <h1>{t('workspace.title')}</h1>
        <div>
          <Field
            className={styles.searchField}
            type="text"
            icon={Search}
            value={filter}
            placeholder={t('search.placeholder')}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Button
          type="secondary"
          className={styles.button}
          onClick={() => setCreating(true)}
        >
          {t('workspace.createNew.button')}
        </Button>

        <GeistModal
          width="45rem"
          visible={creating}
          onClose={handleCloseCreate}
        >
          <h2>{t('workspace.createModal.title')}</h2>
          <GeistModal.Content>
            <CreateWorkspace />
          </GeistModal.Content>
          <GeistModal.Action passive onClick={handleCloseCreate}>
            {t('modal.close.text')}
          </GeistModal.Action>
        </GeistModal>

        <ul className={styles.workspacesList}>
          {[personalWorkspace, ...workspaces].map((workspace) => (
            <li key={`workspace-${workspace._id}`}>
              <WorkspaceItem workspace={workspace} />
            </li>
          ))}
        </ul>
      </section>
    </CurrentUserContext.Provider>
  )
}
