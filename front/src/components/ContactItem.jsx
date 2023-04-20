import React, { useCallback, useState } from 'react'
import { CheckSquare, Square, User, UserCheck } from 'react-feather'

import styles from './ContactItem.module.scss'
import Button from './Button.jsx'
import clsx from 'clsx'

export default function ContactItem (
  {
    user,
    muted = false,
    active = false,
    selected = false,
    selectedIcon = <CheckSquare/>,
    unselectedIcon = <Square/>,
    onUserUpdated = () => {
    }
  }
) {

  const [activeState, setActiveState] = useState(active)
  const [selectedState, setSelectedState] = useState(selected)

  const handleSelect = useCallback((user) => {
    const value = !selectedState
    setSelectedState(value)
    onUserUpdated({ user, action: value ? 'select' : 'unselect' })
  }, [selectedState])

  const handleActive = useCallback((user) => {
    const value = !activeState
    setActiveState(value)
    onUserUpdated({ user, action: value ? 'active' : 'inactive' })
  }, [activeState])

  const displayName = user.displayName || user.username

  return (
    <div key={`contact-${user._id}`} className={clsx(styles.contact, muted ? styles.muted : '')} aria-disabled={muted}
         title={muted ? 'Aucun utilisateur trouvé pour cette adresse email' : displayName}>
      <div className={styles.info}>
        {!muted && <span>{displayName}</span>}
        {user.email && <a href={'mailto:' + user.email} className={styles.contactEmail}>{user.email}</a>}
      </div>
      <div className={clsx(styles.status, activeState ? styles.active : styles.inactive)}>
        <Button toggle={true} disabled={muted} onClick={() => handleActive(user)} icon={true}>
          {activeState ? <UserCheck/> : <User/>}
        </Button>
      </div>
      <div className={styles.select}>
        <Button toggle={true} disabled={muted} onClick={() => handleSelect(user)} icon={true}>
          {selectedState ? selectedIcon : unselectedIcon}
        </Button>
      </div>
    </div>
  )
}
