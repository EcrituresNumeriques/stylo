import React, {useState,useEffect} from 'react'
import { Link } from 'gatsby'
import styles from '../write.module.scss'

import etv from '../../helpers/eventTargetValue'
import howLongAgo from '../../helpers/howLongAgo';


export default (props) => {
  const [expand,setExpand] = useState(true)
  const [versions, setVersions] = useState(props.versions)
  const [message,setMessage] = useState('')
  const [lastSave, setLastSave] = useState(new Date(props.versions[0].updatedAt))
  const [savedAgo, setSavedAgo] = useState('now')

  useEffect(() => {
    var timerID = setInterval( () => tick(), 1000 );
    return function cleanup() {
        clearInterval(timerID);
      };
  });
  function tick() {
    const timeDifference = new Date() - lastSave
    setSavedAgo( howLongAgo(timeDifference) );
  }

  
  const saveVersion = async (e,major = false) => {
    e.preventDefault()
    setLastSave(new Date())
    setMessage('')
    const newVersion = await props.sendVersion(false,major, message)
    console.log(newVersion.saveVersion);
    setVersions([newVersion.saveVersion,...versions])

    //Need retrigger atm, but should not be (can ask graphQL here for new things, or wait for the answer from sendVersion)
    //props.triggerReload()
  }


  return (
    
    <section>
      <h1 className={expand?null:styles.closed} onDoubleClick={()=>setExpand(!expand)}>Versions</h1>
      {expand && <>
        <ul>
          {props.readOnly && <li key={`showVersion-GoLive`}><Link to={`/article/${props.article._id}`}>Go live</Link></li>}
          {!props.readOnly && <p>Last save: {savedAgo}</p>}
          {!props.readOnly && <form className={styles.liveVersion} onSubmit={e=>saveVersion(e,false)}>
            <input type="text" placeholder="Label of the version" value={message} onChange={(e)=>setMessage(etv(e))}/>
            <button className={message?styles.primary:styles.secondary} onClick={e=>saveVersion(e,false)}>Save Minor</button>
            <button className={message?styles.primary:styles.secondary} onClick={e=>saveVersion(e,true)}>Save Major</button>
          </form>}
          {versions.map(v=><li key={`showVersion-${v._id}`}><Link to={`/article/${props.article._id}/version/${v._id}`}>{v.message?v.message:'No label'} ({v.autosave?'autosaved ':null}{v.version}.{v.revision})</Link></li>)}
        </ul>
      </>}
    </section>
  )
}