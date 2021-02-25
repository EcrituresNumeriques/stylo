import React from 'react'
import styles from './credentialsUserSelect.module.scss'
import UserInfos from './UserInfos'
import Button from "./Button";

export default (props) => {
  const isDefault = props.users[0]._id === props.u._id
  const isSelected = props.activeUser._id === props.u._id
  return (
    <li className={styles.list} id={isSelected ? styles.selected : null}>
      {props.u.displayName} ({props.u.email})
      {isDefault && <span> [Default account]</span>}
      {isSelected && <span> [Active account]</span>}
      {!isSelected && (
        <Button onClick={() => props.switchUser(props.u)}>Use</Button>
      )}
      {!isDefault && !isSelected && (
        <Button
          onClick={() => {
            props.switchUser(props.u)
            props.setDefault(props.u._id)
          }}
        >
          Set as default and use
        </Button>
      )}
      {!isDefault && isSelected && (
        <Button
          onClick={() => {
            props.setDefault(props.u._id)
          }}
        >
          Set as default
        </Button>
      )}
      {isSelected && <UserInfos />}
    </li>
  )
}
