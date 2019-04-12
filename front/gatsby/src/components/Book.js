import React, {useState} from 'react'
import {Link} from 'gatsby'

import styles from './books.module.scss'
import env from '../helpers/env'
import etv from '../helpers/eventTargetValue'

import Modal from './Modal'
import Export from './Export'
import Chapter from './Chapter'
import howLongAgo from '../helpers/howLongAgo'

const alphaSort = (a, b) => {
  if(a.title < b.title) { return -1; }
  if(a.title > b.title) { return 1; }
  return 0;
}

export default (props) => {

    const [expanded,setExpanded] = useState(false)
    const [exporting,setExporting] = useState(false)
    const [tempName,setTempName] = useState(props.name)
    const [isRenaming,setIsRenaming] = useState(false)

    return (
    <article>
        {exporting && <Modal cancel={()=>setExporting(false)}>
            <Export {...props} book={true} bookId={props._id}/>
        </Modal>}
        <nav>
            <a href={`https://via.hypothes.is/${env.EXPORT_ENDPOINT}/htmlBook/${props._id}?preview=true`} target="_blank" rel="noopener noreferrer">Preview</a>
            <p onClick={()=>setExporting(true)}>Export</p>
            <Link to={`/book/${props._id}`} className={styles.primary}>Edit</Link>
        </nav>
        {!isRenaming && <h1><span onClick={()=>setExpanded(!expanded)}>{expanded?'-':'+'} {props.name} ({howLongAgo(new Date() - new Date(props.updatedAt))})</span> <span onClick={()=>setIsRenaming(true)}>[rename]</span></h1>}
        {isRenaming && <p><input value={tempName} onChange={(e)=>setTempName(etv(e))}/><button>Rename</button><button onClick={()=>{setIsRenaming(false);setTempName(props.name)}}>Cancel</button></p>}
        {expanded && <section>
          <ul>
            <p>Chapters:</p>
            {props.articles.sort(alphaSort).map(a=><Chapter key={`chapter-${props._id}-${a._id}`} {...a} setNeedReload={props.setNeedReload}/>)}
          </ul>
        </section>}
            
    </article>
    )
}