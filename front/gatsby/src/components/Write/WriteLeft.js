import React, {useState} from 'react'

import styles from './writeLeft.module.scss'
import Stats from './Stats'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'

export default (props) => {

  const [expanded,setExpanded] = useState(true)


  
  return (
    <nav className={`${expanded?styles.expandleft:styles.retractleft}`}>
        <nav onClick={()=>setExpanded(!expanded)} className={expanded?styles.close:styles.open}>{expanded?'close':'open'}</nav>
        {expanded && <>
        <div>
          <header>
            <h1>{props.article.title}</h1>
            <h2>by {props.article.owners.join(', ')}</h2>
          </header>
          <Versions {...props}/>
          <Sommaire {...props} />
          <Biblio {...props} />
          <Stats md={props.md}/>
        </div>
        </>}
      </nav>
  )
}