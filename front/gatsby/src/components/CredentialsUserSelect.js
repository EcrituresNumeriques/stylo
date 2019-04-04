import React from 'react'
import styles from './credentialsUserSelect.module.scss'

export default props => {
  const isDefault = props.users[0]._id === props.u._id
  const isSelected = props.activeUser._id === props.u._id
  return(
    <li className={styles.list} id={isSelected?styles.selected:null}>
    {props.u.displayName}
    {isDefault && <span> [Default user]</span> }
    {isSelected && <span> [Active user]</span> }
    {!isSelected && <button onClick={()=>props.switchUser(props.u)}>Use</button>}
    {!isDefault && !isSelected && <button onClick={()=>{
        props.switchUser(props.u);
        props.setDefault(props.u._id)
        }
      }>Set as default and use</button>}
    {!isDefault && isSelected && <button onClick={()=>{
        props.setDefault(props.u._id)
        }
      }>Set as default</button>}
    </li>
  )
}