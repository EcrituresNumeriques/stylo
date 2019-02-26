import React, {useState} from 'react'
import {Link} from 'gatsby'

import styles from './Articles.module.scss'

export default (props) => {

    const [expanded,setExpanded] = useState(false)

    return (
    <article>
        <nav>
            <Link to={`/article/${props._id}`}>Export</Link>
            <Link to={`/article/${props._id}`} className={styles.primary}>Edit</Link>
        </nav>
        <h1 onClick={()=>setExpanded(!expanded)}><span>{expanded?'-':'+'}</span> {props.title} ({props.updatedAt})</h1>
        {expanded && <section>
            <h2>by {props.owners.map(o=>o.displayName).join(', ')}</h2>
            <ul>
                {props.versions.map(v=>(
                    <li key={`version-${v._id}`}>{`${v.message?v.message:'no label'} (${v.autosave?'autosaved':''} v${v.version}.${v.revision})`}</li>
                ))}
            </ul>
            <ul>
                {props.tags.map(t=>
                    <li key={`article-${props._id}-${t._id}`}>{t.name}</li>
                )}
            </ul>
        </section>}
    </article>
    )
}