import React, {useState, useEffect} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL';

const mapStateToProps = ({ logedIn, users, sessionToken }) => {
    return { logedIn, users, sessionToken }
}


const ConnectedArticles = (props) => {
    if(!props.logedIn){
        navigate('/login')
        return <p>redirecting</p>
    }

    const [isLoading,setIsLoading] = useState(false)
    const [articles,setArticles] = useState([])
    const [tags,setTags] = useState([])

    const query = "query($user:ID!){user(user:$user){ displayName tags{ _id name } articles{ _id title owners{ displayName } versions{ _id version revision autosave } tags{ name _id }}}}"
    const user = {user:props.users[0]._id}

    useEffect(()=>{
        //Self invoking async function
        (async () =>{
            try{
                setIsLoading(true)
                const data = await askGraphQL({query,variables:user},'fetching articles',props.sessionToken)
                setArticles(data.user.articles)
                setTags(data.user.tags)
                setIsLoading(false)
            }
            catch(err){
                alert(err)
            }
        })()
    },[])

    return (
        <section>
        	{isLoading && <>
                <h1>Articles for {props.users[0].displayName}</h1>
                <p key="loading">Loading articles...</p>
            </>}
            {!isLoading && <>
                <p key="loaded">Loaded</p>
                {tags.map((t)=>(
                    <p key={`tag-${t._id}`}>{JSON.stringify(t)}</p>
                ))}
                {articles.map((a)=>(
                    <p key={`article-${a._id}`}>{JSON.stringify(a)}</p>
                ))}
            </>}
        </section>
    )
}

const Articles = connect(
    mapStateToProps
)(ConnectedArticles)
export default Articles