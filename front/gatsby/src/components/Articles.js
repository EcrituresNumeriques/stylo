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

    const query = "query($user:ID!){user(user:$user){ displayName articles{ _id title owners{ displayName } versions{ _id version revision autosave } tags{ name _id }}}}"
    const user = {user:props.users[0]._id}

    useEffect(()=>{
        //Self invoking async function
        (async () =>{
            try{
                setIsLoading(true)
                const data = await askGraphQL({query,variables:user},'fetching articles',props.sessionToken)
                setArticles(data.user.articles)
            }
            catch(err){
                alert(err)
            }
        })()
    },[])

    return (
        <section>
            <h1>Articles for {props.users[0].displayName}</h1>
        	{isLoading && <p>Loading articles...</p>}
            {!isLoading && <p>Loaded</p>}
            {articles.map((a)=>(
                <p>{JSON.stringify(a)}</p>
            ))}
        </section>
    )
}

const Articles = connect(
    mapStateToProps
)(ConnectedArticles)
export default Articles