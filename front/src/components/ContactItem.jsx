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
    onUserUpdated = () => {
    }
  }
) {

  const [activeState, setActiveState] = useState(active)
  const [selectedState, setSelectedState] = useState(selected)

  const handleSelect = useCallback((userId) => {
    const value = !selectedState
    setSelectedState(value)
    onUserUpdated({ userId, action: value ? 'select' : 'unselect' })
  }, [selectedState])

  const handleActive = useCallback((userId) => {
    const value = !activeState
    setActiveState(value)
    onUserUpdated({ userId, action: value ? 'active' : 'inactive' })
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
        <Button toggle={true} disabled={muted} onClick={() => handleActive(user._id)} icon={true}>
          {activeState ? <UserCheck/> : <User/>}
        </Button>
      </div>
      <div className={styles.select}>
        <Button toggle={true} disabled={muted} onClick={() => handleSelect(user._id)} icon={true}>
          {selectedState ? <CheckSquare/> : <Square/>}
        </Button>
      </div>
    </div>
  )
}
