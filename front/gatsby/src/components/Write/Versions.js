import React, {useState} from 'react'
import { Link } from 'gatsby'
import styles from '../write.module.scss'


export default (props) => {
  const [expand,setExpand] = useState(true)

  return (
    
    <section>
      <h1 className={expand?null:styles.closed} onDoubleClick={()=>setExpand(!expand)}>Versions</h1>
      {expand && <>
        <ul>
          <li key={`showVersion-GoLive`}><Link to={`/article/${props.article}`}>Go live</Link></li>
          {props.versions.map(v=><li key={`showVersion-${v._id}`}><Link to={`/article/${props.article}/version/${v._id}`}>{v.message?v.message:'No label'} ({v.autosave?'autosaved ':null}{v.version}.{v.revision})</Link></li>)}
        </ul>
      </>}
    </section>
  )
}