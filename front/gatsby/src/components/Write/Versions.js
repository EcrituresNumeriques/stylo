import React, {useState,useEffect} from 'react'
import { Link } from 'gatsby'
import styles from '../write.module.scss'

import etv from '../../helpers/eventTargetValue'
import howLongAgo from '../../helpers/howLongAgo';

import Modal from '../Modal'
import Export from '../Export'

export default (props) => {

  //Default if live
  let expVar = {
    article:true,
    _id:props.article._id,
    title:props.article.title,
    versionId:props.versions[0]._id,
    version:props.versions[0].version,
    revision:props.versions[0].revision
  }
  //if not live, set the export variable
  if(props.readOnly){
    expVar = {...expVar,
      article:false,
      _id:props._id,
      versionId:props._id,
      version:props.version,
      revision:props.revision
    }
  }



  const [expand,setExpand] = useState(true)
  const [message,setMessage] = useState('')
  const [savedAgo, setSavedAgo] = useState('now')
  const [exporting, setExporting] = useState(false)
  const [exportVar, setExportVar] = useState(expVar)

  useEffect(() => {
    var timerID = setInterval( () => tick(props.versions[0].updatedAt), 1000 );
    return function cleanup() {
        clearInterval(timerID);
      };
  },[props.versions]);
  function tick(date) {
    const timeDifference = new Date() - new Date(date)
    setSavedAgo( howLongAgo(timeDifference) );
  }

  
  const saveVersion = async (e,major = false) => {
    e.preventDefault()
    const newVersion = await props.sendVersion(false,major, message)
    setMessage('')
    //setVersions([newVersion.saveVersion,...versions])
  }


  return (
    
    <section>
      <h1 className={expand?null:styles.closed} onDoubleClick={()=>setExpand(!expand)}>Versions</h1>
      {exporting && <Modal cancel={()=>setExporting(false)}>
            <Export {...exportVar} />
        </Modal>}
      {expand && <>
        <ul>
          {props.readOnly && <li key={`showVersion-GoLive`}><Link to={`/article/${props.article._id}`}>Go live</Link></li>}
          {!props.readOnly && <p>Last save: {savedAgo}</p>}
          {!props.readOnly && <><p onClick={()=>{setExportVar({...exportVar,article:true,_id:props.article._id,versionId:props.versions[0]._id,    version:props.versions[0].version,    revision:props.versions[0].revision});setExporting(true)}}>Export</p><p>preview</p></>}
          {!props.readOnly && <form className={styles.liveVersion} onSubmit={e=>saveVersion(e,false)}>
            <input type="text" placeholder="Label of the version" value={message} onChange={(e)=>setMessage(etv(e))}/>
            <button className={message?styles.primary:styles.secondary} onClick={e=>saveVersion(e,false)}>Save Minor</button>
            <button className={message?styles.primary:styles.secondary} onClick={e=>saveVersion(e,true)}>Save Major</button>
          </form>}
          {props.versions.map(v=><li key={`showVersion-${v._id}`}><Link to={`/article/${props.article._id}/version/${v._id}`}>{v.message?v.message:'No label'} ({v.autosave?'autosaved ':null}{v.version}.{v.revision})</Link>
          <p onClick={()=>{setExportVar({...exportVar,article:false,_id:v._id,versionId:v._id,version:v.version,    revision:v.revision});setExporting(true)}}>export</p><p>preview</p></li>)}
        </ul>
      </>}
    </section>
  )
}