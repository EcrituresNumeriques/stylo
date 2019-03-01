import React, {useState} from 'react'

import styles from '../write.module.scss'

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

        </div>
        </>}
      </nav>
  )
}