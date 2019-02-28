import React from 'react'

import { Router, Link, Location } from "@reach/router"

export default (props) => (
    <Location>
        {({location}) => (
            <Router location={location} className="router">
                <Article path="/article"/>
                <ArticleID path="/article/:id"/>
            </Router>
        )}
    </Location>
)

const Article = props => (
    <p>Hello article <Link to="/article/test">lien down</Link></p>
)

const ArticleID = props => (
    <p>Hello this article</p>
)