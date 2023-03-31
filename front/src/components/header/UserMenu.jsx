import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {ArrowRight, ChevronRight, Layers, LifeBuoy, LogOut, User} from 'react-feather'
import clsx from 'clsx'

import useComponentVisible from '../../hooks/componentVisible'
import styles from './UserMenu.module.scss'
import Button from '../Button.jsx'


function UserMenu () {
  const dispatch = useDispatch()
  const logout = () => {
    setIsComponentVisible(false)
    dispatch({ type: 'LOGOUT' })
  }
  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false)
  const activeUser = useSelector(state => state.activeUser)

  return (
    <div ref={ref} className={styles.container}>
      <div className={styles.link} onClick={() => setIsComponentVisible(!isComponentVisible)}>
        <User className={styles.linkIcon} size={20}/>
        {activeUser.displayName}
        {/* todo: show current workspace */}
      </div>
      {isComponentVisible && <div className={styles.menu}>
        <div className={styles.workspaces}>
          <h4>Espaces de travail</h4>
          <ul>
            <li className={clsx(styles.workspaceItem, styles.workspaceSelected)}><span className={styles.chip} style={{backgroundColor: "#D9D9D9"}}/> <span className={styles.workspaceName}>Mon espace</span> <ChevronRight className={styles.chevron}/></li>
            <li className={clsx(styles.workspaceItem)}><span className={styles.chip} style={{backgroundColor: "#D9D9D9"}}/> <span className={styles.workspaceName}>Sens public</span> <ChevronRight className={styles.chevron}/></li>
            <li className={styles.workspaceItem}><span className={styles.chip} style={{backgroundColor: "#D9D9D9"}}/><span className={styles.workspaceName}>Chaire de l&rsquo;université</span> <ChevronRight className={styles.chevron}/></li>
            <li className={styles.workspacesLink}><a><Layers/> Tous les espaces</a></li>
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
              <LogOut className={styles.linkIcon} size={22}/>
            </Button>
          </div>
        </div>
      </div>}
      <a className={styles.documentationLink}
         href="http://stylo-doc.ecrituresnumeriques.ca"
         target="_blank"
         rel="noopener noreferrer"
      >
        <LifeBuoy size={16}/>
        Documentation
      </a>
    </div>
  )
}

export default UserMenu
