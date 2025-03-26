import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet'

import Field from '../../components/Field.jsx'

import WorkspaceItem from '../../components/workspace/WorkspaceItem.jsx'

import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useModal } from '../../hooks/modal.js'
import { useWorkspaces } from '../../hooks/workspace.js'
import Button from '../Button.jsx'
import Loading from '../molecules/Loading.jsx'
import CreateWorkspaceModal from './CreateWorkspaceModal.jsx'
import { getUserStats } from './Workspaces.graphql'

import styles from './workspaces.module.scss'

export default function Workspaces() {
  const { t } = useTranslation()
  const activeUser = useSelector((state) => state.activeUser, shallowEqual)
  const [filter, setFilter] = useState('')
  const { workspaces, error, isLoading } = useWorkspaces()
  const workspaceCreateModal = useModal()

  const [personalWorkspace, setPersonalWorkspace] = useState({
    _id: activeUser._id,
    personal: true,
    members: [],
  })
  const { query } = useGraphQLClient()

  useEffect(() => {
    ;(async () => {
      try {
        const getUserStatsResponse = await query({ query: getUserStats })
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

  if (error) {
    return <div>Unable to load the workspaces</div>
  }
  if (isLoading) {
    return <Loading />
  }

  return (
    <section className={styles.section}>
      <Helmet>
        <title>{t('workspace.title')}</title>
      </Helmet>

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
      <Button primary onClick={() => workspaceCreateModal.show()}>
        {t('workspace.createNew.button')}
      </Button>

      <CreateWorkspaceModal {...workspaceCreateModal} />

      <ul className={styles.workspacesList}>
        {[personalWorkspace, ...workspaces].map((workspace) => (
          <li key={`workspace-${workspace._id}`}>
            <WorkspaceItem workspace={workspace} />
          </li>
        ))}
      </ul>
    </section>
  )
}
