import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Layers, LogOut, User } from 'react-feather'

import useComponentVisible from '../../hooks/componentVisible'
import styles from './UserMenu.module.scss'
import Button from '../Button.jsx'
import WorkspaceMenuItem from './WorkspaceMenuItem.jsx'
import UserMenuLink from './UserMenuLink.jsx'


export default function UserMenu () {
  const dispatch = useDispatch()
  const logout = () => {
    setIsComponentVisible(false)
    dispatch({ type: 'LOGOUT' })
  }
  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false)
  const activeUser = useSelector(state => state.activeUser)
  const activeWorkspace = activeUser.workspaces.find((workspace) => workspace._id === activeUser.activeWorkspaceId)

  useEffect(() => {
    setIsComponentVisible(false)
  }, [activeUser.activeWorkspaceId])

  return (
    <div ref={ref} className={styles.container}>
      <div className={styles.userMenuLink} onClick={() => setIsComponentVisible(!isComponentVisible)}>
        <UserMenuLink username={activeUser.displayName} activeWorkspace={activeWorkspace}/>
      </div>
      {isComponentVisible && <div className={styles.menu}>
        <div className={styles.workspaces}>
          <h4>Espaces de travail</h4>
          <ul>
            <WorkspaceMenuItem color="#D9D9D9" name="Mon espace"/>
            {activeUser.workspaces.map((workspace) => <WorkspaceMenuItem id={workspace._id} key={workspace._id} color={workspace.color} name={workspace.name} />)}
            <li className={styles.workspacesLink}><Link to="/workspaces" onClick={() => setIsComponentVisible(false)}><Layers/> Tous les espaces</Link></li>
          </ul>
        </div>
        <div className={styles.footer}>
          <div className={styles.userBlock}>
            <Link to="/credentials" onClick={() => setIsComponentVisible(false)} className={styles.userCard}>
              <div className={styles.persona}><User/></div>
              <div className={styles.userInfo}>
                <div className={styles.username}>{activeUser.displayName}</div>
                <div className={styles.email}>{activeUser.email}</div>
              </div>
            </Link>
            <Button className={styles.logoutButton} onClick={logout} link>
              <LogOut size={22}/>
            </Button>
          </div>
        </div>
      </div>}
    </div>
  )
}
