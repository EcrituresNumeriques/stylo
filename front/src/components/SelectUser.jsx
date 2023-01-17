import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users } from 'react-feather'

import Select from './Select'

import styles from './articles.module.scss'
import buttonStyles from './button.module.scss'
import clsx from 'clsx'

export default function SelectUser ({ accounts }) {
  const dispatch = useDispatch()

  const currentUserId = useSelector(state => state.userPreferences.currentUser ?? state.activeUser._id)
  const setCurrentUserId = useCallback((userId) => dispatch({ type: 'USER_PREFERENCES_TOGGLE', key: 'currentUser', value: userId }), [])

  const handleCurrentUserChange = useCallback((event) => {
    setCurrentUserId(event.target.value)
  }, [currentUserId])

  return (<div className={styles.switchAccount}>
    <Users/>
    <Select className={clsx(styles.accountSelect, buttonStyles.select)} value={currentUserId} onChange={handleCurrentUserChange}>
      {accounts.map((userAccount) => <option key={`userAccount_${userAccount._id}`} value={userAccount._id}>
        {userAccount.displayName}
      </option>)}
    </Select>
  </div>)
}
