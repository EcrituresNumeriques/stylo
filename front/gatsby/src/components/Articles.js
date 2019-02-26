import React from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

const mapStateToProps = ({ logedIn, password, users }) => {
    return { logedIn, password, users }
}


const ConnectedArticles = (props) => {
    if(!props.logedIn){
        navigate('/login')
        return <p>redirecting</p>
    }
    return (
        <section>
            <h1>Articles for {props.users[0].displayName}</h1>
        </section>
    )
}

const Articles = connect(
    mapStateToProps
)(ConnectedArticles)
export default Articles