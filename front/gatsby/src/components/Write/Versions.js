import React, {useState} from 'react'

import styles from '../write.module.scss'


export default (props) => {
  const [expand,setExpand] = useState(true)



  return (
    
    <section>
      <h1 className={expand?null:styles.closed} onDoubleClick={()=>setExpand(!expand)}>Versions</h1>
      {expand && <>
        <ul>
          {props.versions.map(v=><li key={`showVersion-${v._id}`}>{v.message?v.message:'No label'} ({v.autosave?'autosaved ':null}{v.version}.{v.revision})</li>)}
        </ul>
      </>}
    </section>
  )
}