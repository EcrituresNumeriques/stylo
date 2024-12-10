import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { Layers, LogOut, User } from 'react-feather'

import useComponentVisible from '../../hooks/componentVisible'
import styles from './UserMenu.module.scss'
import Button from '../Button.jsx'
import WorkspaceMenuItem from '../workspace/WorkspaceMenuItem.jsx'
import UserMenuLink from './UserMenuLink.jsx'

export default function UserMenu() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const logout = () => {
    setIsComponentVisible(false)
    dispatch({ type: 'LOGOUT' })
  }
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false)
  const activeUser = useSelector((state) => state.activeUser)
  const activeWorkspace = activeUser.workspaces.find(
    (workspace) => workspace._id === activeUser.activeWorkspaceId
  )

  useEffect(() => {
    setIsComponentVisible(false)
  }, [activeUser.activeWorkspaceId])

  return (
    <div ref={ref} className={styles.container}>
      <div
        className={styles.userMenuLink}
        aria-label={t('header.manage')}
        tabIndex={0}
        onClick={() => setIsComponentVisible(!isComponentVisible)}
      >
        <UserMenuLink
          username={activeUser.displayName}
          activeWorkspace={activeWorkspace}
        />
      </div>
      {isComponentVisible && (
        <div className={styles.menu}>
          <div className={styles.workspaces}>
            <h4>{t('workspace.menu.title')}</h4>
            <ul>
              <WorkspaceMenuItem
                color="#D9D9D9"
                name={t('workspace.myspace')}
              />
              {activeUser.workspaces.map((workspace) => (
                <WorkspaceMenuItem
                  id={workspace._id}
                  key={workspace._id}
                  color={workspace.color}
                  name={workspace.name}
                />
              ))}
              <li className={styles.workspacesLink}>
                <NavLink
                  to="/workspaces"
                  onClick={() => setIsComponentVisible(false)}
                >
                  <Layers role="presentation" /> {t('workspace.all')}
                </NavLink>
              </li>
            </ul>
          </div>
          <div className={styles.footer}>
            <div className={styles.userBlock}>
              <NavLink
                to="/credentials"
                onClick={() => setIsComponentVisible(false)}
                className={styles.userCard}
                aria-label={t('credentials.manage')}
              >
                <div className={styles.persona}>
                  <User role="presentation" />
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.username}>
                    {activeUser.displayName}
                  </div>
                  <div className={styles.email}>{activeUser.email}</div>
                </div>
              </NavLink>
              <Button className={styles.logoutButton} onClick={logout} link>
                <LogOut
                  size={22}
                  aria-label={t('credentials.logout.confirmButton')}
                />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
