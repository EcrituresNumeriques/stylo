import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, Route, Switch, useParams, } from 'react-router-dom'
import { Provider } from 'react-redux'
import 'whatwg-fetch'

import App from './layouts/App'
import createStore from './createReduxStore'
import { getUserProfile } from './helpers/userProfile'
import { getApplicationConfig } from './helpers/applicationConfig'

import Books from './components/Books'
import Articles from './components/Articles'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'
import Credentials from './components/Credentials'
import Write from './components/Write/Write'

const store = createStore()

;(async () => {
  const applicationConfig = await getApplicationConfig().then((response) => {
    store.dispatch({ type: 'APPLICATION_CONFIG', applicationConfig: response })
    return response
  })
  getUserProfile(applicationConfig).then((response) =>
    store.dispatch({ type: 'PROFILE', ...response })
  )
})()

const ArticleID = (props) => {
  const { id, version, compareTo } = useParams()
  return (
    <App layout="fullPage">
      <PrivateRoute>
        <Write {...props} id={id} version={version} compareTo={compareTo} />
      </PrivateRoute>
    </App>
  )
}

render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/register">
            <App layout="centered">
              <Register />
            </App>
          </Route>
          <PrivateRoute>
            <Route path="/books">
              <App layout="fullPage">
                <Books />
              </App>
            </Route>
            <Route path="/articles">
              <App layout="fullPage">
                <Articles />
              </App>
            </Route>
            <Route path="/credentials">
              <App layout="wrapped">
                <Credentials />
              </App>
            </Route>
            <Route path={`/article/:id/version/:version`}>
              <ArticleID />
            </Route>
            <Route path={`/article/:id`}>
              <ArticleID />
            </Route>
            <Route path={`/article/:id/version/:version/compare/:compareTo`}>
              <ArticleID />
            </Route>
            <Route path={`/article/:id/compare/:compareTo`}>
              <ArticleID />
            </Route>
            <Route path="/">
              <App layout="fullPage">
                <Articles />
              </App>
            </Route>
          </PrivateRoute>
        </Switch>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
