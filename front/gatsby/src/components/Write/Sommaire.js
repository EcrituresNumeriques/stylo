import React, {useState} from 'react'

import styles from './sommaire.module.scss'


export default (props) => {


  const [expand,setExpand] = useState(true)
  // eslint-disable-next-line
  const lines = props.md.split('\n').map((l,i)=>{return {line:i,payload:l}}).filter(l=>l.payload.match(/^##+\ /))

  //arrow backspace \u21B3
  // right arrow \u2192
  // nbsp \xa0
  // down arrow \u2223
  // right tack \u22A2
  // bottom left box drawing \u2514
  // left drawing \u2502
  //23B8

  return (

    <section id={styles.section}>
      <h1 className={expand?null:styles.closed} onClick={()=>setExpand(!expand)}>{expand?"-":"+"} Table of contents</h1>
      {expand && <>
        <ul>
          {lines.map((l)=><li key={`line-${l.line}-${l.payload}`} onClick={()=>props.setCodeMirrorCursor(l.line)}>{l.payload.replace(/##/,'').replace(/#\s/g,'\u21B3').replace(/#/g,'\u00B7\xa0')}</li>)}
        </ul>
      </>}
    </section>
  )
}
