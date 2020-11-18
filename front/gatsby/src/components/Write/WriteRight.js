import React, {useState} from 'react'

import styles from './writeRight.module.scss'
import YamlEditor from './yamleditor/YamlEditor'

import etv from '../../helpers/eventTargetValue'

export default (props) => {

  const [expanded,setExpanded] = useState(false)
  const [selector, setSelector] = useState('basic')
  const [error,setError] = useState("")
 
  return (
    <nav className={`${expanded?styles.expandRight:styles.retractRight}`}>
        <nav onClick={()=>setExpanded(!expanded)} className={expanded?styles.close:styles.open}>{expanded?'close':'Metadata'}</nav>
        {expanded && <>
        <div className={styles.yamlEditor}>
          <header>
            <h1>Metadata</h1>
          </header>
          <nav>
            <p className={selector==="basic"?styles.selected:null} onClick={(e)=>setSelector('basic')}>Basic Mode</p>
            <p className={selector==="editor"?styles.selected:null} onClick={(e)=>setSelector('editor')}>Editor Mode</p>
            <p className={selector==="raw"?styles.selected:null} onClick={(e)=>setSelector('raw')}>Raw Mode</p>
          </nav>
          {selector === "raw" && <>{error !== "" && <p className={styles.error}>{error}</p>}<textarea value={props.yaml} onChange={(e)=>props.handleYaml(etv(e))}/></>}
          {selector !== "raw" && props.readOnly && <YamlEditor yaml={props.yaml} editor={selector === "editor"} error={(reason)=>{setError(reason);if(reason !== ""){setSelector("raw")}}}/>}
          {selector !== "raw" && !props.readOnly && <YamlEditor yaml={props.yaml} editor={selector === "editor"} error={(reason)=>{setError(reason);if(reason !== ""){setSelector("raw")}}} exportChange={(change)=>props.handleYaml(change)}/>}

        </div>
        </>}
      </nav>
  )
}