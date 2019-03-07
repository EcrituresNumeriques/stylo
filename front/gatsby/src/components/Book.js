import React, {useState} from 'react'
import {Link} from 'gatsby'

import styles from './books.module.scss'
import env from '../helpers/env'

import Modal from './Modal'
import Export from './Export'
import howLongAgo from '../helpers/howLongAgo'

export default (props) => {

    const [expanded,setExpanded] = useState(false)
    return (
    <article>

        
        <h1 onClick={()=>setExpanded(!expanded)}><span>{expanded?'-':'+'}</span> {props.name} ({howLongAgo(new Date() - new Date(props.updatedAt))})</h1>
        <p>{JSON.stringify(props)}</p>
        {expanded && <section>
          <ul>
            <p>Chapters:</p>
            {props.articles.map(a=><li>{a.title} ({a.versions[0].version}.{a.versions[0].revision} {a.versions[0].message})</li>)}
          </ul>
        </section>}
            
    </article>
    )
}