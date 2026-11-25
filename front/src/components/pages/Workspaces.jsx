import { Search } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useModal } from '../../hooks/modal.js'
import { getUserStats } from '../../hooks/Workspaces.graphql'
import { useWorkspaces } from '../../hooks/workspace.js'
import { Button, Field, PageTitle } from '../atoms/index.js'
import { Alert, Loading } from '../molecules/index.js'
import CreateWorkspaceModal from '../organisms/workspace/CreateWorkspaceModal.jsx'
import WorkspaceItem from '../organisms/workspace/WorkspaceItem.jsx'

import styles from './Workspaces.module.scss'

export default function Workspaces() {
  const { t } = useTranslation('workspace', { useSuspense: false })
  const keyboardHintId = useId()
  const { user: activeUser } = useRouteLoaderData('app')
  const [filter, setFilter] = useState('')
  const { workspaces, error, isLoading } = useWorkspaces()
  const workspaceCreateModal = useModal()

  const [personalWorkspace, setPersonalWorkspace] = useState({
    id: activeUser.id,
    name: t('myspace.name'),
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
          id: activeUser.id,
          personal: true,
          name: t('myspace.name'),
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
  }, [activeUser.id, t])

  const filteredWorkspaces = useMemo(() => {
    return [personalWorkspace, ...workspaces].filter(
      (workspace) =>
        workspace.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
    )
  }, [filter, workspaces, personalWorkspace])

  if (error) {
    return <Alert message={error.message} />
  }
  if (isLoading) {
    return <Loading />
  }

  return (
    <section className={styles.section}>
      <Helmet>
        <title>{t('title')}</title>
      </Helmet>

      <header className={styles.pageHeader}>
        <PageTitle
          className={styles.title}
          id="workspaces-list-headline"
          title={t('header')}
        />
        <Button
          className={styles.button}
          primary
          onClick={() => workspaceCreateModal.show()}
        >
          {t('actions.create.title')}
        </Button>
        <search
          className={styles.search}
          aria-label={t('actions.filter.label')}
        >
          <Field
            className={styles.searchField}
            type="search"
            icon={<Search />}
            value={filter}
            placeholder={t('actions.filter.placeholder')}
            onChange={(e) => setFilter(e.target.value)}
          />
        </search>
      </header>

      <CreateWorkspaceModal {...workspaceCreateModal} />

      <div className={styles.workspacesList}>
        <p id={keyboardHintId} hidden>
          {t('focusZone.hint', { ns: 'translation' })}
        </p>
        {filteredWorkspaces.map((workspace) => (
          <WorkspaceItem
            key={`workspace-${workspace.id}`}
            workspace={workspace}
            keyboardHintId={keyboardHintId}
          />
        ))}
      </div>
    </section>
  )
}
