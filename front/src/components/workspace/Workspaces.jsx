import React, { useCallback, useEffect, useState } from 'react'
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
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const [filter, setFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [workspaces, setWorkspaces] = useState([])
  const currentWorkspaces = useSelector((state) => state.workspaces)
  const personalWorkspace = {
    _id: activeUser._id,
    name: 'Mon espace',
    color: '#D9D9D9',
    createdAt: activeUser.createdAt,
    updatedAt: activeUser.updatedAt,
    members: [],
    articles: activeUser.articles || [],
    personal: true
  }
  const handleCreateCancel = useCallback(() => setCreating(false), [creating])
  const runQuery = useGraphQL()

  useEffect(() => {
    (async () => {
      try {
        const getArticlesResponse = await runQuery({ query: getArticles })
        const getWorkspacesResponse = await runQuery({ query: getWorkspaces })
        const workspaces = getWorkspacesResponse.workspaces
        personalWorkspace.articles = getArticlesResponse.user.articles
        setWorkspaces([personalWorkspace, ...workspaces])
        setCreating(false)
      } catch (err) {
        alert(err)
      }
    })()
  }, [activeUser._id, currentWorkspaces])

  return (<CurrentUserContext.Provider value={activeUser}>
    <section className={styles.section}>
      <h1>Espaces de travail</h1>
      <div>
        <Field className={styles.searchField} type="text"
               icon={Search}
               value={filter}
               placeholder="Recherche"
               onChange={(e) => setFilter(e.target.value)}/>
      </div>
      <Button primary={true} onClick={() => setCreating(true)}>Créer un nouvel espace</Button>
      {creating && <CreateWorkspace onCancel={handleCreateCancel}/>}
      <ul className={styles.workspacesList}>
        {workspaces.map((workspace) => (
          <li key={`workspace-${workspace._id}`}>
            <WorkspaceItem workspace={workspace}/>
          </li>
        ))}
      </ul>
    </section>
  </CurrentUserContext.Provider>)
}
