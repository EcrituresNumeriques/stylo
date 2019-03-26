import React, {useState} from 'react'
import {Link} from 'gatsby'
import { connect } from "react-redux"

import styles from './Articles.module.scss'
import env from '../helpers/env'

import Modal from './Modal'
import Export from './Export'
import ArticleDelete from './ArticleDelete'
import ShareCenter from './ShareCenter'
import ArticleTags from './ArticleTags'
import howLongAgo from '../helpers/howLongAgo'

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL';

const mapStateToProps = ({ logedIn, users, sessionToken }) => {
    return { logedIn, users, sessionToken }
}

const ConnectedArticle = (props) => {

    const [expanded,setExpanded] = useState(false)
    const [exporting,setExporting] = useState(false)
    const [deleting,setDeleting] = useState(false)
    const [editTags, setEditTags] = useState(false)
    const [tags, setTags] = useState(props.tags)
    const [renaming,setRenaming] = useState(false)
    const [title,setTitle] = useState(props.title)
    const [tempTitle,setTempTitle] = useState(props.title)

    const rename = async (e) => {
        e.preventDefault();
        const query = `mutation($article:ID!,$title:String!,$user:ID!){renameArticle(article:$article,title:$title,user:$user){title}}`
        const variables = {user:props.users[0]._id,article:props._id,title:tempTitle}
        await askGraphQL({query,variables},'Renaming Article',props.sessionToken)
        setTitle(tempTitle)
        setRenaming(false)
    }


    return (
    <article>
        {exporting && <Modal cancel={()=>setExporting(false)}>
            <Export {...props} article={true} versionId={props.versions[0]._id} version={props.versions[0].version}revision={props.versions[0].revision}/>
        </Modal>}
        <nav>
            <a href={`https://via.hypothes.is/${env.EXPORT_ENDPOINT}/api/v1/htmlArticle/${props._id}?preview=true`} target="_blank" rel="noopener noreferrer">Preview</a>
            <p onClick={()=>setExporting(true)}>Export</p>
            <Link to={`/article/${props._id}`} className={styles.primary}>Edit</Link>
        </nav>
        {!renaming && <h1><span onClick={()=>setExpanded(!expanded)}>{expanded?'-':'+'}</span><span onClick={()=>setExpanded(!expanded)}> {title} ({howLongAgo(new Date() - new Date(props.updatedAt))})</span><span onClick={()=>setRenaming(true)}>(rename)</span></h1>}
        {renaming && <form onSubmit={e=>rename(e)}>
            <input value={tempTitle} onChange={(e)=>setTempTitle(etv(e))} /><input type="submit" value="Rename"/><span onClick={()=>setRenaming(false)}>(cancel)</span>

        </form>}
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

const Article = connect(
    mapStateToProps
)(ConnectedArticle)

export default Article