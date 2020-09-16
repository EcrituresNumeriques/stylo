import React from 'react'
import { navigate } from 'gatsby'
import { Router, Location } from '@reach/router'
import Write from '../components/Write/Write'
import PrivateRoute from '../components/PrivateRoute'
import App from '../layouts/App'

export default () => (
  <Location>
    {({ location }) => (
      <Router location={location} className="router">
        <ArticleID path="/article/:id/version/:version" />
        <ArticleID path="/article/:id" />
        <ArticleID path="/article/:id/version/:version/compare/:compareTo" />
        <ArticleID path="/article/:id/compare/:compareTo" />
      </Router>
    )}
  </Location>
)

const ArticleID = (props) => {
  return (
    <App layout="fullPage">
      <PrivateRoute>
        <Write {...props} />
      </PrivateRoute>
    </App>
  )
}
