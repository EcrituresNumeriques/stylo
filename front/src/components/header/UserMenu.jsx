import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Layers, LogOut, User } from 'lucide-react'

import { useLogout } from '../../hooks/user.js'
import useComponentVisible from '../../hooks/componentVisible'
import { useActiveWorkspace } from '../../hooks/workspace.js'

import Button from '../Button.jsx'
import WorkspaceMenuItem from '../workspace/WorkspaceMenuItem.jsx'
import UserMenuLink from './UserMenuLink.jsx'

import styles from './UserMenu.module.scss'

export default function UserMenu() {
  const { t } = useTranslation()
  const logout = useLogout()

  const handleLogout = useCallback(() => {
    setIsComponentVisible(false)
    logout().then()
  }, [])

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false)
  const activeUser = useSelector((state) => state.activeUser)
  const activeWorkspace = useActiveWorkspace()

  useEffect(() => {
    setIsComponentVisible(false)
  }, [activeWorkspace])

  return (
    <div ref={ref} className={styles.container}>
      <div
        className={styles.userMenuLink}
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
                <Link
                  to="/workspaces"
                  onClick={() => setIsComponentVisible(false)}
                >
                  <Layers />
                  {t('workspace.all')}
                </Link>
              </li>
            </ul>
          </div>
          <div className={styles.footer}>
            <div className={styles.userBlock}>
              <Link
                to="/credentials"
                onClick={() => setIsComponentVisible(false)}
                className={styles.userCard}
              >
                <div className={styles.persona}>
                  <User />
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.username}>
                    {activeUser.displayName}
                  </div>
                  <div className={styles.email}>{activeUser.email}</div>
                </div>
              </Link>
              <Button
                className={styles.logoutButton}
                onClick={handleLogout}
                aria-label={t('credentials.logout.confirmButton')}
                link
              >
                <LogOut size={22} aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
