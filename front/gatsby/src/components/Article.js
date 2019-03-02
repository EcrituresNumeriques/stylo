import React, {useState} from 'react'
import {Link} from 'gatsby'

import styles from './Articles.module.scss'

import howLongAgo from '../helpers/howLongAgo'

export default (props) => {

    const [expanded,setExpanded] = useState(false)

    return (
    <article>
        <nav>
            <Link to={`/article/${props._id}`}>Export</Link>
            <Link to={`/article/${props._id}`} className={styles.primary}>Edit</Link>
        </nav>
        <h1 onClick={()=>setExpanded(!expanded)}><span>{expanded?'-':'+'}</span> {props.title} ({howLongAgo(new Date() - new Date(props.updatedAt))})</h1>
        {expanded && <section>
            <h2>by <span>{props.owners.map(o=>o.displayName).join(', ')}</span></h2>
            <ul>
                <p>Last versions:</p>
                {props.versions.map(v=>(
                    <li key={`version-${v._id}`}><Link to={`/article/${props._id}/version/${v._id}`}>{`${v.message?v.message:'no label'} (${v.autosave?'autosaved':''} v${v.version}.${v.revision})`}</Link></li>
                ))}
            </ul>
            <ul>
                <p>Tags:</p>
                {props.tags.map(t=>
                    <li key={`article-${props._id}-${t._id}`}>{t.name}</li>
                )}
            </ul>
        </section>}
    </article>
    )
}