import React from 'react'
import { navigate } from 'gatsby'
import { Router, Location } from "@reach/router"
import Write from '../components/Write/Write'
import App from '../layouts/App'

export default () => (
    <Location>
        {({location}) => (
            <Router location={location} className="router">
                <ArticleEmpty path="/article"/>
                <ArticleID path="/article/:id/version/:version"/>
                <ArticleID path="/article/:id"/>
                <ArticleID path="/article/:id/version/:version/compare/:compareTo"/>
                <ArticleID path="/article/:id/compare/:compareTo"/>
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

    return (<App layout="fullPage">
            <Write {...props}/>
    </App>)
}
