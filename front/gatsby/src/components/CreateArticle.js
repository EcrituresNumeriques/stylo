import React, {useState} from 'react'
import { connect } from "react-redux"

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL';

import styles from './Articles.module.scss'

const mapStateToProps = ({ users, sessionToken }) => {
    return { users, sessionToken }
}

const ConnectedCreateArticle = (props) => {
    const [title,setTitle] = useState("")
    const [tagsSelected, setTagsSelected] = useState(props.tags.map(t => ({selected:false,name:t.name,_id:t._id}) ))

    const findAndUpdateTag = (tags,id)=> {
        const immutableTags = JSON.parse(JSON.stringify(tags))
        const tag = immutableTags.find(t => t._id === id)
        tag.selected = !tag.selected
        return immutableTags
    }
   
    let baseQuery = 'mutation($title:String!, $user:ID!){ createArticle(title:$title,user:$user){ _id title } '
    let addToTag = tagsSelected.filter(t=>t.selected).map((t,i) => `addToTag${i}: addToTag(article:"new",tag:"${t._id}",user:$user){ _id }`).join(' ')
    const query = baseQuery + addToTag + '}'
    const variables = {user:props.users[0]._id, title}

    const createTag = async (event, cb,query, variables, token) => {
        try{
            event.preventDefault();
            await askGraphQL({query,variables},'creating new Article',token)
            cb()
        }
        catch(err){
            alert(err)
        }
    }

    return (
        <section className={styles.create}>
           <form onSubmit={(event)=>{createTag(event, props.triggerReload, query, variables, props.sessionToken)}}>
                <input type="text" placeholder="Article title" value={title} onChange={(e)=>setTitle(etv(e))}/>
                <ul>
                    <li>Add tags =></li>
                {tagsSelected.map(t=>(
                        <li key={`selectTag-${t._id}`} className={t.selected?styles.selected:styles.unselected} onClick={()=>setTagsSelected(findAndUpdateTag(tagsSelected,t._id))}>{t.name}</li>
                    ))}
                </ul>
                <input type="submit" value="Create Article"/>
            </form>
        </section>
    )
}

const CreateArticle = connect(
    mapStateToProps
)(ConnectedCreateArticle)
export default CreateArticle