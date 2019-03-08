import React, {useState, useEffect} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL';
import styles from './books.module.scss'

import Book from './Book'

const mapStateToProps = ({ logedIn, users, sessionToken }) => {
    return { logedIn, users, sessionToken }
}


const ConnectedBooks = (props) => {
    const isBrowser = typeof window !== 'undefined';
    if(isBrowser && !props.logedIn){
        navigate('/login')
        return <p>redirecting</p>
    }

    const [isLoading,setIsLoading] = useState(true)
    const [displayName,setDisplayName] = useState(props.users[0].displayName)
    const [tags,setTags] = useState([])
    const [needReload,setNeedReload] = useState(true)

    useEffect(()=>{
        if(needReload){
            //Self invoking async function
            (async () =>{
                try{
                    const query = `query($user:ID!){user(user:$user){ displayName tags{ _id name  bib yaml updatedAt articles{ _id title updatedAt versions(limit:1){ _id version revision autosave message } } } } }`
                    const user = {user:props.users[0]._id}
                    setIsLoading(true)
                    const data = await askGraphQL({query,variables:user},'fetching articles',props.sessionToken)
                    //Need to sort by updatedAt desc
                    setTags(data.user.tags)
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
            <h1>Books for {displayName}</h1>
            <p>Books are like super-tags, they are a collection of articles that you can ordonnate and export all at once</p>
            <p>Below are your tags eligible to be books:</p>
            <ul>
                {tags.map(t=><Book key={`book-${t._id}`} {...t}/>)}
            </ul>

        </section>
    )
}

const Books = connect(
    mapStateToProps
)(ConnectedBooks)
export default Books