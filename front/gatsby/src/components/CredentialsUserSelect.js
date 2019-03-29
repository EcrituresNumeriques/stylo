import React from 'react'


export default props => {
  const isDefault = props.users[0]._id === props.u._id
  return(
    <li>{isDefault && <span>[Default user] </span> }
    {props.u.displayName}
    {props.activeUser._id !== props.u._id && <button onClick={()=>props.switchUser(props.u)}>Use</button>}
    {!isDefault && <button onClick={()=>props.switchUser(props.u)}>Set as default and use</button>}
    </li>
  )
}