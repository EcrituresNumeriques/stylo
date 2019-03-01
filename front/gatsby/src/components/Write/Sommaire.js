import React, {useState} from 'react'

import styles from '../write.module.scss'


export default (props) => {

  
  const [expand,setExpand] = useState(true)
  // eslint-disable-next-line
  console.log("props",props)

  const lines = props.md?props.md.split('\n').filter(l=>l.match(/^#+\ /)):[]

  return (
    
    <section>
      <h1 className={expand?null:styles.closed} onDoubleClick={()=>setExpand(!expand)}>Table of content</h1>
      {expand && <>
        <ul>
          {lines.map((l,i)=><li key={`line-${i}-${l}`}>{l}</li>)}
        </ul>
      </>}
    </section>
  )
}