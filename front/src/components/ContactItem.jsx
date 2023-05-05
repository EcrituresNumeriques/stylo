import React, { useCallback, useState, useEffect } from 'react'
import { CheckSquare, Square, User, UserCheck } from 'react-feather'

import styles from './ContactItem.module.scss'
import Button from './Button.jsx'
import clsx from 'clsx'

export default function ContactItem (
  {
    user,
    muted = false,
    disabled = false,
    active,
    selected,
    selectedIcon = <CheckSquare/>,
    unselectedIcon = <Square/>,
    onUserUpdated = () => {
    }
  }
) {

  const [activeState, setActiveState] = useState(false)
  const [selectedState, setSelectedState] = useState(false)

  useEffect(() => {
    setActiveState(active)
  }, [active])

  useEffect(() => {
    setSelectedState(selected)
  }, [selected])

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
    <div key={`contact-${user._id}`}
         className={clsx(styles.contact, muted ? styles.muted : '', disabled ? styles.disabled : '')}
         aria-disabled={muted || disabled}
         title={muted ? 'Aucun utilisateur trouvé pour cette adresse email' : displayName}>
      <div className={styles.info}>
        {!muted && <span>{displayName}</span>}
        {(!disabled && user.email) && <a href={'mailto:' + user.email} className={styles.contactEmail}>{user.email}</a>}
      </div>
      {!disabled &&
        <div className={clsx(styles.status, activeState ? styles.active : styles.inactive)}>
          <Button toggle={true} disabled={muted} onClick={() => handleActive(user)} icon={true}>
            {activeState ? <UserCheck/> : <User/>}
          </Button>
        </div>
      }
      <div className={styles.select}>
        <Button toggle={true} disabled={muted || disabled} onClick={() => handleSelect(user)} icon={true}>
          {selectedState ? selectedIcon : unselectedIcon}
        </Button>
      </div>
    </div>
  )
}
