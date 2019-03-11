import React, {useState,useEffect} from 'react'
import { Link } from 'gatsby'
import styles from '../write.module.scss'

import etv from '../../helpers/eventTargetValue'
import howLongAgo from '../../helpers/howLongAgo';
import env from '../../helpers/env'

import Modal from '../Modal'
import Export from '../Export'

Date.prototype.getUTCMinutesDoubleDigit = function(){
  if(this.getUTCMinutes() < 10){
    return "0"+this.getUTCMinutes()
  }
  return this.getUTCMinutes()
}
Date.prototype.getUTCHoursDoubleDigit = function(){
  if(this.getUTCHours() < 10){
    return "0"+this.getUTCHours()
  }
  return this.getUTCHours()
}
Date.prototype.getUTCMonthDoubleDigit = function(){
  if(this.getUTCMonth()+1 < 9){
    return "0"+Number(this.getUTCMonth()+1)
  }
  return Number(this.getUTCMonth()+1)
}
Date.prototype.getUTCDateDoubleDigit = function(){
  if(this.getUTCDate() < 10){
    return "0"+this.getUTCDate()
  }
  return this.getUTCDate()
}

Date.prototype.formatMMDDYYYY = function(){
  return (
    this.getUTCHoursDoubleDigit() +
    ":" + this.getUTCMinutesDoubleDigit() +
    "utc " +  this.getUTCDateDoubleDigit() +
    "/" +  this.getUTCMonthDoubleDigit() + 
    "/" +  this.getFullYear()
  )
}

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
          {!props.readOnly && <><p onClick={()=>{setExportVar({...exportVar,article:true,_id:props.article._id,versionId:props.versions[0]._id,    version:props.versions[0].version,    revision:props.versions[0].revision});setExporting(true)}} className={styles.button}>Export</p><a href={`${env.EXPORT_ENDPOINT}/htmlArticle/${props.article._id}?preview=true`} target="_blank" rel="noopener noreferrer" className={styles.button}>preview</a></>}
          {!props.readOnly && <form className={styles.liveVersion} onSubmit={e=>saveVersion(e,false)}>
            <input type="text" placeholder="Label of the version" value={message} onChange={(e)=>setMessage(etv(e))}/>
            <button className={message?styles.primary:styles.secondary} onClick={e=>saveVersion(e,false)}>Save Minor</button>
            <button className={message?styles.primary:styles.secondary} onClick={e=>saveVersion(e,true)}>Save Major</button>
          </form>}
          {props.versions.map(v=><li key={`showVersion-${v._id}`}><Link to={`/article/${props.article._id}/version/${v._id}`}>{v.message?v.message:'No label'} ({v.autosave?'autosaved ':null}{v.version}.{v.revision})</Link>
          <p>
            {v.owner && <span>by <strong>{v.owner.displayName}</strong> </span>}
            <span>at {new Date(v.updatedAt).formatMMDDYYYY()}</span>
            </p>
          <nav> <p onClick={()=>{setExportVar({...exportVar,article:false,_id:v._id,versionId:v._id,version:v.version,    revision:v.revision});setExporting(true)}}>export</p><a href={`${env.EXPORT_ENDPOINT}/htmlVersion/${v._id}?preview=true`} target="_blank" rel="noopener noreferrer">preview</a></nav></li>)}
        </ul>
      </>}
    </section>
  )
}