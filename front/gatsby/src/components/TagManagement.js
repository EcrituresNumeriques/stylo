import React, {useState} from "react"

import styles from './tagManagement.module.scss'
import CreateTag from './CreateTag'
import TagManagementSolo from "./TagManagementSolo";
export default (props) => {



  const [creatingTag, setCreatingTag] = useState(false)
    

  return(
    <nav className={props.focus?styles.expandleft:styles.retractleft}>
      <div>
        <button onClick={props.close}>X</button>

        {creatingTag &&  <CreateTag articles={props.articles} triggerReload={()=>{setCreatingTag(false);props.setNeedReload()}}/>}
        <p className={styles.button} onClick={()=>setCreatingTag(!creatingTag)}>{creatingTag? 'Cancel new Tag' : 'Create new Tag'}</p>



      {props.tags.map((t)=>(
        <TagManagementSolo {...props} t={t} styles={styles} key={"thistag"+t._id}/>
      ))}
      </div>
    </nav>
  )
}