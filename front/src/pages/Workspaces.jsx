import React, {useEffect, useState} from 'react'
import {shallowEqual, useSelector} from 'react-redux'
import {Search} from 'react-feather'

import {CurrentUserContext} from '../contexts/CurrentUser'

import styles from './workspaces.module.scss'
import Field from '../components/Field.jsx'

import Button from '../components/Button.jsx'
import WorkspaceItem from '../components/WorkspaceItem.jsx'
import {useGraphQL} from '../helpers/graphQL.js'
import {getWorkspaces,getArticles} from './Workspaces.graphql'

export default function Workspaces() {
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const [filter, setFilter] = useState('')
  const [workspaces, setWorkspaces] = useState([])
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

  const runQuery = useGraphQL()

  useEffect(() => {
    (async () => {
      try {
        const getArticlesResponse = await runQuery({query: getArticles})
        const getWorkspacesResponse = await runQuery({query: getWorkspaces})
        const workspaces = getWorkspacesResponse.workspaces
        personalWorkspace.articles = getArticlesResponse.user.articles
        setWorkspaces([personalWorkspace, ...workspaces])
      } catch (err) {
        alert(err)
      }
    })()
  }, [activeUser._id])

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
      <Button primary={true}>Créer un nouvel espace</Button>
      <ul className={styles.workspacesList}>
        {workspaces.map((workspace) => (
          <li key={`article-${workspace._id}`}>
            <WorkspaceItem workspace={workspace}/>
          </li>
        ))}
      </ul>
    </section>
  </CurrentUserContext.Provider>)
}
