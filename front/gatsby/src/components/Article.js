import React, {useState} from 'react'
import {Link} from 'gatsby'

import styles from './Articles.module.scss'
import env from '../helpers/env'

import Modal from './Modal'
import Export from './Export'
import ArticleDelete from './ArticleDelete'
import ShareCenter from './ShareCenter'
import ArticleTags from './ArticleTags'
import howLongAgo from '../helpers/howLongAgo'

export default (props) => {

    const [expanded,setExpanded] = useState(false)
    const [exporting,setExporting] = useState(false)
    const [deleting,setDeleting] = useState(false)
    const [editTags, setEditTags] = useState(false)
    const [tags, setTags] = useState(props.tags)
    return (
    <article>
        {exporting && <Modal cancel={()=>setExporting(false)}>
            <Export {...props} article={true} versionId={props.versions[0]._id} version={props.versions[0].version}revision={props.versions[0].revision}/>
        </Modal>}
        <nav>
            <a href={`https://via.hypothes.is/${env.EXPORT_ENDPOINT}/htmlArticle/${props._id}?preview=true`} target="_blank" rel="noopener noreferrer">Preview</a>
            <p onClick={()=>setExporting(true)}>Export</p>
            <Link to={`/article/${props._id}`} className={styles.primary}>Edit</Link>
        </nav>
        <h1 onClick={()=>setExpanded(!expanded)}><span>{expanded?'-':'+'}</span> {props.title} ({howLongAgo(new Date() - new Date(props.updatedAt))})</h1>
        {expanded && <section>
            <ShareCenter {...props}/>
            <h2>by <span>{props.owners.map(o=>o.displayName).join(', ')}</span></h2>
            <ul>
                <p>Last versions:</p>
                {props.versions.map(v=>(
                    <li key={`version-${v._id}`}><Link to={`/article/${props._id}/version/${v._id}`}>{`${v.message?v.message:'no label'} (${v.autosave?'autosaved':''} v${v.version}.${v.revision})`}</Link></li>
                ))}
            </ul>
            {!deleting && <p className={styles.deleteMe} onClick={()=>setDeleting(true)}>Delete Article</p>}
            <ul>
                <p>Tags (<span onClick={()=>{if(editTags){props.setNeedReload()}setEditTags(!editTags);}}>{editTags?'finish':'edit'}</span>):</p>
                <ArticleTags editTags={editTags} {...props} stateTags={tags} setTags={(ts)=>setTags(ts)}/>
            </ul>
            {deleting && <div className={styles.alert}><p>You are trying to delete this article, double click on the "delete button" below to proceed</p><button className={styles.cancel} onClick={()=>setDeleting(false)}>Cancel</button><ArticleDelete {...props}/></div>}
        </section>}
    </article>
    )
}