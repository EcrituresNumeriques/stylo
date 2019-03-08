import React, {useState} from 'react'
import {Link} from 'gatsby'

import styles from './books.module.scss'
import env from '../helpers/env'

import Modal from './Modal'
import Export from './Export'
import howLongAgo from '../helpers/howLongAgo'

const alphaSort = (a, b) => {
  if(a.title < b.title) { return -1; }
  if(a.title > b.title) { return 1; }
  return 0;
}

export default (props) => {

    const [expanded,setExpanded] = useState(false)
    const [exporting,setExporting] = useState(false)

    return (
    <article>

        <nav>
            <a href={`${env.EXPORT_ENDPOINT}/htmlBook/${props._id}?preview=true`} target="_blank" rel="noopener noreferrer">Preview</a>
            <p onClick={()=>setExporting(true)}>Export</p>
            <Link to={`/book/${props._id}`} className={styles.primary}>Edit</Link>
        </nav>
        <h1 onClick={()=>setExpanded(!expanded)}><span>{expanded?'-':'+'}</span> {props.name} ({howLongAgo(new Date() - new Date(props.updatedAt))})</h1>
        {expanded && <section>
          <ul>
            <p>Chapters:</p>
            {props.articles.sort(alphaSort).map(a=><li key={`chapter-${props._id}-${a._id}`}>{a.title} ({a.versions[0].version}.{a.versions[0].revision} {a.versions[0].message})</li>)}
          </ul>
        </section>}
            
    </article>
    )
}