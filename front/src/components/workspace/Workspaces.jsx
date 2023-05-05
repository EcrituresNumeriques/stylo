import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { Search } from 'react-feather'

import { CurrentUserContext } from '../../contexts/CurrentUser'

import styles from './workspaces.module.scss'
import Field from '../../components/Field.jsx'

import Button from '../../components/Button.jsx'
import WorkspaceItem from '../../components/workspace/WorkspaceItem.jsx'
import { useGraphQL } from '../../helpers/graphQL.js'
import { getWorkspaces, getArticles } from './Workspaces.graphql'
import CreateWorkspace from '../../components/workspace/CreateWorkspace.jsx'

export default function Workspaces () {
  const { t } = useTranslation()
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const [filter, setFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [workspaces, setWorkspaces] = useState([])
  const [personalWorkspace, setPersonalWorkspace] = useState({
    _id: activeUser._id,
    personal: true,
    members: [],
    articles: []
  })
  const currentWorkspaces = useSelector((state) => state.workspaces)
  const handleCreateCancel = useCallback(() => setCreating(false), [creating])
  const runQuery = useGraphQL()

  useEffect(() => {
    (async () => {
      try {
        const getArticlesResponse = await runQuery({ query: getArticles })
        setPersonalWorkspace({
          _id: activeUser._id,
          personal: true,
          name: t('workspace.myspace'),
          color: '#D9D9D9',
          createdAt: activeUser.createdAt,
          updatedAt: activeUser.updatedAt,
          members: [],
          articles: getArticlesResponse.user.articles
        })
      } catch (err) {
        alert(err)
      }
    })()
  }, [activeUser._id, t])

  useEffect(() => {
    (async () => {
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

  return (<CurrentUserContext.Provider value={activeUser}>
    <section className={styles.section}>
      <h1>{t('workspace.title')}</h1>
      <div>
        <Field className={styles.searchField} type="text"
               icon={Search}
               value={filter}
               placeholder={t('search.placeholder')}
               onChange={(e) => setFilter(e.target.value)}/>
      </div>
      <Button primary={true} onClick={() => setCreating(true)}>{t('workspace.createNew.button')}</Button>
      {creating && <CreateWorkspace onCancel={handleCreateCancel}/>}
      <ul className={styles.workspacesList}>
        {[personalWorkspace, ...workspaces].map((workspace) => (
          <li key={`workspace-${workspace._id}`}>
            <WorkspaceItem workspace={workspace}/>
          </li>
        ))}
      </ul>
    </section>
  </CurrentUserContext.Provider>)
}
