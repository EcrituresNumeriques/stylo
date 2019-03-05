import React, {useState} from 'react'

import styles from '../write.module.scss'
import YamlEditor from './yamleditor/YamlEditor'

import etv from '../../helpers/eventTargetValue'

export default (props) => {

  const [expanded,setExpanded] = useState(false)
  const [selector, setSelector] = useState('basic')
 
  return (
    <nav className={`${expanded?styles.expandRight:styles.retractRight}`}>
        <nav onClick={()=>setExpanded(!expanded)} className={expanded?styles.close:styles.open}>{expanded?'close':'Metadata'}</nav>
        {expanded && <>
        <div>
          <header>
            <h1>Metadata</h1>
          </header>
          <nav>
            <p onClick={(e)=>setSelector('basic')}>Basic Mode [{selector==="basic"?'X':' '}]</p>
            <p onClick={(e)=>setSelector('editor')}>Editor Mode [{selector==="editor"?'X':' '}]</p>
            <p onClick={(e)=>setSelector('raw')}>Raw Mode [{selector==="raw"?'X':' '}]</p>
          </nav>
          {selector === "raw" && <textarea value={props.yaml} onChange={(e)=>props.handleYaml(etv(e))}/>}
          {selector !== "raw" && props.readOnly && <YamlEditor yaml={props.yaml} editor={selector === "editor"}/>}
          {selector !== "raw" && !props.readOnly && <YamlEditor yaml={props.yaml} exportChange={(change)=>props.handleYaml(change)} editor={selector === "editor"}/>}

        </div>
        </>}
      </nav>
  )
}