import React, {useState, useEffect} from "react"

import { Link } from 'gatsby'

import styles from "./edit.module.scss"

import etv from '../../helpers/eventTargetValue'
import howLongAgo from '../../helpers/howLongAgo';
import env from '../../helpers/env'

import Modal from '../Modal'
import Export from '../Export'


// composant minimum
export default props => {

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
  const [savedAgo, setSavedAgo] = useState(howLongAgo(new Date() - new Date(props.versions[0].updatedAt)))
  const [exporting, setExporting] = useState(false)
  const [exportVar, setExportVar] = useState(expVar)

  const saveVersion = async (e,major = false) => {
    e.preventDefault()
    const newVersion = await props.sendVersion(false,major, message)
    setMessage('')
    //setVersions([newVersion.saveVersion,...versions])
  }

  useEffect(() => {
    console.log("refresh")
    var timerID = setInterval( () => tick(props.versions[0].updatedAt), 1000 );
    return function cleanup() {
        clearInterval(timerID);
      };
  },[props.versions]);


  function tick(date) {
    const timeDifference = new Date() - new Date(date)
    setSavedAgo( howLongAgo(timeDifference) );
  }


  return (
        <section id={styles.section}>
          {exporting && <Modal cancel={()=>setExporting(false)}>
            <Export {...exportVar} />
          </Modal>}
          <h1 className={expand?null:styles.closed} onClick={()=>setExpand(!expand)}>{expand?"-":"+"} Edition</h1>
          {expand && <>
              {props.readOnly && <li key={`showVersion-GoLive`}><Link to={`/article/${props.article._id}`}>Edit</Link></li>}
              {!props.readOnly && <nav><p onClick={()=>{setExportVar({...exportVar,article:true,_id:props.article._id,versionId:props.versions[0]._id,    version:props.versions[0].version,    revision:props.versions[0].revision});setExporting(true)}} className={styles.button}>Export</p><a href={`https://via.hypothes.is/${env.EXPORT_ENDPOINT}/api/v1/htmlArticle/${props.article._id}?preview=true`} target="_blank" rel="noopener noreferrer" className={styles.button}>preview</a></nav>}
              {!props.readOnly && <p>Edition - Last save: {savedAgo}</p>}
              
              {!props.readOnly && <form className={styles.liveVersion} onSubmit={e=>saveVersion(e,false)}>
                <input type="text" placeholder="Label of the version" value={message} onChange={(e)=>setMessage(etv(e))}/>
                <button className={message?styles.primary:styles.secondary} onClick={e=>saveVersion(e,false)}>Save Minor</button>
                <button className={message?styles.primary:styles.secondary} onClick={e=>saveVersion(e,true)}>Save Major</button>
              </form>}</>}
        </section>
  )
  }
