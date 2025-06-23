import React from 'react'
import { NavLink } from 'react-router'

import { useWorkspaces } from '../../hooks/workspace.js'

import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'

import styles from '../header.module.scss'

export default function WorkspacesMenu({ activeTool }) {
  const { workspaces, error, isLoading } = useWorkspaces()
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
