import React from 'react'
import { NavLink } from 'react-router'

import { useWorkspaces } from '../../hooks/workspace.js'

import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'

import styles from '../header.module.scss'
import { usePreferenceItem } from '../../hooks/user.js'

export default function WorkspacesMenu({ activeTool }) {
  const { workspaces, error, isLoading } = useWorkspaces()
  const { setValue: setActiveWorkspaceId } = usePreferenceItem('workspaceId', 'user')

  if (isLoading) {
    return <Loading />
  }
  if (error) {
    return <Alert Alert={error.message} />
  }
  return (
    <>
      {workspaces.map((workspace) => (
        <li key={workspace._id}>
          <NavLink
            to={`/workspaces/${workspace._id}/${activeTool}`}
            onClick={() => setActiveWorkspaceId(workspace._id)}
            state={{ from: location.pathname }}
          >
            <span
              className={styles.chip}
              style={{ backgroundColor: workspace.color }}
            />

            {workspace.name}
          </NavLink>
        </li>
      ))}
    </>
  )
}
