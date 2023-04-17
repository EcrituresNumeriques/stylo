import React from 'react'
import PropTypes from 'prop-types'

import WorkspaceLabel from '../workspace/WorkspaceLabel.jsx'
import styles from './UserMenuLink.module.scss'
import { User } from 'react-feather'

export default function UserMenuLink ({ username, activeWorkspace }) {
  return <>
    <div className={styles.container}>
      <User className={styles.icon} size={20}/>
      <div className={styles.username}>{username}</div>
      {activeWorkspace && <WorkspaceLabel className={styles.workspaceLabel} color={activeWorkspace.color} name={activeWorkspace.name}/>}
    </div>
  </>
}

UserMenuLink.propTypes = {
  username: PropTypes.string.isRequired,
  activeWorkspace: PropTypes.shape({
    color: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })
}
