import React, {useState} from 'react'

import styles from '../write.module.scss'

export default (props) => {

  const [expanded,setExpanded] = useState(true)
  const [expandVersions,setExpandVersions] = useState(true)
  const [expandSommaire,setExpandSommaire] = useState(true)
  const [expandBiblio,setExpandBiblio] = useState(true)
  const [expandStats,setExpandStats] = useState(true)

  let value = props.live.md || "";
  let regex = /\s+/gi;
  let citation = /\[@[\w-]+/gi;
  let noMarkDown = /[#_*]+\s?/gi;
  let wordCount = value.trim().replace(noMarkDown, '').replace(regex, ' ').split(' ').length;
  let charCountNoSpace = value.replace(noMarkDown, '').replace(regex, '').length;
  let charCountPlusSpace = value.replace(noMarkDown, '').length;
  let citationNb = value.replace(regex,'').replace(citation,' ').split(' ').length-1;

  
  return (
    <nav className={`${expanded?styles.expandleft:styles.retractleft}`}>
        <nav onClick={()=>setExpanded(!expanded)} className={expanded?styles.close:styles.open}>{expanded?'close':'open'}</nav>
        {expanded && <>
        <div>
          <header>
            <h1>{props.article.title}</h1>
            <h2>by {props.article.owners.join(', ')}</h2>
          </header>
          <section>
            <h1 className={expandVersions?null:styles.closed} onDoubleClick={()=>setExpandVersions(!expandVersions)}>Versions</h1>
            {expandVersions && <ul>
              {props.versions.map(v=>(<li>{JSON.stringify(v, null, 1)}</li>))}
            </ul>}
          </section>
          <section>
            <h1 className={expandSommaire?null:styles.closed} onDoubleClick={()=>setExpandSommaire(!expandSommaire)}>Sommaire</h1>
            {expandSommaire && <p>{props.live.sommaire}</p>}
          </section>
          <section>
            <h1 className={expandBiblio?null:styles.closed} onDoubleClick={()=>setExpandBiblio(!expandBiblio)}>Biblio</h1>
            {expandBiblio && <><p>hello</p>
            </>}
          </section>
          <section>
            <h1 className={expandStats?null:styles.closed} onDoubleClick={()=>setExpandStats(!expandStats)}>Stats</h1>
            {expandStats && <>
                <p>Words : {wordCount}</p>
                <p>Characters : {charCountNoSpace}</p>
                <p>Characters (with spaces) : {charCountPlusSpace}</p>
                <p>Citations : {citationNb}</p>
            </>}
          </section>
        </div>
        </>}
      </nav>
  )
}