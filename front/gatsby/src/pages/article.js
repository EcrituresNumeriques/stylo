import React from 'react'
import { navigate } from 'gatsby'
import { Router, Location } from "@reach/router"
import FullPage from '../layouts/FullPage'
import Write from '../components/Write'

export default () => (
    <Location>
        {({location}) => (
            <Router location={location} className="router">
                <ArticleEmpty path="/article"/>
                <ArticleID path="/article/:id/version/:version"/>
                <ArticleID path="/article/:id"/>
            </Router>
        )}
    </Location>
)

const isBrowser = typeof window !== 'undefined';
const ArticleEmpty = () => {
    if(!isBrowser){
        return (<p>not compiling</p>)
    }
    navigate('/articles');
    return(
        <p>Bad request, redirecting</p>
    )
}

const ArticleID = props => {
    if(!isBrowser){
        return (<p>not compiling</p>)
    }
    return (<FullPage>
            <Write {...props}/>
    </FullPage>)
}