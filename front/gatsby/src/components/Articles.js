import React, {useState, useEffect} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL';

import Article from './Article'
import CreateTag from './CreateTag'
import CreateArticle from './CreateArticle'

import styles from './Articles.module.scss'


const mapStateToProps = ({ logedIn, users, sessionToken }) => {
    return { logedIn, users, sessionToken }
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
    const [displayName,setDisplayName] = useState(props.users[0].displayName)
    const [creatingTag, setCreatingTag] = useState(false)
    const [creatingArticle, setCreatingArticle] = useState(false)
    const [needReload,setNeedReload] = useState(true)

    const findAndUpdateTag = (tags,id)=> {
        const immutableTags = JSON.parse(JSON.stringify(tags))
        const tag = immutableTags.find(t => t._id === id)
        tag.selected = !tag.selected
        return immutableTags
    }

    const filterByTagsSelected = (article) => {
        const listOfTagsSelected = tags.filter(t => t.selected)
        if(listOfTagsSelected.length === 0){ return true }
        let pass = true
        for(let i=0;i<listOfTagsSelected.length;i++){
            if(!article.tags.map(t => t._id).includes(listOfTagsSelected[i]._id)){pass = false}
        }
        return pass
    }

    const query = "query($user:ID!){user(user:$user){ displayName tags{ _id name } articles{ _id title updatedAt owners{ displayName } versions{ _id version revision autosave } tags{ name _id }}}}"
    const user = {user:props.users[0]._id}

    useEffect(()=>{
        if(needReload){
            //Self invoking async function
            (async () =>{
                try{
                    setIsLoading(true)
                    const data = await askGraphQL({query,variables:user},'fetching articles',props.sessionToken)
                    //Need to sort by updatedAt desc
                    setArticles(data.user.articles.reverse())
                    setTags(data.user.tags.map(t => ({...t,selected:false})))
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
        	{isLoading && <>
                <p key="loading">Loading articles...</p>
            </>}
            {!isLoading && <>
                <p key="loaded">Up to date</p>
                
                {creatingTag &&  <CreateTag articles={articles} triggerReload={()=>{setCreatingTag(false);setNeedReload(true)}}/>}
                {creatingArticle  && <CreateArticle tags={tags} triggerReload={()=>{setCreatingArticle(false);setNeedReload(true)}}/>}
                <p className={styles.button} onClick={()=>setCreatingTag(!creatingTag)}>{creatingTag? 'Cancel new Tag' : 'Create new Tag'}</p>
                {tags.map((t)=>(
                    <p className={t.selected?styles.selectedTags:styles.tags} key={`tag-${t._id}`} onClick={()=>setTags(findAndUpdateTag(tags,t._id))}>{t.name}</p>
                ))}
                {articles.filter(filterByTagsSelected).map((a)=>(
                    <Article key={`article-${a._id}`} {...a} />
                ))}
            </>}
        </section>
    )
}

const Articles = connect(
    mapStateToProps
)(ConnectedArticles)
export default Articles