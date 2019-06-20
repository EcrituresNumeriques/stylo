import React, {useState, useEffect} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL';

import Article from './Article'
import CreateArticle from './CreateArticle'

import styles from './Articles.module.scss'
import TagManagement from './TagManagement';

const mapStateToProps = ({ logedIn, activeUser, sessionToken }) => {
    return { logedIn, activeUser, sessionToken }
}


const ConnectedArticles = (props) => {
    const isBrowser = typeof window !== 'undefined';
    if(isBrowser && !props.logedIn){
        navigate('/login')
        return <p>redirecting</p>
    }

    const [isLoading,setIsLoading] = useState(false)
    const [articles,setArticles] = useState([])
    const [tags,setTags] = useState([])
    const [displayName,setDisplayName] = useState(props.activeUser.displayName)
    const [creatingArticle, setCreatingArticle] = useState(false)
    const [needReload,setNeedReload] = useState(true)
    const [tagManagement,setTagManagement] = useState(false)

    const filterByTagsSelected = (article) => {
        const listOfTagsSelected = tags.filter(t => t.selected)
        if(listOfTagsSelected.length === 0){ return true }
        let pass = true
        for(let i=0;i<listOfTagsSelected.length;i++){
            if(!article.tags.map(t => t._id).includes(listOfTagsSelected[i]._id)){pass = false}
        }
        return pass
    }

    const query = "query($user:ID!){user(user:$user){ displayName tags{ _id description color name } articles{ _id title updatedAt owners{ displayName } versions{ _id version revision autosave message } tags{ name color _id }}}}"
    const user = {user:props.activeUser._id}

    useEffect(()=>{
        if(needReload){
            //Self invoking async function
            (async () =>{
                try{
                    setIsLoading(true)
                    const data = await askGraphQL({query,variables:user},'fetching articles',props.sessionToken)
                    //Need to sort by updatedAt desc
                    setArticles(data.user.articles.reverse())
                    setTags(data.user.tags.map(t => ({...t,selected:false,color:t.color || "grey"})))
                    setDisplayName(data.user.displayName)
                    setIsLoading(false)
                    setNeedReload(false)
                }
                catch(err){
                    alert(err)
                }
            })()
        }
    },[needReload])

    return (
        <section className={styles.section}>
            <h1>Articles for {displayName}</h1>
            <p className={styles.button} onClick={()=>setCreatingArticle(!creatingArticle)}>{creatingArticle? 'Cancel new Article' : 'Create new Article'}</p>
            <p  className={styles.buttonsec} onClick={()=>setTagManagement(!tagManagement)}>Manage tags</p>
            <TagManagement tags={tags} close={()=>setTagManagement(false)} focus={tagManagement} articles={articles} setNeedReload={()=>setNeedReload(true)} setTags={setTags} updateTag=
            {updateTag}/>
            {!isLoading && <>                
                {creatingArticle  && <CreateArticle tags={tags} triggerReload={()=>{setCreatingArticle(false);setNeedReload(true)}}/>}
                {articles.filter(filterByTagsSelected).map((a)=>(
                    <Article key={`article-${a._id}`} masterTags={tags} {...a} setNeedReload={()=>setNeedReload(true)}/>
                ))}
            </>}
        </section>
    )
}

const Articles = connect(
    mapStateToProps
)(ConnectedArticles)
export default Articles