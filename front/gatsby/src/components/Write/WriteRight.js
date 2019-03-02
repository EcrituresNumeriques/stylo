import React, {useState} from 'react'

import styles from '../write.module.scss'
import YamlEditor from './yamleditor/YamlEditor'

export default (props) => {

  const [expanded,setExpanded] = useState(false)
 
  return (
    <nav className={`${expanded?styles.expandRight:styles.retractRight}`}>
        <nav onClick={()=>setExpanded(!expanded)} className={expanded?styles.close:styles.open}>{expanded?'close':'Metadata'}</nav>
        {expanded && <>
        <div>
          <header>
            <h1>Metadata</h1>
          </header>
          {props.readOnly && <YamlEditor yaml={props.yaml}/>}
          {!props.readOnly && <YamlEditor yaml={props.yaml} exportChange={(change)=>console.log(change)}/>}

        </div>
        </>}
      </nav>
  )
}