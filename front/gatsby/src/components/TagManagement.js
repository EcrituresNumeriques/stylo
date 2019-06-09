import React, {useState} from "react"

import styles from './tagManagement.module.scss'
import CreateTag from './CreateTag'
export default (props) => {

  const findAndUpdateTag = (tags,id)=> {
    console.log("test")
    const immutableTags = JSON.parse(JSON.stringify(tags))
    const tag = immutableTags.find(t => t._id === id)
    tag.selected = !tag.selected
    return immutableTags
  }

  const [creatingTag, setCreatingTag] = useState(false)
    

  return(
    <nav className={props.focus?styles.expandleft:styles.retractleft}>
      <div>
        <button onClick={props.close}>X</button>

        {creatingTag &&  <CreateTag articles={props.articles} triggerReload={()=>{setCreatingTag(false);props.setNeedReload()}}/>}
        <p className={styles.button} onClick={()=>setCreatingTag(!creatingTag)}>{creatingTag? 'Cancel new Tag' : 'Create new Tag'}</p>



      {props.tags.map((t)=>(
        <p className={t.selected?styles.selectedTags:styles.tags} key={`tagy-${t._id}`} onClick={()=>props.setTags(findAndUpdateTag(props.tags,t._id))}>{t.name}</p>
      ))}
      </div>
    </nav>
  )
}