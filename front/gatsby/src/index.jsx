import React, { lazy } from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, Route, Switch, useParams, } from 'react-router-dom'
import { Provider } from 'react-redux'
import 'whatwg-fetch'

import App from './layouts/App'
import createStore from './createReduxStore'
import { getUserProfile } from './helpers/userProfile'
import { getApplicationConfig } from './helpers/applicationConfig'

import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'
import NotFound from './components/404'
import Button from './components/Button'
import Field from './components/Field'
import { Check, Search } from 'react-feather'

// lazy loaded routes
const Books = lazy(() => import('./components/Books'))
const Articles = lazy(() => import('./components/Articles'))
const Credentials = lazy(() => import('./components/Credentials'))
const Write = lazy(() => import('./components/Write/Write'))

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
          <Route exact path="/ux">
            <App layout="fullPage">
              <h2>Buttons</h2>
              <h4>Primary</h4>
              <Button primary={true}>Create New Article</Button>
              <h4>Secondary</h4>
              <Button>Manage Tags</Button>
              <h4>With Icon</h4>
              <Button><Check/> Save</Button>
              <h2>Fields</h2>
              <h4>Search</h4>
              <Field placeholder="Search" icon={Search}/>
            </App>
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
