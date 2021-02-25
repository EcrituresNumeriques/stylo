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
import NotFound from './components/404'

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
      <Write {...props} id={id} version={version} compareTo={compareTo} />
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
          <Route path="/books">
            <PrivateRoute>
              <App layout="fullPage">
                <Books />
              </App>
            </PrivateRoute>
          </Route>
          <Route path="/articles">
            <PrivateRoute>
              <App layout="fullPage">
                <Articles />
              </App>
            </PrivateRoute>
          </Route>
          <Route path="/credentials">
            <PrivateRoute>
              <App layout="wrapped">
                <Credentials />
              </App>
            </PrivateRoute>
          </Route>
          <Route path={`/article/:id/version/:version/compare/:compareTo`}>
            <PrivateRoute>
              <ArticleID />
            </PrivateRoute>
          </Route>
          <Route path={`/article/:id/version/:version`}>
            <PrivateRoute>
              <ArticleID />
            </PrivateRoute>
          </Route>
          <Route path={`/article/:id/compare/:compareTo`}>
            <PrivateRoute>
              <ArticleID />
            </PrivateRoute>
          </Route>
          <Route path={`/article/:id`}>
            <PrivateRoute>
              <ArticleID />
            </PrivateRoute>
          </Route>
          <Route exact path="/">
            <PrivateRoute>
              <App layout="fullPage">
                <Articles />
              </App>
            </PrivateRoute>
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
